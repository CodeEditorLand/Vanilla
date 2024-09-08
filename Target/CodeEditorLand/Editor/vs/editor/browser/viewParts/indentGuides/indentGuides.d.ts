import "./indentGuides.css";
import type * as viewEvents from "../../../common/viewEvents.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import { DynamicViewOverlay } from "../../view/dynamicViewOverlay.js";
import type { RenderingContext } from "../../view/renderingContext.js";
export declare class IndentGuidesOverlay extends DynamicViewOverlay {
    private readonly _context;
    private _primaryPosition;
    private _spaceWidth;
    private _renderResult;
    private _maxIndentLeft;
    private _bracketPairGuideOptions;
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
    onLanguageConfigurationChanged(e: viewEvents.ViewLanguageConfigurationEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    private getGuidesByLine;
    render(startLineNumber: number, lineNumber: number): string;
}