import "vs/css!./media/notebook";
import "vs/css!./media/notebookCellChat";
import "vs/css!./media/notebookCellEditorHint";
import "vs/css!./media/notebookCellInsertToolbar";
import "vs/css!./media/notebookCellStatusBar";
import "vs/css!./media/notebookCellTitleToolbar";
import "vs/css!./media/notebookFocusIndicator";
import "vs/css!./media/notebookToolbar";
import "vs/css!./media/notebookDnd";
import "vs/css!./media/notebookFolding";
import "vs/css!./media/notebookCellOutput";
import "vs/css!./media/notebookEditorStickyScroll";
import "vs/css!./media/notebookKernelActionViewItem";
import "vs/css!./media/notebookOutline";
import * as DOM from "vs/base/browser/dom";
import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { Selection } from "vs/editor/common/core/selection";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { IEditorProgressService } from "vs/platform/progress/common/progress";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { CellFindMatchWithIndex, CellLayoutContext, IActiveNotebookEditorDelegate, IBaseCellEditorOptions, ICellOutputViewModel, ICellViewModel, ICommonCellInfo, IFocusNotebookCellOptions, IInsetRenderOutput, IModelDecorationsChangeAccessor, INotebookDeltaDecoration, INotebookEditor, INotebookEditorContribution, INotebookEditorCreationOptions, INotebookEditorDelegate, INotebookEditorMouseEvent, INotebookEditorOptions, INotebookEditorViewState, INotebookViewCellsUpdateEvent, INotebookViewZoneChangeAccessor, INotebookWebviewMessage } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { NotebookLayoutInfo } from "vs/workbench/contrib/notebook/browser/notebookViewEvents";
import { INotebookEditorService } from "vs/workbench/contrib/notebook/browser/services/notebookEditorService";
import { CodeCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel";
import { MarkupCellViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel";
import { NotebookViewModel } from "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookFindOptions } from "vs/workbench/contrib/notebook/common/notebookCommon";
import { INotebookExecutionService } from "vs/workbench/contrib/notebook/common/notebookExecutionService";
import { INotebookExecutionStateService } from "vs/workbench/contrib/notebook/common/notebookExecutionStateService";
import { INotebookKernelService } from "vs/workbench/contrib/notebook/common/notebookKernelService";
import { INotebookLoggingService } from "vs/workbench/contrib/notebook/common/notebookLoggingService";
import { NotebookPerfMarks } from "vs/workbench/contrib/notebook/common/notebookPerformance";
import { ICellRange } from "vs/workbench/contrib/notebook/common/notebookRange";
import { INotebookRendererMessagingService } from "vs/workbench/contrib/notebook/common/notebookRendererMessagingService";
import { INotebookService } from "vs/workbench/contrib/notebook/common/notebookService";
import { IWebviewElement } from "vs/workbench/contrib/webview/browser/webview";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
export declare function getDefaultNotebookCreationOptions(): INotebookEditorCreationOptions;
export declare class NotebookEditorWidget extends Disposable implements INotebookEditorDelegate, INotebookEditor {
    readonly creationOptions: INotebookEditorCreationOptions;
    private readonly notebookRendererMessaging;
    private readonly notebookEditorService;
    private readonly notebookKernelService;
    private readonly _notebookService;
    private readonly configurationService;
    private readonly layoutService;
    private readonly contextMenuService;
    private readonly telemetryService;
    private readonly notebookExecutionService;
    private readonly notebookExecutionStateService;
    private editorProgressService;
    private readonly logService;
    private readonly keybindingService;
    private readonly _onDidChangeCellState;
    readonly onDidChangeCellState: any;
    private readonly _onDidChangeViewCells;
    readonly onDidChangeViewCells: Event<INotebookViewCellsUpdateEvent>;
    private readonly _onWillChangeModel;
    readonly onWillChangeModel: Event<NotebookTextModel | undefined>;
    private readonly _onDidChangeModel;
    readonly onDidChangeModel: Event<NotebookTextModel | undefined>;
    private readonly _onDidAttachViewModel;
    readonly onDidAttachViewModel: Event<void>;
    private readonly _onDidChangeOptions;
    readonly onDidChangeOptions: Event<void>;
    private readonly _onDidChangeDecorations;
    readonly onDidChangeDecorations: Event<void>;
    private readonly _onDidScroll;
    readonly onDidScroll: Event<void>;
    private readonly _onDidChangeLayout;
    readonly onDidChangeLayout: Event<void>;
    private readonly _onDidChangeActiveCell;
    readonly onDidChangeActiveCell: Event<void>;
    private readonly _onDidChangeFocus;
    readonly onDidChangeFocus: Event<void>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: Event<void>;
    private readonly _onDidChangeVisibleRanges;
    readonly onDidChangeVisibleRanges: Event<void>;
    private readonly _onDidFocusEmitter;
    readonly onDidFocusWidget: any;
    private readonly _onDidBlurEmitter;
    readonly onDidBlurWidget: any;
    private readonly _onDidChangeActiveEditor;
    readonly onDidChangeActiveEditor: Event<this>;
    private readonly _onDidChangeActiveKernel;
    readonly onDidChangeActiveKernel: Event<void>;
    private readonly _onMouseUp;
    readonly onMouseUp: Event<INotebookEditorMouseEvent>;
    private readonly _onMouseDown;
    readonly onMouseDown: Event<INotebookEditorMouseEvent>;
    private readonly _onDidReceiveMessage;
    readonly onDidReceiveMessage: Event<INotebookWebviewMessage>;
    private readonly _onDidRenderOutput;
    private readonly onDidRenderOutput;
    private readonly _onDidRemoveOutput;
    private readonly onDidRemoveOutput;
    private readonly _onDidResizeOutputEmitter;
    readonly onDidResizeOutput: any;
    private _overlayContainer;
    private _notebookTopToolbarContainer;
    private _notebookTopToolbar;
    private _notebookStickyScrollContainer;
    private _notebookStickyScroll;
    private _notebookOverviewRulerContainer;
    private _notebookOverviewRuler;
    private _body;
    private _styleElement;
    private _overflowContainer;
    private _webview;
    private _webviewResolvePromise;
    private _webviewTransparentCover;
    private _listDelegate;
    private _list;
    private _listViewInfoAccessor;
    private _dndController;
    private _listTopCellToolbar;
    private _renderedEditors;
    private _editorPool;
    private _viewContext;
    private _notebookViewModel;
    private readonly _localStore;
    private _localCellStateListeners;
    private _fontInfo;
    private _dimension?;
    private _position?;
    private _shadowElement?;
    private _shadowElementViewInfo;
    private readonly _editorFocus;
    private readonly _outputFocus;
    private readonly _editorEditable;
    private readonly _cursorNavMode;
    private readonly _outputInputFocus;
    protected readonly _contributions: Map<string, INotebookEditorContribution>;
    private _scrollBeyondLastLine;
    private readonly _insetModifyQueueByOutputId;
    private _cellContextKeyManager;
    private readonly _uuid;
    private _focusTracker;
    private _webviewFocused;
    private _isVisible;
    get isVisible(): boolean;
    private _isDisposed;
    get isDisposed(): boolean;
    set viewModel(newModel: NotebookViewModel | undefined);
    get viewModel(): NotebookViewModel | undefined;
    get textModel(): any;
    get isReadOnly(): any;
    get activeCodeEditor(): ICodeEditor | undefined;
    get activeCellAndCodeEditor(): [ICellViewModel, ICodeEditor] | undefined;
    get codeEditors(): [ICellViewModel, ICodeEditor][];
    get visibleRanges(): any;
    private _baseCellEditorOptions;
    readonly isEmbedded: boolean;
    private _readOnly;
    private readonly _inRepl;
    readonly scopedContextKeyService: IContextKeyService;
    private readonly instantiationService;
    private readonly _notebookOptions;
    private _currentProgress;
    get notebookOptions(): NotebookOptions;
    constructor(creationOptions: INotebookEditorCreationOptions, dimension: DOM.Dimension | undefined, instantiationService: IInstantiationService, editorGroupsService: IEditorGroupsService, notebookRendererMessaging: INotebookRendererMessagingService, notebookEditorService: INotebookEditorService, notebookKernelService: INotebookKernelService, _notebookService: INotebookService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, layoutService: ILayoutService, contextMenuService: IContextMenuService, telemetryService: ITelemetryService, notebookExecutionService: INotebookExecutionService, notebookExecutionStateService: INotebookExecutionStateService, editorProgressService: IEditorProgressService, logService: INotebookLoggingService, keybindingService: IKeybindingService);
    private _debugFlag;
    private _debug;
    /**
     * EditorId
     */
    getId(): string;
    getViewModel(): NotebookViewModel | undefined;
    getLength(): any;
    getSelections(): any;
    setSelections(selections: ICellRange[]): void;
    getFocus(): any;
    setFocus(focus: ICellRange): void;
    getSelectionViewModels(): ICellViewModel[];
    hasModel(): this is IActiveNotebookEditorDelegate;
    showProgress(): void;
    hideProgress(): void;
    getBaseCellEditorOptions(language: string): IBaseCellEditorOptions;
    private _updateForNotebookConfiguration;
    private _generateFontInfo;
    private _createBody;
    private _generateFontFamily;
    private _createLayoutStyles;
    private _createCellList;
    private showListContextMenu;
    private _registerNotebookOverviewRuler;
    private _registerNotebookActionsToolbar;
    private _registerNotebookStickyScroll;
    private _updateOutputRenderers;
    getDomNode(): HTMLElement;
    getOverflowContainerDomNode(): HTMLElement;
    getInnerWebview(): IWebviewElement | undefined;
    setEditorProgressService(editorProgressService: IEditorProgressService): void;
    setParentContextKeyService(parentContextKeyService: IContextKeyService): void;
    setModel(textModel: NotebookTextModel, viewState: INotebookEditorViewState | undefined, perf?: NotebookPerfMarks): Promise<void>;
    private _backgroundMarkdownRenderRunning;
    private _backgroundMarkdownRendering;
    private _backgroundMarkdownRenderingWithDeadline;
    private updateContextKeysOnFocusChange;
    setOptions(options: INotebookEditorOptions | undefined): Promise<void>;
    private _parseIndexedCellOptions;
    private _detachModel;
    private _updateForOptions;
    private _resolveWebview;
    private _ensureWebview;
    private _attachModel;
    private _bindCellListener;
    private _lastCellWithEditorFocus;
    private _validateCellFocusMode;
    private _warmupWithMarkdownRenderer;
    private _warmupViewportMarkdownCells;
    private createMarkupCellInitialization;
    restoreListViewState(viewState: INotebookEditorViewState | undefined): void;
    private _restoreSelectedKernel;
    getEditorViewState(): INotebookEditorViewState;
    private _allowScrollBeyondLastLine;
    private getBodyHeight;
    layout(dimension: DOM.Dimension, shadowElement?: HTMLElement, position?: DOM.IDomPosition): void;
    private layoutNotebook;
    private updateShadowElement;
    private layoutContainerOverShadowElement;
    focus(): void;
    onShow(): void;
    private focusEditor;
    focusContainer(clearSelection?: boolean): void;
    selectOutputContent(cell: ICellViewModel): void;
    selectInputContents(cell: ICellViewModel): void;
    onWillHide(): void;
    private clearActiveCellWidgets;
    private editorHasDomFocus;
    updateEditorFocus(): void;
    updateCellFocusMode(): void;
    hasEditorFocus(): boolean;
    hasWebviewFocus(): boolean;
    hasOutputTextSelection(): boolean;
    _didFocusOutputInputChange(hasFocus: boolean): void;
    focusElement(cell: ICellViewModel): void;
    get scrollTop(): any;
    get scrollBottom(): any;
    getAbsoluteTopOfElement(cell: ICellViewModel): any;
    getHeightOfElement(cell: ICellViewModel): any;
    scrollToBottom(): void;
    setScrollTop(scrollTop: number): void;
    revealCellRangeInView(range: ICellRange): any;
    revealInView(cell: ICellViewModel): any;
    revealInViewAtTop(cell: ICellViewModel): void;
    revealInCenter(cell: ICellViewModel): void;
    revealInCenterIfOutsideViewport(cell: ICellViewModel): Promise<void>;
    revealFirstLineIfOutsideViewport(cell: ICellViewModel): Promise<void>;
    revealLineInViewAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealLineInCenterAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealLineInCenterIfOutsideViewportAsync(cell: ICellViewModel, line: number): Promise<void>;
    revealRangeInViewAsync(cell: ICellViewModel, range: Selection | Range): Promise<void>;
    revealRangeInCenterAsync(cell: ICellViewModel, range: Selection | Range): Promise<void>;
    revealRangeInCenterIfOutsideViewportAsync(cell: ICellViewModel, range: Selection | Range): Promise<void>;
    revealCellOffsetInCenter(cell: ICellViewModel, offset: number): any;
    revealOffsetInCenterIfOutsideViewport(offset: number): any;
    getViewIndexByModelIndex(index: number): number;
    getViewHeight(cell: ICellViewModel): number;
    getCellRangeFromViewRange(startIndex: number, endIndex: number): ICellRange | undefined;
    getCellsInRange(range?: ICellRange): ReadonlyArray<ICellViewModel>;
    setCellEditorSelection(cell: ICellViewModel, range: Range): void;
    setHiddenAreas(_ranges: ICellRange[]): boolean;
    getVisibleRangesPlusViewportAboveAndBelow(): ICellRange[];
    deltaCellDecorations(oldDecorations: string[], newDecorations: INotebookDeltaDecoration[]): string[];
    deltaCellContainerClassNames(cellId: string, added: string[], removed: string[]): void;
    changeModelDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T | null;
    changeViewZones(callback: (accessor: INotebookViewZoneChangeAccessor) => void): void;
    private _loadKernelPreloads;
    get activeKernel(): any;
    cancelNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    executeNotebookCells(cells?: Iterable<ICellViewModel>): Promise<void>;
    private _pendingLayouts;
    layoutNotebookCell(cell: ICellViewModel, height: number, context?: CellLayoutContext): Promise<void>;
    getActiveCell(): any;
    private _toggleNotebookCellSelection;
    private getCellsInViewRange;
    focusNotebookCell(cell: ICellViewModel, focusItem: "editor" | "container" | "output", options?: IFocusNotebookCellOptions): Promise<void>;
    focusNextNotebookCell(cell: ICellViewModel, focusItem: "editor" | "container" | "output"): Promise<void>;
    private _warmupCell;
    private _warmupAll;
    find(query: string, options: INotebookFindOptions, token: CancellationToken, skipWarmup?: boolean, shouldGetSearchPreviewInfo?: boolean, ownerID?: string): Promise<CellFindMatchWithIndex[]>;
    findHighlightCurrent(matchIndex: number, ownerID?: string): Promise<number>;
    findUnHighlightCurrent(matchIndex: number, ownerID?: string): Promise<void>;
    findStop(ownerID?: string): void;
    getLayoutInfo(): NotebookLayoutInfo;
    createMarkupPreview(cell: MarkupCellViewModel): Promise<void>;
    private cellIsHidden;
    unhideMarkupPreviews(cells: readonly MarkupCellViewModel[]): Promise<void>;
    hideMarkupPreviews(cells: readonly MarkupCellViewModel[]): Promise<void>;
    deleteMarkupPreviews(cells: readonly MarkupCellViewModel[]): Promise<void>;
    private updateSelectedMarkdownPreviews;
    createOutput(cell: CodeCellViewModel, output: IInsetRenderOutput, offset: number, createWhenIdle: boolean): Promise<void>;
    updateOutput(cell: CodeCellViewModel, output: IInsetRenderOutput, offset: number): Promise<void>;
    copyOutputImage(cellOutput: ICellOutputViewModel): Promise<void>;
    removeInset(output: ICellOutputViewModel): void;
    hideInset(output: ICellOutputViewModel): void;
    postMessage(message: any): void;
    addClassName(className: string): void;
    removeClassName(className: string): void;
    cellAt(index: number): ICellViewModel | undefined;
    getCellByInfo(cellInfo: ICommonCellInfo): ICellViewModel;
    getCellByHandle(handle: number): ICellViewModel | undefined;
    getCellIndex(cell: ICellViewModel): any;
    getNextVisibleCellIndex(index: number): number | undefined;
    getPreviousVisibleCellIndex(index: number): number | undefined;
    private _updateScrollHeight;
    private _updateOutputHeight;
    private readonly _pendingOutputHeightAcks;
    private _scheduleOutputHeightAck;
    private _getCellById;
    private _updateMarkupCellHeight;
    private _setMarkupCellEditState;
    private _didStartDragMarkupCell;
    private _didDragMarkupCell;
    private _didDropMarkupCell;
    private _didEndDragMarkupCell;
    private _didResizeOutput;
    private _updatePerformanceMetadata;
    getContribution<T extends INotebookEditorContribution>(id: string): T;
    dispose(): void;
    toJSON(): {
        notebookUri: URI | undefined;
    };
}
export declare const notebookCellBorder: any;
export declare const focusedEditorBorderColor: any;
export declare const cellStatusIconSuccess: any;
export declare const runningCellRulerDecorationColor: any;
export declare const cellStatusIconError: any;
export declare const cellStatusIconRunning: any;
export declare const notebookOutputContainerBorderColor: any;
export declare const notebookOutputContainerColor: any;
export declare const CELL_TOOLBAR_SEPERATOR: any;
export declare const focusedCellBackground: any;
export declare const selectedCellBackground: any;
export declare const cellHoverBackground: any;
export declare const selectedCellBorder: any;
export declare const inactiveSelectedCellBorder: any;
export declare const focusedCellBorder: any;
export declare const inactiveFocusedCellBorder: any;
export declare const cellStatusBarItemHover: any;
export declare const cellInsertionIndicator: any;
export declare const listScrollbarSliderBackground: any;
export declare const listScrollbarSliderHoverBackground: any;
export declare const listScrollbarSliderActiveBackground: any;
export declare const cellSymbolHighlight: any;
export declare const cellEditorBackground: any;