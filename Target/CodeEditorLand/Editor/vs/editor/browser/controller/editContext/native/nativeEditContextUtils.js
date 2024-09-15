var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addDisposableListener } from "../../../../../base/browser/dom.js";
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
class FocusTracker extends Disposable {
  constructor(_domNode, _onFocusChange) {
    super();
    this._domNode = _domNode;
    this._onFocusChange = _onFocusChange;
    this._register(
      addDisposableListener(
        this._domNode,
        "focus",
        () => this._handleFocusedChanged(true)
      )
    );
    this._register(
      addDisposableListener(
        this._domNode,
        "blur",
        () => this._handleFocusedChanged(false)
      )
    );
  }
  static {
    __name(this, "FocusTracker");
  }
  _isFocused = false;
  _handleFocusedChanged(focused) {
    if (this._isFocused === focused) {
      return;
    }
    this._isFocused = focused;
    this._onFocusChange(this._isFocused);
  }
  focus() {
    this._handleFocusedChanged(true);
    this._domNode.focus();
  }
  get isFocused() {
    return this._isFocused;
  }
}
function editContextAddDisposableListener(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  return {
    dispose() {
      target.removeEventListener(type, listener);
    }
  };
}
__name(editContextAddDisposableListener, "editContextAddDisposableListener");
export {
  FocusTracker,
  editContextAddDisposableListener
};
//# sourceMappingURL=nativeEditContextUtils.js.map
