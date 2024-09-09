import { DetailedLineRangeMapping, LineRangeMapping } from './rangeMapping.js';
export interface ILinesDiffComputer {
    computeDiff(originalLines: string[], modifiedLines: string[], options: ILinesDiffComputerOptions): LinesDiff;
}
export interface ILinesDiffComputerOptions {
    readonly ignoreTrimWhitespace: boolean;
    readonly maxComputationTimeMs: number;
    readonly computeMoves: boolean;
}
export declare class LinesDiff {
    readonly changes: readonly DetailedLineRangeMapping[];
    /**
     * Sorted by original line ranges.
     * The original line ranges and the modified line ranges must be disjoint (but can be touching).
     */
    readonly moves: readonly MovedText[];
    /**
     * Indicates if the time out was reached.
     * In that case, the diffs might be an approximation and the user should be asked to rerun the diff with more time.
     */
    readonly hitTimeout: boolean;
    constructor(changes: readonly DetailedLineRangeMapping[], 
    /**
     * Sorted by original line ranges.
     * The original line ranges and the modified line ranges must be disjoint (but can be touching).
     */
    moves: readonly MovedText[], 
    /**
     * Indicates if the time out was reached.
     * In that case, the diffs might be an approximation and the user should be asked to rerun the diff with more time.
     */
    hitTimeout: boolean);
}
export declare class MovedText {
    readonly lineRangeMapping: LineRangeMapping;
    /**
     * The diff from the original text to the moved text.
     * Must be contained in the original/modified line range.
     * Can be empty if the text didn't change (only moved).
     */
    readonly changes: readonly DetailedLineRangeMapping[];
    constructor(lineRangeMapping: LineRangeMapping, changes: readonly DetailedLineRangeMapping[]);
    flip(): MovedText;
}
