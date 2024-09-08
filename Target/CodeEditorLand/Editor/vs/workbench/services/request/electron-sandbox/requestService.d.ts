import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { IRequestContext, IRequestOptions } from "../../../../base/parts/request/common/request.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILoggerService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { AbstractRequestService, IRequestService, type AuthInfo, type Credentials } from "../../../../platform/request/common/request.js";
export declare class NativeRequestService extends AbstractRequestService implements IRequestService {
    private readonly nativeHostService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(nativeHostService: INativeHostService, configurationService: IConfigurationService, loggerService: ILoggerService);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
