var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../colorPicker.css";
import * as dom from "../../../../../base/browser/dom.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
const $ = dom.$;
class CloseButton extends Disposable {
  static {
    __name(this, "CloseButton");
  }
  _button;
  _onClicked = this._register(new Emitter());
  onClicked = this._onClicked.event;
  constructor(container) {
    super();
    this._button = document.createElement("div");
    this._button.classList.add("close-button");
    dom.append(container, this._button);
    const innerDiv = document.createElement("div");
    innerDiv.classList.add("close-button-inner-div");
    dom.append(this._button, innerDiv);
    const closeButton = dom.append(
      innerDiv,
      $(
        ".button" + ThemeIcon.asCSSSelector(
          registerIcon(
            "color-picker-close",
            Codicon.close,
            localize(
              "closeIcon",
              "Icon to close the color picker"
            )
          )
        )
      )
    );
    closeButton.classList.add("close-icon");
    this._register(
      dom.addDisposableListener(this._button, dom.EventType.CLICK, () => {
        this._onClicked.fire();
      })
    );
  }
}
export {
  CloseButton
};
//# sourceMappingURL=colorPickerCloseButton.js.map
