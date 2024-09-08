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
import { StringDecoder } from "string_decoder";
import {
  MessageChannelMain,
  app,
  utilityProcess
} from "electron";
import { timeout } from "../../../base/common/async.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { FileAccess } from "../../../base/common/network.js";
import { deepClone } from "../../../base/common/objects.js";
import { isWindows } from "../../../base/common/platform.js";
import { removeDangerousEnvVariables } from "../../../base/common/processes.js";
import Severity from "../../../base/common/severity.js";
import { upcast } from "../../../base/common/types.js";
import {
  getUNCHostAllowlist,
  isUNCAccessRestrictionsDisabled
} from "../../../base/node/unc.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
function isWindowUtilityProcessConfiguration(config) {
  const candidate = config;
  return typeof candidate.responseWindowId === "number";
}
let UtilityProcess = class extends Disposable {
  constructor(logService, telemetryService, lifecycleMainService) {
    super();
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.lifecycleMainService = lifecycleMainService;
  }
  static ID_COUNTER = 0;
  static all = /* @__PURE__ */ new Map();
  static getAll() {
    return Array.from(UtilityProcess.all.values());
  }
  id = String(++UtilityProcess.ID_COUNTER);
  _onStdout = this._register(new Emitter());
  onStdout = this._onStdout.event;
  _onStderr = this._register(new Emitter());
  onStderr = this._onStderr.event;
  _onMessage = this._register(new Emitter());
  onMessage = this._onMessage.event;
  _onSpawn = this._register(
    new Emitter()
  );
  onSpawn = this._onSpawn.event;
  _onExit = this._register(
    new Emitter()
  );
  onExit = this._onExit.event;
  _onCrash = this._register(
    new Emitter()
  );
  onCrash = this._onCrash.event;
  process = void 0;
  processPid = void 0;
  configuration = void 0;
  killed = false;
  log(msg, severity) {
    let logMsg;
    if (this.configuration?.correlationId) {
      logMsg = `[UtilityProcess id: ${this.configuration?.correlationId}, type: ${this.configuration?.type}, pid: ${this.processPid ?? "<none>"}]: ${msg}`;
    } else {
      logMsg = `[UtilityProcess type: ${this.configuration?.type}, pid: ${this.processPid ?? "<none>"}]: ${msg}`;
    }
    switch (severity) {
      case Severity.Error:
        this.logService.error(logMsg);
        break;
      case Severity.Warning:
        this.logService.warn(logMsg);
        break;
      case Severity.Info:
        this.logService.trace(logMsg);
        break;
    }
  }
  validateCanStart() {
    if (this.process) {
      this.log(
        "Cannot start utility process because it is already running...",
        Severity.Error
      );
      return false;
    }
    return true;
  }
  start(configuration) {
    const started = this.doStart(configuration);
    if (started && configuration.payload) {
      const posted = this.postMessage(configuration.payload);
      if (posted) {
        this.log("payload sent via postMessage()", Severity.Info);
      }
    }
    return started;
  }
  doStart(configuration) {
    if (!this.validateCanStart()) {
      return false;
    }
    this.configuration = configuration;
    const serviceName = `${this.configuration.type}-${this.id}`;
    const modulePath = FileAccess.asFileUri("bootstrap-fork.js").fsPath;
    const args = this.configuration.args ?? [];
    const execArgv = this.configuration.execArgv ?? [];
    const allowLoadingUnsignedLibraries = this.configuration.allowLoadingUnsignedLibraries;
    const forceAllocationsToV8Sandbox = this.configuration.forceAllocationsToV8Sandbox;
    const respondToAuthRequestsFromMainProcess = this.configuration.respondToAuthRequestsFromMainProcess;
    const stdio = "pipe";
    const env = this.createEnv(configuration);
    this.log("creating new...", Severity.Info);
    this.process = utilityProcess.fork(
      modulePath,
      args,
      upcast({
        serviceName,
        env,
        execArgv,
        allowLoadingUnsignedLibraries,
        forceAllocationsToV8Sandbox,
        respondToAuthRequestsFromMainProcess,
        stdio
      })
    );
    this.registerListeners(this.process, this.configuration, serviceName);
    return true;
  }
  createEnv(configuration) {
    const env = configuration.env ? { ...configuration.env } : { ...deepClone(process.env) };
    env["VSCODE_AMD_ENTRYPOINT"] = configuration.entryPoint;
    if (typeof configuration.parentLifecycleBound === "number") {
      env["VSCODE_PARENT_PID"] = String(
        configuration.parentLifecycleBound
      );
    }
    env["VSCODE_CRASH_REPORTER_PROCESS_TYPE"] = configuration.type;
    if (isWindows) {
      if (isUNCAccessRestrictionsDisabled()) {
        env["NODE_DISABLE_UNC_ACCESS_CHECKS"] = "1";
      } else {
        env["NODE_UNC_HOST_ALLOWLIST"] = getUNCHostAllowlist().join("\\");
      }
    }
    removeDangerousEnvVariables(env);
    for (const key of Object.keys(env)) {
      env[key] = String(env[key]);
    }
    return env;
  }
  registerListeners(process2, configuration, serviceName) {
    if (process2.stdout) {
      const stdoutDecoder = new StringDecoder("utf-8");
      this._register(
        Event.fromNodeEventEmitter(
          process2.stdout,
          "data"
        )(
          (chunk) => this._onStdout.fire(
            typeof chunk === "string" ? chunk : stdoutDecoder.write(chunk)
          )
        )
      );
    }
    if (process2.stderr) {
      const stderrDecoder = new StringDecoder("utf-8");
      this._register(
        Event.fromNodeEventEmitter(
          process2.stderr,
          "data"
        )(
          (chunk) => this._onStderr.fire(
            typeof chunk === "string" ? chunk : stderrDecoder.write(chunk)
          )
        )
      );
    }
    this._register(
      Event.fromNodeEventEmitter(
        process2,
        "message"
      )((msg) => this._onMessage.fire(msg))
    );
    this._register(
      Event.fromNodeEventEmitter(
        process2,
        "spawn"
      )(() => {
        this.processPid = process2.pid;
        if (typeof process2.pid === "number") {
          UtilityProcess.all.set(process2.pid, {
            pid: process2.pid,
            name: isWindowUtilityProcessConfiguration(configuration) ? `${configuration.type} [${configuration.responseWindowId}]` : configuration.type
          });
        }
        this.log("successfully created", Severity.Info);
        this._onSpawn.fire(process2.pid);
      })
    );
    this._register(
      Event.fromNodeEventEmitter(
        process2,
        "exit"
      )((code) => {
        const normalizedCode = this.isNormalExit(code) ? 0 : code;
        this.log(
          `received exit event with code ${normalizedCode}`,
          Severity.Info
        );
        this._onExit.fire({
          pid: this.processPid,
          code: normalizedCode,
          signal: "unknown"
        });
        this.onDidExitOrCrashOrKill();
      })
    );
    this._register(
      Event.fromNodeEventEmitter(
        app,
        "child-process-gone",
        (event, details) => ({ event, details })
      )(({ details }) => {
        if (details.type === "Utility" && details.name === serviceName && !this.isNormalExit(details.exitCode)) {
          this.log(
            `crashed with code ${details.exitCode} and reason '${details.reason}'`,
            Severity.Error
          );
          this.telemetryService.publicLog2("utilityprocesscrash", {
            type: configuration.type,
            reason: details.reason,
            code: details.exitCode
          });
          this._onCrash.fire({
            pid: this.processPid,
            code: details.exitCode,
            reason: details.reason
          });
          this.onDidExitOrCrashOrKill();
        }
      })
    );
  }
  once(message, callback) {
    const disposable = this._register(
      this._onMessage.event((msg) => {
        if (msg === message) {
          disposable.dispose();
          callback();
        }
      })
    );
  }
  postMessage(message, transfer) {
    if (!this.process) {
      return false;
    }
    this.process.postMessage(message, transfer);
    return true;
  }
  connect(payload) {
    const { port1: outPort, port2: utilityProcessPort } = new MessageChannelMain();
    this.postMessage(payload, [utilityProcessPort]);
    return outPort;
  }
  enableInspectPort() {
    if (!this.process || typeof this.processPid !== "number") {
      return false;
    }
    this.log("enabling inspect port", Severity.Info);
    const processExt = process;
    if (typeof processExt._debugProcess === "function") {
      processExt._debugProcess(this.processPid);
      return true;
    }
    return false;
  }
  kill() {
    if (!this.process) {
      return;
    }
    this.log("attempting to kill the process...", Severity.Info);
    const killed = this.process.kill();
    if (killed) {
      this.log("successfully killed the process", Severity.Info);
      this.killed = true;
      this.onDidExitOrCrashOrKill();
    } else {
      this.log("unable to kill the process", Severity.Warning);
    }
  }
  isNormalExit(exitCode) {
    if (exitCode === 0) {
      return true;
    }
    return this.killed && exitCode === 15;
  }
  onDidExitOrCrashOrKill() {
    if (typeof this.processPid === "number") {
      UtilityProcess.all.delete(this.processPid);
    }
    this.process = void 0;
  }
  async waitForExit(maxWaitTimeMs) {
    if (!this.process) {
      return;
    }
    this.log("waiting to exit...", Severity.Info);
    await Promise.race([
      Event.toPromise(this.onExit),
      timeout(maxWaitTimeMs)
    ]);
    if (this.process) {
      this.log(
        `did not exit within ${maxWaitTimeMs}ms, will kill it now...`,
        Severity.Info
      );
      this.kill();
    }
  }
};
UtilityProcess = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILifecycleMainService)
], UtilityProcess);
let WindowUtilityProcess = class extends UtilityProcess {
  constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
    super(logService, telemetryService, lifecycleMainService);
    this.windowsMainService = windowsMainService;
  }
  start(configuration) {
    const responseWindow = this.windowsMainService.getWindowById(
      configuration.responseWindowId
    );
    if (!responseWindow?.win || responseWindow.win.isDestroyed() || responseWindow.win.webContents.isDestroyed()) {
      this.log(
        "Refusing to start utility process because requesting window cannot be found or is destroyed...",
        Severity.Error
      );
      return true;
    }
    const started = super.doStart(configuration);
    if (!started) {
      return false;
    }
    this.registerWindowListeners(responseWindow.win, configuration);
    const windowPort = this.connect(configuration.payload);
    responseWindow.win.webContents.postMessage(
      configuration.responseChannel,
      configuration.responseNonce,
      [windowPort]
    );
    return true;
  }
  registerWindowListeners(window, configuration) {
    if (configuration.windowLifecycleBound) {
      this._register(
        Event.filter(
          this.lifecycleMainService.onWillLoadWindow,
          (e) => e.window.win === window
        )(() => this.kill())
      );
      this._register(
        Event.fromNodeEventEmitter(window, "closed")(() => this.kill())
      );
    }
  }
};
WindowUtilityProcess = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWindowsMainService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILifecycleMainService)
], WindowUtilityProcess);
export {
  UtilityProcess,
  WindowUtilityProcess
};
