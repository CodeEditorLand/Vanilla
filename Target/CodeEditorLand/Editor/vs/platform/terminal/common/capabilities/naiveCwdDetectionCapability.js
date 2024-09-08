import { Emitter } from "../../../../base/common/event.js";
import {
  TerminalCapability
} from "./capabilities.js";
class NaiveCwdDetectionCapability {
  constructor(_process) {
    this._process = _process;
  }
  type = TerminalCapability.NaiveCwdDetection;
  _cwd = "";
  _onDidChangeCwd = new Emitter();
  onDidChangeCwd = this._onDidChangeCwd.event;
  async getCwd() {
    if (!this._process) {
      return Promise.resolve("");
    }
    const newCwd = await this._process.getCwd();
    if (newCwd !== this._cwd) {
      this._onDidChangeCwd.fire(newCwd);
    }
    this._cwd = newCwd;
    return this._cwd;
  }
}
export {
  NaiveCwdDetectionCapability
};
