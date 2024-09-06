import { IExtensionResourceLoaderService } from "vs/platform/extensionResourceLoader/common/extensionResourceLoader";
import { IBuiltinExtensionsScannerService, IExtension } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class BuiltinExtensionsScannerService implements IBuiltinExtensionsScannerService {
    private readonly extensionResourceLoaderService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly builtinExtensionsPromises;
    private nlsUrl;
    constructor(environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, extensionResourceLoaderService: IExtensionResourceLoaderService, productService: IProductService, logService: ILogService);
    scanBuiltinExtensions(): Promise<IExtension[]>;
    private localizeManifest;
}
