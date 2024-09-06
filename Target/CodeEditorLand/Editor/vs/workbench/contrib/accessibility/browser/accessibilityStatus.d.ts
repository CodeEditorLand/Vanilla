import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare class AccessibilityStatus extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly notificationService;
    private readonly accessibilityService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.accessibilityStatus";
    private screenReaderNotification;
    private promptedScreenReader;
    private readonly screenReaderModeElement;
    constructor(configurationService: IConfigurationService, notificationService: INotificationService, accessibilityService: IAccessibilityService, statusbarService: IStatusbarService);
    private registerListeners;
    private showScreenReaderNotification;
    private updateScreenReaderModeElement;
    private onScreenReaderModeChange;
}
