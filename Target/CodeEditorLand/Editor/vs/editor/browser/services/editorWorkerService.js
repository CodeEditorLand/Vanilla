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
import { createWebWorker } from "../../../base/browser/defaultWorkerFactory.js";
import { WindowIntervalTimer } from "../../../base/browser/dom.js";
import { mainWindow } from "../../../base/browser/window.js";
import { isNonEmptyArray } from "../../../base/common/arrays.js";
import { timeout } from "../../../base/common/async.js";
import { canceled, onUnexpectedError } from "../../../base/common/errors.js";
import {
  Disposable
} from "../../../base/common/lifecycle.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import {
  logOnceWebWorkerWarning
} from "../../../base/common/worker/simpleWorker.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { LineRange } from "../../common/core/lineRange.js";
import { Range } from "../../common/core/range.js";
import {
  MovedText
} from "../../common/diff/linesDiffComputer.js";
import {
  DetailedLineRangeMapping,
  LineRangeMapping,
  RangeMapping
} from "../../common/diff/rangeMapping.js";
import * as languages from "../../common/languages.js";
import { ILanguageConfigurationService } from "../../common/languages/languageConfigurationRegistry.js";
import { EditorSimpleWorker } from "../../common/services/editorSimpleWorker.js";
import { EditorWorkerHost } from "../../common/services/editorWorkerHost.js";
import { ILanguageFeaturesService } from "../../common/services/languageFeatures.js";
import { IModelService } from "../../common/services/model.js";
import { WorkerTextModelSyncClient } from "../../common/services/textModelSync/textModelSync.impl.js";
import { ITextResourceConfigurationService } from "../../common/services/textResourceConfiguration.js";
const STOP_WORKER_DELTA_TIME_MS = 5 * 60 * 1e3;
function canSyncModel(modelService, resource) {
  const model = modelService.getModel(resource);
  if (!model) {
    return false;
  }
  if (model.isTooLargeForSyncing()) {
    return false;
  }
  return true;
}
__name(canSyncModel, "canSyncModel");
let EditorWorkerService = class extends Disposable {
  constructor(workerDescriptor, modelService, configurationService, logService, _languageConfigurationService, languageFeaturesService) {
    super();
    this._languageConfigurationService = _languageConfigurationService;
    this._modelService = modelService;
    this._workerManager = this._register(
      new WorkerManager(workerDescriptor, this._modelService)
    );
    this._logService = logService;
    this._register(
      languageFeaturesService.linkProvider.register(
        { language: "*", hasAccessToAllModels: true },
        {
          provideLinks: /* @__PURE__ */ __name(async (model, token) => {
            if (!canSyncModel(this._modelService, model.uri)) {
              return Promise.resolve({ links: [] });
            }
            const worker = await this._workerWithResources([
              model.uri
            ]);
            const links = await worker.$computeLinks(
              model.uri.toString()
            );
            return links && { links };
          }, "provideLinks")
        }
      )
    );
    this._register(
      languageFeaturesService.completionProvider.register(
        "*",
        new WordBasedCompletionItemProvider(
          this._workerManager,
          configurationService,
          this._modelService,
          this._languageConfigurationService
        )
      )
    );
  }
  static {
    __name(this, "EditorWorkerService");
  }
  _modelService;
  _workerManager;
  _logService;
  dispose() {
    super.dispose();
  }
  canComputeUnicodeHighlights(uri) {
    return canSyncModel(this._modelService, uri);
  }
  async computedUnicodeHighlights(uri, options, range) {
    const worker = await this._workerWithResources([uri]);
    return worker.$computeUnicodeHighlights(uri.toString(), options, range);
  }
  async computeDiff(original, modified, options, algorithm) {
    const worker = await this._workerWithResources(
      [original, modified],
      /* forceLargeModels */
      true
    );
    const result = await worker.$computeDiff(
      original.toString(),
      modified.toString(),
      options,
      algorithm
    );
    if (!result) {
      return null;
    }
    const diff = {
      identical: result.identical,
      quitEarly: result.quitEarly,
      changes: toLineRangeMappings(result.changes),
      moves: result.moves.map(
        (m) => new MovedText(
          new LineRangeMapping(
            new LineRange(m[0], m[1]),
            new LineRange(m[2], m[3])
          ),
          toLineRangeMappings(m[4])
        )
      )
    };
    return diff;
    function toLineRangeMappings(changes) {
      return changes.map(
        (c) => new DetailedLineRangeMapping(
          new LineRange(c[0], c[1]),
          new LineRange(c[2], c[3]),
          c[4]?.map(
            (c2) => new RangeMapping(
              new Range(c2[0], c2[1], c2[2], c2[3]),
              new Range(c2[4], c2[5], c2[6], c2[7])
            )
          )
        )
      );
    }
    __name(toLineRangeMappings, "toLineRangeMappings");
  }
  canComputeDirtyDiff(original, modified) {
    return canSyncModel(this._modelService, original) && canSyncModel(this._modelService, modified);
  }
  async computeDirtyDiff(original, modified, ignoreTrimWhitespace) {
    const worker = await this._workerWithResources([original, modified]);
    return worker.$computeDirtyDiff(
      original.toString(),
      modified.toString(),
      ignoreTrimWhitespace
    );
  }
  async computeMoreMinimalEdits(resource, edits, pretty = false) {
    if (isNonEmptyArray(edits)) {
      if (!canSyncModel(this._modelService, resource)) {
        return Promise.resolve(edits);
      }
      const sw = StopWatch.create();
      const result = this._workerWithResources([resource]).then(
        (worker) => worker.$computeMoreMinimalEdits(
          resource.toString(),
          edits,
          pretty
        )
      );
      result.finally(
        () => this._logService.trace(
          "FORMAT#computeMoreMinimalEdits",
          resource.toString(true),
          sw.elapsed()
        )
      );
      return Promise.race([result, timeout(1e3).then(() => edits)]);
    } else {
      return Promise.resolve(void 0);
    }
  }
  computeHumanReadableDiff(resource, edits) {
    if (isNonEmptyArray(edits)) {
      if (!canSyncModel(this._modelService, resource)) {
        return Promise.resolve(edits);
      }
      const sw = StopWatch.create();
      const opts = {
        ignoreTrimWhitespace: false,
        maxComputationTimeMs: 1e3,
        computeMoves: false
      };
      const result = this._workerWithResources([resource]).then(
        (worker) => worker.$computeHumanReadableDiff(
          resource.toString(),
          edits,
          opts
        )
      ).catch((err) => {
        onUnexpectedError(err);
        return this.computeMoreMinimalEdits(resource, edits, true);
      });
      result.finally(
        () => this._logService.trace(
          "FORMAT#computeHumanReadableDiff",
          resource.toString(true),
          sw.elapsed()
        )
      );
      return result;
    } else {
      return Promise.resolve(void 0);
    }
  }
  canNavigateValueSet(resource) {
    return canSyncModel(this._modelService, resource);
  }
  async navigateValueSet(resource, range, up) {
    const model = this._modelService.getModel(resource);
    if (!model) {
      return null;
    }
    const wordDefRegExp = this._languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
    const wordDef = wordDefRegExp.source;
    const wordDefFlags = wordDefRegExp.flags;
    const worker = await this._workerWithResources([resource]);
    return worker.$navigateValueSet(
      resource.toString(),
      range,
      up,
      wordDef,
      wordDefFlags
    );
  }
  canComputeWordRanges(resource) {
    return canSyncModel(this._modelService, resource);
  }
  async computeWordRanges(resource, range) {
    const model = this._modelService.getModel(resource);
    if (!model) {
      return Promise.resolve(null);
    }
    const wordDefRegExp = this._languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
    const wordDef = wordDefRegExp.source;
    const wordDefFlags = wordDefRegExp.flags;
    const worker = await this._workerWithResources([resource]);
    return worker.$computeWordRanges(
      resource.toString(),
      range,
      wordDef,
      wordDefFlags
    );
  }
  async findSectionHeaders(uri, options) {
    const worker = await this._workerWithResources([uri]);
    return worker.$findSectionHeaders(uri.toString(), options);
  }
  async computeDefaultDocumentColors(uri) {
    const worker = await this._workerWithResources([uri]);
    return worker.$computeDefaultDocumentColors(uri.toString());
  }
  async _workerWithResources(resources, forceLargeModels = false) {
    const worker = await this._workerManager.withWorker();
    return await worker.workerWithSyncedResources(
      resources,
      forceLargeModels
    );
  }
};
EditorWorkerService = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, ITextResourceConfigurationService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ILanguageConfigurationService),
  __decorateParam(5, ILanguageFeaturesService)
], EditorWorkerService);
class WordBasedCompletionItemProvider {
  constructor(workerManager, configurationService, modelService, languageConfigurationService) {
    this.languageConfigurationService = languageConfigurationService;
    this._workerManager = workerManager;
    this._configurationService = configurationService;
    this._modelService = modelService;
  }
  static {
    __name(this, "WordBasedCompletionItemProvider");
  }
  _workerManager;
  _configurationService;
  _modelService;
  _debugDisplayName = "wordbasedCompletions";
  async provideCompletionItems(model, position) {
    const config = this._configurationService.getValue(
      model.uri,
      position,
      "editor"
    );
    if (config.wordBasedSuggestions === "off") {
      return void 0;
    }
    const models = [];
    if (config.wordBasedSuggestions === "currentDocument") {
      if (canSyncModel(this._modelService, model.uri)) {
        models.push(model.uri);
      }
    } else {
      for (const candidate of this._modelService.getModels()) {
        if (!canSyncModel(this._modelService, candidate.uri)) {
          continue;
        }
        if (candidate === model) {
          models.unshift(candidate.uri);
        } else if (config.wordBasedSuggestions === "allDocuments" || candidate.getLanguageId() === model.getLanguageId()) {
          models.push(candidate.uri);
        }
      }
    }
    if (models.length === 0) {
      return void 0;
    }
    const wordDefRegExp = this.languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).getWordDefinition();
    const word = model.getWordAtPosition(position);
    const replace = word ? new Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn
    ) : Range.fromPositions(position);
    const insert = replace.setEndPosition(
      position.lineNumber,
      position.column
    );
    const client = await this._workerManager.withWorker();
    const data = await client.textualSuggest(
      models,
      word?.word,
      wordDefRegExp
    );
    if (!data) {
      return void 0;
    }
    return {
      duration: data.duration,
      suggestions: data.words.map((word2) => {
        return {
          kind: languages.CompletionItemKind.Text,
          label: word2,
          insertText: word2,
          range: { insert, replace }
        };
      })
    };
  }
}
let WorkerManager = class extends Disposable {
  constructor(_workerDescriptor, modelService) {
    super();
    this._workerDescriptor = _workerDescriptor;
    this._modelService = modelService;
    this._editorWorkerClient = null;
    this._lastWorkerUsedTime = (/* @__PURE__ */ new Date()).getTime();
    const stopWorkerInterval = this._register(new WindowIntervalTimer());
    stopWorkerInterval.cancelAndSet(
      () => this._checkStopIdleWorker(),
      Math.round(STOP_WORKER_DELTA_TIME_MS / 2),
      mainWindow
    );
    this._register(
      this._modelService.onModelRemoved(
        (_) => this._checkStopEmptyWorker()
      )
    );
  }
  static {
    __name(this, "WorkerManager");
  }
  _modelService;
  _editorWorkerClient;
  _lastWorkerUsedTime;
  dispose() {
    if (this._editorWorkerClient) {
      this._editorWorkerClient.dispose();
      this._editorWorkerClient = null;
    }
    super.dispose();
  }
  /**
   * Check if the model service has no more models and stop the worker if that is the case.
   */
  _checkStopEmptyWorker() {
    if (!this._editorWorkerClient) {
      return;
    }
    const models = this._modelService.getModels();
    if (models.length === 0) {
      this._editorWorkerClient.dispose();
      this._editorWorkerClient = null;
    }
  }
  /**
   * Check if the worker has been idle for a while and then stop it.
   */
  _checkStopIdleWorker() {
    if (!this._editorWorkerClient) {
      return;
    }
    const timeSinceLastWorkerUsedTime = (/* @__PURE__ */ new Date()).getTime() - this._lastWorkerUsedTime;
    if (timeSinceLastWorkerUsedTime > STOP_WORKER_DELTA_TIME_MS) {
      this._editorWorkerClient.dispose();
      this._editorWorkerClient = null;
    }
  }
  withWorker() {
    this._lastWorkerUsedTime = (/* @__PURE__ */ new Date()).getTime();
    if (!this._editorWorkerClient) {
      this._editorWorkerClient = new EditorWorkerClient(
        this._workerDescriptor,
        false,
        this._modelService
      );
    }
    return Promise.resolve(this._editorWorkerClient);
  }
};
WorkerManager = __decorateClass([
  __decorateParam(1, IModelService)
], WorkerManager);
class SynchronousWorkerClient {
  static {
    __name(this, "SynchronousWorkerClient");
  }
  _instance;
  proxy;
  constructor(instance) {
    this._instance = instance;
    this.proxy = this._instance;
  }
  dispose() {
    this._instance.dispose();
  }
  setChannel(channel, handler) {
    throw new Error(`Not supported`);
  }
  getChannel(channel) {
    throw new Error(`Not supported`);
  }
}
let EditorWorkerClient = class extends Disposable {
  constructor(_workerDescriptor, keepIdleModels, modelService) {
    super();
    this._workerDescriptor = _workerDescriptor;
    this._modelService = modelService;
    this._keepIdleModels = keepIdleModels;
    this._worker = null;
    this._modelManager = null;
  }
  static {
    __name(this, "EditorWorkerClient");
  }
  _modelService;
  _keepIdleModels;
  _worker;
  _modelManager;
  _disposed = false;
  // foreign host request
  fhr(method, args) {
    throw new Error(`Not implemented!`);
  }
  _getOrCreateWorker() {
    if (!this._worker) {
      try {
        this._worker = this._register(
          createWebWorker(this._workerDescriptor)
        );
        EditorWorkerHost.setChannel(
          this._worker,
          this._createEditorWorkerHost()
        );
      } catch (err) {
        logOnceWebWorkerWarning(err);
        this._worker = this._createFallbackLocalWorker();
      }
    }
    return this._worker;
  }
  async _getProxy() {
    try {
      const proxy = this._getOrCreateWorker().proxy;
      await proxy.$ping();
      return proxy;
    } catch (err) {
      logOnceWebWorkerWarning(err);
      this._worker = this._createFallbackLocalWorker();
      return this._worker.proxy;
    }
  }
  _createFallbackLocalWorker() {
    return new SynchronousWorkerClient(
      new EditorSimpleWorker(this._createEditorWorkerHost(), null)
    );
  }
  _createEditorWorkerHost() {
    return {
      $fhr: /* @__PURE__ */ __name((method, args) => this.fhr(method, args), "$fhr")
    };
  }
  _getOrCreateModelManager(proxy) {
    if (!this._modelManager) {
      this._modelManager = this._register(
        new WorkerTextModelSyncClient(
          proxy,
          this._modelService,
          this._keepIdleModels
        )
      );
    }
    return this._modelManager;
  }
  async workerWithSyncedResources(resources, forceLargeModels = false) {
    if (this._disposed) {
      return Promise.reject(canceled());
    }
    const proxy = await this._getProxy();
    this._getOrCreateModelManager(proxy).ensureSyncedResources(
      resources,
      forceLargeModels
    );
    return proxy;
  }
  async textualSuggest(resources, leadingWord, wordDefRegExp) {
    const proxy = await this.workerWithSyncedResources(resources);
    const wordDef = wordDefRegExp.source;
    const wordDefFlags = wordDefRegExp.flags;
    return proxy.$textualSuggest(
      resources.map((r) => r.toString()),
      leadingWord,
      wordDef,
      wordDefFlags
    );
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
};
EditorWorkerClient = __decorateClass([
  __decorateParam(2, IModelService)
], EditorWorkerClient);
export {
  EditorWorkerClient,
  EditorWorkerService
};
//# sourceMappingURL=editorWorkerService.js.map
