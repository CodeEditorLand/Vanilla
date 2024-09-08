import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IRequestService } from "../../../../platform/request/common/request.js";
import { type IWorkbenchContribution } from "../../../common/contributions.js";
import { IBannerService } from "../../../services/banner/browser/bannerService.js";
export declare class EmergencyAlert implements IWorkbenchContribution {
    private readonly bannerService;
    private readonly requestService;
    private readonly productService;
    private readonly logService;
    static readonly ID = "workbench.contrib.emergencyAlert";
    constructor(bannerService: IBannerService, requestService: IRequestService, productService: IProductService, logService: ILogService);
    private fetchAlerts;
    private doFetchAlerts;
}
