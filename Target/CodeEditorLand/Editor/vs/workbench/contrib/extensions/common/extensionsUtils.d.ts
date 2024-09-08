import { Disposable } from "../../../../base/common/lifecycle.js";
import { type IExtensionIdentifier, type ILocalExtension } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService, type ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionRecommendationsService } from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
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
