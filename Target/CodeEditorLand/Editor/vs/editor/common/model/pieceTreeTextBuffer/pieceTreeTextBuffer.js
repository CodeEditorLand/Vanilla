import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import * as strings from "../../../../base/common/strings.js";
import { countEOL, StringEOL } from "../../core/eolCounter.js";
import { Range } from "../../core/range.js";
import { TextChange } from "../../core/textChange.js";
import {
  ApplyEditsResult,
  EndOfLinePreference
} from "../../model.js";
import { PieceTreeBase } from "./pieceTreeBase.js";
class PieceTreeTextBuffer extends Disposable {
  _pieceTree;
  _BOM;
  _mightContainRTL;
  _mightContainUnusualLineTerminators;
  _mightContainNonBasicASCII;
  _onDidChangeContent = this._register(
    new Emitter()
  );
  onDidChangeContent = this._onDidChangeContent.event;
  constructor(chunks, BOM, eol, containsRTL, containsUnusualLineTerminators, isBasicASCII, eolNormalized) {
    super();
    this._BOM = BOM;
    this._mightContainNonBasicASCII = !isBasicASCII;
    this._mightContainRTL = containsRTL;
    this._mightContainUnusualLineTerminators = containsUnusualLineTerminators;
    this._pieceTree = new PieceTreeBase(chunks, eol, eolNormalized);
  }
  // #region TextBuffer
  equals(other) {
    if (!(other instanceof PieceTreeTextBuffer)) {
      return false;
    }
    if (this._BOM !== other._BOM) {
      return false;
    }
    if (this.getEOL() !== other.getEOL()) {
      return false;
    }
    return this._pieceTree.equal(other._pieceTree);
  }
  mightContainRTL() {
    return this._mightContainRTL;
  }
  mightContainUnusualLineTerminators() {
    return this._mightContainUnusualLineTerminators;
  }
  resetMightContainUnusualLineTerminators() {
    this._mightContainUnusualLineTerminators = false;
  }
  mightContainNonBasicASCII() {
    return this._mightContainNonBasicASCII;
  }
  getBOM() {
    return this._BOM;
  }
  getEOL() {
    return this._pieceTree.getEOL();
  }
  createSnapshot(preserveBOM) {
    return this._pieceTree.createSnapshot(preserveBOM ? this._BOM : "");
  }
  getOffsetAt(lineNumber, column) {
    return this._pieceTree.getOffsetAt(lineNumber, column);
  }
  getPositionAt(offset) {
    return this._pieceTree.getPositionAt(offset);
  }
  getRangeAt(start, length) {
    const end = start + length;
    const startPosition = this.getPositionAt(start);
    const endPosition = this.getPositionAt(end);
    return new Range(
      startPosition.lineNumber,
      startPosition.column,
      endPosition.lineNumber,
      endPosition.column
    );
  }
  getValueInRange(range, eol = EndOfLinePreference.TextDefined) {
    if (range.isEmpty()) {
      return "";
    }
    const lineEnding = this._getEndOfLine(eol);
    return this._pieceTree.getValueInRange(range, lineEnding);
  }
  getValueLengthInRange(range, eol = EndOfLinePreference.TextDefined) {
    if (range.isEmpty()) {
      return 0;
    }
    if (range.startLineNumber === range.endLineNumber) {
      return range.endColumn - range.startColumn;
    }
    const startOffset = this.getOffsetAt(
      range.startLineNumber,
      range.startColumn
    );
    const endOffset = this.getOffsetAt(
      range.endLineNumber,
      range.endColumn
    );
    let eolOffsetCompensation = 0;
    const desiredEOL = this._getEndOfLine(eol);
    const actualEOL = this.getEOL();
    if (desiredEOL.length !== actualEOL.length) {
      const delta = desiredEOL.length - actualEOL.length;
      const eolCount = range.endLineNumber - range.startLineNumber;
      eolOffsetCompensation = delta * eolCount;
    }
    return endOffset - startOffset + eolOffsetCompensation;
  }
  getCharacterCountInRange(range, eol = EndOfLinePreference.TextDefined) {
    if (this._mightContainNonBasicASCII) {
      let result = 0;
      const fromLineNumber = range.startLineNumber;
      const toLineNumber = range.endLineNumber;
      for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
        const lineContent = this.getLineContent(lineNumber);
        const fromOffset = lineNumber === fromLineNumber ? range.startColumn - 1 : 0;
        const toOffset = lineNumber === toLineNumber ? range.endColumn - 1 : lineContent.length;
        for (let offset = fromOffset; offset < toOffset; offset++) {
          if (strings.isHighSurrogate(lineContent.charCodeAt(offset))) {
            result = result + 1;
            offset = offset + 1;
          } else {
            result = result + 1;
          }
        }
      }
      result += this._getEndOfLine(eol).length * (toLineNumber - fromLineNumber);
      return result;
    }
    return this.getValueLengthInRange(range, eol);
  }
  getNearestChunk(offset) {
    return this._pieceTree.getNearestChunk(offset);
  }
  getLength() {
    return this._pieceTree.getLength();
  }
  getLineCount() {
    return this._pieceTree.getLineCount();
  }
  getLinesContent() {
    return this._pieceTree.getLinesContent();
  }
  getLineContent(lineNumber) {
    return this._pieceTree.getLineContent(lineNumber);
  }
  getLineCharCode(lineNumber, index) {
    return this._pieceTree.getLineCharCode(lineNumber, index);
  }
  getCharCode(offset) {
    return this._pieceTree.getCharCode(offset);
  }
  getLineLength(lineNumber) {
    return this._pieceTree.getLineLength(lineNumber);
  }
  getLineMinColumn(lineNumber) {
    return 1;
  }
  getLineMaxColumn(lineNumber) {
    return this.getLineLength(lineNumber) + 1;
  }
  getLineFirstNonWhitespaceColumn(lineNumber) {
    const result = strings.firstNonWhitespaceIndex(
      this.getLineContent(lineNumber)
    );
    if (result === -1) {
      return 0;
    }
    return result + 1;
  }
  getLineLastNonWhitespaceColumn(lineNumber) {
    const result = strings.lastNonWhitespaceIndex(
      this.getLineContent(lineNumber)
    );
    if (result === -1) {
      return 0;
    }
    return result + 2;
  }
  _getEndOfLine(eol) {
    switch (eol) {
      case EndOfLinePreference.LF:
        return "\n";
      case EndOfLinePreference.CRLF:
        return "\r\n";
      case EndOfLinePreference.TextDefined:
        return this.getEOL();
      default:
        throw new Error("Unknown EOL preference");
    }
  }
  setEOL(newEOL) {
    this._pieceTree.setEOL(newEOL);
  }
  applyEdits(rawOperations, recordTrimAutoWhitespace, computeUndoEdits) {
    let mightContainRTL = this._mightContainRTL;
    let mightContainUnusualLineTerminators = this._mightContainUnusualLineTerminators;
    let mightContainNonBasicASCII = this._mightContainNonBasicASCII;
    let canReduceOperations = true;
    let operations = [];
    for (let i = 0; i < rawOperations.length; i++) {
      const op = rawOperations[i];
      if (canReduceOperations && op._isTracked) {
        canReduceOperations = false;
      }
      const validatedRange = op.range;
      if (op.text) {
        let textMightContainNonBasicASCII = true;
        if (!mightContainNonBasicASCII) {
          textMightContainNonBasicASCII = !strings.isBasicASCII(
            op.text
          );
          mightContainNonBasicASCII = textMightContainNonBasicASCII;
        }
        if (!mightContainRTL && textMightContainNonBasicASCII) {
          mightContainRTL = strings.containsRTL(op.text);
        }
        if (!mightContainUnusualLineTerminators && textMightContainNonBasicASCII) {
          mightContainUnusualLineTerminators = strings.containsUnusualLineTerminators(op.text);
        }
      }
      let validText = "";
      let eolCount = 0;
      let firstLineLength = 0;
      let lastLineLength = 0;
      if (op.text) {
        let strEOL;
        [eolCount, firstLineLength, lastLineLength, strEOL] = countEOL(
          op.text
        );
        const bufferEOL = this.getEOL();
        const expectedStrEOL = bufferEOL === "\r\n" ? StringEOL.CRLF : StringEOL.LF;
        if (strEOL === StringEOL.Unknown || strEOL === expectedStrEOL) {
          validText = op.text;
        } else {
          validText = op.text.replace(/\r\n|\r|\n/g, bufferEOL);
        }
      }
      operations[i] = {
        sortIndex: i,
        identifier: op.identifier || null,
        range: validatedRange,
        rangeOffset: this.getOffsetAt(
          validatedRange.startLineNumber,
          validatedRange.startColumn
        ),
        rangeLength: this.getValueLengthInRange(validatedRange),
        text: validText,
        eolCount,
        firstLineLength,
        lastLineLength,
        forceMoveMarkers: Boolean(op.forceMoveMarkers),
        isAutoWhitespaceEdit: op.isAutoWhitespaceEdit || false
      };
    }
    operations.sort(PieceTreeTextBuffer._sortOpsAscending);
    let hasTouchingRanges = false;
    for (let i = 0, count = operations.length - 1; i < count; i++) {
      const rangeEnd = operations[i].range.getEndPosition();
      const nextRangeStart = operations[i + 1].range.getStartPosition();
      if (nextRangeStart.isBeforeOrEqual(rangeEnd)) {
        if (nextRangeStart.isBefore(rangeEnd)) {
          throw new Error("Overlapping ranges are not allowed!");
        }
        hasTouchingRanges = true;
      }
    }
    if (canReduceOperations) {
      operations = this._reduceOperations(operations);
    }
    const reverseRanges = computeUndoEdits || recordTrimAutoWhitespace ? PieceTreeTextBuffer._getInverseEditRanges(operations) : [];
    const newTrimAutoWhitespaceCandidates = [];
    if (recordTrimAutoWhitespace) {
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const reverseRange = reverseRanges[i];
        if (op.isAutoWhitespaceEdit && op.range.isEmpty()) {
          for (let lineNumber = reverseRange.startLineNumber; lineNumber <= reverseRange.endLineNumber; lineNumber++) {
            let currentLineContent = "";
            if (lineNumber === reverseRange.startLineNumber) {
              currentLineContent = this.getLineContent(
                op.range.startLineNumber
              );
              if (strings.firstNonWhitespaceIndex(
                currentLineContent
              ) !== -1) {
                continue;
              }
            }
            newTrimAutoWhitespaceCandidates.push({
              lineNumber,
              oldContent: currentLineContent
            });
          }
        }
      }
    }
    let reverseOperations = null;
    if (computeUndoEdits) {
      let reverseRangeDeltaOffset = 0;
      reverseOperations = [];
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const reverseRange = reverseRanges[i];
        const bufferText = this.getValueInRange(op.range);
        const reverseRangeOffset = op.rangeOffset + reverseRangeDeltaOffset;
        reverseRangeDeltaOffset += op.text.length - bufferText.length;
        reverseOperations[i] = {
          sortIndex: op.sortIndex,
          identifier: op.identifier,
          range: reverseRange,
          text: bufferText,
          textChange: new TextChange(
            op.rangeOffset,
            bufferText,
            reverseRangeOffset,
            op.text
          )
        };
      }
      if (!hasTouchingRanges) {
        reverseOperations.sort((a, b) => a.sortIndex - b.sortIndex);
      }
    }
    this._mightContainRTL = mightContainRTL;
    this._mightContainUnusualLineTerminators = mightContainUnusualLineTerminators;
    this._mightContainNonBasicASCII = mightContainNonBasicASCII;
    const contentChanges = this._doApplyEdits(operations);
    let trimAutoWhitespaceLineNumbers = null;
    if (recordTrimAutoWhitespace && newTrimAutoWhitespaceCandidates.length > 0) {
      newTrimAutoWhitespaceCandidates.sort(
        (a, b) => b.lineNumber - a.lineNumber
      );
      trimAutoWhitespaceLineNumbers = [];
      for (let i = 0, len = newTrimAutoWhitespaceCandidates.length; i < len; i++) {
        const lineNumber = newTrimAutoWhitespaceCandidates[i].lineNumber;
        if (i > 0 && newTrimAutoWhitespaceCandidates[i - 1].lineNumber === lineNumber) {
          continue;
        }
        const prevContent = newTrimAutoWhitespaceCandidates[i].oldContent;
        const lineContent = this.getLineContent(lineNumber);
        if (lineContent.length === 0 || lineContent === prevContent || strings.firstNonWhitespaceIndex(lineContent) !== -1) {
          continue;
        }
        trimAutoWhitespaceLineNumbers.push(lineNumber);
      }
    }
    this._onDidChangeContent.fire();
    return new ApplyEditsResult(
      reverseOperations,
      contentChanges,
      trimAutoWhitespaceLineNumbers
    );
  }
  /**
   * Transform operations such that they represent the same logic edit,
   * but that they also do not cause OOM crashes.
   */
  _reduceOperations(operations) {
    if (operations.length < 1e3) {
      return operations;
    }
    return [this._toSingleEditOperation(operations)];
  }
  _toSingleEditOperation(operations) {
    let forceMoveMarkers = false;
    const firstEditRange = operations[0].range;
    const lastEditRange = operations[operations.length - 1].range;
    const entireEditRange = new Range(
      firstEditRange.startLineNumber,
      firstEditRange.startColumn,
      lastEditRange.endLineNumber,
      lastEditRange.endColumn
    );
    let lastEndLineNumber = firstEditRange.startLineNumber;
    let lastEndColumn = firstEditRange.startColumn;
    const result = [];
    for (let i = 0, len = operations.length; i < len; i++) {
      const operation = operations[i];
      const range = operation.range;
      forceMoveMarkers = forceMoveMarkers || operation.forceMoveMarkers;
      result.push(
        this.getValueInRange(
          new Range(
            lastEndLineNumber,
            lastEndColumn,
            range.startLineNumber,
            range.startColumn
          )
        )
      );
      if (operation.text.length > 0) {
        result.push(operation.text);
      }
      lastEndLineNumber = range.endLineNumber;
      lastEndColumn = range.endColumn;
    }
    const text = result.join("");
    const [eolCount, firstLineLength, lastLineLength] = countEOL(text);
    return {
      sortIndex: 0,
      identifier: operations[0].identifier,
      range: entireEditRange,
      rangeOffset: this.getOffsetAt(
        entireEditRange.startLineNumber,
        entireEditRange.startColumn
      ),
      rangeLength: this.getValueLengthInRange(
        entireEditRange,
        EndOfLinePreference.TextDefined
      ),
      text,
      eolCount,
      firstLineLength,
      lastLineLength,
      forceMoveMarkers,
      isAutoWhitespaceEdit: false
    };
  }
  _doApplyEdits(operations) {
    operations.sort(PieceTreeTextBuffer._sortOpsDescending);
    const contentChanges = [];
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      const startLineNumber = op.range.startLineNumber;
      const startColumn = op.range.startColumn;
      const endLineNumber = op.range.endLineNumber;
      const endColumn = op.range.endColumn;
      if (startLineNumber === endLineNumber && startColumn === endColumn && op.text.length === 0) {
        continue;
      }
      if (op.text) {
        this._pieceTree.delete(op.rangeOffset, op.rangeLength);
        this._pieceTree.insert(op.rangeOffset, op.text, true);
      } else {
        this._pieceTree.delete(op.rangeOffset, op.rangeLength);
      }
      const contentChangeRange = new Range(
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
      );
      contentChanges.push({
        range: contentChangeRange,
        rangeLength: op.rangeLength,
        text: op.text,
        rangeOffset: op.rangeOffset,
        forceMoveMarkers: op.forceMoveMarkers
      });
    }
    return contentChanges;
  }
  findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
    return this._pieceTree.findMatchesLineByLine(
      searchRange,
      searchData,
      captureMatches,
      limitResultCount
    );
  }
  // #endregion
  // #region helper
  // testing purpose.
  getPieceTree() {
    return this._pieceTree;
  }
  static _getInverseEditRange(range, text) {
    const startLineNumber = range.startLineNumber;
    const startColumn = range.startColumn;
    const [eolCount, firstLineLength, lastLineLength] = countEOL(text);
    let resultRange;
    if (text.length > 0) {
      const lineCount = eolCount + 1;
      if (lineCount === 1) {
        resultRange = new Range(
          startLineNumber,
          startColumn,
          startLineNumber,
          startColumn + firstLineLength
        );
      } else {
        resultRange = new Range(
          startLineNumber,
          startColumn,
          startLineNumber + lineCount - 1,
          lastLineLength + 1
        );
      }
    } else {
      resultRange = new Range(
        startLineNumber,
        startColumn,
        startLineNumber,
        startColumn
      );
    }
    return resultRange;
  }
  /**
   * Assumes `operations` are validated and sorted ascending
   */
  static _getInverseEditRanges(operations) {
    const result = [];
    let prevOpEndLineNumber = 0;
    let prevOpEndColumn = 0;
    let prevOp = null;
    for (let i = 0, len = operations.length; i < len; i++) {
      const op = operations[i];
      let startLineNumber;
      let startColumn;
      if (prevOp) {
        if (prevOp.range.endLineNumber === op.range.startLineNumber) {
          startLineNumber = prevOpEndLineNumber;
          startColumn = prevOpEndColumn + (op.range.startColumn - prevOp.range.endColumn);
        } else {
          startLineNumber = prevOpEndLineNumber + (op.range.startLineNumber - prevOp.range.endLineNumber);
          startColumn = op.range.startColumn;
        }
      } else {
        startLineNumber = op.range.startLineNumber;
        startColumn = op.range.startColumn;
      }
      let resultRange;
      if (op.text.length > 0) {
        const lineCount = op.eolCount + 1;
        if (lineCount === 1) {
          resultRange = new Range(
            startLineNumber,
            startColumn,
            startLineNumber,
            startColumn + op.firstLineLength
          );
        } else {
          resultRange = new Range(
            startLineNumber,
            startColumn,
            startLineNumber + lineCount - 1,
            op.lastLineLength + 1
          );
        }
      } else {
        resultRange = new Range(
          startLineNumber,
          startColumn,
          startLineNumber,
          startColumn
        );
      }
      prevOpEndLineNumber = resultRange.endLineNumber;
      prevOpEndColumn = resultRange.endColumn;
      result.push(resultRange);
      prevOp = op;
    }
    return result;
  }
  static _sortOpsAscending(a, b) {
    const r = Range.compareRangesUsingEnds(a.range, b.range);
    if (r === 0) {
      return a.sortIndex - b.sortIndex;
    }
    return r;
  }
  static _sortOpsDescending(a, b) {
    const r = Range.compareRangesUsingEnds(a.range, b.range);
    if (r === 0) {
      return b.sortIndex - a.sortIndex;
    }
    return -r;
  }
  // #endregion
}
export {
  PieceTreeTextBuffer
};
