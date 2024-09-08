import { reset } from "../../dom.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "./iconLabels.js";
class SimpleIconLabel {
  constructor(_container) {
    this._container = _container;
  }
  hover;
  set text(text) {
    reset(this._container, ...renderLabelWithIcons(text ?? ""));
  }
  set title(title) {
    if (!this.hover && title) {
      this.hover = getBaseLayerHoverDelegate().setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        this._container,
        title
      );
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
