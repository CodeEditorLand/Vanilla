var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ITextAreaWrapper, TextAreaState } from "../../../browser/controller/editContext/textArea/textAreaEditContextState.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { createTextModel } from "../../common/testTextModel.js";
import { PagedScreenReaderStrategy } from "../../../browser/controller/editContext/screenReaderUtils.js";
class MockTextAreaWrapper extends Disposable {
  static {
    __name(this, "MockTextAreaWrapper");
  }
  _value;
  _selectionStart;
  _selectionEnd;
  constructor() {
    super();
    this._value = "";
    this._selectionStart = 0;
    this._selectionEnd = 0;
  }
  getValue() {
    return this._value;
  }
  setValue(reason, value) {
    this._value = value;
    this._selectionStart = this._value.length;
    this._selectionEnd = this._value.length;
  }
  getSelectionStart() {
    return this._selectionStart;
  }
  getSelectionEnd() {
    return this._selectionEnd;
  }
  setSelectionRange(reason, selectionStart, selectionEnd) {
    if (selectionStart < 0) {
      selectionStart = 0;
    }
    if (selectionStart > this._value.length) {
      selectionStart = this._value.length;
    }
    if (selectionEnd < 0) {
      selectionEnd = 0;
    }
    if (selectionEnd > this._value.length) {
      selectionEnd = this._value.length;
    }
    this._selectionStart = selectionStart;
    this._selectionEnd = selectionEnd;
  }
}
function equalsTextAreaState(a, b) {
  return a.value === b.value && a.selectionStart === b.selectionStart && a.selectionEnd === b.selectionEnd && Range.equalsRange(a.selection, b.selection) && a.newlineCountBeforeSelection === b.newlineCountBeforeSelection;
}
__name(equalsTextAreaState, "equalsTextAreaState");
suite("TextAreaState", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function assertTextAreaState(actual, value, selectionStart, selectionEnd) {
    const desired = new TextAreaState(value, selectionStart, selectionEnd, null, void 0);
    assert.ok(equalsTextAreaState(desired, actual), desired.toString() + " == " + actual.toString());
  }
  __name(assertTextAreaState, "assertTextAreaState");
  test("fromTextArea", () => {
    const textArea = new MockTextAreaWrapper();
    textArea._value = "Hello world!";
    textArea._selectionStart = 1;
    textArea._selectionEnd = 12;
    let actual = TextAreaState.readFromTextArea(textArea, null);
    assertTextAreaState(actual, "Hello world!", 1, 12);
    assert.strictEqual(actual.value, "Hello world!");
    assert.strictEqual(actual.selectionStart, 1);
    actual = actual.collapseSelection();
    assertTextAreaState(actual, "Hello world!", 12, 12);
    textArea.dispose();
  });
  test("applyToTextArea", () => {
    const textArea = new MockTextAreaWrapper();
    textArea._value = "Hello world!";
    textArea._selectionStart = 1;
    textArea._selectionEnd = 12;
    let state = new TextAreaState("Hi world!", 2, 2, null, void 0);
    state.writeToTextArea("test", textArea, false);
    assert.strictEqual(textArea._value, "Hi world!");
    assert.strictEqual(textArea._selectionStart, 9);
    assert.strictEqual(textArea._selectionEnd, 9);
    state = new TextAreaState("Hi world!", 3, 3, null, void 0);
    state.writeToTextArea("test", textArea, false);
    assert.strictEqual(textArea._value, "Hi world!");
    assert.strictEqual(textArea._selectionStart, 9);
    assert.strictEqual(textArea._selectionEnd, 9);
    state = new TextAreaState("Hi world!", 0, 2, null, void 0);
    state.writeToTextArea("test", textArea, true);
    assert.strictEqual(textArea._value, "Hi world!");
    assert.strictEqual(textArea._selectionStart, 0);
    assert.strictEqual(textArea._selectionEnd, 2);
    textArea.dispose();
  });
  function testDeduceInput(prevState, value, selectionStart, selectionEnd, couldBeEmojiInput, expected, expectedCharReplaceCnt) {
    prevState = prevState || TextAreaState.EMPTY;
    const textArea = new MockTextAreaWrapper();
    textArea._value = value;
    textArea._selectionStart = selectionStart;
    textArea._selectionEnd = selectionEnd;
    const newState = TextAreaState.readFromTextArea(textArea, null);
    const actual = TextAreaState.deduceInput(prevState, newState, couldBeEmojiInput);
    assert.deepStrictEqual(actual, {
      text: expected,
      replacePrevCharCnt: expectedCharReplaceCnt,
      replaceNextCharCnt: 0,
      positionDelta: 0
    });
    textArea.dispose();
  }
  __name(testDeduceInput, "testDeduceInput");
  test("extractNewText - no previous state with selection", () => {
    testDeduceInput(
      null,
      "a",
      0,
      1,
      true,
      "a",
      0
    );
  });
  test("issue #2586: Replacing selected end-of-line with newline locks up the document", () => {
    testDeduceInput(
      new TextAreaState("]\n", 1, 2, null, void 0),
      "]\n",
      2,
      2,
      true,
      "\n",
      0
    );
  });
  test("extractNewText - no previous state without selection", () => {
    testDeduceInput(
      null,
      "a",
      1,
      1,
      true,
      "a",
      0
    );
  });
  test("extractNewText - typing does not cause a selection", () => {
    testDeduceInput(
      TextAreaState.EMPTY,
      "a",
      0,
      1,
      true,
      "a",
      0
    );
  });
  test("extractNewText - had the textarea empty", () => {
    testDeduceInput(
      TextAreaState.EMPTY,
      "a",
      1,
      1,
      true,
      "a",
      0
    );
  });
  test("extractNewText - had the entire line selected", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 0, 12, null, void 0),
      "H",
      1,
      1,
      true,
      "H",
      0
    );
  });
  test("extractNewText - had previous text 1", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 12, 12, null, void 0),
      "Hello world!a",
      13,
      13,
      true,
      "a",
      0
    );
  });
  test("extractNewText - had previous text 2", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 0, 0, null, void 0),
      "aHello world!",
      1,
      1,
      true,
      "a",
      0
    );
  });
  test("extractNewText - had previous text 3", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 6, 11, null, void 0),
      "Hello other!",
      11,
      11,
      true,
      "other",
      0
    );
  });
  test("extractNewText - IME", () => {
    testDeduceInput(
      TextAreaState.EMPTY,
      "\u3053\u308C\u306F",
      3,
      3,
      true,
      "\u3053\u308C\u306F",
      0
    );
  });
  test("extractNewText - isInOverwriteMode", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 0, 0, null, void 0),
      "Aello world!",
      1,
      1,
      true,
      "A",
      0
    );
  });
  test("extractMacReplacedText - does nothing if there is selection", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 5, 5, null, void 0),
      "Hell\xF6 world!",
      4,
      5,
      true,
      "\xF6",
      0
    );
  });
  test("extractMacReplacedText - does nothing if there is more than one extra char", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 5, 5, null, void 0),
      "Hell\xF6\xF6 world!",
      5,
      5,
      true,
      "\xF6\xF6",
      1
    );
  });
  test("extractMacReplacedText - does nothing if there is more than one changed char", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 5, 5, null, void 0),
      "Hel\xF6\xF6 world!",
      5,
      5,
      true,
      "\xF6\xF6",
      2
    );
  });
  test("extractMacReplacedText", () => {
    testDeduceInput(
      new TextAreaState("Hello world!", 5, 5, null, void 0),
      "Hell\xF6 world!",
      5,
      5,
      true,
      "\xF6",
      1
    );
  });
  test("issue #25101 - First key press ignored", () => {
    testDeduceInput(
      new TextAreaState("a", 0, 1, null, void 0),
      "a",
      1,
      1,
      true,
      "a",
      0
    );
  });
  test("issue #16520 - Cmd-d of single character followed by typing same character as has no effect", () => {
    testDeduceInput(
      new TextAreaState("x x", 0, 1, null, void 0),
      "x x",
      1,
      1,
      true,
      "x",
      0
    );
  });
  function testDeduceAndroidCompositionInput(prevState, value, selectionStart, selectionEnd, expected, expectedReplacePrevCharCnt, expectedReplaceNextCharCnt, expectedPositionDelta) {
    prevState = prevState || TextAreaState.EMPTY;
    const textArea = new MockTextAreaWrapper();
    textArea._value = value;
    textArea._selectionStart = selectionStart;
    textArea._selectionEnd = selectionEnd;
    const newState = TextAreaState.readFromTextArea(textArea, null);
    const actual = TextAreaState.deduceAndroidCompositionInput(prevState, newState);
    assert.deepStrictEqual(actual, {
      text: expected,
      replacePrevCharCnt: expectedReplacePrevCharCnt,
      replaceNextCharCnt: expectedReplaceNextCharCnt,
      positionDelta: expectedPositionDelta
    });
    textArea.dispose();
  }
  __name(testDeduceAndroidCompositionInput, "testDeduceAndroidCompositionInput");
  test("Android composition input 1", () => {
    testDeduceAndroidCompositionInput(
      new TextAreaState("Microsoft", 4, 4, null, void 0),
      "Microsoft",
      4,
      4,
      "",
      0,
      0,
      0
    );
  });
  test("Android composition input 2", () => {
    testDeduceAndroidCompositionInput(
      new TextAreaState("Microsoft", 4, 4, null, void 0),
      "Microsoft",
      0,
      9,
      "",
      0,
      0,
      5
    );
  });
  test("Android composition input 3", () => {
    testDeduceAndroidCompositionInput(
      new TextAreaState("Microsoft", 0, 9, null, void 0),
      "Microsoft's",
      11,
      11,
      "'s",
      0,
      0,
      0
    );
  });
  test("Android backspace", () => {
    testDeduceAndroidCompositionInput(
      new TextAreaState("undefinedVariable", 2, 2, null, void 0),
      "udefinedVariable",
      1,
      1,
      "",
      1,
      0,
      0
    );
  });
  suite("PagedScreenReaderStrategy", () => {
    function testPagedScreenReaderStrategy(lines, selection, expected) {
      const model = createTextModel(lines.join("\n"));
      const screenReaderContentState = PagedScreenReaderStrategy.fromEditorSelection(model, selection, 10, true);
      const textAreaState = TextAreaState.fromScreenReaderContentState(screenReaderContentState);
      assert.ok(equalsTextAreaState(textAreaState, expected));
      model.dispose();
    }
    __name(testPagedScreenReaderStrategy, "testPagedScreenReaderStrategy");
    test("simple", () => {
      testPagedScreenReaderStrategy(
        [
          "Hello world!"
        ],
        new Selection(1, 13, 1, 13),
        new TextAreaState("Hello world!", 12, 12, new Range(1, 13, 1, 13), 0)
      );
      testPagedScreenReaderStrategy(
        [
          "Hello world!"
        ],
        new Selection(1, 1, 1, 1),
        new TextAreaState("Hello world!", 0, 0, new Range(1, 1, 1, 1), 0)
      );
      testPagedScreenReaderStrategy(
        [
          "Hello world!"
        ],
        new Selection(1, 1, 1, 6),
        new TextAreaState("Hello world!", 0, 5, new Range(1, 1, 1, 6), 0)
      );
    });
    test("multiline", () => {
      testPagedScreenReaderStrategy(
        [
          "Hello world!",
          "How are you?"
        ],
        new Selection(1, 1, 1, 1),
        new TextAreaState("Hello world!\nHow are you?", 0, 0, new Range(1, 1, 1, 1), 0)
      );
      testPagedScreenReaderStrategy(
        [
          "Hello world!",
          "How are you?"
        ],
        new Selection(2, 1, 2, 1),
        new TextAreaState("Hello world!\nHow are you?", 13, 13, new Range(2, 1, 2, 1), 1)
      );
    });
    test("page", () => {
      testPagedScreenReaderStrategy(
        [
          "L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21"
        ],
        new Selection(1, 1, 1, 1),
        new TextAreaState("L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\n", 0, 0, new Range(1, 1, 1, 1), 0)
      );
      testPagedScreenReaderStrategy(
        [
          "L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21"
        ],
        new Selection(11, 1, 11, 1),
        new TextAreaState("L11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\n", 0, 0, new Range(11, 1, 11, 1), 0)
      );
      testPagedScreenReaderStrategy(
        [
          "L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21"
        ],
        new Selection(12, 1, 12, 1),
        new TextAreaState("L11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\n", 4, 4, new Range(12, 1, 12, 1), 1)
      );
      testPagedScreenReaderStrategy(
        [
          "L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20\nL21"
        ],
        new Selection(21, 1, 21, 1),
        new TextAreaState("L21", 0, 0, new Range(21, 1, 21, 1), 0)
      );
    });
  });
});
//# sourceMappingURL=textAreaState.test.js.map
