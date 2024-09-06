import { CancellationToken } from "vs/base/common/cancellation";
import { IRequestContext, IRequestOptions } from "vs/base/parts/request/common/request";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILoggerService } from "vs/platform/log/common/log";
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from "vs/platform/request/common/request";
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