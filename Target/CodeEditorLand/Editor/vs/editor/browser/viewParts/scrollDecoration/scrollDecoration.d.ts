import "./scrollDecoration.css";
import { type FastDomNode } from "../../../../base/browser/fastDomNode.js";
import type * as viewEvents from "../../../common/viewEvents.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
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
