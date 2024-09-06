import { URI } from "vs/base/common/uri";
import { ILoggerService, LogLevel } from "vs/platform/log/common/log";
export declare class DelayedLogChannel {
    private readonly file;
    private readonly loggerService;
    private readonly logger;
    constructor(id: string, name: string, file: URI, loggerService: ILoggerService);
    log(level: LogLevel, message: string): void;
}
