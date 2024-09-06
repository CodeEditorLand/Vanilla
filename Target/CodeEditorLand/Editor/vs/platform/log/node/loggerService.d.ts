import { URI } from "vs/base/common/uri";
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, LogLevel } from "vs/platform/log/common/log";
export declare class LoggerService extends AbstractLoggerService implements ILoggerService {
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
