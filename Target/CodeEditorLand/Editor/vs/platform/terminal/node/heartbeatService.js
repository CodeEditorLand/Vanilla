import { Emitter } from "../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import {
  HeartbeatConstants
} from "../common/terminal.js";
class HeartbeatService extends Disposable {
  _onBeat = this._register(new Emitter());
  onBeat = this._onBeat.event;
  constructor() {
    super();
    const interval = setInterval(() => {
      this._onBeat.fire();
    }, HeartbeatConstants.BeatInterval);
    this._register(toDisposable(() => clearInterval(interval)));
  }
}
export {
  HeartbeatService
};
