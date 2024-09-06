import { URI } from "vs/base/common/uri";
import { ILogger, ILoggerOptions, ILoggerResource, LogLevel } from "vs/platform/log/common/log";
import { ExtHostLoggerService as BaseExtHostLoggerService } from "vs/workbench/api/common/extHostLoggerService";
export declare class ExtHostLoggerService extends BaseExtHostLoggerService {
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
    registerLogger(resource: ILoggerResource): void;
    deregisterLogger(resource: URI): void;
}
