import { CancellationToken } from "vs/base/common/cancellation";
import { IPreparedQuery } from "vs/base/common/fuzzyScorer";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IRange } from "vs/editor/common/core/range";
import { DocumentSymbol, SymbolKind } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IOutlineModelService } from "vs/editor/contrib/documentSymbols/browser/outlineModel";
import { AbstractEditorNavigationQuickAccessProvider, IEditorNavigationQuickAccessOptions, IQuickAccessTextEditorContext } from "vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess";
import { IQuickAccessProviderRunOptions } from "vs/platform/quickinput/common/quickAccess";
import { IQuickPick, IQuickPickItem, IQuickPickSeparator } from "vs/platform/quickinput/common/quickInput";
export interface IGotoSymbolQuickPickItem extends IQuickPickItem {
    kind: SymbolKind;
    index: number;
    score?: number;
    uri?: URI;
    symbolName?: string;
    range?: {
        decoration: IRange;
        selection: IRange;
    };
}
export interface IGotoSymbolQuickAccessProviderOptions extends IEditorNavigationQuickAccessOptions {
    openSideBySideDirection?: () => undefined | "right" | "down";
    /**
     * A handler to invoke when an item is accepted for
     * this particular showing of the quick access.
     * @param item The item that was accepted.
     */
    readonly handleAccept?: (item: IQuickPickItem) => void;
}
export declare abstract class AbstractGotoSymbolQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    private readonly _languageFeaturesService;
    private readonly _outlineModelService;
    static PREFIX: string;
    static SCOPE_PREFIX: string;
    static PREFIX_BY_CATEGORY: string;
    protected readonly options: IGotoSymbolQuickAccessProviderOptions;
    constructor(_languageFeaturesService: ILanguageFeaturesService, _outlineModelService: IOutlineModelService, options?: IGotoSymbolQuickAccessProviderOptions);
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    protected provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IGotoSymbolQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken, runOptions?: IQuickAccessProviderRunOptions): IDisposable;
    private doProvideWithoutEditorSymbols;
    private provideLabelPick;
    protected waitForLanguageSymbolRegistry(model: ITextModel, disposables: DisposableStore): Promise<boolean>;
    private doProvideWithEditorSymbols;
    protected doGetSymbolPicks(symbolsPromise: Promise<DocumentSymbol[]>, query: IPreparedQuery, options: {
        extraContainerLabel?: string;
    } | undefined, token: CancellationToken, model: ITextModel): Promise<Array<IGotoSymbolQuickPickItem | IQuickPickSeparator>>;
    private compareByScore;
    private compareByKindAndScore;
    protected getDocumentSymbols(document: ITextModel, token: CancellationToken): Promise<DocumentSymbol[]>;
}
