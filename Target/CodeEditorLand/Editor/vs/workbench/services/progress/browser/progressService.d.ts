import "vs/css!./media/progressService";
import { Disposable } from "vs/base/common/lifecycle";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProgress, IProgressOptions, IProgressService, IProgressStep } from "vs/platform/progress/common/progress";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
import { IUserActivityService } from "vs/workbench/services/userActivity/common/userActivityService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare class ProgressService extends Disposable implements IProgressService {
    private readonly activityService;
    private readonly paneCompositeService;
    private readonly viewDescriptorService;
    private readonly viewsService;
    private readonly notificationService;
    private readonly statusbarService;
    private readonly layoutService;
    private readonly keybindingService;
    private readonly userActivityService;
    readonly _serviceBrand: undefined;
    constructor(activityService: IActivityService, paneCompositeService: IPaneCompositePartService, viewDescriptorService: IViewDescriptorService, viewsService: IViewsService, notificationService: INotificationService, statusbarService: IStatusbarService, layoutService: ILayoutService, keybindingService: IKeybindingService, userActivityService: IUserActivityService);
    withProgress<R = unknown>(options: IProgressOptions, originalTask: (progress: IProgress<IProgressStep>) => Promise<R>, onDidCancel?: (choice?: number) => void): Promise<R>;
    private readonly windowProgressStack;
    private windowProgressStatusEntry;
    private withWindowProgress;
    private updateWindowProgress;
    private withNotificationProgress;
    private withPaneCompositeProgress;
    private withViewProgress;
    private showOnActivityBar;
    private withCompositeProgress;
    private withDialogProgress;
}
