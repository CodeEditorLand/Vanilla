import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { type IPickerQuickAccessItem, PickerQuickAccessProvider } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import type { IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IDebugService } from "../common/debug.js";
export declare class StartDebugQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly debugService;
    private readonly contextService;
    private readonly commandService;
    private readonly notificationService;
    constructor(debugService: IDebugService, contextService: IWorkspaceContextService, commandService: ICommandService, notificationService: INotificationService);
    protected _getPicks(filter: string): Promise<(IQuickPickSeparator | IPickerQuickAccessItem)[]>;
}
