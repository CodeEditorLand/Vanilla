import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { setUnexpectedErrorHandler } from "../../../../../base/common/errors.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../base/common/observable.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import {
  IMenuService
} from "../../../../../platform/actions/common/actions.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { MockKeybindingService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import {
  ILogService,
  NullLogService
} from "../../../../../platform/log/common/log.js";
import {
  IStorageService,
  InMemoryStorageService
} from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { Range } from "../../../../common/core/range.js";
import {
  CompletionItemKind
} from "../../../../common/languages.js";
import { IEditorWorkerService } from "../../../../common/services/editorWorker.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../common/services/languageFeaturesService.js";
import {
  withAsyncTestCodeEditor
} from "../../../../test/browser/testCodeEditor.js";
import { SnippetController2 } from "../../../snippet/browser/snippetController2.js";
import { SuggestController } from "../../../suggest/browser/suggestController.js";
import { ISuggestMemoryService } from "../../../suggest/browser/suggestMemory.js";
import { InlineCompletionsController } from "../../browser/controller/inlineCompletionsController.js";
import { GhostTextContext } from "./utils.js";
suite("Suggest Widget Model", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    setUnexpectedErrorHandler((err) => {
      throw err;
    });
  });
  test.skip("Active", async () => {
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider },
      async ({ editor, editorViewModel, context, model }) => {
        let last;
        const history = new Array();
        const d = autorun((reader) => {
          const selectedSuggestItem = !!model.selectedSuggestItem.read(reader);
          if (last !== selectedSuggestItem) {
            last = selectedSuggestItem;
            history.push(last);
          }
        });
        context.keyboardType("h");
        const suggestController = editor.getContribution(
          SuggestController.ID
        );
        suggestController.triggerSuggest();
        await timeout(1e3);
        assert.deepStrictEqual(history.splice(0), [false, true]);
        context.keyboardType(".");
        await timeout(1e3);
        assert.deepStrictEqual(history.splice(0), []);
        suggestController.cancelSuggestWidget();
        await timeout(1e3);
        assert.deepStrictEqual(history.splice(0), [false]);
        d.dispose();
      }
    );
  });
  test("Ghost Text", async () => {
    await withAsyncTestCodeEditorAndInlineCompletionsModel(
      "",
      { fakeClock: true, provider, suggest: { preview: true } },
      async ({ editor, editorViewModel, context, model }) => {
        context.keyboardType("h");
        const suggestController = editor.getContribution(
          SuggestController.ID
        );
        suggestController.triggerSuggest();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "",
          "h[ello]"
        ]);
        context.keyboardType(".");
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "h",
          "hello.[hello]"
        ]);
        suggestController.cancelSuggestWidget();
        await timeout(1e3);
        assert.deepStrictEqual(context.getAndClearViewStates(), [
          "hello."
        ]);
      }
    );
  });
});
const provider = {
  _debugDisplayName: "test",
  triggerCharacters: ["."],
  async provideCompletionItems(model, pos) {
    const word = model.getWordAtPosition(pos);
    const range = word ? {
      startLineNumber: 1,
      startColumn: word.startColumn,
      endLineNumber: 1,
      endColumn: word.endColumn
    } : Range.fromPositions(pos);
    return {
      suggestions: [
        {
          insertText: "hello",
          kind: CompletionItemKind.Text,
          label: "hello",
          range,
          commitCharacters: ["."]
        }
      ]
    };
  }
};
async function withAsyncTestCodeEditorAndInlineCompletionsModel(text, options, callback) {
  await runWithFakedTimers({ useFakeTimers: options.fakeClock }, async () => {
    const disposableStore = new DisposableStore();
    try {
      const serviceCollection = new ServiceCollection(
        [ITelemetryService, NullTelemetryService],
        [ILogService, new NullLogService()],
        [
          IStorageService,
          disposableStore.add(new InMemoryStorageService())
        ],
        [IKeybindingService, new MockKeybindingService()],
        [
          IEditorWorkerService,
          new class extends mock() {
            computeWordRanges() {
              return Promise.resolve({});
            }
          }()
        ],
        [
          ISuggestMemoryService,
          new class extends mock() {
            memorize() {
            }
            select() {
              return 0;
            }
          }()
        ],
        [
          IMenuService,
          new class extends mock() {
            createMenu() {
              return new class extends mock() {
                onDidChange = Event.None;
                dispose() {
                }
              }();
            }
          }()
        ],
        [ILabelService, new class extends mock() {
        }()],
        [
          IWorkspaceContextService,
          new class extends mock() {
          }()
        ],
        [
          IAccessibilitySignalService,
          {
            playSignal: async () => {
            },
            isSoundEnabled(signal) {
              return false;
            }
          }
        ]
      );
      if (options.provider) {
        const languageFeaturesService = new LanguageFeaturesService();
        serviceCollection.set(
          ILanguageFeaturesService,
          languageFeaturesService
        );
        disposableStore.add(
          languageFeaturesService.completionProvider.register(
            { pattern: "**" },
            options.provider
          )
        );
      }
      await withAsyncTestCodeEditor(
        text,
        { ...options, serviceCollection },
        async (editor, editorViewModel, instantiationService) => {
          editor.registerAndInstantiateContribution(
            SnippetController2.ID,
            SnippetController2
          );
          editor.registerAndInstantiateContribution(
            SuggestController.ID,
            SuggestController
          );
          editor.registerAndInstantiateContribution(
            InlineCompletionsController.ID,
            InlineCompletionsController
          );
          const model = InlineCompletionsController.get(editor)?.model.get();
          const context = new GhostTextContext(model, editor);
          await callback({ editor, editorViewModel, model, context });
          context.dispose();
        }
      );
    } finally {
      disposableStore.dispose();
    }
  });
}
