import "vs/css!./media/titlebarpart";
import { IView } from "vs/base/browser/ui/grid/grid";
import { CodeWindow } from "vs/base/browser/window";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { IMenuService, MenuId } from "vs/platform/actions/common/actions";
import { IConfigurationChangeEvent, IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { MenuBarVisibility } from "vs/platform/window/common/window";
import { MultiWindowParts, Part } from "vs/workbench/browser/part";
import { CustomMenubarControl } from "vs/workbench/browser/parts/titlebar/menubarControl";
import { IEditorGroupsContainer, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { ITitleService } from "vs/workbench/services/title/browser/titleService";
export interface ITitleVariable {
    readonly name: string;
    readonly contextKey: string;
}
export interface ITitleProperties {
    isPure?: boolean;
    isAdmin?: boolean;
    prefix?: string;
}
export interface ITitlebarPart extends IDisposable {
    /**
     * An event when the menubar visibility changes.
     */
    readonly onMenubarVisibilityChange: Event<boolean>;
    /**
     * Update some environmental title properties.
     */
    updateProperties(properties: ITitleProperties): void;
    /**
     * Adds variables to be supported in the window title.
     */
    registerVariables(variables: ITitleVariable[]): void;
}
export declare class BrowserTitleService extends MultiWindowParts<BrowserTitlebarPart> implements ITitleService {
    protected readonly instantiationService: IInstantiationService;
    _serviceBrand: undefined;
    readonly mainPart: any;
    constructor(instantiationService: IInstantiationService, storageService: IStorageService, themeService: IThemeService);
    protected createMainTitlebarPart(): BrowserTitlebarPart;
    private registerActions;
    private registerAPICommands;
    createAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): IAuxiliaryTitlebarPart;
    protected doCreateAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): BrowserTitlebarPart & IAuxiliaryTitlebarPart;
    readonly onMenubarVisibilityChange: any;
    private properties;
    updateProperties(properties: ITitleProperties): void;
    private readonly variables;
    registerVariables(variables: ITitleVariable[]): void;
}
export declare class BrowserTitlebarPart extends Part implements ITitlebarPart {
    private readonly contextMenuService;
    protected readonly configurationService: IConfigurationService;
    protected readonly environmentService: IBrowserWorkbenchEnvironmentService;
    protected readonly instantiationService: IInstantiationService;
    private readonly storageService;
    private readonly contextKeyService;
    private readonly hostService;
    private readonly editorGroupService;
    private readonly menuService;
    private readonly keybindingService;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private _onMenubarVisibilityChange;
    readonly onMenubarVisibilityChange: any;
    private readonly _onWillDispose;
    readonly onWillDispose: any;
    protected rootContainer: HTMLElement;
    protected primaryWindowControls: HTMLElement | undefined;
    protected dragRegion: HTMLElement | undefined;
    private title;
    private leftContent;
    private centerContent;
    private rightContent;
    protected customMenubar: CustomMenubarControl | undefined;
    protected appIcon: HTMLElement | undefined;
    private appIconBadge;
    protected menubar?: HTMLElement;
    private lastLayoutDimensions;
    private actionToolBar;
    private readonly actionToolBarDisposable;
    private readonly editorActionsChangeDisposable;
    private actionToolBarElement;
    private layoutToolbarMenu;
    private readonly editorToolbarMenuDisposables;
    private readonly layoutToolbarMenuDisposables;
    private readonly activityToolbarDisposables;
    private readonly hoverDelegate;
    private readonly titleDisposables;
    private titleBarStyle;
    private isInactive;
    private readonly isAuxiliary;
    private readonly windowTitle;
    private readonly editorService;
    private readonly editorGroupsContainer;
    constructor(id: string, targetWindow: CodeWindow, editorGroupsContainer: IEditorGroupsContainer | "main", contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    private registerListeners;
    private onBlur;
    private onFocus;
    private onEditorPartConfigurationChange;
    protected onConfigurationChanged(event: IConfigurationChangeEvent): void;
    protected installMenubar(): void;
    private uninstallMenubar;
    protected onMenubarVisibilityChanged(visible: boolean): void;
    updateProperties(properties: ITitleProperties): void;
    registerVariables(variables: ITitleVariable[]): void;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private createTitle;
    private actionViewItemProvider;
    private getKeybinding;
    private createActionToolBar;
    private createActionToolBarMenus;
    updateStyles(): void;
    protected onContextMenu(e: MouseEvent, menuId: MenuId): void;
    protected get currentMenubarVisibility(): MenuBarVisibility;
    private get layoutControlEnabled();
    protected get isCommandCenterVisible(): boolean;
    private get editorActionsEnabled();
    private get activityActionsEnabled();
    get hasZoomableElements(): boolean;
    get preventZoom(): boolean;
    layout(width: number, height: number): void;
    private updateLayout;
    focus(): void;
    toJSON(): object;
    dispose(): void;
}
export declare class MainBrowserTitlebarPart extends BrowserTitlebarPart {
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
}
export interface IAuxiliaryTitlebarPart extends ITitlebarPart, IView {
    readonly container: HTMLElement;
    readonly height: number;
}
export declare class AuxiliaryBrowserTitlebarPart extends BrowserTitlebarPart implements IAuxiliaryTitlebarPart {
    readonly container: HTMLElement;
    private readonly mainTitlebar;
    private static COUNTER;
    get height(): number;
    constructor(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer, mainTitlebar: BrowserTitlebarPart, contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    get preventZoom(): boolean;
}
