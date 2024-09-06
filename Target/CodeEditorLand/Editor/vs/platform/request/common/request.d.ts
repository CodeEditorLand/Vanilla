import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { IRequestContext, IRequestOptions } from "vs/base/parts/request/common/request";
import { ConfigurationScope } from "vs/platform/configuration/common/configurationRegistry";
import { ILogger, ILoggerService } from "vs/platform/log/common/log";
export declare const IRequestService: any;
export interface AuthInfo {
    isProxy: boolean;
    scheme: string;
    host: string;
    port: number;
    realm: string;
    attempt: number;
}
export interface Credentials {
    username: string;
    password: string;
}
export interface IRequestService {
    readonly _serviceBrand: undefined;
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
export declare abstract class AbstractRequestService extends Disposable implements IRequestService {
    readonly _serviceBrand: undefined;
    protected readonly logger: ILogger;
    private counter;
    constructor(loggerService: ILoggerService);
    protected logAndRequest(stack: string, options: IRequestOptions, request: () => Promise<IRequestContext>): Promise<IRequestContext>;
    abstract request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    abstract resolveProxy(url: string): Promise<string | undefined>;
    abstract lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    abstract lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    abstract loadCertificates(): Promise<string[]>;
}
export declare function isSuccess(context: IRequestContext): boolean;
export declare function hasNoContent(context: IRequestContext): boolean;
export declare function asText(context: IRequestContext): Promise<string | null>;
export declare function asTextOrError(context: IRequestContext): Promise<string | null>;
export declare function asJson<T = {}>(context: IRequestContext): Promise<T | null>;
export declare function updateProxyConfigurationsScope(scope: ConfigurationScope): void;
