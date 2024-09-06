import { Disposable } from "vs/base/common/lifecycle";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProductService } from "vs/platform/product/common/productService";
import type { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
export declare class TerminalWslRecommendationContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(instantiationService: IInstantiationService, productService: IProductService, notificationService: INotificationService, extensionManagementService: IExtensionManagementService, terminalService: ITerminalService);
}
