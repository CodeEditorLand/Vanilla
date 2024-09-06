import { IContextMenuDelegate } from "vs/base/browser/contextmenu";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
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
