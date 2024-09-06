import { IMouseWheelEvent } from "vs/base/browser/mouseEvent";
import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { CodeEditorWidget } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { DiffEditorWidget } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
import { BareFontInfo } from "vs/editor/common/config/fontInfo";
import { WorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { DiffElementCellViewModelBase, IDiffElementViewModelBase } from "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel";
import { CellLayoutState, ICellOutputViewModel, ICommonCellInfo, IGenericCellViewModel, IInsetRenderOutput } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookOptions } from "vs/workbench/contrib/notebook/browser/notebookOptions";
import { NotebookLayoutInfo } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
export declare enum DiffSide {
    Original = 0,
    Modified = 1
}
export interface IDiffCellInfo extends ICommonCellInfo {
    diffElement: DiffElementCellViewModelBase;
}
export interface INotebookTextDiffEditor {
    notebookOptions: NotebookOptions;
    readonly textModel?: NotebookTextModel;
    onMouseUp: Event<{
        readonly event: MouseEvent;
        readonly target: IDiffElementViewModelBase;
    }>;
    onDidScroll: Event<void>;
    onDidDynamicOutputRendered: Event<{
        cell: IGenericCellViewModel;
        output: ICellOutputViewModel;
    }>;
    getOverflowContainerDomNode(): HTMLElement;
    getLayoutInfo(): NotebookLayoutInfo;
    getScrollTop(): number;
    getScrollHeight(): number;
    layoutNotebookCell(cell: DiffElementCellViewModelBase, height: number): void;
    createOutput(cellDiffViewModel: DiffElementCellViewModelBase, cellViewModel: IDiffNestedCellViewModel, output: IInsetRenderOutput, getOffset: () => number, diffSide: DiffSide): void;
    showInset(cellDiffViewModel: DiffElementCellViewModelBase, cellViewModel: IDiffNestedCellViewModel, displayOutput: ICellOutputViewModel, diffSide: DiffSide): void;
    removeInset(cellDiffViewModel: DiffElementCellViewModelBase, cellViewModel: IDiffNestedCellViewModel, output: ICellOutputViewModel, diffSide: DiffSide): void;
    hideInset(cellDiffViewModel: DiffElementCellViewModelBase, cellViewModel: IDiffNestedCellViewModel, output: ICellOutputViewModel): void;
    /**
     * Trigger the editor to scroll from scroll event programmatically
     */
    triggerScroll(event: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    getCellByInfo(cellInfo: ICommonCellInfo): IGenericCellViewModel;
    focusNotebookCell(cell: IGenericCellViewModel, focus: "editor" | "container" | "output"): Promise<void>;
    focusNextNotebookCell(cell: IGenericCellViewModel, focus: "editor" | "container" | "output"): Promise<void>;
    updateOutputHeight(cellInfo: ICommonCellInfo, output: ICellOutputViewModel, height: number, isInit: boolean): void;
    deltaCellOutputContainerClassNames(diffSide: DiffSide, cellId: string, added: string[], removed: string[]): void;
    previousChange(): void;
    nextChange(): void;
}
export interface IDiffNestedCellViewModel {
}
export interface CellDiffCommonRenderTemplate {
    readonly leftBorder: HTMLElement;
    readonly rightBorder: HTMLElement;
    readonly topBorder: HTMLElement;
    readonly bottomBorder: HTMLElement;
}
export interface CellDiffPlaceholderRenderTemplate {
    readonly container: HTMLElement;
    readonly placeholder: HTMLElement;
    readonly body: HTMLElement;
    readonly marginOverlay: IDiffCellMarginOverlay;
    readonly elementDisposables: DisposableStore;
}
export interface CellDiffSingleSideRenderTemplate extends CellDiffCommonRenderTemplate {
    readonly container: HTMLElement;
    readonly body: HTMLElement;
    readonly diffEditorContainer: HTMLElement;
    readonly diagonalFill: HTMLElement;
    readonly elementDisposables: DisposableStore;
    readonly cellHeaderContainer: HTMLElement;
    readonly editorContainer: HTMLElement;
    readonly sourceEditor: CodeEditorWidget;
    readonly metadataHeaderContainer: HTMLElement;
    readonly metadataInfoContainer: HTMLElement;
    readonly outputHeaderContainer: HTMLElement;
    readonly outputInfoContainer: HTMLElement;
}
export interface IDiffCellMarginOverlay extends IDisposable {
    onAction: Event<void>;
    show(): void;
    hide(): void;
}
export interface CellDiffSideBySideRenderTemplate extends CellDiffCommonRenderTemplate {
    readonly container: HTMLElement;
    readonly body: HTMLElement;
    readonly diffEditorContainer: HTMLElement;
    readonly elementDisposables: DisposableStore;
    readonly cellHeaderContainer: HTMLElement;
    readonly sourceEditor: DiffEditorWidget;
    readonly editorContainer: HTMLElement;
    readonly inputToolbarContainer: HTMLElement;
    readonly toolbar: WorkbenchToolBar;
    readonly metadataHeaderContainer: HTMLElement;
    readonly metadataInfoContainer: HTMLElement;
    readonly outputHeaderContainer: HTMLElement;
    readonly outputInfoContainer: HTMLElement;
    readonly marginOverlay: IDiffCellMarginOverlay;
}
export interface IDiffElementLayoutInfo {
    totalHeight: number;
    width: number;
    editorHeight: number;
    editorMargin: number;
    metadataHeight: number;
    cellStatusHeight: number;
    metadataStatusHeight: number;
    rawOutputHeight: number;
    outputMetadataHeight: number;
    outputTotalHeight: number;
    outputStatusHeight: number;
    bodyMargin: number;
    layoutState: CellLayoutState;
}
type IDiffElementSelfLayoutChangeEvent = {
    [K in keyof IDiffElementLayoutInfo]?: boolean;
};
export interface CellDiffViewModelLayoutChangeEvent extends IDiffElementSelfLayoutChangeEvent {
    font?: BareFontInfo;
    outerWidth?: boolean;
    metadataEditor?: boolean;
    outputEditor?: boolean;
    outputView?: boolean;
}
export declare const DIFF_CELL_MARGIN = 16;
export declare const NOTEBOOK_DIFF_CELL_INPUT: any;
export declare const NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE_KEY = "notebook.diffEditor.cell.ignoreWhitespace";
export declare const NOTEBOOK_DIFF_CELL_IGNORE_WHITESPACE: any;
export declare const NOTEBOOK_DIFF_CELL_PROPERTY: any;
export declare const NOTEBOOK_DIFF_CELL_PROPERTY_EXPANDED: any;
export declare const NOTEBOOK_DIFF_CELLS_COLLAPSED: any;
export declare const NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS: any;
export declare const NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN: any;
export declare const NOTEBOOK_DIFF_ITEM_KIND: any;
export declare const NOTEBOOK_DIFF_ITEM_DIFF_STATE: any;
export interface INotebookDiffViewModelUpdateEvent {
    readonly start: number;
    readonly deleteCount: number;
    readonly elements: readonly IDiffElementViewModelBase[];
}
export interface INotebookDiffViewModel extends IDisposable {
    readonly items: readonly IDiffElementViewModelBase[];
    onDidChangeItems: Event<INotebookDiffViewModelUpdateEvent>;
    /**
     * Computes the differences and generates the viewmodel.
     * If view models are generated, then the onDidChangeItems is triggered and will have a return value.
     * Else returns `undefined`
     * @param token
     */
    computeDiff(token: CancellationToken): Promise<{
        firstChangeIndex: number;
    } | undefined>;
}
export {};
