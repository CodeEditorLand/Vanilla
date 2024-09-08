import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../../platform/notification/common/notification.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { IWorkbenchExtensionEnablementService } from "../../../../services/extensionManagement/common/extensionManagement.js";
import { ILifecycleService } from "../../../../services/lifecycle/common/lifecycle.js";
import { type IExtensionStatus } from "../../../extensions/common/extensionsUtils.js";
import type { INotebookKeymapService } from "../../common/notebookKeymapService.js";
export declare class NotebookKeymapService extends Disposable implements INotebookKeymapService {
    private readonly instantiationService;
    private readonly extensionEnablementService;
    private readonly notificationService;
    _serviceBrand: undefined;
    private notebookKeymapMemento;
    private notebookKeymap;
    constructor(instantiationService: IInstantiationService, extensionEnablementService: IWorkbenchExtensionEnablementService, notificationService: INotificationService, storageService: IStorageService, lifecycleService: ILifecycleService);
    private checkForOtherKeymaps;
    private promptForDisablingOtherKeymaps;
}
export declare function isNotebookKeymapExtension(extension: IExtensionStatus): boolean;
