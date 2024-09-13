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
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import {
  Barrier,
  DeferredPromise,
  Queue
} from "../../../../base/common/async.js";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Lazy } from "../../../../base/common/lazy.js";
import {
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { MovingAverage } from "../../../../base/common/numbers.js";
import { isEqual } from "../../../../base/common/resources.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { assertType } from "../../../../base/common/types.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import {
  isCodeEditor
} from "../../../../editor/browser/editorBrowser.js";
import {
  Position
} from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  Selection,
  SelectionDirection
} from "../../../../editor/common/core/selection.js";
import { TextEdit } from "../../../../editor/common/languages.js";
import { IEditorWorkerService } from "../../../../editor/common/services/editorWorker.js";
import { DefaultModelSHA1Computer } from "../../../../editor/common/services/modelService.js";
import { InlineCompletionsController } from "../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js";
import { MessageController } from "../../../../editor/contrib/message/browser/messageController.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { showChatView } from "../../chat/browser/chat.js";
import { ChatAgentLocation } from "../../chat/common/chatAgents.js";
import {
  CONTEXT_RESPONSE,
  CONTEXT_RESPONSE_ERROR
} from "../../chat/common/chatContextKeys.js";
import {
  ChatRequestRemovalReason
} from "../../chat/common/chatModel.js";
import { IChatService } from "../../chat/common/chatService.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import {
  CTX_INLINE_CHAT_EDITING,
  CTX_INLINE_CHAT_REQUEST_IN_PROGRESS,
  CTX_INLINE_CHAT_RESPONSE_TYPE,
  CTX_INLINE_CHAT_USER_DID_EDIT,
  CTX_INLINE_CHAT_VISIBLE,
  EditMode,
  INLINE_CHAT_ID,
  InlineChatConfigKeys,
  InlineChatResponseType
} from "../common/inlineChat.js";
import { IInlineChatSavingService } from "./inlineChatSavingService.js";
import {
  HunkState,
  Session
} from "./inlineChatSession.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
import { InlineChatError } from "./inlineChatSessionServiceImpl.js";
import {
  HunkAction,
  LiveStrategy,
  PreviewStrategy
} from "./inlineChatStrategies.js";
import { InlineChatZoneWidget } from "./inlineChatZoneWidget.js";
var State = /* @__PURE__ */ ((State2) => {
  State2["CREATE_SESSION"] = "CREATE_SESSION";
  State2["INIT_UI"] = "INIT_UI";
  State2["WAIT_FOR_INPUT"] = "WAIT_FOR_INPUT";
  State2["SHOW_REQUEST"] = "SHOW_REQUEST";
  State2["PAUSE"] = "PAUSE";
  State2["CANCEL"] = "CANCEL";
  State2["ACCEPT"] = "DONE";
  return State2;
})(State || {});
var Message = /* @__PURE__ */ ((Message2) => {
  Message2[Message2["NONE"] = 0] = "NONE";
  Message2[Message2["ACCEPT_SESSION"] = 1] = "ACCEPT_SESSION";
  Message2[Message2["CANCEL_SESSION"] = 2] = "CANCEL_SESSION";
  Message2[Message2["PAUSE_SESSION"] = 4] = "PAUSE_SESSION";
  Message2[Message2["CANCEL_REQUEST"] = 8] = "CANCEL_REQUEST";
  Message2[Message2["CANCEL_INPUT"] = 16] = "CANCEL_INPUT";
  Message2[Message2["ACCEPT_INPUT"] = 32] = "ACCEPT_INPUT";
  return Message2;
})(Message || {});
class InlineChatRunOptions {
  static {
    __name(this, "InlineChatRunOptions");
  }
  initialSelection;
  initialRange;
  message;
  autoSend;
  existingSession;
  isUnstashed;
  position;
  withIntentDetection;
  headless;
  static isInlineChatRunOptions(options) {
    const {
      initialSelection,
      initialRange,
      message,
      autoSend,
      position,
      existingSession
    } = options;
    if (typeof message !== "undefined" && typeof message !== "string" || typeof autoSend !== "undefined" && typeof autoSend !== "boolean" || typeof initialRange !== "undefined" && !Range.isIRange(initialRange) || typeof initialSelection !== "undefined" && !Selection.isISelection(initialSelection) || typeof position !== "undefined" && !Position.isIPosition(position) || typeof existingSession !== "undefined" && !(existingSession instanceof Session)) {
      return false;
    }
    return true;
  }
}
let InlineChatController = class {
  constructor(_editor, _instaService, _inlineChatSessionService, _inlineChatSavingService, _editorWorkerService, _logService, _configurationService, _dialogService, contextKeyService, _chatService, _editorService, notebookEditorService) {
    this._editor = _editor;
    this._instaService = _instaService;
    this._inlineChatSessionService = _inlineChatSessionService;
    this._inlineChatSavingService = _inlineChatSavingService;
    this._editorWorkerService = _editorWorkerService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._dialogService = _dialogService;
    this._chatService = _chatService;
    this._editorService = _editorService;
    this._ctxVisible = CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
    this._ctxEditing = CTX_INLINE_CHAT_EDITING.bindTo(contextKeyService);
    this._ctxUserDidEdit = CTX_INLINE_CHAT_USER_DID_EDIT.bindTo(contextKeyService);
    this._ctxResponseType = CTX_INLINE_CHAT_RESPONSE_TYPE.bindTo(contextKeyService);
    this._ctxRequestInProgress = CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.bindTo(contextKeyService);
    this._ctxResponse = CONTEXT_RESPONSE.bindTo(contextKeyService);
    CONTEXT_RESPONSE_ERROR.bindTo(contextKeyService);
    this._ui = new Lazy(() => {
      const location = {
        location: ChatAgentLocation.Editor,
        resolveData: /* @__PURE__ */ __name(() => {
          assertType(this._editor.hasModel());
          assertType(this._session);
          return {
            type: ChatAgentLocation.Editor,
            selection: this._editor.getSelection(),
            document: this._session.textModelN.uri,
            wholeRange: this._session?.wholeRange.trackedInitialRange
          };
        }, "resolveData")
      };
      for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
        for (const [, codeEditor] of notebookEditor.codeEditors) {
          if (codeEditor === this._editor) {
            location.location = ChatAgentLocation.Notebook;
            break;
          }
        }
      }
      return this._store.add(_instaService.createInstance(InlineChatZoneWidget, location, this._editor));
    });
    this._store.add(this._editor.onDidChangeModel(async (e) => {
      if (this._session || !e.newModelUrl) {
        return;
      }
      const existingSession = this._inlineChatSessionService.getSession(this._editor, e.newModelUrl);
      if (!existingSession) {
        return;
      }
      this._log("session RESUMING after model change", e);
      await this.run({ existingSession });
    }));
    this._store.add(this._inlineChatSessionService.onDidEndSession((e) => {
      if (e.session === this._session && e.endedByExternalCause) {
        this._log("session ENDED by external cause");
        this._session = void 0;
        this._strategy?.cancel();
        this._resetWidget();
        this.cancelSession();
      }
    }));
    this._store.add(this._inlineChatSessionService.onDidMoveSession(async (e) => {
      if (e.editor === this._editor) {
        this._log("session RESUMING after move", e);
        await this.run({ existingSession: e.session });
      }
    }));
    this._log(`NEW controller`);
  }
  static {
    __name(this, "InlineChatController");
  }
  static get(editor) {
    return editor.getContribution(INLINE_CHAT_ID);
  }
  _isDisposed = false;
  _store = new DisposableStore();
  _ui;
  _ctxVisible;
  _ctxEditing;
  _ctxResponseType;
  _ctxUserDidEdit;
  _ctxRequestInProgress;
  _ctxResponse;
  _messages = this._store.add(new Emitter());
  _onDidEnterState = this._store.add(new Emitter());
  onDidEnterState = this._onDidEnterState.event;
  _onWillStartSession = this._store.add(new Emitter());
  onWillStartSession = this._onWillStartSession.event;
  get chatWidget() {
    return this._ui.value.widget.chatWidget;
  }
  _sessionStore = this._store.add(new DisposableStore());
  _stashedSession = this._store.add(
    new MutableDisposable()
  );
  _session;
  _strategy;
  dispose() {
    if (this._currentRun) {
      this._messages.fire(
        this._session?.chatModel.hasRequests ? 4 /* PAUSE_SESSION */ : 2 /* CANCEL_SESSION */
      );
    }
    this._store.dispose();
    this._isDisposed = true;
    this._log("DISPOSED controller");
  }
  _log(message, ...more) {
    if (message instanceof Error) {
      this._logService.error(message, ...more);
    } else {
      this._logService.trace(
        `[IE] (editor:${this._editor.getId()}) ${message}`,
        ...more
      );
    }
  }
  getMessage() {
    return this._ui.value.widget.responseContent;
  }
  getId() {
    return INLINE_CHAT_ID;
  }
  _getMode() {
    return this._configurationService.getValue(
      InlineChatConfigKeys.Mode
    );
  }
  getWidgetPosition() {
    return this._ui.value.position;
  }
  _currentRun;
  async run(options = {}) {
    try {
      this.finishExistingSession();
      if (this._currentRun) {
        await this._currentRun;
      }
      if (options.initialSelection) {
        this._editor.setSelection(options.initialSelection);
      }
      this._stashedSession.clear();
      this._onWillStartSession.fire();
      this._currentRun = this._nextState("CREATE_SESSION" /* CREATE_SESSION */, options);
      await this._currentRun;
    } catch (error) {
      this._log("error during run", error);
      onUnexpectedError(error);
      if (this._session) {
        this._inlineChatSessionService.releaseSession(this._session);
      }
      this["PAUSE" /* PAUSE */]();
    } finally {
      this._currentRun = void 0;
    }
  }
  // ---- state machine
  async _nextState(state, options) {
    let nextState = state;
    while (nextState && !this._isDisposed) {
      this._log("setState to ", nextState);
      const p = this[nextState](options);
      this._onDidEnterState.fire(nextState);
      nextState = await p;
    }
  }
  async ["CREATE_SESSION" /* CREATE_SESSION */](options) {
    assertType(this._session === void 0);
    assertType(this._editor.hasModel());
    let session = options.existingSession;
    let initPosition;
    if (options.position) {
      initPosition = Position.lift(options.position).delta(-1);
      delete options.position;
    }
    const widgetPosition = this._showWidget(
      options.headless ?? session?.headless,
      true,
      initPosition
    );
    let errorMessage = localize(
      "create.fail",
      "Failed to start editor chat"
    );
    if (!session) {
      const createSessionCts = new CancellationTokenSource();
      const msgListener = Event.once(this._messages.event)((m) => {
        this._log("state=_createSession) message received", m);
        if (m === 32 /* ACCEPT_INPUT */) {
          options.autoSend = true;
          this._ui.value.widget.updateInfo(
            localize("welcome.2", "Getting ready...")
          );
        } else {
          createSessionCts.cancel();
        }
      });
      try {
        session = await this._inlineChatSessionService.createSession(
          this._editor,
          {
            editMode: this._getMode(),
            wholeRange: options.initialRange
          },
          createSessionCts.token
        );
      } catch (error) {
        if (error instanceof InlineChatError || error?.name === InlineChatError.code) {
          errorMessage = error.message;
        }
      }
      createSessionCts.dispose();
      msgListener.dispose();
      if (createSessionCts.token.isCancellationRequested) {
        if (session) {
          this._inlineChatSessionService.releaseSession(session);
        }
        return "CANCEL" /* CANCEL */;
      }
    }
    delete options.initialRange;
    delete options.existingSession;
    if (!session) {
      MessageController.get(this._editor)?.showMessage(
        errorMessage,
        widgetPosition
      );
      this._log("Failed to start editor chat");
      return "CANCEL" /* CANCEL */;
    }
    await session.chatModel.waitForInitialization();
    switch (session.editMode) {
      case EditMode.Preview:
        this._strategy = this._instaService.createInstance(
          PreviewStrategy,
          session,
          this._editor,
          this._ui.value
        );
        break;
      case EditMode.Live:
      default:
        this._strategy = this._instaService.createInstance(
          LiveStrategy,
          session,
          this._editor,
          this._ui.value,
          session.headless || this._configurationService.getValue(
            InlineChatConfigKeys.ZoneToolbar
          )
        );
        break;
    }
    this._session = session;
    return "INIT_UI" /* INIT_UI */;
  }
  async ["INIT_UI" /* INIT_UI */](options) {
    assertType(this._session);
    assertType(this._strategy);
    InlineCompletionsController.get(this._editor)?.hide();
    this._sessionStore.clear();
    const wholeRangeDecoration = this._editor.createDecorationsCollection();
    const handleWholeRangeChange = /* @__PURE__ */ __name(() => {
      const newDecorations = this._strategy?.getWholeRangeDecoration() ?? [];
      wholeRangeDecoration.set(newDecorations);
      this._ctxEditing.set(
        !this._session?.wholeRange.trackedInitialRange.isEmpty()
      );
    }, "handleWholeRangeChange");
    this._sessionStore.add(
      toDisposable(() => {
        wholeRangeDecoration.clear();
        this._ctxEditing.reset();
      })
    );
    this._sessionStore.add(
      this._session.wholeRange.onDidChange(handleWholeRangeChange)
    );
    handleWholeRangeChange();
    this._ui.value.widget.setChatModel(this._session.chatModel);
    this._updatePlaceholder();
    const isModelEmpty = !this._session.chatModel.hasRequests;
    this._ui.value.widget.updateToolbar(true);
    this._ui.value.widget.toggleStatus(!isModelEmpty);
    this._showWidget(this._session.headless, isModelEmpty);
    this._sessionStore.add(
      this._editor.onDidChangeModel((e) => {
        const msg = this._session?.chatModel.hasRequests ? 4 /* PAUSE_SESSION */ : 2 /* CANCEL_SESSION */;
        this._log("model changed, pause or cancel session", msg, e);
        this._messages.fire(msg);
      })
    );
    const altVersionNow = this._editor.getModel()?.getAlternativeVersionId();
    this._sessionStore.add(
      this._editor.onDidChangeModelContent((e) => {
        if (!this._session?.hunkData.ignoreTextModelNChanges) {
          this._ctxUserDidEdit.set(
            altVersionNow !== this._editor.getModel()?.getAlternativeVersionId()
          );
        }
        if (this._session?.hunkData.ignoreTextModelNChanges || this._strategy?.hasFocus()) {
          return;
        }
        const wholeRange = this._session.wholeRange;
        let shouldFinishSession = false;
        if (this._configurationService.getValue(
          InlineChatConfigKeys.FinishOnType
        )) {
          for (const { range } of e.changes) {
            shouldFinishSession = !Range.areIntersectingOrTouching(
              range,
              wholeRange.value
            );
          }
        }
        this._session.recordExternalEditOccurred(shouldFinishSession);
        if (shouldFinishSession) {
          this._log(
            "text changed outside of whole range, FINISH session"
          );
          this.finishExistingSession();
        }
      })
    );
    this._sessionStore.add(
      this._session.chatModel.onDidChange(async (e) => {
        if (e.kind === "removeRequest") {
          await this._session.undoChangesUntil(e.requestId);
        }
      })
    );
    const editState = this._createChatTextEditGroupState();
    let didEdit = false;
    for (const request of this._session.chatModel.getRequests()) {
      if (!request.response) {
        break;
      }
      for (const part of request.response.response.value) {
        if (part.kind !== "textEditGroup" || !isEqual(part.uri, this._session.textModelN.uri)) {
          continue;
        }
        if (part.state?.applied) {
          continue;
        }
        for (const edit of part.edits) {
          this._makeChanges(edit, void 0, !didEdit);
          didEdit = true;
        }
        part.state ??= editState;
      }
    }
    if (didEdit) {
      const diff = await this._editorWorkerService.computeDiff(
        this._session.textModel0.uri,
        this._session.textModelN.uri,
        {
          computeMoves: false,
          maxComputationTimeMs: Number.MAX_SAFE_INTEGER,
          ignoreTrimWhitespace: false
        },
        "advanced"
      );
      this._session.wholeRange.fixup(diff?.changes ?? []);
      await this._session.hunkData.recompute(editState, diff);
      this._updateCtxResponseType();
    }
    options.position = await this._strategy.renderChanges();
    if (this._session.chatModel.requestInProgress) {
      return "SHOW_REQUEST" /* SHOW_REQUEST */;
    } else {
      return "WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */;
    }
  }
  async ["WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */](options) {
    assertType(this._session);
    assertType(this._strategy);
    this._updatePlaceholder();
    if (options.message) {
      this.updateInput(options.message);
      aria.alert(options.message);
      delete options.message;
      this._showWidget(this._session.headless, false);
    }
    let message = 0 /* NONE */;
    let request;
    const barrier = new Barrier();
    const store = new DisposableStore();
    store.add(
      this._session.chatModel.onDidChange((e) => {
        if (e.kind === "addRequest") {
          request = e.request;
          message = 32 /* ACCEPT_INPUT */;
          barrier.open();
        }
      })
    );
    store.add(this._strategy.onDidAccept(() => this.acceptSession()));
    store.add(this._strategy.onDidDiscard(() => this.cancelSession()));
    store.add(
      Event.once(this._messages.event)((m) => {
        this._log("state=_waitForInput) message received", m);
        message = m;
        barrier.open();
      })
    );
    if (options.autoSend) {
      delete options.autoSend;
      this._showWidget(this._session.headless, false);
      this._ui.value.widget.chatWidget.acceptInput();
    }
    await barrier.wait();
    store.dispose();
    if (message & (16 /* CANCEL_INPUT */ | 2 /* CANCEL_SESSION */)) {
      return "CANCEL" /* CANCEL */;
    }
    if (message & 4 /* PAUSE_SESSION */) {
      return "PAUSE" /* PAUSE */;
    }
    if (message & 1 /* ACCEPT_SESSION */) {
      this._ui.value.widget.selectAll(false);
      return "DONE" /* ACCEPT */;
    }
    if (!request?.message.text) {
      return "WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */;
    }
    return "SHOW_REQUEST" /* SHOW_REQUEST */;
  }
  async ["SHOW_REQUEST" /* SHOW_REQUEST */](options) {
    assertType(this._session);
    assertType(this._strategy);
    assertType(this._session.chatModel.requestInProgress);
    this._ctxRequestInProgress.set(true);
    const { chatModel } = this._session;
    const request = chatModel.lastRequest;
    assertType(request);
    assertType(request.response);
    this._showWidget(this._session.headless, false);
    this._ui.value.widget.selectAll(false);
    this._ui.value.widget.updateInfo("");
    this._ui.value.widget.toggleStatus(true);
    const { response } = request;
    const responsePromise = new DeferredPromise();
    const store = new DisposableStore();
    const progressiveEditsCts = store.add(new CancellationTokenSource());
    const progressiveEditsAvgDuration = new MovingAverage();
    const progressiveEditsClock = StopWatch.create();
    const progressiveEditsQueue = new Queue();
    let next = "WAIT_FOR_INPUT" /* WAIT_FOR_INPUT */;
    store.add(
      Event.once(this._messages.event)((message) => {
        this._log("state=_makeRequest) message received", message);
        this._chatService.cancelCurrentRequestForSession(
          chatModel.sessionId
        );
        if (message & 2 /* CANCEL_SESSION */) {
          next = "CANCEL" /* CANCEL */;
        } else if (message & 4 /* PAUSE_SESSION */) {
          next = "PAUSE" /* PAUSE */;
        } else if (message & 1 /* ACCEPT_SESSION */) {
          next = "DONE" /* ACCEPT */;
        }
      })
    );
    store.add(
      chatModel.onDidChange(async (e) => {
        if (e.kind === "removeRequest" && e.requestId === request.id) {
          progressiveEditsCts.cancel();
          responsePromise.complete();
          if (e.reason === ChatRequestRemovalReason.Resend) {
            next = "SHOW_REQUEST" /* SHOW_REQUEST */;
          } else {
            next = "CANCEL" /* CANCEL */;
          }
          return;
        }
        if (e.kind === "move") {
          assertType(this._session);
          const log = /* @__PURE__ */ __name((msg, ...args) => this._log(
            "state=_showRequest) moving inline chat",
            msg,
            ...args
          ), "log");
          log("move was requested", e.target, e.range);
          const initialSelection = Selection.fromRange(
            Range.lift(e.range),
            SelectionDirection.LTR
          );
          const editorPane = await this._editorService.openEditor(
            {
              resource: e.target,
              options: { selection: initialSelection }
            },
            SIDE_GROUP
          );
          if (!editorPane) {
            log("opening editor failed");
            return;
          }
          const newEditor = editorPane.getControl();
          if (!isCodeEditor(newEditor) || !newEditor.hasModel()) {
            log(
              "new editor is either missing or not a code editor or does not have a model"
            );
            return;
          }
          if (this._inlineChatSessionService.getSession(
            newEditor,
            e.target
          )) {
            log("new editor ALREADY has a session");
            return;
          }
          const newSession = await this._inlineChatSessionService.createSession(
            newEditor,
            {
              editMode: this._getMode(),
              session: this._session
            },
            CancellationToken.None
          );
          InlineChatController.get(newEditor)?.run({
            existingSession: newSession
          });
          next = "CANCEL" /* CANCEL */;
          responsePromise.complete();
          return;
        }
      })
    );
    store.add(
      this._ui.value.widget.chatWidget.inputEditor.onDidChangeModelContent(
        () => {
          this._chatService.cancelCurrentRequestForSession(
            chatModel.sessionId
          );
        }
      )
    );
    let lastLength = 0;
    let isFirstChange = true;
    const editState = this._createChatTextEditGroupState();
    let localEditGroup;
    const handleResponse = /* @__PURE__ */ __name(() => {
      this._updateCtxResponseType();
      if (!localEditGroup) {
        localEditGroup = response.response.value.find(
          (part) => part.kind === "textEditGroup" && isEqual(part.uri, this._session?.textModelN.uri)
        );
      }
      if (localEditGroup) {
        localEditGroup.state ??= editState;
        const edits = localEditGroup.edits;
        const newEdits = edits.slice(lastLength);
        if (newEdits.length > 0) {
          this._log(
            `${this._session?.textModelN.uri.toString()} received ${newEdits.length} edits`
          );
          lastLength = edits.length;
          progressiveEditsAvgDuration.update(
            progressiveEditsClock.elapsed()
          );
          progressiveEditsClock.reset();
          progressiveEditsQueue.queue(async () => {
            const startThen = this._session.wholeRange.value.getStartPosition();
            for (const edits2 of newEdits) {
              await this._makeChanges(
                edits2,
                {
                  duration: progressiveEditsAvgDuration.value,
                  token: progressiveEditsCts.token
                },
                isFirstChange
              );
              isFirstChange = false;
            }
            const startNow = this._session.wholeRange.value.getStartPosition();
            if (!startNow.equals(startThen) || !this._ui.value.position?.equals(startNow)) {
              this._showWidget(
                this._session.headless,
                false,
                startNow.delta(-1)
              );
            }
          });
        }
      }
      if (response.isCanceled) {
        progressiveEditsCts.cancel();
        responsePromise.complete();
      } else if (response.isComplete) {
        responsePromise.complete();
      }
    }, "handleResponse");
    store.add(response.onDidChange(handleResponse));
    handleResponse();
    await responsePromise.p;
    await progressiveEditsQueue.whenIdle();
    if (response.result?.errorDetails) {
      await this._session.undoChangesUntil(response.requestId);
    }
    store.dispose();
    const diff = await this._editorWorkerService.computeDiff(
      this._session.textModel0.uri,
      this._session.textModelN.uri,
      {
        computeMoves: false,
        maxComputationTimeMs: Number.MAX_SAFE_INTEGER,
        ignoreTrimWhitespace: false
      },
      "advanced"
    );
    this._session.wholeRange.fixup(diff?.changes ?? []);
    await this._session.hunkData.recompute(editState, diff);
    this._ctxRequestInProgress.set(false);
    let newPosition;
    if (response.result?.errorDetails) {
    } else if (response.response.value.length === 0) {
      const status = localize(
        "empty",
        "No results, please refine your input and try again"
      );
      this._ui.value.widget.updateStatus(status, { classes: ["warn"] });
    } else {
      this._ui.value.widget.updateStatus("");
    }
    const position = await this._strategy.renderChanges();
    if (position) {
      const selection = this._editor.getSelection();
      if (selection?.containsPosition(position)) {
        if (position.lineNumber - selection.startLineNumber > 8) {
          newPosition = position;
        }
      } else {
        newPosition = position;
      }
    }
    this._showWidget(this._session.headless, false, newPosition);
    return next;
  }
  async ["PAUSE" /* PAUSE */]() {
    this._resetWidget();
    this._strategy?.dispose?.();
    this._session = void 0;
  }
  async ["DONE" /* ACCEPT */]() {
    assertType(this._session);
    assertType(this._strategy);
    this._sessionStore.clear();
    try {
      await this._strategy.apply();
    } catch (err) {
      this._dialogService.error(
        localize(
          "err.apply",
          "Failed to apply changes.",
          toErrorMessage(err)
        )
      );
      this._log("FAILED to apply changes");
      this._log(err);
    }
    this._inlineChatSessionService.releaseSession(this._session);
    this._resetWidget();
    this._strategy?.dispose();
    this._strategy = void 0;
    this._session = void 0;
  }
  async ["CANCEL" /* CANCEL */]() {
    if (this._session) {
      assertType(this._strategy);
      this._sessionStore.clear();
      const shouldStash = !this._session.isUnstashed && this._session.chatModel.hasRequests && this._session.hunkData.size === this._session.hunkData.pending;
      let undoCancelEdits = [];
      try {
        undoCancelEdits = this._strategy.cancel();
      } catch (err) {
        this._dialogService.error(
          localize(
            "err.discard",
            "Failed to discard changes.",
            toErrorMessage(err)
          )
        );
        this._log("FAILED to discard changes");
        this._log(err);
      }
      this._stashedSession.clear();
      if (shouldStash) {
        this._stashedSession.value = this._inlineChatSessionService.stashSession(
          this._session,
          this._editor,
          undoCancelEdits
        );
      } else {
        this._inlineChatSessionService.releaseSession(this._session);
      }
    }
    this._resetWidget();
    this._strategy?.dispose();
    this._strategy = void 0;
    this._session = void 0;
  }
  // ----
  _showWidget(headless = false, initialRender = false, position) {
    assertType(this._editor.hasModel());
    this._ctxVisible.set(true);
    let widgetPosition;
    if (position) {
      widgetPosition = position;
    } else if (this._ui.rawValue?.position) {
      if (this._ui.rawValue?.position.lineNumber === 1) {
        widgetPosition = this._ui.rawValue?.position.delta(-1);
      } else {
        widgetPosition = this._ui.rawValue?.position;
      }
    } else {
      widgetPosition = this._editor.getSelection().getStartPosition().delta(-1);
    }
    if (this._session && !position && (this._session.hasChangedText || this._session.chatModel.hasRequests)) {
      widgetPosition = this._session.wholeRange.trackedInitialRange.getStartPosition().delta(-1);
    }
    if (!headless) {
      if (this._ui.rawValue?.position) {
        this._ui.value.updatePositionAndHeight(widgetPosition);
      } else {
        this._ui.value.show(widgetPosition);
      }
    }
    return widgetPosition;
  }
  _resetWidget() {
    this._sessionStore.clear();
    this._ctxVisible.reset();
    this._ctxUserDidEdit.reset();
    this._ui.rawValue?.hide();
    if (this._editor.hasWidgetFocus()) {
      this._editor.focus();
    }
  }
  _updateCtxResponseType() {
    if (!this._session) {
      this._ctxResponseType.set(InlineChatResponseType.None);
      return;
    }
    const hasLocalEdit = /* @__PURE__ */ __name((response) => {
      return response.value.some(
        (part) => part.kind === "textEditGroup" && isEqual(part.uri, this._session?.textModelN.uri)
      );
    }, "hasLocalEdit");
    let responseType = InlineChatResponseType.None;
    for (const request of this._session.chatModel.getRequests()) {
      if (!request.response || request.response.isCanceled) {
        continue;
      }
      responseType = InlineChatResponseType.Messages;
      if (hasLocalEdit(request.response.response)) {
        responseType = InlineChatResponseType.MessagesAndEdits;
        break;
      }
    }
    this._ctxResponseType.set(responseType);
    this._ctxResponse.set(responseType !== InlineChatResponseType.None);
  }
  _createChatTextEditGroupState() {
    assertType(this._session);
    const sha1 = new DefaultModelSHA1Computer();
    const textModel0Sha1 = sha1.canComputeSHA1(this._session.textModel0) ? sha1.computeSHA1(this._session.textModel0) : generateUuid();
    return {
      sha1: textModel0Sha1,
      applied: 0
    };
  }
  async _makeChanges(edits, opts, undoStopBefore) {
    assertType(this._session);
    assertType(this._strategy);
    const moreMinimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(
      this._session.textModelN.uri,
      edits
    );
    this._log(
      "edits from PROVIDER and after making them MORE MINIMAL",
      this._session.agent.extensionId,
      edits,
      moreMinimalEdits
    );
    if (moreMinimalEdits?.length === 0) {
      return;
    }
    const actualEdits = !opts && moreMinimalEdits ? moreMinimalEdits : edits;
    const editOperations = actualEdits.map(TextEdit.asEditOperation);
    const editsObserver = {
      start: /* @__PURE__ */ __name(() => this._session.hunkData.ignoreTextModelNChanges = true, "start"),
      stop: /* @__PURE__ */ __name(() => this._session.hunkData.ignoreTextModelNChanges = false, "stop")
    };
    this._inlineChatSavingService.markChanged(this._session);
    if (opts) {
      await this._strategy.makeProgressiveChanges(
        editOperations,
        editsObserver,
        opts,
        undoStopBefore
      );
    } else {
      await this._strategy.makeChanges(
        editOperations,
        editsObserver,
        undoStopBefore
      );
    }
  }
  _forcedPlaceholder = void 0;
  _updatePlaceholder() {
    this._ui.value.widget.placeholder = this._getPlaceholderText();
  }
  _getPlaceholderText() {
    return this._forcedPlaceholder ?? this._session?.agent.description ?? "";
  }
  // ---- controller API
  showSaveHint() {
    if (!this._session) {
      return;
    }
    const status = localize(
      "savehint",
      "Accept or discard changes to continue saving."
    );
    this._ui.value.widget.updateStatus(status, { classes: ["warn"] });
    if (this._ui.value.position) {
      this._editor.revealLineInCenterIfOutsideViewport(
        this._ui.value.position.lineNumber
      );
    } else {
      const hunk = this._session.hunkData.getInfo().find((info) => info.getState() === HunkState.Pending);
      if (hunk) {
        this._editor.revealLineInCenterIfOutsideViewport(
          hunk.getRangesN()[0].startLineNumber
        );
      }
    }
  }
  acceptInput() {
    return this.chatWidget.acceptInput();
  }
  updateInput(text, selectAll = true) {
    this._ui.value.widget.chatWidget.setInput(text);
    if (selectAll) {
      const newSelection = new Selection(
        1,
        1,
        Number.MAX_SAFE_INTEGER,
        1
      );
      this._ui.value.widget.chatWidget.inputEditor.setSelection(
        newSelection
      );
    }
  }
  cancelCurrentRequest() {
    this._messages.fire(16 /* CANCEL_INPUT */ | 8 /* CANCEL_REQUEST */);
  }
  arrowOut(up) {
    if (this._ui.value.position && this._editor.hasModel()) {
      const { column } = this._editor.getPosition();
      const { lineNumber } = this._ui.value.position;
      const newLine = up ? lineNumber : lineNumber + 1;
      this._editor.setPosition({ lineNumber: newLine, column });
      this._editor.focus();
    }
  }
  focus() {
    this._ui.value.widget.focus();
  }
  hasFocus() {
    return this._ui.value.widget.hasFocus();
  }
  async viewInChat() {
    if (!this._strategy || !this._session) {
      return;
    }
    let someApplied = false;
    let lastEdit;
    const uri = this._editor.getModel()?.uri;
    const requests = this._session.chatModel.getRequests();
    for (const request of requests) {
      if (!request.response) {
        continue;
      }
      for (const part of request.response.response.value) {
        if (part.kind === "textEditGroup" && isEqual(part.uri, uri)) {
          someApplied = someApplied || Boolean(part.state?.applied);
          lastEdit = part;
        }
      }
    }
    const doEdits = this._strategy.cancel();
    if (someApplied) {
      assertType(lastEdit);
      lastEdit.edits = [doEdits];
      lastEdit.state.applied = 0;
    }
    await this._instaService.invokeFunction(
      moveToPanelChat,
      this._session?.chatModel
    );
    this.cancelSession();
  }
  acceptSession() {
    const response = this._session?.chatModel.getRequests().at(-1)?.response;
    if (response) {
      this._chatService.notifyUserAction({
        sessionId: response.session.sessionId,
        requestId: response.requestId,
        agentId: response.agent?.id,
        command: response.slashCommand?.name,
        result: response.result,
        action: {
          kind: "inlineChat",
          action: "accepted"
        }
      });
    }
    this._messages.fire(1 /* ACCEPT_SESSION */);
  }
  acceptHunk(hunkInfo) {
    return this._strategy?.performHunkAction(hunkInfo, HunkAction.Accept);
  }
  discardHunk(hunkInfo) {
    return this._strategy?.performHunkAction(hunkInfo, HunkAction.Discard);
  }
  toggleDiff(hunkInfo) {
    return this._strategy?.performHunkAction(
      hunkInfo,
      HunkAction.ToggleDiff
    );
  }
  moveHunk(next) {
    this.focus();
    this._strategy?.performHunkAction(
      void 0,
      next ? HunkAction.MoveNext : HunkAction.MovePrev
    );
  }
  async cancelSession() {
    const response = this._session?.chatModel.lastRequest?.response;
    if (response) {
      this._chatService.notifyUserAction({
        sessionId: response.session.sessionId,
        requestId: response.requestId,
        agentId: response.agent?.id,
        command: response.slashCommand?.name,
        result: response.result,
        action: {
          kind: "inlineChat",
          action: "discarded"
        }
      });
    }
    this._messages.fire(2 /* CANCEL_SESSION */);
  }
  finishExistingSession() {
    if (this._session) {
      if (this._session.editMode === EditMode.Preview) {
        this._log(
          "finishing existing session, using CANCEL",
          this._session.editMode
        );
        this.cancelSession();
      } else {
        this._log(
          "finishing existing session, using APPLY",
          this._session.editMode
        );
        this.acceptSession();
      }
    }
  }
  reportIssue() {
    const response = this._session?.chatModel.lastRequest?.response;
    if (response) {
      this._chatService.notifyUserAction({
        sessionId: response.session.sessionId,
        requestId: response.requestId,
        agentId: response.agent?.id,
        command: response.slashCommand?.name,
        result: response.result,
        action: { kind: "bug" }
      });
    }
  }
  unstashLastSession() {
    const result = this._stashedSession.value?.unstash();
    if (result) {
      this._inlineChatSavingService.markChanged(result);
    }
    return result;
  }
  joinCurrentRun() {
    return this._currentRun;
  }
  async reviewEdits(anchor, stream, token) {
    if (!this._editor.hasModel()) {
      return false;
    }
    const session = await this._inlineChatSessionService.createSession(
      this._editor,
      { editMode: EditMode.Live, wholeRange: anchor, headless: true },
      token
    );
    if (!session) {
      return false;
    }
    const request = session.chatModel.addRequest(
      { text: "DUMMY", parts: [] },
      { variables: [] },
      0
    );
    const run = this.run({
      existingSession: session,
      headless: true
    });
    await Event.toPromise(
      Event.filter(
        this._onDidEnterState.event,
        (candidate) => candidate === "SHOW_REQUEST" /* SHOW_REQUEST */
      )
    );
    for await (const chunk of stream) {
      session.chatModel.acceptResponseProgress(request, {
        kind: "textEdit",
        uri: this._editor.getModel().uri,
        edits: [chunk]
      });
    }
    if (token.isCancellationRequested) {
      session.chatModel.cancelRequest(request);
    } else {
      session.chatModel.completeResponse(request);
    }
    await run;
    return true;
  }
};
InlineChatController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IInlineChatSessionService),
  __decorateParam(3, IInlineChatSavingService),
  __decorateParam(4, IEditorWorkerService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, INotebookEditorService)
], InlineChatController);
async function moveToPanelChat(accessor, model) {
  const viewsService = accessor.get(IViewsService);
  const chatService = accessor.get(IChatService);
  const widget = await showChatView(viewsService);
  if (widget && widget.viewModel && model) {
    for (const request of model.getRequests().slice()) {
      await chatService.adoptRequest(
        widget.viewModel.model.sessionId,
        request
      );
    }
    widget.focusLastMessage();
  }
}
__name(moveToPanelChat, "moveToPanelChat");
export {
  InlineChatController,
  InlineChatRunOptions,
  State
};
//# sourceMappingURL=inlineChatController.js.map
