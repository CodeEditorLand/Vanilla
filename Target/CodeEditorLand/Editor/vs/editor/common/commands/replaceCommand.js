var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Range } from "../core/range.js";
import { Selection, SelectionDirection } from "../core/selection.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../editorCommon.js";
import { ITextModel } from "../model.js";
class ReplaceCommand {
  static {
    __name(this, "ReplaceCommand");
  }
  _range;
  _text;
  insertsAutoWhitespace;
  constructor(range, text, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
}
class ReplaceCommandThatSelectsText {
  static {
    __name(this, "ReplaceCommandThatSelectsText");
  }
  _range;
  _text;
  constructor(range, text) {
    this._range = range;
    this._text = text;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromRange(srcRange, SelectionDirection.LTR);
  }
}
class ReplaceCommandWithoutChangingPosition {
  static {
    __name(this, "ReplaceCommandWithoutChangingPosition");
  }
  _range;
  _text;
  insertsAutoWhitespace;
  constructor(range, text, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getStartPosition());
  }
}
class ReplaceCommandWithOffsetCursorState {
  static {
    __name(this, "ReplaceCommandWithOffsetCursorState");
  }
  _range;
  _text;
  _columnDeltaOffset;
  _lineNumberDeltaOffset;
  insertsAutoWhitespace;
  constructor(range, text, lineNumberDeltaOffset, columnDeltaOffset, insertsAutoWhitespace = false) {
    this._range = range;
    this._text = text;
    this._columnDeltaOffset = columnDeltaOffset;
    this._lineNumberDeltaOffset = lineNumberDeltaOffset;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition().delta(this._lineNumberDeltaOffset, this._columnDeltaOffset));
  }
}
class ReplaceCommandThatPreservesSelection {
  static {
    __name(this, "ReplaceCommandThatPreservesSelection");
  }
  _range;
  _text;
  _initialSelection;
  _forceMoveMarkers;
  _selectionId;
  constructor(editRange, text, initialSelection, forceMoveMarkers = false) {
    this._range = editRange;
    this._text = text;
    this._initialSelection = initialSelection;
    this._forceMoveMarkers = forceMoveMarkers;
    this._selectionId = null;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text, this._forceMoveMarkers);
    this._selectionId = builder.trackSelection(this._initialSelection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
}
export {
  ReplaceCommand,
  ReplaceCommandThatPreservesSelection,
  ReplaceCommandThatSelectsText,
  ReplaceCommandWithOffsetCursorState,
  ReplaceCommandWithoutChangingPosition
};
//# sourceMappingURL=replaceCommand.js.map
