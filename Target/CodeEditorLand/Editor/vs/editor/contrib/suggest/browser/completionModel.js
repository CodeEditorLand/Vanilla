var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { quickSelect } from "../../../../base/common/arrays.js";
import { CharCode } from "../../../../base/common/charCode.js";
import {
  FuzzyScore,
  FuzzyScoreOptions,
  anyScore,
  fuzzyScore,
  fuzzyScoreGracefulAggressive
} from "../../../../base/common/filters.js";
import { compareIgnoreCase } from "../../../../base/common/strings.js";
import {
  CompletionItemKind
} from "../../../common/languages.js";
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
class CompletionModel {
  constructor(items, column, lineContext, wordDistance, options, snippetSuggestions, fuzzyScoreOptions = FuzzyScoreOptions.default, clipboardText = void 0) {
    this.clipboardText = clipboardText;
    this._items = items;
    this._column = column;
    this._wordDistance = wordDistance;
    this._options = options;
    this._refilterKind = 1 /* All */;
    this._lineContext = lineContext;
    this._fuzzyScoreOptions = fuzzyScoreOptions;
    if (snippetSuggestions === "top") {
      this._snippetCompareFn = CompletionModel._compareCompletionItemsSnippetsUp;
    } else if (snippetSuggestions === "bottom") {
      this._snippetCompareFn = CompletionModel._compareCompletionItemsSnippetsDown;
    }
  }
  static {
    __name(this, "CompletionModel");
  }
  _items;
  _column;
  _wordDistance;
  _options;
  _snippetCompareFn = CompletionModel._compareCompletionItems;
  _fuzzyScoreOptions;
  _lineContext;
  _refilterKind;
  _filteredItems;
  _itemsByProvider;
  _stats;
  get lineContext() {
    return this._lineContext;
  }
  set lineContext(value) {
    if (this._lineContext.leadingLineContent !== value.leadingLineContent || this._lineContext.characterCountDelta !== value.characterCountDelta) {
      this._refilterKind = this._lineContext.characterCountDelta < value.characterCountDelta && this._filteredItems ? 2 /* Incr */ : 1 /* All */;
      this._lineContext = value;
    }
  }
  get items() {
    this._ensureCachedState();
    return this._filteredItems;
  }
  getItemsByProvider() {
    this._ensureCachedState();
    return this._itemsByProvider;
  }
  getIncompleteProvider() {
    this._ensureCachedState();
    const result = /* @__PURE__ */ new Set();
    for (const [provider, items] of this.getItemsByProvider()) {
      if (items.length > 0 && items[0].container.incomplete) {
        result.add(provider);
      }
    }
    return result;
  }
  get stats() {
    this._ensureCachedState();
    return this._stats;
  }
  _ensureCachedState() {
    if (this._refilterKind !== 0 /* Nothing */) {
      this._createCachedState();
    }
  }
  _createCachedState() {
    this._itemsByProvider = /* @__PURE__ */ new Map();
    const labelLengths = [];
    const { leadingLineContent, characterCountDelta } = this._lineContext;
    let word = "";
    let wordLow = "";
    const source = this._refilterKind === 1 /* All */ ? this._items : this._filteredItems;
    const target = [];
    const scoreFn = !this._options.filterGraceful || source.length > 2e3 ? fuzzyScore : fuzzyScoreGracefulAggressive;
    for (let i = 0; i < source.length; i++) {
      const item = source[i];
      if (item.isInvalid) {
        continue;
      }
      const arr = this._itemsByProvider.get(item.provider);
      if (arr) {
        arr.push(item);
      } else {
        this._itemsByProvider.set(item.provider, [item]);
      }
      const overwriteBefore = item.position.column - item.editStart.column;
      const wordLen = overwriteBefore + characterCountDelta - (item.position.column - this._column);
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
        } else if (typeof item.completion.filterText === "string") {
          const match = scoreFn(
            word,
            wordLow,
            wordPos,
            item.completion.filterText,
            item.filterTextLow,
            0,
            this._fuzzyScoreOptions
          );
          if (!match) {
            continue;
          }
          if (compareIgnoreCase(
            item.completion.filterText,
            item.textLabel
          ) === 0) {
            item.score = match;
          } else {
            item.score = anyScore(
              word,
              wordLow,
              wordPos,
              item.textLabel,
              item.labelLow,
              0
            );
            item.score[0] = match[0];
          }
        } else {
          const match = scoreFn(
            word,
            wordLow,
            wordPos,
            item.textLabel,
            item.labelLow,
            0,
            this._fuzzyScoreOptions
          );
          if (!match) {
            continue;
          }
          item.score = match;
        }
      }
      item.idx = i;
      item.distance = this._wordDistance.distance(
        item.position,
        item.completion
      );
      target.push(item);
      labelLengths.push(item.textLabel.length);
    }
    this._filteredItems = target.sort(this._snippetCompareFn);
    this._refilterKind = 0 /* Nothing */;
    this._stats = {
      pLabelLen: labelLengths.length ? quickSelect(
        labelLengths.length - 0.85,
        labelLengths,
        (a, b) => a - b
      ) : 0
    };
  }
  static _compareCompletionItems(a, b) {
    if (a.score[0] > b.score[0]) {
      return -1;
    } else if (a.score[0] < b.score[0]) {
      return 1;
    } else if (a.distance < b.distance) {
      return -1;
    } else if (a.distance > b.distance) {
      return 1;
    } else if (a.idx < b.idx) {
      return -1;
    } else if (a.idx > b.idx) {
      return 1;
    } else {
      return 0;
    }
  }
  static _compareCompletionItemsSnippetsDown(a, b) {
    if (a.completion.kind !== b.completion.kind) {
      if (a.completion.kind === CompletionItemKind.Snippet) {
        return 1;
      } else if (b.completion.kind === CompletionItemKind.Snippet) {
        return -1;
      }
    }
    return CompletionModel._compareCompletionItems(a, b);
  }
  static _compareCompletionItemsSnippetsUp(a, b) {
    if (a.completion.kind !== b.completion.kind) {
      if (a.completion.kind === CompletionItemKind.Snippet) {
        return -1;
      } else if (b.completion.kind === CompletionItemKind.Snippet) {
        return 1;
      }
    }
    return CompletionModel._compareCompletionItems(a, b);
  }
}
export {
  CompletionModel,
  LineContext
};
//# sourceMappingURL=completionModel.js.map
