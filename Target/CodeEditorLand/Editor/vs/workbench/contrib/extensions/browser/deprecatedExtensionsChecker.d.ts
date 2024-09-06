import { IExtensionsWorkbenchService } from '../common/extensions.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
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
