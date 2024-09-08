import type { IContextMenuDelegate } from "../../../../base/browser/contextmenu.js";
import { type Event } from "../../../../base/common/event.js";
import { IMenuService } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService, IContextViewService, type IContextMenuMenuDelegate } from "../../../../platform/contextview/browser/contextView.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
export declare class ContextMenuService implements IContextMenuService {
    readonly _serviceBrand: undefined;
    private impl;
    get onDidShowContextMenu(): Event<void>;
    get onDidHideContextMenu(): Event<void>;
    constructor(notificationService: INotificationService, telemetryService: ITelemetryService, keybindingService: IKeybindingService, configurationService: IConfigurationService, contextViewService: IContextViewService, menuService: IMenuService, contextKeyService: IContextKeyService);
    dispose(): void;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
