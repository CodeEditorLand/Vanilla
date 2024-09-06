import { Event } from "vs/base/common/event";
import { IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { ILoggerMainService } from "vs/platform/log/electron-main/loggerService";
export declare class LoggerChannel implements IServerChannel {
    private readonly loggerService;
    private readonly loggers;
    constructor(loggerService: ILoggerMainService);
    listen(_: unknown, event: string, windowId?: number): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
    private createLogger;
    private consoleLog;
    private log;
}
