import { CharCode } from "../../../base/common/charCode.js";
import { StandardTokenType } from "../encodedTokenAttributes.js";
var IndentAction = /* @__PURE__ */ ((IndentAction2) => {
  IndentAction2[IndentAction2["None"] = 0] = "None";
  IndentAction2[IndentAction2["Indent"] = 1] = "Indent";
  IndentAction2[IndentAction2["IndentOutdent"] = 2] = "IndentOutdent";
  IndentAction2[IndentAction2["Outdent"] = 3] = "Outdent";
  return IndentAction2;
})(IndentAction || {});
class StandardAutoClosingPairConditional {
  open;
  close;
  _inString;
  _inComment;
  _inRegEx;
  _neutralCharacter = null;
  _neutralCharacterSearched = false;
  constructor(source) {
    this.open = source.open;
    this.close = source.close;
    this._inString = true;
    this._inComment = true;
    this._inRegEx = true;
    if (Array.isArray(source.notIn)) {
      for (let i = 0, len = source.notIn.length; i < len; i++) {
        const notIn = source.notIn[i];
        switch (notIn) {
          case "string":
            this._inString = false;
            break;
          case "comment":
            this._inComment = false;
            break;
          case "regex":
            this._inRegEx = false;
            break;
        }
      }
    }
  }
  isOK(standardToken) {
    switch (standardToken) {
      case StandardTokenType.Other:
        return true;
      case StandardTokenType.Comment:
        return this._inComment;
      case StandardTokenType.String:
        return this._inString;
      case StandardTokenType.RegEx:
        return this._inRegEx;
    }
  }
  shouldAutoClose(context, column) {
    if (context.getTokenCount() === 0) {
      return true;
    }
    const tokenIndex = context.findTokenIndexAtOffset(column - 2);
    const standardTokenType = context.getStandardTokenType(tokenIndex);
    return this.isOK(standardTokenType);
  }
  _findNeutralCharacterInRange(fromCharCode, toCharCode) {
    for (let charCode = fromCharCode; charCode <= toCharCode; charCode++) {
      const character = String.fromCharCode(charCode);
      if (!this.open.includes(character) && !this.close.includes(character)) {
        return character;
      }
    }
    return null;
  }
  /**
   * Find a character in the range [0-9a-zA-Z] that does not appear in the open or close
   */
  findNeutralCharacter() {
    if (!this._neutralCharacterSearched) {
      this._neutralCharacterSearched = true;
      if (!this._neutralCharacter) {
        this._neutralCharacter = this._findNeutralCharacterInRange(
          CharCode.Digit0,
          CharCode.Digit9
        );
      }
      if (!this._neutralCharacter) {
        this._neutralCharacter = this._findNeutralCharacterInRange(
          CharCode.a,
          CharCode.z
        );
      }
      if (!this._neutralCharacter) {
        this._neutralCharacter = this._findNeutralCharacterInRange(
          CharCode.A,
          CharCode.Z
        );
      }
    }
    return this._neutralCharacter;
  }
}
class AutoClosingPairs {
  // it is useful to be able to get pairs using either end of open and close
  /** Key is first character of open */
  autoClosingPairsOpenByStart;
  /** Key is last character of open */
  autoClosingPairsOpenByEnd;
  /** Key is first character of close */
  autoClosingPairsCloseByStart;
  /** Key is last character of close */
  autoClosingPairsCloseByEnd;
  /** Key is close. Only has pairs that are a single character */
  autoClosingPairsCloseSingleChar;
  constructor(autoClosingPairs) {
    this.autoClosingPairsOpenByStart = /* @__PURE__ */ new Map();
    this.autoClosingPairsOpenByEnd = /* @__PURE__ */ new Map();
    this.autoClosingPairsCloseByStart = /* @__PURE__ */ new Map();
    this.autoClosingPairsCloseByEnd = /* @__PURE__ */ new Map();
    this.autoClosingPairsCloseSingleChar = /* @__PURE__ */ new Map();
    for (const pair of autoClosingPairs) {
      appendEntry(
        this.autoClosingPairsOpenByStart,
        pair.open.charAt(0),
        pair
      );
      appendEntry(
        this.autoClosingPairsOpenByEnd,
        pair.open.charAt(pair.open.length - 1),
        pair
      );
      appendEntry(
        this.autoClosingPairsCloseByStart,
        pair.close.charAt(0),
        pair
      );
      appendEntry(
        this.autoClosingPairsCloseByEnd,
        pair.close.charAt(pair.close.length - 1),
        pair
      );
      if (pair.close.length === 1 && pair.open.length === 1) {
        appendEntry(
          this.autoClosingPairsCloseSingleChar,
          pair.close,
          pair
        );
      }
    }
  }
}
function appendEntry(target, key, value) {
  if (target.has(key)) {
    target.get(key).push(value);
  } else {
    target.set(key, [value]);
  }
}
export {
  AutoClosingPairs,
  IndentAction,
  StandardAutoClosingPairConditional
};
