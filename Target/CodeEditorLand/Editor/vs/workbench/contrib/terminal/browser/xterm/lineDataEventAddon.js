var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { OperatingSystem } from "../../../../../base/common/platform.js";
class LineDataEventAddon extends Disposable {
  constructor(_initializationPromise) {
    super();
    this._initializationPromise = _initializationPromise;
  }
  static {
    __name(this, "LineDataEventAddon");
  }
  _xterm;
  _isOsSet = false;
  _onLineData = this._register(new Emitter());
  onLineData = this._onLineData.event;
  async activate(xterm) {
    this._xterm = xterm;
    const buffer = xterm.buffer;
    await this._initializationPromise;
    this._register(xterm.onLineFeed(() => {
      const newLine = buffer.active.getLine(buffer.active.baseY + buffer.active.cursorY);
      if (newLine && !newLine.isWrapped) {
        this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY - 1);
      }
    }));
    this._register(toDisposable(() => {
      this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY);
    }));
  }
  setOperatingSystem(os) {
    if (this._isOsSet || !this._xterm) {
      return;
    }
    this._isOsSet = true;
    if (os === OperatingSystem.Windows) {
      const xterm = this._xterm;
      this._register(xterm.parser.registerCsiHandler({ final: "H" }, () => {
        const buffer = xterm.buffer;
        this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY);
        return false;
      }));
    }
  }
  _sendLineData(buffer, lineIndex) {
    let line = buffer.getLine(lineIndex);
    if (!line) {
      return;
    }
    let lineData = line.translateToString(true);
    while (lineIndex > 0 && line.isWrapped) {
      line = buffer.getLine(--lineIndex);
      if (!line) {
        break;
      }
      lineData = line.translateToString(false) + lineData;
    }
    this._onLineData.fire(lineData);
  }
}
export {
  LineDataEventAddon
};
//# sourceMappingURL=lineDataEventAddon.js.map
