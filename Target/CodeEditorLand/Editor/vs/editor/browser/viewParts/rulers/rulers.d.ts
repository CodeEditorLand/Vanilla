import "./rulers.css";
import { type FastDomNode } from "../../../../base/browser/fastDomNode.js";
import type * as viewEvents from "../../../common/viewEvents.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
export declare class Rulers extends ViewPart {
    domNode: FastDomNode<HTMLElement>;
    private readonly _renderedRulers;
    private _rulers;
    private _typicalHalfwidthCharacterWidth;
    constructor(context: ViewContext);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    private _ensureRulersCount;
    render(ctx: RestrictedRenderingContext): void;
}