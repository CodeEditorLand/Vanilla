import "../colorPicker.css";
import * as dom from "../../../../../base/browser/dom.js";
import { PixelRatio } from "../../../../../base/browser/pixelRatio.js";
import { Widget } from "../../../../../base/browser/ui/widget.js";
import { ColorPickerBody } from "../colorPickerParts/colorPickerBody.js";
import { ColorPickerHeader } from "../colorPickerParts/colorPickerHeader.js";
const $ = dom.$;
class ColorPickerWidget extends Widget {
  constructor(container, model, pixelRatio, themeService, standaloneColorPicker = false) {
    super();
    this.model = model;
    this.pixelRatio = pixelRatio;
    this._register(
      PixelRatio.getInstance(dom.getWindow(container)).onDidChange(
        () => this.layout()
      )
    );
    this._domNode = $(".colorpicker-widget");
    container.appendChild(this._domNode);
    this.header = this._register(
      new ColorPickerHeader(
        this._domNode,
        this.model,
        themeService,
        standaloneColorPicker
      )
    );
    this.body = this._register(
      new ColorPickerBody(
        this._domNode,
        this.model,
        this.pixelRatio,
        standaloneColorPicker
      )
    );
  }
  static ID = "editor.contrib.colorPickerWidget";
  _domNode;
  body;
  header;
  getId() {
    return ColorPickerWidget.ID;
  }
  layout() {
    this.body.layout();
  }
  get domNode() {
    return this._domNode;
  }
}
export {
  ColorPickerWidget
};
