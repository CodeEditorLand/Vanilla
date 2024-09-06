import { FastDomNode } from "vs/base/browser/fastDomNode";
import { IMouseWheelEvent } from "vs/base/browser/mouseEvent";
import { IOverviewRulerLayoutInfo } from "vs/base/browser/ui/scrollbar/scrollableElement";
import { RenderingContext, RestrictedRenderingContext } from "vs/editor/browser/view/renderingContext";
import { ViewPart } from "vs/editor/browser/view/viewPart";
import * as viewEvents from "vs/editor/common/viewEvents";
import { ViewContext } from "vs/editor/common/viewModel/viewContext";
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
