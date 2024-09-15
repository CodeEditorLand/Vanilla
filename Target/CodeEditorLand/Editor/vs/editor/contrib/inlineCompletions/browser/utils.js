var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Permutation, compareBy } from "../../../../base/common/arrays.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import {
  autorun,
  observableValue,
  transaction
} from "../../../../base/common/observable.js";
import { splitLinesIncludeSeparators } from "../../../../base/common/strings.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import {
  TextEdit
} from "../../../common/core/textEdit.js";
const array = [];
function getReadonlyEmptyArray() {
  return array;
}
__name(getReadonlyEmptyArray, "getReadonlyEmptyArray");
class ColumnRange {
  constructor(startColumn, endColumnExclusive) {
    this.startColumn = startColumn;
    this.endColumnExclusive = endColumnExclusive;
    if (startColumn > endColumnExclusive) {
      throw new BugIndicatingError(
        `startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`
      );
    }
  }
  static {
    __name(this, "ColumnRange");
  }
  toRange(lineNumber) {
    return new Range(
      lineNumber,
      this.startColumn,
      lineNumber,
      this.endColumnExclusive
    );
  }
  equals(other) {
    return this.startColumn === other.startColumn && this.endColumnExclusive === other.endColumnExclusive;
  }
}
function addPositions(pos1, pos2) {
  return new Position(
    pos1.lineNumber + pos2.lineNumber - 1,
    pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column
  );
}
__name(addPositions, "addPositions");
function subtractPositions(pos1, pos2) {
  return new Position(
    pos1.lineNumber - pos2.lineNumber + 1,
    pos1.lineNumber - pos2.lineNumber === 0 ? pos1.column - pos2.column + 1 : pos1.column
  );
}
__name(subtractPositions, "subtractPositions");
function substringPos(text, pos) {
  let subtext = "";
  const lines = splitLinesIncludeSeparators(text);
  for (let i = pos.lineNumber - 1; i < lines.length; i++) {
    subtext += lines[i].substring(
      i === pos.lineNumber - 1 ? pos.column - 1 : 0
    );
  }
  return subtext;
}
__name(substringPos, "substringPos");
function getEndPositionsAfterApplying(edits) {
  const sortPerm = Permutation.createSortPermutation(
    edits,
    compareBy((e) => e.range, Range.compareRangesUsingStarts)
  );
  const edit = new TextEdit(sortPerm.apply(edits));
  const sortedNewRanges = edit.getNewRanges();
  const newRanges = sortPerm.inverse().apply(sortedNewRanges);
  return newRanges.map((range) => range.getEndPosition());
}
__name(getEndPositionsAfterApplying, "getEndPositionsAfterApplying");
function convertItemsToStableObservables(items, store) {
  const result = observableValue("result", []);
  const innerObservables = [];
  store.add(
    autorun((reader) => {
      const itemsValue = items.read(reader);
      transaction((tx) => {
        if (itemsValue.length !== innerObservables.length) {
          innerObservables.length = itemsValue.length;
          for (let i = 0; i < innerObservables.length; i++) {
            if (!innerObservables[i]) {
              innerObservables[i] = observableValue(
                "item",
                itemsValue[i]
              );
            }
          }
          result.set([...innerObservables], tx);
        }
        innerObservables.forEach((o, i) => o.set(itemsValue[i], tx));
      });
    })
  );
  return result;
}
__name(convertItemsToStableObservables, "convertItemsToStableObservables");
export {
  ColumnRange,
  addPositions,
  convertItemsToStableObservables,
  getEndPositionsAfterApplying,
  getReadonlyEmptyArray,
  substringPos,
  subtractPositions
};
//# sourceMappingURL=utils.js.map
