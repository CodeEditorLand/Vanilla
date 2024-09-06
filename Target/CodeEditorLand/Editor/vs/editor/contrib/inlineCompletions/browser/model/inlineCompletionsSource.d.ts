import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IObservable, IReader, ITransaction } from "vs/base/common/observable";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { SingleTextEdit } from "vs/editor/common/core/textEdit";
import { InlineCompletionContext } from "vs/editor/common/languages";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModel } from "vs/editor/common/model";
import { IFeatureDebounceInformation } from "vs/editor/common/services/languageFeatureDebounce";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { InlineCompletionItem, InlineCompletionProviderResult } from "vs/editor/contrib/inlineCompletions/browser/model/provideInlineCompletions";
export declare class InlineCompletionsSource extends Disposable {
    private readonly textModel;
    private readonly versionId;
    private readonly _debounceValue;
    private readonly languageFeaturesService;
    private readonly languageConfigurationService;
    private readonly _updateOperation;
    readonly inlineCompletions: any;
    readonly suggestWidgetInlineCompletions: any;
    constructor(textModel: ITextModel, versionId: IObservable<number | null>, _debounceValue: IFeatureDebounceInformation, languageFeaturesService: ILanguageFeaturesService, languageConfigurationService: ILanguageConfigurationService);
    fetch(position: Position, context: InlineCompletionContext, activeInlineCompletion: InlineCompletionWithUpdatedRange | undefined): Promise<boolean>;
    clear(tx: ITransaction): void;
    clearSuggestWidgetInlineCompletions(tx: ITransaction): void;
    cancelUpdate(): void;
}
declare class UpdateRequest {
    readonly position: Position;
    readonly context: InlineCompletionContext;
    readonly versionId: number;
    constructor(position: Position, context: InlineCompletionContext, versionId: number);
    satisfies(other: UpdateRequest): boolean;
}
export declare class UpToDateInlineCompletions implements IDisposable {
    private readonly inlineCompletionProviderResult;
    readonly request: UpdateRequest;
    private readonly _textModel;
    private readonly _versionId;
    private readonly _inlineCompletions;
    get inlineCompletions(): ReadonlyArray<InlineCompletionWithUpdatedRange>;
    private _refCount;
    private readonly _prependedInlineCompletionItems;
    constructor(inlineCompletionProviderResult: InlineCompletionProviderResult, request: UpdateRequest, _textModel: ITextModel, _versionId: IObservable<number | null>);
    clone(): this;
    dispose(): void;
    prepend(inlineCompletion: InlineCompletionItem, range: Range, addRefToSource: boolean): void;
}
export declare class InlineCompletionWithUpdatedRange {
    readonly inlineCompletion: InlineCompletionItem;
    readonly decorationId: string;
    private readonly _textModel;
    private readonly _modelVersion;
    readonly semanticId: string;
    get forwardStable(): any;
    private readonly _updatedRange;
    constructor(inlineCompletion: InlineCompletionItem, decorationId: string, _textModel: ITextModel, _modelVersion: IObservable<number | null>);
    toInlineCompletion(reader: IReader | undefined): InlineCompletionItem;
    toSingleTextEdit(reader: IReader | undefined): SingleTextEdit;
    isVisible(model: ITextModel, cursorPosition: Position, reader: IReader | undefined): boolean;
    canBeReused(model: ITextModel, position: Position): boolean;
    private _toFilterTextReplacement;
}
export {};
