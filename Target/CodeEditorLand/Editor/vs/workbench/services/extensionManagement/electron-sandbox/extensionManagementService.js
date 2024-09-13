var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IDownloadService } from "../../../../platform/download/common/download.js";
import {
  IExtensionGalleryService
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IExtensionsScannerService } from "../../../../platform/extensionManagement/common/extensionsScannerService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IExtensionManifestPropertiesService } from "../../extensions/common/extensionManifestPropertiesService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import {
  IExtensionManagementServerService,
  IWorkbenchExtensionManagementService
} from "../common/extensionManagement.js";
import { ExtensionManagementService as BaseExtensionManagementService } from "../common/extensionManagementService.js";
let ExtensionManagementService = class extends BaseExtensionManagementService {
  constructor(environmentService, extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService, extensionsScannerService, telemetryService) {
    super(
      extensionManagementServerService,
      extensionGalleryService,
      userDataProfileService,
      configurationService,
      productService,
      downloadService,
      userDataSyncEnablementService,
      dialogService,
      workspaceTrustRequestService,
      extensionManifestPropertiesService,
      fileService,
      logService,
      instantiationService,
      extensionsScannerService,
      telemetryService
    );
    this.environmentService = environmentService;
  }
  static {
    __name(this, "ExtensionManagementService");
  }
  async installVSIXInServer(vsix, server, options) {
    if (vsix.scheme === Schemas.vscodeRemote && server === this.extensionManagementServerService.localExtensionManagementServer) {
      const downloadedLocation = joinPath(
        this.environmentService.tmpDir,
        generateUuid()
      );
      await this.downloadService.download(vsix, downloadedLocation);
      vsix = downloadedLocation;
    }
    return super.installVSIXInServer(vsix, server, options);
  }
};
ExtensionManagementService = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IExtensionManagementServerService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IDownloadService),
  __decorateParam(7, IUserDataSyncEnablementService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IWorkspaceTrustRequestService),
  __decorateParam(10, IExtensionManifestPropertiesService),
  __decorateParam(11, IFileService),
  __decorateParam(12, ILogService),
  __decorateParam(13, IInstantiationService),
  __decorateParam(14, IExtensionsScannerService),
  __decorateParam(15, ITelemetryService)
], ExtensionManagementService);
registerSingleton(
  IWorkbenchExtensionManagementService,
  ExtensionManagementService,
  InstantiationType.Delayed
);
export {
  ExtensionManagementService
};
//# sourceMappingURL=extensionManagementService.js.map
