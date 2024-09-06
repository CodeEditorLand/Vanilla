import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { DidChangeLoggersEvent, ILogger, ILoggerOptions, ILoggerResource, ILoggerService, LogLevel } from "vs/platform/log/common/log";
import { LoggerService } from "vs/platform/log/node/loggerService";
export declare const ILoggerMainService: any;
export interface ILoggerMainService extends ILoggerService {
    getOnDidChangeLogLevelEvent(windowId: number): Event<LogLevel | [URI, LogLevel]>;
    getOnDidChangeVisibilityEvent(windowId: number): Event<[URI, boolean]>;
    getOnDidChangeLoggersEvent(windowId: number): Event<DidChangeLoggersEvent>;
    createLogger(resource: URI, options?: ILoggerOptions, windowId?: number): ILogger;
    createLogger(id: string, options?: Omit<ILoggerOptions, "id">, windowId?: number): ILogger;
    registerLogger(resource: ILoggerResource, windowId?: number): void;
    getRegisteredLoggers(windowId?: number): ILoggerResource[];
    deregisterLoggers(windowId: number): void;
}
export declare class LoggerMainService extends LoggerService implements ILoggerMainService {
    private readonly loggerResourcesByWindow;
    createLogger(idOrResource: URI | string, options?: ILoggerOptions, windowId?: number): ILogger;
    registerLogger(resource: ILoggerResource, windowId?: number): void;
    deregisterLogger(resource: URI): void;
    getRegisteredLoggers(windowId?: number): ILoggerResource[];
    getOnDidChangeLogLevelEvent(windowId: number): Event<LogLevel | [URI, LogLevel]>;
    getOnDidChangeVisibilityEvent(windowId: number): Event<[URI, boolean]>;
    getOnDidChangeLoggersEvent(windowId: number): Event<DidChangeLoggersEvent>;
    deregisterLoggers(windowId: number): void;
    private isInterestedLoggerResource;
    dispose(): void;
}
