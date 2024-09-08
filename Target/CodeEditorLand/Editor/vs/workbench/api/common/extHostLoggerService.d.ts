import { URI, type UriComponents } from "../../../base/common/uri.js";
import { AbstractLoggerService, type ILogger, type ILoggerOptions, type LogLevel } from "../../../platform/log/common/log.js";
import { type ExtHostLogLevelServiceShape, type MainThreadLoggerShape } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export declare class ExtHostLoggerService extends AbstractLoggerService implements ExtHostLogLevelServiceShape {
    readonly _serviceBrand: undefined;
    protected readonly _proxy: MainThreadLoggerShape;
    constructor(rpc: IExtHostRpcService, initData: IExtHostInitDataService);
    $setLogLevel(logLevel: LogLevel, resource?: UriComponents): void;
    setVisibility(resource: URI, visibility: boolean): void;
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
