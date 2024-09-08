import { type INewScrollPosition, type ScrollEvent, type Scrollable } from "../../../common/scrollable.js";
import { AbstractScrollbar, type ISimplifiedPointerEvent, type ScrollbarHost } from "./abstractScrollbar.js";
import type { ScrollableElementResolvedOptions } from "./scrollableElementOptions.js";
export declare class VerticalScrollbar extends AbstractScrollbar {
    constructor(scrollable: Scrollable, options: ScrollableElementResolvedOptions, host: ScrollbarHost);
    protected _updateSlider(sliderSize: number, sliderPosition: number): void;
    protected _renderDomNode(largeSize: number, smallSize: number): void;
    onDidScroll(e: ScrollEvent): boolean;
    protected _pointerDownRelativePosition(offsetX: number, offsetY: number): number;
    protected _sliderPointerPosition(e: ISimplifiedPointerEvent): number;
    protected _sliderOrthogonalPointerPosition(e: ISimplifiedPointerEvent): number;
    protected _updateScrollbarSize(size: number): void;
    writeScrollPosition(target: INewScrollPosition, scrollPosition: number): void;
    updateOptions(options: ScrollableElementResolvedOptions): void;
}
