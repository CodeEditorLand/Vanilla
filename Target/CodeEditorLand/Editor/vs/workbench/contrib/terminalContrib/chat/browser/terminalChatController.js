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
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import {
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  IChatCodeBlockContextProviderService,
  showChatView
} from "../../../chat/browser/chat.js";
import {
  IChatService
} from "../../../chat/common/chatService.js";
import {
  ITerminalService,
  isDetachedTerminalInstance
} from "../../../terminal/browser/terminal.js";
import { TerminalChatWidget } from "./terminalChatWidget.js";
import {
  DeferredPromise,
  createCancelablePromise
} from "../../../../../base/common/async.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { assertType } from "../../../../../base/common/types.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../platform/storage/common/storage.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
import { ChatAgentLocation } from "../../../chat/common/chatAgents.js";
import { TerminalChatContextKeys } from "./terminalChat.js";
var Message = /* @__PURE__ */ ((Message2) => {
  Message2[Message2["NONE"] = 0] = "NONE";
  Message2[Message2["ACCEPT_SESSION"] = 1] = "ACCEPT_SESSION";
  Message2[Message2["CANCEL_SESSION"] = 2] = "CANCEL_SESSION";
  Message2[Message2["PAUSE_SESSION"] = 4] = "PAUSE_SESSION";
  Message2[Message2["CANCEL_REQUEST"] = 8] = "CANCEL_REQUEST";
  Message2[Message2["CANCEL_INPUT"] = 16] = "CANCEL_INPUT";
  Message2[Message2["ACCEPT_INPUT"] = 32] = "ACCEPT_INPUT";
  Message2[Message2["RERUN_INPUT"] = 64] = "RERUN_INPUT";
  return Message2;
})(Message || {});
let TerminalChatController = class extends Disposable {
  constructor(_instance, processManager, widgetManager, _terminalService, _instantiationService, _contextKeyService, _chatService, _chatCodeBlockContextProviderService, _viewsService, _storageService) {
    super();
    this._instance = _instance;
    this._terminalService = _terminalService;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._chatService = _chatService;
    this._chatCodeBlockContextProviderService = _chatCodeBlockContextProviderService;
    this._viewsService = _viewsService;
    this._storageService = _storageService;
    this._requestActiveContextKey = TerminalChatContextKeys.requestActive.bindTo(this._contextKeyService);
    this._responseContainsCodeBlockContextKey = TerminalChatContextKeys.responseContainsCodeBlock.bindTo(this._contextKeyService);
    this._responseContainsMulitpleCodeBlocksContextKey = TerminalChatContextKeys.responseContainsMultipleCodeBlocks.bindTo(this._contextKeyService);
    this._register(this._chatCodeBlockContextProviderService.registerProvider({
      getCodeBlockContext: /* @__PURE__ */ __name((editor) => {
        if (!editor || !this._chatWidget?.hasValue || !this.hasFocus()) {
          return;
        }
        return {
          element: editor,
          code: editor.getValue(),
          codeBlockIndex: 0,
          languageId: editor.getModel().getLanguageId()
        };
      }, "getCodeBlockContext")
    }, "terminal"));
    TerminalChatController._promptHistory = JSON.parse(this._storageService.get(TerminalChatController._storageKey, StorageScope.PROFILE, "[]"));
    this._historyUpdate = (prompt) => {
      const idx = TerminalChatController._promptHistory.indexOf(prompt);
      if (idx >= 0) {
        TerminalChatController._promptHistory.splice(idx, 1);
      }
      TerminalChatController._promptHistory.unshift(prompt);
      this._historyOffset = -1;
      this._historyCandidate = "";
      this._storageService.store(TerminalChatController._storageKey, JSON.stringify(TerminalChatController._promptHistory), StorageScope.PROFILE, StorageTarget.USER);
    };
  }
  static {
    __name(this, "TerminalChatController");
  }
  static ID = "terminal.chat";
  static get(instance) {
    return instance.getContribution(
      TerminalChatController.ID
    );
  }
  /**
   * Currently focused chat widget. This is used to track action context since 'active terminals'
   * are only tracked for non-detached terminal instanecs.
   */
  static activeChatWidget;
  static _storageKey = "terminal-inline-chat-history";
  static _promptHistory = [];
  /**
   * The chat widget for the controller, this is lazy as we don't want to instantiate it until
   * both it's required and xterm is ready.
   */
  _chatWidget;
  /**
   * The chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
   * terminal is still initializing).
   */
  get chatWidget() {
    return this._chatWidget?.value;
  }
  _requestActiveContextKey;
  _responseContainsCodeBlockContextKey;
  _responseContainsMulitpleCodeBlocksContextKey;
  _messages = this._store.add(new Emitter());
  _lastResponseContent;
  get lastResponseContent() {
    return this._lastResponseContent;
  }
  onDidAcceptInput = Event.filter(
    this._messages.event,
    (m) => m === 32 /* ACCEPT_INPUT */,
    this._store
  );
  get onDidHide() {
    return this.chatWidget?.onDidHide ?? Event.None;
  }
  _terminalAgentName = "terminal";
  _model = this._register(
    new MutableDisposable()
  );
  get scopedContextKeyService() {
    return this._chatWidget?.value.inlineChatWidget.scopedContextKeyService ?? this._contextKeyService;
  }
  _sessionCtor;
  _historyOffset = -1;
  _historyCandidate = "";
  _historyUpdate;
  _currentRequestId;
  _activeRequestCts;
  xtermReady(xterm) {
    this._chatWidget = new Lazy(() => {
      const chatWidget = this._register(
        this._instantiationService.createInstance(
          TerminalChatWidget,
          this._instance.domElement,
          this._instance,
          xterm
        )
      );
      this._register(
        chatWidget.focusTracker.onDidFocus(() => {
          TerminalChatController.activeChatWidget = this;
          if (!isDetachedTerminalInstance(this._instance)) {
            this._terminalService.setActiveInstance(this._instance);
          }
        })
      );
      this._register(
        chatWidget.focusTracker.onDidBlur(() => {
          TerminalChatController.activeChatWidget = void 0;
          this._instance.resetScrollbarVisibility();
        })
      );
      if (!this._instance.domElement) {
        throw new Error(
          "FindWidget expected terminal DOM to be initialized"
        );
      }
      return chatWidget;
    });
  }
  async _createSession() {
    this._sessionCtor = createCancelablePromise(async (token) => {
      if (!this._model.value) {
        this._model.value = this._chatService.startSession(
          ChatAgentLocation.Terminal,
          token
        );
        if (!this._model.value) {
          throw new Error("Failed to start chat session");
        }
      }
    });
    this._register(toDisposable(() => this._sessionCtor?.cancel()));
  }
  _forcedPlaceholder = void 0;
  _updatePlaceholder() {
    const inlineChatWidget = this._chatWidget?.value.inlineChatWidget;
    if (inlineChatWidget) {
      inlineChatWidget.placeholder = this._getPlaceholderText();
    }
  }
  _getPlaceholderText() {
    return this._forcedPlaceholder ?? "";
  }
  setPlaceholder(text) {
    this._forcedPlaceholder = text;
    this._updatePlaceholder();
  }
  resetPlaceholder() {
    this._forcedPlaceholder = void 0;
    this._updatePlaceholder();
  }
  clear() {
    this.cancel();
    this._model.clear();
    this._responseContainsCodeBlockContextKey.reset();
    this._requestActiveContextKey.reset();
    this._chatWidget?.value.hide();
    this._chatWidget?.value.setValue(void 0);
  }
  async acceptInput(isVoiceInput) {
    assertType(this._chatWidget);
    if (!this._model.value) {
      await this.reveal();
    }
    assertType(this._model.value);
    const lastInput = this._chatWidget.value.inlineChatWidget.value;
    if (!lastInput) {
      return;
    }
    const model = this._model.value;
    this._chatWidget.value.inlineChatWidget.setChatModel(model);
    this._historyUpdate(lastInput);
    this._activeRequestCts?.cancel();
    this._activeRequestCts = new CancellationTokenSource();
    const store = new DisposableStore();
    this._requestActiveContextKey.set(true);
    let responseContent = "";
    const response = await this._chatWidget.value.inlineChatWidget.chatWidget.acceptInput(
      lastInput,
      isVoiceInput
    );
    this._currentRequestId = response?.requestId;
    const responsePromise = new DeferredPromise();
    try {
      this._requestActiveContextKey.set(true);
      if (response) {
        store.add(
          response.onDidChange(async () => {
            responseContent += response.response.value;
            if (response.isCanceled) {
              this._requestActiveContextKey.set(false);
              responsePromise.complete(void 0);
              return;
            }
            if (response.isComplete) {
              this._requestActiveContextKey.set(false);
              this._requestActiveContextKey.set(false);
              const containsCode = responseContent.includes("```");
              this._chatWidget.value.inlineChatWidget.updateChatMessage(
                {
                  message: new MarkdownString(
                    responseContent
                  ),
                  requestId: response.requestId
                },
                false,
                containsCode
              );
              const firstCodeBlock = await this.chatWidget?.inlineChatWidget.getCodeBlockInfo(
                0
              );
              const secondCodeBlock = await this.chatWidget?.inlineChatWidget.getCodeBlockInfo(
                1
              );
              this._responseContainsCodeBlockContextKey.set(
                !!firstCodeBlock
              );
              this._responseContainsMulitpleCodeBlocksContextKey.set(
                !!secondCodeBlock
              );
              this._chatWidget?.value.inlineChatWidget.updateToolbar(
                true
              );
              responsePromise.complete(response);
            }
          })
        );
      }
      await responsePromise.p;
      return response;
    } catch {
      return;
    } finally {
      store.dispose();
    }
  }
  updateInput(text, selectAll = true) {
    const widget = this._chatWidget?.value.inlineChatWidget;
    if (widget) {
      widget.value = text;
      if (selectAll) {
        widget.selectAll();
      }
    }
  }
  getInput() {
    return this._chatWidget?.value.input() ?? "";
  }
  focus() {
    this._chatWidget?.value.focus();
  }
  hasFocus() {
    return this._chatWidget?.rawValue?.hasFocus() ?? false;
  }
  populateHistory(up) {
    if (!this._chatWidget?.value) {
      return;
    }
    const len = TerminalChatController._promptHistory.length;
    if (len === 0) {
      return;
    }
    if (this._historyOffset === -1) {
      this._historyCandidate = this._chatWidget.value.inlineChatWidget.value;
    }
    const newIdx = this._historyOffset + (up ? 1 : -1);
    if (newIdx >= len) {
      return;
    }
    let entry;
    if (newIdx < 0) {
      entry = this._historyCandidate;
      this._historyOffset = -1;
    } else {
      entry = TerminalChatController._promptHistory[newIdx];
      this._historyOffset = newIdx;
    }
    this._chatWidget.value.inlineChatWidget.value = entry;
    this._chatWidget.value.inlineChatWidget.selectAll();
  }
  cancel() {
    this._sessionCtor?.cancel();
    this._sessionCtor = void 0;
    this._activeRequestCts?.cancel();
    this._requestActiveContextKey.set(false);
    const model = this._chatWidget?.value.inlineChatWidget.getChatModel();
    if (!model?.sessionId) {
      return;
    }
    this._chatService.cancelCurrentRequestForSession(model?.sessionId);
  }
  async acceptCommand(shouldExecute) {
    const code = await this.chatWidget?.inlineChatWidget.getCodeBlockInfo(0);
    if (!code) {
      return;
    }
    this._chatWidget?.value.acceptCommand(
      code.textEditorModel.getValue(),
      shouldExecute
    );
  }
  async reveal() {
    await this._createSession();
    this._chatWidget?.value.reveal();
    this._chatWidget?.value.focus();
  }
  async viewInChat() {
    const widget = await showChatView(this._viewsService);
    const currentRequest = this.chatWidget?.inlineChatWidget.chatWidget.viewModel?.model.getRequests().find((r) => r.id === this._currentRequestId);
    if (!widget || !currentRequest?.response) {
      return;
    }
    const message = [];
    for (const item of currentRequest.response.response.value) {
      if (item.kind === "textEditGroup") {
        for (const group of item.edits) {
          message.push({
            kind: "textEdit",
            edits: group,
            uri: item.uri
          });
        }
      } else {
        message.push(item);
      }
    }
    this._chatService.addCompleteRequest(
      widget.viewModel.sessionId,
      // DEBT: Add hardcoded agent name until its removed
      `@${this._terminalAgentName} ${currentRequest.message.text}`,
      currentRequest.variableData,
      currentRequest.attempt,
      {
        message,
        result: currentRequest.response.result,
        followups: currentRequest.response.followups
      }
    );
    widget.focusLastMessage();
    this._chatWidget?.rawValue?.hide();
  }
};
TerminalChatController = __decorateClass([
  __decorateParam(3, ITerminalService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatService),
  __decorateParam(7, IChatCodeBlockContextProviderService),
  __decorateParam(8, IViewsService),
  __decorateParam(9, IStorageService)
], TerminalChatController);
export {
  TerminalChatController
};
//# sourceMappingURL=terminalChatController.js.map
