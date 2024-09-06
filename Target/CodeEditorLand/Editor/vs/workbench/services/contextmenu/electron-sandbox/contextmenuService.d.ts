import { IContextMenuDelegate } from "vs/base/browser/contextmenu";
import { Event } from "vs/base/common/event";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuMenuDelegate, IContextMenuService, IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class ContextMenuService implements IContextMenuService {
    readonly _serviceBrand: undefined;
    private impl;
    get onDidShowContextMenu(): Event<void>;
    get onDidHideContextMenu(): Event<void>;
    constructor(notificationService: INotificationService, telemetryService: ITelemetryService, keybindingService: IKeybindingService, configurationService: IConfigurationService, contextViewService: IContextViewService, menuService: IMenuService, contextKeyService: IContextKeyService);
    dispose(): void;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
