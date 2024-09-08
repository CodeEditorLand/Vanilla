import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type IObservable, type ITransaction } from "../../../../../base/common/observable.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import type { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { Position } from "../../../../common/core/position.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import { type Command, InlineCompletionTriggerKind } from "../../../../common/languages.js";
import { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import { type ITextModel } from "../../../../common/model.js";
import type { IFeatureDebounceInformation } from "../../../../common/services/languageFeatureDebounce.js";
import type { IModelContentChangedEvent } from "../../../../common/textModelEvents.js";
import { type GhostTextOrReplacement } from "./ghostText.js";
import { type InlineCompletionWithUpdatedRange } from "./inlineCompletionsSource.js";
import type { SuggestItemInfo } from "./suggestWidgetAdaptor.js";
export declare class InlineCompletionsModel extends Disposable {
    readonly textModel: ITextModel;
    readonly selectedSuggestItem: IObservable<SuggestItemInfo | undefined>;
    readonly _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>;
    private readonly _positions;
    private readonly _debounceValue;
    private readonly _suggestPreviewEnabled;
    private readonly _suggestPreviewMode;
    private readonly _inlineSuggestMode;
    private readonly _enabled;
    private readonly _instantiationService;
    private readonly _commandService;
    private readonly _languageConfigurationService;
    private readonly _source;
    private readonly _isActive;
    private readonly _forceUpdateExplicitlySignal;
    private readonly _selectedInlineCompletionId;
    private readonly _primaryPosition;
    private _isAcceptingPartially;
    get isAcceptingPartially(): boolean;
    constructor(textModel: ITextModel, selectedSuggestItem: IObservable<SuggestItemInfo | undefined>, _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>, _positions: IObservable<readonly Position[]>, _debounceValue: IFeatureDebounceInformation, _suggestPreviewEnabled: IObservable<boolean>, _suggestPreviewMode: IObservable<'prefix' | 'subword' | 'subwordSmart'>, _inlineSuggestMode: IObservable<'prefix' | 'subword' | 'subwordSmart'>, _enabled: IObservable<boolean>, _instantiationService: IInstantiationService, _commandService: ICommandService, _languageConfigurationService: ILanguageConfigurationService);
    private readonly _preserveCurrentCompletionReasons;
    private _getReason;
    private readonly _fetchInlineCompletionsPromise;
    trigger(tx?: ITransaction): Promise<void>;
    triggerExplicitly(tx?: ITransaction): Promise<void>;
    stop(tx?: ITransaction): void;
    private readonly _filteredInlineCompletionItems;
    readonly selectedInlineCompletionIndex: IObservable<number, unknown>;
    readonly selectedInlineCompletion: IObservable<InlineCompletionWithUpdatedRange | undefined, unknown>;
    readonly activeCommands: IObservable<Command[], unknown>;
    readonly lastTriggerKind: IObservable<InlineCompletionTriggerKind | undefined>;
    readonly inlineCompletionsCount: IObservable<number | undefined, unknown>;
    readonly state: IObservable<{
        edits: readonly SingleTextEdit[];
        primaryGhostText: GhostTextOrReplacement;
        ghostTexts: readonly GhostTextOrReplacement[];
        suggestItem: SuggestItemInfo | undefined;
        inlineCompletion: InlineCompletionWithUpdatedRange | undefined;
    } | undefined, unknown>;
    private _computeAugmentation;
    readonly ghostTexts: IObservable<readonly GhostTextOrReplacement[] | undefined, unknown>;
    readonly primaryGhostText: IObservable<GhostTextOrReplacement | undefined, unknown>;
    private _deltaSelectedInlineCompletionIndex;
    next(): Promise<void>;
    previous(): Promise<void>;
    accept(editor: ICodeEditor): Promise<void>;
    acceptNextWord(editor: ICodeEditor): Promise<void>;
    acceptNextLine(editor: ICodeEditor): Promise<void>;
    private _acceptNext;
    handleSuggestAccepted(item: SuggestItemInfo): void;
}
export declare enum VersionIdChangeReason {
    Undo = 0,
    Redo = 1,
    AcceptWord = 2,
    Other = 3
}
export declare function getSecondaryEdits(textModel: ITextModel, positions: readonly Position[], primaryEdit: SingleTextEdit): SingleTextEdit[];
