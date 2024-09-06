import { BrowserClipboardService as BaseBrowserClipboardService } from "vs/platform/clipboard/browser/clipboardService";
import { ILayoutService } from "vs/platform/layout/browser/layoutService";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class BrowserClipboardService extends BaseBrowserClipboardService {
    private readonly notificationService;
    private readonly openerService;
    private readonly environmentService;
    constructor(notificationService: INotificationService, openerService: IOpenerService, environmentService: IWorkbenchEnvironmentService, logService: ILogService, layoutService: ILayoutService);
    writeText(text: string, type?: string): Promise<void>;
    readText(type?: string): Promise<string>;
}
