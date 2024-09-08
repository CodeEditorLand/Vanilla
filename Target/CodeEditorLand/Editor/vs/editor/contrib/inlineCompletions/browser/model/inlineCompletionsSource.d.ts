import { Disposable, type IDisposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable, type IReader, type ITransaction } from "../../../../../base/common/observable.js";
import type { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { type InlineCompletionContext } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { type ITextModel } from "../../../../common/model.js";
import type { IFeatureDebounceInformation } from "../../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../../common/services/languageFeatures.js";
import { type InlineCompletionItem, type InlineCompletionProviderResult } from "./provideInlineCompletions.js";
export declare class InlineCompletionsSource extends Disposable {
    private readonly textModel;
    private readonly versionId;
    private readonly _debounceValue;
    private readonly languageFeaturesService;
    private readonly languageConfigurationService;
    private readonly _updateOperation;
    readonly inlineCompletions: import("../../../../../base/common/observable.js").ISettableObservable<UpToDateInlineCompletions | undefined, void> & IDisposable;
    readonly suggestWidgetInlineCompletions: import("../../../../../base/common/observable.js").ISettableObservable<UpToDateInlineCompletions | undefined, void> & IDisposable;
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
    get forwardStable(): boolean;
    private readonly _updatedRange;
    constructor(inlineCompletion: InlineCompletionItem, decorationId: string, _textModel: ITextModel, _modelVersion: IObservable<number | null>);
    toInlineCompletion(reader: IReader | undefined): InlineCompletionItem;
    toSingleTextEdit(reader: IReader | undefined): SingleTextEdit;
    isVisible(model: ITextModel, cursorPosition: Position, reader: IReader | undefined): boolean;
    canBeReused(model: ITextModel, position: Position): boolean;
    private _toFilterTextReplacement;
}
export {};
