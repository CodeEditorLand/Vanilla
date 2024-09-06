import "vs/css!./margin";
import { FastDomNode } from "vs/base/browser/fastDomNode";
import { RenderingContext, RestrictedRenderingContext } from "vs/editor/browser/view/renderingContext";
import { ViewPart } from "vs/editor/browser/view/viewPart";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
export declare class Margin extends ViewPart {
    static readonly CLASS_NAME = "glyph-margin";
    static readonly OUTER_CLASS_NAME = "margin";
    private readonly _domNode;
    private _canUseLayerHinting;
    private _contentLeft;
    private _glyphMarginLeft;
    private _glyphMarginWidth;
    private _glyphMarginBackgroundDomNode;
    constructor(context: ViewContext);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
