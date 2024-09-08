import { type DetailedLineRangeMapping, LineRangeMapping } from "../rangeMapping.js";
import { type ITimeout } from "./algorithms/diffAlgorithm.js";
export declare function computeMovedLines(changes: DetailedLineRangeMapping[], originalLines: string[], modifiedLines: string[], hashedOriginalLines: number[], hashedModifiedLines: number[], timeout: ITimeout): LineRangeMapping[];
