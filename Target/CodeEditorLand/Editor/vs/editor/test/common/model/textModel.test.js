var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { UTF8_BOM_CHARACTER } from "../../../../base/common/strings.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../common/languages/modesRegistry.js";
import { EndOfLinePreference } from "../../../common/model.js";
import { TextModel, createTextBuffer } from "../../../common/model/textModel.js";
import { createModelServices, createTextModel } from "../testTextModel.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
function testGuessIndentation(defaultInsertSpaces, defaultTabSize, expectedInsertSpaces, expectedTabSize, text, msg) {
  const m = createTextModel(
    text.join("\n"),
    void 0,
    {
      tabSize: defaultTabSize,
      insertSpaces: defaultInsertSpaces,
      detectIndentation: true
    }
  );
  const r = m.getOptions();
  m.dispose();
  assert.strictEqual(r.insertSpaces, expectedInsertSpaces, msg);
  assert.strictEqual(r.tabSize, expectedTabSize, msg);
}
__name(testGuessIndentation, "testGuessIndentation");
function assertGuess(expectedInsertSpaces, expectedTabSize, text, msg) {
  if (typeof expectedInsertSpaces === "undefined") {
    if (typeof expectedTabSize === "undefined") {
      testGuessIndentation(true, 13370, true, 13370, text, msg);
      testGuessIndentation(false, 13371, false, 13371, text, msg);
    } else if (typeof expectedTabSize === "number") {
      testGuessIndentation(true, 13370, true, expectedTabSize, text, msg);
      testGuessIndentation(false, 13371, false, expectedTabSize, text, msg);
    } else {
      testGuessIndentation(true, 13370, true, expectedTabSize[0], text, msg);
      testGuessIndentation(false, 13371, false, 13371, text, msg);
    }
  } else {
    if (typeof expectedTabSize === "undefined") {
      testGuessIndentation(true, 13370, expectedInsertSpaces, 13370, text, msg);
      testGuessIndentation(false, 13371, expectedInsertSpaces, 13371, text, msg);
    } else if (typeof expectedTabSize === "number") {
      testGuessIndentation(true, 13370, expectedInsertSpaces, expectedTabSize, text, msg);
      testGuessIndentation(false, 13371, expectedInsertSpaces, expectedTabSize, text, msg);
    } else {
      if (expectedInsertSpaces === true) {
        testGuessIndentation(true, 13370, expectedInsertSpaces, expectedTabSize[0], text, msg);
        testGuessIndentation(false, 13371, expectedInsertSpaces, expectedTabSize[0], text, msg);
      } else {
        testGuessIndentation(true, 13370, expectedInsertSpaces, 13370, text, msg);
        testGuessIndentation(false, 13371, expectedInsertSpaces, 13371, text, msg);
      }
    }
  }
}
__name(assertGuess, "assertGuess");
suite("TextModelData.fromString", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function testTextModelDataFromString(text, expected) {
    const { textBuffer, disposable } = createTextBuffer(text, TextModel.DEFAULT_CREATION_OPTIONS.defaultEOL);
    const actual = {
      EOL: textBuffer.getEOL(),
      lines: textBuffer.getLinesContent(),
      containsRTL: textBuffer.mightContainRTL(),
      isBasicASCII: !textBuffer.mightContainNonBasicASCII()
    };
    assert.deepStrictEqual(actual, expected);
    disposable.dispose();
  }
  __name(testTextModelDataFromString, "testTextModelDataFromString");
  test("one line text", () => {
    testTextModelDataFromString(
      "Hello world!",
      {
        EOL: "\n",
        lines: [
          "Hello world!"
        ],
        containsRTL: false,
        isBasicASCII: true
      }
    );
  });
  test("multiline text", () => {
    testTextModelDataFromString(
      "Hello,\r\ndear friend\nHow\rare\r\nyou?",
      {
        EOL: "\r\n",
        lines: [
          "Hello,",
          "dear friend",
          "How",
          "are",
          "you?"
        ],
        containsRTL: false,
        isBasicASCII: true
      }
    );
  });
  test("Non Basic ASCII 1", () => {
    testTextModelDataFromString(
      "Hello,\nZ\xFCrich",
      {
        EOL: "\n",
        lines: [
          "Hello,",
          "Z\xFCrich"
        ],
        containsRTL: false,
        isBasicASCII: false
      }
    );
  });
  test("containsRTL 1", () => {
    testTextModelDataFromString(
      "Hello,\n\u05D6\u05D5\u05D4\u05D9 \u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5",
      {
        EOL: "\n",
        lines: [
          "Hello,",
          "\u05D6\u05D5\u05D4\u05D9 \u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5"
        ],
        containsRTL: true,
        isBasicASCII: false
      }
    );
  });
  test("containsRTL 2", () => {
    testTextModelDataFromString(
      "Hello,\n\u0647\u0646\u0627\u0643 \u062D\u0642\u064A\u0642\u0629 \u0645\u062B\u0628\u062A\u0629 \u0645\u0646\u0630 \u0632\u0645\u0646 \u0637\u0648\u064A\u0644",
      {
        EOL: "\n",
        lines: [
          "Hello,",
          "\u0647\u0646\u0627\u0643 \u062D\u0642\u064A\u0642\u0629 \u0645\u062B\u0628\u062A\u0629 \u0645\u0646\u0630 \u0632\u0645\u0646 \u0637\u0648\u064A\u0644"
        ],
        containsRTL: true,
        isBasicASCII: false
      }
    );
  });
});
suite("Editor Model - TextModel", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("TextModel does not use events internally", () => {
    const disposables = new DisposableStore();
    const instantiationService = createModelServices(disposables);
    const textModel = disposables.add(instantiationService.createInstance(TextModel, "", PLAINTEXT_LANGUAGE_ID, TextModel.DEFAULT_CREATION_OPTIONS, null));
    assert.strictEqual(textModel._hasListeners(), false);
    disposables.dispose();
  });
  test("getValueLengthInRange", () => {
    let m = createTextModel("My First Line\r\nMy Second Line\r\nMy Third Line");
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1, 1)), "".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1, 2)), "M".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 1, 3)), "y".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1, 14)), "My First Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1)), "My First Line\r\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 2, 1)), "y First Line\r\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 2, 2)), "y First Line\r\nM".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 2, 1e3)), "y First Line\r\nMy Second Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 3, 1)), "y First Line\r\nMy Second Line\r\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 3, 1e3)), "y First Line\r\nMy Second Line\r\nMy Third Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3)), "My First Line\r\nMy Second Line\r\nMy Third Line".length);
    m.dispose();
    m = createTextModel("My First Line\nMy Second Line\nMy Third Line");
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1, 1)), "".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1, 2)), "M".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 1, 3)), "y".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1, 14)), "My First Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1)), "My First Line\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 2, 1)), "y First Line\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 2, 2)), "y First Line\nM".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 2, 1e3)), "y First Line\nMy Second Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 3, 1)), "y First Line\nMy Second Line\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 2, 3, 1e3)), "y First Line\nMy Second Line\nMy Third Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3)), "My First Line\nMy Second Line\nMy Third Line".length);
    m.dispose();
  });
  test("getValueLengthInRange different EOL", () => {
    let m = createTextModel("My First Line\r\nMy Second Line\r\nMy Third Line");
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1), EndOfLinePreference.TextDefined), "My First Line\r\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1), EndOfLinePreference.CRLF), "My First Line\r\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1), EndOfLinePreference.LF), "My First Line\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3), EndOfLinePreference.TextDefined), "My First Line\r\nMy Second Line\r\nMy Third Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3), EndOfLinePreference.CRLF), "My First Line\r\nMy Second Line\r\nMy Third Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3), EndOfLinePreference.LF), "My First Line\nMy Second Line\nMy Third Line".length);
    m.dispose();
    m = createTextModel("My First Line\nMy Second Line\nMy Third Line");
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1), EndOfLinePreference.TextDefined), "My First Line\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1), EndOfLinePreference.LF), "My First Line\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 2, 1), EndOfLinePreference.CRLF), "My First Line\r\n".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3), EndOfLinePreference.TextDefined), "My First Line\nMy Second Line\nMy Third Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3), EndOfLinePreference.LF), "My First Line\nMy Second Line\nMy Third Line".length);
    assert.strictEqual(m.getValueLengthInRange(new Range(1, 1, 1e3, 1e3), EndOfLinePreference.CRLF), "My First Line\r\nMy Second Line\r\nMy Third Line".length);
    m.dispose();
  });
  test("guess indentation 1", () => {
    assertGuess(void 0, void 0, [
      "x",
      "x",
      "x",
      "x",
      "x",
      "x",
      "x"
    ], "no clues");
    assertGuess(false, void 0, [
      "	x",
      "x",
      "x",
      "x",
      "x",
      "x",
      "x"
    ], "no spaces, 1xTAB");
    assertGuess(true, 2, [
      "  x",
      "x",
      "x",
      "x",
      "x",
      "x",
      "x"
    ], "1x2");
    assertGuess(false, void 0, [
      "	x",
      "	x",
      "	x",
      "	x",
      "	x",
      "	x",
      "	x"
    ], "7xTAB");
    assertGuess(void 0, [2], [
      "	x",
      "  x",
      "	x",
      "  x",
      "	x",
      "  x",
      "	x",
      "  x"
    ], "4x2, 4xTAB");
    assertGuess(false, void 0, [
      "	x",
      " x",
      "	x",
      " x",
      "	x",
      " x",
      "	x",
      " x"
    ], "4x1, 4xTAB");
    assertGuess(false, void 0, [
      "	x",
      "	x",
      "  x",
      "	x",
      "  x",
      "	x",
      "  x",
      "	x",
      "  x"
    ], "4x2, 5xTAB");
    assertGuess(false, void 0, [
      "	x",
      "	x",
      "x",
      "	x",
      "x",
      "	x",
      "x",
      "	x",
      "  x"
    ], "1x2, 5xTAB");
    assertGuess(false, void 0, [
      "	x",
      "	x",
      "x",
      "	x",
      "x",
      "	x",
      "x",
      "	x",
      "    x"
    ], "1x4, 5xTAB");
    assertGuess(false, void 0, [
      "	x",
      "	x",
      "x",
      "	x",
      "x",
      "	x",
      "  x",
      "	x",
      "    x"
    ], "1x2, 1x4, 5xTAB");
    assertGuess(void 0, void 0, [
      "x",
      " x",
      " x",
      " x",
      " x",
      " x",
      " x",
      " x"
    ], "7x1 - 1 space is never guessed as an indentation");
    assertGuess(true, void 0, [
      "x",
      "          x",
      " x",
      " x",
      " x",
      " x",
      " x",
      " x"
    ], "1x10, 6x1");
    assertGuess(void 0, void 0, [
      "",
      "  ",
      "    ",
      "      ",
      "        ",
      "          ",
      "            ",
      "              "
    ], "whitespace lines don't count");
    assertGuess(true, 3, [
      "x",
      "   x",
      "   x",
      "    x",
      "x",
      "   x",
      "   x",
      "    x",
      "x",
      "   x",
      "   x",
      "    x"
    ], "6x3, 3x4");
    assertGuess(true, 5, [
      "x",
      "     x",
      "     x",
      "    x",
      "x",
      "     x",
      "     x",
      "    x",
      "x",
      "     x",
      "     x",
      "    x"
    ], "6x5, 3x4");
    assertGuess(true, 7, [
      "x",
      "       x",
      "       x",
      "     x",
      "x",
      "       x",
      "       x",
      "    x",
      "x",
      "       x",
      "       x",
      "    x"
    ], "6x7, 1x5, 2x4");
    assertGuess(true, 2, [
      "x",
      "  x",
      "  x",
      "  x",
      "  x",
      "x",
      "  x",
      "  x",
      "  x",
      "  x"
    ], "8x2");
    assertGuess(true, 2, [
      "x",
      "  x",
      "  x",
      "x",
      "  x",
      "  x",
      "x",
      "  x",
      "  x",
      "x",
      "  x",
      "  x"
    ], "8x2");
    assertGuess(true, 2, [
      "x",
      "  x",
      "    x",
      "x",
      "  x",
      "    x",
      "x",
      "  x",
      "    x",
      "x",
      "  x",
      "    x"
    ], "4x2, 4x4");
    assertGuess(true, 2, [
      "x",
      "  x",
      "  x",
      "    x",
      "x",
      "  x",
      "  x",
      "    x",
      "x",
      "  x",
      "  x",
      "    x"
    ], "6x2, 3x4");
    assertGuess(true, 2, [
      "x",
      "  x",
      "  x",
      "    x",
      "    x",
      "x",
      "  x",
      "  x",
      "    x",
      "    x"
    ], "4x2, 4x4");
    assertGuess(true, 2, [
      "x",
      "  x",
      "    x",
      "    x",
      "x",
      "  x",
      "    x",
      "    x"
    ], "2x2, 4x4");
    assertGuess(true, 4, [
      "x",
      "    x",
      "    x",
      "x",
      "    x",
      "    x",
      "x",
      "    x",
      "    x",
      "x",
      "    x",
      "    x"
    ], "8x4");
    assertGuess(true, 2, [
      "x",
      "  x",
      "    x",
      "    x",
      "      x",
      "x",
      "  x",
      "    x",
      "    x",
      "      x"
    ], "2x2, 4x4, 2x6");
    assertGuess(true, 2, [
      "x",
      "  x",
      "    x",
      "    x",
      "      x",
      "      x",
      "        x"
    ], "1x2, 2x4, 2x6, 1x8");
    assertGuess(true, 4, [
      "x",
      "    x",
      "    x",
      "    x",
      "     x",
      "        x",
      "x",
      "    x",
      "    x",
      "    x",
      "     x",
      "        x"
    ], "6x4, 2x5, 2x8");
    assertGuess(true, 4, [
      "x",
      "    x",
      "    x",
      "    x",
      "     x",
      "        x",
      "        x"
    ], "3x4, 1x5, 2x8");
    assertGuess(true, 4, [
      "x",
      "x",
      "    x",
      "    x",
      "     x",
      "        x",
      "        x",
      "x",
      "x",
      "    x",
      "    x",
      "     x",
      "        x",
      "        x"
    ], "6x4, 2x5, 4x8");
    assertGuess(true, 3, [
      "x",
      " x",
      " x",
      " x",
      " x",
      " x",
      "x",
      "   x",
      "    x",
      "    x"
    ], "5x1, 2x0, 1x3, 2x4");
    assertGuess(false, void 0, [
      "	 x",
      " 	 x",
      "	x"
    ], "mixed whitespace 1");
    assertGuess(false, void 0, [
      "	x",
      "	    x"
    ], "mixed whitespace 2");
  });
  test("issue #44991: Wrong indentation size auto-detection", () => {
    assertGuess(true, 4, [
      "a = 10             # 0 space indent",
      "b = 5              # 0 space indent",
      "if a > 10:         # 0 space indent",
      "    a += 1         # 4 space indent      delta 4 spaces",
      "    if b > 5:      # 4 space indent",
      "        b += 1     # 8 space indent      delta 4 spaces",
      "        b += 1     # 8 space indent",
      "        b += 1     # 8 space indent",
      "# comment line 1   # 0 space indent      delta 8 spaces",
      "# comment line 2   # 0 space indent",
      "# comment line 3   # 0 space indent",
      "        b += 1     # 8 space indent      delta 8 spaces",
      "        b += 1     # 8 space indent",
      "        b += 1     # 8 space indent"
    ]);
  });
  test("issue #55818: Broken indentation detection", () => {
    assertGuess(true, 2, [
      "",
      "/* REQUIRE */",
      "",
      "const foo = require ( 'foo' ),",
      "      bar = require ( 'bar' );",
      "",
      "/* MY FN */",
      "",
      "function myFn () {",
      "",
      "  const asd = 1,",
      "        dsa = 2;",
      "",
      "  return bar ( foo ( asd ) );",
      "",
      "}",
      "",
      "/* EXPORT */",
      "",
      "module.exports = myFn;",
      ""
    ]);
  });
  test("issue #70832: Broken indentation detection", () => {
    assertGuess(false, void 0, [
      "x",
      "x",
      "x",
      "x",
      "	x",
      "		x",
      "    x",
      "		x",
      "	x",
      "		x",
      "	x",
      "	x",
      "	x",
      "	x",
      "x"
    ]);
  });
  test("issue #62143: Broken indentation detection", () => {
    assertGuess(true, 2, [
      "x",
      "x",
      "  x",
      "  x"
    ]);
    assertGuess(true, 2, [
      "x",
      "  - item2",
      "  - item3"
    ]);
    testGuessIndentation(true, 2, true, 2, [
      "x x",
      "  x",
      "  x"
    ]);
    testGuessIndentation(true, 2, true, 2, [
      "x x",
      "  x",
      "  x",
      "    x"
    ]);
    testGuessIndentation(true, 2, true, 2, [
      "<!--test1.md -->",
      "- item1",
      "  - item2",
      "    - item3"
    ]);
  });
  test("issue #84217: Broken indentation detection", () => {
    assertGuess(true, 4, [
      "def main():",
      "    print('hello')"
    ]);
    assertGuess(true, 4, [
      "def main():",
      "    with open('foo') as fp:",
      "        print(fp.read())"
    ]);
  });
  test("validatePosition", () => {
    const m = createTextModel("line one\nline two");
    assert.deepStrictEqual(m.validatePosition(new Position(0, 0)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(0, 1)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 1)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 2)), new Position(1, 2));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 30)), new Position(1, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 0)), new Position(2, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 1)), new Position(2, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 2)), new Position(2, 2));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 30)), new Position(2, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(3, 0)), new Position(2, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(3, 1)), new Position(2, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(3, 30)), new Position(2, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(30, 30)), new Position(2, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(-123.123, -0.5)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(Number.MIN_VALUE, Number.MIN_VALUE)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(Number.MAX_VALUE, Number.MAX_VALUE)), new Position(2, 9));
    assert.deepStrictEqual(m.validatePosition(new Position(123.23, 47.5)), new Position(2, 9));
    m.dispose();
  });
  test("validatePosition around high-low surrogate pairs 1", () => {
    const m = createTextModel("a\u{1F4DA}b");
    assert.deepStrictEqual(m.validatePosition(new Position(0, 0)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(0, 1)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(0, 7)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 1)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 2)), new Position(1, 2));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 3)), new Position(1, 2));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 4)), new Position(1, 4));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 5)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 30)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 0)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 1)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 2)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(2, 30)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(-123.123, -0.5)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(Number.MIN_VALUE, Number.MIN_VALUE)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(Number.MAX_VALUE, Number.MAX_VALUE)), new Position(1, 5));
    assert.deepStrictEqual(m.validatePosition(new Position(123.23, 47.5)), new Position(1, 5));
    m.dispose();
  });
  test("validatePosition around high-low surrogate pairs 2", () => {
    const m = createTextModel("a\u{1F4DA}\u{1F4DA}b");
    assert.deepStrictEqual(m.validatePosition(new Position(1, 1)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 2)), new Position(1, 2));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 3)), new Position(1, 2));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 4)), new Position(1, 4));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 5)), new Position(1, 4));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 6)), new Position(1, 6));
    assert.deepStrictEqual(m.validatePosition(new Position(1, 7)), new Position(1, 7));
    m.dispose();
  });
  test("validatePosition handle NaN.", () => {
    const m = createTextModel("line one\nline two");
    assert.deepStrictEqual(m.validatePosition(new Position(NaN, 1)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(1, NaN)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(NaN, NaN)), new Position(1, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(2, NaN)), new Position(2, 1));
    assert.deepStrictEqual(m.validatePosition(new Position(NaN, 3)), new Position(1, 3));
    m.dispose();
  });
  test("issue #71480: validatePosition handle floats", () => {
    const m = createTextModel("line one\nline two");
    assert.deepStrictEqual(m.validatePosition(new Position(0.2, 1)), new Position(1, 1), "a");
    assert.deepStrictEqual(m.validatePosition(new Position(1.2, 1)), new Position(1, 1), "b");
    assert.deepStrictEqual(m.validatePosition(new Position(1.5, 2)), new Position(1, 2), "c");
    assert.deepStrictEqual(m.validatePosition(new Position(1.8, 3)), new Position(1, 3), "d");
    assert.deepStrictEqual(m.validatePosition(new Position(1, 0.3)), new Position(1, 1), "e");
    assert.deepStrictEqual(m.validatePosition(new Position(2, 0.8)), new Position(2, 1), "f");
    assert.deepStrictEqual(m.validatePosition(new Position(1, 1.2)), new Position(1, 1), "g");
    assert.deepStrictEqual(m.validatePosition(new Position(2, 1.5)), new Position(2, 1), "h");
    m.dispose();
  });
  test("issue #71480: validateRange handle floats", () => {
    const m = createTextModel("line one\nline two");
    assert.deepStrictEqual(m.validateRange(new Range(0.2, 1.5, 0.8, 2.5)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(1.2, 1.7, 1.8, 2.2)), new Range(1, 1, 1, 2));
    m.dispose();
  });
  test("validateRange around high-low surrogate pairs 1", () => {
    const m = createTextModel("a\u{1F4DA}b");
    assert.deepStrictEqual(m.validateRange(new Range(0, 0, 0, 1)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(0, 0, 0, 7)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 1)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 2)), new Range(1, 1, 1, 2));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 3)), new Range(1, 1, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 4)), new Range(1, 1, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 5)), new Range(1, 1, 1, 5));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 2)), new Range(1, 2, 1, 2));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 3)), new Range(1, 2, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 4)), new Range(1, 2, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 5)), new Range(1, 2, 1, 5));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 3)), new Range(1, 2, 1, 2));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 4)), new Range(1, 2, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 5)), new Range(1, 2, 1, 5));
    assert.deepStrictEqual(m.validateRange(new Range(1, 4, 1, 4)), new Range(1, 4, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 4, 1, 5)), new Range(1, 4, 1, 5));
    assert.deepStrictEqual(m.validateRange(new Range(1, 5, 1, 5)), new Range(1, 5, 1, 5));
    m.dispose();
  });
  test("validateRange around high-low surrogate pairs 2", () => {
    const m = createTextModel("a\u{1F4DA}\u{1F4DA}b");
    assert.deepStrictEqual(m.validateRange(new Range(0, 0, 0, 1)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(0, 0, 0, 7)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 1)), new Range(1, 1, 1, 1));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 2)), new Range(1, 1, 1, 2));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 3)), new Range(1, 1, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 4)), new Range(1, 1, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 5)), new Range(1, 1, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 6)), new Range(1, 1, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 1, 1, 7)), new Range(1, 1, 1, 7));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 2)), new Range(1, 2, 1, 2));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 3)), new Range(1, 2, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 4)), new Range(1, 2, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 5)), new Range(1, 2, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 6)), new Range(1, 2, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 2, 1, 7)), new Range(1, 2, 1, 7));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 3)), new Range(1, 2, 1, 2));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 4)), new Range(1, 2, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 5)), new Range(1, 2, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 6)), new Range(1, 2, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 3, 1, 7)), new Range(1, 2, 1, 7));
    assert.deepStrictEqual(m.validateRange(new Range(1, 4, 1, 4)), new Range(1, 4, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 4, 1, 5)), new Range(1, 4, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 4, 1, 6)), new Range(1, 4, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 4, 1, 7)), new Range(1, 4, 1, 7));
    assert.deepStrictEqual(m.validateRange(new Range(1, 5, 1, 5)), new Range(1, 4, 1, 4));
    assert.deepStrictEqual(m.validateRange(new Range(1, 5, 1, 6)), new Range(1, 4, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 5, 1, 7)), new Range(1, 4, 1, 7));
    assert.deepStrictEqual(m.validateRange(new Range(1, 6, 1, 6)), new Range(1, 6, 1, 6));
    assert.deepStrictEqual(m.validateRange(new Range(1, 6, 1, 7)), new Range(1, 6, 1, 7));
    assert.deepStrictEqual(m.validateRange(new Range(1, 7, 1, 7)), new Range(1, 7, 1, 7));
    m.dispose();
  });
  test("modifyPosition", () => {
    const m = createTextModel("line one\nline two");
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 1), 0), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(0, 0), 0), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(30, 1), 0), new Position(2, 9));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 1), 17), new Position(2, 9));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 1), 1), new Position(1, 2));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 1), 3), new Position(1, 4));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), 10), new Position(2, 3));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 5), 13), new Position(2, 9));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), 16), new Position(2, 9));
    assert.deepStrictEqual(m.modifyPosition(new Position(2, 9), -17), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), -1), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 4), -3), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(2, 3), -10), new Position(1, 2));
    assert.deepStrictEqual(m.modifyPosition(new Position(2, 9), -13), new Position(1, 5));
    assert.deepStrictEqual(m.modifyPosition(new Position(2, 9), -16), new Position(1, 2));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), 17), new Position(2, 9));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), 100), new Position(2, 9));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), -2), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(1, 2), -100), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(2, 2), -100), new Position(1, 1));
    assert.deepStrictEqual(m.modifyPosition(new Position(2, 9), -18), new Position(1, 1));
    m.dispose();
  });
  test("normalizeIndentation 1", () => {
    const model = createTextModel(
      "",
      void 0,
      {
        insertSpaces: false
      }
    );
    assert.strictEqual(model.normalizeIndentation("	"), "	");
    assert.strictEqual(model.normalizeIndentation("    "), "	");
    assert.strictEqual(model.normalizeIndentation("   "), "   ");
    assert.strictEqual(model.normalizeIndentation("  "), "  ");
    assert.strictEqual(model.normalizeIndentation(" "), " ");
    assert.strictEqual(model.normalizeIndentation(""), "");
    assert.strictEqual(model.normalizeIndentation(" 	    "), "		");
    assert.strictEqual(model.normalizeIndentation(" 	   "), "	   ");
    assert.strictEqual(model.normalizeIndentation(" 	  "), "	  ");
    assert.strictEqual(model.normalizeIndentation(" 	 "), "	 ");
    assert.strictEqual(model.normalizeIndentation(" 	"), "	");
    assert.strictEqual(model.normalizeIndentation("	a"), "	a");
    assert.strictEqual(model.normalizeIndentation("    a"), "	a");
    assert.strictEqual(model.normalizeIndentation("   a"), "   a");
    assert.strictEqual(model.normalizeIndentation("  a"), "  a");
    assert.strictEqual(model.normalizeIndentation(" a"), " a");
    assert.strictEqual(model.normalizeIndentation("a"), "a");
    assert.strictEqual(model.normalizeIndentation(" 	    a"), "		a");
    assert.strictEqual(model.normalizeIndentation(" 	   a"), "	   a");
    assert.strictEqual(model.normalizeIndentation(" 	  a"), "	  a");
    assert.strictEqual(model.normalizeIndentation(" 	 a"), "	 a");
    assert.strictEqual(model.normalizeIndentation(" 	a"), "	a");
    model.dispose();
  });
  test("normalizeIndentation 2", () => {
    const model = createTextModel("");
    assert.strictEqual(model.normalizeIndentation("	a"), "    a");
    assert.strictEqual(model.normalizeIndentation("    a"), "    a");
    assert.strictEqual(model.normalizeIndentation("   a"), "   a");
    assert.strictEqual(model.normalizeIndentation("  a"), "  a");
    assert.strictEqual(model.normalizeIndentation(" a"), " a");
    assert.strictEqual(model.normalizeIndentation("a"), "a");
    assert.strictEqual(model.normalizeIndentation(" 	    a"), "        a");
    assert.strictEqual(model.normalizeIndentation(" 	   a"), "       a");
    assert.strictEqual(model.normalizeIndentation(" 	  a"), "      a");
    assert.strictEqual(model.normalizeIndentation(" 	 a"), "     a");
    assert.strictEqual(model.normalizeIndentation(" 	a"), "    a");
    model.dispose();
  });
  test("getLineFirstNonWhitespaceColumn", () => {
    const model = createTextModel([
      "asd",
      " asd",
      "	asd",
      "  asd",
      "		asd",
      " ",
      "  ",
      "	",
      "		",
      "  	asd",
      "",
      ""
    ].join("\n"));
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(1), 1, "1");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(2), 2, "2");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(3), 2, "3");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(4), 3, "4");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(5), 3, "5");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(6), 0, "6");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(7), 0, "7");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(8), 0, "8");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(9), 0, "9");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(10), 4, "10");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(11), 0, "11");
    assert.strictEqual(model.getLineFirstNonWhitespaceColumn(12), 0, "12");
    model.dispose();
  });
  test("getLineLastNonWhitespaceColumn", () => {
    const model = createTextModel([
      "asd",
      "asd ",
      "asd	",
      "asd  ",
      "asd		",
      " ",
      "  ",
      "	",
      "		",
      "asd  	",
      "",
      ""
    ].join("\n"));
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(1), 4, "1");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(2), 4, "2");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(3), 4, "3");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(4), 4, "4");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(5), 4, "5");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(6), 0, "6");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(7), 0, "7");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(8), 0, "8");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(9), 0, "9");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(10), 4, "10");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(11), 0, "11");
    assert.strictEqual(model.getLineLastNonWhitespaceColumn(12), 0, "12");
    model.dispose();
  });
  test("#50471. getValueInRange with invalid range", () => {
    const m = createTextModel("My First Line\r\nMy Second Line\r\nMy Third Line");
    assert.strictEqual(m.getValueInRange(new Range(1, NaN, 1, 3)), "My");
    assert.strictEqual(m.getValueInRange(new Range(NaN, NaN, NaN, NaN)), "");
    m.dispose();
  });
  test('issue #168836: updating tabSize should also update indentSize when indentSize is set to "tabSize"', () => {
    const m = createTextModel("some text", null, {
      tabSize: 2,
      indentSize: "tabSize"
    });
    assert.strictEqual(m.getOptions().tabSize, 2);
    assert.strictEqual(m.getOptions().indentSize, 2);
    assert.strictEqual(m.getOptions().originalIndentSize, "tabSize");
    m.updateOptions({
      tabSize: 4
    });
    assert.strictEqual(m.getOptions().tabSize, 4);
    assert.strictEqual(m.getOptions().indentSize, 4);
    assert.strictEqual(m.getOptions().originalIndentSize, "tabSize");
    m.dispose();
  });
});
suite("TextModel.mightContainRTL", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("nope", () => {
    const model = createTextModel("hello world!");
    assert.strictEqual(model.mightContainRTL(), false);
    model.dispose();
  });
  test("yes", () => {
    const model = createTextModel("Hello,\n\u05D6\u05D5\u05D4\u05D9 \u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5");
    assert.strictEqual(model.mightContainRTL(), true);
    model.dispose();
  });
  test("setValue resets 1", () => {
    const model = createTextModel("hello world!");
    assert.strictEqual(model.mightContainRTL(), false);
    model.setValue("Hello,\n\u05D6\u05D5\u05D4\u05D9 \u05E2\u05D5\u05D1\u05D3\u05D4 \u05DE\u05D1\u05D5\u05E1\u05E1\u05EA \u05E9\u05D3\u05E2\u05EA\u05D5");
    assert.strictEqual(model.mightContainRTL(), true);
    model.dispose();
  });
  test("setValue resets 2", () => {
    const model = createTextModel("Hello,\n\u0647\u0646\u0627\u0643 \u062D\u0642\u064A\u0642\u0629 \u0645\u062B\u0628\u062A\u0629 \u0645\u0646\u0630 \u0632\u0645\u0646 \u0637\u0648\u064A\u0644");
    assert.strictEqual(model.mightContainRTL(), true);
    model.setValue("hello world!");
    assert.strictEqual(model.mightContainRTL(), false);
    model.dispose();
  });
});
suite("TextModel.createSnapshot", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("empty file", () => {
    const model = createTextModel("");
    const snapshot = model.createSnapshot();
    assert.strictEqual(snapshot.read(), null);
    model.dispose();
  });
  test("file with BOM", () => {
    const model = createTextModel(UTF8_BOM_CHARACTER + "Hello");
    assert.strictEqual(model.getLineContent(1), "Hello");
    const snapshot = model.createSnapshot(true);
    assert.strictEqual(snapshot.read(), UTF8_BOM_CHARACTER + "Hello");
    assert.strictEqual(snapshot.read(), null);
    model.dispose();
  });
  test("regular file", () => {
    const model = createTextModel("My First Line\n		My Second Line\n    Third Line\n\n1");
    const snapshot = model.createSnapshot();
    assert.strictEqual(snapshot.read(), "My First Line\n		My Second Line\n    Third Line\n\n1");
    assert.strictEqual(snapshot.read(), null);
    model.dispose();
  });
  test("large file", () => {
    const lines = [];
    for (let i = 0; i < 1e3; i++) {
      lines[i] = "Just some text that is a bit long such that it can consume some memory";
    }
    const text = lines.join("\n");
    const model = createTextModel(text);
    const snapshot = model.createSnapshot();
    let actual = "";
    const tmp1 = snapshot.read();
    assert.ok(tmp1);
    actual += tmp1;
    const tmp2 = snapshot.read();
    if (tmp2 === null) {
    } else {
      actual += tmp2;
      assert.strictEqual(snapshot.read(), null);
    }
    assert.strictEqual(actual, text);
    model.dispose();
  });
  test("issue #119632: invalid range", () => {
    const model = createTextModel("hello world!");
    const actual = model._validateRangeRelaxedNoAllocations(new Range(void 0, 0, void 0, 1));
    assert.deepStrictEqual(actual, new Range(1, 1, 1, 1));
    model.dispose();
  });
});
//# sourceMappingURL=textModel.test.js.map
