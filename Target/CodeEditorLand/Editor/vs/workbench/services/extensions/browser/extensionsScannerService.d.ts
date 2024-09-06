import { IExtensionsProfileScannerService } from "vs/platform/extensionManagement/common/extensionsProfileScannerService";
import { AbstractExtensionsScannerService, IExtensionsScannerService, Translations } from "vs/platform/extensionManagement/common/extensionsScannerService";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class ExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    constructor(userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(): Promise<Translations>;
}
