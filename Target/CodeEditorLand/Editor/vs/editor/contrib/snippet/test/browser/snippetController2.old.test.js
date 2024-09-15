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
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { Position } from "../../../../common/core/position.js";
import { Selection } from "../../../../common/core/selection.js";
import { LanguageFeaturesService } from "../../../../common/services/languageFeaturesService.js";
import { SnippetController2 } from "../../browser/snippetController2.js";
import { ITestCodeEditor, withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { TestLanguageConfigurationService } from "../../../../test/common/modes/testLanguageConfigurationService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
let TestSnippetController = class extends SnippetController2 {
  constructor(editor, _contextKeyService) {
    const testLanguageConfigurationService = new TestLanguageConfigurationService();
    super(editor, new NullLogService(), new LanguageFeaturesService(), _contextKeyService, testLanguageConfigurationService);
    this._contextKeyService = _contextKeyService;
    this._testLanguageConfigurationService = testLanguageConfigurationService;
  }
  static {
    __name(this, "TestSnippetController");
  }
  _testLanguageConfigurationService;
  dispose() {
    super.dispose();
    this._testLanguageConfigurationService.dispose();
  }
  isInSnippetMode() {
    return SnippetController2.InSnippetMode.getValue(this._contextKeyService);
  }
};
TestSnippetController = __decorateClass([
  __decorateParam(1, IContextKeyService)
], TestSnippetController);
suite("SnippetController", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function snippetTest(cb, lines) {
    if (!lines) {
      lines = [
        "function test() {",
        "	var x = 3;",
        "	var arr = [];",
        "	",
        "}"
      ];
    }
    const serviceCollection = new ServiceCollection(
      [ILabelService, new class extends mock() {
      }()],
      [IWorkspaceContextService, new class extends mock() {
      }()]
    );
    withTestCodeEditor(lines, { serviceCollection }, (editor) => {
      editor.getModel().updateOptions({
        insertSpaces: false
      });
      const snippetController = editor.registerAndInstantiateContribution(TestSnippetController.ID, TestSnippetController);
      const template = [
        "for (var ${1:index}; $1 < ${2:array}.length; $1++) {",
        "	var element = $2[$1];",
        "	$0",
        "}"
      ].join("\n");
      cb(editor, template, snippetController);
      snippetController.dispose();
    });
  }
  __name(snippetTest, "snippetTest");
  test("Simple accepted", () => {
    snippetTest((editor, template, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(template);
      assert.strictEqual(editor.getModel().getLineContent(4), "	for (var index; index < array.length; index++) {");
      assert.strictEqual(editor.getModel().getLineContent(5), "		var element = array[index];");
      assert.strictEqual(editor.getModel().getLineContent(6), "		");
      assert.strictEqual(editor.getModel().getLineContent(7), "	}");
      editor.trigger("test", "type", { text: "i" });
      assert.strictEqual(editor.getModel().getLineContent(4), "	for (var i; i < array.length; i++) {");
      assert.strictEqual(editor.getModel().getLineContent(5), "		var element = array[i];");
      assert.strictEqual(editor.getModel().getLineContent(6), "		");
      assert.strictEqual(editor.getModel().getLineContent(7), "	}");
      snippetController.next();
      editor.trigger("test", "type", { text: "arr" });
      assert.strictEqual(editor.getModel().getLineContent(4), "	for (var i; i < arr.length; i++) {");
      assert.strictEqual(editor.getModel().getLineContent(5), "		var element = arr[i];");
      assert.strictEqual(editor.getModel().getLineContent(6), "		");
      assert.strictEqual(editor.getModel().getLineContent(7), "	}");
      snippetController.prev();
      editor.trigger("test", "type", { text: "j" });
      assert.strictEqual(editor.getModel().getLineContent(4), "	for (var j; j < arr.length; j++) {");
      assert.strictEqual(editor.getModel().getLineContent(5), "		var element = arr[j];");
      assert.strictEqual(editor.getModel().getLineContent(6), "		");
      assert.strictEqual(editor.getModel().getLineContent(7), "	}");
      snippetController.next();
      snippetController.next();
      assert.deepStrictEqual(editor.getPosition(), new Position(6, 3));
    });
  });
  test("Simple canceled", () => {
    snippetTest((editor, template, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(template);
      assert.strictEqual(editor.getModel().getLineContent(4), "	for (var index; index < array.length; index++) {");
      assert.strictEqual(editor.getModel().getLineContent(5), "		var element = array[index];");
      assert.strictEqual(editor.getModel().getLineContent(6), "		");
      assert.strictEqual(editor.getModel().getLineContent(7), "	}");
      snippetController.cancel();
      assert.deepStrictEqual(editor.getPosition(), new Position(4, 16));
    });
  });
  test("Stops when calling model.setValue()", () => {
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(codeSnippet);
      editor.getModel().setValue("goodbye");
      assert.strictEqual(snippetController.isInSnippetMode(), false);
    });
  });
  test("Stops when undoing", () => {
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(codeSnippet);
      editor.getModel().undo();
      assert.strictEqual(snippetController.isInSnippetMode(), false);
    });
  });
  test("Stops when moving cursor outside", () => {
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(codeSnippet);
      editor.setPosition({ lineNumber: 1, column: 1 });
      assert.strictEqual(snippetController.isInSnippetMode(), false);
    });
  });
  test("Stops when disconnecting editor model", () => {
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(codeSnippet);
      editor.setModel(null);
      assert.strictEqual(snippetController.isInSnippetMode(), false);
    });
  });
  test("Stops when disposing editor", () => {
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setPosition({ lineNumber: 4, column: 2 });
      snippetController.insert(codeSnippet);
      snippetController.dispose();
      assert.strictEqual(snippetController.isInSnippetMode(), false);
    });
  });
  test("Final tabstop with multiple selections", () => {
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1),
        new Selection(2, 1, 2, 1)
      ]);
      codeSnippet = "foo$0";
      snippetController.insert(codeSnippet);
      assert.strictEqual(editor.getSelections().length, 2);
      const [first, second] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), first.toString());
      assert.ok(second.equalsRange({ startLineNumber: 2, startColumn: 4, endLineNumber: 2, endColumn: 4 }), second.toString());
    });
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1),
        new Selection(2, 1, 2, 1)
      ]);
      codeSnippet = "foo$0bar";
      snippetController.insert(codeSnippet);
      assert.strictEqual(editor.getSelections().length, 2);
      const [first, second] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), first.toString());
      assert.ok(second.equalsRange({ startLineNumber: 2, startColumn: 4, endLineNumber: 2, endColumn: 4 }), second.toString());
    });
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1),
        new Selection(1, 5, 1, 5)
      ]);
      codeSnippet = "foo$0bar";
      snippetController.insert(codeSnippet);
      assert.strictEqual(editor.getSelections().length, 2);
      const [first, second] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), first.toString());
      assert.ok(second.equalsRange({ startLineNumber: 1, startColumn: 14, endLineNumber: 1, endColumn: 14 }), second.toString());
    });
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1),
        new Selection(1, 5, 1, 5)
      ]);
      codeSnippet = "foo\n$0\nbar";
      snippetController.insert(codeSnippet);
      assert.strictEqual(editor.getSelections().length, 2);
      const [first, second] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 }), first.toString());
      assert.ok(second.equalsRange({ startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 1 }), second.toString());
    });
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1),
        new Selection(1, 5, 1, 5)
      ]);
      codeSnippet = "foo\n$0\nbar";
      snippetController.insert(codeSnippet);
      assert.strictEqual(editor.getSelections().length, 2);
      const [first, second] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 }), first.toString());
      assert.ok(second.equalsRange({ startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 1 }), second.toString());
    });
    snippetTest((editor, codeSnippet, snippetController) => {
      editor.setSelections([
        new Selection(2, 7, 2, 7)
      ]);
      codeSnippet = "xo$0r";
      snippetController.insert(codeSnippet, { overwriteBefore: 1 });
      assert.strictEqual(editor.getSelections().length, 1);
      assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 8, endColumn: 8, endLineNumber: 2 }));
    });
  });
  test("Final tabstop, #11742 simple", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelection(new Selection(1, 19, 1, 19));
      codeSnippet = "{{% url_**$1** %}}";
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getSelections().length, 1);
      assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 27, endLineNumber: 1, endColumn: 27 }));
      assert.strictEqual(editor.getModel().getValue(), "example example {{% url_**** %}}");
    }, ["example example sc"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelection(new Selection(1, 3, 1, 3));
      codeSnippet = [
        "afterEach((done) => {",
        "	${1}test",
        "});"
      ].join("\n");
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getSelections().length, 1);
      assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 2, endLineNumber: 2, endColumn: 2 }), editor.getSelection().toString());
      assert.strictEqual(editor.getModel().getValue(), "afterEach((done) => {\n	test\n});");
    }, ["af"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelection(new Selection(1, 3, 1, 3));
      codeSnippet = [
        "afterEach((done) => {",
        "${1}	test",
        "});"
      ].join("\n");
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getSelections().length, 1);
      assert.ok(editor.getSelection().equalsRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 }), editor.getSelection().toString());
      assert.strictEqual(editor.getModel().getValue(), "afterEach((done) => {\n	test\n});");
    }, ["af"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelection(new Selection(1, 9, 1, 9));
      codeSnippet = [
        "aft${1}er"
      ].join("\n");
      controller.insert(codeSnippet, { overwriteBefore: 8 });
      assert.strictEqual(editor.getModel().getValue(), "after");
      assert.strictEqual(editor.getSelections().length, 1);
      assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 4, endLineNumber: 1, endColumn: 4 }), editor.getSelection().toString());
    }, ["afterone"]);
  });
  test("Final tabstop, #11742 different indents", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(2, 4, 2, 4),
        new Selection(1, 3, 1, 3)
      ]);
      codeSnippet = [
        "afterEach((done) => {",
        "	${0}test",
        "});"
      ].join("\n");
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getSelections().length, 2);
      const [first, second] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 5, startColumn: 3, endLineNumber: 5, endColumn: 3 }), first.toString());
      assert.ok(second.equalsRange({ startLineNumber: 2, startColumn: 2, endLineNumber: 2, endColumn: 2 }), second.toString());
    }, ["af", "	af"]);
  });
  test("Final tabstop, #11890 stay at the beginning", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 5, 1, 5)
      ]);
      codeSnippet = [
        "afterEach((done) => {",
        "${1}	test",
        "});"
      ].join("\n");
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getSelections().length, 1);
      const [first] = editor.getSelections();
      assert.ok(first.equalsRange({ startLineNumber: 2, startColumn: 3, endLineNumber: 2, endColumn: 3 }), first.toString());
    }, ["  af"]);
  });
  test("Final tabstop, no tabstop", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 3, 1, 3)
      ]);
      codeSnippet = "afterEach";
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.ok(editor.getSelection().equalsRange({ startLineNumber: 1, startColumn: 10, endLineNumber: 1, endColumn: 10 }));
    }, ["af", "	af"]);
  });
  test("Multiple cursor and overwriteBefore/After, issue #11060", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 7, 1, 7),
        new Selection(2, 4, 2, 4)
      ]);
      codeSnippet = "_foo";
      controller.insert(codeSnippet, { overwriteBefore: 1 });
      assert.strictEqual(editor.getModel().getValue(), "this._foo\nabc_foo");
    }, ["this._", "abc"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 7, 1, 7),
        new Selection(2, 4, 2, 4)
      ]);
      codeSnippet = "XX";
      controller.insert(codeSnippet, { overwriteBefore: 1 });
      assert.strictEqual(editor.getModel().getValue(), "this.XX\nabcXX");
    }, ["this._", "abc"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 7, 1, 7),
        new Selection(2, 4, 2, 4),
        new Selection(3, 5, 3, 5)
      ]);
      codeSnippet = "_foo";
      controller.insert(codeSnippet, { overwriteBefore: 1 });
      assert.strictEqual(editor.getModel().getValue(), "this._foo\nabc_foo\ndef_foo");
    }, ["this._", "abc", "def_"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 7, 1, 7),
        // primary at `this._`
        new Selection(2, 4, 2, 4),
        new Selection(3, 6, 3, 6)
      ]);
      codeSnippet = "._foo";
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getModel().getValue(), "this._foo\nabc._foo\ndef._foo");
    }, ["this._", "abc", "def._"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(3, 6, 3, 6),
        // primary at `def._`
        new Selection(1, 7, 1, 7),
        new Selection(2, 4, 2, 4)
      ]);
      codeSnippet = "._foo";
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getModel().getValue(), "this._foo\nabc._foo\ndef._foo");
    }, ["this._", "abc", "def._"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(2, 4, 2, 4),
        // primary at `abc`
        new Selection(3, 6, 3, 6),
        new Selection(1, 7, 1, 7)
      ]);
      codeSnippet = "._foo";
      controller.insert(codeSnippet, { overwriteBefore: 2 });
      assert.strictEqual(editor.getModel().getValue(), "this._._foo\na._foo\ndef._._foo");
    }, ["this._", "abc", "def._"]);
  });
  test("Multiple cursor and overwriteBefore/After, #16277", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 5, 1, 5),
        new Selection(2, 5, 2, 5)
      ]);
      codeSnippet = "document";
      controller.insert(codeSnippet, { overwriteBefore: 3 });
      assert.strictEqual(editor.getModel().getValue(), "{document}\n{document && true}");
    }, ["{foo}", "{foo && true}"]);
  });
  test("Insert snippet twice, #19449", () => {
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1)
      ]);
      codeSnippet = "for (var ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }";
      controller.insert(codeSnippet);
      assert.strictEqual(editor.getModel().getValue(), "for (var i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }");
    }, ["for (var i=0; i<len; i++) {  }"]);
    snippetTest((editor, codeSnippet, controller) => {
      editor.setSelections([
        new Selection(1, 1, 1, 1)
      ]);
      codeSnippet = "for (let ${1:i}=0; ${1:i}<len; ${1:i}++) { $0 }";
      controller.insert(codeSnippet);
      assert.strictEqual(editor.getModel().getValue(), "for (let i=0; i<len; i++) {  }for (var i=0; i<len; i++) {  }");
    }, ["for (var i=0; i<len; i++) {  }"]);
  });
});
//# sourceMappingURL=snippetController2.old.test.js.map
