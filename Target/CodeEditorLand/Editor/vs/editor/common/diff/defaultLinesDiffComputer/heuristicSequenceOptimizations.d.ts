import { ISequence, SequenceDiff } from "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm";
import { LineSequence } from "vs/editor/common/diff/defaultLinesDiffComputer/lineSequence";
import { LinesSliceCharSequence } from "vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence";
export declare function optimizeSequenceDiffs(sequence1: ISequence, sequence2: ISequence, sequenceDiffs: SequenceDiff[]): SequenceDiff[];
export declare function removeShortMatches(sequence1: ISequence, sequence2: ISequence, sequenceDiffs: SequenceDiff[]): SequenceDiff[];
export declare function extendDiffsToEntireWordIfAppropriate(sequence1: LinesSliceCharSequence, sequence2: LinesSliceCharSequence, sequenceDiffs: SequenceDiff[]): SequenceDiff[];
export declare function removeVeryShortMatchingLinesBetweenDiffs(sequence1: LineSequence, _sequence2: LineSequence, sequenceDiffs: SequenceDiff[]): SequenceDiff[];
export declare function removeVeryShortMatchingTextBetweenLongDiffs(sequence1: LinesSliceCharSequence, sequence2: LinesSliceCharSequence, sequenceDiffs: SequenceDiff[]): SequenceDiff[];
