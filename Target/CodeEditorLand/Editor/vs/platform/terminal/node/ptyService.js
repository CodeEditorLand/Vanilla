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
import { execFile, exec } from "child_process";
import { AutoOpenBarrier, ProcessTimeRunOnceScheduler, Promises, Queue, timeout } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { IProcessEnvironment, isWindows, OperatingSystem, OS } from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { getSystemShell } from "../../../base/node/shell.js";
import { ILogService, LogLevel } from "../../log/common/log.js";
import { RequestStore } from "../common/requestStore.js";
import { IProcessDataEvent, IProcessReadyEvent, IPtyService, IRawTerminalInstanceLayoutInfo, IReconnectConstants, IShellLaunchConfig, ITerminalInstanceLayoutInfoById, ITerminalLaunchError, ITerminalsLayoutInfo, ITerminalTabLayoutInfoById, TerminalIcon, IProcessProperty, TitleEventSource, ProcessPropertyType, IProcessPropertyMap, IFixedTerminalDimensions, IPersistentTerminalProcessLaunchConfig, ICrossVersionSerializedTerminalState, ISerializedTerminalState, ITerminalProcessOptions, IPtyHostLatencyMeasurement } from "../common/terminal.js";
import { TerminalDataBufferer } from "../common/terminalDataBuffering.js";
import { escapeNonWindowsPath } from "../common/terminalEnvironment.js";
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs, ITerminalTabLayoutInfoDto } from "../common/terminalProcess.js";
import { getWindowsBuildNumber } from "./terminalEnvironment.js";
import { TerminalProcess } from "./terminalProcess.js";
import { localize } from "../../../nls.js";
import { ignoreProcessNames } from "./childProcessMonitor.js";
import { TerminalAutoResponder } from "../common/terminalAutoResponder.js";
import { ErrorNoTelemetry } from "../../../base/common/errors.js";
import { ShellIntegrationAddon } from "../common/xterm/shellIntegrationAddon.js";
import { formatMessageForTerminal } from "../common/terminalStrings.js";
import { IPtyHostProcessReplayEvent } from "../common/capabilities/capabilities.js";
import { IProductService } from "../../product/common/productService.js";
import { join } from "path";
import { memoize } from "../../../base/common/decorators.js";
import * as performance from "../../../base/common/performance.js";
import pkg from "@xterm/headless";
const { Terminal: XtermTerminal } = pkg;
function traceRpc(_target, key, descriptor) {
  if (typeof descriptor.value !== "function") {
    throw new Error("not supported");
  }
  const fnKey = "value";
  const fn = descriptor.value;
  descriptor[fnKey] = async function(...args) {
    if (this.traceRpcArgs.logService.getLevel() === LogLevel.Trace) {
      this.traceRpcArgs.logService.trace(`[RPC Request] PtyService#${fn.name}(${args.map((e) => JSON.stringify(e)).join(", ")})`);
    }
    if (this.traceRpcArgs.simulatedLatency) {
      await timeout(this.traceRpcArgs.simulatedLatency);
    }
    let result;
    try {
      result = await fn.apply(this, args);
    } catch (e) {
      this.traceRpcArgs.logService.error(`[RPC Response] PtyService#${fn.name}`, e);
      throw e;
    }
    if (this.traceRpcArgs.logService.getLevel() === LogLevel.Trace) {
      this.traceRpcArgs.logService.trace(`[RPC Response] PtyService#${fn.name}`, result);
    }
    return result;
  };
}
__name(traceRpc, "traceRpc");
let SerializeAddon;
let Unicode11Addon;
class PtyService extends Disposable {
  constructor(_logService, _productService, _reconnectConstants, _simulatedLatency) {
    super();
    this._logService = _logService;
    this._productService = _productService;
    this._reconnectConstants = _reconnectConstants;
    this._simulatedLatency = _simulatedLatency;
    this._register(toDisposable(() => {
      for (const pty of this._ptys.values()) {
        pty.shutdown(true);
      }
      this._ptys.clear();
    }));
    this._detachInstanceRequestStore = this._register(new RequestStore(void 0, this._logService));
    this._detachInstanceRequestStore.onCreateRequest(this._onDidRequestDetach.fire, this._onDidRequestDetach);
  }
  static {
    __name(this, "PtyService");
  }
  _ptys = /* @__PURE__ */ new Map();
  _workspaceLayoutInfos = /* @__PURE__ */ new Map();
  _detachInstanceRequestStore;
  _revivedPtyIdMap = /* @__PURE__ */ new Map();
  _autoReplies = /* @__PURE__ */ new Map();
  _lastPtyId = 0;
  _onHeartbeat = this._register(new Emitter());
  onHeartbeat = this._traceEvent("_onHeartbeat", this._onHeartbeat.event);
  _onProcessData = this._register(new Emitter());
  onProcessData = this._traceEvent("_onProcessData", this._onProcessData.event);
  _onProcessReplay = this._register(new Emitter());
  onProcessReplay = this._traceEvent("_onProcessReplay", this._onProcessReplay.event);
  _onProcessReady = this._register(new Emitter());
  onProcessReady = this._traceEvent("_onProcessReady", this._onProcessReady.event);
  _onProcessExit = this._register(new Emitter());
  onProcessExit = this._traceEvent("_onProcessExit", this._onProcessExit.event);
  _onProcessOrphanQuestion = this._register(new Emitter());
  onProcessOrphanQuestion = this._traceEvent("_onProcessOrphanQuestion", this._onProcessOrphanQuestion.event);
  _onDidRequestDetach = this._register(new Emitter());
  onDidRequestDetach = this._traceEvent("_onDidRequestDetach", this._onDidRequestDetach.event);
  _onDidChangeProperty = this._register(new Emitter());
  onDidChangeProperty = this._traceEvent("_onDidChangeProperty", this._onDidChangeProperty.event);
  _traceEvent(name, event) {
    event((e) => {
      if (this._logService.getLevel() === LogLevel.Trace) {
        this._logService.trace(`[RPC Event] PtyService#${name}.fire(${JSON.stringify(e)})`);
      }
    });
    return event;
  }
  get traceRpcArgs() {
    return {
      logService: this._logService,
      simulatedLatency: this._simulatedLatency
    };
  }
  async refreshIgnoreProcessNames(names) {
    ignoreProcessNames.length = 0;
    ignoreProcessNames.push(...names);
  }
  async requestDetachInstance(workspaceId, instanceId) {
    return this._detachInstanceRequestStore.createRequest({ workspaceId, instanceId });
  }
  async acceptDetachInstanceReply(requestId, persistentProcessId) {
    let processDetails = void 0;
    const pty = this._ptys.get(persistentProcessId);
    if (pty) {
      processDetails = await this._buildProcessDetails(persistentProcessId, pty);
    }
    this._detachInstanceRequestStore.acceptReply(requestId, processDetails);
  }
  async freePortKillProcess(port) {
    const stdout = await new Promise((resolve, reject) => {
      exec(isWindows ? `netstat -ano | findstr "${port}"` : `lsof -nP -iTCP -sTCP:LISTEN | grep ${port}`, {}, (err, stdout2) => {
        if (err) {
          return reject("Problem occurred when listing active processes");
        }
        resolve(stdout2);
      });
    });
    const processesForPort = stdout.split(/\r?\n/).filter((s) => !!s.trim());
    if (processesForPort.length >= 1) {
      const capturePid = /\s+(\d+)(?:\s+|$)/;
      const processId = processesForPort[0].match(capturePid)?.[1];
      if (processId) {
        try {
          process.kill(Number.parseInt(processId));
        } catch {
        }
      } else {
        throw new Error(`Processes for port ${port} were not found`);
      }
      return { port, processId };
    }
    throw new Error(`Could not kill process with port ${port}`);
  }
  async serializeTerminalState(ids) {
    const promises = [];
    for (const [persistentProcessId, persistentProcess] of this._ptys.entries()) {
      if (persistentProcess.hasWrittenData && ids.indexOf(persistentProcessId) !== -1) {
        promises.push(Promises.withAsyncBody(async (r) => {
          r({
            id: persistentProcessId,
            shellLaunchConfig: persistentProcess.shellLaunchConfig,
            processDetails: await this._buildProcessDetails(persistentProcessId, persistentProcess),
            processLaunchConfig: persistentProcess.processLaunchOptions,
            unicodeVersion: persistentProcess.unicodeVersion,
            replayEvent: await persistentProcess.serializeNormalBuffer(),
            timestamp: Date.now()
          });
        }));
      }
    }
    const serialized = {
      version: 1,
      state: await Promise.all(promises)
    };
    return JSON.stringify(serialized);
  }
  async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocale) {
    const promises = [];
    for (const terminal of state) {
      promises.push(this._reviveTerminalProcess(workspaceId, terminal));
    }
    await Promise.all(promises);
  }
  async _reviveTerminalProcess(workspaceId, terminal) {
    const restoreMessage = localize("terminal-history-restored", "History restored");
    const newId = await this.createProcess(
      {
        ...terminal.shellLaunchConfig,
        cwd: terminal.processDetails.cwd,
        color: terminal.processDetails.color,
        icon: terminal.processDetails.icon,
        name: terminal.processDetails.titleSource === TitleEventSource.Api ? terminal.processDetails.title : void 0,
        initialText: terminal.replayEvent.events[0].data + formatMessageForTerminal(restoreMessage, { loudFormatting: true })
      },
      terminal.processDetails.cwd,
      terminal.replayEvent.events[0].cols,
      terminal.replayEvent.events[0].rows,
      terminal.unicodeVersion,
      terminal.processLaunchConfig.env,
      terminal.processLaunchConfig.executableEnv,
      terminal.processLaunchConfig.options,
      true,
      terminal.processDetails.workspaceId,
      terminal.processDetails.workspaceName,
      true,
      terminal.replayEvent.events[0].data
    );
    const oldId = this._getRevivingProcessId(workspaceId, terminal.id);
    this._revivedPtyIdMap.set(oldId, { newId, state: terminal });
    this._logService.info(`Revived process, old id ${oldId} -> new id ${newId}`);
  }
  async shutdownAll() {
    this.dispose();
  }
  async createProcess(shellLaunchConfig, cwd, cols, rows, unicodeVersion, env, executableEnv, options, shouldPersist, workspaceId, workspaceName, isReviving, rawReviveBuffer) {
    if (shellLaunchConfig.attachPersistentProcess) {
      throw new Error("Attempt to create a process when attach object was provided");
    }
    const id = ++this._lastPtyId;
    const process2 = new TerminalProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, options, this._logService, this._productService);
    const processLaunchOptions = {
      env,
      executableEnv,
      options
    };
    const persistentProcess = new PersistentTerminalProcess(id, process2, workspaceId, workspaceName, shouldPersist, cols, rows, processLaunchOptions, unicodeVersion, this._reconnectConstants, this._logService, isReviving && typeof shellLaunchConfig.initialText === "string" ? shellLaunchConfig.initialText : void 0, rawReviveBuffer, shellLaunchConfig.icon, shellLaunchConfig.color, shellLaunchConfig.name, shellLaunchConfig.fixedDimensions);
    process2.onProcessExit((event) => {
      persistentProcess.dispose();
      this._ptys.delete(id);
      this._onProcessExit.fire({ id, event });
    });
    persistentProcess.onProcessData((event) => this._onProcessData.fire({ id, event }));
    persistentProcess.onProcessReplay((event) => this._onProcessReplay.fire({ id, event }));
    persistentProcess.onProcessReady((event) => this._onProcessReady.fire({ id, event }));
    persistentProcess.onProcessOrphanQuestion(() => this._onProcessOrphanQuestion.fire({ id }));
    persistentProcess.onDidChangeProperty((property) => this._onDidChangeProperty.fire({ id, property }));
    persistentProcess.onPersistentProcessReady(() => {
      for (const e of this._autoReplies.entries()) {
        persistentProcess.installAutoReply(e[0], e[1]);
      }
    });
    this._ptys.set(id, persistentProcess);
    return id;
  }
  async attachToProcess(id) {
    try {
      await this._throwIfNoPty(id).attach();
      this._logService.info(`Persistent process reconnection "${id}"`);
    } catch (e) {
      this._logService.warn(`Persistent process reconnection "${id}" failed`, e.message);
      throw e;
    }
  }
  async updateTitle(id, title, titleSource) {
    this._throwIfNoPty(id).setTitle(title, titleSource);
  }
  async updateIcon(id, userInitiated, icon, color) {
    this._throwIfNoPty(id).setIcon(userInitiated, icon, color);
  }
  async clearBuffer(id) {
    this._throwIfNoPty(id).clearBuffer();
  }
  async refreshProperty(id, type) {
    return this._throwIfNoPty(id).refreshProperty(type);
  }
  async updateProperty(id, type, value) {
    return this._throwIfNoPty(id).updateProperty(type, value);
  }
  async detachFromProcess(id, forcePersist) {
    return this._throwIfNoPty(id).detach(forcePersist);
  }
  async reduceConnectionGraceTime() {
    for (const pty of this._ptys.values()) {
      pty.reduceGraceTime();
    }
  }
  async listProcesses() {
    const persistentProcesses = Array.from(this._ptys.entries()).filter(([_, pty]) => pty.shouldPersistTerminal);
    this._logService.info(`Listing ${persistentProcesses.length} persistent terminals, ${this._ptys.size} total terminals`);
    const promises = persistentProcesses.map(async ([id, terminalProcessData]) => this._buildProcessDetails(id, terminalProcessData));
    const allTerminals = await Promise.all(promises);
    return allTerminals.filter((entry) => entry.isOrphan);
  }
  async getPerformanceMarks() {
    return performance.getMarks();
  }
  async start(id) {
    const pty = this._ptys.get(id);
    return pty ? pty.start() : { message: `Could not find pty with id "${id}"` };
  }
  async shutdown(id, immediate) {
    return this._ptys.get(id)?.shutdown(immediate);
  }
  async input(id, data) {
    return this._throwIfNoPty(id).input(data);
  }
  async processBinary(id, data) {
    return this._throwIfNoPty(id).writeBinary(data);
  }
  async resize(id, cols, rows) {
    return this._throwIfNoPty(id).resize(cols, rows);
  }
  async getInitialCwd(id) {
    return this._throwIfNoPty(id).getInitialCwd();
  }
  async getCwd(id) {
    return this._throwIfNoPty(id).getCwd();
  }
  async acknowledgeDataEvent(id, charCount) {
    return this._throwIfNoPty(id).acknowledgeDataEvent(charCount);
  }
  async setUnicodeVersion(id, version) {
    return this._throwIfNoPty(id).setUnicodeVersion(version);
  }
  async getLatency() {
    return [];
  }
  async orphanQuestionReply(id) {
    return this._throwIfNoPty(id).orphanQuestionReply();
  }
  async installAutoReply(match, reply) {
    this._autoReplies.set(match, reply);
    for (const p of this._ptys.values()) {
      p.installAutoReply(match, reply);
    }
  }
  async uninstallAllAutoReplies() {
    for (const match of this._autoReplies.keys()) {
      for (const p of this._ptys.values()) {
        p.uninstallAutoReply(match);
      }
    }
  }
  async uninstallAutoReply(match) {
    for (const p of this._ptys.values()) {
      p.uninstallAutoReply(match);
    }
  }
  async getDefaultSystemShell(osOverride = OS) {
    return getSystemShell(osOverride, process.env);
  }
  async getEnvironment() {
    return { ...process.env };
  }
  async getWslPath(original, direction) {
    if (direction === "win-to-unix") {
      if (!isWindows) {
        return original;
      }
      if (getWindowsBuildNumber() < 17063) {
        return original.replace(/\\/g, "/");
      }
      const wslExecutable = this._getWSLExecutablePath();
      if (!wslExecutable) {
        return original;
      }
      return new Promise((c) => {
        const proc = execFile(wslExecutable, ["-e", "wslpath", original], {}, (error, stdout, stderr) => {
          c(error ? original : escapeNonWindowsPath(stdout.trim()));
        });
        proc.stdin.end();
      });
    }
    if (direction === "unix-to-win") {
      if (isWindows) {
        if (getWindowsBuildNumber() < 17063) {
          return original;
        }
        const wslExecutable = this._getWSLExecutablePath();
        if (!wslExecutable) {
          return original;
        }
        return new Promise((c) => {
          const proc = execFile(wslExecutable, ["-e", "wslpath", "-w", original], {}, (error, stdout, stderr) => {
            c(error ? original : stdout.trim());
          });
          proc.stdin.end();
        });
      }
    }
    return original;
  }
  _getWSLExecutablePath() {
    const useWSLexe = getWindowsBuildNumber() >= 16299;
    const is32ProcessOn64Windows = process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
    const systemRoot = process.env["SystemRoot"];
    if (systemRoot) {
      return join(systemRoot, is32ProcessOn64Windows ? "Sysnative" : "System32", useWSLexe ? "wsl.exe" : "bash.exe");
    }
    return void 0;
  }
  async getRevivedPtyNewId(workspaceId, id) {
    try {
      return this._revivedPtyIdMap.get(this._getRevivingProcessId(workspaceId, id))?.newId;
    } catch (e) {
      this._logService.warn(`Couldn't find terminal ID ${workspaceId}-${id}`, e.message);
    }
    return void 0;
  }
  async setTerminalLayoutInfo(args) {
    this._workspaceLayoutInfos.set(args.workspaceId, args);
  }
  async getTerminalLayoutInfo(args) {
    performance.mark("code/willGetTerminalLayoutInfo");
    const layout = this._workspaceLayoutInfos.get(args.workspaceId);
    if (layout) {
      const doneSet = /* @__PURE__ */ new Set();
      const expandedTabs = await Promise.all(layout.tabs.map(async (tab) => this._expandTerminalTab(args.workspaceId, tab, doneSet)));
      const tabs = expandedTabs.filter((t) => t.terminals.length > 0);
      performance.mark("code/didGetTerminalLayoutInfo");
      return { tabs };
    }
    performance.mark("code/didGetTerminalLayoutInfo");
    return void 0;
  }
  async _expandTerminalTab(workspaceId, tab, doneSet) {
    const expandedTerminals = await Promise.all(tab.terminals.map((t) => this._expandTerminalInstance(workspaceId, t, doneSet)));
    const filtered = expandedTerminals.filter((term) => term.terminal !== null);
    return {
      isActive: tab.isActive,
      activePersistentProcessId: tab.activePersistentProcessId,
      terminals: filtered
    };
  }
  async _expandTerminalInstance(workspaceId, t, doneSet) {
    try {
      const oldId = this._getRevivingProcessId(workspaceId, t.terminal);
      const revivedPtyId = this._revivedPtyIdMap.get(oldId)?.newId;
      this._logService.info(`Expanding terminal instance, old id ${oldId} -> new id ${revivedPtyId}`);
      this._revivedPtyIdMap.delete(oldId);
      const persistentProcessId = revivedPtyId ?? t.terminal;
      if (doneSet.has(persistentProcessId)) {
        throw new Error(`Terminal ${persistentProcessId} has already been expanded`);
      }
      doneSet.add(persistentProcessId);
      const persistentProcess = this._throwIfNoPty(persistentProcessId);
      const processDetails = persistentProcess && await this._buildProcessDetails(t.terminal, persistentProcess, revivedPtyId !== void 0);
      return {
        terminal: { ...processDetails, id: persistentProcessId },
        relativeSize: t.relativeSize
      };
    } catch (e) {
      this._logService.warn(`Couldn't get layout info, a terminal was probably disconnected`, e.message);
      this._logService.debug("Reattach to wrong terminal debug info - layout info by id", t);
      this._logService.debug("Reattach to wrong terminal debug info - _revivePtyIdMap", Array.from(this._revivedPtyIdMap.values()));
      this._logService.debug("Reattach to wrong terminal debug info - _ptys ids", Array.from(this._ptys.keys()));
      return {
        terminal: null,
        relativeSize: t.relativeSize
      };
    }
  }
  _getRevivingProcessId(workspaceId, ptyId) {
    return `${workspaceId}-${ptyId}`;
  }
  async _buildProcessDetails(id, persistentProcess, wasRevived = false) {
    performance.mark(`code/willBuildProcessDetails/${id}`);
    const [cwd, isOrphan] = await Promise.all([persistentProcess.getCwd(), wasRevived ? true : persistentProcess.isOrphaned()]);
    const result = {
      id,
      title: persistentProcess.title,
      titleSource: persistentProcess.titleSource,
      pid: persistentProcess.pid,
      workspaceId: persistentProcess.workspaceId,
      workspaceName: persistentProcess.workspaceName,
      cwd,
      isOrphan,
      icon: persistentProcess.icon,
      color: persistentProcess.color,
      fixedDimensions: persistentProcess.fixedDimensions,
      environmentVariableCollections: persistentProcess.processLaunchOptions.options.environmentVariableCollections,
      reconnectionProperties: persistentProcess.shellLaunchConfig.reconnectionProperties,
      waitOnExit: persistentProcess.shellLaunchConfig.waitOnExit,
      hideFromUser: persistentProcess.shellLaunchConfig.hideFromUser,
      isFeatureTerminal: persistentProcess.shellLaunchConfig.isFeatureTerminal,
      type: persistentProcess.shellLaunchConfig.type,
      hasChildProcesses: persistentProcess.hasChildProcesses,
      shellIntegrationNonce: persistentProcess.processLaunchOptions.options.shellIntegration.nonce
    };
    performance.mark(`code/didBuildProcessDetails/${id}`);
    return result;
  }
  _throwIfNoPty(id) {
    const pty = this._ptys.get(id);
    if (!pty) {
      throw new ErrorNoTelemetry(`Could not find pty ${id} on pty host`);
    }
    return pty;
  }
}
__decorateClass([
  memoize
], PtyService.prototype, "traceRpcArgs", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "refreshIgnoreProcessNames", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "requestDetachInstance", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "acceptDetachInstanceReply", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "freePortKillProcess", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "serializeTerminalState", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "reviveTerminalProcesses", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "shutdownAll", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "createProcess", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "attachToProcess", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "updateTitle", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "updateIcon", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "clearBuffer", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "refreshProperty", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "updateProperty", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "detachFromProcess", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "reduceConnectionGraceTime", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "listProcesses", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getPerformanceMarks", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "start", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "shutdown", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "input", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "processBinary", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "resize", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getInitialCwd", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getCwd", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "acknowledgeDataEvent", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "setUnicodeVersion", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getLatency", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "orphanQuestionReply", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "installAutoReply", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "uninstallAllAutoReplies", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "uninstallAutoReply", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getDefaultSystemShell", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getEnvironment", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getWslPath", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getRevivedPtyNewId", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "setTerminalLayoutInfo", 1);
__decorateClass([
  traceRpc
], PtyService.prototype, "getTerminalLayoutInfo", 1);
var InteractionState = /* @__PURE__ */ ((InteractionState2) => {
  InteractionState2["None"] = "None";
  InteractionState2["ReplayOnly"] = "ReplayOnly";
  InteractionState2["Session"] = "Session";
  return InteractionState2;
})(InteractionState || {});
class PersistentTerminalProcess extends Disposable {
  constructor(_persistentProcessId, _terminalProcess, workspaceId, workspaceName, shouldPersistTerminal, cols, rows, processLaunchOptions, unicodeVersion, reconnectConstants, _logService, reviveBuffer, rawReviveBuffer, _icon, _color, name, fixedDimensions) {
    super();
    this._persistentProcessId = _persistentProcessId;
    this._terminalProcess = _terminalProcess;
    this.workspaceId = workspaceId;
    this.workspaceName = workspaceName;
    this.shouldPersistTerminal = shouldPersistTerminal;
    this.processLaunchOptions = processLaunchOptions;
    this.unicodeVersion = unicodeVersion;
    this._logService = _logService;
    this._icon = _icon;
    this._color = _color;
    this._interactionState = new MutationLogger(`Persistent process "${this._persistentProcessId}" interaction state`, "None" /* None */, this._logService);
    this._wasRevived = reviveBuffer !== void 0;
    this._serializer = new XtermSerializer(
      cols,
      rows,
      reconnectConstants.scrollback,
      unicodeVersion,
      reviveBuffer,
      processLaunchOptions.options.shellIntegration.nonce,
      shouldPersistTerminal ? rawReviveBuffer : void 0,
      this._logService
    );
    if (name) {
      this.setTitle(name, TitleEventSource.Api);
    }
    this._fixedDimensions = fixedDimensions;
    this._orphanQuestionBarrier = null;
    this._orphanQuestionReplyTime = 0;
    this._disconnectRunner1 = this._register(new ProcessTimeRunOnceScheduler(() => {
      this._logService.info(`Persistent process "${this._persistentProcessId}": The reconnection grace time of ${printTime(reconnectConstants.graceTime)} has expired, shutting down pid "${this._pid}"`);
      this.shutdown(true);
    }, reconnectConstants.graceTime));
    this._disconnectRunner2 = this._register(new ProcessTimeRunOnceScheduler(() => {
      this._logService.info(`Persistent process "${this._persistentProcessId}": The short reconnection grace time of ${printTime(reconnectConstants.shortGraceTime)} has expired, shutting down pid ${this._pid}`);
      this.shutdown(true);
    }, reconnectConstants.shortGraceTime));
    this._register(this._terminalProcess.onProcessExit(() => this._bufferer.stopBuffering(this._persistentProcessId)));
    this._register(this._terminalProcess.onProcessReady((e) => {
      this._pid = e.pid;
      this._cwd = e.cwd;
      this._onProcessReady.fire(e);
    }));
    this._register(this._terminalProcess.onDidChangeProperty((e) => {
      this._onDidChangeProperty.fire(e);
    }));
    this._bufferer = new TerminalDataBufferer((_, data) => this._onProcessData.fire(data));
    this._register(this._bufferer.startBuffering(this._persistentProcessId, this._terminalProcess.onProcessData));
    this._register(this.onProcessData((e) => this._serializer.handleData(e)));
    this._register(toDisposable(() => {
      for (const e of this._autoReplies.values()) {
        e.dispose();
      }
      this._autoReplies.clear();
    }));
  }
  static {
    __name(this, "PersistentTerminalProcess");
  }
  _bufferer;
  _autoReplies = /* @__PURE__ */ new Map();
  _pendingCommands = /* @__PURE__ */ new Map();
  _isStarted = false;
  _interactionState;
  _orphanQuestionBarrier;
  _orphanQuestionReplyTime;
  _orphanRequestQueue = new Queue();
  _disconnectRunner1;
  _disconnectRunner2;
  _onProcessReplay = this._register(new Emitter());
  onProcessReplay = this._onProcessReplay.event;
  _onProcessReady = this._register(new Emitter());
  onProcessReady = this._onProcessReady.event;
  _onPersistentProcessReady = this._register(new Emitter());
  /** Fired when the persistent process has a ready process and has finished its replay. */
  onPersistentProcessReady = this._onPersistentProcessReady.event;
  _onProcessData = this._register(new Emitter());
  onProcessData = this._onProcessData.event;
  _onProcessOrphanQuestion = this._register(new Emitter());
  onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
  _onDidChangeProperty = this._register(new Emitter());
  onDidChangeProperty = this._onDidChangeProperty.event;
  _inReplay = false;
  _pid = -1;
  _cwd = "";
  _title;
  _titleSource = TitleEventSource.Process;
  _serializer;
  _wasRevived;
  _fixedDimensions;
  get pid() {
    return this._pid;
  }
  get shellLaunchConfig() {
    return this._terminalProcess.shellLaunchConfig;
  }
  get hasWrittenData() {
    return this._interactionState.value !== "None" /* None */;
  }
  get title() {
    return this._title || this._terminalProcess.currentTitle;
  }
  get titleSource() {
    return this._titleSource;
  }
  get icon() {
    return this._icon;
  }
  get color() {
    return this._color;
  }
  get fixedDimensions() {
    return this._fixedDimensions;
  }
  get hasChildProcesses() {
    return this._terminalProcess.hasChildProcesses;
  }
  setTitle(title, titleSource) {
    if (titleSource === TitleEventSource.Api) {
      this._interactionState.setValue("Session" /* Session */, "setTitle");
      this._serializer.freeRawReviveBuffer();
    }
    this._title = title;
    this._titleSource = titleSource;
  }
  setIcon(userInitiated, icon, color) {
    if (!this._icon || "id" in icon && "id" in this._icon && icon.id !== this._icon.id || !this.color || color !== this._color) {
      this._serializer.freeRawReviveBuffer();
      if (userInitiated) {
        this._interactionState.setValue("Session" /* Session */, "setIcon");
      }
    }
    this._icon = icon;
    this._color = color;
  }
  _setFixedDimensions(fixedDimensions) {
    this._fixedDimensions = fixedDimensions;
  }
  async attach() {
    if (!this._disconnectRunner1.isScheduled() && !this._disconnectRunner2.isScheduled()) {
      this._logService.warn(`Persistent process "${this._persistentProcessId}": Process had no disconnect runners but was an orphan`);
    }
    this._disconnectRunner1.cancel();
    this._disconnectRunner2.cancel();
  }
  async detach(forcePersist) {
    if (this.shouldPersistTerminal && (this._interactionState.value !== "None" /* None */ || forcePersist)) {
      this._disconnectRunner1.schedule();
    } else {
      this.shutdown(true);
    }
  }
  serializeNormalBuffer() {
    return this._serializer.generateReplayEvent(true, this._interactionState.value !== "Session" /* Session */);
  }
  async refreshProperty(type) {
    return this._terminalProcess.refreshProperty(type);
  }
  async updateProperty(type, value) {
    if (type === ProcessPropertyType.FixedDimensions) {
      return this._setFixedDimensions(value);
    }
  }
  async start() {
    if (!this._isStarted) {
      const result = await this._terminalProcess.start();
      if (result && "message" in result) {
        return result;
      }
      this._isStarted = true;
      if (this._wasRevived) {
        this.triggerReplay();
      } else {
        this._onPersistentProcessReady.fire();
      }
      return result;
    }
    this._onProcessReady.fire({ pid: this._pid, cwd: this._cwd, windowsPty: this._terminalProcess.getWindowsPty() });
    this._onDidChangeProperty.fire({ type: ProcessPropertyType.Title, value: this._terminalProcess.currentTitle });
    this._onDidChangeProperty.fire({ type: ProcessPropertyType.ShellType, value: this._terminalProcess.shellType });
    this.triggerReplay();
    return void 0;
  }
  shutdown(immediate) {
    return this._terminalProcess.shutdown(immediate);
  }
  input(data) {
    this._interactionState.setValue("Session" /* Session */, "input");
    this._serializer.freeRawReviveBuffer();
    if (this._inReplay) {
      return;
    }
    for (const listener of this._autoReplies.values()) {
      listener.handleInput();
    }
    return this._terminalProcess.input(data);
  }
  writeBinary(data) {
    return this._terminalProcess.processBinary(data);
  }
  resize(cols, rows) {
    if (this._inReplay) {
      return;
    }
    this._serializer.handleResize(cols, rows);
    this._bufferer.flushBuffer(this._persistentProcessId);
    for (const listener of this._autoReplies.values()) {
      listener.handleResize();
    }
    return this._terminalProcess.resize(cols, rows);
  }
  async clearBuffer() {
    this._serializer.clearBuffer();
    this._terminalProcess.clearBuffer();
  }
  setUnicodeVersion(version) {
    this.unicodeVersion = version;
    this._serializer.setUnicodeVersion?.(version);
  }
  acknowledgeDataEvent(charCount) {
    if (this._inReplay) {
      return;
    }
    return this._terminalProcess.acknowledgeDataEvent(charCount);
  }
  getInitialCwd() {
    return this._terminalProcess.getInitialCwd();
  }
  getCwd() {
    return this._terminalProcess.getCwd();
  }
  async triggerReplay() {
    if (this._interactionState.value === "None" /* None */) {
      this._interactionState.setValue("ReplayOnly" /* ReplayOnly */, "triggerReplay");
    }
    const ev = await this._serializer.generateReplayEvent();
    let dataLength = 0;
    for (const e of ev.events) {
      dataLength += e.data.length;
    }
    this._logService.info(`Persistent process "${this._persistentProcessId}": Replaying ${dataLength} chars and ${ev.events.length} size events`);
    this._onProcessReplay.fire(ev);
    this._terminalProcess.clearUnacknowledgedChars();
    this._onPersistentProcessReady.fire();
  }
  installAutoReply(match, reply) {
    this._autoReplies.get(match)?.dispose();
    this._autoReplies.set(match, new TerminalAutoResponder(this._terminalProcess, match, reply, this._logService));
  }
  uninstallAutoReply(match) {
    const autoReply = this._autoReplies.get(match);
    autoReply?.dispose();
    this._autoReplies.delete(match);
  }
  sendCommandResult(reqId, isError, serializedPayload) {
    const data = this._pendingCommands.get(reqId);
    if (!data) {
      return;
    }
    this._pendingCommands.delete(reqId);
  }
  orphanQuestionReply() {
    this._orphanQuestionReplyTime = Date.now();
    if (this._orphanQuestionBarrier) {
      const barrier = this._orphanQuestionBarrier;
      this._orphanQuestionBarrier = null;
      barrier.open();
    }
  }
  reduceGraceTime() {
    if (this._disconnectRunner2.isScheduled()) {
      return;
    }
    if (this._disconnectRunner1.isScheduled()) {
      this._disconnectRunner2.schedule();
    }
  }
  async isOrphaned() {
    return await this._orphanRequestQueue.queue(async () => this._isOrphaned());
  }
  async _isOrphaned() {
    if (this._disconnectRunner1.isScheduled() || this._disconnectRunner2.isScheduled()) {
      return true;
    }
    if (!this._orphanQuestionBarrier) {
      this._orphanQuestionBarrier = new AutoOpenBarrier(4e3);
      this._orphanQuestionReplyTime = 0;
      this._onProcessOrphanQuestion.fire();
    }
    await this._orphanQuestionBarrier.wait();
    return Date.now() - this._orphanQuestionReplyTime > 500;
  }
}
class MutationLogger {
  constructor(_name, _value, _logService) {
    this._name = _name;
    this._value = _value;
    this._logService = _logService;
    this._log("initialized");
  }
  static {
    __name(this, "MutationLogger");
  }
  get value() {
    return this._value;
  }
  setValue(value, reason) {
    if (this._value !== value) {
      this._value = value;
      this._log(reason);
    }
  }
  _log(reason) {
    this._logService.debug(`MutationLogger "${this._name}" set to "${this._value}", reason: ${reason}`);
  }
}
class XtermSerializer {
  constructor(cols, rows, scrollback, unicodeVersion, reviveBufferWithRestoreMessage, shellIntegrationNonce, _rawReviveBuffer, logService) {
    this._rawReviveBuffer = _rawReviveBuffer;
    this._xterm = new XtermTerminal({
      cols,
      rows,
      scrollback,
      allowProposedApi: true
    });
    if (reviveBufferWithRestoreMessage) {
      this._xterm.writeln(reviveBufferWithRestoreMessage);
    }
    this.setUnicodeVersion(unicodeVersion);
    this._shellIntegrationAddon = new ShellIntegrationAddon(shellIntegrationNonce, true, void 0, logService);
    this._xterm.loadAddon(this._shellIntegrationAddon);
  }
  static {
    __name(this, "XtermSerializer");
  }
  _xterm;
  _shellIntegrationAddon;
  _unicodeAddon;
  freeRawReviveBuffer() {
    this._rawReviveBuffer = void 0;
  }
  handleData(data) {
    this._xterm.write(data);
  }
  handleResize(cols, rows) {
    this._xterm.resize(cols, rows);
  }
  clearBuffer() {
    this._xterm.clear();
  }
  async generateReplayEvent(normalBufferOnly, restoreToLastReviveBuffer) {
    const serialize = new (await this._getSerializeConstructor())();
    this._xterm.loadAddon(serialize);
    const options = {
      scrollback: this._xterm.options.scrollback
    };
    if (normalBufferOnly) {
      options.excludeAltBuffer = true;
      options.excludeModes = true;
    }
    let serialized;
    if (restoreToLastReviveBuffer && this._rawReviveBuffer) {
      serialized = this._rawReviveBuffer;
    } else {
      serialized = serialize.serialize(options);
    }
    return {
      events: [
        {
          cols: this._xterm.cols,
          rows: this._xterm.rows,
          data: serialized
        }
      ],
      commands: this._shellIntegrationAddon.serialize()
    };
  }
  async setUnicodeVersion(version) {
    if (this._xterm.unicode.activeVersion === version) {
      return;
    }
    if (version === "11") {
      this._unicodeAddon = new (await this._getUnicode11Constructor())();
      this._xterm.loadAddon(this._unicodeAddon);
    } else {
      this._unicodeAddon?.dispose();
      this._unicodeAddon = void 0;
    }
    this._xterm.unicode.activeVersion = version;
  }
  async _getUnicode11Constructor() {
    if (!Unicode11Addon) {
      Unicode11Addon = (await import("@xterm/addon-unicode11")).Unicode11Addon;
    }
    return Unicode11Addon;
  }
  async _getSerializeConstructor() {
    if (!SerializeAddon) {
      SerializeAddon = (await import("@xterm/addon-serialize")).SerializeAddon;
    }
    return SerializeAddon;
  }
}
function printTime(ms) {
  let h = 0;
  let m = 0;
  let s = 0;
  if (ms >= 1e3) {
    s = Math.floor(ms / 1e3);
    ms -= s * 1e3;
  }
  if (s >= 60) {
    m = Math.floor(s / 60);
    s -= m * 60;
  }
  if (m >= 60) {
    h = Math.floor(m / 60);
    m -= h * 60;
  }
  const _h = h ? `${h}h` : ``;
  const _m = m ? `${m}m` : ``;
  const _s = s ? `${s}s` : ``;
  const _ms = ms ? `${ms}ms` : ``;
  return `${_h}${_m}${_s}${_ms}`;
}
__name(printTime, "printTime");
export {
  PtyService,
  traceRpc
};
//# sourceMappingURL=ptyService.js.map
