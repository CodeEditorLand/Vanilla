import { Emitter } from "../../../../base/common/event.js";
class DebugCompoundRoot {
  stopped = false;
  stopEmitter = new Emitter();
  onDidSessionStop = this.stopEmitter.event;
  sessionStopped() {
    if (!this.stopped) {
      this.stopped = true;
      this.stopEmitter.fire();
    }
  }
}
export {
  DebugCompoundRoot
};
