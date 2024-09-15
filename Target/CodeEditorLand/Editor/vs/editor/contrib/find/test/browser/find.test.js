import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { getSelectionSearchString } from "../../browser/findController.js";
import { withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
suite("Find", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("search string at position", () => {
    withTestCodeEditor([
      "ABC DEF",
      "0123 456"
    ], {}, (editor) => {
      const searchStringAtTop = getSelectionSearchString(editor);
      assert.strictEqual(searchStringAtTop, "ABC");
      editor.setPosition(new Position(1, 3));
      const searchStringAfterABC = getSelectionSearchString(editor);
      assert.strictEqual(searchStringAfterABC, "ABC");
      editor.setPosition(new Position(1, 5));
      const searchStringInsideDEF = getSelectionSearchString(editor);
      assert.strictEqual(searchStringInsideDEF, "DEF");
    });
  });
  test("search string with selection", () => {
    withTestCodeEditor([
      "ABC DEF",
      "0123 456"
    ], {}, (editor) => {
      editor.setSelection(new Range(1, 1, 1, 2));
      const searchStringSelectionA = getSelectionSearchString(editor);
      assert.strictEqual(searchStringSelectionA, "A");
      editor.setSelection(new Range(1, 2, 1, 4));
      const searchStringSelectionBC = getSelectionSearchString(editor);
      assert.strictEqual(searchStringSelectionBC, "BC");
      editor.setSelection(new Range(1, 2, 1, 7));
      const searchStringSelectionBCDE = getSelectionSearchString(editor);
      assert.strictEqual(searchStringSelectionBCDE, "BC DE");
    });
  });
  test("search string with multiline selection", () => {
    withTestCodeEditor([
      "ABC DEF",
      "0123 456"
    ], {}, (editor) => {
      editor.setSelection(new Range(1, 1, 2, 1));
      const searchStringSelectionWholeLine = getSelectionSearchString(editor);
      assert.strictEqual(searchStringSelectionWholeLine, null);
      editor.setSelection(new Range(1, 1, 2, 4));
      const searchStringSelectionTwoLines = getSelectionSearchString(editor);
      assert.strictEqual(searchStringSelectionTwoLines, null);
      editor.setSelection(new Range(1, 7, 2, 4));
      const searchStringSelectionSpanLines = getSelectionSearchString(editor);
      assert.strictEqual(searchStringSelectionSpanLines, null);
    });
  });
});
//# sourceMappingURL=find.test.js.map
