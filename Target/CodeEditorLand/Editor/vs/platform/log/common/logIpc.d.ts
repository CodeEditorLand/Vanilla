import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import type { IURITransformer } from "../../../base/common/uriIpc.js";
import type { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { AbstractLoggerService, type ILogger, type ILoggerOptions, type ILoggerResource, type ILoggerService, type LogLevel } from "./log.js";
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
