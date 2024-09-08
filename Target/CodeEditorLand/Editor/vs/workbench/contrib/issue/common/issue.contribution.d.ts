import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
export declare class BaseIssueContribution extends Disposable implements IWorkbenchContribution {
    constructor(productService: IProductService, configurationService: IConfigurationService);
}
