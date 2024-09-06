import { IProcessMainService } from "vs/platform/issue/common/issue";
import { IProductService } from "vs/platform/product/common/productService";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkbenchProcessService } from "vs/workbench/contrib/issue/common/issue";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
export declare class ProcessService implements IWorkbenchProcessService {
    private readonly processMainService;
    private readonly themeService;
    private readonly environmentService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(processMainService: IProcessMainService, themeService: IThemeService, environmentService: INativeWorkbenchEnvironmentService, productService: IProductService);
    openProcessExplorer(): Promise<void>;
}
