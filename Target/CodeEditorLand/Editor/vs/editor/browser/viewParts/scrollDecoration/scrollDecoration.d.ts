import "vs/css!./scrollDecoration";
import { FastDomNode } from "vs/base/browser/fastDomNode";
import { RenderingContext, RestrictedRenderingContext } from "vs/editor/browser/view/renderingContext";
import { ViewPart } from "vs/editor/browser/view/viewPart";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
export declare class ScrollDecorationViewPart extends ViewPart {
    private readonly _domNode;
    private _scrollTop;
    private _width;
    private _shouldShow;
    private _useShadows;
    constructor(context: ViewContext);
    dispose(): void;
    private _updateShouldShow;
    getDomNode(): FastDomNode<HTMLElement>;
    private _updateWidth;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
