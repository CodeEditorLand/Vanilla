import { DiffAlgorithmResult, IDiffAlgorithm, ISequence, ITimeout } from "./diffAlgorithm.js";
/**
 * A O(MN) diffing algorithm that supports a score function.
 * The algorithm can be improved by processing the 2d array diagonally.
 */
export declare class DynamicProgrammingDiffing implements IDiffAlgorithm {
    compute(sequence1: ISequence, sequence2: ISequence, timeout?: ITimeout, equalityScore?: (offset1: number, offset2: number) => number): DiffAlgorithmResult;
}
