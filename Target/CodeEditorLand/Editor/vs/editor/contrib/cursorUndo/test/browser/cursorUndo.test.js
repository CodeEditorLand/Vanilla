import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  CoreEditingCommands,
  CoreNavigationCommands
} from "../../../../browser/coreCommands.js";
import { Selection } from "../../../../common/core/selection.js";
import { Handler } from "../../../../common/editorCommon.js";
import { withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import {
  CursorUndo,
  CursorUndoRedoController
} from "../../browser/cursorUndo.js";
suite("FindController", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const cursorUndoAction = new CursorUndo();
  test("issue #82535: Edge case with cursorUndo", () => {
    withTestCodeEditor("", {}, (editor) => {
      editor.registerAndInstantiateContribution(
        CursorUndoRedoController.ID,
        CursorUndoRedoController
      );
      editor.trigger("test", Handler.Type, { text: "hello" });
      CoreNavigationCommands.CursorLeft.runEditorCommand(
        null,
        editor,
        {}
      );
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, {});
      assert.deepStrictEqual(editor.getValue(), "hell");
      assert.deepStrictEqual(editor.getSelections(), [
        new Selection(1, 5, 1, 5)
      ]);
      CoreNavigationCommands.CursorLeft.runEditorCommand(
        null,
        editor,
        {}
      );
      assert.deepStrictEqual(editor.getSelections(), [
        new Selection(1, 4, 1, 4)
      ]);
      cursorUndoAction.run(null, editor, {});
      assert.deepStrictEqual(editor.getSelections(), [
        new Selection(1, 5, 1, 5)
      ]);
    });
  });
  test("issue #82535: Edge case with cursorUndo (reverse)", () => {
    withTestCodeEditor("", {}, (editor) => {
      editor.registerAndInstantiateContribution(
        CursorUndoRedoController.ID,
        CursorUndoRedoController
      );
      editor.trigger("test", Handler.Type, { text: "hell" });
      editor.trigger("test", Handler.Type, { text: "o" });
      assert.deepStrictEqual(editor.getValue(), "hello");
      assert.deepStrictEqual(editor.getSelections(), [
        new Selection(1, 6, 1, 6)
      ]);
      cursorUndoAction.run(null, editor, {});
      assert.deepStrictEqual(editor.getSelections(), [
        new Selection(1, 6, 1, 6)
      ]);
    });
  });
});
