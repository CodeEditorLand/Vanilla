var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as DOM from "../../../../../base/browser/dom.js";
import {
  DisposableStore,
  dispose
} from "../../../../../base/common/lifecycle.js";
import {
  IContextKeyService
} from "../../../../../platform/contextkey/common/contextkey.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import {
  NOTEBOOK_CELL_TOOLBAR_LOCATION,
  NOTEBOOK_HAS_OUTPUTS,
  NOTEBOOK_HAS_RUNNING_CELL,
  NOTEBOOK_HAS_SOMETHING_RUNNING,
  NOTEBOOK_INTERRUPTIBLE_KERNEL,
  NOTEBOOK_KERNEL,
  NOTEBOOK_KERNEL_COUNT,
  NOTEBOOK_KERNEL_SELECTED,
  NOTEBOOK_KERNEL_SOURCE_COUNT,
  NOTEBOOK_LAST_CELL_FAILED,
  NOTEBOOK_MISSING_KERNEL_EXTENSION,
  NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON,
  NOTEBOOK_VIEW_TYPE
} from "../../common/notebookContextKeys.js";
import {
  INotebookExecutionStateService,
  NotebookExecutionType
} from "../../common/notebookExecutionStateService.js";
import { INotebookKernelService } from "../../common/notebookKernelService.js";
import {
  KERNEL_EXTENSIONS
} from "../notebookBrowser.js";
let NotebookEditorContextKeys = class {
  constructor(_editor, _notebookKernelService, contextKeyService, _extensionService, _notebookExecutionStateService) {
    this._editor = _editor;
    this._notebookKernelService = _notebookKernelService;
    this._extensionService = _extensionService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._notebookKernel = NOTEBOOK_KERNEL.bindTo(contextKeyService);
    this._notebookKernelCount = NOTEBOOK_KERNEL_COUNT.bindTo(contextKeyService);
    this._notebookKernelSelected = NOTEBOOK_KERNEL_SELECTED.bindTo(contextKeyService);
    this._interruptibleKernel = NOTEBOOK_INTERRUPTIBLE_KERNEL.bindTo(contextKeyService);
    this._someCellRunning = NOTEBOOK_HAS_RUNNING_CELL.bindTo(contextKeyService);
    this._kernelRunning = NOTEBOOK_HAS_SOMETHING_RUNNING.bindTo(contextKeyService);
    this._useConsolidatedOutputButton = NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON.bindTo(contextKeyService);
    this._hasOutputs = NOTEBOOK_HAS_OUTPUTS.bindTo(contextKeyService);
    this._viewType = NOTEBOOK_VIEW_TYPE.bindTo(contextKeyService);
    this._missingKernelExtension = NOTEBOOK_MISSING_KERNEL_EXTENSION.bindTo(contextKeyService);
    this._notebookKernelSourceCount = NOTEBOOK_KERNEL_SOURCE_COUNT.bindTo(contextKeyService);
    this._cellToolbarLocation = NOTEBOOK_CELL_TOOLBAR_LOCATION.bindTo(contextKeyService);
    this._lastCellFailed = NOTEBOOK_LAST_CELL_FAILED.bindTo(contextKeyService);
    this._handleDidChangeModel();
    this._updateForNotebookOptions();
    this._disposables.add(
      _editor.onDidChangeModel(this._handleDidChangeModel, this)
    );
    this._disposables.add(
      _notebookKernelService.onDidAddKernel(
        this._updateKernelContext,
        this
      )
    );
    this._disposables.add(
      _notebookKernelService.onDidChangeSelectedNotebooks(
        this._updateKernelContext,
        this
      )
    );
    this._disposables.add(
      _notebookKernelService.onDidChangeSourceActions(
        this._updateKernelContext,
        this
      )
    );
    this._disposables.add(
      _editor.notebookOptions.onDidChangeOptions(
        this._updateForNotebookOptions,
        this
      )
    );
    this._disposables.add(
      _extensionService.onDidChangeExtensions(
        this._updateForInstalledExtension,
        this
      )
    );
    this._disposables.add(
      _notebookExecutionStateService.onDidChangeExecution(
        this._updateForExecution,
        this
      )
    );
    this._disposables.add(
      _notebookExecutionStateService.onDidChangeLastRunFailState(
        this._updateForLastRunFailState,
        this
      )
    );
  }
  _notebookKernel;
  _notebookKernelCount;
  _notebookKernelSourceCount;
  _notebookKernelSelected;
  _interruptibleKernel;
  _someCellRunning;
  _kernelRunning;
  _hasOutputs;
  _useConsolidatedOutputButton;
  _viewType;
  _missingKernelExtension;
  _cellToolbarLocation;
  _lastCellFailed;
  _disposables = new DisposableStore();
  _viewModelDisposables = new DisposableStore();
  _cellOutputsListeners = [];
  _selectedKernelDisposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
    this._viewModelDisposables.dispose();
    this._notebookKernelCount.reset();
    this._notebookKernelSourceCount.reset();
    this._interruptibleKernel.reset();
    this._someCellRunning.reset();
    this._kernelRunning.reset();
    this._viewType.reset();
    dispose(this._cellOutputsListeners);
    this._cellOutputsListeners.length = 0;
  }
  _handleDidChangeModel() {
    this._updateKernelContext();
    this._updateForNotebookOptions();
    this._viewModelDisposables.clear();
    dispose(this._cellOutputsListeners);
    this._cellOutputsListeners.length = 0;
    if (!this._editor.hasModel()) {
      return;
    }
    const recomputeOutputsExistence = () => {
      let hasOutputs = false;
      if (this._editor.hasModel()) {
        for (let i = 0; i < this._editor.getLength(); i++) {
          if (this._editor.cellAt(i).outputsViewModels.length > 0) {
            hasOutputs = true;
            break;
          }
        }
      }
      this._hasOutputs.set(hasOutputs);
    };
    const layoutDisposable = this._viewModelDisposables.add(
      new DisposableStore()
    );
    const addCellOutputsListener = (c) => {
      return c.model.onDidChangeOutputs(() => {
        layoutDisposable.clear();
        layoutDisposable.add(
          DOM.scheduleAtNextAnimationFrame(
            DOM.getWindow(this._editor.getDomNode()),
            () => {
              recomputeOutputsExistence();
            }
          )
        );
      });
    };
    for (let i = 0; i < this._editor.getLength(); i++) {
      const cell = this._editor.cellAt(i);
      this._cellOutputsListeners.push(addCellOutputsListener(cell));
    }
    recomputeOutputsExistence();
    this._updateForInstalledExtension();
    this._viewModelDisposables.add(
      this._editor.onDidChangeViewCells((e) => {
        [...e.splices].reverse().forEach((splice) => {
          const [start, deleted, newCells] = splice;
          const deletedCellOutputStates = this._cellOutputsListeners.splice(
            start,
            deleted,
            ...newCells.map(addCellOutputsListener)
          );
          dispose(deletedCellOutputStates);
        });
      })
    );
    this._viewType.set(this._editor.textModel.viewType);
  }
  _updateForExecution(e) {
    if (this._editor.textModel) {
      const notebookExe = this._notebookExecutionStateService.getExecution(
        this._editor.textModel.uri
      );
      const notebookCellExe = this._notebookExecutionStateService.getCellExecutionsForNotebook(
        this._editor.textModel.uri
      );
      this._kernelRunning.set(
        notebookCellExe.length > 0 || !!notebookExe
      );
      if (e.type === NotebookExecutionType.cell) {
        this._someCellRunning.set(notebookCellExe.length > 0);
      }
    } else {
      this._kernelRunning.set(false);
      if (e.type === NotebookExecutionType.cell) {
        this._someCellRunning.set(false);
      }
    }
  }
  _updateForLastRunFailState(e) {
    if (e.notebook === this._editor.textModel?.uri) {
      this._lastCellFailed.set(e.visible);
    }
  }
  async _updateForInstalledExtension() {
    if (!this._editor.hasModel()) {
      return;
    }
    const viewType = this._editor.textModel.viewType;
    const kernelExtensionId = KERNEL_EXTENSIONS.get(viewType);
    this._missingKernelExtension.set(
      !!kernelExtensionId && !await this._extensionService.getExtension(kernelExtensionId)
    );
  }
  _updateKernelContext() {
    if (!this._editor.hasModel()) {
      this._notebookKernelCount.reset();
      this._notebookKernelSourceCount.reset();
      this._interruptibleKernel.reset();
      return;
    }
    const { selected, all } = this._notebookKernelService.getMatchingKernel(
      this._editor.textModel
    );
    const sourceActions = this._notebookKernelService.getSourceActions(
      this._editor.textModel,
      this._editor.scopedContextKeyService
    );
    this._notebookKernelCount.set(all.length);
    this._notebookKernelSourceCount.set(sourceActions.length);
    this._interruptibleKernel.set(selected?.implementsInterrupt ?? false);
    this._notebookKernelSelected.set(Boolean(selected));
    this._notebookKernel.set(selected?.id ?? "");
    this._selectedKernelDisposables.clear();
    if (selected) {
      this._selectedKernelDisposables.add(
        selected.onDidChange(() => {
          this._interruptibleKernel.set(
            selected?.implementsInterrupt ?? false
          );
        })
      );
    }
  }
  _updateForNotebookOptions() {
    const layout = this._editor.notebookOptions.getDisplayOptions();
    this._useConsolidatedOutputButton.set(layout.consolidatedOutputButton);
    this._cellToolbarLocation.set(
      this._editor.notebookOptions.computeCellToolbarLocation(
        this._editor.textModel?.viewType
      )
    );
  }
};
NotebookEditorContextKeys = __decorateClass([
  __decorateParam(1, INotebookKernelService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, INotebookExecutionStateService)
], NotebookEditorContextKeys);
export {
  NotebookEditorContextKeys
};
