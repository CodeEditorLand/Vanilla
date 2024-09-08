import * as strings from "../../../base/common/strings.js";
import { Constants } from "../../../base/common/uint.js";
import { CursorColumns } from "../core/cursorColumns.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import {
  SelectionStartKind,
  SingleCursorState
} from "../cursorCommon.js";
import { PositionAffinity } from "../model.js";
import {
  AtomicTabMoveOperations,
  Direction
} from "./cursorAtomicMoveOperations.js";
class CursorPosition {
  _cursorPositionBrand = void 0;
  lineNumber;
  column;
  leftoverVisibleColumns;
  constructor(lineNumber, column, leftoverVisibleColumns) {
    this.lineNumber = lineNumber;
    this.column = column;
    this.leftoverVisibleColumns = leftoverVisibleColumns;
  }
}
class MoveOperations {
  static leftPosition(model, position) {
    if (position.column > model.getLineMinColumn(position.lineNumber)) {
      return position.delta(
        void 0,
        -strings.prevCharLength(
          model.getLineContent(position.lineNumber),
          position.column - 1
        )
      );
    } else if (position.lineNumber > 1) {
      const newLineNumber = position.lineNumber - 1;
      return new Position(
        newLineNumber,
        model.getLineMaxColumn(newLineNumber)
      );
    } else {
      return position;
    }
  }
  static leftPositionAtomicSoftTabs(model, position, tabSize) {
    if (position.column <= model.getLineIndentColumn(position.lineNumber)) {
      const minColumn = model.getLineMinColumn(position.lineNumber);
      const lineContent = model.getLineContent(position.lineNumber);
      const newPosition = AtomicTabMoveOperations.atomicPosition(
        lineContent,
        position.column - 1,
        tabSize,
        Direction.Left
      );
      if (newPosition !== -1 && newPosition + 1 >= minColumn) {
        return new Position(position.lineNumber, newPosition + 1);
      }
    }
    return this.leftPosition(model, position);
  }
  static left(config, model, position) {
    const pos = config.stickyTabStops ? MoveOperations.leftPositionAtomicSoftTabs(
      model,
      position,
      config.tabSize
    ) : MoveOperations.leftPosition(model, position);
    return new CursorPosition(pos.lineNumber, pos.column, 0);
  }
  /**
   * @param noOfColumns Must be either `1`
   * or `Math.round(viewModel.getLineContent(viewLineNumber).length / 2)` (for half lines).
   */
  static moveLeft(config, model, cursor, inSelectionMode, noOfColumns) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.startLineNumber;
      column = cursor.selection.startColumn;
    } else {
      const pos = cursor.position.delta(void 0, -(noOfColumns - 1));
      const normalizedPos = model.normalizePosition(
        MoveOperations.clipPositionColumn(pos, model),
        PositionAffinity.Left
      );
      const p = MoveOperations.left(config, model, normalizedPos);
      lineNumber = p.lineNumber;
      column = p.column;
    }
    return cursor.move(inSelectionMode, lineNumber, column, 0);
  }
  /**
   * Adjusts the column so that it is within min/max of the line.
   */
  static clipPositionColumn(position, model) {
    return new Position(
      position.lineNumber,
      MoveOperations.clipRange(
        position.column,
        model.getLineMinColumn(position.lineNumber),
        model.getLineMaxColumn(position.lineNumber)
      )
    );
  }
  static clipRange(value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
  static rightPosition(model, lineNumber, column) {
    if (column < model.getLineMaxColumn(lineNumber)) {
      column = column + strings.nextCharLength(
        model.getLineContent(lineNumber),
        column - 1
      );
    } else if (lineNumber < model.getLineCount()) {
      lineNumber = lineNumber + 1;
      column = model.getLineMinColumn(lineNumber);
    }
    return new Position(lineNumber, column);
  }
  static rightPositionAtomicSoftTabs(model, lineNumber, column, tabSize, indentSize) {
    if (column < model.getLineIndentColumn(lineNumber)) {
      const lineContent = model.getLineContent(lineNumber);
      const newPosition = AtomicTabMoveOperations.atomicPosition(
        lineContent,
        column - 1,
        tabSize,
        Direction.Right
      );
      if (newPosition !== -1) {
        return new Position(lineNumber, newPosition + 1);
      }
    }
    return this.rightPosition(model, lineNumber, column);
  }
  static right(config, model, position) {
    const pos = config.stickyTabStops ? MoveOperations.rightPositionAtomicSoftTabs(
      model,
      position.lineNumber,
      position.column,
      config.tabSize,
      config.indentSize
    ) : MoveOperations.rightPosition(
      model,
      position.lineNumber,
      position.column
    );
    return new CursorPosition(pos.lineNumber, pos.column, 0);
  }
  static moveRight(config, model, cursor, inSelectionMode, noOfColumns) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.endLineNumber;
      column = cursor.selection.endColumn;
    } else {
      const pos = cursor.position.delta(void 0, noOfColumns - 1);
      const normalizedPos = model.normalizePosition(
        MoveOperations.clipPositionColumn(pos, model),
        PositionAffinity.Right
      );
      const r = MoveOperations.right(config, model, normalizedPos);
      lineNumber = r.lineNumber;
      column = r.column;
    }
    return cursor.move(inSelectionMode, lineNumber, column, 0);
  }
  static vertical(config, model, lineNumber, column, leftoverVisibleColumns, newLineNumber, allowMoveOnEdgeLine, normalizationAffinity) {
    const currentVisibleColumn = CursorColumns.visibleColumnFromColumn(
      model.getLineContent(lineNumber),
      column,
      config.tabSize
    ) + leftoverVisibleColumns;
    const lineCount = model.getLineCount();
    const wasOnFirstPosition = lineNumber === 1 && column === 1;
    const wasOnLastPosition = lineNumber === lineCount && column === model.getLineMaxColumn(lineNumber);
    const wasAtEdgePosition = newLineNumber < lineNumber ? wasOnFirstPosition : wasOnLastPosition;
    lineNumber = newLineNumber;
    if (lineNumber < 1) {
      lineNumber = 1;
      if (allowMoveOnEdgeLine) {
        column = model.getLineMinColumn(lineNumber);
      } else {
        column = Math.min(model.getLineMaxColumn(lineNumber), column);
      }
    } else if (lineNumber > lineCount) {
      lineNumber = lineCount;
      if (allowMoveOnEdgeLine) {
        column = model.getLineMaxColumn(lineNumber);
      } else {
        column = Math.min(model.getLineMaxColumn(lineNumber), column);
      }
    } else {
      column = config.columnFromVisibleColumn(
        model,
        lineNumber,
        currentVisibleColumn
      );
    }
    if (wasAtEdgePosition) {
      leftoverVisibleColumns = 0;
    } else {
      leftoverVisibleColumns = currentVisibleColumn - CursorColumns.visibleColumnFromColumn(
        model.getLineContent(lineNumber),
        column,
        config.tabSize
      );
    }
    if (normalizationAffinity !== void 0) {
      const position = new Position(lineNumber, column);
      const newPosition = model.normalizePosition(
        position,
        normalizationAffinity
      );
      leftoverVisibleColumns = leftoverVisibleColumns + (column - newPosition.column);
      lineNumber = newPosition.lineNumber;
      column = newPosition.column;
    }
    return new CursorPosition(lineNumber, column, leftoverVisibleColumns);
  }
  static down(config, model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnLastLine) {
    return this.vertical(
      config,
      model,
      lineNumber,
      column,
      leftoverVisibleColumns,
      lineNumber + count,
      allowMoveOnLastLine,
      PositionAffinity.RightOfInjectedText
    );
  }
  static moveDown(config, model, cursor, inSelectionMode, linesCount) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.endLineNumber;
      column = cursor.selection.endColumn;
    } else {
      lineNumber = cursor.position.lineNumber;
      column = cursor.position.column;
    }
    let i = 0;
    let r;
    do {
      r = MoveOperations.down(
        config,
        model,
        lineNumber + i,
        column,
        cursor.leftoverVisibleColumns,
        linesCount,
        true
      );
      const np = model.normalizePosition(
        new Position(r.lineNumber, r.column),
        PositionAffinity.None
      );
      if (np.lineNumber > lineNumber) {
        break;
      }
    } while (i++ < 10 && lineNumber + i < model.getLineCount());
    return cursor.move(
      inSelectionMode,
      r.lineNumber,
      r.column,
      r.leftoverVisibleColumns
    );
  }
  static translateDown(config, model, cursor) {
    const selection = cursor.selection;
    const selectionStart = MoveOperations.down(
      config,
      model,
      selection.selectionStartLineNumber,
      selection.selectionStartColumn,
      cursor.selectionStartLeftoverVisibleColumns,
      1,
      false
    );
    const position = MoveOperations.down(
      config,
      model,
      selection.positionLineNumber,
      selection.positionColumn,
      cursor.leftoverVisibleColumns,
      1,
      false
    );
    return new SingleCursorState(
      new Range(
        selectionStart.lineNumber,
        selectionStart.column,
        selectionStart.lineNumber,
        selectionStart.column
      ),
      SelectionStartKind.Simple,
      selectionStart.leftoverVisibleColumns,
      new Position(position.lineNumber, position.column),
      position.leftoverVisibleColumns
    );
  }
  static up(config, model, lineNumber, column, leftoverVisibleColumns, count, allowMoveOnFirstLine) {
    return this.vertical(
      config,
      model,
      lineNumber,
      column,
      leftoverVisibleColumns,
      lineNumber - count,
      allowMoveOnFirstLine,
      PositionAffinity.LeftOfInjectedText
    );
  }
  static moveUp(config, model, cursor, inSelectionMode, linesCount) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.startLineNumber;
      column = cursor.selection.startColumn;
    } else {
      lineNumber = cursor.position.lineNumber;
      column = cursor.position.column;
    }
    const r = MoveOperations.up(
      config,
      model,
      lineNumber,
      column,
      cursor.leftoverVisibleColumns,
      linesCount,
      true
    );
    return cursor.move(
      inSelectionMode,
      r.lineNumber,
      r.column,
      r.leftoverVisibleColumns
    );
  }
  static translateUp(config, model, cursor) {
    const selection = cursor.selection;
    const selectionStart = MoveOperations.up(
      config,
      model,
      selection.selectionStartLineNumber,
      selection.selectionStartColumn,
      cursor.selectionStartLeftoverVisibleColumns,
      1,
      false
    );
    const position = MoveOperations.up(
      config,
      model,
      selection.positionLineNumber,
      selection.positionColumn,
      cursor.leftoverVisibleColumns,
      1,
      false
    );
    return new SingleCursorState(
      new Range(
        selectionStart.lineNumber,
        selectionStart.column,
        selectionStart.lineNumber,
        selectionStart.column
      ),
      SelectionStartKind.Simple,
      selectionStart.leftoverVisibleColumns,
      new Position(position.lineNumber, position.column),
      position.leftoverVisibleColumns
    );
  }
  static _isBlankLine(model, lineNumber) {
    if (model.getLineFirstNonWhitespaceColumn(lineNumber) === 0) {
      return true;
    }
    return false;
  }
  static moveToPrevBlankLine(config, model, cursor, inSelectionMode) {
    let lineNumber = cursor.position.lineNumber;
    while (lineNumber > 1 && this._isBlankLine(model, lineNumber)) {
      lineNumber--;
    }
    while (lineNumber > 1 && !this._isBlankLine(model, lineNumber)) {
      lineNumber--;
    }
    return cursor.move(
      inSelectionMode,
      lineNumber,
      model.getLineMinColumn(lineNumber),
      0
    );
  }
  static moveToNextBlankLine(config, model, cursor, inSelectionMode) {
    const lineCount = model.getLineCount();
    let lineNumber = cursor.position.lineNumber;
    while (lineNumber < lineCount && this._isBlankLine(model, lineNumber)) {
      lineNumber++;
    }
    while (lineNumber < lineCount && !this._isBlankLine(model, lineNumber)) {
      lineNumber++;
    }
    return cursor.move(
      inSelectionMode,
      lineNumber,
      model.getLineMinColumn(lineNumber),
      0
    );
  }
  static moveToBeginningOfLine(config, model, cursor, inSelectionMode) {
    const lineNumber = cursor.position.lineNumber;
    const minColumn = model.getLineMinColumn(lineNumber);
    const firstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(lineNumber) || minColumn;
    let column;
    const relevantColumnNumber = cursor.position.column;
    if (relevantColumnNumber === firstNonBlankColumn) {
      column = minColumn;
    } else {
      column = firstNonBlankColumn;
    }
    return cursor.move(inSelectionMode, lineNumber, column, 0);
  }
  static moveToEndOfLine(config, model, cursor, inSelectionMode, sticky) {
    const lineNumber = cursor.position.lineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    return cursor.move(
      inSelectionMode,
      lineNumber,
      maxColumn,
      sticky ? Constants.MAX_SAFE_SMALL_INTEGER - maxColumn : 0
    );
  }
  static moveToBeginningOfBuffer(config, model, cursor, inSelectionMode) {
    return cursor.move(inSelectionMode, 1, 1, 0);
  }
  static moveToEndOfBuffer(config, model, cursor, inSelectionMode) {
    const lastLineNumber = model.getLineCount();
    const lastColumn = model.getLineMaxColumn(lastLineNumber);
    return cursor.move(inSelectionMode, lastLineNumber, lastColumn, 0);
  }
}
export {
  CursorPosition,
  MoveOperations
};
