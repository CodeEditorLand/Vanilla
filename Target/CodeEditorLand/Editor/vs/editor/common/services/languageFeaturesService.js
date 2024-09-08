import {
  InstantiationType,
  registerSingleton
} from "../../../platform/instantiation/common/extensions.js";
import {
  LanguageFeatureRegistry
} from "../languageFeatureRegistry.js";
import { ILanguageFeaturesService } from "./languageFeatures.js";
class LanguageFeaturesService {
  referenceProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  renameProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  newSymbolNamesProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  codeActionProvider = new LanguageFeatureRegistry(this._score.bind(this));
  definitionProvider = new LanguageFeatureRegistry(this._score.bind(this));
  typeDefinitionProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  declarationProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  implementationProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentSymbolProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  inlayHintsProvider = new LanguageFeatureRegistry(this._score.bind(this));
  colorProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  codeLensProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentFormattingEditProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentRangeFormattingEditProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  onTypeFormattingEditProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  signatureHelpProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  hoverProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentHighlightProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  multiDocumentHighlightProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  selectionRangeProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  foldingRangeProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  linkProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  inlineCompletionsProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  inlineEditProvider = new LanguageFeatureRegistry(this._score.bind(this));
  completionProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  linkedEditingRangeProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  inlineValuesProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  evaluatableExpressionProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentRangeSemanticTokensProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentSemanticTokensProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentDropEditProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  documentPasteEditProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  mappedEditsProvider = new LanguageFeatureRegistry(
    this._score.bind(this)
  );
  _notebookTypeResolver;
  setNotebookTypeResolver(resolver) {
    this._notebookTypeResolver = resolver;
  }
  _score(uri) {
    return this._notebookTypeResolver?.(uri);
  }
}
registerSingleton(
  ILanguageFeaturesService,
  LanguageFeaturesService,
  InstantiationType.Delayed
);
export {
  LanguageFeaturesService
};
