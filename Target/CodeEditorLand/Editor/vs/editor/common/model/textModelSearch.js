var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../base/common/charCode.js";
import * as strings from "../../../base/common/strings.js";
import { Position } from "../core/position.js";
import { Range } from "../core/range.js";
import {
  WordCharacterClass,
  getMapForWordSeparators
} from "../core/wordCharacterClassifier.js";
import { EndOfLinePreference, FindMatch, SearchData } from "../model.js";
const LIMIT_FIND_COUNT = 999;
class SearchParams {
  static {
    __name(this, "SearchParams");
  }
  searchString;
  isRegex;
  matchCase;
  wordSeparators;
  constructor(searchString, isRegex, matchCase, wordSeparators) {
    this.searchString = searchString;
    this.isRegex = isRegex;
    this.matchCase = matchCase;
    this.wordSeparators = wordSeparators;
  }
  parseSearchRequest() {
    if (this.searchString === "") {
      return null;
    }
    let multiline;
    if (this.isRegex) {
      multiline = isMultilineRegexSource(this.searchString);
    } else {
      multiline = this.searchString.indexOf("\n") >= 0;
    }
    let regex = null;
    try {
      regex = strings.createRegExp(this.searchString, this.isRegex, {
        matchCase: this.matchCase,
        wholeWord: false,
        multiline,
        global: true,
        unicode: true
      });
    } catch (err) {
      return null;
    }
    if (!regex) {
      return null;
    }
    let canUseSimpleSearch = !this.isRegex && !multiline;
    if (canUseSimpleSearch && this.searchString.toLowerCase() !== this.searchString.toUpperCase()) {
      canUseSimpleSearch = this.matchCase;
    }
    return new SearchData(
      regex,
      this.wordSeparators ? getMapForWordSeparators(this.wordSeparators, []) : null,
      canUseSimpleSearch ? this.searchString : null
    );
  }
}
function isMultilineRegexSource(searchString) {
  if (!searchString || searchString.length === 0) {
    return false;
  }
  for (let i = 0, len = searchString.length; i < len; i++) {
    const chCode = searchString.charCodeAt(i);
    if (chCode === CharCode.LineFeed) {
      return true;
    }
    if (chCode === CharCode.Backslash) {
      i++;
      if (i >= len) {
        break;
      }
      const nextChCode = searchString.charCodeAt(i);
      if (nextChCode === CharCode.n || nextChCode === CharCode.r || nextChCode === CharCode.W) {
        return true;
      }
    }
  }
  return false;
}
__name(isMultilineRegexSource, "isMultilineRegexSource");
function createFindMatch(range, rawMatches, captureMatches) {
  if (!captureMatches) {
    return new FindMatch(range, null);
  }
  const matches = [];
  for (let i = 0, len = rawMatches.length; i < len; i++) {
    matches[i] = rawMatches[i];
  }
  return new FindMatch(range, matches);
}
__name(createFindMatch, "createFindMatch");
class LineFeedCounter {
  static {
    __name(this, "LineFeedCounter");
  }
  _lineFeedsOffsets;
  constructor(text) {
    const lineFeedsOffsets = [];
    let lineFeedsOffsetsLen = 0;
    for (let i = 0, textLen = text.length; i < textLen; i++) {
      if (text.charCodeAt(i) === CharCode.LineFeed) {
        lineFeedsOffsets[lineFeedsOffsetsLen++] = i;
      }
    }
    this._lineFeedsOffsets = lineFeedsOffsets;
  }
  findLineFeedCountBeforeOffset(offset) {
    const lineFeedsOffsets = this._lineFeedsOffsets;
    let min = 0;
    let max = lineFeedsOffsets.length - 1;
    if (max === -1) {
      return 0;
    }
    if (offset <= lineFeedsOffsets[0]) {
      return 0;
    }
    while (min < max) {
      const mid = min + ((max - min) / 2 >> 0);
      if (lineFeedsOffsets[mid] >= offset) {
        max = mid - 1;
      } else if (lineFeedsOffsets[mid + 1] >= offset) {
        min = mid;
        max = mid;
      } else {
        min = mid + 1;
      }
    }
    return min + 1;
  }
}
class TextModelSearch {
  static {
    __name(this, "TextModelSearch");
  }
  static findMatches(model, searchParams, searchRange, captureMatches, limitResultCount) {
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return [];
    }
    if (searchData.regex.multiline) {
      return this._doFindMatchesMultiline(
        model,
        searchRange,
        new Searcher(searchData.wordSeparators, searchData.regex),
        captureMatches,
        limitResultCount
      );
    }
    return this._doFindMatchesLineByLine(
      model,
      searchRange,
      searchData,
      captureMatches,
      limitResultCount
    );
  }
  /**
   * Multiline search always executes on the lines concatenated with \n.
   * We must therefore compensate for the count of \n in case the model is CRLF
   */
  static _getMultilineMatchRange(model, deltaOffset, text, lfCounter, matchIndex, match0) {
    let startOffset;
    let lineFeedCountBeforeMatch = 0;
    if (lfCounter) {
      lineFeedCountBeforeMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex);
      startOffset = deltaOffset + matchIndex + lineFeedCountBeforeMatch;
    } else {
      startOffset = deltaOffset + matchIndex;
    }
    let endOffset;
    if (lfCounter) {
      const lineFeedCountBeforeEndOfMatch = lfCounter.findLineFeedCountBeforeOffset(
        matchIndex + match0.length
      );
      const lineFeedCountInMatch = lineFeedCountBeforeEndOfMatch - lineFeedCountBeforeMatch;
      endOffset = startOffset + match0.length + lineFeedCountInMatch;
    } else {
      endOffset = startOffset + match0.length;
    }
    const startPosition = model.getPositionAt(startOffset);
    const endPosition = model.getPositionAt(endOffset);
    return new Range(
      startPosition.lineNumber,
      startPosition.column,
      endPosition.lineNumber,
      endPosition.column
    );
  }
  static _doFindMatchesMultiline(model, searchRange, searcher, captureMatches, limitResultCount) {
    const deltaOffset = model.getOffsetAt(searchRange.getStartPosition());
    const text = model.getValueInRange(searchRange, EndOfLinePreference.LF);
    const lfCounter = model.getEOL() === "\r\n" ? new LineFeedCounter(text) : null;
    const result = [];
    let counter = 0;
    let m;
    searcher.reset(0);
    while (m = searcher.next(text)) {
      result[counter++] = createFindMatch(
        this._getMultilineMatchRange(
          model,
          deltaOffset,
          text,
          lfCounter,
          m.index,
          m[0]
        ),
        m,
        captureMatches
      );
      if (counter >= limitResultCount) {
        return result;
      }
    }
    return result;
  }
  static _doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount) {
    const result = [];
    let resultLen = 0;
    if (searchRange.startLineNumber === searchRange.endLineNumber) {
      const text2 = model.getLineContent(searchRange.startLineNumber).substring(
        searchRange.startColumn - 1,
        searchRange.endColumn - 1
      );
      resultLen = this._findMatchesInLine(
        searchData,
        text2,
        searchRange.startLineNumber,
        searchRange.startColumn - 1,
        resultLen,
        result,
        captureMatches,
        limitResultCount
      );
      return result;
    }
    const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1);
    resultLen = this._findMatchesInLine(
      searchData,
      text,
      searchRange.startLineNumber,
      searchRange.startColumn - 1,
      resultLen,
      result,
      captureMatches,
      limitResultCount
    );
    for (let lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && resultLen < limitResultCount; lineNumber++) {
      resultLen = this._findMatchesInLine(
        searchData,
        model.getLineContent(lineNumber),
        lineNumber,
        0,
        resultLen,
        result,
        captureMatches,
        limitResultCount
      );
    }
    if (resultLen < limitResultCount) {
      const text2 = model.getLineContent(searchRange.endLineNumber).substring(0, searchRange.endColumn - 1);
      resultLen = this._findMatchesInLine(
        searchData,
        text2,
        searchRange.endLineNumber,
        0,
        resultLen,
        result,
        captureMatches,
        limitResultCount
      );
    }
    return result;
  }
  static _findMatchesInLine(searchData, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
    const wordSeparators = searchData.wordSeparators;
    if (!captureMatches && searchData.simpleSearch) {
      const searchString = searchData.simpleSearch;
      const searchStringLen = searchString.length;
      const textLength = text.length;
      let lastMatchIndex = -searchStringLen;
      while ((lastMatchIndex = text.indexOf(
        searchString,
        lastMatchIndex + searchStringLen
      )) !== -1) {
        if (!wordSeparators || isValidMatch(
          wordSeparators,
          text,
          textLength,
          lastMatchIndex,
          searchStringLen
        )) {
          result[resultLen++] = new FindMatch(
            new Range(
              lineNumber,
              lastMatchIndex + 1 + deltaOffset,
              lineNumber,
              lastMatchIndex + 1 + searchStringLen + deltaOffset
            ),
            null
          );
          if (resultLen >= limitResultCount) {
            return resultLen;
          }
        }
      }
      return resultLen;
    }
    const searcher = new Searcher(
      searchData.wordSeparators,
      searchData.regex
    );
    let m;
    searcher.reset(0);
    do {
      m = searcher.next(text);
      if (m) {
        result[resultLen++] = createFindMatch(
          new Range(
            lineNumber,
            m.index + 1 + deltaOffset,
            lineNumber,
            m.index + 1 + m[0].length + deltaOffset
          ),
          m,
          captureMatches
        );
        if (resultLen >= limitResultCount) {
          return resultLen;
        }
      }
    } while (m);
    return resultLen;
  }
  static findNextMatch(model, searchParams, searchStart, captureMatches) {
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return null;
    }
    const searcher = new Searcher(
      searchData.wordSeparators,
      searchData.regex
    );
    if (searchData.regex.multiline) {
      return this._doFindNextMatchMultiline(
        model,
        searchStart,
        searcher,
        captureMatches
      );
    }
    return this._doFindNextMatchLineByLine(
      model,
      searchStart,
      searcher,
      captureMatches
    );
  }
  static _doFindNextMatchMultiline(model, searchStart, searcher, captureMatches) {
    const searchTextStart = new Position(searchStart.lineNumber, 1);
    const deltaOffset = model.getOffsetAt(searchTextStart);
    const lineCount = model.getLineCount();
    const text = model.getValueInRange(
      new Range(
        searchTextStart.lineNumber,
        searchTextStart.column,
        lineCount,
        model.getLineMaxColumn(lineCount)
      ),
      EndOfLinePreference.LF
    );
    const lfCounter = model.getEOL() === "\r\n" ? new LineFeedCounter(text) : null;
    searcher.reset(searchStart.column - 1);
    const m = searcher.next(text);
    if (m) {
      return createFindMatch(
        this._getMultilineMatchRange(
          model,
          deltaOffset,
          text,
          lfCounter,
          m.index,
          m[0]
        ),
        m,
        captureMatches
      );
    }
    if (searchStart.lineNumber !== 1 || searchStart.column !== 1) {
      return this._doFindNextMatchMultiline(
        model,
        new Position(1, 1),
        searcher,
        captureMatches
      );
    }
    return null;
  }
  static _doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches) {
    const lineCount = model.getLineCount();
    const startLineNumber = searchStart.lineNumber;
    const text = model.getLineContent(startLineNumber);
    const r = this._findFirstMatchInLine(
      searcher,
      text,
      startLineNumber,
      searchStart.column,
      captureMatches
    );
    if (r) {
      return r;
    }
    for (let i = 1; i <= lineCount; i++) {
      const lineIndex = (startLineNumber + i - 1) % lineCount;
      const text2 = model.getLineContent(lineIndex + 1);
      const r2 = this._findFirstMatchInLine(
        searcher,
        text2,
        lineIndex + 1,
        1,
        captureMatches
      );
      if (r2) {
        return r2;
      }
    }
    return null;
  }
  static _findFirstMatchInLine(searcher, text, lineNumber, fromColumn, captureMatches) {
    searcher.reset(fromColumn - 1);
    const m = searcher.next(text);
    if (m) {
      return createFindMatch(
        new Range(
          lineNumber,
          m.index + 1,
          lineNumber,
          m.index + 1 + m[0].length
        ),
        m,
        captureMatches
      );
    }
    return null;
  }
  static findPreviousMatch(model, searchParams, searchStart, captureMatches) {
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return null;
    }
    const searcher = new Searcher(
      searchData.wordSeparators,
      searchData.regex
    );
    if (searchData.regex.multiline) {
      return this._doFindPreviousMatchMultiline(
        model,
        searchStart,
        searcher,
        captureMatches
      );
    }
    return this._doFindPreviousMatchLineByLine(
      model,
      searchStart,
      searcher,
      captureMatches
    );
  }
  static _doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches) {
    const matches = this._doFindMatchesMultiline(
      model,
      new Range(1, 1, searchStart.lineNumber, searchStart.column),
      searcher,
      captureMatches,
      10 * LIMIT_FIND_COUNT
    );
    if (matches.length > 0) {
      return matches[matches.length - 1];
    }
    const lineCount = model.getLineCount();
    if (searchStart.lineNumber !== lineCount || searchStart.column !== model.getLineMaxColumn(lineCount)) {
      return this._doFindPreviousMatchMultiline(
        model,
        new Position(lineCount, model.getLineMaxColumn(lineCount)),
        searcher,
        captureMatches
      );
    }
    return null;
  }
  static _doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches) {
    const lineCount = model.getLineCount();
    const startLineNumber = searchStart.lineNumber;
    const text = model.getLineContent(startLineNumber).substring(0, searchStart.column - 1);
    const r = this._findLastMatchInLine(
      searcher,
      text,
      startLineNumber,
      captureMatches
    );
    if (r) {
      return r;
    }
    for (let i = 1; i <= lineCount; i++) {
      const lineIndex = (lineCount + startLineNumber - i - 1) % lineCount;
      const text2 = model.getLineContent(lineIndex + 1);
      const r2 = this._findLastMatchInLine(
        searcher,
        text2,
        lineIndex + 1,
        captureMatches
      );
      if (r2) {
        return r2;
      }
    }
    return null;
  }
  static _findLastMatchInLine(searcher, text, lineNumber, captureMatches) {
    let bestResult = null;
    let m;
    searcher.reset(0);
    while (m = searcher.next(text)) {
      bestResult = createFindMatch(
        new Range(
          lineNumber,
          m.index + 1,
          lineNumber,
          m.index + 1 + m[0].length
        ),
        m,
        captureMatches
      );
    }
    return bestResult;
  }
}
function leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex === 0) {
    return true;
  }
  const charBefore = text.charCodeAt(matchStartIndex - 1);
  if (wordSeparators.get(charBefore) !== WordCharacterClass.Regular) {
    return true;
  }
  if (charBefore === CharCode.CarriageReturn || charBefore === CharCode.LineFeed) {
    return true;
  }
  if (matchLength > 0) {
    const firstCharInMatch = text.charCodeAt(matchStartIndex);
    if (wordSeparators.get(firstCharInMatch) !== WordCharacterClass.Regular) {
      return true;
    }
  }
  return false;
}
__name(leftIsWordBounday, "leftIsWordBounday");
function rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex + matchLength === textLength) {
    return true;
  }
  const charAfter = text.charCodeAt(matchStartIndex + matchLength);
  if (wordSeparators.get(charAfter) !== WordCharacterClass.Regular) {
    return true;
  }
  if (charAfter === CharCode.CarriageReturn || charAfter === CharCode.LineFeed) {
    return true;
  }
  if (matchLength > 0) {
    const lastCharInMatch = text.charCodeAt(
      matchStartIndex + matchLength - 1
    );
    if (wordSeparators.get(lastCharInMatch) !== WordCharacterClass.Regular) {
      return true;
    }
  }
  return false;
}
__name(rightIsWordBounday, "rightIsWordBounday");
function isValidMatch(wordSeparators, text, textLength, matchStartIndex, matchLength) {
  return leftIsWordBounday(
    wordSeparators,
    text,
    textLength,
    matchStartIndex,
    matchLength
  ) && rightIsWordBounday(
    wordSeparators,
    text,
    textLength,
    matchStartIndex,
    matchLength
  );
}
__name(isValidMatch, "isValidMatch");
class Searcher {
  static {
    __name(this, "Searcher");
  }
  _wordSeparators;
  _searchRegex;
  _prevMatchStartIndex;
  _prevMatchLength;
  constructor(wordSeparators, searchRegex) {
    this._wordSeparators = wordSeparators;
    this._searchRegex = searchRegex;
    this._prevMatchStartIndex = -1;
    this._prevMatchLength = 0;
  }
  reset(lastIndex) {
    this._searchRegex.lastIndex = lastIndex;
    this._prevMatchStartIndex = -1;
    this._prevMatchLength = 0;
  }
  next(text) {
    const textLength = text.length;
    let m;
    do {
      if (this._prevMatchStartIndex + this._prevMatchLength === textLength) {
        return null;
      }
      m = this._searchRegex.exec(text);
      if (!m) {
        return null;
      }
      const matchStartIndex = m.index;
      const matchLength = m[0].length;
      if (matchStartIndex === this._prevMatchStartIndex && matchLength === this._prevMatchLength) {
        if (matchLength === 0) {
          if (strings.getNextCodePoint(
            text,
            textLength,
            this._searchRegex.lastIndex
          ) > 65535) {
            this._searchRegex.lastIndex += 2;
          } else {
            this._searchRegex.lastIndex += 1;
          }
          continue;
        }
        return null;
      }
      this._prevMatchStartIndex = matchStartIndex;
      this._prevMatchLength = matchLength;
      if (!this._wordSeparators || isValidMatch(
        this._wordSeparators,
        text,
        textLength,
        matchStartIndex,
        matchLength
      )) {
        return m;
      }
    } while (m);
    return null;
  }
}
export {
  SearchParams,
  Searcher,
  TextModelSearch,
  createFindMatch,
  isMultilineRegexSource,
  isValidMatch
};
//# sourceMappingURL=textModelSearch.js.map
