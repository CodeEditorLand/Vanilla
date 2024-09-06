import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IBulkEditService } from "vs/editor/browser/services/bulkEditService";
import { Range } from "vs/editor/common/core/range";
import { TrackedRangeStickiness } from "vs/editor/common/model";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { FoldingRegions } from "vs/editor/contrib/folding/browser/foldingRanges";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
import { CellFindMatchWithIndex, CellFoldingState, EditorFoldingStateDelegate, ICellViewModel, IModelDecorationsChangeAccessor, INotebookDeltaCellStatusBarItems, INotebookDeltaDecoration, INotebookEditorViewState, INotebookViewCellsUpdateEvent, INotebookViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookLayoutInfo } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { CodeCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel";
import { MarkupCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel";
import { ViewContext } from "vs/workbench/contrib/notebook/browser/viewModel/viewContext";
import { NotebookCellTextModel } from "vs/workbench/contrib/notebook/common/model/notebookCellTextModel";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookFindOptions, ISelectionState } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { ICellRange } from "vs/workbench/contrib/notebook/common/notebookRange";
export interface NotebookViewModelOptions {
    isReadOnly: boolean;
    inRepl?: boolean;
}
export declare class NotebookViewModel extends Disposable implements EditorFoldingStateDelegate, INotebookViewModel {
    viewType: string;
    private _notebook;
    private _viewContext;
    private _layoutInfo;
    private _options;
    private readonly _instantiationService;
    private readonly _bulkEditService;
    private readonly _undoService;
    private readonly _textModelService;
    private readonly _localStore;
    private _handleToViewCellMapping;
    get options(): NotebookViewModelOptions;
    private readonly _onDidChangeOptions;
    get onDidChangeOptions(): Event<void>;
    private _viewCells;
    private readonly replView;
    get viewCells(): ICellViewModel[];
    get length(): number;
    get notebookDocument(): NotebookTextModel;
    get uri(): any;
    get metadata(): any;
    private readonly _onDidChangeViewCells;
    get onDidChangeViewCells(): Event<INotebookViewCellsUpdateEvent>;
    private _lastNotebookEditResource;
    get lastNotebookEditResource(): URI | null;
    get layoutInfo(): NotebookLayoutInfo | null;
    private readonly _onDidChangeSelection;
    get onDidChangeSelection(): Event<string>;
    private _selectionCollection;
    private get selectionHandles();
    private set selectionHandles(value);
    private _decorationsTree;
    private _decorations;
    private _lastDecorationId;
    private readonly _instanceId;
    readonly id: string;
    private _foldingRanges;
    private _onDidFoldingStateChanged;
    onDidFoldingStateChanged: Event<void>;
    private _hiddenRanges;
    private _focused;
    get focused(): boolean;
    private _decorationIdToCellMap;
    private _statusBarItemIdToCellMap;
    constructor(viewType: string, _notebook: NotebookTextModel, _viewContext: ViewContext, _layoutInfo: NotebookLayoutInfo | null, _options: NotebookViewModelOptions, _instantiationService: IInstantiationService, _bulkEditService: IBulkEditService, _undoService: IUndoRedoService, _textModelService: ITextModelService, notebookExecutionStateService: INotebookExecutionStateService);
    updateOptions(newOptions: Partial<NotebookViewModelOptions>): void;
    getFocus(): any;
    getSelections(): any;
    setEditorFocus(focused: boolean): void;
    validateRange(cellRange: ICellRange | null | undefined): ICellRange | null;
    updateSelectionsState(state: ISelectionState, source?: "view" | "model"): void;
    getFoldingStartIndex(index: number): number;
    getFoldingState(index: number): CellFoldingState;
    getFoldedLength(index: number): number;
    updateFoldingRanges(ranges: FoldingRegions): void;
    getHiddenRanges(): ICellRange[];
    getCellByHandle(handle: number): any;
    getCellIndexByHandle(handle: number): number;
    getCellIndex(cell: ICellViewModel): number;
    cellAt(index: number): CellViewModel | undefined;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    /**
     * If this._viewCells[index] is visible then return index
     */
    getNearestVisibleCellIndexUpwards(index: number): number;
    getNextVisibleCellIndex(index: number): any;
    getPreviousVisibleCellIndex(index: number): number;
    hasCell(cell: ICellViewModel): boolean;
    getVersionId(): any;
    getAlternativeId(): any;
    getTrackedRange(id: string): ICellRange | null;
    private _getDecorationRange;
    setTrackedRange(id: string | null, newRange: ICellRange | null, newStickiness: TrackedRangeStickiness): string | null;
    private _deltaCellDecorationsImpl;
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookDeltaDecoration[]): string[];
    deltaCellStatusBarItems(oldItems: string[], newItems: INotebookDeltaCellStatusBarItems[]): string[];
    nearestCodeCellIndex(index: number): number;
    getEditorViewState(): INotebookEditorViewState;
    restoreEditorViewState(viewState: INotebookEditorViewState | undefined): void;
    /**
     * Editor decorations across cells. For example, find decorations for multiple code cells
     * The reason that we can't completely delegate this to CodeEditorWidget is most of the time, the editors for cells are not created yet but we already have decorations for them.
     */
    changeModelDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    private _deltaModelDecorationsImpl;
    find(value: string, options: INotebookFindOptions): CellFindMatchWithIndex[];
    replaceOne(cell: ICellViewModel, range: Range, text: string): Promise<void>;
    replaceAll(matches: CellFindMatchWithIndex[], texts: string[]): Promise<void>;
    private _withElement;
    undo(): Promise<any>;
    redo(): Promise<any>;
    equal(notebook: NotebookTextModel): boolean;
    dispose(): void;
}
export type CellViewModel = (CodeCellViewModel | MarkupCellViewModel) & ICellViewModel;
export declare function createCellViewModel(instantiationService: IInstantiationService, notebookViewModel: NotebookViewModel, cell: NotebookCellTextModel, viewContext: ViewContext): any;
