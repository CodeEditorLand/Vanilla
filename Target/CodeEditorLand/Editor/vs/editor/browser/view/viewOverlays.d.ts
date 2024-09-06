import { FastDomNode } from "vs/base/browser/fastDomNode";
import { DynamicViewOverlay } from "vs/editor/browser/view/dynamicViewOverlay";
import { RenderingContext, RestrictedRenderingContext } from "vs/editor/browser/view/renderingContext";
import { IVisibleLine } from "vs/editor/browser/view/viewLayer";
import { ViewPart } from "vs/editor/browser/view/viewPart";
import { StringBuilder } from "vs/editor/common/core/stringBuilder";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewportData } from "vs/editor/common/viewLayout/viewLinesViewportData";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
export declare class ViewOverlays extends ViewPart {
    private readonly _visibleLines;
    protected readonly domNode: FastDomNode<HTMLElement>;
    private _dynamicOverlays;
    private _isFocused;
    constructor(context: ViewContext);
    shouldRender(): boolean;
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    addDynamicOverlay(overlay: DynamicViewOverlay): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    _viewOverlaysRender(ctx: RestrictedRenderingContext): void;
}
export declare class ViewOverlayLine implements IVisibleLine {
    private readonly _dynamicOverlays;
    private _domNode;
    private _renderedContent;
    constructor(dynamicOverlays: DynamicViewOverlay[]);
    getDomNode(): HTMLElement | null;
    setDomNode(domNode: HTMLElement): void;
    onContentChanged(): void;
    onTokensChanged(): void;
    renderLine(lineNumber: number, deltaTop: number, lineHeight: number, viewportData: ViewportData, sb: StringBuilder): boolean;
    layoutLine(lineNumber: number, deltaTop: number, lineHeight: number): void;
}
export declare class ContentViewOverlays extends ViewOverlays {
    private _contentWidth;
    constructor(context: ViewContext);
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    _viewOverlaysRender(ctx: RestrictedRenderingContext): void;
}
export declare class MarginViewOverlays extends ViewOverlays {
    private _contentLeft;
    constructor(context: ViewContext);
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    _viewOverlaysRender(ctx: RestrictedRenderingContext): void;
}
