var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { Range } from "../../../common/core/range.js";
import { UnicodeHighlighterOptions, UnicodeTextModelHighlighter } from "../../../common/services/unicodeTextModelHighlighter.js";
import { createTextModel } from "../testTextModel.js";
suite("UnicodeTextModelHighlighter", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function t(text, options) {
    const m = createTextModel(text);
    const r = UnicodeTextModelHighlighter.computeUnicodeHighlights(m, options);
    m.dispose();
    return {
      ...r,
      ranges: r.ranges.map((r2) => Range.lift(r2).toString())
    };
  }
  __name(t, "t");
  test("computeUnicodeHighlights (#168068)", () => {
    assert.deepStrictEqual(
      t(`
	For\xA0\xE5\xA0gi\xA0et\xA0eksempel
`, {
        allowedCodePoints: [],
        allowedLocales: [],
        ambiguousCharacters: true,
        invisibleCharacters: true,
        includeComments: false,
        includeStrings: false,
        nonBasicASCII: false
      }),
      {
        ambiguousCharacterCount: 0,
        hasMore: false,
        invisibleCharacterCount: 4,
        nonBasicAsciiCharacterCount: 0,
        ranges: [
          "[2,5 -> 2,6]",
          "[2,7 -> 2,8]",
          "[2,10 -> 2,11]",
          "[2,13 -> 2,14]"
        ]
      }
    );
  });
});
//# sourceMappingURL=unicodeTextModelHighlighter.test.js.map
