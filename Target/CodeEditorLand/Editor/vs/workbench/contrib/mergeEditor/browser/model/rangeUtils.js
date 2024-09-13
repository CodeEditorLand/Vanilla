var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Position } from "../../../../../editor/common/core/position.js";
import { TextLength } from "../../../../../editor/common/core/textLength.js";
function rangeContainsPosition(range, position) {
  if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
    return false;
  }
  if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
    return false;
  }
  if (position.lineNumber === range.endLineNumber && position.column >= range.endColumn) {
    return false;
  }
  return true;
}
__name(rangeContainsPosition, "rangeContainsPosition");
function lengthOfRange(range) {
  if (range.startLineNumber === range.endLineNumber) {
    return new TextLength(0, range.endColumn - range.startColumn);
  } else {
    return new TextLength(
      range.endLineNumber - range.startLineNumber,
      range.endColumn - 1
    );
  }
}
__name(lengthOfRange, "lengthOfRange");
function lengthBetweenPositions(position1, position2) {
  if (position1.lineNumber === position2.lineNumber) {
    return new TextLength(0, position2.column - position1.column);
  } else {
    return new TextLength(
      position2.lineNumber - position1.lineNumber,
      position2.column - 1
    );
  }
}
__name(lengthBetweenPositions, "lengthBetweenPositions");
function addLength(position, length) {
  if (length.lineCount === 0) {
    return new Position(
      position.lineNumber,
      position.column + length.columnCount
    );
  } else {
    return new Position(
      position.lineNumber + length.lineCount,
      length.columnCount + 1
    );
  }
}
__name(addLength, "addLength");
function rangeIsBeforeOrTouching(range, other) {
  return range.endLineNumber < other.startLineNumber || range.endLineNumber === other.startLineNumber && range.endColumn <= other.startColumn;
}
__name(rangeIsBeforeOrTouching, "rangeIsBeforeOrTouching");
export {
  addLength,
  lengthBetweenPositions,
  lengthOfRange,
  rangeContainsPosition,
  rangeIsBeforeOrTouching
};
//# sourceMappingURL=rangeUtils.js.map
