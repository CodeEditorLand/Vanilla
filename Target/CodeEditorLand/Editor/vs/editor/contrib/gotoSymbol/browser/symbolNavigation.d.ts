import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { OneReference } from "vs/editor/contrib/gotoSymbol/browser/referencesModel";
export declare const ctxHasSymbols: any;
export declare const ISymbolNavigationService: any;
export interface ISymbolNavigationService {
    readonly _serviceBrand: undefined;
    reset(): void;
    put(anchor: OneReference): void;
    revealNext(source: ICodeEditor): Promise<any>;
}
