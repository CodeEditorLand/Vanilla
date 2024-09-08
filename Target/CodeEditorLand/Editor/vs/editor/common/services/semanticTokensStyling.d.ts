import type { DocumentRangeSemanticTokensProvider, DocumentSemanticTokensProvider } from "../languages.js";
import type { SemanticTokensProviderStyling } from "./semanticTokensProviderStyling.js";
export declare const ISemanticTokensStylingService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISemanticTokensStylingService>;
export type DocumentTokensProvider = DocumentSemanticTokensProvider | DocumentRangeSemanticTokensProvider;
export interface ISemanticTokensStylingService {
    readonly _serviceBrand: undefined;
    getStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
}
