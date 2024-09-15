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
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { IContextKey, IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { NotebookChatController } from "../../controller/chat/notebookChatController.js";
import { CellEditState, CellFocusMode, ICellViewModel, INotebookEditorDelegate } from "../../notebookBrowser.js";
import { CellViewModelStateChangeEvent } from "../../notebookViewEvents.js";
import { CellContentPart } from "../cellPart.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { MarkupCellViewModel } from "../../viewModel/markupCellViewModel.js";
import { NotebookCellExecutionState } from "../../../common/notebookCommon.js";
import { NotebookCellExecutionStateContext, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_EXECUTING, NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_INPUT_COLLAPSED, NOTEBOOK_CELL_LINE_NUMBERS, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_OUTPUT_COLLAPSED, NOTEBOOK_CELL_RESOURCE, NOTEBOOK_CELL_TYPE, NOTEBOOK_CELL_GENERATED_BY_CHAT, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS } from "../../../common/notebookContextKeys.js";
import { INotebookExecutionStateService, NotebookExecutionType } from "../../../common/notebookExecutionStateService.js";
let CellContextKeyPart = class extends CellContentPart {
  constructor(notebookEditor, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.cellContextKeyManager = this._register(this.instantiationService.createInstance(CellContextKeyManager, notebookEditor, void 0));
  }
  static {
    __name(this, "CellContextKeyPart");
  }
  cellContextKeyManager;
  didRenderCell(element) {
    this.cellContextKeyManager.updateForElement(element);
  }
};
CellContextKeyPart = __decorateClass([
  __decorateParam(1, IInstantiationService)
], CellContextKeyPart);
let CellContextKeyManager = class extends Disposable {
  constructor(notebookEditor, element, _contextKeyService, _notebookExecutionStateService) {
    super();
    this.notebookEditor = notebookEditor;
    this.element = element;
    this._contextKeyService = _contextKeyService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._contextKeyService.bufferChangeEvents(() => {
      this.cellType = NOTEBOOK_CELL_TYPE.bindTo(this._contextKeyService);
      this.cellEditable = NOTEBOOK_CELL_EDITABLE.bindTo(this._contextKeyService);
      this.cellFocused = NOTEBOOK_CELL_FOCUSED.bindTo(this._contextKeyService);
      this.cellEditorFocused = NOTEBOOK_CELL_EDITOR_FOCUSED.bindTo(this._contextKeyService);
      this.markdownEditMode = NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.bindTo(this._contextKeyService);
      this.cellRunState = NOTEBOOK_CELL_EXECUTION_STATE.bindTo(this._contextKeyService);
      this.cellExecuting = NOTEBOOK_CELL_EXECUTING.bindTo(this._contextKeyService);
      this.cellHasOutputs = NOTEBOOK_CELL_HAS_OUTPUTS.bindTo(this._contextKeyService);
      this.cellContentCollapsed = NOTEBOOK_CELL_INPUT_COLLAPSED.bindTo(this._contextKeyService);
      this.cellOutputCollapsed = NOTEBOOK_CELL_OUTPUT_COLLAPSED.bindTo(this._contextKeyService);
      this.cellLineNumbers = NOTEBOOK_CELL_LINE_NUMBERS.bindTo(this._contextKeyService);
      this.cellGeneratedByChat = NOTEBOOK_CELL_GENERATED_BY_CHAT.bindTo(this._contextKeyService);
      this.cellResource = NOTEBOOK_CELL_RESOURCE.bindTo(this._contextKeyService);
      this.cellHasErrorDiagnostics = NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS.bindTo(this._contextKeyService);
      if (element) {
        this.updateForElement(element);
      }
    });
    this._register(this._notebookExecutionStateService.onDidChangeExecution((e) => {
      if (e.type === NotebookExecutionType.cell && this.element && e.affectsCell(this.element.uri)) {
        this.updateForExecutionState();
      }
    }));
  }
  static {
    __name(this, "CellContextKeyManager");
  }
  cellType;
  cellEditable;
  cellFocused;
  cellEditorFocused;
  cellRunState;
  cellExecuting;
  cellHasOutputs;
  cellContentCollapsed;
  cellOutputCollapsed;
  cellLineNumbers;
  cellResource;
  cellGeneratedByChat;
  cellHasErrorDiagnostics;
  markdownEditMode;
  elementDisposables = this._register(new DisposableStore());
  updateForElement(element) {
    this.elementDisposables.clear();
    this.element = element;
    if (!element) {
      return;
    }
    this.elementDisposables.add(element.onDidChangeState((e) => this.onDidChangeState(e)));
    if (element instanceof CodeCellViewModel) {
      this.elementDisposables.add(element.onDidChangeOutputs(() => this.updateForOutputs()));
      this.elementDisposables.add(autorun((reader) => {
        this.cellHasErrorDiagnostics.set(!!reader.readObservable(element.excecutionError));
      }));
    }
    this.elementDisposables.add(this.notebookEditor.onDidChangeActiveCell(() => this.updateForFocusState()));
    if (this.element instanceof MarkupCellViewModel) {
      this.cellType.set("markup");
    } else if (this.element instanceof CodeCellViewModel) {
      this.cellType.set("code");
    }
    this._contextKeyService.bufferChangeEvents(() => {
      this.updateForFocusState();
      this.updateForExecutionState();
      this.updateForEditState();
      this.updateForCollapseState();
      this.updateForOutputs();
      this.updateForChat();
      this.cellLineNumbers.set(this.element.lineNumbers);
      this.cellResource.set(this.element.uri.toString());
    });
    const chatController = NotebookChatController.get(this.notebookEditor);
    if (chatController) {
      this.elementDisposables.add(chatController.onDidChangePromptCache((e) => {
        if (e.cell.toString() === this.element.uri.toString()) {
          this.updateForChat();
        }
      }));
    }
  }
  onDidChangeState(e) {
    this._contextKeyService.bufferChangeEvents(() => {
      if (e.internalMetadataChanged) {
        this.updateForExecutionState();
      }
      if (e.editStateChanged) {
        this.updateForEditState();
      }
      if (e.focusModeChanged) {
        this.updateForFocusState();
      }
      if (e.cellLineNumberChanged) {
        this.cellLineNumbers.set(this.element.lineNumbers);
      }
      if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
        this.updateForCollapseState();
      }
    });
  }
  updateForFocusState() {
    if (!this.element) {
      return;
    }
    const activeCell = this.notebookEditor.getActiveCell();
    this.cellFocused.set(this.notebookEditor.getActiveCell() === this.element);
    if (activeCell === this.element) {
      this.cellEditorFocused.set(this.element.focusMode === CellFocusMode.Editor);
    } else {
      this.cellEditorFocused.set(false);
    }
  }
  updateForExecutionState() {
    if (!this.element) {
      return;
    }
    const internalMetadata = this.element.internalMetadata;
    this.cellEditable.set(!this.notebookEditor.isReadOnly);
    const exeState = this._notebookExecutionStateService.getCellExecution(this.element.uri);
    if (this.element instanceof MarkupCellViewModel) {
      this.cellRunState.reset();
      this.cellExecuting.reset();
    } else if (exeState?.state === NotebookCellExecutionState.Executing) {
      this.cellRunState.set("executing");
      this.cellExecuting.set(true);
    } else if (exeState?.state === NotebookCellExecutionState.Pending || exeState?.state === NotebookCellExecutionState.Unconfirmed) {
      this.cellRunState.set("pending");
      this.cellExecuting.set(true);
    } else if (internalMetadata.lastRunSuccess === true) {
      this.cellRunState.set("succeeded");
      this.cellExecuting.set(false);
    } else if (internalMetadata.lastRunSuccess === false) {
      this.cellRunState.set("failed");
      this.cellExecuting.set(false);
    } else {
      this.cellRunState.set("idle");
      this.cellExecuting.set(false);
    }
  }
  updateForEditState() {
    if (!this.element) {
      return;
    }
    if (this.element instanceof MarkupCellViewModel) {
      this.markdownEditMode.set(this.element.getEditState() === CellEditState.Editing);
    } else {
      this.markdownEditMode.set(false);
    }
  }
  updateForCollapseState() {
    if (!this.element) {
      return;
    }
    this.cellContentCollapsed.set(!!this.element.isInputCollapsed);
    this.cellOutputCollapsed.set(!!this.element.isOutputCollapsed);
  }
  updateForOutputs() {
    if (this.element instanceof CodeCellViewModel) {
      this.cellHasOutputs.set(this.element.outputsViewModels.length > 0);
    } else {
      this.cellHasOutputs.set(false);
    }
  }
  updateForChat() {
    const chatController = NotebookChatController.get(this.notebookEditor);
    if (!chatController || !this.element) {
      this.cellGeneratedByChat.set(false);
      return;
    }
    this.cellGeneratedByChat.set(chatController.isCellGeneratedByChat(this.element));
  }
};
CellContextKeyManager = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, INotebookExecutionStateService)
], CellContextKeyManager);
export {
  CellContextKeyManager,
  CellContextKeyPart
};
//# sourceMappingURL=cellContextKeys.js.map
