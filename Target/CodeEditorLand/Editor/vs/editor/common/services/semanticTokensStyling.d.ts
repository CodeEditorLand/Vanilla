import { DocumentRangeSemanticTokensProvider, DocumentSemanticTokensProvider } from "vs/editor/common/languages";
import { SemanticTokensProviderStyling } from "vs/editor/common/services/semanticTokensProviderStyling";
export declare const ISemanticTokensStylingService: any;
export type DocumentTokensProvider = DocumentSemanticTokensProvider | DocumentRangeSemanticTokensProvider;
export interface ISemanticTokensStylingService {
    readonly _serviceBrand: undefined;
    getStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
}
