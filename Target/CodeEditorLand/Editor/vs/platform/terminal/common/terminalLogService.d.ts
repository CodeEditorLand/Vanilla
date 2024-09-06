import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { ILoggerService, LogLevel } from "vs/platform/log/common/log";
import { ITerminalLogService } from "vs/platform/terminal/common/terminal";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
export declare class TerminalLogService extends Disposable implements ITerminalLogService {
    private readonly _loggerService;
    _serviceBrand: undefined;
    _logBrand: undefined;
    private readonly _logger;
    private _workspaceId;
    get onDidChangeLogLevel(): Event<LogLevel>;
    constructor(_loggerService: ILoggerService, workspaceContextService: IWorkspaceContextService, environmentService: IEnvironmentService);
    getLevel(): LogLevel;
    setLevel(level: LogLevel): void;
    flush(): void;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    private _formatMessage;
}
