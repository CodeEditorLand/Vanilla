import { AbstractMessageLogger, ILogger, LogLevel } from "vs/platform/log/common/log";
export declare class BufferLogger extends AbstractMessageLogger {
    readonly _serviceBrand: undefined;
    private buffer;
    private _logger;
    constructor(logLevel?: LogLevel);
    set logger(logger: ILogger);
    protected log(level: LogLevel, message: string): void;
    dispose(): void;
    flush(): void;
}
