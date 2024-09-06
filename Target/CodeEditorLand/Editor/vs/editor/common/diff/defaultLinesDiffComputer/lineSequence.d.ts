import { OffsetRange } from "vs/editor/common/core/offsetRange";
import { ISequence } from "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm";
export declare class LineSequence implements ISequence {
    private readonly trimmedHash;
    private readonly lines;
    constructor(trimmedHash: number[], lines: string[]);
    getElement(offset: number): number;
    get length(): number;
    getBoundaryScore(length: number): number;
    getText(range: OffsetRange): string;
    isStronglyEqual(offset1: number, offset2: number): boolean;
}
