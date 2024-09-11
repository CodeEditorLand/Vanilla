var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../../../base/common/errors.js";
import { OffsetRange } from "./offsetRange.js";
import { Range } from "./range.js";
import { findFirstIdxMonotonousOrArrLen, findLastIdxMonotonous, findLastMonotonous } from "../../../base/common/arraysFind.js";
class LineRange {
  static {
    __name(this, "LineRange");
  }
  static fromRange(range) {
    return new LineRange(range.startLineNumber, range.endLineNumber);
  }
  static fromRangeInclusive(range) {
    return new LineRange(range.startLineNumber, range.endLineNumber + 1);
  }
  static subtract(a, b) {
    if (!b) {
      return [a];
    }
    if (a.startLineNumber < b.startLineNumber && b.endLineNumberExclusive < a.endLineNumberExclusive) {
      return [
        new LineRange(a.startLineNumber, b.startLineNumber),
        new LineRange(b.endLineNumberExclusive, a.endLineNumberExclusive)
      ];
    } else if (b.startLineNumber <= a.startLineNumber && a.endLineNumberExclusive <= b.endLineNumberExclusive) {
      return [];
    } else if (b.endLineNumberExclusive < a.endLineNumberExclusive) {
      return [new LineRange(Math.max(b.endLineNumberExclusive, a.startLineNumber), a.endLineNumberExclusive)];
    } else {
      return [new LineRange(a.startLineNumber, Math.min(b.startLineNumber, a.endLineNumberExclusive))];
    }
  }
  /**
   * @param lineRanges An array of sorted line ranges.
   */
  static joinMany(lineRanges) {
    if (lineRanges.length === 0) {
      return [];
    }
    let result = new LineRangeSet(lineRanges[0].slice());
    for (let i = 1; i < lineRanges.length; i++) {
      result = result.getUnion(new LineRangeSet(lineRanges[i].slice()));
    }
    return result.ranges;
  }
  static join(lineRanges) {
    if (lineRanges.length === 0) {
      throw new BugIndicatingError("lineRanges cannot be empty");
    }
    let startLineNumber = lineRanges[0].startLineNumber;
    let endLineNumberExclusive = lineRanges[0].endLineNumberExclusive;
    for (let i = 1; i < lineRanges.length; i++) {
      startLineNumber = Math.min(startLineNumber, lineRanges[i].startLineNumber);
      endLineNumberExclusive = Math.max(endLineNumberExclusive, lineRanges[i].endLineNumberExclusive);
    }
    return new LineRange(startLineNumber, endLineNumberExclusive);
  }
  static ofLength(startLineNumber, length) {
    return new LineRange(startLineNumber, startLineNumber + length);
  }
  /**
   * @internal
   */
  static deserialize(lineRange) {
    return new LineRange(lineRange[0], lineRange[1]);
  }
  /**
   * The start line number.
   */
  startLineNumber;
  /**
   * The end line number (exclusive).
   */
  endLineNumberExclusive;
  constructor(startLineNumber, endLineNumberExclusive) {
    if (startLineNumber > endLineNumberExclusive) {
      throw new BugIndicatingError(`startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`);
    }
    this.startLineNumber = startLineNumber;
    this.endLineNumberExclusive = endLineNumberExclusive;
  }
  /**
   * Indicates if this line range contains the given line number.
   */
  contains(lineNumber) {
    return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
  }
  /**
   * Indicates if this line range is empty.
   */
  get isEmpty() {
    return this.startLineNumber === this.endLineNumberExclusive;
  }
  /**
   * Moves this line range by the given offset of line numbers.
   */
  delta(offset) {
    return new LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
  }
  deltaLength(offset) {
    return new LineRange(this.startLineNumber, this.endLineNumberExclusive + offset);
  }
  /**
   * The number of lines this line range spans.
   */
  get length() {
    return this.endLineNumberExclusive - this.startLineNumber;
  }
  /**
   * Creates a line range that combines this and the given line range.
   */
  join(other) {
    return new LineRange(
      Math.min(this.startLineNumber, other.startLineNumber),
      Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive)
    );
  }
  toString() {
    return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
  }
  /**
   * The resulting range is empty if the ranges do not intersect, but touch.
   * If the ranges don't even touch, the result is undefined.
   */
  intersect(other) {
    const startLineNumber = Math.max(this.startLineNumber, other.startLineNumber);
    const endLineNumberExclusive = Math.min(this.endLineNumberExclusive, other.endLineNumberExclusive);
    if (startLineNumber <= endLineNumberExclusive) {
      return new LineRange(startLineNumber, endLineNumberExclusive);
    }
    return void 0;
  }
  intersectsStrict(other) {
    return this.startLineNumber < other.endLineNumberExclusive && other.startLineNumber < this.endLineNumberExclusive;
  }
  overlapOrTouch(other) {
    return this.startLineNumber <= other.endLineNumberExclusive && other.startLineNumber <= this.endLineNumberExclusive;
  }
  equals(b) {
    return this.startLineNumber === b.startLineNumber && this.endLineNumberExclusive === b.endLineNumberExclusive;
  }
  toInclusiveRange() {
    if (this.isEmpty) {
      return null;
    }
    return new Range(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER);
  }
  /**
   * @deprecated Using this function is discouraged because it might lead to bugs: The end position is not guaranteed to be a valid position!
  */
  toExclusiveRange() {
    return new Range(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
  }
  mapToLineArray(f) {
    const result = [];
    for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
      result.push(f(lineNumber));
    }
    return result;
  }
  forEach(f) {
    for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
      f(lineNumber);
    }
  }
  /**
   * @internal
   */
  serialize() {
    return [this.startLineNumber, this.endLineNumberExclusive];
  }
  includes(lineNumber) {
    return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
  }
  /**
   * Converts this 1-based line range to a 0-based offset range (subtracts 1!).
   * @internal
   */
  toOffsetRange() {
    return new OffsetRange(this.startLineNumber - 1, this.endLineNumberExclusive - 1);
  }
}
class LineRangeSet {
  constructor(_normalizedRanges = []) {
    this._normalizedRanges = _normalizedRanges;
  }
  static {
    __name(this, "LineRangeSet");
  }
  get ranges() {
    return this._normalizedRanges;
  }
  addRange(range) {
    if (range.length === 0) {
      return;
    }
    const joinRangeStartIdx = findFirstIdxMonotonousOrArrLen(this._normalizedRanges, (r) => r.endLineNumberExclusive >= range.startLineNumber);
    const joinRangeEndIdxExclusive = findLastIdxMonotonous(this._normalizedRanges, (r) => r.startLineNumber <= range.endLineNumberExclusive) + 1;
    if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
      this._normalizedRanges.splice(joinRangeStartIdx, 0, range);
    } else if (joinRangeStartIdx === joinRangeEndIdxExclusive - 1) {
      const joinRange = this._normalizedRanges[joinRangeStartIdx];
      this._normalizedRanges[joinRangeStartIdx] = joinRange.join(range);
    } else {
      const joinRange = this._normalizedRanges[joinRangeStartIdx].join(this._normalizedRanges[joinRangeEndIdxExclusive - 1]).join(range);
      this._normalizedRanges.splice(joinRangeStartIdx, joinRangeEndIdxExclusive - joinRangeStartIdx, joinRange);
    }
  }
  contains(lineNumber) {
    const rangeThatStartsBeforeEnd = findLastMonotonous(this._normalizedRanges, (r) => r.startLineNumber <= lineNumber);
    return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > lineNumber;
  }
  intersects(range) {
    const rangeThatStartsBeforeEnd = findLastMonotonous(this._normalizedRanges, (r) => r.startLineNumber < range.endLineNumberExclusive);
    return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > range.startLineNumber;
  }
  getUnion(other) {
    if (this._normalizedRanges.length === 0) {
      return other;
    }
    if (other._normalizedRanges.length === 0) {
      return this;
    }
    const result = [];
    let i1 = 0;
    let i2 = 0;
    let current = null;
    while (i1 < this._normalizedRanges.length || i2 < other._normalizedRanges.length) {
      let next = null;
      if (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
        const lineRange1 = this._normalizedRanges[i1];
        const lineRange2 = other._normalizedRanges[i2];
        if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
          next = lineRange1;
          i1++;
        } else {
          next = lineRange2;
          i2++;
        }
      } else if (i1 < this._normalizedRanges.length) {
        next = this._normalizedRanges[i1];
        i1++;
      } else {
        next = other._normalizedRanges[i2];
        i2++;
      }
      if (current === null) {
        current = next;
      } else {
        if (current.endLineNumberExclusive >= next.startLineNumber) {
          current = new LineRange(current.startLineNumber, Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive));
        } else {
          result.push(current);
          current = next;
        }
      }
    }
    if (current !== null) {
      result.push(current);
    }
    return new LineRangeSet(result);
  }
  /**
   * Subtracts all ranges in this set from `range` and returns the result.
   */
  subtractFrom(range) {
    const joinRangeStartIdx = findFirstIdxMonotonousOrArrLen(this._normalizedRanges, (r) => r.endLineNumberExclusive >= range.startLineNumber);
    const joinRangeEndIdxExclusive = findLastIdxMonotonous(this._normalizedRanges, (r) => r.startLineNumber <= range.endLineNumberExclusive) + 1;
    if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
      return new LineRangeSet([range]);
    }
    const result = [];
    let startLineNumber = range.startLineNumber;
    for (let i = joinRangeStartIdx; i < joinRangeEndIdxExclusive; i++) {
      const r = this._normalizedRanges[i];
      if (r.startLineNumber > startLineNumber) {
        result.push(new LineRange(startLineNumber, r.startLineNumber));
      }
      startLineNumber = r.endLineNumberExclusive;
    }
    if (startLineNumber < range.endLineNumberExclusive) {
      result.push(new LineRange(startLineNumber, range.endLineNumberExclusive));
    }
    return new LineRangeSet(result);
  }
  toString() {
    return this._normalizedRanges.map((r) => r.toString()).join(", ");
  }
  getIntersection(other) {
    const result = [];
    let i1 = 0;
    let i2 = 0;
    while (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
      const r1 = this._normalizedRanges[i1];
      const r2 = other._normalizedRanges[i2];
      const i = r1.intersect(r2);
      if (i && !i.isEmpty) {
        result.push(i);
      }
      if (r1.endLineNumberExclusive < r2.endLineNumberExclusive) {
        i1++;
      } else {
        i2++;
      }
    }
    return new LineRangeSet(result);
  }
  getWithDelta(value) {
    return new LineRangeSet(this._normalizedRanges.map((r) => r.delta(value)));
  }
}
export {
  LineRange,
  LineRangeSet
};
//# sourceMappingURL=lineRange.js.map
