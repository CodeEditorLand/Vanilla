var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assertFn, checkAdjacentItems } from "../../../base/common/assert.js";
import { CharCode } from "../../../base/common/charCode.js";
import {
  LcsDiff
} from "../../../base/common/diff/diff.js";
import * as strings from "../../../base/common/strings.js";
import { LineRange } from "../core/lineRange.js";
import { Range } from "../core/range.js";
import {
  LinesDiff
} from "./linesDiffComputer.js";
import { DetailedLineRangeMapping, RangeMapping } from "./rangeMapping.js";
const MINIMUM_MATCHING_CHARACTER_LENGTH = 3;
class LegacyLinesDiffComputer {
  static {
    __name(this, "LegacyLinesDiffComputer");
  }
  computeDiff(originalLines, modifiedLines, options) {
    const diffComputer = new DiffComputer(originalLines, modifiedLines, {
      maxComputationTime: options.maxComputationTimeMs,
      shouldIgnoreTrimWhitespace: options.ignoreTrimWhitespace,
      shouldComputeCharChanges: true,
      shouldMakePrettyDiff: true,
      shouldPostProcessCharChanges: true
    });
    const result = diffComputer.computeDiff();
    const changes = [];
    let lastChange = null;
    for (const c of result.changes) {
      let originalRange;
      if (c.originalEndLineNumber === 0) {
        originalRange = new LineRange(
          c.originalStartLineNumber + 1,
          c.originalStartLineNumber + 1
        );
      } else {
        originalRange = new LineRange(
          c.originalStartLineNumber,
          c.originalEndLineNumber + 1
        );
      }
      let modifiedRange;
      if (c.modifiedEndLineNumber === 0) {
        modifiedRange = new LineRange(
          c.modifiedStartLineNumber + 1,
          c.modifiedStartLineNumber + 1
        );
      } else {
        modifiedRange = new LineRange(
          c.modifiedStartLineNumber,
          c.modifiedEndLineNumber + 1
        );
      }
      let change = new DetailedLineRangeMapping(
        originalRange,
        modifiedRange,
        c.charChanges?.map(
          (c2) => new RangeMapping(
            new Range(
              c2.originalStartLineNumber,
              c2.originalStartColumn,
              c2.originalEndLineNumber,
              c2.originalEndColumn
            ),
            new Range(
              c2.modifiedStartLineNumber,
              c2.modifiedStartColumn,
              c2.modifiedEndLineNumber,
              c2.modifiedEndColumn
            )
          )
        )
      );
      if (lastChange) {
        if (lastChange.modified.endLineNumberExclusive === change.modified.startLineNumber || lastChange.original.endLineNumberExclusive === change.original.startLineNumber) {
          change = new DetailedLineRangeMapping(
            lastChange.original.join(change.original),
            lastChange.modified.join(change.modified),
            lastChange.innerChanges && change.innerChanges ? lastChange.innerChanges.concat(
              change.innerChanges
            ) : void 0
          );
          changes.pop();
        }
      }
      changes.push(change);
      lastChange = change;
    }
    assertFn(() => {
      return checkAdjacentItems(
        changes,
        (m1, m2) => m2.original.startLineNumber - m1.original.endLineNumberExclusive === m2.modified.startLineNumber - m1.modified.endLineNumberExclusive && // There has to be an unchanged line in between (otherwise both diffs should have been joined)
        m1.original.endLineNumberExclusive < m2.original.startLineNumber && m1.modified.endLineNumberExclusive < m2.modified.startLineNumber
      );
    });
    return new LinesDiff(changes, [], result.quitEarly);
  }
}
function computeDiff(originalSequence, modifiedSequence, continueProcessingPredicate, pretty) {
  const diffAlgo = new LcsDiff(
    originalSequence,
    modifiedSequence,
    continueProcessingPredicate
  );
  return diffAlgo.ComputeDiff(pretty);
}
__name(computeDiff, "computeDiff");
class LineSequence {
  static {
    __name(this, "LineSequence");
  }
  lines;
  _startColumns;
  _endColumns;
  constructor(lines) {
    const startColumns = [];
    const endColumns = [];
    for (let i = 0, length = lines.length; i < length; i++) {
      startColumns[i] = getFirstNonBlankColumn(lines[i], 1);
      endColumns[i] = getLastNonBlankColumn(lines[i], 1);
    }
    this.lines = lines;
    this._startColumns = startColumns;
    this._endColumns = endColumns;
  }
  getElements() {
    const elements = [];
    for (let i = 0, len = this.lines.length; i < len; i++) {
      elements[i] = this.lines[i].substring(
        this._startColumns[i] - 1,
        this._endColumns[i] - 1
      );
    }
    return elements;
  }
  getStrictElement(index) {
    return this.lines[index];
  }
  getStartLineNumber(i) {
    return i + 1;
  }
  getEndLineNumber(i) {
    return i + 1;
  }
  createCharSequence(shouldIgnoreTrimWhitespace, startIndex, endIndex) {
    const charCodes = [];
    const lineNumbers = [];
    const columns = [];
    let len = 0;
    for (let index = startIndex; index <= endIndex; index++) {
      const lineContent = this.lines[index];
      const startColumn = shouldIgnoreTrimWhitespace ? this._startColumns[index] : 1;
      const endColumn = shouldIgnoreTrimWhitespace ? this._endColumns[index] : lineContent.length + 1;
      for (let col = startColumn; col < endColumn; col++) {
        charCodes[len] = lineContent.charCodeAt(col - 1);
        lineNumbers[len] = index + 1;
        columns[len] = col;
        len++;
      }
      if (!shouldIgnoreTrimWhitespace && index < endIndex) {
        charCodes[len] = CharCode.LineFeed;
        lineNumbers[len] = index + 1;
        columns[len] = lineContent.length + 1;
        len++;
      }
    }
    return new CharSequence(charCodes, lineNumbers, columns);
  }
}
class CharSequence {
  static {
    __name(this, "CharSequence");
  }
  _charCodes;
  _lineNumbers;
  _columns;
  constructor(charCodes, lineNumbers, columns) {
    this._charCodes = charCodes;
    this._lineNumbers = lineNumbers;
    this._columns = columns;
  }
  toString() {
    return "[" + this._charCodes.map(
      (s, idx) => (s === CharCode.LineFeed ? "\\n" : String.fromCharCode(s)) + `-(${this._lineNumbers[idx]},${this._columns[idx]})`
    ).join(", ") + "]";
  }
  _assertIndex(index, arr) {
    if (index < 0 || index >= arr.length) {
      throw new Error(`Illegal index`);
    }
  }
  getElements() {
    return this._charCodes;
  }
  getStartLineNumber(i) {
    if (i > 0 && i === this._lineNumbers.length) {
      return this.getEndLineNumber(i - 1);
    }
    this._assertIndex(i, this._lineNumbers);
    return this._lineNumbers[i];
  }
  getEndLineNumber(i) {
    if (i === -1) {
      return this.getStartLineNumber(i + 1);
    }
    this._assertIndex(i, this._lineNumbers);
    if (this._charCodes[i] === CharCode.LineFeed) {
      return this._lineNumbers[i] + 1;
    }
    return this._lineNumbers[i];
  }
  getStartColumn(i) {
    if (i > 0 && i === this._columns.length) {
      return this.getEndColumn(i - 1);
    }
    this._assertIndex(i, this._columns);
    return this._columns[i];
  }
  getEndColumn(i) {
    if (i === -1) {
      return this.getStartColumn(i + 1);
    }
    this._assertIndex(i, this._columns);
    if (this._charCodes[i] === CharCode.LineFeed) {
      return 1;
    }
    return this._columns[i] + 1;
  }
}
class CharChange {
  static {
    __name(this, "CharChange");
  }
  originalStartLineNumber;
  originalStartColumn;
  originalEndLineNumber;
  originalEndColumn;
  modifiedStartLineNumber;
  modifiedStartColumn;
  modifiedEndLineNumber;
  modifiedEndColumn;
  constructor(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
    this.originalStartLineNumber = originalStartLineNumber;
    this.originalStartColumn = originalStartColumn;
    this.originalEndLineNumber = originalEndLineNumber;
    this.originalEndColumn = originalEndColumn;
    this.modifiedStartLineNumber = modifiedStartLineNumber;
    this.modifiedStartColumn = modifiedStartColumn;
    this.modifiedEndLineNumber = modifiedEndLineNumber;
    this.modifiedEndColumn = modifiedEndColumn;
  }
  static createFromDiffChange(diffChange, originalCharSequence, modifiedCharSequence) {
    const originalStartLineNumber = originalCharSequence.getStartLineNumber(
      diffChange.originalStart
    );
    const originalStartColumn = originalCharSequence.getStartColumn(
      diffChange.originalStart
    );
    const originalEndLineNumber = originalCharSequence.getEndLineNumber(
      diffChange.originalStart + diffChange.originalLength - 1
    );
    const originalEndColumn = originalCharSequence.getEndColumn(
      diffChange.originalStart + diffChange.originalLength - 1
    );
    const modifiedStartLineNumber = modifiedCharSequence.getStartLineNumber(
      diffChange.modifiedStart
    );
    const modifiedStartColumn = modifiedCharSequence.getStartColumn(
      diffChange.modifiedStart
    );
    const modifiedEndLineNumber = modifiedCharSequence.getEndLineNumber(
      diffChange.modifiedStart + diffChange.modifiedLength - 1
    );
    const modifiedEndColumn = modifiedCharSequence.getEndColumn(
      diffChange.modifiedStart + diffChange.modifiedLength - 1
    );
    return new CharChange(
      originalStartLineNumber,
      originalStartColumn,
      originalEndLineNumber,
      originalEndColumn,
      modifiedStartLineNumber,
      modifiedStartColumn,
      modifiedEndLineNumber,
      modifiedEndColumn
    );
  }
}
function postProcessCharChanges(rawChanges) {
  if (rawChanges.length <= 1) {
    return rawChanges;
  }
  const result = [rawChanges[0]];
  let prevChange = result[0];
  for (let i = 1, len = rawChanges.length; i < len; i++) {
    const currChange = rawChanges[i];
    const originalMatchingLength = currChange.originalStart - (prevChange.originalStart + prevChange.originalLength);
    const modifiedMatchingLength = currChange.modifiedStart - (prevChange.modifiedStart + prevChange.modifiedLength);
    const matchingLength = Math.min(
      originalMatchingLength,
      modifiedMatchingLength
    );
    if (matchingLength < MINIMUM_MATCHING_CHARACTER_LENGTH) {
      prevChange.originalLength = currChange.originalStart + currChange.originalLength - prevChange.originalStart;
      prevChange.modifiedLength = currChange.modifiedStart + currChange.modifiedLength - prevChange.modifiedStart;
    } else {
      result.push(currChange);
      prevChange = currChange;
    }
  }
  return result;
}
__name(postProcessCharChanges, "postProcessCharChanges");
class LineChange {
  static {
    __name(this, "LineChange");
  }
  originalStartLineNumber;
  originalEndLineNumber;
  modifiedStartLineNumber;
  modifiedEndLineNumber;
  charChanges;
  constructor(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
    this.originalStartLineNumber = originalStartLineNumber;
    this.originalEndLineNumber = originalEndLineNumber;
    this.modifiedStartLineNumber = modifiedStartLineNumber;
    this.modifiedEndLineNumber = modifiedEndLineNumber;
    this.charChanges = charChanges;
  }
  static createFromDiffResult(shouldIgnoreTrimWhitespace, diffChange, originalLineSequence, modifiedLineSequence, continueCharDiff, shouldComputeCharChanges, shouldPostProcessCharChanges) {
    let originalStartLineNumber;
    let originalEndLineNumber;
    let modifiedStartLineNumber;
    let modifiedEndLineNumber;
    let charChanges;
    if (diffChange.originalLength === 0) {
      originalStartLineNumber = originalLineSequence.getStartLineNumber(
        diffChange.originalStart
      ) - 1;
      originalEndLineNumber = 0;
    } else {
      originalStartLineNumber = originalLineSequence.getStartLineNumber(
        diffChange.originalStart
      );
      originalEndLineNumber = originalLineSequence.getEndLineNumber(
        diffChange.originalStart + diffChange.originalLength - 1
      );
    }
    if (diffChange.modifiedLength === 0) {
      modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(
        diffChange.modifiedStart
      ) - 1;
      modifiedEndLineNumber = 0;
    } else {
      modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(
        diffChange.modifiedStart
      );
      modifiedEndLineNumber = modifiedLineSequence.getEndLineNumber(
        diffChange.modifiedStart + diffChange.modifiedLength - 1
      );
    }
    if (shouldComputeCharChanges && diffChange.originalLength > 0 && diffChange.originalLength < 20 && diffChange.modifiedLength > 0 && diffChange.modifiedLength < 20 && continueCharDiff()) {
      const originalCharSequence = originalLineSequence.createCharSequence(
        shouldIgnoreTrimWhitespace,
        diffChange.originalStart,
        diffChange.originalStart + diffChange.originalLength - 1
      );
      const modifiedCharSequence = modifiedLineSequence.createCharSequence(
        shouldIgnoreTrimWhitespace,
        diffChange.modifiedStart,
        diffChange.modifiedStart + diffChange.modifiedLength - 1
      );
      if (originalCharSequence.getElements().length > 0 && modifiedCharSequence.getElements().length > 0) {
        let rawChanges = computeDiff(
          originalCharSequence,
          modifiedCharSequence,
          continueCharDiff,
          true
        ).changes;
        if (shouldPostProcessCharChanges) {
          rawChanges = postProcessCharChanges(rawChanges);
        }
        charChanges = [];
        for (let i = 0, length = rawChanges.length; i < length; i++) {
          charChanges.push(
            CharChange.createFromDiffChange(
              rawChanges[i],
              originalCharSequence,
              modifiedCharSequence
            )
          );
        }
      }
    }
    return new LineChange(
      originalStartLineNumber,
      originalEndLineNumber,
      modifiedStartLineNumber,
      modifiedEndLineNumber,
      charChanges
    );
  }
}
class DiffComputer {
  static {
    __name(this, "DiffComputer");
  }
  shouldComputeCharChanges;
  shouldPostProcessCharChanges;
  shouldIgnoreTrimWhitespace;
  shouldMakePrettyDiff;
  originalLines;
  modifiedLines;
  original;
  modified;
  continueLineDiff;
  continueCharDiff;
  constructor(originalLines, modifiedLines, opts) {
    this.shouldComputeCharChanges = opts.shouldComputeCharChanges;
    this.shouldPostProcessCharChanges = opts.shouldPostProcessCharChanges;
    this.shouldIgnoreTrimWhitespace = opts.shouldIgnoreTrimWhitespace;
    this.shouldMakePrettyDiff = opts.shouldMakePrettyDiff;
    this.originalLines = originalLines;
    this.modifiedLines = modifiedLines;
    this.original = new LineSequence(originalLines);
    this.modified = new LineSequence(modifiedLines);
    this.continueLineDiff = createContinueProcessingPredicate(
      opts.maxComputationTime
    );
    this.continueCharDiff = createContinueProcessingPredicate(
      opts.maxComputationTime === 0 ? 0 : Math.min(opts.maxComputationTime, 5e3)
    );
  }
  computeDiff() {
    if (this.original.lines.length === 1 && this.original.lines[0].length === 0) {
      if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
        return {
          quitEarly: false,
          changes: []
        };
      }
      return {
        quitEarly: false,
        changes: [
          {
            originalStartLineNumber: 1,
            originalEndLineNumber: 1,
            modifiedStartLineNumber: 1,
            modifiedEndLineNumber: this.modified.lines.length,
            charChanges: void 0
          }
        ]
      };
    }
    if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
      return {
        quitEarly: false,
        changes: [
          {
            originalStartLineNumber: 1,
            originalEndLineNumber: this.original.lines.length,
            modifiedStartLineNumber: 1,
            modifiedEndLineNumber: 1,
            charChanges: void 0
          }
        ]
      };
    }
    const diffResult = computeDiff(
      this.original,
      this.modified,
      this.continueLineDiff,
      this.shouldMakePrettyDiff
    );
    const rawChanges = diffResult.changes;
    const quitEarly = diffResult.quitEarly;
    if (this.shouldIgnoreTrimWhitespace) {
      const lineChanges = [];
      for (let i = 0, length = rawChanges.length; i < length; i++) {
        lineChanges.push(
          LineChange.createFromDiffResult(
            this.shouldIgnoreTrimWhitespace,
            rawChanges[i],
            this.original,
            this.modified,
            this.continueCharDiff,
            this.shouldComputeCharChanges,
            this.shouldPostProcessCharChanges
          )
        );
      }
      return {
        quitEarly,
        changes: lineChanges
      };
    }
    const result = [];
    let originalLineIndex = 0;
    let modifiedLineIndex = 0;
    for (let i = -1, len = rawChanges.length; i < len; i++) {
      const nextChange = i + 1 < len ? rawChanges[i + 1] : null;
      const originalStop = nextChange ? nextChange.originalStart : this.originalLines.length;
      const modifiedStop = nextChange ? nextChange.modifiedStart : this.modifiedLines.length;
      while (originalLineIndex < originalStop && modifiedLineIndex < modifiedStop) {
        const originalLine = this.originalLines[originalLineIndex];
        const modifiedLine = this.modifiedLines[modifiedLineIndex];
        if (originalLine !== modifiedLine) {
          {
            let originalStartColumn = getFirstNonBlankColumn(
              originalLine,
              1
            );
            let modifiedStartColumn = getFirstNonBlankColumn(
              modifiedLine,
              1
            );
            while (originalStartColumn > 1 && modifiedStartColumn > 1) {
              const originalChar = originalLine.charCodeAt(
                originalStartColumn - 2
              );
              const modifiedChar = modifiedLine.charCodeAt(
                modifiedStartColumn - 2
              );
              if (originalChar !== modifiedChar) {
                break;
              }
              originalStartColumn--;
              modifiedStartColumn--;
            }
            if (originalStartColumn > 1 || modifiedStartColumn > 1) {
              this._pushTrimWhitespaceCharChange(
                result,
                originalLineIndex + 1,
                1,
                originalStartColumn,
                modifiedLineIndex + 1,
                1,
                modifiedStartColumn
              );
            }
          }
          {
            let originalEndColumn = getLastNonBlankColumn(
              originalLine,
              1
            );
            let modifiedEndColumn = getLastNonBlankColumn(
              modifiedLine,
              1
            );
            const originalMaxColumn = originalLine.length + 1;
            const modifiedMaxColumn = modifiedLine.length + 1;
            while (originalEndColumn < originalMaxColumn && modifiedEndColumn < modifiedMaxColumn) {
              const originalChar = originalLine.charCodeAt(
                originalEndColumn - 1
              );
              const modifiedChar = originalLine.charCodeAt(
                modifiedEndColumn - 1
              );
              if (originalChar !== modifiedChar) {
                break;
              }
              originalEndColumn++;
              modifiedEndColumn++;
            }
            if (originalEndColumn < originalMaxColumn || modifiedEndColumn < modifiedMaxColumn) {
              this._pushTrimWhitespaceCharChange(
                result,
                originalLineIndex + 1,
                originalEndColumn,
                originalMaxColumn,
                modifiedLineIndex + 1,
                modifiedEndColumn,
                modifiedMaxColumn
              );
            }
          }
        }
        originalLineIndex++;
        modifiedLineIndex++;
      }
      if (nextChange) {
        result.push(
          LineChange.createFromDiffResult(
            this.shouldIgnoreTrimWhitespace,
            nextChange,
            this.original,
            this.modified,
            this.continueCharDiff,
            this.shouldComputeCharChanges,
            this.shouldPostProcessCharChanges
          )
        );
        originalLineIndex += nextChange.originalLength;
        modifiedLineIndex += nextChange.modifiedLength;
      }
    }
    return {
      quitEarly,
      changes: result
    };
  }
  _pushTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
    if (this._mergeTrimWhitespaceCharChange(
      result,
      originalLineNumber,
      originalStartColumn,
      originalEndColumn,
      modifiedLineNumber,
      modifiedStartColumn,
      modifiedEndColumn
    )) {
      return;
    }
    let charChanges;
    if (this.shouldComputeCharChanges) {
      charChanges = [
        new CharChange(
          originalLineNumber,
          originalStartColumn,
          originalLineNumber,
          originalEndColumn,
          modifiedLineNumber,
          modifiedStartColumn,
          modifiedLineNumber,
          modifiedEndColumn
        )
      ];
    }
    result.push(
      new LineChange(
        originalLineNumber,
        originalLineNumber,
        modifiedLineNumber,
        modifiedLineNumber,
        charChanges
      )
    );
  }
  _mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
    const len = result.length;
    if (len === 0) {
      return false;
    }
    const prevChange = result[len - 1];
    if (prevChange.originalEndLineNumber === 0 || prevChange.modifiedEndLineNumber === 0) {
      return false;
    }
    if (prevChange.originalEndLineNumber === originalLineNumber && prevChange.modifiedEndLineNumber === modifiedLineNumber) {
      if (this.shouldComputeCharChanges && prevChange.charChanges) {
        prevChange.charChanges.push(
          new CharChange(
            originalLineNumber,
            originalStartColumn,
            originalLineNumber,
            originalEndColumn,
            modifiedLineNumber,
            modifiedStartColumn,
            modifiedLineNumber,
            modifiedEndColumn
          )
        );
      }
      return true;
    }
    if (prevChange.originalEndLineNumber + 1 === originalLineNumber && prevChange.modifiedEndLineNumber + 1 === modifiedLineNumber) {
      prevChange.originalEndLineNumber = originalLineNumber;
      prevChange.modifiedEndLineNumber = modifiedLineNumber;
      if (this.shouldComputeCharChanges && prevChange.charChanges) {
        prevChange.charChanges.push(
          new CharChange(
            originalLineNumber,
            originalStartColumn,
            originalLineNumber,
            originalEndColumn,
            modifiedLineNumber,
            modifiedStartColumn,
            modifiedLineNumber,
            modifiedEndColumn
          )
        );
      }
      return true;
    }
    return false;
  }
}
function getFirstNonBlankColumn(txt, defaultValue) {
  const r = strings.firstNonWhitespaceIndex(txt);
  if (r === -1) {
    return defaultValue;
  }
  return r + 1;
}
__name(getFirstNonBlankColumn, "getFirstNonBlankColumn");
function getLastNonBlankColumn(txt, defaultValue) {
  const r = strings.lastNonWhitespaceIndex(txt);
  if (r === -1) {
    return defaultValue;
  }
  return r + 2;
}
__name(getLastNonBlankColumn, "getLastNonBlankColumn");
function createContinueProcessingPredicate(maximumRuntime) {
  if (maximumRuntime === 0) {
    return () => true;
  }
  const startTime = Date.now();
  return () => {
    return Date.now() - startTime < maximumRuntime;
  };
}
__name(createContinueProcessingPredicate, "createContinueProcessingPredicate");
export {
  DiffComputer,
  LegacyLinesDiffComputer
};
//# sourceMappingURL=legacyLinesDiffComputer.js.map
