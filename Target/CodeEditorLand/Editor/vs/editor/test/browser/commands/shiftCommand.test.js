var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import assert from "assert";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ShiftCommand } from "../../../common/commands/shiftCommand.js";
import { EditorAutoIndentStrategy } from "../../../common/config/editorOptions.js";
import { ISingleEditOperation } from "../../../common/core/editOperation.js";
import { Range } from "../../../common/core/range.js";
import { Selection } from "../../../common/core/selection.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { getEditOperation, testCommand } from "../testCommand.js";
import { javascriptOnEnterRules } from "../../common/modes/supports/onEnterRules.js";
import { TestLanguageConfigurationService } from "../../common/modes/testLanguageConfigurationService.js";
import { withEditorModel } from "../../common/testTextModel.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
  return {
    range: new Range(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn),
    text,
    forceMoveMarkers: false
  };
}
__name(createSingleEditOp, "createSingleEditOp");
let DocBlockCommentMode = class extends Disposable {
  static {
    __name(this, "DocBlockCommentMode");
  }
  static languageId = "commentMode";
  languageId = DocBlockCommentMode.languageId;
  constructor(languageService, languageConfigurationService) {
    super();
    this._register(languageService.registerLanguage({ id: this.languageId }));
    this._register(languageConfigurationService.register(this.languageId, {
      brackets: [
        ["(", ")"],
        ["{", "}"],
        ["[", "]"]
      ],
      onEnterRules: javascriptOnEnterRules
    }));
  }
};
DocBlockCommentMode = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, ILanguageConfigurationService)
], DocBlockCommentMode);
function testShiftCommand(lines, languageId, useTabStops, selection, expectedLines, expectedSelection, prepare) {
  testCommand(lines, languageId, selection, (accessor, sel) => new ShiftCommand(sel, {
    isUnshift: false,
    tabSize: 4,
    indentSize: 4,
    insertSpaces: false,
    useTabStops,
    autoIndent: EditorAutoIndentStrategy.Full
  }, accessor.get(ILanguageConfigurationService)), expectedLines, expectedSelection, void 0, prepare);
}
__name(testShiftCommand, "testShiftCommand");
function testUnshiftCommand(lines, languageId, useTabStops, selection, expectedLines, expectedSelection, prepare) {
  testCommand(lines, languageId, selection, (accessor, sel) => new ShiftCommand(sel, {
    isUnshift: true,
    tabSize: 4,
    indentSize: 4,
    insertSpaces: false,
    useTabStops,
    autoIndent: EditorAutoIndentStrategy.Full
  }, accessor.get(ILanguageConfigurationService)), expectedLines, expectedSelection, void 0, prepare);
}
__name(testUnshiftCommand, "testUnshiftCommand");
function prepareDocBlockCommentLanguage(accessor, disposables) {
  const languageConfigurationService = accessor.get(ILanguageConfigurationService);
  const languageService = accessor.get(ILanguageService);
  disposables.add(new DocBlockCommentMode(languageService, languageConfigurationService));
}
__name(prepareDocBlockCommentLanguage, "prepareDocBlockCommentLanguage");
suite("Editor Commands - ShiftCommand", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Bug 9503: Shifting without any selection", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 1, 1),
      [
        "	My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 2, 1, 2)
    );
  });
  test("shift on single line selection 1", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 3, 1, 1),
      [
        "	My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 4, 1, 1)
    );
  });
  test("shift on single line selection 2", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 1, 3),
      [
        "	My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 1, 1, 4)
    );
  });
  test("simple shift", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 2, 1),
      [
        "	My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 1, 2, 1)
    );
  });
  test("shifting on two separate lines", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 2, 1),
      [
        "	My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 1, 2, 1)
    );
    testShiftCommand(
      [
        "	My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(2, 1, 3, 1),
      [
        "	My First Line",
        "			My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(2, 1, 3, 1)
    );
  });
  test("shifting on two lines", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 2, 2, 2),
      [
        "	My First Line",
        "			My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 3, 2, 2)
    );
  });
  test("shifting on two lines again", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(2, 2, 1, 2),
      [
        "	My First Line",
        "			My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(2, 2, 1, 3)
    );
  });
  test("shifting at end of file", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(4, 1, 5, 2),
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "	123"
      ],
      new Selection(4, 1, 5, 3)
    );
  });
  test("issue #1120 TAB should not indent empty lines in a multi-line selection", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 5, 2),
      [
        "	My First Line",
        "			My Second Line",
        "		Third Line",
        "",
        "	123"
      ],
      new Selection(1, 1, 5, 3)
    );
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(4, 1, 5, 1),
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "	",
        "123"
      ],
      new Selection(4, 1, 5, 1)
    );
  });
  test("unshift on single line selection 1", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(2, 3, 2, 1),
      [
        "My First Line",
        "			My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(2, 3, 2, 1)
    );
  });
  test("unshift on single line selection 2", () => {
    testShiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(2, 1, 2, 3),
      [
        "My First Line",
        "			My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(2, 1, 2, 3)
    );
  });
  test("simple unshift", () => {
    testUnshiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 2, 1),
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 1, 2, 1)
    );
  });
  test("unshifting on two lines 1", () => {
    testUnshiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 2, 2, 2),
      [
        "My First Line",
        "	My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(1, 2, 2, 2)
    );
  });
  test("unshifting on two lines 2", () => {
    testUnshiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(2, 3, 2, 1),
      [
        "My First Line",
        "	My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(2, 2, 2, 1)
    );
  });
  test("unshifting at the end of the file", () => {
    testUnshiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(4, 1, 5, 2),
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(4, 1, 5, 2)
    );
  });
  test("unshift many times + shift", () => {
    testUnshiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 5, 4),
      [
        "My First Line",
        "	My Second Line",
        "Third Line",
        "",
        "123"
      ],
      new Selection(1, 1, 5, 4)
    );
    testUnshiftCommand(
      [
        "My First Line",
        "	My Second Line",
        "Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 5, 4),
      [
        "My First Line",
        "My Second Line",
        "Third Line",
        "",
        "123"
      ],
      new Selection(1, 1, 5, 4)
    );
    testShiftCommand(
      [
        "My First Line",
        "My Second Line",
        "Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(1, 1, 5, 4),
      [
        "	My First Line",
        "	My Second Line",
        "	Third Line",
        "",
        "	123"
      ],
      new Selection(1, 1, 5, 5)
    );
  });
  test("Bug 9119: Unshift from first column doesn't work", () => {
    testUnshiftCommand(
      [
        "My First Line",
        "		My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      null,
      true,
      new Selection(2, 1, 2, 1),
      [
        "My First Line",
        "	My Second Line",
        "    Third Line",
        "",
        "123"
      ],
      new Selection(2, 1, 2, 1)
    );
  });
  test("issue #348: indenting around doc block comments", () => {
    testShiftCommand(
      [
        "",
        "/**",
        " * a doc comment",
        " */",
        "function hello() {}"
      ],
      DocBlockCommentMode.languageId,
      true,
      new Selection(1, 1, 5, 20),
      [
        "",
        "	/**",
        "	 * a doc comment",
        "	 */",
        "	function hello() {}"
      ],
      new Selection(1, 1, 5, 21),
      prepareDocBlockCommentLanguage
    );
    testUnshiftCommand(
      [
        "",
        "/**",
        " * a doc comment",
        " */",
        "function hello() {}"
      ],
      DocBlockCommentMode.languageId,
      true,
      new Selection(1, 1, 5, 20),
      [
        "",
        "/**",
        " * a doc comment",
        " */",
        "function hello() {}"
      ],
      new Selection(1, 1, 5, 20),
      prepareDocBlockCommentLanguage
    );
    testUnshiftCommand(
      [
        "	",
        "	/**",
        "	 * a doc comment",
        "	 */",
        "	function hello() {}"
      ],
      DocBlockCommentMode.languageId,
      true,
      new Selection(1, 1, 5, 21),
      [
        "",
        "/**",
        " * a doc comment",
        " */",
        "function hello() {}"
      ],
      new Selection(1, 1, 5, 20),
      prepareDocBlockCommentLanguage
    );
  });
  test("issue #1609: Wrong indentation of block comments", () => {
    testShiftCommand(
      [
        "",
        "/**",
        " * test",
        " *",
        " * @type {number}",
        " */",
        "var foo = 0;"
      ],
      DocBlockCommentMode.languageId,
      true,
      new Selection(1, 1, 7, 13),
      [
        "",
        "	/**",
        "	 * test",
        "	 *",
        "	 * @type {number}",
        "	 */",
        "	var foo = 0;"
      ],
      new Selection(1, 1, 7, 14),
      prepareDocBlockCommentLanguage
    );
  });
  test("issue #1620: a) Line indent doesn't handle leading whitespace properly", () => {
    testCommand(
      [
        "   Written | Numeric",
        "       one | 1",
        "       two | 2",
        "     three | 3",
        "      four | 4",
        "      five | 5",
        "       six | 6",
        "     seven | 7",
        "     eight | 8",
        "      nine | 9",
        "       ten | 10",
        "    eleven | 11",
        ""
      ],
      null,
      new Selection(1, 1, 13, 1),
      (accessor, sel) => new ShiftCommand(sel, {
        isUnshift: false,
        tabSize: 4,
        indentSize: 4,
        insertSpaces: true,
        useTabStops: false,
        autoIndent: EditorAutoIndentStrategy.Full
      }, accessor.get(ILanguageConfigurationService)),
      [
        "       Written | Numeric",
        "           one | 1",
        "           two | 2",
        "         three | 3",
        "          four | 4",
        "          five | 5",
        "           six | 6",
        "         seven | 7",
        "         eight | 8",
        "          nine | 9",
        "           ten | 10",
        "        eleven | 11",
        ""
      ],
      new Selection(1, 1, 13, 1)
    );
  });
  test("issue #1620: b) Line indent doesn't handle leading whitespace properly", () => {
    testCommand(
      [
        "       Written | Numeric",
        "           one | 1",
        "           two | 2",
        "         three | 3",
        "          four | 4",
        "          five | 5",
        "           six | 6",
        "         seven | 7",
        "         eight | 8",
        "          nine | 9",
        "           ten | 10",
        "        eleven | 11",
        ""
      ],
      null,
      new Selection(1, 1, 13, 1),
      (accessor, sel) => new ShiftCommand(sel, {
        isUnshift: true,
        tabSize: 4,
        indentSize: 4,
        insertSpaces: true,
        useTabStops: false,
        autoIndent: EditorAutoIndentStrategy.Full
      }, accessor.get(ILanguageConfigurationService)),
      [
        "   Written | Numeric",
        "       one | 1",
        "       two | 2",
        "     three | 3",
        "      four | 4",
        "      five | 5",
        "       six | 6",
        "     seven | 7",
        "     eight | 8",
        "      nine | 9",
        "       ten | 10",
        "    eleven | 11",
        ""
      ],
      new Selection(1, 1, 13, 1)
    );
  });
  test("issue #1620: c) Line indent doesn't handle leading whitespace properly", () => {
    testCommand(
      [
        "       Written | Numeric",
        "           one | 1",
        "           two | 2",
        "         three | 3",
        "          four | 4",
        "          five | 5",
        "           six | 6",
        "         seven | 7",
        "         eight | 8",
        "          nine | 9",
        "           ten | 10",
        "        eleven | 11",
        ""
      ],
      null,
      new Selection(1, 1, 13, 1),
      (accessor, sel) => new ShiftCommand(sel, {
        isUnshift: true,
        tabSize: 4,
        indentSize: 4,
        insertSpaces: false,
        useTabStops: false,
        autoIndent: EditorAutoIndentStrategy.Full
      }, accessor.get(ILanguageConfigurationService)),
      [
        "   Written | Numeric",
        "       one | 1",
        "       two | 2",
        "     three | 3",
        "      four | 4",
        "      five | 5",
        "       six | 6",
        "     seven | 7",
        "     eight | 8",
        "      nine | 9",
        "       ten | 10",
        "    eleven | 11",
        ""
      ],
      new Selection(1, 1, 13, 1)
    );
  });
  test("issue #1620: d) Line indent doesn't handle leading whitespace properly", () => {
    testCommand(
      [
        "	   Written | Numeric",
        "	       one | 1",
        "	       two | 2",
        "	     three | 3",
        "	      four | 4",
        "	      five | 5",
        "	       six | 6",
        "	     seven | 7",
        "	     eight | 8",
        "	      nine | 9",
        "	       ten | 10",
        "	    eleven | 11",
        ""
      ],
      null,
      new Selection(1, 1, 13, 1),
      (accessor, sel) => new ShiftCommand(sel, {
        isUnshift: true,
        tabSize: 4,
        indentSize: 4,
        insertSpaces: true,
        useTabStops: false,
        autoIndent: EditorAutoIndentStrategy.Full
      }, accessor.get(ILanguageConfigurationService)),
      [
        "   Written | Numeric",
        "       one | 1",
        "       two | 2",
        "     three | 3",
        "      four | 4",
        "      five | 5",
        "       six | 6",
        "     seven | 7",
        "     eight | 8",
        "      nine | 9",
        "       ten | 10",
        "    eleven | 11",
        ""
      ],
      new Selection(1, 1, 13, 1)
    );
  });
  test("issue microsoft/monaco-editor#443: Indentation of a single row deletes selected text in some cases", () => {
    testCommand(
      [
        "Hello world!",
        "another line"
      ],
      null,
      new Selection(1, 1, 1, 13),
      (accessor, sel) => new ShiftCommand(sel, {
        isUnshift: false,
        tabSize: 4,
        indentSize: 4,
        insertSpaces: false,
        useTabStops: true,
        autoIndent: EditorAutoIndentStrategy.Full
      }, accessor.get(ILanguageConfigurationService)),
      [
        "	Hello world!",
        "another line"
      ],
      new Selection(1, 1, 1, 14)
    );
  });
  test("bug #16815:Shift+Tab doesn't go back to tabstop", () => {
    const repeatStr = /* @__PURE__ */ __name((str, cnt) => {
      let r = "";
      for (let i = 0; i < cnt; i++) {
        r += str;
      }
      return r;
    }, "repeatStr");
    const testOutdent = /* @__PURE__ */ __name((tabSize, indentSize, insertSpaces, lineText, expectedIndents) => {
      const oneIndent = insertSpaces ? repeatStr(" ", indentSize) : "	";
      const expectedIndent = repeatStr(oneIndent, expectedIndents);
      if (lineText.length > 0) {
        _assertUnshiftCommand(tabSize, indentSize, insertSpaces, [lineText + "aaa"], [createSingleEditOp(expectedIndent, 1, 1, 1, lineText.length + 1)]);
      } else {
        _assertUnshiftCommand(tabSize, indentSize, insertSpaces, [lineText + "aaa"], []);
      }
    }, "testOutdent");
    const testIndent = /* @__PURE__ */ __name((tabSize, indentSize, insertSpaces, lineText, expectedIndents) => {
      const oneIndent = insertSpaces ? repeatStr(" ", indentSize) : "	";
      const expectedIndent = repeatStr(oneIndent, expectedIndents);
      _assertShiftCommand(tabSize, indentSize, insertSpaces, [lineText + "aaa"], [createSingleEditOp(expectedIndent, 1, 1, 1, lineText.length + 1)]);
    }, "testIndent");
    const testIndentation = /* @__PURE__ */ __name((tabSize, indentSize, lineText, expectedOnOutdent, expectedOnIndent) => {
      testOutdent(tabSize, indentSize, true, lineText, expectedOnOutdent);
      testOutdent(tabSize, indentSize, false, lineText, expectedOnOutdent);
      testIndent(tabSize, indentSize, true, lineText, expectedOnIndent);
      testIndent(tabSize, indentSize, false, lineText, expectedOnIndent);
    }, "testIndentation");
    testIndentation(4, 4, "", 0, 1);
    testIndentation(4, 4, "	", 0, 2);
    testIndentation(4, 4, " ", 0, 1);
    testIndentation(4, 4, " 	", 0, 2);
    testIndentation(4, 4, "  ", 0, 1);
    testIndentation(4, 4, "  	", 0, 2);
    testIndentation(4, 4, "   ", 0, 1);
    testIndentation(4, 4, "   	", 0, 2);
    testIndentation(4, 4, "    ", 0, 2);
    testIndentation(4, 4, "		", 1, 3);
    testIndentation(4, 4, "	 ", 1, 2);
    testIndentation(4, 4, "	 	", 1, 3);
    testIndentation(4, 4, "	  ", 1, 2);
    testIndentation(4, 4, "	  	", 1, 3);
    testIndentation(4, 4, "	   ", 1, 2);
    testIndentation(4, 4, "	   	", 1, 3);
    testIndentation(4, 4, "	    ", 1, 3);
    testIndentation(4, 4, " 		", 1, 3);
    testIndentation(4, 4, " 	 ", 1, 2);
    testIndentation(4, 4, " 	 	", 1, 3);
    testIndentation(4, 4, " 	  ", 1, 2);
    testIndentation(4, 4, " 	  	", 1, 3);
    testIndentation(4, 4, " 	   ", 1, 2);
    testIndentation(4, 4, " 	   	", 1, 3);
    testIndentation(4, 4, " 	    ", 1, 3);
    testIndentation(4, 4, "  		", 1, 3);
    testIndentation(4, 4, "  	 ", 1, 2);
    testIndentation(4, 4, "  	 	", 1, 3);
    testIndentation(4, 4, "  	  ", 1, 2);
    testIndentation(4, 4, "  	  	", 1, 3);
    testIndentation(4, 4, "  	   ", 1, 2);
    testIndentation(4, 4, "  	   	", 1, 3);
    testIndentation(4, 4, "  	    ", 1, 3);
    testIndentation(4, 4, "   		", 1, 3);
    testIndentation(4, 4, "   	 ", 1, 2);
    testIndentation(4, 4, "   	 	", 1, 3);
    testIndentation(4, 4, "   	  ", 1, 2);
    testIndentation(4, 4, "   	  	", 1, 3);
    testIndentation(4, 4, "   	   ", 1, 2);
    testIndentation(4, 4, "   	   	", 1, 3);
    testIndentation(4, 4, "   	    ", 1, 3);
    testIndentation(4, 4, "    	", 1, 3);
    testIndentation(4, 4, "     ", 1, 2);
    testIndentation(4, 4, "     	", 1, 3);
    testIndentation(4, 4, "      ", 1, 2);
    testIndentation(4, 4, "      	", 1, 3);
    testIndentation(4, 4, "       ", 1, 2);
    testIndentation(4, 4, "       	", 1, 3);
    testIndentation(4, 4, "        ", 1, 3);
    testIndentation(4, 4, "         ", 2, 3);
    function _assertUnshiftCommand(tabSize, indentSize, insertSpaces, text, expected) {
      return withEditorModel(text, (model) => {
        const testLanguageConfigurationService = new TestLanguageConfigurationService();
        const op = new ShiftCommand(new Selection(1, 1, text.length + 1, 1), {
          isUnshift: true,
          tabSize,
          indentSize,
          insertSpaces,
          useTabStops: true,
          autoIndent: EditorAutoIndentStrategy.Full
        }, testLanguageConfigurationService);
        const actual = getEditOperation(model, op);
        assert.deepStrictEqual(actual, expected);
        testLanguageConfigurationService.dispose();
      });
    }
    __name(_assertUnshiftCommand, "_assertUnshiftCommand");
    function _assertShiftCommand(tabSize, indentSize, insertSpaces, text, expected) {
      return withEditorModel(text, (model) => {
        const testLanguageConfigurationService = new TestLanguageConfigurationService();
        const op = new ShiftCommand(new Selection(1, 1, text.length + 1, 1), {
          isUnshift: false,
          tabSize,
          indentSize,
          insertSpaces,
          useTabStops: true,
          autoIndent: EditorAutoIndentStrategy.Full
        }, testLanguageConfigurationService);
        const actual = getEditOperation(model, op);
        assert.deepStrictEqual(actual, expected);
        testLanguageConfigurationService.dispose();
      });
    }
    __name(_assertShiftCommand, "_assertShiftCommand");
  });
});
//# sourceMappingURL=shiftCommand.test.js.map
