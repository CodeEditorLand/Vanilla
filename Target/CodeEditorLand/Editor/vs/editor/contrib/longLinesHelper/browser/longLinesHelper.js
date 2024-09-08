import { Disposable } from "../../../../base/common/lifecycle.js";
import {
  MouseTargetType
} from "../../../browser/editorBrowser.js";
import {
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
class LongLinesHelper extends Disposable {
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(
      this._editor.onMouseDown((e) => {
        const stopRenderingLineAfter = this._editor.getOption(
          EditorOption.stopRenderingLineAfter
        );
        if (stopRenderingLineAfter >= 0 && e.target.type === MouseTargetType.CONTENT_TEXT && e.target.position.column >= stopRenderingLineAfter) {
          this._editor.updateOptions({
            stopRenderingLineAfter: -1
          });
        }
      })
    );
  }
  static ID = "editor.contrib.longLinesHelper";
  static get(editor) {
    return editor.getContribution(LongLinesHelper.ID);
  }
}
registerEditorContribution(
  LongLinesHelper.ID,
  LongLinesHelper,
  EditorContributionInstantiation.BeforeFirstInteraction
);
