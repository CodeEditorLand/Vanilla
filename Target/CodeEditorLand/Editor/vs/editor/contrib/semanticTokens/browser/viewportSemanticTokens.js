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
import {
  RunOnceScheduler,
  createCancelablePromise
} from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import {
  ILanguageFeatureDebounceService
} from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { toMultilineTokens2 } from "../../../common/services/semanticTokensProviderStyling.js";
import { ISemanticTokensStylingService } from "../../../common/services/semanticTokensStyling.js";
import {
  getDocumentRangeSemanticTokens,
  hasDocumentRangeSemanticTokensProvider
} from "../common/getSemanticTokens.js";
import {
  SEMANTIC_HIGHLIGHTING_SETTING_ID,
  isSemanticColoringEnabled
} from "../common/semanticTokensConfig.js";
let ViewportSemanticTokensContribution = class extends Disposable {
  constructor(editor, _semanticTokensStylingService, _themeService, _configurationService, languageFeatureDebounceService, languageFeaturesService) {
    super();
    this._semanticTokensStylingService = _semanticTokensStylingService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._editor = editor;
    this._provider = languageFeaturesService.documentRangeSemanticTokensProvider;
    this._debounceInformation = languageFeatureDebounceService.for(this._provider, "DocumentRangeSemanticTokens", { min: 100, max: 500 });
    this._tokenizeViewport = this._register(new RunOnceScheduler(() => this._tokenizeViewportNow(), 100));
    this._outstandingRequests = [];
    const scheduleTokenizeViewport = /* @__PURE__ */ __name(() => {
      if (this._editor.hasModel()) {
        this._tokenizeViewport.schedule(this._debounceInformation.get(this._editor.getModel()));
      }
    }, "scheduleTokenizeViewport");
    this._register(this._editor.onDidScrollChange(() => {
      scheduleTokenizeViewport();
    }));
    this._register(this._editor.onDidChangeModel(() => {
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    this._register(this._editor.onDidChangeModelContent((e) => {
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    this._register(this._provider.onDidChange(() => {
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
        this._cancelAll();
        scheduleTokenizeViewport();
      }
    }));
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._cancelAll();
      scheduleTokenizeViewport();
    }));
    scheduleTokenizeViewport();
  }
  static {
    __name(this, "ViewportSemanticTokensContribution");
  }
  static ID = "editor.contrib.viewportSemanticTokens";
  static get(editor) {
    return editor.getContribution(
      ViewportSemanticTokensContribution.ID
    );
  }
  _editor;
  _provider;
  _debounceInformation;
  _tokenizeViewport;
  _outstandingRequests;
  _cancelAll() {
    for (const request of this._outstandingRequests) {
      request.cancel();
    }
    this._outstandingRequests = [];
  }
  _removeOutstandingRequest(req) {
    for (let i = 0, len = this._outstandingRequests.length; i < len; i++) {
      if (this._outstandingRequests[i] === req) {
        this._outstandingRequests.splice(i, 1);
        return;
      }
    }
  }
  _tokenizeViewportNow() {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    if (model.tokenization.hasCompleteSemanticTokens()) {
      return;
    }
    if (!isSemanticColoringEnabled(
      model,
      this._themeService,
      this._configurationService
    )) {
      if (model.tokenization.hasSomeSemanticTokens()) {
        model.tokenization.setSemanticTokens(null, false);
      }
      return;
    }
    if (!hasDocumentRangeSemanticTokensProvider(this._provider, model)) {
      if (model.tokenization.hasSomeSemanticTokens()) {
        model.tokenization.setSemanticTokens(null, false);
      }
      return;
    }
    const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
    this._outstandingRequests = this._outstandingRequests.concat(
      visibleRanges.map((range) => this._requestRange(model, range))
    );
  }
  _requestRange(model, range) {
    const requestVersionId = model.getVersionId();
    const request = createCancelablePromise(
      (token) => Promise.resolve(
        getDocumentRangeSemanticTokens(
          this._provider,
          model,
          range,
          token
        )
      )
    );
    const sw = new StopWatch(false);
    request.then((r) => {
      this._debounceInformation.update(model, sw.elapsed());
      if (!r || !r.tokens || model.isDisposed() || model.getVersionId() !== requestVersionId) {
        return;
      }
      const { provider, tokens: result } = r;
      const styling = this._semanticTokensStylingService.getStyling(provider);
      model.tokenization.setPartialSemanticTokens(
        range,
        toMultilineTokens2(result, styling, model.getLanguageId())
      );
    }).then(
      () => this._removeOutstandingRequest(request),
      () => this._removeOutstandingRequest(request)
    );
    return request;
  }
};
ViewportSemanticTokensContribution = __decorateClass([
  __decorateParam(1, ISemanticTokensStylingService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILanguageFeatureDebounceService),
  __decorateParam(5, ILanguageFeaturesService)
], ViewportSemanticTokensContribution);
registerEditorContribution(
  ViewportSemanticTokensContribution.ID,
  ViewportSemanticTokensContribution,
  EditorContributionInstantiation.AfterFirstRender
);
export {
  ViewportSemanticTokensContribution
};
//# sourceMappingURL=viewportSemanticTokens.js.map
