import { Disposable } from "vs/base/common/lifecycle";
import { IAuxiliaryWindowsMainService } from "vs/platform/auxiliaryWindow/electron-main/auxiliaryWindows";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { IMenubarData } from "vs/platform/menubar/common/menubar";
import { INativeHostMainService } from "vs/platform/native/electron-main/nativeHostMainService";
import { IProductService } from "vs/platform/product/common/productService";
import { IStateService } from "vs/platform/state/node/state";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUpdateService } from "vs/platform/update/common/update";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
import { IWorkspacesHistoryMainService } from "vs/platform/workspaces/electron-main/workspacesHistoryMainService";
export declare class Menubar extends Disposable {
    private readonly updateService;
    private readonly configurationService;
    private readonly windowsMainService;
    private readonly environmentMainService;
    private readonly telemetryService;
    private readonly workspacesHistoryMainService;
    private readonly stateService;
    private readonly lifecycleMainService;
    private readonly logService;
    private readonly nativeHostMainService;
    private readonly productService;
    private readonly auxiliaryWindowsMainService;
    private static readonly lastKnownMenubarStorageKey;
    private willShutdown;
    private appMenuInstalled;
    private closedLastWindow;
    private noActiveMainWindow;
    private menuUpdater;
    private menuGC;
    private oldMenus;
    private menubarMenus;
    private keybindings;
    private readonly fallbackMenuHandlers;
    constructor(updateService: IUpdateService, configurationService: IConfigurationService, windowsMainService: IWindowsMainService, environmentMainService: IEnvironmentMainService, telemetryService: ITelemetryService, workspacesHistoryMainService: IWorkspacesHistoryMainService, stateService: IStateService, lifecycleMainService: ILifecycleMainService, logService: ILogService, nativeHostMainService: INativeHostMainService, productService: IProductService, auxiliaryWindowsMainService: IAuxiliaryWindowsMainService);
    private restoreCachedMenubarData;
    private addFallbackHandlers;
    private registerListeners;
    private get currentEnableMenuBarMnemonics();
    private get currentEnableNativeTabs();
    updateMenu(menubarData: IMenubarData, windowId: number): void;
    private scheduleUpdateMenu;
    private doUpdateMenu;
    private onDidChangeWindowsCount;
    private onDidChangeWindowFocus;
    private install;
    private doSetApplicationMenu;
    private setMacApplicationMenu;
    private confirmBeforeQuit;
    private shouldDrawMenu;
    private setMenu;
    private setMenuById;
    private insertCheckForUpdatesItems;
    private createOpenRecentMenuItem;
    private isOptionClick;
    private isKeyboardEvent;
    private createRoleMenuItem;
    private setMacWindowMenu;
    private getUpdateMenuItems;
    private createMenuItem;
    private makeContextAwareClickHandler;
    private runActionInRenderer;
    private withKeybinding;
    private likeAction;
    private openUrl;
    private reportMenuActionTelemetry;
    private mnemonicLabel;
}