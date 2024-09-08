import assert from "assert";
import { mock } from "../../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { Selection } from "../../../../common/core/selection.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { createTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { TestLanguageConfigurationService } from "../../../../test/common/modes/testLanguageConfigurationService.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import { SnippetParser } from "../../browser/snippetParser.js";
import { SnippetSession } from "../../browser/snippetSession.js";
suite("SnippetSession", () => {
  let languageConfigurationService;
  let editor;
  let model;
  function assertSelections(editor2, ...s) {
    for (const selection of editor2.getSelections()) {
      const actual = s.shift();
      assert.ok(
        selection.equalsSelection(actual),
        `actual=${selection.toString()} <> expected=${actual.toString()}`
      );
    }
    assert.strictEqual(s.length, 0);
  }
  setup(() => {
    model = createTextModel("function foo() {\n    console.log(a);\n}");
    languageConfigurationService = new TestLanguageConfigurationService();
    const serviceCollection = new ServiceCollection(
      [ILabelService, new class extends mock() {
      }()],
      [ILanguageConfigurationService, languageConfigurationService],
      [
        IWorkspaceContextService,
        new class extends mock() {
          getWorkspace() {
            return {
              id: "workspace-id",
              folders: []
            };
          }
        }()
      ]
    );
    editor = createTestCodeEditor(model, {
      serviceCollection
    });
    editor.setSelections([
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    ]);
    assert.strictEqual(model.getEOL(), "\n");
  });
  teardown(() => {
    model.dispose();
    editor.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("normalize whitespace", () => {
    function assertNormalized(position, input, expected) {
      const snippet = new SnippetParser().parse(input);
      SnippetSession.adjustWhitespace(model, position, true, snippet);
      assert.strictEqual(snippet.toTextmateString(), expected);
    }
    assertNormalized(new Position(1, 1), "foo", "foo");
    assertNormalized(new Position(1, 1), "foo\rbar", "foo\nbar");
    assertNormalized(new Position(1, 1), "foo\rbar", "foo\nbar");
    assertNormalized(new Position(2, 5), "foo\r	bar", "foo\n        bar");
    assertNormalized(new Position(2, 3), "foo\r	bar", "foo\n    bar");
    assertNormalized(
      new Position(2, 5),
      "foo\r	bar\nfoo",
      "foo\n        bar\n    foo"
    );
    assertNormalized(
      new Position(2, 5),
      "a\nb${1|foo,\nbar|}",
      "a\n    b${1|foo,\nbar|}"
    );
  });
  test("adjust selection (overwrite[Before|After])", () => {
    let range = SnippetSession.adjustSelection(
      model,
      new Selection(1, 2, 1, 2),
      1,
      0
    );
    assert.ok(range.equalsRange(new Range(1, 1, 1, 2)));
    range = SnippetSession.adjustSelection(
      model,
      new Selection(1, 2, 1, 2),
      1111,
      0
    );
    assert.ok(range.equalsRange(new Range(1, 1, 1, 2)));
    range = SnippetSession.adjustSelection(
      model,
      new Selection(1, 2, 1, 2),
      0,
      10
    );
    assert.ok(range.equalsRange(new Range(1, 2, 1, 12)));
    range = SnippetSession.adjustSelection(
      model,
      new Selection(1, 2, 1, 2),
      0,
      10111
    );
    assert.ok(range.equalsRange(new Range(1, 2, 1, 17)));
  });
  test("text edits & selection", () => {
    const session = new SnippetSession(
      editor,
      "foo${1:bar}foo$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      editor.getModel().getValue(),
      "foobarfoofunction foo() {\n    foobarfooconsole.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(1, 4, 1, 7),
      new Selection(2, 8, 2, 11)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 10, 1, 10),
      new Selection(2, 14, 2, 14)
    );
  });
  test("text edit with reversed selection", () => {
    const session = new SnippetSession(
      editor,
      "${1:bar}$0",
      void 0,
      languageConfigurationService
    );
    editor.setSelections([
      new Selection(2, 5, 2, 5),
      new Selection(1, 1, 1, 1)
    ]);
    session.insert();
    assert.strictEqual(
      model.getValue(),
      "barfunction foo() {\n    barconsole.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(2, 5, 2, 8),
      new Selection(1, 1, 1, 4)
    );
  });
  test("snippets, repeated tabstops", () => {
    const session = new SnippetSession(
      editor,
      "${1:abc}foo${1:abc}$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 4),
      new Selection(1, 7, 1, 10),
      new Selection(2, 5, 2, 8),
      new Selection(2, 11, 2, 14)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 10, 1, 10),
      new Selection(2, 14, 2, 14)
    );
  });
  test("snippets, just text", () => {
    const session = new SnippetSession(
      editor,
      "foobar",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      model.getValue(),
      "foobarfunction foo() {\n    foobarconsole.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(1, 7, 1, 7),
      new Selection(2, 11, 2, 11)
    );
  });
  test("snippets, selections and new text with newlines", () => {
    const session = new SnippetSession(
      editor,
      "foo\n	${1:bar}\n$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      editor.getModel().getValue(),
      "foo\n    bar\nfunction foo() {\n    foo\n        bar\n    console.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(2, 5, 2, 8),
      new Selection(5, 9, 5, 12)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(3, 1, 3, 1),
      new Selection(6, 5, 6, 5)
    );
  });
  test("snippets, newline NO whitespace adjust", () => {
    editor.setSelection(new Selection(2, 5, 2, 5));
    const session = new SnippetSession(
      editor,
      "abc\n    foo\n        bar\n$0",
      {
        overwriteBefore: 0,
        overwriteAfter: 0,
        adjustWhitespace: false,
        clipboardText: void 0,
        overtypingCapturer: void 0
      },
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      editor.getModel().getValue(),
      "function foo() {\n    abc\n    foo\n        bar\nconsole.log(a);\n}"
    );
  });
  test("snippets, selections -> next/prev", () => {
    const session = new SnippetSession(
      editor,
      "f$1oo${2:bar}foo$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 2, 1, 2),
      new Selection(2, 6, 2, 6)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 4, 1, 7),
      new Selection(2, 8, 2, 11)
    );
    session.prev();
    assertSelections(
      editor,
      new Selection(1, 2, 1, 2),
      new Selection(2, 6, 2, 6)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 4, 1, 7),
      new Selection(2, 8, 2, 11)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 10, 1, 10),
      new Selection(2, 14, 2, 14)
    );
  });
  test("snippets, selections & typing", () => {
    const session = new SnippetSession(
      editor,
      "f${1:oo}_$2_$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    editor.trigger("test", "type", { text: "X" });
    session.next();
    editor.trigger("test", "type", { text: "bar" });
    session.prev();
    assertSelections(
      editor,
      new Selection(1, 2, 1, 3),
      new Selection(2, 6, 2, 7)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 4, 1, 7),
      new Selection(2, 8, 2, 11)
    );
    session.next();
    assert.strictEqual(
      model.getValue(),
      "fX_bar_function foo() {\n    fX_bar_console.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(1, 8, 1, 8),
      new Selection(2, 12, 2, 12)
    );
  });
  test("snippets, insert shorter snippet into non-empty selection", () => {
    model.setValue("foo_bar_foo");
    editor.setSelections([
      new Selection(1, 1, 1, 4),
      new Selection(1, 9, 1, 12)
    ]);
    new SnippetSession(
      editor,
      "x$0",
      void 0,
      languageConfigurationService
    ).insert();
    assert.strictEqual(model.getValue(), "x_bar_x");
    assertSelections(
      editor,
      new Selection(1, 2, 1, 2),
      new Selection(1, 8, 1, 8)
    );
  });
  test("snippets, insert longer snippet into non-empty selection", () => {
    model.setValue("foo_bar_foo");
    editor.setSelections([
      new Selection(1, 1, 1, 4),
      new Selection(1, 9, 1, 12)
    ]);
    new SnippetSession(
      editor,
      "LONGER$0",
      void 0,
      languageConfigurationService
    ).insert();
    assert.strictEqual(model.getValue(), "LONGER_bar_LONGER");
    assertSelections(
      editor,
      new Selection(1, 7, 1, 7),
      new Selection(1, 18, 1, 18)
    );
  });
  test("snippets, don't grow final tabstop", () => {
    model.setValue("foo_zzz_foo");
    editor.setSelection(new Selection(1, 5, 1, 8));
    const session = new SnippetSession(
      editor,
      "$1bar$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(editor, new Selection(1, 5, 1, 5));
    editor.trigger("test", "type", { text: "foo-" });
    session.next();
    assert.strictEqual(model.getValue(), "foo_foo-bar_foo");
    assertSelections(editor, new Selection(1, 12, 1, 12));
    editor.trigger("test", "type", { text: "XXX" });
    assert.strictEqual(model.getValue(), "foo_foo-barXXX_foo");
    session.prev();
    assertSelections(editor, new Selection(1, 5, 1, 9));
    session.next();
    assertSelections(editor, new Selection(1, 15, 1, 15));
  });
  test("snippets, don't merge touching tabstops 1/2", () => {
    const session = new SnippetSession(
      editor,
      "$1$2$3$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    session.next();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    session.prev();
    session.prev();
    session.prev();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    editor.trigger("test", "type", { text: "111" });
    session.next();
    editor.trigger("test", "type", { text: "222" });
    session.next();
    editor.trigger("test", "type", { text: "333" });
    session.next();
    assert.strictEqual(
      model.getValue(),
      "111222333function foo() {\n    111222333console.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(1, 10, 1, 10),
      new Selection(2, 14, 2, 14)
    );
    session.prev();
    assertSelections(
      editor,
      new Selection(1, 7, 1, 10),
      new Selection(2, 11, 2, 14)
    );
    session.prev();
    assertSelections(
      editor,
      new Selection(1, 4, 1, 7),
      new Selection(2, 8, 2, 11)
    );
    session.prev();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 4),
      new Selection(2, 5, 2, 8)
    );
  });
  test("snippets, don't merge touching tabstops 2/2", () => {
    const session = new SnippetSession(
      editor,
      "$1$2$3$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    editor.trigger("test", "type", { text: "111" });
    session.next();
    assertSelections(
      editor,
      new Selection(1, 4, 1, 4),
      new Selection(2, 8, 2, 8)
    );
    editor.trigger("test", "type", { text: "222" });
    session.next();
    assertSelections(
      editor,
      new Selection(1, 7, 1, 7),
      new Selection(2, 11, 2, 11)
    );
    editor.trigger("test", "type", { text: "333" });
    session.next();
    assert.strictEqual(session.isAtLastPlaceholder, true);
  });
  test("snippets, gracefully move over final tabstop", () => {
    const session = new SnippetSession(
      editor,
      "${1}bar$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(session.isAtLastPlaceholder, false);
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(2, 5, 2, 5)
    );
    session.next();
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(
      editor,
      new Selection(1, 4, 1, 4),
      new Selection(2, 8, 2, 8)
    );
    session.next();
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(
      editor,
      new Selection(1, 4, 1, 4),
      new Selection(2, 8, 2, 8)
    );
  });
  test("snippets, overwriting nested placeholder", () => {
    const session = new SnippetSession(
      editor,
      'log(${1:"$2"});$0',
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 5, 1, 7),
      new Selection(2, 9, 2, 11)
    );
    editor.trigger("test", "type", { text: "XXX" });
    assert.strictEqual(
      model.getValue(),
      "log(XXX);function foo() {\n    log(XXX);console.log(a);\n}"
    );
    session.next();
    assert.strictEqual(session.isAtLastPlaceholder, false);
    session.next();
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(
      editor,
      new Selection(1, 10, 1, 10),
      new Selection(2, 14, 2, 14)
    );
  });
  test("snippets, selections and snippet ranges", () => {
    const session = new SnippetSession(
      editor,
      "${1:foo}farboo${2:bar}$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      model.getValue(),
      "foofarboobarfunction foo() {\n    foofarboobarconsole.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(1, 1, 1, 4),
      new Selection(2, 5, 2, 8)
    );
    assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
    editor.setSelections([new Selection(1, 1, 1, 1)]);
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    editor.setSelections([
      new Selection(1, 6, 1, 6),
      new Selection(2, 10, 2, 10)
    ]);
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    editor.setSelections([
      new Selection(1, 6, 1, 6),
      new Selection(2, 10, 2, 10),
      new Selection(1, 1, 1, 1)
    ]);
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    editor.setSelections([
      new Selection(1, 6, 1, 6),
      new Selection(2, 10, 2, 10),
      new Selection(2, 20, 2, 21)
    ]);
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    session.next();
    assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
    assertSelections(
      editor,
      new Selection(1, 10, 1, 13),
      new Selection(2, 14, 2, 17)
    );
    session.next();
    assert.strictEqual(session.isSelectionWithinPlaceholders(), true);
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(
      editor,
      new Selection(1, 13, 1, 13),
      new Selection(2, 17, 2, 17)
    );
  });
  test("snippets, nested sessions", () => {
    model.setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const first = new SnippetSession(
      editor,
      "foo${2:bar}foo$0",
      void 0,
      languageConfigurationService
    );
    first.insert();
    assert.strictEqual(model.getValue(), "foobarfoo");
    assertSelections(editor, new Selection(1, 4, 1, 7));
    const second = new SnippetSession(
      editor,
      "ba${1:zzzz}$0",
      void 0,
      languageConfigurationService
    );
    second.insert();
    assert.strictEqual(model.getValue(), "foobazzzzfoo");
    assertSelections(editor, new Selection(1, 6, 1, 10));
    second.next();
    assert.strictEqual(second.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(1, 10, 1, 10));
    first.next();
    assert.strictEqual(first.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(1, 13, 1, 13));
  });
  test("snippets, typing at final tabstop", () => {
    const session = new SnippetSession(
      editor,
      "farboo$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    editor.trigger("test", "type", { text: "XXX" });
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
  });
  test("snippets, typing at beginning", () => {
    editor.setSelection(new Selection(1, 2, 1, 2));
    const session = new SnippetSession(
      editor,
      "farboo$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    editor.setSelection(new Selection(1, 2, 1, 2));
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    assert.strictEqual(session.isAtLastPlaceholder, true);
    editor.trigger("test", "type", { text: "XXX" });
    assert.strictEqual(
      model.getLineContent(1),
      "fXXXfarboounction foo() {"
    );
    assert.strictEqual(session.isSelectionWithinPlaceholders(), false);
    session.next();
    assertSelections(editor, new Selection(1, 11, 1, 11));
  });
  test("snippets, typing with nested placeholder", () => {
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "This ${1:is ${2:nested}}.$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(editor, new Selection(1, 6, 1, 15));
    session.next();
    assertSelections(editor, new Selection(1, 9, 1, 15));
    editor.trigger("test", "cut", {});
    assertSelections(editor, new Selection(1, 9, 1, 9));
    editor.trigger("test", "type", { text: "XXX" });
    session.prev();
    assertSelections(editor, new Selection(1, 6, 1, 12));
  });
  test("snippets, snippet with variables", () => {
    const session = new SnippetSession(
      editor,
      "@line=$TM_LINE_NUMBER$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      model.getValue(),
      "@line=1function foo() {\n    @line=2console.log(a);\n}"
    );
    assertSelections(
      editor,
      new Selection(1, 8, 1, 8),
      new Selection(2, 12, 2, 12)
    );
  });
  test("snippets, merge", () => {
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "This ${1:is ${2:nested}}.$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    session.next();
    assertSelections(editor, new Selection(1, 9, 1, 15));
    session.merge("really ${1:nested}$0");
    assertSelections(editor, new Selection(1, 16, 1, 22));
    session.next();
    assertSelections(editor, new Selection(1, 22, 1, 22));
    assert.strictEqual(session.isAtLastPlaceholder, false);
    session.next();
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(1, 23, 1, 23));
    session.prev();
    editor.trigger("test", "type", { text: "AAA" });
    session.prev();
    assertSelections(editor, new Selection(1, 16, 1, 22));
    session.prev();
    assertSelections(editor, new Selection(1, 6, 1, 25));
  });
  test("snippets, transform", () => {
    editor.getModel().setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "${1/foo/bar/}$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(editor, new Selection(1, 1, 1, 1));
    editor.trigger("test", "type", { text: "foo" });
    session.next();
    assert.strictEqual(model.getValue(), "bar");
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(1, 4, 1, 4));
  });
  test("snippets, multi placeholder same index one transform", () => {
    editor.getModel().setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "$1 baz ${1/foo/bar/}$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 1),
      new Selection(1, 6, 1, 6)
    );
    editor.trigger("test", "type", { text: "foo" });
    session.next();
    assert.strictEqual(model.getValue(), "foo baz bar");
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(1, 12, 1, 12));
  });
  test("snippets, transform example", () => {
    editor.getModel().setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(editor, new Selection(1, 1, 1, 5));
    editor.trigger("test", "type", { text: "clk" });
    session.next();
    assertSelections(editor, new Selection(1, 7, 1, 11));
    editor.trigger("test", "type", { text: "std_logic" });
    session.next();
    assertSelections(editor, new Selection(1, 16, 1, 16));
    session.next();
    assert.strictEqual(model.getValue(), "clk : std_logic;\n");
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(2, 1, 2, 1));
  });
  test("snippets, transform with indent", () => {
    const snippet = [
      "private readonly ${1} = new Emitter<$2>();",
      "readonly ${1/^_(.*)/$1/}: Event<$2> = this.$1.event;",
      "$0"
    ].join("\n");
    const expected = [
      "{",
      "	private readonly _prop = new Emitter<string>();",
      "	readonly prop: Event<string> = this._prop.event;",
      "	",
      "}"
    ].join("\n");
    const base = ["{", "	", "}"].join("\n");
    editor.getModel().setValue(base);
    editor.getModel().updateOptions({ insertSpaces: false });
    editor.setSelection(new Selection(2, 2, 2, 2));
    const session = new SnippetSession(
      editor,
      snippet,
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(2, 19, 2, 19),
      new Selection(3, 11, 3, 11),
      new Selection(3, 28, 3, 28)
    );
    editor.trigger("test", "type", { text: "_prop" });
    session.next();
    assertSelections(
      editor,
      new Selection(2, 39, 2, 39),
      new Selection(3, 23, 3, 23)
    );
    editor.trigger("test", "type", { text: "string" });
    session.next();
    assert.strictEqual(model.getValue(), expected);
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(4, 2, 4, 2));
  });
  test("snippets, transform example hit if", () => {
    editor.getModel().setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "${1:name} : ${2:type}${3/\\s:=(.*)/${1:+ :=}${1}/};\n$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(editor, new Selection(1, 1, 1, 5));
    editor.trigger("test", "type", { text: "clk" });
    session.next();
    assertSelections(editor, new Selection(1, 7, 1, 11));
    editor.trigger("test", "type", { text: "std_logic" });
    session.next();
    assertSelections(editor, new Selection(1, 16, 1, 16));
    editor.trigger("test", "type", { text: " := '1'" });
    session.next();
    assert.strictEqual(model.getValue(), "clk : std_logic := '1';\n");
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(2, 1, 2, 1));
  });
  test("Snippet tab stop selection issue #96545, snippets, transform adjacent to previous placeholder", () => {
    editor.getModel().setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "${1:{}${2:fff}${1/{/}/}",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assertSelections(
      editor,
      new Selection(1, 1, 1, 2),
      new Selection(1, 5, 1, 6)
    );
    session.next();
    assert.strictEqual(model.getValue(), "{fff}");
    assertSelections(editor, new Selection(1, 2, 1, 5));
    editor.trigger("test", "type", { text: "ggg" });
    session.next();
    assert.strictEqual(model.getValue(), "{ggg}");
    assert.strictEqual(session.isAtLastPlaceholder, true);
    assertSelections(editor, new Selection(1, 6, 1, 6));
  });
  test("Snippet tab stop selection issue #96545", () => {
    editor.getModel().setValue("");
    const session = new SnippetSession(
      editor,
      "${1:{}${2:fff}${1/[\\{]/}/}$0",
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(editor.getModel().getValue(), "{fff{");
    assertSelections(
      editor,
      new Selection(1, 1, 1, 2),
      new Selection(1, 5, 1, 6)
    );
    session.next();
    assertSelections(editor, new Selection(1, 2, 1, 5));
  });
  test("Snippet placeholder index incorrect after using 2+ snippets in a row that each end with a placeholder, #30769", () => {
    editor.getModel().setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const session = new SnippetSession(
      editor,
      "test ${1:replaceme}",
      void 0,
      languageConfigurationService
    );
    session.insert();
    editor.trigger("test", "type", { text: "1" });
    editor.trigger("test", "type", { text: "\n" });
    assert.strictEqual(editor.getModel().getValue(), "test 1\n");
    session.merge("test ${1:replaceme}");
    editor.trigger("test", "type", { text: "2" });
    editor.trigger("test", "type", { text: "\n" });
    assert.strictEqual(editor.getModel().getValue(), "test 1\ntest 2\n");
    session.merge("test ${1:replaceme}");
    editor.trigger("test", "type", { text: "3" });
    editor.trigger("test", "type", { text: "\n" });
    assert.strictEqual(
      editor.getModel().getValue(),
      "test 1\ntest 2\ntest 3\n"
    );
    session.merge("test ${1:replaceme}");
    editor.trigger("test", "type", { text: "4" });
    editor.trigger("test", "type", { text: "\n" });
    assert.strictEqual(
      editor.getModel().getValue(),
      "test 1\ntest 2\ntest 3\ntest 4\n"
    );
  });
  test("Snippet variable text isn't whitespace normalised, #31124", () => {
    editor.getModel().setValue(["start", "		-one", "		-two", "end"].join("\n"));
    editor.getModel().updateOptions({ insertSpaces: false });
    editor.setSelection(new Selection(2, 2, 3, 7));
    new SnippetSession(
      editor,
      "<div>\n	$TM_SELECTED_TEXT\n</div>$0",
      void 0,
      languageConfigurationService
    ).insert();
    let expected = [
      "start",
      "	<div>",
      "			-one",
      "			-two",
      "	</div>",
      "end"
    ].join("\n");
    assert.strictEqual(editor.getModel().getValue(), expected);
    editor.getModel().setValue(["start", "		-one", "	-two", "end"].join("\n"));
    editor.getModel().updateOptions({ insertSpaces: false });
    editor.setSelection(new Selection(2, 2, 3, 7));
    new SnippetSession(
      editor,
      "<div>\n	$TM_SELECTED_TEXT\n</div>$0",
      void 0,
      languageConfigurationService
    ).insert();
    expected = [
      "start",
      "	<div>",
      "			-one",
      "		-two",
      "	</div>",
      "end"
    ].join("\n");
    assert.strictEqual(editor.getModel().getValue(), expected);
  });
  test("Selecting text from left to right, and choosing item messes up code, #31199", () => {
    const model2 = editor.getModel();
    model2.setValue("console.log");
    let actual = SnippetSession.adjustSelection(
      model2,
      new Selection(1, 12, 1, 9),
      3,
      0
    );
    assert.ok(actual.equalsSelection(new Selection(1, 9, 1, 6)));
    actual = SnippetSession.adjustSelection(
      model2,
      new Selection(1, 9, 1, 12),
      3,
      0
    );
    assert.ok(actual.equalsSelection(new Selection(1, 9, 1, 12)));
    editor.setSelections([new Selection(1, 9, 1, 12)]);
    new SnippetSession(
      editor,
      "far",
      {
        overwriteBefore: 3,
        overwriteAfter: 0,
        adjustWhitespace: true,
        clipboardText: void 0,
        overtypingCapturer: void 0
      },
      languageConfigurationService
    ).insert();
    assert.strictEqual(model2.getValue(), "console.far");
  });
  test("Tabs don't get replaced with spaces in snippet transformations #103818", () => {
    const model2 = editor.getModel();
    model2.setValue("\n{\n  \n}");
    model2.updateOptions({ insertSpaces: true, indentSize: 2 });
    editor.setSelections([
      new Selection(1, 1, 1, 1),
      new Selection(3, 6, 3, 6)
    ]);
    const session = new SnippetSession(
      editor,
      [
        "function animate () {",
        "	var ${1:a} = 12;",
        "	console.log(${1/(.*)/\n		$1\n	/})",
        "}"
      ].join("\n"),
      void 0,
      languageConfigurationService
    );
    session.insert();
    assert.strictEqual(
      model2.getValue(),
      [
        "function animate () {",
        "  var a = 12;",
        "  console.log(a)",
        "}",
        "{",
        "  function animate () {",
        "    var a = 12;",
        "    console.log(a)",
        "  }",
        "}"
      ].join("\n")
    );
    editor.trigger("test", "type", { text: "bbb" });
    session.next();
    assert.strictEqual(
      model2.getValue(),
      [
        "function animate () {",
        "  var bbb = 12;",
        "  console.log(",
        "    bbb",
        "  )",
        "}",
        "{",
        "  function animate () {",
        "    var bbb = 12;",
        "    console.log(",
        "      bbb",
        "    )",
        "  }",
        "}"
      ].join("\n")
    );
  });
  suite("createEditsAndSnippetsFromEdits", () => {
    test("empty", () => {
      const result = SnippetSession.createEditsAndSnippetsFromEdits(
        editor,
        [],
        true,
        true,
        void 0,
        void 0,
        languageConfigurationService
      );
      assert.deepStrictEqual(result.edits, []);
      assert.deepStrictEqual(result.snippets, []);
    });
    test("basic", () => {
      editor.getModel().setValue('foo("bar")');
      const result = SnippetSession.createEditsAndSnippetsFromEdits(
        editor,
        [
          { range: new Range(1, 5, 1, 9), template: "$1" },
          {
            range: new Range(1, 1, 1, 1),
            template: 'const ${1:new_const} = "bar"'
          }
        ],
        true,
        true,
        void 0,
        void 0,
        languageConfigurationService
      );
      assert.strictEqual(result.edits.length, 2);
      assert.deepStrictEqual(
        result.edits[0].range,
        new Range(1, 1, 1, 1)
      );
      assert.deepStrictEqual(
        result.edits[0].text,
        'const new_const = "bar"'
      );
      assert.deepStrictEqual(
        result.edits[1].range,
        new Range(1, 5, 1, 9)
      );
      assert.deepStrictEqual(result.edits[1].text, "new_const");
      assert.strictEqual(result.snippets.length, 1);
      assert.strictEqual(result.snippets[0].isTrivialSnippet, false);
    });
    test("with $SELECTION variable", () => {
      editor.getModel().setValue("Some text and a selection");
      editor.setSelections([new Selection(1, 17, 1, 26)]);
      const result = SnippetSession.createEditsAndSnippetsFromEdits(
        editor,
        [
          {
            range: new Range(1, 17, 1, 26),
            template: "wrapped <$SELECTION>"
          }
        ],
        true,
        true,
        void 0,
        void 0,
        languageConfigurationService
      );
      assert.strictEqual(result.edits.length, 1);
      assert.deepStrictEqual(
        result.edits[0].range,
        new Range(1, 17, 1, 26)
      );
      assert.deepStrictEqual(result.edits[0].text, "wrapped <selection>");
      assert.strictEqual(result.snippets.length, 1);
      assert.strictEqual(result.snippets[0].isTrivialSnippet, true);
    });
  });
});
