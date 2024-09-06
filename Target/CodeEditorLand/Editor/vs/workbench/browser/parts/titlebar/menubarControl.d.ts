import "vs/css!./media/menubarControl";
import { Dimension } from "vs/base/browser/dom";
import { IAction, Separator } from "vs/base/common/actions";
import { RunOnceScheduler } from "vs/base/common/async";
import { Event } from "vs/base/common/event";
import { Disposable, DisposableStore } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IMenu, IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { ILabelService } from "vs/platform/label/common/label";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUpdateService } from "vs/platform/update/common/update";
import { IRecentlyOpened, IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
export type IOpenRecentAction = IAction & {
    uri: URI;
    remoteAuthority?: string;
};
export declare abstract class MenubarControl extends Disposable {
    protected readonly menuService: IMenuService;
    protected readonly workspacesService: IWorkspacesService;
    protected readonly contextKeyService: IContextKeyService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly configurationService: IConfigurationService;
    protected readonly labelService: ILabelService;
    protected readonly updateService: IUpdateService;
    protected readonly storageService: IStorageService;
    protected readonly notificationService: INotificationService;
    protected readonly preferencesService: IPreferencesService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    protected readonly accessibilityService: IAccessibilityService;
    protected readonly hostService: IHostService;
    protected readonly commandService: ICommandService;
    protected keys: string[];
    protected mainMenu: IMenu;
    protected menus: {
        [index: string]: IMenu | undefined;
    };
    protected topLevelTitles: {
        [menu: string]: string;
    };
    protected readonly mainMenuDisposables: DisposableStore;
    protected recentlyOpened: IRecentlyOpened;
    protected menuUpdater: RunOnceScheduler;
    protected static readonly MAX_MENU_RECENT_ENTRIES = 10;
    constructor(menuService: IMenuService, workspacesService: IWorkspacesService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, configurationService: IConfigurationService, labelService: ILabelService, updateService: IUpdateService, storageService: IStorageService, notificationService: INotificationService, preferencesService: IPreferencesService, environmentService: IWorkbenchEnvironmentService, accessibilityService: IAccessibilityService, hostService: IHostService, commandService: ICommandService);
    protected abstract doUpdateMenubar(firstTime: boolean): void;
    protected registerListeners(): void;
    protected setupMainMenu(): void;
    protected updateMenubar(): void;
    protected calculateActionLabel(action: {
        id: string;
        label: string;
    }): string;
    protected onUpdateStateChange(): void;
    protected onUpdateKeybindings(): void;
    protected getOpenRecentActions(): (Separator | IOpenRecentAction)[];
    protected onDidChangeWindowFocus(hasFocus: boolean): void;
    private onConfigurationUpdated;
    private get menubarHidden();
    protected onDidChangeRecentlyOpened(): void;
    private createOpenRecentMenuAction;
    private notifyUserOfCustomMenubarAccessibility;
}
export declare class CustomMenubarControl extends MenubarControl {
    private readonly telemetryService;
    private menubar;
    private container;
    private alwaysOnMnemonics;
    private focusInsideMenubar;
    private pendingFirstTimeUpdate;
    private visible;
    private actionRunner;
    private readonly webNavigationMenu;
    private readonly _onVisibilityChange;
    private readonly _onFocusStateChange;
    constructor(menuService: IMenuService, workspacesService: IWorkspacesService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, configurationService: IConfigurationService, labelService: ILabelService, updateService: IUpdateService, storageService: IStorageService, notificationService: INotificationService, preferencesService: IPreferencesService, environmentService: IWorkbenchEnvironmentService, accessibilityService: IAccessibilityService, telemetryService: ITelemetryService, hostService: IHostService, commandService: ICommandService);
    protected doUpdateMenubar(firstTime: boolean): void;
    private registerActions;
    private getUpdateAction;
    private get currentMenubarVisibility();
    private get currentDisableMenuBarAltFocus();
    private insertActionsBefore;
    private get currentEnableMenuBarMnemonics();
    private get currentCompactMenuMode();
    private onDidVisibilityChange;
    private toActionsArray;
    private readonly reinstallDisposables;
    private setupCustomMenubar;
    private getWebNavigationActions;
    private getMenuBarOptions;
    protected onDidChangeWindowFocus(hasFocus: boolean): void;
    protected onUpdateStateChange(): void;
    protected onDidChangeRecentlyOpened(): void;
    protected onUpdateKeybindings(): void;
    protected registerListeners(): void;
    get onVisibilityChange(): Event<boolean>;
    get onFocusStateChange(): Event<boolean>;
    getMenubarItemsDimensions(): Dimension;
    create(parent: HTMLElement): HTMLElement;
    layout(dimension: Dimension): void;
    toggleFocus(): void;
}