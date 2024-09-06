export interface IOffsetRange {
    readonly start: number;
    readonly endExclusive: number;
}
/**
 * A range of offsets (0-based).
 */
export declare class OffsetRange implements IOffsetRange {
    readonly start: number;
    readonly endExclusive: number;
    static addRange(range: OffsetRange, sortedRanges: OffsetRange[]): void;
    static tryCreate(start: number, endExclusive: number): OffsetRange | undefined;
    static ofLength(length: number): OffsetRange;
    static ofStartAndLength(start: number, length: number): OffsetRange;
    constructor(start: number, endExclusive: number);
    get isEmpty(): boolean;
    delta(offset: number): OffsetRange;
    deltaStart(offset: number): OffsetRange;
    deltaEnd(offset: number): OffsetRange;
    get length(): number;
    toString(): string;
    equals(other: OffsetRange): boolean;
    containsRange(other: OffsetRange): boolean;
    contains(offset: number): boolean;
    /**
     * for all numbers n: range1.contains(n) or range2.contains(n) => range1.join(range2).contains(n)
     * The joined range is the smallest range that contains both ranges.
     */
    join(other: OffsetRange): OffsetRange;
    /**
     * for all numbers n: range1.contains(n) and range2.contains(n) <=> range1.intersect(range2).contains(n)
     *
     * The resulting range is empty if the ranges do not intersect, but touch.
     * If the ranges don't even touch, the result is undefined.
     */
    intersect(other: OffsetRange): OffsetRange | undefined;
    intersects(other: OffsetRange): boolean;
    intersectsOrTouches(other: OffsetRange): boolean;
    isBefore(other: OffsetRange): boolean;
    isAfter(other: OffsetRange): boolean;
    slice<T>(arr: T[]): T[];
    substring(str: string): string;
    /**
     * Returns the given value if it is contained in this instance, otherwise the closest value that is contained.
     * The range must not be empty.
     */
    clip(value: number): number;
    /**
     * Returns `r := value + k * length` such that `r` is contained in this range.
     * The range must not be empty.
     *
     * E.g. `[5, 10).clipCyclic(10) === 5`, `[5, 10).clipCyclic(11) === 6` and `[5, 10).clipCyclic(4) === 9`.
     */
    clipCyclic(value: number): number;
    map<T>(f: (offset: number) => T): T[];
    forEach(f: (offset: number) => void): void;
}
export declare class OffsetRangeSet {
    private readonly _sortedRanges;
    addRange(range: OffsetRange): void;
    toString(): string;
    /**
     * Returns of there is a value that is contained in this instance and the given range.
     */
    intersectsStrict(other: OffsetRange): boolean;
    intersectWithRange(other: OffsetRange): OffsetRangeSet;
    intersectWithRangeLength(other: OffsetRange): number;
    get length(): number;
}
