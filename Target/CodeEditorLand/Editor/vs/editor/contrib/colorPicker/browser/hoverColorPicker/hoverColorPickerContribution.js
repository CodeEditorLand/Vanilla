var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICodeEditor, IEditorMouseEvent, MouseTargetType } from "../../../../browser/editorBrowser.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { Range } from "../../../../common/core/range.js";
import { IEditorContribution } from "../../../../common/editorCommon.js";
import { ColorDecorationInjectedTextMarker } from "../colorDetector.js";
import { ContentHoverController } from "../../../hover/browser/contentHoverController.js";
import { HoverStartMode, HoverStartSource } from "../../../hover/browser/hoverOperation.js";
class HoverColorPickerContribution extends Disposable {
  // ms
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(_editor.onMouseDown((e) => this.onMouseDown(e)));
  }
  static {
    __name(this, "HoverColorPickerContribution");
  }
  static ID = "editor.contrib.colorContribution";
  static RECOMPUTE_TIME = 1e3;
  dispose() {
    super.dispose();
  }
  onMouseDown(mouseEvent) {
    const colorDecoratorsActivatedOn = this._editor.getOption(EditorOption.colorDecoratorsActivatedOn);
    if (colorDecoratorsActivatedOn !== "click" && colorDecoratorsActivatedOn !== "clickAndHover") {
      return;
    }
    const target = mouseEvent.target;
    if (target.type !== MouseTargetType.CONTENT_TEXT) {
      return;
    }
    if (!target.detail.injectedText) {
      return;
    }
    if (target.detail.injectedText.options.attachedData !== ColorDecorationInjectedTextMarker) {
      return;
    }
    if (!target.range) {
      return;
    }
    const hoverController = this._editor.getContribution(ContentHoverController.ID);
    if (!hoverController) {
      return;
    }
    if (!hoverController.isColorPickerVisible) {
      const range = new Range(target.range.startLineNumber, target.range.startColumn + 1, target.range.endLineNumber, target.range.endColumn + 1);
      hoverController.showContentHover(range, HoverStartMode.Immediate, HoverStartSource.Mouse, false, true);
    }
  }
}
export {
  HoverColorPickerContribution
};
//# sourceMappingURL=hoverColorPickerContribution.js.map
