var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { BugIndicatingError } from "../../../base/common/errors.js";
import { LineRange } from "../core/lineRange.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import { AbstractText, SingleTextEdit } from "../core/textEdit.js";
class LineRangeMapping {
  static {
    __name(this, "LineRangeMapping");
  }
  static inverse(mapping, originalLineCount, modifiedLineCount) {
    const result = [];
    let lastOriginalEndLineNumber = 1;
    let lastModifiedEndLineNumber = 1;
    for (const m of mapping) {
      const r2 = new LineRangeMapping(
        new LineRange(lastOriginalEndLineNumber, m.original.startLineNumber),
        new LineRange(lastModifiedEndLineNumber, m.modified.startLineNumber)
      );
      if (!r2.modified.isEmpty) {
        result.push(r2);
      }
      lastOriginalEndLineNumber = m.original.endLineNumberExclusive;
      lastModifiedEndLineNumber = m.modified.endLineNumberExclusive;
    }
    const r = new LineRangeMapping(
      new LineRange(lastOriginalEndLineNumber, originalLineCount + 1),
      new LineRange(lastModifiedEndLineNumber, modifiedLineCount + 1)
    );
    if (!r.modified.isEmpty) {
      result.push(r);
    }
    return result;
  }
  static clip(mapping, originalRange, modifiedRange) {
    const result = [];
    for (const m of mapping) {
      const original = m.original.intersect(originalRange);
      const modified = m.modified.intersect(modifiedRange);
      if (original && !original.isEmpty && modified && !modified.isEmpty) {
        result.push(new LineRangeMapping(original, modified));
      }
    }
    return result;
  }
  /**
   * The line range in the original text model.
   */
  original;
  /**
   * The line range in the modified text model.
   */
  modified;
  constructor(originalRange, modifiedRange) {
    this.original = originalRange;
    this.modified = modifiedRange;
  }
  toString() {
    return `{${this.original.toString()}->${this.modified.toString()}}`;
  }
  flip() {
    return new LineRangeMapping(this.modified, this.original);
  }
  join(other) {
    return new LineRangeMapping(
      this.original.join(other.original),
      this.modified.join(other.modified)
    );
  }
  get changedLineCount() {
    return Math.max(this.original.length, this.modified.length);
  }
  /**
   * This method assumes that the LineRangeMapping describes a valid diff!
   * I.e. if one range is empty, the other range cannot be the entire document.
   * It avoids various problems when the line range points to non-existing line-numbers.
  */
  toRangeMapping() {
    const origInclusiveRange = this.original.toInclusiveRange();
    const modInclusiveRange = this.modified.toInclusiveRange();
    if (origInclusiveRange && modInclusiveRange) {
      return new RangeMapping(origInclusiveRange, modInclusiveRange);
    } else if (this.original.startLineNumber === 1 || this.modified.startLineNumber === 1) {
      if (!(this.modified.startLineNumber === 1 && this.original.startLineNumber === 1)) {
        throw new BugIndicatingError("not a valid diff");
      }
      return new RangeMapping(
        new Range(this.original.startLineNumber, 1, this.original.endLineNumberExclusive, 1),
        new Range(this.modified.startLineNumber, 1, this.modified.endLineNumberExclusive, 1)
      );
    } else {
      return new RangeMapping(
        new Range(this.original.startLineNumber - 1, Number.MAX_SAFE_INTEGER, this.original.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER),
        new Range(this.modified.startLineNumber - 1, Number.MAX_SAFE_INTEGER, this.modified.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER)
      );
    }
  }
  /**
   * This method assumes that the LineRangeMapping describes a valid diff!
   * I.e. if one range is empty, the other range cannot be the entire document.
   * It avoids various problems when the line range points to non-existing line-numbers.
  */
  toRangeMapping2(original, modified) {
    if (isValidLineNumber(this.original.endLineNumberExclusive, original) && isValidLineNumber(this.modified.endLineNumberExclusive, modified)) {
      return new RangeMapping(
        new Range(this.original.startLineNumber, 1, this.original.endLineNumberExclusive, 1),
        new Range(this.modified.startLineNumber, 1, this.modified.endLineNumberExclusive, 1)
      );
    }
    if (!this.original.isEmpty && !this.modified.isEmpty) {
      return new RangeMapping(
        Range.fromPositions(
          new Position(this.original.startLineNumber, 1),
          normalizePosition(new Position(this.original.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER), original)
        ),
        Range.fromPositions(
          new Position(this.modified.startLineNumber, 1),
          normalizePosition(new Position(this.modified.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER), modified)
        )
      );
    }
    if (this.original.startLineNumber > 1 && this.modified.startLineNumber > 1) {
      return new RangeMapping(
        Range.fromPositions(
          normalizePosition(new Position(this.original.startLineNumber - 1, Number.MAX_SAFE_INTEGER), original),
          normalizePosition(new Position(this.original.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER), original)
        ),
        Range.fromPositions(
          normalizePosition(new Position(this.modified.startLineNumber - 1, Number.MAX_SAFE_INTEGER), modified),
          normalizePosition(new Position(this.modified.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER), modified)
        )
      );
    }
    throw new BugIndicatingError();
  }
}
function normalizePosition(position, content) {
  if (position.lineNumber < 1) {
    return new Position(1, 1);
  }
  if (position.lineNumber > content.length) {
    return new Position(content.length, content[content.length - 1].length + 1);
  }
  const line = content[position.lineNumber - 1];
  if (position.column > line.length + 1) {
    return new Position(position.lineNumber, line.length + 1);
  }
  return position;
}
__name(normalizePosition, "normalizePosition");
function isValidLineNumber(lineNumber, lines) {
  return lineNumber >= 1 && lineNumber <= lines.length;
}
__name(isValidLineNumber, "isValidLineNumber");
class DetailedLineRangeMapping extends LineRangeMapping {
  static {
    __name(this, "DetailedLineRangeMapping");
  }
  static fromRangeMappings(rangeMappings) {
    const originalRange = LineRange.join(rangeMappings.map((r) => LineRange.fromRangeInclusive(r.originalRange)));
    const modifiedRange = LineRange.join(rangeMappings.map((r) => LineRange.fromRangeInclusive(r.modifiedRange)));
    return new DetailedLineRangeMapping(originalRange, modifiedRange, rangeMappings);
  }
  /**
   * If inner changes have not been computed, this is set to undefined.
   * Otherwise, it represents the character-level diff in this line range.
   * The original range of each range mapping should be contained in the original line range (same for modified), exceptions are new-lines.
   * Must not be an empty array.
   */
  innerChanges;
  constructor(originalRange, modifiedRange, innerChanges) {
    super(originalRange, modifiedRange);
    this.innerChanges = innerChanges;
  }
  flip() {
    return new DetailedLineRangeMapping(this.modified, this.original, this.innerChanges?.map((c) => c.flip()));
  }
  withInnerChangesFromLineRanges() {
    return new DetailedLineRangeMapping(this.original, this.modified, [this.toRangeMapping()]);
  }
}
class RangeMapping {
  static {
    __name(this, "RangeMapping");
  }
  static assertSorted(rangeMappings) {
    for (let i = 1; i < rangeMappings.length; i++) {
      const previous = rangeMappings[i - 1];
      const current = rangeMappings[i];
      if (!(previous.originalRange.getEndPosition().isBeforeOrEqual(current.originalRange.getStartPosition()) && previous.modifiedRange.getEndPosition().isBeforeOrEqual(current.modifiedRange.getStartPosition()))) {
        throw new BugIndicatingError("Range mappings must be sorted");
      }
    }
  }
  /**
   * The original range.
   */
  originalRange;
  /**
   * The modified range.
   */
  modifiedRange;
  constructor(originalRange, modifiedRange) {
    this.originalRange = originalRange;
    this.modifiedRange = modifiedRange;
  }
  toString() {
    return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
  }
  flip() {
    return new RangeMapping(this.modifiedRange, this.originalRange);
  }
  /**
   * Creates a single text edit that describes the change from the original to the modified text.
  */
  toTextEdit(modified) {
    const newText = modified.getValueOfRange(this.modifiedRange);
    return new SingleTextEdit(this.originalRange, newText);
  }
}
export {
  DetailedLineRangeMapping,
  LineRangeMapping,
  RangeMapping
};
//# sourceMappingURL=rangeMapping.js.map
