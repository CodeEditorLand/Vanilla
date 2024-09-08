import { type FastDomNode } from "../../../../base/browser/fastDomNode.js";
import "./blockDecorations.css";
import type * as viewEvents from "../../../common/viewEvents.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
export declare class BlockDecorations extends ViewPart {
    domNode: FastDomNode<HTMLElement>;
    private readonly blocks;
    private contentWidth;
    private contentLeft;
    constructor(context: ViewContext);
    private update;
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
