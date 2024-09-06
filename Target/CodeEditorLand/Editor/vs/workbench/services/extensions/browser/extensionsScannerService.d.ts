import { IExtensionsProfileScannerService } from "../../../../platform/extensionManagement/common/extensionsProfileScannerService.js";
import { AbstractExtensionsScannerService, IExtensionsScannerService, Translations } from "../../../../platform/extensionManagement/common/extensionsScannerService.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
export declare class ExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    constructor(userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(): Promise<Translations>;
}
