import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IDownloadService } from "vs/platform/download/common/download";
import { IExtensionGalleryService, ILocalExtension, InstallOptions } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionsScannerService } from "vs/platform/extensionManagement/common/extensionsScannerService";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUserDataSyncEnablementService } from "vs/platform/userDataSync/common/userDataSync";
import { IWorkspaceTrustRequestService } from "vs/platform/workspace/common/workspaceTrust";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IExtensionManagementServer, IExtensionManagementServerService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { ExtensionManagementService as BaseExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagementService";
import { IExtensionManifestPropertiesService } from "vs/workbench/services/extensions/common/extensionManifestPropertiesService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class ExtensionManagementService extends BaseExtensionManagementService {
    private readonly environmentService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, userDataProfileService: IUserDataProfileService, configurationService: IConfigurationService, productService: IProductService, downloadService: IDownloadService, userDataSyncEnablementService: IUserDataSyncEnablementService, dialogService: IDialogService, workspaceTrustRequestService: IWorkspaceTrustRequestService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, fileService: IFileService, logService: ILogService, instantiationService: IInstantiationService, extensionsScannerService: IExtensionsScannerService, telemetryService: ITelemetryService);
    protected installVSIXInServer(vsix: URI, server: IExtensionManagementServer, options: InstallOptions | undefined): Promise<ILocalExtension>;
}
