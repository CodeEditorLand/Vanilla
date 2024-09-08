import { type FastDomNode } from "../../../../base/browser/fastDomNode.js";
import type { IMouseWheelEvent } from "../../../../base/browser/mouseEvent.js";
import { type IOverviewRulerLayoutInfo } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import type * as viewEvents from "../../../common/viewEvents.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
export declare class EditorScrollbar extends ViewPart {
    private readonly scrollbar;
    private readonly scrollbarDomNode;
    constructor(context: ViewContext, linesContent: FastDomNode<HTMLElement>, viewDomNode: FastDomNode<HTMLElement>, overflowGuardDomNode: FastDomNode<HTMLElement>);
    dispose(): void;
    private _setLayout;
    getOverviewRulerLayoutInfo(): IOverviewRulerLayoutInfo;
    getDomNode(): FastDomNode<HTMLElement>;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
