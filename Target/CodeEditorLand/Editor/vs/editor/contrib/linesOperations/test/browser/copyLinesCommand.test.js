var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../common/core/selection.js";
import { CopyLinesCommand } from "../../browser/copyLinesCommand.js";
import { DuplicateSelectionAction } from "../../browser/linesOperations.js";
import { withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { testCommand } from "../../../../test/browser/testCommand.js";
function testCopyLinesDownCommand(lines, selection, expectedLines, expectedSelection) {
  testCommand(lines, null, selection, (accessor, sel) => new CopyLinesCommand(sel, true), expectedLines, expectedSelection);
}
__name(testCopyLinesDownCommand, "testCopyLinesDownCommand");
function testCopyLinesUpCommand(lines, selection, expectedLines, expectedSelection) {
  testCommand(lines, null, selection, (accessor, sel) => new CopyLinesCommand(sel, false), expectedLines, expectedSelection);
}
__name(testCopyLinesUpCommand, "testCopyLinesUpCommand");
suite("Editor Contrib - Copy Lines Command", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("copy first line down", function() {
    testCopyLinesDownCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 3, 1, 1),
      [
        "first",
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 3, 2, 1)
    );
  });
  test("copy first line up", function() {
    testCopyLinesUpCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 3, 1, 1),
      [
        "first",
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 3, 1, 1)
    );
  });
  test("copy last line down", function() {
    testCopyLinesDownCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(5, 3, 5, 1),
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth",
        "fifth"
      ],
      new Selection(6, 3, 6, 1)
    );
  });
  test("copy last line up", function() {
    testCopyLinesUpCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(5, 3, 5, 1),
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth",
        "fifth"
      ],
      new Selection(5, 3, 5, 1)
    );
  });
  test("issue #1322: copy line up", function() {
    testCopyLinesUpCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(3, 11, 3, 11),
      [
        "first",
        "second line",
        "third line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(3, 11, 3, 11)
    );
  });
  test("issue #1322: copy last line up", function() {
    testCopyLinesUpCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(5, 6, 5, 6),
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth",
        "fifth"
      ],
      new Selection(5, 6, 5, 6)
    );
  });
  test("copy many lines up", function() {
    testCopyLinesUpCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(4, 3, 2, 1),
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(4, 3, 2, 1)
    );
  });
  test("ignore empty selection", function() {
    testCopyLinesUpCommand(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 1, 1, 1),
      [
        "first",
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 1, 1, 1)
    );
  });
});
suite("Editor Contrib - Duplicate Selection", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const duplicateSelectionAction = new DuplicateSelectionAction();
  function testDuplicateSelectionAction(lines, selections, expectedLines, expectedSelections) {
    withTestCodeEditor(lines.join("\n"), {}, (editor) => {
      editor.setSelections(selections);
      duplicateSelectionAction.run(null, editor, {});
      assert.deepStrictEqual(editor.getValue(), expectedLines.join("\n"));
      assert.deepStrictEqual(editor.getSelections().map((s) => s.toString()), expectedSelections.map((s) => s.toString()));
    });
  }
  __name(testDuplicateSelectionAction, "testDuplicateSelectionAction");
  test("empty selection", function() {
    testDuplicateSelectionAction(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      [new Selection(2, 2, 2, 2), new Selection(3, 2, 3, 2)],
      [
        "first",
        "second line",
        "second line",
        "third line",
        "third line",
        "fourth line",
        "fifth"
      ],
      [new Selection(3, 2, 3, 2), new Selection(5, 2, 5, 2)]
    );
  });
  test("with selection", function() {
    testDuplicateSelectionAction(
      [
        "first",
        "second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      [new Selection(2, 1, 2, 4), new Selection(3, 1, 3, 4)],
      [
        "first",
        "secsecond line",
        "thithird line",
        "fourth line",
        "fifth"
      ],
      [new Selection(2, 4, 2, 7), new Selection(3, 4, 3, 7)]
    );
  });
});
//# sourceMappingURL=copyLinesCommand.test.js.map
