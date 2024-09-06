import { ICommandService } from "vs/platform/commands/common/commands";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "vs/platform/quickinput/browser/pickerQuickAccess";
import { IQuickPickSeparator } from "vs/platform/quickinput/common/quickInput";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
export declare class StartDebugQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly debugService;
    private readonly contextService;
    private readonly commandService;
    private readonly notificationService;
    constructor(debugService: IDebugService, contextService: IWorkspaceContextService, commandService: ICommandService, notificationService: INotificationService);
    protected _getPicks(filter: string): Promise<(IQuickPickSeparator | IPickerQuickAccessItem)[]>;
}
