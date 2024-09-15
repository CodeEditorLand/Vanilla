var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { CoreNavigationCommands } from "../../../browser/coreCommands.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { CursorMove } from "../../../common/cursor/cursorMoveCommands.js";
import { ViewModel } from "../../../common/viewModel/viewModelImpl.js";
import { ITestCodeEditor, withTestCodeEditor } from "../testCodeEditor.js";
suite("Cursor move command test", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const TEXT = [
    "    	My First Line	 ",
    "	My Second Line",
    "    Third Line\u{1F436}",
    "",
    "1"
  ].join("\n");
  function executeTest(callback) {
    withTestCodeEditor(TEXT, {}, (editor, viewModel) => {
      callback(editor, viewModel);
    });
  }
  __name(executeTest, "executeTest");
  test("move left should move to left character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveLeft(viewModel);
      cursorEqual(viewModel, 1, 7);
    });
  });
  test("move left should move to left by n characters", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveLeft(viewModel, 3);
      cursorEqual(viewModel, 1, 5);
    });
  });
  test("move left should move to left by half line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveLeft(viewModel, 1, CursorMove.RawUnit.HalfLine);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move left moves to previous line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 2, 3);
      moveLeft(viewModel, 10);
      cursorEqual(viewModel, 1, 21);
    });
  });
  test("move right should move to right character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 5);
      moveRight(viewModel);
      cursorEqual(viewModel, 1, 6);
    });
  });
  test("move right should move to right by n characters", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 2);
      moveRight(viewModel, 6);
      cursorEqual(viewModel, 1, 8);
    });
  });
  test("move right should move to right by half line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 4);
      moveRight(viewModel, 1, CursorMove.RawUnit.HalfLine);
      cursorEqual(viewModel, 1, 14);
    });
  });
  test("move right moves to next line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveRight(viewModel, 100);
      cursorEqual(viewModel, 2, 1);
    });
  });
  test("move to first character of line from middle", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveToLineStart(viewModel);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move to first character of line from first non white space character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 6);
      moveToLineStart(viewModel);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move to first character of line from first character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 1);
      moveToLineStart(viewModel);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move to first non white space character of line from middle", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveToLineFirstNonWhitespaceCharacter(viewModel);
      cursorEqual(viewModel, 1, 6);
    });
  });
  test("move to first non white space character of line from first non white space character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 6);
      moveToLineFirstNonWhitespaceCharacter(viewModel);
      cursorEqual(viewModel, 1, 6);
    });
  });
  test("move to first non white space character of line from first character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 1);
      moveToLineFirstNonWhitespaceCharacter(viewModel);
      cursorEqual(viewModel, 1, 6);
    });
  });
  test("move to end of line from middle", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveToLineEnd(viewModel);
      cursorEqual(viewModel, 1, 21);
    });
  });
  test("move to end of line from last non white space character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 19);
      moveToLineEnd(viewModel);
      cursorEqual(viewModel, 1, 21);
    });
  });
  test("move to end of line from line end", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 21);
      moveToLineEnd(viewModel);
      cursorEqual(viewModel, 1, 21);
    });
  });
  test("move to last non white space character from middle", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveToLineLastNonWhitespaceCharacter(viewModel);
      cursorEqual(viewModel, 1, 19);
    });
  });
  test("move to last non white space character from last non white space character", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 19);
      moveToLineLastNonWhitespaceCharacter(viewModel);
      cursorEqual(viewModel, 1, 19);
    });
  });
  test("move to last non white space character from line end", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 21);
      moveToLineLastNonWhitespaceCharacter(viewModel);
      cursorEqual(viewModel, 1, 19);
    });
  });
  test("move to center of line not from center", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 8);
      moveToLineCenter(viewModel);
      cursorEqual(viewModel, 1, 11);
    });
  });
  test("move to center of line from center", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 11);
      moveToLineCenter(viewModel);
      cursorEqual(viewModel, 1, 11);
    });
  });
  test("move to center of line from start", () => {
    executeTest((editor, viewModel) => {
      moveToLineStart(viewModel);
      moveToLineCenter(viewModel);
      cursorEqual(viewModel, 1, 11);
    });
  });
  test("move to center of line from end", () => {
    executeTest((editor, viewModel) => {
      moveToLineEnd(viewModel);
      moveToLineCenter(viewModel);
      cursorEqual(viewModel, 1, 11);
    });
  });
  test("move up by cursor move command", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 3, 5);
      cursorEqual(viewModel, 3, 5);
      moveUp(viewModel, 2);
      cursorEqual(viewModel, 1, 5);
      moveUp(viewModel, 1);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move up by model line cursor move command", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 3, 5);
      cursorEqual(viewModel, 3, 5);
      moveUpByModelLine(viewModel, 2);
      cursorEqual(viewModel, 1, 5);
      moveUpByModelLine(viewModel, 1);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move down by model line cursor move command", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 3, 5);
      cursorEqual(viewModel, 3, 5);
      moveDownByModelLine(viewModel, 2);
      cursorEqual(viewModel, 5, 2);
      moveDownByModelLine(viewModel, 1);
      cursorEqual(viewModel, 5, 2);
    });
  });
  test("move up with selection by cursor move command", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 3, 5);
      cursorEqual(viewModel, 3, 5);
      moveUp(viewModel, 1, true);
      cursorEqual(viewModel, 2, 2, 3, 5);
      moveUp(viewModel, 1, true);
      cursorEqual(viewModel, 1, 5, 3, 5);
    });
  });
  test("move up and down with tabs by cursor move command", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 1, 5);
      cursorEqual(viewModel, 1, 5);
      moveDown(viewModel, 4);
      cursorEqual(viewModel, 5, 2);
      moveUp(viewModel, 1);
      cursorEqual(viewModel, 4, 1);
      moveUp(viewModel, 1);
      cursorEqual(viewModel, 3, 5);
      moveUp(viewModel, 1);
      cursorEqual(viewModel, 2, 2);
      moveUp(viewModel, 1);
      cursorEqual(viewModel, 1, 5);
    });
  });
  test("move up and down with end of lines starting from a long one by cursor move command", () => {
    executeTest((editor, viewModel) => {
      moveToEndOfLine(viewModel);
      cursorEqual(viewModel, 1, 21);
      moveToEndOfLine(viewModel);
      cursorEqual(viewModel, 1, 21);
      moveDown(viewModel, 2);
      cursorEqual(viewModel, 3, 17);
      moveDown(viewModel, 1);
      cursorEqual(viewModel, 4, 1);
      moveDown(viewModel, 1);
      cursorEqual(viewModel, 5, 2);
      moveUp(viewModel, 4);
      cursorEqual(viewModel, 1, 21);
    });
  });
  test("move to view top line moves to first visible line if it is first line", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(1, 1, 10, 1);
      moveTo(viewModel, 2, 2);
      moveToTop(viewModel);
      cursorEqual(viewModel, 1, 6);
    });
  });
  test("move to view top line moves to top visible line when first line is not visible", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(2, 1, 10, 1);
      moveTo(viewModel, 4, 1);
      moveToTop(viewModel);
      cursorEqual(viewModel, 2, 2);
    });
  });
  test("move to view top line moves to nth line from top", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(1, 1, 10, 1);
      moveTo(viewModel, 4, 1);
      moveToTop(viewModel, 3);
      cursorEqual(viewModel, 3, 5);
    });
  });
  test("move to view top line moves to last line if n is greater than last visible line number", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(1, 1, 3, 1);
      moveTo(viewModel, 2, 2);
      moveToTop(viewModel, 4);
      cursorEqual(viewModel, 3, 5);
    });
  });
  test("move to view center line moves to the center line", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(3, 1, 3, 1);
      moveTo(viewModel, 2, 2);
      moveToCenter(viewModel);
      cursorEqual(viewModel, 3, 5);
    });
  });
  test("move to view bottom line moves to last visible line if it is last line", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(1, 1, 5, 1);
      moveTo(viewModel, 2, 2);
      moveToBottom(viewModel);
      cursorEqual(viewModel, 5, 1);
    });
  });
  test("move to view bottom line moves to last visible line when last line is not visible", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(2, 1, 3, 1);
      moveTo(viewModel, 2, 2);
      moveToBottom(viewModel);
      cursorEqual(viewModel, 3, 5);
    });
  });
  test("move to view bottom line moves to nth line from bottom", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(1, 1, 5, 1);
      moveTo(viewModel, 4, 1);
      moveToBottom(viewModel, 3);
      cursorEqual(viewModel, 3, 5);
    });
  });
  test("move to view bottom line moves to first line if n is lesser than first visible line number", () => {
    executeTest((editor, viewModel) => {
      viewModel.getCompletelyVisibleViewRange = () => new Range(2, 1, 5, 1);
      moveTo(viewModel, 4, 1);
      moveToBottom(viewModel, 5);
      cursorEqual(viewModel, 2, 2);
    });
  });
});
suite("Cursor move by blankline test", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const TEXT = [
    "    	My First Line	 ",
    "	My Second Line",
    "    Third Line\u{1F436}",
    "",
    "1",
    "2",
    "3",
    "",
    "         ",
    "a",
    "b"
  ].join("\n");
  function executeTest(callback) {
    withTestCodeEditor(TEXT, {}, (editor, viewModel) => {
      callback(editor, viewModel);
    });
  }
  __name(executeTest, "executeTest");
  test("move down should move to start of next blank line", () => {
    executeTest((editor, viewModel) => {
      moveDownByBlankLine(viewModel, false);
      cursorEqual(viewModel, 4, 1);
    });
  });
  test("move up should move to start of previous blank line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 7, 1);
      moveUpByBlankLine(viewModel, false);
      cursorEqual(viewModel, 4, 1);
    });
  });
  test("move down should skip over whitespace if already on blank line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 8, 1);
      moveDownByBlankLine(viewModel, false);
      cursorEqual(viewModel, 11, 1);
    });
  });
  test("move up should skip over whitespace if already on blank line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 9, 1);
      moveUpByBlankLine(viewModel, false);
      cursorEqual(viewModel, 4, 1);
    });
  });
  test("move up should go to first column of first line if not empty", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 2, 1);
      moveUpByBlankLine(viewModel, false);
      cursorEqual(viewModel, 1, 1);
    });
  });
  test("move down should go to first column of last line if not empty", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 10, 1);
      moveDownByBlankLine(viewModel, false);
      cursorEqual(viewModel, 11, 1);
    });
  });
  test("select down should select to start of next blank line", () => {
    executeTest((editor, viewModel) => {
      moveDownByBlankLine(viewModel, true);
      selectionEqual(viewModel.getSelection(), 4, 1, 1, 1);
    });
  });
  test("select up should select to start of previous blank line", () => {
    executeTest((editor, viewModel) => {
      moveTo(viewModel, 7, 1);
      moveUpByBlankLine(viewModel, true);
      selectionEqual(viewModel.getSelection(), 4, 1, 7, 1);
    });
  });
});
function move(viewModel, args) {
  CoreNavigationCommands.CursorMove.runCoreEditorCommand(viewModel, args);
}
__name(move, "move");
function moveToLineStart(viewModel) {
  move(viewModel, { to: CursorMove.RawDirection.WrappedLineStart });
}
__name(moveToLineStart, "moveToLineStart");
function moveToLineFirstNonWhitespaceCharacter(viewModel) {
  move(viewModel, { to: CursorMove.RawDirection.WrappedLineFirstNonWhitespaceCharacter });
}
__name(moveToLineFirstNonWhitespaceCharacter, "moveToLineFirstNonWhitespaceCharacter");
function moveToLineCenter(viewModel) {
  move(viewModel, { to: CursorMove.RawDirection.WrappedLineColumnCenter });
}
__name(moveToLineCenter, "moveToLineCenter");
function moveToLineEnd(viewModel) {
  move(viewModel, { to: CursorMove.RawDirection.WrappedLineEnd });
}
__name(moveToLineEnd, "moveToLineEnd");
function moveToLineLastNonWhitespaceCharacter(viewModel) {
  move(viewModel, { to: CursorMove.RawDirection.WrappedLineLastNonWhitespaceCharacter });
}
__name(moveToLineLastNonWhitespaceCharacter, "moveToLineLastNonWhitespaceCharacter");
function moveLeft(viewModel, value, by, select) {
  move(viewModel, { to: CursorMove.RawDirection.Left, by, value, select });
}
__name(moveLeft, "moveLeft");
function moveRight(viewModel, value, by, select) {
  move(viewModel, { to: CursorMove.RawDirection.Right, by, value, select });
}
__name(moveRight, "moveRight");
function moveUp(viewModel, noOfLines = 1, select) {
  move(viewModel, { to: CursorMove.RawDirection.Up, by: CursorMove.RawUnit.WrappedLine, value: noOfLines, select });
}
__name(moveUp, "moveUp");
function moveUpByBlankLine(viewModel, select) {
  move(viewModel, { to: CursorMove.RawDirection.PrevBlankLine, by: CursorMove.RawUnit.WrappedLine, select });
}
__name(moveUpByBlankLine, "moveUpByBlankLine");
function moveUpByModelLine(viewModel, noOfLines = 1, select) {
  move(viewModel, { to: CursorMove.RawDirection.Up, value: noOfLines, select });
}
__name(moveUpByModelLine, "moveUpByModelLine");
function moveDown(viewModel, noOfLines = 1, select) {
  move(viewModel, { to: CursorMove.RawDirection.Down, by: CursorMove.RawUnit.WrappedLine, value: noOfLines, select });
}
__name(moveDown, "moveDown");
function moveDownByBlankLine(viewModel, select) {
  move(viewModel, { to: CursorMove.RawDirection.NextBlankLine, by: CursorMove.RawUnit.WrappedLine, select });
}
__name(moveDownByBlankLine, "moveDownByBlankLine");
function moveDownByModelLine(viewModel, noOfLines = 1, select) {
  move(viewModel, { to: CursorMove.RawDirection.Down, value: noOfLines, select });
}
__name(moveDownByModelLine, "moveDownByModelLine");
function moveToTop(viewModel, noOfLines = 1, select) {
  move(viewModel, { to: CursorMove.RawDirection.ViewPortTop, value: noOfLines, select });
}
__name(moveToTop, "moveToTop");
function moveToCenter(viewModel, select) {
  move(viewModel, { to: CursorMove.RawDirection.ViewPortCenter, select });
}
__name(moveToCenter, "moveToCenter");
function moveToBottom(viewModel, noOfLines = 1, select) {
  move(viewModel, { to: CursorMove.RawDirection.ViewPortBottom, value: noOfLines, select });
}
__name(moveToBottom, "moveToBottom");
function cursorEqual(viewModel, posLineNumber, posColumn, selLineNumber = posLineNumber, selColumn = posColumn) {
  positionEqual(viewModel.getPosition(), posLineNumber, posColumn);
  selectionEqual(viewModel.getSelection(), posLineNumber, posColumn, selLineNumber, selColumn);
}
__name(cursorEqual, "cursorEqual");
function positionEqual(position, lineNumber, column) {
  assert.deepStrictEqual(position, new Position(lineNumber, column), "position equal");
}
__name(positionEqual, "positionEqual");
function selectionEqual(selection, posLineNumber, posColumn, selLineNumber, selColumn) {
  assert.deepStrictEqual({
    selectionStartLineNumber: selection.selectionStartLineNumber,
    selectionStartColumn: selection.selectionStartColumn,
    positionLineNumber: selection.positionLineNumber,
    positionColumn: selection.positionColumn
  }, {
    selectionStartLineNumber: selLineNumber,
    selectionStartColumn: selColumn,
    positionLineNumber: posLineNumber,
    positionColumn: posColumn
  }, "selection equal");
}
__name(selectionEqual, "selectionEqual");
function moveTo(viewModel, lineNumber, column, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(viewModel, {
      position: new Position(lineNumber, column)
    });
  } else {
    CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, {
      position: new Position(lineNumber, column)
    });
  }
}
__name(moveTo, "moveTo");
function moveToEndOfLine(viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorEndSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorEnd.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveToEndOfLine, "moveToEndOfLine");
//# sourceMappingURL=cursorMoveCommand.test.js.map
