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
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  combinedDisposable
} from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { generateUuid } from "../../../../../base/common/uuid.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import {
  CellEditType,
  CellUri,
  NotebookCellExecutionState,
  NotebookExecutionState
} from "../../common/notebookCommon.js";
import {
  CellExecutionUpdateType,
  INotebookExecutionService
} from "../../common/notebookExecutionService.js";
import {
  INotebookExecutionStateService,
  NotebookExecutionType
} from "../../common/notebookExecutionStateService.js";
import { INotebookKernelService } from "../../common/notebookKernelService.js";
import { INotebookService } from "../../common/notebookService.js";
let NotebookExecutionStateService = class extends Disposable {
  constructor(_instantiationService, _logService, _notebookService, _accessibilitySignalService) {
    super();
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._notebookService = _notebookService;
    this._accessibilitySignalService = _accessibilitySignalService;
  }
  static {
    __name(this, "NotebookExecutionStateService");
  }
  _executions = new ResourceMap();
  _notebookExecutions = new ResourceMap();
  _notebookListeners = new ResourceMap();
  _cellListeners = new ResourceMap();
  _lastFailedCells = new ResourceMap();
  _onDidChangeExecution = this._register(
    new Emitter()
  );
  onDidChangeExecution = this._onDidChangeExecution.event;
  _onDidChangeLastRunFailState = this._register(
    new Emitter()
  );
  onDidChangeLastRunFailState = this._onDidChangeLastRunFailState.event;
  getLastFailedCellForNotebook(notebook) {
    const failedCell = this._lastFailedCells.get(notebook);
    return failedCell?.visible ? failedCell.cellHandle : void 0;
  }
  forceCancelNotebookExecutions(notebookUri) {
    const notebookCellExecutions = this._executions.get(notebookUri);
    if (notebookCellExecutions) {
      for (const exe of notebookCellExecutions.values()) {
        this._onCellExecutionDidComplete(
          notebookUri,
          exe.cellHandle,
          exe
        );
      }
    }
    if (this._notebookExecutions.has(notebookUri)) {
      this._onExecutionDidComplete(notebookUri);
    }
  }
  getCellExecution(cellUri) {
    const parsed = CellUri.parse(cellUri);
    if (!parsed) {
      throw new Error(`Not a cell URI: ${cellUri}`);
    }
    const exeMap = this._executions.get(parsed.notebook);
    if (exeMap) {
      return exeMap.get(parsed.handle);
    }
    return void 0;
  }
  getExecution(notebook) {
    return this._notebookExecutions.get(notebook)?.[0];
  }
  getCellExecutionsForNotebook(notebook) {
    const exeMap = this._executions.get(notebook);
    return exeMap ? Array.from(exeMap.values()) : [];
  }
  getCellExecutionsByHandleForNotebook(notebook) {
    const exeMap = this._executions.get(notebook);
    return exeMap ? new Map(exeMap.entries()) : void 0;
  }
  _onCellExecutionDidChange(notebookUri, cellHandle, exe) {
    this._onDidChangeExecution.fire(
      new NotebookCellExecutionEvent(notebookUri, cellHandle, exe)
    );
  }
  _onCellExecutionDidComplete(notebookUri, cellHandle, exe, lastRunSuccess) {
    const notebookExecutions = this._executions.get(notebookUri);
    if (!notebookExecutions) {
      this._logService.debug(
        `NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${notebookUri.toString()}`
      );
      return;
    }
    exe.dispose();
    const cellUri = CellUri.generate(notebookUri, cellHandle);
    this._cellListeners.get(cellUri)?.dispose();
    this._cellListeners.delete(cellUri);
    notebookExecutions.delete(cellHandle);
    if (notebookExecutions.size === 0) {
      this._executions.delete(notebookUri);
      this._notebookListeners.get(notebookUri)?.dispose();
      this._notebookListeners.delete(notebookUri);
    }
    if (lastRunSuccess !== void 0) {
      if (lastRunSuccess) {
        if (this._executions.size === 0) {
          this._accessibilitySignalService.playSignal(
            AccessibilitySignal.notebookCellCompleted
          );
        }
        this._clearLastFailedCell(notebookUri);
      } else {
        this._accessibilitySignalService.playSignal(
          AccessibilitySignal.notebookCellFailed
        );
        this._setLastFailedCell(notebookUri, cellHandle);
      }
    }
    this._onDidChangeExecution.fire(
      new NotebookCellExecutionEvent(notebookUri, cellHandle)
    );
  }
  _onExecutionDidChange(notebookUri, exe) {
    this._onDidChangeExecution.fire(
      new NotebookExecutionEvent(notebookUri, exe)
    );
  }
  _onExecutionDidComplete(notebookUri) {
    const disposables = this._notebookExecutions.get(notebookUri);
    if (!Array.isArray(disposables)) {
      this._logService.debug(
        `NotebookExecutionStateService#_onCellExecutionDidComplete - unknown notebook ${notebookUri.toString()}`
      );
      return;
    }
    this._notebookExecutions.delete(notebookUri);
    this._onDidChangeExecution.fire(
      new NotebookExecutionEvent(notebookUri)
    );
    disposables.forEach((d) => d.dispose());
  }
  createCellExecution(notebookUri, cellHandle) {
    const notebook = this._notebookService.getNotebookTextModel(notebookUri);
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookUri.toString()}`);
    }
    let notebookExecutionMap = this._executions.get(notebookUri);
    if (!notebookExecutionMap) {
      const listeners = this._instantiationService.createInstance(
        NotebookExecutionListeners,
        notebookUri
      );
      this._notebookListeners.set(notebookUri, listeners);
      notebookExecutionMap = /* @__PURE__ */ new Map();
      this._executions.set(notebookUri, notebookExecutionMap);
    }
    let exe = notebookExecutionMap.get(cellHandle);
    if (!exe) {
      exe = this._createNotebookCellExecution(notebook, cellHandle);
      notebookExecutionMap.set(cellHandle, exe);
      exe.initialize();
      this._onDidChangeExecution.fire(
        new NotebookCellExecutionEvent(notebookUri, cellHandle, exe)
      );
    }
    return exe;
  }
  createExecution(notebookUri) {
    const notebook = this._notebookService.getNotebookTextModel(notebookUri);
    if (!notebook) {
      throw new Error(`Notebook not found: ${notebookUri.toString()}`);
    }
    if (!this._notebookListeners.has(notebookUri)) {
      const listeners = this._instantiationService.createInstance(
        NotebookExecutionListeners,
        notebookUri
      );
      this._notebookListeners.set(notebookUri, listeners);
    }
    let info = this._notebookExecutions.get(notebookUri);
    if (!info) {
      info = this._createNotebookExecution(notebook);
      this._notebookExecutions.set(notebookUri, info);
      this._onDidChangeExecution.fire(
        new NotebookExecutionEvent(notebookUri, info[0])
      );
    }
    return info[0];
  }
  _createNotebookCellExecution(notebook, cellHandle) {
    const notebookUri = notebook.uri;
    const exe = this._instantiationService.createInstance(
      CellExecution,
      cellHandle,
      notebook
    );
    const disposable = combinedDisposable(
      exe.onDidUpdate(
        () => this._onCellExecutionDidChange(notebookUri, cellHandle, exe)
      ),
      exe.onDidComplete(
        (lastRunSuccess) => this._onCellExecutionDidComplete(
          notebookUri,
          cellHandle,
          exe,
          lastRunSuccess
        )
      )
    );
    this._cellListeners.set(
      CellUri.generate(notebookUri, cellHandle),
      disposable
    );
    return exe;
  }
  _createNotebookExecution(notebook) {
    const notebookUri = notebook.uri;
    const exe = this._instantiationService.createInstance(
      NotebookExecution,
      notebook
    );
    const disposable = combinedDisposable(
      exe.onDidUpdate(() => this._onExecutionDidChange(notebookUri, exe)),
      exe.onDidComplete(() => this._onExecutionDidComplete(notebookUri))
    );
    return [exe, disposable];
  }
  _setLastFailedCell(notebookURI, cellHandle) {
    const prevLastFailedCellInfo = this._lastFailedCells.get(notebookURI);
    const notebook = this._notebookService.getNotebookTextModel(notebookURI);
    if (!notebook) {
      return;
    }
    const newLastFailedCellInfo = {
      cellHandle,
      disposable: prevLastFailedCellInfo ? prevLastFailedCellInfo.disposable : this._getFailedCellListener(notebook),
      visible: true
    };
    this._lastFailedCells.set(notebookURI, newLastFailedCellInfo);
    this._onDidChangeLastRunFailState.fire({
      visible: true,
      notebook: notebookURI
    });
  }
  _setLastFailedCellVisibility(notebookURI, visible) {
    const lastFailedCellInfo = this._lastFailedCells.get(notebookURI);
    if (lastFailedCellInfo) {
      this._lastFailedCells.set(notebookURI, {
        cellHandle: lastFailedCellInfo.cellHandle,
        disposable: lastFailedCellInfo.disposable,
        visible
      });
    }
    this._onDidChangeLastRunFailState.fire({
      visible,
      notebook: notebookURI
    });
  }
  _clearLastFailedCell(notebookURI) {
    const lastFailedCellInfo = this._lastFailedCells.get(notebookURI);
    if (lastFailedCellInfo) {
      lastFailedCellInfo.disposable?.dispose();
      this._lastFailedCells.delete(notebookURI);
    }
    this._onDidChangeLastRunFailState.fire({
      visible: false,
      notebook: notebookURI
    });
  }
  _getFailedCellListener(notebook) {
    return notebook.onWillAddRemoveCells(
      (e) => {
        const lastFailedCell = this._lastFailedCells.get(
          notebook.uri
        )?.cellHandle;
        if (lastFailedCell !== void 0) {
          const lastFailedCellPos = notebook.cells.findIndex(
            (c) => c.handle === lastFailedCell
          );
          e.rawEvent.changes.forEach(
            ([start, deleteCount, addedCells]) => {
              if (deleteCount) {
                if (lastFailedCellPos >= start && lastFailedCellPos < start + deleteCount) {
                  this._setLastFailedCellVisibility(
                    notebook.uri,
                    false
                  );
                }
              }
              if (addedCells.some(
                (cell) => cell.handle === lastFailedCell
              )) {
                this._setLastFailedCellVisibility(
                  notebook.uri,
                  true
                );
              }
            }
          );
        }
      }
    );
  }
  dispose() {
    super.dispose();
    this._executions.forEach((executionMap) => {
      executionMap.forEach((execution) => execution.dispose());
      executionMap.clear();
    });
    this._executions.clear();
    this._notebookExecutions.forEach((disposables) => {
      disposables.forEach((d) => d.dispose());
    });
    this._notebookExecutions.clear();
    this._cellListeners.forEach((disposable) => disposable.dispose());
    this._notebookListeners.forEach((disposable) => disposable.dispose());
    this._lastFailedCells.forEach((elem) => elem.disposable.dispose());
  }
};
NotebookExecutionStateService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILogService),
  __decorateParam(2, INotebookService),
  __decorateParam(3, IAccessibilitySignalService)
], NotebookExecutionStateService);
class NotebookCellExecutionEvent {
  constructor(notebook, cellHandle, changed) {
    this.notebook = notebook;
    this.cellHandle = cellHandle;
    this.changed = changed;
  }
  static {
    __name(this, "NotebookCellExecutionEvent");
  }
  type = NotebookExecutionType.cell;
  affectsCell(cell) {
    const parsedUri = CellUri.parse(cell);
    return !!parsedUri && isEqual(this.notebook, parsedUri.notebook) && this.cellHandle === parsedUri.handle;
  }
  affectsNotebook(notebook) {
    return isEqual(this.notebook, notebook);
  }
}
class NotebookExecutionEvent {
  constructor(notebook, changed) {
    this.notebook = notebook;
    this.changed = changed;
  }
  static {
    __name(this, "NotebookExecutionEvent");
  }
  type = NotebookExecutionType.notebook;
  affectsNotebook(notebook) {
    return isEqual(this.notebook, notebook);
  }
}
let NotebookExecutionListeners = class extends Disposable {
  constructor(notebook, _notebookService, _notebookKernelService, _notebookExecutionService, _notebookExecutionStateService, _logService) {
    super();
    this._notebookService = _notebookService;
    this._notebookKernelService = _notebookKernelService;
    this._notebookExecutionService = _notebookExecutionService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._logService = _logService;
    this._logService.debug(`NotebookExecution#ctor ${notebook.toString()}`);
    const notebookModel = this._notebookService.getNotebookTextModel(notebook);
    if (!notebookModel) {
      throw new Error("Notebook not found: " + notebook);
    }
    this._notebookModel = notebookModel;
    this._register(
      this._notebookModel.onWillAddRemoveCells(
        (e) => this.onWillAddRemoveCells(e)
      )
    );
    this._register(
      this._notebookModel.onWillDispose(
        () => this.onWillDisposeDocument()
      )
    );
  }
  static {
    __name(this, "NotebookExecutionListeners");
  }
  _notebookModel;
  cancelAll() {
    this._logService.debug(`NotebookExecutionListeners#cancelAll`);
    const exes = this._notebookExecutionStateService.getCellExecutionsForNotebook(
      this._notebookModel.uri
    );
    this._notebookExecutionService.cancelNotebookCellHandles(
      this._notebookModel,
      exes.map((exe) => exe.cellHandle)
    );
  }
  onWillDisposeDocument() {
    this._logService.debug(`NotebookExecution#onWillDisposeDocument`);
    this.cancelAll();
  }
  onWillAddRemoveCells(e) {
    const notebookExes = this._notebookExecutionStateService.getCellExecutionsByHandleForNotebook(
      this._notebookModel.uri
    );
    const executingDeletedHandles = /* @__PURE__ */ new Set();
    const pendingDeletedHandles = /* @__PURE__ */ new Set();
    if (notebookExes) {
      e.rawEvent.changes.forEach(([start, deleteCount]) => {
        if (deleteCount) {
          const deletedHandles = this._notebookModel.cells.slice(start, start + deleteCount).map((c) => c.handle);
          deletedHandles.forEach((h) => {
            const exe = notebookExes.get(h);
            if (exe?.state === NotebookCellExecutionState.Executing) {
              executingDeletedHandles.add(h);
            } else if (exe) {
              pendingDeletedHandles.add(h);
            }
          });
        }
      });
    }
    if (executingDeletedHandles.size || pendingDeletedHandles.size) {
      const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(
        this._notebookModel
      );
      if (kernel) {
        const implementsInterrupt = kernel.implementsInterrupt;
        const handlesToCancel = implementsInterrupt ? [...executingDeletedHandles] : [...executingDeletedHandles, ...pendingDeletedHandles];
        this._logService.debug(
          `NotebookExecution#onWillAddRemoveCells, ${JSON.stringify([...handlesToCancel])}`
        );
        if (handlesToCancel.length) {
          kernel.cancelNotebookCellExecution(
            this._notebookModel.uri,
            handlesToCancel
          );
        }
      }
    }
  }
};
NotebookExecutionListeners = __decorateClass([
  __decorateParam(1, INotebookService),
  __decorateParam(2, INotebookKernelService),
  __decorateParam(3, INotebookExecutionService),
  __decorateParam(4, INotebookExecutionStateService),
  __decorateParam(5, ILogService)
], NotebookExecutionListeners);
function updateToEdit(update, cellHandle) {
  if (update.editType === CellExecutionUpdateType.Output) {
    return {
      editType: CellEditType.Output,
      handle: update.cellHandle,
      append: update.append,
      outputs: update.outputs
    };
  } else if (update.editType === CellExecutionUpdateType.OutputItems) {
    return {
      editType: CellEditType.OutputItems,
      items: update.items,
      append: update.append,
      outputId: update.outputId
    };
  } else if (update.editType === CellExecutionUpdateType.ExecutionState) {
    const newInternalMetadata = {};
    if (typeof update.executionOrder !== "undefined") {
      newInternalMetadata.executionOrder = update.executionOrder;
    }
    if (typeof update.runStartTime !== "undefined") {
      newInternalMetadata.runStartTime = update.runStartTime;
    }
    return {
      editType: CellEditType.PartialInternalMetadata,
      handle: cellHandle,
      internalMetadata: newInternalMetadata
    };
  }
  throw new Error("Unknown cell update type");
}
__name(updateToEdit, "updateToEdit");
let CellExecution = class extends Disposable {
  constructor(cellHandle, _notebookModel, _logService) {
    super();
    this.cellHandle = cellHandle;
    this._notebookModel = _notebookModel;
    this._logService = _logService;
    this._logService.debug(`CellExecution#ctor ${this.getCellLog()}`);
  }
  static {
    __name(this, "CellExecution");
  }
  _onDidUpdate = this._register(new Emitter());
  onDidUpdate = this._onDidUpdate.event;
  _onDidComplete = this._register(
    new Emitter()
  );
  onDidComplete = this._onDidComplete.event;
  _state = NotebookCellExecutionState.Unconfirmed;
  get state() {
    return this._state;
  }
  get notebook() {
    return this._notebookModel.uri;
  }
  _didPause = false;
  get didPause() {
    return this._didPause;
  }
  _isPaused = false;
  get isPaused() {
    return this._isPaused;
  }
  initialize() {
    const startExecuteEdit = {
      editType: CellEditType.PartialInternalMetadata,
      handle: this.cellHandle,
      internalMetadata: {
        executionId: generateUuid(),
        runStartTime: null,
        runEndTime: null,
        lastRunSuccess: null,
        executionOrder: null,
        renderDuration: null
      }
    };
    this._applyExecutionEdits([startExecuteEdit]);
  }
  getCellLog() {
    return `${this._notebookModel.uri.toString()}, ${this.cellHandle}`;
  }
  logUpdates(updates) {
    const updateTypes = updates.map((u) => CellExecutionUpdateType[u.editType]).join(", ");
    this._logService.debug(
      `CellExecution#updateExecution ${this.getCellLog()}, [${updateTypes}]`
    );
  }
  confirm() {
    this._logService.debug(`CellExecution#confirm ${this.getCellLog()}`);
    this._state = NotebookCellExecutionState.Pending;
    this._onDidUpdate.fire();
  }
  update(updates) {
    this.logUpdates(updates);
    if (updates.some(
      (u) => u.editType === CellExecutionUpdateType.ExecutionState
    )) {
      this._state = NotebookCellExecutionState.Executing;
    }
    if (!this._didPause && updates.some(
      (u) => u.editType === CellExecutionUpdateType.ExecutionState && u.didPause
    )) {
      this._didPause = true;
    }
    const lastIsPausedUpdate = [...updates].reverse().find(
      (u) => u.editType === CellExecutionUpdateType.ExecutionState && typeof u.isPaused === "boolean"
    );
    if (lastIsPausedUpdate) {
      this._isPaused = lastIsPausedUpdate.isPaused;
    }
    const cellModel = this._notebookModel.cells.find(
      (c) => c.handle === this.cellHandle
    );
    if (cellModel) {
      const edits = updates.map(
        (update) => updateToEdit(update, this.cellHandle)
      );
      this._applyExecutionEdits(edits);
    } else {
      this._logService.debug(
        `CellExecution#update, updating cell not in notebook: ${this._notebookModel.uri.toString()}, ${this.cellHandle}`
      );
    }
    if (updates.some(
      (u) => u.editType === CellExecutionUpdateType.ExecutionState
    )) {
      this._onDidUpdate.fire();
    }
  }
  complete(completionData) {
    const cellModel = this._notebookModel.cells.find(
      (c) => c.handle === this.cellHandle
    );
    if (cellModel) {
      const edit = {
        editType: CellEditType.PartialInternalMetadata,
        handle: this.cellHandle,
        internalMetadata: {
          lastRunSuccess: completionData.lastRunSuccess,
          runStartTime: this._didPause ? null : cellModel.internalMetadata.runStartTime,
          runEndTime: this._didPause ? null : completionData.runEndTime,
          error: completionData.error
        }
      };
      this._applyExecutionEdits([edit]);
    } else {
      this._logService.debug(
        `CellExecution#complete, completing cell not in notebook: ${this._notebookModel.uri.toString()}, ${this.cellHandle}`
      );
    }
    this._onDidComplete.fire(completionData.lastRunSuccess);
  }
  _applyExecutionEdits(edits) {
    this._notebookModel.applyEdits(
      edits,
      true,
      void 0,
      () => void 0,
      void 0,
      false
    );
  }
};
CellExecution = __decorateClass([
  __decorateParam(2, ILogService)
], CellExecution);
let NotebookExecution = class extends Disposable {
  constructor(_notebookModel, _logService) {
    super();
    this._notebookModel = _notebookModel;
    this._logService = _logService;
    this._logService.debug(`NotebookExecution#ctor`);
  }
  static {
    __name(this, "NotebookExecution");
  }
  _onDidUpdate = this._register(new Emitter());
  onDidUpdate = this._onDidUpdate.event;
  _onDidComplete = this._register(new Emitter());
  onDidComplete = this._onDidComplete.event;
  _state = NotebookExecutionState.Unconfirmed;
  get state() {
    return this._state;
  }
  get notebook() {
    return this._notebookModel.uri;
  }
  debug(message) {
    this._logService.debug(
      `${message} ${this._notebookModel.uri.toString()}`
    );
  }
  confirm() {
    this.debug(`Execution#confirm`);
    this._state = NotebookExecutionState.Pending;
    this._onDidUpdate.fire();
  }
  begin() {
    this.debug(`Execution#begin`);
    this._state = NotebookExecutionState.Executing;
    this._onDidUpdate.fire();
  }
  complete() {
    this.debug(`Execution#begin`);
    this._state = NotebookExecutionState.Unconfirmed;
    this._onDidComplete.fire();
  }
};
NotebookExecution = __decorateClass([
  __decorateParam(1, ILogService)
], NotebookExecution);
export {
  NotebookExecutionStateService
};
//# sourceMappingURL=notebookExecutionStateServiceImpl.js.map
