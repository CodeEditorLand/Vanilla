import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { FontInfo } from "vs/editor/common/config/fontInfo";
import * as editorCommon from "vs/editor/common/editorCommon";
import { DiffNestedCellViewModel } from "vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel";
import { NotebookDiffEditorEventDispatcher } from "vs/workbench/contrib/notebook/browser/diff/eventDispatcher";
import { DiffSide, IDiffElementLayoutInfo } from "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser";
import { IGenericCellViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookLayoutInfo } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { ICellOutput, INotebookTextModel, IOutputDto, IOutputItemDto, NotebookCellMetadata } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
export declare enum PropertyFoldingState {
    Expanded = 0,
    Collapsed = 1
}
export declare const OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;
type ILayoutInfoDelta0 = {
    [K in keyof IDiffElementLayoutInfo]?: number;
};
interface ILayoutInfoDelta extends ILayoutInfoDelta0 {
    rawOutputHeight?: number;
    recomputeOutput?: boolean;
}
export type IDiffElementViewModelBase = DiffElementCellViewModelBase | DiffElementPlaceholderViewModel;
export declare abstract class DiffElementViewModelBase extends Disposable {
    readonly mainDocumentTextModel: INotebookTextModel;
    readonly editorEventDispatcher: NotebookDiffEditorEventDispatcher;
    readonly initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    };
    protected _layoutInfoEmitter: any;
    onDidLayoutChange: any;
    constructor(mainDocumentTextModel: INotebookTextModel, editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    });
    abstract layoutChange(): void;
    abstract getHeight(lineHeight: number): number;
    abstract get totalHeight(): number;
}
export declare class DiffElementPlaceholderViewModel extends DiffElementViewModelBase {
    readonly type: "placeholder";
    hiddenCells: DiffElementCellViewModelBase[];
    protected _unfoldHiddenCells: any;
    onUnfoldHiddenCells: any;
    constructor(mainDocumentTextModel: INotebookTextModel, editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    });
    get totalHeight(): number;
    getHeight(_: number): number;
    layoutChange(): void;
    showHiddenCells(): void;
}
export declare abstract class DiffElementCellViewModelBase extends DiffElementViewModelBase {
    readonly type: "unchanged" | "insert" | "delete" | "modified";
    cellFoldingState: PropertyFoldingState;
    metadataFoldingState: PropertyFoldingState;
    outputFoldingState: PropertyFoldingState;
    protected _stateChangeEmitter: any;
    onDidStateChange: any;
    protected _layoutInfo: IDiffElementLayoutInfo;
    displayIconToHideUnmodifiedCells?: boolean;
    private _hideUnchangedCells;
    onHideUnchangedCells: any;
    hideUnchangedCells(): void;
    set rawOutputHeight(height: number);
    get rawOutputHeight(): number;
    set outputStatusHeight(height: number);
    get outputStatusHeight(): number;
    set outputMetadataHeight(height: number);
    get outputMetadataHeight(): number;
    set editorHeight(height: number);
    get editorHeight(): number;
    set editorMargin(margin: number);
    get editorMargin(): number;
    set metadataStatusHeight(height: number);
    get metadataStatusHeight(): number;
    set metadataHeight(height: number);
    get metadataHeight(): number;
    private _renderOutput;
    set renderOutput(value: boolean);
    get renderOutput(): boolean;
    get layoutInfo(): IDiffElementLayoutInfo;
    get totalHeight(): any;
    private _sourceEditorViewState;
    private _outputEditorViewState;
    private _metadataEditorViewState;
    readonly original: DiffNestedCellViewModel | undefined;
    readonly modified: DiffNestedCellViewModel | undefined;
    constructor(mainDocumentTextModel: INotebookTextModel, original: NotebookCellTextModel | undefined, modified: NotebookCellTextModel | undefined, type: "unchanged" | "insert" | "delete" | "modified", editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService);
    layoutChange(): void;
    private _estimateEditorHeight;
    protected _layout(delta: ILayoutInfoDelta): void;
    getHeight(lineHeight: number): any;
    private _computeTotalHeight;
    private estimateEditorHeight;
    private _getOutputTotalHeight;
    private _fireLayoutChangeEvent;
    abstract checkIfInputModified(): false | {
        reason: string | undefined;
    };
    abstract checkIfOutputsModified(): false | {
        reason: string | undefined;
    };
    abstract checkMetadataIfModified(): false | {
        reason: string | undefined;
    };
    abstract isOutputEmpty(): boolean;
    abstract getRichOutputTotalHeight(): number;
    abstract getCellByUri(cellUri: URI): IGenericCellViewModel;
    abstract getOutputOffsetInCell(diffSide: DiffSide, index: number): number;
    abstract getOutputOffsetInContainer(diffSide: DiffSide, index: number): number;
    abstract updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    abstract getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    getComputedCellContainerWidth(layoutInfo: NotebookLayoutInfo, diffEditor: boolean, fullWidth: boolean): number;
    getOutputEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveOutputEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
    getMetadataEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveMetadataEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
    getSourceEditorViewState(): editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null;
    saveSpirceEditorViewState(viewState: editorCommon.ICodeEditorViewState | editorCommon.IDiffEditorViewState | null): void;
}
export declare class SideBySideDiffElementViewModel extends DiffElementCellViewModelBase {
    readonly otherDocumentTextModel: NotebookTextModel;
    get originalDocument(): NotebookTextModel;
    get modifiedDocument(): INotebookTextModel;
    readonly original: DiffNestedCellViewModel;
    readonly modified: DiffNestedCellViewModel;
    readonly type: "unchanged" | "modified";
    constructor(mainDocumentTextModel: NotebookTextModel, otherDocumentTextModel: NotebookTextModel, original: NotebookCellTextModel, modified: NotebookCellTextModel, type: "unchanged" | "modified", editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService);
    checkIfInputModified(): false | {
        reason: string | undefined;
    };
    checkIfOutputsModified(): false | {
        reason: string | undefined;
        kind: OutputComparison;
    };
    checkMetadataIfModified(): false | {
        reason: undefined;
    };
    updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    getOutputOffsetInContainer(diffSide: DiffSide, index: number): any;
    getOutputOffsetInCell(diffSide: DiffSide, index: number): any;
    isOutputEmpty(): boolean;
    getRichOutputTotalHeight(): number;
    getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    getCellByUri(cellUri: URI): IGenericCellViewModel;
}
export declare class SingleSideDiffElementViewModel extends DiffElementCellViewModelBase {
    readonly otherDocumentTextModel: NotebookTextModel;
    get cellViewModel(): any;
    get originalDocument(): any;
    get modifiedDocument(): any;
    readonly type: "insert" | "delete";
    constructor(mainDocumentTextModel: NotebookTextModel, otherDocumentTextModel: NotebookTextModel, original: NotebookCellTextModel | undefined, modified: NotebookCellTextModel | undefined, type: "insert" | "delete", editorEventDispatcher: NotebookDiffEditorEventDispatcher, initData: {
        metadataStatusHeight: number;
        outputStatusHeight: number;
        fontInfo: FontInfo | undefined;
    }, notebookService: INotebookService);
    checkIfInputModified(): false | {
        reason: string | undefined;
    };
    getNestedCellViewModel(diffSide: DiffSide): DiffNestedCellViewModel;
    checkIfOutputsModified(): false | {
        reason: string | undefined;
    };
    checkMetadataIfModified(): false | {
        reason: string | undefined;
    };
    updateOutputHeight(diffSide: DiffSide, index: number, height: number): void;
    getOutputOffsetInContainer(diffSide: DiffSide, index: number): any;
    getOutputOffsetInCell(diffSide: DiffSide, index: number): any;
    isOutputEmpty(): boolean;
    getRichOutputTotalHeight(): any;
    getCellByUri(cellUri: URI): IGenericCellViewModel;
}
export declare const enum OutputComparison {
    Unchanged = 0,
    Metadata = 1,
    Other = 2
}
export declare function outputEqual(a: ICellOutput, b: ICellOutput): OutputComparison;
export declare function getFormattedMetadataJSON(documentTextModel: INotebookTextModel, metadata: NotebookCellMetadata, language?: string): any;
export declare function getStreamOutputData(outputs: IOutputItemDto[]): string | null;
export declare function getFormattedOutputJSON(outputs: IOutputDto[]): string;
export {};
