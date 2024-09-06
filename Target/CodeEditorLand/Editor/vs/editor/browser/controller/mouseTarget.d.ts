import { IPointerHandlerHelper } from "vs/editor/browser/controller/mouseHandler";
import { IMouseTarget, IMouseTargetContentEmpty, IMouseTargetContentEmptyData, IMouseTargetContentText, IMouseTargetContentTextData, IMouseTargetContentWidget, IMouseTargetMargin, IMouseTargetMarginData, IMouseTargetOutsideEditor, IMouseTargetOverlayWidget, IMouseTargetScrollbar, IMouseTargetTextarea, IMouseTargetUnknown, IMouseTargetViewZone, IMouseTargetViewZoneData, MouseTargetType } from "vs/editor/browser/editorBrowser";
import { CoordinatesRelativeToEditor, EditorMouseEvent, EditorPagePosition, PageCoordinates } from "vs/editor/browser/editorDom";
import { HorizontalPosition } from "vs/editor/browser/view/renderingContext";
import { IViewCursorRenderData } from "vs/editor/browser/viewParts/viewCursors/viewCursor";
import { EditorLayoutInfo } from "vs/editor/common/config/editorOptions";
import { Position } from "vs/editor/common/core/position";
import { Range as EditorRange } from "vs/editor/common/core/range";
import { InjectedText } from "vs/editor/common/modelLineProjectionData";
import { IViewModel } from "vs/editor/common/viewModel";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
declare const enum HitTestResultType {
    Unknown = 0,
    Content = 1
}
declare class UnknownHitTestResult {
    readonly hitTarget: HTMLElement | null;
    readonly type = HitTestResultType.Unknown;
    constructor(hitTarget?: HTMLElement | null);
}
declare class ContentHitTestResult {
    readonly position: Position;
    readonly spanNode: HTMLElement;
    readonly injectedText: InjectedText | null;
    readonly type = HitTestResultType.Content;
    get hitTarget(): HTMLElement;
    constructor(position: Position, spanNode: HTMLElement, injectedText: InjectedText | null);
}
type HitTestResult = UnknownHitTestResult | ContentHitTestResult;
declare namespace HitTestResult {
    function createFromDOMInfo(ctx: HitTestContext, spanNode: HTMLElement, offset: number): HitTestResult;
}
export declare class PointerHandlerLastRenderData {
    readonly lastViewCursorsRenderData: IViewCursorRenderData[];
    readonly lastTextareaPosition: Position | null;
    constructor(lastViewCursorsRenderData: IViewCursorRenderData[], lastTextareaPosition: Position | null);
}
export declare class MouseTarget {
    private static _deduceRage;
    static createUnknown(element: HTMLElement | null, mouseColumn: number, position: Position | null): IMouseTargetUnknown;
    static createTextarea(element: HTMLElement | null, mouseColumn: number): IMouseTargetTextarea;
    static createMargin(type: MouseTargetType.GUTTER_GLYPH_MARGIN | MouseTargetType.GUTTER_LINE_NUMBERS | MouseTargetType.GUTTER_LINE_DECORATIONS, element: HTMLElement | null, mouseColumn: number, position: Position, range: EditorRange, detail: IMouseTargetMarginData): IMouseTargetMargin;
    static createViewZone(type: MouseTargetType.GUTTER_VIEW_ZONE | MouseTargetType.CONTENT_VIEW_ZONE, element: HTMLElement | null, mouseColumn: number, position: Position, detail: IMouseTargetViewZoneData): IMouseTargetViewZone;
    static createContentText(element: HTMLElement | null, mouseColumn: number, position: Position, range: EditorRange | null, detail: IMouseTargetContentTextData): IMouseTargetContentText;
    static createContentEmpty(element: HTMLElement | null, mouseColumn: number, position: Position, detail: IMouseTargetContentEmptyData): IMouseTargetContentEmpty;
    static createContentWidget(element: HTMLElement | null, mouseColumn: number, detail: string): IMouseTargetContentWidget;
    static createScrollbar(element: HTMLElement | null, mouseColumn: number, position: Position): IMouseTargetScrollbar;
    static createOverlayWidget(element: HTMLElement | null, mouseColumn: number, detail: string): IMouseTargetOverlayWidget;
    static createOutsideEditor(mouseColumn: number, position: Position, outsidePosition: "above" | "below" | "left" | "right", outsideDistance: number): IMouseTargetOutsideEditor;
    private static _typeToString;
    static toString(target: IMouseTarget): string;
}
export declare class HitTestContext {
    readonly viewModel: IViewModel;
    readonly layoutInfo: EditorLayoutInfo;
    readonly viewDomNode: HTMLElement;
    readonly lineHeight: number;
    readonly stickyTabStops: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly lastRenderData: PointerHandlerLastRenderData;
    private readonly _context;
    private readonly _viewHelper;
    constructor(context: ViewContext, viewHelper: IPointerHandlerHelper, lastRenderData: PointerHandlerLastRenderData);
    getZoneAtCoord(mouseVerticalOffset: number): IMouseTargetViewZoneData | null;
    static getZoneAtCoord(context: ViewContext, mouseVerticalOffset: number): IMouseTargetViewZoneData | null;
    getFullLineRangeAtCoord(mouseVerticalOffset: number): {
        range: EditorRange;
        isAfterLines: boolean;
    };
    getLineNumberAtVerticalOffset(mouseVerticalOffset: number): number;
    isAfterLines(mouseVerticalOffset: number): boolean;
    isInTopPadding(mouseVerticalOffset: number): boolean;
    isInBottomPadding(mouseVerticalOffset: number): boolean;
    getVerticalOffsetForLineNumber(lineNumber: number): number;
    findAttribute(element: Element, attr: string): string | null;
    private static _findAttribute;
    getLineWidth(lineNumber: number): number;
    visibleRangeForPosition(lineNumber: number, column: number): HorizontalPosition | null;
    getPositionFromDOMInfo(spanNode: HTMLElement, offset: number): Position | null;
    getCurrentScrollTop(): number;
    getCurrentScrollLeft(): number;
}
declare abstract class BareHitTestRequest {
    readonly editorPos: EditorPagePosition;
    readonly pos: PageCoordinates;
    readonly relativePos: CoordinatesRelativeToEditor;
    readonly mouseVerticalOffset: number;
    readonly isInMarginArea: boolean;
    readonly isInContentArea: boolean;
    readonly mouseContentHorizontalOffset: number;
    protected readonly mouseColumn: number;
    constructor(ctx: HitTestContext, editorPos: EditorPagePosition, pos: PageCoordinates, relativePos: CoordinatesRelativeToEditor);
}
export declare class MouseTargetFactory {
    private readonly _context;
    private readonly _viewHelper;
    constructor(context: ViewContext, viewHelper: IPointerHandlerHelper);
    mouseTargetIsWidget(e: EditorMouseEvent): boolean;
    createMouseTarget(lastRenderData: PointerHandlerLastRenderData, editorPos: EditorPagePosition, pos: PageCoordinates, relativePos: CoordinatesRelativeToEditor, target: HTMLElement | null): IMouseTarget;
    private static _createMouseTarget;
    private static _hitTestContentWidget;
    private static _hitTestOverlayWidget;
    private static _hitTestViewCursor;
    private static _hitTestViewZone;
    private static _hitTestTextArea;
    private static _hitTestMargin;
    private static _hitTestViewLines;
    private static _hitTestMinimap;
    private static _hitTestScrollbarSlider;
    private static _hitTestScrollbar;
    getMouseColumn(relativePos: CoordinatesRelativeToEditor): number;
    static _getMouseColumn(mouseContentHorizontalOffset: number, typicalHalfwidthCharacterWidth: number): number;
    private static createMouseTargetFromHitTestPosition;
    /**
     * Most probably WebKit browsers and Edge
     */
    private static _doHitTestWithCaretRangeFromPoint;
    private static _actualDoHitTestWithCaretRangeFromPoint;
    /**
     * Most probably Gecko
     */
    private static _doHitTestWithCaretPositionFromPoint;
    private static _snapToSoftTabBoundary;
    static doHitTest(ctx: HitTestContext, request: BareHitTestRequest): HitTestResult;
}
export {};
