import { Disposable } from "../../../../base/common/lifecycle.js";
import { IObservable, ISettableObservable, ITransaction, ObservablePromise } from "../../../../base/common/observable.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IDiffProviderFactoryService } from "../../../browser/widget/diffEditor/diffProviderFactoryService.js";
import { Selection } from "../../../common/core/selection.js";
import { Command } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { IFeatureDebounceInformation } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
import { IModelContentChangedEvent } from "../../../common/textModelEvents.js";
import { InlineCompletionItem } from "../../inlineCompletions/browser/model/provideInlineCompletions.js";
import { InlineEdit } from "./inlineEditsWidget.js";
export declare class InlineEditsModel extends Disposable {
    readonly textModel: ITextModel;
    readonly _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>;
    private readonly _selection;
    protected readonly _debounceValue: IFeatureDebounceInformation;
    private readonly languageFeaturesService;
    private readonly _diffProviderFactoryService;
    private readonly _modelService;
    private static _modelId;
    private static _createUniqueUri;
    private readonly _forceUpdateExplicitlySignal;
    private readonly _selectedInlineCompletionId;
    private readonly _isActive;
    private readonly _originalModel;
    private readonly _modifiedModel;
    private readonly _pinnedRange;
    readonly isPinned: IObservable<boolean, unknown>;
    readonly userPrompt: ISettableObservable<string | undefined>;
    constructor(textModel: ITextModel, _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>, _selection: IObservable<Selection>, _debounceValue: IFeatureDebounceInformation, languageFeaturesService: ILanguageFeaturesService, _diffProviderFactoryService: IDiffProviderFactoryService, _modelService: IModelService);
    readonly inlineEdit: IObservable<InlineEdit | undefined, unknown>;
    readonly _inlineEdit: IObservable<ObservablePromise<InlineEdit | undefined> | undefined, unknown>;
    private readonly _fetchStore;
    private readonly _inlineEditsFetchResult;
    private readonly _inlineEdits;
    private readonly _fetchInlineEditsPromise;
    trigger(tx?: ITransaction): Promise<void>;
    triggerExplicitly(tx?: ITransaction): Promise<void>;
    stop(tx?: ITransaction): void;
    private readonly _filteredInlineEditItems;
    readonly selectedInlineCompletionIndex: IObservable<number, unknown>;
    readonly selectedInlineEdit: IObservable<InlineEditData | undefined, unknown>;
    readonly activeCommands: IObservable<Command[], unknown>;
    private _deltaSelectedInlineCompletionIndex;
    next(): Promise<void>;
    previous(): Promise<void>;
    togglePin(): void;
    accept(editor: ICodeEditor): Promise<void>;
}
declare class InlineEditData {
    readonly inlineCompletion: InlineCompletionItem;
    readonly semanticId: string;
    constructor(inlineCompletion: InlineCompletionItem);
}
export {};
