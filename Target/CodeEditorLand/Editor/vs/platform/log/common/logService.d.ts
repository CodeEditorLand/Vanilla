import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ILogger, ILogService, LogLevel } from "vs/platform/log/common/log";
export declare class LogService extends Disposable implements ILogService {
    readonly _serviceBrand: undefined;
    private readonly logger;
    constructor(primaryLogger: ILogger, otherLoggers?: ILogger[]);
    get onDidChangeLogLevel(): Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
