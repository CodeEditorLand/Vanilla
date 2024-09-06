import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ITransaction } from "vs/base/common/observable";
import { URI } from "vs/base/common/uri";
import { RefCounted } from "vs/editor/browser/widget/diffEditor/utils";
import { IDocumentDiffItem, IMultiDiffEditorModel } from "vs/editor/browser/widget/multiDiffEditor/model";
import { IDiffEditorViewModel } from "vs/editor/common/editorCommon";
import { IModelService } from "vs/editor/common/services/model";
import { ContextKeyValue } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class MultiDiffEditorViewModel extends Disposable {
    readonly model: IMultiDiffEditorModel;
    private readonly _instantiationService;
    private readonly _documents;
    readonly items: IObservable<readonly DocumentDiffItemViewModel[]>;
    readonly focusedDiffItem: any;
    readonly activeDiffItem: any;
    waitForDiffs(): Promise<void>;
    collapseAll(): void;
    expandAll(): void;
    get contextKeys(): Record<string, ContextKeyValue> | undefined;
    constructor(model: IMultiDiffEditorModel, _instantiationService: IInstantiationService);
}
export declare class DocumentDiffItemViewModel extends Disposable {
    private readonly _editorViewModel;
    private readonly _instantiationService;
    private readonly _modelService;
    /**
     * The diff editor view model keeps its inner objects alive.
     */
    readonly diffEditorViewModelRef: RefCounted<IDiffEditorViewModel>;
    get diffEditorViewModel(): IDiffEditorViewModel;
    readonly collapsed: any;
    readonly lastTemplateData: any;
    get originalUri(): URI | undefined;
    get modifiedUri(): URI | undefined;
    readonly isActive: IObservable<boolean>;
    private readonly _isFocusedSource;
    readonly isFocused: any;
    setIsFocused(source: IObservable<boolean>, tx: ITransaction | undefined): void;
    private readonly documentDiffItemRef;
    get documentDiffItem(): IDocumentDiffItem;
    readonly isAlive: any;
    constructor(documentDiffItem: RefCounted<IDocumentDiffItem>, _editorViewModel: MultiDiffEditorViewModel, _instantiationService: IInstantiationService, _modelService: IModelService);
    getKey(): string;
}
