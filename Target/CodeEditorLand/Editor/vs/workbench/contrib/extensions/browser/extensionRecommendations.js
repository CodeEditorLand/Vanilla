import { Disposable } from "../../../../base/common/lifecycle.js";
class ExtensionRecommendations extends Disposable {
  _activationPromise = null;
  get activated() {
    return this._activationPromise !== null;
  }
  activate() {
    if (!this._activationPromise) {
      this._activationPromise = this.doActivate();
    }
    return this._activationPromise;
  }
}
export {
  ExtensionRecommendations
};
