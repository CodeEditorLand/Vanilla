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
import { Emitter } from "../../../../base/common/event.js";
import { IProcessEnvironment, isMacintosh, isWindows, OperatingSystem } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { ILocalPtyService, IProcessPropertyMap, IPtyHostLatencyMeasurement, IPtyService, IShellLaunchConfig, ITerminalBackend, ITerminalBackendRegistry, ITerminalChildProcess, ITerminalEnvironment, ITerminalLogService, ITerminalProcessOptions, ITerminalsLayoutInfo, ITerminalsLayoutInfoById, ProcessPropertyType, TerminalExtensions, TerminalIpcChannels, TerminalSettingId, TitleEventSource } from "../../../../platform/terminal/common/terminal.js";
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from "../../../../platform/terminal/common/terminalProcess.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { ITerminalInstanceService } from "../browser/terminal.js";
import { ITerminalConfiguration, ITerminalProfileResolverService, TERMINAL_CONFIG_SECTION } from "../common/terminal.js";
import { TerminalStorageKeys } from "../common/terminalStorageKeys.js";
import { LocalPty } from "./localPty.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IShellEnvironmentService } from "../../../services/environment/electron-sandbox/shellEnvironmentService.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import * as terminalEnvironment from "../common/terminalEnvironment.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IEnvironmentVariableService } from "../common/environmentVariable.js";
import { BaseTerminalBackend } from "../browser/baseTerminalBackend.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { Client as MessagePortClient } from "../../../../base/parts/ipc/common/ipc.mp.js";
import { acquirePort } from "../../../../base/parts/ipc/electron-sandbox/ipc.mp.js";
import { getDelayedChannel, ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { mark, PerformanceMark } from "../../../../base/common/performance.js";
import { ILifecycleService, LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { DeferredPromise } from "../../../../base/common/async.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { memoize } from "../../../../base/common/decorators.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { shouldUseEnvironmentVariableCollection } from "../../../../platform/terminal/common/terminalEnvironment.js";
let LocalTerminalBackendContribution = class {
  static {
    __name(this, "LocalTerminalBackendContribution");
  }
  static ID = "workbench.contrib.localTerminalBackend";
  constructor(instantiationService, terminalInstanceService) {
    const backend = instantiationService.createInstance(LocalTerminalBackend);
    Registry.as(TerminalExtensions.Backend).registerTerminalBackend(backend);
    terminalInstanceService.didRegisterBackend(backend.remoteAuthority);
  }
};
LocalTerminalBackendContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITerminalInstanceService)
], LocalTerminalBackendContribution);
let LocalTerminalBackend = class extends BaseTerminalBackend {
  constructor(workspaceContextService, _lifecycleService, logService, _localPtyService, _labelService, _shellEnvironmentService, _storageService, _configurationResolverService, _configurationService, _productService, _historyService, _terminalProfileResolverService, _environmentVariableService, historyService, _nativeHostService, statusBarService, _remoteAgentService) {
    super(_localPtyService, logService, historyService, _configurationResolverService, statusBarService, workspaceContextService);
    this._lifecycleService = _lifecycleService;
    this._localPtyService = _localPtyService;
    this._labelService = _labelService;
    this._shellEnvironmentService = _shellEnvironmentService;
    this._storageService = _storageService;
    this._configurationResolverService = _configurationResolverService;
    this._configurationService = _configurationService;
    this._productService = _productService;
    this._historyService = _historyService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._environmentVariableService = _environmentVariableService;
    this._nativeHostService = _nativeHostService;
    this._remoteAgentService = _remoteAgentService;
    this._register(this.onPtyHostRestart(() => {
      this._directProxy = void 0;
      this._directProxyClientEventually = void 0;
      this._connectToDirectProxy();
    }));
  }
  static {
    __name(this, "LocalTerminalBackend");
  }
  remoteAuthority = void 0;
  _ptys = /* @__PURE__ */ new Map();
  _directProxyClientEventually;
  _directProxy;
  /**
   * Communicate to the direct proxy (renderer<->ptyhost) if it's available, otherwise use the
   * indirect proxy (renderer<->main<->ptyhost). The latter may not need to actually launch the
   * pty host, for example when detecting profiles.
   */
  get _proxy() {
    return this._directProxy || this._localPtyService;
  }
  _whenReady = new DeferredPromise();
  get whenReady() {
    return this._whenReady.p;
  }
  setReady() {
    this._whenReady.complete();
  }
  _onDidRequestDetach = this._register(new Emitter());
  onDidRequestDetach = this._onDidRequestDetach.event;
  /**
   * Request a direct connection to the pty host, this will launch the pty host process if necessary.
   */
  async _connectToDirectProxy() {
    if (this._directProxyClientEventually) {
      await this._directProxyClientEventually.p;
      return;
    }
    this._logService.debug("Starting pty host");
    const directProxyClientEventually = new DeferredPromise();
    this._directProxyClientEventually = directProxyClientEventually;
    const directProxy = ProxyChannel.toService(getDelayedChannel(this._directProxyClientEventually.p.then((client) => client.getChannel(TerminalIpcChannels.PtyHostWindow))));
    this._directProxy = directProxy;
    if (!this._remoteAgentService.getConnection()?.remoteAuthority) {
      await this._lifecycleService.when(LifecyclePhase.Restored);
    }
    mark("code/terminal/willConnectPtyHost");
    this._logService.trace("Renderer->PtyHost#connect: before acquirePort");
    acquirePort("vscode:createPtyHostMessageChannel", "vscode:createPtyHostMessageChannelResult").then((port) => {
      mark("code/terminal/didConnectPtyHost");
      this._logService.trace("Renderer->PtyHost#connect: connection established");
      const client = new MessagePortClient(port, `window:${this._nativeHostService.windowId}`);
      directProxyClientEventually.complete(client);
      this._onPtyHostConnected.fire();
      directProxy.onProcessData((e) => this._ptys.get(e.id)?.handleData(e.event));
      directProxy.onDidChangeProperty((e) => this._ptys.get(e.id)?.handleDidChangeProperty(e.property));
      directProxy.onProcessExit((e) => {
        const pty = this._ptys.get(e.id);
        if (pty) {
          pty.handleExit(e.event);
          this._ptys.delete(e.id);
        }
      });
      directProxy.onProcessReady((e) => this._ptys.get(e.id)?.handleReady(e.event));
      directProxy.onProcessReplay((e) => this._ptys.get(e.id)?.handleReplay(e.event));
      directProxy.onProcessOrphanQuestion((e) => this._ptys.get(e.id)?.handleOrphanQuestion());
      directProxy.onDidRequestDetach((e) => this._onDidRequestDetach.fire(e));
      const initialConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
      for (const match of Object.keys(initialConfig.autoReplies)) {
        const reply = initialConfig.autoReplies[match];
        if (reply) {
          directProxy.installAutoReply(match, reply);
        }
      }
      this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(TerminalSettingId.AutoReplies)) {
          directProxy.uninstallAllAutoReplies();
          const config = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
          for (const match of Object.keys(config.autoReplies)) {
            const reply = config.autoReplies[match];
            if (reply) {
              this._proxy.installAutoReply(match, reply);
            }
          }
        }
      }));
      this.getEnvironment();
    });
  }
  async requestDetachInstance(workspaceId, instanceId) {
    return this._proxy.requestDetachInstance(workspaceId, instanceId);
  }
  async acceptDetachInstanceReply(requestId, persistentProcessId) {
    if (!persistentProcessId) {
      this._logService.warn("Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId");
      return;
    }
    return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
  }
  async persistTerminalState() {
    const ids = Array.from(this._ptys.keys());
    const serialized = await this._proxy.serializeTerminalState(ids);
    this._storageService.store(TerminalStorageKeys.TerminalBufferState, serialized, StorageScope.WORKSPACE, StorageTarget.MACHINE);
  }
  async updateTitle(id, title, titleSource) {
    await this._proxy.updateTitle(id, title, titleSource);
  }
  async updateIcon(id, userInitiated, icon, color) {
    await this._proxy.updateIcon(id, userInitiated, icon, color);
  }
  async updateProperty(id, property, value) {
    return this._proxy.updateProperty(id, property, value);
  }
  async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, options, shouldPersist) {
    await this._connectToDirectProxy();
    const executableEnv = await this._shellEnvironmentService.getShellEnv();
    const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, this._getWorkspaceId(), this._getWorkspaceName());
    const pty = new LocalPty(id, shouldPersist, this._proxy);
    this._ptys.set(id, pty);
    return pty;
  }
  async attachToProcess(id) {
    await this._connectToDirectProxy();
    try {
      await this._proxy.attachToProcess(id);
      const pty = new LocalPty(id, true, this._proxy);
      this._ptys.set(id, pty);
      return pty;
    } catch (e) {
      this._logService.warn(`Couldn't attach to process ${e.message}`);
    }
    return void 0;
  }
  async attachToRevivedProcess(id) {
    await this._connectToDirectProxy();
    try {
      const newId = await this._proxy.getRevivedPtyNewId(this._getWorkspaceId(), id) ?? id;
      return await this.attachToProcess(newId);
    } catch (e) {
      this._logService.warn(`Couldn't attach to process ${e.message}`);
    }
    return void 0;
  }
  async listProcesses() {
    await this._connectToDirectProxy();
    return this._proxy.listProcesses();
  }
  async getLatency() {
    const measurements = [];
    const sw = new StopWatch();
    if (this._directProxy) {
      await this._directProxy.getLatency();
      sw.stop();
      measurements.push({
        label: "window<->ptyhost (message port)",
        latency: sw.elapsed()
      });
      sw.reset();
    }
    const results = await this._localPtyService.getLatency();
    sw.stop();
    measurements.push({
      label: "window<->ptyhostservice<->ptyhost",
      latency: sw.elapsed()
    });
    return [
      ...measurements,
      ...results
    ];
  }
  async getPerformanceMarks() {
    return this._proxy.getPerformanceMarks();
  }
  async reduceConnectionGraceTime() {
    this._proxy.reduceConnectionGraceTime();
  }
  async getDefaultSystemShell(osOverride) {
    return this._proxy.getDefaultSystemShell(osOverride);
  }
  async getProfiles(profiles, defaultProfile, includeDetectedProfiles) {
    return this._localPtyService.getProfiles(this._workspaceContextService.getWorkspace().id, profiles, defaultProfile, includeDetectedProfiles) || [];
  }
  async getEnvironment() {
    return this._proxy.getEnvironment();
  }
  async getShellEnvironment() {
    return this._shellEnvironmentService.getShellEnv();
  }
  async getWslPath(original, direction) {
    return this._proxy.getWslPath(original, direction);
  }
  async setTerminalLayoutInfo(layoutInfo) {
    const args = {
      workspaceId: this._getWorkspaceId(),
      tabs: layoutInfo ? layoutInfo.tabs : []
    };
    await this._proxy.setTerminalLayoutInfo(args);
    this._storageService.store(TerminalStorageKeys.TerminalLayoutInfo, JSON.stringify(args), StorageScope.WORKSPACE, StorageTarget.MACHINE);
  }
  async getTerminalLayoutInfo() {
    const workspaceId = this._getWorkspaceId();
    const layoutArgs = { workspaceId };
    const serializedState = this._storageService.get(TerminalStorageKeys.TerminalBufferState, StorageScope.WORKSPACE);
    const reviveBufferState = this._deserializeTerminalState(serializedState);
    if (reviveBufferState && reviveBufferState.length > 0) {
      try {
        const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
        const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
        const variableResolver = terminalEnvironment.createVariableResolver(lastActiveWorkspace, await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority), this._configurationResolverService);
        mark("code/terminal/willGetReviveEnvironments");
        await Promise.all(reviveBufferState.map((state) => new Promise((r) => {
          this._resolveEnvironmentForRevive(variableResolver, state.shellLaunchConfig).then((freshEnv) => {
            state.processLaunchConfig.env = freshEnv;
            r();
          });
        })));
        mark("code/terminal/didGetReviveEnvironments");
        mark("code/terminal/willReviveTerminalProcesses");
        await this._proxy.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
        mark("code/terminal/didReviveTerminalProcesses");
        this._storageService.remove(TerminalStorageKeys.TerminalBufferState, StorageScope.WORKSPACE);
        const layoutInfo = this._storageService.get(TerminalStorageKeys.TerminalLayoutInfo, StorageScope.WORKSPACE);
        if (layoutInfo) {
          mark("code/terminal/willSetTerminalLayoutInfo");
          await this._proxy.setTerminalLayoutInfo(JSON.parse(layoutInfo));
          mark("code/terminal/didSetTerminalLayoutInfo");
          this._storageService.remove(TerminalStorageKeys.TerminalLayoutInfo, StorageScope.WORKSPACE);
        }
      } catch (e) {
        this._logService.warn("LocalTerminalBackend#getTerminalLayoutInfo Error", e && typeof e === "object" && "message" in e ? e.message : e);
      }
    }
    return this._proxy.getTerminalLayoutInfo(layoutArgs);
  }
  async _resolveEnvironmentForRevive(variableResolver, shellLaunchConfig) {
    const platformKey = isWindows ? "windows" : isMacintosh ? "osx" : "linux";
    const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
    const baseEnv = await (shellLaunchConfig.useShellEnvironment ? this.getShellEnvironment() : this.getEnvironment());
    const env = await terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configurationService.getValue(TerminalSettingId.DetectLocale), baseEnv);
    if (shouldUseEnvironmentVariableCollection(shellLaunchConfig)) {
      const workspaceFolder = terminalEnvironment.getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
      await this._environmentVariableService.mergedCollection.applyToProcessEnvironment(env, { workspaceFolder }, variableResolver);
    }
    return env;
  }
  _getWorkspaceName() {
    return this._labelService.getWorkspaceLabel(this._workspaceContextService.getWorkspace());
  }
};
__decorateClass([
  memoize
], LocalTerminalBackend.prototype, "getEnvironment", 1);
__decorateClass([
  memoize
], LocalTerminalBackend.prototype, "getShellEnvironment", 1);
LocalTerminalBackend = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, ITerminalLogService),
  __decorateParam(3, ILocalPtyService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IShellEnvironmentService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IConfigurationResolverService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IHistoryService),
  __decorateParam(11, ITerminalProfileResolverService),
  __decorateParam(12, IEnvironmentVariableService),
  __decorateParam(13, IHistoryService),
  __decorateParam(14, INativeHostService),
  __decorateParam(15, IStatusbarService),
  __decorateParam(16, IRemoteAgentService)
], LocalTerminalBackend);
export {
  LocalTerminalBackendContribution
};
//# sourceMappingURL=localTerminalBackend.js.map
