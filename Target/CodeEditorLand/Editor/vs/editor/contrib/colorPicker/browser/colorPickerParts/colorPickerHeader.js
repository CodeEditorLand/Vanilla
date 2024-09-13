var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "../colorPicker.css";
import * as dom from "../../../../../base/browser/dom.js";
import { Color } from "../../../../../base/common/color.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../nls.js";
import { editorHoverBackground } from "../../../../../platform/theme/common/colorRegistry.js";
import { CloseButton } from "./colorPickerCloseButton.js";
const $ = dom.$;
class ColorPickerHeader extends Disposable {
  constructor(container, model, themeService, showingStandaloneColorPicker = false) {
    super();
    this.model = model;
    this.showingStandaloneColorPicker = showingStandaloneColorPicker;
    this._domNode = $(".colorpicker-header");
    dom.append(container, this._domNode);
    this._pickedColorNode = dom.append(this._domNode, $(".picked-color"));
    dom.append(this._pickedColorNode, $("span.codicon.codicon-color-mode"));
    this._pickedColorPresentation = dom.append(
      this._pickedColorNode,
      document.createElement("span")
    );
    this._pickedColorPresentation.classList.add(
      "picked-color-presentation"
    );
    const tooltip = localize(
      "clickToToggleColorOptions",
      "Click to toggle color options (rgb/hsl/hex)"
    );
    this._pickedColorNode.setAttribute("title", tooltip);
    this._originalColorNode = dom.append(
      this._domNode,
      $(".original-color")
    );
    this._originalColorNode.style.backgroundColor = Color.Format.CSS.format(this.model.originalColor) || "";
    this.backgroundColor = themeService.getColorTheme().getColor(editorHoverBackground) || Color.white;
    this._register(
      themeService.onDidColorThemeChange((theme) => {
        this.backgroundColor = theme.getColor(editorHoverBackground) || Color.white;
      })
    );
    this._register(
      dom.addDisposableListener(
        this._pickedColorNode,
        dom.EventType.CLICK,
        () => this.model.selectNextColorPresentation()
      )
    );
    this._register(
      dom.addDisposableListener(
        this._originalColorNode,
        dom.EventType.CLICK,
        () => {
          this.model.color = this.model.originalColor;
          this.model.flushColor();
        }
      )
    );
    this._register(model.onDidChangeColor(this.onDidChangeColor, this));
    this._register(
      model.onDidChangePresentation(this.onDidChangePresentation, this)
    );
    this._pickedColorNode.style.backgroundColor = Color.Format.CSS.format(model.color) || "";
    this._pickedColorNode.classList.toggle(
      "light",
      model.color.rgba.a < 0.5 ? this.backgroundColor.isLighter() : model.color.isLighter()
    );
    this.onDidChangeColor(this.model.color);
    if (this.showingStandaloneColorPicker) {
      this._domNode.classList.add("standalone-colorpicker");
      this._closeButton = this._register(new CloseButton(this._domNode));
    }
  }
  static {
    __name(this, "ColorPickerHeader");
  }
  _domNode;
  _pickedColorNode;
  _pickedColorPresentation;
  _originalColorNode;
  _closeButton = null;
  backgroundColor;
  get domNode() {
    return this._domNode;
  }
  get closeButton() {
    return this._closeButton;
  }
  get pickedColorNode() {
    return this._pickedColorNode;
  }
  get originalColorNode() {
    return this._originalColorNode;
  }
  onDidChangeColor(color) {
    this._pickedColorNode.style.backgroundColor = Color.Format.CSS.format(color) || "";
    this._pickedColorNode.classList.toggle(
      "light",
      color.rgba.a < 0.5 ? this.backgroundColor.isLighter() : color.isLighter()
    );
    this.onDidChangePresentation();
  }
  onDidChangePresentation() {
    this._pickedColorPresentation.textContent = this.model.presentation ? this.model.presentation.label : "";
  }
}
export {
  ColorPickerHeader
};
//# sourceMappingURL=colorPickerHeader.js.map
