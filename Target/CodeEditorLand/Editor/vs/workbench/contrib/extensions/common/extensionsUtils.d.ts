import { Disposable } from "vs/base/common/lifecycle";
import { IExtensionIdentifier, ILocalExtension } from "vs/platform/extensionManagement/common/extensionManagement";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IWorkbenchExtensionEnablementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IExtensionRecommendationsService } from "vs/workbench/services/extensionRecommendations/common/extensionRecommendations";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
export interface IExtensionStatus {
    identifier: IExtensionIdentifier;
    local: ILocalExtension;
    globallyEnabled: boolean;
}
export declare class KeymapExtensions extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly extensionEnablementService;
    private readonly tipsService;
    private readonly notificationService;
    constructor(instantiationService: IInstantiationService, extensionEnablementService: IWorkbenchExtensionEnablementService, tipsService: IExtensionRecommendationsService, lifecycleService: ILifecycleService, notificationService: INotificationService);
    private checkForOtherKeymaps;
    private promptForDisablingOtherKeymaps;
}
export declare function getInstalledExtensions(accessor: ServicesAccessor): Promise<IExtensionStatus[]>;
