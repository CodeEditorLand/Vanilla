import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { IChannel, IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerResource, ILoggerService, LogLevel } from "vs/platform/log/common/log";
export declare class LoggerChannelClient extends AbstractLoggerService implements ILoggerService {
    private readonly windowId;
    private readonly channel;
    constructor(windowId: number | undefined, logLevel: LogLevel, logsHome: URI, loggers: ILoggerResource[], channel: IChannel);
    createConsoleMainLogger(): ILogger;
    registerLogger(logger: ILoggerResource): void;
    deregisterLogger(resource: URI): void;
    setLogLevel(logLevel: LogLevel): void;
    setLogLevel(resource: URI, logLevel: LogLevel): void;
    setVisibility(resourceOrId: URI | string, visibility: boolean): void;
    protected doCreateLogger(file: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
    static setLogLevel(channel: IChannel, level: LogLevel): Promise<void>;
    static setLogLevel(channel: IChannel, resource: URI, level: LogLevel): Promise<void>;
}
export declare class LoggerChannel implements IServerChannel {
    private readonly loggerService;
    private getUriTransformer;
    constructor(loggerService: ILoggerService, getUriTransformer: (requestContext: any) => IURITransformer);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, arg?: any): Promise<any>;
    private transformLogger;
}
export declare class RemoteLoggerChannelClient extends Disposable {
    constructor(loggerService: ILoggerService, channel: IChannel);
}
