import { URI } from "../../../../base/common/uri.js";
import { ILoggerService, LogLevel } from "../../../../platform/log/common/log.js";
export declare class DelayedLogChannel {
    private readonly file;
    private readonly loggerService;
    private readonly logger;
    constructor(id: string, name: string, file: URI, loggerService: ILoggerService);
    log(level: LogLevel, message: string): void;
}
