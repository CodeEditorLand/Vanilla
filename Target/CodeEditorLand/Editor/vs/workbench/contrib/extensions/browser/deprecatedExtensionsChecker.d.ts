import { Disposable } from "vs/base/common/lifecycle";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { IWorkbenchExtensionEnablementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
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
