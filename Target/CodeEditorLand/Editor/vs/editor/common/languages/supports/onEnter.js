var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { onUnexpectedError } from "../../../../base/common/errors.js";
import * as strings from "../../../../base/common/strings.js";
import { CharacterPair, EnterAction, IndentAction, OnEnterRule } from "../languageConfiguration.js";
import { EditorAutoIndentStrategy } from "../../config/editorOptions.js";
class OnEnterSupport {
  static {
    __name(this, "OnEnterSupport");
  }
  _brackets;
  _regExpRules;
  constructor(opts) {
    opts = opts || {};
    opts.brackets = opts.brackets || [
      ["(", ")"],
      ["{", "}"],
      ["[", "]"]
    ];
    this._brackets = [];
    opts.brackets.forEach((bracket) => {
      const openRegExp = OnEnterSupport._createOpenBracketRegExp(bracket[0]);
      const closeRegExp = OnEnterSupport._createCloseBracketRegExp(bracket[1]);
      if (openRegExp && closeRegExp) {
        this._brackets.push({
          open: bracket[0],
          openRegExp,
          close: bracket[1],
          closeRegExp
        });
      }
    });
    this._regExpRules = opts.onEnterRules || [];
  }
  onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
    if (autoIndent >= EditorAutoIndentStrategy.Advanced) {
      for (let i = 0, len = this._regExpRules.length; i < len; i++) {
        const rule = this._regExpRules[i];
        const regResult = [{
          reg: rule.beforeText,
          text: beforeEnterText
        }, {
          reg: rule.afterText,
          text: afterEnterText
        }, {
          reg: rule.previousLineText,
          text: previousLineText
        }].every((obj) => {
          if (!obj.reg) {
            return true;
          }
          obj.reg.lastIndex = 0;
          return obj.reg.test(obj.text);
        });
        if (regResult) {
          return rule.action;
        }
      }
    }
    if (autoIndent >= EditorAutoIndentStrategy.Brackets) {
      if (beforeEnterText.length > 0 && afterEnterText.length > 0) {
        for (let i = 0, len = this._brackets.length; i < len; i++) {
          const bracket = this._brackets[i];
          if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
            return { indentAction: IndentAction.IndentOutdent };
          }
        }
      }
    }
    if (autoIndent >= EditorAutoIndentStrategy.Brackets) {
      if (beforeEnterText.length > 0) {
        for (let i = 0, len = this._brackets.length; i < len; i++) {
          const bracket = this._brackets[i];
          if (bracket.openRegExp.test(beforeEnterText)) {
            return { indentAction: IndentAction.Indent };
          }
        }
      }
    }
    return null;
  }
  static _createOpenBracketRegExp(bracket) {
    let str = strings.escapeRegExpCharacters(bracket);
    if (!/\B/.test(str.charAt(0))) {
      str = "\\b" + str;
    }
    str += "\\s*$";
    return OnEnterSupport._safeRegExp(str);
  }
  static _createCloseBracketRegExp(bracket) {
    let str = strings.escapeRegExpCharacters(bracket);
    if (!/\B/.test(str.charAt(str.length - 1))) {
      str = str + "\\b";
    }
    str = "^\\s*" + str;
    return OnEnterSupport._safeRegExp(str);
  }
  static _safeRegExp(def) {
    try {
      return new RegExp(def);
    } catch (err) {
      onUnexpectedError(err);
      return null;
    }
  }
}
export {
  OnEnterSupport
};
//# sourceMappingURL=onEnter.js.map
