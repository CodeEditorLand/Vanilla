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
import {
  Dimension,
  WindowIntervalTimer,
  getWindow,
  scheduleAtNextAnimationFrame,
  trackFocus
} from "../../../../../../base/browser/dom.js";
import {
  DeferredPromise,
  Queue,
  createCancelablePromise,
  disposableTimeout
} from "../../../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../../../base/common/cancellation.js";
import { Emitter } from "../../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../../../base/common/lifecycle.js";
import { LRUCache } from "../../../../../../base/common/map.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { MovingAverage } from "../../../../../../base/common/numbers.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { StopWatch } from "../../../../../../base/common/stopwatch.js";
import { assertType } from "../../../../../../base/common/types.js";
import { URI } from "../../../../../../base/common/uri.js";
import { CodeEditorWidget } from "../../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { Selection } from "../../../../../../editor/common/core/selection.js";
import { TextEdit } from "../../../../../../editor/common/languages.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IEditorWorkerService } from "../../../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { localize } from "../../../../../../nls.js";
import {
  IContextKeyService
} from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../../platform/storage/common/storage.js";
import { ChatAgentLocation } from "../../../../chat/common/chatAgents.js";
import { IChatService } from "../../../../chat/common/chatService.js";
import { countWords } from "../../../../chat/common/chatWordCounter.js";
import { InlineChatWidget } from "../../../../inlineChat/browser/inlineChatWidget.js";
import {
  asProgressiveEdit,
  performAsyncTextEdit
} from "../../../../inlineChat/browser/utils.js";
import { CellKind } from "../../../common/notebookCommon.js";
import {
  INotebookExecutionStateService,
  NotebookExecutionType
} from "../../../common/notebookExecutionStateService.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { insertCell, runDeleteAction } from "../cellOperations.js";
import {
  CTX_NOTEBOOK_CELL_CHAT_FOCUSED,
  CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST,
  CTX_NOTEBOOK_CHAT_OUTER_FOCUS_POSITION,
  CTX_NOTEBOOK_CHAT_USER_DID_EDIT,
  MENU_CELL_CHAT_WIDGET_STATUS
} from "./notebookChatContext.js";
class NotebookChatWidget extends Disposable {
  constructor(_notebookEditor, id, notebookViewZone, domNode, widgetContainer, inlineChatWidget, parentEditor, _languageService) {
    super();
    this._notebookEditor = _notebookEditor;
    this.id = id;
    this.notebookViewZone = notebookViewZone;
    this.domNode = domNode;
    this.widgetContainer = widgetContainer;
    this.inlineChatWidget = inlineChatWidget;
    this.parentEditor = parentEditor;
    this._languageService = _languageService;
    const updateHeight = /* @__PURE__ */ __name(() => {
      if (this.heightInPx === inlineChatWidget.contentHeight) {
        return;
      }
      this.heightInPx = inlineChatWidget.contentHeight;
      this._notebookEditor.changeViewZones((accessor) => {
        accessor.layoutZone(id);
      });
      this._layoutWidget(inlineChatWidget, widgetContainer);
    }, "updateHeight");
    this._register(
      inlineChatWidget.onDidChangeHeight(() => {
        updateHeight();
      })
    );
    this._register(
      inlineChatWidget.chatWidget.onDidChangeHeight(() => {
        updateHeight();
      })
    );
    this.heightInPx = inlineChatWidget.contentHeight;
    this._layoutWidget(inlineChatWidget, widgetContainer);
  }
  static {
    __name(this, "NotebookChatWidget");
  }
  set afterModelPosition(afterModelPosition) {
    this.notebookViewZone.afterModelPosition = afterModelPosition;
  }
  get afterModelPosition() {
    return this.notebookViewZone.afterModelPosition;
  }
  set heightInPx(heightInPx) {
    this.notebookViewZone.heightInPx = heightInPx;
  }
  get heightInPx() {
    return this.notebookViewZone.heightInPx;
  }
  _editingCell = null;
  get editingCell() {
    return this._editingCell;
  }
  layout() {
    this._layoutWidget(this.inlineChatWidget, this.widgetContainer);
  }
  restoreEditingCell(initEditingCell) {
    this._editingCell = initEditingCell;
    const decorationIds = this._notebookEditor.deltaCellDecorations(
      [],
      [
        {
          handle: this._editingCell.handle,
          options: {
            className: "nb-chatGenerationHighlight",
            outputClassName: "nb-chatGenerationHighlight"
          }
        }
      ]
    );
    this._register(
      toDisposable(() => {
        this._notebookEditor.deltaCellDecorations(decorationIds, []);
      })
    );
  }
  hasFocus() {
    return this.inlineChatWidget.hasFocus();
  }
  focus() {
    this.updateNotebookEditorFocusNSelections();
    this.inlineChatWidget.focus();
  }
  updateNotebookEditorFocusNSelections() {
    this._notebookEditor.focusContainer(true);
    this._notebookEditor.setFocus({
      start: this.afterModelPosition,
      end: this.afterModelPosition
    });
    this._notebookEditor.setSelections([
      {
        start: this.afterModelPosition,
        end: this.afterModelPosition
      }
    ]);
  }
  getEditingCell() {
    return this._editingCell;
  }
  async getOrCreateEditingCell() {
    if (this._editingCell) {
      const codeEditor2 = this._notebookEditor.codeEditors.find(
        (ce) => ce[0] === this._editingCell
      )?.[1];
      if (codeEditor2?.hasModel()) {
        return {
          cell: this._editingCell,
          editor: codeEditor2
        };
      } else {
        return void 0;
      }
    }
    if (!this._notebookEditor.hasModel()) {
      return void 0;
    }
    const widgetHasFocus = this.inlineChatWidget.hasFocus();
    this._editingCell = insertCell(
      this._languageService,
      this._notebookEditor,
      this.afterModelPosition,
      CellKind.Code,
      "above"
    );
    if (!this._editingCell) {
      return void 0;
    }
    await this._notebookEditor.revealFirstLineIfOutsideViewport(
      this._editingCell
    );
    const decorationIds = this._notebookEditor.deltaCellDecorations(
      [],
      [
        {
          handle: this._editingCell.handle,
          options: {
            className: "nb-chatGenerationHighlight",
            outputClassName: "nb-chatGenerationHighlight"
          }
        }
      ]
    );
    this._register(
      toDisposable(() => {
        this._notebookEditor.deltaCellDecorations(decorationIds, []);
      })
    );
    if (widgetHasFocus) {
      this.focus();
    }
    const codeEditor = this._notebookEditor.codeEditors.find(
      (ce) => ce[0] === this._editingCell
    )?.[1];
    if (codeEditor?.hasModel()) {
      return {
        cell: this._editingCell,
        editor: codeEditor
      };
    }
    return void 0;
  }
  async discardChange() {
    if (this._notebookEditor.hasModel() && this._editingCell) {
      runDeleteAction(this._notebookEditor, this._editingCell);
    }
  }
  _layoutWidget(inlineChatWidget, widgetContainer) {
    const layoutConfiguration = this._notebookEditor.notebookOptions.getLayoutConfiguration();
    const rightMargin = layoutConfiguration.cellRightMargin;
    const leftMargin = this._notebookEditor.notebookOptions.getCellEditorContainerLeftMargin();
    const maxWidth = 640;
    const width = Math.min(
      maxWidth,
      this._notebookEditor.getLayoutInfo().width - leftMargin - rightMargin
    );
    inlineChatWidget.layout(new Dimension(width, this.heightInPx));
    inlineChatWidget.domNode.style.width = `${width}px`;
    widgetContainer.style.left = `${leftMargin}px`;
  }
  dispose() {
    this._notebookEditor.changeViewZones((accessor) => {
      accessor.removeZone(this.id);
    });
    this.domNode.remove();
    super.dispose();
  }
}
class NotebookCellTextModelLikeId {
  static {
    __name(this, "NotebookCellTextModelLikeId");
  }
  static str(k) {
    return `${k.viewType}/${k.uri.toString()}`;
  }
  static obj(s) {
    const idx = s.indexOf("/");
    return {
      viewType: s.substring(0, idx),
      uri: URI.parse(s.substring(idx + 1))
    };
  }
}
let NotebookChatController = class extends Disposable {
  constructor(_notebookEditor, _instantiationService, _contextKeyService, _editorWorkerService, _modelService, _languageService, _executionStateService, _storageService, _chatService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._editorWorkerService = _editorWorkerService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._executionStateService = _executionStateService;
    this._storageService = _storageService;
    this._chatService = _chatService;
    this._ctxHasActiveRequest = CTX_NOTEBOOK_CHAT_HAS_ACTIVE_REQUEST.bindTo(
      this._contextKeyService
    );
    this._ctxCellWidgetFocused = CTX_NOTEBOOK_CELL_CHAT_FOCUSED.bindTo(
      this._contextKeyService
    );
    this._ctxUserDidEdit = CTX_NOTEBOOK_CHAT_USER_DID_EDIT.bindTo(
      this._contextKeyService
    );
    this._ctxOuterFocusPosition = CTX_NOTEBOOK_CHAT_OUTER_FOCUS_POSITION.bindTo(
      this._contextKeyService
    );
    this._registerFocusTracker();
    NotebookChatController._promptHistory = JSON.parse(
      this._storageService.get(
        NotebookChatController._storageKey,
        StorageScope.PROFILE,
        "[]"
      )
    );
    this._historyUpdate = (prompt) => {
      const idx = NotebookChatController._promptHistory.indexOf(prompt);
      if (idx >= 0) {
        NotebookChatController._promptHistory.splice(idx, 1);
      }
      NotebookChatController._promptHistory.unshift(prompt);
      this._historyOffset = -1;
      this._historyCandidate = "";
      this._storageService.store(
        NotebookChatController._storageKey,
        JSON.stringify(NotebookChatController._promptHistory),
        StorageScope.PROFILE,
        StorageTarget.USER
      );
    };
  }
  static {
    __name(this, "NotebookChatController");
  }
  static id = "workbench.notebook.chatController";
  static counter = 0;
  static get(editor) {
    return editor.getContribution(
      NotebookChatController.id
    );
  }
  // History
  static _storageKey = "inline-chat-history";
  static _promptHistory = [];
  _historyOffset = -1;
  _historyCandidate = "";
  _historyUpdate;
  _promptCache = new LRUCache(1e3, 0.7);
  _onDidChangePromptCache = this._register(
    new Emitter()
  );
  onDidChangePromptCache = this._onDidChangePromptCache.event;
  _strategy;
  _sessionCtor;
  _warmupRequestCts;
  _activeRequestCts;
  _ctxHasActiveRequest;
  _ctxCellWidgetFocused;
  _ctxUserDidEdit;
  _ctxOuterFocusPosition;
  _userEditingDisposables = this._register(
    new DisposableStore()
  );
  _widgetDisposableStore = this._register(
    new DisposableStore()
  );
  _focusTracker;
  _widget;
  _model = this._register(
    new MutableDisposable()
  );
  _registerFocusTracker() {
    this._register(
      this._notebookEditor.onDidChangeFocus(() => {
        if (!this._widget) {
          this._ctxOuterFocusPosition.set("");
          return;
        }
        const widgetIndex = this._widget.afterModelPosition;
        const focus = this._notebookEditor.getFocus().start;
        if (focus + 1 === widgetIndex) {
          this._ctxOuterFocusPosition.set("above");
        } else if (focus === widgetIndex) {
          this._ctxOuterFocusPosition.set("below");
        } else {
          this._ctxOuterFocusPosition.set("");
        }
      })
    );
  }
  run(index, input, autoSend) {
    if (this._widget) {
      if (this._widget.afterModelPosition !== index) {
        const window = getWindow(this._widget.domNode);
        this._disposeWidget();
        scheduleAtNextAnimationFrame(window, () => {
          this._createWidget(index, input, autoSend, void 0);
        });
      }
      return;
    }
    this._createWidget(index, input, autoSend, void 0);
  }
  restore(editingCell, input) {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const index = this._notebookEditor.textModel.cells.indexOf(
      editingCell.model
    );
    if (index < 0) {
      return;
    }
    if (this._widget) {
      if (this._widget.afterModelPosition !== index) {
        this._disposeWidget();
        const window = getWindow(this._widget.domNode);
        scheduleAtNextAnimationFrame(window, () => {
          this._createWidget(index, input, false, editingCell);
        });
      }
      return;
    }
    this._createWidget(index, input, false, editingCell);
  }
  _disposeWidget() {
    this._widget?.dispose();
    this._widget = void 0;
    this._widgetDisposableStore.clear();
    this._historyOffset = -1;
    this._historyCandidate = "";
  }
  _createWidget(index, input, autoSend, initEditingCell) {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    this._widgetDisposableStore.clear();
    const viewZoneContainer = document.createElement("div");
    viewZoneContainer.classList.add("monaco-editor");
    const widgetContainer = document.createElement("div");
    widgetContainer.style.position = "absolute";
    viewZoneContainer.appendChild(widgetContainer);
    this._focusTracker = this._widgetDisposableStore.add(
      trackFocus(viewZoneContainer)
    );
    this._widgetDisposableStore.add(
      this._focusTracker.onDidFocus(() => {
        this._updateNotebookEditorFocusNSelections();
      })
    );
    const fakeParentEditorElement = document.createElement("div");
    const fakeParentEditor = this._widgetDisposableStore.add(
      this._instantiationService.createInstance(
        CodeEditorWidget,
        fakeParentEditorElement,
        {},
        { isSimpleWidget: true }
      )
    );
    const inputBoxFragment = `notebook-chat-input-${NotebookChatController.counter++}`;
    const notebookUri = this._notebookEditor.textModel.uri;
    const inputUri = notebookUri.with({
      scheme: Schemas.untitled,
      fragment: inputBoxFragment
    });
    const result = this._modelService.createModel(
      "",
      null,
      inputUri,
      false
    );
    fakeParentEditor.setModel(result);
    const inlineChatWidget = this._widgetDisposableStore.add(
      this._instantiationService.createInstance(
        InlineChatWidget,
        {
          location: ChatAgentLocation.Notebook,
          resolveData: /* @__PURE__ */ __name(() => {
            const sessionInputUri = this.getSessionInputUri();
            if (!sessionInputUri) {
              return void 0;
            }
            return {
              type: ChatAgentLocation.Notebook,
              sessionInputUri
            };
          }, "resolveData")
        },
        {
          statusMenuId: MENU_CELL_CHAT_WIDGET_STATUS,
          chatWidgetViewOptions: {
            rendererOptions: {
              renderTextEditsAsSummary: /* @__PURE__ */ __name((uri) => {
                return isEqual(
                  uri,
                  this._widget?.parentEditor.getModel()?.uri
                ) || isEqual(
                  uri,
                  this._notebookEditor.textModel?.uri
                );
              }, "renderTextEditsAsSummary")
            },
            menus: {
              telemetrySource: "notebook-generate-cell"
            }
          }
        }
      )
    );
    inlineChatWidget.placeholder = localize(
      "default.placeholder",
      "Ask a question"
    );
    inlineChatWidget.updateInfo(
      localize("welcome.1", "AI-generated code may be incorrect")
    );
    widgetContainer.appendChild(inlineChatWidget.domNode);
    this._widgetDisposableStore.add(
      inlineChatWidget.onDidChangeInput(() => {
        this._warmupRequestCts?.dispose(true);
        this._warmupRequestCts = void 0;
      })
    );
    this._notebookEditor.changeViewZones((accessor) => {
      const notebookViewZone = {
        afterModelPosition: index,
        heightInPx: 80,
        domNode: viewZoneContainer
      };
      const id = accessor.addZone(notebookViewZone);
      this._scrollWidgetIntoView(index);
      this._widget = new NotebookChatWidget(
        this._notebookEditor,
        id,
        notebookViewZone,
        viewZoneContainer,
        widgetContainer,
        inlineChatWidget,
        fakeParentEditor,
        this._languageService
      );
      if (initEditingCell) {
        this._widget.restoreEditingCell(initEditingCell);
        this._updateUserEditingState();
      }
      this._ctxCellWidgetFocused.set(true);
      disposableTimeout(
        () => {
          this._focusWidget();
        },
        0,
        this._store
      );
      this._sessionCtor = createCancelablePromise(async (token) => {
        await this._startSession(token);
        assertType(this._model.value);
        const model = this._model.value;
        this._widget?.inlineChatWidget.setChatModel(model);
        if (fakeParentEditor.hasModel()) {
          if (this._widget) {
            this._focusWidget();
          }
          if (this._widget && input) {
            this._widget.inlineChatWidget.value = input;
            if (autoSend) {
              this.acceptInput();
            }
          }
        }
      });
    });
  }
  async _startSession(token) {
    if (!this._model.value) {
      this._model.value = this._chatService.startSession(
        ChatAgentLocation.Editor,
        token
      );
      if (!this._model.value) {
        throw new Error("Failed to start chat session");
      }
    }
    this._strategy = new EditStrategy();
  }
  _scrollWidgetIntoView(index) {
    if (index === 0 || this._notebookEditor.getLength() === 0) {
      this._notebookEditor.revealOffsetInCenterIfOutsideViewport(0);
    } else {
      const previousCell = this._notebookEditor.cellAt(
        Math.min(index - 1, this._notebookEditor.getLength() - 1)
      );
      if (previousCell) {
        const cellTop = this._notebookEditor.getAbsoluteTopOfElement(previousCell);
        const cellHeight = this._notebookEditor.getHeightOfElement(previousCell);
        this._notebookEditor.revealOffsetInCenterIfOutsideViewport(
          cellTop + cellHeight + 48
        );
      }
    }
  }
  _focusWidget() {
    if (!this._widget) {
      return;
    }
    this._updateNotebookEditorFocusNSelections();
    this._widget.focus();
  }
  _updateNotebookEditorFocusNSelections() {
    if (!this._widget) {
      return;
    }
    this._widget.updateNotebookEditorFocusNSelections();
  }
  hasSession(chatModel) {
    return this._model.value === chatModel;
  }
  getSessionInputUri() {
    return this._widget?.parentEditor.getModel()?.uri;
  }
  async acceptInput() {
    assertType(this._widget);
    await this._sessionCtor;
    assertType(this._model.value);
    assertType(this._strategy);
    const lastInput = this._widget.inlineChatWidget.value;
    this._historyUpdate(lastInput);
    const editor = this._widget.parentEditor;
    const textModel = editor.getModel();
    if (!editor.hasModel() || !textModel) {
      return;
    }
    if (this._widget.editingCell && this._widget.editingCell.textBuffer.getLength() > 0) {
      const ref = await this._widget.editingCell.resolveTextModel();
      ref.setValue("");
    }
    const editingCellIndex = this._widget.editingCell ? this._notebookEditor.getCellIndex(this._widget.editingCell) : void 0;
    if (editingCellIndex !== void 0) {
      this._notebookEditor.setSelections([
        {
          start: editingCellIndex,
          end: editingCellIndex + 1
        }
      ]);
    } else {
      this._notebookEditor.setSelections([
        {
          start: this._widget.afterModelPosition,
          end: this._widget.afterModelPosition
        }
      ]);
    }
    this._ctxHasActiveRequest.set(true);
    this._activeRequestCts?.cancel();
    this._activeRequestCts = new CancellationTokenSource();
    const store = new DisposableStore();
    try {
      this._ctxHasActiveRequest.set(true);
      const progressiveEditsQueue = new Queue();
      const progressiveEditsClock = StopWatch.create();
      const progressiveEditsAvgDuration = new MovingAverage();
      const progressiveEditsCts = new CancellationTokenSource(
        this._activeRequestCts.token
      );
      const responsePromise = new DeferredPromise();
      const response = await this._widget.inlineChatWidget.chatWidget.acceptInput();
      if (response) {
        let lastLength = 0;
        store.add(
          response.onDidChange((e) => {
            if (response.isCanceled) {
              progressiveEditsCts.cancel();
              responsePromise.complete();
              return;
            }
            if (response.isComplete) {
              responsePromise.complete();
              return;
            }
            const edits = response.response.value.flatMap(
              (part) => {
                if (part.kind === "textEditGroup") {
                  return part.edits;
                } else {
                  return [];
                }
              }
            );
            const newEdits = edits.slice(lastLength);
            if (newEdits.length === 0) {
              return;
            }
            lastLength = edits.length;
            progressiveEditsAvgDuration.update(
              progressiveEditsClock.elapsed()
            );
            progressiveEditsClock.reset();
            progressiveEditsQueue.queue(async () => {
              for (const edits2 of newEdits) {
                await this._makeChanges(edits2, {
                  duration: progressiveEditsAvgDuration.value,
                  token: progressiveEditsCts.token
                });
              }
            });
          })
        );
      }
      await responsePromise.p;
      await progressiveEditsQueue.whenIdle();
      this._userEditingDisposables.clear();
      const editingCell = this._widget.getEditingCell();
      if (editingCell) {
        this._userEditingDisposables.add(
          editingCell.model.onDidChangeContent(
            () => this._updateUserEditingState()
          )
        );
        this._userEditingDisposables.add(
          editingCell.model.onDidChangeLanguage(
            () => this._updateUserEditingState()
          )
        );
        this._userEditingDisposables.add(
          editingCell.model.onDidChangeMetadata(
            () => this._updateUserEditingState()
          )
        );
        this._userEditingDisposables.add(
          editingCell.model.onDidChangeInternalMetadata(
            () => this._updateUserEditingState()
          )
        );
        this._userEditingDisposables.add(
          editingCell.model.onDidChangeOutputs(
            () => this._updateUserEditingState()
          )
        );
        this._userEditingDisposables.add(
          this._executionStateService.onDidChangeExecution((e) => {
            if (e.type === NotebookExecutionType.cell && e.affectsCell(editingCell.uri)) {
              this._updateUserEditingState();
            }
          })
        );
      }
    } catch (e) {
    } finally {
      store.dispose();
      this._ctxHasActiveRequest.set(false);
      this._widget.inlineChatWidget.updateInfo("");
      this._widget.inlineChatWidget.updateToolbar(true);
    }
  }
  async _makeChanges(edits, opts) {
    assertType(this._strategy);
    assertType(this._widget);
    const editingCell = await this._widget.getOrCreateEditingCell();
    if (!editingCell) {
      return;
    }
    const editor = editingCell.editor;
    const moreMinimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(
      editor.getModel().uri,
      edits
    );
    if (moreMinimalEdits?.length === 0) {
      return;
    }
    const actualEdits = !opts && moreMinimalEdits ? moreMinimalEdits : edits;
    const editOperations = actualEdits.map(TextEdit.asEditOperation);
    try {
      if (opts) {
        await this._strategy.makeProgressiveChanges(
          editor,
          editOperations,
          opts
        );
      } else {
        await this._strategy.makeChanges(editor, editOperations);
      }
    } finally {
    }
  }
  _updateUserEditingState() {
    this._ctxUserDidEdit.set(true);
  }
  async acceptSession() {
    assertType(this._model);
    assertType(this._strategy);
    const editor = this._widget?.parentEditor;
    if (!editor?.hasModel()) {
      return;
    }
    const editingCell = this._widget?.getEditingCell();
    if (editingCell && this._notebookEditor.hasModel()) {
      const cellId = NotebookCellTextModelLikeId.str({
        uri: editingCell.uri,
        viewType: this._notebookEditor.textModel.viewType
      });
      if (this._widget?.inlineChatWidget.value) {
        this._promptCache.set(
          cellId,
          this._widget.inlineChatWidget.value
        );
      }
      this._onDidChangePromptCache.fire({ cell: editingCell.uri });
    }
    try {
      this._model.clear();
    } catch (_err) {
    }
    this.dismiss(false);
  }
  async focusAbove() {
    if (!this._widget) {
      return;
    }
    const index = this._widget.afterModelPosition;
    const prev = index - 1;
    if (prev < 0) {
      return;
    }
    const cell = this._notebookEditor.cellAt(prev);
    if (!cell) {
      return;
    }
    await this._notebookEditor.focusNotebookCell(cell, "editor");
  }
  async focusNext() {
    if (!this._widget) {
      return;
    }
    const index = this._widget.afterModelPosition;
    const cell = this._notebookEditor.cellAt(index);
    if (!cell) {
      return;
    }
    await this._notebookEditor.focusNotebookCell(cell, "editor");
  }
  hasFocus() {
    return this._widget?.hasFocus() ?? false;
  }
  focus() {
    this._focusWidget();
  }
  focusNearestWidget(index, direction) {
    switch (direction) {
      case "above":
        if (this._widget?.afterModelPosition === index) {
          this._focusWidget();
        }
        break;
      case "below":
        if (this._widget?.afterModelPosition === index + 1) {
          this._focusWidget();
        }
        break;
      default:
        break;
    }
  }
  populateHistory(up) {
    if (!this._widget) {
      return;
    }
    const len = NotebookChatController._promptHistory.length;
    if (len === 0) {
      return;
    }
    if (this._historyOffset === -1) {
      this._historyCandidate = this._widget.inlineChatWidget.value;
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
      entry = NotebookChatController._promptHistory[newIdx];
      this._historyOffset = newIdx;
    }
    this._widget.inlineChatWidget.value = entry;
    this._widget.inlineChatWidget.selectAll();
  }
  async cancelCurrentRequest(discard) {
    this._activeRequestCts?.cancel();
  }
  getEditingCell() {
    return this._widget?.getEditingCell();
  }
  discard() {
    this._activeRequestCts?.cancel();
    this._widget?.discardChange();
    this.dismiss(true);
  }
  dismiss(discard) {
    const widget = this._widget;
    const widgetIndex = widget?.afterModelPosition;
    const currentFocus = this._notebookEditor.getFocus();
    const isWidgetFocused = currentFocus.start === widgetIndex && currentFocus.end === widgetIndex;
    if (widget && isWidgetFocused) {
      const editingCell = widget.getEditingCell();
      const shouldFocusEditingCell = editingCell && !discard;
      const shouldFocusTopCell = widgetIndex === 0 && this._notebookEditor.getLength() > 0;
      const shouldFocusAboveCell = widgetIndex !== 0 && this._notebookEditor.cellAt(widgetIndex - 1);
      if (shouldFocusEditingCell) {
        this._notebookEditor.focusNotebookCell(
          editingCell,
          "container"
        );
      } else if (shouldFocusTopCell) {
        this._notebookEditor.focusNotebookCell(
          this._notebookEditor.cellAt(0),
          "container"
        );
      } else if (shouldFocusAboveCell) {
        this._notebookEditor.focusNotebookCell(
          this._notebookEditor.cellAt(widgetIndex - 1),
          "container"
        );
      }
    }
    this._ctxCellWidgetFocused.set(false);
    this._ctxUserDidEdit.set(false);
    this._sessionCtor?.cancel();
    this._sessionCtor = void 0;
    this._model.clear();
    this._widget?.dispose();
    this._widget = void 0;
    this._widgetDisposableStore.clear();
  }
  // check if a cell is generated by prompt by checking prompt cache
  isCellGeneratedByChat(cell) {
    if (!this._notebookEditor.hasModel()) {
      return false;
    }
    const cellId = NotebookCellTextModelLikeId.str({
      uri: cell.uri,
      viewType: this._notebookEditor.textModel.viewType
    });
    return this._promptCache.has(cellId);
  }
  // get prompt from cache
  getPromptFromCache(cell) {
    if (!this._notebookEditor.hasModel()) {
      return void 0;
    }
    const cellId = NotebookCellTextModelLikeId.str({
      uri: cell.uri,
      viewType: this._notebookEditor.textModel.viewType
    });
    return this._promptCache.get(cellId);
  }
  dispose() {
    this.dismiss(false);
    super.dispose();
  }
};
NotebookChatController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IEditorWorkerService),
  __decorateParam(4, IModelService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, INotebookExecutionStateService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IChatService)
], NotebookChatController);
class EditStrategy {
  static {
    __name(this, "EditStrategy");
  }
  _editCount = 0;
  constructor() {
  }
  async makeProgressiveChanges(editor, edits, opts) {
    if (++this._editCount === 1) {
      editor.pushUndoStop();
    }
    const durationInSec = opts.duration / 1e3;
    for (const edit of edits) {
      const wordCount = countWords(edit.text ?? "");
      const speed = wordCount / durationInSec;
      await performAsyncTextEdit(
        editor.getModel(),
        asProgressiveEdit(
          new WindowIntervalTimer(),
          edit,
          speed,
          opts.token
        )
      );
    }
  }
  async makeChanges(editor, edits) {
    const cursorStateComputerAndInlineDiffCollection = /* @__PURE__ */ __name((undoEdits) => {
      let last = null;
      for (const edit of undoEdits) {
        last = !last || last.isBefore(edit.range.getEndPosition()) ? edit.range.getEndPosition() : last;
      }
      return last && [Selection.fromPositions(last)];
    }, "cursorStateComputerAndInlineDiffCollection");
    if (++this._editCount === 1) {
      editor.pushUndoStop();
    }
    editor.executeEdits(
      "inline-chat-live",
      edits,
      cursorStateComputerAndInlineDiffCollection
    );
  }
}
registerNotebookContribution(NotebookChatController.id, NotebookChatController);
export {
  EditStrategy,
  NotebookChatController
};
//# sourceMappingURL=notebookChatController.js.map
