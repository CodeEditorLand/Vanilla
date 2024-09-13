var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import { ITextModel } from "../../../common/model.js";
class ReplaceAllCommand {
  static {
    __name(this, "ReplaceAllCommand");
  }
  _editorSelection;
  _trackedEditorSelectionId;
  _ranges;
  _replaceStrings;
  constructor(editorSelection, ranges, replaceStrings) {
    this._editorSelection = editorSelection;
    this._ranges = ranges;
    this._replaceStrings = replaceStrings;
    this._trackedEditorSelectionId = null;
  }
  getEditOperations(model, builder) {
    if (this._ranges.length > 0) {
      const ops = [];
      for (let i = 0; i < this._ranges.length; i++) {
        ops.push({
          range: this._ranges[i],
          text: this._replaceStrings[i]
        });
      }
      ops.sort((o1, o2) => {
        return Range.compareRangesUsingStarts(o1.range, o2.range);
      });
      const resultOps = [];
      let previousOp = ops[0];
      for (let i = 1; i < ops.length; i++) {
        if (previousOp.range.endLineNumber === ops[i].range.startLineNumber && previousOp.range.endColumn === ops[i].range.startColumn) {
          previousOp.range = previousOp.range.plusRange(ops[i].range);
          previousOp.text = previousOp.text + ops[i].text;
        } else {
          resultOps.push(previousOp);
          previousOp = ops[i];
        }
      }
      resultOps.push(previousOp);
      for (const op of resultOps) {
        builder.addEditOperation(op.range, op.text);
      }
    }
    this._trackedEditorSelectionId = builder.trackSelection(this._editorSelection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._trackedEditorSelectionId);
  }
}
export {
  ReplaceAllCommand
};
//# sourceMappingURL=replaceAllCommand.js.map
