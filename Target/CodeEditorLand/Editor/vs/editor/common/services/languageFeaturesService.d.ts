import { LanguageFeatureRegistry, NotebookInfoResolver } from "vs/editor/common/languageFeatureRegistry";
import { MappedEditsProvider } from "vs/editor/common/languages";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
export declare class LanguageFeaturesService implements ILanguageFeaturesService {
    _serviceBrand: undefined;
    readonly referenceProvider: any;
    readonly renameProvider: any;
    readonly newSymbolNamesProvider: any;
    readonly codeActionProvider: any;
    readonly definitionProvider: any;
    readonly typeDefinitionProvider: any;
    readonly declarationProvider: any;
    readonly implementationProvider: any;
    readonly documentSymbolProvider: any;
    readonly inlayHintsProvider: any;
    readonly colorProvider: any;
    readonly codeLensProvider: any;
    readonly documentFormattingEditProvider: any;
    readonly documentRangeFormattingEditProvider: any;
    readonly onTypeFormattingEditProvider: any;
    readonly signatureHelpProvider: any;
    readonly hoverProvider: any;
    readonly documentHighlightProvider: any;
    readonly multiDocumentHighlightProvider: any;
    readonly selectionRangeProvider: any;
    readonly foldingRangeProvider: any;
    readonly linkProvider: any;
    readonly inlineCompletionsProvider: any;
    readonly inlineEditProvider: any;
    readonly completionProvider: any;
    readonly linkedEditingRangeProvider: any;
    readonly inlineValuesProvider: any;
    readonly evaluatableExpressionProvider: any;
    readonly documentRangeSemanticTokensProvider: any;
    readonly documentSemanticTokensProvider: any;
    readonly documentDropEditProvider: any;
    readonly documentPasteEditProvider: any;
    readonly mappedEditsProvider: LanguageFeatureRegistry<MappedEditsProvider>;
    private _notebookTypeResolver?;
    setNotebookTypeResolver(resolver: NotebookInfoResolver | undefined): void;
    private _score;
}
