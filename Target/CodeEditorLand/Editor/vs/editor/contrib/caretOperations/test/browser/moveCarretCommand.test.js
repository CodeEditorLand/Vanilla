var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../common/core/selection.js";
import { MoveCaretCommand } from "../../browser/moveCaretCommand.js";
import { testCommand } from "../../../../test/browser/testCommand.js";
function testMoveCaretLeftCommand(lines, selection, expectedLines, expectedSelection) {
  testCommand(lines, null, selection, (accessor, sel) => new MoveCaretCommand(sel, true), expectedLines, expectedSelection);
}
__name(testMoveCaretLeftCommand, "testMoveCaretLeftCommand");
function testMoveCaretRightCommand(lines, selection, expectedLines, expectedSelection) {
  testCommand(lines, null, selection, (accessor, sel) => new MoveCaretCommand(sel, false), expectedLines, expectedSelection);
}
__name(testMoveCaretRightCommand, "testMoveCaretRightCommand");
suite("Editor Contrib - Move Caret Command", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("move selection to left", function() {
    testMoveCaretLeftCommand(
      [
        "012345"
      ],
      new Selection(1, 3, 1, 5),
      [
        "023145"
      ],
      new Selection(1, 2, 1, 4)
    );
  });
  test("move selection to right", function() {
    testMoveCaretRightCommand(
      [
        "012345"
      ],
      new Selection(1, 3, 1, 5),
      [
        "014235"
      ],
      new Selection(1, 4, 1, 6)
    );
  });
  test("move selection to left - from first column - no change", function() {
    testMoveCaretLeftCommand(
      [
        "012345"
      ],
      new Selection(1, 1, 1, 1),
      [
        "012345"
      ],
      new Selection(1, 1, 1, 1)
    );
  });
  test("move selection to right - from last column - no change", function() {
    testMoveCaretRightCommand(
      [
        "012345"
      ],
      new Selection(1, 5, 1, 7),
      [
        "012345"
      ],
      new Selection(1, 5, 1, 7)
    );
  });
});
//# sourceMappingURL=moveCarretCommand.test.js.map
