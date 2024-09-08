import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { IRequestContext, IRequestOptions } from "../../../../base/parts/request/common/request.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { AbstractRequestService, type AuthInfo, type Credentials, type IRequestService } from "../../../../platform/request/common/request.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
export declare class BrowserRequestService extends AbstractRequestService implements IRequestService {
    private readonly remoteAgentService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(remoteAgentService: IRemoteAgentService, configurationService: IConfigurationService, loggerService: ILoggerService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
    private _makeRemoteRequest;
}
