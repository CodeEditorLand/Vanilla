var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { getActiveWindow } from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { distinct } from "../../../../base/common/arrays.js";
import {
  Queue,
  RunOnceScheduler,
  raceTimeout
} from "../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { canceled } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { normalizeDriveLetter } from "../../../../base/common/labels.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore,
  MutableDisposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { mixin } from "../../../../base/common/objects.js";
import * as platform from "../../../../base/common/platform.js";
import * as resources from "../../../../base/common/resources.js";
import Severity from "../../../../base/common/severity.js";
import { isDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  ICustomEndpointTelemetryService,
  ITelemetryService,
  TelemetryLevel
} from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IWorkspaceContextService
} from "../../../../platform/workspace/common/workspace.js";
import { ViewContainerLocation } from "../../../common/views.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { ITestResultService } from "../../testing/common/testResultService.js";
import { ITestService } from "../../testing/common/testService.js";
import {
  IDebugService,
  State,
  VIEWLET_ID,
  isFrameDeemphasized
} from "../common/debug.js";
import {
  ExpressionContainer,
  MemoryRegion,
  Thread
} from "../common/debugModel.js";
import { Source } from "../common/debugSource.js";
import { filterExceptionsFromTelemetry } from "../common/debugUtils.js";
import { ReplModel } from "../common/replModel.js";
import { RawDebugSession } from "./rawDebugSession.js";
const TRIGGERED_BREAKPOINT_MAX_DELAY = 1500;
let DebugSession = class {
  constructor(id, _configuration, root, model, options, debugService, telemetryService, hostService, configurationService, paneCompositeService, workspaceContextService, productService, notificationService, lifecycleService, uriIdentityService, instantiationService, customEndpointTelemetryService, workbenchEnvironmentService, logService, testService, testResultService, accessibilityService) {
    this.id = id;
    this._configuration = _configuration;
    this.root = root;
    this.model = model;
    this.debugService = debugService;
    this.telemetryService = telemetryService;
    this.hostService = hostService;
    this.configurationService = configurationService;
    this.paneCompositeService = paneCompositeService;
    this.workspaceContextService = workspaceContextService;
    this.productService = productService;
    this.notificationService = notificationService;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
    this.customEndpointTelemetryService = customEndpointTelemetryService;
    this.workbenchEnvironmentService = workbenchEnvironmentService;
    this.logService = logService;
    this.testService = testService;
    this.accessibilityService = accessibilityService;
    this._options = options || {};
    this.parentSession = this._options.parentSession;
    if (this.hasSeparateRepl()) {
      this.repl = new ReplModel(this.configurationService);
    } else {
      this.repl = this.parentSession.repl;
    }
    const toDispose = this.globalDisposables;
    const replListener = toDispose.add(new MutableDisposable());
    replListener.value = this.repl.onDidChangeElements((e) => this._onDidChangeREPLElements.fire(e));
    if (lifecycleService) {
      toDispose.add(lifecycleService.onWillShutdown(() => {
        this.shutdown();
        dispose(toDispose);
      }));
    }
    this.correlatedTestRun = options?.testRun ? testResultService.getResult(options.testRun.runId) : this.parentSession?.correlatedTestRun;
    if (this.correlatedTestRun) {
      toDispose.add(this.correlatedTestRun.onComplete(() => this.terminate()));
    }
    const compoundRoot = this._options.compoundRoot;
    if (compoundRoot) {
      toDispose.add(compoundRoot.onDidSessionStop(() => this.terminate()));
    }
    this.passFocusScheduler = new RunOnceScheduler(() => {
      if (this.debugService.getModel().getSessions().some((s) => s.state === State.Stopped) || this.getAllThreads().some((t) => t.stopped)) {
        if (typeof this.lastContinuedThreadId === "number") {
          const thread = this.debugService.getViewModel().focusedThread;
          if (thread && thread.threadId === this.lastContinuedThreadId && !thread.stopped) {
            const toFocusThreadId = this.getStoppedDetails()?.threadId;
            const toFocusThread = typeof toFocusThreadId === "number" ? this.getThread(toFocusThreadId) : void 0;
            this.debugService.focusStackFrame(void 0, toFocusThread);
          }
        } else {
          const session = this.debugService.getViewModel().focusedSession;
          if (session && session.getId() === this.getId() && session.state !== State.Stopped) {
            this.debugService.focusStackFrame(void 0);
          }
        }
      }
    }, 800);
    const parent = this._options.parentSession;
    if (parent) {
      toDispose.add(parent.onDidEndAdapter(() => {
        if (!this.hasSeparateRepl() && this.raw?.isInShutdown === false) {
          this.repl = this.repl.clone();
          replListener.value = this.repl.onDidChangeElements((e) => this._onDidChangeREPLElements.fire(e));
          this.parentSession = void 0;
        }
      }));
    }
  }
  parentSession;
  _subId;
  raw;
  // used in tests
  initialized = false;
  _options;
  sources = /* @__PURE__ */ new Map();
  threads = /* @__PURE__ */ new Map();
  threadIds = [];
  cancellationMap = /* @__PURE__ */ new Map();
  rawListeners = new DisposableStore();
  globalDisposables = new DisposableStore();
  fetchThreadsScheduler;
  passFocusScheduler;
  lastContinuedThreadId;
  repl;
  stoppedDetails = [];
  statusQueue = this.rawListeners.add(
    new ThreadStatusScheduler()
  );
  /** Test run this debug session was spawned by */
  correlatedTestRun;
  /** Whether we terminated the correlated run yet. Used so a 2nd terminate request goes through to the underlying session. */
  didTerminateTestRun;
  _onDidChangeState = new Emitter();
  _onDidEndAdapter = new Emitter();
  _onDidLoadedSource = new Emitter();
  _onDidCustomEvent = new Emitter();
  _onDidProgressStart = new Emitter();
  _onDidProgressUpdate = new Emitter();
  _onDidProgressEnd = new Emitter();
  _onDidInvalidMemory = new Emitter();
  _onDidChangeREPLElements = new Emitter();
  _name;
  _onDidChangeName = new Emitter();
  /**
   * Promise set while enabling dependent breakpoints to block the debugger
   * from continuing from a stopped state.
   */
  _waitToResume;
  getId() {
    return this.id;
  }
  setSubId(subId) {
    this._subId = subId;
  }
  getMemory(memoryReference) {
    return new MemoryRegion(memoryReference, this);
  }
  get subId() {
    return this._subId;
  }
  get configuration() {
    return this._configuration.resolved;
  }
  get unresolvedConfiguration() {
    return this._configuration.unresolved;
  }
  get lifecycleManagedByParent() {
    return !!this._options.lifecycleManagedByParent;
  }
  get compact() {
    return !!this._options.compact;
  }
  get saveBeforeRestart() {
    return this._options.saveBeforeRestart ?? !this._options?.parentSession;
  }
  get compoundRoot() {
    return this._options.compoundRoot;
  }
  get suppressDebugStatusbar() {
    return this._options.suppressDebugStatusbar ?? false;
  }
  get suppressDebugToolbar() {
    return this._options.suppressDebugToolbar ?? false;
  }
  get suppressDebugView() {
    return this._options.suppressDebugView ?? false;
  }
  get autoExpandLazyVariables() {
    const screenReaderOptimized = this.accessibilityService.isScreenReaderOptimized();
    const value = this.configurationService.getValue(
      "debug"
    ).autoExpandLazyVariables;
    return value === "auto" && screenReaderOptimized || value === "on";
  }
  setConfiguration(configuration) {
    this._configuration = configuration;
  }
  getLabel() {
    const includeRoot = this.workspaceContextService.getWorkspace().folders.length > 1;
    return includeRoot && this.root ? `${this.name} (${resources.basenameOrAuthority(this.root.uri)})` : this.name;
  }
  setName(name) {
    this._name = name;
    this._onDidChangeName.fire(name);
  }
  get name() {
    return this._name || this.configuration.name;
  }
  get state() {
    if (!this.initialized) {
      return State.Initializing;
    }
    if (!this.raw) {
      return State.Inactive;
    }
    const focusedThread = this.debugService.getViewModel().focusedThread;
    if (focusedThread && focusedThread.session === this) {
      return focusedThread.stopped ? State.Stopped : State.Running;
    }
    if (this.getAllThreads().some((t) => t.stopped)) {
      return State.Stopped;
    }
    return State.Running;
  }
  get capabilities() {
    return this.raw ? this.raw.capabilities : /* @__PURE__ */ Object.create(null);
  }
  //---- events
  get onDidChangeState() {
    return this._onDidChangeState.event;
  }
  get onDidEndAdapter() {
    return this._onDidEndAdapter.event;
  }
  get onDidChangeReplElements() {
    return this._onDidChangeREPLElements.event;
  }
  get onDidChangeName() {
    return this._onDidChangeName.event;
  }
  //---- DAP events
  get onDidCustomEvent() {
    return this._onDidCustomEvent.event;
  }
  get onDidLoadedSource() {
    return this._onDidLoadedSource.event;
  }
  get onDidProgressStart() {
    return this._onDidProgressStart.event;
  }
  get onDidProgressUpdate() {
    return this._onDidProgressUpdate.event;
  }
  get onDidProgressEnd() {
    return this._onDidProgressEnd.event;
  }
  get onDidInvalidateMemory() {
    return this._onDidInvalidMemory.event;
  }
  //---- DAP requests
  /**
   * create and initialize a new debug adapter for this session
   */
  async initialize(dbgr) {
    if (this.raw) {
      await this.shutdown();
    }
    try {
      const debugAdapter = await dbgr.createDebugAdapter(this);
      this.raw = this.instantiationService.createInstance(
        RawDebugSession,
        debugAdapter,
        dbgr,
        this.id,
        this.configuration.name
      );
      await this.raw.start();
      this.registerListeners();
      await this.raw.initialize({
        clientID: "vscode",
        clientName: this.productService.nameLong,
        adapterID: this.configuration.type,
        pathFormat: "path",
        linesStartAt1: true,
        columnsStartAt1: true,
        supportsVariableType: true,
        // #8858
        supportsVariablePaging: true,
        // #9537
        supportsRunInTerminalRequest: true,
        // #10574
        locale: platform.language,
        // #169114
        supportsProgressReporting: true,
        // #92253
        supportsInvalidatedEvent: true,
        // #106745
        supportsMemoryReferences: true,
        //#129684
        supportsArgsCanBeInterpretedByShell: true,
        // #149910
        supportsMemoryEvent: true,
        // #133643
        supportsStartDebuggingRequest: true
      });
      this.initialized = true;
      this._onDidChangeState.fire();
      this.debugService.setExceptionBreakpointsForSession(
        this,
        this.raw && this.raw.capabilities.exceptionBreakpointFilters || []
      );
      this.debugService.getModel().registerBreakpointModes(
        this.configuration.type,
        this.raw.capabilities.breakpointModes || []
      );
    } catch (err) {
      this.initialized = true;
      this._onDidChangeState.fire();
      await this.shutdown();
      throw err;
    }
  }
  /**
   * launch or attach to the debuggee
   */
  async launchOrAttach(config) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "launch or attach"
        )
      );
    }
    if (this.parentSession && this.parentSession.state === State.Inactive) {
      throw canceled();
    }
    config.__sessionId = this.getId();
    try {
      await this.raw.launchOrAttach(config);
    } catch (err) {
      this.shutdown();
      throw err;
    }
  }
  /**
   * terminate the current debug adapter session
   */
  async terminate(restart = false) {
    if (!this.raw) {
      this.onDidExitAdapter();
    }
    this.cancelAllRequests();
    if (this._options.lifecycleManagedByParent && this.parentSession) {
      await this.parentSession.terminate(restart);
    } else if (this.correlatedTestRun && !this.correlatedTestRun.completedAt && !this.didTerminateTestRun) {
      this.didTerminateTestRun = true;
      this.testService.cancelTestRun(this.correlatedTestRun.id);
    } else if (this.raw) {
      if (this.raw.capabilities.supportsTerminateRequest && this._configuration.resolved.request === "launch") {
        await this.raw.terminate(restart);
      } else {
        await this.raw.disconnect({ restart, terminateDebuggee: true });
      }
    }
    if (!restart) {
      this._options.compoundRoot?.sessionStopped();
    }
  }
  /**
   * end the current debug adapter session
   */
  async disconnect(restart = false, suspend = false) {
    if (!this.raw) {
      this.onDidExitAdapter();
    }
    this.cancelAllRequests();
    if (this._options.lifecycleManagedByParent && this.parentSession) {
      await this.parentSession.disconnect(restart, suspend);
    } else if (this.raw) {
      await this.raw.disconnect({
        restart,
        terminateDebuggee: false,
        suspendDebuggee: suspend
      });
    }
    if (!restart) {
      this._options.compoundRoot?.sessionStopped();
    }
  }
  /**
   * restart debug adapter session
   */
  async restart() {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "restart"
        )
      );
    }
    this.cancelAllRequests();
    if (this._options.lifecycleManagedByParent && this.parentSession) {
      await this.parentSession.restart();
    } else {
      await this.raw.restart({ arguments: this.configuration });
    }
  }
  async sendBreakpoints(modelUri, breakpointsToSend, sourceModified) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "breakpoints"
        )
      );
    }
    if (!this.raw.readyForBreakpoints) {
      return Promise.resolve(void 0);
    }
    const rawSource = this.getRawSource(modelUri);
    if (breakpointsToSend.length && !rawSource.adapterData) {
      rawSource.adapterData = breakpointsToSend[0].adapterData;
    }
    if (rawSource.path) {
      rawSource.path = normalizeDriveLetter(rawSource.path);
    }
    const response = await this.raw.setBreakpoints({
      source: rawSource,
      lines: breakpointsToSend.map(
        (bp) => bp.sessionAgnosticData.lineNumber
      ),
      breakpoints: breakpointsToSend.map((bp) => bp.toDAP()),
      sourceModified
    });
    if (response?.body) {
      const data = /* @__PURE__ */ new Map();
      for (let i = 0; i < breakpointsToSend.length; i++) {
        data.set(
          breakpointsToSend[i].getId(),
          response.body.breakpoints[i]
        );
      }
      this.model.setBreakpointSessionData(
        this.getId(),
        this.capabilities,
        data
      );
    }
  }
  async sendFunctionBreakpoints(fbpts) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "function breakpoints"
        )
      );
    }
    if (this.raw.readyForBreakpoints) {
      const response = await this.raw.setFunctionBreakpoints({
        breakpoints: fbpts.map((bp) => bp.toDAP())
      });
      if (response?.body) {
        const data = /* @__PURE__ */ new Map();
        for (let i = 0; i < fbpts.length; i++) {
          data.set(fbpts[i].getId(), response.body.breakpoints[i]);
        }
        this.model.setBreakpointSessionData(
          this.getId(),
          this.capabilities,
          data
        );
      }
    }
  }
  async sendExceptionBreakpoints(exbpts) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "exception breakpoints"
        )
      );
    }
    if (this.raw.readyForBreakpoints) {
      const args = this.capabilities.supportsExceptionFilterOptions ? {
        filters: [],
        filterOptions: exbpts.map((exb) => {
          if (exb.condition) {
            return {
              filterId: exb.filter,
              condition: exb.condition
            };
          }
          return { filterId: exb.filter };
        })
      } : { filters: exbpts.map((exb) => exb.filter) };
      const response = await this.raw.setExceptionBreakpoints(args);
      if (response?.body && response.body.breakpoints) {
        const data = /* @__PURE__ */ new Map();
        for (let i = 0; i < exbpts.length; i++) {
          data.set(exbpts[i].getId(), response.body.breakpoints[i]);
        }
        this.model.setBreakpointSessionData(
          this.getId(),
          this.capabilities,
          data
        );
      }
    }
  }
  dataBytesBreakpointInfo(address, bytes) {
    if (this.raw?.capabilities.supportsDataBreakpointBytes === false) {
      throw new Error(
        localize(
          "sessionDoesNotSupporBytesBreakpoints",
          "Session does not support breakpoints with bytes"
        )
      );
    }
    return this._dataBreakpointInfo({
      name: address,
      bytes,
      asAddress: true
    });
  }
  dataBreakpointInfo(name, variablesReference) {
    return this._dataBreakpointInfo({ name, variablesReference });
  }
  async _dataBreakpointInfo(args) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "data breakpoints info"
        )
      );
    }
    if (!this.raw.readyForBreakpoints) {
      throw new Error(
        localize(
          "sessionNotReadyForBreakpoints",
          "Session is not ready for breakpoints"
        )
      );
    }
    const response = await this.raw.dataBreakpointInfo(args);
    return response?.body;
  }
  async sendDataBreakpoints(dataBreakpoints) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "data breakpoints"
        )
      );
    }
    if (this.raw.readyForBreakpoints) {
      const converted = await Promise.all(
        dataBreakpoints.map(async (bp) => {
          try {
            const dap = await bp.toDAP(this);
            return { dap, bp };
          } catch (e) {
            return { bp, message: e.message };
          }
        })
      );
      const response = await this.raw.setDataBreakpoints({
        breakpoints: converted.map((d) => d.dap).filter(isDefined)
      });
      if (response?.body) {
        const data = /* @__PURE__ */ new Map();
        let i = 0;
        for (const dap of converted) {
          if (!dap.dap) {
            data.set(dap.bp.getId(), dap.message);
          } else if (i < response.body.breakpoints.length) {
            data.set(
              dap.bp.getId(),
              response.body.breakpoints[i++]
            );
          }
        }
        this.model.setBreakpointSessionData(
          this.getId(),
          this.capabilities,
          data
        );
      }
    }
  }
  async sendInstructionBreakpoints(instructionBreakpoints) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "instruction breakpoints"
        )
      );
    }
    if (this.raw.readyForBreakpoints) {
      const response = await this.raw.setInstructionBreakpoints({
        breakpoints: instructionBreakpoints.map((ib) => ib.toDAP())
      });
      if (response?.body) {
        const data = /* @__PURE__ */ new Map();
        for (let i = 0; i < instructionBreakpoints.length; i++) {
          data.set(
            instructionBreakpoints[i].getId(),
            response.body.breakpoints[i]
          );
        }
        this.model.setBreakpointSessionData(
          this.getId(),
          this.capabilities,
          data
        );
      }
    }
  }
  async breakpointsLocations(uri, lineNumber) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "breakpoints locations"
        )
      );
    }
    const source = this.getRawSource(uri);
    const response = await this.raw.breakpointLocations({
      source,
      line: lineNumber
    });
    if (!response || !response.body || !response.body.breakpoints) {
      return [];
    }
    const positions = response.body.breakpoints.map((bp) => ({
      lineNumber: bp.line,
      column: bp.column || 1
    }));
    return distinct(positions, (p) => `${p.lineNumber}:${p.column}`);
  }
  getDebugProtocolBreakpoint(breakpointId) {
    return this.model.getDebugProtocolBreakpoint(
      breakpointId,
      this.getId()
    );
  }
  customRequest(request, args) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          request
        )
      );
    }
    return this.raw.custom(request, args);
  }
  stackTrace(threadId, startFrame, levels, token) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "stackTrace"
        )
      );
    }
    const sessionToken = this.getNewCancellationToken(threadId, token);
    return this.raw.stackTrace(
      { threadId, startFrame, levels },
      sessionToken
    );
  }
  async exceptionInfo(threadId) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "exceptionInfo"
        )
      );
    }
    const response = await this.raw.exceptionInfo({ threadId });
    if (response) {
      return {
        id: response.body.exceptionId,
        description: response.body.description,
        breakMode: response.body.breakMode,
        details: response.body.details
      };
    }
    return void 0;
  }
  scopes(frameId, threadId) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "scopes"
        )
      );
    }
    const token = this.getNewCancellationToken(threadId);
    return this.raw.scopes({ frameId }, token);
  }
  variables(variablesReference, threadId, filter, start, count) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "variables"
        )
      );
    }
    const token = threadId ? this.getNewCancellationToken(threadId) : void 0;
    return this.raw.variables(
      { variablesReference, filter, start, count },
      token
    );
  }
  evaluate(expression, frameId, context, location) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "evaluate"
        )
      );
    }
    return this.raw.evaluate({
      expression,
      frameId,
      context,
      line: location?.line,
      column: location?.column,
      source: location?.source
    });
  }
  async restartFrame(frameId, threadId) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "restartFrame"
        )
      );
    }
    await this.raw.restartFrame({ frameId }, threadId);
  }
  setLastSteppingGranularity(threadId, granularity) {
    const thread = this.getThread(threadId);
    if (thread) {
      thread.lastSteppingGranularity = granularity;
    }
  }
  async next(threadId, granularity) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "next"
        )
      );
    }
    this.setLastSteppingGranularity(threadId, granularity);
    await this.raw.next({ threadId, granularity });
  }
  async stepIn(threadId, targetId, granularity) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "stepIn"
        )
      );
    }
    this.setLastSteppingGranularity(threadId, granularity);
    await this.raw.stepIn({ threadId, targetId, granularity });
  }
  async stepOut(threadId, granularity) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "stepOut"
        )
      );
    }
    this.setLastSteppingGranularity(threadId, granularity);
    await this.raw.stepOut({ threadId, granularity });
  }
  async stepBack(threadId, granularity) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "stepBack"
        )
      );
    }
    this.setLastSteppingGranularity(threadId, granularity);
    await this.raw.stepBack({ threadId, granularity });
  }
  async continue(threadId) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "continue"
        )
      );
    }
    await this.raw.continue({ threadId });
  }
  async reverseContinue(threadId) {
    await this.waitForTriggeredBreakpoints();
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "reverse continue"
        )
      );
    }
    await this.raw.reverseContinue({ threadId });
  }
  async pause(threadId) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "pause"
        )
      );
    }
    await this.raw.pause({ threadId });
  }
  async terminateThreads(threadIds) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "terminateThreads"
        )
      );
    }
    await this.raw.terminateThreads({ threadIds });
  }
  setVariable(variablesReference, name, value) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "setVariable"
        )
      );
    }
    return this.raw.setVariable({ variablesReference, name, value });
  }
  setExpression(frameId, expression, value) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "setExpression"
        )
      );
    }
    return this.raw.setExpression({ expression, value, frameId });
  }
  gotoTargets(source, line, column) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "gotoTargets"
        )
      );
    }
    return this.raw.gotoTargets({ source, line, column });
  }
  goto(threadId, targetId) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "goto"
        )
      );
    }
    return this.raw.goto({ threadId, targetId });
  }
  loadSource(resource) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "loadSource"
          )
        )
      );
    }
    const source = this.getSourceForUri(resource);
    let rawSource;
    if (source) {
      rawSource = source.raw;
    } else {
      const data = Source.getEncodedDebugData(resource);
      rawSource = {
        path: data.path,
        sourceReference: data.sourceReference
      };
    }
    return this.raw.source({
      sourceReference: rawSource.sourceReference || 0,
      source: rawSource
    });
  }
  async getLoadedSources() {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "getLoadedSources"
          )
        )
      );
    }
    const response = await this.raw.loadedSources({});
    if (response?.body && response.body.sources) {
      return response.body.sources.map((src) => this.getSource(src));
    } else {
      return [];
    }
  }
  async completions(frameId, threadId, text, position, overwriteBefore, token) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "completions"
          )
        )
      );
    }
    const sessionCancelationToken = this.getNewCancellationToken(
      threadId,
      token
    );
    return this.raw.completions(
      {
        frameId,
        text,
        column: position.column,
        line: position.lineNumber
      },
      sessionCancelationToken
    );
  }
  async stepInTargets(frameId) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "stepInTargets"
          )
        )
      );
    }
    const response = await this.raw.stepInTargets({ frameId });
    return response?.body.targets;
  }
  async cancel(progressId) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "cancel"
          )
        )
      );
    }
    return this.raw.cancel({ progressId });
  }
  async disassemble(memoryReference, offset, instructionOffset, instructionCount) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "disassemble"
          )
        )
      );
    }
    const response = await this.raw.disassemble({
      memoryReference,
      offset,
      instructionOffset,
      instructionCount,
      resolveSymbols: true
    });
    return response?.body?.instructions;
  }
  readMemory(memoryReference, offset, count) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "readMemory"
          )
        )
      );
    }
    return this.raw.readMemory({ count, memoryReference, offset });
  }
  writeMemory(memoryReference, offset, data, allowPartial) {
    if (!this.raw) {
      return Promise.reject(
        new Error(
          localize(
            "noDebugAdapter",
            "No debugger available, can not send '{0}'",
            "disassemble"
          )
        )
      );
    }
    return this.raw.writeMemory({
      memoryReference,
      offset,
      allowPartial,
      data
    });
  }
  async resolveLocationReference(locationReference) {
    if (!this.raw) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "locations"
        )
      );
    }
    const location = await this.raw.locations({ locationReference });
    if (!location?.body) {
      throw new Error(
        localize(
          "noDebugAdapter",
          "No debugger available, can not send '{0}'",
          "locations"
        )
      );
    }
    const source = this.getSource(location.body.source);
    return { column: 1, ...location.body, source };
  }
  //---- threads
  getThread(threadId) {
    return this.threads.get(threadId);
  }
  getAllThreads() {
    const result = [];
    this.threadIds.forEach((threadId) => {
      const thread = this.threads.get(threadId);
      if (thread) {
        result.push(thread);
      }
    });
    return result;
  }
  clearThreads(removeThreads, reference = void 0) {
    if (reference !== void 0 && reference !== null) {
      const thread = this.threads.get(reference);
      if (thread) {
        thread.clearCallStack();
        thread.stoppedDetails = void 0;
        thread.stopped = false;
        if (removeThreads) {
          this.threads.delete(reference);
        }
      }
    } else {
      this.threads.forEach((thread) => {
        thread.clearCallStack();
        thread.stoppedDetails = void 0;
        thread.stopped = false;
      });
      if (removeThreads) {
        this.threads.clear();
        this.threadIds = [];
        ExpressionContainer.allValues.clear();
      }
    }
  }
  getStoppedDetails() {
    return this.stoppedDetails.length >= 1 ? this.stoppedDetails[0] : void 0;
  }
  rawUpdate(data) {
    this.threadIds = [];
    data.threads.forEach((thread) => {
      this.threadIds.push(thread.id);
      if (!this.threads.has(thread.id)) {
        this.threads.set(
          thread.id,
          new Thread(this, thread.name, thread.id)
        );
      } else if (thread.name) {
        const oldThread = this.threads.get(thread.id);
        if (oldThread) {
          oldThread.name = thread.name;
        }
      }
    });
    this.threads.forEach((t) => {
      if (this.threadIds.indexOf(t.threadId) === -1) {
        this.threads.delete(t.threadId);
      }
    });
    const stoppedDetails = data.stoppedDetails;
    if (stoppedDetails) {
      if (stoppedDetails.allThreadsStopped) {
        this.threads.forEach((thread) => {
          thread.stoppedDetails = thread.threadId === stoppedDetails.threadId ? stoppedDetails : { reason: thread.stoppedDetails?.reason };
          thread.stopped = true;
          thread.clearCallStack();
        });
      } else {
        const thread = typeof stoppedDetails.threadId === "number" ? this.threads.get(stoppedDetails.threadId) : void 0;
        if (thread) {
          thread.stoppedDetails = stoppedDetails;
          thread.clearCallStack();
          thread.stopped = true;
        }
      }
    }
  }
  waitForTriggeredBreakpoints() {
    if (!this._waitToResume) {
      return;
    }
    return raceTimeout(this._waitToResume, TRIGGERED_BREAKPOINT_MAX_DELAY);
  }
  async fetchThreads(stoppedDetails) {
    if (this.raw) {
      const response = await this.raw.threads();
      if (response?.body && response.body.threads) {
        this.model.rawUpdate({
          sessionId: this.getId(),
          threads: response.body.threads,
          stoppedDetails
        });
      }
    }
  }
  initializeForTest(raw) {
    this.raw = raw;
    this.registerListeners();
  }
  //---- private
  registerListeners() {
    if (!this.raw) {
      return;
    }
    this.rawListeners.add(
      this.raw.onDidInitialize(async () => {
        aria.status(
          this.configuration.noDebug ? localize(
            "debuggingStartedNoDebug",
            "Started running without debugging."
          ) : localize("debuggingStarted", "Debugging started.")
        );
        const sendConfigurationDone = async () => {
          if (this.raw && this.raw.capabilities.supportsConfigurationDoneRequest) {
            try {
              await this.raw.configurationDone();
            } catch (e) {
              this.notificationService.error(e);
              this.raw?.disconnect({});
            }
          }
          return void 0;
        };
        try {
          await this.debugService.sendAllBreakpoints(this);
        } finally {
          await sendConfigurationDone();
          await this.fetchThreads();
        }
      })
    );
    const statusQueue = this.statusQueue;
    this.rawListeners.add(
      this.raw.onDidStop((event) => this.handleStop(event.body))
    );
    this.rawListeners.add(
      this.raw.onDidThread((event) => {
        statusQueue.cancel([event.body.threadId]);
        if (event.body.reason === "started") {
          if (!this.fetchThreadsScheduler) {
            this.fetchThreadsScheduler = new RunOnceScheduler(
              () => {
                this.fetchThreads();
              },
              100
            );
            this.rawListeners.add(this.fetchThreadsScheduler);
          }
          if (!this.fetchThreadsScheduler.isScheduled()) {
            this.fetchThreadsScheduler.schedule();
          }
        } else if (event.body.reason === "exited") {
          this.model.clearThreads(
            this.getId(),
            true,
            event.body.threadId
          );
          const viewModel = this.debugService.getViewModel();
          const focusedThread = viewModel.focusedThread;
          this.passFocusScheduler.cancel();
          if (focusedThread && event.body.threadId === focusedThread.threadId) {
            this.debugService.focusStackFrame(
              void 0,
              void 0,
              viewModel.focusedSession,
              { explicit: false }
            );
          }
        }
      })
    );
    this.rawListeners.add(
      this.raw.onDidTerminateDebugee(async (event) => {
        aria.status(localize("debuggingStopped", "Debugging stopped."));
        if (event.body && event.body.restart) {
          await this.debugService.restartSession(
            this,
            event.body.restart
          );
        } else if (this.raw) {
          await this.raw.disconnect({ terminateDebuggee: false });
        }
      })
    );
    this.rawListeners.add(
      this.raw.onDidContinued((event) => {
        const allThreads = event.body.allThreadsContinued !== false;
        statusQueue.cancel(
          allThreads ? void 0 : [event.body.threadId]
        );
        const threadId = allThreads ? void 0 : event.body.threadId;
        if (typeof threadId === "number") {
          this.stoppedDetails = this.stoppedDetails.filter(
            (sd) => sd.threadId !== threadId
          );
          const tokens = this.cancellationMap.get(threadId);
          this.cancellationMap.delete(threadId);
          tokens?.forEach((t) => t.dispose(true));
        } else {
          this.stoppedDetails = [];
          this.cancelAllRequests();
        }
        this.lastContinuedThreadId = threadId;
        this.passFocusScheduler.schedule();
        this.model.clearThreads(this.getId(), false, threadId);
        this._onDidChangeState.fire();
      })
    );
    const outputQueue = new Queue();
    this.rawListeners.add(
      this.raw.onDidOutput(async (event) => {
        const outputSeverity = event.body.category === "stderr" ? Severity.Error : event.body.category === "console" ? Severity.Warning : Severity.Info;
        if (event.body.variablesReference) {
          const source = event.body.source && event.body.line ? {
            lineNumber: event.body.line,
            column: event.body.column ? event.body.column : 1,
            source: this.getSource(event.body.source)
          } : void 0;
          const container = new ExpressionContainer(
            this,
            void 0,
            event.body.variablesReference,
            generateUuid()
          );
          const children = container.getChildren();
          outputQueue.queue(async () => {
            const resolved = await children;
            if (resolved.length === 1) {
              this.appendToRepl(
                {
                  output: event.body.output,
                  expression: resolved[0],
                  sev: outputSeverity,
                  source
                },
                event.body.category === "important"
              );
              return;
            }
            resolved.forEach((child) => {
              child.name = null;
              this.appendToRepl(
                {
                  output: "",
                  expression: child,
                  sev: outputSeverity,
                  source
                },
                event.body.category === "important"
              );
            });
          });
          return;
        }
        outputQueue.queue(async () => {
          if (!event.body || !this.raw) {
            return;
          }
          if (event.body.category === "telemetry") {
            const telemetryEndpoint = this.raw.dbgr.getCustomTelemetryEndpoint();
            if (telemetryEndpoint && this.telemetryService.telemetryLevel !== TelemetryLevel.NONE) {
              let data = event.body.data;
              if (!telemetryEndpoint.sendErrorTelemetry && event.body.data) {
                data = filterExceptionsFromTelemetry(
                  event.body.data
                );
              }
              this.customEndpointTelemetryService.publicLog(
                telemetryEndpoint,
                event.body.output,
                data
              );
            }
            return;
          }
          const source = event.body.source && event.body.line ? {
            lineNumber: event.body.line,
            column: event.body.column ? event.body.column : 1,
            source: this.getSource(event.body.source)
          } : void 0;
          if (event.body.group === "start" || event.body.group === "startCollapsed") {
            const expanded = event.body.group === "start";
            this.repl.startGroup(
              event.body.output || "",
              expanded,
              source
            );
            return;
          }
          if (event.body.group === "end") {
            this.repl.endGroup();
            if (!event.body.output) {
              return;
            }
          }
          if (typeof event.body.output === "string") {
            this.appendToRepl(
              {
                output: event.body.output,
                sev: outputSeverity,
                source
              },
              event.body.category === "important"
            );
          }
        });
      })
    );
    this.rawListeners.add(
      this.raw.onDidBreakpoint((event) => {
        const id = event.body && event.body.breakpoint ? event.body.breakpoint.id : void 0;
        const breakpoint = this.model.getBreakpoints().find((bp) => bp.getIdFromAdapter(this.getId()) === id);
        const functionBreakpoint = this.model.getFunctionBreakpoints().find((bp) => bp.getIdFromAdapter(this.getId()) === id);
        const dataBreakpoint = this.model.getDataBreakpoints().find((dbp) => dbp.getIdFromAdapter(this.getId()) === id);
        const exceptionBreakpoint = this.model.getExceptionBreakpoints().find(
          (excbp) => excbp.getIdFromAdapter(this.getId()) === id
        );
        if (event.body.reason === "new" && event.body.breakpoint.source && event.body.breakpoint.line) {
          const source = this.getSource(event.body.breakpoint.source);
          const bps = this.model.addBreakpoints(
            source.uri,
            [
              {
                column: event.body.breakpoint.column,
                enabled: true,
                lineNumber: event.body.breakpoint.line
              }
            ],
            false
          );
          if (bps.length === 1) {
            const data = /* @__PURE__ */ new Map([
              [bps[0].getId(), event.body.breakpoint]
            ]);
            this.model.setBreakpointSessionData(
              this.getId(),
              this.capabilities,
              data
            );
          }
        }
        if (event.body.reason === "removed") {
          if (breakpoint) {
            this.model.removeBreakpoints([breakpoint]);
          }
          if (functionBreakpoint) {
            this.model.removeFunctionBreakpoints(
              functionBreakpoint.getId()
            );
          }
          if (dataBreakpoint) {
            this.model.removeDataBreakpoints(
              dataBreakpoint.getId()
            );
          }
        }
        if (event.body.reason === "changed") {
          if (breakpoint) {
            if (!breakpoint.column) {
              event.body.breakpoint.column = void 0;
            }
            const data = /* @__PURE__ */ new Map([
              [breakpoint.getId(), event.body.breakpoint]
            ]);
            this.model.setBreakpointSessionData(
              this.getId(),
              this.capabilities,
              data
            );
          }
          if (functionBreakpoint) {
            const data = /* @__PURE__ */ new Map([
              [functionBreakpoint.getId(), event.body.breakpoint]
            ]);
            this.model.setBreakpointSessionData(
              this.getId(),
              this.capabilities,
              data
            );
          }
          if (dataBreakpoint) {
            const data = /* @__PURE__ */ new Map([
              [dataBreakpoint.getId(), event.body.breakpoint]
            ]);
            this.model.setBreakpointSessionData(
              this.getId(),
              this.capabilities,
              data
            );
          }
          if (exceptionBreakpoint) {
            const data = /* @__PURE__ */ new Map([
              [
                exceptionBreakpoint.getId(),
                event.body.breakpoint
              ]
            ]);
            this.model.setBreakpointSessionData(
              this.getId(),
              this.capabilities,
              data
            );
          }
        }
      })
    );
    this.rawListeners.add(
      this.raw.onDidLoadedSource((event) => {
        this._onDidLoadedSource.fire({
          reason: event.body.reason,
          source: this.getSource(event.body.source)
        });
      })
    );
    this.rawListeners.add(
      this.raw.onDidCustomEvent((event) => {
        this._onDidCustomEvent.fire(event);
      })
    );
    this.rawListeners.add(
      this.raw.onDidProgressStart((event) => {
        this._onDidProgressStart.fire(event);
      })
    );
    this.rawListeners.add(
      this.raw.onDidProgressUpdate((event) => {
        this._onDidProgressUpdate.fire(event);
      })
    );
    this.rawListeners.add(
      this.raw.onDidProgressEnd((event) => {
        this._onDidProgressEnd.fire(event);
      })
    );
    this.rawListeners.add(
      this.raw.onDidInvalidateMemory((event) => {
        this._onDidInvalidMemory.fire(event);
      })
    );
    this.rawListeners.add(
      this.raw.onDidInvalidated(async (event) => {
        const areas = event.body.areas || ["all"];
        if (areas.includes("threads") || areas.includes("stacks") || areas.includes("all")) {
          this.cancelAllRequests();
          this.model.clearThreads(this.getId(), true);
          const details = this.stoppedDetails;
          this.stoppedDetails.length = 1;
          await Promise.all(details.map((d) => this.handleStop(d)));
        }
        const viewModel = this.debugService.getViewModel();
        if (viewModel.focusedSession === this) {
          viewModel.updateViews();
        }
      })
    );
    this.rawListeners.add(
      this.raw.onDidExitAdapter((event) => this.onDidExitAdapter(event))
    );
  }
  async handleStop(event) {
    this.passFocusScheduler.cancel();
    this.stoppedDetails.push(event);
    if (event.hitBreakpointIds) {
      this._waitToResume = this.enableDependentBreakpoints(
        event.hitBreakpointIds
      );
    }
    this.statusQueue.run(
      this.fetchThreads(event).then(
        () => event.threadId === void 0 ? this.threadIds : [event.threadId]
      ),
      async (threadId, token) => {
        const hasLotsOfThreads = event.threadId === void 0 && this.threadIds.length > 10;
        const focusedThread = this.debugService.getViewModel().focusedThread;
        const focusedThreadDoesNotExist = focusedThread !== void 0 && focusedThread.session === this && !this.threads.has(focusedThread.threadId);
        if (focusedThreadDoesNotExist) {
          this.debugService.focusStackFrame(void 0, void 0);
        }
        const thread = typeof threadId === "number" ? this.getThread(threadId) : void 0;
        if (thread) {
          const promises = this.model.refreshTopOfCallstack(
            thread,
            /* fetchFullStack= */
            !hasLotsOfThreads
          );
          const focus = async () => {
            if (focusedThreadDoesNotExist || !event.preserveFocusHint && thread.getCallStack().length) {
              const focusedStackFrame2 = this.debugService.getViewModel().focusedStackFrame;
              if (!focusedStackFrame2 || focusedStackFrame2.thread.session === this) {
                const preserveFocus = !this.configurationService.getValue(
                  "debug"
                ).focusEditorOnBreak;
                await this.debugService.focusStackFrame(
                  void 0,
                  thread,
                  void 0,
                  { preserveFocus }
                );
              }
              if (thread.stoppedDetails && !token.isCancellationRequested) {
                if (thread.stoppedDetails.reason === "breakpoint" && this.configurationService.getValue(
                  "debug"
                ).openDebug === "openOnDebugBreak" && !this.suppressDebugView) {
                  await this.paneCompositeService.openPaneComposite(
                    VIEWLET_ID,
                    ViewContainerLocation.Sidebar
                  );
                }
                if (this.configurationService.getValue(
                  "debug"
                ).focusWindowOnBreak && !this.workbenchEnvironmentService.extensionTestsLocationURI) {
                  const activeWindow = getActiveWindow();
                  if (!activeWindow.document.hasFocus()) {
                    await this.hostService.focus(
                      mainWindow,
                      {
                        force: true
                      }
                    );
                  }
                }
              }
            }
          };
          await promises.topCallStack;
          if (!event.hitBreakpointIds) {
            this._waitToResume = this.enableDependentBreakpoints(thread);
          }
          if (token.isCancellationRequested) {
            return;
          }
          focus();
          await promises.wholeCallStack;
          if (token.isCancellationRequested) {
            return;
          }
          const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
          if (!focusedStackFrame || isFrameDeemphasized(focusedStackFrame)) {
            focus();
          }
        }
        this._onDidChangeState.fire();
      }
    );
  }
  async enableDependentBreakpoints(hitBreakpointIdsOrThread) {
    let breakpoints;
    if (Array.isArray(hitBreakpointIdsOrThread)) {
      breakpoints = this.model.getBreakpoints().filter(
        (bp) => hitBreakpointIdsOrThread.includes(
          bp.getIdFromAdapter(this.id)
        )
      );
    } else {
      const frame = hitBreakpointIdsOrThread.getTopStackFrame();
      if (frame === void 0) {
        return;
      }
      if (hitBreakpointIdsOrThread.stoppedDetails && hitBreakpointIdsOrThread.stoppedDetails.reason !== "breakpoint") {
        return;
      }
      breakpoints = this.getBreakpointsAtPosition(
        frame.source.uri,
        frame.range.startLineNumber,
        frame.range.endLineNumber,
        frame.range.startColumn,
        frame.range.endColumn
      );
    }
    const urisToResend = /* @__PURE__ */ new Set();
    this.model.getBreakpoints({ triggeredOnly: true, enabledOnly: true }).forEach((bp) => {
      breakpoints.forEach((cbp) => {
        if (bp.enabled && bp.triggeredBy === cbp.getId()) {
          bp.setSessionDidTrigger(this.getId());
          urisToResend.add(bp.uri.toString());
        }
      });
    });
    const results = [];
    urisToResend.forEach(
      (uri) => results.push(
        this.debugService.sendBreakpoints(
          URI.parse(uri),
          void 0,
          this
        )
      )
    );
    return Promise.all(results);
  }
  getBreakpointsAtPosition(uri, startLineNumber, endLineNumber, startColumn, endColumn) {
    return this.model.getBreakpoints({ uri }).filter((bp) => {
      if (bp.lineNumber < startLineNumber || bp.lineNumber > endLineNumber) {
        return false;
      }
      if (bp.column && (bp.column < startColumn || bp.column > endColumn)) {
        return false;
      }
      return true;
    });
  }
  onDidExitAdapter(event) {
    this.initialized = true;
    this.model.setBreakpointSessionData(
      this.getId(),
      this.capabilities,
      void 0
    );
    this.shutdown();
    this._onDidEndAdapter.fire(event);
  }
  // Disconnects and clears state. Session can be initialized again for a new connection.
  shutdown() {
    this.rawListeners.clear();
    if (this.raw) {
      this.raw.disconnect({});
      this.raw.dispose();
      this.raw = void 0;
    }
    this.fetchThreadsScheduler?.dispose();
    this.fetchThreadsScheduler = void 0;
    this.passFocusScheduler.cancel();
    this.passFocusScheduler.dispose();
    this.model.clearThreads(this.getId(), true);
    this._onDidChangeState.fire();
  }
  dispose() {
    this.cancelAllRequests();
    this.rawListeners.dispose();
    this.globalDisposables.dispose();
  }
  //---- sources
  getSourceForUri(uri) {
    return this.sources.get(
      this.uriIdentityService.asCanonicalUri(uri).toString()
    );
  }
  getSource(raw) {
    let source = new Source(
      raw,
      this.getId(),
      this.uriIdentityService,
      this.logService
    );
    const uriKey = source.uri.toString();
    const found = this.sources.get(uriKey);
    if (found) {
      source = found;
      source.raw = mixin(source.raw, raw);
      if (source.raw && raw) {
        source.raw.presentationHint = raw.presentationHint;
      }
    } else {
      this.sources.set(uriKey, source);
    }
    return source;
  }
  getRawSource(uri) {
    const source = this.getSourceForUri(uri);
    if (source) {
      return source.raw;
    } else {
      const data = Source.getEncodedDebugData(uri);
      return {
        name: data.name,
        path: data.path,
        sourceReference: data.sourceReference
      };
    }
  }
  getNewCancellationToken(threadId, token) {
    const tokenSource = new CancellationTokenSource(token);
    const tokens = this.cancellationMap.get(threadId) || [];
    tokens.push(tokenSource);
    this.cancellationMap.set(threadId, tokens);
    return tokenSource.token;
  }
  cancelAllRequests() {
    this.cancellationMap.forEach(
      (tokens) => tokens.forEach((t) => t.dispose(true))
    );
    this.cancellationMap.clear();
  }
  // REPL
  getReplElements() {
    return this.repl.getReplElements();
  }
  hasSeparateRepl() {
    return !this.parentSession || this._options.repl !== "mergeWithParent";
  }
  removeReplExpressions() {
    this.repl.removeReplExpressions();
  }
  async addReplExpression(stackFrame, expression) {
    await this.repl.addReplExpression(this, stackFrame, expression);
    this.debugService.getViewModel().updateViews();
  }
  appendToRepl(data, isImportant) {
    this.repl.appendToRepl(this, data);
    if (isImportant) {
      this.notificationService.notify({
        message: data.output.toString(),
        severity: data.sev,
        source: this.name
      });
    }
  }
};
DebugSession = __decorateClass([
  __decorateParam(5, IDebugService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IHostService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IPaneCompositePartService),
  __decorateParam(10, IWorkspaceContextService),
  __decorateParam(11, IProductService),
  __decorateParam(12, INotificationService),
  __decorateParam(13, ILifecycleService),
  __decorateParam(14, IUriIdentityService),
  __decorateParam(15, IInstantiationService),
  __decorateParam(16, ICustomEndpointTelemetryService),
  __decorateParam(17, IWorkbenchEnvironmentService),
  __decorateParam(18, ILogService),
  __decorateParam(19, ITestService),
  __decorateParam(20, ITestResultService),
  __decorateParam(21, IAccessibilityService)
], DebugSession);
class ThreadStatusScheduler extends Disposable {
  /**
   * An array of set of thread IDs. When a 'stopped' event is encountered, the
   * editor refreshes its thread IDs. In the meantime, the thread may change
   * state it again. So the editor puts a Set into this array when it starts
   * the refresh, and checks it after the refresh is finished, to see if
   * any of the threads it looked up should now be invalidated.
   */
  pendingCancellations = [];
  /**
   * Cancellation tokens for currently-running operations on threads.
   */
  threadOps = this._register(
    new DisposableMap()
  );
  /**
   * Runs the operation.
   * If thread is undefined it affects all threads.
   */
  async run(threadIdsP, operation) {
    const cancelledWhileLookingUpThreads = /* @__PURE__ */ new Set();
    this.pendingCancellations.push(cancelledWhileLookingUpThreads);
    const threadIds = await threadIdsP;
    for (let i = 0; i < this.pendingCancellations.length; i++) {
      const s = this.pendingCancellations[i];
      if (s === cancelledWhileLookingUpThreads) {
        this.pendingCancellations.splice(i, 1);
        break;
      } else {
        for (const threadId of threadIds) {
          s.add(threadId);
        }
      }
    }
    if (cancelledWhileLookingUpThreads.has(void 0)) {
      return;
    }
    await Promise.all(
      threadIds.map((threadId) => {
        if (cancelledWhileLookingUpThreads.has(threadId)) {
          return;
        }
        this.threadOps.get(threadId)?.cancel();
        const cts = new CancellationTokenSource();
        this.threadOps.set(threadId, cts);
        return operation(threadId, cts.token);
      })
    );
  }
  /**
   * Cancels all ongoing state operations on the given threads.
   * If threads is undefined it cancel all threads.
   */
  cancel(threadIds) {
    if (threadIds) {
      for (const threadId of threadIds) {
        this.threadOps.get(threadId)?.cancel();
        this.threadOps.deleteAndDispose(threadId);
        for (const s of this.pendingCancellations) {
          s.add(threadId);
        }
      }
    } else {
      for (const [_, op] of this.threadOps) {
        op.cancel();
      }
      this.threadOps.clearAndDisposeAll();
      for (const s of this.pendingCancellations) {
        s.add(void 0);
      }
    }
  }
}
export {
  DebugSession,
  ThreadStatusScheduler
};
