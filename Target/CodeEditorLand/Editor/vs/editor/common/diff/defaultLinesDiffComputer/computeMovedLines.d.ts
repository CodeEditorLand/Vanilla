import { ITimeout } from "vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm";
import { DetailedLineRangeMapping, LineRangeMapping } from "../rangeMapping";
export declare function computeMovedLines(changes: DetailedLineRangeMapping[], originalLines: string[], modifiedLines: string[], hashedOriginalLines: number[], hashedModifiedLines: number[], timeout: ITimeout): LineRangeMapping[];
