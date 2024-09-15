var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CursorState, ICursorSimpleModel, SelectionStartKind, SingleCursorState } from "../cursorCommon.js";
import { CursorContext } from "./cursorContext.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { Selection } from "../core/selection.js";
import { PositionAffinity, TrackedRangeStickiness } from "../model.js";
class Cursor {
  static {
    __name(this, "Cursor");
  }
  modelState;
  viewState;
  _selTrackedRange;
  _trackSelection;
  constructor(context) {
    this._selTrackedRange = null;
    this._trackSelection = true;
    this._setState(
      context,
      new SingleCursorState(new Range(1, 1, 1, 1), SelectionStartKind.Simple, 0, new Position(1, 1), 0),
      new SingleCursorState(new Range(1, 1, 1, 1), SelectionStartKind.Simple, 0, new Position(1, 1), 0)
    );
  }
  dispose(context) {
    this._removeTrackedRange(context);
  }
  startTrackingSelection(context) {
    this._trackSelection = true;
    this._updateTrackedRange(context);
  }
  stopTrackingSelection(context) {
    this._trackSelection = false;
    this._removeTrackedRange(context);
  }
  _updateTrackedRange(context) {
    if (!this._trackSelection) {
      return;
    }
    this._selTrackedRange = context.model._setTrackedRange(this._selTrackedRange, this.modelState.selection, TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges);
  }
  _removeTrackedRange(context) {
    this._selTrackedRange = context.model._setTrackedRange(this._selTrackedRange, null, TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges);
  }
  asCursorState() {
    return new CursorState(this.modelState, this.viewState);
  }
  readSelectionFromMarkers(context) {
    const range = context.model._getTrackedRange(this._selTrackedRange);
    if (this.modelState.selection.isEmpty() && !range.isEmpty()) {
      return Selection.fromRange(range.collapseToEnd(), this.modelState.selection.getDirection());
    }
    return Selection.fromRange(range, this.modelState.selection.getDirection());
  }
  ensureValidState(context) {
    this._setState(context, this.modelState, this.viewState);
  }
  setState(context, modelState, viewState) {
    this._setState(context, modelState, viewState);
  }
  static _validatePositionWithCache(viewModel, position, cacheInput, cacheOutput) {
    if (position.equals(cacheInput)) {
      return cacheOutput;
    }
    return viewModel.normalizePosition(position, PositionAffinity.None);
  }
  static _validateViewState(viewModel, viewState) {
    const position = viewState.position;
    const sStartPosition = viewState.selectionStart.getStartPosition();
    const sEndPosition = viewState.selectionStart.getEndPosition();
    const validPosition = viewModel.normalizePosition(position, PositionAffinity.None);
    const validSStartPosition = this._validatePositionWithCache(viewModel, sStartPosition, position, validPosition);
    const validSEndPosition = this._validatePositionWithCache(viewModel, sEndPosition, sStartPosition, validSStartPosition);
    if (position.equals(validPosition) && sStartPosition.equals(validSStartPosition) && sEndPosition.equals(validSEndPosition)) {
      return viewState;
    }
    return new SingleCursorState(
      Range.fromPositions(validSStartPosition, validSEndPosition),
      viewState.selectionStartKind,
      viewState.selectionStartLeftoverVisibleColumns + sStartPosition.column - validSStartPosition.column,
      validPosition,
      viewState.leftoverVisibleColumns + position.column - validPosition.column
    );
  }
  _setState(context, modelState, viewState) {
    if (viewState) {
      viewState = Cursor._validateViewState(context.viewModel, viewState);
    }
    if (!modelState) {
      if (!viewState) {
        return;
      }
      const selectionStart = context.model.validateRange(
        context.coordinatesConverter.convertViewRangeToModelRange(viewState.selectionStart)
      );
      const position = context.model.validatePosition(
        context.coordinatesConverter.convertViewPositionToModelPosition(viewState.position)
      );
      modelState = new SingleCursorState(selectionStart, viewState.selectionStartKind, viewState.selectionStartLeftoverVisibleColumns, position, viewState.leftoverVisibleColumns);
    } else {
      const selectionStart = context.model.validateRange(modelState.selectionStart);
      const selectionStartLeftoverVisibleColumns = modelState.selectionStart.equalsRange(selectionStart) ? modelState.selectionStartLeftoverVisibleColumns : 0;
      const position = context.model.validatePosition(
        modelState.position
      );
      const leftoverVisibleColumns = modelState.position.equals(position) ? modelState.leftoverVisibleColumns : 0;
      modelState = new SingleCursorState(selectionStart, modelState.selectionStartKind, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns);
    }
    if (!viewState) {
      const viewSelectionStart1 = context.coordinatesConverter.convertModelPositionToViewPosition(new Position(modelState.selectionStart.startLineNumber, modelState.selectionStart.startColumn));
      const viewSelectionStart2 = context.coordinatesConverter.convertModelPositionToViewPosition(new Position(modelState.selectionStart.endLineNumber, modelState.selectionStart.endColumn));
      const viewSelectionStart = new Range(viewSelectionStart1.lineNumber, viewSelectionStart1.column, viewSelectionStart2.lineNumber, viewSelectionStart2.column);
      const viewPosition = context.coordinatesConverter.convertModelPositionToViewPosition(modelState.position);
      viewState = new SingleCursorState(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
    } else {
      const viewSelectionStart = context.coordinatesConverter.validateViewRange(viewState.selectionStart, modelState.selectionStart);
      const viewPosition = context.coordinatesConverter.validateViewPosition(viewState.position, modelState.position);
      viewState = new SingleCursorState(viewSelectionStart, modelState.selectionStartKind, modelState.selectionStartLeftoverVisibleColumns, viewPosition, modelState.leftoverVisibleColumns);
    }
    this.modelState = modelState;
    this.viewState = viewState;
    this._updateTrackedRange(context);
  }
}
export {
  Cursor
};
//# sourceMappingURL=oneCursor.js.map
