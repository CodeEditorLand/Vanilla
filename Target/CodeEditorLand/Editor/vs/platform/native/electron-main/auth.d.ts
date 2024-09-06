import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEncryptionMainService } from "vs/platform/encryption/common/encryptionService";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { ILogService } from "vs/platform/log/common/log";
import { AuthInfo, Credentials } from "vs/platform/request/common/request";
import { IApplicationStorageMainService } from "vs/platform/storage/electron-main/storageMainService";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
export declare const IProxyAuthService: any;
export interface IProxyAuthService {
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
}
export declare class ProxyAuthService extends Disposable implements IProxyAuthService {
    private readonly logService;
    private readonly windowsMainService;
    private readonly encryptionMainService;
    private readonly applicationStorageMainService;
    private readonly configurationService;
    private readonly environmentMainService;
    readonly _serviceBrand: undefined;
    private readonly PROXY_CREDENTIALS_SERVICE_KEY;
    private pendingProxyResolves;
    private currentDialog;
    private cancelledAuthInfoHashes;
    private sessionCredentials;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, encryptionMainService: IEncryptionMainService, applicationStorageMainService: IApplicationStorageMainService, configurationService: IConfigurationService, environmentMainService: IEnvironmentMainService);
    private registerListeners;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    private onLogin;
    private resolveProxyCredentials;
    private doResolveProxyCredentials;
    private showProxyCredentialsDialog;
}
