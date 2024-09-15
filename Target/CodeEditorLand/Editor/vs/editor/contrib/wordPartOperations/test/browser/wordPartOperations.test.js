var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorCommand } from "../../../../browser/editorExtensions.js";
import { Position } from "../../../../common/core/position.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { deserializePipePositions, serializePipePositions, testRepeatedActionAndExtractPositions } from "../../../wordOperations/test/browser/wordTestUtils.js";
import { CursorWordPartLeft, CursorWordPartLeftSelect, CursorWordPartRight, CursorWordPartRightSelect, DeleteWordPartLeft, DeleteWordPartRight } from "../../browser/wordPartOperations.js";
import { StaticServiceAccessor } from "./utils.js";
import { TestLanguageConfigurationService } from "../../../../test/common/modes/testLanguageConfigurationService.js";
suite("WordPartOperations", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const _deleteWordPartLeft = new DeleteWordPartLeft();
  const _deleteWordPartRight = new DeleteWordPartRight();
  const _cursorWordPartLeft = new CursorWordPartLeft();
  const _cursorWordPartLeftSelect = new CursorWordPartLeftSelect();
  const _cursorWordPartRight = new CursorWordPartRight();
  const _cursorWordPartRightSelect = new CursorWordPartRightSelect();
  const serviceAccessor = new StaticServiceAccessor().withService(
    ILanguageConfigurationService,
    new TestLanguageConfigurationService()
  );
  function runEditorCommand(editor, command) {
    command.runEditorCommand(serviceAccessor, editor, null);
  }
  __name(runEditorCommand, "runEditorCommand");
  function cursorWordPartLeft(editor, inSelectionmode = false) {
    runEditorCommand(editor, inSelectionmode ? _cursorWordPartLeftSelect : _cursorWordPartLeft);
  }
  __name(cursorWordPartLeft, "cursorWordPartLeft");
  function cursorWordPartRight(editor, inSelectionmode = false) {
    runEditorCommand(editor, inSelectionmode ? _cursorWordPartRightSelect : _cursorWordPartRight);
  }
  __name(cursorWordPartRight, "cursorWordPartRight");
  function deleteWordPartLeft(editor) {
    runEditorCommand(editor, _deleteWordPartLeft);
  }
  __name(deleteWordPartLeft, "deleteWordPartLeft");
  function deleteWordPartRight(editor) {
    runEditorCommand(editor, _deleteWordPartRight);
  }
  __name(deleteWordPartRight, "deleteWordPartRight");
  test("cursorWordPartLeft - basic", () => {
    const EXPECTED = [
      "|start| |line|",
      "|this|Is|A|Camel|Case|Var|  |this_|is_|a_|snake_|case_|var| |THIS_|IS_|CAPS_|SNAKE| |this_|IS|Mixed|Use|",
      "|end| |line"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordPartLeft - issue #53899: whitespace", () => {
    const EXPECTED = "|myvar| |=| |'|demonstration|     |of| |selection| |with| |space|'";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordPartLeft - issue #53899: underscores", () => {
    const EXPECTED = "|myvar| |=| |'|demonstration_____|of| |selection| |with| |space|'";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordPartRight - basic", () => {
    const EXPECTED = [
      "start| |line|",
      "|this|Is|A|Camel|Case|Var|  |this|_is|_a|_snake|_case|_var| |THIS|_IS|_CAPS|_SNAKE| |this|_IS|Mixed|Use|",
      "|end| |line|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordPartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(3, 9))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordPartRight - issue #53899: whitespace", () => {
    const EXPECTED = "myvar| |=| |'|demonstration|     |of| |selection| |with| |space|'|";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordPartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 52))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordPartRight - issue #53899: underscores", () => {
    const EXPECTED = "myvar| |=| |'|demonstration|_____of| |selection| |with| |space|'|";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordPartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 52))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("cursorWordPartRight - issue #53899: second case", () => {
    const EXPECTED = [
      ";| |--| |1|",
      "|;|        |--| |2|",
      "|;|    |#|3|",
      "|;|   |#|4|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordPartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(4, 7))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("issue #93239 - cursorWordPartRight", () => {
    const EXPECTED = [
      "foo|_bar|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordPartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 8))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("issue #93239 - cursorWordPartLeft", () => {
    const EXPECTED = [
      "|foo_|bar"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 8),
      (ed) => cursorWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1))
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordPartLeft - basic", () => {
    const EXPECTED = "|   |/*| |Just| |some| |text| |a|+=| |3| |+|5|-|3| |*/|  |this|Is|A|Camel|Case|Var|  |this_|is_|a_|snake_|case_|var| |THIS_|IS_|CAPS_|SNAKE| |this_|IS|Mixed|Use";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1e3),
      (ed) => deleteWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test("deleteWordPartRight - basic", () => {
    const EXPECTED = "   |/*| |Just| |some| |text| |a|+=| |3| |+|5|-|3| |*/|  |this|Is|A|Camel|Case|Var|  |this|_is|_a|_snake|_case|_var| |THIS|_IS|_CAPS|_SNAKE| |this|_IS|Mixed|Use|";
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => deleteWordPartRight(ed),
      (ed) => new Position(1, text.length - ed.getValue().length + 1),
      (ed) => ed.getValue().length === 0
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test('issue #158667: cursorWordPartLeft stops at "-" even when "-" is not in word separators', () => {
    const EXPECTED = [
      "|this-|is-|a-|kebab-|case-|var| |THIS-|IS-|CAPS-|KEBAB| |this-|IS|Mixed|Use"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => cursorWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 1)),
      { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}\xB7" }
      // default characters sans '$-%~' plus '·'
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test('issue #158667: cursorWordPartRight stops at "-" even when "-" is not in word separators', () => {
    const EXPECTED = [
      "this|-is|-a|-kebab|-case|-var| |THIS|-IS|-CAPS|-KEBAB| |this|-IS|Mixed|Use|"
    ].join("\n");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => cursorWordPartRight(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getPosition().equals(new Position(1, 60)),
      { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}\xB7" }
      // default characters sans '$-%~' plus '·'
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test('issue #158667: deleteWordPartLeft stops at "-" even when "-" is not in word separators', () => {
    const EXPECTED = [
      "|this-|is-|a-|kebab-|case-|var| |THIS-|IS-|CAPS-|KEBAB| |this-|IS|Mixed|Use"
    ].join(" ");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1e3, 1e3),
      (ed) => deleteWordPartLeft(ed),
      (ed) => ed.getPosition(),
      (ed) => ed.getValue().length === 0,
      { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}\xB7" }
      // default characters sans '$-%~' plus '·'
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
  test('issue #158667: deleteWordPartRight stops at "-" even when "-" is not in word separators', () => {
    const EXPECTED = [
      "this|-is|-a|-kebab|-case|-var| |THIS|-IS|-CAPS|-KEBAB| |this|-IS|Mixed|Use|"
    ].join(" ");
    const [text] = deserializePipePositions(EXPECTED);
    const actualStops = testRepeatedActionAndExtractPositions(
      text,
      new Position(1, 1),
      (ed) => deleteWordPartRight(ed),
      (ed) => new Position(1, text.length - ed.getValue().length + 1),
      (ed) => ed.getValue().length === 0,
      { wordSeparators: "!\"#&'()*+,./:;<=>?@[\\]^`{|}\xB7" }
      // default characters sans '$-%~' plus '·'
    );
    const actual = serializePipePositions(text, actualStops);
    assert.deepStrictEqual(actual, EXPECTED);
  });
});
//# sourceMappingURL=wordPartOperations.test.js.map
