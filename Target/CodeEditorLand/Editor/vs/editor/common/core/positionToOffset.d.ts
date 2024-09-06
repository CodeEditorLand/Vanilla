import { OffsetRange } from "vs/editor/common/core/offsetRange";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { TextLength } from "vs/editor/common/core/textLength";
export declare class PositionOffsetTransformer {
    readonly text: string;
    private readonly lineStartOffsetByLineIdx;
    constructor(text: string);
    getOffset(position: Position): number;
    getOffsetRange(range: Range): OffsetRange;
    getPosition(offset: number): Position;
    getRange(offsetRange: OffsetRange): Range;
    getTextLength(offsetRange: OffsetRange): TextLength;
    get textLength(): TextLength;
}
