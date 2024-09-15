var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import assert from "assert";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ColorId, FontStyle, MetadataConsts } from "../../../common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, IState, TokenizationRegistry } from "../../../common/languages.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { _tokenizeToString, tokenizeLineToHTML } from "../../../common/languages/textToHtmlTokenizer.js";
import { LanguageIdCodec } from "../../../common/services/languagesRegistry.js";
import { TestLineToken, TestLineTokens } from "../core/testLineToken.js";
import { createModelServices } from "../testTextModel.js";
import { TestInstantiationService } from "../../../../platform/instantiation/test/common/instantiationServiceMock.js";
suite("Editor Modes - textToHtmlTokenizer", () => {
  let disposables;
  let instantiationService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = createModelServices(disposables);
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function toStr(pieces) {
    const resultArr = pieces.map((t) => `<span class="${t.className}">${t.text}</span>`);
    return resultArr.join("");
  }
  __name(toStr, "toStr");
  test("TextToHtmlTokenizer 1", () => {
    const mode = disposables.add(instantiationService.createInstance(Mode));
    const support = TokenizationRegistry.get(mode.languageId);
    const actual = _tokenizeToString(".abc..def...gh", new LanguageIdCodec(), support);
    const expected = [
      { className: "mtk7", text: "." },
      { className: "mtk9", text: "abc" },
      { className: "mtk7", text: ".." },
      { className: "mtk9", text: "def" },
      { className: "mtk7", text: "..." },
      { className: "mtk9", text: "gh" }
    ];
    const expectedStr = `<div class="monaco-tokenized-source">${toStr(expected)}</div>`;
    assert.strictEqual(actual, expectedStr);
  });
  test("TextToHtmlTokenizer 2", () => {
    const mode = disposables.add(instantiationService.createInstance(Mode));
    const support = TokenizationRegistry.get(mode.languageId);
    const actual = _tokenizeToString(".abc..def...gh\n.abc..def...gh", new LanguageIdCodec(), support);
    const expected1 = [
      { className: "mtk7", text: "." },
      { className: "mtk9", text: "abc" },
      { className: "mtk7", text: ".." },
      { className: "mtk9", text: "def" },
      { className: "mtk7", text: "..." },
      { className: "mtk9", text: "gh" }
    ];
    const expected2 = [
      { className: "mtk7", text: "." },
      { className: "mtk9", text: "abc" },
      { className: "mtk7", text: ".." },
      { className: "mtk9", text: "def" },
      { className: "mtk7", text: "..." },
      { className: "mtk9", text: "gh" }
    ];
    const expectedStr1 = toStr(expected1);
    const expectedStr2 = toStr(expected2);
    const expectedStr = `<div class="monaco-tokenized-source">${expectedStr1}<br/>${expectedStr2}</div>`;
    assert.strictEqual(actual, expectedStr);
  });
  test("tokenizeLineToHTML", () => {
    const text = "Ciao hello world!";
    const lineTokens = new TestLineTokens([
      new TestLineToken(
        4,
        (3 << MetadataConsts.FOREGROUND_OFFSET | (FontStyle.Bold | FontStyle.Italic) << MetadataConsts.FONT_STYLE_OFFSET) >>> 0
      ),
      new TestLineToken(
        5,
        1 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        10,
        4 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        11,
        1 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        17,
        (5 << MetadataConsts.FOREGROUND_OFFSET | FontStyle.Underline << MetadataConsts.FONT_STYLE_OFFSET) >>> 0
      )
    ]);
    const colorMap = [null, "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"];
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 0, 17, 4, true),
      [
        "<div>",
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 0, 12, 4, true),
      [
        "<div>",
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #0000ff;text-decoration: underline;">w</span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 0, 11, 4, true),
      [
        "<div>",
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 1, 11, 4, true),
      [
        "<div>",
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">iao</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 4, 11, 4, true),
      [
        "<div>",
        '<span style="color: #000000;">&#160;</span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 5, 11, 4, true),
      [
        "<div>",
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 5, 10, 4, true),
      [
        "<div>",
        '<span style="color: #00ff00;">hello</span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 6, 9, 4, true),
      [
        "<div>",
        '<span style="color: #00ff00;">ell</span>',
        "</div>"
      ].join("")
    );
  });
  test("tokenizeLineToHTML handle spaces #35954", () => {
    const text = "  Ciao   hello world!";
    const lineTokens = new TestLineTokens([
      new TestLineToken(
        2,
        1 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        6,
        (3 << MetadataConsts.FOREGROUND_OFFSET | (FontStyle.Bold | FontStyle.Italic) << MetadataConsts.FONT_STYLE_OFFSET) >>> 0
      ),
      new TestLineToken(
        9,
        1 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        14,
        4 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        15,
        1 << MetadataConsts.FOREGROUND_OFFSET >>> 0
      ),
      new TestLineToken(
        21,
        (5 << MetadataConsts.FOREGROUND_OFFSET | FontStyle.Underline << MetadataConsts.FONT_STYLE_OFFSET) >>> 0
      )
    ]);
    const colorMap = [null, "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"];
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 0, 21, 4, true),
      [
        "<div>",
        '<span style="color: #000000;">&#160; </span>',
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
        '<span style="color: #000000;"> &#160; </span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #0000ff;text-decoration: underline;">world!</span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 0, 17, 4, true),
      [
        "<div>",
        '<span style="color: #000000;">&#160; </span>',
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">Ciao</span>',
        '<span style="color: #000000;"> &#160; </span>',
        '<span style="color: #00ff00;">hello</span>',
        '<span style="color: #000000;"> </span>',
        '<span style="color: #0000ff;text-decoration: underline;">wo</span>',
        "</div>"
      ].join("")
    );
    assert.strictEqual(
      tokenizeLineToHTML(text, lineTokens, colorMap, 0, 3, 4, true),
      [
        "<div>",
        '<span style="color: #000000;">&#160; </span>',
        '<span style="color: #ff0000;font-style: italic;font-weight: bold;">C</span>',
        "</div>"
      ].join("")
    );
  });
});
let Mode = class extends Disposable {
  static {
    __name(this, "Mode");
  }
  languageId = "textToHtmlTokenizerMode";
  constructor(languageService) {
    super();
    this._register(languageService.registerLanguage({ id: this.languageId }));
    this._register(TokenizationRegistry.register(this.languageId, {
      getInitialState: /* @__PURE__ */ __name(() => null, "getInitialState"),
      tokenize: void 0,
      tokenizeEncoded: /* @__PURE__ */ __name((line, hasEOL, state) => {
        const tokensArr = [];
        let prevColor = -1;
        for (let i = 0; i < line.length; i++) {
          const colorId = line.charAt(i) === "." ? 7 : 9;
          if (prevColor !== colorId) {
            tokensArr.push(i);
            tokensArr.push(colorId << MetadataConsts.FOREGROUND_OFFSET >>> 0);
          }
          prevColor = colorId;
        }
        const tokens = new Uint32Array(tokensArr.length);
        for (let i = 0; i < tokens.length; i++) {
          tokens[i] = tokensArr[i];
        }
        return new EncodedTokenizationResult(tokens, null);
      }, "tokenizeEncoded")
    }));
  }
};
Mode = __decorateClass([
  __decorateParam(0, ILanguageService)
], Mode);
//# sourceMappingURL=textToHtmlTokenizer.test.js.map
