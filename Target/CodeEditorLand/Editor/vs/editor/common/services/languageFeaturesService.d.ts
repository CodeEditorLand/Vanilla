import { LanguageFeatureRegistry, NotebookInfoResolver } from "../languageFeatureRegistry.js";
import { CodeActionProvider, CodeLensProvider, CompletionItemProvider, DeclarationProvider, DefinitionProvider, DocumentColorProvider, DocumentDropEditProvider, DocumentFormattingEditProvider, DocumentHighlightProvider, DocumentPasteEditProvider, DocumentRangeFormattingEditProvider, DocumentRangeSemanticTokensProvider, DocumentSemanticTokensProvider, DocumentSymbolProvider, EvaluatableExpressionProvider, FoldingRangeProvider, HoverProvider, ImplementationProvider, InlayHintsProvider, InlineCompletionsProvider, InlineEditProvider, InlineValuesProvider, LinkedEditingRangeProvider, LinkProvider, MappedEditsProvider, MultiDocumentHighlightProvider, NewSymbolNamesProvider, OnTypeFormattingEditProvider, ReferenceProvider, RenameProvider, SelectionRangeProvider, SignatureHelpProvider, TypeDefinitionProvider } from "../languages.js";
import { ILanguageFeaturesService } from "./languageFeatures.js";
export declare class LanguageFeaturesService implements ILanguageFeaturesService {
    _serviceBrand: undefined;
    readonly referenceProvider: LanguageFeatureRegistry<ReferenceProvider>;
    readonly renameProvider: LanguageFeatureRegistry<RenameProvider>;
    readonly newSymbolNamesProvider: LanguageFeatureRegistry<NewSymbolNamesProvider>;
    readonly codeActionProvider: LanguageFeatureRegistry<CodeActionProvider>;
    readonly definitionProvider: LanguageFeatureRegistry<DefinitionProvider>;
    readonly typeDefinitionProvider: LanguageFeatureRegistry<TypeDefinitionProvider>;
    readonly declarationProvider: LanguageFeatureRegistry<DeclarationProvider>;
    readonly implementationProvider: LanguageFeatureRegistry<ImplementationProvider>;
    readonly documentSymbolProvider: LanguageFeatureRegistry<DocumentSymbolProvider>;
    readonly inlayHintsProvider: LanguageFeatureRegistry<InlayHintsProvider>;
    readonly colorProvider: LanguageFeatureRegistry<DocumentColorProvider>;
    readonly codeLensProvider: LanguageFeatureRegistry<CodeLensProvider>;
    readonly documentFormattingEditProvider: LanguageFeatureRegistry<DocumentFormattingEditProvider>;
    readonly documentRangeFormattingEditProvider: LanguageFeatureRegistry<DocumentRangeFormattingEditProvider>;
    readonly onTypeFormattingEditProvider: LanguageFeatureRegistry<OnTypeFormattingEditProvider>;
    readonly signatureHelpProvider: LanguageFeatureRegistry<SignatureHelpProvider>;
    readonly hoverProvider: LanguageFeatureRegistry<HoverProvider<import("../languages.js").Hover>>;
    readonly documentHighlightProvider: LanguageFeatureRegistry<DocumentHighlightProvider>;
    readonly multiDocumentHighlightProvider: LanguageFeatureRegistry<MultiDocumentHighlightProvider>;
    readonly selectionRangeProvider: LanguageFeatureRegistry<SelectionRangeProvider>;
    readonly foldingRangeProvider: LanguageFeatureRegistry<FoldingRangeProvider>;
    readonly linkProvider: LanguageFeatureRegistry<LinkProvider>;
    readonly inlineCompletionsProvider: LanguageFeatureRegistry<InlineCompletionsProvider<import("../languages.js").InlineCompletions<import("../languages.js").InlineCompletion>>>;
    readonly inlineEditProvider: LanguageFeatureRegistry<InlineEditProvider<import("../languages.js").IInlineEdit>>;
    readonly completionProvider: LanguageFeatureRegistry<CompletionItemProvider>;
    readonly linkedEditingRangeProvider: LanguageFeatureRegistry<LinkedEditingRangeProvider>;
    readonly inlineValuesProvider: LanguageFeatureRegistry<InlineValuesProvider>;
    readonly evaluatableExpressionProvider: LanguageFeatureRegistry<EvaluatableExpressionProvider>;
    readonly documentRangeSemanticTokensProvider: LanguageFeatureRegistry<DocumentRangeSemanticTokensProvider>;
    readonly documentSemanticTokensProvider: LanguageFeatureRegistry<DocumentSemanticTokensProvider>;
    readonly documentDropEditProvider: LanguageFeatureRegistry<DocumentDropEditProvider>;
    readonly documentPasteEditProvider: LanguageFeatureRegistry<DocumentPasteEditProvider>;
    readonly mappedEditsProvider: LanguageFeatureRegistry<MappedEditsProvider>;
    private _notebookTypeResolver?;
    setNotebookTypeResolver(resolver: NotebookInfoResolver | undefined): void;
    private _score;
}
