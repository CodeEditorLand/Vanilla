import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../common/core/selection.js";
import { testCommand } from "../../../../test/browser/testCommand.js";
import { MoveCaretCommand } from "../../browser/moveCaretCommand.js";
function testMoveCaretLeftCommand(lines, selection, expectedLines, expectedSelection) {
  testCommand(
    lines,
    null,
    selection,
    (accessor, sel) => new MoveCaretCommand(sel, true),
    expectedLines,
    expectedSelection
  );
}
function testMoveCaretRightCommand(lines, selection, expectedLines, expectedSelection) {
  testCommand(
    lines,
    null,
    selection,
    (accessor, sel) => new MoveCaretCommand(sel, false),
    expectedLines,
    expectedSelection
  );
}
suite("Editor Contrib - Move Caret Command", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("move selection to left", () => {
    testMoveCaretLeftCommand(
      ["012345"],
      new Selection(1, 3, 1, 5),
      ["023145"],
      new Selection(1, 2, 1, 4)
    );
  });
  test("move selection to right", () => {
    testMoveCaretRightCommand(
      ["012345"],
      new Selection(1, 3, 1, 5),
      ["014235"],
      new Selection(1, 4, 1, 6)
    );
  });
  test("move selection to left - from first column - no change", () => {
    testMoveCaretLeftCommand(
      ["012345"],
      new Selection(1, 1, 1, 1),
      ["012345"],
      new Selection(1, 1, 1, 1)
    );
  });
  test("move selection to right - from last column - no change", () => {
    testMoveCaretRightCommand(
      ["012345"],
      new Selection(1, 5, 1, 7),
      ["012345"],
      new Selection(1, 5, 1, 7)
    );
  });
});
