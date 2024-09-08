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
import { coalesce } from "../../../base/common/arrays.js";
import { asPromise } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable as DisposableCls,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { ThemeIcon as ThemeIconUtils } from "../../../base/common/themables.js";
import { URI } from "../../../base/common/uri.js";
import {
  ExtensionIdentifier
} from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { AbstractDebugAdapter } from "../../contrib/debug/common/abstractDebugAdapter.js";
import {
  DebugVisualizationType
} from "../../contrib/debug/common/debug.js";
import {
  convertToDAPaths,
  convertToVSCPaths,
  isDebuggerMainContribution
} from "../../contrib/debug/common/debugUtils.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostCommands } from "./extHostCommands.js";
import { IExtHostConfiguration } from "./extHostConfiguration.js";
import { IExtHostEditorTabs } from "./extHostEditorTabs.js";
import { IExtHostExtensionService } from "./extHostExtensionService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IExtHostTesting } from "./extHostTesting.js";
import * as Convert from "./extHostTypeConverters.js";
import {
  DataBreakpoint,
  DebugAdapterExecutable,
  DebugAdapterInlineImplementation,
  DebugAdapterNamedPipeServer,
  DebugAdapterServer,
  DebugConsoleMode,
  DebugStackFrame,
  DebugThread,
  Disposable,
  FunctionBreakpoint,
  Location,
  Position,
  setBreakpointId,
  SourceBreakpoint,
  ThemeIcon
} from "./extHostTypes.js";
import { IExtHostVariableResolverProvider } from "./extHostVariableResolverService.js";
import { IExtHostWorkspace } from "./extHostWorkspace.js";
const IExtHostDebugService = createDecorator(
  "IExtHostDebugService"
);
let ExtHostDebugServiceBase = class extends DisposableCls {
  constructor(extHostRpcService, _workspaceService, _extensionService, _configurationService, _editorTabs, _variableResolver, _commands, _testing) {
    super();
    this._workspaceService = _workspaceService;
    this._extensionService = _extensionService;
    this._configurationService = _configurationService;
    this._editorTabs = _editorTabs;
    this._variableResolver = _variableResolver;
    this._commands = _commands;
    this._testing = _testing;
    this._configProviderHandleCounter = 0;
    this._configProviders = [];
    this._adapterFactoryHandleCounter = 0;
    this._adapterFactories = [];
    this._trackerFactoryHandleCounter = 0;
    this._trackerFactories = [];
    this._debugAdapters = /* @__PURE__ */ new Map();
    this._debugAdaptersTrackers = /* @__PURE__ */ new Map();
    this._onDidStartDebugSession = this._register(
      new Emitter()
    );
    this._onDidTerminateDebugSession = this._register(
      new Emitter()
    );
    this._onDidChangeActiveDebugSession = this._register(
      new Emitter()
    );
    this._onDidReceiveDebugSessionCustomEvent = this._register(
      new Emitter()
    );
    this._debugServiceProxy = extHostRpcService.getProxy(
      MainContext.MainThreadDebugService
    );
    this._onDidChangeBreakpoints = this._register(
      new Emitter()
    );
    this._onDidChangeActiveStackItem = this._register(
      new Emitter()
    );
    this._activeDebugConsole = new ExtHostDebugConsole(
      this._debugServiceProxy
    );
    this._breakpoints = /* @__PURE__ */ new Map();
    this._extensionService.getExtensionRegistry().then((extensionRegistry) => {
      this._register(
        extensionRegistry.onDidChange((_) => {
          this.registerAllDebugTypes(extensionRegistry);
        })
      );
      this.registerAllDebugTypes(extensionRegistry);
    });
  }
  _serviceBrand;
  _configProviderHandleCounter;
  _configProviders;
  _adapterFactoryHandleCounter;
  _adapterFactories;
  _trackerFactoryHandleCounter;
  _trackerFactories;
  _debugServiceProxy;
  _debugSessions = /* @__PURE__ */ new Map();
  _onDidStartDebugSession;
  get onDidStartDebugSession() {
    return this._onDidStartDebugSession.event;
  }
  _onDidTerminateDebugSession;
  get onDidTerminateDebugSession() {
    return this._onDidTerminateDebugSession.event;
  }
  _onDidChangeActiveDebugSession;
  get onDidChangeActiveDebugSession() {
    return this._onDidChangeActiveDebugSession.event;
  }
  _activeDebugSession;
  get activeDebugSession() {
    return this._activeDebugSession?.api;
  }
  _onDidReceiveDebugSessionCustomEvent;
  get onDidReceiveDebugSessionCustomEvent() {
    return this._onDidReceiveDebugSessionCustomEvent.event;
  }
  _activeDebugConsole;
  get activeDebugConsole() {
    return this._activeDebugConsole.value;
  }
  _breakpoints;
  _onDidChangeBreakpoints;
  _activeStackItem;
  _onDidChangeActiveStackItem;
  _debugAdapters;
  _debugAdaptersTrackers;
  _debugVisualizationTreeItemIdsCounter = 0;
  _debugVisualizationProviders = /* @__PURE__ */ new Map();
  _debugVisualizationTrees = /* @__PURE__ */ new Map();
  _debugVisualizationTreeItemIds = /* @__PURE__ */ new WeakMap();
  _debugVisualizationElements = /* @__PURE__ */ new Map();
  _signService;
  _visualizers = /* @__PURE__ */ new Map();
  _visualizerIdCounter = 0;
  async $getVisualizerTreeItem(treeId, element) {
    const context = this.hydrateVisualizationContext(element);
    if (!context) {
      return void 0;
    }
    const item = await this._debugVisualizationTrees.get(treeId)?.getTreeItem?.(context);
    return item ? this.convertVisualizerTreeItem(treeId, item) : void 0;
  }
  registerDebugVisualizationTree(manifest, id, provider) {
    const extensionId = ExtensionIdentifier.toKey(manifest.identifier);
    const key = this.extensionVisKey(extensionId, id);
    if (this._debugVisualizationProviders.has(key)) {
      throw new Error(
        `A debug visualization provider with id '${id}' is already registered`
      );
    }
    this._debugVisualizationTrees.set(key, provider);
    this._debugServiceProxy.$registerDebugVisualizerTree(
      key,
      !!provider.editItem
    );
    return toDisposable(() => {
      this._debugServiceProxy.$unregisterDebugVisualizerTree(key);
      this._debugVisualizationTrees.delete(id);
    });
  }
  async $getVisualizerTreeItemChildren(treeId, element) {
    const item = this._debugVisualizationElements.get(element)?.item;
    if (!item) {
      return [];
    }
    const children = await this._debugVisualizationTrees.get(treeId)?.getChildren?.(item);
    return children?.map((i) => this.convertVisualizerTreeItem(treeId, i)) || [];
  }
  async $editVisualizerTreeItem(element, value) {
    const e = this._debugVisualizationElements.get(element);
    if (!e) {
      return void 0;
    }
    const r = await this._debugVisualizationTrees.get(e.provider)?.editItem?.(e.item, value);
    return this.convertVisualizerTreeItem(e.provider, r || e.item);
  }
  $disposeVisualizedTree(element) {
    const root = this._debugVisualizationElements.get(element);
    if (!root) {
      return;
    }
    const queue = [root.children];
    for (const children of queue) {
      if (children) {
        for (const child of children) {
          queue.push(
            this._debugVisualizationElements.get(child)?.children
          );
          this._debugVisualizationElements.delete(child);
        }
      }
    }
  }
  convertVisualizerTreeItem(treeId, item) {
    let id = this._debugVisualizationTreeItemIds.get(item);
    if (!id) {
      id = this._debugVisualizationTreeItemIdsCounter++;
      this._debugVisualizationTreeItemIds.set(item, id);
      this._debugVisualizationElements.set(id, {
        provider: treeId,
        item
      });
    }
    return Convert.DebugTreeItem.from(item, id);
  }
  asDebugSourceUri(src, session) {
    const source = src;
    if (typeof source.sourceReference === "number" && source.sourceReference > 0) {
      let debug = `debug:${encodeURIComponent(source.path || "")}`;
      let sep = "?";
      if (session) {
        debug += `${sep}session=${encodeURIComponent(session.id)}`;
        sep = "&";
      }
      debug += `${sep}ref=${source.sourceReference}`;
      return URI.parse(debug);
    } else if (source.path) {
      return URI.file(source.path);
    } else {
      throw new Error(
        `cannot create uri from DAP 'source' object; properties 'path' and 'sourceReference' are both missing.`
      );
    }
  }
  registerAllDebugTypes(extensionRegistry) {
    const debugTypes = [];
    for (const ed of extensionRegistry.getAllExtensionDescriptions()) {
      if (ed.contributes) {
        const debuggers = ed.contributes["debuggers"];
        if (debuggers && debuggers.length > 0) {
          for (const dbg of debuggers) {
            if (isDebuggerMainContribution(dbg)) {
              debugTypes.push(dbg.type);
            }
          }
        }
      }
    }
    this._debugServiceProxy.$registerDebugTypes(debugTypes);
  }
  // extension debug API
  get activeStackItem() {
    return this._activeStackItem;
  }
  get onDidChangeActiveStackItem() {
    return this._onDidChangeActiveStackItem.event;
  }
  get onDidChangeBreakpoints() {
    return this._onDidChangeBreakpoints.event;
  }
  get breakpoints() {
    const result = [];
    this._breakpoints.forEach((bp) => result.push(bp));
    return result;
  }
  async $resolveDebugVisualizer(id, token) {
    const visualizer = this._visualizers.get(id);
    if (!visualizer) {
      throw new Error(`No debug visualizer found with id '${id}'`);
    }
    let { v, provider, extensionId } = visualizer;
    if (!v.visualization) {
      v = await provider.resolveDebugVisualization?.(v, token) || v;
      visualizer.v = v;
    }
    if (!v.visualization) {
      throw new Error(
        `No visualization returned from resolveDebugVisualization in '${provider}'`
      );
    }
    return this.serializeVisualization(extensionId, v.visualization);
  }
  async $executeDebugVisualizerCommand(id) {
    const visualizer = this._visualizers.get(id);
    if (!visualizer) {
      throw new Error(`No debug visualizer found with id '${id}'`);
    }
    const command = visualizer.v.visualization;
    if (command && "command" in command) {
      this._commands.executeCommand(
        command.command,
        ...command.arguments || []
      );
    }
  }
  hydrateVisualizationContext(context) {
    const session = this._debugSessions.get(context.sessionId);
    return session && {
      session: session.api,
      variable: context.variable,
      containerId: context.containerId,
      frameId: context.frameId,
      threadId: context.threadId
    };
  }
  async $provideDebugVisualizers(extensionId, id, context, token) {
    const contextHydrated = this.hydrateVisualizationContext(context);
    const key = this.extensionVisKey(extensionId, id);
    const provider = this._debugVisualizationProviders.get(key);
    if (!contextHydrated || !provider) {
      return [];
    }
    const visualizations = await provider.provideDebugVisualization(
      contextHydrated,
      token
    );
    if (!visualizations) {
      return [];
    }
    return visualizations.map((v) => {
      const id2 = ++this._visualizerIdCounter;
      this._visualizers.set(id2, { v, provider, extensionId });
      const icon = v.iconPath ? this.getIconPathOrClass(v.iconPath) : void 0;
      return {
        id: id2,
        name: v.name,
        iconClass: icon?.iconClass,
        iconPath: icon?.iconPath,
        visualization: this.serializeVisualization(
          extensionId,
          v.visualization
        )
      };
    });
  }
  $disposeDebugVisualizers(ids) {
    for (const id of ids) {
      this._visualizers.delete(id);
    }
  }
  registerDebugVisualizationProvider(manifest, id, provider) {
    if (!manifest.contributes?.debugVisualizers?.some((r) => r.id === id)) {
      throw new Error(
        `Extensions may only call registerDebugVisualizationProvider() for renderers they contribute (got ${id})`
      );
    }
    const extensionId = ExtensionIdentifier.toKey(manifest.identifier);
    const key = this.extensionVisKey(extensionId, id);
    if (this._debugVisualizationProviders.has(key)) {
      throw new Error(
        `A debug visualization provider with id '${id}' is already registered`
      );
    }
    this._debugVisualizationProviders.set(key, provider);
    this._debugServiceProxy.$registerDebugVisualizer(extensionId, id);
    return toDisposable(() => {
      this._debugServiceProxy.$unregisterDebugVisualizer(extensionId, id);
      this._debugVisualizationProviders.delete(id);
    });
  }
  addBreakpoints(breakpoints0) {
    const breakpoints = breakpoints0.filter((bp) => {
      const id = bp.id;
      if (!this._breakpoints.has(id)) {
        this._breakpoints.set(id, bp);
        return true;
      }
      return false;
    });
    this.fireBreakpointChanges(breakpoints, [], []);
    const dtos = [];
    const map = /* @__PURE__ */ new Map();
    for (const bp of breakpoints) {
      if (bp instanceof SourceBreakpoint) {
        let dto = map.get(bp.location.uri.toString());
        if (!dto) {
          dto = {
            type: "sourceMulti",
            uri: bp.location.uri,
            lines: []
          };
          map.set(bp.location.uri.toString(), dto);
          dtos.push(dto);
        }
        dto.lines.push({
          id: bp.id,
          enabled: bp.enabled,
          condition: bp.condition,
          hitCondition: bp.hitCondition,
          logMessage: bp.logMessage,
          line: bp.location.range.start.line,
          character: bp.location.range.start.character,
          mode: bp.mode
        });
      } else if (bp instanceof FunctionBreakpoint) {
        dtos.push({
          type: "function",
          id: bp.id,
          enabled: bp.enabled,
          hitCondition: bp.hitCondition,
          logMessage: bp.logMessage,
          condition: bp.condition,
          functionName: bp.functionName,
          mode: bp.mode
        });
      }
    }
    return this._debugServiceProxy.$registerBreakpoints(dtos);
  }
  removeBreakpoints(breakpoints0) {
    const breakpoints = breakpoints0.filter(
      (b) => this._breakpoints.delete(b.id)
    );
    this.fireBreakpointChanges([], breakpoints, []);
    const ids = breakpoints.filter((bp) => bp instanceof SourceBreakpoint).map((bp) => bp.id);
    const fids = breakpoints.filter((bp) => bp instanceof FunctionBreakpoint).map((bp) => bp.id);
    const dids = breakpoints.filter((bp) => bp instanceof DataBreakpoint).map((bp) => bp.id);
    return this._debugServiceProxy.$unregisterBreakpoints(ids, fids, dids);
  }
  startDebugging(folder, nameOrConfig, options) {
    const testRunMeta = options.testRun && this._testing.getMetadataForRun(options.testRun);
    return this._debugServiceProxy.$startDebugging(
      folder ? folder.uri : void 0,
      nameOrConfig,
      {
        parentSessionID: options.parentSession ? options.parentSession.id : void 0,
        lifecycleManagedByParent: options.lifecycleManagedByParent,
        repl: options.consoleMode === DebugConsoleMode.MergeWithParent ? "mergeWithParent" : "separate",
        noDebug: options.noDebug,
        compact: options.compact,
        suppressSaveBeforeStart: options.suppressSaveBeforeStart,
        testRun: testRunMeta && {
          runId: testRunMeta.runId,
          taskId: testRunMeta.taskId
        },
        // Check debugUI for back-compat, #147264
        suppressDebugStatusbar: options.suppressDebugStatusbar ?? options.debugUI?.simple,
        suppressDebugToolbar: options.suppressDebugToolbar ?? options.debugUI?.simple,
        suppressDebugView: options.suppressDebugView ?? options.debugUI?.simple
      }
    );
  }
  stopDebugging(session) {
    return this._debugServiceProxy.$stopDebugging(
      session ? session.id : void 0
    );
  }
  registerDebugConfigurationProvider(type, provider, trigger) {
    if (!provider) {
      return new Disposable(() => {
      });
    }
    const handle = this._configProviderHandleCounter++;
    this._configProviders.push({ type, handle, provider });
    this._debugServiceProxy.$registerDebugConfigurationProvider(
      type,
      trigger,
      !!provider.provideDebugConfigurations,
      !!provider.resolveDebugConfiguration,
      !!provider.resolveDebugConfigurationWithSubstitutedVariables,
      handle
    );
    return new Disposable(() => {
      this._configProviders = this._configProviders.filter(
        (p) => p.provider !== provider
      );
      this._debugServiceProxy.$unregisterDebugConfigurationProvider(
        handle
      );
    });
  }
  registerDebugAdapterDescriptorFactory(extension, type, factory) {
    if (!factory) {
      return new Disposable(() => {
      });
    }
    if (!this.definesDebugType(extension, type)) {
      throw new Error(
        `a DebugAdapterDescriptorFactory can only be registered from the extension that defines the '${type}' debugger.`
      );
    }
    if (this.getAdapterDescriptorFactoryByType(type)) {
      throw new Error(
        `a DebugAdapterDescriptorFactory can only be registered once per a type.`
      );
    }
    const handle = this._adapterFactoryHandleCounter++;
    this._adapterFactories.push({ type, handle, factory });
    this._debugServiceProxy.$registerDebugAdapterDescriptorFactory(
      type,
      handle
    );
    return new Disposable(() => {
      this._adapterFactories = this._adapterFactories.filter(
        (p) => p.factory !== factory
      );
      this._debugServiceProxy.$unregisterDebugAdapterDescriptorFactory(
        handle
      );
    });
  }
  registerDebugAdapterTrackerFactory(type, factory) {
    if (!factory) {
      return new Disposable(() => {
      });
    }
    const handle = this._trackerFactoryHandleCounter++;
    this._trackerFactories.push({ type, handle, factory });
    return new Disposable(() => {
      this._trackerFactories = this._trackerFactories.filter(
        (p) => p.factory !== factory
      );
    });
  }
  // RPC methods (ExtHostDebugServiceShape)
  async $runInTerminal(args, sessionId) {
    return Promise.resolve(void 0);
  }
  async $substituteVariables(folderUri, config) {
    let ws;
    const folder = await this.getFolder(folderUri);
    if (folder) {
      ws = {
        uri: folder.uri,
        name: folder.name,
        index: folder.index,
        toResource: () => {
          throw new Error("Not implemented");
        }
      };
    }
    const variableResolver = await this._variableResolver.getResolver();
    return variableResolver.resolveAnyAsync(ws, config);
  }
  createDebugAdapter(adapter, session) {
    if (adapter.type === "implementation") {
      return new DirectDebugAdapter(adapter.implementation);
    }
    return void 0;
  }
  createSignService() {
    return void 0;
  }
  async $startDASession(debugAdapterHandle, sessionDto) {
    const session = await this.getSession(sessionDto);
    return this.getAdapterDescriptor(
      this.getAdapterDescriptorFactoryByType(session.type),
      session
    ).then((daDescriptor) => {
      if (!daDescriptor) {
        throw new Error(
          `Couldn't find a debug adapter descriptor for debug type '${session.type}' (extension might have failed to activate)`
        );
      }
      const adapterDescriptor = this.convertToDto(daDescriptor);
      const da = this.createDebugAdapter(adapterDescriptor, session);
      if (!da) {
        throw new Error(
          `Couldn't create a debug adapter for type '${session.type}'.`
        );
      }
      const debugAdapter = da;
      this._debugAdapters.set(debugAdapterHandle, debugAdapter);
      return this.getDebugAdapterTrackers(session).then((tracker) => {
        if (tracker) {
          this._debugAdaptersTrackers.set(
            debugAdapterHandle,
            tracker
          );
        }
        debugAdapter.onMessage(async (message) => {
          if (message.type === "request" && message.command === "handshake") {
            const request = message;
            const response = {
              type: "response",
              seq: 0,
              command: request.command,
              request_seq: request.seq,
              success: true
            };
            if (!this._signService) {
              this._signService = this.createSignService();
            }
            try {
              if (this._signService) {
                const signature = await this._signService.sign(
                  request.arguments.value
                );
                response.body = {
                  signature
                };
                debugAdapter.sendResponse(response);
              } else {
                throw new Error("no signer");
              }
            } catch (e) {
              response.success = false;
              response.message = e.message;
              debugAdapter.sendResponse(response);
            }
          } else {
            if (tracker && tracker.onDidSendMessage) {
              tracker.onDidSendMessage(message);
            }
            message = convertToVSCPaths(message, true);
            this._debugServiceProxy.$acceptDAMessage(
              debugAdapterHandle,
              message
            );
          }
        });
        debugAdapter.onError((err) => {
          if (tracker && tracker.onError) {
            tracker.onError(err);
          }
          this._debugServiceProxy.$acceptDAError(
            debugAdapterHandle,
            err.name,
            err.message,
            err.stack
          );
        });
        debugAdapter.onExit((code) => {
          if (tracker && tracker.onExit) {
            tracker.onExit(code ?? void 0, void 0);
          }
          this._debugServiceProxy.$acceptDAExit(
            debugAdapterHandle,
            code ?? void 0,
            void 0
          );
        });
        if (tracker && tracker.onWillStartSession) {
          tracker.onWillStartSession();
        }
        return debugAdapter.startSession();
      });
    });
  }
  $sendDAMessage(debugAdapterHandle, message) {
    message = convertToDAPaths(message, false);
    const tracker = this._debugAdaptersTrackers.get(debugAdapterHandle);
    if (tracker && tracker.onWillReceiveMessage) {
      tracker.onWillReceiveMessage(message);
    }
    const da = this._debugAdapters.get(debugAdapterHandle);
    da?.sendMessage(message);
  }
  $stopDASession(debugAdapterHandle) {
    const tracker = this._debugAdaptersTrackers.get(debugAdapterHandle);
    this._debugAdaptersTrackers.delete(debugAdapterHandle);
    if (tracker && tracker.onWillStopSession) {
      tracker.onWillStopSession();
    }
    const da = this._debugAdapters.get(debugAdapterHandle);
    this._debugAdapters.delete(debugAdapterHandle);
    if (da) {
      return da.stopSession();
    } else {
      return Promise.resolve(void 0);
    }
  }
  $acceptBreakpointsDelta(delta) {
    const a = [];
    const r = [];
    const c = [];
    if (delta.added) {
      for (const bpd of delta.added) {
        const id = bpd.id;
        if (id && !this._breakpoints.has(id)) {
          let bp;
          if (bpd.type === "function") {
            bp = new FunctionBreakpoint(
              bpd.functionName,
              bpd.enabled,
              bpd.condition,
              bpd.hitCondition,
              bpd.logMessage,
              bpd.mode
            );
          } else if (bpd.type === "data") {
            bp = new DataBreakpoint(
              bpd.label,
              bpd.dataId,
              bpd.canPersist,
              bpd.enabled,
              bpd.hitCondition,
              bpd.condition,
              bpd.logMessage,
              bpd.mode
            );
          } else {
            const uri = URI.revive(bpd.uri);
            bp = new SourceBreakpoint(
              new Location(
                uri,
                new Position(bpd.line, bpd.character)
              ),
              bpd.enabled,
              bpd.condition,
              bpd.hitCondition,
              bpd.logMessage,
              bpd.mode
            );
          }
          setBreakpointId(bp, id);
          this._breakpoints.set(id, bp);
          a.push(bp);
        }
      }
    }
    if (delta.removed) {
      for (const id of delta.removed) {
        const bp = this._breakpoints.get(id);
        if (bp) {
          this._breakpoints.delete(id);
          r.push(bp);
        }
      }
    }
    if (delta.changed) {
      for (const bpd of delta.changed) {
        if (bpd.id) {
          const bp = this._breakpoints.get(bpd.id);
          if (bp) {
            if (bp instanceof FunctionBreakpoint && bpd.type === "function") {
              const fbp = bp;
              fbp.enabled = bpd.enabled;
              fbp.condition = bpd.condition;
              fbp.hitCondition = bpd.hitCondition;
              fbp.logMessage = bpd.logMessage;
              fbp.functionName = bpd.functionName;
            } else if (bp instanceof SourceBreakpoint && bpd.type === "source") {
              const sbp = bp;
              sbp.enabled = bpd.enabled;
              sbp.condition = bpd.condition;
              sbp.hitCondition = bpd.hitCondition;
              sbp.logMessage = bpd.logMessage;
              sbp.location = new Location(
                URI.revive(bpd.uri),
                new Position(bpd.line, bpd.character)
              );
            }
            c.push(bp);
          }
        }
      }
    }
    this.fireBreakpointChanges(a, r, c);
  }
  async $acceptStackFrameFocus(focusDto) {
    let focus;
    if (focusDto) {
      const session = await this.getSession(focusDto.sessionId);
      if (focusDto.kind === "thread") {
        focus = new DebugThread(session.api, focusDto.threadId);
      } else {
        focus = new DebugStackFrame(
          session.api,
          focusDto.threadId,
          focusDto.frameId
        );
      }
    }
    this._activeStackItem = focus;
    this._onDidChangeActiveStackItem.fire(this._activeStackItem);
  }
  $provideDebugConfigurations(configProviderHandle, folderUri, token) {
    return asPromise(async () => {
      const provider = this.getConfigProviderByHandle(configProviderHandle);
      if (!provider) {
        throw new Error("no DebugConfigurationProvider found");
      }
      if (!provider.provideDebugConfigurations) {
        throw new Error(
          "DebugConfigurationProvider has no method provideDebugConfigurations"
        );
      }
      const folder = await this.getFolder(folderUri);
      return provider.provideDebugConfigurations(folder, token);
    }).then((debugConfigurations) => {
      if (!debugConfigurations) {
        throw new Error(
          "nothing returned from DebugConfigurationProvider.provideDebugConfigurations"
        );
      }
      return debugConfigurations;
    });
  }
  $resolveDebugConfiguration(configProviderHandle, folderUri, debugConfiguration, token) {
    return asPromise(async () => {
      const provider = this.getConfigProviderByHandle(configProviderHandle);
      if (!provider) {
        throw new Error("no DebugConfigurationProvider found");
      }
      if (!provider.resolveDebugConfiguration) {
        throw new Error(
          "DebugConfigurationProvider has no method resolveDebugConfiguration"
        );
      }
      const folder = await this.getFolder(folderUri);
      return provider.resolveDebugConfiguration(
        folder,
        debugConfiguration,
        token
      );
    });
  }
  $resolveDebugConfigurationWithSubstitutedVariables(configProviderHandle, folderUri, debugConfiguration, token) {
    return asPromise(async () => {
      const provider = this.getConfigProviderByHandle(configProviderHandle);
      if (!provider) {
        throw new Error("no DebugConfigurationProvider found");
      }
      if (!provider.resolveDebugConfigurationWithSubstitutedVariables) {
        throw new Error(
          "DebugConfigurationProvider has no method resolveDebugConfigurationWithSubstitutedVariables"
        );
      }
      const folder = await this.getFolder(folderUri);
      return provider.resolveDebugConfigurationWithSubstitutedVariables(
        folder,
        debugConfiguration,
        token
      );
    });
  }
  async $provideDebugAdapter(adapterFactoryHandle, sessionDto) {
    const adapterDescriptorFactory = this.getAdapterDescriptorFactoryByHandle(adapterFactoryHandle);
    if (!adapterDescriptorFactory) {
      return Promise.reject(
        new Error("no adapter descriptor factory found for handle")
      );
    }
    const session = await this.getSession(sessionDto);
    return this.getAdapterDescriptor(
      adapterDescriptorFactory,
      session
    ).then((adapterDescriptor) => {
      if (!adapterDescriptor) {
        throw new Error(
          `Couldn't find a debug adapter descriptor for debug type '${session.type}'`
        );
      }
      return this.convertToDto(adapterDescriptor);
    });
  }
  async $acceptDebugSessionStarted(sessionDto) {
    const session = await this.getSession(sessionDto);
    this._onDidStartDebugSession.fire(session.api);
  }
  async $acceptDebugSessionTerminated(sessionDto) {
    const session = await this.getSession(sessionDto);
    if (session) {
      this._onDidTerminateDebugSession.fire(session.api);
      this._debugSessions.delete(session.id);
    }
  }
  async $acceptDebugSessionActiveChanged(sessionDto) {
    this._activeDebugSession = sessionDto ? await this.getSession(sessionDto) : void 0;
    this._onDidChangeActiveDebugSession.fire(this._activeDebugSession?.api);
  }
  async $acceptDebugSessionNameChanged(sessionDto, name) {
    const session = await this.getSession(sessionDto);
    session?._acceptNameChanged(name);
  }
  async $acceptDebugSessionCustomEvent(sessionDto, event) {
    const session = await this.getSession(sessionDto);
    const ee = {
      session: session.api,
      event: event.event,
      body: event.body
    };
    this._onDidReceiveDebugSessionCustomEvent.fire(ee);
  }
  // private & dto helpers
  convertToDto(x) {
    if (x instanceof DebugAdapterExecutable) {
      return {
        type: "executable",
        command: x.command,
        args: x.args,
        options: x.options
      };
    } else if (x instanceof DebugAdapterServer) {
      return {
        type: "server",
        port: x.port,
        host: x.host
      };
    } else if (x instanceof DebugAdapterNamedPipeServer) {
      return {
        type: "pipeServer",
        path: x.path
      };
    } else if (x instanceof DebugAdapterInlineImplementation) {
      return {
        type: "implementation",
        implementation: x.implementation
      };
    } else {
      throw new Error("convertToDto unexpected type");
    }
  }
  getAdapterDescriptorFactoryByType(type) {
    const results = this._adapterFactories.filter((p) => p.type === type);
    if (results.length > 0) {
      return results[0].factory;
    }
    return void 0;
  }
  getAdapterDescriptorFactoryByHandle(handle) {
    const results = this._adapterFactories.filter(
      (p) => p.handle === handle
    );
    if (results.length > 0) {
      return results[0].factory;
    }
    return void 0;
  }
  getConfigProviderByHandle(handle) {
    const results = this._configProviders.filter(
      (p) => p.handle === handle
    );
    if (results.length > 0) {
      return results[0].provider;
    }
    return void 0;
  }
  definesDebugType(ed, type) {
    if (ed.contributes) {
      const debuggers = ed.contributes["debuggers"];
      if (debuggers && debuggers.length > 0) {
        for (const dbg of debuggers) {
          if (dbg.label && dbg.type) {
            if (dbg.type === type) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  getDebugAdapterTrackers(session) {
    const config = session.configuration;
    const type = config.type;
    const promises = this._trackerFactories.filter((tuple) => tuple.type === type || tuple.type === "*").map(
      (tuple) => asPromise(
        () => tuple.factory.createDebugAdapterTracker(session.api)
      ).then(
        (p) => p,
        (err) => null
      )
    );
    return Promise.race([
      Promise.all(promises).then((result) => {
        const trackers = coalesce(result);
        if (trackers.length > 0) {
          return new MultiTracker(trackers);
        }
        return void 0;
      }),
      new Promise(
        (resolve) => setTimeout(() => resolve(void 0), 1e3)
      )
    ]).catch((err) => {
      return void 0;
    });
  }
  async getAdapterDescriptor(adapterDescriptorFactory, session) {
    const serverPort = session.configuration.debugServer;
    if (typeof serverPort === "number") {
      return Promise.resolve(new DebugAdapterServer(serverPort));
    }
    if (adapterDescriptorFactory) {
      const extensionRegistry2 = await this._extensionService.getExtensionRegistry();
      return asPromise(
        () => adapterDescriptorFactory.createDebugAdapterDescriptor(
          session.api,
          this.daExecutableFromPackage(session, extensionRegistry2)
        )
      ).then((daDescriptor) => {
        if (daDescriptor) {
          return daDescriptor;
        }
        return void 0;
      });
    }
    const extensionRegistry = await this._extensionService.getExtensionRegistry();
    return Promise.resolve(
      this.daExecutableFromPackage(session, extensionRegistry)
    );
  }
  daExecutableFromPackage(session, extensionRegistry) {
    return void 0;
  }
  fireBreakpointChanges(added, removed, changed) {
    if (added.length > 0 || removed.length > 0 || changed.length > 0) {
      this._onDidChangeBreakpoints.fire(
        Object.freeze({
          added,
          removed,
          changed
        })
      );
    }
  }
  async getSession(dto) {
    if (dto) {
      if (typeof dto === "string") {
        const ds = this._debugSessions.get(dto);
        if (ds) {
          return ds;
        }
      } else {
        let ds = this._debugSessions.get(dto.id);
        if (!ds) {
          const folder = await this.getFolder(dto.folderUri);
          const parent = dto.parent ? this._debugSessions.get(dto.parent) : void 0;
          ds = new ExtHostDebugSession(
            this._debugServiceProxy,
            dto.id,
            dto.type,
            dto.name,
            folder,
            dto.configuration,
            parent?.api
          );
          this._debugSessions.set(ds.id, ds);
          this._debugServiceProxy.$sessionCached(ds.id);
        }
        return ds;
      }
    }
    throw new Error("cannot find session");
  }
  getFolder(_folderUri) {
    if (_folderUri) {
      const folderURI = URI.revive(_folderUri);
      return this._workspaceService.resolveWorkspaceFolder(folderURI);
    }
    return Promise.resolve(void 0);
  }
  extensionVisKey(extensionId, id) {
    return `${extensionId}\0${id}`;
  }
  serializeVisualization(extensionId, viz) {
    if (!viz) {
      return void 0;
    }
    if ("title" in viz && "command" in viz) {
      return { type: DebugVisualizationType.Command };
    }
    if ("treeId" in viz) {
      return {
        type: DebugVisualizationType.Tree,
        id: `${extensionId}\0${viz.treeId}`
      };
    }
    throw new Error("Unsupported debug visualization type");
  }
  getIconPathOrClass(icon) {
    const iconPathOrIconClass = this.getIconUris(icon);
    let iconPath;
    let iconClass;
    if ("id" in iconPathOrIconClass) {
      iconClass = ThemeIconUtils.asClassName(iconPathOrIconClass);
    } else {
      iconPath = iconPathOrIconClass;
    }
    return {
      iconPath,
      iconClass
    };
  }
  getIconUris(iconPath) {
    if (iconPath instanceof ThemeIcon) {
      return { id: iconPath.id };
    }
    const dark = typeof iconPath === "object" && "dark" in iconPath ? iconPath.dark : iconPath;
    const light = typeof iconPath === "object" && "light" in iconPath ? iconPath.light : iconPath;
    return {
      dark: typeof dark === "string" ? URI.file(dark) : dark,
      light: typeof light === "string" ? URI.file(light) : light
    };
  }
};
ExtHostDebugServiceBase = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostWorkspace),
  __decorateParam(2, IExtHostExtensionService),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, IExtHostEditorTabs),
  __decorateParam(5, IExtHostVariableResolverProvider),
  __decorateParam(6, IExtHostCommands),
  __decorateParam(7, IExtHostTesting)
], ExtHostDebugServiceBase);
class ExtHostDebugSession {
  constructor(_debugServiceProxy, _id, _type, _name, _workspaceFolder, _configuration, _parentSession) {
    this._debugServiceProxy = _debugServiceProxy;
    this._id = _id;
    this._type = _type;
    this._name = _name;
    this._workspaceFolder = _workspaceFolder;
    this._configuration = _configuration;
    this._parentSession = _parentSession;
  }
  apiSession;
  get api() {
    const that = this;
    return this.apiSession ??= Object.freeze({
      id: that._id,
      type: that._type,
      get name() {
        return that._name;
      },
      set name(name) {
        that._name = name;
        that._debugServiceProxy.$setDebugSessionName(that._id, name);
      },
      parentSession: that._parentSession,
      workspaceFolder: that._workspaceFolder,
      configuration: that._configuration,
      customRequest(command, args) {
        return that._debugServiceProxy.$customDebugAdapterRequest(
          that._id,
          command,
          args
        );
      },
      getDebugProtocolBreakpoint(breakpoint) {
        return that._debugServiceProxy.$getDebugProtocolBreakpoint(
          that._id,
          breakpoint.id
        );
      }
    });
  }
  get id() {
    return this._id;
  }
  get type() {
    return this._type;
  }
  _acceptNameChanged(name) {
    this._name = name;
  }
  get configuration() {
    return this._configuration;
  }
}
class ExtHostDebugConsole {
  value;
  constructor(proxy) {
    this.value = Object.freeze({
      append(value) {
        proxy.$appendDebugConsole(value);
      },
      appendLine(value) {
        this.append(value + "\n");
      }
    });
  }
}
class MultiTracker {
  constructor(trackers) {
    this.trackers = trackers;
  }
  onWillStartSession() {
    this.trackers.forEach(
      (t) => t.onWillStartSession ? t.onWillStartSession() : void 0
    );
  }
  onWillReceiveMessage(message) {
    this.trackers.forEach(
      (t) => t.onWillReceiveMessage ? t.onWillReceiveMessage(message) : void 0
    );
  }
  onDidSendMessage(message) {
    this.trackers.forEach(
      (t) => t.onDidSendMessage ? t.onDidSendMessage(message) : void 0
    );
  }
  onWillStopSession() {
    this.trackers.forEach(
      (t) => t.onWillStopSession ? t.onWillStopSession() : void 0
    );
  }
  onError(error) {
    this.trackers.forEach(
      (t) => t.onError ? t.onError(error) : void 0
    );
  }
  onExit(code, signal) {
    this.trackers.forEach(
      (t) => t.onExit ? t.onExit(code, signal) : void 0
    );
  }
}
class DirectDebugAdapter extends AbstractDebugAdapter {
  constructor(implementation) {
    super();
    this.implementation = implementation;
    implementation.onDidSendMessage(
      (message) => {
        this.acceptMessage(message);
      }
    );
  }
  startSession() {
    return Promise.resolve(void 0);
  }
  sendMessage(message) {
    this.implementation.handleMessage(message);
  }
  stopSession() {
    this.implementation.dispose();
    return Promise.resolve(void 0);
  }
}
let WorkerExtHostDebugService = class extends ExtHostDebugServiceBase {
  constructor(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver, commands, testing) {
    super(
      extHostRpcService,
      workspaceService,
      extensionService,
      configurationService,
      editorTabs,
      variableResolver,
      commands,
      testing
    );
  }
};
WorkerExtHostDebugService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostWorkspace),
  __decorateParam(2, IExtHostExtensionService),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, IExtHostEditorTabs),
  __decorateParam(5, IExtHostVariableResolverProvider),
  __decorateParam(6, IExtHostCommands),
  __decorateParam(7, IExtHostTesting)
], WorkerExtHostDebugService);
export {
  ExtHostDebugConsole,
  ExtHostDebugServiceBase,
  ExtHostDebugSession,
  IExtHostDebugService,
  WorkerExtHostDebugService
};
