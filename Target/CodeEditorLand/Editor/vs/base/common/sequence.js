import { Emitter } from "./event.js";
class Sequence {
  elements = [];
  _onDidSplice = new Emitter();
  onDidSplice = this._onDidSplice.event;
  splice(start, deleteCount, toInsert = []) {
    this.elements.splice(start, deleteCount, ...toInsert);
    this._onDidSplice.fire({ start, deleteCount, toInsert });
  }
}
export {
  Sequence
};
