import { Position } from "./position.js";
import { Range } from "./range.js";
/**
 * Represents a non-negative length of text in terms of line and column count.
 */
export declare class TextLength {
    readonly lineCount: number;
    readonly columnCount: number;
    static zero: TextLength;
    static lengthDiffNonNegative(start: TextLength, end: TextLength): TextLength;
    static betweenPositions(position1: Position, position2: Position): TextLength;
    static ofRange(range: Range): TextLength;
    static ofText(text: string): TextLength;
    constructor(lineCount: number, columnCount: number);
    isZero(): boolean;
    isLessThan(other: TextLength): boolean;
    isGreaterThan(other: TextLength): boolean;
    isGreaterThanOrEqualTo(other: TextLength): boolean;
    equals(other: TextLength): boolean;
    compare(other: TextLength): number;
    add(other: TextLength): TextLength;
    createRange(startPosition: Position): Range;
    toRange(): Range;
    addToPosition(position: Position): Position;
    toString(): string;
}
