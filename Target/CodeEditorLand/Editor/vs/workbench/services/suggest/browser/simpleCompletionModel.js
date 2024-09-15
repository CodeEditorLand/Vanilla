var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SimpleCompletionItem } from "./simpleCompletionItem.js";
import { quickSelect } from "../../../../base/common/arrays.js";
import { CharCode } from "../../../../base/common/charCode.js";
import { FuzzyScore, fuzzyScore, fuzzyScoreGracefulAggressive, FuzzyScoreOptions, FuzzyScorer } from "../../../../base/common/filters.js";
import { isWindows } from "../../../../base/common/platform.js";
class LineContext {
  constructor(leadingLineContent, characterCountDelta) {
    this.leadingLineContent = leadingLineContent;
    this.characterCountDelta = characterCountDelta;
  }
  static {
    __name(this, "LineContext");
  }
}
var Refilter = /* @__PURE__ */ ((Refilter2) => {
  Refilter2[Refilter2["Nothing"] = 0] = "Nothing";
  Refilter2[Refilter2["All"] = 1] = "All";
  Refilter2[Refilter2["Incr"] = 2] = "Incr";
  return Refilter2;
})(Refilter || {});
class SimpleCompletionModel {
  constructor(_items, _lineContext, replacementIndex, replacementLength) {
    this._items = _items;
    this._lineContext = _lineContext;
    this.replacementIndex = replacementIndex;
    this.replacementLength = replacementLength;
  }
  static {
    __name(this, "SimpleCompletionModel");
  }
  _stats;
  _filteredItems;
  _refilterKind = 1 /* All */;
  _fuzzyScoreOptions = FuzzyScoreOptions.default;
  // TODO: Pass in options
  _options = {};
  get items() {
    this._ensureCachedState();
    return this._filteredItems;
  }
  get stats() {
    this._ensureCachedState();
    return this._stats;
  }
  get lineContext() {
    return this._lineContext;
  }
  set lineContext(value) {
    if (this._lineContext.leadingLineContent !== value.leadingLineContent || this._lineContext.characterCountDelta !== value.characterCountDelta) {
      this._refilterKind = this._lineContext.characterCountDelta < value.characterCountDelta && this._filteredItems ? 2 /* Incr */ : 1 /* All */;
      this._lineContext = value;
    }
  }
  _ensureCachedState() {
    if (this._refilterKind !== 0 /* Nothing */) {
      this._createCachedState();
    }
  }
  _createCachedState() {
    const labelLengths = [];
    const { leadingLineContent, characterCountDelta } = this._lineContext;
    let word = "";
    let wordLow = "";
    const source = this._refilterKind === 1 /* All */ ? this._items : this._filteredItems;
    const target = [];
    const scoreFn = !this._options.filterGraceful || source.length > 2e3 ? fuzzyScore : fuzzyScoreGracefulAggressive;
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      const overwriteBefore = this.replacementLength;
      const wordLen = overwriteBefore + characterCountDelta;
      if (word.length !== wordLen) {
        word = wordLen === 0 ? "" : leadingLineContent.slice(-wordLen);
        wordLow = word.toLowerCase();
      }
      item.word = word;
      if (wordLen === 0) {
        item.score = FuzzyScore.Default;
      } else {
        let wordPos = 0;
        while (wordPos < overwriteBefore) {
          const ch = word.charCodeAt(wordPos);
          if (ch === CharCode.Space || ch === CharCode.Tab) {
            wordPos += 1;
          } else {
            break;
          }
        }
        if (wordPos >= wordLen) {
          item.score = FuzzyScore.Default;
        } else {
          const match = scoreFn(word, wordLow, wordPos, item.completion.label, item.labelLow, 0, this._fuzzyScoreOptions);
          if (!match) {
            continue;
          }
          item.score = match;
        }
      }
      item.idx = i;
      target.push(item);
      labelLengths.push(item.completion.label.length);
    }
    this._filteredItems = target.sort((a, b) => {
      let score = 0;
      if (a.completion.isKeyword && a.labelLow !== wordLow || b.completion.isKeyword && b.labelLow !== wordLow) {
        score = (a.completion.isKeyword ? 1 : 0) - (b.completion.isKeyword ? 1 : 0);
        if (score !== 0) {
          return score;
        }
      }
      score = b.score[0] - a.score[0];
      if (score !== 0) {
        return score;
      }
      const isArg = leadingLineContent.includes(" ");
      if (!isArg && a.fileExtLow.length > 0 && b.fileExtLow.length > 0) {
        score = a.labelLowExcludeFileExt.length - b.labelLowExcludeFileExt.length;
        if (score !== 0) {
          return score;
        }
        score = fileExtScore(b.fileExtLow) - fileExtScore(a.fileExtLow);
        if (score !== 0) {
          return score;
        }
        score = a.fileExtLow.length - b.fileExtLow.length;
      }
      return score;
    });
    this._refilterKind = 0 /* Nothing */;
    this._stats = {
      pLabelLen: labelLengths.length ? quickSelect(labelLengths.length - 0.85, labelLengths, (a, b) => a - b) : 0
    };
  }
}
const fileExtScores = new Map(isWindows ? [
  // Windows - .ps1 > .exe > .bat > .cmd. This is the command precedence when running the files
  //           without an extension, tested manually in pwsh v7.4.4
  ["ps1", 0.09],
  ["exe", 0.08],
  ["bat", 0.07],
  ["cmd", 0.07],
  // Non-Windows
  ["sh", -0.05],
  ["bash", -0.05],
  ["zsh", -0.05],
  ["fish", -0.05],
  ["csh", -0.06],
  // C shell
  ["ksh", -0.06]
  // Korn shell
  // Scripting language files are excluded here as the standard behavior on Windows will just open
  // the file in a text editor, not run the file
] : [
  // Pwsh
  ["ps1", 0.05],
  // Windows
  ["bat", -0.05],
  ["cmd", -0.05],
  ["exe", -0.05],
  // Non-Windows
  ["sh", 0.05],
  ["bash", 0.05],
  ["zsh", 0.05],
  ["fish", 0.05],
  ["csh", 0.04],
  // C shell
  ["ksh", 0.04],
  // Korn shell
  // Scripting languages
  ["py", 0.05],
  // Python
  ["pl", 0.05]
  // Perl
]);
function fileExtScore(ext) {
  return fileExtScores.get(ext) || 0;
}
__name(fileExtScore, "fileExtScore");
export {
  LineContext,
  SimpleCompletionModel
};
//# sourceMappingURL=simpleCompletionModel.js.map
