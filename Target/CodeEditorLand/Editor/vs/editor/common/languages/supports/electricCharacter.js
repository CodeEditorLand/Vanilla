var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { distinct } from "../../../../base/common/arrays.js";
import { ignoreBracketsInToken } from "../supports.js";
import { BracketsUtils } from "./richEditBrackets.js";
class BracketElectricCharacterSupport {
  static {
    __name(this, "BracketElectricCharacterSupport");
  }
  _richEditBrackets;
  constructor(richEditBrackets) {
    this._richEditBrackets = richEditBrackets;
  }
  getElectricCharacters() {
    const result = [];
    if (this._richEditBrackets) {
      for (const bracket of this._richEditBrackets.brackets) {
        for (const close of bracket.close) {
          const lastChar = close.charAt(close.length - 1);
          result.push(lastChar);
        }
      }
    }
    return distinct(result);
  }
  onElectricCharacter(character, context, column) {
    if (!this._richEditBrackets || this._richEditBrackets.brackets.length === 0) {
      return null;
    }
    const tokenIndex = context.findTokenIndexAtOffset(column - 1);
    if (ignoreBracketsInToken(context.getStandardTokenType(tokenIndex))) {
      return null;
    }
    const reversedBracketRegex = this._richEditBrackets.reversedRegex;
    const text = context.getLineContent().substring(0, column - 1) + character;
    const r = BracketsUtils.findPrevBracketInRange(
      reversedBracketRegex,
      1,
      text,
      0,
      text.length
    );
    if (!r) {
      return null;
    }
    const bracketText = text.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
    const isOpen = this._richEditBrackets.textIsOpenBracket[bracketText];
    if (isOpen) {
      return null;
    }
    const textBeforeBracket = context.getActualLineContentBefore(
      r.startColumn - 1
    );
    if (!/^\s*$/.test(textBeforeBracket)) {
      return null;
    }
    return {
      matchOpenBracket: bracketText
    };
  }
}
export {
  BracketElectricCharacterSupport
};
//# sourceMappingURL=electricCharacter.js.map
