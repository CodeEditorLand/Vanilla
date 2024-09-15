var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IPtyHostProcessReplayEvent } from "./capabilities/capabilities.js";
import { ReplayEntry } from "./terminalProcess.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MaxRecorderDataSize"] = 10485760] = "MaxRecorderDataSize";
  return Constants2;
})(Constants || {});
class TerminalRecorder {
  static {
    __name(this, "TerminalRecorder");
  }
  _entries;
  _totalDataLength = 0;
  constructor(cols, rows) {
    this._entries = [{ cols, rows, data: [] }];
  }
  handleResize(cols, rows) {
    if (this._entries.length > 0) {
      const lastEntry = this._entries[this._entries.length - 1];
      if (lastEntry.data.length === 0) {
        this._entries.pop();
      }
    }
    if (this._entries.length > 0) {
      const lastEntry = this._entries[this._entries.length - 1];
      if (lastEntry.cols === cols && lastEntry.rows === rows) {
        return;
      }
      if (lastEntry.cols === 0 && lastEntry.rows === 0) {
        lastEntry.cols = cols;
        lastEntry.rows = rows;
        return;
      }
    }
    this._entries.push({ cols, rows, data: [] });
  }
  handleData(data) {
    const lastEntry = this._entries[this._entries.length - 1];
    lastEntry.data.push(data);
    this._totalDataLength += data.length;
    while (this._totalDataLength > 10485760 /* MaxRecorderDataSize */) {
      const firstEntry = this._entries[0];
      const remainingToDelete = this._totalDataLength - 10485760 /* MaxRecorderDataSize */;
      if (remainingToDelete >= firstEntry.data[0].length) {
        this._totalDataLength -= firstEntry.data[0].length;
        firstEntry.data.shift();
        if (firstEntry.data.length === 0) {
          this._entries.shift();
        }
      } else {
        firstEntry.data[0] = firstEntry.data[0].substr(remainingToDelete);
        this._totalDataLength -= remainingToDelete;
      }
    }
  }
  generateReplayEventSync() {
    this._entries.forEach((entry) => {
      if (entry.data.length > 0) {
        entry.data = [entry.data.join("")];
      }
    });
    return {
      events: this._entries.map((entry) => ({ cols: entry.cols, rows: entry.rows, data: entry.data[0] ?? "" })),
      // No command restoration is needed when relaunching terminals
      commands: {
        isWindowsPty: false,
        commands: [],
        promptInputModel: void 0
      }
    };
  }
  async generateReplayEvent() {
    return this.generateReplayEventSync();
  }
}
export {
  TerminalRecorder
};
//# sourceMappingURL=terminalRecorder.js.map
