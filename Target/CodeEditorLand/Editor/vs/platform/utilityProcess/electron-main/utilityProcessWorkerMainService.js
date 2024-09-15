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
import { Disposable } from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IUtilityProcessWorkerCreateConfiguration, IOnDidTerminateUtilityrocessWorkerProcess, IUtilityProcessWorkerConfiguration, IUtilityProcessWorkerProcessExit, IUtilityProcessWorkerService } from "../common/utilityProcessWorkerService.js";
import { IWindowsMainService } from "../../windows/electron-main/windows.js";
import { WindowUtilityProcess } from "./utilityProcess.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { hash } from "../../../base/common/hash.js";
import { Event, Emitter } from "../../../base/common/event.js";
import { DeferredPromise } from "../../../base/common/async.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
const IUtilityProcessWorkerMainService = createDecorator("utilityProcessWorker");
let UtilityProcessWorkerMainService = class extends Disposable {
  constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
    super();
    this.logService = logService;
    this.windowsMainService = windowsMainService;
    this.telemetryService = telemetryService;
    this.lifecycleMainService = lifecycleMainService;
  }
  static {
    __name(this, "UtilityProcessWorkerMainService");
  }
  workers = /* @__PURE__ */ new Map();
  async createWorker(configuration) {
    const workerLogId = `window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId}`;
    this.logService.trace(`[UtilityProcessWorker]: createWorker(${workerLogId})`);
    const workerId = this.hash(configuration);
    if (this.workers.has(workerId)) {
      this.logService.warn(`[UtilityProcessWorker]: createWorker() found an existing worker that will be terminated (${workerLogId})`);
      this.disposeWorker(configuration);
    }
    const worker = new UtilityProcessWorker(this.logService, this.windowsMainService, this.telemetryService, this.lifecycleMainService, configuration);
    if (!worker.spawn()) {
      return { reason: { code: 1, signal: "EINVALID" } };
    }
    this.workers.set(workerId, worker);
    const onDidTerminate = new DeferredPromise();
    Event.once(worker.onDidTerminate)((reason) => {
      if (reason.code === 0) {
        this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
      } else {
        this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason.code}, signal: ${reason.signal}`);
      }
      this.workers.delete(workerId);
      onDidTerminate.complete({ reason });
    });
    return onDidTerminate.p;
  }
  hash(configuration) {
    return hash({
      moduleId: configuration.process.moduleId,
      windowId: configuration.reply.windowId
    });
  }
  async disposeWorker(configuration) {
    const workerId = this.hash(configuration);
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }
    this.logService.trace(`[UtilityProcessWorker]: disposeWorker(window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId})`);
    worker.kill();
    worker.dispose();
    this.workers.delete(workerId);
  }
};
UtilityProcessWorkerMainService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWindowsMainService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILifecycleMainService)
], UtilityProcessWorkerMainService);
let UtilityProcessWorker = class extends Disposable {
  constructor(logService, windowsMainService, telemetryService, lifecycleMainService, configuration) {
    super();
    this.logService = logService;
    this.windowsMainService = windowsMainService;
    this.telemetryService = telemetryService;
    this.lifecycleMainService = lifecycleMainService;
    this.configuration = configuration;
    this.registerListeners();
  }
  static {
    __name(this, "UtilityProcessWorker");
  }
  _onDidTerminate = this._register(new Emitter());
  onDidTerminate = this._onDidTerminate.event;
  utilityProcess = this._register(new WindowUtilityProcess(this.logService, this.windowsMainService, this.telemetryService, this.lifecycleMainService));
  registerListeners() {
    this._register(this.utilityProcess.onExit((e) => this._onDidTerminate.fire({ code: e.code, signal: e.signal })));
    this._register(this.utilityProcess.onCrash((e) => this._onDidTerminate.fire({ code: e.code, signal: "ECRASH" })));
  }
  spawn() {
    const window = this.windowsMainService.getWindowById(this.configuration.reply.windowId);
    const windowPid = window?.win?.webContents.getOSProcessId();
    return this.utilityProcess.start({
      type: this.configuration.process.type,
      entryPoint: this.configuration.process.moduleId,
      parentLifecycleBound: windowPid,
      windowLifecycleBound: true,
      correlationId: `${this.configuration.reply.windowId}`,
      responseWindowId: this.configuration.reply.windowId,
      responseChannel: this.configuration.reply.channel,
      responseNonce: this.configuration.reply.nonce
    });
  }
  kill() {
    this.utilityProcess.kill();
  }
};
UtilityProcessWorker = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWindowsMainService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILifecycleMainService)
], UtilityProcessWorker);
export {
  IUtilityProcessWorkerMainService,
  UtilityProcessWorkerMainService
};
//# sourceMappingURL=utilityProcessWorkerMainService.js.map
