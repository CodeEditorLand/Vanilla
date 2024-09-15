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
import { Emitter, Event, PauseableEmitter } from "../../../../../base/common/event.js";
import { Disposable, dispose, IDisposable } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { NotebookCellTextModel } from "./notebookCellTextModel.js";
import { INotebookTextModel, NotebookCellOutputsSplice, NotebookDocumentMetadata, NotebookCellMetadata, ICellEditOperation, CellEditType, CellUri, diff, NotebookCellsChangeType, ICellDto2, TransientOptions, NotebookTextModelChangedEvent, IOutputDto, ICellOutput, IOutputItemDto, ISelectionState, NullablePartialNotebookCellMetadata, NotebookCellInternalMetadata, NullablePartialNotebookCellInternalMetadata, NotebookTextModelWillAddRemoveEvent, NotebookCellTextModelSplice, ICell, NotebookCellCollapseState, NotebookCellDefaultCollapseConfig, CellKind } from "../notebookCommon.js";
import { IUndoRedoService, UndoRedoElementType, IUndoRedoElement, IResourceUndoRedoElement, UndoRedoGroup, IWorkspaceUndoRedoElement } from "../../../../../platform/undoRedo/common/undoRedo.js";
import { MoveCellEdit, SpliceCellsEdit, CellMetadataEdit } from "./cellEdit.js";
import { ISequence, LcsDiff } from "../../../../../base/common/diff/diff.js";
import { hash } from "../../../../../base/common/hash.js";
import { NotebookCellOutputTextModel } from "./notebookCellOutputTextModel.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { ILanguageService } from "../../../../../editor/common/languages/language.js";
import { FindMatch, ITextModel } from "../../../../../editor/common/model.js";
import { TextModel } from "../../../../../editor/common/model/textModel.js";
import { isDefined } from "../../../../../base/common/types.js";
import { ILanguageDetectionService } from "../../../../services/languageDetection/common/languageDetectionWorkerService.js";
import { IPosition } from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { SearchParams } from "../../../../../editor/common/model/textModelSearch.js";
class StackOperation {
  constructor(textModel, undoRedoGroup, _pauseableEmitter, _postUndoRedo, selectionState, beginAlternativeVersionId) {
    this.textModel = textModel;
    this.undoRedoGroup = undoRedoGroup;
    this._pauseableEmitter = _pauseableEmitter;
    this._postUndoRedo = _postUndoRedo;
    this.type = UndoRedoElementType.Workspace;
    this._beginSelectionState = selectionState;
    this._beginAlternativeVersionId = beginAlternativeVersionId;
    this._resultAlternativeVersionId = beginAlternativeVersionId;
  }
  static {
    __name(this, "StackOperation");
  }
  type;
  get code() {
    return this._operations.length === 1 ? this._operations[0].code : "undoredo.notebooks.stackOperation";
  }
  _operations = [];
  _beginSelectionState = void 0;
  _resultSelectionState = void 0;
  _beginAlternativeVersionId;
  _resultAlternativeVersionId;
  get label() {
    return this._operations.length === 1 ? this._operations[0].label : "edit";
  }
  get resources() {
    return [this.textModel.uri];
  }
  get isEmpty() {
    return this._operations.length === 0;
  }
  pushEndState(alternativeVersionId, selectionState) {
    this._resultAlternativeVersionId = alternativeVersionId;
    this._resultSelectionState = selectionState || this._resultSelectionState;
  }
  pushEditOperation(element, beginSelectionState, resultSelectionState, alternativeVersionId) {
    if (this._operations.length === 0) {
      this._beginSelectionState = this._beginSelectionState ?? beginSelectionState;
    }
    this._operations.push(element);
    this._resultSelectionState = resultSelectionState;
    this._resultAlternativeVersionId = alternativeVersionId;
  }
  async undo() {
    this._pauseableEmitter.pause();
    try {
      for (let i = this._operations.length - 1; i >= 0; i--) {
        await this._operations[i].undo();
      }
      this._postUndoRedo(this._beginAlternativeVersionId);
      this._pauseableEmitter.fire({
        rawEvents: [],
        synchronous: void 0,
        versionId: this.textModel.versionId,
        endSelectionState: this._beginSelectionState
      });
    } finally {
      this._pauseableEmitter.resume();
    }
  }
  async redo() {
    this._pauseableEmitter.pause();
    try {
      for (let i = 0; i < this._operations.length; i++) {
        await this._operations[i].redo();
      }
      this._postUndoRedo(this._resultAlternativeVersionId);
      this._pauseableEmitter.fire({
        rawEvents: [],
        synchronous: void 0,
        versionId: this.textModel.versionId,
        endSelectionState: this._resultSelectionState
      });
    } finally {
      this._pauseableEmitter.resume();
    }
  }
}
class NotebookOperationManager {
  constructor(_textModel, _undoService, _pauseableEmitter, _postUndoRedo) {
    this._textModel = _textModel;
    this._undoService = _undoService;
    this._pauseableEmitter = _pauseableEmitter;
    this._postUndoRedo = _postUndoRedo;
  }
  static {
    __name(this, "NotebookOperationManager");
  }
  _pendingStackOperation = null;
  isUndoStackEmpty() {
    return this._pendingStackOperation === null || this._pendingStackOperation.isEmpty;
  }
  pushStackElement(alternativeVersionId, selectionState) {
    if (this._pendingStackOperation && !this._pendingStackOperation.isEmpty) {
      this._pendingStackOperation.pushEndState(alternativeVersionId, selectionState);
      this._undoService.pushElement(this._pendingStackOperation, this._pendingStackOperation.undoRedoGroup);
    }
    this._pendingStackOperation = null;
  }
  _getOrCreateEditStackElement(beginSelectionState, undoRedoGroup, alternativeVersionId) {
    return this._pendingStackOperation ??= new StackOperation(this._textModel, undoRedoGroup, this._pauseableEmitter, this._postUndoRedo, beginSelectionState, alternativeVersionId || "");
  }
  pushEditOperation(element, beginSelectionState, resultSelectionState, alternativeVersionId, undoRedoGroup) {
    const pendingStackOperation = this._getOrCreateEditStackElement(beginSelectionState, undoRedoGroup, alternativeVersionId);
    pendingStackOperation.pushEditOperation(element, beginSelectionState, resultSelectionState, alternativeVersionId);
  }
}
class NotebookEventEmitter extends PauseableEmitter {
  static {
    __name(this, "NotebookEventEmitter");
  }
  get isEmpty() {
    return this._eventQueue.isEmpty();
  }
  isDirtyEvent() {
    for (const e of this._eventQueue) {
      for (let i = 0; i < e.rawEvents.length; i++) {
        if (!e.rawEvents[i].transient) {
          return true;
        }
      }
    }
    return false;
  }
}
let NotebookTextModel = class extends Disposable {
  constructor(viewType, uri, cells, metadata, options, _undoService, _modelService, _languageService, _languageDetectionService) {
    super();
    this.viewType = viewType;
    this.uri = uri;
    this._undoService = _undoService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._languageDetectionService = _languageDetectionService;
    this.transientOptions = options;
    this.metadata = metadata;
    this._initialize(cells);
    const maybeUpdateCellTextModel = /* @__PURE__ */ __name((textModel) => {
      if (textModel.uri.scheme === Schemas.vscodeNotebookCell && textModel instanceof TextModel) {
        const cellUri = CellUri.parse(textModel.uri);
        if (cellUri && isEqual(cellUri.notebook, this.uri)) {
          const cellIdx = this._getCellIndexByHandle(cellUri.handle);
          if (cellIdx >= 0) {
            const cell = this.cells[cellIdx];
            if (cell) {
              cell.textModel = textModel;
            }
          }
        }
      }
    }, "maybeUpdateCellTextModel");
    this._register(_modelService.onModelAdded((e) => maybeUpdateCellTextModel(e)));
    this._pauseableEmitter = new NotebookEventEmitter({
      merge: /* @__PURE__ */ __name((events) => {
        const first = events[0];
        const rawEvents = first.rawEvents;
        let versionId = first.versionId;
        let endSelectionState = first.endSelectionState;
        let synchronous = first.synchronous;
        for (let i = 1; i < events.length; i++) {
          rawEvents.push(...events[i].rawEvents);
          versionId = events[i].versionId;
          endSelectionState = events[i].endSelectionState !== void 0 ? events[i].endSelectionState : endSelectionState;
          synchronous = events[i].synchronous !== void 0 ? events[i].synchronous : synchronous;
        }
        return { rawEvents, versionId, endSelectionState, synchronous };
      }, "merge")
    });
    this._register(this._pauseableEmitter.event((e) => {
      if (e.rawEvents.length) {
        this._onDidChangeContent.fire(e);
      }
    }));
    this._operationManager = new NotebookOperationManager(
      this,
      this._undoService,
      this._pauseableEmitter,
      (alternativeVersionId) => {
        this._increaseVersionId(true);
        this._overwriteAlternativeVersionId(alternativeVersionId);
      }
    );
  }
  static {
    __name(this, "NotebookTextModel");
  }
  _isDisposed = false;
  _onWillDispose = this._register(new Emitter());
  _onWillAddRemoveCells = this._register(new Emitter());
  _onDidChangeContent = this._register(new Emitter());
  onWillDispose = this._onWillDispose.event;
  onWillAddRemoveCells = this._onWillAddRemoveCells.event;
  onDidChangeContent = this._onDidChangeContent.event;
  _cellhandlePool = 0;
  _cellListeners = /* @__PURE__ */ new Map();
  _cells = [];
  _defaultCollapseConfig;
  metadata = {};
  transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} };
  _versionId = 0;
  /**
   * This alternative id is only for non-cell-content changes.
   */
  _notebookSpecificAlternativeId = 0;
  /**
   * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
   */
  _alternativeVersionId = "1";
  _operationManager;
  _pauseableEmitter;
  get length() {
    return this._cells.length;
  }
  get cells() {
    return this._cells;
  }
  get versionId() {
    return this._versionId;
  }
  get alternativeVersionId() {
    return this._alternativeVersionId;
  }
  get notebookType() {
    return this.viewType;
  }
  setCellCollapseDefault(collapseConfig) {
    this._defaultCollapseConfig = collapseConfig;
  }
  _initialize(cells, triggerDirty) {
    this._cells = [];
    this._versionId = 0;
    this._notebookSpecificAlternativeId = 0;
    const mainCells = cells.map((cell) => {
      const cellHandle = this._cellhandlePool++;
      const cellUri = CellUri.generate(this.uri, cellHandle);
      const collapseState = this._getDefaultCollapseState(cell);
      return new NotebookCellTextModel(cellUri, cellHandle, cell.source, cell.language, cell.mime, cell.cellKind, cell.outputs, cell.metadata, cell.internalMetadata, collapseState, this.transientOptions, this._languageService, this._languageDetectionService);
    });
    for (let i = 0; i < mainCells.length; i++) {
      const dirtyStateListener = mainCells[i].onDidChangeContent((e) => {
        this._bindCellContentHandler(mainCells[i], e);
      });
      this._cellListeners.set(mainCells[i].handle, dirtyStateListener);
      this._register(mainCells[i]);
    }
    this._cells.splice(0, 0, ...mainCells);
    this._alternativeVersionId = this._generateAlternativeId();
    if (triggerDirty) {
      this._pauseableEmitter.fire({
        rawEvents: [{ kind: NotebookCellsChangeType.Unknown, transient: false }],
        versionId: this.versionId,
        synchronous: true,
        endSelectionState: void 0
      });
    }
  }
  _bindCellContentHandler(cell, e) {
    this._increaseVersionId(e === "content");
    switch (e) {
      case "content":
        this._pauseableEmitter.fire({
          rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellContent, index: this._getCellIndexByHandle(cell.handle), transient: false }],
          versionId: this.versionId,
          synchronous: true,
          endSelectionState: void 0
        });
        break;
      case "language":
        this._pauseableEmitter.fire({
          rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellLanguage, index: this._getCellIndexByHandle(cell.handle), language: cell.language, transient: false }],
          versionId: this.versionId,
          synchronous: true,
          endSelectionState: void 0
        });
        break;
      case "mime":
        this._pauseableEmitter.fire({
          rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellMime, index: this._getCellIndexByHandle(cell.handle), mime: cell.mime, transient: false }],
          versionId: this.versionId,
          synchronous: true,
          endSelectionState: void 0
        });
        break;
    }
  }
  _generateAlternativeId() {
    return `${this._notebookSpecificAlternativeId}_` + this.cells.map((cell) => cell.handle + "," + cell.alternativeId).join(";");
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._onWillDispose.fire();
    this._undoService.removeElements(this.uri);
    dispose(this._cellListeners.values());
    this._cellListeners.clear();
    dispose(this._cells);
    this._cells = [];
    super.dispose();
  }
  pushStackElement() {
  }
  _getCellIndexByHandle(handle) {
    return this.cells.findIndex((c) => c.handle === handle);
  }
  _getCellIndexWithOutputIdHandleFromEdits(outputId, rawEdits) {
    const edit = rawEdits.find((e) => "outputs" in e && e.outputs.some((o) => o.outputId === outputId));
    if (edit) {
      if ("index" in edit) {
        return edit.index;
      } else if ("handle" in edit) {
        const cellIndex = this._getCellIndexByHandle(edit.handle);
        this._assertIndex(cellIndex);
        return cellIndex;
      }
    }
    return -1;
  }
  _getCellIndexWithOutputIdHandle(outputId) {
    return this.cells.findIndex((c) => !!c.outputs.find((o) => o.outputId === outputId));
  }
  reset(cells, metadata, transientOptions) {
    this.transientOptions = transientOptions;
    const edits = NotebookTextModel.computeEdits(this, cells);
    this.applyEdits(
      [
        ...edits,
        { editType: CellEditType.DocumentMetadata, metadata }
      ],
      true,
      void 0,
      () => void 0,
      void 0,
      false
    );
  }
  static computeEdits(model, cells) {
    const edits = [];
    const commonPrefix = this._commonPrefix(model.cells, model.cells.length, 0, cells, cells.length, 0);
    if (commonPrefix > 0) {
      for (let i = 0; i < commonPrefix; i++) {
        edits.push(
          {
            editType: CellEditType.Metadata,
            index: i,
            metadata: cells[i].metadata ?? {}
          },
          ...this._computeOutputEdit(i, model.cells[i].outputs, cells[i].outputs)
        );
      }
    }
    if (model.cells.length === cells.length && commonPrefix === model.cells.length) {
      return edits;
    }
    const commonSuffix = this._commonSuffix(model.cells, model.cells.length - commonPrefix, commonPrefix, cells, cells.length - commonPrefix, commonPrefix);
    if (commonSuffix > 0) {
      edits.push({ editType: CellEditType.Replace, index: commonPrefix, count: model.cells.length - commonPrefix - commonSuffix, cells: cells.slice(commonPrefix, cells.length - commonSuffix) });
    } else if (commonPrefix > 0) {
      edits.push({ editType: CellEditType.Replace, index: commonPrefix, count: model.cells.length - commonPrefix, cells: cells.slice(commonPrefix) });
    } else {
      edits.push({ editType: CellEditType.Replace, index: 0, count: model.cells.length, cells });
    }
    if (commonSuffix > 0) {
      for (let i = commonSuffix; i > 0; i--) {
        edits.push(
          {
            editType: CellEditType.Metadata,
            index: model.cells.length - i,
            metadata: cells[cells.length - i].metadata ?? {}
          },
          ...this._computeOutputEdit(model.cells.length - i, model.cells[model.cells.length - i].outputs, cells[cells.length - i].outputs)
        );
      }
    }
    return edits;
  }
  static _computeOutputEdit(index, a, b) {
    if (a.length !== b.length) {
      return [
        {
          editType: CellEditType.Output,
          index,
          outputs: b,
          append: false
        }
      ];
    }
    if (a.length === 0) {
      return [];
    }
    return b.map((output, i) => {
      return {
        editType: CellEditType.OutputItems,
        outputId: a[i].outputId,
        items: output.outputs,
        append: false
      };
    });
  }
  static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i = 0; i < maxResult && a[aDelta + i].fastEqual(b[bDelta + i]); i++) {
      result++;
    }
    return result;
  }
  static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i = 0; i < maxResult && a[aDelta + aLen - i - 1].fastEqual(b[bDelta + bLen - i - 1]); i++) {
      result++;
    }
    return result;
  }
  applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo) {
    this._pauseableEmitter.pause();
    this._operationManager.pushStackElement(this._alternativeVersionId, void 0);
    try {
      this._doApplyEdits(rawEdits, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup);
      return true;
    } finally {
      if (!this._pauseableEmitter.isEmpty) {
        const endSelections = endSelectionsComputer();
        this._increaseVersionId(this._operationManager.isUndoStackEmpty() && !this._pauseableEmitter.isDirtyEvent());
        this._operationManager.pushStackElement(this._alternativeVersionId, endSelections);
        this._pauseableEmitter.fire({ rawEvents: [], versionId: this.versionId, synchronous, endSelectionState: endSelections });
      }
      this._pauseableEmitter.resume();
    }
  }
  _doApplyEdits(rawEdits, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const editsWithDetails = rawEdits.map((edit, index) => {
      let cellIndex = -1;
      if ("index" in edit) {
        cellIndex = edit.index;
      } else if ("handle" in edit) {
        cellIndex = this._getCellIndexByHandle(edit.handle);
        this._assertIndex(cellIndex);
      } else if ("outputId" in edit) {
        cellIndex = this._getCellIndexWithOutputIdHandle(edit.outputId);
        if (this._indexIsInvalid(cellIndex)) {
          cellIndex = this._getCellIndexWithOutputIdHandleFromEdits(edit.outputId, rawEdits.slice(0, index));
        }
        if (this._indexIsInvalid(cellIndex)) {
          return null;
        }
      } else if (edit.editType !== CellEditType.DocumentMetadata) {
        throw new Error("Invalid cell edit");
      }
      return {
        edit,
        cellIndex,
        end: edit.editType === CellEditType.DocumentMetadata ? void 0 : edit.editType === CellEditType.Replace ? edit.index + edit.count : cellIndex,
        originalIndex: index
      };
    }).filter(isDefined);
    const edits = this._mergeCellEdits(editsWithDetails).sort((a, b) => {
      if (a.end === void 0) {
        return -1;
      }
      if (b.end === void 0) {
        return -1;
      }
      return b.end - a.end || b.originalIndex - a.originalIndex;
    }).reduce((prev, curr) => {
      if (!prev.length) {
        prev.push([curr]);
      } else {
        const last = prev[prev.length - 1];
        const index = last[0].cellIndex;
        if (curr.cellIndex === index) {
          last.push(curr);
        } else {
          prev.push([curr]);
        }
      }
      return prev;
    }, []).map((editsOnSameIndex) => {
      const replaceEdits = [];
      const otherEdits = [];
      editsOnSameIndex.forEach((edit) => {
        if (edit.edit.editType === CellEditType.Replace) {
          replaceEdits.push(edit);
        } else {
          otherEdits.push(edit);
        }
      });
      return [...otherEdits.reverse(), ...replaceEdits];
    });
    const flattenEdits = edits.flat();
    for (const { edit, cellIndex } of flattenEdits) {
      switch (edit.editType) {
        case CellEditType.Replace:
          this._replaceCells(edit.index, edit.count, edit.cells, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case CellEditType.Output: {
          this._assertIndex(cellIndex);
          const cell = this._cells[cellIndex];
          if (edit.append) {
            this._spliceNotebookCellOutputs(cell, { start: cell.outputs.length, deleteCount: 0, newOutputs: edit.outputs.map((op) => new NotebookCellOutputTextModel(op)) }, true, computeUndoRedo);
          } else {
            this._spliceNotebookCellOutputs2(cell, edit.outputs, computeUndoRedo);
          }
          break;
        }
        case CellEditType.OutputItems:
          {
            this._assertIndex(cellIndex);
            const cell = this._cells[cellIndex];
            if (edit.append) {
              this._appendNotebookCellOutputItems(cell, edit.outputId, edit.items);
            } else {
              this._replaceNotebookCellOutputItems(cell, edit.outputId, edit.items);
            }
          }
          break;
        case CellEditType.Metadata:
          this._assertIndex(edit.index);
          this._changeCellMetadata(this._cells[edit.index], edit.metadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case CellEditType.PartialMetadata:
          this._assertIndex(cellIndex);
          this._changeCellMetadataPartial(this._cells[cellIndex], edit.metadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case CellEditType.PartialInternalMetadata:
          this._assertIndex(cellIndex);
          this._changeCellInternalMetadataPartial(this._cells[cellIndex], edit.internalMetadata);
          break;
        case CellEditType.CellLanguage:
          this._assertIndex(edit.index);
          this._changeCellLanguage(this._cells[edit.index], edit.language, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case CellEditType.DocumentMetadata:
          this._updateNotebookCellMetadata(edit.metadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
          break;
        case CellEditType.Move:
          this._moveCellToIdx(edit.index, edit.length, edit.newIdx, synchronous, computeUndoRedo, beginSelectionState, void 0, undoRedoGroup);
          break;
      }
    }
  }
  _mergeCellEdits(rawEdits) {
    const mergedEdits = [];
    rawEdits.forEach((edit) => {
      if (mergedEdits.length) {
        const last = mergedEdits[mergedEdits.length - 1];
        if (last.edit.editType === CellEditType.Output && last.edit.append && edit.edit.editType === CellEditType.Output && edit.edit.append && last.cellIndex === edit.cellIndex) {
          last.edit.outputs = [...last.edit.outputs, ...edit.edit.outputs];
        } else if (last.edit.editType === CellEditType.Output && !last.edit.append && last.edit.outputs.length === 0 && edit.edit.editType === CellEditType.Output && edit.edit.append && last.cellIndex === edit.cellIndex) {
          last.edit.append = false;
          last.edit.outputs = edit.edit.outputs;
        } else {
          mergedEdits.push(edit);
        }
      } else {
        mergedEdits.push(edit);
      }
    });
    return mergedEdits;
  }
  _getDefaultCollapseState(cellDto) {
    const defaultConfig = cellDto.cellKind === CellKind.Code ? this._defaultCollapseConfig?.codeCell : this._defaultCollapseConfig?.markupCell;
    return cellDto.collapseState ?? (defaultConfig ?? void 0);
  }
  _replaceCells(index, count, cellDtos, synchronous, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    if (count === 0 && cellDtos.length === 0) {
      return;
    }
    const oldViewCells = this._cells.slice(0);
    const oldSet = /* @__PURE__ */ new Set();
    oldViewCells.forEach((cell) => {
      oldSet.add(cell.handle);
    });
    for (let i = index; i < Math.min(index + count, this._cells.length); i++) {
      const cell = this._cells[i];
      this._cellListeners.get(cell.handle)?.dispose();
      this._cellListeners.delete(cell.handle);
    }
    const cells = cellDtos.map((cellDto) => {
      const cellHandle = this._cellhandlePool++;
      const cellUri = CellUri.generate(this.uri, cellHandle);
      const collapseState = this._getDefaultCollapseState(cellDto);
      const cell = new NotebookCellTextModel(
        cellUri,
        cellHandle,
        cellDto.source,
        cellDto.language,
        cellDto.mime,
        cellDto.cellKind,
        cellDto.outputs || [],
        cellDto.metadata,
        cellDto.internalMetadata,
        collapseState,
        this.transientOptions,
        this._languageService,
        this._languageDetectionService
      );
      const textModel = this._modelService.getModel(cellUri);
      if (textModel && textModel instanceof TextModel) {
        cell.textModel = textModel;
        cell.language = cellDto.language;
        cell.textModel.setValue(cellDto.source);
        cell.resetTextBuffer(cell.textModel.getTextBuffer());
      }
      const dirtyStateListener = cell.onDidChangeContent((e) => {
        this._bindCellContentHandler(cell, e);
      });
      this._cellListeners.set(cell.handle, dirtyStateListener);
      this._register(cell);
      return cell;
    });
    const cellsCopy = this._cells.slice(0);
    cellsCopy.splice(index, count, ...cells);
    const diffs = diff(this._cells, cellsCopy, (cell) => {
      return oldSet.has(cell.handle);
    }).map((diff2) => {
      return [diff2.start, diff2.deleteCount, diff2.toInsert];
    });
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes: diffs } });
    this._cells = cellsCopy;
    const undoDiff = diffs.map((diff2) => {
      const deletedCells = oldViewCells.slice(diff2[0], diff2[0] + diff2[1]);
      return [diff2[0], deletedCells, diff2[2]];
    });
    if (computeUndoRedo) {
      this._operationManager.pushEditOperation(new SpliceCellsEdit(this.uri, undoDiff, {
        insertCell: /* @__PURE__ */ __name((index2, cell, endSelections) => {
          this._insertNewCell(index2, [cell], true, endSelections);
        }, "insertCell"),
        deleteCell: /* @__PURE__ */ __name((index2, endSelections) => {
          this._removeCell(index2, 1, true, endSelections);
        }, "deleteCell"),
        replaceCell: /* @__PURE__ */ __name((index2, count2, cells2, endSelections) => {
          this._replaceNewCells(index2, count2, cells2, true, endSelections);
        }, "replaceCell")
      }, void 0, void 0), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
    }
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes: diffs, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: void 0
    });
  }
  _increaseVersionId(transient) {
    this._versionId = this._versionId + 1;
    if (!transient) {
      this._notebookSpecificAlternativeId = this._versionId;
    }
    this._alternativeVersionId = this._generateAlternativeId();
  }
  _overwriteAlternativeVersionId(newAlternativeVersionId) {
    this._alternativeVersionId = newAlternativeVersionId;
    this._notebookSpecificAlternativeId = Number(newAlternativeVersionId.substring(0, newAlternativeVersionId.indexOf("_")));
  }
  _updateNotebookCellMetadata(metadata, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const oldMetadata = this.metadata;
    const triggerDirtyChange = this._isDocumentMetadataChanged(this.metadata, metadata);
    if (triggerDirtyChange) {
      if (computeUndoRedo) {
        const that = this;
        this._operationManager.pushEditOperation(new class {
          type = UndoRedoElementType.Resource;
          get resource() {
            return that.uri;
          }
          label = "Update Cell Metadata";
          code = "undoredo.textBufferEdit";
          undo() {
            that._updateNotebookCellMetadata(oldMetadata, false, beginSelectionState, undoRedoGroup);
          }
          redo() {
            that._updateNotebookCellMetadata(metadata, false, beginSelectionState, undoRedoGroup);
          }
        }(), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
      }
    }
    this.metadata = metadata;
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata, transient: !triggerDirtyChange }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _insertNewCell(index, cells, synchronous, endSelections) {
    for (let i = 0; i < cells.length; i++) {
      const dirtyStateListener = cells[i].onDidChangeContent((e) => {
        this._bindCellContentHandler(cells[i], e);
      });
      this._cellListeners.set(cells[i].handle, dirtyStateListener);
    }
    const changes = [[index, 0, cells]];
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
    this._cells.splice(index, 0, ...cells);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
    return;
  }
  _removeCell(index, count, synchronous, endSelections) {
    for (let i = index; i < index + count; i++) {
      const cell = this._cells[i];
      this._cellListeners.get(cell.handle)?.dispose();
      this._cellListeners.delete(cell.handle);
    }
    const changes = [[index, count, []]];
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
    this._cells.splice(index, count);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
  }
  _replaceNewCells(index, count, cells, synchronous, endSelections) {
    for (let i = index; i < index + count; i++) {
      const cell = this._cells[i];
      this._cellListeners.get(cell.handle)?.dispose();
      this._cellListeners.delete(cell.handle);
    }
    for (let i = 0; i < cells.length; i++) {
      const dirtyStateListener = cells[i].onDidChangeContent((e) => {
        this._bindCellContentHandler(cells[i], e);
      });
      this._cellListeners.set(cells[i].handle, dirtyStateListener);
    }
    const changes = [[index, count, cells]];
    this._onWillAddRemoveCells.fire({ rawEvent: { kind: NotebookCellsChangeType.ModelChange, changes } });
    this._cells.splice(index, count, ...cells);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ModelChange, changes, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
  }
  _isDocumentMetadataChanged(a, b) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key of keys) {
      if (key === "custom") {
        if (!this._customMetadataEqual(a[key], b[key]) && !this.transientOptions.transientDocumentMetadata[key]) {
          return true;
        }
      } else if (a[key] !== b[key] && !this.transientOptions.transientDocumentMetadata[key]) {
        return true;
      }
    }
    return false;
  }
  _isCellMetadataChanged(a, b) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key of keys) {
      if (a[key] !== b[key] && !this.transientOptions.transientCellMetadata[key]) {
        return true;
      }
    }
    return false;
  }
  _customMetadataEqual(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    if (aProps.length !== bProps.length) {
      return false;
    }
    for (let i = 0; i < aProps.length; i++) {
      const propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  }
  _changeCellMetadataPartial(cell, metadata, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const newMetadata = {
      ...cell.metadata
    };
    let k;
    for (k in metadata) {
      const value = metadata[k] ?? void 0;
      newMetadata[k] = value;
    }
    return this._changeCellMetadata(cell, newMetadata, computeUndoRedo, beginSelectionState, undoRedoGroup);
  }
  _changeCellMetadata(cell, metadata, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    const triggerDirtyChange = this._isCellMetadataChanged(cell.metadata, metadata);
    if (triggerDirtyChange) {
      if (computeUndoRedo) {
        const index = this._cells.indexOf(cell);
        this._operationManager.pushEditOperation(new CellMetadataEdit(this.uri, index, Object.freeze(cell.metadata), Object.freeze(metadata), {
          updateCellMetadata: /* @__PURE__ */ __name((index2, newMetadata) => {
            const cell2 = this._cells[index2];
            if (!cell2) {
              return;
            }
            this._changeCellMetadata(cell2, newMetadata, false, beginSelectionState, undoRedoGroup);
          }, "updateCellMetadata")
        }), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
      }
    }
    cell.metadata = metadata;
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellMetadata, index: this._cells.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _changeCellInternalMetadataPartial(cell, internalMetadata) {
    const newInternalMetadata = {
      ...cell.internalMetadata
    };
    let k;
    for (k in internalMetadata) {
      const value = internalMetadata[k] ?? void 0;
      newInternalMetadata[k] = value;
    }
    cell.internalMetadata = newInternalMetadata;
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellInternalMetadata, index: this._cells.indexOf(cell), internalMetadata: cell.internalMetadata, transient: true }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _changeCellLanguage(cell, languageId, computeUndoRedo, beginSelectionState, undoRedoGroup) {
    if (cell.language === languageId) {
      return;
    }
    const oldLanguage = cell.language;
    cell.language = languageId;
    if (computeUndoRedo) {
      const that = this;
      this._operationManager.pushEditOperation(new class {
        type = UndoRedoElementType.Resource;
        get resource() {
          return that.uri;
        }
        label = "Update Cell Language";
        code = "undoredo.textBufferEdit";
        undo() {
          that._changeCellLanguage(cell, oldLanguage, false, beginSelectionState, undoRedoGroup);
        }
        redo() {
          that._changeCellLanguage(cell, languageId, false, beginSelectionState, undoRedoGroup);
        }
      }(), beginSelectionState, void 0, this._alternativeVersionId, undoRedoGroup);
    }
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.ChangeCellLanguage, index: this._cells.indexOf(cell), language: languageId, transient: false }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _spliceNotebookCellOutputs2(cell, outputs, computeUndoRedo) {
    if (outputs.length === 0 && cell.outputs.length === 0) {
      return;
    }
    if (outputs.length <= 1) {
      this._spliceNotebookCellOutputs(cell, { start: 0, deleteCount: cell.outputs.length, newOutputs: outputs.map((op) => new NotebookCellOutputTextModel(op)) }, false, computeUndoRedo);
      return;
    }
    const diff2 = new LcsDiff(new OutputSequence(cell.outputs), new OutputSequence(outputs));
    const diffResult = diff2.ComputeDiff(false);
    const splices = diffResult.changes.map((change) => ({
      start: change.originalStart,
      deleteCount: change.originalLength,
      // create cell output text model only when it's inserted into the notebook document
      newOutputs: outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength).map((op) => new NotebookCellOutputTextModel(op))
    }));
    splices.reverse().forEach((splice) => {
      this._spliceNotebookCellOutputs(cell, splice, false, computeUndoRedo);
    });
  }
  _spliceNotebookCellOutputs(cell, splice, append, computeUndoRedo) {
    cell.spliceNotebookCellOutputs(splice);
    this._pauseableEmitter.fire({
      rawEvents: [{
        kind: NotebookCellsChangeType.Output,
        index: this._cells.indexOf(cell),
        outputs: cell.outputs.map((output) => output.asDto()) ?? [],
        append,
        transient: this.transientOptions.transientOutputs
      }],
      versionId: this.versionId,
      synchronous: true,
      endSelectionState: void 0
    });
  }
  _appendNotebookCellOutputItems(cell, outputId, items) {
    if (cell.changeOutputItems(outputId, true, items)) {
      this._pauseableEmitter.fire({
        rawEvents: [{
          kind: NotebookCellsChangeType.OutputItem,
          index: this._cells.indexOf(cell),
          outputId,
          outputItems: items,
          append: true,
          transient: this.transientOptions.transientOutputs
        }],
        versionId: this.versionId,
        synchronous: true,
        endSelectionState: void 0
      });
    }
  }
  _replaceNotebookCellOutputItems(cell, outputId, items) {
    if (cell.changeOutputItems(outputId, false, items)) {
      this._pauseableEmitter.fire({
        rawEvents: [{
          kind: NotebookCellsChangeType.OutputItem,
          index: this._cells.indexOf(cell),
          outputId,
          outputItems: items,
          append: false,
          transient: this.transientOptions.transientOutputs
        }],
        versionId: this.versionId,
        synchronous: true,
        endSelectionState: void 0
      });
    }
  }
  _moveCellToIdx(index, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections, undoRedoGroup) {
    if (pushedToUndoStack) {
      this._operationManager.pushEditOperation(new MoveCellEdit(this.uri, index, length, newIdx, {
        moveCell: /* @__PURE__ */ __name((fromIndex, length2, toIndex, beforeSelections2, endSelections2) => {
          this._moveCellToIdx(fromIndex, length2, toIndex, true, false, beforeSelections2, endSelections2, undoRedoGroup);
        }, "moveCell")
      }, beforeSelections, endSelections), beforeSelections, endSelections, this._alternativeVersionId, undoRedoGroup);
    }
    this._assertIndex(index);
    this._assertIndex(newIdx);
    const cells = this._cells.splice(index, length);
    this._cells.splice(newIdx, 0, ...cells);
    this._pauseableEmitter.fire({
      rawEvents: [{ kind: NotebookCellsChangeType.Move, index, length, newIdx, cells, transient: false }],
      versionId: this.versionId,
      synchronous,
      endSelectionState: endSelections
    });
    return true;
  }
  _assertIndex(index) {
    if (this._indexIsInvalid(index)) {
      throw new Error(`model index out of range ${index}`);
    }
  }
  _indexIsInvalid(index) {
    return index < 0 || index >= this._cells.length;
  }
  //#region Find
  findNextMatch(searchString, searchStart, isRegex, matchCase, wordSeparators) {
    this._assertIndex(searchStart.cellIndex);
    const searchParams = new SearchParams(searchString, isRegex, matchCase, wordSeparators);
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return null;
    }
    let cellIndex = searchStart.cellIndex;
    let searchStartPosition = searchStart.position;
    while (cellIndex < this._cells.length) {
      const cell = this._cells[cellIndex];
      const searchRange = new Range(
        searchStartPosition.lineNumber,
        searchStartPosition.column,
        cell.textBuffer.getLineCount(),
        cell.textBuffer.getLineMaxColumn(cell.textBuffer.getLineCount())
      );
      const result = cell.textBuffer.findMatchesLineByLine(searchRange, searchData, false, 1);
      if (result.length > 0) {
        return { cell, match: result[0] };
      }
      cellIndex++;
      searchStartPosition = { lineNumber: 1, column: 1 };
    }
    return null;
  }
  //#endregion
};
NotebookTextModel = __decorateClass([
  __decorateParam(5, IUndoRedoService),
  __decorateParam(6, IModelService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, ILanguageDetectionService)
], NotebookTextModel);
class OutputSequence {
  constructor(outputs) {
    this.outputs = outputs;
  }
  static {
    __name(this, "OutputSequence");
  }
  getElements() {
    return this.outputs.map((output) => {
      return hash(output.outputs.map((output2) => ({
        mime: output2.mime,
        data: output2.data
      })));
    });
  }
}
export {
  NotebookTextModel
};
//# sourceMappingURL=notebookTextModel.js.map
