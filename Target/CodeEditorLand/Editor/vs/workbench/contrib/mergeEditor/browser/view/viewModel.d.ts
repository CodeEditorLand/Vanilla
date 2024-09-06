import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ITransaction } from "vs/base/common/observable";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { INotificationService } from "vs/platform/notification/common/notification";
import { MergeEditorModel } from "vs/workbench/contrib/mergeEditor/browser/model/mergeEditorModel";
import { InputNumber, ModifiedBaseRange, ModifiedBaseRangeState } from "vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange";
import { BaseCodeEditorView } from "vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView";
import { InputCodeEditorView } from "vs/workbench/contrib/mergeEditor/browser/view/editors/inputCodeEditorView";
import { ResultCodeEditorView } from "vs/workbench/contrib/mergeEditor/browser/view/editors/resultCodeEditorView";
export declare class MergeEditorViewModel extends Disposable {
    readonly model: MergeEditorModel;
    readonly inputCodeEditorView1: InputCodeEditorView;
    readonly inputCodeEditorView2: InputCodeEditorView;
    readonly resultCodeEditorView: ResultCodeEditorView;
    readonly baseCodeEditorView: IObservable<BaseCodeEditorView | undefined>;
    readonly showNonConflictingChanges: IObservable<boolean>;
    private readonly configurationService;
    private readonly notificationService;
    private readonly manuallySetActiveModifiedBaseRange;
    private readonly attachedHistory;
    constructor(model: MergeEditorModel, inputCodeEditorView1: InputCodeEditorView, inputCodeEditorView2: InputCodeEditorView, resultCodeEditorView: ResultCodeEditorView, baseCodeEditorView: IObservable<BaseCodeEditorView | undefined>, showNonConflictingChanges: IObservable<boolean>, configurationService: IConfigurationService, notificationService: INotificationService);
    readonly shouldUseAppendInsteadOfAccept: any;
    private counter;
    private readonly lastFocusedEditor;
    readonly baseShowDiffAgainst: any;
    readonly selectionInBase: any;
    private getRangeOfModifiedBaseRange;
    readonly activeModifiedBaseRange: any;
    setActiveModifiedBaseRange(range: ModifiedBaseRange | undefined, tx: ITransaction): void;
    setState(baseRange: ModifiedBaseRange, state: ModifiedBaseRangeState, tx: ITransaction, inputNumber: InputNumber): void;
    private goToConflict;
    goToNextModifiedBaseRange(predicate: (m: ModifiedBaseRange) => boolean): void;
    goToPreviousModifiedBaseRange(predicate: (m: ModifiedBaseRange) => boolean): void;
    toggleActiveConflict(inputNumber: 1 | 2): void;
    acceptAll(inputNumber: 1 | 2): void;
}
