var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as types from "../../../base/common/types.js";
import { CursorState, ICursorSimpleModel, PartialCursorState, SelectionStartKind, SingleCursorState } from "../cursorCommon.js";
import { MoveOperations } from "./cursorMoveOperations.js";
import { WordOperations } from "./cursorWordOperations.js";
import { IPosition, Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { ICommandMetadata } from "../../../platform/commands/common/commands.js";
import { IViewModel } from "../viewModel.js";
class CursorMoveCommands {
  static {
    __name(this, "CursorMoveCommands");
  }
  static addCursorDown(viewModel, cursors, useLogicalLine) {
    const result = [];
    let resultLen = 0;
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[resultLen++] = new CursorState(cursor.modelState, cursor.viewState);
      if (useLogicalLine) {
        result[resultLen++] = CursorState.fromModelState(MoveOperations.translateDown(viewModel.cursorConfig, viewModel.model, cursor.modelState));
      } else {
        result[resultLen++] = CursorState.fromViewState(MoveOperations.translateDown(viewModel.cursorConfig, viewModel, cursor.viewState));
      }
    }
    return result;
  }
  static addCursorUp(viewModel, cursors, useLogicalLine) {
    const result = [];
    let resultLen = 0;
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[resultLen++] = new CursorState(cursor.modelState, cursor.viewState);
      if (useLogicalLine) {
        result[resultLen++] = CursorState.fromModelState(MoveOperations.translateUp(viewModel.cursorConfig, viewModel.model, cursor.modelState));
      } else {
        result[resultLen++] = CursorState.fromViewState(MoveOperations.translateUp(viewModel.cursorConfig, viewModel, cursor.viewState));
      }
    }
    return result;
  }
  static moveToBeginningOfLine(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = this._moveToLineStart(viewModel, cursor, inSelectionMode);
    }
    return result;
  }
  static _moveToLineStart(viewModel, cursor, inSelectionMode) {
    const currentViewStateColumn = cursor.viewState.position.column;
    const currentModelStateColumn = cursor.modelState.position.column;
    const isFirstLineOfWrappedLine = currentViewStateColumn === currentModelStateColumn;
    const currentViewStatelineNumber = cursor.viewState.position.lineNumber;
    const firstNonBlankColumn = viewModel.getLineFirstNonWhitespaceColumn(currentViewStatelineNumber);
    const isBeginningOfViewLine = currentViewStateColumn === firstNonBlankColumn;
    if (!isFirstLineOfWrappedLine && !isBeginningOfViewLine) {
      return this._moveToLineStartByView(viewModel, cursor, inSelectionMode);
    } else {
      return this._moveToLineStartByModel(viewModel, cursor, inSelectionMode);
    }
  }
  static _moveToLineStartByView(viewModel, cursor, inSelectionMode) {
    return CursorState.fromViewState(
      MoveOperations.moveToBeginningOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)
    );
  }
  static _moveToLineStartByModel(viewModel, cursor, inSelectionMode) {
    return CursorState.fromModelState(
      MoveOperations.moveToBeginningOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)
    );
  }
  static moveToEndOfLine(viewModel, cursors, inSelectionMode, sticky) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = this._moveToLineEnd(viewModel, cursor, inSelectionMode, sticky);
    }
    return result;
  }
  static _moveToLineEnd(viewModel, cursor, inSelectionMode, sticky) {
    const viewStatePosition = cursor.viewState.position;
    const viewModelMaxColumn = viewModel.getLineMaxColumn(viewStatePosition.lineNumber);
    const isEndOfViewLine = viewStatePosition.column === viewModelMaxColumn;
    const modelStatePosition = cursor.modelState.position;
    const modelMaxColumn = viewModel.model.getLineMaxColumn(modelStatePosition.lineNumber);
    const isEndLineOfWrappedLine = viewModelMaxColumn - viewStatePosition.column === modelMaxColumn - modelStatePosition.column;
    if (isEndOfViewLine || isEndLineOfWrappedLine) {
      return this._moveToLineEndByModel(viewModel, cursor, inSelectionMode, sticky);
    } else {
      return this._moveToLineEndByView(viewModel, cursor, inSelectionMode, sticky);
    }
  }
  static _moveToLineEndByView(viewModel, cursor, inSelectionMode, sticky) {
    return CursorState.fromViewState(
      MoveOperations.moveToEndOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, sticky)
    );
  }
  static _moveToLineEndByModel(viewModel, cursor, inSelectionMode, sticky) {
    return CursorState.fromModelState(
      MoveOperations.moveToEndOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, sticky)
    );
  }
  static expandLineSelection(viewModel, cursors) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const startLineNumber = cursor.modelState.selection.startLineNumber;
      const lineCount = viewModel.model.getLineCount();
      let endLineNumber = cursor.modelState.selection.endLineNumber;
      let endColumn;
      if (endLineNumber === lineCount) {
        endColumn = viewModel.model.getLineMaxColumn(lineCount);
      } else {
        endLineNumber++;
        endColumn = 1;
      }
      result[i] = CursorState.fromModelState(new SingleCursorState(
        new Range(startLineNumber, 1, startLineNumber, 1),
        SelectionStartKind.Simple,
        0,
        new Position(endLineNumber, endColumn),
        0
      ));
    }
    return result;
  }
  static moveToBeginningOfBuffer(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = CursorState.fromModelState(MoveOperations.moveToBeginningOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
    }
    return result;
  }
  static moveToEndOfBuffer(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = CursorState.fromModelState(MoveOperations.moveToEndOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
    }
    return result;
  }
  static selectAll(viewModel, cursor) {
    const lineCount = viewModel.model.getLineCount();
    const maxColumn = viewModel.model.getLineMaxColumn(lineCount);
    return CursorState.fromModelState(new SingleCursorState(
      new Range(1, 1, 1, 1),
      SelectionStartKind.Simple,
      0,
      new Position(lineCount, maxColumn),
      0
    ));
  }
  static line(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
    const position = viewModel.model.validatePosition(_position);
    const viewPosition = _viewPosition ? viewModel.coordinatesConverter.validateViewPosition(new Position(_viewPosition.lineNumber, _viewPosition.column), position) : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
    if (!inSelectionMode) {
      const lineCount = viewModel.model.getLineCount();
      let selectToLineNumber = position.lineNumber + 1;
      let selectToColumn = 1;
      if (selectToLineNumber > lineCount) {
        selectToLineNumber = lineCount;
        selectToColumn = viewModel.model.getLineMaxColumn(selectToLineNumber);
      }
      return CursorState.fromModelState(new SingleCursorState(
        new Range(position.lineNumber, 1, selectToLineNumber, selectToColumn),
        SelectionStartKind.Line,
        0,
        new Position(selectToLineNumber, selectToColumn),
        0
      ));
    }
    const enteringLineNumber = cursor.modelState.selectionStart.getStartPosition().lineNumber;
    if (position.lineNumber < enteringLineNumber) {
      return CursorState.fromViewState(cursor.viewState.move(
        true,
        viewPosition.lineNumber,
        1,
        0
      ));
    } else if (position.lineNumber > enteringLineNumber) {
      const lineCount = viewModel.getLineCount();
      let selectToViewLineNumber = viewPosition.lineNumber + 1;
      let selectToViewColumn = 1;
      if (selectToViewLineNumber > lineCount) {
        selectToViewLineNumber = lineCount;
        selectToViewColumn = viewModel.getLineMaxColumn(selectToViewLineNumber);
      }
      return CursorState.fromViewState(cursor.viewState.move(
        true,
        selectToViewLineNumber,
        selectToViewColumn,
        0
      ));
    } else {
      const endPositionOfSelectionStart = cursor.modelState.selectionStart.getEndPosition();
      return CursorState.fromModelState(cursor.modelState.move(
        true,
        endPositionOfSelectionStart.lineNumber,
        endPositionOfSelectionStart.column,
        0
      ));
    }
  }
  static word(viewModel, cursor, inSelectionMode, _position) {
    const position = viewModel.model.validatePosition(_position);
    return CursorState.fromModelState(WordOperations.word(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, position));
  }
  static cancelSelection(viewModel, cursor) {
    if (!cursor.modelState.hasSelection()) {
      return new CursorState(cursor.modelState, cursor.viewState);
    }
    const lineNumber = cursor.viewState.position.lineNumber;
    const column = cursor.viewState.position.column;
    return CursorState.fromViewState(new SingleCursorState(
      new Range(lineNumber, column, lineNumber, column),
      SelectionStartKind.Simple,
      0,
      new Position(lineNumber, column),
      0
    ));
  }
  static moveTo(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
    if (inSelectionMode) {
      if (cursor.modelState.selectionStartKind === SelectionStartKind.Word) {
        return this.word(viewModel, cursor, inSelectionMode, _position);
      }
      if (cursor.modelState.selectionStartKind === SelectionStartKind.Line) {
        return this.line(viewModel, cursor, inSelectionMode, _position, _viewPosition);
      }
    }
    const position = viewModel.model.validatePosition(_position);
    const viewPosition = _viewPosition ? viewModel.coordinatesConverter.validateViewPosition(new Position(_viewPosition.lineNumber, _viewPosition.column), position) : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
    return CursorState.fromViewState(cursor.viewState.move(inSelectionMode, viewPosition.lineNumber, viewPosition.column, 0));
  }
  static simpleMove(viewModel, cursors, direction, inSelectionMode, value, unit) {
    switch (direction) {
      case CursorMove.Direction.Left: {
        if (unit === CursorMove.Unit.HalfLine) {
          return this._moveHalfLineLeft(viewModel, cursors, inSelectionMode);
        } else {
          return this._moveLeft(viewModel, cursors, inSelectionMode, value);
        }
      }
      case CursorMove.Direction.Right: {
        if (unit === CursorMove.Unit.HalfLine) {
          return this._moveHalfLineRight(viewModel, cursors, inSelectionMode);
        } else {
          return this._moveRight(viewModel, cursors, inSelectionMode, value);
        }
      }
      case CursorMove.Direction.Up: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return this._moveUpByViewLines(viewModel, cursors, inSelectionMode, value);
        } else {
          return this._moveUpByModelLines(viewModel, cursors, inSelectionMode, value);
        }
      }
      case CursorMove.Direction.Down: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return this._moveDownByViewLines(viewModel, cursors, inSelectionMode, value);
        } else {
          return this._moveDownByModelLines(viewModel, cursors, inSelectionMode, value);
        }
      }
      case CursorMove.Direction.PrevBlankLine: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return cursors.map((cursor) => CursorState.fromViewState(MoveOperations.moveToPrevBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
        } else {
          return cursors.map((cursor) => CursorState.fromModelState(MoveOperations.moveToPrevBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
        }
      }
      case CursorMove.Direction.NextBlankLine: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return cursors.map((cursor) => CursorState.fromViewState(MoveOperations.moveToNextBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
        } else {
          return cursors.map((cursor) => CursorState.fromModelState(MoveOperations.moveToNextBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
        }
      }
      case CursorMove.Direction.WrappedLineStart: {
        return this._moveToViewMinColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineFirstNonWhitespaceCharacter: {
        return this._moveToViewFirstNonWhitespaceColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineColumnCenter: {
        return this._moveToViewCenterColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineEnd: {
        return this._moveToViewMaxColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineLastNonWhitespaceCharacter: {
        return this._moveToViewLastNonWhitespaceColumn(viewModel, cursors, inSelectionMode);
      }
      default:
        return null;
    }
  }
  static viewportMove(viewModel, cursors, direction, inSelectionMode, value) {
    const visibleViewRange = viewModel.getCompletelyVisibleViewRange();
    const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
    switch (direction) {
      case CursorMove.Direction.ViewPortTop: {
        const modelLineNumber = this._firstLineNumberInRange(viewModel.model, visibleModelRange, value);
        const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
        return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
      }
      case CursorMove.Direction.ViewPortBottom: {
        const modelLineNumber = this._lastLineNumberInRange(viewModel.model, visibleModelRange, value);
        const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
        return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
      }
      case CursorMove.Direction.ViewPortCenter: {
        const modelLineNumber = Math.round((visibleModelRange.startLineNumber + visibleModelRange.endLineNumber) / 2);
        const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
        return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
      }
      case CursorMove.Direction.ViewPortIfOutside: {
        const result = [];
        for (let i = 0, len = cursors.length; i < len; i++) {
          const cursor = cursors[i];
          result[i] = this.findPositionInViewportIfOutside(viewModel, cursor, visibleViewRange, inSelectionMode);
        }
        return result;
      }
      default:
        return null;
    }
  }
  static findPositionInViewportIfOutside(viewModel, cursor, visibleViewRange, inSelectionMode) {
    const viewLineNumber = cursor.viewState.position.lineNumber;
    if (visibleViewRange.startLineNumber <= viewLineNumber && viewLineNumber <= visibleViewRange.endLineNumber - 1) {
      return new CursorState(cursor.modelState, cursor.viewState);
    } else {
      let newViewLineNumber;
      if (viewLineNumber > visibleViewRange.endLineNumber - 1) {
        newViewLineNumber = visibleViewRange.endLineNumber - 1;
      } else if (viewLineNumber < visibleViewRange.startLineNumber) {
        newViewLineNumber = visibleViewRange.startLineNumber;
      } else {
        newViewLineNumber = viewLineNumber;
      }
      const position = MoveOperations.vertical(viewModel.cursorConfig, viewModel, viewLineNumber, cursor.viewState.position.column, cursor.viewState.leftoverVisibleColumns, newViewLineNumber, false);
      return CursorState.fromViewState(cursor.viewState.move(inSelectionMode, position.lineNumber, position.column, position.leftoverVisibleColumns));
    }
  }
  /**
   * Find the nth line start included in the range (from the start).
   */
  static _firstLineNumberInRange(model, range, count) {
    let startLineNumber = range.startLineNumber;
    if (range.startColumn !== model.getLineMinColumn(startLineNumber)) {
      startLineNumber++;
    }
    return Math.min(range.endLineNumber, startLineNumber + count - 1);
  }
  /**
   * Find the nth line start included in the range (from the end).
   */
  static _lastLineNumberInRange(model, range, count) {
    let startLineNumber = range.startLineNumber;
    if (range.startColumn !== model.getLineMinColumn(startLineNumber)) {
      startLineNumber++;
    }
    return Math.max(startLineNumber, range.endLineNumber - count + 1);
  }
  static _moveLeft(viewModel, cursors, inSelectionMode, noOfColumns) {
    return cursors.map(
      (cursor) => CursorState.fromViewState(
        MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)
      )
    );
  }
  static _moveHalfLineLeft(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const halfLine = Math.round(viewModel.getLineLength(viewLineNumber) / 2);
      result[i] = CursorState.fromViewState(MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
    }
    return result;
  }
  static _moveRight(viewModel, cursors, inSelectionMode, noOfColumns) {
    return cursors.map(
      (cursor) => CursorState.fromViewState(
        MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)
      )
    );
  }
  static _moveHalfLineRight(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const halfLine = Math.round(viewModel.getLineLength(viewLineNumber) / 2);
      result[i] = CursorState.fromViewState(MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
    }
    return result;
  }
  static _moveDownByViewLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = CursorState.fromViewState(MoveOperations.moveDown(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveDownByModelLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = CursorState.fromModelState(MoveOperations.moveDown(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveUpByViewLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = CursorState.fromViewState(MoveOperations.moveUp(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveUpByModelLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      result[i] = CursorState.fromModelState(MoveOperations.moveUp(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveToViewPosition(viewModel, cursor, inSelectionMode, toViewLineNumber, toViewColumn) {
    return CursorState.fromViewState(cursor.viewState.move(inSelectionMode, toViewLineNumber, toViewColumn, 0));
  }
  static _moveToModelPosition(viewModel, cursor, inSelectionMode, toModelLineNumber, toModelColumn) {
    return CursorState.fromModelState(cursor.modelState.move(inSelectionMode, toModelLineNumber, toModelColumn, 0));
  }
  static _moveToViewMinColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineMinColumn(viewLineNumber);
      result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewFirstNonWhitespaceColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineFirstNonWhitespaceColumn(viewLineNumber);
      result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewCenterColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = Math.round((viewModel.getLineMaxColumn(viewLineNumber) + viewModel.getLineMinColumn(viewLineNumber)) / 2);
      result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewMaxColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineMaxColumn(viewLineNumber);
      result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewLastNonWhitespaceColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i = 0, len = cursors.length; i < len; i++) {
      const cursor = cursors[i];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineLastNonWhitespaceColumn(viewLineNumber);
      result[i] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
}
var CursorMove;
((CursorMove2) => {
  const isCursorMoveArgs = /* @__PURE__ */ __name(function(arg) {
    if (!types.isObject(arg)) {
      return false;
    }
    const cursorMoveArg = arg;
    if (!types.isString(cursorMoveArg.to)) {
      return false;
    }
    if (!types.isUndefined(cursorMoveArg.select) && !types.isBoolean(cursorMoveArg.select)) {
      return false;
    }
    if (!types.isUndefined(cursorMoveArg.by) && !types.isString(cursorMoveArg.by)) {
      return false;
    }
    if (!types.isUndefined(cursorMoveArg.value) && !types.isNumber(cursorMoveArg.value)) {
      return false;
    }
    return true;
  }, "isCursorMoveArgs");
  CursorMove2.metadata = {
    description: "Move cursor to a logical position in the view",
    args: [
      {
        name: "Cursor move argument object",
        description: `Property-value pairs that can be passed through this argument:
					* 'to': A mandatory logical position value providing where to move the cursor.
						\`\`\`
						'left', 'right', 'up', 'down', 'prevBlankLine', 'nextBlankLine',
						'wrappedLineStart', 'wrappedLineEnd', 'wrappedLineColumnCenter'
						'wrappedLineFirstNonWhitespaceCharacter', 'wrappedLineLastNonWhitespaceCharacter'
						'viewPortTop', 'viewPortCenter', 'viewPortBottom', 'viewPortIfOutside'
						\`\`\`
					* 'by': Unit to move. Default is computed based on 'to' value.
						\`\`\`
						'line', 'wrappedLine', 'character', 'halfLine'
						\`\`\`
					* 'value': Number of units to move. Default is '1'.
					* 'select': If 'true' makes the selection. Default is 'false'.
				`,
        constraint: isCursorMoveArgs,
        schema: {
          "type": "object",
          "required": ["to"],
          "properties": {
            "to": {
              "type": "string",
              "enum": ["left", "right", "up", "down", "prevBlankLine", "nextBlankLine", "wrappedLineStart", "wrappedLineEnd", "wrappedLineColumnCenter", "wrappedLineFirstNonWhitespaceCharacter", "wrappedLineLastNonWhitespaceCharacter", "viewPortTop", "viewPortCenter", "viewPortBottom", "viewPortIfOutside"]
            },
            "by": {
              "type": "string",
              "enum": ["line", "wrappedLine", "character", "halfLine"]
            },
            "value": {
              "type": "number",
              "default": 1
            },
            "select": {
              "type": "boolean",
              "default": false
            }
          }
        }
      }
    ]
  };
  CursorMove2.RawDirection = {
    Left: "left",
    Right: "right",
    Up: "up",
    Down: "down",
    PrevBlankLine: "prevBlankLine",
    NextBlankLine: "nextBlankLine",
    WrappedLineStart: "wrappedLineStart",
    WrappedLineFirstNonWhitespaceCharacter: "wrappedLineFirstNonWhitespaceCharacter",
    WrappedLineColumnCenter: "wrappedLineColumnCenter",
    WrappedLineEnd: "wrappedLineEnd",
    WrappedLineLastNonWhitespaceCharacter: "wrappedLineLastNonWhitespaceCharacter",
    ViewPortTop: "viewPortTop",
    ViewPortCenter: "viewPortCenter",
    ViewPortBottom: "viewPortBottom",
    ViewPortIfOutside: "viewPortIfOutside"
  };
  CursorMove2.RawUnit = {
    Line: "line",
    WrappedLine: "wrappedLine",
    Character: "character",
    HalfLine: "halfLine"
  };
  function parse(args) {
    if (!args.to) {
      return null;
    }
    let direction;
    switch (args.to) {
      case CursorMove2.RawDirection.Left:
        direction = 0 /* Left */;
        break;
      case CursorMove2.RawDirection.Right:
        direction = 1 /* Right */;
        break;
      case CursorMove2.RawDirection.Up:
        direction = 2 /* Up */;
        break;
      case CursorMove2.RawDirection.Down:
        direction = 3 /* Down */;
        break;
      case CursorMove2.RawDirection.PrevBlankLine:
        direction = 4 /* PrevBlankLine */;
        break;
      case CursorMove2.RawDirection.NextBlankLine:
        direction = 5 /* NextBlankLine */;
        break;
      case CursorMove2.RawDirection.WrappedLineStart:
        direction = 6 /* WrappedLineStart */;
        break;
      case CursorMove2.RawDirection.WrappedLineFirstNonWhitespaceCharacter:
        direction = 7 /* WrappedLineFirstNonWhitespaceCharacter */;
        break;
      case CursorMove2.RawDirection.WrappedLineColumnCenter:
        direction = 8 /* WrappedLineColumnCenter */;
        break;
      case CursorMove2.RawDirection.WrappedLineEnd:
        direction = 9 /* WrappedLineEnd */;
        break;
      case CursorMove2.RawDirection.WrappedLineLastNonWhitespaceCharacter:
        direction = 10 /* WrappedLineLastNonWhitespaceCharacter */;
        break;
      case CursorMove2.RawDirection.ViewPortTop:
        direction = 11 /* ViewPortTop */;
        break;
      case CursorMove2.RawDirection.ViewPortBottom:
        direction = 13 /* ViewPortBottom */;
        break;
      case CursorMove2.RawDirection.ViewPortCenter:
        direction = 12 /* ViewPortCenter */;
        break;
      case CursorMove2.RawDirection.ViewPortIfOutside:
        direction = 14 /* ViewPortIfOutside */;
        break;
      default:
        return null;
    }
    let unit = 0 /* None */;
    switch (args.by) {
      case CursorMove2.RawUnit.Line:
        unit = 1 /* Line */;
        break;
      case CursorMove2.RawUnit.WrappedLine:
        unit = 2 /* WrappedLine */;
        break;
      case CursorMove2.RawUnit.Character:
        unit = 3 /* Character */;
        break;
      case CursorMove2.RawUnit.HalfLine:
        unit = 4 /* HalfLine */;
        break;
    }
    return {
      direction,
      unit,
      select: !!args.select,
      value: args.value || 1
    };
  }
  CursorMove2.parse = parse;
  __name(parse, "parse");
  let Direction;
  ((Direction2) => {
    Direction2[Direction2["Left"] = 0] = "Left";
    Direction2[Direction2["Right"] = 1] = "Right";
    Direction2[Direction2["Up"] = 2] = "Up";
    Direction2[Direction2["Down"] = 3] = "Down";
    Direction2[Direction2["PrevBlankLine"] = 4] = "PrevBlankLine";
    Direction2[Direction2["NextBlankLine"] = 5] = "NextBlankLine";
    Direction2[Direction2["WrappedLineStart"] = 6] = "WrappedLineStart";
    Direction2[Direction2["WrappedLineFirstNonWhitespaceCharacter"] = 7] = "WrappedLineFirstNonWhitespaceCharacter";
    Direction2[Direction2["WrappedLineColumnCenter"] = 8] = "WrappedLineColumnCenter";
    Direction2[Direction2["WrappedLineEnd"] = 9] = "WrappedLineEnd";
    Direction2[Direction2["WrappedLineLastNonWhitespaceCharacter"] = 10] = "WrappedLineLastNonWhitespaceCharacter";
    Direction2[Direction2["ViewPortTop"] = 11] = "ViewPortTop";
    Direction2[Direction2["ViewPortCenter"] = 12] = "ViewPortCenter";
    Direction2[Direction2["ViewPortBottom"] = 13] = "ViewPortBottom";
    Direction2[Direction2["ViewPortIfOutside"] = 14] = "ViewPortIfOutside";
  })(Direction = CursorMove2.Direction || (CursorMove2.Direction = {}));
  let Unit;
  ((Unit2) => {
    Unit2[Unit2["None"] = 0] = "None";
    Unit2[Unit2["Line"] = 1] = "Line";
    Unit2[Unit2["WrappedLine"] = 2] = "WrappedLine";
    Unit2[Unit2["Character"] = 3] = "Character";
    Unit2[Unit2["HalfLine"] = 4] = "HalfLine";
  })(Unit = CursorMove2.Unit || (CursorMove2.Unit = {}));
})(CursorMove || (CursorMove = {}));
export {
  CursorMove,
  CursorMoveCommands
};
//# sourceMappingURL=cursorMoveCommands.js.map
