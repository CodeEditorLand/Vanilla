import assert from "assert";
import { equals } from "../../../../../base/common/arrays.js";
import {
  DeferredPromise,
  raceCancellation,
  timeout
} from "../../../../../base/common/async.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { assertType } from "../../../../../base/common/types.js";
import { mock } from "../../../../../base/test/common/mock.js";
import { runWithFakedTimers } from "../../../../../base/test/common/timeTravelScheduler.js";
import { IDiffProviderFactoryService } from "../../../../../editor/browser/widget/diffEditor/diffProviderFactoryService.js";
import { EditOperation } from "../../../../../editor/common/core/editOperation.js";
import { Range } from "../../../../../editor/common/core/range.js";
import {
  EndOfLineSequence
} from "../../../../../editor/common/model.js";
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
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { NullHoverService } from "../../../../../platform/hover/test/browser/nullHoverService.js";
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
import {
  IViewDescriptorService
} from "../../../../common/views.js";
import { IWorkbenchAssignmentService } from "../../../../services/assignment/common/assignmentService.js";
import { NullWorkbenchAssignmentService } from "../../../../services/assignment/test/common/nullAssignmentService.js";
import {
  IExtensionService,
  nullExtensionDescription
} from "../../../../services/extensions/common/extensions.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import {
  TestViewsService,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
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
  IChatAgentNameService,
  IChatAgentService
} from "../../../chat/common/chatAgents.js";
import {
  IChatService
} from "../../../chat/common/chatService.js";
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
import { INotebookEditorService } from "../../../notebook/browser/services/notebookEditorService.js";
import { RerunAction } from "../../browser/inlineChatActions.js";
import {
  InlineChatController,
  State
} from "../../browser/inlineChatController.js";
import { IInlineChatSavingService } from "../../browser/inlineChatSavingService.js";
import { IInlineChatSessionService } from "../../browser/inlineChatSessionService.js";
import { InlineChatSessionServiceImpl } from "../../browser/inlineChatSessionServiceImpl.js";
import {
  CTX_INLINE_CHAT_USER_DID_EDIT,
  EditMode,
  InlineChatConfigKeys
} from "../../common/inlineChat.js";
import { TestWorkerService } from "./testWorkerService.js";
suite("InteractiveChatController", function() {
  const agentData = {
    extensionId: nullExtensionDescription.identifier,
    publisherDisplayName: "",
    extensionDisplayName: "",
    extensionPublisherId: "",
    // id: 'testEditorAgent',
    name: "testEditorAgent",
    isDefault: true,
    locations: [ChatAgentLocation.Editor],
    metadata: {},
    slashCommands: [],
    disambiguation: []
  };
  class TestController extends InlineChatController {
    static INIT_SEQUENCE = [
      State.CREATE_SESSION,
      State.INIT_UI,
      State.WAIT_FOR_INPUT
    ];
    static INIT_SEQUENCE_AUTO_SEND = [
      ...this.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ];
    onDidChangeState = this._onDidEnterState.event;
    states = [];
    awaitStates(states) {
      const actual = [];
      return new Promise((resolve, reject) => {
        const d = this.onDidChangeState((state) => {
          actual.push(state);
          if (equals(states, actual)) {
            d.dispose();
            resolve(void 0);
          }
        });
        setTimeout(() => {
          d.dispose();
          resolve(`[${states.join(",")}] <> [${actual.join(",")}]`);
        }, 1e3);
      });
    }
  }
  const store = new DisposableStore();
  let configurationService;
  let editor;
  let model;
  let ctrl;
  let contextKeyService;
  let chatService;
  let chatAgentService;
  let inlineChatSessionService;
  let instaService;
  let chatWidget;
  setup(() => {
    const serviceCollection = new ServiceCollection(
      [IConfigurationService, new TestConfigurationService()],
      [IChatVariablesService, new SyncDescriptor(ChatVariablesService)],
      [ILogService, new NullLogService()],
      [ITelemetryService, NullTelemetryService],
      [IHoverService, NullHoverService],
      [IExtensionService, new TestExtensionService()],
      [IContextKeyService, new MockContextKeyService()],
      [
        IViewsService,
        new class extends TestViewsService {
          async openView(id, focus) {
            return { widget: chatWidget ?? null };
          }
        }()
      ],
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
      [
        IChatAgentNameService,
        new class extends mock() {
          getAgentNameRestriction(chatAgentData) {
            return false;
          }
        }()
      ],
      [IEditorWorkerService, new SyncDescriptor(TestWorkerService)],
      [IContextKeyService, contextKeyService],
      [IChatAgentService, new SyncDescriptor(ChatAgentService)],
      [
        IDiffProviderFactoryService,
        new SyncDescriptor(TestDiffProviderFactoryService)
      ],
      [
        IInlineChatSessionService,
        new SyncDescriptor(InlineChatSessionServiceImpl)
      ],
      [ICommandService, new SyncDescriptor(TestCommandService)],
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
      [IConfigurationService, configurationService],
      [
        IViewDescriptorService,
        new class extends mock() {
          onDidChangeLocation = Event.None;
        }()
      ],
      [
        INotebookEditorService,
        new class extends mock() {
          listNotebookEditors() {
            return [];
          }
        }()
      ],
      [IWorkbenchAssignmentService, new NullWorkbenchAssignmentService()]
    );
    instaService = store.add(
      store.add(workbenchInstantiationService(void 0, store)).createChild(serviceCollection)
    );
    configurationService = instaService.get(
      IConfigurationService
    );
    configurationService.setUserConfiguration("chat", {
      editor: { fontSize: 14, fontFamily: "default" }
    });
    configurationService.setUserConfiguration("inlineChat", {
      mode: "livePreview"
    });
    configurationService.setUserConfiguration("editor", {});
    contextKeyService = instaService.get(
      IContextKeyService
    );
    chatService = instaService.get(IChatService);
    chatAgentService = instaService.get(IChatAgentService);
    inlineChatSessionService = store.add(
      instaService.get(IInlineChatSessionService)
    );
    model = store.add(
      instaService.get(IModelService).createModel("Hello\nWorld\nHello Again\nHello World\n", null)
    );
    model.setEOL(EndOfLineSequence.LF);
    editor = store.add(instantiateTestCodeEditor(instaService, model));
    store.add(
      chatAgentService.registerDynamicAgent(
        { id: "testEditorAgent", ...agentData },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: request.message
                }
              ]
            });
            return {};
          }
        }
      )
    );
  });
  teardown(() => {
    store.clear();
    ctrl?.dispose();
  });
  test("creation, not showing anything", () => {
    ctrl = instaService.createInstance(TestController, editor);
    assert.ok(ctrl);
    assert.strictEqual(ctrl.getWidgetPosition(), void 0);
  });
  test("run (show/hide)", async () => {
    ctrl = instaService.createInstance(TestController, editor);
    const actualStates = ctrl.awaitStates(
      TestController.INIT_SEQUENCE_AUTO_SEND
    );
    const run = ctrl.run({ message: "Hello", autoSend: true });
    assert.strictEqual(await actualStates, void 0);
    assert.ok(ctrl.getWidgetPosition() !== void 0);
    await ctrl.cancelSession();
    await run;
    assert.ok(ctrl.getWidgetPosition() === void 0);
  });
  test("wholeRange does not expand to whole lines, editor selection default", async () => {
    editor.setSelection(new Range(1, 1, 1, 3));
    ctrl = instaService.createInstance(TestController, editor);
    ctrl.run({});
    await Event.toPromise(
      Event.filter(
        ctrl.onDidChangeState,
        (e) => e === State.WAIT_FOR_INPUT
      )
    );
    const session = inlineChatSessionService.getSession(
      editor,
      editor.getModel().uri
    );
    assert.ok(session);
    assert.deepStrictEqual(session.wholeRange.value, new Range(1, 1, 1, 3));
    await ctrl.cancelSession();
  });
  test("typing outside of wholeRange finishes session", async () => {
    configurationService.setUserConfiguration(
      InlineChatConfigKeys.FinishOnType,
      true
    );
    ctrl = instaService.createInstance(TestController, editor);
    const actualStates = ctrl.awaitStates(
      TestController.INIT_SEQUENCE_AUTO_SEND
    );
    const r = ctrl.run({ message: "Hello", autoSend: true });
    assert.strictEqual(await actualStates, void 0);
    const session = inlineChatSessionService.getSession(
      editor,
      editor.getModel().uri
    );
    assert.ok(session);
    assert.deepStrictEqual(
      session.wholeRange.value,
      new Range(
        1,
        1,
        1,
        10
        /* line length */
      )
    );
    editor.setSelection(new Range(2, 1, 2, 1));
    editor.trigger("test", "type", { text: "a" });
    assert.strictEqual(await ctrl.awaitStates([State.ACCEPT]), void 0);
    await r;
  });
  test("'whole range' isn't updated for edits outside whole range #4346", async () => {
    editor.setSelection(new Range(3, 1, 3, 3));
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: editor.getModel().uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  // EDIT happens outside of whole range
                  text: `${request.message}
${request.message}`
                }
              ]
            });
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates(TestController.INIT_SEQUENCE);
    const r = ctrl.run({ message: "GENGEN", autoSend: false });
    assert.strictEqual(await p, void 0);
    const session = inlineChatSessionService.getSession(
      editor,
      editor.getModel().uri
    );
    assert.ok(session);
    assert.deepStrictEqual(session.wholeRange.value, new Range(3, 1, 3, 3));
    ctrl.chatWidget.setInput("GENGEN");
    ctrl.acceptInput();
    assert.strictEqual(
      await ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]),
      void 0
    );
    assert.deepStrictEqual(session.wholeRange.value, new Range(1, 1, 4, 3));
    await ctrl.cancelSession();
    await r;
  });
  test("Stuck inline chat widget #211", async () => {
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            return new Promise(() => {
            });
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST
    ]);
    const r = ctrl.run({ message: "Hello", autoSend: true });
    assert.strictEqual(await p, void 0);
    ctrl.acceptSession();
    await r;
    assert.strictEqual(ctrl.getWidgetPosition(), void 0);
  });
  test("[Bug] Inline Chat's streaming pushed broken iterations to the undo stack #2403", async () => {
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: "hEllo1\n"
                }
              ]
            });
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(2, 1, 2, 1),
                  text: "hEllo2\n"
                }
              ]
            });
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1e3, 1),
                  text: "Hello1\nHello2\n"
                }
              ]
            });
            return {};
          }
        }
      )
    );
    const valueThen = editor.getModel().getValue();
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    const r = ctrl.run({ message: "Hello", autoSend: true });
    assert.strictEqual(await p, void 0);
    ctrl.acceptSession();
    await r;
    assert.strictEqual(editor.getModel().getValue(), "Hello1\nHello2\n");
    editor.getModel().undo();
    assert.strictEqual(editor.getModel().getValue(), valueThen);
  });
  test.skip("UI is streaming edits minutes after the response is finished #3345", async () => {
    configurationService.setUserConfiguration(
      InlineChatConfigKeys.Mode,
      EditMode.Live
    );
    return runWithFakedTimers(
      { maxTaskCount: Number.MAX_SAFE_INTEGER },
      async () => {
        store.add(
          chatAgentService.registerDynamicAgent(
            {
              id: "testEditorAgent2",
              ...agentData
            },
            {
              async invoke(request, progress, history, token) {
                const text = "${CSI}#a\n${CSI}#b\n${CSI}#c\n";
                await timeout(10);
                progress({
                  kind: "textEdit",
                  uri: model.uri,
                  edits: [
                    {
                      range: new Range(1, 1, 1, 1),
                      text
                    }
                  ]
                });
                await timeout(10);
                progress({
                  kind: "textEdit",
                  uri: model.uri,
                  edits: [
                    {
                      range: new Range(1, 1, 1, 1),
                      text: text.repeat(1e3) + "DONE"
                    }
                  ]
                });
                throw new Error("Too long");
              }
            }
          )
        );
        ctrl = instaService.createInstance(TestController, editor);
        const p = ctrl.awaitStates([
          ...TestController.INIT_SEQUENCE,
          State.SHOW_REQUEST,
          State.WAIT_FOR_INPUT
        ]);
        const r = ctrl.run({ message: "Hello", autoSend: true });
        assert.strictEqual(await p, void 0);
        assert.ok(!editor.getModel().getValue().includes("DONE"));
        await timeout(10);
        assert.ok(!editor.getModel().getValue().includes("DONE"));
        await ctrl.cancelSession();
        await r;
      }
    );
  });
  test("escape doesn't remove code added from inline editor chat #3523 1/2", async () => {
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    const r = ctrl.run({ message: "GENERATED", autoSend: true });
    assert.strictEqual(await p, void 0);
    assert.ok(model.getValue().includes("GENERATED"));
    assert.strictEqual(
      contextKeyService.getContextKeyValue(
        CTX_INLINE_CHAT_USER_DID_EDIT.key
      ),
      void 0
    );
    ctrl.cancelSession();
    await r;
    assert.ok(!model.getValue().includes("GENERATED"));
  });
  test("escape doesn't remove code added from inline editor chat #3523, 2/2", async () => {
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    const r = ctrl.run({ message: "GENERATED", autoSend: true });
    assert.strictEqual(await p, void 0);
    assert.ok(model.getValue().includes("GENERATED"));
    editor.executeEdits("test", [
      EditOperation.insert(
        model.getFullModelRange().getEndPosition(),
        "MANUAL"
      )
    ]);
    assert.strictEqual(
      contextKeyService.getContextKeyValue(
        CTX_INLINE_CHAT_USER_DID_EDIT.key
      ),
      true
    );
    ctrl.finishExistingSession();
    await r;
    assert.ok(model.getValue().includes("GENERATED"));
    assert.ok(model.getValue().includes("MANUAL"));
  });
  test("re-run should discard pending edits", async () => {
    let count = 1;
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: request.message + count++
                }
              ]
            });
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const rerun = new RerunAction();
    model.setValue("");
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    const r = ctrl.run({ message: "PROMPT_", autoSend: true });
    assert.strictEqual(await p, void 0);
    assert.strictEqual(model.getValue(), "PROMPT_1");
    const p2 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    await instaService.invokeFunction(
      rerun.runInlineChatCommand,
      ctrl,
      editor
    );
    assert.strictEqual(await p2, void 0);
    assert.strictEqual(model.getValue(), "PROMPT_2");
    ctrl.finishExistingSession();
    await r;
  });
  test("Retry undoes all changes, not just those from the request#5736", async () => {
    const text = ["eins-", "zwei-", "drei-"];
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: text.shift() ?? ""
                }
              ]
            });
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const rerun = new RerunAction();
    model.setValue("");
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    const r = ctrl.run({ message: "1", autoSend: true });
    assert.strictEqual(await p, void 0);
    assert.strictEqual(model.getValue(), "eins-");
    const p2 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    ctrl.chatWidget.setInput("1");
    await ctrl.acceptInput();
    assert.strictEqual(await p2, void 0);
    assert.strictEqual(model.getValue(), "zwei-eins-");
    const p3 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    await instaService.invokeFunction(
      rerun.runInlineChatCommand,
      ctrl,
      editor
    );
    assert.strictEqual(await p3, void 0);
    assert.strictEqual(model.getValue(), "drei-eins-");
    ctrl.finishExistingSession();
    await r;
  });
  test("moving inline chat to another model undoes changes", async () => {
    const text = ["eins\n", "zwei\n"];
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: text.shift() ?? ""
                }
              ]
            });
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    ctrl.run({ message: "1", autoSend: true });
    assert.strictEqual(await p, void 0);
    assert.strictEqual(
      model.getValue(),
      "eins\nHello\nWorld\nHello Again\nHello World\n"
    );
    const targetModel = chatService.startSession(
      ChatAgentLocation.Editor,
      CancellationToken.None
    );
    store.add(targetModel);
    chatWidget = new class extends mock() {
      get viewModel() {
        return { model: targetModel };
      }
      focusLastMessage() {
      }
    }();
    const r = ctrl.joinCurrentRun();
    await ctrl.viewInChat();
    assert.strictEqual(
      model.getValue(),
      "Hello\nWorld\nHello Again\nHello World\n"
    );
    await r;
  });
  test("moving inline chat to another model undoes changes (2 requests)", async () => {
    const text = ["eins\n", "zwei\n"];
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: text.shift() ?? ""
                }
              ]
            });
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    ctrl.run({ message: "1", autoSend: true });
    assert.strictEqual(await p, void 0);
    assert.strictEqual(
      model.getValue(),
      "eins\nHello\nWorld\nHello Again\nHello World\n"
    );
    const p2 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    ctrl.chatWidget.setInput("1");
    await ctrl.acceptInput();
    assert.strictEqual(await p2, void 0);
    assert.strictEqual(
      model.getValue(),
      "zwei\neins\nHello\nWorld\nHello Again\nHello World\n"
    );
    const targetModel = chatService.startSession(
      ChatAgentLocation.Editor,
      CancellationToken.None
    );
    store.add(targetModel);
    chatWidget = new class extends mock() {
      get viewModel() {
        return { model: targetModel };
      }
      focusLastMessage() {
      }
    }();
    const r = ctrl.joinCurrentRun();
    await ctrl.viewInChat();
    assert.strictEqual(
      model.getValue(),
      "Hello\nWorld\nHello Again\nHello World\n"
    );
    await r;
  });
  test('Clicking "re-run without /doc" while a request is in progress closes the widget #5997', async () => {
    model.setValue("");
    let count = 0;
    const commandDetection = [];
    const onDidInvoke = new Emitter();
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request2, progress, history, token) {
            queueMicrotask(() => onDidInvoke.fire());
            commandDetection.push(request2.enableCommandDetection);
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: request2.message + count++
                }
              ]
            });
            if (count === 1) {
              await raceCancellation(
                new Promise(() => {
                }),
                token
              );
            } else {
              await timeout(10);
            }
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = Event.toPromise(onDidInvoke.event);
    ctrl.run({ message: "Hello-", autoSend: true });
    await p;
    const request = ctrl.chatWidget.viewModel?.model.getRequests().at(-1);
    assertType(request);
    const p2 = Event.toPromise(onDidInvoke.event);
    const p3 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    chatService.resendRequest(request, {
      noCommandDetection: true,
      attempt: request.attempt + 1,
      location: ChatAgentLocation.Editor
    });
    await p2;
    assert.strictEqual(await p3, void 0);
    assert.deepStrictEqual(commandDetection, [true, false]);
    assert.strictEqual(model.getValue(), "Hello-1");
  });
  test("Re-run without after request is done", async () => {
    model.setValue("");
    let count = 0;
    const commandDetection = [];
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request2, progress, history, token) {
            commandDetection.push(request2.enableCommandDetection);
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: request2.message + count++
                }
              ]
            });
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    ctrl.run({ message: "Hello-", autoSend: true });
    assert.strictEqual(await p, void 0);
    const request = ctrl.chatWidget.viewModel?.model.getRequests().at(-1);
    assertType(request);
    const p2 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    chatService.resendRequest(request, {
      noCommandDetection: true,
      attempt: request.attempt + 1,
      location: ChatAgentLocation.Editor
    });
    assert.strictEqual(await p2, void 0);
    assert.deepStrictEqual(commandDetection, [true, false]);
    assert.strictEqual(model.getValue(), "Hello-1");
  });
  test("Inline: Pressing Rerun request while the response streams breaks the response #5442", async () => {
    model.setValue("two\none\n");
    const attempts = [];
    const deferred = new DeferredPromise();
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, progress, history, token) {
            attempts.push(request.attempt);
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: `TRY:${request.attempt}
`
                }
              ]
            });
            await raceCancellation(deferred.p, token);
            deferred.complete();
            await timeout(10);
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST
    ]);
    ctrl.run({ message: "Hello-", autoSend: true });
    assert.strictEqual(await p, void 0);
    await timeout(10);
    assert.deepStrictEqual(attempts, [0]);
    const p2 = ctrl.awaitStates([State.SHOW_REQUEST, State.WAIT_FOR_INPUT]);
    const rerun = new RerunAction();
    await instaService.invokeFunction(
      rerun.runInlineChatCommand,
      ctrl,
      editor
    );
    assert.strictEqual(await p2, void 0);
    assert.deepStrictEqual(attempts, [0, 1]);
    assert.strictEqual(model.getValue(), "TRY:1\ntwo\none\n");
  });
  test("Stopping/cancelling a request should NOT undo its changes", async () => {
    model.setValue("World");
    const deferred = new DeferredPromise();
    let progress;
    store.add(
      chatAgentService.registerDynamicAgent(
        {
          id: "testEditorAgent2",
          ...agentData
        },
        {
          async invoke(request, _progress, history, token) {
            progress = _progress;
            await deferred.p;
            return {};
          }
        }
      )
    );
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST
    ]);
    ctrl.run({ message: "Hello", autoSend: true });
    await timeout(10);
    assert.strictEqual(await p, void 0);
    assertType(progress);
    const modelChange = new Promise(
      (resolve) => model.onDidChangeContent(() => resolve())
    );
    progress({
      kind: "textEdit",
      uri: model.uri,
      edits: [{ range: new Range(1, 1, 1, 1), text: "Hello-Hello" }]
    });
    await modelChange;
    assert.strictEqual(model.getValue(), "HelloWorld");
    const p2 = ctrl.awaitStates([State.WAIT_FOR_INPUT]);
    chatService.cancelCurrentRequestForSession(
      ctrl.chatWidget.viewModel.model.sessionId
    );
    assert.strictEqual(await p2, void 0);
    assert.strictEqual(model.getValue(), "HelloWorld");
  });
  test("Apply Edits from existing session w/ edits", async () => {
    model.setValue("");
    const newSession = await inlineChatSessionService.createSession(
      editor,
      { editMode: EditMode.Live },
      CancellationToken.None
    );
    assertType(newSession);
    await chatService.sendRequest(
      newSession.chatModel.sessionId,
      "Existing",
      { location: ChatAgentLocation.Editor }
    );
    assert.strictEqual(newSession.chatModel.requestInProgress, true);
    const response = newSession.chatModel.lastRequest?.response;
    assertType(response);
    await new Promise((resolve) => {
      if (response.isComplete) {
        resolve(void 0);
      }
      const d = response.onDidChange(() => {
        if (response.isComplete) {
          d.dispose();
          resolve(void 0);
        }
      });
    });
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([...TestController.INIT_SEQUENCE]);
    ctrl.run({ existingSession: newSession });
    assert.strictEqual(await p, void 0);
    assert.strictEqual(model.getValue(), "Existing");
  });
  test("Undo on error (2 rounds)", async () => runWithFakedTimers({}, async () => {
    store.add(
      chatAgentService.registerDynamicAgent(
        { id: "testEditorAgent", ...agentData },
        {
          async invoke(request, progress, history, token) {
            progress({
              kind: "textEdit",
              uri: model.uri,
              edits: [
                {
                  range: new Range(1, 1, 1, 1),
                  text: request.message
                }
              ]
            });
            if (request.message === "two") {
              await timeout(100);
              return {
                errorDetails: { message: "FAILED" }
              };
            }
            return {};
          }
        }
      )
    );
    model.setValue("");
    ctrl = instaService.createInstance(TestController, editor);
    const p = ctrl.awaitStates([
      ...TestController.INIT_SEQUENCE,
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    ctrl.run({ autoSend: true, message: "one" });
    assert.strictEqual(await p, void 0);
    assert.strictEqual(model.getValue(), "one");
    const p2 = ctrl.awaitStates([
      State.SHOW_REQUEST,
      State.WAIT_FOR_INPUT
    ]);
    const values = /* @__PURE__ */ new Set();
    store.add(
      model.onDidChangeContent(() => values.add(model.getValue()))
    );
    ctrl.chatWidget.acceptInput("two");
    assert.strictEqual(await p2, void 0);
    assert.strictEqual(model.getValue(), "one");
    assert.ok(values.has("twoone"));
  }));
});
