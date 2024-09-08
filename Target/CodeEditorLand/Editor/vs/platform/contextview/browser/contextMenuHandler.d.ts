import type { IContextMenuDelegate } from "../../../base/browser/contextmenu.js";
import type { IKeybindingService } from "../../keybinding/common/keybinding.js";
import type { INotificationService } from "../../notification/common/notification.js";
import type { ITelemetryService } from "../../telemetry/common/telemetry.js";
import type { IContextViewService } from "./contextView.js";
export interface IContextMenuHandlerOptions {
    blockMouse: boolean;
}
export declare class ContextMenuHandler {
    private contextViewService;
    private telemetryService;
    private notificationService;
    private keybindingService;
    private focusToReturn;
    private lastContainer;
    private block;
    private blockDisposable;
    private options;
    constructor(contextViewService: IContextViewService, telemetryService: ITelemetryService, notificationService: INotificationService, keybindingService: IKeybindingService);
    configure(options: IContextMenuHandlerOptions): void;
    showContextMenu(delegate: IContextMenuDelegate): void;
    private onActionRun;
    private onDidActionRun;
}
