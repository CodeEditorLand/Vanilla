import { URI } from "vs/base/common/uri";
import { IChannel } from "vs/base/parts/ipc/common/ipc";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IExtensionGalleryService, IGalleryExtension, ILocalExtension, InstallOptions } from "vs/platform/extensionManagement/common/extensionManagement";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IExtensionManagementServer } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { RemoteExtensionManagementService } from "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService";
import { IExtensionManifestPropertiesService } from "vs/workbench/services/extensions/common/extensionManifestPropertiesService";
import { IRemoteUserDataProfilesService } from "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class NativeRemoteExtensionManagementService extends RemoteExtensionManagementService {
    private readonly localExtensionManagementServer;
    private readonly logService;
    private readonly galleryService;
    private readonly configurationService;
    private readonly productService;
    private readonly fileService;
    private readonly extensionManifestPropertiesService;
    constructor(channel: IChannel, localExtensionManagementServer: IExtensionManagementServer, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, uriIdentityService: IUriIdentityService, logService: ILogService, galleryService: IExtensionGalleryService, configurationService: IConfigurationService, productService: IProductService, fileService: IFileService, extensionManifestPropertiesService: IExtensionManifestPropertiesService);
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    installFromGallery(extension: IGalleryExtension, installOptions?: InstallOptions): Promise<ILocalExtension>;
    private doInstallFromGallery;
    private downloadAndInstall;
    private downloadCompatibleAndInstall;
    private checkAndGetCompatible;
    private installUIDependenciesAndPackedExtensions;
    private getAllUIDependenciesAndPackedExtensions;
    private getAllWorkspaceDependenciesAndPackedExtensions;
    private getDependenciesAndPackedExtensionsRecursively;
}
