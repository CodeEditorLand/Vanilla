var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Color } from "../../../../base/common/color.js";
import { Emitter } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { LanguageId, MetadataConsts } from "../../../common/encodedTokenAttributes.js";
import { IState, Token } from "../../../common/languages.js";
import { TokenTheme } from "../../../common/languages/supports/tokenization.js";
import { LanguageService } from "../../../common/services/languageService.js";
import { ILineTokens, IToken, TokenizationSupportAdapter, TokensProvider } from "../../browser/standaloneLanguages.js";
import { IStandaloneTheme, IStandaloneThemeData, IStandaloneThemeService } from "../../common/standaloneTheme.js";
import { UnthemedProductIconTheme } from "../../../../platform/theme/browser/iconsStyleSheet.js";
import { ColorIdentifier } from "../../../../platform/theme/common/colorRegistry.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { IColorTheme, IFileIconTheme, IProductIconTheme, ITokenStyle } from "../../../../platform/theme/common/themeService.js";
suite("TokenizationSupport2Adapter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const languageId = "tttt";
  class MockTokenTheme extends TokenTheme {
    static {
      __name(this, "MockTokenTheme");
    }
    counter = 0;
    constructor() {
      super(null, null);
    }
    match(languageId2, token) {
      return (this.counter++ << MetadataConsts.FOREGROUND_OFFSET | languageId2 << MetadataConsts.LANGUAGEID_OFFSET) >>> 0;
    }
  }
  class MockThemeService {
    static {
      __name(this, "MockThemeService");
    }
    setTheme(themeName) {
      throw new Error("Not implemented");
    }
    setAutoDetectHighContrast(autoDetectHighContrast) {
      throw new Error("Not implemented");
    }
    defineTheme(themeName, themeData) {
      throw new Error("Not implemented");
    }
    getColorTheme() {
      return {
        label: "mock",
        tokenTheme: new MockTokenTheme(),
        themeName: ColorScheme.LIGHT,
        type: ColorScheme.LIGHT,
        getColor: /* @__PURE__ */ __name((color, useDefault) => {
          throw new Error("Not implemented");
        }, "getColor"),
        defines: /* @__PURE__ */ __name((color) => {
          throw new Error("Not implemented");
        }, "defines"),
        getTokenStyleMetadata: /* @__PURE__ */ __name((type, modifiers, modelLanguage) => {
          return void 0;
        }, "getTokenStyleMetadata"),
        semanticHighlighting: false,
        tokenColorMap: []
      };
    }
    setColorMapOverride(colorMapOverride) {
    }
    getFileIconTheme() {
      return {
        hasFileIcons: false,
        hasFolderIcons: false,
        hidesExplorerArrows: false
      };
    }
    _builtInProductIconTheme = new UnthemedProductIconTheme();
    getProductIconTheme() {
      return this._builtInProductIconTheme;
    }
    onDidColorThemeChange = new Emitter().event;
    onDidFileIconThemeChange = new Emitter().event;
    onDidProductIconThemeChange = new Emitter().event;
  }
  class MockState {
    static {
      __name(this, "MockState");
    }
    static INSTANCE = new MockState();
    constructor() {
    }
    clone() {
      return this;
    }
    equals(other) {
      return this === other;
    }
  }
  function testBadTokensProvider(providerTokens, expectedClassicTokens, expectedModernTokens) {
    class BadTokensProvider {
      static {
        __name(this, "BadTokensProvider");
      }
      getInitialState() {
        return MockState.INSTANCE;
      }
      tokenize(line, state) {
        return {
          tokens: providerTokens,
          endState: MockState.INSTANCE
        };
      }
    }
    const disposables = new DisposableStore();
    const languageService = disposables.add(new LanguageService());
    disposables.add(languageService.registerLanguage({ id: languageId }));
    const adapter = new TokenizationSupportAdapter(
      languageId,
      new BadTokensProvider(),
      languageService,
      new MockThemeService()
    );
    const actualClassicTokens = adapter.tokenize("whatever", true, MockState.INSTANCE);
    assert.deepStrictEqual(actualClassicTokens.tokens, expectedClassicTokens);
    const actualModernTokens = adapter.tokenizeEncoded("whatever", true, MockState.INSTANCE);
    const modernTokens = [];
    for (let i = 0; i < actualModernTokens.tokens.length; i++) {
      modernTokens[i] = actualModernTokens.tokens[i];
    }
    const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(languageId);
    const tokenLanguageMetadata = encodedLanguageId << MetadataConsts.LANGUAGEID_OFFSET;
    for (let i = 1; i < expectedModernTokens.length; i += 2) {
      expectedModernTokens[i] |= tokenLanguageMetadata;
    }
    assert.deepStrictEqual(modernTokens, expectedModernTokens);
    disposables.dispose();
  }
  __name(testBadTokensProvider, "testBadTokensProvider");
  test("tokens always start at index 0", () => {
    testBadTokensProvider(
      [
        { startIndex: 7, scopes: "foo" },
        { startIndex: 0, scopes: "bar" }
      ],
      [
        new Token(0, "foo", languageId),
        new Token(0, "bar", languageId)
      ],
      [
        0,
        0 << MetadataConsts.FOREGROUND_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK,
        0,
        1 << MetadataConsts.FOREGROUND_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK
      ]
    );
  });
  test("tokens always start after each other", () => {
    testBadTokensProvider(
      [
        { startIndex: 0, scopes: "foo" },
        { startIndex: 5, scopes: "bar" },
        { startIndex: 3, scopes: "foo" }
      ],
      [
        new Token(0, "foo", languageId),
        new Token(5, "bar", languageId),
        new Token(5, "foo", languageId)
      ],
      [
        0,
        0 << MetadataConsts.FOREGROUND_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK,
        5,
        1 << MetadataConsts.FOREGROUND_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK,
        5,
        2 << MetadataConsts.FOREGROUND_OFFSET | MetadataConsts.BALANCED_BRACKETS_MASK
      ]
    );
  });
});
//# sourceMappingURL=standaloneLanguages.test.js.map
