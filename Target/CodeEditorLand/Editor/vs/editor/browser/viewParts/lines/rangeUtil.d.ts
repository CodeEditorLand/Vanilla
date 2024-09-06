import { FloatHorizontalRange } from "vs/editor/browser/view/renderingContext";
import { DomReadingContext } from "vs/editor/browser/viewParts/lines/domReadingContext";
export declare class RangeUtil {
    /**
     * Reusing the same range here
     * because IE is buggy and constantly freezes when using a large number
     * of ranges and calling .detach on them
     */
    private static _handyReadyRange;
    private static _createRange;
    private static _detachRange;
    private static _readClientRects;
    private static _mergeAdjacentRanges;
    private static _createHorizontalRangesFromClientRects;
    static readHorizontalRanges(domNode: HTMLElement, startChildIndex: number, startOffset: number, endChildIndex: number, endOffset: number, context: DomReadingContext): FloatHorizontalRange[] | null;
}
