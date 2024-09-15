var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { Position } from "../../../../common/core/position.js";
import { Selection } from "../../../../common/core/selection.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { BracketMatchingController } from "../../browser/bracketMatching.js";
import { createCodeEditorServices, instantiateTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { instantiateTextModel } from "../../../../test/common/testTextModel.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
suite("bracket matching", () => {
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
  function createTextModelWithBrackets(text) {
    const languageId = "bracketMode";
    disposables.add(languageService.registerLanguage({ id: languageId }));
    disposables.add(languageConfigurationService.register(languageId, {
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"]
      ]
    }));
    return disposables.add(instantiateTextModel(instantiationService, text, languageId));
  }
  __name(createTextModelWithBrackets, "createTextModelWithBrackets");
  function createCodeEditorWithBrackets(text) {
    return disposables.add(instantiateTestCodeEditor(instantiationService, createTextModelWithBrackets(text)));
  }
  __name(createCodeEditorWithBrackets, "createCodeEditorWithBrackets");
  test("issue #183: jump to matching bracket position", () => {
    const editor = createCodeEditorWithBrackets("var x = (3 + (5-7)) + ((5+3)+5);");
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    editor.setPosition(new Position(1, 20));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 9));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 19));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 9));
    editor.setPosition(new Position(1, 23));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 31));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 23));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 31));
  });
  test("Jump to next bracket", () => {
    const editor = createCodeEditorWithBrackets("var x = (3 + (5-7)); y();");
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    editor.setPosition(new Position(1, 16));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 18));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 14));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 18));
    editor.setPosition(new Position(1, 21));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 23));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 24));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 23));
    editor.setPosition(new Position(1, 26));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 26));
  });
  test("Select to next bracket", () => {
    const editor = createCodeEditorWithBrackets("var x = (3 + (5-7)); y();");
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    editor.setPosition(new Position(1, 9));
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 20));
    assert.deepStrictEqual(editor.getSelection(), new Selection(1, 9, 1, 20));
    editor.setPosition(new Position(1, 20));
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 9));
    assert.deepStrictEqual(editor.getSelection(), new Selection(1, 20, 1, 9));
    editor.setPosition(new Position(1, 16));
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 19));
    assert.deepStrictEqual(editor.getSelection(), new Selection(1, 14, 1, 19));
    editor.setPosition(new Position(1, 21));
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 25));
    assert.deepStrictEqual(editor.getSelection(), new Selection(1, 23, 1, 25));
    editor.setPosition(new Position(1, 26));
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getPosition(), new Position(1, 26));
    assert.deepStrictEqual(editor.getSelection(), new Selection(1, 26, 1, 26));
  });
  test("issue #1772: jump to enclosing brackets", () => {
    const text = [
      "const x = {",
      "    something: [0, 1, 2],",
      "    another: true,",
      "    somethingmore: [0, 2, 4]",
      "};"
    ].join("\n");
    const editor = createCodeEditorWithBrackets(text);
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    editor.setPosition(new Position(3, 5));
    bracketMatchingController.jumpToBracket();
    assert.deepStrictEqual(editor.getSelection(), new Selection(5, 1, 5, 1));
  });
  test("issue #43371: argument to not select brackets", () => {
    const text = [
      "const x = {",
      "    something: [0, 1, 2],",
      "    another: true,",
      "    somethingmore: [0, 2, 4]",
      "};"
    ].join("\n");
    const editor = createCodeEditorWithBrackets(text);
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    editor.setPosition(new Position(3, 5));
    bracketMatchingController.selectToBracket(false);
    assert.deepStrictEqual(editor.getSelection(), new Selection(1, 12, 5, 1));
  });
  test("issue #45369: Select to Bracket with multicursor", () => {
    const editor = createCodeEditorWithBrackets("{  }   {   }   { }");
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    editor.setSelections([
      new Selection(1, 3, 1, 3),
      new Selection(1, 10, 1, 10),
      new Selection(1, 17, 1, 17)
    ]);
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getSelections(), [
      new Selection(1, 1, 1, 5),
      new Selection(1, 8, 1, 13),
      new Selection(1, 16, 1, 19)
    ]);
    editor.setSelections([
      new Selection(1, 1, 1, 1),
      new Selection(1, 6, 1, 6),
      new Selection(1, 14, 1, 14)
    ]);
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getSelections(), [
      new Selection(1, 1, 1, 5),
      new Selection(1, 8, 1, 13),
      new Selection(1, 16, 1, 19)
    ]);
    editor.setSelections([
      new Selection(1, 5, 1, 5),
      new Selection(1, 13, 1, 13),
      new Selection(1, 19, 1, 19)
    ]);
    bracketMatchingController.selectToBracket(true);
    assert.deepStrictEqual(editor.getSelections(), [
      new Selection(1, 5, 1, 1),
      new Selection(1, 13, 1, 8),
      new Selection(1, 19, 1, 16)
    ]);
  });
  test("Removes brackets", () => {
    const editor = createCodeEditorWithBrackets("var x = (3 + (5-7)); y();");
    const bracketMatchingController = disposables.add(editor.registerAndInstantiateContribution(BracketMatchingController.ID, BracketMatchingController));
    function removeBrackets() {
      bracketMatchingController.removeBrackets();
    }
    __name(removeBrackets, "removeBrackets");
    editor.setPosition(new Position(1, 9));
    removeBrackets();
    assert.deepStrictEqual(editor.getModel().getValue(), "var x = 3 + (5-7); y();");
    editor.getModel().setValue("var x = (3 + (5-7)); y();");
    editor.setPosition(new Position(1, 16));
    removeBrackets();
    assert.deepStrictEqual(editor.getModel().getValue(), "var x = (3 + 5-7); y();");
    removeBrackets();
    assert.deepStrictEqual(editor.getModel().getValue(), "var x = 3 + 5-7; y();");
    removeBrackets();
    assert.deepStrictEqual(editor.getModel().getValue(), "var x = 3 + 5-7; y();");
  });
});
//# sourceMappingURL=bracketMatching.test.js.map
