import { type UriComponents, type UriDto } from "../../../base/common/uri.js";
import { ILoggerService, type ILoggerOptions, type ILoggerResource, type LogLevel } from "../../../platform/log/common/log.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadLoggerShape } from "../common/extHost.protocol.js";
export declare class MainThreadLoggerService implements MainThreadLoggerShape {
    private readonly loggerService;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, loggerService: ILoggerService);
    $log(file: UriComponents, messages: [LogLevel, string][]): void;
    $createLogger(file: UriComponents, options?: ILoggerOptions): Promise<void>;
    $registerLogger(logResource: UriDto<ILoggerResource>): Promise<void>;
    $deregisterLogger(resource: UriComponents): Promise<void>;
    $setVisibility(resource: UriComponents, visible: boolean): Promise<void>;
    $flush(file: UriComponents): void;
    dispose(): void;
}
