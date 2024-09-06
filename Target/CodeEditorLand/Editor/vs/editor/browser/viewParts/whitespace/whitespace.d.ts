import "vs/css!./whitespace";
import { DynamicViewOverlay } from "vs/editor/browser/view/dynamicViewOverlay";
import { RenderingContext } from "vs/editor/browser/view/renderingContext";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
export declare class WhitespaceOverlay extends DynamicViewOverlay {
    private readonly _context;
    private _options;
    private _selection;
    private _renderResult;
    constructor(context: ViewContext);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    private _applyRenderWhitespace;
    private _renderArrow;
    render(startLineNumber: number, lineNumber: number): string;
}
