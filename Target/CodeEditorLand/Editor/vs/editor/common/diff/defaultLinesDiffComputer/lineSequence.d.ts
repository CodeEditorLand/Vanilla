import type { OffsetRange } from "../../core/offsetRange.js";
import type { ISequence } from "./algorithms/diffAlgorithm.js";
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
