import * as http from "http";
import { CancellationToken } from "vs/base/common/cancellation";
import { IRequestContext, IRequestOptions } from "vs/base/parts/request/common/request";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from "vs/platform/request/common/request";
import { Agent } from "vs/platform/request/node/proxy";
export interface IRawRequestFunction {
    (options: http.RequestOptions, callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
}
export interface NodeRequestOptions extends IRequestOptions {
    agent?: Agent;
    strictSSL?: boolean;
    isChromiumNetwork?: boolean;
    getRawRequest?(options: IRequestOptions): IRawRequestFunction;
}
/**
 * This service exposes the `request` API, while using the global
 * or configured proxy settings.
 */
export declare class RequestService extends AbstractRequestService implements IRequestService {
    private readonly configurationService;
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private proxyUrl?;
    private strictSSL;
    private authorization?;
    private shellEnvErrorLogged?;
    constructor(configurationService: IConfigurationService, environmentService: INativeEnvironmentService, logService: ILogService, loggerService: ILoggerService);
    private configure;
    request(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(urlStr: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
export declare function nodeRequest(options: NodeRequestOptions, token: CancellationToken): Promise<IRequestContext>;
