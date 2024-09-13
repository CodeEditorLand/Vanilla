var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { escapeRegExpCharacters } from "../../../../../base/common/strings.js";
import { BracketAstNode } from "./ast.js";
import { toLength } from "./length.js";
import {
  SmallImmutableSet,
  identityKeyProvider
} from "./smallImmutableSet.js";
import { Token, TokenKind } from "./tokenizer.js";
class BracketTokens {
  constructor(map) {
    this.map = map;
  }
  static {
    __name(this, "BracketTokens");
  }
  static createFromLanguage(configuration, denseKeyProvider) {
    function getId(bracketInfo) {
      return denseKeyProvider.getKey(
        `${bracketInfo.languageId}:::${bracketInfo.bracketText}`
      );
    }
    __name(getId, "getId");
    const map = /* @__PURE__ */ new Map();
    for (const openingBracket of configuration.bracketsNew.openingBrackets) {
      const length = toLength(0, openingBracket.bracketText.length);
      const openingTextId = getId(openingBracket);
      const bracketIds = SmallImmutableSet.getEmpty().add(
        openingTextId,
        identityKeyProvider
      );
      map.set(
        openingBracket.bracketText,
        new Token(
          length,
          TokenKind.OpeningBracket,
          openingTextId,
          bracketIds,
          BracketAstNode.create(length, openingBracket, bracketIds)
        )
      );
    }
    for (const closingBracket of configuration.bracketsNew.closingBrackets) {
      const length = toLength(0, closingBracket.bracketText.length);
      let bracketIds = SmallImmutableSet.getEmpty();
      const closingBrackets = closingBracket.getOpeningBrackets();
      for (const bracket of closingBrackets) {
        bracketIds = bracketIds.add(
          getId(bracket),
          identityKeyProvider
        );
      }
      map.set(
        closingBracket.bracketText,
        new Token(
          length,
          TokenKind.ClosingBracket,
          getId(closingBrackets[0]),
          bracketIds,
          BracketAstNode.create(length, closingBracket, bracketIds)
        )
      );
    }
    return new BracketTokens(map);
  }
  hasRegExp = false;
  _regExpGlobal = null;
  getRegExpStr() {
    if (this.isEmpty) {
      return null;
    } else {
      const keys = [...this.map.keys()];
      keys.sort();
      keys.reverse();
      return keys.map((k) => prepareBracketForRegExp(k)).join("|");
    }
  }
  /**
   * Returns null if there is no such regexp (because there are no brackets).
   */
  get regExpGlobal() {
    if (!this.hasRegExp) {
      const regExpStr = this.getRegExpStr();
      this._regExpGlobal = regExpStr ? new RegExp(regExpStr, "gi") : null;
      this.hasRegExp = true;
    }
    return this._regExpGlobal;
  }
  getToken(value) {
    return this.map.get(value.toLowerCase());
  }
  findClosingTokenText(openingBracketIds) {
    for (const [closingText, info] of this.map) {
      if (info.kind === TokenKind.ClosingBracket && info.bracketIds.intersects(openingBracketIds)) {
        return closingText;
      }
    }
    return void 0;
  }
  get isEmpty() {
    return this.map.size === 0;
  }
}
function prepareBracketForRegExp(str) {
  let escaped = escapeRegExpCharacters(str);
  if (/^[\w ]+/.test(str)) {
    escaped = `\\b${escaped}`;
  }
  if (/[\w ]+$/.test(str)) {
    escaped = `${escaped}\\b`;
  }
  return escaped;
}
__name(prepareBracketForRegExp, "prepareBracketForRegExp");
class LanguageAgnosticBracketTokens {
  constructor(denseKeyProvider, getLanguageConfiguration) {
    this.denseKeyProvider = denseKeyProvider;
    this.getLanguageConfiguration = getLanguageConfiguration;
  }
  static {
    __name(this, "LanguageAgnosticBracketTokens");
  }
  languageIdToBracketTokens = /* @__PURE__ */ new Map();
  didLanguageChange(languageId) {
    return this.languageIdToBracketTokens.has(languageId);
  }
  getSingleLanguageBracketTokens(languageId) {
    let singleLanguageBracketTokens = this.languageIdToBracketTokens.get(languageId);
    if (!singleLanguageBracketTokens) {
      singleLanguageBracketTokens = BracketTokens.createFromLanguage(
        this.getLanguageConfiguration(languageId),
        this.denseKeyProvider
      );
      this.languageIdToBracketTokens.set(
        languageId,
        singleLanguageBracketTokens
      );
    }
    return singleLanguageBracketTokens;
  }
  getToken(value, languageId) {
    const singleLanguageBracketTokens = this.getSingleLanguageBracketTokens(languageId);
    return singleLanguageBracketTokens.getToken(value);
  }
}
export {
  BracketTokens,
  LanguageAgnosticBracketTokens
};
//# sourceMappingURL=brackets.js.map
