var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { reset } from "../../dom.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "./iconLabels.js";
import { IDisposable } from "../../../common/lifecycle.js";
class SimpleIconLabel {
  constructor(_container) {
    this._container = _container;
  }
  static {
    __name(this, "SimpleIconLabel");
  }
  hover;
  set text(text) {
    reset(this._container, ...renderLabelWithIcons(text ?? ""));
  }
  set title(title) {
    if (!this.hover && title) {
      this.hover = getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this._container, title);
    } else if (this.hover) {
      this.hover.update(title);
    }
  }
  dispose() {
    this.hover?.dispose();
  }
}
export {
  SimpleIconLabel
};
//# sourceMappingURL=simpleIconLabel.js.map
