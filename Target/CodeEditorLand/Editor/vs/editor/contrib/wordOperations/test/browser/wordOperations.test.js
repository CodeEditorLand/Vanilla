var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { isFirefox } from "../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { CoreEditingCommands } from "../../../../browser/coreCommands.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorCommand } from "../../../../browser/editorExtensions.js";
import { Position } from "../../../../common/core/position.js";
import { Selection } from "../../../../common/core/selection.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { ViewModel } from "../../../../common/viewModel/viewModelImpl.js";
import { CursorWordEndLeft, CursorWordEndLeftSelect, CursorWordEndRight, CursorWordEndRightSelect, CursorWordLeft, CursorWordLeftSelect, CursorWordRight, CursorWordRightSelect, CursorWordStartLeft, CursorWordStartLeftSelect, CursorWordStartRight, CursorWordStartRightSelect, DeleteInsideWord, DeleteWordEndLeft, DeleteWordEndRight, DeleteWordLeft, DeleteWordRight, DeleteWordStartLeft, DeleteWordStartRight } from "../../browser/wordOperations.js";
import { deserializePipePositions, serializePipePositions, testRepeatedActionAndExtractPositions } from "./wordTestUtils.js";
import { createCodeEditorServices, instantiateTestCodeEditor, withTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { instantiateTextModel } from "../../../../test/common/testTextModel.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
suite("WordOperations", () => {
  const _cursorWordStartLeft = new CursorWordStartLeft();
  const _cursorWordEndLeft = new CursorWordEndLeft();
  const _cursorWordLeft = new CursorWordLeft();
  const _cursorWordStartLeftSelect = new CursorWordStartLeftSelect();
  const _cursorWordEndLeftSelect = new CursorWordEndLeftSelect();
  const _cursorWordLeftSelect = new CursorWordLeftSelect();
  const _cursorWordStartRight = new CursorWordStartRight();
  const _cursorWordEndRight = new CursorWordEndRight();
  const _cursorWordRight = new CursorWordRight();
  const _cursorWordStartRightSelect = new CursorWordStartRightSelect();
  const _cursorWordEndRightSelect = new CursorWordEndRightSelect();
  const _cursorWordRightSelect = new CursorWordRightSelect();
  const _deleteWordLeft = new DeleteWordLeft();
  const _deleteWordStartLeft = new DeleteWordStartLeft();
  const _deleteWordEndLeft = new DeleteWordEndLeft();
  const _deleteWordRight = new DeleteWordRight();
  const _deleteWordStartRight = new DeleteWordStartRight();
  const _deleteWordEndRight = new DeleteWordEndRight();
  const _deleteInsideWord = new DeleteInsideWord();
  let disposables;
  let instantiationService;
  let languageConfigurationService;
  let languageService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = createCodeEditorServices(disposables);
    languageConfigurationService = instantiationService.get(ILanguageConfigurationService);
    languageService = instantiationService.get(ILanguageService);
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function runEditorCommand(editor, command) {
    instantiationService.invokeFunction((accessor) => {
      command.runEditorCommand(accessor, editor, null);
    });
  }
  __name(runEditorCommand, "runEditorCommand");
  function cursorWordLeft(editor, inSelectionMode = false) {
    runEditorCommand(editor, inSelectionMode ? _cursorWordLeftSelect : _cursorWordLeft);
  }
  __name(cursorWordLeft, "cursorWordLeft");
  function cursorWordStartLeft(editor, inSelectionMode = false) {
    runEditorCommand(editor, inSelectionMode ? _cursorWordStartLeftSelect : _cursorWordStartLeft);
  }
  __name(cursorWordStartLeft, "cursorWordStartLeft");
  function cursorWordEndLeft(editor, inSelectionMode = false) {
    runEditorCommand(editor, inSelectionMode ? _cursorWordEndLeftSelect : _cursorWordEndLeft);
  }
  __name(cursorWordEndLeft, "cursorWordEndLeft");
  function cursorWordRight(editor, inSelectionMode = false) {
    runEditorCommand(editor, inSelectionMode ? _cursorWordRightSelect : _cursorWordRight);
  }
  __name(cursorWordRight, "cursorWordRight");
  function moveWordEndRight(editor, inSelectionMode = false) {
    runEditorCommand(editor, inSelectionMode ? _cursorWordEndRightSelect : _cursorWordEndRight);
  }
  __name(moveWordEndRight, "moveWordEndRight");
  function moveWordStartRight(editor, inSelectionMode = false) {
    runEditorCommand(editor, inSelectionMode ? _cursorWordStartRightSelect : _cursorWordStartRight);
  }
  __name(moveWordStartRight, "moveWordStartRight");
  function deleteWordLeft(editor) {
    runEditorCommand(editor, _deleteWordLeft);
  }
  __name(deleteWordLeft, "deleteWordLeft");
  function deleteWordStartLeft(editor) {
    runEditorCommand(editor, _deleteWordStartLeft);
  }
  __name(deleteWordStartLeft, "deleteWordStartLeft");
  function deleteWordEndLeft(editor) {
    runEditorCommand(editor, _deleteWordEndLeft);
  }
  __name(deleteWordEndLeft, "deleteWordEndLeft");
  function deleteWordRight(editor) {
    runEditorCommand(editor, _deleteWordRight);
  }
  __name(deleteWordRight, "deleteWordRight");
  function deleteWordStartRight(editor) {
    runEditorCommand(editor, _deleteWordStartRight);
  }
  __name(deleteWordStartRight, "deleteWordStartRight");
  function deleteWordEndRight(editor) {
    runEditorCommand(editor, _deleteWordEndRight);
  }
  __name(deleteWordEndRight, "deleteWordEndRight");
  function deleteInsideWord(editor) {
    _deleteInsideWord.run(null, editor, null);
  }
  __name(deleteInsideWord, "deleteInsideWord");
  test("cursorWordLeft - simple", () => {
    const EXPECTED = [
      "|    	|My |First |Line	 ",
      "|	|My |Second |Line",
      "|    |Third |Line\u{1F436}",
      "|",
      "|1"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordLeft - with selection", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor) => {
      editor.setPosition(new Position(5, 2));
      cursorWordLeft(editor, true);
      assert.deepStrictEqual(editor.getSelection(), new Selection(5, 2, 5, 1));
    });
  });
  test("cursorWordLeft - issue #832", () => {
    const EXPECTED = ["|   |/* |Just |some   |more   |text |a|+= |3 |+|5-|3 |+ |7 |*/  "].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordLeft - issue #48046: Word selection doesn't work as usual", () => {
    const EXPECTED = [
      "|deep.|object.|property"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 21),
      (ed) => cursorWordLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordLeft - Recognize words", function() {
    if (isFirefox) {
      return this.skip();
    }
    const EXPECTED = [
      "|/* |\u3053\u308C|\u306F|\u30C6\u30B9\u30C8|\u3067\u3059 |/*"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordLeft(ed, true),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1)),
      {
        wordSegmenterLocales: "ja"
      }
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordLeft - Does not recognize words", () => {
    const EXPECTED = [
      "|/* |\u3053\u308C\u306F\u30C6\u30B9\u30C8\u3067\u3059 |/*"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordLeft(ed, true),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1)),
      {
        wordSegmenterLocales: ""
      }
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordLeft - issue #169904: cursors out of sync", () => {
    const text = [
      ".grid1 {",
      "  display: grid;",
      "  grid-template-columns:",
      "    [full-start] minmax(1em, 1fr)",
      "    [main-start] minmax(0, 40em) [main-end]",
      "    minmax(1em, 1fr) [full-end];",
      "}",
      ".grid2 {",
      "  display: grid;",
      "  grid-template-columns:",
      "    [full-start] minmax(1em, 1fr)",
      "    [main-start] minmax(0, 40em) [main-end] minmax(1em, 1fr) [full-end];",
      "}"
    ];
    withTestCodeEditor(text, {}, (editor) => {
      editor.setSelections([
        new Selection(5, 44, 5, 44),
        new Selection(6, 32, 6, 32),
        new Selection(12, 44, 12, 44),
        new Selection(12, 72, 12, 72)
      ]);
      cursorWordLeft(editor, false);
      assert.deepStrictEqual(editor.getSelections(), [
        new Selection(5, 43, 5, 43),
        new Selection(6, 31, 6, 31),
        new Selection(12, 43, 12, 43),
        new Selection(12, 71, 12, 71)
      ]);
    });
  });
  test("cursorWordLeftSelect - issue #74369: cursorWordLeft and cursorWordLeftSelect do not behave consistently", () => {
    const EXPECTED = [
      "|this.|is.|a.|test"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 15),
      (ed) => cursorWordLeft(ed, true),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordStartLeft", () => {
    const EXPECTED = ["|   |/* |Just |some   |more   |text |a|+= |3 |+|5|-|3 |+ |7 |*/  "].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordStartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordStartLeft - issue #51119: regression makes VS compatibility impossible", () => {
    const EXPECTED = ["|this|.|is|.|a|.|test"].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordStartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("issue #51275 - cursorWordStartLeft does not push undo/redo stack element", () => {
    function type(viewModel, text) {
      for (let i = 0; i < text.length; i++) {
        viewModel.type(text.charAt(i), "keyboard");
      }
    }
    __name(type, "type");
    withTestCodeEditor("", {}, (editor, viewModel) => {
      type(viewModel, "foo bar baz");
      assert.strictEqual(editor.getValue(), "foo bar baz");
      cursorWordStartLeft(editor);
      cursorWordStartLeft(editor);
      type(viewModel, "q");
      assert.strictEqual(editor.getValue(), "foo qbar baz");
      CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
      assert.strictEqual(editor.getValue(), "foo bar baz");
    });
  });
  test("cursorWordEndLeft", () => {
    const EXPECTED = ["|   /*| Just| some|   more|   text| a|+=| 3| +|5|-|3| +| 7| */|  "].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordEndLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordRight - simple", () => {
    const EXPECTED = [
      "    	My| First| Line|	 |",
      "	My| Second| Line|",
      "    Third| Line\u{1F436}|",
      "|",
      "1|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(5, 2))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordRight - selection", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      editor.setPosition(new Position(1, 1));
      cursorWordRight(editor, true);
      assert.deepStrictEqual(editor.getSelection(), new Selection(1, 1, 1, 8));
    });
  });
  test("cursorWordRight - issue #832", () => {
    const EXPECTED = [
      "   /*| Just| some|   more|   text| a|+=| 3| +5|-3| +| 7| */|  |"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 50))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordRight - issue #41199", () => {
    const EXPECTED = [
      "console|.log|(err|)|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 17))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordRight - Recognize words", function() {
    if (isFirefox) {
      return this.skip();
    }
    const EXPECTED = [
      "/*| \u3053\u308C|\u306F|\u30C6\u30B9\u30C8|\u3067\u3059|/*|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 14)),
      {
        wordSegmenterLocales: "ja"
      }
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordRight - Does not recognize words", () => {
    const EXPECTED = [
      "/*| \u3053\u308C\u306F\u30C6\u30B9\u30C8\u3067\u3059|/*|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 14)),
      {
        wordSegmenterLocales: ""
      }
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("moveWordEndRight", () => {
    const EXPECTED = [
      "   /*| Just| some|   more|   text| a|+=| 3| +5|-3| +| 7| */|  |"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => moveWordEndRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 50))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("moveWordStartRight", () => {
    const EXPECTED = [
      "   |/* |Just |some   |more   |text |a|+= |3 |+|5|-|3 |+ |7 |*/  |"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => moveWordStartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 50))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("issue #51119: cursorWordStartRight regression makes VS compatibility impossible", () => {
    const EXPECTED = ["this|.|is|.|a|.|test|"].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => moveWordStartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 15))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("issue #64810: cursorWordStartRight skips first word after newline", () => {
    const EXPECTED = ["Hello |World|", "|Hei |mailman|"].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => moveWordStartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(2, 12))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordLeft for non-empty selection", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setSelection(new Selection(3, 7, 3, 9));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(3), "    Thd Line\u{1F436}");
      assert.deepStrictEqual(editor.getPosition(), new Position(3, 7));
    });
  });
  test("deleteWordLeft for cursor at beginning of document", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 1));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(1), "    	My First Line	 ");
      assert.deepStrictEqual(editor.getPosition(), new Position(1, 1));
    });
  });
  test("deleteWordLeft for cursor at end of whitespace", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(3, 11));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(3), "    Line\u{1F436}");
      assert.deepStrictEqual(editor.getPosition(), new Position(3, 5));
    });
  });
  test("deleteWordLeft for cursor just behind a word", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 11));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(2), "	My  Line");
      assert.deepStrictEqual(editor.getPosition(), new Position(2, 5));
    });
  });
  test("deleteWordLeft for cursor inside of a word", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 12));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(1), "    	My st Line	 ");
      assert.deepStrictEqual(editor.getPosition(), new Position(1, 9));
    });
  });
  test("deleteWordRight for non-empty selection", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setSelection(new Selection(3, 7, 3, 9));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(3), "    Thd Line\u{1F436}");
      assert.deepStrictEqual(editor.getPosition(), new Position(3, 7));
    });
  });
  test("deleteWordRight for cursor at end of document", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(5, 3));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(5), "1");
      assert.deepStrictEqual(editor.getPosition(), new Position(5, 2));
    });
  });
  test("deleteWordRight for cursor at beggining of whitespace", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(3, 1));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(3), "Third Line\u{1F436}");
      assert.deepStrictEqual(editor.getPosition(), new Position(3, 1));
    });
  });
  test("deleteWordRight for cursor just before a word", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 5));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(2), "	My  Line");
      assert.deepStrictEqual(editor.getPosition(), new Position(2, 5));
    });
  });
  test("deleteWordRight for cursor inside of a word", () => {
    withTestCodeEditor([
      "    	My First Line	 ",
      "	My Second Line",
      "    Third Line\u{1F436}",
      "",
      "1"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 11));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(1), "    	My Fi Line	 ");
      assert.deepStrictEqual(editor.getPosition(), new Position(1, 11));
    });
  });
  test("deleteWordLeft - issue #832", () => {
    const EXPECTED = [
      "|   |/* |Just |some |text |a|+= |3 |+|5 |*/|  "
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e4),
      (ed) => deleteWordLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordStartLeft", () => {
    const EXPECTED = [
      "|   |/* |Just |some |text |a|+= |3 |+|5 |*/  "
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e4),
      (ed) => deleteWordStartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordEndLeft", () => {
    const EXPECTED = [
      "|   /*| Just| some| text| a|+=| 3| +|5| */|  "
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e4),
      (ed) => deleteWordEndLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordLeft - issue #24947", () => {
    withTestCodeEditor([
      "{",
      "}"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 1));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(1), "{}");
    });
    withTestCodeEditor([
      "{",
      "}"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 1));
      deleteWordStartLeft(editor);
      assert.strictEqual(model.getLineContent(1), "{}");
    });
    withTestCodeEditor([
      "{",
      "}"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 1));
      deleteWordEndLeft(editor);
      assert.strictEqual(model.getLineContent(1), "{}");
    });
  });
  test("deleteWordRight - issue #832", () => {
    const EXPECTED = "   |/*| Just| some| text| a|+=| 3| +|5|-|3| */|  |";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => deleteWordRight(ed),
      (ed) => new Position(1, text.length - ed.getValue().length + 1),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordRight - issue #3882", () => {
    withTestCodeEditor([
      "public void Add( int x,",
      "                 int y )"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 24));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(1), "public void Add( int x,int y )", "001");
    });
  });
  test("deleteWordStartRight - issue #3882", () => {
    withTestCodeEditor([
      "public void Add( int x,",
      "                 int y )"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 24));
      deleteWordStartRight(editor);
      assert.strictEqual(model.getLineContent(1), "public void Add( int x,int y )", "001");
    });
  });
  test("deleteWordEndRight - issue #3882", () => {
    withTestCodeEditor([
      "public void Add( int x,",
      "                 int y )"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 24));
      deleteWordEndRight(editor);
      assert.strictEqual(model.getLineContent(1), "public void Add( int x,int y )", "001");
    });
  });
  test("deleteWordStartRight", () => {
    const EXPECTED = "   |/* |Just |some |text |a|+= |3 |+|5|-|3 |*/  |";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => deleteWordStartRight(ed),
      (ed) => new Position(1, text.length - ed.getValue().length + 1),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordEndRight", () => {
    const EXPECTED = "   /*| Just| some| text| a|+=| 3| +|5|-|3| */|  |";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => deleteWordEndRight(ed),
      (ed) => new Position(1, text.length - ed.getValue().length + 1),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordRight - issue #3882 (1): Ctrl+Delete removing entire line when used at the end of line", () => {
    withTestCodeEditor([
      "A line with text.",
      "   And another one"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 18));
      deleteWordRight(editor);
      assert.strictEqual(model.getLineContent(1), "A line with text.And another one", "001");
    });
  });
  test("deleteWordLeft - issue #3882 (2): Ctrl+Delete removing entire line when used at the end of line", () => {
    withTestCodeEditor([
      "A line with text.",
      "   And another one"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 1));
      deleteWordLeft(editor);
      assert.strictEqual(model.getLineContent(1), "A line with text.   And another one", "001");
    });
  });
  test("deleteWordLeft - issue #91855: Matching (quote, bracket, paren) doesn't get deleted when hitting Ctrl+Backspace", () => {
    const languageId = "myTestMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      autoClosingPairs: [
        { open: '"', close: '"' }
      ]
    }));
    const model = disposables.add(instantiateTextModel(instantiationService, 'a ""', languageId));
    const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model, { autoClosingDelete: "always" }));
    editor.setPosition(new Position(1, 4));
    deleteWordLeft(editor);
    assert.strictEqual(model.getLineContent(1), "a ");
  });
  test("deleteInsideWord - empty line", () => {
    withTestCodeEditor([
      "Line1",
      "",
      "Line2"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(2, 1));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "Line1\nLine2");
    });
  });
  test("deleteInsideWord - in whitespace 1", () => {
    withTestCodeEditor([
      "Just  some text."
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 6));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "Justsome text.");
    });
  });
  test("deleteInsideWord - in whitespace 2", () => {
    withTestCodeEditor([
      "Just     some text."
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 6));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "Justsome text.");
    });
  });
  test("deleteInsideWord - in whitespace 3", () => {
    withTestCodeEditor([
      'Just     "some text.'
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 6));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), 'Just"some text.');
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), '"some text.');
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "some text.");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "text.");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), ".");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
    });
  });
  test("deleteInsideWord - in non-words", () => {
    withTestCodeEditor([
      "x=3+4+5+6"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 7));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "x=3+45+6");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "x=3++6");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "x=36");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "x=");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "x");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
    });
  });
  test("deleteInsideWord - in words 1", () => {
    withTestCodeEditor([
      "This is interesting"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 7));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "This interesting");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "This");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
    });
  });
  test("deleteInsideWord - in words 2", () => {
    withTestCodeEditor([
      "This  is  interesting"
    ], {}, (editor, _) => {
      const model = editor.getModel();
      editor.setPosition(new Position(1, 7));
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "This  interesting");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "This");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
      deleteInsideWord(editor);
      assert.strictEqual(model.getValue(), "");
    });
  });
});
//# sourceMappingURL=wordOperations.test.js.map
