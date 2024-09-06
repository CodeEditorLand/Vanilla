import { ILinesDiffComputer, ILinesDiffComputerOptions, LinesDiff } from "vs/editor/common/diff/linesDiffComputer";
import { DetailedLineRangeMapping, RangeMapping } from "../rangeMapping";
export declare class DefaultLinesDiffComputer implements ILinesDiffComputer {
    private readonly dynamicProgrammingDiffing;
    private readonly myersDiffingAlgorithm;
    computeDiff(originalLines: string[], modifiedLines: string[], options: ILinesDiffComputerOptions): LinesDiff;
    private computeMoves;
    private refineDiff;
}
export declare function lineRangeMappingFromRangeMappings(alignments: RangeMapping[], originalLines: string[], modifiedLines: string[], dontAssertStartLine?: boolean): DetailedLineRangeMapping[];
export declare function getLineRangeMapping(rangeMapping: RangeMapping, originalLines: string[], modifiedLines: string[]): DetailedLineRangeMapping;
