import { Disposable } from "../../../base/common/lifecycle.js";
import type { URI } from "../../../base/common/uri.js";
import { type IFileService } from "../../files/common/files.js";
import type { ILogService } from "../../log/common/log.js";
import type { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import type { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import type { IExtensionManagementService } from "../common/extensionManagement.js";
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
