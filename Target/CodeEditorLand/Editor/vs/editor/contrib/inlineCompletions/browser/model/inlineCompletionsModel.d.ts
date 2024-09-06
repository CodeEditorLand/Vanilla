import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ITransaction } from "vs/base/common/observable";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { SingleTextEdit } from "vs/editor/common/core/textEdit";
import { InlineCompletionTriggerKind } from "vs/editor/common/languages";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModel } from "vs/editor/common/model";
import { IFeatureDebounceInformation } from "vs/editor/common/services/languageFeatureDebounce";
import { IModelContentChangedEvent } from "vs/editor/common/textModelEvents";
import { SuggestItemInfo } from "vs/editor/contrib/inlineCompletions/browser/model/suggestWidgetAdaptor";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
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
    constructor(textModel: ITextModel, selectedSuggestItem: IObservable<SuggestItemInfo | undefined>, _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>, _positions: IObservable<readonly Position[]>, _debounceValue: IFeatureDebounceInformation, _suggestPreviewEnabled: IObservable<boolean>, _suggestPreviewMode: IObservable<"prefix" | "subword" | "subwordSmart">, _inlineSuggestMode: IObservable<"prefix" | "subword" | "subwordSmart">, _enabled: IObservable<boolean>, _instantiationService: IInstantiationService, _commandService: ICommandService, _languageConfigurationService: ILanguageConfigurationService);
    private readonly _preserveCurrentCompletionReasons;
    private _getReason;
    private readonly _fetchInlineCompletionsPromise;
    trigger(tx?: ITransaction): Promise<void>;
    triggerExplicitly(tx?: ITransaction): Promise<void>;
    stop(tx?: ITransaction): void;
    private readonly _filteredInlineCompletionItems;
    readonly selectedInlineCompletionIndex: any;
    readonly selectedInlineCompletion: any;
    readonly activeCommands: any;
    readonly lastTriggerKind: IObservable<InlineCompletionTriggerKind | undefined>;
    readonly inlineCompletionsCount: any;
    readonly state: any;
    private _computeAugmentation;
    readonly ghostTexts: any;
    readonly primaryGhostText: any;
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
