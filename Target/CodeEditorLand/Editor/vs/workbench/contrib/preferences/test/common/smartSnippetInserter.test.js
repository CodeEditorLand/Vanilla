var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { SmartSnippetInserter } from "../../common/smartSnippetInserter.js";
import { createTextModel } from "../../../../../editor/test/common/testTextModel.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
suite("SmartSnippetInserter", () => {
  function testSmartSnippetInserter(text, runner) {
    const model = createTextModel(text.join("\n"));
    runner((desiredPos, pos, prepend, append) => {
      const actual = SmartSnippetInserter.insertSnippet(model, desiredPos);
      const expected = {
        position: pos,
        prepend,
        append
      };
      assert.deepStrictEqual(actual, expected);
    });
    model.dispose();
  }
  __name(testSmartSnippetInserter, "testSmartSnippetInserter");
  test("empty text", () => {
    testSmartSnippetInserter([], (assert2) => {
      assert2(new Position(1, 1), new Position(1, 1), "\n[", "]");
    });
    testSmartSnippetInserter([
      " "
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(1, 2), "\n[", "]");
      assert2(new Position(1, 2), new Position(1, 2), "\n[", "]");
    });
    testSmartSnippetInserter([
      "// just some text"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(1, 18), "\n[", "]");
      assert2(new Position(1, 18), new Position(1, 18), "\n[", "]");
    });
    testSmartSnippetInserter([
      "// just some text",
      ""
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 1), "\n[", "]");
      assert2(new Position(1, 18), new Position(2, 1), "\n[", "]");
      assert2(new Position(2, 1), new Position(2, 1), "\n[", "]");
    });
  });
  test("empty array 1", () => {
    testSmartSnippetInserter([
      "// just some text",
      "[]"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 2), "", "");
      assert2(new Position(2, 1), new Position(2, 2), "", "");
      assert2(new Position(2, 2), new Position(2, 2), "", "");
      assert2(new Position(2, 3), new Position(2, 2), "", "");
    });
  });
  test("empty array 2", () => {
    testSmartSnippetInserter([
      "// just some text",
      "[",
      "]"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 2), "", "");
      assert2(new Position(2, 1), new Position(2, 2), "", "");
      assert2(new Position(2, 2), new Position(2, 2), "", "");
      assert2(new Position(3, 1), new Position(3, 1), "", "");
      assert2(new Position(3, 2), new Position(3, 1), "", "");
    });
  });
  test("empty array 3", () => {
    testSmartSnippetInserter([
      "// just some text",
      "[",
      "// just some text",
      "]"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 2), "", "");
      assert2(new Position(2, 1), new Position(2, 2), "", "");
      assert2(new Position(2, 2), new Position(2, 2), "", "");
      assert2(new Position(3, 1), new Position(3, 1), "", "");
      assert2(new Position(3, 2), new Position(3, 1), "", "");
      assert2(new Position(4, 1), new Position(4, 1), "", "");
      assert2(new Position(4, 2), new Position(4, 1), "", "");
    });
  });
  test("one element array 1", () => {
    testSmartSnippetInserter([
      "// just some text",
      "[",
      "{}",
      "]"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 2), "", ",");
      assert2(new Position(2, 1), new Position(2, 2), "", ",");
      assert2(new Position(2, 2), new Position(2, 2), "", ",");
      assert2(new Position(3, 1), new Position(3, 1), "", ",");
      assert2(new Position(3, 2), new Position(3, 1), "", ",");
      assert2(new Position(3, 3), new Position(3, 3), ",", "");
      assert2(new Position(4, 1), new Position(4, 1), ",", "");
      assert2(new Position(4, 2), new Position(4, 1), ",", "");
    });
  });
  test("two elements array 1", () => {
    testSmartSnippetInserter([
      "// just some text",
      "[",
      "{},",
      "{}",
      "]"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 2), "", ",");
      assert2(new Position(2, 1), new Position(2, 2), "", ",");
      assert2(new Position(2, 2), new Position(2, 2), "", ",");
      assert2(new Position(3, 1), new Position(3, 1), "", ",");
      assert2(new Position(3, 2), new Position(3, 1), "", ",");
      assert2(new Position(3, 3), new Position(3, 3), ",", "");
      assert2(new Position(3, 4), new Position(3, 4), "", ",");
      assert2(new Position(4, 1), new Position(4, 1), "", ",");
      assert2(new Position(4, 2), new Position(4, 1), "", ",");
      assert2(new Position(4, 3), new Position(4, 3), ",", "");
      assert2(new Position(5, 1), new Position(5, 1), ",", "");
      assert2(new Position(5, 2), new Position(5, 1), ",", "");
    });
  });
  test("two elements array 2", () => {
    testSmartSnippetInserter([
      "// just some text",
      "[",
      "{},{}",
      "]"
    ], (assert2) => {
      assert2(new Position(1, 1), new Position(2, 2), "", ",");
      assert2(new Position(2, 1), new Position(2, 2), "", ",");
      assert2(new Position(2, 2), new Position(2, 2), "", ",");
      assert2(new Position(3, 1), new Position(3, 1), "", ",");
      assert2(new Position(3, 2), new Position(3, 1), "", ",");
      assert2(new Position(3, 3), new Position(3, 3), ",", "");
      assert2(new Position(3, 4), new Position(3, 4), "", ",");
      assert2(new Position(3, 5), new Position(3, 4), "", ",");
      assert2(new Position(3, 6), new Position(3, 6), ",", "");
      assert2(new Position(4, 1), new Position(4, 1), ",", "");
      assert2(new Position(4, 2), new Position(4, 1), ",", "");
    });
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=smartSnippetInserter.test.js.map
