import "vs/css!./currentLineHighlight";
import { DynamicViewOverlay } from "vs/editor/browser/view/dynamicViewOverlay";
import { RenderingContext } from "vs/editor/browser/view/renderingContext";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
export declare abstract class AbstractLineHighlightOverlay extends DynamicViewOverlay {
    private readonly _context;
    protected _renderLineHighlight: "none" | "gutter" | "line" | "all";
    protected _wordWrap: boolean;
    protected _contentLeft: number;
    protected _contentWidth: number;
    protected _selectionIsEmpty: boolean;
    protected _renderLineHighlightOnlyWhenFocus: boolean;
    protected _focused: boolean;
    /**
     * Unique sorted list of view line numbers which have cursors sitting on them.
     */
    private _cursorLineNumbers;
    private _selections;
    private _renderData;
    constructor(context: ViewContext);
    dispose(): void;
    private _readFromSelections;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
    protected _shouldRenderInMargin(): boolean;
    protected _shouldRenderInContent(): boolean;
    protected abstract _shouldRenderThis(): boolean;
    protected abstract _shouldRenderOther(): boolean;
    protected abstract _renderOne(ctx: RenderingContext, exact: boolean): string;
}
export declare class CurrentLineHighlightOverlay extends AbstractLineHighlightOverlay {
    protected _renderOne(ctx: RenderingContext, exact: boolean): string;
    protected _shouldRenderThis(): boolean;
    protected _shouldRenderOther(): boolean;
}
export declare class CurrentLineMarginHighlightOverlay extends AbstractLineHighlightOverlay {
    protected _renderOne(ctx: RenderingContext, exact: boolean): string;
    protected _shouldRenderThis(): boolean;
    protected _shouldRenderOther(): boolean;
}
