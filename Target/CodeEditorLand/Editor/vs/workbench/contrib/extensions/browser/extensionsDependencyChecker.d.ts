import { Disposable } from "../../../../base/common/lifecycle.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IExtensionsWorkbenchService } from "../common/extensions.js";
export declare class ExtensionDependencyChecker extends Disposable implements IWorkbenchContribution {
    private readonly extensionService;
    private readonly extensionsWorkbenchService;
    private readonly notificationService;
    private readonly hostService;
    constructor(extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, notificationService: INotificationService, hostService: IHostService);
    private getUninstalledMissingDependencies;
    private getAllMissingDependencies;
    private installMissingDependencies;
}
