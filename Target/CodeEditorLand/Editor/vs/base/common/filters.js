var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "./charCode.js";
import { LRUCache } from "./map.js";
import { getKoreanAltChars } from "./naturalLanguage/korean.js";
import * as strings from "./strings.js";
function or(...filter) {
  return function(word, wordToMatchAgainst) {
    for (let i = 0, len = filter.length; i < len; i++) {
      const match = filter[i](word, wordToMatchAgainst);
      if (match) {
        return match;
      }
    }
    return null;
  };
}
__name(or, "or");
const matchesStrictPrefix = _matchesPrefix.bind(void 0, false);
const matchesPrefix = _matchesPrefix.bind(void 0, true);
function _matchesPrefix(ignoreCase, word, wordToMatchAgainst) {
  if (!wordToMatchAgainst || wordToMatchAgainst.length < word.length) {
    return null;
  }
  let matches;
  if (ignoreCase) {
    matches = strings.startsWithIgnoreCase(wordToMatchAgainst, word);
  } else {
    matches = wordToMatchAgainst.indexOf(word) === 0;
  }
  if (!matches) {
    return null;
  }
  return word.length > 0 ? [{ start: 0, end: word.length }] : [];
}
__name(_matchesPrefix, "_matchesPrefix");
function matchesContiguousSubString(word, wordToMatchAgainst) {
  const index = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
  if (index === -1) {
    return null;
  }
  return [{ start: index, end: index + word.length }];
}
__name(matchesContiguousSubString, "matchesContiguousSubString");
function matchesSubString(word, wordToMatchAgainst) {
  return _matchesSubString(word.toLowerCase(), wordToMatchAgainst.toLowerCase(), 0, 0);
}
__name(matchesSubString, "matchesSubString");
function _matchesSubString(word, wordToMatchAgainst, i, j) {
  if (i === word.length) {
    return [];
  } else if (j === wordToMatchAgainst.length) {
    return null;
  } else {
    if (word[i] === wordToMatchAgainst[j]) {
      let result = null;
      if (result = _matchesSubString(word, wordToMatchAgainst, i + 1, j + 1)) {
        return join({ start: j, end: j + 1 }, result);
      }
      return null;
    }
    return _matchesSubString(word, wordToMatchAgainst, i, j + 1);
  }
}
__name(_matchesSubString, "_matchesSubString");
function isLower(code) {
  return CharCode.a <= code && code <= CharCode.z;
}
__name(isLower, "isLower");
function isUpper(code) {
  return CharCode.A <= code && code <= CharCode.Z;
}
__name(isUpper, "isUpper");
function isNumber(code) {
  return CharCode.Digit0 <= code && code <= CharCode.Digit9;
}
__name(isNumber, "isNumber");
function isWhitespace(code) {
  return code === CharCode.Space || code === CharCode.Tab || code === CharCode.LineFeed || code === CharCode.CarriageReturn;
}
__name(isWhitespace, "isWhitespace");
const wordSeparators = /* @__PURE__ */ new Set();
"()[]{}<>`'\"-/;:,.?!".split("").forEach((s) => wordSeparators.add(s.charCodeAt(0)));
function isWordSeparator(code) {
  return isWhitespace(code) || wordSeparators.has(code);
}
__name(isWordSeparator, "isWordSeparator");
function charactersMatch(codeA, codeB) {
  return codeA === codeB || isWordSeparator(codeA) && isWordSeparator(codeB);
}
__name(charactersMatch, "charactersMatch");
const alternateCharsCache = /* @__PURE__ */ new Map();
function getAlternateCodes(code) {
  if (alternateCharsCache.has(code)) {
    return alternateCharsCache.get(code);
  }
  let result;
  const codes = getKoreanAltChars(code);
  if (codes) {
    result = codes;
  }
  alternateCharsCache.set(code, result);
  return result;
}
__name(getAlternateCodes, "getAlternateCodes");
function isAlphanumeric(code) {
  return isLower(code) || isUpper(code) || isNumber(code);
}
__name(isAlphanumeric, "isAlphanumeric");
function join(head, tail) {
  if (tail.length === 0) {
    tail = [head];
  } else if (head.end === tail[0].start) {
    tail[0].start = head.start;
  } else {
    tail.unshift(head);
  }
  return tail;
}
__name(join, "join");
function nextAnchor(camelCaseWord, start) {
  for (let i = start; i < camelCaseWord.length; i++) {
    const c = camelCaseWord.charCodeAt(i);
    if (isUpper(c) || isNumber(c) || i > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i - 1))) {
      return i;
    }
  }
  return camelCaseWord.length;
}
__name(nextAnchor, "nextAnchor");
function _matchesCamelCase(word, camelCaseWord, i, j) {
  if (i === word.length) {
    return [];
  } else if (j === camelCaseWord.length) {
    return null;
  } else if (word[i] !== camelCaseWord[j].toLowerCase()) {
    return null;
  } else {
    let result = null;
    let nextUpperIndex = j + 1;
    result = _matchesCamelCase(word, camelCaseWord, i + 1, j + 1);
    while (!result && (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length) {
      result = _matchesCamelCase(word, camelCaseWord, i + 1, nextUpperIndex);
      nextUpperIndex++;
    }
    return result === null ? null : join({ start: j, end: j + 1 }, result);
  }
}
__name(_matchesCamelCase, "_matchesCamelCase");
function analyzeCamelCaseWord(word) {
  let upper = 0, lower = 0, alpha = 0, numeric = 0, code = 0;
  for (let i = 0; i < word.length; i++) {
    code = word.charCodeAt(i);
    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isAlphanumeric(code)) {
      alpha++;
    }
    if (isNumber(code)) {
      numeric++;
    }
  }
  const upperPercent = upper / word.length;
  const lowerPercent = lower / word.length;
  const alphaPercent = alpha / word.length;
  const numericPercent = numeric / word.length;
  return { upperPercent, lowerPercent, alphaPercent, numericPercent };
}
__name(analyzeCamelCaseWord, "analyzeCamelCaseWord");
function isUpperCaseWord(analysis) {
  const { upperPercent, lowerPercent } = analysis;
  return lowerPercent === 0 && upperPercent > 0.6;
}
__name(isUpperCaseWord, "isUpperCaseWord");
function isCamelCaseWord(analysis) {
  const { upperPercent, lowerPercent, alphaPercent, numericPercent } = analysis;
  return lowerPercent > 0.2 && upperPercent < 0.8 && alphaPercent > 0.6 && numericPercent < 0.2;
}
__name(isCamelCaseWord, "isCamelCaseWord");
function isCamelCasePattern(word) {
  let upper = 0, lower = 0, code = 0, whitespace = 0;
  for (let i = 0; i < word.length; i++) {
    code = word.charCodeAt(i);
    if (isUpper(code)) {
      upper++;
    }
    if (isLower(code)) {
      lower++;
    }
    if (isWhitespace(code)) {
      whitespace++;
    }
  }
  if ((upper === 0 || lower === 0) && whitespace === 0) {
    return word.length <= 30;
  } else {
    return upper <= 5;
  }
}
__name(isCamelCasePattern, "isCamelCasePattern");
function matchesCamelCase(word, camelCaseWord) {
  if (!camelCaseWord) {
    return null;
  }
  camelCaseWord = camelCaseWord.trim();
  if (camelCaseWord.length === 0) {
    return null;
  }
  if (!isCamelCasePattern(word)) {
    return null;
  }
  if (camelCaseWord.length > 60) {
    camelCaseWord = camelCaseWord.substring(0, 60);
  }
  const analysis = analyzeCamelCaseWord(camelCaseWord);
  if (!isCamelCaseWord(analysis)) {
    if (!isUpperCaseWord(analysis)) {
      return null;
    }
    camelCaseWord = camelCaseWord.toLowerCase();
  }
  let result = null;
  let i = 0;
  word = word.toLowerCase();
  while (i < camelCaseWord.length && (result = _matchesCamelCase(word, camelCaseWord, 0, i)) === null) {
    i = nextAnchor(camelCaseWord, i + 1);
  }
  return result;
}
__name(matchesCamelCase, "matchesCamelCase");
function matchesWords(word, target, contiguous = false) {
  if (!target || target.length === 0) {
    return null;
  }
  let result = null;
  let targetIndex = 0;
  word = word.toLowerCase();
  target = target.toLowerCase();
  while (targetIndex < target.length) {
    result = _matchesWords(word, target, 0, targetIndex, contiguous);
    if (result !== null) {
      break;
    }
    targetIndex = nextWord(target, targetIndex + 1);
  }
  return result;
}
__name(matchesWords, "matchesWords");
function _matchesWords(word, target, wordIndex, targetIndex, contiguous) {
  let targetIndexOffset = 0;
  if (wordIndex === word.length) {
    return [];
  } else if (targetIndex === target.length) {
    return null;
  } else if (!charactersMatch(word.charCodeAt(wordIndex), target.charCodeAt(targetIndex))) {
    const altChars = getAlternateCodes(word.charCodeAt(wordIndex));
    if (!altChars) {
      return null;
    }
    for (let k = 0; k < altChars.length; k++) {
      if (!charactersMatch(altChars[k], target.charCodeAt(targetIndex + k))) {
        return null;
      }
    }
    targetIndexOffset += altChars.length - 1;
  }
  let result = null;
  let nextWordIndex = targetIndex + targetIndexOffset + 1;
  result = _matchesWords(word, target, wordIndex + 1, nextWordIndex, contiguous);
  if (!contiguous) {
    while (!result && (nextWordIndex = nextWord(target, nextWordIndex)) < target.length) {
      result = _matchesWords(word, target, wordIndex + 1, nextWordIndex, contiguous);
      nextWordIndex++;
    }
  }
  if (!result) {
    return null;
  }
  if (word.charCodeAt(wordIndex) !== target.charCodeAt(targetIndex)) {
    const altChars = getAlternateCodes(word.charCodeAt(wordIndex));
    if (!altChars) {
      return result;
    }
    for (let k = 0; k < altChars.length; k++) {
      if (altChars[k] !== target.charCodeAt(targetIndex + k)) {
        return result;
      }
    }
  }
  return join({ start: targetIndex, end: targetIndex + targetIndexOffset + 1 }, result);
}
__name(_matchesWords, "_matchesWords");
function nextWord(word, start) {
  for (let i = start; i < word.length; i++) {
    if (isWordSeparator(word.charCodeAt(i)) || i > 0 && isWordSeparator(word.charCodeAt(i - 1))) {
      return i;
    }
  }
  return word.length;
}
__name(nextWord, "nextWord");
const fuzzyContiguousFilter = or(matchesPrefix, matchesCamelCase, matchesContiguousSubString);
const fuzzySeparateFilter = or(matchesPrefix, matchesCamelCase, matchesSubString);
const fuzzyRegExpCache = new LRUCache(1e4);
function matchesFuzzy(word, wordToMatchAgainst, enableSeparateSubstringMatching = false) {
  if (typeof word !== "string" || typeof wordToMatchAgainst !== "string") {
    return null;
  }
  let regexp = fuzzyRegExpCache.get(word);
  if (!regexp) {
    regexp = new RegExp(strings.convertSimple2RegExpPattern(word), "i");
    fuzzyRegExpCache.set(word, regexp);
  }
  const match = regexp.exec(wordToMatchAgainst);
  if (match) {
    return [{ start: match.index, end: match.index + match[0].length }];
  }
  return enableSeparateSubstringMatching ? fuzzySeparateFilter(word, wordToMatchAgainst) : fuzzyContiguousFilter(word, wordToMatchAgainst);
}
__name(matchesFuzzy, "matchesFuzzy");
function matchesFuzzy2(pattern, word) {
  const score = fuzzyScore(pattern, pattern.toLowerCase(), 0, word, word.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
  return score ? createMatches(score) : null;
}
__name(matchesFuzzy2, "matchesFuzzy2");
function anyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos) {
  const max = Math.min(13, pattern.length);
  for (; patternPos < max; patternPos++) {
    const result = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, { firstMatchCanBeWeak: true, boostFullMatch: true });
    if (result) {
      return result;
    }
  }
  return [0, wordPos];
}
__name(anyScore, "anyScore");
function createMatches(score) {
  if (typeof score === "undefined") {
    return [];
  }
  const res = [];
  const wordPos = score[1];
  for (let i = score.length - 1; i > 1; i--) {
    const pos = score[i] + wordPos;
    const last = res[res.length - 1];
    if (last && last.end === pos) {
      last.end = pos + 1;
    } else {
      res.push({ start: pos, end: pos + 1 });
    }
  }
  return res;
}
__name(createMatches, "createMatches");
const _maxLen = 128;
function initTable() {
  const table = [];
  const row = [];
  for (let i = 0; i <= _maxLen; i++) {
    row[i] = 0;
  }
  for (let i = 0; i <= _maxLen; i++) {
    table.push(row.slice(0));
  }
  return table;
}
__name(initTable, "initTable");
function initArr(maxLen) {
  const row = [];
  for (let i = 0; i <= maxLen; i++) {
    row[i] = 0;
  }
  return row;
}
__name(initArr, "initArr");
const _minWordMatchPos = initArr(2 * _maxLen);
const _maxWordMatchPos = initArr(2 * _maxLen);
const _diag = initTable();
const _table = initTable();
const _arrows = initTable();
const _debug = false;
function printTable(table, pattern, patternLen, word, wordLen) {
  function pad(s, n, pad2 = " ") {
    while (s.length < n) {
      s = pad2 + s;
    }
    return s;
  }
  __name(pad, "pad");
  let ret = ` |   |${word.split("").map((c) => pad(c, 3)).join("|")}
`;
  for (let i = 0; i <= patternLen; i++) {
    if (i === 0) {
      ret += " |";
    } else {
      ret += `${pattern[i - 1]}|`;
    }
    ret += table[i].slice(0, wordLen + 1).map((n) => pad(n.toString(), 3)).join("|") + "\n";
  }
  return ret;
}
__name(printTable, "printTable");
function printTables(pattern, patternStart, word, wordStart) {
  pattern = pattern.substr(patternStart);
  word = word.substr(wordStart);
  console.log(printTable(_table, pattern, pattern.length, word, word.length));
  console.log(printTable(_arrows, pattern, pattern.length, word, word.length));
  console.log(printTable(_diag, pattern, pattern.length, word, word.length));
}
__name(printTables, "printTables");
function isSeparatorAtPos(value, index) {
  if (index < 0 || index >= value.length) {
    return false;
  }
  const code = value.codePointAt(index);
  switch (code) {
    case CharCode.Underline:
    case CharCode.Dash:
    case CharCode.Period:
    case CharCode.Space:
    case CharCode.Slash:
    case CharCode.Backslash:
    case CharCode.SingleQuote:
    case CharCode.DoubleQuote:
    case CharCode.Colon:
    case CharCode.DollarSign:
    case CharCode.LessThan:
    case CharCode.GreaterThan:
    case CharCode.OpenParen:
    case CharCode.CloseParen:
    case CharCode.OpenSquareBracket:
    case CharCode.CloseSquareBracket:
    case CharCode.OpenCurlyBrace:
    case CharCode.CloseCurlyBrace:
      return true;
    case void 0:
      return false;
    default:
      if (strings.isEmojiImprecise(code)) {
        return true;
      }
      return false;
  }
}
__name(isSeparatorAtPos, "isSeparatorAtPos");
function isWhitespaceAtPos(value, index) {
  if (index < 0 || index >= value.length) {
    return false;
  }
  const code = value.charCodeAt(index);
  switch (code) {
    case CharCode.Space:
    case CharCode.Tab:
      return true;
    default:
      return false;
  }
}
__name(isWhitespaceAtPos, "isWhitespaceAtPos");
function isUpperCaseAtPos(pos, word, wordLow) {
  return word[pos] !== wordLow[pos];
}
__name(isUpperCaseAtPos, "isUpperCaseAtPos");
function isPatternInWord(patternLow, patternPos, patternLen, wordLow, wordPos, wordLen, fillMinWordPosArr = false) {
  while (patternPos < patternLen && wordPos < wordLen) {
    if (patternLow[patternPos] === wordLow[wordPos]) {
      if (fillMinWordPosArr) {
        _minWordMatchPos[patternPos] = wordPos;
      }
      patternPos += 1;
    }
    wordPos += 1;
  }
  return patternPos === patternLen;
}
__name(isPatternInWord, "isPatternInWord");
var Arrow = /* @__PURE__ */ ((Arrow2) => {
  Arrow2[Arrow2["Diag"] = 1] = "Diag";
  Arrow2[Arrow2["Left"] = 2] = "Left";
  Arrow2[Arrow2["LeftLeft"] = 3] = "LeftLeft";
  return Arrow2;
})(Arrow || {});
var FuzzyScore;
((FuzzyScore2) => {
  FuzzyScore2.Default = [-100, 0];
  function isDefault(score) {
    return !score || score.length === 2 && score[0] === -100 && score[1] === 0;
  }
  FuzzyScore2.isDefault = isDefault;
  __name(isDefault, "isDefault");
})(FuzzyScore || (FuzzyScore = {}));
class FuzzyScoreOptions {
  constructor(firstMatchCanBeWeak, boostFullMatch) {
    this.firstMatchCanBeWeak = firstMatchCanBeWeak;
    this.boostFullMatch = boostFullMatch;
  }
  static {
    __name(this, "FuzzyScoreOptions");
  }
  static default = { boostFullMatch: true, firstMatchCanBeWeak: false };
}
function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, options = FuzzyScoreOptions.default) {
  const patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
  const wordLen = word.length > _maxLen ? _maxLen : word.length;
  if (patternStart >= patternLen || wordStart >= wordLen || patternLen - patternStart > wordLen - wordStart) {
    return void 0;
  }
  if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen, true)) {
    return void 0;
  }
  _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow);
  let row = 1;
  let column = 1;
  let patternPos = patternStart;
  let wordPos = wordStart;
  const hasStrongFirstMatch = [false];
  for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
    const minWordMatchPos = _minWordMatchPos[patternPos];
    const maxWordMatchPos = _maxWordMatchPos[patternPos];
    const nextMaxWordMatchPos = patternPos + 1 < patternLen ? _maxWordMatchPos[patternPos + 1] : wordLen;
    for (column = minWordMatchPos - wordStart + 1, wordPos = minWordMatchPos; wordPos < nextMaxWordMatchPos; column++, wordPos++) {
      let score = Number.MIN_SAFE_INTEGER;
      let canComeDiag = false;
      if (wordPos <= maxWordMatchPos) {
        score = _doScore(
          pattern,
          patternLow,
          patternPos,
          patternStart,
          word,
          wordLow,
          wordPos,
          wordLen,
          wordStart,
          _diag[row - 1][column - 1] === 0,
          hasStrongFirstMatch
        );
      }
      let diagScore = 0;
      if (score !== Number.MAX_SAFE_INTEGER) {
        canComeDiag = true;
        diagScore = score + _table[row - 1][column - 1];
      }
      const canComeLeft = wordPos > minWordMatchPos;
      const leftScore = canComeLeft ? _table[row][column - 1] + (_diag[row][column - 1] > 0 ? -5 : 0) : 0;
      const canComeLeftLeft = wordPos > minWordMatchPos + 1 && _diag[row][column - 1] > 0;
      const leftLeftScore = canComeLeftLeft ? _table[row][column - 2] + (_diag[row][column - 2] > 0 ? -5 : 0) : 0;
      if (canComeLeftLeft && (!canComeLeft || leftLeftScore >= leftScore) && (!canComeDiag || leftLeftScore >= diagScore)) {
        _table[row][column] = leftLeftScore;
        _arrows[row][column] = 3 /* LeftLeft */;
        _diag[row][column] = 0;
      } else if (canComeLeft && (!canComeDiag || leftScore >= diagScore)) {
        _table[row][column] = leftScore;
        _arrows[row][column] = 2 /* Left */;
        _diag[row][column] = 0;
      } else if (canComeDiag) {
        _table[row][column] = diagScore;
        _arrows[row][column] = 1 /* Diag */;
        _diag[row][column] = _diag[row - 1][column - 1] + 1;
      } else {
        throw new Error(`not possible`);
      }
    }
  }
  if (_debug) {
    printTables(pattern, patternStart, word, wordStart);
  }
  if (!hasStrongFirstMatch[0] && !options.firstMatchCanBeWeak) {
    return void 0;
  }
  row--;
  column--;
  const result = [_table[row][column], wordStart];
  let backwardsDiagLength = 0;
  let maxMatchColumn = 0;
  while (row >= 1) {
    let diagColumn = column;
    do {
      const arrow = _arrows[row][diagColumn];
      if (arrow === 3 /* LeftLeft */) {
        diagColumn = diagColumn - 2;
      } else if (arrow === 2 /* Left */) {
        diagColumn = diagColumn - 1;
      } else {
        break;
      }
    } while (diagColumn >= 1);
    if (backwardsDiagLength > 1 && patternLow[patternStart + row - 1] === wordLow[wordStart + column - 1] && !isUpperCaseAtPos(diagColumn + wordStart - 1, word, wordLow) && backwardsDiagLength + 1 > _diag[row][diagColumn]) {
      diagColumn = column;
    }
    if (diagColumn === column) {
      backwardsDiagLength++;
    } else {
      backwardsDiagLength = 1;
    }
    if (!maxMatchColumn) {
      maxMatchColumn = diagColumn;
    }
    row--;
    column = diagColumn - 1;
    result.push(column);
  }
  if (wordLen - wordStart === patternLen && options.boostFullMatch) {
    result[0] += 2;
  }
  const skippedCharsCount = maxMatchColumn - patternLen;
  result[0] -= skippedCharsCount;
  return result;
}
__name(fuzzyScore, "fuzzyScore");
function _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow) {
  let patternPos = patternLen - 1;
  let wordPos = wordLen - 1;
  while (patternPos >= patternStart && wordPos >= wordStart) {
    if (patternLow[patternPos] === wordLow[wordPos]) {
      _maxWordMatchPos[patternPos] = wordPos;
      patternPos--;
    }
    wordPos--;
  }
}
__name(_fillInMaxWordMatchPos, "_fillInMaxWordMatchPos");
function _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos, wordLen, wordStart, newMatchStart, outFirstMatchStrong) {
  if (patternLow[patternPos] !== wordLow[wordPos]) {
    return Number.MIN_SAFE_INTEGER;
  }
  let score = 1;
  let isGapLocation = false;
  if (wordPos === patternPos - patternStart) {
    score = pattern[patternPos] === word[wordPos] ? 7 : 5;
  } else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
    score = pattern[patternPos] === word[wordPos] ? 7 : 5;
    isGapLocation = true;
  } else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
    score = 5;
  } else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
    score = 5;
    isGapLocation = true;
  }
  if (score > 1 && patternPos === patternStart) {
    outFirstMatchStrong[0] = true;
  }
  if (!isGapLocation) {
    isGapLocation = isUpperCaseAtPos(wordPos, word, wordLow) || isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1);
  }
  if (patternPos === patternStart) {
    if (wordPos > wordStart) {
      score -= isGapLocation ? 3 : 5;
    }
  } else {
    if (newMatchStart) {
      score += isGapLocation ? 2 : 0;
    } else {
      score += isGapLocation ? 0 : 1;
    }
  }
  if (wordPos + 1 === wordLen) {
    score -= isGapLocation ? 3 : 5;
  }
  return score;
}
__name(_doScore, "_doScore");
function fuzzyScoreGracefulAggressive(pattern, lowPattern, patternPos, word, lowWord, wordPos, options) {
  return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, true, options);
}
__name(fuzzyScoreGracefulAggressive, "fuzzyScoreGracefulAggressive");
function fuzzyScoreGraceful(pattern, lowPattern, patternPos, word, lowWord, wordPos, options) {
  return fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, false, options);
}
__name(fuzzyScoreGraceful, "fuzzyScoreGraceful");
function fuzzyScoreWithPermutations(pattern, lowPattern, patternPos, word, lowWord, wordPos, aggressive, options) {
  let top = fuzzyScore(pattern, lowPattern, patternPos, word, lowWord, wordPos, options);
  if (top && !aggressive) {
    return top;
  }
  if (pattern.length >= 3) {
    const tries = Math.min(7, pattern.length - 1);
    for (let movingPatternPos = patternPos + 1; movingPatternPos < tries; movingPatternPos++) {
      const newPattern = nextTypoPermutation(pattern, movingPatternPos);
      if (newPattern) {
        const candidate = fuzzyScore(newPattern, newPattern.toLowerCase(), patternPos, word, lowWord, wordPos, options);
        if (candidate) {
          candidate[0] -= 3;
          if (!top || candidate[0] > top[0]) {
            top = candidate;
          }
        }
      }
    }
  }
  return top;
}
__name(fuzzyScoreWithPermutations, "fuzzyScoreWithPermutations");
function nextTypoPermutation(pattern, patternPos) {
  if (patternPos + 1 >= pattern.length) {
    return void 0;
  }
  const swap1 = pattern[patternPos];
  const swap2 = pattern[patternPos + 1];
  if (swap1 === swap2) {
    return void 0;
  }
  return pattern.slice(0, patternPos) + swap2 + swap1 + pattern.slice(patternPos + 2);
}
__name(nextTypoPermutation, "nextTypoPermutation");
export {
  FuzzyScore,
  FuzzyScoreOptions,
  anyScore,
  createMatches,
  fuzzyScore,
  fuzzyScoreGraceful,
  fuzzyScoreGracefulAggressive,
  isPatternInWord,
  isUpper,
  matchesCamelCase,
  matchesContiguousSubString,
  matchesFuzzy,
  matchesFuzzy2,
  matchesPrefix,
  matchesStrictPrefix,
  matchesSubString,
  matchesWords,
  or
};
//# sourceMappingURL=filters.js.map
