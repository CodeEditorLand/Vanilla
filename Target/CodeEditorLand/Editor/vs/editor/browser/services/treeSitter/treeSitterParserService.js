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
import { AppResourcePath, FileAccess, nodeModulesAsarUnpackedPath, nodeModulesPath } from "../../../../base/common/network.js";
import { EDITOR_EXPERIMENTAL_PREFER_TREESITTER, ITreeSitterParserService, ITreeSitterParseResult } from "../../../common/services/treeSitterParserService.js";
import { IModelService } from "../../../common/services/model.js";
import { Disposable, DisposableMap, DisposableStore, dispose, IDisposable } from "../../../../base/common/lifecycle.js";
import { ITextModel } from "../../../common/model.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IModelContentChange } from "../../../common/textModelEvents.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { setTimeout0 } from "../../../../base/common/platform.js";
import { importAMDNodeModule } from "../../../../amdX.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { CancellationToken, cancelOnDispose } from "../../../../base/common/cancellation.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { canASAR } from "../../../../base/common/amd.js";
import { CancellationError, isCancellationError } from "../../../../base/common/errors.js";
import { PromiseResult } from "../../../../base/common/observable.js";
const EDITOR_TREESITTER_TELEMETRY = "editor.experimental.treeSitterTelemetry";
const MODULE_LOCATION_SUBPATH = `@vscode/tree-sitter-wasm/wasm`;
const FILENAME_TREESITTER_WASM = `tree-sitter.wasm`;
function getModuleLocation(environmentService) {
  return `${canASAR && environmentService.isBuilt ? nodeModulesAsarUnpackedPath : nodeModulesPath}/${MODULE_LOCATION_SUBPATH}`;
}
__name(getModuleLocation, "getModuleLocation");
class TextModelTreeSitter extends Disposable {
  constructor(model, _treeSitterLanguages, _treeSitterImporter, _logService, _telemetryService) {
    super();
    this.model = model;
    this._treeSitterLanguages = _treeSitterLanguages;
    this._treeSitterImporter = _treeSitterImporter;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this._register(Event.runAndSubscribe(this.model.onDidChangeLanguage, (e) => this._onDidChangeLanguage(e ? e.newLanguage : this.model.getLanguageId())));
  }
  static {
    __name(this, "TextModelTreeSitter");
  }
  _parseResult;
  get parseResult() {
    return this._parseResult;
  }
  _languageSessionDisposables = this._register(new DisposableStore());
  /**
   * Be very careful when making changes to this method as it is easy to introduce race conditions.
   */
  async _onDidChangeLanguage(languageId) {
    this._languageSessionDisposables.clear();
    this._parseResult = void 0;
    const token = cancelOnDispose(this._languageSessionDisposables);
    let language;
    try {
      language = await this._getLanguage(languageId, token);
    } catch (e) {
      if (isCancellationError(e)) {
        return;
      }
      throw e;
    }
    const Parser = await this._treeSitterImporter.getParserClass();
    if (token.isCancellationRequested) {
      return;
    }
    const treeSitterTree = this._languageSessionDisposables.add(new TreeSitterParseResult(new Parser(), language, this._logService, this._telemetryService));
    this._languageSessionDisposables.add(this.model.onDidChangeContent((e) => this._onDidChangeContent(treeSitterTree, e.changes)));
    await this._onDidChangeContent(treeSitterTree, []);
    if (token.isCancellationRequested) {
      return;
    }
    this._parseResult = treeSitterTree;
  }
  _getLanguage(languageId, token) {
    const language = this._treeSitterLanguages.getOrInitLanguage(languageId);
    if (language) {
      return Promise.resolve(language);
    }
    const disposables = [];
    return new Promise((resolve, reject) => {
      disposables.push(this._treeSitterLanguages.onDidAddLanguage((e) => {
        if (e.id === languageId) {
          dispose(disposables);
          resolve(e.language);
        }
      }));
      token.onCancellationRequested(() => {
        dispose(disposables);
        reject(new CancellationError());
      }, void 0, disposables);
    });
  }
  async _onDidChangeContent(treeSitterTree, changes) {
    return treeSitterTree.onDidChangeContent(this.model, changes);
  }
}
var TelemetryParseType = /* @__PURE__ */ ((TelemetryParseType2) => {
  TelemetryParseType2["Full"] = "fullParse";
  TelemetryParseType2["Incremental"] = "incrementalParse";
  return TelemetryParseType2;
})(TelemetryParseType || {});
class TreeSitterParseResult {
  constructor(parser, language, _logService, _telemetryService) {
    this.parser = parser;
    this.language = language;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this.parser.setTimeoutMicros(50 * 1e3);
    this.parser.setLanguage(language);
  }
  static {
    __name(this, "TreeSitterParseResult");
  }
  _tree;
  _isDisposed = false;
  dispose() {
    this._isDisposed = true;
    this._tree?.delete();
    this.parser?.delete();
  }
  get tree() {
    return this._tree;
  }
  set tree(newTree) {
    this._tree?.delete();
    this._tree = newTree;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  _onDidChangeContentQueue = Promise.resolve();
  async onDidChangeContent(model, changes) {
    this._applyEdits(model, changes);
    this._onDidChangeContentQueue = this._onDidChangeContentQueue.then(() => {
      if (this.isDisposed) {
        return;
      }
      return this._parseAndUpdateTree(model);
    }).catch((e) => {
      this._logService.error("Error parsing tree-sitter tree", e);
    });
    return this._onDidChangeContentQueue;
  }
  _newEdits = true;
  _applyEdits(model, changes) {
    for (const change of changes) {
      const newEndOffset = change.rangeOffset + change.text.length;
      const newEndPosition = model.getPositionAt(newEndOffset);
      this.tree?.edit({
        startIndex: change.rangeOffset,
        oldEndIndex: change.rangeOffset + change.rangeLength,
        newEndIndex: change.rangeOffset + change.text.length,
        startPosition: { row: change.range.startLineNumber - 1, column: change.range.startColumn - 1 },
        oldEndPosition: { row: change.range.endLineNumber - 1, column: change.range.endColumn - 1 },
        newEndPosition: { row: newEndPosition.lineNumber - 1, column: newEndPosition.column - 1 }
      });
      this._newEdits = true;
    }
  }
  async _parseAndUpdateTree(model) {
    const tree = await this._parse(model);
    if (!this._newEdits) {
      this.tree = tree;
    }
  }
  _parse(model) {
    let parseType = "fullParse" /* Full */;
    if (this.tree) {
      parseType = "incrementalParse" /* Incremental */;
    }
    return this._parseAndYield(model, parseType);
  }
  async _parseAndYield(model, parseType) {
    const language = model.getLanguageId();
    let tree;
    let time = 0;
    let passes = 0;
    this._newEdits = false;
    do {
      const timer = performance.now();
      try {
        tree = this.parser.parse((index, position) => this._parseCallback(model, index), this.tree);
      } catch (e) {
      } finally {
        time += performance.now() - timer;
        passes++;
      }
      await new Promise((resolve) => setTimeout0(resolve));
      if (model.isDisposed() || this.isDisposed) {
        return;
      }
    } while (!tree && !this._newEdits);
    this.sendParseTimeTelemetry(parseType, language, time, passes);
    return tree;
  }
  _parseCallback(textModel, index) {
    try {
      return textModel.getTextBuffer().getNearestChunk(index);
    } catch (e) {
      this._logService.debug("Error getting chunk for tree-sitter parsing", e);
    }
    return null;
  }
  sendParseTimeTelemetry(parseType, languageId, time, passes) {
    this._logService.debug(`Tree parsing (${parseType}) took ${time} ms and ${passes} passes.`);
    if (parseType === "fullParse" /* Full */) {
      this._telemetryService.publicLog2(`treeSitter.fullParse`, { languageId, time, passes });
    } else {
      this._telemetryService.publicLog2(`treeSitter.incrementalParse`, { languageId, time, passes });
    }
  }
}
class TreeSitterLanguages extends Disposable {
  constructor(_treeSitterImporter, _fileService, _environmentService, _registeredLanguages) {
    super();
    this._treeSitterImporter = _treeSitterImporter;
    this._fileService = _fileService;
    this._environmentService = _environmentService;
    this._registeredLanguages = _registeredLanguages;
  }
  static {
    __name(this, "TreeSitterLanguages");
  }
  _languages = new AsyncCache();
  _onDidAddLanguage = this._register(new Emitter());
  /**
   * If you're looking for a specific language, make sure to check if it already exists with `getLanguage` as it will kick off the process to add it if it doesn't exist.
   */
  onDidAddLanguage = this._onDidAddLanguage.event;
  getOrInitLanguage(languageId) {
    if (this._languages.isCached(languageId)) {
      return this._languages.getSyncIfCached(languageId);
    } else {
      this._addLanguage(languageId);
      return void 0;
    }
  }
  async _addLanguage(languageId) {
    const languagePromise = this._languages.get(languageId);
    if (!languagePromise) {
      this._languages.set(languageId, this._fetchLanguage(languageId));
      const language = await this._languages.get(languageId);
      if (!language) {
        return void 0;
      }
      this._onDidAddLanguage.fire({ id: languageId, language });
    }
  }
  async _fetchLanguage(languageId) {
    const grammarName = this._registeredLanguages.get(languageId);
    const languageLocation = this._getLanguageLocation(languageId);
    if (!grammarName || !languageLocation) {
      return void 0;
    }
    const wasmPath = `${languageLocation}/${grammarName}.wasm`;
    const languageFile = await this._fileService.readFile(FileAccess.asFileUri(wasmPath));
    const Parser = await this._treeSitterImporter.getParserClass();
    return Parser.Language.load(languageFile.value.buffer);
  }
  _getLanguageLocation(languageId) {
    const grammarName = this._registeredLanguages.get(languageId);
    if (!grammarName) {
      return void 0;
    }
    return getModuleLocation(this._environmentService);
  }
}
class TreeSitterImporter {
  static {
    __name(this, "TreeSitterImporter");
  }
  _treeSitterImport;
  async _getTreeSitterImport() {
    if (!this._treeSitterImport) {
      this._treeSitterImport = await importAMDNodeModule("@vscode/tree-sitter-wasm", "wasm/tree-sitter.js");
    }
    return this._treeSitterImport;
  }
  _parserClass;
  async getParserClass() {
    if (!this._parserClass) {
      this._parserClass = (await this._getTreeSitterImport()).Parser;
    }
    return this._parserClass;
  }
}
let TreeSitterTextModelService = class extends Disposable {
  constructor(_modelService, fileService, _telemetryService, _logService, _configurationService, _environmentService) {
    super();
    this._modelService = _modelService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._treeSitterLanguages = this._register(new TreeSitterLanguages(this._treeSitterImporter, fileService, this._environmentService, this._registeredLanguages));
    this.onDidAddLanguage = this._treeSitterLanguages.onDidAddLanguage;
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EDITOR_EXPERIMENTAL_PREFER_TREESITTER)) {
        this._supportedLanguagesChanged();
      }
    }));
    this._supportedLanguagesChanged();
  }
  static {
    __name(this, "TreeSitterTextModelService");
  }
  _serviceBrand;
  _init;
  _textModelTreeSitters = this._register(new DisposableMap());
  _registeredLanguages = /* @__PURE__ */ new Map();
  _treeSitterImporter = new TreeSitterImporter();
  _treeSitterLanguages;
  onDidAddLanguage;
  getOrInitLanguage(languageId) {
    return this._treeSitterLanguages.getOrInitLanguage(languageId);
  }
  getParseResult(textModel) {
    const textModelTreeSitter = this._textModelTreeSitters.get(textModel);
    return textModelTreeSitter?.parseResult;
  }
  async _doInitParser() {
    const Parser = await this._treeSitterImporter.getParserClass();
    const environmentService = this._environmentService;
    await Parser.init({
      locateFile(_file, _folder) {
        return FileAccess.asBrowserUri(`${getModuleLocation(environmentService)}/${FILENAME_TREESITTER_WASM}`).toString(true);
      }
    });
    return true;
  }
  _hasInit = false;
  async _initParser(hasLanguages) {
    if (this._hasInit) {
      return this._init;
    }
    if (hasLanguages) {
      this._hasInit = true;
      this._init = this._doInitParser();
      this._init.then(() => this._registerModelServiceListeners());
    } else {
      this._init = Promise.resolve(false);
    }
    return this._init;
  }
  async _supportedLanguagesChanged() {
    const setting = this._getSetting();
    let hasLanguages = true;
    if (setting.length === 0) {
      hasLanguages = false;
    }
    if (await this._initParser(hasLanguages)) {
      if (setting.includes("typescript")) {
        this._addGrammar("typescript", "tree-sitter-typescript");
      } else {
        this._removeGrammar("typescript");
      }
    }
  }
  _getSetting() {
    const setting = this._configurationService.getValue(EDITOR_EXPERIMENTAL_PREFER_TREESITTER);
    if (setting && setting.length > 0) {
      return setting;
    } else {
      const expSetting = this._configurationService.getValue(EDITOR_TREESITTER_TELEMETRY);
      if (expSetting) {
        return ["typescript"];
      }
    }
    return [];
  }
  async _registerModelServiceListeners() {
    this._register(this._modelService.onModelAdded((model) => {
      this._createTextModelTreeSitter(model);
    }));
    this._register(this._modelService.onModelRemoved((model) => {
      this._textModelTreeSitters.deleteAndDispose(model);
    }));
    this._modelService.getModels().forEach((model) => this._createTextModelTreeSitter(model));
  }
  _createTextModelTreeSitter(model) {
    const textModelTreeSitter = new TextModelTreeSitter(model, this._treeSitterLanguages, this._treeSitterImporter, this._logService, this._telemetryService);
    this._textModelTreeSitters.set(model, textModelTreeSitter);
  }
  _addGrammar(languageId, grammarName) {
    if (!this._registeredLanguages.has(languageId)) {
      this._registeredLanguages.set(languageId, grammarName);
    }
  }
  _removeGrammar(languageId) {
    if (this._registeredLanguages.has(languageId)) {
      this._registeredLanguages.delete("typescript");
    }
  }
};
TreeSitterTextModelService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IEnvironmentService)
], TreeSitterTextModelService);
class PromiseWithSyncAccess {
  constructor(promise) {
    this.promise = promise;
    promise.then((result) => {
      this._result = new PromiseResult(result, void 0);
    }).catch((e) => {
      this._result = new PromiseResult(void 0, e);
    });
  }
  static {
    __name(this, "PromiseWithSyncAccess");
  }
  _result;
  /**
   * Returns undefined if the promise did not resolve yet.
   */
  get result() {
    return this._result;
  }
}
class AsyncCache {
  static {
    __name(this, "AsyncCache");
  }
  _values = /* @__PURE__ */ new Map();
  set(key, promise) {
    this._values.set(key, new PromiseWithSyncAccess(promise));
  }
  get(key) {
    return this._values.get(key)?.promise;
  }
  getSyncIfCached(key) {
    return this._values.get(key)?.result?.data;
  }
  isCached(key) {
    return this._values.get(key)?.result !== void 0;
  }
}
export {
  TextModelTreeSitter,
  TreeSitterImporter,
  TreeSitterLanguages,
  TreeSitterParseResult,
  TreeSitterTextModelService
};
//# sourceMappingURL=treeSitterParserService.js.map
