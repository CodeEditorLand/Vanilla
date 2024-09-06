import { CancellationToken } from "../../../base/common/cancellation.js";
import { IRequestContext, IRequestOptions } from "../../../base/parts/request/common/request.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { ILoggerService } from "../../log/common/log.js";
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from "../common/request.js";
/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
export declare class RequestService extends AbstractRequestService implements IRequestService {
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService, loggerService: ILoggerService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
