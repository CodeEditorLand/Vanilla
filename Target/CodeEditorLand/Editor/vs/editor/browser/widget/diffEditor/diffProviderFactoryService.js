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
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService, createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { LineRange } from "../../../common/core/lineRange.js";
import { IDocumentDiff, IDocumentDiffProvider, IDocumentDiffProviderOptions } from "../../../common/diff/documentDiffProvider.js";
import { DetailedLineRangeMapping, RangeMapping } from "../../../common/diff/rangeMapping.js";
import { ITextModel } from "../../../common/model.js";
import { DiffAlgorithmName, IEditorWorkerService } from "../../../common/services/editorWorker.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
const IDiffProviderFactoryService = createDecorator("diffProviderFactoryService");
let WorkerBasedDiffProviderFactoryService = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "WorkerBasedDiffProviderFactoryService");
  }
  _serviceBrand;
  createDiffProvider(options) {
    return this.instantiationService.createInstance(WorkerBasedDocumentDiffProvider, options);
  }
};
WorkerBasedDiffProviderFactoryService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WorkerBasedDiffProviderFactoryService);
registerSingleton(IDiffProviderFactoryService, WorkerBasedDiffProviderFactoryService, InstantiationType.Delayed);
let WorkerBasedDocumentDiffProvider = class {
  constructor(options, editorWorkerService, telemetryService) {
    this.editorWorkerService = editorWorkerService;
    this.telemetryService = telemetryService;
    this.setOptions(options);
  }
  static {
    __name(this, "WorkerBasedDocumentDiffProvider");
  }
  onDidChangeEventEmitter = new Emitter();
  onDidChange = this.onDidChangeEventEmitter.event;
  diffAlgorithm = "advanced";
  diffAlgorithmOnDidChangeSubscription = void 0;
  static diffCache = /* @__PURE__ */ new Map();
  dispose() {
    this.diffAlgorithmOnDidChangeSubscription?.dispose();
  }
  async computeDiff(original, modified, options, cancellationToken) {
    if (typeof this.diffAlgorithm !== "string") {
      return this.diffAlgorithm.computeDiff(original, modified, options, cancellationToken);
    }
    if (original.isDisposed() || modified.isDisposed()) {
      return {
        changes: [],
        identical: true,
        quitEarly: false,
        moves: []
      };
    }
    if (original.getLineCount() === 1 && original.getLineMaxColumn(1) === 1) {
      if (modified.getLineCount() === 1 && modified.getLineMaxColumn(1) === 1) {
        return {
          changes: [],
          identical: true,
          quitEarly: false,
          moves: []
        };
      }
      return {
        changes: [
          new DetailedLineRangeMapping(
            new LineRange(1, 2),
            new LineRange(1, modified.getLineCount() + 1),
            [
              new RangeMapping(
                original.getFullModelRange(),
                modified.getFullModelRange()
              )
            ]
          )
        ],
        identical: false,
        quitEarly: false,
        moves: []
      };
    }
    const uriKey = JSON.stringify([original.uri.toString(), modified.uri.toString()]);
    const context = JSON.stringify([original.id, modified.id, original.getAlternativeVersionId(), modified.getAlternativeVersionId(), JSON.stringify(options)]);
    const c = WorkerBasedDocumentDiffProvider.diffCache.get(uriKey);
    if (c && c.context === context) {
      return c.result;
    }
    const sw = StopWatch.create();
    const result = await this.editorWorkerService.computeDiff(original.uri, modified.uri, options, this.diffAlgorithm);
    const timeMs = sw.elapsed();
    this.telemetryService.publicLog2("diffEditor.computeDiff", {
      timeMs,
      timedOut: result?.quitEarly ?? true,
      detectedMoves: options.computeMoves ? result?.moves.length ?? 0 : -1
    });
    if (cancellationToken.isCancellationRequested) {
      return {
        changes: [],
        identical: false,
        quitEarly: true,
        moves: []
      };
    }
    if (!result) {
      throw new Error("no diff result available");
    }
    if (WorkerBasedDocumentDiffProvider.diffCache.size > 10) {
      WorkerBasedDocumentDiffProvider.diffCache.delete(WorkerBasedDocumentDiffProvider.diffCache.keys().next().value);
    }
    WorkerBasedDocumentDiffProvider.diffCache.set(uriKey, { result, context });
    return result;
  }
  setOptions(newOptions) {
    let didChange = false;
    if (newOptions.diffAlgorithm) {
      if (this.diffAlgorithm !== newOptions.diffAlgorithm) {
        this.diffAlgorithmOnDidChangeSubscription?.dispose();
        this.diffAlgorithmOnDidChangeSubscription = void 0;
        this.diffAlgorithm = newOptions.diffAlgorithm;
        if (typeof newOptions.diffAlgorithm !== "string") {
          this.diffAlgorithmOnDidChangeSubscription = newOptions.diffAlgorithm.onDidChange(() => this.onDidChangeEventEmitter.fire());
        }
        didChange = true;
      }
    }
    if (didChange) {
      this.onDidChangeEventEmitter.fire();
    }
  }
};
WorkerBasedDocumentDiffProvider = __decorateClass([
  __decorateParam(1, IEditorWorkerService),
  __decorateParam(2, ITelemetryService)
], WorkerBasedDocumentDiffProvider);
export {
  IDiffProviderFactoryService,
  WorkerBasedDiffProviderFactoryService,
  WorkerBasedDocumentDiffProvider
};
//# sourceMappingURL=diffProviderFactoryService.js.map
