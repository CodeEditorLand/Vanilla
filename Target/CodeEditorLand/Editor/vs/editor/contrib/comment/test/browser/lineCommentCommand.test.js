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
import { Disposable, DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../common/core/selection.js";
import { ICommand } from "../../../../common/editorCommon.js";
import { ColorId, MetadataConsts } from "../../../../common/encodedTokenAttributes.js";
import { EncodedTokenizationResult, IState, TokenizationRegistry } from "../../../../common/languages.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { CommentRule } from "../../../../common/languages/languageConfiguration.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { NullState } from "../../../../common/languages/nullTokenize.js";
import { ILinePreflightData, IPreflightData, ISimpleModel, LineCommentCommand, Type } from "../../browser/lineCommentCommand.js";
import { testCommand } from "../../../../test/browser/testCommand.js";
import { TestLanguageConfigurationService } from "../../../../test/common/modes/testLanguageConfigurationService.js";
import { IInstantiationService, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
function createTestCommandHelper(commentsConfig, commandFactory) {
  return (lines, selection, expectedLines, expectedSelection) => {
    const languageId = "commentMode";
    const prepare = /* @__PURE__ */ __name((accessor, disposables) => {
      const languageConfigurationService = accessor.get(ILanguageConfigurationService);
      const languageService = accessor.get(ILanguageService);
      disposables.add(languageService.registerLanguage({ id: languageId }));
      disposables.add(languageConfigurationService.register(languageId, {
        comments: commentsConfig
      }));
    }, "prepare");
    testCommand(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, false, prepare);
  };
}
__name(createTestCommandHelper, "createTestCommandHelper");
suite("Editor Contrib - Line Comment Command", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const testLineCommentCommand = createTestCommandHelper(
    { lineComment: "!@#", blockComment: ["<!@#", "#@!>"] },
    (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, true, true)
  );
  const testAddLineCommentCommand = createTestCommandHelper(
    { lineComment: "!@#", blockComment: ["<!@#", "#@!>"] },
    (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.ForceAdd, true, true)
  );
  test("comment single line", function() {
    testLineCommentCommand(
      [
        "some text",
        "	some more text"
      ],
      new Selection(1, 1, 1, 1),
      [
        "!@# some text",
        "	some more text"
      ],
      new Selection(1, 5, 1, 5)
    );
  });
  test("case insensitive", function() {
    const testLineCommentCommand2 = createTestCommandHelper(
      { lineComment: "rem" },
      (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, true, true)
    );
    testLineCommentCommand2(
      [
        "REM some text"
      ],
      new Selection(1, 1, 1, 1),
      [
        "some text"
      ],
      new Selection(1, 1, 1, 1)
    );
  });
  function createSimpleModel(lines) {
    return {
      getLineContent: /* @__PURE__ */ __name((lineNumber) => {
        return lines[lineNumber - 1];
      }, "getLineContent")
    };
  }
  __name(createSimpleModel, "createSimpleModel");
  function createBasicLinePreflightData(commentTokens) {
    return commentTokens.map((commentString) => {
      const r = {
        ignore: false,
        commentStr: commentString,
        commentStrOffset: 0,
        commentStrLength: commentString.length
      };
      return r;
    });
  }
  __name(createBasicLinePreflightData, "createBasicLinePreflightData");
  test("_analyzeLines", () => {
    const disposable = new DisposableStore();
    let r;
    r = LineCommentCommand._analyzeLines(Type.Toggle, true, createSimpleModel([
      "		",
      "    ",
      "    c",
      "		d"
    ]), createBasicLinePreflightData(["//", "rem", "!@#", "!@#"]), 1, true, false, disposable.add(new TestLanguageConfigurationService()));
    if (!r.supported) {
      throw new Error(`unexpected`);
    }
    assert.strictEqual(r.shouldRemoveComments, false);
    assert.strictEqual(r.lines[0].commentStr, "//");
    assert.strictEqual(r.lines[1].commentStr, "rem");
    assert.strictEqual(r.lines[2].commentStr, "!@#");
    assert.strictEqual(r.lines[3].commentStr, "!@#");
    assert.strictEqual(r.lines[0].ignore, true);
    assert.strictEqual(r.lines[1].ignore, true);
    assert.strictEqual(r.lines[2].ignore, false);
    assert.strictEqual(r.lines[3].ignore, false);
    assert.strictEqual(r.lines[0].commentStrOffset, 2);
    assert.strictEqual(r.lines[1].commentStrOffset, 4);
    assert.strictEqual(r.lines[2].commentStrOffset, 4);
    assert.strictEqual(r.lines[3].commentStrOffset, 2);
    r = LineCommentCommand._analyzeLines(Type.Toggle, true, createSimpleModel([
      "		",
      "    rem ",
      "    !@# c",
      "		!@#d"
    ]), createBasicLinePreflightData(["//", "rem", "!@#", "!@#"]), 1, true, false, disposable.add(new TestLanguageConfigurationService()));
    if (!r.supported) {
      throw new Error(`unexpected`);
    }
    assert.strictEqual(r.shouldRemoveComments, true);
    assert.strictEqual(r.lines[0].commentStr, "//");
    assert.strictEqual(r.lines[1].commentStr, "rem");
    assert.strictEqual(r.lines[2].commentStr, "!@#");
    assert.strictEqual(r.lines[3].commentStr, "!@#");
    assert.strictEqual(r.lines[0].ignore, true);
    assert.strictEqual(r.lines[1].ignore, false);
    assert.strictEqual(r.lines[2].ignore, false);
    assert.strictEqual(r.lines[3].ignore, false);
    assert.strictEqual(r.lines[0].commentStrOffset, 2);
    assert.strictEqual(r.lines[1].commentStrOffset, 4);
    assert.strictEqual(r.lines[2].commentStrOffset, 4);
    assert.strictEqual(r.lines[3].commentStrOffset, 2);
    assert.strictEqual(r.lines[0].commentStrLength, 2);
    assert.strictEqual(r.lines[1].commentStrLength, 4);
    assert.strictEqual(r.lines[2].commentStrLength, 4);
    assert.strictEqual(r.lines[3].commentStrLength, 3);
    disposable.dispose();
  });
  test("_normalizeInsertionPoint", () => {
    const runTest = /* @__PURE__ */ __name((mixedArr, tabSize, expected, testName) => {
      const model = createSimpleModel(mixedArr.filter((item, idx) => idx % 2 === 0));
      const offsets = mixedArr.filter((item, idx) => idx % 2 === 1).map((offset) => {
        return {
          commentStrOffset: offset,
          ignore: false
        };
      });
      LineCommentCommand._normalizeInsertionPoint(model, offsets, 1, tabSize);
      const actual = offsets.map((item) => item.commentStrOffset);
      assert.deepStrictEqual(actual, expected, testName);
    }, "runTest");
    runTest([
      "  XX",
      2,
      "    YY",
      4
    ], 4, [0, 0], "Bug 16696");
    runTest([
      "			XX",
      3,
      "    	YY",
      5,
      "        ZZ",
      8,
      "		TT",
      2
    ], 4, [2, 5, 8, 2], "Test1");
    runTest([
      "			   XX",
      6,
      "    				YY",
      8,
      "        ZZ",
      8,
      "		    TT",
      6
    ], 4, [2, 5, 8, 2], "Test2");
    runTest([
      "		",
      2,
      "			",
      3,
      "				",
      4,
      "			",
      3
    ], 4, [2, 2, 2, 2], "Test3");
    runTest([
      "		",
      2,
      "			",
      3,
      "				",
      4,
      "			",
      3,
      "    ",
      4
    ], 2, [2, 2, 2, 2, 4], "Test4");
    runTest([
      "		",
      2,
      "			",
      3,
      "				",
      4,
      "			",
      3,
      "    ",
      4
    ], 4, [1, 1, 1, 1, 4], "Test5");
    runTest([
      " 	",
      2,
      "  	",
      3,
      "   	",
      4,
      "    ",
      4,
      "	",
      1
    ], 4, [2, 3, 4, 4, 1], "Test6");
    runTest([
      " 		",
      3,
      "  		",
      4,
      "   		",
      5,
      "    	",
      5,
      "	",
      1
    ], 4, [2, 3, 4, 4, 1], "Test7");
    runTest([
      "	",
      1,
      "    ",
      4
    ], 4, [1, 4], "Test8:4");
    runTest([
      "	",
      1,
      "   ",
      3
    ], 4, [0, 0], "Test8:3");
    runTest([
      "	",
      1,
      "  ",
      2
    ], 4, [0, 0], "Test8:2");
    runTest([
      "	",
      1,
      " ",
      1
    ], 4, [0, 0], "Test8:1");
    runTest([
      "	",
      1,
      "",
      0
    ], 4, [0, 0], "Test8:0");
  });
  test("detects indentation", function() {
    testLineCommentCommand(
      [
        "	some text",
        "	some more text"
      ],
      new Selection(2, 2, 1, 1),
      [
        "	!@# some text",
        "	!@# some more text"
      ],
      new Selection(2, 2, 1, 1)
    );
  });
  test("detects mixed indentation", function() {
    testLineCommentCommand(
      [
        "	some text",
        "    some more text"
      ],
      new Selection(2, 2, 1, 1),
      [
        "	!@# some text",
        "    !@# some more text"
      ],
      new Selection(2, 2, 1, 1)
    );
  });
  test("ignores whitespace lines", function() {
    testLineCommentCommand(
      [
        "	some text",
        "	   ",
        "",
        "	some more text"
      ],
      new Selection(4, 2, 1, 1),
      [
        "	!@# some text",
        "	   ",
        "",
        "	!@# some more text"
      ],
      new Selection(4, 2, 1, 1)
    );
  });
  test("removes its own", function() {
    testLineCommentCommand(
      [
        "	!@# some text",
        "	   ",
        "		!@# some more text"
      ],
      new Selection(3, 2, 1, 1),
      [
        "	some text",
        "	   ",
        "		some more text"
      ],
      new Selection(3, 2, 1, 1)
    );
  });
  test("works in only whitespace", function() {
    testLineCommentCommand(
      [
        "	    ",
        "	",
        "		some more text"
      ],
      new Selection(3, 1, 1, 1),
      [
        "	!@#     ",
        "	!@# ",
        "		some more text"
      ],
      new Selection(3, 1, 1, 1)
    );
  });
  test("bug 9697 - whitespace before comment token", function() {
    testLineCommentCommand(
      [
        "	 !@#first",
        "	second line"
      ],
      new Selection(1, 1, 1, 1),
      [
        "	 first",
        "	second line"
      ],
      new Selection(1, 1, 1, 1)
    );
  });
  test("bug 10162 - line comment before caret", function() {
    testLineCommentCommand(
      [
        "first!@#",
        "	second line"
      ],
      new Selection(1, 1, 1, 1),
      [
        "!@# first!@#",
        "	second line"
      ],
      new Selection(1, 5, 1, 5)
    );
  });
  test("comment single line - leading whitespace", function() {
    testLineCommentCommand(
      [
        "first!@#",
        "	second line"
      ],
      new Selection(2, 3, 2, 1),
      [
        "first!@#",
        "	!@# second line"
      ],
      new Selection(2, 7, 2, 1)
    );
  });
  test("ignores invisible selection", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 1, 1, 1),
      [
        "!@# first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 1, 1, 5)
    );
  });
  test("multiple lines", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 4, 1, 1),
      [
        "!@# first",
        "!@# 	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 8, 1, 5)
    );
  });
  test("multiple modes on multiple lines", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(4, 4, 3, 1),
      [
        "first",
        "	second line",
        "!@# third line",
        "!@# fourth line",
        "fifth"
      ],
      new Selection(4, 8, 3, 5)
    );
  });
  test("toggle single line", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 1, 1, 1),
      [
        "!@# first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 5, 1, 5)
    );
    testLineCommentCommand(
      [
        "!@# first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 4, 1, 4),
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 1, 1, 1)
    );
  });
  test("toggle multiple lines", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 4, 1, 1),
      [
        "!@# first",
        "!@# 	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 8, 1, 5)
    );
    testLineCommentCommand(
      [
        "!@# first",
        "!@# 	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 7, 1, 4),
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 3, 1, 1)
    );
  });
  test("issue #5964: Ctrl+/ to create comment when cursor is at the beginning of the line puts the cursor in a strange position", () => {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 1, 1, 1),
      [
        "!@# first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 5, 1, 5)
    );
  });
  test("issue #35673: Comment hotkeys throws the cursor before the comment", () => {
    testLineCommentCommand(
      [
        "first",
        "",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 1, 2, 1),
      [
        "first",
        "!@# ",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 5, 2, 5)
    );
    testLineCommentCommand(
      [
        "first",
        "	",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 2, 2, 2),
      [
        "first",
        "	!@# ",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(2, 6, 2, 6)
    );
  });
  test('issue #2837 "Add Line Comment" fault when blank lines involved', function() {
    testAddLineCommentCommand(
      [
        '    if displayName == "":',
        "        displayName = groupName",
        '    description = getAttr(attributes, "description")',
        '    mailAddress = getAttr(attributes, "mail")',
        "",
        '    print "||Group name|%s|" % displayName',
        '    print "||Description|%s|" % description',
        '    print "||Email address|[mailto:%s]|" % mailAddress`'
      ],
      new Selection(1, 1, 8, 56),
      [
        '    !@# if displayName == "":',
        "    !@#     displayName = groupName",
        '    !@# description = getAttr(attributes, "description")',
        '    !@# mailAddress = getAttr(attributes, "mail")',
        "",
        '    !@# print "||Group name|%s|" % displayName',
        '    !@# print "||Description|%s|" % description',
        '    !@# print "||Email address|[mailto:%s]|" % mailAddress`'
      ],
      new Selection(1, 1, 8, 60)
    );
  });
  test("issue #47004: Toggle comments shouldn't move cursor", () => {
    testAddLineCommentCommand(
      [
        "    A line",
        "    Another line"
      ],
      new Selection(2, 7, 1, 1),
      [
        "    !@# A line",
        "    !@# Another line"
      ],
      new Selection(2, 11, 1, 1)
    );
  });
  test("insertSpace false", () => {
    const testLineCommentCommand2 = createTestCommandHelper(
      { lineComment: "!@#" },
      (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, false, true)
    );
    testLineCommentCommand2(
      [
        "some text"
      ],
      new Selection(1, 1, 1, 1),
      [
        "!@#some text"
      ],
      new Selection(1, 4, 1, 4)
    );
  });
  test("insertSpace false does not remove space", () => {
    const testLineCommentCommand2 = createTestCommandHelper(
      { lineComment: "!@#" },
      (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, false, true)
    );
    testLineCommentCommand2(
      [
        "!@#    some text"
      ],
      new Selection(1, 1, 1, 1),
      [
        "    some text"
      ],
      new Selection(1, 1, 1, 1)
    );
  });
});
suite("ignoreEmptyLines false", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const testLineCommentCommand = createTestCommandHelper(
    { lineComment: "!@#", blockComment: ["<!@#", "#@!>"] },
    (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, true, false)
  );
  test("does not ignore whitespace lines", () => {
    testLineCommentCommand(
      [
        "	some text",
        "	   ",
        "",
        "	some more text"
      ],
      new Selection(4, 2, 1, 1),
      [
        "!@# 	some text",
        "!@# 	   ",
        "!@# ",
        "!@# 	some more text"
      ],
      new Selection(4, 6, 1, 5)
    );
  });
  test("removes its own", function() {
    testLineCommentCommand(
      [
        "	!@# some text",
        "	   ",
        "		!@# some more text"
      ],
      new Selection(3, 2, 1, 1),
      [
        "	some text",
        "	   ",
        "		some more text"
      ],
      new Selection(3, 2, 1, 1)
    );
  });
  test("works in only whitespace", function() {
    testLineCommentCommand(
      [
        "	    ",
        "	",
        "		some more text"
      ],
      new Selection(3, 1, 1, 1),
      [
        "	!@#     ",
        "	!@# ",
        "		some more text"
      ],
      new Selection(3, 1, 1, 1)
    );
  });
  test("comments single line", function() {
    testLineCommentCommand(
      [
        "some text",
        "	some more text"
      ],
      new Selection(1, 1, 1, 1),
      [
        "!@# some text",
        "	some more text"
      ],
      new Selection(1, 5, 1, 5)
    );
  });
  test("detects indentation", function() {
    testLineCommentCommand(
      [
        "	some text",
        "	some more text"
      ],
      new Selection(2, 2, 1, 1),
      [
        "	!@# some text",
        "	!@# some more text"
      ],
      new Selection(2, 2, 1, 1)
    );
  });
});
suite("Editor Contrib - Line Comment As Block Comment", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const testLineCommentCommand = createTestCommandHelper(
    { lineComment: "", blockComment: ["(", ")"] },
    (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, true, true)
  );
  test("fall back to block comment command", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 1, 1, 1),
      [
        "( first )",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 3, 1, 3)
    );
  });
  test("fall back to block comment command - toggle", function() {
    testLineCommentCommand(
      [
        "(first)",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 7, 1, 2),
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 6, 1, 1)
    );
  });
  test("bug 9513 - expand single line to uncomment auto block", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 1, 1, 1),
      [
        "( first )",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(1, 3, 1, 3)
    );
  });
  test("bug 9691 - always expand selection to line boundaries", function() {
    testLineCommentCommand(
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(3, 2, 1, 3),
      [
        "( first",
        "	second line",
        "third line )",
        "fourth line",
        "fifth"
      ],
      new Selection(3, 2, 1, 5)
    );
    testLineCommentCommand(
      [
        "(first",
        "	second line",
        "third line)",
        "fourth line",
        "fifth"
      ],
      new Selection(3, 11, 1, 2),
      [
        "first",
        "	second line",
        "third line",
        "fourth line",
        "fifth"
      ],
      new Selection(3, 11, 1, 1)
    );
  });
});
suite("Editor Contrib - Line Comment As Block Comment 2", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const testLineCommentCommand = createTestCommandHelper(
    { lineComment: null, blockComment: ["<!@#", "#@!>"] },
    (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, true, true)
  );
  test("no selection => uses indentation", function() {
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(1, 1, 1, 1),
      [
        "		<!@# first	     #@!>",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(1, 1, 1, 1)
    );
    testLineCommentCommand(
      [
        "		<!@#first	    #@!>",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(1, 1, 1, 1),
      [
        "		first	   ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(1, 1, 1, 1)
    );
  });
  test("can remove", function() {
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(5, 1, 5, 1),
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		fifth		"
      ],
      new Selection(5, 1, 5, 1)
    );
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(5, 3, 5, 3),
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		fifth		"
      ],
      new Selection(5, 3, 5, 3)
    );
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(5, 4, 5, 4),
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		fifth		"
      ],
      new Selection(5, 3, 5, 3)
    );
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(5, 16, 5, 3),
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		fifth		"
      ],
      new Selection(5, 8, 5, 3)
    );
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(5, 12, 5, 7),
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		fifth		"
      ],
      new Selection(5, 8, 5, 3)
    );
    testLineCommentCommand(
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		<!@#fifth#@!>		"
      ],
      new Selection(5, 18, 5, 18),
      [
        "		first	    ",
        "		second line",
        "	third line",
        "fourth line",
        "		fifth		"
      ],
      new Selection(5, 10, 5, 10)
    );
  });
  test("issue #993: Remove comment does not work consistently in HTML", () => {
    testLineCommentCommand(
      [
        "     asd qwe",
        "     asd qwe",
        ""
      ],
      new Selection(1, 1, 3, 1),
      [
        "     <!@# asd qwe",
        "     asd qwe #@!>",
        ""
      ],
      new Selection(1, 1, 3, 1)
    );
    testLineCommentCommand(
      [
        "     <!@#asd qwe",
        "     asd qwe#@!>",
        ""
      ],
      new Selection(1, 1, 3, 1),
      [
        "     asd qwe",
        "     asd qwe",
        ""
      ],
      new Selection(1, 1, 3, 1)
    );
  });
});
suite("Editor Contrib - Line Comment in mixed modes", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const OUTER_LANGUAGE_ID = "outerMode";
  const INNER_LANGUAGE_ID = "innerMode";
  let OuterMode = class extends Disposable {
    static {
      __name(this, "OuterMode");
    }
    languageId = OUTER_LANGUAGE_ID;
    constructor(commentsConfig, languageService, languageConfigurationService) {
      super();
      this._register(languageService.registerLanguage({ id: this.languageId }));
      this._register(languageConfigurationService.register(this.languageId, {
        comments: commentsConfig
      }));
      this._register(TokenizationRegistry.register(this.languageId, {
        getInitialState: /* @__PURE__ */ __name(() => NullState, "getInitialState"),
        tokenize: /* @__PURE__ */ __name(() => {
          throw new Error("not implemented");
        }, "tokenize"),
        tokenizeEncoded: /* @__PURE__ */ __name((line, hasEOL, state) => {
          const languageId = /^  /.test(line) ? INNER_LANGUAGE_ID : OUTER_LANGUAGE_ID;
          const encodedLanguageId = languageService.languageIdCodec.encodeLanguageId(languageId);
          const tokens = new Uint32Array(1 << 1);
          tokens[0 << 1] = 0;
          tokens[(0 << 1) + 1] = ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET | encodedLanguageId << MetadataConsts.LANGUAGEID_OFFSET;
          return new EncodedTokenizationResult(tokens, state);
        }, "tokenizeEncoded")
      }));
    }
  };
  OuterMode = __decorateClass([
    __decorateParam(1, ILanguageService),
    __decorateParam(2, ILanguageConfigurationService)
  ], OuterMode);
  let InnerMode = class extends Disposable {
    static {
      __name(this, "InnerMode");
    }
    languageId = INNER_LANGUAGE_ID;
    constructor(commentsConfig, languageService, languageConfigurationService) {
      super();
      this._register(languageService.registerLanguage({ id: this.languageId }));
      this._register(languageConfigurationService.register(this.languageId, {
        comments: commentsConfig
      }));
    }
  };
  InnerMode = __decorateClass([
    __decorateParam(1, ILanguageService),
    __decorateParam(2, ILanguageConfigurationService)
  ], InnerMode);
  function testLineCommentCommand(lines, selection, expectedLines, expectedSelection) {
    const setup = /* @__PURE__ */ __name((accessor, disposables) => {
      const instantiationService = accessor.get(IInstantiationService);
      disposables.add(instantiationService.createInstance(OuterMode, { lineComment: "//", blockComment: ["/*", "*/"] }));
      disposables.add(instantiationService.createInstance(InnerMode, { lineComment: null, blockComment: ["{/*", "*/}"] }));
    }, "setup");
    testCommand(
      lines,
      OUTER_LANGUAGE_ID,
      selection,
      (accessor, sel) => new LineCommentCommand(accessor.get(ILanguageConfigurationService), sel, 4, Type.Toggle, true, true),
      expectedLines,
      expectedSelection,
      true,
      setup
    );
  }
  __name(testLineCommentCommand, "testLineCommentCommand");
  test("issue #24047 (part 1): Commenting code in JSX files", () => {
    testLineCommentCommand(
      [
        "import React from 'react';",
        "const Loader = () => (",
        "  <div>",
        "    Loading...",
        "  </div>",
        ");",
        "export default Loader;"
      ],
      new Selection(1, 1, 7, 22),
      [
        "// import React from 'react';",
        "// const Loader = () => (",
        "//   <div>",
        "//     Loading...",
        "//   </div>",
        "// );",
        "// export default Loader;"
      ],
      new Selection(1, 4, 7, 25)
    );
  });
  test("issue #24047 (part 2): Commenting code in JSX files", () => {
    testLineCommentCommand(
      [
        "import React from 'react';",
        "const Loader = () => (",
        "  <div>",
        "    Loading...",
        "  </div>",
        ");",
        "export default Loader;"
      ],
      new Selection(3, 4, 3, 4),
      [
        "import React from 'react';",
        "const Loader = () => (",
        "  {/* <div> */}",
        "    Loading...",
        "  </div>",
        ");",
        "export default Loader;"
      ],
      new Selection(3, 8, 3, 8)
    );
  });
  test("issue #36173: Commenting code in JSX tag body", () => {
    testLineCommentCommand(
      [
        "<div>",
        "  {123}",
        "</div>"
      ],
      new Selection(2, 4, 2, 4),
      [
        "<div>",
        "  {/* {123} */}",
        "</div>"
      ],
      new Selection(2, 8, 2, 8)
    );
  });
});
//# sourceMappingURL=lineCommentCommand.test.js.map
