import { Disposable } from "../../../base/common/lifecycle.js";
class TextModelPart extends Disposable {
  _isDisposed = false;
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
  assertNotDisposed() {
    if (this._isDisposed) {
      throw new Error("TextModelPart is disposed!");
    }
  }
}
export {
  TextModelPart
};
