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
import { Throttler } from "../../../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../../../base/common/cancellation.js";
import {
  Disposable,
  toDisposable
} from "../../../../../../base/common/lifecycle.js";
import { INotebookCellStatusBarService } from "../../../common/notebookCellStatusBarService.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { NotebookVisibleCellObserver } from "./notebookVisibleCellObserver.js";
let ContributedStatusBarItemController = class extends Disposable {
  constructor(_notebookEditor, _notebookCellStatusBarService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._notebookCellStatusBarService = _notebookCellStatusBarService;
    this._observer = this._register(
      new NotebookVisibleCellObserver(this._notebookEditor)
    );
    this._register(
      this._observer.onDidChangeVisibleCells(
        this._updateVisibleCells,
        this
      )
    );
    this._updateEverything();
    this._register(
      this._notebookCellStatusBarService.onDidChangeProviders(
        this._updateEverything,
        this
      )
    );
    this._register(
      this._notebookCellStatusBarService.onDidChangeItems(
        this._updateEverything,
        this
      )
    );
  }
  static id = "workbench.notebook.statusBar.contributed";
  _visibleCells = /* @__PURE__ */ new Map();
  _observer;
  _updateEverything() {
    const newCells = this._observer.visibleCells.filter(
      (cell) => !this._visibleCells.has(cell.handle)
    );
    const visibleCellHandles = new Set(
      this._observer.visibleCells.map((item) => item.handle)
    );
    const currentCellHandles = Array.from(this._visibleCells.keys());
    const removedCells = currentCellHandles.filter(
      (handle) => !visibleCellHandles.has(handle)
    );
    const itemsToUpdate = currentCellHandles.filter(
      (handle) => visibleCellHandles.has(handle)
    );
    this._updateVisibleCells({
      added: newCells,
      removed: removedCells.map((handle) => ({ handle }))
    });
    itemsToUpdate.forEach(
      (handle) => this._visibleCells.get(handle)?.update()
    );
  }
  _updateVisibleCells(e) {
    const vm = this._notebookEditor.getViewModel();
    if (!vm) {
      return;
    }
    for (const newCell of e.added) {
      const helper = new CellStatusBarHelper(
        vm,
        newCell,
        this._notebookCellStatusBarService
      );
      this._visibleCells.set(newCell.handle, helper);
    }
    for (const oldCell of e.removed) {
      this._visibleCells.get(oldCell.handle)?.dispose();
      this._visibleCells.delete(oldCell.handle);
    }
  }
  dispose() {
    super.dispose();
    this._visibleCells.forEach((cell) => cell.dispose());
    this._visibleCells.clear();
  }
};
ContributedStatusBarItemController = __decorateClass([
  __decorateParam(1, INotebookCellStatusBarService)
], ContributedStatusBarItemController);
class CellStatusBarHelper extends Disposable {
  constructor(_notebookViewModel, _cell, _notebookCellStatusBarService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this._cell = _cell;
    this._notebookCellStatusBarService = _notebookCellStatusBarService;
    this._register(toDisposable(() => this._activeToken?.dispose(true)));
    this._updateSoon();
    this._register(
      this._cell.model.onDidChangeContent(() => this._updateSoon())
    );
    this._register(
      this._cell.model.onDidChangeLanguage(() => this._updateSoon())
    );
    this._register(
      this._cell.model.onDidChangeMetadata(() => this._updateSoon())
    );
    this._register(
      this._cell.model.onDidChangeInternalMetadata(
        () => this._updateSoon()
      )
    );
    this._register(
      this._cell.model.onDidChangeOutputs(() => this._updateSoon())
    );
  }
  _currentItemIds = [];
  _currentItemLists = [];
  _activeToken;
  _isDisposed = false;
  _updateThrottler = this._register(new Throttler());
  update() {
    this._updateSoon();
  }
  _updateSoon() {
    setTimeout(() => {
      if (!this._isDisposed) {
        this._updateThrottler.queue(() => this._update());
      }
    }, 0);
  }
  async _update() {
    const cellIndex = this._notebookViewModel.getCellIndex(this._cell);
    const docUri = this._notebookViewModel.notebookDocument.uri;
    const viewType = this._notebookViewModel.notebookDocument.viewType;
    this._activeToken?.dispose(true);
    const tokenSource = this._activeToken = new CancellationTokenSource();
    const itemLists = await this._notebookCellStatusBarService.getStatusBarItemsForCell(
      docUri,
      cellIndex,
      viewType,
      tokenSource.token
    );
    if (tokenSource.token.isCancellationRequested) {
      itemLists.forEach(
        (itemList) => itemList.dispose && itemList.dispose()
      );
      return;
    }
    const items = itemLists.flatMap((itemList) => itemList.items);
    const newIds = this._notebookViewModel.deltaCellStatusBarItems(
      this._currentItemIds,
      [{ handle: this._cell.handle, items }]
    );
    this._currentItemLists.forEach(
      (itemList) => itemList.dispose && itemList.dispose()
    );
    this._currentItemLists = itemLists;
    this._currentItemIds = newIds;
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
    this._activeToken?.dispose(true);
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [
      { handle: this._cell.handle, items: [] }
    ]);
    this._currentItemLists.forEach(
      (itemList) => itemList.dispose && itemList.dispose()
    );
  }
}
registerNotebookContribution(
  ContributedStatusBarItemController.id,
  ContributedStatusBarItemController
);
export {
  ContributedStatusBarItemController
};
