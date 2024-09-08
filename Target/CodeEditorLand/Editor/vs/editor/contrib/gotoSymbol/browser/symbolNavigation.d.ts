import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import type { OneReference } from "./referencesModel.js";
export declare const ctxHasSymbols: RawContextKey<false>;
export declare const ISymbolNavigationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISymbolNavigationService>;
export interface ISymbolNavigationService {
    readonly _serviceBrand: undefined;
    reset(): void;
    put(anchor: OneReference): void;
    revealNext(source: ICodeEditor): Promise<any>;
}
