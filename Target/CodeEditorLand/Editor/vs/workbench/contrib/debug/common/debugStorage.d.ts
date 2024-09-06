import { Disposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IDebugModel, IEvaluate, IExpression } from "vs/workbench/contrib/debug/common/debug";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
export declare class DebugStorage extends Disposable {
    private readonly storageService;
    private readonly textFileService;
    private readonly uriIdentityService;
    private readonly logService;
    readonly breakpoints: any;
    readonly functionBreakpoints: any;
    readonly exceptionBreakpoints: any;
    readonly dataBreakpoints: any;
    readonly watchExpressions: any;
    constructor(storageService: IStorageService, textFileService: ITextFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    loadDebugUxState(): "simple" | "default";
    storeDebugUxState(value: "simple" | "default"): void;
    private loadBreakpoints;
    private loadFunctionBreakpoints;
    private loadExceptionBreakpoints;
    private loadDataBreakpoints;
    private loadWatchExpressions;
    loadChosenEnvironments(): {
        [key: string]: string;
    };
    storeChosenEnvironments(environments: {
        [key: string]: string;
    }): void;
    storeWatchExpressions(watchExpressions: (IExpression & IEvaluate)[]): void;
    storeBreakpoints(debugModel: IDebugModel): void;
}
