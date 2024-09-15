var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Promises } from "../../../base/common/async.js";
import { Event, Emitter } from "../../../base/common/event.js";
import { IAuxiliaryWindow } from "../../auxiliaryWindow/electron-main/auxiliaryWindow.js";
import { NativeParsedArgs } from "../../environment/common/argv.js";
import { ILifecycleMainService, IRelaunchHandler, LifecycleMainPhase, ShutdownEvent, ShutdownReason } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { IStateService } from "../../state/node/state.js";
import { ICodeWindow, UnloadReason } from "../../window/electron-main/window.js";
class TestLifecycleMainService {
  static {
    __name(this, "TestLifecycleMainService");
  }
  _serviceBrand;
  onBeforeShutdown = Event.None;
  _onWillShutdown = new Emitter();
  onWillShutdown = this._onWillShutdown.event;
  async fireOnWillShutdown() {
    const joiners = [];
    this._onWillShutdown.fire({
      reason: ShutdownReason.QUIT,
      join(id, promise) {
        joiners.push(promise);
      }
    });
    await Promises.settled(joiners);
  }
  onWillLoadWindow = Event.None;
  onBeforeCloseWindow = Event.None;
  wasRestarted = false;
  quitRequested = false;
  phase = LifecycleMainPhase.Ready;
  registerWindow(window) {
  }
  registerAuxWindow(auxWindow) {
  }
  async reload(window, cli) {
  }
  async unload(window, reason) {
    return true;
  }
  setRelaunchHandler(handler) {
  }
  async relaunch(options) {
  }
  async quit(willRestart) {
    return true;
  }
  async kill(code) {
  }
  async when(phase) {
  }
}
class InMemoryTestStateMainService {
  static {
    __name(this, "InMemoryTestStateMainService");
  }
  _serviceBrand;
  data = /* @__PURE__ */ new Map();
  setItem(key, data) {
    this.data.set(key, data);
  }
  setItems(items) {
    for (const { key, data } of items) {
      this.data.set(key, data);
    }
  }
  getItem(key) {
    return this.data.get(key);
  }
  removeItem(key) {
    this.data.delete(key);
  }
  async close() {
  }
}
export {
  InMemoryTestStateMainService,
  TestLifecycleMainService
};
//# sourceMappingURL=workbenchTestServices.js.map
