import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { IExtensionGalleryService } from "vs/platform/extensionManagement/common/extensionManagement";
import { ExtensionManagementCLI } from "vs/platform/extensionManagement/common/extensionManagementCLI";
import { IExtensionsScannerService } from "vs/platform/extensionManagement/common/extensionsScannerService";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILanguagePackService } from "vs/platform/languagePacks/common/languagePacks";
import { ILogService } from "vs/platform/log/common/log";
import { IRemoteExtensionsScannerService } from "vs/platform/remote/common/remoteExtensionsScanner";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IServerEnvironmentService } from "vs/server/node/serverEnvironmentService";
export declare class RemoteExtensionsScannerService implements IRemoteExtensionsScannerService {
    private readonly _extensionManagementCLI;
    private readonly _userDataProfilesService;
    private readonly _extensionsScannerService;
    private readonly _logService;
    private readonly _extensionGalleryService;
    private readonly _languagePackService;
    readonly _serviceBrand: undefined;
    private readonly _whenBuiltinExtensionsReady;
    private readonly _whenExtensionsReady;
    constructor(_extensionManagementCLI: ExtensionManagementCLI, environmentService: IServerEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _extensionsScannerService: IExtensionsScannerService, _logService: ILogService, _extensionGalleryService: IExtensionGalleryService, _languagePackService: ILanguagePackService);
    private _asExtensionIdOrVSIX;
    whenExtensionsReady(): Promise<void>;
    scanExtensions(language?: string, profileLocation?: URI, workspaceExtensionLocations?: URI[], extensionDevelopmentLocations?: URI[], languagePackId?: string): Promise<IExtensionDescription[]>;
    private _scanExtensions;
    private _scanDevelopedExtensions;
    private _scanWorkspaceInstalledExtensions;
    private _scanBuiltinExtensions;
    private _scanInstalledExtensions;
    private _ensureLanguagePackIsInstalled;
    private _massageWhenConditions;
}
export declare class RemoteExtensionsScannerChannel implements IServerChannel {
    private service;
    private getUriTransformer;
    constructor(service: RemoteExtensionsScannerService, getUriTransformer: (requestContext: any) => IURITransformer);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
