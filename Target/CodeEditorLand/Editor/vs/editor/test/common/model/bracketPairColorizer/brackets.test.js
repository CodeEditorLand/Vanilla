var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { LanguageAgnosticBracketTokens } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js";
import { SmallImmutableSet, DenseKeyProvider } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js";
import { Token, TokenKind } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js";
import { TestLanguageConfigurationService } from "../../modes/testLanguageConfigurationService.js";
suite("Bracket Pair Colorizer - Brackets", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Basic", () => {
    const languageId = "testMode1";
    const denseKeyProvider = new DenseKeyProvider();
    const getImmutableSet = /* @__PURE__ */ __name((elements) => {
      let newSet = SmallImmutableSet.getEmpty();
      elements.forEach((x) => newSet = newSet.add(`${languageId}:::${x}`, denseKeyProvider));
      return newSet;
    }, "getImmutableSet");
    const getKey = /* @__PURE__ */ __name((value) => {
      return denseKeyProvider.getKey(`${languageId}:::${value}`);
    }, "getKey");
    const disposableStore = new DisposableStore();
    const languageConfigService = disposableStore.add(new TestLanguageConfigurationService());
    disposableStore.add(languageConfigService.register(languageId, {
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
        ["begin", "end"],
        ["case", "endcase"],
        ["casez", "endcase"],
        // Verilog
        ["\\left(", "\\right)"],
        ["\\left(", "\\right."],
        ["\\left.", "\\right)"],
        // LaTeX Parentheses
        ["\\left[", "\\right]"],
        ["\\left[", "\\right."],
        ["\\left.", "\\right]"]
        // LaTeX Brackets
      ]
    }));
    const brackets = new LanguageAgnosticBracketTokens(denseKeyProvider, (l) => languageConfigService.getLanguageConfiguration(l));
    const bracketsExpected = [
      { text: "{", length: 1, kind: "OpeningBracket", bracketId: getKey("{"), bracketIds: getImmutableSet(["{"]) },
      { text: "[", length: 1, kind: "OpeningBracket", bracketId: getKey("["), bracketIds: getImmutableSet(["["]) },
      { text: "(", length: 1, kind: "OpeningBracket", bracketId: getKey("("), bracketIds: getImmutableSet(["("]) },
      { text: "begin", length: 5, kind: "OpeningBracket", bracketId: getKey("begin"), bracketIds: getImmutableSet(["begin"]) },
      { text: "case", length: 4, kind: "OpeningBracket", bracketId: getKey("case"), bracketIds: getImmutableSet(["case"]) },
      { text: "casez", length: 5, kind: "OpeningBracket", bracketId: getKey("casez"), bracketIds: getImmutableSet(["casez"]) },
      { text: "\\left(", length: 6, kind: "OpeningBracket", bracketId: getKey("\\left("), bracketIds: getImmutableSet(["\\left("]) },
      { text: "\\left.", length: 6, kind: "OpeningBracket", bracketId: getKey("\\left."), bracketIds: getImmutableSet(["\\left."]) },
      { text: "\\left[", length: 6, kind: "OpeningBracket", bracketId: getKey("\\left["), bracketIds: getImmutableSet(["\\left["]) },
      { text: "}", length: 1, kind: "ClosingBracket", bracketId: getKey("{"), bracketIds: getImmutableSet(["{"]) },
      { text: "]", length: 1, kind: "ClosingBracket", bracketId: getKey("["), bracketIds: getImmutableSet(["["]) },
      { text: ")", length: 1, kind: "ClosingBracket", bracketId: getKey("("), bracketIds: getImmutableSet(["("]) },
      { text: "end", length: 3, kind: "ClosingBracket", bracketId: getKey("begin"), bracketIds: getImmutableSet(["begin"]) },
      { text: "endcase", length: 7, kind: "ClosingBracket", bracketId: getKey("case"), bracketIds: getImmutableSet(["case", "casez"]) },
      { text: "\\right)", length: 7, kind: "ClosingBracket", bracketId: getKey("\\left("), bracketIds: getImmutableSet(["\\left(", "\\left."]) },
      { text: "\\right.", length: 7, kind: "ClosingBracket", bracketId: getKey("\\left("), bracketIds: getImmutableSet(["\\left(", "\\left["]) },
      { text: "\\right]", length: 7, kind: "ClosingBracket", bracketId: getKey("\\left["), bracketIds: getImmutableSet(["\\left[", "\\left."]) }
    ];
    const bracketsActual = bracketsExpected.map((x) => tokenToObject(brackets.getToken(x.text, languageId), x.text));
    assert.deepStrictEqual(bracketsActual, bracketsExpected);
    disposableStore.dispose();
  });
});
function tokenToObject(token, text) {
  if (token === void 0) {
    return void 0;
  }
  return {
    text,
    length: token.length,
    bracketId: token.bracketId,
    bracketIds: token.bracketIds,
    kind: {
      [TokenKind.ClosingBracket]: "ClosingBracket",
      [TokenKind.OpeningBracket]: "OpeningBracket",
      [TokenKind.Text]: "Text"
    }[token.kind]
  };
}
__name(tokenToObject, "tokenToObject");
//# sourceMappingURL=brackets.test.js.map
