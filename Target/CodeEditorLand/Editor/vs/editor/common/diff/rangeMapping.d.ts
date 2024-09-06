import { LineRange } from "../core/lineRange.js";
import { Range } from "../core/range.js";
import { AbstractText, SingleTextEdit } from "../core/textEdit.js";
/**
 * Maps a line range in the original text model to a line range in the modified text model.
 */
export declare class LineRangeMapping {
    static inverse(mapping: readonly LineRangeMapping[], originalLineCount: number, modifiedLineCount: number): LineRangeMapping[];
    static clip(mapping: readonly LineRangeMapping[], originalRange: LineRange, modifiedRange: LineRange): LineRangeMapping[];
    /**
     * The line range in the original text model.
     */
    readonly original: LineRange;
    /**
     * The line range in the modified text model.
     */
    readonly modified: LineRange;
    constructor(originalRange: LineRange, modifiedRange: LineRange);
    toString(): string;
    flip(): LineRangeMapping;
    join(other: LineRangeMapping): LineRangeMapping;
    get changedLineCount(): number;
    /**
     * This method assumes that the LineRangeMapping describes a valid diff!
     * I.e. if one range is empty, the other range cannot be the entire document.
     * It avoids various problems when the line range points to non-existing line-numbers.
     */
    toRangeMapping(): RangeMapping;
    /**
     * This method assumes that the LineRangeMapping describes a valid diff!
     * I.e. if one range is empty, the other range cannot be the entire document.
     * It avoids various problems when the line range points to non-existing line-numbers.
     */
    toRangeMapping2(original: string[], modified: string[]): RangeMapping;
}
/**
 * Maps a line range in the original text model to a line range in the modified text model.
 * Also contains inner range mappings.
 */
export declare class DetailedLineRangeMapping extends LineRangeMapping {
    static fromRangeMappings(rangeMappings: RangeMapping[]): DetailedLineRangeMapping;
    /**
     * If inner changes have not been computed, this is set to undefined.
     * Otherwise, it represents the character-level diff in this line range.
     * The original range of each range mapping should be contained in the original line range (same for modified), exceptions are new-lines.
     * Must not be an empty array.
     */
    readonly innerChanges: RangeMapping[] | undefined;
    constructor(originalRange: LineRange, modifiedRange: LineRange, innerChanges: RangeMapping[] | undefined);
    flip(): DetailedLineRangeMapping;
    withInnerChangesFromLineRanges(): DetailedLineRangeMapping;
}
/**
 * Maps a range in the original text model to a range in the modified text model.
 */
export declare class RangeMapping {
    static assertSorted(rangeMappings: RangeMapping[]): void;
    /**
     * The original range.
     */
    readonly originalRange: Range;
    /**
     * The modified range.
     */
    readonly modifiedRange: Range;
    constructor(originalRange: Range, modifiedRange: Range);
    toString(): string;
    flip(): RangeMapping;
    /**
     * Creates a single text edit that describes the change from the original to the modified text.
     */
    toTextEdit(modified: AbstractText): SingleTextEdit;
}
