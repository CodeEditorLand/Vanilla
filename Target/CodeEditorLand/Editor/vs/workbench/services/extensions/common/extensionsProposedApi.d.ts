import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class ExtensionsProposedApi {
    private readonly _logService;
    private readonly _environmentService;
    private readonly _envEnablesProposedApiForAll;
    private readonly _envEnabledExtensions;
    private readonly _productEnabledExtensions;
    constructor(_logService: ILogService, _environmentService: IWorkbenchEnvironmentService, productService: IProductService);
    updateEnabledApiProposals(extensions: IExtensionDescription[]): void;
    private doUpdateEnabledApiProposals;
}
