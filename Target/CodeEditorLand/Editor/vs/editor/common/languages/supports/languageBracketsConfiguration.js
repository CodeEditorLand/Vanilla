var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CachedFunction } from "../../../../base/common/cache.js";
import { createBracketOrRegExp } from "./richEditBrackets.js";
class LanguageBracketsConfiguration {
  constructor(languageId, config) {
    this.languageId = languageId;
    const bracketPairs = config.brackets ? filterValidBrackets(config.brackets) : [];
    const openingBracketInfos = new CachedFunction((bracket) => {
      const closing = /* @__PURE__ */ new Set();
      return {
        info: new OpeningBracketKind(this, bracket, closing),
        closing
      };
    });
    const closingBracketInfos = new CachedFunction((bracket) => {
      const opening = /* @__PURE__ */ new Set();
      const openingColorized = /* @__PURE__ */ new Set();
      return {
        info: new ClosingBracketKind(
          this,
          bracket,
          opening,
          openingColorized
        ),
        opening,
        openingColorized
      };
    });
    for (const [open, close] of bracketPairs) {
      const opening = openingBracketInfos.get(open);
      const closing = closingBracketInfos.get(close);
      opening.closing.add(closing.info);
      closing.opening.add(opening.info);
    }
    const colorizedBracketPairs = config.colorizedBracketPairs ? filterValidBrackets(config.colorizedBracketPairs) : (
      // If not configured: Take all brackets except `<` ... `>`
      // Many languages set < ... > as bracket pair, even though they also use it as comparison operator.
      // This leads to problems when colorizing this bracket, so we exclude it if not explicitly configured otherwise.
      // https://github.com/microsoft/vscode/issues/132476
      bracketPairs.filter((p) => !(p[0] === "<" && p[1] === ">"))
    );
    for (const [open, close] of colorizedBracketPairs) {
      const opening = openingBracketInfos.get(open);
      const closing = closingBracketInfos.get(close);
      opening.closing.add(closing.info);
      closing.openingColorized.add(opening.info);
      closing.opening.add(opening.info);
    }
    this._openingBrackets = new Map(
      [...openingBracketInfos.cachedValues].map(([k, v]) => [k, v.info])
    );
    this._closingBrackets = new Map(
      [...closingBracketInfos.cachedValues].map(([k, v]) => [k, v.info])
    );
  }
  static {
    __name(this, "LanguageBracketsConfiguration");
  }
  _openingBrackets;
  _closingBrackets;
  /**
   * No two brackets have the same bracket text.
   */
  get openingBrackets() {
    return [...this._openingBrackets.values()];
  }
  /**
   * No two brackets have the same bracket text.
   */
  get closingBrackets() {
    return [...this._closingBrackets.values()];
  }
  getOpeningBracketInfo(bracketText) {
    return this._openingBrackets.get(bracketText);
  }
  getClosingBracketInfo(bracketText) {
    return this._closingBrackets.get(bracketText);
  }
  getBracketInfo(bracketText) {
    return this.getOpeningBracketInfo(bracketText) || this.getClosingBracketInfo(bracketText);
  }
  getBracketRegExp(options) {
    const brackets = Array.from([
      ...this._openingBrackets.keys(),
      ...this._closingBrackets.keys()
    ]);
    return createBracketOrRegExp(brackets, options);
  }
}
function filterValidBrackets(bracketPairs) {
  return bracketPairs.filter(([open, close]) => open !== "" && close !== "");
}
__name(filterValidBrackets, "filterValidBrackets");
class BracketKindBase {
  constructor(config, bracketText) {
    this.config = config;
    this.bracketText = bracketText;
  }
  static {
    __name(this, "BracketKindBase");
  }
  get languageId() {
    return this.config.languageId;
  }
}
class OpeningBracketKind extends BracketKindBase {
  constructor(config, bracketText, openedBrackets) {
    super(config, bracketText);
    this.openedBrackets = openedBrackets;
  }
  static {
    __name(this, "OpeningBracketKind");
  }
  isOpeningBracket = true;
}
class ClosingBracketKind extends BracketKindBase {
  constructor(config, bracketText, openingBrackets, openingColorizedBrackets) {
    super(config, bracketText);
    this.openingBrackets = openingBrackets;
    this.openingColorizedBrackets = openingColorizedBrackets;
  }
  static {
    __name(this, "ClosingBracketKind");
  }
  isOpeningBracket = false;
  /**
   * Checks if this bracket closes the given other bracket.
   * If the bracket infos come from different configurations, this method will return false.
   */
  closes(other) {
    if (other["config"] !== this.config) {
      return false;
    }
    return this.openingBrackets.has(other);
  }
  closesColorized(other) {
    if (other["config"] !== this.config) {
      return false;
    }
    return this.openingColorizedBrackets.has(other);
  }
  getOpeningBrackets() {
    return [...this.openingBrackets];
  }
}
export {
  BracketKindBase,
  ClosingBracketKind,
  LanguageBracketsConfiguration,
  OpeningBracketKind
};
//# sourceMappingURL=languageBracketsConfiguration.js.map
