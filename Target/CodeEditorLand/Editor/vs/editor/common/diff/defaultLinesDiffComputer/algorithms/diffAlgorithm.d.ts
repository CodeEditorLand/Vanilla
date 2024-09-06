import { OffsetRange } from "vs/editor/common/core/offsetRange";
/**
 * Represents a synchronous diff algorithm. Should be executed in a worker.
 */
export interface IDiffAlgorithm {
    compute(sequence1: ISequence, sequence2: ISequence, timeout?: ITimeout): DiffAlgorithmResult;
}
export declare class DiffAlgorithmResult {
    readonly diffs: SequenceDiff[];
    /**
     * Indicates if the time out was reached.
     * In that case, the diffs might be an approximation and the user should be asked to rerun the diff with more time.
     */
    readonly hitTimeout: boolean;
    static trivial(seq1: ISequence, seq2: ISequence): DiffAlgorithmResult;
    static trivialTimedOut(seq1: ISequence, seq2: ISequence): DiffAlgorithmResult;
    constructor(diffs: SequenceDiff[], 
    /**
     * Indicates if the time out was reached.
     * In that case, the diffs might be an approximation and the user should be asked to rerun the diff with more time.
     */
    hitTimeout: boolean);
}
export declare class SequenceDiff {
    readonly seq1Range: OffsetRange;
    readonly seq2Range: OffsetRange;
    static invert(sequenceDiffs: SequenceDiff[], doc1Length: number): SequenceDiff[];
    static fromOffsetPairs(start: OffsetPair, endExclusive: OffsetPair): SequenceDiff;
    static assertSorted(sequenceDiffs: SequenceDiff[]): void;
    constructor(seq1Range: OffsetRange, seq2Range: OffsetRange);
    swap(): SequenceDiff;
    toString(): string;
    join(other: SequenceDiff): SequenceDiff;
    delta(offset: number): SequenceDiff;
    deltaStart(offset: number): SequenceDiff;
    deltaEnd(offset: number): SequenceDiff;
    intersectsOrTouches(other: SequenceDiff): boolean;
    intersect(other: SequenceDiff): SequenceDiff | undefined;
    getStarts(): OffsetPair;
    getEndExclusives(): OffsetPair;
}
export declare class OffsetPair {
    readonly offset1: number;
    readonly offset2: number;
    static readonly zero: OffsetPair;
    static readonly max: OffsetPair;
    constructor(offset1: number, offset2: number);
    toString(): string;
    delta(offset: number): OffsetPair;
    equals(other: OffsetPair): boolean;
}
export interface ISequence {
    getElement(offset: number): number;
    get length(): number;
    /**
     * The higher the score, the better that offset can be used to split the sequence.
     * Is used to optimize insertions.
     * Must not be negative.
     */
    getBoundaryScore?(length: number): number;
    /**
     * For line sequences, getElement returns a number representing trimmed lines.
     * This however checks equality for the original lines.
     * It prevents shifting to less matching lines.
     */
    isStronglyEqual(offset1: number, offset2: number): boolean;
}
export interface ITimeout {
    isValid(): boolean;
}
export declare class InfiniteTimeout implements ITimeout {
    static instance: InfiniteTimeout;
    isValid(): boolean;
}
export declare class DateTimeout implements ITimeout {
    private timeout;
    private readonly startTime;
    private valid;
    constructor(timeout: number);
    isValid(): boolean;
    disable(): void;
}
