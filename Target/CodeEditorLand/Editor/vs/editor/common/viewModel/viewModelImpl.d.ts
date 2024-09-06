import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IEditorConfiguration } from "vs/editor/common/config/editorConfiguration";
import { IPosition, Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { ISelection, Selection } from "vs/editor/common/core/selection";
import { CursorConfiguration, CursorState, EditOperationType, IColumnSelectData, PartialCursorState } from "vs/editor/common/cursorCommon";
import { CursorChangeReason } from "vs/editor/common/cursorEvents";
import { ICommand, ICursorState, IViewState, ScrollType } from "vs/editor/common/editorCommon";
import { EditorTheme } from "vs/editor/common/editorTheme";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { EndOfLinePreference, IAttachedView, ICursorStateComputer, IGlyphMarginLanesModel, IIdentifiedSingleEditOperation, ITextModel, PositionAffinity } from "vs/editor/common/model";
import { ILineBreaksComputer, ILineBreaksComputerFactory, InjectedText } from "vs/editor/common/modelLineProjectionData";
import { BracketGuideOptions, IActiveIndentGuideInfo, IndentGuide } from "vs/editor/common/textModelGuides";
import { ViewEventHandler } from "vs/editor/common/viewEventHandler";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewLayout } from "vs/editor/common/viewLayout/viewLayout";
import { ICoordinatesConverter, IViewModel, IWhitespaceChangeAccessor, MinimapLinesRenderingData, OverviewRulerDecorationsGroup, ViewLineData, ViewLineRenderingData, ViewModelDecoration } from "vs/editor/common/viewModel";
import { OutgoingViewModelEvent } from "vs/editor/common/viewModelEventDispatcher";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class ViewModel extends Disposable implements IViewModel {
    private readonly languageConfigurationService;
    private readonly _themeService;
    private readonly _attachedView;
    private readonly _transactionalTarget;
    private readonly _editorId;
    private readonly _configuration;
    readonly model: ITextModel;
    private readonly _eventDispatcher;
    readonly onEvent: Event<OutgoingViewModelEvent>;
    cursorConfig: CursorConfiguration;
    private readonly _updateConfigurationViewLineCount;
    private _hasFocus;
    private readonly _viewportStart;
    private readonly _lines;
    readonly coordinatesConverter: ICoordinatesConverter;
    readonly viewLayout: ViewLayout;
    private readonly _cursor;
    private readonly _decorations;
    readonly glyphLanes: IGlyphMarginLanesModel;
    constructor(editorId: number, configuration: IEditorConfiguration, model: ITextModel, domLineBreaksComputerFactory: ILineBreaksComputerFactory, monospaceLineBreaksComputerFactory: ILineBreaksComputerFactory, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable, languageConfigurationService: ILanguageConfigurationService, _themeService: IThemeService, _attachedView: IAttachedView, _transactionalTarget: IBatchableTarget);
    dispose(): void;
    createLineBreaksComputer(): ILineBreaksComputer;
    addViewEventHandler(eventHandler: ViewEventHandler): void;
    removeViewEventHandler(eventHandler: ViewEventHandler): void;
    private _updateConfigurationViewLineCountNow;
    private getModelVisibleRanges;
    visibleLinesStabilized(): void;
    private _handleVisibleLinesChanged;
    setHasFocus(hasFocus: boolean): void;
    onCompositionStart(): void;
    onCompositionEnd(): void;
    private _captureStableViewport;
    private _onConfigurationChanged;
    private _registerModelEvents;
    private readonly hiddenAreasModel;
    private previousHiddenAreas;
    setHiddenAreas(ranges: Range[], source?: unknown): void;
    getVisibleRangesPlusViewportAboveBelow(): Range[];
    getVisibleRanges(): Range[];
    getHiddenAreas(): Range[];
    private _toModelVisibleRanges;
    getCompletelyVisibleViewRange(): Range;
    getCompletelyVisibleViewRangeAtScrollTop(scrollTop: number): Range;
    saveState(): IViewState;
    reduceRestoreState(state: IViewState): {
        scrollLeft: number;
        scrollTop: number;
    };
    private _reduceRestoreStateCompatibility;
    private getTabSize;
    getLineCount(): number;
    /**
     * Gives a hint that a lot of requests are about to come in for these line numbers.
     */
    setViewport(startLineNumber: number, endLineNumber: number, centeredLineNumber: number): void;
    getActiveIndentGuide(lineNumber: number, minLineNumber: number, maxLineNumber: number): IActiveIndentGuideInfo;
    getLinesIndentGuides(startLineNumber: number, endLineNumber: number): number[];
    getBracketGuidesInRangeByLine(startLineNumber: number, endLineNumber: number, activePosition: IPosition | null, options: BracketGuideOptions): IndentGuide[][];
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    getMinimapDecorationsInRange(range: Range): ViewModelDecoration[];
    getDecorationsInViewport(visibleRange: Range): ViewModelDecoration[];
    getInjectedTextAt(viewPosition: Position): InjectedText | null;
    getViewportViewLineRenderingData(visibleRange: Range, lineNumber: number): ViewLineRenderingData;
    getViewLineRenderingData(lineNumber: number): ViewLineRenderingData;
    private _getViewLineRenderingData;
    getViewLineData(lineNumber: number): ViewLineData;
    getMinimapLinesRenderingData(startLineNumber: number, endLineNumber: number, needed: boolean[]): MinimapLinesRenderingData;
    getAllOverviewRulerDecorations(theme: EditorTheme): OverviewRulerDecorationsGroup[];
    private _invalidateDecorationsColorCache;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    modifyPosition(position: Position, offset: number): Position;
    deduceModelPositionRelativeToViewPosition(viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position;
    getPlainTextToCopy(modelRanges: Range[], emptySelectionClipboard: boolean, forceCRLF: boolean): string | string[];
    getRichTextToCopy(modelRanges: Range[], emptySelectionClipboard: boolean): {
        html: string;
        mode: string;
    } | null;
    private _getHTMLToCopy;
    private _getColorMap;
    getPrimaryCursorState(): CursorState;
    getLastAddedCursorIndex(): number;
    getCursorStates(): CursorState[];
    setCursorStates(source: string | null | undefined, reason: CursorChangeReason, states: PartialCursorState[] | null): boolean;
    getCursorColumnSelectData(): IColumnSelectData;
    getCursorAutoClosedCharacters(): Range[];
    setCursorColumnSelectData(columnSelectData: IColumnSelectData): void;
    getPrevEditOperationType(): EditOperationType;
    setPrevEditOperationType(type: EditOperationType): void;
    getSelection(): Selection;
    getSelections(): Selection[];
    getPosition(): Position;
    setSelections(source: string | null | undefined, selections: readonly ISelection[], reason?: any): void;
    saveCursorState(): ICursorState[];
    restoreCursorState(states: ICursorState[]): void;
    private _executeCursorEdit;
    executeEdits(source: string | null | undefined, edits: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer): void;
    startComposition(): void;
    endComposition(source?: string | null | undefined): void;
    type(text: string, source?: string | null | undefined): void;
    compositionType(text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number, source?: string | null | undefined): void;
    paste(text: string, pasteOnNewLine: boolean, multicursorText?: string[] | null | undefined, source?: string | null | undefined): void;
    cut(source?: string | null | undefined): void;
    executeCommand(command: ICommand, source?: string | null | undefined): void;
    executeCommands(commands: ICommand[], source?: string | null | undefined): void;
    revealAllCursors(source: string | null | undefined, revealHorizontal: boolean, minimalReveal?: boolean): void;
    revealPrimaryCursor(source: string | null | undefined, revealHorizontal: boolean, minimalReveal?: boolean): void;
    revealTopMostCursor(source: string | null | undefined): void;
    revealBottomMostCursor(source: string | null | undefined): void;
    revealRange(source: string | null | undefined, revealHorizontal: boolean, viewRange: Range, verticalType: viewEvents.VerticalRevealType, scrollType: ScrollType): void;
    changeWhitespace(callback: (accessor: IWhitespaceChangeAccessor) => void): void;
    private _withViewEventsCollector;
    batchEvents(callback: () => void): void;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    /**
     * Gets the column at which indentation stops at a given line.
     * @internal
     */
    getLineIndentColumn(lineNumber: number): number;
}
export interface IBatchableTarget {
    /**
     * Allows the target to apply the changes introduced by the callback in a batch.
     */
    batchChanges<T>(cb: () => T): T;
}
