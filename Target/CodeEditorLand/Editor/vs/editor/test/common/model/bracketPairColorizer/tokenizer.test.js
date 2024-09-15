var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { LanguageId, MetadataConsts, StandardTokenType } from "../../../../common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, IState, ITokenizationSupport, TokenizationRegistry } from "../../../../common/languages.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { LanguageAgnosticBracketTokens } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js";
import { Length, lengthAdd, lengthsToRange, lengthZero } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/length.js";
import { DenseKeyProvider } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js";
import { TextBufferTokenizer, Token, Tokenizer, TokenKind } from "../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js";
import { TextModel } from "../../../../common/model/textModel.js";
import { createModelServices, instantiateTextModel } from "../../testTextModel.js";
suite("Bracket Pair Colorizer - Tokenizer", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Basic", () => {
    const mode1 = "testMode1";
    const disposableStore = new DisposableStore();
    const instantiationService = createModelServices(disposableStore);
    const languageConfigurationService = instantiationService.get(ILanguageConfigurationService);
    const languageService = instantiationService.get(ILanguageService);
    disposableStore.add(languageService.registerLanguage({ id: mode1 }));
    const encodedMode1 = languageService.languageIdCodec.encodeLanguageId(mode1);
    const denseKeyProvider = new DenseKeyProvider();
    const tStandard = /* @__PURE__ */ __name((text) => new TokenInfo(text, encodedMode1, StandardTokenType.Other, true), "tStandard");
    const tComment = /* @__PURE__ */ __name((text) => new TokenInfo(text, encodedMode1, StandardTokenType.Comment, true), "tComment");
    const document = new TokenizedDocument([
      tStandard(" { } "),
      tStandard("be"),
      tStandard("gin end"),
      tStandard("\n"),
      tStandard("hello"),
      tComment("{"),
      tStandard("}")
    ]);
    disposableStore.add(TokenizationRegistry.register(mode1, document.getTokenizationSupport()));
    disposableStore.add(languageConfigurationService.register(mode1, {
      brackets: [["{", "}"], ["[", "]"], ["(", ")"], ["begin", "end"]]
    }));
    const model = disposableStore.add(instantiateTextModel(instantiationService, document.getText(), mode1));
    model.tokenization.forceTokenization(model.getLineCount());
    const brackets = new LanguageAgnosticBracketTokens(denseKeyProvider, (l) => languageConfigurationService.getLanguageConfiguration(l));
    const tokens = readAllTokens(new TextBufferTokenizer(model, brackets));
    assert.deepStrictEqual(toArr(tokens, model, denseKeyProvider), [
      { text: " ", bracketId: null, bracketIds: [], kind: "Text" },
      {
        text: "{",
        bracketId: "testMode1:::{",
        bracketIds: ["testMode1:::{"],
        kind: "OpeningBracket"
      },
      { text: " ", bracketId: null, bracketIds: [], kind: "Text" },
      {
        text: "}",
        bracketId: "testMode1:::{",
        bracketIds: ["testMode1:::{"],
        kind: "ClosingBracket"
      },
      { text: " ", bracketId: null, bracketIds: [], kind: "Text" },
      {
        text: "begin",
        bracketId: "testMode1:::begin",
        bracketIds: ["testMode1:::begin"],
        kind: "OpeningBracket"
      },
      { text: " ", bracketId: null, bracketIds: [], kind: "Text" },
      {
        text: "end",
        bracketId: "testMode1:::begin",
        bracketIds: ["testMode1:::begin"],
        kind: "ClosingBracket"
      },
      { text: "\nhello{", bracketId: null, bracketIds: [], kind: "Text" },
      {
        text: "}",
        bracketId: "testMode1:::{",
        bracketIds: ["testMode1:::{"],
        kind: "ClosingBracket"
      }
    ]);
    disposableStore.dispose();
  });
});
function readAllTokens(tokenizer) {
  const tokens = new Array();
  while (true) {
    const token = tokenizer.read();
    if (!token) {
      break;
    }
    tokens.push(token);
  }
  return tokens;
}
__name(readAllTokens, "readAllTokens");
function toArr(tokens, model, keyProvider) {
  const result = new Array();
  let offset = lengthZero;
  for (const token of tokens) {
    result.push(tokenToObj(token, offset, model, keyProvider));
    offset = lengthAdd(offset, token.length);
  }
  return result;
}
__name(toArr, "toArr");
function tokenToObj(token, offset, model, keyProvider) {
  return {
    text: model.getValueInRange(lengthsToRange(offset, lengthAdd(offset, token.length))),
    bracketId: keyProvider.reverseLookup(token.bracketId) || null,
    bracketIds: keyProvider.reverseLookupSet(token.bracketIds),
    kind: {
      [TokenKind.ClosingBracket]: "ClosingBracket",
      [TokenKind.OpeningBracket]: "OpeningBracket",
      [TokenKind.Text]: "Text"
    }[token.kind]
  };
}
__name(tokenToObj, "tokenToObj");
class TokenizedDocument {
  static {
    __name(this, "TokenizedDocument");
  }
  tokensByLine;
  constructor(tokens) {
    const tokensByLine = new Array();
    let curLine = new Array();
    for (const token of tokens) {
      const lines = token.text.split("\n");
      let first = true;
      while (lines.length > 0) {
        if (!first) {
          tokensByLine.push(curLine);
          curLine = new Array();
        } else {
          first = false;
        }
        if (lines[0].length > 0) {
          curLine.push(token.withText(lines[0]));
        }
        lines.pop();
      }
    }
    tokensByLine.push(curLine);
    this.tokensByLine = tokensByLine;
  }
  getText() {
    return this.tokensByLine.map((t) => t.map((t2) => t2.text).join("")).join("\n");
  }
  getTokenizationSupport() {
    class State {
      constructor(lineNumber) {
        this.lineNumber = lineNumber;
      }
      static {
        __name(this, "State");
      }
      clone() {
        return new State(this.lineNumber);
      }
      equals(other) {
        return this.lineNumber === other.lineNumber;
      }
    }
    return {
      getInitialState: /* @__PURE__ */ __name(() => new State(0), "getInitialState"),
      tokenize: /* @__PURE__ */ __name(() => {
        throw new Error("Method not implemented.");
      }, "tokenize"),
      tokenizeEncoded: /* @__PURE__ */ __name((line, hasEOL, state) => {
        const state2 = state;
        const tokens = this.tokensByLine[state2.lineNumber];
        const arr = new Array();
        let offset = 0;
        for (const t of tokens) {
          arr.push(offset, t.getMetadata());
          offset += t.text.length;
        }
        return new EncodedTokenizationResult(new Uint32Array(arr), new State(state2.lineNumber + 1));
      }, "tokenizeEncoded")
    };
  }
}
class TokenInfo {
  constructor(text, languageId, tokenType, hasBalancedBrackets) {
    this.text = text;
    this.languageId = languageId;
    this.tokenType = tokenType;
    this.hasBalancedBrackets = hasBalancedBrackets;
  }
  static {
    __name(this, "TokenInfo");
  }
  getMetadata() {
    return (this.languageId << MetadataConsts.LANGUAGEID_OFFSET | this.tokenType << MetadataConsts.TOKEN_TYPE_OFFSET) >>> 0 | (this.hasBalancedBrackets ? MetadataConsts.BALANCED_BRACKETS_MASK : 0);
  }
  withText(text) {
    return new TokenInfo(text, this.languageId, this.tokenType, this.hasBalancedBrackets);
  }
}
export {
  TokenInfo,
  TokenizedDocument
};
//# sourceMappingURL=tokenizer.test.js.map
