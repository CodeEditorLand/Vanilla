var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "../../../base/common/charCode.js";
import { LRUCache } from "../../../base/common/map.js";
import { CharacterClassifier } from "./characterClassifier.js";
var WordCharacterClass = /* @__PURE__ */ ((WordCharacterClass2) => {
  WordCharacterClass2[WordCharacterClass2["Regular"] = 0] = "Regular";
  WordCharacterClass2[WordCharacterClass2["Whitespace"] = 1] = "Whitespace";
  WordCharacterClass2[WordCharacterClass2["WordSeparator"] = 2] = "WordSeparator";
  return WordCharacterClass2;
})(WordCharacterClass || {});
class WordCharacterClassifier extends CharacterClassifier {
  static {
    __name(this, "WordCharacterClassifier");
  }
  intlSegmenterLocales;
  _segmenter = null;
  _cachedLine = null;
  _cachedSegments = [];
  constructor(wordSeparators, intlSegmenterLocales) {
    super(0 /* Regular */);
    this.intlSegmenterLocales = intlSegmenterLocales;
    if (this.intlSegmenterLocales.length > 0) {
      this._segmenter = new Intl.Segmenter(this.intlSegmenterLocales, { granularity: "word" });
    } else {
      this._segmenter = null;
    }
    for (let i = 0, len = wordSeparators.length; i < len; i++) {
      this.set(wordSeparators.charCodeAt(i), 2 /* WordSeparator */);
    }
    this.set(CharCode.Space, 1 /* Whitespace */);
    this.set(CharCode.Tab, 1 /* Whitespace */);
  }
  findPrevIntlWordBeforeOrAtOffset(line, offset) {
    let candidate = null;
    for (const segment of this._getIntlSegmenterWordsOnLine(line)) {
      if (segment.index > offset) {
        break;
      }
      candidate = segment;
    }
    return candidate;
  }
  findNextIntlWordAtOrAfterOffset(lineContent, offset) {
    for (const segment of this._getIntlSegmenterWordsOnLine(lineContent)) {
      if (segment.index < offset) {
        continue;
      }
      return segment;
    }
    return null;
  }
  _getIntlSegmenterWordsOnLine(line) {
    if (!this._segmenter) {
      return [];
    }
    if (this._cachedLine === line) {
      return this._cachedSegments;
    }
    this._cachedLine = line;
    this._cachedSegments = this._filterWordSegments(this._segmenter.segment(line));
    return this._cachedSegments;
  }
  _filterWordSegments(segments) {
    const result = [];
    for (const segment of segments) {
      if (this._isWordLike(segment)) {
        result.push(segment);
      }
    }
    return result;
  }
  _isWordLike(segment) {
    if (segment.isWordLike) {
      return true;
    }
    return false;
  }
}
const wordClassifierCache = new LRUCache(10);
function getMapForWordSeparators(wordSeparators, intlSegmenterLocales) {
  const key = `${wordSeparators}/${intlSegmenterLocales.join(",")}`;
  let result = wordClassifierCache.get(key);
  if (!result) {
    result = new WordCharacterClassifier(wordSeparators, intlSegmenterLocales);
    wordClassifierCache.set(key, result);
  }
  return result;
}
__name(getMapForWordSeparators, "getMapForWordSeparators");
export {
  WordCharacterClass,
  WordCharacterClassifier,
  getMapForWordSeparators
};
//# sourceMappingURL=wordCharacterClassifier.js.map
