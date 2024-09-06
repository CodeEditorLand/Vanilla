import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
export declare class ExtensionsManifestCache extends Disposable {
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly uriIdentityService;
    private readonly logService;
    constructor(userDataProfilesService: IUserDataProfilesService, fileService: IFileService, uriIdentityService: IUriIdentityService, extensionsManagementService: IExtensionManagementService, logService: ILogService);
    private onDidInstallExtensions;
    private onDidUnInstallExtension;
    invalidate(extensionsManifestLocation: URI | undefined): Promise<void>;
    private deleteUserCacheFile;
}
