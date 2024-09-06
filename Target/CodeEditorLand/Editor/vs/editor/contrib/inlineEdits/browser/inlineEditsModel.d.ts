import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ISettableObservable, ITransaction } from "vs/base/common/observable";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IDiffProviderFactoryService } from "vs/editor/browser/widget/diffEditor/diffProviderFactoryService";
import { Selection } from "vs/editor/common/core/selection";
import { ITextModel } from "vs/editor/common/model";
import { IFeatureDebounceInformation } from "vs/editor/common/services/languageFeatureDebounce";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IModelService } from "vs/editor/common/services/model";
import { IModelContentChangedEvent } from "vs/editor/common/textModelEvents";
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
    readonly isPinned: any;
    readonly userPrompt: ISettableObservable<string | undefined>;
    constructor(textModel: ITextModel, _textModelVersionId: IObservable<number | null, IModelContentChangedEvent | undefined>, _selection: IObservable<Selection>, _debounceValue: IFeatureDebounceInformation, languageFeaturesService: ILanguageFeaturesService, _diffProviderFactoryService: IDiffProviderFactoryService, _modelService: IModelService);
    readonly inlineEdit: any;
    readonly _inlineEdit: any;
    private readonly _fetchStore;
    private readonly _inlineEditsFetchResult;
    private readonly _inlineEdits;
    private readonly _fetchInlineEditsPromise;
    trigger(tx?: ITransaction): Promise<void>;
    triggerExplicitly(tx?: ITransaction): Promise<void>;
    stop(tx?: ITransaction): void;
    private readonly _filteredInlineEditItems;
    readonly selectedInlineCompletionIndex: any;
    readonly selectedInlineEdit: any;
    readonly activeCommands: any;
    private _deltaSelectedInlineCompletionIndex;
    next(): Promise<void>;
    previous(): Promise<void>;
    togglePin(): void;
    accept(editor: ICodeEditor): Promise<void>;
}
