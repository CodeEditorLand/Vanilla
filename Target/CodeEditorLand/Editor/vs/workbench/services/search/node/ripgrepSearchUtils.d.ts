import { ILogService } from "vs/platform/log/common/log";
import { SearchRange } from "vs/workbench/services/search/common/search";
import * as searchExtTypes from "vs/workbench/services/search/common/searchExtTypes";
export type Maybe<T> = T | null | undefined;
export declare function anchorGlob(glob: string): string;
export declare function rangeToSearchRange(range: searchExtTypes.Range): SearchRange;
export declare function searchRangeToRange(range: SearchRange): searchExtTypes.Range;
export interface IOutputChannel {
    appendLine(msg: string): void;
}
export declare class OutputChannel implements IOutputChannel {
    private prefix;
    private readonly logService;
    constructor(prefix: string, logService: ILogService);
    appendLine(msg: string): void;
}
