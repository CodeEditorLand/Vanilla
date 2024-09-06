import { Disposable } from "../../../../base/common/lifecycle.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
export declare class DeprecatedExtensionsChecker extends Disposable implements IWorkbenchContribution {
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly storageService;
    private readonly notificationService;
    private readonly instantiationService;
    constructor(extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementService: IExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService, storageService: IStorageService, notificationService: INotificationService, instantiationService: IInstantiationService);
    private checkForDeprecatedExtensions;
    private getNotifiedDeprecatedExtensions;
    private setNotifiedDeprecatedExtensions;
}
