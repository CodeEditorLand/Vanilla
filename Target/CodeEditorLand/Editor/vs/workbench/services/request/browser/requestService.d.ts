import { CancellationToken } from "vs/base/common/cancellation";
import { IRequestContext, IRequestOptions } from "vs/base/parts/request/common/request";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILoggerService } from "vs/platform/log/common/log";
import { RequestService } from "vs/platform/request/browser/requestService";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class BrowserRequestService extends RequestService {
    private readonly remoteAgentService;
    constructor(remoteAgentService: IRemoteAgentService, configurationService: IConfigurationService, loggerService: ILoggerService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    private _makeRemoteRequest;
}
