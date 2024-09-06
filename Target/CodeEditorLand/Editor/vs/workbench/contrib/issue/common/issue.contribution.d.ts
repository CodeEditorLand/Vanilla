import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IProductService } from "vs/platform/product/common/productService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
export declare class BaseIssueContribution extends Disposable implements IWorkbenchContribution {
    constructor(productService: IProductService, configurationService: IConfigurationService);
}
