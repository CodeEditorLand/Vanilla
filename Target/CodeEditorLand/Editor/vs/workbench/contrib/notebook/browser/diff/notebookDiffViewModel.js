import {
  Emitter
} from "../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  dispose
} from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { MultiDiffEditorItem } from "../../../multiDiffEditor/browser/multiDiffSourceResolverService.js";
import {
  CellUri
} from "../../common/notebookCommon.js";
import {
  DiffElementPlaceholderViewModel,
  SideBySideDiffElementViewModel,
  SingleSideDiffElementViewModel
} from "./diffElementViewModel.js";
import {
  NOTEBOOK_DIFF_ITEM_DIFF_STATE,
  NOTEBOOK_DIFF_ITEM_KIND
} from "./notebookDiffEditorBrowser.js";
class NotebookDiffViewModel extends Disposable {
  constructor(model, notebookEditorWorkerService, configurationService, eventDispatcher, notebookService, fontInfo, excludeUnchangedPlaceholder) {
    super();
    this.model = model;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.configurationService = configurationService;
    this.eventDispatcher = eventDispatcher;
    this.notebookService = notebookService;
    this.fontInfo = fontInfo;
    this.excludeUnchangedPlaceholder = excludeUnchangedPlaceholder;
    this.hideOutput = this.model.modified.notebook.transientOptions.transientOutputs || this.configurationService.getValue(
      "notebook.diff.ignoreOutputs"
    );
    this.hideCellMetadata = this.configurationService.getValue(
      "notebook.diff.ignoreMetadata"
    );
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        let triggerChange = false;
        if (e.affectsConfiguration("notebook.diff.ignoreMetadata")) {
          const newValue = this.configurationService.getValue(
            "notebook.diff.ignoreMetadata"
          );
          if (newValue !== void 0 && this.hideCellMetadata !== newValue) {
            this.hideCellMetadata = newValue;
            triggerChange = true;
          }
        }
        if (e.affectsConfiguration("notebook.diff.ignoreOutputs")) {
          const newValue = this.configurationService.getValue(
            "notebook.diff.ignoreOutputs"
          );
          if (newValue !== void 0 && this.hideOutput !== (newValue || this.model.modified.notebook.transientOptions.transientOutputs)) {
            this.hideOutput = newValue || !!this.model.modified.notebook.transientOptions.transientOutputs;
            triggerChange = true;
          }
        }
        if (triggerChange) {
          this._onDidChange.fire();
        }
      })
    );
  }
  placeholderAndRelatedCells = /* @__PURE__ */ new Map();
  _items = [];
  get items() {
    return this._items;
  }
  _onDidChangeItems = this._register(
    new Emitter()
  );
  onDidChangeItems = this._onDidChangeItems.event;
  disposables = this._register(new DisposableStore());
  _onDidChange = this._register(new Emitter());
  diffEditorItems = [];
  onDidChange = this._onDidChange.event;
  get value() {
    return this.diffEditorItems.filter((item) => item.type !== "placeholder").filter((item) => {
      if (this._includeUnchanged) {
        return true;
      }
      if (item instanceof NotebookMultiDiffEditorCellItem) {
        return item.type === "unchanged" && item.containerType === "unchanged" ? false : true;
      }
      if (item instanceof NotebookMultiDiffEditorMetadataItem) {
        return item.type === "unchanged" && item.containerType === "unchanged" ? false : true;
      }
      if (item instanceof NotebookMultiDiffEditorOutputItem) {
        return item.type === "unchanged" && item.containerType === "unchanged" ? false : true;
      }
      return true;
    }).filter(
      (item) => item instanceof NotebookMultiDiffEditorOutputItem ? !this.hideOutput : true
    ).filter(
      (item) => item instanceof NotebookMultiDiffEditorMetadataItem ? !this.hideCellMetadata : true
    );
  }
  _hasUnchangedCells;
  get hasUnchangedCells() {
    return this._hasUnchangedCells === true;
  }
  _includeUnchanged;
  get includeUnchanged() {
    return this._includeUnchanged === true;
  }
  set includeUnchanged(value) {
    this._includeUnchanged = value;
    this._onDidChange.fire();
  }
  hideOutput;
  hideCellMetadata;
  originalCellViewModels = [];
  dispose() {
    this.clear();
    super.dispose();
  }
  clear() {
    this.disposables.clear();
    dispose(Array.from(this.placeholderAndRelatedCells.keys()));
    this.placeholderAndRelatedCells.clear();
    dispose(this.originalCellViewModels);
    this.originalCellViewModels = [];
    dispose(this._items);
    this._items.splice(0, this._items.length);
  }
  async computeDiff(token) {
    const diffResult = await this.notebookEditorWorkerService.computeDiff(
      this.model.original.resource,
      this.model.modified.resource
    );
    if (token.isCancellationRequested) {
      return;
    }
    prettyChanges(this.model, diffResult.cellsDiff);
    const { cellDiffInfo, firstChangeIndex } = computeDiff(
      this.model,
      diffResult
    );
    if (isEqual(cellDiffInfo, this.originalCellViewModels, this.model)) {
      return;
    } else {
      this.updateViewModels(cellDiffInfo);
      this.updateDiffEditorItems();
      return { firstChangeIndex };
    }
  }
  updateDiffEditorItems() {
    this.diffEditorItems = [];
    const originalSourceUri = this.model.original.resource;
    const modifiedSourceUri = this.model.modified.resource;
    this._hasUnchangedCells = false;
    this.items.forEach((item) => {
      switch (item.type) {
        case "delete": {
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorCellItem(
              item.original.uri,
              void 0,
              item.type,
              item.type
            )
          );
          const originalMetadata = CellUri.generateCellPropertyUri(
            originalSourceUri,
            item.original.handle,
            Schemas.vscodeNotebookCellMetadata
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorMetadataItem(
              originalMetadata,
              void 0,
              item.type,
              item.type
            )
          );
          const originalOutput = CellUri.generateCellPropertyUri(
            originalSourceUri,
            item.original.handle,
            Schemas.vscodeNotebookCellOutput
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorOutputItem(
              originalOutput,
              void 0,
              item.type,
              item.type
            )
          );
          break;
        }
        case "insert": {
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorCellItem(
              void 0,
              item.modified.uri,
              item.type,
              item.type
            )
          );
          const modifiedMetadata = CellUri.generateCellPropertyUri(
            modifiedSourceUri,
            item.modified.handle,
            Schemas.vscodeNotebookCellMetadata
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorMetadataItem(
              void 0,
              modifiedMetadata,
              item.type,
              item.type
            )
          );
          const modifiedOutput = CellUri.generateCellPropertyUri(
            modifiedSourceUri,
            item.modified.handle,
            Schemas.vscodeNotebookCellOutput
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorOutputItem(
              void 0,
              modifiedOutput,
              item.type,
              item.type
            )
          );
          break;
        }
        case "modified": {
          const cellType = item.checkIfInputModified() ? item.type : "unchanged";
          const containerChanged = item.checkIfInputModified() || item.checkMetadataIfModified() || item.checkIfOutputsModified() ? item.type : "unchanged";
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorCellItem(
              item.original.uri,
              item.modified.uri,
              cellType,
              containerChanged
            )
          );
          const originalMetadata = CellUri.generateCellPropertyUri(
            originalSourceUri,
            item.original.handle,
            Schemas.vscodeNotebookCellMetadata
          );
          const modifiedMetadata = CellUri.generateCellPropertyUri(
            modifiedSourceUri,
            item.modified.handle,
            Schemas.vscodeNotebookCellMetadata
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorMetadataItem(
              originalMetadata,
              modifiedMetadata,
              item.checkMetadataIfModified() ? item.type : "unchanged",
              containerChanged
            )
          );
          const originalOutput = CellUri.generateCellPropertyUri(
            originalSourceUri,
            item.original.handle,
            Schemas.vscodeNotebookCellOutput
          );
          const modifiedOutput = CellUri.generateCellPropertyUri(
            modifiedSourceUri,
            item.modified.handle,
            Schemas.vscodeNotebookCellOutput
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorOutputItem(
              originalOutput,
              modifiedOutput,
              item.checkIfOutputsModified() ? item.type : "unchanged",
              containerChanged
            )
          );
          break;
        }
        case "unchanged": {
          this._hasUnchangedCells = true;
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorCellItem(
              item.original.uri,
              item.modified.uri,
              item.type,
              item.type
            )
          );
          const originalMetadata = CellUri.generateCellPropertyUri(
            originalSourceUri,
            item.original.handle,
            Schemas.vscodeNotebookCellMetadata
          );
          const modifiedMetadata = CellUri.generateCellPropertyUri(
            modifiedSourceUri,
            item.modified.handle,
            Schemas.vscodeNotebookCellMetadata
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorMetadataItem(
              originalMetadata,
              modifiedMetadata,
              item.type,
              item.type
            )
          );
          const originalOutput = CellUri.generateCellPropertyUri(
            originalSourceUri,
            item.original.handle,
            Schemas.vscodeNotebookCellOutput
          );
          const modifiedOutput = CellUri.generateCellPropertyUri(
            modifiedSourceUri,
            item.modified.handle,
            Schemas.vscodeNotebookCellOutput
          );
          this.diffEditorItems.push(
            new NotebookMultiDiffEditorOutputItem(
              originalOutput,
              modifiedOutput,
              item.type,
              item.type
            )
          );
          break;
        }
      }
    });
    this._onDidChange.fire();
  }
  updateViewModels(cellDiffInfo) {
    const cellViewModels = createDiffViewModels(
      this.configurationService,
      this.model,
      this.eventDispatcher,
      cellDiffInfo,
      this.fontInfo,
      this.notebookService
    );
    const oldLength = this._items.length;
    this.clear();
    this._items.splice(0, oldLength);
    let placeholder;
    this.originalCellViewModels = cellViewModels;
    cellViewModels.forEach((vm, index) => {
      if (vm.type === "unchanged" && !this.excludeUnchangedPlaceholder) {
        if (!placeholder) {
          vm.displayIconToHideUnmodifiedCells = true;
          placeholder = new DiffElementPlaceholderViewModel(
            vm.mainDocumentTextModel,
            vm.editorEventDispatcher,
            vm.initData
          );
          this._items.push(placeholder);
          const placeholderItem = placeholder;
          this.disposables.add(
            placeholderItem.onUnfoldHiddenCells(() => {
              const hiddenCellViewModels2 = this.placeholderAndRelatedCells.get(
                placeholderItem
              );
              if (!Array.isArray(hiddenCellViewModels2)) {
                return;
              }
              const start = this._items.indexOf(placeholderItem);
              this._items.splice(
                start,
                1,
                ...hiddenCellViewModels2
              );
              this._onDidChangeItems.fire({
                start,
                deleteCount: 1,
                elements: hiddenCellViewModels2
              });
            })
          );
          this.disposables.add(
            vm.onHideUnchangedCells(() => {
              const hiddenCellViewModels2 = this.placeholderAndRelatedCells.get(
                placeholderItem
              );
              if (!Array.isArray(hiddenCellViewModels2)) {
                return;
              }
              const start = this._items.indexOf(vm);
              this._items.splice(
                start,
                hiddenCellViewModels2.length,
                placeholderItem
              );
              this._onDidChangeItems.fire({
                start,
                deleteCount: hiddenCellViewModels2.length,
                elements: [placeholderItem]
              });
            })
          );
        }
        const hiddenCellViewModels = this.placeholderAndRelatedCells.get(placeholder) || [];
        hiddenCellViewModels.push(vm);
        this.placeholderAndRelatedCells.set(
          placeholder,
          hiddenCellViewModels
        );
        placeholder.hiddenCells.push(vm);
      } else {
        placeholder = void 0;
        this._items.push(vm);
      }
    });
    this._onDidChangeItems.fire({
      start: 0,
      deleteCount: oldLength,
      elements: this._items
    });
  }
}
function prettyChanges(model, diffResult) {
  const changes = diffResult.changes;
  for (let i = 0; i < diffResult.changes.length - 1; i++) {
    const curr = changes[i];
    const next = changes[i + 1];
    const x = curr.originalStart;
    const y = curr.modifiedStart;
    if (curr.originalLength === 1 && curr.modifiedLength === 0 && next.originalStart === x + 2 && next.originalLength === 0 && next.modifiedStart === y + 1 && next.modifiedLength === 1 && model.original.notebook.cells[x].getHashValue() === model.modified.notebook.cells[y + 1].getHashValue() && model.original.notebook.cells[x + 1].getHashValue() === model.modified.notebook.cells[y].getHashValue()) {
      curr.originalStart = x;
      curr.originalLength = 0;
      curr.modifiedStart = y;
      curr.modifiedLength = 1;
      next.originalStart = x + 1;
      next.originalLength = 1;
      next.modifiedStart = y + 2;
      next.modifiedLength = 0;
      i++;
    }
  }
}
function computeDiff(model, diffResult) {
  const cellChanges = diffResult.cellsDiff.changes;
  const cellDiffInfo = [];
  const originalModel = model.original.notebook;
  const modifiedModel = model.modified.notebook;
  let originalCellIndex = 0;
  let modifiedCellIndex = 0;
  let firstChangeIndex = -1;
  for (let i = 0; i < cellChanges.length; i++) {
    const change = cellChanges[i];
    for (let j = 0; j < change.originalStart - originalCellIndex; j++) {
      const originalCell = originalModel.cells[originalCellIndex + j];
      const modifiedCell = modifiedModel.cells[modifiedCellIndex + j];
      if (originalCell.getHashValue() === modifiedCell.getHashValue()) {
        cellDiffInfo.push({
          originalCellIndex: originalCellIndex + j,
          modifiedCellIndex: modifiedCellIndex + j,
          type: "unchanged"
        });
      } else {
        if (firstChangeIndex === -1) {
          firstChangeIndex = cellDiffInfo.length;
        }
        cellDiffInfo.push({
          originalCellIndex: originalCellIndex + j,
          modifiedCellIndex: modifiedCellIndex + j,
          type: "modified"
        });
      }
    }
    const modifiedLCS = computeModifiedLCS(
      change,
      originalModel,
      modifiedModel
    );
    if (modifiedLCS.length && firstChangeIndex === -1) {
      firstChangeIndex = cellDiffInfo.length;
    }
    cellDiffInfo.push(...modifiedLCS);
    originalCellIndex = change.originalStart + change.originalLength;
    modifiedCellIndex = change.modifiedStart + change.modifiedLength;
  }
  for (let i = originalCellIndex; i < originalModel.cells.length; i++) {
    cellDiffInfo.push({
      originalCellIndex: i,
      modifiedCellIndex: i - originalCellIndex + modifiedCellIndex,
      type: "unchanged"
    });
  }
  return {
    cellDiffInfo,
    firstChangeIndex
  };
}
function isEqual(cellDiffInfo, viewModels, model) {
  if (cellDiffInfo.length !== viewModels.length) {
    return false;
  }
  const originalModel = model.original.notebook;
  const modifiedModel = model.modified.notebook;
  for (let i = 0; i < viewModels.length; i++) {
    const a = cellDiffInfo[i];
    const b = viewModels[i];
    if (a.type !== b.type) {
      return false;
    }
    switch (a.type) {
      case "delete": {
        if (originalModel.cells[a.originalCellIndex].handle !== b.original?.handle) {
          return false;
        }
        continue;
      }
      case "insert": {
        if (modifiedModel.cells[a.modifiedCellIndex].handle !== b.modified?.handle) {
          return false;
        }
        continue;
      }
      default: {
        if (originalModel.cells[a.originalCellIndex].handle !== b.original?.handle) {
          return false;
        }
        if (modifiedModel.cells[a.modifiedCellIndex].handle !== b.modified?.handle) {
          return false;
        }
        continue;
      }
    }
  }
  return true;
}
function createDiffViewModels(configurationService, model, eventDispatcher, computedCellDiffs, fontInfo, notebookService) {
  const originalModel = model.original.notebook;
  const modifiedModel = model.modified.notebook;
  const initData = {
    metadataStatusHeight: configurationService.getValue(
      "notebook.diff.ignoreMetadata"
    ) ? 0 : 25,
    outputStatusHeight: configurationService.getValue(
      "notebook.diff.ignoreOutputs"
    ) || !!modifiedModel.transientOptions.transientOutputs ? 0 : 25,
    fontInfo
  };
  return computedCellDiffs.map((diff) => {
    switch (diff.type) {
      case "delete": {
        return new SingleSideDiffElementViewModel(
          originalModel,
          modifiedModel,
          originalModel.cells[diff.originalCellIndex],
          void 0,
          "delete",
          eventDispatcher,
          initData,
          notebookService,
          configurationService
        );
      }
      case "insert": {
        return new SingleSideDiffElementViewModel(
          modifiedModel,
          originalModel,
          void 0,
          modifiedModel.cells[diff.modifiedCellIndex],
          "insert",
          eventDispatcher,
          initData,
          notebookService,
          configurationService
        );
      }
      case "modified": {
        return new SideBySideDiffElementViewModel(
          model.modified.notebook,
          model.original.notebook,
          originalModel.cells[diff.originalCellIndex],
          modifiedModel.cells[diff.modifiedCellIndex],
          "modified",
          eventDispatcher,
          initData,
          notebookService,
          configurationService
        );
      }
      case "unchanged": {
        return new SideBySideDiffElementViewModel(
          model.modified.notebook,
          model.original.notebook,
          originalModel.cells[diff.originalCellIndex],
          modifiedModel.cells[diff.modifiedCellIndex],
          "unchanged",
          eventDispatcher,
          initData,
          notebookService,
          configurationService
        );
      }
    }
  });
}
function computeModifiedLCS(change, originalModel, modifiedModel) {
  const result = [];
  const modifiedLen = Math.min(change.originalLength, change.modifiedLength);
  for (let j = 0; j < modifiedLen; j++) {
    const isTheSame = originalModel.cells[change.originalStart + j].equal(
      modifiedModel.cells[change.modifiedStart + j]
    );
    result.push({
      originalCellIndex: change.originalStart + j,
      modifiedCellIndex: change.modifiedStart + j,
      type: isTheSame ? "unchanged" : "modified"
    });
  }
  for (let j = modifiedLen; j < change.originalLength; j++) {
    result.push({
      originalCellIndex: change.originalStart + j,
      type: "delete"
    });
  }
  for (let j = modifiedLen; j < change.modifiedLength; j++) {
    result.push({
      modifiedCellIndex: change.modifiedStart + j,
      type: "insert"
    });
  }
  return result;
}
class NotebookMultiDiffEditorItem extends MultiDiffEditorItem {
  constructor(originalUri, modifiedUri, goToFileUri, type, containerType, kind, contextKeys) {
    super(originalUri, modifiedUri, goToFileUri, contextKeys);
    this.type = type;
    this.containerType = containerType;
    this.kind = kind;
  }
}
class NotebookMultiDiffEditorCellItem extends NotebookMultiDiffEditorItem {
  constructor(originalUri, modifiedUri, type, containerType) {
    super(
      originalUri,
      modifiedUri,
      modifiedUri || originalUri,
      type,
      containerType,
      "Cell",
      {
        [NOTEBOOK_DIFF_ITEM_KIND.key]: "Cell",
        [NOTEBOOK_DIFF_ITEM_DIFF_STATE.key]: type
      }
    );
  }
}
class NotebookMultiDiffEditorMetadataItem extends NotebookMultiDiffEditorItem {
  constructor(originalUri, modifiedUri, type, containerType) {
    super(
      originalUri,
      modifiedUri,
      modifiedUri || originalUri,
      type,
      containerType,
      "Metadata",
      {
        [NOTEBOOK_DIFF_ITEM_KIND.key]: "Metadata",
        [NOTEBOOK_DIFF_ITEM_DIFF_STATE.key]: type
      }
    );
  }
}
class NotebookMultiDiffEditorOutputItem extends NotebookMultiDiffEditorItem {
  constructor(originalUri, modifiedUri, type, containerType) {
    super(
      originalUri,
      modifiedUri,
      modifiedUri || originalUri,
      type,
      containerType,
      "Output",
      {
        [NOTEBOOK_DIFF_ITEM_KIND.key]: "Output",
        [NOTEBOOK_DIFF_ITEM_DIFF_STATE.key]: type
      }
    );
  }
}
export {
  NotebookDiffViewModel,
  NotebookMultiDiffEditorItem,
  prettyChanges
};
