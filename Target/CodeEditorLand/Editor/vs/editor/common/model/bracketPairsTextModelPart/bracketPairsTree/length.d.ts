import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { TextLength } from "vs/editor/common/core/textLength";
/**
 * The end must be greater than or equal to the start.
 */
export declare function lengthDiff(startLineCount: number, startColumnCount: number, endLineCount: number, endColumnCount: number): Length;
/**
 * Represents a non-negative length in terms of line and column count.
 * Does not allocate.
 */
export type Length = {
    _brand: "Length";
};
export declare const lengthZero: Length;
export declare function lengthIsZero(length: Length): boolean;
export declare function toLength(lineCount: number, columnCount: number): Length;
export declare function lengthToObj(length: Length): TextLength;
export declare function lengthGetLineCount(length: Length): number;
/**
 * Returns the amount of columns of the given length, assuming that it does not span any line.
 */
export declare function lengthGetColumnCountIfZeroLineCount(length: Length): number;
export declare function lengthAdd(length1: Length, length2: Length): Length;
export declare function sumLengths<T>(items: readonly T[], lengthFn: (item: T) => Length): Length;
export declare function lengthEquals(length1: Length, length2: Length): boolean;
/**
 * Returns a non negative length `result` such that `lengthAdd(length1, result) = length2`, or zero if such length does not exist.
 */
export declare function lengthDiffNonNegative(length1: Length, length2: Length): Length;
export declare function lengthLessThan(length1: Length, length2: Length): boolean;
export declare function lengthLessThanEqual(length1: Length, length2: Length): boolean;
export declare function lengthGreaterThanEqual(length1: Length, length2: Length): boolean;
export declare function lengthToPosition(length: Length): Position;
export declare function positionToLength(position: Position): Length;
export declare function lengthsToRange(lengthStart: Length, lengthEnd: Length): Range;
export declare function lengthOfRange(range: Range): TextLength;
export declare function lengthCompare(length1: Length, length2: Length): number;
export declare function lengthOfString(str: string): Length;
export declare function lengthOfStringObj(str: string): TextLength;
/**
 * Computes a numeric hash of the given length.
 */
export declare function lengthHash(length: Length): number;
export declare function lengthMax(length1: Length, length2: Length): Length;
