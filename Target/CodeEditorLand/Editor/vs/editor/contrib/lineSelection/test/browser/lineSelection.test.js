import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Position } from "../../../../common/core/position.js";
import { Selection } from "../../../../common/core/selection.js";
import { withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { ExpandLineSelectionAction } from "../../browser/lineSelection.js";
function executeAction(action, editor) {
  action.run(null, editor, void 0);
}
suite("LineSelection", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("", () => {
    const LINE1 = "    	My First Line	 ";
    const LINE2 = "	My Second Line";
    const LINE3 = "    Third Line\u{1F436}";
    const LINE4 = "";
    const LINE5 = "1";
    const TEXT = LINE1 + "\r\n" + LINE2 + "\n" + LINE3 + "\n" + LINE4 + "\r\n" + LINE5;
    withTestCodeEditor(TEXT, {}, (editor, viewModel) => {
      const action = new ExpandLineSelectionAction();
      editor.setPosition(new Position(1, 1));
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 2, 1)
      );
      editor.setPosition(new Position(1, 2));
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 2, 1)
      );
      editor.setPosition(new Position(1, 5));
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 2, 1)
      );
      editor.setPosition(new Position(1, 19));
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 2, 1)
      );
      editor.setPosition(new Position(1, 20));
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 2, 1)
      );
      editor.setPosition(new Position(1, 21));
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 2, 1)
      );
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 3, 1)
      );
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 4, 1)
      );
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 5, 1)
      );
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 5, LINE5.length + 1)
      );
      executeAction(action, editor);
      assert.deepStrictEqual(
        editor.getSelection(),
        new Selection(1, 1, 5, LINE5.length + 1)
      );
    });
  });
});
