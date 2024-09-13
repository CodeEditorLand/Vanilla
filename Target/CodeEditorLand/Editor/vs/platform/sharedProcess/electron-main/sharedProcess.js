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
import { Barrier, DeferredPromise } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable
} from "../../../base/common/lifecycle.js";
import { assertIsDefined } from "../../../base/common/types.js";
import { validatedIpcMain } from "../../../base/parts/ipc/electron-main/ipcMain.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { parseSharedProcessDebugPort } from "../../environment/node/environmentService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { ILoggerMainService } from "../../log/electron-main/loggerService.js";
import { IPolicyService } from "../../policy/common/policy.js";
import { NullTelemetryService } from "../../telemetry/common/telemetryUtils.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { UtilityProcess } from "../../utilityProcess/electron-main/utilityProcess.js";
import {
  SharedProcessChannelConnection,
  SharedProcessLifecycle,
  SharedProcessRawConnection
} from "../common/sharedProcess.js";
let SharedProcess = class extends Disposable {
  constructor(machineId, sqmId, devDeviceId, environmentMainService, userDataProfilesService, lifecycleMainService, logService, loggerMainService, policyService) {
    super();
    this.machineId = machineId;
    this.sqmId = sqmId;
    this.devDeviceId = devDeviceId;
    this.environmentMainService = environmentMainService;
    this.userDataProfilesService = userDataProfilesService;
    this.lifecycleMainService = lifecycleMainService;
    this.logService = logService;
    this.loggerMainService = loggerMainService;
    this.policyService = policyService;
    this.registerListeners();
  }
  static {
    __name(this, "SharedProcess");
  }
  firstWindowConnectionBarrier = new Barrier();
  utilityProcess = void 0;
  utilityProcessLogListener = void 0;
  _onDidCrash = this._register(new Emitter());
  onDidCrash = this._onDidCrash.event;
  registerListeners() {
    validatedIpcMain.on(
      SharedProcessChannelConnection.request,
      (e, nonce) => this.onWindowConnection(
        e,
        nonce,
        SharedProcessChannelConnection.response
      )
    );
    validatedIpcMain.on(
      SharedProcessRawConnection.request,
      (e, nonce) => this.onWindowConnection(
        e,
        nonce,
        SharedProcessRawConnection.response
      )
    );
    this._register(
      this.lifecycleMainService.onWillShutdown(
        () => this.onWillShutdown()
      )
    );
  }
  async onWindowConnection(e, nonce, responseChannel) {
    this.logService.trace(
      `[SharedProcess] onWindowConnection for: ${responseChannel}`
    );
    if (!this.firstWindowConnectionBarrier.isOpen()) {
      this.firstWindowConnectionBarrier.open();
    }
    await this.whenReady();
    const port = await this.connect(responseChannel);
    if (e.sender.isDestroyed()) {
      return port.close();
    }
    e.sender.postMessage(responseChannel, nonce, [port]);
  }
  onWillShutdown() {
    this.logService.trace("[SharedProcess] onWillShutdown");
    this.utilityProcess?.postMessage(SharedProcessLifecycle.exit);
    this.utilityProcess = void 0;
  }
  _whenReady = void 0;
  whenReady() {
    if (!this._whenReady) {
      this._whenReady = (async () => {
        await this.whenIpcReady;
        const whenReady = new DeferredPromise();
        this.utilityProcess?.once(
          SharedProcessLifecycle.initDone,
          () => whenReady.complete()
        );
        await whenReady.p;
        this.utilityProcessLogListener?.dispose();
        this.logService.trace("[SharedProcess] Overall ready");
      })();
    }
    return this._whenReady;
  }
  _whenIpcReady = void 0;
  get whenIpcReady() {
    if (!this._whenIpcReady) {
      this._whenIpcReady = (async () => {
        await this.firstWindowConnectionBarrier.wait();
        this.createUtilityProcess();
        const sharedProcessIpcReady = new DeferredPromise();
        this.utilityProcess?.once(
          SharedProcessLifecycle.ipcReady,
          () => sharedProcessIpcReady.complete()
        );
        await sharedProcessIpcReady.p;
        this.logService.trace("[SharedProcess] IPC ready");
      })();
    }
    return this._whenIpcReady;
  }
  createUtilityProcess() {
    this.utilityProcess = this._register(
      new UtilityProcess(
        this.logService,
        NullTelemetryService,
        this.lifecycleMainService
      )
    );
    this.utilityProcessLogListener = this.utilityProcess.onMessage(
      (e) => {
        if (typeof e.warning === "string") {
          this.logService.warn(e.warning);
        } else if (typeof e.error === "string") {
          this.logService.error(e.error);
        }
      }
    );
    const inspectParams = parseSharedProcessDebugPort(
      this.environmentMainService.args,
      this.environmentMainService.isBuilt
    );
    let execArgv;
    if (inspectParams.port) {
      execArgv = ["--nolazy"];
      if (inspectParams.break) {
        execArgv.push(`--inspect-brk=${inspectParams.port}`);
      } else {
        execArgv.push(`--inspect=${inspectParams.port}`);
      }
    }
    this.utilityProcess.start({
      type: "shared-process",
      entryPoint: "vs/code/electron-utility/sharedProcess/sharedProcessMain",
      payload: this.createSharedProcessConfiguration(),
      respondToAuthRequestsFromMainProcess: true,
      execArgv
    });
    this._register(
      this.utilityProcess.onCrash(() => this._onDidCrash.fire())
    );
  }
  createSharedProcessConfiguration() {
    return {
      machineId: this.machineId,
      sqmId: this.sqmId,
      devDeviceId: this.devDeviceId,
      codeCachePath: this.environmentMainService.codeCachePath,
      profiles: {
        home: this.userDataProfilesService.profilesHome,
        all: this.userDataProfilesService.profiles
      },
      args: this.environmentMainService.args,
      logLevel: this.loggerMainService.getLogLevel(),
      loggers: this.loggerMainService.getRegisteredLoggers(),
      policiesData: this.policyService.serialize()
    };
  }
  async connect(payload) {
    await this.whenIpcReady;
    const utilityProcess = assertIsDefined(this.utilityProcess);
    return utilityProcess.connect(payload);
  }
};
SharedProcess = __decorateClass([
  __decorateParam(3, IEnvironmentMainService),
  __decorateParam(4, IUserDataProfilesService),
  __decorateParam(5, ILifecycleMainService),
  __decorateParam(6, ILogService),
  __decorateParam(7, ILoggerMainService),
  __decorateParam(8, IPolicyService)
], SharedProcess);
export {
  SharedProcess
};
//# sourceMappingURL=sharedProcess.js.map
