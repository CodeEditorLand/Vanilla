var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  StandardAutoClosingPairConditional
} from "../languageConfiguration.js";
class CharacterPairSupport {
  static {
    __name(this, "CharacterPairSupport");
  }
  static DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES = ";:.,=}])> \n	";
  static DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS = "'\"`;:.,=}])> \n	";
  static DEFAULT_AUTOCLOSE_BEFORE_WHITESPACE = " \n	";
  _autoClosingPairs;
  _surroundingPairs;
  _autoCloseBeforeForQuotes;
  _autoCloseBeforeForBrackets;
  constructor(config) {
    if (config.autoClosingPairs) {
      this._autoClosingPairs = config.autoClosingPairs.map(
        (el) => new StandardAutoClosingPairConditional(el)
      );
    } else if (config.brackets) {
      this._autoClosingPairs = config.brackets.map(
        (b) => new StandardAutoClosingPairConditional({
          open: b[0],
          close: b[1]
        })
      );
    } else {
      this._autoClosingPairs = [];
    }
    if (config.__electricCharacterSupport && config.__electricCharacterSupport.docComment) {
      const docComment = config.__electricCharacterSupport.docComment;
      this._autoClosingPairs.push(
        new StandardAutoClosingPairConditional({
          open: docComment.open,
          close: docComment.close || ""
        })
      );
    }
    this._autoCloseBeforeForQuotes = typeof config.autoCloseBefore === "string" ? config.autoCloseBefore : CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES;
    this._autoCloseBeforeForBrackets = typeof config.autoCloseBefore === "string" ? config.autoCloseBefore : CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS;
    this._surroundingPairs = config.surroundingPairs || this._autoClosingPairs;
  }
  getAutoClosingPairs() {
    return this._autoClosingPairs;
  }
  getAutoCloseBeforeSet(forQuotes) {
    return forQuotes ? this._autoCloseBeforeForQuotes : this._autoCloseBeforeForBrackets;
  }
  getSurroundingPairs() {
    return this._surroundingPairs;
  }
}
export {
  CharacterPairSupport
};
//# sourceMappingURL=characterPair.js.map
