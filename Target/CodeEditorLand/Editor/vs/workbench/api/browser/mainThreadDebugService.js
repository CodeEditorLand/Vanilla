var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ErrorNoTelemetry } from "../../../base/common/errors.js";
import { Event } from "../../../base/common/event.js";
import {
  DisposableMap,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import severity from "../../../base/common/severity.js";
import { isDefined } from "../../../base/common/types.js";
import { URI as uri } from "../../../base/common/uri.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { AbstractDebugAdapter } from "../../contrib/debug/common/abstractDebugAdapter.js";
import {
  DataBreakpointSetType,
  IDebugService,
  IDebugVisualization
} from "../../contrib/debug/common/debug.js";
import {
  convertToDAPaths,
  convertToVSCPaths,
  isSessionAttach
} from "../../contrib/debug/common/debugUtils.js";
import { IDebugVisualizerService } from "../../contrib/debug/common/debugVisualizers.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadDebugService = class {
  constructor(extHostContext, debugService, visualizerService) {
    this.debugService = debugService;
    this.visualizerService = visualizerService;
    this._proxy = extHostContext.getProxy(
      ExtHostContext.ExtHostDebugService
    );
    const sessionListeners = new DisposableMap();
    this._toDispose.add(sessionListeners);
    this._toDispose.add(
      debugService.onDidNewSession((session) => {
        this._proxy.$acceptDebugSessionStarted(
          this.getSessionDto(session)
        );
        const store = sessionListeners.get(session);
        store?.add(
          session.onDidChangeName((name) => {
            this._proxy.$acceptDebugSessionNameChanged(
              this.getSessionDto(session),
              name
            );
          })
        );
      })
    );
    this._toDispose.add(
      debugService.onWillNewSession((session) => {
        let store = sessionListeners.get(session);
        if (!store) {
          store = new DisposableStore();
          sessionListeners.set(session, store);
        }
        store.add(
          session.onDidCustomEvent(
            (event) => this._proxy.$acceptDebugSessionCustomEvent(
              this.getSessionDto(session),
              event
            )
          )
        );
      })
    );
    this._toDispose.add(
      debugService.onDidEndSession(({ session, restart }) => {
        this._proxy.$acceptDebugSessionTerminated(
          this.getSessionDto(session)
        );
        this._extHostKnownSessions.delete(session.getId());
        if (!restart) {
          sessionListeners.deleteAndDispose(session);
        }
        for (const [handle, value] of this._debugAdapters) {
          if (value.session === session) {
            this._debugAdapters.delete(handle);
          }
        }
      })
    );
    this._toDispose.add(
      debugService.getViewModel().onDidFocusSession((session) => {
        this._proxy.$acceptDebugSessionActiveChanged(
          this.getSessionDto(session)
        );
      })
    );
    this._toDispose.add(
      toDisposable(() => {
        for (const [handle, da] of this._debugAdapters) {
          da.fireError(handle, new Error("Extension host shut down"));
        }
      })
    );
    this._debugAdapters = /* @__PURE__ */ new Map();
    this._debugConfigurationProviders = /* @__PURE__ */ new Map();
    this._debugAdapterDescriptorFactories = /* @__PURE__ */ new Map();
    this._extHostKnownSessions = /* @__PURE__ */ new Set();
    const viewModel = this.debugService.getViewModel();
    this._toDispose.add(
      Event.any(
        viewModel.onDidFocusStackFrame,
        viewModel.onDidFocusThread
      )(() => {
        const stackFrame = viewModel.focusedStackFrame;
        const thread = viewModel.focusedThread;
        if (stackFrame) {
          this._proxy.$acceptStackFrameFocus({
            kind: "stackFrame",
            threadId: stackFrame.thread.threadId,
            frameId: stackFrame.frameId,
            sessionId: stackFrame.thread.session.getId()
          });
        } else if (thread) {
          this._proxy.$acceptStackFrameFocus({
            kind: "thread",
            threadId: thread.threadId,
            sessionId: thread.session.getId()
          });
        } else {
          this._proxy.$acceptStackFrameFocus(void 0);
        }
      })
    );
    this.sendBreakpointsAndListen();
  }
  _proxy;
  _toDispose = new DisposableStore();
  _debugAdapters;
  _debugAdaptersHandleCounter = 1;
  _debugConfigurationProviders;
  _debugAdapterDescriptorFactories;
  _extHostKnownSessions;
  _visualizerHandles = /* @__PURE__ */ new Map();
  _visualizerTreeHandles = /* @__PURE__ */ new Map();
  $registerDebugVisualizerTree(treeId, canEdit) {
    this.visualizerService.registerTree(treeId, {
      disposeItem: /* @__PURE__ */ __name((id) => this._proxy.$disposeVisualizedTree(id), "disposeItem"),
      getChildren: /* @__PURE__ */ __name((e) => this._proxy.$getVisualizerTreeItemChildren(treeId, e), "getChildren"),
      getTreeItem: /* @__PURE__ */ __name((e) => this._proxy.$getVisualizerTreeItem(treeId, e), "getTreeItem"),
      editItem: canEdit ? (e, v) => this._proxy.$editVisualizerTreeItem(e, v) : void 0
    });
  }
  $unregisterDebugVisualizerTree(treeId) {
    this._visualizerTreeHandles.get(treeId)?.dispose();
    this._visualizerTreeHandles.delete(treeId);
  }
  $registerDebugVisualizer(extensionId, id) {
    const handle = this.visualizerService.register({
      extensionId: new ExtensionIdentifier(extensionId),
      id,
      disposeDebugVisualizers: /* @__PURE__ */ __name((ids) => this._proxy.$disposeDebugVisualizers(ids), "disposeDebugVisualizers"),
      executeDebugVisualizerCommand: /* @__PURE__ */ __name((id2) => this._proxy.$executeDebugVisualizerCommand(id2), "executeDebugVisualizerCommand"),
      provideDebugVisualizers: /* @__PURE__ */ __name((context, token) => this._proxy.$provideDebugVisualizers(extensionId, id, context, token).then((r) => r.map(IDebugVisualization.deserialize)), "provideDebugVisualizers"),
      resolveDebugVisualizer: /* @__PURE__ */ __name((viz, token) => this._proxy.$resolveDebugVisualizer(viz.id, token), "resolveDebugVisualizer")
    });
    this._visualizerHandles.set(`${extensionId}/${id}`, handle);
  }
  $unregisterDebugVisualizer(extensionId, id) {
    const key = `${extensionId}/${id}`;
    this._visualizerHandles.get(key)?.dispose();
    this._visualizerHandles.delete(key);
  }
  sendBreakpointsAndListen() {
    this._toDispose.add(
      this.debugService.getModel().onDidChangeBreakpoints((e) => {
        if (e && !e.sessionOnly) {
          const delta = {};
          if (e.added) {
            delta.added = this.convertToDto(e.added);
          }
          if (e.removed) {
            delta.removed = e.removed.map((x) => x.getId());
          }
          if (e.changed) {
            delta.changed = this.convertToDto(e.changed);
          }
          if (delta.added || delta.removed || delta.changed) {
            this._proxy.$acceptBreakpointsDelta(delta);
          }
        }
      })
    );
    const bps = this.debugService.getModel().getBreakpoints();
    const fbps = this.debugService.getModel().getFunctionBreakpoints();
    const dbps = this.debugService.getModel().getDataBreakpoints();
    if (bps.length > 0 || fbps.length > 0) {
      this._proxy.$acceptBreakpointsDelta({
        added: this.convertToDto(bps).concat(this.convertToDto(fbps)).concat(this.convertToDto(dbps))
      });
    }
  }
  dispose() {
    this._toDispose.dispose();
  }
  // interface IDebugAdapterProvider
  createDebugAdapter(session) {
    const handle = this._debugAdaptersHandleCounter++;
    const da = new ExtensionHostDebugAdapter(
      this,
      handle,
      this._proxy,
      session
    );
    this._debugAdapters.set(handle, da);
    return da;
  }
  substituteVariables(folder, config) {
    return Promise.resolve(
      this._proxy.$substituteVariables(
        folder ? folder.uri : void 0,
        config
      )
    );
  }
  runInTerminal(args, sessionId) {
    return this._proxy.$runInTerminal(args, sessionId);
  }
  // RPC methods (MainThreadDebugServiceShape)
  $registerDebugTypes(debugTypes) {
    this._toDispose.add(
      this.debugService.getAdapterManager().registerDebugAdapterFactory(debugTypes, this)
    );
  }
  $registerBreakpoints(DTOs) {
    for (const dto of DTOs) {
      if (dto.type === "sourceMulti") {
        const rawbps = dto.lines.map(
          (l) => ({
            id: l.id,
            enabled: l.enabled,
            lineNumber: l.line + 1,
            column: l.character > 0 ? l.character + 1 : void 0,
            // a column value of 0 results in an omitted column attribute; see #46784
            condition: l.condition,
            hitCondition: l.hitCondition,
            logMessage: l.logMessage,
            mode: l.mode
          })
        );
        this.debugService.addBreakpoints(uri.revive(dto.uri), rawbps);
      } else if (dto.type === "function") {
        this.debugService.addFunctionBreakpoint(
          {
            name: dto.functionName,
            mode: dto.mode,
            condition: dto.condition,
            hitCondition: dto.hitCondition,
            enabled: dto.enabled,
            logMessage: dto.logMessage
          },
          dto.id
        );
      } else if (dto.type === "data") {
        this.debugService.addDataBreakpoint({
          description: dto.label,
          src: {
            type: DataBreakpointSetType.Variable,
            dataId: dto.dataId
          },
          canPersist: dto.canPersist,
          accessTypes: dto.accessTypes,
          accessType: dto.accessType,
          mode: dto.mode
        });
      }
    }
    return Promise.resolve();
  }
  $unregisterBreakpoints(breakpointIds, functionBreakpointIds, dataBreakpointIds) {
    breakpointIds.forEach((id) => this.debugService.removeBreakpoints(id));
    functionBreakpointIds.forEach(
      (id) => this.debugService.removeFunctionBreakpoints(id)
    );
    dataBreakpointIds.forEach(
      (id) => this.debugService.removeDataBreakpoints(id)
    );
    return Promise.resolve();
  }
  $registerDebugConfigurationProvider(debugType, providerTriggerKind, hasProvide, hasResolve, hasResolve2, handle) {
    const provider = {
      type: debugType,
      triggerKind: providerTriggerKind
    };
    if (hasProvide) {
      provider.provideDebugConfigurations = (folder, token) => {
        return this._proxy.$provideDebugConfigurations(
          handle,
          folder,
          token
        );
      };
    }
    if (hasResolve) {
      provider.resolveDebugConfiguration = (folder, config, token) => {
        return this._proxy.$resolveDebugConfiguration(
          handle,
          folder,
          config,
          token
        );
      };
    }
    if (hasResolve2) {
      provider.resolveDebugConfigurationWithSubstitutedVariables = (folder, config, token) => {
        return this._proxy.$resolveDebugConfigurationWithSubstitutedVariables(
          handle,
          folder,
          config,
          token
        );
      };
    }
    this._debugConfigurationProviders.set(handle, provider);
    this._toDispose.add(
      this.debugService.getConfigurationManager().registerDebugConfigurationProvider(provider)
    );
    return Promise.resolve(void 0);
  }
  $unregisterDebugConfigurationProvider(handle) {
    const provider = this._debugConfigurationProviders.get(handle);
    if (provider) {
      this._debugConfigurationProviders.delete(handle);
      this.debugService.getConfigurationManager().unregisterDebugConfigurationProvider(provider);
    }
  }
  $registerDebugAdapterDescriptorFactory(debugType, handle) {
    const provider = {
      type: debugType,
      createDebugAdapterDescriptor: /* @__PURE__ */ __name((session) => {
        return Promise.resolve(
          this._proxy.$provideDebugAdapter(
            handle,
            this.getSessionDto(session)
          )
        );
      }, "createDebugAdapterDescriptor")
    };
    this._debugAdapterDescriptorFactories.set(handle, provider);
    this._toDispose.add(
      this.debugService.getAdapterManager().registerDebugAdapterDescriptorFactory(provider)
    );
    return Promise.resolve(void 0);
  }
  $unregisterDebugAdapterDescriptorFactory(handle) {
    const provider = this._debugAdapterDescriptorFactories.get(handle);
    if (provider) {
      this._debugAdapterDescriptorFactories.delete(handle);
      this.debugService.getAdapterManager().unregisterDebugAdapterDescriptorFactory(provider);
    }
  }
  getSession(sessionId) {
    if (sessionId) {
      return this.debugService.getModel().getSession(sessionId, true);
    }
    return void 0;
  }
  async $startDebugging(folder, nameOrConfig, options) {
    const folderUri = folder ? uri.revive(folder) : void 0;
    const launch = this.debugService.getConfigurationManager().getLaunch(folderUri);
    const parentSession = this.getSession(options.parentSessionID);
    const saveBeforeStart = typeof options.suppressSaveBeforeStart === "boolean" ? !options.suppressSaveBeforeStart : void 0;
    const debugOptions = {
      noDebug: options.noDebug,
      parentSession,
      lifecycleManagedByParent: options.lifecycleManagedByParent,
      repl: options.repl,
      compact: options.compact,
      compoundRoot: parentSession?.compoundRoot,
      saveBeforeRestart: saveBeforeStart,
      testRun: options.testRun,
      suppressDebugStatusbar: options.suppressDebugStatusbar,
      suppressDebugToolbar: options.suppressDebugToolbar,
      suppressDebugView: options.suppressDebugView
    };
    try {
      return this.debugService.startDebugging(
        launch,
        nameOrConfig,
        debugOptions,
        saveBeforeStart
      );
    } catch (err) {
      throw new ErrorNoTelemetry(
        err && err.message ? err.message : "cannot start debugging"
      );
    }
  }
  $setDebugSessionName(sessionId, name) {
    const session = this.debugService.getModel().getSession(sessionId);
    session?.setName(name);
  }
  $customDebugAdapterRequest(sessionId, request, args) {
    const session = this.debugService.getModel().getSession(sessionId, true);
    if (session) {
      return session.customRequest(request, args).then((response) => {
        if (response && response.success) {
          return response.body;
        } else {
          return Promise.reject(
            new ErrorNoTelemetry(
              response ? response.message : "custom request failed"
            )
          );
        }
      });
    }
    return Promise.reject(new ErrorNoTelemetry("debug session not found"));
  }
  $getDebugProtocolBreakpoint(sessionId, breakpoinId) {
    const session = this.debugService.getModel().getSession(sessionId, true);
    if (session) {
      return Promise.resolve(
        session.getDebugProtocolBreakpoint(breakpoinId)
      );
    }
    return Promise.reject(new ErrorNoTelemetry("debug session not found"));
  }
  $stopDebugging(sessionId) {
    if (sessionId) {
      const session = this.debugService.getModel().getSession(sessionId, true);
      if (session) {
        return this.debugService.stopSession(
          session,
          isSessionAttach(session)
        );
      }
    } else {
      return this.debugService.stopSession(void 0);
    }
    return Promise.reject(new ErrorNoTelemetry("debug session not found"));
  }
  $appendDebugConsole(value) {
    const session = this.debugService.getViewModel().focusedSession;
    session?.appendToRepl({ output: value, sev: severity.Warning });
  }
  $acceptDAMessage(handle, message) {
    this.getDebugAdapter(handle).acceptMessage(
      convertToVSCPaths(message, false)
    );
  }
  $acceptDAError(handle, name, message, stack) {
    this._debugAdapters.get(handle)?.fireError(handle, new Error(`${name}: ${message}
${stack}`));
  }
  $acceptDAExit(handle, code, signal) {
    this.getDebugAdapter(handle).fireExit(handle, code, signal);
  }
  getDebugAdapter(handle) {
    const adapter = this._debugAdapters.get(handle);
    if (!adapter) {
      throw new Error("Invalid debug adapter");
    }
    return adapter;
  }
  // dto helpers
  $sessionCached(sessionID) {
    this._extHostKnownSessions.add(sessionID);
  }
  getSessionDto(session) {
    if (session) {
      const sessionID = session.getId();
      if (this._extHostKnownSessions.has(sessionID)) {
        return sessionID;
      } else {
        return {
          id: sessionID,
          type: session.configuration.type,
          name: session.name,
          folderUri: session.root ? session.root.uri : void 0,
          configuration: session.configuration,
          parent: session.parentSession?.getId()
        };
      }
    }
    return void 0;
  }
  convertToDto(bps) {
    return bps.map((bp) => {
      if ("name" in bp) {
        const fbp = bp;
        return {
          type: "function",
          id: fbp.getId(),
          enabled: fbp.enabled,
          condition: fbp.condition,
          hitCondition: fbp.hitCondition,
          logMessage: fbp.logMessage,
          functionName: fbp.name
        };
      } else if ("src" in bp) {
        const dbp = bp;
        return {
          type: "data",
          id: dbp.getId(),
          dataId: dbp.src.type === DataBreakpointSetType.Variable ? dbp.src.dataId : dbp.src.address,
          enabled: dbp.enabled,
          condition: dbp.condition,
          hitCondition: dbp.hitCondition,
          logMessage: dbp.logMessage,
          accessType: dbp.accessType,
          label: dbp.description,
          canPersist: dbp.canPersist
        };
      } else if ("uri" in bp) {
        const sbp = bp;
        return {
          type: "source",
          id: sbp.getId(),
          enabled: sbp.enabled,
          condition: sbp.condition,
          hitCondition: sbp.hitCondition,
          logMessage: sbp.logMessage,
          uri: sbp.uri,
          line: sbp.lineNumber > 0 ? sbp.lineNumber - 1 : 0,
          character: typeof sbp.column === "number" && sbp.column > 0 ? sbp.column - 1 : 0
        };
      } else {
        return void 0;
      }
    }).filter(isDefined);
  }
};
__name(MainThreadDebugService, "MainThreadDebugService");
MainThreadDebugService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDebugService),
  __decorateParam(1, IDebugService),
  __decorateParam(2, IDebugVisualizerService)
], MainThreadDebugService);
class ExtensionHostDebugAdapter extends AbstractDebugAdapter {
  constructor(_ds, _handle, _proxy, session) {
    super();
    this._ds = _ds;
    this._handle = _handle;
    this._proxy = _proxy;
    this.session = session;
  }
  static {
    __name(this, "ExtensionHostDebugAdapter");
  }
  fireError(handle, err) {
    this._onError.fire(err);
  }
  fireExit(handle, code, signal) {
    this._onExit.fire(code);
  }
  startSession() {
    return Promise.resolve(
      this._proxy.$startDASession(
        this._handle,
        this._ds.getSessionDto(this.session)
      )
    );
  }
  sendMessage(message) {
    this._proxy.$sendDAMessage(
      this._handle,
      convertToDAPaths(message, true)
    );
  }
  async stopSession() {
    await this.cancelPendingRequests();
    return Promise.resolve(this._proxy.$stopDASession(this._handle));
  }
}
export {
  MainThreadDebugService
};
//# sourceMappingURL=mainThreadDebugService.js.map
