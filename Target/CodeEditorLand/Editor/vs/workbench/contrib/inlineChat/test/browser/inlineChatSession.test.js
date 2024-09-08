import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { assertType } from "../../../../../base/common/types.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { assertSnapshot } from "../../../../../base/test/common/snapshot.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IDiffProviderFactoryService } from "../../../../../editor/browser/widget/diffEditor/diffProviderFactoryService.js";
import { EditOperation } from "../../../../../editor/common/core/editOperation.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { IEditorWorkerService } from "../../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { TestDiffProviderFactoryService } from "../../../../../editor/test/browser/diff/testDiffProviderFactoryService.js";
import { TestCommandService } from "../../../../../editor/test/browser/editorTestServices.js";
import { instantiateTestCodeEditor } from "../../../../../editor/test/browser/testCodeEditor.js";
import { IAccessibleViewService } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../../platform/instantiation/common/descriptors.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { MockContextKeyService } from "../../../../../platform/keybinding/test/common/mockKeybindingService.js";
import {
  ILogService,
  NullLogService
} from "../../../../../platform/log/common/log.js";
import {
  IEditorProgressService
} from "../../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../../../platform/telemetry/common/telemetryUtils.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IViewDescriptorService } from "../../../../common/views.js";
import { IWorkbenchAssignmentService } from "../../../../services/assignment/common/assignmentService.js";
import { NullWorkbenchAssignmentService } from "../../../../services/assignment/test/common/nullAssignmentService.js";
import {
  IExtensionService,
  nullExtensionDescription
} from "../../../../services/extensions/common/extensions.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import {
  TestContextService,
  TestExtensionService
} from "../../../../test/common/workbenchTestServices.js";
import {
  IChatAccessibilityService,
  IChatWidgetService
} from "../../../chat/browser/chat.js";
import { ChatVariablesService } from "../../../chat/browser/chatVariables.js";
import { ChatWidgetService } from "../../../chat/browser/chatWidget.js";
import {
  ChatAgentLocation,
  ChatAgentService,
  IChatAgentService
} from "../../../chat/common/chatAgents.js";
import { IChatService } from "../../../chat/common/chatService.js";
import { ChatService } from "../../../chat/common/chatServiceImpl.js";
import {
  ChatSlashCommandService,
  IChatSlashCommandService
} from "../../../chat/common/chatSlashCommands.js";
import { IChatVariablesService } from "../../../chat/common/chatVariables.js";
import {
  ChatWidgetHistoryService,
  IChatWidgetHistoryService
} from "../../../chat/common/chatWidgetHistoryService.js";
import { ILanguageModelToolsService } from "../../../chat/common/languageModelToolsService.js";
import { MockLanguageModelToolsService } from "../../../chat/test/common/mockLanguageModelToolsService.js";
import { IInlineChatSavingService } from "../../browser/inlineChatSavingService.js";
import { HunkState } from "../../browser/inlineChatSession.js";
import { IInlineChatSessionService } from "../../browser/inlineChatSessionService.js";
import { InlineChatSessionServiceImpl } from "../../browser/inlineChatSessionServiceImpl.js";
import { EditMode } from "../../common/inlineChat.js";
import { TestWorkerService } from "./testWorkerService.js";
suite("InlineChatSession", () => {
  const store = new DisposableStore();
  let editor;
  let model;
  let instaService;
  let inlineChatSessionService;
  setup(() => {
    const contextKeyService = new MockContextKeyService();
    const serviceCollection = new ServiceCollection(
      [IConfigurationService, new TestConfigurationService()],
      [IChatVariablesService, new SyncDescriptor(ChatVariablesService)],
      [ILogService, new NullLogService()],
      [ITelemetryService, NullTelemetryService],
      [IExtensionService, new TestExtensionService()],
      [IContextKeyService, new MockContextKeyService()],
      [IViewsService, new TestExtensionService()],
      [IWorkspaceContextService, new TestContextService()],
      [
        IChatWidgetHistoryService,
        new SyncDescriptor(ChatWidgetHistoryService)
      ],
      [IChatWidgetService, new SyncDescriptor(ChatWidgetService)],
      [
        IChatSlashCommandService,
        new SyncDescriptor(ChatSlashCommandService)
      ],
      [IChatService, new SyncDescriptor(ChatService)],
      [IEditorWorkerService, new SyncDescriptor(TestWorkerService)],
      [IChatAgentService, new SyncDescriptor(ChatAgentService)],
      [IContextKeyService, contextKeyService],
      [
        IDiffProviderFactoryService,
        new SyncDescriptor(TestDiffProviderFactoryService)
      ],
      [
        IInlineChatSessionService,
        new SyncDescriptor(InlineChatSessionServiceImpl)
      ],
      [ICommandService, new SyncDescriptor(TestCommandService)],
      [ILanguageModelToolsService, new MockLanguageModelToolsService()],
      [
        IInlineChatSavingService,
        new class extends mock() {
          markChanged(session) {
          }
        }()
      ],
      [
        IEditorProgressService,
        new class extends mock() {
          show(total, delay) {
            return {
              total() {
              },
              worked(value) {
              },
              done() {
              }
            };
          }
        }()
      ],
      [
        IChatAccessibilityService,
        new class extends mock() {
          acceptResponse(response, requestId) {
          }
          acceptRequest() {
            return -1;
          }
        }()
      ],
      [
        IAccessibleViewService,
        new class extends mock() {
          getOpenAriaHint(verbositySettingKey) {
            return null;
          }
        }()
      ],
      [IConfigurationService, new TestConfigurationService()],
      [
        IViewDescriptorService,
        new class extends mock() {
          onDidChangeLocation = Event.None;
        }()
      ],
      [IWorkbenchAssignmentService, new NullWorkbenchAssignmentService()]
    );
    instaService = store.add(
      workbenchInstantiationService(void 0, store).createChild(
        serviceCollection
      )
    );
    inlineChatSessionService = store.add(
      instaService.get(IInlineChatSessionService)
    );
    instaService.get(IChatAgentService).registerDynamicAgent(
      {
        extensionId: nullExtensionDescription.identifier,
        publisherDisplayName: "",
        extensionDisplayName: "",
        extensionPublisherId: "",
        id: "testAgent",
        name: "testAgent",
        isDefault: true,
        locations: [ChatAgentLocation.Editor],
        metadata: {},
        slashCommands: [],
        disambiguation: []
      },
      {
        async invoke() {
          return {};
        }
      }
    );
    model = store.add(
      instaService.get(IModelService).createModel(
        "one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\neleven",
        null
      )
    );
    editor = store.add(instantiateTestCodeEditor(instaService, model));
  });
  teardown(() => {
    store.clear();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  async function makeEditAsAi(edit) {
    const session = inlineChatSessionService.getSession(
      editor,
      editor.getModel().uri
    );
    assertType(session);
    session.hunkData.ignoreTextModelNChanges = true;
    try {
      editor.executeEdits("test", Array.isArray(edit) ? edit : [edit]);
    } finally {
      session.hunkData.ignoreTextModelNChanges = false;
    }
    await session.hunkData.recompute({ applied: 0, sha1: "fakeSha1" });
  }
  function makeEdit(edit) {
    editor.executeEdits("test", Array.isArray(edit) ? edit : [edit]);
  }
  test("Create, release", async () => {
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    inlineChatSessionService.releaseSession(session);
  });
  test("HunkData, info", async () => {
    const decorationCountThen = model.getAllDecorations().length;
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    assert.ok(session.textModelN === model);
    await makeEditAsAi(
      EditOperation.insert(new Position(1, 1), "AI_EDIT\n")
    );
    assert.strictEqual(session.hunkData.size, 1);
    let [hunk] = session.hunkData.getInfo();
    assertType(hunk);
    assert.ok(
      !session.textModel0.equalsTextBuffer(
        session.textModelN.getTextBuffer()
      )
    );
    assert.strictEqual(hunk.getState(), HunkState.Pending);
    assert.ok(
      hunk.getRangesN()[0].equalsRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 7
      })
    );
    await makeEditAsAi(EditOperation.insert(new Position(1, 3), "foobar"));
    [hunk] = session.hunkData.getInfo();
    assert.ok(
      hunk.getRangesN()[0].equalsRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 13
      })
    );
    inlineChatSessionService.releaseSession(session);
    assert.strictEqual(
      model.getAllDecorations().length,
      decorationCountThen
    );
  });
  test("HunkData, accept", async () => {
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(1, 1), "AI_EDIT\n"),
      EditOperation.insert(new Position(10, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 2);
    assert.ok(
      !session.textModel0.equalsTextBuffer(
        session.textModelN.getTextBuffer()
      )
    );
    for (const hunk of session.hunkData.getInfo()) {
      assertType(hunk);
      assert.strictEqual(hunk.getState(), HunkState.Pending);
      hunk.acceptChanges();
      assert.strictEqual(hunk.getState(), HunkState.Accepted);
    }
    assert.strictEqual(
      session.textModel0.getValue(),
      session.textModelN.getValue()
    );
    inlineChatSessionService.releaseSession(session);
  });
  test("HunkData, reject", async () => {
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(1, 1), "AI_EDIT\n"),
      EditOperation.insert(new Position(10, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 2);
    assert.ok(
      !session.textModel0.equalsTextBuffer(
        session.textModelN.getTextBuffer()
      )
    );
    for (const hunk of session.hunkData.getInfo()) {
      assertType(hunk);
      assert.strictEqual(hunk.getState(), HunkState.Pending);
      hunk.discardChanges();
      assert.strictEqual(hunk.getState(), HunkState.Rejected);
    }
    assert.strictEqual(
      session.textModel0.getValue(),
      session.textModelN.getValue()
    );
    inlineChatSessionService.releaseSession(session);
  });
  test("HunkData, N rounds", async () => {
    model.setValue(
      "one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\neleven\ntwelwe\nthirteen\nfourteen\nfifteen\nsixteen\nseventeen\neighteen\nnineteen\n"
    );
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    assert.ok(
      session.textModel0.equalsTextBuffer(
        session.textModelN.getTextBuffer()
      )
    );
    assert.strictEqual(session.hunkData.size, 0);
    await makeEditAsAi([
      EditOperation.insert(new Position(1, 1), "AI1"),
      EditOperation.insert(new Position(4, 1), "AI2"),
      EditOperation.insert(new Position(19, 1), "AI3")
    ]);
    assert.strictEqual(session.hunkData.size, 2);
    let [first, second] = session.hunkData.getInfo();
    assert.ok(model.getValueInRange(first.getRangesN()[0]).includes("AI1"));
    assert.ok(model.getValueInRange(first.getRangesN()[0]).includes("AI2"));
    assert.ok(
      model.getValueInRange(second.getRangesN()[0]).includes("AI3")
    );
    assert.ok(
      !session.textModel0.getValueInRange(first.getRangesN()[0]).includes("AI1")
    );
    assert.ok(
      !session.textModel0.getValueInRange(first.getRangesN()[0]).includes("AI2")
    );
    assert.ok(
      !session.textModel0.getValueInRange(second.getRangesN()[0]).includes("AI3")
    );
    first.acceptChanges();
    assert.ok(
      session.textModel0.getValueInRange(first.getRangesN()[0]).includes("AI1")
    );
    assert.ok(
      session.textModel0.getValueInRange(first.getRangesN()[0]).includes("AI2")
    );
    assert.ok(
      !session.textModel0.getValueInRange(second.getRangesN()[0]).includes("AI3")
    );
    await makeEditAsAi([EditOperation.insert(new Position(7, 1), "AI4")]);
    assert.strictEqual(session.hunkData.size, 2);
    [first, second] = session.hunkData.getInfo();
    assert.ok(model.getValueInRange(first.getRangesN()[0]).includes("AI4"));
    assert.ok(
      model.getValueInRange(second.getRangesN()[0]).includes("AI3")
    );
    inlineChatSessionService.releaseSession(session);
  });
  test("HunkData, (mirror) edit before", async () => {
    const lines = ["one", "two", "three"];
    model.setValue(lines.join("\n"));
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(3, 1), "AI WAS HERE\n")
    ]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "AI WAS HERE", "three"].join("\n")
    );
    assert.strictEqual(session.textModel0.getValue(), lines.join("\n"));
    makeEdit([EditOperation.replace(new Range(1, 1, 1, 4), "ONE")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["ONE", "two", "AI WAS HERE", "three"].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["ONE", "two", "three"].join("\n")
    );
  });
  test("HunkData, (mirror) edit after", async () => {
    const lines = ["one", "two", "three", "four", "five"];
    model.setValue(lines.join("\n"));
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(3, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 1);
    const [hunk] = session.hunkData.getInfo();
    makeEdit([EditOperation.insert(new Position(1, 1), "USER1")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["USER1one", "two", "AI_EDIT", "three", "four", "five"].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["USER1one", "two", "three", "four", "five"].join("\n")
    );
    makeEdit([EditOperation.insert(new Position(5, 1), "USER2")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["USER1one", "two", "AI_EDIT", "three", "USER2four", "five"].join(
        "\n"
      )
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["USER1one", "two", "three", "USER2four", "five"].join("\n")
    );
    hunk.acceptChanges();
    assert.strictEqual(
      session.textModelN.getValue(),
      ["USER1one", "two", "AI_EDIT", "three", "USER2four", "five"].join(
        "\n"
      )
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["USER1one", "two", "AI_EDIT", "three", "USER2four", "five"].join(
        "\n"
      )
    );
  });
  test("HunkData, (mirror) edit inside ", async () => {
    const lines = ["one", "two", "three"];
    model.setValue(lines.join("\n"));
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(3, 1), "AI WAS HERE\n")
    ]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "AI WAS HERE", "three"].join("\n")
    );
    assert.strictEqual(session.textModel0.getValue(), lines.join("\n"));
    makeEdit([EditOperation.replace(new Range(3, 4, 3, 7), "wwaaassss")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "AI wwaaassss HERE", "three"].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three"].join("\n")
    );
  });
  test("HunkData, (mirror) edit after dicard ", async () => {
    const lines = ["one", "two", "three"];
    model.setValue(lines.join("\n"));
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(3, 1), "AI WAS HERE\n")
    ]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "AI WAS HERE", "three"].join("\n")
    );
    assert.strictEqual(session.textModel0.getValue(), lines.join("\n"));
    assert.strictEqual(session.hunkData.size, 1);
    const [hunk] = session.hunkData.getInfo();
    hunk.discardChanges();
    assert.strictEqual(session.textModelN.getValue(), lines.join("\n"));
    assert.strictEqual(session.textModel0.getValue(), lines.join("\n"));
    makeEdit([EditOperation.replace(new Range(3, 4, 3, 6), "3333")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "thr3333"].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "thr3333"].join("\n")
    );
  });
  test("HunkData, (mirror) edit after, multi turn", async () => {
    const lines = ["one", "two", "three", "four", "five"];
    model.setValue(lines.join("\n"));
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(3, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 1);
    makeEdit([EditOperation.insert(new Position(5, 1), "FOO")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "AI_EDIT", "three", "FOOfour", "five"].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three", "FOOfour", "five"].join("\n")
    );
    await makeEditAsAi([EditOperation.insert(new Position(2, 4), " zwei")]);
    assert.strictEqual(session.hunkData.size, 1);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two zwei", "AI_EDIT", "three", "FOOfour", "five"].join(
        "\n"
      )
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three", "FOOfour", "five"].join("\n")
    );
    makeEdit([EditOperation.replace(new Range(6, 3, 6, 5), "vefivefi")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      [
        "one",
        "two zwei",
        "AI_EDIT",
        "three",
        "FOOfour",
        "fivefivefi"
      ].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three", "FOOfour", "fivefivefi"].join("\n")
    );
  });
  test("HunkData, (mirror) edit after, multi turn 2", async () => {
    const lines = ["one", "two", "three", "four", "five"];
    model.setValue(lines.join("\n"));
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(3, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 1);
    makeEdit([EditOperation.insert(new Position(5, 1), "FOO")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "two", "AI_EDIT", "three", "FOOfour", "five"].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three", "FOOfour", "five"].join("\n")
    );
    await makeEditAsAi([EditOperation.insert(new Position(2, 4), "zwei")]);
    assert.strictEqual(session.hunkData.size, 1);
    assert.strictEqual(
      session.textModelN.getValue(),
      ["one", "twozwei", "AI_EDIT", "three", "FOOfour", "five"].join(
        "\n"
      )
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three", "FOOfour", "five"].join("\n")
    );
    makeEdit([EditOperation.replace(new Range(6, 3, 6, 5), "vefivefi")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      [
        "one",
        "twozwei",
        "AI_EDIT",
        "three",
        "FOOfour",
        "fivefivefi"
      ].join("\n")
    );
    assert.strictEqual(
      session.textModel0.getValue(),
      ["one", "two", "three", "FOOfour", "fivefivefi"].join("\n")
    );
    session.hunkData.getInfo()[0].acceptChanges();
    assert.strictEqual(
      session.textModelN.getValue(),
      session.textModel0.getValue()
    );
    makeEdit([EditOperation.replace(new Range(1, 1, 1, 1), "done")]);
    assert.strictEqual(
      session.textModelN.getValue(),
      session.textModel0.getValue()
    );
  });
  test("HunkData, accept, discardAll", async () => {
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(1, 1), "AI_EDIT\n"),
      EditOperation.insert(new Position(10, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 2);
    assert.ok(
      !session.textModel0.equalsTextBuffer(
        session.textModelN.getTextBuffer()
      )
    );
    const textModeNNow = session.textModelN.getValue();
    session.hunkData.getInfo()[0].acceptChanges();
    assert.strictEqual(textModeNNow, session.textModelN.getValue());
    session.hunkData.discardAll();
    assert.strictEqual(
      session.textModelN.getValue(),
      "AI_EDIT\none\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\neleven"
    );
    assert.strictEqual(
      session.textModelN.getValue(),
      session.textModel0.getValue()
    );
    inlineChatSessionService.releaseSession(session);
  });
  test("HunkData, discardAll return undo edits", async () => {
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.insert(new Position(1, 1), "AI_EDIT\n"),
      EditOperation.insert(new Position(10, 1), "AI_EDIT\n")
    ]);
    assert.strictEqual(session.hunkData.size, 2);
    assert.ok(
      !session.textModel0.equalsTextBuffer(
        session.textModelN.getTextBuffer()
      )
    );
    const textModeNNow = session.textModelN.getValue();
    session.hunkData.getInfo()[0].acceptChanges();
    assert.strictEqual(textModeNNow, session.textModelN.getValue());
    const undoEdits = session.hunkData.discardAll();
    assert.strictEqual(
      session.textModelN.getValue(),
      "AI_EDIT\none\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\neleven"
    );
    assert.strictEqual(
      session.textModelN.getValue(),
      session.textModel0.getValue()
    );
    session.textModelN.pushEditOperations(null, undoEdits, () => null);
    assert.strictEqual(textModeNNow, session.textModelN.getValue());
    inlineChatSessionService.releaseSession(session);
  });
  test('Pressing Escape after inline chat errored with "response filtered" leaves document dirty #7764', async () => {
    const origValue = `class Foo {
	private onError(error: string): void {
		if (/The request timed out|The network connection was lost/i.test(error)) {
			return;
		}

		error = error.replace(/See https://github.com/Squirrel/Squirrel.Mac/issues/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');

		this.notificationService.notify({
			severity: Severity.Error,
			message: error,
			source: nls.localize('update service', "Update Service"),
		});
	}
}`;
    model.setValue(origValue);
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    const fakeRequest = new class extends mock() {
      get id() {
        return "one";
      }
    }();
    session.markModelVersion(fakeRequest);
    assert.strictEqual(editor.getModel().getLineCount(), 15);
    await makeEditAsAi([
      EditOperation.replace(
        new Range(7, 1, 7, Number.MAX_SAFE_INTEGER),
        `error = error.replace(
			/See https://github.com/Squirrel/Squirrel.Mac/issues/182 for more information/,
			'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information'
		);`
      )
    ]);
    assert.strictEqual(editor.getModel().getLineCount(), 18);
    await session.undoChangesUntil(fakeRequest.id);
    await session.hunkData.recompute(
      { applied: 0, sha1: "fakeSha1" },
      void 0
    );
    assert.strictEqual(editor.getModel().getValue(), origValue);
    session.hunkData.discardAll();
    assert.strictEqual(editor.getModel().getValue(), origValue);
  });
  test("Apply Code's preview should be easier to undo/esc #7537", async () => {
    model.setValue(`export function fib(n) {
	if (n <= 0) return 0;
	if (n === 1) return 0;
	if (n === 2) return 1;
	return fib(n - 1) + fib(n - 2);
}`);
    const session = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(session);
    await makeEditAsAi([
      EditOperation.replace(
        new Range(5, 1, 6, Number.MAX_SAFE_INTEGER),
        `
	let a = 0, b = 1, c;
	for (let i = 3; i <= n; i++) {
		c = a + b;
		a = b;
		b = c;
	}
	return b;
}`
      )
    ]);
    assert.strictEqual(session.hunkData.size, 1);
    assert.strictEqual(session.hunkData.pending, 1);
    assert.ok(
      session.hunkData.getInfo().every((d) => d.getState() === HunkState.Pending)
    );
    await assertSnapshot(editor.getModel().getValue(), { name: "1" });
    await model.undo();
    await assertSnapshot(editor.getModel().getValue(), { name: "2" });
    assert.strictEqual(session.hunkData.size, 1);
    assert.strictEqual(session.hunkData.pending, 0);
    assert.ok(
      session.hunkData.getInfo().every((d) => d.getState() === HunkState.Accepted)
    );
    session.hunkData.discardAll();
    await assertSnapshot(editor.getModel().getValue(), { name: "2" });
  });
});
