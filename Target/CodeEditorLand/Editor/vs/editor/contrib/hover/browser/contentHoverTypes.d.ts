import { HoverAnchor, IHoverPart } from "vs/editor/contrib/hover/browser/hoverTypes";
export declare class HoverResult {
    readonly anchor: HoverAnchor;
    readonly hoverParts: IHoverPart[];
    readonly isComplete: boolean;
    constructor(anchor: HoverAnchor, hoverParts: IHoverPart[], isComplete: boolean);
    filter(anchor: HoverAnchor): HoverResult;
}
export declare class FilteredHoverResult extends HoverResult {
    private readonly original;
    constructor(original: HoverResult, anchor: HoverAnchor, messages: IHoverPart[], isComplete: boolean);
    filter(anchor: HoverAnchor): HoverResult;
}
