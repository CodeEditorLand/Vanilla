import { CancellationToken } from "../../../../base/common/cancellation.js";
import type { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import type { CodeLens, CodeLensList, CodeLensProvider } from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
export interface CodeLensItem {
    symbol: CodeLens;
    provider: CodeLensProvider;
}
export declare class CodeLensModel {
    lenses: CodeLensItem[];
    private readonly _disposables;
    dispose(): void;
    get isDisposed(): boolean;
    add(list: CodeLensList, provider: CodeLensProvider): void;
}
export declare function getCodeLensModel(registry: LanguageFeatureRegistry<CodeLensProvider>, model: ITextModel, token: CancellationToken): Promise<CodeLensModel>;
