import { DeferredPromise } from "../../base/common/async.js";
import { Emitter } from "../../base/common/event.js";
import { Disposable } from "../../base/common/lifecycle.js";
class DialogsModel extends Disposable {
  dialogs = [];
  _onWillShowDialog = this._register(new Emitter());
  onWillShowDialog = this._onWillShowDialog.event;
  _onDidShowDialog = this._register(new Emitter());
  onDidShowDialog = this._onDidShowDialog.event;
  show(dialog) {
    const promise = new DeferredPromise();
    const item = {
      args: dialog,
      close: (result) => {
        this.dialogs.splice(0, 1);
        if (result instanceof Error) {
          promise.error(result);
        } else {
          promise.complete(result);
        }
        this._onDidShowDialog.fire();
      }
    };
    this.dialogs.push(item);
    this._onWillShowDialog.fire();
    return {
      item,
      result: promise.p
    };
  }
}
export {
  DialogsModel
};
