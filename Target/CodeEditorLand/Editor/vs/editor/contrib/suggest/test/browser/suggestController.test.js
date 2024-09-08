import assert from "assert";
import { timeout } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { mock } from "../../../../../base/test/common/mock.js";
import {
  IMenuService
} from "../../../../../platform/actions/common/actions.js";
import { IEnvironmentService } from "../../../../../platform/environment/common/environment.js";
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
import { Selection } from "../../../../common/core/selection.js";
import {
  CompletionItemInsertTextRule,
  CompletionItemKind
} from "../../../../common/languages.js";
import { IEditorWorkerService } from "../../../../common/services/editorWorker.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { LanguageFeaturesService } from "../../../../common/services/languageFeaturesService.js";
import {
  createTestCodeEditor
} from "../../../../test/browser/testCodeEditor.js";
import { createTextModel } from "../../../../test/common/testTextModel.js";
import { DeleteLinesAction } from "../../../linesOperations/browser/linesOperations.js";
import { SnippetController2 } from "../../../snippet/browser/snippetController2.js";
import { SuggestController } from "../../browser/suggestController.js";
import { ISuggestMemoryService } from "../../browser/suggestMemory.js";
suite("SuggestController", () => {
  const disposables = new DisposableStore();
  let controller;
  let editor;
  let model;
  const languageFeaturesService = new LanguageFeaturesService();
  teardown(() => {
    disposables.clear();
  });
  setup(() => {
    const serviceCollection = new ServiceCollection(
      [ILanguageFeaturesService, languageFeaturesService],
      [ITelemetryService, NullTelemetryService],
      [ILogService, new NullLogService()],
      [IStorageService, disposables.add(new InMemoryStorageService())],
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
        IEnvironmentService,
        new class extends mock() {
          isBuilt = true;
          isExtensionDevelopment = false;
        }()
      ]
    );
    model = disposables.add(
      createTextModel(
        "",
        void 0,
        void 0,
        URI.from({ scheme: "test-ctrl", path: "/path.tst" })
      )
    );
    editor = disposables.add(
      createTestCodeEditor(model, { serviceCollection })
    );
    editor.registerAndInstantiateContribution(
      SnippetController2.ID,
      SnippetController2
    );
    controller = editor.registerAndInstantiateContribution(
      SuggestController.ID,
      SuggestController
    );
  });
  test("postfix completion reports incorrect position #86984", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "let ${1:name} = foo$0",
                  insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
                  range: {
                    startLineNumber: 1,
                    startColumn: 9,
                    endLineNumber: 1,
                    endColumn: 11
                  },
                  additionalTextEdits: [
                    {
                      text: "",
                      range: {
                        startLineNumber: 1,
                        startColumn: 5,
                        endLineNumber: 1,
                        endColumn: 9
                      }
                    }
                  ]
                }
              ]
            };
          }
        }
      )
    );
    editor.setValue("    foo.le");
    editor.setSelection(new Selection(1, 11, 1, 11));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(false, false);
    await p2;
    assert.strictEqual(editor.getValue(), "    let name = foo");
  });
  test("use additionalTextEdits sync when possible", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hello",
                  range: Range.fromPositions(pos),
                  additionalTextEdits: [
                    {
                      text: "I came sync",
                      range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 1,
                        endColumn: 1
                      }
                    }
                  ]
                }
              ]
            };
          },
          async resolveCompletionItem(item) {
            return item;
          }
        }
      )
    );
    editor.setValue("hello\nhallo");
    editor.setSelection(new Selection(2, 6, 2, 6));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(false, false);
    await p2;
    assert.strictEqual(editor.getValue(), "I came synchello\nhallohello");
  });
  test("resolve additionalTextEdits async when needed", async () => {
    let resolveCallCount = 0;
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hello",
                  range: Range.fromPositions(pos)
                }
              ]
            };
          },
          async resolveCompletionItem(item) {
            resolveCallCount += 1;
            await timeout(10);
            item.additionalTextEdits = [
              {
                text: "I came late",
                range: {
                  startLineNumber: 1,
                  startColumn: 1,
                  endLineNumber: 1,
                  endColumn: 1
                }
              }
            ];
            return item;
          }
        }
      )
    );
    editor.setValue("hello\nhallo");
    editor.setSelection(new Selection(2, 6, 2, 6));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(false, false);
    await p2;
    assert.strictEqual(editor.getValue(), "hello\nhallohello");
    assert.strictEqual(resolveCallCount, 1);
    await timeout(20);
    assert.strictEqual(editor.getValue(), "I came latehello\nhallohello");
    editor.getModel()?.undo();
    assert.strictEqual(editor.getValue(), "hello\nhallo");
  });
  test("resolve additionalTextEdits async when needed (typing)", async () => {
    let resolveCallCount = 0;
    let resolve = () => {
    };
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hello",
                  range: Range.fromPositions(pos)
                }
              ]
            };
          },
          async resolveCompletionItem(item) {
            resolveCallCount += 1;
            await new Promise((_resolve) => resolve = _resolve);
            item.additionalTextEdits = [
              {
                text: "I came late",
                range: {
                  startLineNumber: 1,
                  startColumn: 1,
                  endLineNumber: 1,
                  endColumn: 1
                }
              }
            ];
            return item;
          }
        }
      )
    );
    editor.setValue("hello\nhallo");
    editor.setSelection(new Selection(2, 6, 2, 6));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(false, false);
    await p2;
    assert.strictEqual(editor.getValue(), "hello\nhallohello");
    assert.strictEqual(resolveCallCount, 1);
    assert.ok(
      editor.getSelection()?.equalsSelection(new Selection(2, 11, 2, 11))
    );
    editor.trigger("test", "type", { text: "TYPING" });
    assert.strictEqual(editor.getValue(), "hello\nhallohelloTYPING");
    resolve();
    await timeout(10);
    assert.strictEqual(
      editor.getValue(),
      "I came latehello\nhallohelloTYPING"
    );
    assert.ok(
      editor.getSelection()?.equalsSelection(new Selection(2, 17, 2, 17))
    );
  });
  test("resolve additionalTextEdits async when needed (simple conflict)", async () => {
    let resolveCallCount = 0;
    let resolve = () => {
    };
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hello",
                  range: Range.fromPositions(pos)
                }
              ]
            };
          },
          async resolveCompletionItem(item) {
            resolveCallCount += 1;
            await new Promise((_resolve) => resolve = _resolve);
            item.additionalTextEdits = [
              {
                text: "I came late",
                range: {
                  startLineNumber: 1,
                  startColumn: 6,
                  endLineNumber: 1,
                  endColumn: 6
                }
              }
            ];
            return item;
          }
        }
      )
    );
    editor.setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(false, false);
    await p2;
    assert.strictEqual(editor.getValue(), "hello");
    assert.strictEqual(resolveCallCount, 1);
    resolve();
    await timeout(10);
    assert.strictEqual(editor.getValue(), "hello");
  });
  test("resolve additionalTextEdits async when needed (conflict)", async () => {
    let resolveCallCount = 0;
    let resolve = () => {
    };
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hello",
                  range: Range.fromPositions(pos)
                }
              ]
            };
          },
          async resolveCompletionItem(item) {
            resolveCallCount += 1;
            await new Promise((_resolve) => resolve = _resolve);
            item.additionalTextEdits = [
              {
                text: "I came late",
                range: {
                  startLineNumber: 1,
                  startColumn: 2,
                  endLineNumber: 1,
                  endColumn: 2
                }
              }
            ];
            return item;
          }
        }
      )
    );
    editor.setValue("hello\nhallo");
    editor.setSelection(new Selection(2, 6, 2, 6));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(false, false);
    await p2;
    assert.strictEqual(editor.getValue(), "hello\nhallohello");
    assert.strictEqual(resolveCallCount, 1);
    editor.setSelection(new Selection(1, 1, 1, 1));
    editor.trigger("test", "type", { text: "TYPING" });
    assert.strictEqual(editor.getValue(), "TYPINGhello\nhallohello");
    resolve();
    await timeout(10);
    assert.strictEqual(editor.getValue(), "TYPINGhello\nhallohello");
    assert.ok(
      editor.getSelection()?.equalsSelection(new Selection(1, 7, 1, 7))
    );
  });
  test("resolve additionalTextEdits async when needed (cancel)", async () => {
    const resolve = [];
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hello",
                  range: Range.fromPositions(pos)
                },
                {
                  kind: CompletionItemKind.Snippet,
                  label: "let",
                  insertText: "hallo",
                  range: Range.fromPositions(pos)
                }
              ]
            };
          },
          async resolveCompletionItem(item) {
            await new Promise((_resolve) => resolve.push(_resolve));
            item.additionalTextEdits = [
              {
                text: "additionalTextEdits",
                range: {
                  startLineNumber: 1,
                  startColumn: 2,
                  endLineNumber: 1,
                  endColumn: 2
                }
              }
            ];
            return item;
          }
        }
      )
    );
    editor.setValue("abc");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(true, false);
    await p2;
    assert.strictEqual(editor.getValue(), "helloabc");
    controller.acceptNextSuggestion();
    resolve.forEach((fn) => fn);
    resolve.length = 0;
    await timeout(10);
    assert.strictEqual(editor.getValue(), "halloabc");
  });
  test("Completion edits are applied inconsistently when additionalTextEdits and textEdit start at the same offset #143888", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Text,
                  label: "MyClassName",
                  insertText: "MyClassName",
                  range: Range.fromPositions(pos),
                  additionalTextEdits: [
                    {
                      range: Range.fromPositions(pos),
                      text: 'import "my_class.txt";\n'
                    }
                  ]
                }
              ]
            };
          }
        }
      )
    );
    editor.setValue("");
    editor.setSelection(new Selection(1, 1, 1, 1));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    controller.acceptSelectedSuggestion(true, false);
    await p2;
    assert.strictEqual(
      editor.getValue(),
      'import "my_class.txt";\nMyClassName'
    );
  });
  test("Pressing enter on autocomplete should always apply the selected dropdown completion, not a different, hidden one #161883", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            const word = doc.getWordUntilPosition(pos);
            const range = new Range(
              pos.lineNumber,
              word.startColumn,
              pos.lineNumber,
              word.endColumn
            );
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Text,
                  label: "filterBankSize",
                  insertText: "filterBankSize",
                  sortText: "a",
                  range
                },
                {
                  kind: CompletionItemKind.Text,
                  label: "filter",
                  insertText: "filter",
                  sortText: "b",
                  range
                }
              ]
            };
          }
        }
      )
    );
    editor.setValue("filte");
    editor.setSelection(new Selection(1, 6, 1, 6));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    const { completionModel } = await p1;
    assert.strictEqual(completionModel.items.length, 2);
    const [first, second] = completionModel.items;
    assert.strictEqual(first.textLabel, "filterBankSize");
    assert.strictEqual(second.textLabel, "filter");
    assert.deepStrictEqual(
      editor.getSelection(),
      new Selection(1, 6, 1, 6)
    );
    editor.trigger("keyboard", "type", { text: "r" });
    assert.deepStrictEqual(
      editor.getSelection(),
      new Selection(1, 7, 1, 7)
    );
    controller.acceptSelectedSuggestion(false, false);
    assert.strictEqual(editor.getValue(), "filter");
  });
  test("Fast autocomple typing selects the previous autocomplete suggestion, #71795", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            const word = doc.getWordUntilPosition(pos);
            const range = new Range(
              pos.lineNumber,
              word.startColumn,
              pos.lineNumber,
              word.endColumn
            );
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Text,
                  label: "false",
                  insertText: "false",
                  range
                },
                {
                  kind: CompletionItemKind.Text,
                  label: "float",
                  insertText: "float",
                  range
                },
                {
                  kind: CompletionItemKind.Text,
                  label: "for",
                  insertText: "for",
                  range
                },
                {
                  kind: CompletionItemKind.Text,
                  label: "foreach",
                  insertText: "foreach",
                  range
                }
              ]
            };
          }
        }
      )
    );
    editor.setValue("f");
    editor.setSelection(new Selection(1, 2, 1, 2));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    const { completionModel } = await p1;
    assert.strictEqual(completionModel.items.length, 4);
    const [first, second, third, fourth] = completionModel.items;
    assert.strictEqual(first.textLabel, "false");
    assert.strictEqual(second.textLabel, "float");
    assert.strictEqual(third.textLabel, "for");
    assert.strictEqual(fourth.textLabel, "foreach");
    assert.deepStrictEqual(
      editor.getSelection(),
      new Selection(1, 2, 1, 2)
    );
    editor.trigger("keyboard", "type", { text: "o" });
    assert.deepStrictEqual(
      editor.getSelection(),
      new Selection(1, 3, 1, 3)
    );
    controller.acceptSelectedSuggestion(false, false);
    assert.strictEqual(editor.getValue(), "for");
  });
  test.skip("Suggest widget gets orphaned in editor #187779", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            const word = doc.getLineContent(pos.lineNumber);
            const range = new Range(
              pos.lineNumber,
              1,
              pos.lineNumber,
              pos.column
            );
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Text,
                  label: word,
                  insertText: word,
                  range
                }
              ]
            };
          }
        }
      )
    );
    editor.setValue(`console.log(example.)
console.log(EXAMPLE.not)`);
    editor.setSelection(new Selection(1, 21, 1, 21));
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    await p1;
    const p2 = Event.toPromise(controller.model.onDidCancel);
    new DeleteLinesAction().run(null, editor);
    await p2;
  });
  test("Ranges where additionalTextEdits are applied are not appropriate when characters are typed #177591", async () => {
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Snippet,
                  label: "aaa",
                  insertText: "aaa",
                  range: Range.fromPositions(pos),
                  additionalTextEdits: [
                    {
                      range: Range.fromPositions(
                        pos.delta(0, 10)
                      ),
                      text: "aaa"
                    }
                  ]
                }
              ]
            };
          }
        }
      )
    );
    {
      editor.setValue(`123456789123456789`);
      editor.setSelection(new Selection(1, 1, 1, 1));
      const p1 = Event.toPromise(controller.model.onDidSuggest);
      controller.triggerSuggest();
      const e = await p1;
      assert.strictEqual(e.completionModel.items.length, 1);
      assert.strictEqual(e.completionModel.items[0].textLabel, "aaa");
      controller.acceptSelectedSuggestion(false, false);
      assert.strictEqual(editor.getValue(), "aaa1234567891aaa23456789");
    }
    {
      editor.setValue(`123456789123456789`);
      editor.setSelection(new Selection(1, 1, 1, 1));
      const p1 = Event.toPromise(controller.model.onDidSuggest);
      controller.triggerSuggest();
      const e = await p1;
      assert.strictEqual(e.completionModel.items.length, 1);
      assert.strictEqual(e.completionModel.items[0].textLabel, "aaa");
      editor.trigger("keyboard", "type", { text: "aa" });
      controller.acceptSelectedSuggestion(false, false);
      assert.strictEqual(editor.getValue(), "aaa1234567891aaa23456789");
    }
  });
  test.skip('[Bug] "No suggestions" persists while typing if the completion helper is set to return an empty list for empty content#3557', async () => {
    let requestCount = 0;
    disposables.add(
      languageFeaturesService.completionProvider.register(
        { scheme: "test-ctrl" },
        {
          _debugDisplayName: "test",
          provideCompletionItems(doc, pos) {
            requestCount += 1;
            if (requestCount === 1) {
              return void 0;
            }
            return {
              suggestions: [
                {
                  kind: CompletionItemKind.Text,
                  label: "foo",
                  insertText: "foo",
                  range: new Range(
                    pos.lineNumber,
                    1,
                    pos.lineNumber,
                    pos.column
                  )
                }
              ]
            };
          }
        }
      )
    );
    const p1 = Event.toPromise(controller.model.onDidSuggest);
    controller.triggerSuggest();
    const e1 = await p1;
    assert.strictEqual(e1.completionModel.items.length, 0);
    assert.strictEqual(requestCount, 1);
    const p2 = Event.toPromise(controller.model.onDidSuggest);
    editor.trigger("keyboard", "type", { text: "f" });
    const e2 = await p2;
    assert.strictEqual(e2.completionModel.items.length, 1);
    assert.strictEqual(requestCount, 2);
  });
});
