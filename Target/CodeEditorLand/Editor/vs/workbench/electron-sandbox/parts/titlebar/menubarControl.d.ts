import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { IMenubarService } from "vs/platform/menubar/electron-sandbox/menubar";
import { INativeHostService } from "vs/platform/native/common/native";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUpdateService } from "vs/platform/update/common/update";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { MenubarControl } from "vs/workbench/browser/parts/titlebar/menubarControl";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
export declare class NativeMenubarControl extends MenubarControl {
    private readonly menubarService;
    private readonly nativeHostService;
    constructor(menuService: IMenuService, workspacesService: IWorkspacesService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, configurationService: IConfigurationService, labelService: ILabelService, updateService: IUpdateService, storageService: IStorageService, notificationService: INotificationService, preferencesService: IPreferencesService, environmentService: INativeWorkbenchEnvironmentService, accessibilityService: IAccessibilityService, menubarService: IMenubarService, hostService: IHostService, nativeHostService: INativeHostService, commandService: ICommandService);
    protected setupMainMenu(): void;
    protected doUpdateMenubar(): void;
    private getMenubarMenus;
    private populateMenuItems;
    private transformOpenRecentAction;
    private getAdditionalKeybindings;
    private getMenubarKeybinding;
}
