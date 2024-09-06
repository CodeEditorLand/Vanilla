import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILoggerService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { RequestService } from "vs/platform/request/browser/requestService";
import { AuthInfo, Credentials } from "vs/platform/request/common/request";
export declare class NativeRequestService extends RequestService {
    private nativeHostService;
    constructor(configurationService: IConfigurationService, loggerService: ILoggerService, nativeHostService: INativeHostService);
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
