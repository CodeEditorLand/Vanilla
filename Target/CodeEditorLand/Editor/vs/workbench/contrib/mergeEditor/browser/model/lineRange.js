var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Comparator, compareBy, numberComparator } from "../../../../../base/common/arrays.js";
import { BugIndicatingError } from "../../../../../base/common/errors.js";
import { Constants } from "../../../../../base/common/uint.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ITextModel } from "../../../../../editor/common/model.js";
class LineRange {
  constructor(startLineNumber, lineCount) {
    this.startLineNumber = startLineNumber;
    this.lineCount = lineCount;
    if (lineCount < 0) {
      throw new BugIndicatingError();
    }
  }
  static {
    __name(this, "LineRange");
  }
  static compareByStart = compareBy((l) => l.startLineNumber, numberComparator);
  static join(ranges) {
    if (ranges.length === 0) {
      return void 0;
    }
    let startLineNumber = Number.MAX_SAFE_INTEGER;
    let endLineNumber = 0;
    for (const range of ranges) {
      startLineNumber = Math.min(startLineNumber, range.startLineNumber);
      endLineNumber = Math.max(endLineNumber, range.startLineNumber + range.lineCount);
    }
    return new LineRange(startLineNumber, endLineNumber - startLineNumber);
  }
  static fromLineNumbers(startLineNumber, endExclusiveLineNumber) {
    return new LineRange(startLineNumber, endExclusiveLineNumber - startLineNumber);
  }
  join(other) {
    return new LineRange(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive) - this.startLineNumber);
  }
  get endLineNumberExclusive() {
    return this.startLineNumber + this.lineCount;
  }
  get isEmpty() {
    return this.lineCount === 0;
  }
  /**
   * Returns false if there is at least one line between `this` and `other`.
  */
  touches(other) {
    return this.endLineNumberExclusive >= other.startLineNumber && other.endLineNumberExclusive >= this.startLineNumber;
  }
  isAfter(range) {
    return this.startLineNumber >= range.endLineNumberExclusive;
  }
  isBefore(range) {
    return range.startLineNumber >= this.endLineNumberExclusive;
  }
  delta(lineDelta) {
    return new LineRange(this.startLineNumber + lineDelta, this.lineCount);
  }
  toString() {
    return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
  }
  equals(originalRange) {
    return this.startLineNumber === originalRange.startLineNumber && this.lineCount === originalRange.lineCount;
  }
  contains(lineNumber) {
    return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
  }
  deltaEnd(delta) {
    return new LineRange(this.startLineNumber, this.lineCount + delta);
  }
  deltaStart(lineDelta) {
    return new LineRange(this.startLineNumber + lineDelta, this.lineCount - lineDelta);
  }
  getLines(model) {
    const result = new Array(this.lineCount);
    for (let i = 0; i < this.lineCount; i++) {
      result[i] = model.getLineContent(this.startLineNumber + i);
    }
    return result;
  }
  containsRange(range) {
    return this.startLineNumber <= range.startLineNumber && range.endLineNumberExclusive <= this.endLineNumberExclusive;
  }
  toRange() {
    return new Range(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
  }
  toInclusiveRange() {
    if (this.isEmpty) {
      return void 0;
    }
    return new Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Constants.MAX_SAFE_SMALL_INTEGER);
  }
  toInclusiveRangeOrEmpty() {
    if (this.isEmpty) {
      return new Range(this.startLineNumber, 1, this.startLineNumber, 1);
    }
    return new Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Constants.MAX_SAFE_SMALL_INTEGER);
  }
  intersects(lineRange) {
    return this.startLineNumber <= lineRange.endLineNumberExclusive && lineRange.startLineNumber <= this.endLineNumberExclusive;
  }
}
export {
  LineRange
};
//# sourceMappingURL=lineRange.js.map
