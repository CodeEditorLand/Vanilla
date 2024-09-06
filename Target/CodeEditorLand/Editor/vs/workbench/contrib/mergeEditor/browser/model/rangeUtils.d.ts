import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { TextLength } from "vs/editor/common/core/textLength";
export declare function rangeContainsPosition(range: Range, position: Position): boolean;
export declare function lengthOfRange(range: Range): TextLength;
export declare function lengthBetweenPositions(position1: Position, position2: Position): TextLength;
export declare function addLength(position: Position, length: TextLength): Position;
export declare function rangeIsBeforeOrTouching(range: Range, other: Range): boolean;
