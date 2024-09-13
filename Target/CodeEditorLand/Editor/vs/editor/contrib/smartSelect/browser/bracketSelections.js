var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { LinkedList } from "../../../../base/common/linkedList.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { ITextModel } from "../../../common/model.js";
import { SelectionRange, SelectionRangeProvider } from "../../../common/languages.js";
class BracketSelectionRangeProvider {
  static {
    __name(this, "BracketSelectionRangeProvider");
  }
  async provideSelectionRanges(model, positions) {
    const result = [];
    for (const position of positions) {
      const bucket = [];
      result.push(bucket);
      const ranges = /* @__PURE__ */ new Map();
      await new Promise((resolve) => BracketSelectionRangeProvider._bracketsRightYield(resolve, 0, model, position, ranges));
      await new Promise((resolve) => BracketSelectionRangeProvider._bracketsLeftYield(resolve, 0, model, position, ranges, bucket));
    }
    return result;
  }
  static _maxDuration = 30;
  static _maxRounds = 2;
  static _bracketsRightYield(resolve, round, model, pos, ranges) {
    const counts = /* @__PURE__ */ new Map();
    const t1 = Date.now();
    while (true) {
      if (round >= BracketSelectionRangeProvider._maxRounds) {
        resolve();
        break;
      }
      if (!pos) {
        resolve();
        break;
      }
      const bracket = model.bracketPairs.findNextBracket(pos);
      if (!bracket) {
        resolve();
        break;
      }
      const d = Date.now() - t1;
      if (d > BracketSelectionRangeProvider._maxDuration) {
        setTimeout(() => BracketSelectionRangeProvider._bracketsRightYield(resolve, round + 1, model, pos, ranges));
        break;
      }
      if (bracket.bracketInfo.isOpeningBracket) {
        const key = bracket.bracketInfo.bracketText;
        const val = counts.has(key) ? counts.get(key) : 0;
        counts.set(key, val + 1);
      } else {
        const key = bracket.bracketInfo.getOpeningBrackets()[0].bracketText;
        let val = counts.has(key) ? counts.get(key) : 0;
        val -= 1;
        counts.set(key, Math.max(0, val));
        if (val < 0) {
          let list = ranges.get(key);
          if (!list) {
            list = new LinkedList();
            ranges.set(key, list);
          }
          list.push(bracket.range);
        }
      }
      pos = bracket.range.getEndPosition();
    }
  }
  static _bracketsLeftYield(resolve, round, model, pos, ranges, bucket) {
    const counts = /* @__PURE__ */ new Map();
    const t1 = Date.now();
    while (true) {
      if (round >= BracketSelectionRangeProvider._maxRounds && ranges.size === 0) {
        resolve();
        break;
      }
      if (!pos) {
        resolve();
        break;
      }
      const bracket = model.bracketPairs.findPrevBracket(pos);
      if (!bracket) {
        resolve();
        break;
      }
      const d = Date.now() - t1;
      if (d > BracketSelectionRangeProvider._maxDuration) {
        setTimeout(() => BracketSelectionRangeProvider._bracketsLeftYield(resolve, round + 1, model, pos, ranges, bucket));
        break;
      }
      if (!bracket.bracketInfo.isOpeningBracket) {
        const key = bracket.bracketInfo.getOpeningBrackets()[0].bracketText;
        const val = counts.has(key) ? counts.get(key) : 0;
        counts.set(key, val + 1);
      } else {
        const key = bracket.bracketInfo.bracketText;
        let val = counts.has(key) ? counts.get(key) : 0;
        val -= 1;
        counts.set(key, Math.max(0, val));
        if (val < 0) {
          const list = ranges.get(key);
          if (list) {
            const closing = list.shift();
            if (list.size === 0) {
              ranges.delete(key);
            }
            const innerBracket = Range.fromPositions(bracket.range.getEndPosition(), closing.getStartPosition());
            const outerBracket = Range.fromPositions(bracket.range.getStartPosition(), closing.getEndPosition());
            bucket.push({ range: innerBracket });
            bucket.push({ range: outerBracket });
            BracketSelectionRangeProvider._addBracketLeading(model, outerBracket, bucket);
          }
        }
      }
      pos = bracket.range.getStartPosition();
    }
  }
  static _addBracketLeading(model, bracket, bucket) {
    if (bracket.startLineNumber === bracket.endLineNumber) {
      return;
    }
    const startLine = bracket.startLineNumber;
    const column = model.getLineFirstNonWhitespaceColumn(startLine);
    if (column !== 0 && column !== bracket.startColumn) {
      bucket.push({ range: Range.fromPositions(new Position(startLine, column), bracket.getEndPosition()) });
      bucket.push({ range: Range.fromPositions(new Position(startLine, 1), bracket.getEndPosition()) });
    }
    const aboveLine = startLine - 1;
    if (aboveLine > 0) {
      const column2 = model.getLineFirstNonWhitespaceColumn(aboveLine);
      if (column2 === bracket.startColumn && column2 !== model.getLineLastNonWhitespaceColumn(aboveLine)) {
        bucket.push({ range: Range.fromPositions(new Position(aboveLine, column2), bracket.getEndPosition()) });
        bucket.push({ range: Range.fromPositions(new Position(aboveLine, 1), bracket.getEndPosition()) });
      }
    }
  }
}
export {
  BracketSelectionRangeProvider
};
//# sourceMappingURL=bracketSelections.js.map
