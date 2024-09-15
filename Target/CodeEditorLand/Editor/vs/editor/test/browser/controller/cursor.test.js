var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { CoreEditingCommands, CoreNavigationCommands } from "../../../browser/coreCommands.js";
import { IEditorOptions } from "../../../common/config/editorOptions.js";
import { EditOperation } from "../../../common/core/editOperation.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { ICursorPositionChangedEvent } from "../../../common/cursorEvents.js";
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from "../../../common/editorCommon.js";
import { MetadataConsts, StandardTokenType } from "../../../common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, IState, ITokenizationSupport, TokenizationRegistry } from "../../../common/languages.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { IndentAction, IndentationRule } from "../../../common/languages/languageConfiguration.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { NullState } from "../../../common/languages/nullTokenize.js";
import { EndOfLinePreference, EndOfLineSequence, ITextModel } from "../../../common/model.js";
import { TextModel } from "../../../common/model/textModel.js";
import { ViewModel } from "../../../common/viewModel/viewModelImpl.js";
import { OutgoingViewModelEventKind } from "../../../common/viewModelEventDispatcher.js";
import { ITestCodeEditor, TestCodeEditorInstantiationOptions, createCodeEditorServices, instantiateTestCodeEditor, withTestCodeEditor } from "../testCodeEditor.js";
import { IRelaxedTextModelCreationOptions, createTextModel, instantiateTextModel } from "../../common/testTextModel.js";
import { TestInstantiationService } from "../../../../platform/instantiation/test/common/instantiationServiceMock.js";
function moveTo(editor, viewModel, lineNumber, column, inSelectionMode = false) {
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
function moveLeft(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorLeftSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorLeft.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveLeft, "moveLeft");
function moveRight(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorRightSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorRight.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveRight, "moveRight");
function moveDown(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorDownSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorDown.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveDown, "moveDown");
function moveUp(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorUpSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorUp.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveUp, "moveUp");
function moveToBeginningOfLine(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorHomeSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorHome.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveToBeginningOfLine, "moveToBeginningOfLine");
function moveToEndOfLine(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorEndSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorEnd.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveToEndOfLine, "moveToEndOfLine");
function moveToBeginningOfBuffer(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorTopSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorTop.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveToBeginningOfBuffer, "moveToBeginningOfBuffer");
function moveToEndOfBuffer(editor, viewModel, inSelectionMode = false) {
  if (inSelectionMode) {
    CoreNavigationCommands.CursorBottomSelect.runCoreEditorCommand(viewModel, {});
  } else {
    CoreNavigationCommands.CursorBottom.runCoreEditorCommand(viewModel, {});
  }
}
__name(moveToEndOfBuffer, "moveToEndOfBuffer");
function assertCursor(viewModel, what) {
  let selections;
  if (what instanceof Position) {
    selections = [new Selection(what.lineNumber, what.column, what.lineNumber, what.column)];
  } else if (what instanceof Selection) {
    selections = [what];
  } else {
    selections = what;
  }
  const actual = viewModel.getSelections().map((s) => s.toString());
  const expected = selections.map((s) => s.toString());
  assert.deepStrictEqual(actual, expected);
}
__name(assertCursor, "assertCursor");
suite("Editor Controller - Cursor", () => {
  const LINE1 = "    	My First Line	 ";
  const LINE2 = "	My Second Line";
  const LINE3 = "    Third Line\u{1F436}";
  const LINE4 = "";
  const LINE5 = "1";
  const TEXT = LINE1 + "\r\n" + LINE2 + "\n" + LINE3 + "\n" + LINE4 + "\r\n" + LINE5;
  function runTest(callback) {
    withTestCodeEditor(TEXT, {}, (editor, viewModel) => {
      callback(editor, viewModel);
    });
  }
  __name(runTest, "runTest");
  ensureNoDisposablesAreLeakedInTestSuite();
  test("cursor initialized", () => {
    runTest((editor, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("no move", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 1);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 2);
      assertCursor(viewModel, new Position(1, 2));
    });
  });
  test("move in selection mode", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 2, true);
      assertCursor(viewModel, new Selection(1, 1, 1, 2));
    });
  });
  test("move beyond line end", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 25);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
    });
  });
  test("move empty line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 4, 20);
      assertCursor(viewModel, new Position(4, 1));
    });
  });
  test("move one char line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 5, 20);
      assertCursor(viewModel, new Position(5, 2));
    });
  });
  test("selection down", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 2, 1, true);
      assertCursor(viewModel, new Selection(1, 1, 2, 1));
    });
  });
  test("move and then select", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 2, 3);
      assertCursor(viewModel, new Position(2, 3));
      moveTo(editor, viewModel, 2, 15, true);
      assertCursor(viewModel, new Selection(2, 3, 2, 15));
      moveTo(editor, viewModel, 1, 2, true);
      assertCursor(viewModel, new Selection(2, 3, 1, 2));
    });
  });
  test("move left on top left position", () => {
    runTest((editor, viewModel) => {
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move left", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 3);
      assertCursor(viewModel, new Position(1, 3));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(1, 2));
    });
  });
  test("move left with surrogate pair", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 17);
      assertCursor(viewModel, new Position(3, 17));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(3, 15));
    });
  });
  test("move left goes to previous row", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 2, 1);
      assertCursor(viewModel, new Position(2, 1));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(1, 21));
    });
  });
  test("move left selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 2, 1);
      assertCursor(viewModel, new Position(2, 1));
      moveLeft(editor, viewModel, true);
      assertCursor(viewModel, new Selection(2, 1, 1, 21));
    });
  });
  test("move right on bottom right position", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 5, 2);
      assertCursor(viewModel, new Position(5, 2));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(5, 2));
    });
  });
  test("move right", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 3);
      assertCursor(viewModel, new Position(1, 3));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(1, 4));
    });
  });
  test("move right with surrogate pair", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 15);
      assertCursor(viewModel, new Position(3, 15));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(3, 17));
    });
  });
  test("move right goes to next row", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 21);
      assertCursor(viewModel, new Position(1, 21));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(2, 1));
    });
  });
  test("move right selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 21);
      assertCursor(viewModel, new Position(1, 21));
      moveRight(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 21, 2, 1));
    });
  });
  test("move down", () => {
    runTest((editor, viewModel) => {
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(2, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(3, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(4, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(5, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(5, 2));
    });
  });
  test("move down with selection", () => {
    runTest((editor, viewModel) => {
      moveDown(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 1, 2, 1));
      moveDown(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 1, 3, 1));
      moveDown(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 1, 4, 1));
      moveDown(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 1, 5, 1));
      moveDown(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 1, 5, 2));
    });
  });
  test("move down with tabs", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 5);
      assertCursor(viewModel, new Position(1, 5));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(2, 2));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(3, 5));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(4, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(5, 2));
    });
  });
  test("move up", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 5);
      assertCursor(viewModel, new Position(3, 5));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(2, 2));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 5));
    });
  });
  test("move up with selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 5);
      assertCursor(viewModel, new Position(3, 5));
      moveUp(editor, viewModel, true);
      assertCursor(viewModel, new Selection(3, 5, 2, 2));
      moveUp(editor, viewModel, true);
      assertCursor(viewModel, new Selection(3, 5, 1, 5));
    });
  });
  test("move up and down with tabs", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 5);
      assertCursor(viewModel, new Position(1, 5));
      moveDown(editor, viewModel);
      moveDown(editor, viewModel);
      moveDown(editor, viewModel);
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(5, 2));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(4, 1));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(3, 5));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(2, 2));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 5));
    });
  });
  test("move up and down with end of lines starting from a long one", () => {
    runTest((editor, viewModel) => {
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(2, LINE2.length + 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(3, LINE3.length + 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(4, LINE4.length + 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(5, LINE5.length + 1));
      moveUp(editor, viewModel);
      moveUp(editor, viewModel);
      moveUp(editor, viewModel);
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
    });
  });
  test("issue #44465: cursor position not correct when move", () => {
    runTest((editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 5, 1, 5)]);
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(2, 2));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 5));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(2, 1));
    });
  });
  test("issue #144041: Cursor up/down works", () => {
    const model = createTextModel(
      [
        "Word1 Word2 Word3 Word4",
        "Word5 Word6 Word7 Word8"
      ].join("\n")
    );
    withTestCodeEditor(model, { wrappingIndent: "indent", wordWrap: "wordWrapColumn", wordWrapColumn: 20 }, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1)]);
      const cursorPositions = [];
      function reportCursorPosition() {
        cursorPositions.push(viewModel.getCursorStates()[0].viewState.position.toString());
      }
      __name(reportCursorPosition, "reportCursorPosition");
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      assert.deepStrictEqual(cursorPositions, [
        "(1,1)",
        "(2,5)",
        "(3,1)",
        "(4,5)",
        "(4,10)",
        "(3,1)",
        "(2,5)",
        "(1,1)",
        "(1,1)"
      ]);
    });
    model.dispose();
  });
  test("issue #140195: Cursor up/down makes progress", () => {
    const model = createTextModel(
      [
        "Word1 Word2 Word3 Word4",
        "Word5 Word6 Word7 Word8"
      ].join("\n")
    );
    withTestCodeEditor(model, { wrappingIndent: "indent", wordWrap: "wordWrapColumn", wordWrapColumn: 20 }, (editor, viewModel) => {
      editor.changeDecorations((changeAccessor) => {
        changeAccessor.deltaDecorations([], [
          {
            range: new Range(1, 22, 1, 22),
            options: {
              showIfCollapsed: true,
              description: "test",
              after: {
                content: "some very very very very very very very very long text"
              }
            }
          }
        ]);
      });
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1)]);
      const cursorPositions = [];
      function reportCursorPosition() {
        cursorPositions.push(viewModel.getCursorStates()[0].viewState.position.toString());
      }
      __name(reportCursorPosition, "reportCursorPosition");
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorDown.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      CoreNavigationCommands.CursorUp.runEditorCommand(null, editor, null);
      reportCursorPosition();
      assert.deepStrictEqual(cursorPositions, [
        "(1,1)",
        "(2,5)",
        "(5,19)",
        "(6,1)",
        "(7,5)",
        "(6,1)",
        "(2,8)",
        "(1,1)",
        "(1,1)"
      ]);
    });
    model.dispose();
  });
  test("move to beginning of line", () => {
    runTest((editor, viewModel) => {
      moveToBeginningOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, 6));
      moveToBeginningOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move to beginning of line from within line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 8);
      moveToBeginningOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, 6));
      moveToBeginningOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move to beginning of line from whitespace at beginning of line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 2);
      moveToBeginningOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, 6));
      moveToBeginningOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move to beginning of line from within line selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 8);
      moveToBeginningOfLine(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 8, 1, 6));
      moveToBeginningOfLine(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 8, 1, 1));
    });
  });
  test("move to beginning of line with selection multiline forward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 8);
      moveTo(editor, viewModel, 3, 9, true);
      moveToBeginningOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 5, 3, 5));
    });
  });
  test("move to beginning of line with selection multiline backward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 9);
      moveTo(editor, viewModel, 1, 8, true);
      moveToBeginningOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(1, 6, 1, 6));
    });
  });
  test("move to beginning of line with selection single line forward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 2);
      moveTo(editor, viewModel, 3, 9, true);
      moveToBeginningOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 5, 3, 5));
    });
  });
  test("move to beginning of line with selection single line backward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 9);
      moveTo(editor, viewModel, 3, 2, true);
      moveToBeginningOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 5, 3, 5));
    });
  });
  test('issue #15401: "End" key is behaving weird when text is selected part 1', () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 8);
      moveTo(editor, viewModel, 3, 9, true);
      moveToBeginningOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 5, 3, 5));
    });
  });
  test("issue #17011: Shift+home/end now go to the end of the selection start's line, not the selection's end", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 8);
      moveTo(editor, viewModel, 3, 9, true);
      moveToBeginningOfLine(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 8, 3, 5));
    });
  });
  test("move to end of line", () => {
    runTest((editor, viewModel) => {
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
    });
  });
  test("move to end of line from within line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 6);
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
    });
  });
  test("move to end of line from whitespace at end of line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 20);
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
      moveToEndOfLine(editor, viewModel);
      assertCursor(viewModel, new Position(1, LINE1.length + 1));
    });
  });
  test("move to end of line from within line selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 6);
      moveToEndOfLine(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 6, 1, LINE1.length + 1));
      moveToEndOfLine(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 6, 1, LINE1.length + 1));
    });
  });
  test("move to end of line with selection multiline forward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 1);
      moveTo(editor, viewModel, 3, 9, true);
      moveToEndOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 17, 3, 17));
    });
  });
  test("move to end of line with selection multiline backward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 9);
      moveTo(editor, viewModel, 1, 1, true);
      moveToEndOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(1, 21, 1, 21));
    });
  });
  test("move to end of line with selection single line forward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 1);
      moveTo(editor, viewModel, 3, 9, true);
      moveToEndOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 17, 3, 17));
    });
  });
  test("move to end of line with selection single line backward", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 9);
      moveTo(editor, viewModel, 3, 1, true);
      moveToEndOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 17, 3, 17));
    });
  });
  test('issue #15401: "End" key is behaving weird when text is selected part 2', () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 1);
      moveTo(editor, viewModel, 3, 9, true);
      moveToEndOfLine(editor, viewModel, false);
      assertCursor(viewModel, new Selection(3, 17, 3, 17));
    });
  });
  test("move to beginning of buffer", () => {
    runTest((editor, viewModel) => {
      moveToBeginningOfBuffer(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move to beginning of buffer from within first line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 3);
      moveToBeginningOfBuffer(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move to beginning of buffer from within another line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 3);
      moveToBeginningOfBuffer(editor, viewModel);
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("move to beginning of buffer from within first line selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 1, 3);
      moveToBeginningOfBuffer(editor, viewModel, true);
      assertCursor(viewModel, new Selection(1, 3, 1, 1));
    });
  });
  test("move to beginning of buffer from within another line selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 3);
      moveToBeginningOfBuffer(editor, viewModel, true);
      assertCursor(viewModel, new Selection(3, 3, 1, 1));
    });
  });
  test("move to end of buffer", () => {
    runTest((editor, viewModel) => {
      moveToEndOfBuffer(editor, viewModel);
      assertCursor(viewModel, new Position(5, LINE5.length + 1));
    });
  });
  test("move to end of buffer from within last line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 5, 1);
      moveToEndOfBuffer(editor, viewModel);
      assertCursor(viewModel, new Position(5, LINE5.length + 1));
    });
  });
  test("move to end of buffer from within another line", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 3);
      moveToEndOfBuffer(editor, viewModel);
      assertCursor(viewModel, new Position(5, LINE5.length + 1));
    });
  });
  test("move to end of buffer from within last line selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 5, 1);
      moveToEndOfBuffer(editor, viewModel, true);
      assertCursor(viewModel, new Selection(5, 1, 5, LINE5.length + 1));
    });
  });
  test("move to end of buffer from within another line selection", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 3, 3);
      moveToEndOfBuffer(editor, viewModel, true);
      assertCursor(viewModel, new Selection(3, 3, 5, LINE5.length + 1));
    });
  });
  test("select all", () => {
    runTest((editor, viewModel) => {
      CoreNavigationCommands.SelectAll.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, new Selection(1, 1, 5, LINE5.length + 1));
    });
  });
  test("no move doesn't trigger event", () => {
    runTest((editor, viewModel) => {
      const disposable = viewModel.onEvent((e) => {
        assert.ok(false, "was not expecting event");
      });
      moveTo(editor, viewModel, 1, 1);
      disposable.dispose();
    });
  });
  test("move eventing", () => {
    runTest((editor, viewModel) => {
      let events = 0;
      const disposable = viewModel.onEvent((e) => {
        if (e.kind === OutgoingViewModelEventKind.CursorStateChanged) {
          events++;
          assert.deepStrictEqual(e.selections, [new Selection(1, 2, 1, 2)]);
        }
      });
      moveTo(editor, viewModel, 1, 2);
      assert.strictEqual(events, 1, "receives 1 event");
      disposable.dispose();
    });
  });
  test("move in selection mode eventing", () => {
    runTest((editor, viewModel) => {
      let events = 0;
      const disposable = viewModel.onEvent((e) => {
        if (e.kind === OutgoingViewModelEventKind.CursorStateChanged) {
          events++;
          assert.deepStrictEqual(e.selections, [new Selection(1, 1, 1, 2)]);
        }
      });
      moveTo(editor, viewModel, 1, 2, true);
      assert.strictEqual(events, 1, "receives 1 event");
      disposable.dispose();
    });
  });
  test("saveState & restoreState", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 2, 1, true);
      assertCursor(viewModel, new Selection(1, 1, 2, 1));
      const savedState = JSON.stringify(viewModel.saveCursorState());
      moveTo(editor, viewModel, 1, 1, false);
      assertCursor(viewModel, new Position(1, 1));
      viewModel.restoreCursorState(JSON.parse(savedState));
      assertCursor(viewModel, new Selection(1, 1, 2, 1));
    });
  });
  test("Independent model edit 1", () => {
    runTest((editor, viewModel) => {
      moveTo(editor, viewModel, 2, 16, true);
      editor.getModel().applyEdits([EditOperation.delete(new Range(2, 1, 2, 2))]);
      assertCursor(viewModel, new Selection(1, 1, 2, 15));
    });
  });
  test("column select 1", () => {
    withTestCodeEditor([
      "	private compute(a:number): boolean {",
      "		if (a + 3 === 0 || a + 5 === 0) {",
      "			return false;",
      "		}",
      "	}"
    ], {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 7, false);
      assertCursor(viewModel, new Position(1, 7));
      CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
        position: new Position(4, 4),
        viewPosition: new Position(4, 4),
        mouseColumn: 15,
        doColumnSelect: true
      });
      const expectedSelections = [
        new Selection(1, 7, 1, 12),
        new Selection(2, 4, 2, 9),
        new Selection(3, 3, 3, 6),
        new Selection(4, 4, 4, 4)
      ];
      assertCursor(viewModel, expectedSelections);
    });
  });
  test("grapheme breaking", () => {
    withTestCodeEditor([
      "abcabc",
      "a\u0303a\u0303a\u0303a\u0303a\u0303a\u0303",
      "\u8FBB\u{E0100}\u8FBB\u{E0100}\u8FBB\u{E0100}",
      "\u0BAA\u0BC1"
    ], {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(2, 1, 2, 1)]);
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(2, 3));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(2, 1));
      viewModel.setSelections("test", [new Selection(3, 1, 3, 1)]);
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(3, 4));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(3, 1));
      viewModel.setSelections("test", [new Selection(4, 1, 4, 1)]);
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Position(4, 3));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Position(4, 1));
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(2, 5));
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Position(3, 4));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(2, 5));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Position(1, 3));
    });
  });
  test("issue #4905 - column select is biased to the right", () => {
    withTestCodeEditor([
      'var gulp = require("gulp");',
      'var path = require("path");',
      'var rimraf = require("rimraf");',
      'var isarray = require("isarray");',
      'var merge = require("merge-stream");',
      'var concat = require("gulp-concat");',
      'var newer = require("gulp-newer");'
    ].join("\n"), {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 4, false);
      assertCursor(viewModel, new Position(1, 4));
      CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
        position: new Position(4, 1),
        viewPosition: new Position(4, 1),
        mouseColumn: 1,
        doColumnSelect: true
      });
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 1),
        new Selection(2, 4, 2, 1),
        new Selection(3, 4, 3, 1),
        new Selection(4, 4, 4, 1)
      ]);
    });
  });
  test("issue #20087: column select with mouse", () => {
    withTestCodeEditor([
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" Key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SoMEKEy" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" valuE="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="00X"/>'
    ].join("\n"), {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 10, 10, false);
      assertCursor(viewModel, new Position(10, 10));
      CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
        position: new Position(1, 1),
        viewPosition: new Position(1, 1),
        mouseColumn: 1,
        doColumnSelect: true
      });
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 1),
        new Selection(9, 10, 9, 1),
        new Selection(8, 10, 8, 1),
        new Selection(7, 10, 7, 1),
        new Selection(6, 10, 6, 1),
        new Selection(5, 10, 5, 1),
        new Selection(4, 10, 4, 1),
        new Selection(3, 10, 3, 1),
        new Selection(2, 10, 2, 1),
        new Selection(1, 10, 1, 1)
      ]);
      CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
        position: new Position(1, 1),
        viewPosition: new Position(1, 1),
        mouseColumn: 1,
        doColumnSelect: true
      });
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 1),
        new Selection(9, 10, 9, 1),
        new Selection(8, 10, 8, 1),
        new Selection(7, 10, 7, 1),
        new Selection(6, 10, 6, 1),
        new Selection(5, 10, 5, 1),
        new Selection(4, 10, 4, 1),
        new Selection(3, 10, 3, 1),
        new Selection(2, 10, 2, 1),
        new Selection(1, 10, 1, 1)
      ]);
    });
  });
  test("issue #20087: column select with keyboard", () => {
    withTestCodeEditor([
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" Key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SoMEKEy" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" valuE="000"/>',
      '<property id="SomeThing" key="SomeKey" value="000"/>',
      '<property id="SomeThing" key="SomeKey" value="00X"/>'
    ].join("\n"), {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 10, 10, false);
      assertCursor(viewModel, new Position(10, 10));
      CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 9)
      ]);
      CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 8)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 9)
      ]);
      CoreNavigationCommands.CursorColumnSelectUp.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 9),
        new Selection(9, 10, 9, 9)
      ]);
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(10, 10, 10, 9)
      ]);
    });
  });
  test("issue #118062: Column selection cannot select first position of a line", () => {
    withTestCodeEditor([
      "hello world"
    ].join("\n"), {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 2, false);
      assertCursor(viewModel, new Position(1, 2));
      CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 2, 1, 1)
      ]);
    });
  });
  test("column select with keyboard", () => {
    withTestCodeEditor([
      'var gulp = require("gulp");',
      'var path = require("path");',
      'var rimraf = require("rimraf");',
      'var isarray = require("isarray");',
      'var merge = require("merge-stream");',
      'var concat = require("gulp-concat");',
      'var newer = require("gulp-newer");'
    ].join("\n"), {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 4, false);
      assertCursor(viewModel, new Position(1, 4));
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 5)
      ]);
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 5),
        new Selection(2, 4, 2, 5)
      ]);
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 5),
        new Selection(2, 4, 2, 5),
        new Selection(3, 4, 3, 5)
      ]);
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 5),
        new Selection(2, 4, 2, 5),
        new Selection(3, 4, 3, 5),
        new Selection(4, 4, 4, 5),
        new Selection(5, 4, 5, 5),
        new Selection(6, 4, 6, 5),
        new Selection(7, 4, 7, 5)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 6),
        new Selection(2, 4, 2, 6),
        new Selection(3, 4, 3, 6),
        new Selection(4, 4, 4, 6),
        new Selection(5, 4, 5, 6),
        new Selection(6, 4, 6, 6),
        new Selection(7, 4, 7, 6)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 16),
        new Selection(2, 4, 2, 16),
        new Selection(3, 4, 3, 16),
        new Selection(4, 4, 4, 16),
        new Selection(5, 4, 5, 16),
        new Selection(6, 4, 6, 16),
        new Selection(7, 4, 7, 16)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 26),
        new Selection(2, 4, 2, 26),
        new Selection(3, 4, 3, 26),
        new Selection(4, 4, 4, 26),
        new Selection(5, 4, 5, 26),
        new Selection(6, 4, 6, 26),
        new Selection(7, 4, 7, 26)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 28),
        new Selection(4, 4, 4, 28),
        new Selection(5, 4, 5, 28),
        new Selection(6, 4, 6, 28),
        new Selection(7, 4, 7, 28)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 32),
        new Selection(5, 4, 5, 32),
        new Selection(6, 4, 6, 32),
        new Selection(7, 4, 7, 32)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 34),
        new Selection(5, 4, 5, 34),
        new Selection(6, 4, 6, 34),
        new Selection(7, 4, 7, 34)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 34),
        new Selection(5, 4, 5, 35),
        new Selection(6, 4, 6, 35),
        new Selection(7, 4, 7, 35)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 34),
        new Selection(5, 4, 5, 37),
        new Selection(6, 4, 6, 37),
        new Selection(7, 4, 7, 35)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 34),
        new Selection(5, 4, 5, 37),
        new Selection(6, 4, 6, 37),
        new Selection(7, 4, 7, 35)
      ]);
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 34),
        new Selection(5, 4, 5, 37),
        new Selection(6, 4, 6, 37),
        new Selection(7, 4, 7, 35)
      ]);
      CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 28),
        new Selection(2, 4, 2, 28),
        new Selection(3, 4, 3, 32),
        new Selection(4, 4, 4, 34),
        new Selection(5, 4, 5, 36),
        new Selection(6, 4, 6, 36),
        new Selection(7, 4, 7, 35)
      ]);
    });
  });
  test("setSelection / setPosition with source", () => {
    const tokenizationSupport = {
      getInitialState: /* @__PURE__ */ __name(() => NullState, "getInitialState"),
      tokenize: void 0,
      tokenizeEncoded: /* @__PURE__ */ __name((line, hasEOL, state) => {
        return new EncodedTokenizationResult(new Uint32Array(0), state);
      }, "tokenizeEncoded")
    };
    const LANGUAGE_ID = "modelModeTest1";
    const languageRegistration = TokenizationRegistry.register(LANGUAGE_ID, tokenizationSupport);
    const model = createTextModel("Just text", LANGUAGE_ID);
    withTestCodeEditor(model, {}, (editor1, cursor1) => {
      let event = void 0;
      const disposable = editor1.onDidChangeCursorPosition((e) => {
        event = e;
      });
      editor1.setSelection(new Range(1, 2, 1, 3), "navigation");
      assert.strictEqual(event.source, "navigation");
      event = void 0;
      editor1.setPosition(new Position(1, 2), "navigation");
      assert.strictEqual(event.source, "navigation");
      disposable.dispose();
    });
    languageRegistration.dispose();
    model.dispose();
  });
});
suite("Editor Controller", () => {
  const surroundingLanguageId = "surroundingLanguage";
  const indentRulesLanguageId = "indentRulesLanguage";
  const electricCharLanguageId = "electricCharLanguage";
  const autoClosingLanguageId = "autoClosingLanguage";
  let disposables;
  let instantiationService;
  let languageConfigurationService;
  let languageService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = createCodeEditorServices(disposables);
    languageConfigurationService = instantiationService.get(ILanguageConfigurationService);
    languageService = instantiationService.get(ILanguageService);
    disposables.add(languageService.registerLanguage({ id: surroundingLanguageId }));
    disposables.add(languageConfigurationService.register(surroundingLanguageId, {
      autoClosingPairs: [{ open: "(", close: ")" }]
    }));
    setupIndentRulesLanguage(indentRulesLanguageId, {
      decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
      increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
      indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
      unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
    });
    disposables.add(languageService.registerLanguage({ id: electricCharLanguageId }));
    disposables.add(languageConfigurationService.register(electricCharLanguageId, {
      __electricCharacterSupport: {
        docComment: { open: "/**", close: " */" }
      },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
      ]
    }));
    setupAutoClosingLanguage();
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function setupOnEnterLanguage(indentAction) {
    const onEnterLanguageId = "onEnterMode";
    disposables.add(languageService.registerLanguage({ id: onEnterLanguageId }));
    disposables.add(languageConfigurationService.register(onEnterLanguageId, {
      onEnterRules: [{
        beforeText: /.*/,
        action: {
          indentAction
        }
      }]
    }));
    return onEnterLanguageId;
  }
  __name(setupOnEnterLanguage, "setupOnEnterLanguage");
  function setupIndentRulesLanguage(languageId, indentationRules) {
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      indentationRules
    }));
    return languageId;
  }
  __name(setupIndentRulesLanguage, "setupIndentRulesLanguage");
  function setupAutoClosingLanguage() {
    disposables.add(languageService.registerLanguage({ id: autoClosingLanguageId }));
    disposables.add(languageConfigurationService.register(autoClosingLanguageId, {
      comments: {
        blockComment: ["/*", "*/"]
      },
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "`", close: "`", notIn: ["string", "comment"] },
        { open: "/**", close: " */", notIn: ["string"] },
        { open: "begin", close: "end", notIn: ["string"] }
      ],
      __electricCharacterSupport: {
        docComment: { open: "/**", close: " */" }
      }
    }));
  }
  __name(setupAutoClosingLanguage, "setupAutoClosingLanguage");
  function setupAutoClosingLanguageTokenization() {
    class BaseState {
      constructor(parent = null) {
        this.parent = parent;
      }
      static {
        __name(this, "BaseState");
      }
      clone() {
        return this;
      }
      equals(other) {
        if (!(other instanceof BaseState)) {
          return false;
        }
        if (!this.parent && !other.parent) {
          return true;
        }
        if (!this.parent || !other.parent) {
          return false;
        }
        return this.parent.equals(other.parent);
      }
    }
    class StringState {
      constructor(char, parentState) {
        this.char = char;
        this.parentState = parentState;
      }
      static {
        __name(this, "StringState");
      }
      clone() {
        return this;
      }
      equals(other) {
        return other instanceof StringState && this.char === other.char && this.parentState.equals(other.parentState);
      }
    }
    class BlockCommentState {
      constructor(parentState) {
        this.parentState = parentState;
      }
      static {
        __name(this, "BlockCommentState");
      }
      clone() {
        return this;
      }
      equals(other) {
        return other instanceof StringState && this.parentState.equals(other.parentState);
      }
    }
    const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(autoClosingLanguageId);
    disposables.add(TokenizationRegistry.register(autoClosingLanguageId, {
      getInitialState: /* @__PURE__ */ __name(() => new BaseState(), "getInitialState"),
      tokenize: void 0,
      tokenizeEncoded: /* @__PURE__ */ __name(function(line, hasEOL, _state) {
        let state = _state;
        const tokens = [];
        const generateToken = /* @__PURE__ */ __name((length, type, newState) => {
          if (tokens.length > 0 && tokens[tokens.length - 1].type === type) {
            tokens[tokens.length - 1].length += length;
          } else {
            tokens.push({ length, type });
          }
          line = line.substring(length);
          if (newState) {
            state = newState;
          }
        }, "generateToken");
        while (line.length > 0) {
          advance();
        }
        const result = new Uint32Array(tokens.length * 2);
        let startIndex = 0;
        for (let i = 0; i < tokens.length; i++) {
          result[2 * i] = startIndex;
          result[2 * i + 1] = encodedLanguageId << MetadataConsts.LANGUAGEID_OFFSET | tokens[i].type << MetadataConsts.TOKEN_TYPE_OFFSET;
          startIndex += tokens[i].length;
        }
        return new EncodedTokenizationResult(result, state);
        function advance() {
          if (state instanceof BaseState) {
            const m1 = line.match(/^[^'"`{}/]+/g);
            if (m1) {
              return generateToken(m1[0].length, StandardTokenType.Other);
            }
            if (/^['"`]/.test(line)) {
              return generateToken(1, StandardTokenType.String, new StringState(line.charAt(0), state));
            }
            if (/^{/.test(line)) {
              return generateToken(1, StandardTokenType.Other, new BaseState(state));
            }
            if (/^}/.test(line)) {
              return generateToken(1, StandardTokenType.Other, state.parent || new BaseState());
            }
            if (/^\/\//.test(line)) {
              return generateToken(line.length, StandardTokenType.Comment, state);
            }
            if (/^\/\*/.test(line)) {
              return generateToken(2, StandardTokenType.Comment, new BlockCommentState(state));
            }
            return generateToken(1, StandardTokenType.Other, state);
          } else if (state instanceof StringState) {
            const m1 = line.match(/^[^\\'"`\$]+/g);
            if (m1) {
              return generateToken(m1[0].length, StandardTokenType.String);
            }
            if (/^\\/.test(line)) {
              return generateToken(2, StandardTokenType.String);
            }
            if (line.charAt(0) === state.char) {
              return generateToken(1, StandardTokenType.String, state.parentState);
            }
            if (/^\$\{/.test(line)) {
              return generateToken(2, StandardTokenType.Other, new BaseState(state));
            }
            return generateToken(1, StandardTokenType.Other, state);
          } else if (state instanceof BlockCommentState) {
            const m1 = line.match(/^[^*]+/g);
            if (m1) {
              return generateToken(m1[0].length, StandardTokenType.String);
            }
            if (/^\*\//.test(line)) {
              return generateToken(2, StandardTokenType.Comment, state.parentState);
            }
            return generateToken(1, StandardTokenType.Other, state);
          } else {
            throw new Error(`unknown state`);
          }
        }
        __name(advance, "advance");
      }, "tokenizeEncoded")
    }));
  }
  __name(setupAutoClosingLanguageTokenization, "setupAutoClosingLanguageTokenization");
  function setAutoClosingLanguageEnabledSet(chars) {
    disposables.add(languageConfigurationService.register(autoClosingLanguageId, {
      autoCloseBefore: chars,
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "`", close: "`", notIn: ["string", "comment"] },
        { open: "/**", close: " */", notIn: ["string"] }
      ]
    }));
  }
  __name(setAutoClosingLanguageEnabledSet, "setAutoClosingLanguageEnabledSet");
  function createTextModel2(text, languageId = null, options = TextModel.DEFAULT_CREATION_OPTIONS, uri = null) {
    return disposables.add(instantiateTextModel(instantiationService, text, languageId, options, uri));
  }
  __name(createTextModel2, "createTextModel");
  function withTestCodeEditor2(text, options, callback) {
    let model;
    if (typeof text === "string") {
      model = createTextModel2(text);
    } else if (Array.isArray(text)) {
      model = createTextModel2(text.join("\n"));
    } else {
      model = text;
    }
    const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model, options));
    const viewModel = editor.getViewModel();
    viewModel.setHasFocus(true);
    callback(editor, viewModel);
  }
  __name(withTestCodeEditor2, "withTestCodeEditor");
  function usingCursor(opts, callback) {
    const model = createTextModel2(opts.text.join("\n"), opts.languageId, opts.modelOpts);
    const editorOptions = opts.editorOpts || {};
    withTestCodeEditor2(model, editorOptions, (editor, viewModel) => {
      callback(editor, model, viewModel);
    });
  }
  __name(usingCursor, "usingCursor");
  let AutoClosingColumnType;
  ((AutoClosingColumnType2) => {
    AutoClosingColumnType2[AutoClosingColumnType2["Normal"] = 0] = "Normal";
    AutoClosingColumnType2[AutoClosingColumnType2["Special1"] = 1] = "Special1";
    AutoClosingColumnType2[AutoClosingColumnType2["Special2"] = 2] = "Special2";
  })(AutoClosingColumnType || (AutoClosingColumnType = {}));
  function extractAutoClosingSpecialColumns(maxColumn, annotatedLine) {
    const result = [];
    for (let j = 1; j <= maxColumn; j++) {
      result[j] = 0 /* Normal */;
    }
    let column = 1;
    for (let j = 0; j < annotatedLine.length; j++) {
      if (annotatedLine.charAt(j) === "|") {
        result[column] = 1 /* Special1 */;
      } else if (annotatedLine.charAt(j) === "!") {
        result[column] = 2 /* Special2 */;
      } else {
        column++;
      }
    }
    return result;
  }
  __name(extractAutoClosingSpecialColumns, "extractAutoClosingSpecialColumns");
  function assertType(editor, model, viewModel, lineNumber, column, chr, expectedInsert, message) {
    const lineContent = model.getLineContent(lineNumber);
    const expected = lineContent.substr(0, column - 1) + expectedInsert + lineContent.substr(column - 1);
    moveTo(editor, viewModel, lineNumber, column);
    viewModel.type(chr, "keyboard");
    assert.deepStrictEqual(model.getLineContent(lineNumber), expected, message);
    model.undo();
  }
  __name(assertType, "assertType");
  test("issue microsoft/monaco-editor#443: Indentation of a single row deletes selected text in some cases", () => {
    const model = createTextModel2(
      [
        "Hello world!",
        "another line"
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 13)]);
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.deepStrictEqual(viewModel.getSelection(), new Selection(1, 1, 1, 14));
    });
  });
  test("Bug 9121: Auto indent + undo + redo is funky", () => {
    const model = createTextModel2(
      [
        ""
      ].join("\n"),
      void 0,
      {
        insertSpaces: false,
        trimAutoWhitespace: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n", "assert1");
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	", "assert2");
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\n	", "assert3");
      viewModel.type("x");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\n	x", "assert4");
      CoreNavigationCommands.CursorLeft.runCoreEditorCommand(viewModel, {});
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\n	x", "assert5");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\nx", "assert6");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	x", "assert7");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\nx", "assert8");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "x", "assert9");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\nx", "assert10");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\nx", "assert11");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\n	x", "assert12");
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	\nx", "assert13");
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\nx", "assert14");
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "x", "assert15");
    });
  });
  test("issue #23539: Setting model EOL isn't undoable", () => {
    withTestCodeEditor2([
      "Hello",
      "world"
    ], {}, (editor, viewModel) => {
      const model = editor.getModel();
      assertCursor(viewModel, new Position(1, 1));
      model.setEOL(EndOfLineSequence.LF);
      assert.strictEqual(model.getValue(), "Hello\nworld");
      model.pushEOL(EndOfLineSequence.CRLF);
      assert.strictEqual(model.getValue(), "Hello\r\nworld");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), "Hello\nworld");
    });
  });
  test("issue #47733: Undo mangles unicode characters", () => {
    const languageId = "myMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      surroundingPairs: [{ open: "%", close: "%" }]
    }));
    const model = createTextModel2("'\u{1F441}'", languageId);
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelection(new Selection(1, 1, 1, 2));
      viewModel.type("%", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "%'%\u{1F441}'", "assert1");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "'\u{1F441}'", "assert2");
    });
  });
  test("issue #46208: Allow empty selections in the undo/redo stack", () => {
    const model = createTextModel2("");
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      viewModel.type("Hello", "keyboard");
      viewModel.type(" ", "keyboard");
      viewModel.type("world", "keyboard");
      viewModel.type(" ", "keyboard");
      assert.strictEqual(model.getLineContent(1), "Hello world ");
      assertCursor(viewModel, new Position(1, 13));
      moveLeft(editor, viewModel);
      moveRight(editor, viewModel);
      model.pushEditOperations([], [EditOperation.replaceMove(new Range(1, 12, 1, 13), "")], () => []);
      assert.strictEqual(model.getLineContent(1), "Hello world");
      assertCursor(viewModel, new Position(1, 12));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello world ");
      assertCursor(viewModel, new Selection(1, 13, 1, 13));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello world");
      assertCursor(viewModel, new Position(1, 12));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello");
      assertCursor(viewModel, new Position(1, 6));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "");
      assertCursor(viewModel, new Position(1, 1));
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello");
      assertCursor(viewModel, new Position(1, 6));
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello world");
      assertCursor(viewModel, new Position(1, 12));
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello world ");
      assertCursor(viewModel, new Position(1, 13));
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello world");
      assertCursor(viewModel, new Position(1, 12));
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "Hello world");
      assertCursor(viewModel, new Position(1, 12));
    });
  });
  test("bug #16815:Shift+Tab doesn't go back to tabstop", () => {
    const languageId = setupOnEnterLanguage(IndentAction.IndentOutdent);
    const model = createTextModel2(
      [
        "     function baz() {"
      ].join("\n"),
      languageId
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 6, false);
      assertCursor(viewModel, new Selection(1, 6, 1, 6));
      CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    function baz() {");
      assertCursor(viewModel, new Selection(1, 5, 1, 5));
    });
  });
  test("Bug #18293:[regression][editor] Can't outdent whitespace line", () => {
    const model = createTextModel2(
      [
        "      "
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 7, false);
      assertCursor(viewModel, new Selection(1, 7, 1, 7));
      CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    ");
      assertCursor(viewModel, new Selection(1, 5, 1, 5));
    });
  });
  test("issue #95591: Unindenting moves cursor to beginning of line", () => {
    const model = createTextModel2(
      [
        "        "
      ].join("\n")
    );
    withTestCodeEditor2(model, { useTabStops: false }, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 9, false);
      assertCursor(viewModel, new Selection(1, 9, 1, 9));
      CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    ");
      assertCursor(viewModel, new Selection(1, 5, 1, 5));
    });
  });
  test("Bug #16657: [editor] Tab on empty line of zero indentation moves cursor to position (1,1)", () => {
    const model = createTextModel2(
      [
        "function baz() {",
        "	function hello() { // something here",
        "	",
        "",
        "	}",
        "}",
        ""
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 7, 1, false);
      assertCursor(viewModel, new Selection(7, 1, 7, 1));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(7), "	");
      assertCursor(viewModel, new Selection(7, 2, 7, 2));
    });
  });
  test("bug #16740: [editor] Cut line doesn't quite cut the last line", () => {
    withTestCodeEditor2([
      "asdasd",
      "qwerty"
    ], {}, (editor, viewModel) => {
      const model = editor.getModel();
      moveTo(editor, viewModel, 2, 1, false);
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      viewModel.cut("keyboard");
      assert.strictEqual(model.getLineCount(), 1);
      assert.strictEqual(model.getLineContent(1), "asdasd");
    });
    withTestCodeEditor2([
      "asdasd",
      ""
    ], {}, (editor, viewModel) => {
      const model = editor.getModel();
      moveTo(editor, viewModel, 2, 1, false);
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      viewModel.cut("keyboard");
      assert.strictEqual(model.getLineCount(), 1);
      assert.strictEqual(model.getLineContent(1), "asdasd");
      viewModel.cut("keyboard");
      assert.strictEqual(model.getLineCount(), 1);
      assert.strictEqual(model.getLineContent(1), "");
    });
  });
  test("issue #128602: When cutting multiple lines (ctrl x), the last line will not be erased", () => {
    withTestCodeEditor2([
      "a1",
      "a2",
      "a3"
    ], {}, (editor, viewModel) => {
      const model = editor.getModel();
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 1),
        new Selection(2, 1, 2, 1),
        new Selection(3, 1, 3, 1)
      ]);
      viewModel.cut("keyboard");
      assert.strictEqual(model.getLineCount(), 1);
      assert.strictEqual(model.getLineContent(1), "");
    });
  });
  test("Bug #11476: Double bracket surrounding + undo is broken", () => {
    usingCursor({
      text: [
        "hello"
      ],
      languageId: surroundingLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 3, false);
      moveTo(editor, viewModel, 1, 5, true);
      assertCursor(viewModel, new Selection(1, 3, 1, 5));
      viewModel.type("(", "keyboard");
      assertCursor(viewModel, new Selection(1, 4, 1, 6));
      viewModel.type("(", "keyboard");
      assertCursor(viewModel, new Selection(1, 5, 1, 7));
    });
  });
  test("issue #1140: Backspace stops prematurely", () => {
    const model = createTextModel2(
      [
        "function baz() {",
        "  return 1;",
        "};"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 3, 2, false);
      moveTo(editor, viewModel, 1, 14, true);
      assertCursor(viewModel, new Selection(3, 2, 1, 14));
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assertCursor(viewModel, new Selection(1, 14, 1, 14));
      assert.strictEqual(model.getLineCount(), 1);
      assert.strictEqual(model.getLineContent(1), "function baz(;");
    });
  });
  test("issue #10212: Pasting entire line does not replace selection", () => {
    usingCursor({
      text: [
        "line1",
        "line2"
      ]
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 1, false);
      moveTo(editor, viewModel, 2, 6, true);
      viewModel.paste("line1\n", true);
      assert.strictEqual(model.getLineContent(1), "line1");
      assert.strictEqual(model.getLineContent(2), "line1");
      assert.strictEqual(model.getLineContent(3), "");
    });
  });
  test("issue #74722: Pasting whole line does not replace selection", () => {
    usingCursor({
      text: [
        "line1",
        "line sel 2",
        "line3"
      ]
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(2, 6, 2, 9)]);
      viewModel.paste("line1\n", true);
      assert.strictEqual(model.getLineContent(1), "line1");
      assert.strictEqual(model.getLineContent(2), "line line1");
      assert.strictEqual(model.getLineContent(3), " 2");
      assert.strictEqual(model.getLineContent(4), "line3");
    });
  });
  test("issue #4996: Multiple cursor paste pastes contents of all cursors", () => {
    usingCursor({
      text: [
        "line1",
        "line2",
        "line3"
      ]
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1), new Selection(2, 1, 2, 1)]);
      viewModel.paste(
        "a\nb\nc\nd",
        false,
        [
          "a\nb",
          "c\nd"
        ]
      );
      assert.strictEqual(model.getValue(), [
        "a",
        "bline1",
        "c",
        "dline2",
        "line3"
      ].join("\n"));
    });
  });
  test("issue #16155: Paste into multiple cursors has edge case when number of lines equals number of cursors - 1", () => {
    usingCursor({
      text: [
        "test",
        "test",
        "test",
        "test"
      ]
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 5),
        new Selection(2, 1, 2, 5),
        new Selection(3, 1, 3, 5),
        new Selection(4, 1, 4, 5)
      ]);
      viewModel.paste(
        "aaa\nbbb\nccc\n",
        false,
        null
      );
      assert.strictEqual(model.getValue(), [
        "aaa",
        "bbb",
        "ccc",
        "",
        "aaa",
        "bbb",
        "ccc",
        "",
        "aaa",
        "bbb",
        "ccc",
        "",
        "aaa",
        "bbb",
        "ccc",
        ""
      ].join("\n"));
    });
  });
  test("issue #43722: Multiline paste doesn't work anymore", () => {
    usingCursor({
      text: [
        "test",
        "test",
        "test",
        "test"
      ]
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 5),
        new Selection(2, 1, 2, 5),
        new Selection(3, 1, 3, 5),
        new Selection(4, 1, 4, 5)
      ]);
      viewModel.paste(
        "aaa\r\nbbb\r\nccc\r\nddd\r\n",
        false,
        null
      );
      assert.strictEqual(model.getValue(), [
        "aaa",
        "bbb",
        "ccc",
        "ddd"
      ].join("\n"));
    });
  });
  test("issue #46440: (1) Pasting a multi-line selection pastes entire selection into every insertion point", () => {
    usingCursor({
      text: [
        "line1",
        "line2",
        "line3"
      ]
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1), new Selection(2, 1, 2, 1), new Selection(3, 1, 3, 1)]);
      viewModel.paste(
        "a\nb\nc",
        false,
        null
      );
      assert.strictEqual(model.getValue(), [
        "aline1",
        "bline2",
        "cline3"
      ].join("\n"));
    });
  });
  test("issue #46440: (2) Pasting a multi-line selection pastes entire selection into every insertion point", () => {
    usingCursor({
      text: [
        "line1",
        "line2",
        "line3"
      ]
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1), new Selection(2, 1, 2, 1), new Selection(3, 1, 3, 1)]);
      viewModel.paste(
        "a\nb\nc\n",
        false,
        null
      );
      assert.strictEqual(model.getValue(), [
        "aline1",
        "bline2",
        "cline3"
      ].join("\n"));
    });
  });
  test("issue #3071: Investigate why undo stack gets corrupted", () => {
    const model = createTextModel2(
      [
        "some lines",
        "and more lines",
        "just some text"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 1, false);
      moveTo(editor, viewModel, 3, 4, true);
      let isFirst = true;
      const disposable = model.onDidChangeContent(() => {
        if (isFirst) {
          isFirst = false;
          viewModel.type("	", "keyboard");
        }
      });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), [
        "	 just some text"
      ].join("\n"), "001");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), [
        "    some lines",
        "    and more lines",
        "    just some text"
      ].join("\n"), "002");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), [
        "some lines",
        "and more lines",
        "just some text"
      ].join("\n"), "003");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), [
        "some lines",
        "and more lines",
        "just some text"
      ].join("\n"), "004");
      disposable.dispose();
    });
  });
  test("issue #12950: Cannot Double Click To Insert Emoji Using OSX Emoji Panel", () => {
    usingCursor({
      text: [
        "some lines",
        "and more lines",
        "just some text"
      ],
      languageId: null
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 1, false);
      viewModel.type("\u{1F60D}", "keyboard");
      assert.strictEqual(model.getValue(), [
        "some lines",
        "and more lines",
        "\u{1F60D}just some text"
      ].join("\n"));
    });
  });
  test("issue #3463: pressing tab adds spaces, but not as many as for a tab", () => {
    const model = createTextModel2(
      [
        "function a() {",
        "	var a = {",
        "		x: 3",
        "	};",
        "}"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 3, 2, false);
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(3), "	    	x: 3");
    });
  });
  test("issue #4312: trying to type a tab character over a sequence of spaces results in unexpected behaviour", () => {
    const model = createTextModel2(
      [
        "var foo = 123;       // this is a comment",
        "var bar = 4;       // another comment"
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 15, false);
      moveTo(editor, viewModel, 1, 22, true);
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "var foo = 123;	// this is a comment");
    });
  });
  test("issue #832: word right", () => {
    usingCursor({
      text: [
        "   /* Just some   more   text a+= 3 +5-3 + 7 */  "
      ]
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 1, false);
      function assertWordRight(col, expectedCol) {
        const args = {
          position: {
            lineNumber: 1,
            column: col
          }
        };
        if (col === 1) {
          CoreNavigationCommands.WordSelect.runCoreEditorCommand(viewModel, args);
        } else {
          CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(viewModel, args);
        }
        assert.strictEqual(viewModel.getSelection().startColumn, 1, "TEST FOR " + col);
        assert.strictEqual(viewModel.getSelection().endColumn, expectedCol, "TEST FOR " + col);
      }
      __name(assertWordRight, "assertWordRight");
      assertWordRight(1, "   ".length + 1);
      assertWordRight(2, "   ".length + 1);
      assertWordRight(3, "   ".length + 1);
      assertWordRight(4, "   ".length + 1);
      assertWordRight(5, "   /".length + 1);
      assertWordRight(6, "   /*".length + 1);
      assertWordRight(7, "   /* ".length + 1);
      assertWordRight(8, "   /* Just".length + 1);
      assertWordRight(9, "   /* Just".length + 1);
      assertWordRight(10, "   /* Just".length + 1);
      assertWordRight(11, "   /* Just".length + 1);
      assertWordRight(12, "   /* Just ".length + 1);
      assertWordRight(13, "   /* Just some".length + 1);
      assertWordRight(14, "   /* Just some".length + 1);
      assertWordRight(15, "   /* Just some".length + 1);
      assertWordRight(16, "   /* Just some".length + 1);
      assertWordRight(17, "   /* Just some ".length + 1);
      assertWordRight(18, "   /* Just some  ".length + 1);
      assertWordRight(19, "   /* Just some   ".length + 1);
      assertWordRight(20, "   /* Just some   more".length + 1);
      assertWordRight(21, "   /* Just some   more".length + 1);
      assertWordRight(22, "   /* Just some   more".length + 1);
      assertWordRight(23, "   /* Just some   more".length + 1);
      assertWordRight(24, "   /* Just some   more ".length + 1);
      assertWordRight(25, "   /* Just some   more  ".length + 1);
      assertWordRight(26, "   /* Just some   more   ".length + 1);
      assertWordRight(27, "   /* Just some   more   text".length + 1);
      assertWordRight(28, "   /* Just some   more   text".length + 1);
      assertWordRight(29, "   /* Just some   more   text".length + 1);
      assertWordRight(30, "   /* Just some   more   text".length + 1);
      assertWordRight(31, "   /* Just some   more   text ".length + 1);
      assertWordRight(32, "   /* Just some   more   text a".length + 1);
      assertWordRight(33, "   /* Just some   more   text a+".length + 1);
      assertWordRight(34, "   /* Just some   more   text a+=".length + 1);
      assertWordRight(35, "   /* Just some   more   text a+= ".length + 1);
      assertWordRight(36, "   /* Just some   more   text a+= 3".length + 1);
      assertWordRight(37, "   /* Just some   more   text a+= 3 ".length + 1);
      assertWordRight(38, "   /* Just some   more   text a+= 3 +".length + 1);
      assertWordRight(39, "   /* Just some   more   text a+= 3 +5".length + 1);
      assertWordRight(40, "   /* Just some   more   text a+= 3 +5-".length + 1);
      assertWordRight(41, "   /* Just some   more   text a+= 3 +5-3".length + 1);
      assertWordRight(42, "   /* Just some   more   text a+= 3 +5-3 ".length + 1);
      assertWordRight(43, "   /* Just some   more   text a+= 3 +5-3 +".length + 1);
      assertWordRight(44, "   /* Just some   more   text a+= 3 +5-3 + ".length + 1);
      assertWordRight(45, "   /* Just some   more   text a+= 3 +5-3 + 7".length + 1);
      assertWordRight(46, "   /* Just some   more   text a+= 3 +5-3 + 7 ".length + 1);
      assertWordRight(47, "   /* Just some   more   text a+= 3 +5-3 + 7 *".length + 1);
      assertWordRight(48, "   /* Just some   more   text a+= 3 +5-3 + 7 */".length + 1);
      assertWordRight(49, "   /* Just some   more   text a+= 3 +5-3 + 7 */ ".length + 1);
      assertWordRight(50, "   /* Just some   more   text a+= 3 +5-3 + 7 */  ".length + 1);
    });
  });
  test("issue #33788: Wrong cursor position when double click to select a word", () => {
    const model = createTextModel2(
      [
        "Just some text"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      CoreNavigationCommands.WordSelect.runCoreEditorCommand(viewModel, { position: new Position(1, 8) });
      assert.deepStrictEqual(viewModel.getSelection(), new Selection(1, 6, 1, 10));
      CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(viewModel, { position: new Position(1, 8) });
      assert.deepStrictEqual(viewModel.getSelection(), new Selection(1, 6, 1, 10));
    });
  });
  test("issue #12887: Double-click highlighting separating white space", () => {
    const model = createTextModel2(
      [
        "abc def"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      CoreNavigationCommands.WordSelect.runCoreEditorCommand(viewModel, { position: new Position(1, 5) });
      assert.deepStrictEqual(viewModel.getSelection(), new Selection(1, 5, 1, 8));
    });
  });
  test("issue #9675: Undo/Redo adds a stop in between CHN Characters", () => {
    withTestCodeEditor2([], {}, (editor, viewModel) => {
      const model = editor.getModel();
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("\uFF53", "keyboard");
      viewModel.compositionType("\u305B", 1, 0, 0);
      viewModel.compositionType("\u305B\uFF4E", 1, 0, 0);
      viewModel.compositionType("\u305B\u3093", 2, 0, 0);
      viewModel.compositionType("\u305B\u3093\uFF53", 2, 0, 0);
      viewModel.compositionType("\u305B\u3093\u305B", 3, 0, 0);
      viewModel.compositionType("\u305B\u3093\u305B", 3, 0, 0);
      viewModel.compositionType("\u305B\u3093\u305B\u3044", 3, 0, 0);
      viewModel.compositionType("\u305B\u3093\u305B\u3044", 4, 0, 0);
      viewModel.compositionType("\u305B\u3093\u305B\u3044", 4, 0, 0);
      viewModel.compositionType("\u305B\u3093\u305B\u3044", 4, 0, 0);
      assert.strictEqual(model.getLineContent(1), "\u305B\u3093\u305B\u3044");
      assertCursor(viewModel, new Position(1, 5));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "");
      assertCursor(viewModel, new Position(1, 1));
    });
  });
  test("issue #23983: Calling model.setEOL does not reset cursor position", () => {
    usingCursor({
      text: [
        "first line",
        "second line"
      ]
    }, (editor, model, viewModel) => {
      model.setEOL(EndOfLineSequence.CRLF);
      viewModel.setSelections("test", [new Selection(2, 2, 2, 2)]);
      model.setEOL(EndOfLineSequence.LF);
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
    });
  });
  test("issue #23983: Calling model.setValue() resets cursor position", () => {
    usingCursor({
      text: [
        "first line",
        "second line"
      ]
    }, (editor, model, viewModel) => {
      model.setEOL(EndOfLineSequence.CRLF);
      viewModel.setSelections("test", [new Selection(2, 2, 2, 2)]);
      model.setValue([
        "different first line",
        "different second line",
        "new third line"
      ].join("\n"));
      assertCursor(viewModel, new Selection(1, 1, 1, 1));
    });
  });
  test("issue #36740: wordwrap creates an extra step / character at the wrapping point", () => {
    withTestCodeEditor2([
      [
        "Lorem ipsum ",
        "dolor sit amet ",
        "consectetur ",
        "adipiscing elit"
      ].join("")
    ], { wordWrap: "wordWrapColumn", wordWrapColumn: 16 }, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 7, 1, 7)]);
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 9, 1, 9));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 10, 1, 10));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 11, 1, 11));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 13, 1, 13));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 14, 1, 14));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 13, 1, 13));
      moveLeft(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
    });
  });
  test("issue #110376: multiple selections with wordwrap behave differently", () => {
    withTestCodeEditor2([
      [
        "just a sentence. just a ",
        "sentence. just a sentence."
      ].join("")
    ], { wordWrap: "wordWrapColumn", wordWrapColumn: 25 }, (editor, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 16),
        new Selection(1, 18, 1, 33),
        new Selection(1, 35, 1, 50)
      ]);
      moveLeft(editor, viewModel);
      assertCursor(viewModel, [
        new Selection(1, 1, 1, 1),
        new Selection(1, 18, 1, 18),
        new Selection(1, 35, 1, 35)
      ]);
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 16),
        new Selection(1, 18, 1, 33),
        new Selection(1, 35, 1, 50)
      ]);
      moveRight(editor, viewModel);
      assertCursor(viewModel, [
        new Selection(1, 16, 1, 16),
        new Selection(1, 33, 1, 33),
        new Selection(1, 50, 1, 50)
      ]);
    });
  });
  test("issue #98320: Multi-Cursor, Wrap lines and cursorSelectRight ==> cursors out of sync", () => {
    withTestCodeEditor2([
      [
        "lorem_ipsum-1993x11x13",
        "dolor_sit_amet-1998x04x27",
        "consectetur-2007x10x08",
        "adipiscing-2012x07x27",
        "elit-2015x02x27"
      ].join("\n")
    ], { wordWrap: "wordWrapColumn", wordWrapColumn: 16 }, (editor, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 13, 1, 13),
        new Selection(2, 16, 2, 16),
        new Selection(3, 13, 3, 13),
        new Selection(4, 12, 4, 12),
        new Selection(5, 6, 5, 6)
      ]);
      assertCursor(viewModel, [
        new Selection(1, 13, 1, 13),
        new Selection(2, 16, 2, 16),
        new Selection(3, 13, 3, 13),
        new Selection(4, 12, 4, 12),
        new Selection(5, 6, 5, 6)
      ]);
      moveRight(editor, viewModel, true);
      assertCursor(viewModel, [
        new Selection(1, 13, 1, 14),
        new Selection(2, 16, 2, 17),
        new Selection(3, 13, 3, 14),
        new Selection(4, 12, 4, 13),
        new Selection(5, 6, 5, 7)
      ]);
      moveRight(editor, viewModel, true);
      assertCursor(viewModel, [
        new Selection(1, 13, 1, 15),
        new Selection(2, 16, 2, 18),
        new Selection(3, 13, 3, 15),
        new Selection(4, 12, 4, 14),
        new Selection(5, 6, 5, 8)
      ]);
      moveRight(editor, viewModel, true);
      assertCursor(viewModel, [
        new Selection(1, 13, 1, 16),
        new Selection(2, 16, 2, 19),
        new Selection(3, 13, 3, 16),
        new Selection(4, 12, 4, 15),
        new Selection(5, 6, 5, 9)
      ]);
      moveRight(editor, viewModel, true);
      assertCursor(viewModel, [
        new Selection(1, 13, 1, 17),
        new Selection(2, 16, 2, 20),
        new Selection(3, 13, 3, 17),
        new Selection(4, 12, 4, 16),
        new Selection(5, 6, 5, 10)
      ]);
    });
  });
  test("issue #41573 - delete across multiple lines does not shrink the selection when word wraps", () => {
    withTestCodeEditor2([
      "Authorization: 'Bearer pHKRfCTFSnGxs6akKlb9ddIXcca0sIUSZJutPHYqz7vEeHdMTMh0SGN0IGU3a0n59DXjTLRsj5EJ2u33qLNIFi9fk5XF8pK39PndLYUZhPt4QvHGLScgSkK0L4gwzkzMloTQPpKhqiikiIOvyNNSpd2o8j29NnOmdTUOKi9DVt74PD2ohKxyOrWZ6oZprTkb3eKajcpnS0LABKfaw2rmv4',"
    ].join("\n"), { wordWrap: "wordWrapColumn", wordWrapColumn: 100 }, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 43, false);
      moveTo(editor, viewModel, 1, 147, true);
      assertCursor(viewModel, new Selection(1, 43, 1, 147));
      editor.getModel().applyEdits([{
        range: new Range(1, 1, 1, 43),
        text: ""
      }]);
      assertCursor(viewModel, new Selection(1, 1, 1, 105));
    });
  });
  test("issue #22717: Moving text cursor cause an incorrect position in Chinese", () => {
    withTestCodeEditor2([
      [
        "\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u5341",
        "12345678901234567890"
      ].join("\n")
    ], {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 5, 1, 5)]);
      moveDown(editor, viewModel);
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(2, 10, 2, 10));
      moveRight(editor, viewModel);
      assertCursor(viewModel, new Selection(2, 11, 2, 11));
      moveUp(editor, viewModel);
      assertCursor(viewModel, new Selection(1, 6, 1, 6));
    });
  });
  test("issue #112301: new stickyTabStops feature interferes with word wrap", () => {
    withTestCodeEditor2([
      [
        "function hello() {",
        "        console.log(`this is a long console message`)",
        "}"
      ].join("\n")
    ], { wordWrap: "wordWrapColumn", wordWrapColumn: 32, stickyTabStops: true }, (editor, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(2, 31, 2, 31)
      ]);
      moveRight(editor, viewModel, false);
      assertCursor(viewModel, new Position(2, 32));
      moveRight(editor, viewModel, false);
      assertCursor(viewModel, new Position(2, 33));
      moveRight(editor, viewModel, false);
      assertCursor(viewModel, new Position(2, 34));
      moveLeft(editor, viewModel, false);
      assertCursor(viewModel, new Position(2, 33));
      moveLeft(editor, viewModel, false);
      assertCursor(viewModel, new Position(2, 32));
      moveLeft(editor, viewModel, false);
      assertCursor(viewModel, new Position(2, 31));
    });
  });
  test("issue #44805: Should not be able to undo in readonly editor", () => {
    const model = createTextModel2(
      [
        ""
      ].join("\n")
    );
    withTestCodeEditor2(model, { readOnly: true }, (editor, viewModel) => {
      model.pushEditOperations([new Selection(1, 1, 1, 1)], [{
        range: new Range(1, 1, 1, 1),
        text: "Hello world!"
      }], () => [new Selection(1, 1, 1, 1)]);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "Hello world!");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "Hello world!");
    });
  });
  test("issue #46314: ViewModel is out of sync with Model!", () => {
    const tokenizationSupport = {
      getInitialState: /* @__PURE__ */ __name(() => NullState, "getInitialState"),
      tokenize: void 0,
      tokenizeEncoded: /* @__PURE__ */ __name((line, hasEOL, state) => {
        return new EncodedTokenizationResult(new Uint32Array(0), state);
      }, "tokenizeEncoded")
    };
    const LANGUAGE_ID = "modelModeTest1";
    const languageRegistration = TokenizationRegistry.register(LANGUAGE_ID, tokenizationSupport);
    const model = createTextModel2("Just text", LANGUAGE_ID);
    withTestCodeEditor2(model, {}, (editor1, cursor1) => {
      withTestCodeEditor2(model, {}, (editor2, cursor2) => {
        const disposable = editor1.onDidChangeCursorPosition(() => {
          model.tokenization.tokenizeIfCheap(1);
        });
        model.applyEdits([{ range: new Range(1, 1, 1, 1), text: "-" }]);
        disposable.dispose();
      });
    });
    languageRegistration.dispose();
    model.dispose();
  });
  test("issue #37967: problem replacing consecutive characters", () => {
    const model = createTextModel2(
      [
        'const a = "foo";',
        'const b = ""'
      ].join("\n")
    );
    withTestCodeEditor2(model, { multiCursorMergeOverlapping: false }, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 12, 1, 12),
        new Selection(1, 16, 1, 16),
        new Selection(2, 12, 2, 12),
        new Selection(2, 13, 2, 13)
      ]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assertCursor(viewModel, [
        new Selection(1, 11, 1, 11),
        new Selection(1, 14, 1, 14),
        new Selection(2, 11, 2, 11),
        new Selection(2, 11, 2, 11)
      ]);
      viewModel.type("'", "keyboard");
      assert.strictEqual(model.getLineContent(1), "const a = 'foo';");
      assert.strictEqual(model.getLineContent(2), "const b = ''");
    });
  });
  test("issue #15761: Cursor doesn't move in a redo operation", () => {
    const model = createTextModel2(
      [
        "hello"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 4, 1, 4)
      ]);
      editor.executeEdits("test", [{
        range: new Range(1, 1, 1, 1),
        text: "*",
        forceMoveMarkers: true
      }]);
      assertCursor(viewModel, [
        new Selection(1, 5, 1, 5)
      ]);
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assertCursor(viewModel, [
        new Selection(1, 4, 1, 4)
      ]);
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assertCursor(viewModel, [
        new Selection(1, 5, 1, 5)
      ]);
    });
  });
  test("issue #42783: API Calls with Undo Leave Cursor in Wrong Position", () => {
    const model = createTextModel2(
      [
        "ab"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1)
      ]);
      editor.executeEdits("test", [{
        range: new Range(1, 1, 1, 3),
        text: ""
      }]);
      assertCursor(viewModel, [
        new Selection(1, 1, 1, 1)
      ]);
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assertCursor(viewModel, [
        new Selection(1, 1, 1, 1)
      ]);
      editor.executeEdits("test", [{
        range: new Range(1, 1, 1, 2),
        text: ""
      }]);
      assertCursor(viewModel, [
        new Selection(1, 1, 1, 1)
      ]);
    });
  });
  test("issue #85712: Paste line moves cursor to start of current line rather than start of next line", () => {
    const model = createTextModel2(
      [
        "abc123",
        ""
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([
        new Selection(2, 1, 2, 1)
      ]);
      viewModel.paste("something\n", true);
      assert.strictEqual(model.getValue(), [
        "abc123",
        "something",
        ""
      ].join("\n"));
      assertCursor(viewModel, new Position(3, 1));
    });
  });
  test("issue #84897: Left delete behavior in some languages is changed", () => {
    const model = createTextModel2(
      [
        "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 7, 1, 7)
      ]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27\u0E31\u0E2A\u0E14");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27\u0E31\u0E2A");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27\u0E31");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "");
    });
  });
  test("issue #122914: Left delete behavior in some languages is changed (useTabStops: false)", () => {
    const model = createTextModel2(
      [
        "\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35"
      ].join("\n")
    );
    withTestCodeEditor2(model, { useTabStops: false }, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 7, 1, 7)
      ]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27\u0E31\u0E2A\u0E14");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27\u0E31\u0E2A");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27\u0E31");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A\u0E27");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u0E2A");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "");
    });
  });
  test("issue #99629: Emoji modifiers in text treated separately when using backspace", () => {
    const model = createTextModel2(
      [
        "\u{1F476}\u{1F3FE}"
      ].join("\n")
    );
    withTestCodeEditor2(model, { useTabStops: false }, (editor, viewModel) => {
      const len = model.getValueLength();
      editor.setSelections([
        new Selection(1, 1 + len, 1, 1 + len)
      ]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "");
    });
  });
  test("issue #99629: Emoji modifiers in text treated separately when using backspace (ZWJ sequence)", () => {
    const model = createTextModel2(
      [
        "\u{1F468}\u200D\u{1F469}\u{1F3FD}\u200D\u{1F467}\u200D\u{1F466}"
      ].join("\n")
    );
    withTestCodeEditor2(model, { useTabStops: false }, (editor, viewModel) => {
      const len = model.getValueLength();
      editor.setSelections([
        new Selection(1, 1 + len, 1, 1 + len)
      ]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u{1F468}\u200D\u{1F469}\u{1F3FD}\u200D\u{1F467}");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u{1F468}\u200D\u{1F469}\u{1F3FD}");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\u{1F468}");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "");
    });
  });
  test("issue #105730: move left behaves differently for multiple cursors", () => {
    const model = createTextModel2("asdfghjkl, asdfghjkl, asdfghjkl, ");
    withTestCodeEditor2(
      model,
      {
        wordWrap: "wordWrapColumn",
        wordWrapColumn: 24
      },
      (editor, viewModel) => {
        viewModel.setSelections("test", [
          new Selection(1, 10, 1, 12),
          new Selection(1, 21, 1, 23),
          new Selection(1, 32, 1, 34)
        ]);
        moveLeft(editor, viewModel, false);
        assertCursor(viewModel, [
          new Selection(1, 10, 1, 10),
          new Selection(1, 21, 1, 21),
          new Selection(1, 32, 1, 32)
        ]);
        viewModel.setSelections("test", [
          new Selection(1, 10, 1, 12),
          new Selection(1, 21, 1, 23),
          new Selection(1, 32, 1, 34)
        ]);
        moveLeft(editor, viewModel, true);
        assertCursor(viewModel, [
          new Selection(1, 10, 1, 11),
          new Selection(1, 21, 1, 22),
          new Selection(1, 32, 1, 33)
        ]);
      }
    );
  });
  test("issue #105730: move right should always skip wrap point", () => {
    const model = createTextModel2("asdfghjkl, asdfghjkl, asdfghjkl, \nasdfghjkl,");
    withTestCodeEditor2(
      model,
      {
        wordWrap: "wordWrapColumn",
        wordWrapColumn: 24
      },
      (editor, viewModel) => {
        viewModel.setSelections("test", [
          new Selection(1, 22, 1, 22)
        ]);
        moveRight(editor, viewModel, false);
        moveRight(editor, viewModel, false);
        assertCursor(viewModel, [
          new Selection(1, 24, 1, 24)
        ]);
        viewModel.setSelections("test", [
          new Selection(1, 22, 1, 22)
        ]);
        moveRight(editor, viewModel, true);
        moveRight(editor, viewModel, true);
        assertCursor(viewModel, [
          new Selection(1, 22, 1, 24)
        ]);
      }
    );
  });
  test("issue #123178: sticky tab in consecutive wrapped lines", () => {
    const model = createTextModel2("    aaaa        aaaa", void 0, { tabSize: 4 });
    withTestCodeEditor2(
      model,
      {
        wordWrap: "wordWrapColumn",
        wordWrapColumn: 8,
        stickyTabStops: true
      },
      (editor, viewModel) => {
        viewModel.setSelections("test", [
          new Selection(1, 9, 1, 9)
        ]);
        moveRight(editor, viewModel, false);
        assertCursor(viewModel, [
          new Selection(1, 10, 1, 10)
        ]);
        moveLeft(editor, viewModel, false);
        assertCursor(viewModel, [
          new Selection(1, 9, 1, 9)
        ]);
      }
    );
  });
  test("Cursor honors insertSpaces configuration on new line", () => {
    usingCursor({
      text: [
        "    	My First Line	 ",
        "	My Second Line",
        "    Third Line",
        "",
        "1"
      ]
    }, (editor, model, viewModel) => {
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(1, 21), source: "keyboard" });
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    	My First Line	 ");
      assert.strictEqual(model.getLineContent(2), "        ");
    });
  });
  test("Cursor honors insertSpaces configuration on tab", () => {
    const model = createTextModel2(
      [
        "    	My First Line	 ",
        "My Second Line123",
        "    Third Line",
        "",
        "1"
      ].join("\n"),
      void 0,
      {
        tabSize: 13,
        indentSize: 13
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 1) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "             My Second Line123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 2) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "M            y Second Line123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 3) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My            Second Line123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 4) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My           Second Line123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 5) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My S         econd Line123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 5) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My S         econd Line123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 13) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Li ne123");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Line123");
      CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new Position(2, 14) });
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "My Second Lin             e123");
    });
  });
  test("Enter auto-indents with insertSpaces setting 1", () => {
    const languageId = setupOnEnterLanguage(IndentAction.Indent);
    usingCursor({
      text: [
        "	hello"
      ],
      languageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 7, false);
      assertCursor(viewModel, new Selection(1, 7, 1, 7));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.CRLF), "	hello\r\n        ");
    });
  });
  test("Enter auto-indents with insertSpaces setting 2", () => {
    const languageId = setupOnEnterLanguage(IndentAction.None);
    usingCursor({
      text: [
        "	hello"
      ],
      languageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 7, false);
      assertCursor(viewModel, new Selection(1, 7, 1, 7));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.CRLF), "	hello\r\n    ");
    });
  });
  test("Enter auto-indents with insertSpaces setting 3", () => {
    const languageId = setupOnEnterLanguage(IndentAction.IndentOutdent);
    usingCursor({
      text: [
        "	hell()"
      ],
      languageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 7, false);
      assertCursor(viewModel, new Selection(1, 7, 1, 7));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.CRLF), "	hell(\r\n        \r\n    )");
    });
  });
  test("issue #148256: Pressing Enter creates line with bad indent with insertSpaces: true", () => {
    usingCursor({
      text: [
        "  	"
      ]
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 4, false);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(), "  	\n    ");
    });
  });
  test("issue #148256: Pressing Enter creates line with bad indent with insertSpaces: false", () => {
    usingCursor({
      text: [
        "  	"
      ]
    }, (editor, model, viewModel) => {
      model.updateOptions({
        insertSpaces: false
      });
      moveTo(editor, viewModel, 1, 4, false);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(), "  	\n	");
    });
  });
  test("removeAutoWhitespace off", () => {
    usingCursor({
      text: [
        "    some  line abc  "
      ],
      modelOpts: {
        trimAutoWhitespace: false
      }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, model.getLineContent(1).length + 1);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(2), "    ");
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(2), "    ");
      assert.strictEqual(model.getLineContent(3), "    ");
    });
  });
  test("removeAutoWhitespace on: removes only whitespace the cursor added 1", () => {
    usingCursor({
      text: [
        "    "
      ]
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, model.getLineContent(1).length + 1);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    ");
      assert.strictEqual(model.getLineContent(2), "    ");
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    ");
      assert.strictEqual(model.getLineContent(2), "");
      assert.strictEqual(model.getLineContent(3), "    ");
    });
  });
  test("issue #115033: indent and appendText", () => {
    const languageId = "onEnterMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      onEnterRules: [{
        beforeText: /.*/,
        action: {
          indentAction: IndentAction.Indent,
          appendText: "x"
        }
      }]
    }));
    usingCursor({
      text: [
        "text"
      ],
      languageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 5);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "text");
      assert.strictEqual(model.getLineContent(2), "    x");
      assertCursor(viewModel, new Position(2, 6));
    });
  });
  test("issue #6862: Editor removes auto inserted indentation when formatting on type", () => {
    const languageId = setupOnEnterLanguage(IndentAction.IndentOutdent);
    usingCursor({
      text: [
        "function foo (params: string) {}"
      ],
      languageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 32);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "function foo (params: string) {");
      assert.strictEqual(model.getLineContent(2), "    ");
      assert.strictEqual(model.getLineContent(3), "}");
      class TestCommand {
        static {
          __name(this, "TestCommand");
        }
        _selectionId = null;
        getEditOperations(model2, builder) {
          builder.addEditOperation(new Range(1, 13, 1, 14), "");
          this._selectionId = builder.trackSelection(viewModel.getSelection());
        }
        computeCursorState(model2, helper) {
          return helper.getTrackedSelection(this._selectionId);
        }
      }
      viewModel.executeCommand(new TestCommand(), "autoFormat");
      assert.strictEqual(model.getLineContent(1), "function foo(params: string) {");
      assert.strictEqual(model.getLineContent(2), "    ");
      assert.strictEqual(model.getLineContent(3), "}");
    });
  });
  test("removeAutoWhitespace on: removes only whitespace the cursor added 2", () => {
    const languageId = "testLang";
    const registration = languageService.registerLanguage({ id: languageId });
    const model = createTextModel2(
      [
        "    if (a) {",
        "        ",
        "",
        "",
        "    }"
      ].join("\n"),
      languageId
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 3, 1);
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    if (a) {");
      assert.strictEqual(model.getLineContent(2), "        ");
      assert.strictEqual(model.getLineContent(3), "    ");
      assert.strictEqual(model.getLineContent(4), "");
      assert.strictEqual(model.getLineContent(5), "    }");
      moveTo(editor, viewModel, 4, 1);
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    if (a) {");
      assert.strictEqual(model.getLineContent(2), "        ");
      assert.strictEqual(model.getLineContent(3), "");
      assert.strictEqual(model.getLineContent(4), "    ");
      assert.strictEqual(model.getLineContent(5), "    }");
      moveTo(editor, viewModel, 5, model.getLineMaxColumn(5));
      viewModel.type("something", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    if (a) {");
      assert.strictEqual(model.getLineContent(2), "        ");
      assert.strictEqual(model.getLineContent(3), "");
      assert.strictEqual(model.getLineContent(4), "");
      assert.strictEqual(model.getLineContent(5), "    }something");
    });
    registration.dispose();
  });
  test("removeAutoWhitespace on: test 1", () => {
    const model = createTextModel2(
      [
        "    some  line abc  "
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, model.getLineContent(1).length + 1);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(2), "    ");
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(2), "");
      assert.strictEqual(model.getLineContent(3), "    ");
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(2), "");
      assert.strictEqual(model.getLineContent(3), "        ");
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(2), "");
      assert.strictEqual(model.getLineContent(3), "");
      assert.strictEqual(model.getLineContent(4), "        ");
      moveTo(editor, viewModel, 1, 5);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    ");
      assert.strictEqual(model.getLineContent(2), "    some  line abc  ");
      assert.strictEqual(model.getLineContent(3), "");
      assert.strictEqual(model.getLineContent(4), "");
      assert.strictEqual(model.getLineContent(5), "");
      moveTo(editor, viewModel, 2, 5);
      moveTo(editor, viewModel, 3, 1, true);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "    ");
      assert.strictEqual(model.getLineContent(2), "    ");
      assert.strictEqual(model.getLineContent(3), "    ");
      assert.strictEqual(model.getLineContent(4), "");
      assert.strictEqual(model.getLineContent(5), "");
    });
  });
  test("issue #15118: remove auto whitespace when pasting entire line", () => {
    const model = createTextModel2(
      [
        "    function f() {",
        "        // I'm gonna copy this line",
        "        return 3;",
        "    }"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 3, model.getLineMaxColumn(3));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(), [
        "    function f() {",
        "        // I'm gonna copy this line",
        "        return 3;",
        "        ",
        "    }"
      ].join("\n"));
      assertCursor(viewModel, new Position(4, model.getLineMaxColumn(4)));
      viewModel.paste("        // I'm gonna copy this line\n", true);
      assert.strictEqual(model.getValue(), [
        "    function f() {",
        "        // I'm gonna copy this line",
        "        return 3;",
        "        // I'm gonna copy this line",
        "",
        "    }"
      ].join("\n"));
      assertCursor(viewModel, new Position(5, 1));
    });
  });
  test("issue #40695: maintain cursor position when copying lines using ctrl+c, ctrl+v", () => {
    const model = createTextModel2(
      [
        "    function f() {",
        "        // I'm gonna copy this line",
        "        // Another line",
        "        return 3;",
        "    }"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([new Selection(4, 10, 4, 10)]);
      viewModel.paste("        // I'm gonna copy this line\n", true);
      assert.strictEqual(model.getValue(), [
        "    function f() {",
        "        // I'm gonna copy this line",
        "        // Another line",
        "        // I'm gonna copy this line",
        "        return 3;",
        "    }"
      ].join("\n"));
      assertCursor(viewModel, new Position(5, 10));
    });
  });
  test("UseTabStops is off", () => {
    const model = createTextModel2(
      [
        "    x",
        "        a    ",
        "    "
      ].join("\n")
    );
    withTestCodeEditor2(model, { useTabStops: false }, (editor, viewModel) => {
      moveTo(editor, viewModel, 2, 9);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "       a    ");
    });
  });
  test("Backspace removes whitespaces with tab size", () => {
    const model = createTextModel2(
      [
        " 	 	     x",
        "        a    ",
        "    "
      ].join("\n")
    );
    withTestCodeEditor2(model, { useTabStops: true }, (editor, viewModel) => {
      moveTo(editor, viewModel, 2, model.getLineContent(2).length + 1);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "        a   ");
      moveTo(editor, viewModel, 2, 9);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "    a   ");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "a   ");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "        a   ");
      moveTo(editor, viewModel, 1, 1);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), " 	 	     x");
      moveTo(editor, viewModel, 1, 10);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), " 	 	    x");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), " 	 	x");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), " 	x");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "x");
      moveTo(editor, viewModel, 3, model.getLineContent(3).length + 1);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(3), "");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "x\n        a   ");
      moveTo(editor, viewModel, 2, 3);
      moveTo(editor, viewModel, 2, 4, true);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "       a   ");
    });
  });
  test("PR #5423: Auto indent + undo + redo is funky", () => {
    const model = createTextModel2(
      [
        ""
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n", "assert1");
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	", "assert2");
      viewModel.type("y", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y", "assert2");
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\n	", "assert3");
      viewModel.type("x");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\n	x", "assert4");
      CoreNavigationCommands.CursorLeft.runCoreEditorCommand(viewModel, {});
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\n	x", "assert5");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\nx", "assert6");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	yx", "assert7");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	x", "assert8");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\nx", "assert9");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "x", "assert10");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\nx", "assert11");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\nx", "assert12");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\n	x", "assert13");
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\n	y\nx", "assert14");
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "\nx", "assert15");
      CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "x", "assert16");
    });
  });
  test("issue #90973: Undo brings back model alternative version", () => {
    const model = createTextModel2(
      [
        ""
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      const beforeVersion = model.getVersionId();
      const beforeAltVersion = model.getAlternativeVersionId();
      viewModel.type("Hello", "keyboard");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      const afterVersion = model.getVersionId();
      const afterAltVersion = model.getAlternativeVersionId();
      assert.notStrictEqual(beforeVersion, afterVersion);
      assert.strictEqual(beforeAltVersion, afterAltVersion);
    });
  });
  test("Enter honors increaseIndentPattern", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false },
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 12, false);
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
      moveTo(editor, viewModel, 3, 13, false);
      assertCursor(viewModel, new Selection(3, 13, 3, 13));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
    });
  });
  test("Type honors decreaseIndentPattern", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	"
      ],
      languageId: indentRulesLanguageId,
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 2, false);
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
      viewModel.type("}", "keyboard");
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
      assert.strictEqual(model.getLineContent(2), "}", "001");
    });
  });
  test("Enter honors unIndentedLinePattern", () => {
    usingCursor({
      text: [
        "if (true) {",
        "			return true"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false },
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 15, false);
      assertCursor(viewModel, new Selection(2, 15, 2, 15));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(3, 2, 3, 2));
    });
  });
  test("Enter honors indentNextLinePattern", () => {
    usingCursor({
      text: [
        "if (true)",
        "	return true;",
        "if (true)",
        "				return true"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false },
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 14, false);
      assertCursor(viewModel, new Selection(2, 14, 2, 14));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(3, 1, 3, 1));
      moveTo(editor, viewModel, 5, 16, false);
      assertCursor(viewModel, new Selection(5, 16, 5, 16));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(6, 2, 6, 2));
    });
  });
  test("Enter honors indentNextLinePattern 2", () => {
    const model = createTextModel2(
      [
        "if (true)",
        "	if (true)"
      ].join("\n"),
      indentRulesLanguageId,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, { autoIndent: "full" }, (editor, viewModel) => {
      moveTo(editor, viewModel, 2, 11, false);
      assertCursor(viewModel, new Selection(2, 11, 2, 11));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(3, 3, 3, 3));
      viewModel.type("console.log();", "keyboard");
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 1, 4, 1));
    });
  });
  test("Enter honors intential indent", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {",
        "return true;",
        "}}"
      ],
      languageId: indentRulesLanguageId,
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 13, false);
      assertCursor(viewModel, new Selection(3, 13, 3, 13));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 1, 4, 1));
      assert.strictEqual(model.getLineContent(3), "return true;", "001");
    });
  });
  test("Enter supports selection 1", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {",
        "		return true;",
        "	}a}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 4, 3, false);
      moveTo(editor, viewModel, 4, 4, true);
      assertCursor(viewModel, new Selection(4, 3, 4, 4));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(5, 1, 5, 1));
      assert.strictEqual(model.getLineContent(4), "	}", "001");
    });
  });
  test("Enter supports selection 2", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 12, false);
      moveTo(editor, viewModel, 2, 13, true);
      assertCursor(viewModel, new Selection(2, 12, 2, 13));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(3, 3, 3, 3));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
    });
  });
  test("Enter honors tabSize and insertSpaces 1", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {"
      ],
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 12, false);
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(2, 5, 2, 5));
      model.tokenization.forceTokenization(model.getLineCount());
      moveTo(editor, viewModel, 3, 13, false);
      assertCursor(viewModel, new Selection(3, 13, 3, 13));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 9, 4, 9));
    });
  });
  test("Enter honors tabSize and insertSpaces 2", () => {
    usingCursor({
      text: [
        "if (true) {",
        "    if (true) {"
      ],
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 12, false);
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(2, 5, 2, 5));
      moveTo(editor, viewModel, 3, 16, false);
      assertCursor(viewModel, new Selection(3, 16, 3, 16));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(3), "    if (true) {");
      assertCursor(viewModel, new Selection(4, 9, 4, 9));
    });
  });
  test("Enter honors tabSize and insertSpaces 3", () => {
    usingCursor({
      text: [
        "if (true) {",
        "    if (true) {"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 12, false);
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
      moveTo(editor, viewModel, 3, 16, false);
      assertCursor(viewModel, new Selection(3, 16, 3, 16));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(3), "    if (true) {");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
    });
  });
  test("Enter supports intentional indentation", () => {
    usingCursor({
      text: [
        "	if (true) {",
        "		switch(true) {",
        "			case true:",
        "				break;",
        "		}",
        "	}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false },
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 5, 4, false);
      assertCursor(viewModel, new Selection(5, 4, 5, 4));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(5), "		}");
      assertCursor(viewModel, new Selection(6, 3, 6, 3));
    });
  });
  test("Enter should not adjust cursor position when press enter in the middle of a line 1", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {",
        "		return true;",
        "	}a}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 9, false);
      assertCursor(viewModel, new Selection(3, 9, 3, 9));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
      assert.strictEqual(model.getLineContent(4), "		 true;", "001");
    });
  });
  test("Enter should not adjust cursor position when press enter in the middle of a line 2", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {",
        "		return true;",
        "	}a}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 3, false);
      assertCursor(viewModel, new Selection(3, 3, 3, 3));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
      assert.strictEqual(model.getLineContent(4), "		return true;", "001");
    });
  });
  test("Enter should not adjust cursor position when press enter in the middle of a line 3", () => {
    usingCursor({
      text: [
        "if (true) {",
        "  if (true) {",
        "    return true;",
        "  }a}"
      ],
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 11, false);
      assertCursor(viewModel, new Selection(3, 11, 3, 11));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 5, 4, 5));
      assert.strictEqual(model.getLineContent(4), "     true;", "001");
    });
  });
  test("Enter should adjust cursor position when press enter in the middle of leading whitespaces 1", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	if (true) {",
        "		return true;",
        "	}a}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 2, false);
      assertCursor(viewModel, new Selection(3, 2, 3, 2));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 2, 4, 2));
      assert.strictEqual(model.getLineContent(4), "		return true;", "001");
      moveTo(editor, viewModel, 4, 1, false);
      assertCursor(viewModel, new Selection(4, 1, 4, 1));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(5, 1, 5, 1));
      assert.strictEqual(model.getLineContent(5), "		return true;", "002");
    });
  });
  test("Enter should adjust cursor position when press enter in the middle of leading whitespaces 2", () => {
    usingCursor({
      text: [
        "	if (true) {",
        "		if (true) {",
        "	    	return true;",
        "		}a}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 4, false);
      assertCursor(viewModel, new Selection(3, 4, 3, 4));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
      assert.strictEqual(model.getLineContent(4), "			return true;", "001");
      moveTo(editor, viewModel, 4, 1, false);
      assertCursor(viewModel, new Selection(4, 1, 4, 1));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(5, 1, 5, 1));
      assert.strictEqual(model.getLineContent(5), "			return true;", "002");
    });
  });
  test("Enter should adjust cursor position when press enter in the middle of leading whitespaces 3", () => {
    usingCursor({
      text: [
        "if (true) {",
        "  if (true) {",
        "    return true;",
        "}a}"
      ],
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 2, false);
      assertCursor(viewModel, new Selection(3, 2, 3, 2));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 2, 4, 2));
      assert.strictEqual(model.getLineContent(4), "    return true;", "001");
      moveTo(editor, viewModel, 4, 3, false);
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(5, 3, 5, 3));
      assert.strictEqual(model.getLineContent(5), "    return true;", "002");
    });
  });
  test("Enter should adjust cursor position when press enter in the middle of leading whitespaces 4", () => {
    usingCursor({
      text: [
        "if (true) {",
        "  if (true) {",
        "	  return true;",
        "}a}",
        "",
        "if (true) {",
        "  if (true) {",
        "	  return true;",
        "}a}"
      ],
      languageId: indentRulesLanguageId,
      modelOpts: {
        tabSize: 2,
        indentSize: 2
      }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 3, false);
      assertCursor(viewModel, new Selection(3, 3, 3, 3));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 4, 4, 4));
      assert.strictEqual(model.getLineContent(4), "    return true;", "001");
      moveTo(editor, viewModel, 9, 4, false);
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(10, 5, 10, 5));
      assert.strictEqual(model.getLineContent(10), "    return true;", "001");
    });
  });
  test("Enter should adjust cursor position when press enter in the middle of leading whitespaces 5", () => {
    usingCursor({
      text: [
        "if (true) {",
        "  if (true) {",
        "    return true;",
        "    return true;",
        ""
      ],
      languageId: indentRulesLanguageId,
      modelOpts: { tabSize: 2 }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 5, false);
      moveTo(editor, viewModel, 4, 3, true);
      assertCursor(viewModel, new Selection(3, 5, 4, 3));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
      assert.strictEqual(model.getLineContent(4), "    return true;", "001");
    });
  });
  test("issue microsoft/monaco-editor#108 part 1/2: Auto indentation on Enter with selection is half broken", () => {
    usingCursor({
      text: [
        "function baz() {",
        "	var x = 1;",
        "							return x;",
        "}"
      ],
      modelOpts: {
        insertSpaces: false
      },
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 8, false);
      moveTo(editor, viewModel, 2, 12, true);
      assertCursor(viewModel, new Selection(3, 8, 2, 12));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(3), "	return x;");
      assertCursor(viewModel, new Position(3, 2));
    });
  });
  test("issue microsoft/monaco-editor#108 part 2/2: Auto indentation on Enter with selection is half broken", () => {
    usingCursor({
      text: [
        "function baz() {",
        "	var x = 1;",
        "							return x;",
        "}"
      ],
      modelOpts: {
        insertSpaces: false
      },
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 12, false);
      moveTo(editor, viewModel, 3, 8, true);
      assertCursor(viewModel, new Selection(2, 12, 3, 8));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(3), "	return x;");
      assertCursor(viewModel, new Position(3, 2));
    });
  });
  test("onEnter works if there are no indentation rules", () => {
    usingCursor({
      text: [
        "<?",
        "	if (true) {",
        "		echo $hi;",
        "		echo $bye;",
        "	}",
        "?>"
      ],
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 5, 3, false);
      assertCursor(viewModel, new Selection(5, 3, 5, 3));
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getLineContent(6), "	");
      assertCursor(viewModel, new Selection(6, 2, 6, 2));
      assert.strictEqual(model.getLineContent(5), "	}");
    });
  });
  test("onEnter works if there are no indentation rules 2", () => {
    usingCursor({
      text: [
        "	if (5)",
        "		return 5;",
        "	"
      ],
      modelOpts: { insertSpaces: false }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 2, false);
      assertCursor(viewModel, new Selection(3, 2, 3, 2));
      viewModel.type("\n", "keyboard");
      assertCursor(viewModel, new Selection(4, 2, 4, 2));
      assert.strictEqual(model.getLineContent(4), "	");
    });
  });
  test("bug #16543: Tab should indent to correct indentation spot immediately", () => {
    const model = createTextModel2(
      [
        "function baz() {",
        "	function hello() { // something here",
        "	",
        "",
        "	}",
        "}"
      ].join("\n"),
      indentRulesLanguageId,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 4, 1, false);
      assertCursor(viewModel, new Selection(4, 1, 4, 1));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(4), "		");
    });
  });
  test("bug #2938 (1): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)", () => {
    const model = createTextModel2(
      [
        "	function baz() {",
        "		function hello() { // something here",
        "		",
        "	",
        "		}",
        "	}"
      ].join("\n"),
      indentRulesLanguageId,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 4, 2, false);
      assertCursor(viewModel, new Selection(4, 2, 4, 2));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(4), "			");
    });
  });
  test("bug #2938 (2): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)", () => {
    const model = createTextModel2(
      [
        "	function baz() {",
        "		function hello() { // something here",
        "		",
        "    ",
        "		}",
        "	}"
      ].join("\n"),
      indentRulesLanguageId,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 4, 1, false);
      assertCursor(viewModel, new Selection(4, 1, 4, 1));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(4), "			");
    });
  });
  test("bug #2938 (3): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)", () => {
    const model = createTextModel2(
      [
        "	function baz() {",
        "		function hello() { // something here",
        "		",
        "			",
        "		}",
        "	}"
      ].join("\n"),
      indentRulesLanguageId,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 4, 3, false);
      assertCursor(viewModel, new Selection(4, 3, 4, 3));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(4), "				");
    });
  });
  test("bug #2938 (4): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)", () => {
    const model = createTextModel2(
      [
        "	function baz() {",
        "		function hello() { // something here",
        "		",
        "				",
        "		}",
        "	}"
      ].join("\n"),
      indentRulesLanguageId,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 4, 4, false);
      assertCursor(viewModel, new Selection(4, 4, 4, 4));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(4), "					");
    });
  });
  test("bug #31015: When pressing Tab on lines and Enter rules are avail, indent straight to the right spotTab", () => {
    const onEnterLanguageId = setupOnEnterLanguage(IndentAction.Indent);
    const model = createTextModel2(
      [
        "    if (a) {",
        "        ",
        "",
        "",
        "    }"
      ].join("\n"),
      onEnterLanguageId
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      moveTo(editor, viewModel, 3, 1);
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "    if (a) {");
      assert.strictEqual(model.getLineContent(2), "        ");
      assert.strictEqual(model.getLineContent(3), "        ");
      assert.strictEqual(model.getLineContent(4), "");
      assert.strictEqual(model.getLineContent(5), "    }");
    });
  });
  test("type honors indentation rules: ruby keywords", () => {
    const rubyLanguageId = setupIndentRulesLanguage("ruby", {
      increaseIndentPattern: /^\s*((begin|class|def|else|elsif|ensure|for|if|module|rescue|unless|until|when|while)|(.*\sdo\b))\b[^\{;]*$/,
      decreaseIndentPattern: /^\s*([}\]]([,)]?\s*(#|$)|\.[a-zA-Z_]\w*\b)|(end|rescue|ensure|else|elsif|when)\b)/
    });
    const model = createTextModel2(
      [
        "class Greeter",
        "  def initialize(name)",
        "    @name = name",
        "    en"
      ].join("\n"),
      rubyLanguageId
    );
    withTestCodeEditor2(model, { autoIndent: "full" }, (editor, viewModel) => {
      moveTo(editor, viewModel, 4, 7, false);
      assertCursor(viewModel, new Selection(4, 7, 4, 7));
      viewModel.type("d", "keyboard");
      assert.strictEqual(model.getLineContent(4), "  end");
    });
  });
  test("Auto indent on type: increaseIndentPattern has higher priority than decreaseIndent when inheriting", () => {
    usingCursor({
      text: [
        "	if (true) {",
        "		console.log();",
        "	} else if {",
        "		console.log()",
        "	}"
      ],
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 5, 3, false);
      assertCursor(viewModel, new Selection(5, 3, 5, 3));
      viewModel.type("e", "keyboard");
      assertCursor(viewModel, new Selection(5, 4, 5, 4));
      assert.strictEqual(model.getLineContent(5), "	}e", "This line should not decrease indent");
    });
  });
  test("type honors users indentation adjustment", () => {
    usingCursor({
      text: [
        "	if (true ||",
        "	 ) {",
        "	}",
        "if (true ||",
        ") {",
        "}"
      ],
      languageId: indentRulesLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 3, false);
      assertCursor(viewModel, new Selection(2, 3, 2, 3));
      viewModel.type(" ", "keyboard");
      assertCursor(viewModel, new Selection(2, 4, 2, 4));
      assert.strictEqual(model.getLineContent(2), "	  ) {", "This line should not decrease indent");
    });
  });
  test("bug 29972: if a line is line comment, open bracket should not indent next line", () => {
    usingCursor({
      text: [
        "if (true) {",
        "	// {",
        "		"
      ],
      languageId: indentRulesLanguageId,
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 3, false);
      assertCursor(viewModel, new Selection(3, 3, 3, 3));
      viewModel.type("}", "keyboard");
      assertCursor(viewModel, new Selection(3, 2, 3, 2));
      assert.strictEqual(model.getLineContent(3), "}");
    });
  });
  test("issue #38261: TAB key results in bizarre indentation in C++ mode ", () => {
    const languageId = "indentRulesMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
      ],
      indentationRules: {
        increaseIndentPattern: new RegExp("(^.*\\{[^}]*$)"),
        decreaseIndentPattern: new RegExp("^\\s*\\}")
      }
    }));
    const model = createTextModel2(
      [
        "int main() {",
        "  return 0;",
        "}",
        "",
        "bool Foo::bar(const string &a,",
        "              const string &b) {",
        "  foo();",
        "",
        ")"
      ].join("\n"),
      languageId,
      {
        tabSize: 2,
        indentSize: 2
      }
    );
    withTestCodeEditor2(model, { autoIndent: "advanced" }, (editor, viewModel) => {
      moveTo(editor, viewModel, 8, 1, false);
      assertCursor(viewModel, new Selection(8, 1, 8, 1));
      CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
      assert.strictEqual(
        model.getValue(),
        [
          "int main() {",
          "  return 0;",
          "}",
          "",
          "bool Foo::bar(const string &a,",
          "              const string &b) {",
          "  foo();",
          "  ",
          ")"
        ].join("\n")
      );
      assert.deepStrictEqual(viewModel.getSelection(), new Selection(8, 3, 8, 3));
    });
  });
  test("issue #57197: indent rules regex should be stateless", () => {
    const languageId = setupIndentRulesLanguage("lang", {
      decreaseIndentPattern: /^\s*}$/gm,
      increaseIndentPattern: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)[^\S\n]*(.+:)[^\S\n]*(?:(?=@[^\s*~(]+(?::\/\/[^\s*~(:]+)?(?:\([^)]*\))?)|$)/gm
    });
    usingCursor({
      text: [
        "Project:"
      ],
      languageId,
      modelOpts: { insertSpaces: false },
      editorOpts: { autoIndent: "full" }
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 9, false);
      assertCursor(viewModel, new Selection(1, 9, 1, 9));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
      moveTo(editor, viewModel, 1, 9, false);
      assertCursor(viewModel, new Selection(1, 9, 1, 9));
      viewModel.type("\n", "keyboard");
      model.tokenization.forceTokenization(model.getLineCount());
      assertCursor(viewModel, new Selection(2, 2, 2, 2));
    });
  });
  test("typing in json", () => {
    const languageId = "indentRulesMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
      ],
      indentationRules: {
        increaseIndentPattern: new RegExp('({+(?=([^"]*"[^"]*")*[^"}]*$))|(\\[+(?=([^"]*"[^"]*")*[^"\\]]*$))'),
        decreaseIndentPattern: new RegExp("^\\s*[}\\]],?\\s*$")
      }
    }));
    const model = createTextModel2(
      [
        "{",
        '  "scripts: {"',
        '    "watch": "a {"',
        '    "build{": "b"',
        '    "tasks": []',
        '    "tasks": ["a"]',
        '  "}"',
        '"}"'
      ].join("\n"),
      languageId,
      {
        tabSize: 2,
        indentSize: 2
      }
    );
    withTestCodeEditor2(model, { autoIndent: "full" }, (editor, viewModel) => {
      moveTo(editor, viewModel, 3, 19, false);
      assertCursor(viewModel, new Selection(3, 19, 3, 19));
      viewModel.type("\n", "keyboard");
      assert.deepStrictEqual(model.getLineContent(4), "    ");
      moveTo(editor, viewModel, 5, 18, false);
      assertCursor(viewModel, new Selection(5, 18, 5, 18));
      viewModel.type("\n", "keyboard");
      assert.deepStrictEqual(model.getLineContent(6), "    ");
      moveTo(editor, viewModel, 7, 15, false);
      assertCursor(viewModel, new Selection(7, 15, 7, 15));
      viewModel.type("\n", "keyboard");
      assert.deepStrictEqual(model.getLineContent(8), "      ");
      assert.deepStrictEqual(model.getLineContent(9), "    ]");
      moveTo(editor, viewModel, 10, 18, false);
      assertCursor(viewModel, new Selection(10, 18, 10, 18));
      viewModel.type("\n", "keyboard");
      assert.deepStrictEqual(model.getLineContent(11), "    ]");
    });
  });
  test("issue #111128: Multicursor `Enter` issue with indentation", () => {
    const model = createTextModel2("    let a, b, c;", indentRulesLanguageId, { detectIndentation: false, insertSpaces: false, tabSize: 4 });
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 11, 1, 11),
        new Selection(1, 14, 1, 14)
      ]);
      viewModel.type("\n", "keyboard");
      assert.strictEqual(model.getValue(), "    let a,\n	 b,\n	 c;");
    });
  });
  test("issue #122714: tabSize=1 prevent typing a string matching decreaseIndentPattern in an empty file", () => {
    const latextLanguageId = setupIndentRulesLanguage("latex", {
      increaseIndentPattern: new RegExp("\\\\begin{(?!document)([^}]*)}(?!.*\\\\end{\\1})"),
      decreaseIndentPattern: new RegExp("^\\s*\\\\end{(?!document)")
    });
    const model = createTextModel2(
      "\\end",
      latextLanguageId,
      { tabSize: 1 }
    );
    withTestCodeEditor2(model, { autoIndent: "full" }, (editor, viewModel) => {
      moveTo(editor, viewModel, 1, 5, false);
      assertCursor(viewModel, new Selection(1, 5, 1, 5));
      viewModel.type("{", "keyboard");
      assert.strictEqual(model.getLineContent(1), "\\end{}");
    });
  });
  test("ElectricCharacter - does nothing if no electric char", () => {
    usingCursor({
      text: [
        "  if (a) {",
        ""
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 1);
      viewModel.type("*", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "*");
    });
  });
  test("ElectricCharacter - indents in order to match bracket", () => {
    usingCursor({
      text: [
        "  if (a) {",
        ""
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 1);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "  }");
    });
  });
  test("ElectricCharacter - unindents in order to match bracket", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "    "
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 5);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "  }");
    });
  });
  test("ElectricCharacter - matches with correct bracket", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "    if (b) {",
        "    }",
        "    "
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 4, 1);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(4), "  }    ");
    });
  });
  test("ElectricCharacter - does nothing if bracket does not match", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "    if (b) {",
        "    }",
        "  }  "
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 4, 6);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(4), "  }  }");
    });
  });
  test("ElectricCharacter - matches bracket even in line with content", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "// hello"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 1);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "  }// hello");
    });
  });
  test("ElectricCharacter - is no-op if bracket is lined up", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "  "
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 3);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "  }");
    });
  });
  test("ElectricCharacter - is no-op if there is non-whitespace text before", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "a"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 2);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "a}");
    });
  });
  test("ElectricCharacter - is no-op if pairs are all matched before", () => {
    usingCursor({
      text: [
        "foo(() => {",
        "  ( 1 + 2 ) ",
        "})"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 13);
      viewModel.type("*", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "  ( 1 + 2 ) *");
    });
  });
  test("ElectricCharacter - is no-op if matching bracket is on the same line", () => {
    usingCursor({
      text: [
        "(div"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 1, 5);
      let changeText = null;
      const disposable = model.onDidChangeContent((e) => {
        changeText = e.changes[0].text;
      });
      viewModel.type(")", "keyboard");
      assert.deepStrictEqual(model.getLineContent(1), "(div)");
      assert.deepStrictEqual(changeText, ")");
      disposable.dispose();
    });
  });
  test("ElectricCharacter - is no-op if the line has other content", () => {
    usingCursor({
      text: [
        "Math.max(",
        "	2",
        "	3"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 3, 3);
      viewModel.type(")", "keyboard");
      assert.deepStrictEqual(model.getLineContent(3), "	3)");
    });
  });
  test("ElectricCharacter - appends text", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "/*"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 3);
      viewModel.type("*", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "/** */");
    });
  });
  test("ElectricCharacter - appends text 2", () => {
    usingCursor({
      text: [
        "  if (a) {",
        "  /*"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 5);
      viewModel.type("*", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "  /** */");
    });
  });
  test("ElectricCharacter - issue #23711: Replacing selected text with )]} fails to delete old text with backwards-dragged selection", () => {
    usingCursor({
      text: [
        "{",
        "word"
      ],
      languageId: electricCharLanguageId
    }, (editor, model, viewModel) => {
      moveTo(editor, viewModel, 2, 5);
      moveTo(editor, viewModel, 2, 1, true);
      viewModel.type("}", "keyboard");
      assert.deepStrictEqual(model.getLineContent(2), "}");
    });
  });
  test("issue #61070: backtick (`) should auto-close after a word character", () => {
    usingCursor({
      text: ["const markup = highlight"],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      model.tokenization.forceTokenization(1);
      assertType(editor, model, viewModel, 1, 25, "`", "``", `auto closes \` @ (1, 25)`);
    });
  });
  test("issue #132912: quotes should not auto-close if they are closing a string", () => {
    setupAutoClosingLanguageTokenization();
    const model = createTextModel2("const t2 = `something ${t1}", autoClosingLanguageId);
    withTestCodeEditor2(
      model,
      {},
      (editor, viewModel) => {
        const model2 = viewModel.model;
        model2.tokenization.forceTokenization(1);
        assertType(editor, model2, viewModel, 1, 28, "`", "`", `does not auto close \` @ (1, 28)`);
      }
    );
  });
  test("autoClosingPairs - open parens: default", () => {
    usingCursor({
      text: [
        "var a = [];",
        "var b = `asd`;",
        "var c = 'asd';",
        'var d = "asd";',
        "var e = /*3*/	3;",
        "var f = /** 3 */3;",
        "var g = (3+5);",
        "var h = { a: 'value' };"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "var| a| |=| [|]|;|",
        "var| b| |=| |`asd|`|;|",
        "var| c| |=| |'asd|'|;|",
        'var| d| |=| |"asd|"|;|',
        "var| e| |=| /*3*/|	3|;|",
        "var| f| |=| /**| 3| */3|;|",
        "var| g| |=| (3+5|)|;|",
        "var| h| |=| {| a|:| |'value|'| |}|;|"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "(", "()", `auto closes @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "(", "(", `does not auto close @ (${lineNumber}, ${column})`);
          }
        }
      }
    });
  });
  test("autoClosingPairs - open parens: whitespace", () => {
    usingCursor({
      text: [
        "var a = [];",
        "var b = `asd`;",
        "var c = 'asd';",
        'var d = "asd";',
        "var e = /*3*/	3;",
        "var f = /** 3 */3;",
        "var g = (3+5);",
        "var h = { a: 'value' };"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingBrackets: "beforeWhitespace"
      }
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "var| a| =| [|];|",
        "var| b| =| `asd`;|",
        "var| c| =| 'asd';|",
        'var| d| =| "asd";|',
        "var| e| =| /*3*/|	3;|",
        "var| f| =| /**| 3| */3;|",
        "var| g| =| (3+5|);|",
        "var| h| =| {| a:| 'value'| |};|"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "(", "()", `auto closes @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "(", "(", `does not auto close @ (${lineNumber}, ${column})`);
          }
        }
      }
    });
  });
  test("autoClosingPairs - open parens disabled/enabled open quotes enabled/disabled", () => {
    usingCursor({
      text: [
        "var a = [];"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingBrackets: "beforeWhitespace",
        autoClosingQuotes: "never"
      }
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "var| a| =| [|];|"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "(", "()", `auto closes @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "(", "(", `does not auto close @ (${lineNumber}, ${column})`);
          }
          assertType(editor, model, viewModel, lineNumber, column, "'", "'", `does not auto close @ (${lineNumber}, ${column})`);
        }
      }
    });
    usingCursor({
      text: [
        "var b = [];"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingBrackets: "never",
        autoClosingQuotes: "beforeWhitespace"
      }
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "var b =| [|];|"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "'", "''", `auto closes @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "'", "'", `does not auto close @ (${lineNumber}, ${column})`);
          }
          assertType(editor, model, viewModel, lineNumber, column, "(", "(", `does not auto close @ (${lineNumber}, ${column})`);
        }
      }
    });
  });
  test("autoClosingPairs - configurable open parens", () => {
    setAutoClosingLanguageEnabledSet("abc");
    usingCursor({
      text: [
        "var a = [];",
        "var b = `asd`;",
        "var c = 'asd';",
        'var d = "asd";',
        "var e = /*3*/	3;",
        "var f = /** 3 */3;",
        "var g = (3+5);",
        "var h = { a: 'value' };"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingBrackets: "languageDefined"
      }
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "v|ar |a = [|];|",
        "v|ar |b = `|asd`;|",
        "v|ar |c = '|asd';|",
        'v|ar d = "|asd";|',
        "v|ar e = /*3*/	3;|",
        "v|ar f = /** 3| */3;|",
        "v|ar g = (3+5|);|",
        "v|ar h = { |a: 'v|alue' |};|"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "(", "()", `auto closes @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "(", "(", `does not auto close @ (${lineNumber}, ${column})`);
          }
        }
      }
    });
  });
  test("autoClosingPairs - auto-pairing can be disabled", () => {
    usingCursor({
      text: [
        "var a = [];",
        "var b = `asd`;",
        "var c = 'asd';",
        'var d = "asd";',
        "var e = /*3*/	3;",
        "var f = /** 3 */3;",
        "var g = (3+5);",
        "var h = { a: 'value' };"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingBrackets: "never",
        autoClosingQuotes: "never"
      }
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "var a = [];",
        "var b = `asd`;",
        "var c = 'asd';",
        'var d = "asd";',
        "var e = /*3*/	3;",
        "var f = /** 3 */3;",
        "var g = (3+5);",
        "var h = { a: 'value' };"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "(", "()", `auto closes @ (${lineNumber}, ${column})`);
            assertType(editor, model, viewModel, lineNumber, column, '"', '""', `auto closes @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "(", "(", `does not auto close @ (${lineNumber}, ${column})`);
            assertType(editor, model, viewModel, lineNumber, column, '"', '"', `does not auto close @ (${lineNumber}, ${column})`);
          }
        }
      }
    });
  });
  test("autoClosingPairs - auto wrapping is configurable", () => {
    usingCursor({
      text: [
        "var a = asd"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 4),
        new Selection(1, 9, 1, 12)
      ]);
      viewModel.type("`", "keyboard");
      assert.strictEqual(model.getValue(), "`var` a = `asd`");
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getValue(), "`(var)` a = `(asd)`");
    });
    usingCursor({
      text: [
        "var a = asd"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoSurround: "never"
      }
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 4)
      ]);
      viewModel.type("`", "keyboard");
      assert.strictEqual(model.getValue(), "` a = asd");
    });
    usingCursor({
      text: [
        "var a = asd"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoSurround: "quotes"
      }
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 4)
      ]);
      viewModel.type("`", "keyboard");
      assert.strictEqual(model.getValue(), "`var` a = asd");
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getValue(), "`(` a = asd");
    });
    usingCursor({
      text: [
        "var a = asd"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoSurround: "brackets"
      }
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 1, 1, 4)
      ]);
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getValue(), "(var) a = asd");
      viewModel.type("`", "keyboard");
      assert.strictEqual(model.getValue(), "(`) a = asd");
    });
  });
  test("autoClosingPairs - quote", () => {
    usingCursor({
      text: [
        "var a = [];",
        "var b = `asd`;",
        "var c = 'asd';",
        'var d = "asd";',
        "var e = /*3*/	3;",
        "var f = /** 3 */3;",
        "var g = (3+5);",
        "var h = { a: 'value' };"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      const autoClosePositions = [
        "var a |=| [|]|;|",
        "var b |=| `asd`|;|",
        "var c |=| 'asd'|;|",
        'var d |=| "asd"|;|',
        "var e |=| /*3*/|	3;|",
        "var f |=| /**| 3 */3;|",
        "var g |=| (3+5)|;|",
        "var h |=| {| a:| 'value'| |}|;|"
      ];
      for (let i = 0, len = autoClosePositions.length; i < len; i++) {
        const lineNumber = i + 1;
        const autoCloseColumns = extractAutoClosingSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
        for (let column = 1; column < autoCloseColumns.length; column++) {
          model.tokenization.forceTokenization(lineNumber);
          if (autoCloseColumns[column] === 1 /* Special1 */) {
            assertType(editor, model, viewModel, lineNumber, column, "'", "''", `auto closes @ (${lineNumber}, ${column})`);
          } else if (autoCloseColumns[column] === 2 /* Special2 */) {
            assertType(editor, model, viewModel, lineNumber, column, "'", "", `over types @ (${lineNumber}, ${column})`);
          } else {
            assertType(editor, model, viewModel, lineNumber, column, "'", "'", `does not auto close @ (${lineNumber}, ${column})`);
          }
        }
      }
    });
  });
  test("autoClosingPairs - multi-character autoclose", () => {
    usingCursor({
      text: [
        ""
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      model.setValue("begi");
      viewModel.setSelections("test", [new Selection(1, 5, 1, 5)]);
      viewModel.type("n", "keyboard");
      assert.strictEqual(model.getLineContent(1), "beginend");
      model.setValue("/*");
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      viewModel.type("*", "keyboard");
      assert.strictEqual(model.getLineContent(1), "/** */");
    });
  });
  test("autoClosingPairs - doc comments can be turned off", () => {
    usingCursor({
      text: [
        ""
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingComments: "never"
      }
    }, (editor, model, viewModel) => {
      model.setValue("/*");
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      viewModel.type("*", "keyboard");
      assert.strictEqual(model.getLineContent(1), "/**");
    });
  });
  test("issue #72177: multi-character autoclose with conflicting patterns", () => {
    const languageId = "autoClosingModeMultiChar";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      autoClosingPairs: [
        { open: "(", close: ")" },
        { open: "(*", close: "*)" },
        { open: "<@", close: "@>" },
        { open: "<@@", close: "@@>" }
      ]
    }));
    usingCursor({
      text: [
        ""
      ],
      languageId
    }, (editor, model, viewModel) => {
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "()");
      viewModel.type("*", "keyboard");
      assert.strictEqual(model.getLineContent(1), "(**)", `doesn't add entire close when already closed substring is there`);
      model.setValue("(");
      viewModel.setSelections("test", [new Selection(1, 2, 1, 2)]);
      viewModel.type("*", "keyboard");
      assert.strictEqual(model.getLineContent(1), "(**)", `does add entire close if not already there`);
      model.setValue("");
      viewModel.type("<@", "keyboard");
      assert.strictEqual(model.getLineContent(1), "<@@>");
      viewModel.type("@", "keyboard");
      assert.strictEqual(model.getLineContent(1), "<@@@@>", `autocloses when before multi-character closing brace`);
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "<@@()@@>", `autocloses when before multi-character closing brace`);
    });
  });
  test("issue #55314: Do not auto-close when ending with open", () => {
    const languageId = "myElectricMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: '"', close: '"', notIn: ["string"] },
        { open: 'B"', close: '"', notIn: ["string", "comment"] },
        { open: "`", close: "`", notIn: ["string", "comment"] },
        { open: "/**", close: " */", notIn: ["string"] }
      ]
    }));
    usingCursor({
      text: [
        "little goat",
        "little LAMB",
        "little sheep",
        "Big LAMB"
      ],
      languageId
    }, (editor, model, viewModel) => {
      model.tokenization.forceTokenization(model.getLineCount());
      assertType(editor, model, viewModel, 1, 4, '"', '"', `does not double quote when ending with open`);
      model.tokenization.forceTokenization(model.getLineCount());
      assertType(editor, model, viewModel, 2, 4, '"', '"', `does not double quote when ending with open`);
      model.tokenization.forceTokenization(model.getLineCount());
      assertType(editor, model, viewModel, 3, 4, '"', '"', `does not double quote when ending with open`);
      model.tokenization.forceTokenization(model.getLineCount());
      assertType(editor, model, viewModel, 4, 2, '"', '"', `does not double quote when ending with open`);
      model.tokenization.forceTokenization(model.getLineCount());
      assertType(editor, model, viewModel, 4, 3, '"', '"', `does not double quote when ending with open`);
    });
  });
  test("issue #27937: Trying to add an item to the front of a list is cumbersome", () => {
    usingCursor({
      text: [
        'var arr = ["b", "c"];'
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertType(editor, model, viewModel, 1, 12, '"', '"', `does not over type and will not auto close`);
    });
  });
  test("issue #25658 - Do not auto-close single/double quotes after word characters", () => {
    usingCursor({
      text: [
        ""
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      function typeCharacters(viewModel2, chars) {
        for (let i = 0, len = chars.length; i < len; i++) {
          viewModel2.type(chars[i], "keyboard");
        }
      }
      __name(typeCharacters, "typeCharacters");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, "teste1 = teste' ok");
      assert.strictEqual(model.getLineContent(1), "teste1 = teste' ok");
      viewModel.setSelections("test", [new Selection(1, 1e3, 1, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, "teste2 = teste 'ok");
      assert.strictEqual(model.getLineContent(2), "teste2 = teste 'ok'");
      viewModel.setSelections("test", [new Selection(2, 1e3, 2, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, 'teste3 = teste" ok');
      assert.strictEqual(model.getLineContent(3), 'teste3 = teste" ok');
      viewModel.setSelections("test", [new Selection(3, 1e3, 3, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, 'teste4 = teste "ok');
      assert.strictEqual(model.getLineContent(4), 'teste4 = teste "ok"');
      viewModel.setSelections("test", [new Selection(4, 1e3, 4, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, "teste '");
      assert.strictEqual(model.getLineContent(5), "teste ''");
      viewModel.setSelections("test", [new Selection(5, 1e3, 5, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, 'teste "');
      assert.strictEqual(model.getLineContent(6), 'teste ""');
      viewModel.setSelections("test", [new Selection(6, 1e3, 6, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, "teste'");
      assert.strictEqual(model.getLineContent(7), "teste'");
      viewModel.setSelections("test", [new Selection(7, 1e3, 7, 1e3)]);
      typeCharacters(viewModel, "\n");
      model.tokenization.forceTokenization(model.getLineCount());
      typeCharacters(viewModel, 'teste"');
      assert.strictEqual(model.getLineContent(8), 'teste"');
    });
  });
  test("issue #37315 - overtypes only those characters that it inserted", () => {
    usingCursor({
      text: [
        "",
        "y=();"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("x=(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.type("asd", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=(asd)");
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=(asd)");
      viewModel.setSelections("test", [new Selection(2, 4, 2, 4)]);
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(2), "y=());");
    });
  });
  test("issue #37315 - stops overtyping once cursor leaves area", () => {
    usingCursor({
      text: [
        "",
        "y=();"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("x=(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.setSelections("test", [new Selection(1, 5, 1, 5)]);
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=())");
    });
  });
  test("issue #37315 - it overtypes only once", () => {
    usingCursor({
      text: [
        "",
        "y=();"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("x=(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.setSelections("test", [new Selection(1, 4, 1, 4)]);
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=())");
    });
  });
  test("issue #37315 - it can remember multiple auto-closed instances", () => {
    usingCursor({
      text: [
        "",
        "y=();"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("x=(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=(())");
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=(())");
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=(())");
    });
  });
  test("issue #118270 - auto closing deletes only those characters that it inserted", () => {
    usingCursor({
      text: [
        "",
        "y=();"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("x=(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.type("asd", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=(asd)");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "x=()");
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "x=");
      viewModel.setSelections("test", [new Selection(2, 4, 2, 4)]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "y=);");
    });
  });
  test("issue #78527 - does not close quote on odd count", () => {
    usingCursor({
      text: [
        `std::cout << '"' << entryMap`
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 29, 1, 29)]);
      viewModel.type("[", "keyboard");
      assert.strictEqual(model.getLineContent(1), `std::cout << '"' << entryMap[]`);
      viewModel.type('"', "keyboard");
      assert.strictEqual(model.getLineContent(1), `std::cout << '"' << entryMap[""]`);
      viewModel.type("a", "keyboard");
      assert.strictEqual(model.getLineContent(1), `std::cout << '"' << entryMap["a"]`);
      viewModel.type('"', "keyboard");
      assert.strictEqual(model.getLineContent(1), `std::cout << '"' << entryMap["a"]`);
      viewModel.type("]", "keyboard");
      assert.strictEqual(model.getLineContent(1), `std::cout << '"' << entryMap["a"]`);
    });
  });
  test("issue #85983 - editor.autoClosingBrackets: beforeWhitespace is incorrect for Python", () => {
    const languageId = "pythonMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
        { open: 'r"', close: '"', notIn: ["string", "comment"] },
        { open: 'R"', close: '"', notIn: ["string", "comment"] },
        { open: 'u"', close: '"', notIn: ["string", "comment"] },
        { open: 'U"', close: '"', notIn: ["string", "comment"] },
        { open: 'f"', close: '"', notIn: ["string", "comment"] },
        { open: 'F"', close: '"', notIn: ["string", "comment"] },
        { open: 'b"', close: '"', notIn: ["string", "comment"] },
        { open: 'B"', close: '"', notIn: ["string", "comment"] },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: "r'", close: "'", notIn: ["string", "comment"] },
        { open: "R'", close: "'", notIn: ["string", "comment"] },
        { open: "u'", close: "'", notIn: ["string", "comment"] },
        { open: "U'", close: "'", notIn: ["string", "comment"] },
        { open: "f'", close: "'", notIn: ["string", "comment"] },
        { open: "F'", close: "'", notIn: ["string", "comment"] },
        { open: "b'", close: "'", notIn: ["string", "comment"] },
        { open: "B'", close: "'", notIn: ["string", "comment"] },
        { open: "`", close: "`", notIn: ["string"] }
      ]
    }));
    usingCursor({
      text: [
        "foo'hello'"
      ],
      editorOpts: {
        autoClosingBrackets: "beforeWhitespace"
      },
      languageId
    }, (editor, model, viewModel) => {
      assertType(editor, model, viewModel, 1, 4, "(", "(", `does not auto close @ (1, 4)`);
    });
  });
  test("issue #78975 - Parentheses swallowing does not work when parentheses are inserted by autocomplete", () => {
    usingCursor({
      text: [
        "<div id"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 8, 1, 8)]);
      viewModel.executeEdits("snippet", [{ range: new Range(1, 6, 1, 8), text: 'id=""' }], () => [new Selection(1, 10, 1, 10)]);
      assert.strictEqual(model.getLineContent(1), '<div id=""');
      viewModel.type("a", "keyboard");
      assert.strictEqual(model.getLineContent(1), '<div id="a"');
      viewModel.type('"', "keyboard");
      assert.strictEqual(model.getLineContent(1), '<div id="a"');
    });
  });
  test("issue #78833 - Add config to use old brackets/quotes overtyping", () => {
    usingCursor({
      text: [
        "",
        "y=();"
      ],
      languageId: autoClosingLanguageId,
      editorOpts: {
        autoClosingOvertype: "always"
      }
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.type("x=(", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.setSelections("test", [new Selection(1, 4, 1, 4)]);
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(1), "x=()");
      viewModel.setSelections("test", [new Selection(2, 4, 2, 4)]);
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getLineContent(2), "y=();");
    });
  });
  test("issue #15825: accents on mac US intl keyboard", () => {
    usingCursor({
      text: [],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.startComposition();
      viewModel.type("`", "keyboard");
      viewModel.compositionType("\xE8", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "\xE8");
    });
  });
  test("issue #90016: allow accents on mac US intl keyboard to surround selection", () => {
    usingCursor({
      text: [
        "test"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 5)]);
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "'test'");
    });
  });
  test("issue #53357: Over typing ignores characters after backslash", () => {
    usingCursor({
      text: [
        "console.log();"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 13, 1, 13)]);
      viewModel.type("'", "keyboard");
      assert.strictEqual(model.getValue(), "console.log('');");
      viewModel.type("it", "keyboard");
      assert.strictEqual(model.getValue(), "console.log('it');");
      viewModel.type("\\", "keyboard");
      assert.strictEqual(model.getValue(), "console.log('it\\');");
      viewModel.type("'", "keyboard");
      assert.strictEqual(model.getValue(), "console.log('it\\'');");
    });
  });
  test("issue #84998: Overtyping Brackets doesn't work after backslash", () => {
    usingCursor({
      text: [
        ""
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1)]);
      viewModel.type("\\", "keyboard");
      assert.strictEqual(model.getValue(), "\\");
      viewModel.type("(", "keyboard");
      assert.strictEqual(model.getValue(), "\\()");
      viewModel.type("abc", "keyboard");
      assert.strictEqual(model.getValue(), "\\(abc)");
      viewModel.type("\\", "keyboard");
      assert.strictEqual(model.getValue(), "\\(abc\\)");
      viewModel.type(")", "keyboard");
      assert.strictEqual(model.getValue(), "\\(abc\\)");
    });
  });
  test("issue #2773: Accents (\xB4`\xA8^, others?) are inserted in the wrong position (Mac)", () => {
    usingCursor({
      text: [
        "hello",
        "world"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.startComposition();
      viewModel.type("`", "keyboard");
      moveDown(editor, viewModel, true);
      viewModel.compositionType("`", 1, 0, 0, "keyboard");
      viewModel.compositionType("`", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "`hello\nworld");
      assertCursor(viewModel, new Selection(1, 2, 2, 2));
    });
  });
  test("issue #26820: auto close quotes when not used as accents", () => {
    usingCursor({
      text: [
        ""
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "''");
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "''");
      model.setValue("'abc");
      viewModel.setSelections("test", [new Selection(1, 5, 1, 5)]);
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "'abc'");
      model.setValue("'abc'def ");
      viewModel.setSelections("test", [new Selection(1, 10, 1, 10)]);
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "'abc'def ''");
      model.setValue("abc");
      viewModel.setSelections("test", [new Selection(1, 1, 1, 1)]);
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      model.setValue("abc");
      viewModel.setSelections("test", [new Selection(1, 4, 1, 4)]);
      viewModel.startComposition();
      viewModel.type("'", "keyboard");
      viewModel.compositionType("'", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "abc'");
    });
  });
  test("issue #144690: Quotes do not overtype when using US Intl PC keyboard layout", () => {
    usingCursor({
      text: [
        ""
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      assertCursor(viewModel, new Position(1, 1));
      viewModel.startComposition();
      viewModel.type(`'`, "keyboard");
      viewModel.compositionType(`'`, 1, 0, 0, "keyboard");
      viewModel.compositionType(`'`, 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      viewModel.startComposition();
      viewModel.type(`'`, "keyboard");
      viewModel.compositionType(`';`, 1, 0, 0, "keyboard");
      viewModel.compositionType(`';`, 2, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), `'';`);
    });
  });
  test("issue #144693: Typing a quote using US Intl PC keyboard layout always surrounds words", () => {
    usingCursor({
      text: [
        "const hello = 3;"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 7, 1, 12)]);
      viewModel.startComposition();
      viewModel.type(`'`, "keyboard");
      viewModel.compositionType(`\xE9`, 1, 0, 0, "keyboard");
      viewModel.compositionType(`\xE9`, 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), `const \xE9 = 3;`);
    });
  });
  test("issue #82701: auto close does not execute when IME is canceled via backspace", () => {
    usingCursor({
      text: [
        "{}"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 2, 1, 2)]);
      viewModel.startComposition();
      viewModel.type("a", "keyboard");
      viewModel.compositionType("", 1, 0, 0, "keyboard");
      viewModel.endComposition("keyboard");
      assert.strictEqual(model.getValue(), "{}");
    });
  });
  test("issue #20891: All cursors should do the same thing", () => {
    usingCursor({
      text: [
        "var a = asd"
      ],
      languageId: autoClosingLanguageId
    }, (editor, model, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 9, 1, 9),
        new Selection(1, 12, 1, 12)
      ]);
      viewModel.type("`", "keyboard");
      assert.strictEqual(model.getValue(), "var a = `asd`");
    });
  });
  test("issue #41825: Special handling of quotes in surrounding pairs", () => {
    const languageId = "myMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      surroundingPairs: [
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    }));
    const model = createTextModel2("var x = 'hi';", languageId);
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      editor.setSelections([
        new Selection(1, 9, 1, 10),
        new Selection(1, 12, 1, 13)
      ]);
      viewModel.type('"', "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), 'var x = "hi";', "assert1");
      editor.setSelections([
        new Selection(1, 9, 1, 10),
        new Selection(1, 12, 1, 13)
      ]);
      viewModel.type("'", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "var x = 'hi';", "assert2");
    });
  });
  test("All cursors should do the same thing when deleting left", () => {
    const model = createTextModel2(
      [
        "var a = ()"
      ].join("\n"),
      autoClosingLanguageId
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(1, 4, 1, 4),
        new Selection(1, 10, 1, 10)
      ]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), "va a = )");
    });
  });
  test("issue #7100: Mouse word selection is strange when non-word character is at the end of line", () => {
    const model = createTextModel2(
      [
        "before.a",
        "before",
        "hello:",
        "there:",
        "this is strange:",
        "here",
        "it",
        "is"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      CoreNavigationCommands.WordSelect.runEditorCommand(null, editor, {
        position: new Position(3, 7)
      });
      assertCursor(viewModel, new Selection(3, 7, 3, 7));
      CoreNavigationCommands.WordSelectDrag.runEditorCommand(null, editor, {
        position: new Position(4, 7)
      });
      assertCursor(viewModel, new Selection(3, 7, 4, 7));
    });
  });
  test("issue #112039: shift-continuing a double/triple-click and drag selection does not remember its starting mode", () => {
    const model = createTextModel2(
      [
        "just some text",
        "and another line",
        "and another one"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      CoreNavigationCommands.WordSelect.runEditorCommand(null, editor, {
        position: new Position(2, 6)
      });
      CoreNavigationCommands.MoveToSelect.runEditorCommand(null, editor, {
        position: new Position(1, 8)
      });
      assertCursor(viewModel, new Selection(2, 12, 1, 6));
    });
  });
  test("issue #158236: Shift click selection does not work on line number indicator", () => {
    const model = createTextModel2(
      [
        "just some text",
        "and another line",
        "and another one"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor, viewModel) => {
      CoreNavigationCommands.MoveTo.runEditorCommand(null, editor, {
        position: new Position(3, 5)
      });
      CoreNavigationCommands.LineSelectDrag.runEditorCommand(null, editor, {
        position: new Position(2, 1)
      });
      assertCursor(viewModel, new Selection(3, 5, 2, 1));
    });
  });
  test("issue #111513: Text gets automatically selected when typing at the same location in another editor", () => {
    const model = createTextModel2(
      [
        "just",
        "",
        "some text"
      ].join("\n")
    );
    withTestCodeEditor2(model, {}, (editor1, viewModel1) => {
      editor1.setSelections([
        new Selection(2, 1, 2, 1)
      ]);
      withTestCodeEditor2(model, {}, (editor2, viewModel2) => {
        editor2.setSelections([
          new Selection(2, 1, 2, 1)
        ]);
        viewModel2.type("e", "keyboard");
        assertCursor(viewModel2, new Position(2, 2));
        assertCursor(viewModel1, new Position(2, 2));
      });
    });
  });
});
suite("Undo stops", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("there is an undo stop between typing and deleting left", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      viewModel.type("first", "keyboard");
      assert.strictEqual(model.getLineContent(1), "A first line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A fir line");
      assertCursor(viewModel, new Selection(1, 6, 1, 6));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A first line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A  line");
      assertCursor(viewModel, new Selection(1, 3, 1, 3));
    });
    model.dispose();
  });
  test("there is an undo stop between typing and deleting right", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      viewModel.type("first", "keyboard");
      assert.strictEqual(model.getLineContent(1), "A first line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A firstine");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A first line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A  line");
      assertCursor(viewModel, new Selection(1, 3, 1, 3));
    });
    model.dispose();
  });
  test("there is an undo stop between deleting left and typing", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(2, 8, 2, 8)]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), " line");
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      viewModel.type("Second", "keyboard");
      assert.strictEqual(model.getLineContent(2), "Second line");
      assertCursor(viewModel, new Selection(2, 7, 2, 7));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), " line");
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another line");
      assertCursor(viewModel, new Selection(2, 8, 2, 8));
    });
    model.dispose();
  });
  test("there is an undo stop between deleting left and deleting right", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(2, 8, 2, 8)]);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), " line");
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "");
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), " line");
      assertCursor(viewModel, new Selection(2, 1, 2, 1));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another line");
      assertCursor(viewModel, new Selection(2, 8, 2, 8));
    });
    model.dispose();
  });
  test("there is an undo stop between deleting right and typing", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(2, 9, 2, 9)]);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another ");
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
      viewModel.type("text", "keyboard");
      assert.strictEqual(model.getLineContent(2), "Another text");
      assertCursor(viewModel, new Selection(2, 13, 2, 13));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another ");
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another line");
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
    });
    model.dispose();
  });
  test("there is an undo stop between deleting right and deleting left", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(2, 9, 2, 9)]);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another ");
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "An");
      assertCursor(viewModel, new Selection(2, 3, 2, 3));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another ");
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(2), "Another line");
      assertCursor(viewModel, new Selection(2, 9, 2, 9));
    });
    model.dispose();
  });
  test("inserts undo stop when typing space", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      viewModel.type("first and interesting", "keyboard");
      assert.strictEqual(model.getLineContent(1), "A first and interesting line");
      assertCursor(viewModel, new Selection(1, 24, 1, 24));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A first and line");
      assertCursor(viewModel, new Selection(1, 12, 1, 12));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A first line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getLineContent(1), "A  line");
      assertCursor(viewModel, new Selection(1, 3, 1, 3));
    });
    model.dispose();
  });
  test("can undo typing and EOL change in one undo stop", () => {
    const model = createTextModel(
      [
        "A  line",
        "Another line"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [new Selection(1, 3, 1, 3)]);
      viewModel.type("first", "keyboard");
      assert.strictEqual(model.getValue(), "A first line\nAnother line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      model.pushEOL(EndOfLineSequence.CRLF);
      assert.strictEqual(model.getValue(), "A first line\r\nAnother line");
      assertCursor(viewModel, new Selection(1, 8, 1, 8));
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), "A  line\nAnother line");
      assertCursor(viewModel, new Selection(1, 3, 1, 3));
    });
    model.dispose();
  });
  test("issue #93585: Undo multi cursor edit corrupts document", () => {
    const model = createTextModel(
      [
        "hello world",
        "hello world"
      ].join("\n")
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.setSelections("test", [
        new Selection(2, 7, 2, 12),
        new Selection(1, 7, 1, 12)
      ]);
      viewModel.type("no", "keyboard");
      assert.strictEqual(model.getValue(), "hello no\nhello no");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(), "hello world\nhello world");
    });
    model.dispose();
  });
  test("there is a single undo stop for consecutive whitespaces", () => {
    const model = createTextModel(
      [
        ""
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.type("a", "keyboard");
      viewModel.type("b", "keyboard");
      viewModel.type(" ", "keyboard");
      viewModel.type(" ", "keyboard");
      viewModel.type("c", "keyboard");
      viewModel.type("d", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "ab  cd", "assert1");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "ab  ", "assert2");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "ab", "assert3");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "", "assert4");
    });
    model.dispose();
  });
  test("there is no undo stop after a single whitespace", () => {
    const model = createTextModel(
      [
        ""
      ].join("\n"),
      void 0,
      {
        insertSpaces: false
      }
    );
    withTestCodeEditor(model, {}, (editor, viewModel) => {
      viewModel.type("a", "keyboard");
      viewModel.type("b", "keyboard");
      viewModel.type(" ", "keyboard");
      viewModel.type("c", "keyboard");
      viewModel.type("d", "keyboard");
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "ab cd", "assert1");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "ab", "assert3");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(model.getValue(EndOfLinePreference.LF), "", "assert4");
    });
    model.dispose();
  });
});
//# sourceMappingURL=cursor.test.js.map
