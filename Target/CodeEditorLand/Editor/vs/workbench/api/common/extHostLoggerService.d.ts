import { URI, UriComponents } from "vs/base/common/uri";
import { AbstractLoggerService, ILogger, ILoggerOptions, LogLevel } from "vs/platform/log/common/log";
import { ExtHostLogLevelServiceShape, MainThreadLoggerShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostInitDataService } from "vs/workbench/api/common/extHostInitDataService";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
export declare class ExtHostLoggerService extends AbstractLoggerService implements ExtHostLogLevelServiceShape {
    readonly _serviceBrand: undefined;
    protected readonly _proxy: MainThreadLoggerShape;
    constructor(rpc: IExtHostRpcService, initData: IExtHostInitDataService);
    $setLogLevel(logLevel: LogLevel, resource?: UriComponents): void;
    setVisibility(resource: URI, visibility: boolean): void;
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
