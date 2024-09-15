var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CursorConfiguration, ICursorSimpleModel, SingleCursorState, IColumnSelectData, SelectionStartKind } from "../cursorCommon.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
class ColumnSelection {
  static {
    __name(this, "ColumnSelection");
  }
  static columnSelect(config, model, fromLineNumber, fromVisibleColumn, toLineNumber, toVisibleColumn) {
    const lineCount = Math.abs(toLineNumber - fromLineNumber) + 1;
    const reversed = fromLineNumber > toLineNumber;
    const isRTL = fromVisibleColumn > toVisibleColumn;
    const isLTR = fromVisibleColumn < toVisibleColumn;
    const result = [];
    for (let i = 0; i < lineCount; i++) {
      const lineNumber = fromLineNumber + (reversed ? -i : i);
      const startColumn = config.columnFromVisibleColumn(model, lineNumber, fromVisibleColumn);
      const endColumn = config.columnFromVisibleColumn(model, lineNumber, toVisibleColumn);
      const visibleStartColumn = config.visibleColumnFromColumn(model, new Position(lineNumber, startColumn));
      const visibleEndColumn = config.visibleColumnFromColumn(model, new Position(lineNumber, endColumn));
      if (isLTR) {
        if (visibleStartColumn > toVisibleColumn) {
          continue;
        }
        if (visibleEndColumn < fromVisibleColumn) {
          continue;
        }
      }
      if (isRTL) {
        if (visibleEndColumn > fromVisibleColumn) {
          continue;
        }
        if (visibleStartColumn < toVisibleColumn) {
          continue;
        }
      }
      result.push(new SingleCursorState(
        new Range(lineNumber, startColumn, lineNumber, startColumn),
        SelectionStartKind.Simple,
        0,
        new Position(lineNumber, endColumn),
        0
      ));
    }
    if (result.length === 0) {
      for (let i = 0; i < lineCount; i++) {
        const lineNumber = fromLineNumber + (reversed ? -i : i);
        const maxColumn = model.getLineMaxColumn(lineNumber);
        result.push(new SingleCursorState(
          new Range(lineNumber, maxColumn, lineNumber, maxColumn),
          SelectionStartKind.Simple,
          0,
          new Position(lineNumber, maxColumn),
          0
        ));
      }
    }
    return {
      viewStates: result,
      reversed,
      fromLineNumber,
      fromVisualColumn: fromVisibleColumn,
      toLineNumber,
      toVisualColumn: toVisibleColumn
    };
  }
  static columnSelectLeft(config, model, prevColumnSelectData) {
    let toViewVisualColumn = prevColumnSelectData.toViewVisualColumn;
    if (toViewVisualColumn > 0) {
      toViewVisualColumn--;
    }
    return ColumnSelection.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, prevColumnSelectData.toViewLineNumber, toViewVisualColumn);
  }
  static columnSelectRight(config, model, prevColumnSelectData) {
    let maxVisualViewColumn = 0;
    const minViewLineNumber = Math.min(prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.toViewLineNumber);
    const maxViewLineNumber = Math.max(prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.toViewLineNumber);
    for (let lineNumber = minViewLineNumber; lineNumber <= maxViewLineNumber; lineNumber++) {
      const lineMaxViewColumn = model.getLineMaxColumn(lineNumber);
      const lineMaxVisualViewColumn = config.visibleColumnFromColumn(model, new Position(lineNumber, lineMaxViewColumn));
      maxVisualViewColumn = Math.max(maxVisualViewColumn, lineMaxVisualViewColumn);
    }
    let toViewVisualColumn = prevColumnSelectData.toViewVisualColumn;
    if (toViewVisualColumn < maxVisualViewColumn) {
      toViewVisualColumn++;
    }
    return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, prevColumnSelectData.toViewLineNumber, toViewVisualColumn);
  }
  static columnSelectUp(config, model, prevColumnSelectData, isPaged) {
    const linesCount = isPaged ? config.pageSize : 1;
    const toViewLineNumber = Math.max(1, prevColumnSelectData.toViewLineNumber - linesCount);
    return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, toViewLineNumber, prevColumnSelectData.toViewVisualColumn);
  }
  static columnSelectDown(config, model, prevColumnSelectData, isPaged) {
    const linesCount = isPaged ? config.pageSize : 1;
    const toViewLineNumber = Math.min(model.getLineCount(), prevColumnSelectData.toViewLineNumber + linesCount);
    return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, toViewLineNumber, prevColumnSelectData.toViewVisualColumn);
  }
}
export {
  ColumnSelection
};
//# sourceMappingURL=cursorColumnSelection.js.map
