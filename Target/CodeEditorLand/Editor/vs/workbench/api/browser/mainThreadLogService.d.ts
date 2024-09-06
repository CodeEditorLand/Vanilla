import { UriComponents, UriDto } from "vs/base/common/uri";
import { ILoggerOptions, ILoggerResource, ILoggerService, LogLevel } from "vs/platform/log/common/log";
import { MainThreadLoggerShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
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
