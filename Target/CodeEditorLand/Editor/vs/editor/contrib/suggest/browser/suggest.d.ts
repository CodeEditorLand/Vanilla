import { CancellationToken } from "vs/base/common/cancellation";
import { FuzzyScore } from "vs/base/common/filters";
import { IDisposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { InternalQuickSuggestionsOptions, QuickSuggestionsValue } from "vs/editor/common/config/editorOptions";
import { IPosition, Position } from "vs/editor/common/core/position";
import { StandardTokenType } from "vs/editor/common/encodedTokenAttributes";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import * as languages from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
export declare const Context: {
    Visible: any;
    HasFocusedSuggestion: any;
    DetailsVisible: any;
    MultipleSuggestions: any;
    MakesTextEdit: any;
    AcceptSuggestionsOnEnter: any;
    HasInsertAndReplaceRange: any;
    InsertMode: any;
    CanResolve: any;
};
export declare const suggestWidgetStatusbarMenu: any;
export declare class CompletionItem {
    readonly position: IPosition;
    readonly completion: languages.CompletionItem;
    readonly container: languages.CompletionList;
    readonly provider: languages.CompletionItemProvider;
    _brand: "ISuggestionItem";
    readonly editStart: IPosition;
    readonly editInsertEnd: IPosition;
    readonly editReplaceEnd: IPosition;
    readonly textLabel: string;
    readonly labelLow: string;
    readonly sortTextLow?: string;
    readonly filterTextLow?: string;
    readonly isInvalid: boolean;
    score: FuzzyScore;
    distance: number;
    idx?: number;
    word?: string;
    readonly extensionId?: ExtensionIdentifier;
    private _resolveDuration?;
    private _resolveCache?;
    constructor(position: IPosition, completion: languages.CompletionItem, container: languages.CompletionList, provider: languages.CompletionItemProvider);
    get isResolved(): boolean;
    get resolveDuration(): number;
    resolve(token: CancellationToken): Promise<void>;
}
export declare const enum SnippetSortOrder {
    Top = 0,
    Inline = 1,
    Bottom = 2
}
export declare class CompletionOptions {
    readonly snippetSortOrder: SnippetSortOrder;
    readonly kindFilter: Set<languages.CompletionItemKind>;
    readonly providerFilter: Set<languages.CompletionItemProvider>;
    readonly providerItemsToReuse: ReadonlyMap<languages.CompletionItemProvider, CompletionItem[]>;
    readonly showDeprecated: boolean;
    static readonly default: CompletionOptions;
    constructor(snippetSortOrder?: SnippetSortOrder, kindFilter?: Set<languages.CompletionItemKind>, providerFilter?: Set<languages.CompletionItemProvider>, providerItemsToReuse?: ReadonlyMap<languages.CompletionItemProvider, CompletionItem[]>, showDeprecated?: boolean);
}
export declare function getSnippetSuggestSupport(): languages.CompletionItemProvider;
export declare function setSnippetSuggestSupport(support: languages.CompletionItemProvider): languages.CompletionItemProvider;
export interface CompletionDurationEntry {
    readonly providerName: string;
    readonly elapsedProvider: number;
    readonly elapsedOverall: number;
}
export interface CompletionDurations {
    readonly entries: readonly CompletionDurationEntry[];
    readonly elapsed: number;
}
export declare class CompletionItemModel {
    readonly items: CompletionItem[];
    readonly needsClipboard: boolean;
    readonly durations: CompletionDurations;
    readonly disposable: IDisposable;
    constructor(items: CompletionItem[], needsClipboard: boolean, durations: CompletionDurations, disposable: IDisposable);
}
export declare function provideSuggestionItems(registry: LanguageFeatureRegistry<languages.CompletionItemProvider>, model: ITextModel, position: Position, options?: CompletionOptions, context?: languages.CompletionContext, token?: CancellationToken): Promise<CompletionItemModel>;
export declare function getSuggestionComparator(snippetConfig: SnippetSortOrder): (a: CompletionItem, b: CompletionItem) => number;
export declare function showSimpleSuggestions(editor: ICodeEditor, provider: languages.CompletionItemProvider): void;
export interface ISuggestItemPreselector {
    /**
     * The preselector with highest priority is asked first.
     */
    readonly priority: number;
    /**
     * Is called to preselect a suggest item.
     * When -1 is returned, item preselectors with lower priority are asked.
     */
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number | -1;
}
export declare abstract class QuickSuggestionsOptions {
    static isAllOff(config: InternalQuickSuggestionsOptions): boolean;
    static isAllOn(config: InternalQuickSuggestionsOptions): boolean;
    static valueFor(config: InternalQuickSuggestionsOptions, tokenType: StandardTokenType): QuickSuggestionsValue;
}
