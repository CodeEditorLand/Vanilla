var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditOperation, ISingleEditOperation } from "../../../common/core/editOperation.js";
import { Range } from "../../../common/core/range.js";
import { EndOfLineSequence } from "../../../common/model.js";
import { TextEdit } from "../../../common/languages.js";
import { StableEditorScrollState } from "../../../browser/stableEditorScroll.js";
class FormattingEdit {
  static {
    __name(this, "FormattingEdit");
  }
  static _handleEolEdits(editor, edits) {
    let newEol = void 0;
    const singleEdits = [];
    for (const edit of edits) {
      if (typeof edit.eol === "number") {
        newEol = edit.eol;
      }
      if (edit.range && typeof edit.text === "string") {
        singleEdits.push(edit);
      }
    }
    if (typeof newEol === "number") {
      if (editor.hasModel()) {
        editor.getModel().pushEOL(newEol);
      }
    }
    return singleEdits;
  }
  static _isFullModelReplaceEdit(editor, edit) {
    if (!editor.hasModel()) {
      return false;
    }
    const model = editor.getModel();
    const editRange = model.validateRange(edit.range);
    const fullModelRange = model.getFullModelRange();
    return fullModelRange.equalsRange(editRange);
  }
  static execute(editor, _edits, addUndoStops) {
    if (addUndoStops) {
      editor.pushUndoStop();
    }
    const scrollState = StableEditorScrollState.capture(editor);
    const edits = FormattingEdit._handleEolEdits(editor, _edits);
    if (edits.length === 1 && FormattingEdit._isFullModelReplaceEdit(editor, edits[0])) {
      editor.executeEdits("formatEditsCommand", edits.map((edit) => EditOperation.replace(Range.lift(edit.range), edit.text)));
    } else {
      editor.executeEdits("formatEditsCommand", edits.map((edit) => EditOperation.replaceMove(Range.lift(edit.range), edit.text)));
    }
    if (addUndoStops) {
      editor.pushUndoStop();
    }
    scrollState.restoreRelativeVerticalPositionOfCursor(editor);
  }
}
export {
  FormattingEdit
};
//# sourceMappingURL=formattingEdit.js.map
