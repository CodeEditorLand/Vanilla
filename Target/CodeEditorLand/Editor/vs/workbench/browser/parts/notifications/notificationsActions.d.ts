import "vs/css!./media/notificationsActions";
import { Action } from "vs/base/common/actions";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { ICommandService } from "vs/platform/commands/common/commands";
import { INotificationViewItem } from "vs/workbench/common/notifications";
export declare class ClearNotificationAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class ClearAllNotificationsAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ToggleDoNotDisturbAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ToggleDoNotDisturbBySourceAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ConfigureDoNotDisturbAction extends Action {
    static readonly ID = "workbench.action.configureDoNotDisturbMode";
    static readonly LABEL: any;
    constructor(id: string, label: string);
}
export declare class HideNotificationsCenterAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(): Promise<void>;
}
export declare class ExpandNotificationAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class CollapseNotificationAction extends Action {
    private readonly commandService;
    static readonly ID: any;
    static readonly LABEL: any;
    constructor(id: string, label: string, commandService: ICommandService);
    run(notification: INotificationViewItem): Promise<void>;
}
export declare class ConfigureNotificationAction extends Action {
    readonly notification: INotificationViewItem;
    static readonly ID = "workbench.action.configureNotification";
    static readonly LABEL: any;
    constructor(id: string, label: string, notification: INotificationViewItem);
}
export declare class CopyNotificationMessageAction extends Action {
    private readonly clipboardService;
    static readonly ID = "workbench.action.copyNotificationMessage";
    static readonly LABEL: any;
    constructor(id: string, label: string, clipboardService: IClipboardService);
    run(notification: INotificationViewItem): Promise<void>;
}
