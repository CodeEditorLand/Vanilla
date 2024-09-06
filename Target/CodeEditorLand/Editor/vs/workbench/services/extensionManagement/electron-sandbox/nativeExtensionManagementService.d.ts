import { URI } from "vs/base/common/uri";
import { IChannel } from "vs/base/parts/ipc/common/ipc";
import { IDownloadService } from "vs/platform/download/common/download";
import { ILocalExtension, InstallOptions } from "vs/platform/extensionManagement/common/extensionManagement";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { ProfileAwareExtensionManagementChannelClient } from "vs/workbench/services/extensionManagement/common/extensionManagementChannelClient";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class NativeExtensionManagementService extends ProfileAwareExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    private readonly fileService;
    private readonly downloadService;
    private readonly nativeEnvironmentService;
    private readonly logService;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService, fileService: IFileService, downloadService: IDownloadService, nativeEnvironmentService: INativeWorkbenchEnvironmentService, logService: ILogService);
    protected filterEvent(profileLocation: URI, isApplicationScoped: boolean): boolean;
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    private downloadVsix;
    protected switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent>;
}
