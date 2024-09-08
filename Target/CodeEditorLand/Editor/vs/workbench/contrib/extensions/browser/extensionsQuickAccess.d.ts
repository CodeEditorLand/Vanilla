import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IExtensionGalleryService, IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { PickerQuickAccessProvider, type IPickerQuickAccessItem } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import type { IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
export declare class InstallExtensionQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly paneCompositeService;
    private readonly galleryService;
    private readonly extensionsService;
    private readonly notificationService;
    private readonly logService;
    static PREFIX: string;
    constructor(paneCompositeService: IPaneCompositePartService, galleryService: IExtensionGalleryService, extensionsService: IExtensionManagementService, notificationService: INotificationService, logService: ILogService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Array<IPickerQuickAccessItem | IQuickPickSeparator> | Promise<Array<IPickerQuickAccessItem | IQuickPickSeparator>>;
    private getPicksForExtensionId;
    private installExtension;
    private searchExtension;
}
export declare class ManageExtensionsQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly paneCompositeService;
    static PREFIX: string;
    constructor(paneCompositeService: IPaneCompositePartService);
    protected _getPicks(): Array<IPickerQuickAccessItem | IQuickPickSeparator>;
}