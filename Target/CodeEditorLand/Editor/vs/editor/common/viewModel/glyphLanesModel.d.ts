import { Range } from "vs/editor/common/core/range";
import { GlyphMarginLane, IGlyphMarginLanesModel } from "vs/editor/common/model";
export declare class GlyphMarginLanesModel implements IGlyphMarginLanesModel {
    private lanes;
    private persist;
    private _requiredLanes;
    constructor(maxLine: number);
    reset(maxLine: number): void;
    get requiredLanes(): number;
    push(lane: GlyphMarginLane, range: Range, persist?: boolean): void;
    getLanesAtLine(lineNumber: number): GlyphMarginLane[];
    private countAtLine;
}
