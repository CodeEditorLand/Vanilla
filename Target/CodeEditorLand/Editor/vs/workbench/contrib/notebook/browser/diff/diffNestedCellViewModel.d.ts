import { Emitter } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { PrefixSumComputer } from "vs/editor/common/model/prefixSumComputer";
import { IDiffNestedCellViewModel } from "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser";
import { IGenericCellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { CellViewModelStateChangeEvent } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
export declare class DiffNestedCellViewModel extends Disposable implements IDiffNestedCellViewModel, IGenericCellViewModel {
    readonly textModel: NotebookCellTextModel;
    private _notebookService;
    private _id;
    get id(): string;
    get outputs(): any;
    get language(): any;
    get metadata(): any;
    get uri(): any;
    get handle(): any;
    protected readonly _onDidChangeState: Emitter<CellViewModelStateChangeEvent>;
    private _hoveringOutput;
    get outputIsHovered(): boolean;
    set outputIsHovered(v: boolean);
    private _focusOnOutput;
    get outputIsFocused(): boolean;
    set outputIsFocused(v: boolean);
    private _focusInputInOutput;
    get inputInOutputIsFocused(): boolean;
    set inputInOutputIsFocused(v: boolean);
    private _outputViewModels;
    get outputsViewModels(): ICellOutputViewModel[];
    protected _outputCollection: number[];
    protected _outputsTop: PrefixSumComputer | null;
    protected readonly _onDidChangeOutputLayout: any;
    readonly onDidChangeOutputLayout: any;
    constructor(textModel: NotebookCellTextModel, _notebookService: INotebookService);
    private _ensureOutputsTop;
    getOutputOffset(index: number): number;
    updateOutputHeight(index: number, height: number): void;
    getOutputTotalHeight(): any;
    dispose(): void;
}