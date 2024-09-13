var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BasePty } from "../common/basePty.js";
class LocalPty extends BasePty {
  constructor(id, shouldPersist, _proxy) {
    super(id, shouldPersist);
    this._proxy = _proxy;
  }
  static {
    __name(this, "LocalPty");
  }
  start() {
    return this._proxy.start(this.id);
  }
  detach(forcePersist) {
    return this._proxy.detachFromProcess(this.id, forcePersist);
  }
  shutdown(immediate) {
    this._proxy.shutdown(this.id, immediate);
  }
  async processBinary(data) {
    if (this._inReplay) {
      return;
    }
    return this._proxy.processBinary(this.id, data);
  }
  input(data) {
    if (this._inReplay) {
      return;
    }
    this._proxy.input(this.id, data);
  }
  resize(cols, rows) {
    if (this._inReplay || this._lastDimensions.cols === cols && this._lastDimensions.rows === rows) {
      return;
    }
    this._lastDimensions.cols = cols;
    this._lastDimensions.rows = rows;
    this._proxy.resize(this.id, cols, rows);
  }
  async clearBuffer() {
    this._proxy.clearBuffer?.(this.id);
  }
  freePortKillProcess(port) {
    if (!this._proxy.freePortKillProcess) {
      throw new Error(
        "freePortKillProcess does not exist on the local pty service"
      );
    }
    return this._proxy.freePortKillProcess(port);
  }
  async refreshProperty(type) {
    return this._proxy.refreshProperty(this.id, type);
  }
  async updateProperty(type, value) {
    return this._proxy.updateProperty(this.id, type, value);
  }
  acknowledgeDataEvent(charCount) {
    if (this._inReplay) {
      return;
    }
    this._proxy.acknowledgeDataEvent(this.id, charCount);
  }
  setUnicodeVersion(version) {
    return this._proxy.setUnicodeVersion(this.id, version);
  }
  handleOrphanQuestion() {
    this._proxy.orphanQuestionReply(this.id);
  }
}
export {
  LocalPty
};
//# sourceMappingURL=localPty.js.map
