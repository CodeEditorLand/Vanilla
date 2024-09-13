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
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable, IDisposable, DisposableStore } from "../../../base/common/lifecycle.js";
import * as platform from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { EditOperation, ISingleEditOperation } from "../core/editOperation.js";
import { Range } from "../core/range.js";
import { DefaultEndOfLine, EndOfLinePreference, EndOfLineSequence, ITextBuffer, ITextBufferFactory, ITextModel, ITextModelCreationOptions } from "../model.js";
import { TextModel, createTextBuffer } from "../model/textModel.js";
import { EDITOR_MODEL_DEFAULTS } from "../core/textModelDefaults.js";
import { IModelLanguageChangedEvent } from "../textModelEvents.js";
import { PLAINTEXT_LANGUAGE_ID } from "../languages/modesRegistry.js";
import { ILanguageSelection } from "../languages/language.js";
import { IModelService } from "./model.js";
import { ITextResourcePropertiesService } from "./textResourceConfiguration.js";
import { IConfigurationChangeEvent, IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import { IUndoRedoService, ResourceEditStackSnapshot } from "../../../platform/undoRedo/common/undoRedo.js";
import { StringSHA1 } from "../../../base/common/hash.js";
import { isEditStackElement } from "../model/editStack.js";
import { Schemas } from "../../../base/common/network.js";
import { equals } from "../../../base/common/objects.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
function MODEL_ID(resource) {
  return resource.toString();
}
__name(MODEL_ID, "MODEL_ID");
class ModelData {
  constructor(model, onWillDispose, onDidChangeLanguage) {
    this.model = model;
    this.model = model;
    this._modelEventListeners.add(model.onWillDispose(() => onWillDispose(model)));
    this._modelEventListeners.add(model.onDidChangeLanguage((e) => onDidChangeLanguage(model, e)));
  }
  static {
    __name(this, "ModelData");
  }
  _modelEventListeners = new DisposableStore();
  dispose() {
    this._modelEventListeners.dispose();
  }
}
const DEFAULT_EOL = platform.isLinux || platform.isMacintosh ? DefaultEndOfLine.LF : DefaultEndOfLine.CRLF;
class DisposedModelInfo {
  constructor(uri, initialUndoRedoSnapshot, time, sharesUndoRedoStack, heapSize, sha1, versionId, alternativeVersionId) {
    this.uri = uri;
    this.initialUndoRedoSnapshot = initialUndoRedoSnapshot;
    this.time = time;
    this.sharesUndoRedoStack = sharesUndoRedoStack;
    this.heapSize = heapSize;
    this.sha1 = sha1;
    this.versionId = versionId;
    this.alternativeVersionId = alternativeVersionId;
  }
  static {
    __name(this, "DisposedModelInfo");
  }
}
let ModelService = class extends Disposable {
  constructor(_configurationService, _resourcePropertiesService, _undoRedoService, _instantiationService) {
    super();
    this._configurationService = _configurationService;
    this._resourcePropertiesService = _resourcePropertiesService;
    this._undoRedoService = _undoRedoService;
    this._instantiationService = _instantiationService;
    this._modelCreationOptionsByLanguageAndResource = /* @__PURE__ */ Object.create(null);
    this._models = {};
    this._disposedModels = /* @__PURE__ */ new Map();
    this._disposedModelsHeapSize = 0;
    this._register(this._configurationService.onDidChangeConfiguration((e) => this._updateModelOptions(e)));
    this._updateModelOptions(void 0);
  }
  static {
    __name(this, "ModelService");
  }
  static MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK = 20 * 1024 * 1024;
  _serviceBrand;
  _onModelAdded = this._register(new Emitter());
  onModelAdded = this._onModelAdded.event;
  _onModelRemoved = this._register(new Emitter());
  onModelRemoved = this._onModelRemoved.event;
  _onModelModeChanged = this._register(new Emitter());
  onModelLanguageChanged = this._onModelModeChanged.event;
  _modelCreationOptionsByLanguageAndResource;
  /**
   * All the models known in the system.
   */
  _models;
  _disposedModels;
  _disposedModelsHeapSize;
  static _readModelOptions(config, isForSimpleWidget) {
    let tabSize = EDITOR_MODEL_DEFAULTS.tabSize;
    if (config.editor && typeof config.editor.tabSize !== "undefined") {
      const parsedTabSize = parseInt(config.editor.tabSize, 10);
      if (!isNaN(parsedTabSize)) {
        tabSize = parsedTabSize;
      }
      if (tabSize < 1) {
        tabSize = 1;
      }
    }
    let indentSize = "tabSize";
    if (config.editor && typeof config.editor.indentSize !== "undefined" && config.editor.indentSize !== "tabSize") {
      const parsedIndentSize = parseInt(config.editor.indentSize, 10);
      if (!isNaN(parsedIndentSize)) {
        indentSize = Math.max(parsedIndentSize, 1);
      }
    }
    let insertSpaces = EDITOR_MODEL_DEFAULTS.insertSpaces;
    if (config.editor && typeof config.editor.insertSpaces !== "undefined") {
      insertSpaces = config.editor.insertSpaces === "false" ? false : Boolean(config.editor.insertSpaces);
    }
    let newDefaultEOL = DEFAULT_EOL;
    const eol = config.eol;
    if (eol === "\r\n") {
      newDefaultEOL = DefaultEndOfLine.CRLF;
    } else if (eol === "\n") {
      newDefaultEOL = DefaultEndOfLine.LF;
    }
    let trimAutoWhitespace = EDITOR_MODEL_DEFAULTS.trimAutoWhitespace;
    if (config.editor && typeof config.editor.trimAutoWhitespace !== "undefined") {
      trimAutoWhitespace = config.editor.trimAutoWhitespace === "false" ? false : Boolean(config.editor.trimAutoWhitespace);
    }
    let detectIndentation = EDITOR_MODEL_DEFAULTS.detectIndentation;
    if (config.editor && typeof config.editor.detectIndentation !== "undefined") {
      detectIndentation = config.editor.detectIndentation === "false" ? false : Boolean(config.editor.detectIndentation);
    }
    let largeFileOptimizations = EDITOR_MODEL_DEFAULTS.largeFileOptimizations;
    if (config.editor && typeof config.editor.largeFileOptimizations !== "undefined") {
      largeFileOptimizations = config.editor.largeFileOptimizations === "false" ? false : Boolean(config.editor.largeFileOptimizations);
    }
    let bracketPairColorizationOptions = EDITOR_MODEL_DEFAULTS.bracketPairColorizationOptions;
    if (config.editor?.bracketPairColorization && typeof config.editor.bracketPairColorization === "object") {
      bracketPairColorizationOptions = {
        enabled: !!config.editor.bracketPairColorization.enabled,
        independentColorPoolPerBracketType: !!config.editor.bracketPairColorization.independentColorPoolPerBracketType
      };
    }
    return {
      isForSimpleWidget,
      tabSize,
      indentSize,
      insertSpaces,
      detectIndentation,
      defaultEOL: newDefaultEOL,
      trimAutoWhitespace,
      largeFileOptimizations,
      bracketPairColorizationOptions
    };
  }
  _getEOL(resource, language) {
    if (resource) {
      return this._resourcePropertiesService.getEOL(resource, language);
    }
    const eol = this._configurationService.getValue("files.eol", { overrideIdentifier: language });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    return platform.OS === platform.OperatingSystem.Linux || platform.OS === platform.OperatingSystem.Macintosh ? "\n" : "\r\n";
  }
  _shouldRestoreUndoStack() {
    const result = this._configurationService.getValue("files.restoreUndoStack");
    if (typeof result === "boolean") {
      return result;
    }
    return true;
  }
  getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget) {
    const language = typeof languageIdOrSelection === "string" ? languageIdOrSelection : languageIdOrSelection.languageId;
    let creationOptions = this._modelCreationOptionsByLanguageAndResource[language + resource];
    if (!creationOptions) {
      const editor = this._configurationService.getValue("editor", { overrideIdentifier: language, resource });
      const eol = this._getEOL(resource, language);
      creationOptions = ModelService._readModelOptions({ editor, eol }, isForSimpleWidget);
      this._modelCreationOptionsByLanguageAndResource[language + resource] = creationOptions;
    }
    return creationOptions;
  }
  _updateModelOptions(e) {
    const oldOptionsByLanguageAndResource = this._modelCreationOptionsByLanguageAndResource;
    this._modelCreationOptionsByLanguageAndResource = /* @__PURE__ */ Object.create(null);
    const keys = Object.keys(this._models);
    for (let i = 0, len = keys.length; i < len; i++) {
      const modelId = keys[i];
      const modelData = this._models[modelId];
      const language = modelData.model.getLanguageId();
      const uri = modelData.model.uri;
      if (e && !e.affectsConfiguration("editor", { overrideIdentifier: language, resource: uri }) && !e.affectsConfiguration("files.eol", { overrideIdentifier: language, resource: uri })) {
        continue;
      }
      const oldOptions = oldOptionsByLanguageAndResource[language + uri];
      const newOptions = this.getCreationOptions(language, uri, modelData.model.isForSimpleWidget);
      ModelService._setModelOptionsForModel(modelData.model, newOptions, oldOptions);
    }
  }
  static _setModelOptionsForModel(model, newOptions, currentOptions) {
    if (currentOptions && currentOptions.defaultEOL !== newOptions.defaultEOL && model.getLineCount() === 1) {
      model.setEOL(newOptions.defaultEOL === DefaultEndOfLine.LF ? EndOfLineSequence.LF : EndOfLineSequence.CRLF);
    }
    if (currentOptions && currentOptions.detectIndentation === newOptions.detectIndentation && currentOptions.insertSpaces === newOptions.insertSpaces && currentOptions.tabSize === newOptions.tabSize && currentOptions.indentSize === newOptions.indentSize && currentOptions.trimAutoWhitespace === newOptions.trimAutoWhitespace && equals(currentOptions.bracketPairColorizationOptions, newOptions.bracketPairColorizationOptions)) {
      return;
    }
    if (newOptions.detectIndentation) {
      model.detectIndentation(newOptions.insertSpaces, newOptions.tabSize);
      model.updateOptions({
        trimAutoWhitespace: newOptions.trimAutoWhitespace,
        bracketColorizationOptions: newOptions.bracketPairColorizationOptions
      });
    } else {
      model.updateOptions({
        insertSpaces: newOptions.insertSpaces,
        tabSize: newOptions.tabSize,
        indentSize: newOptions.indentSize,
        trimAutoWhitespace: newOptions.trimAutoWhitespace,
        bracketColorizationOptions: newOptions.bracketPairColorizationOptions
      });
    }
  }
  // --- begin IModelService
  _insertDisposedModel(disposedModelData) {
    this._disposedModels.set(MODEL_ID(disposedModelData.uri), disposedModelData);
    this._disposedModelsHeapSize += disposedModelData.heapSize;
  }
  _removeDisposedModel(resource) {
    const disposedModelData = this._disposedModels.get(MODEL_ID(resource));
    if (disposedModelData) {
      this._disposedModelsHeapSize -= disposedModelData.heapSize;
    }
    this._disposedModels.delete(MODEL_ID(resource));
    return disposedModelData;
  }
  _ensureDisposedModelsHeapSize(maxModelsHeapSize) {
    if (this._disposedModelsHeapSize > maxModelsHeapSize) {
      const disposedModels = [];
      this._disposedModels.forEach((entry) => {
        if (!entry.sharesUndoRedoStack) {
          disposedModels.push(entry);
        }
      });
      disposedModels.sort((a, b) => a.time - b.time);
      while (disposedModels.length > 0 && this._disposedModelsHeapSize > maxModelsHeapSize) {
        const disposedModel = disposedModels.shift();
        this._removeDisposedModel(disposedModel.uri);
        if (disposedModel.initialUndoRedoSnapshot !== null) {
          this._undoRedoService.restoreSnapshot(disposedModel.initialUndoRedoSnapshot);
        }
      }
    }
  }
  _createModelData(value, languageIdOrSelection, resource, isForSimpleWidget) {
    const options = this.getCreationOptions(languageIdOrSelection, resource, isForSimpleWidget);
    const model = this._instantiationService.createInstance(
      TextModel,
      value,
      languageIdOrSelection,
      options,
      resource
    );
    if (resource && this._disposedModels.has(MODEL_ID(resource))) {
      const disposedModelData = this._removeDisposedModel(resource);
      const elements = this._undoRedoService.getElements(resource);
      const sha1Computer = this._getSHA1Computer();
      const sha1IsEqual = sha1Computer.canComputeSHA1(model) ? sha1Computer.computeSHA1(model) === disposedModelData.sha1 : false;
      if (sha1IsEqual || disposedModelData.sharesUndoRedoStack) {
        for (const element of elements.past) {
          if (isEditStackElement(element) && element.matchesResource(resource)) {
            element.setModel(model);
          }
        }
        for (const element of elements.future) {
          if (isEditStackElement(element) && element.matchesResource(resource)) {
            element.setModel(model);
          }
        }
        this._undoRedoService.setElementsValidFlag(resource, true, (element) => isEditStackElement(element) && element.matchesResource(resource));
        if (sha1IsEqual) {
          model._overwriteVersionId(disposedModelData.versionId);
          model._overwriteAlternativeVersionId(disposedModelData.alternativeVersionId);
          model._overwriteInitialUndoRedoSnapshot(disposedModelData.initialUndoRedoSnapshot);
        }
      } else {
        if (disposedModelData.initialUndoRedoSnapshot !== null) {
          this._undoRedoService.restoreSnapshot(disposedModelData.initialUndoRedoSnapshot);
        }
      }
    }
    const modelId = MODEL_ID(model.uri);
    if (this._models[modelId]) {
      throw new Error("ModelService: Cannot add model because it already exists!");
    }
    const modelData = new ModelData(
      model,
      (model2) => this._onWillDispose(model2),
      (model2, e) => this._onDidChangeLanguage(model2, e)
    );
    this._models[modelId] = modelData;
    return modelData;
  }
  updateModel(model, value) {
    const options = this.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
    const { textBuffer, disposable } = createTextBuffer(value, options.defaultEOL);
    if (model.equalsTextBuffer(textBuffer)) {
      disposable.dispose();
      return;
    }
    model.pushStackElement();
    model.pushEOL(textBuffer.getEOL() === "\r\n" ? EndOfLineSequence.CRLF : EndOfLineSequence.LF);
    model.pushEditOperations(
      [],
      ModelService._computeEdits(model, textBuffer),
      () => []
    );
    model.pushStackElement();
    disposable.dispose();
  }
  static _commonPrefix(a, aLen, aDelta, b, bLen, bDelta) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i = 0; i < maxResult && a.getLineContent(aDelta + i) === b.getLineContent(bDelta + i); i++) {
      result++;
    }
    return result;
  }
  static _commonSuffix(a, aLen, aDelta, b, bLen, bDelta) {
    const maxResult = Math.min(aLen, bLen);
    let result = 0;
    for (let i = 0; i < maxResult && a.getLineContent(aDelta + aLen - i) === b.getLineContent(bDelta + bLen - i); i++) {
      result++;
    }
    return result;
  }
  /**
   * Compute edits to bring `model` to the state of `textSource`.
   */
  static _computeEdits(model, textBuffer) {
    const modelLineCount = model.getLineCount();
    const textBufferLineCount = textBuffer.getLineCount();
    const commonPrefix = this._commonPrefix(model, modelLineCount, 1, textBuffer, textBufferLineCount, 1);
    if (modelLineCount === textBufferLineCount && commonPrefix === modelLineCount) {
      return [];
    }
    const commonSuffix = this._commonSuffix(model, modelLineCount - commonPrefix, commonPrefix, textBuffer, textBufferLineCount - commonPrefix, commonPrefix);
    let oldRange;
    let newRange;
    if (commonSuffix > 0) {
      oldRange = new Range(commonPrefix + 1, 1, modelLineCount - commonSuffix + 1, 1);
      newRange = new Range(commonPrefix + 1, 1, textBufferLineCount - commonSuffix + 1, 1);
    } else if (commonPrefix > 0) {
      oldRange = new Range(commonPrefix, model.getLineMaxColumn(commonPrefix), modelLineCount, model.getLineMaxColumn(modelLineCount));
      newRange = new Range(commonPrefix, 1 + textBuffer.getLineLength(commonPrefix), textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
    } else {
      oldRange = new Range(1, 1, modelLineCount, model.getLineMaxColumn(modelLineCount));
      newRange = new Range(1, 1, textBufferLineCount, 1 + textBuffer.getLineLength(textBufferLineCount));
    }
    return [EditOperation.replaceMove(oldRange, textBuffer.getValueInRange(newRange, EndOfLinePreference.TextDefined))];
  }
  createModel(value, languageSelection, resource, isForSimpleWidget = false) {
    let modelData;
    if (languageSelection) {
      modelData = this._createModelData(value, languageSelection, resource, isForSimpleWidget);
    } else {
      modelData = this._createModelData(value, PLAINTEXT_LANGUAGE_ID, resource, isForSimpleWidget);
    }
    this._onModelAdded.fire(modelData.model);
    return modelData.model;
  }
  destroyModel(resource) {
    const modelData = this._models[MODEL_ID(resource)];
    if (!modelData) {
      return;
    }
    modelData.model.dispose();
  }
  getModels() {
    const ret = [];
    const keys = Object.keys(this._models);
    for (let i = 0, len = keys.length; i < len; i++) {
      const modelId = keys[i];
      ret.push(this._models[modelId].model);
    }
    return ret;
  }
  getModel(resource) {
    const modelId = MODEL_ID(resource);
    const modelData = this._models[modelId];
    if (!modelData) {
      return null;
    }
    return modelData.model;
  }
  // --- end IModelService
  _schemaShouldMaintainUndoRedoElements(resource) {
    return resource.scheme === Schemas.file || resource.scheme === Schemas.vscodeRemote || resource.scheme === Schemas.vscodeUserData || resource.scheme === Schemas.vscodeNotebookCell || resource.scheme === "fake-fs";
  }
  _onWillDispose(model) {
    const modelId = MODEL_ID(model.uri);
    const modelData = this._models[modelId];
    const sharesUndoRedoStack = this._undoRedoService.getUriComparisonKey(model.uri) !== model.uri.toString();
    let maintainUndoRedoStack = false;
    let heapSize = 0;
    if (sharesUndoRedoStack || this._shouldRestoreUndoStack() && this._schemaShouldMaintainUndoRedoElements(model.uri)) {
      const elements = this._undoRedoService.getElements(model.uri);
      if (elements.past.length > 0 || elements.future.length > 0) {
        for (const element of elements.past) {
          if (isEditStackElement(element) && element.matchesResource(model.uri)) {
            maintainUndoRedoStack = true;
            heapSize += element.heapSize(model.uri);
            element.setModel(model.uri);
          }
        }
        for (const element of elements.future) {
          if (isEditStackElement(element) && element.matchesResource(model.uri)) {
            maintainUndoRedoStack = true;
            heapSize += element.heapSize(model.uri);
            element.setModel(model.uri);
          }
        }
      }
    }
    const maxMemory = ModelService.MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK;
    const sha1Computer = this._getSHA1Computer();
    if (!maintainUndoRedoStack) {
      if (!sharesUndoRedoStack) {
        const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
        if (initialUndoRedoSnapshot !== null) {
          this._undoRedoService.restoreSnapshot(initialUndoRedoSnapshot);
        }
      }
    } else if (!sharesUndoRedoStack && (heapSize > maxMemory || !sha1Computer.canComputeSHA1(model))) {
      const initialUndoRedoSnapshot = modelData.model.getInitialUndoRedoSnapshot();
      if (initialUndoRedoSnapshot !== null) {
        this._undoRedoService.restoreSnapshot(initialUndoRedoSnapshot);
      }
    } else {
      this._ensureDisposedModelsHeapSize(maxMemory - heapSize);
      this._undoRedoService.setElementsValidFlag(model.uri, false, (element) => isEditStackElement(element) && element.matchesResource(model.uri));
      this._insertDisposedModel(new DisposedModelInfo(model.uri, modelData.model.getInitialUndoRedoSnapshot(), Date.now(), sharesUndoRedoStack, heapSize, sha1Computer.computeSHA1(model), model.getVersionId(), model.getAlternativeVersionId()));
    }
    delete this._models[modelId];
    modelData.dispose();
    delete this._modelCreationOptionsByLanguageAndResource[model.getLanguageId() + model.uri];
    this._onModelRemoved.fire(model);
  }
  _onDidChangeLanguage(model, e) {
    const oldLanguageId = e.oldLanguage;
    const newLanguageId = model.getLanguageId();
    const oldOptions = this.getCreationOptions(oldLanguageId, model.uri, model.isForSimpleWidget);
    const newOptions = this.getCreationOptions(newLanguageId, model.uri, model.isForSimpleWidget);
    ModelService._setModelOptionsForModel(model, newOptions, oldOptions);
    this._onModelModeChanged.fire({ model, oldLanguageId });
  }
  _getSHA1Computer() {
    return new DefaultModelSHA1Computer();
  }
};
ModelService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITextResourcePropertiesService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IInstantiationService)
], ModelService);
class DefaultModelSHA1Computer {
  static {
    __name(this, "DefaultModelSHA1Computer");
  }
  static MAX_MODEL_SIZE = 10 * 1024 * 1024;
  // takes 200ms to compute a sha1 on a 10MB model on a new machine
  canComputeSHA1(model) {
    return model.getValueLength() <= DefaultModelSHA1Computer.MAX_MODEL_SIZE;
  }
  computeSHA1(model) {
    const shaComputer = new StringSHA1();
    const snapshot = model.createSnapshot();
    let text;
    while (text = snapshot.read()) {
      shaComputer.update(text);
    }
    return shaComputer.digest();
  }
}
export {
  DefaultModelSHA1Computer,
  ModelService
};
//# sourceMappingURL=modelService.js.map
