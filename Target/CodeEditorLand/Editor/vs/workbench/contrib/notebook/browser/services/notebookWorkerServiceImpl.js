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
import { createWebWorker } from "../../../../../base/browser/defaultWorkerFactory.js";
import {
  Disposable,
  DisposableStore,
  dispose,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { TextModel } from "../../../../../editor/common/model/textModel.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import {
  CellUri,
  NotebookCellsChangeType
} from "../../common/notebookCommon.js";
import { INotebookService } from "../../common/notebookService.js";
let NotebookEditorWorkerServiceImpl = class extends Disposable {
  static {
    __name(this, "NotebookEditorWorkerServiceImpl");
  }
  _workerManager;
  constructor(notebookService, modelService) {
    super();
    this._workerManager = this._register(
      new WorkerManager(notebookService, modelService)
    );
  }
  canComputeDiff(original, modified) {
    throw new Error("Method not implemented.");
  }
  computeDiff(original, modified) {
    return this._workerManager.withWorker().then((client) => {
      return client.computeDiff(original, modified);
    });
  }
  canPromptRecommendation(model) {
    return this._workerManager.withWorker().then((client) => {
      return client.canPromptRecommendation(model);
    });
  }
};
NotebookEditorWorkerServiceImpl = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, IModelService)
], NotebookEditorWorkerServiceImpl);
class WorkerManager extends Disposable {
  // private _lastWorkerUsedTime: number;
  constructor(_notebookService, _modelService) {
    super();
    this._notebookService = _notebookService;
    this._modelService = _modelService;
    this._editorWorkerClient = null;
  }
  static {
    __name(this, "WorkerManager");
  }
  _editorWorkerClient;
  withWorker() {
    if (!this._editorWorkerClient) {
      this._editorWorkerClient = new NotebookWorkerClient(
        this._notebookService,
        this._modelService
      );
    }
    return Promise.resolve(this._editorWorkerClient);
  }
}
class NotebookEditorModelManager extends Disposable {
  constructor(_proxy, _notebookService, _modelService) {
    super();
    this._proxy = _proxy;
    this._notebookService = _notebookService;
    this._modelService = _modelService;
  }
  static {
    __name(this, "NotebookEditorModelManager");
  }
  _syncedModels = /* @__PURE__ */ Object.create(null);
  _syncedModelsLastUsedTime = /* @__PURE__ */ Object.create(null);
  ensureSyncedResources(resources) {
    for (const resource of resources) {
      const resourceStr = resource.toString();
      if (!this._syncedModels[resourceStr]) {
        this._beginModelSync(resource);
      }
      if (this._syncedModels[resourceStr]) {
        this._syncedModelsLastUsedTime[resourceStr] = (/* @__PURE__ */ new Date()).getTime();
      }
    }
  }
  _beginModelSync(resource) {
    const model = this._notebookService.listNotebookDocuments().find(
      (document) => document.uri.toString() === resource.toString()
    );
    if (!model) {
      return;
    }
    const modelUrl = resource.toString();
    this._proxy.$acceptNewModel(
      model.uri.toString(),
      model.metadata,
      model.cells.map((cell) => ({
        handle: cell.handle,
        url: cell.uri.toString(),
        source: cell.textBuffer.getLinesContent(),
        eol: cell.textBuffer.getEOL(),
        versionId: cell.textModel?.getVersionId() ?? 0,
        language: cell.language,
        mime: cell.mime,
        cellKind: cell.cellKind,
        outputs: cell.outputs.map((op) => ({
          outputId: op.outputId,
          outputs: op.outputs
        })),
        metadata: cell.metadata,
        internalMetadata: cell.internalMetadata
      }))
    );
    const toDispose = new DisposableStore();
    const cellToDto = /* @__PURE__ */ __name((cell) => {
      return {
        handle: cell.handle,
        url: cell.uri.toString(),
        source: cell.textBuffer.getLinesContent(),
        eol: cell.textBuffer.getEOL(),
        versionId: 0,
        language: cell.language,
        cellKind: cell.cellKind,
        outputs: cell.outputs.map((op) => ({
          outputId: op.outputId,
          outputs: op.outputs
        })),
        metadata: cell.metadata,
        internalMetadata: cell.internalMetadata
      };
    }, "cellToDto");
    const cellHandlers = /* @__PURE__ */ new Set();
    const addCellContentChangeHandler = /* @__PURE__ */ __name((cell) => {
      if (!cellHandlers.has(cell) && cell.textModel) {
        cellHandlers.add(cell);
        toDispose.add(
          cell.textModel.onDidChangeContent(
            (e) => this._proxy.$acceptCellModelChanged(
              modelUrl,
              cell.handle,
              e
            )
          )
        );
      }
    }, "addCellContentChangeHandler");
    model.cells.forEach((cell) => addCellContentChangeHandler(cell));
    if (model.cells.length !== cellHandlers.size) {
      toDispose.add(
        this._modelService.onModelAdded((textModel) => {
          if (textModel.uri.scheme !== Schemas.vscodeNotebookCell || !(textModel instanceof TextModel)) {
            return;
          }
          const cellUri = CellUri.parse(textModel.uri);
          if (!cellUri || !isEqual(cellUri.notebook, model.uri)) {
            return;
          }
          const cell = model.cells.find(
            (cell2) => cell2.handle === cellUri.handle
          );
          if (cell) {
            addCellContentChangeHandler(cell);
          }
        })
      );
    }
    toDispose.add(
      model.onDidChangeContent((event) => {
        const dto = [];
        event.rawEvents.forEach((e) => {
          switch (e.kind) {
            case NotebookCellsChangeType.ModelChange:
            case NotebookCellsChangeType.Initialize: {
              dto.push({
                kind: e.kind,
                changes: e.changes.map(
                  (diff) => [
                    diff[0],
                    diff[1],
                    diff[2].map(
                      (cell) => cellToDto(
                        cell
                      )
                    )
                  ]
                )
              });
              break;
            }
            case NotebookCellsChangeType.Move: {
              dto.push({
                kind: NotebookCellsChangeType.Move,
                index: e.index,
                length: e.length,
                newIdx: e.newIdx,
                cells: e.cells.map(
                  (cell) => cellToDto(cell)
                )
              });
              break;
            }
            case NotebookCellsChangeType.ChangeCellContent:
              break;
            default:
              dto.push(e);
          }
        });
        this._proxy.$acceptModelChanged(modelUrl.toString(), {
          rawEvents: dto,
          versionId: event.versionId
        });
      })
    );
    toDispose.add(
      model.onWillDispose(() => {
        this._stopModelSync(modelUrl);
      })
    );
    toDispose.add(
      toDisposable(() => {
        this._proxy.$acceptRemovedModel(modelUrl);
      })
    );
    this._syncedModels[modelUrl] = toDispose;
  }
  _stopModelSync(modelUrl) {
    const toDispose = this._syncedModels[modelUrl];
    delete this._syncedModels[modelUrl];
    delete this._syncedModelsLastUsedTime[modelUrl];
    dispose(toDispose);
  }
}
class NotebookWorkerClient extends Disposable {
  constructor(_notebookService, _modelService) {
    super();
    this._notebookService = _notebookService;
    this._modelService = _modelService;
    this._worker = null;
    this._modelManager = null;
  }
  static {
    __name(this, "NotebookWorkerClient");
  }
  _worker;
  _modelManager;
  computeDiff(original, modified) {
    const proxy = this._ensureSyncedResources([original, modified]);
    return proxy.$computeDiff(original.toString(), modified.toString());
  }
  canPromptRecommendation(modelUri) {
    const proxy = this._ensureSyncedResources([modelUri]);
    return proxy.$canPromptRecommendation(modelUri.toString());
  }
  _getOrCreateModelManager(proxy) {
    if (!this._modelManager) {
      this._modelManager = this._register(
        new NotebookEditorModelManager(
          proxy,
          this._notebookService,
          this._modelService
        )
      );
    }
    return this._modelManager;
  }
  _ensureSyncedResources(resources) {
    const proxy = this._getOrCreateWorker().proxy;
    this._getOrCreateModelManager(proxy).ensureSyncedResources(resources);
    return proxy;
  }
  _getOrCreateWorker() {
    if (!this._worker) {
      try {
        this._worker = this._register(
          createWebWorker(
            "vs/workbench/contrib/notebook/common/services/notebookSimpleWorker",
            "NotebookEditorWorker"
          )
        );
      } catch (err) {
        throw err;
      }
    }
    return this._worker;
  }
}
export {
  NotebookEditorWorkerServiceImpl
};
//# sourceMappingURL=notebookWorkerServiceImpl.js.map
