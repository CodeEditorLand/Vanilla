var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { CoreEditingCommands } from "../../../../browser/coreCommands.js";
import { IPosition, Position } from "../../../../common/core/position.js";
import { IRange, Range } from "../../../../common/core/range.js";
import { USUAL_WORD_SEPARATORS } from "../../../../common/core/wordHelper.js";
import { Handler } from "../../../../common/editorCommon.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { ITextModel } from "../../../../common/model.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { DeleteAllLeftAction } from "../../../linesOperations/browser/linesOperations.js";
import { LinkedEditingContribution } from "../../browser/linkedEditing.js";
import { DeleteWordLeft } from "../../../wordOperations/browser/wordOperations.js";
import { ITestCodeEditor, createCodeEditorServices, instantiateTestCodeEditor } from "../../../../test/browser/testCodeEditor.js";
import { instantiateTextModel } from "../../../../test/common/testTextModel.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
const mockFile = URI.parse("test:somefile.ttt");
const mockFileSelector = { scheme: "test" };
const timeout = 30;
const languageId = "linkedEditingTestLangage";
suite("linked editing", () => {
  let disposables;
  let instantiationService;
  let languageFeaturesService;
  let languageConfigurationService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = createCodeEditorServices(disposables);
    languageFeaturesService = instantiationService.get(ILanguageFeaturesService);
    languageConfigurationService = instantiationService.get(ILanguageConfigurationService);
    disposables.add(languageConfigurationService.register(languageId, {
      wordPattern: /[a-zA-Z]+/
    }));
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function createMockEditor(text) {
    const model = disposables.add(instantiateTextModel(instantiationService, typeof text === "string" ? text : text.join("\n"), languageId, void 0, mockFile));
    const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model));
    return editor;
  }
  __name(createMockEditor, "createMockEditor");
  function testCase(name, initialState, operations, expectedEndText) {
    test(name, async () => {
      await runWithFakedTimers({}, async () => {
        disposables.add(languageFeaturesService.linkedEditingRangeProvider.register(mockFileSelector, {
          provideLinkedEditingRanges(model, pos) {
            const wordAtPos = model.getWordAtPosition(pos);
            if (wordAtPos) {
              const matches = model.findMatches(wordAtPos.word, false, false, true, USUAL_WORD_SEPARATORS, false);
              return { ranges: matches.map((m) => m.range), wordPattern: initialState.responseWordPattern };
            }
            return { ranges: [], wordPattern: initialState.responseWordPattern };
          }
        }));
        const editor = createMockEditor(initialState.text);
        editor.updateOptions({ linkedEditing: true });
        const linkedEditingContribution = disposables.add(editor.registerAndInstantiateContribution(
          LinkedEditingContribution.ID,
          LinkedEditingContribution
        ));
        linkedEditingContribution.setDebounceDuration(0);
        const testEditor = {
          setPosition(pos) {
            editor.setPosition(pos);
            return linkedEditingContribution.currentUpdateTriggerPromise;
          },
          setSelection(sel) {
            editor.setSelection(sel);
            return linkedEditingContribution.currentUpdateTriggerPromise;
          },
          trigger(source, handlerId, payload) {
            if (handlerId === Handler.Type || handlerId === Handler.Paste) {
              editor.trigger(source, handlerId, payload);
            } else if (handlerId === "deleteLeft") {
              CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, payload);
            } else if (handlerId === "deleteWordLeft") {
              instantiationService.invokeFunction((accessor) => new DeleteWordLeft().runEditorCommand(accessor, editor, payload));
            } else if (handlerId === "deleteAllLeft") {
              instantiationService.invokeFunction((accessor) => new DeleteAllLeftAction().runEditorCommand(accessor, editor, payload));
            } else {
              throw new Error(`Unknown handler ${handlerId}!`);
            }
            return linkedEditingContribution.currentSyncTriggerPromise;
          },
          undo() {
            CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
          },
          redo() {
            CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
          }
        };
        await operations(testEditor);
        return new Promise((resolve) => {
          setTimeout(() => {
            if (typeof expectedEndText === "string") {
              assert.strictEqual(editor.getModel().getValue(), expectedEndText);
            } else {
              assert.strictEqual(editor.getModel().getValue(), expectedEndText.join("\n"));
            }
            resolve();
          }, timeout);
        });
      });
    });
  }
  __name(testCase, "testCase");
  const state = {
    text: "<ooo></ooo>"
  };
  testCase("Simple insert - initial", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<iooo></iooo>");
  testCase("Simple insert - middle", state, async (editor) => {
    const pos = new Position(1, 3);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<oioo></oioo>");
  testCase("Simple insert - end", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<oooi></oooi>");
  testCase("Simple insert end - initial", state, async (editor) => {
    const pos = new Position(1, 8);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<iooo></iooo>");
  testCase("Simple insert end - middle", state, async (editor) => {
    const pos = new Position(1, 9);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<oioo></oioo>");
  testCase("Simple insert end - end", state, async (editor) => {
    const pos = new Position(1, 11);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<oooi></oooi>");
  testCase("Simple insert - out of boundary", state, async (editor) => {
    const pos = new Position(1, 1);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "i<ooo></ooo>");
  testCase("Simple insert - out of boundary 2", state, async (editor) => {
    const pos = new Position(1, 6);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<ooo>i</ooo>");
  testCase("Simple insert - out of boundary 3", state, async (editor) => {
    const pos = new Position(1, 7);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<ooo><i/ooo>");
  testCase("Simple insert - out of boundary 4", state, async (editor) => {
    const pos = new Position(1, 12);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<ooo></ooo>i");
  testCase("Continuous insert", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<iiooo></iiooo>");
  testCase("Insert - move - insert", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
    await editor.setPosition(new Position(1, 4));
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<ioioo></ioioo>");
  testCase("Insert - move - insert outside region", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
    await editor.setPosition(new Position(1, 7));
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<iooo>i</iooo>");
  testCase("Selection insert - simple", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.setSelection(new Range(1, 2, 1, 3));
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<ioo></ioo>");
  testCase("Selection insert - whole", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.setSelection(new Range(1, 2, 1, 5));
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<i></i>");
  testCase("Selection insert - across boundary", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.setSelection(new Range(1, 1, 1, 3));
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "ioo></oo>");
  testCase("Breakout - type space", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: " " });
  }, "<ooo ></ooo>");
  testCase("Breakout - type space then undo", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: " " });
    editor.undo();
  }, "<ooo></ooo>");
  testCase("Breakout - type space in middle", state, async (editor) => {
    const pos = new Position(1, 4);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: " " });
  }, "<oo o></ooo>");
  testCase("Breakout - paste content starting with space", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Paste, { text: ' i="i"' });
  }, '<ooo i="i"></ooo>');
  testCase("Breakout - paste content starting with space then undo", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Paste, { text: ' i="i"' });
    editor.undo();
  }, "<ooo></ooo>");
  testCase("Breakout - paste content starting with space in middle", state, async (editor) => {
    const pos = new Position(1, 4);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Paste, { text: " i" });
  }, "<oo io></ooo>");
  const state3 = {
    ...state,
    responseWordPattern: /[a-yA-Y]+/
  };
  testCase("Breakout with stop pattern - insert", state3, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<iooo></iooo>");
  testCase("Breakout with stop pattern - insert stop char", state3, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "z" });
  }, "<zooo></ooo>");
  testCase("Breakout with stop pattern - paste char", state3, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Paste, { text: "z" });
  }, "<zooo></ooo>");
  testCase("Breakout with stop pattern - paste string", state3, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Paste, { text: "zo" });
  }, "<zoooo></ooo>");
  testCase("Breakout with stop pattern - insert at end", state3, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "z" });
  }, "<oooz></ooo>");
  const state4 = {
    ...state,
    responseWordPattern: /[a-eA-E]+/
  };
  testCase("Breakout with stop pattern - insert stop char, respos", state4, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, "<iooo></ooo>");
  testCase("Delete - left char", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", "deleteLeft", {});
  }, "<oo></oo>");
  testCase("Delete - left char then undo", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", "deleteLeft", {});
    editor.undo();
  }, "<ooo></ooo>");
  testCase("Delete - left word", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", "deleteWordLeft", {});
  }, "<></>");
  testCase("Delete - left word then undo", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", "deleteWordLeft", {});
    editor.undo();
    editor.undo();
  }, "<ooo></ooo>");
  testCase("Delete - left all then undo twice", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", "deleteAllLeft", {});
    editor.undo();
    editor.undo();
  }, "<ooo></ooo>");
  testCase("Delete - selection", state, async (editor) => {
    const pos = new Position(1, 5);
    await editor.setPosition(pos);
    await editor.setSelection(new Range(1, 2, 1, 3));
    await editor.trigger("keyboard", "deleteLeft", {});
  }, "<oo></oo>");
  testCase("Delete - selection across boundary", state, async (editor) => {
    const pos = new Position(1, 3);
    await editor.setPosition(pos);
    await editor.setSelection(new Range(1, 1, 1, 3));
    await editor.trigger("keyboard", "deleteLeft", {});
  }, "oo></oo>");
  testCase("Undo/redo - simple undo", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
    editor.undo();
    editor.undo();
  }, "<ooo></ooo>");
  testCase("Undo/redo - simple undo/redo", state, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
    editor.undo();
    editor.redo();
  }, "<iooo></iooo>");
  const state2 = {
    text: [
      "<ooo>",
      "</ooo>"
    ]
  };
  testCase("Multiline insert", state2, async (editor) => {
    const pos = new Position(1, 2);
    await editor.setPosition(pos);
    await editor.trigger("keyboard", Handler.Type, { text: "i" });
  }, [
    "<iooo>",
    "</iooo>"
  ]);
});
//# sourceMappingURL=linkedEditing.test.js.map
