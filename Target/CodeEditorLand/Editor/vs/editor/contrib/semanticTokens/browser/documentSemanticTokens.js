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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import * as errors from "../../../../base/common/errors.js";
import {
  Disposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { registerEditorFeature } from "../../../common/editorFeatures.js";
import {
  ILanguageFeatureDebounceService
} from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import {
  toMultilineTokens2
} from "../../../common/services/semanticTokensProviderStyling.js";
import { ISemanticTokensStylingService } from "../../../common/services/semanticTokensStyling.js";
import {
  getDocumentSemanticTokens,
  hasDocumentSemanticTokensProvider,
  isSemanticTokens,
  isSemanticTokensEdits
} from "../common/getSemanticTokens.js";
import {
  SEMANTIC_HIGHLIGHTING_SETTING_ID,
  isSemanticColoringEnabled
} from "../common/semanticTokensConfig.js";
let DocumentSemanticTokensFeature = class extends Disposable {
  _watchers;
  constructor(semanticTokensStylingService, modelService, themeService, configurationService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this._watchers = /* @__PURE__ */ Object.create(null);
    const register = (model) => {
      this._watchers[model.uri.toString()] = new ModelSemanticColoring(
        model,
        semanticTokensStylingService,
        themeService,
        languageFeatureDebounceService,
        languageFeaturesService
      );
    };
    const deregister = (model, modelSemanticColoring) => {
      modelSemanticColoring.dispose();
      delete this._watchers[model.uri.toString()];
    };
    const handleSettingOrThemeChange = () => {
      for (const model of modelService.getModels()) {
        const curr = this._watchers[model.uri.toString()];
        if (isSemanticColoringEnabled(
          model,
          themeService,
          configurationService
        )) {
          if (!curr) {
            register(model);
          }
        } else if (curr) {
          deregister(model, curr);
        }
      }
    };
    modelService.getModels().forEach((model) => {
      if (isSemanticColoringEnabled(
        model,
        themeService,
        configurationService
      )) {
        register(model);
      }
    });
    this._register(
      modelService.onModelAdded((model) => {
        if (isSemanticColoringEnabled(
          model,
          themeService,
          configurationService
        )) {
          register(model);
        }
      })
    );
    this._register(
      modelService.onModelRemoved((model) => {
        const curr = this._watchers[model.uri.toString()];
        if (curr) {
          deregister(model, curr);
        }
      })
    );
    this._register(
      configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
          handleSettingOrThemeChange();
        }
      })
    );
    this._register(
      themeService.onDidColorThemeChange(handleSettingOrThemeChange)
    );
  }
  dispose() {
    for (const watcher of Object.values(this._watchers)) {
      watcher.dispose();
    }
    super.dispose();
  }
};
DocumentSemanticTokensFeature = __decorateClass([
  __decorateParam(0, ISemanticTokensStylingService),
  __decorateParam(1, IModelService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageFeatureDebounceService),
  __decorateParam(5, ILanguageFeaturesService)
], DocumentSemanticTokensFeature);
let ModelSemanticColoring = class extends Disposable {
  constructor(model, _semanticTokensStylingService, themeService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this._semanticTokensStylingService = _semanticTokensStylingService;
    this._isDisposed = false;
    this._model = model;
    this._provider = languageFeaturesService.documentSemanticTokensProvider;
    this._debounceInformation = languageFeatureDebounceService.for(this._provider, "DocumentSemanticTokens", { min: ModelSemanticColoring.REQUEST_MIN_DELAY, max: ModelSemanticColoring.REQUEST_MAX_DELAY });
    this._fetchDocumentSemanticTokens = this._register(new RunOnceScheduler(() => this._fetchDocumentSemanticTokensNow(), ModelSemanticColoring.REQUEST_MIN_DELAY));
    this._currentDocumentResponse = null;
    this._currentDocumentRequestCancellationTokenSource = null;
    this._documentProvidersChangeListeners = [];
    this._providersChangedDuringRequest = false;
    this._register(this._model.onDidChangeContent(() => {
      if (!this._fetchDocumentSemanticTokens.isScheduled()) {
        this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
      }
    }));
    this._register(this._model.onDidChangeAttached(() => {
      if (!this._fetchDocumentSemanticTokens.isScheduled()) {
        this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
      }
    }));
    this._register(this._model.onDidChangeLanguage(() => {
      if (this._currentDocumentResponse) {
        this._currentDocumentResponse.dispose();
        this._currentDocumentResponse = null;
      }
      if (this._currentDocumentRequestCancellationTokenSource) {
        this._currentDocumentRequestCancellationTokenSource.cancel();
        this._currentDocumentRequestCancellationTokenSource = null;
      }
      this._setDocumentSemanticTokens(null, null, null, []);
      this._fetchDocumentSemanticTokens.schedule(0);
    }));
    const bindDocumentChangeListeners = () => {
      dispose(this._documentProvidersChangeListeners);
      this._documentProvidersChangeListeners = [];
      for (const provider of this._provider.all(model)) {
        if (typeof provider.onDidChange === "function") {
          this._documentProvidersChangeListeners.push(provider.onDidChange(() => {
            if (this._currentDocumentRequestCancellationTokenSource) {
              this._providersChangedDuringRequest = true;
              return;
            }
            this._fetchDocumentSemanticTokens.schedule(0);
          }));
        }
      }
    };
    bindDocumentChangeListeners();
    this._register(this._provider.onDidChange(() => {
      bindDocumentChangeListeners();
      this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
    }));
    this._register(themeService.onDidColorThemeChange((_) => {
      this._setDocumentSemanticTokens(null, null, null, []);
      this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
    }));
    this._fetchDocumentSemanticTokens.schedule(0);
  }
  static REQUEST_MIN_DELAY = 300;
  static REQUEST_MAX_DELAY = 2e3;
  _isDisposed;
  _model;
  _provider;
  _debounceInformation;
  _fetchDocumentSemanticTokens;
  _currentDocumentResponse;
  _currentDocumentRequestCancellationTokenSource;
  _documentProvidersChangeListeners;
  _providersChangedDuringRequest;
  dispose() {
    if (this._currentDocumentResponse) {
      this._currentDocumentResponse.dispose();
      this._currentDocumentResponse = null;
    }
    if (this._currentDocumentRequestCancellationTokenSource) {
      this._currentDocumentRequestCancellationTokenSource.cancel();
      this._currentDocumentRequestCancellationTokenSource = null;
    }
    dispose(this._documentProvidersChangeListeners);
    this._documentProvidersChangeListeners = [];
    this._setDocumentSemanticTokens(null, null, null, []);
    this._isDisposed = true;
    super.dispose();
  }
  _fetchDocumentSemanticTokensNow() {
    if (this._currentDocumentRequestCancellationTokenSource) {
      return;
    }
    if (!hasDocumentSemanticTokensProvider(this._provider, this._model)) {
      if (this._currentDocumentResponse) {
        this._model.tokenization.setSemanticTokens(null, false);
      }
      return;
    }
    if (!this._model.isAttachedToEditor()) {
      return;
    }
    const cancellationTokenSource = new CancellationTokenSource();
    const lastProvider = this._currentDocumentResponse ? this._currentDocumentResponse.provider : null;
    const lastResultId = this._currentDocumentResponse ? this._currentDocumentResponse.resultId || null : null;
    const request = getDocumentSemanticTokens(
      this._provider,
      this._model,
      lastProvider,
      lastResultId,
      cancellationTokenSource.token
    );
    this._currentDocumentRequestCancellationTokenSource = cancellationTokenSource;
    this._providersChangedDuringRequest = false;
    const pendingChanges = [];
    const contentChangeListener = this._model.onDidChangeContent((e) => {
      pendingChanges.push(e);
    });
    const sw = new StopWatch(false);
    request.then(
      (res) => {
        this._debounceInformation.update(this._model, sw.elapsed());
        this._currentDocumentRequestCancellationTokenSource = null;
        contentChangeListener.dispose();
        if (res) {
          const { provider, tokens } = res;
          const styling = this._semanticTokensStylingService.getStyling(provider);
          this._setDocumentSemanticTokens(
            provider,
            tokens || null,
            styling,
            pendingChanges
          );
        } else {
          this._setDocumentSemanticTokens(
            null,
            null,
            null,
            pendingChanges
          );
        }
      },
      (err) => {
        const isExpectedError = err && (errors.isCancellationError(err) || typeof err.message === "string" && err.message.indexOf("busy") !== -1);
        if (!isExpectedError) {
          errors.onUnexpectedError(err);
        }
        this._currentDocumentRequestCancellationTokenSource = null;
        contentChangeListener.dispose();
        if (pendingChanges.length > 0 || this._providersChangedDuringRequest) {
          if (!this._fetchDocumentSemanticTokens.isScheduled()) {
            this._fetchDocumentSemanticTokens.schedule(
              this._debounceInformation.get(this._model)
            );
          }
        }
      }
    );
  }
  static _copy(src, srcOffset, dest, destOffset, length) {
    length = Math.min(
      length,
      dest.length - destOffset,
      src.length - srcOffset
    );
    for (let i = 0; i < length; i++) {
      dest[destOffset + i] = src[srcOffset + i];
    }
  }
  _setDocumentSemanticTokens(provider, tokens, styling, pendingChanges) {
    const currentResponse = this._currentDocumentResponse;
    const rescheduleIfNeeded = () => {
      if ((pendingChanges.length > 0 || this._providersChangedDuringRequest) && !this._fetchDocumentSemanticTokens.isScheduled()) {
        this._fetchDocumentSemanticTokens.schedule(
          this._debounceInformation.get(this._model)
        );
      }
    };
    if (this._currentDocumentResponse) {
      this._currentDocumentResponse.dispose();
      this._currentDocumentResponse = null;
    }
    if (this._isDisposed) {
      if (provider && tokens) {
        provider.releaseDocumentSemanticTokens(tokens.resultId);
      }
      return;
    }
    if (!provider || !styling) {
      this._model.tokenization.setSemanticTokens(null, false);
      return;
    }
    if (!tokens) {
      this._model.tokenization.setSemanticTokens(null, true);
      rescheduleIfNeeded();
      return;
    }
    if (isSemanticTokensEdits(tokens)) {
      if (!currentResponse) {
        this._model.tokenization.setSemanticTokens(null, true);
        return;
      }
      if (tokens.edits.length === 0) {
        tokens = {
          resultId: tokens.resultId,
          data: currentResponse.data
        };
      } else {
        let deltaLength = 0;
        for (const edit of tokens.edits) {
          deltaLength += (edit.data ? edit.data.length : 0) - edit.deleteCount;
        }
        const srcData = currentResponse.data;
        const destData = new Uint32Array(srcData.length + deltaLength);
        let srcLastStart = srcData.length;
        let destLastStart = destData.length;
        for (let i = tokens.edits.length - 1; i >= 0; i--) {
          const edit = tokens.edits[i];
          if (edit.start > srcData.length) {
            styling.warnInvalidEditStart(
              currentResponse.resultId,
              tokens.resultId,
              i,
              edit.start,
              srcData.length
            );
            this._model.tokenization.setSemanticTokens(null, true);
            return;
          }
          const copyCount = srcLastStart - (edit.start + edit.deleteCount);
          if (copyCount > 0) {
            ModelSemanticColoring._copy(
              srcData,
              srcLastStart - copyCount,
              destData,
              destLastStart - copyCount,
              copyCount
            );
            destLastStart -= copyCount;
          }
          if (edit.data) {
            ModelSemanticColoring._copy(
              edit.data,
              0,
              destData,
              destLastStart - edit.data.length,
              edit.data.length
            );
            destLastStart -= edit.data.length;
          }
          srcLastStart = edit.start;
        }
        if (srcLastStart > 0) {
          ModelSemanticColoring._copy(
            srcData,
            0,
            destData,
            0,
            srcLastStart
          );
        }
        tokens = {
          resultId: tokens.resultId,
          data: destData
        };
      }
    }
    if (isSemanticTokens(tokens)) {
      this._currentDocumentResponse = new SemanticTokensResponse(
        provider,
        tokens.resultId,
        tokens.data
      );
      const result = toMultilineTokens2(
        tokens,
        styling,
        this._model.getLanguageId()
      );
      if (pendingChanges.length > 0) {
        for (const change of pendingChanges) {
          for (const area of result) {
            for (const singleChange of change.changes) {
              area.applyEdit(
                singleChange.range,
                singleChange.text
              );
            }
          }
        }
      }
      this._model.tokenization.setSemanticTokens(result, true);
    } else {
      this._model.tokenization.setSemanticTokens(null, true);
    }
    rescheduleIfNeeded();
  }
};
ModelSemanticColoring = __decorateClass([
  __decorateParam(1, ISemanticTokensStylingService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ILanguageFeatureDebounceService),
  __decorateParam(4, ILanguageFeaturesService)
], ModelSemanticColoring);
class SemanticTokensResponse {
  constructor(provider, resultId, data) {
    this.provider = provider;
    this.resultId = resultId;
    this.data = data;
  }
  dispose() {
    this.provider.releaseDocumentSemanticTokens(this.resultId);
  }
}
registerEditorFeature(DocumentSemanticTokensFeature);
export {
  DocumentSemanticTokensFeature
};
