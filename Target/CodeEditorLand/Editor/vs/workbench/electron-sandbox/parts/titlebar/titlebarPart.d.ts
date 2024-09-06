import { CodeWindow } from "vs/base/browser/window";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IConfigurationChangeEvent, IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INativeHostService } from "vs/platform/native/common/native";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { BrowserTitlebarPart, BrowserTitleService, IAuxiliaryTitlebarPart } from "vs/workbench/browser/parts/titlebar/titlebarPart";
import { IEditorGroupsContainer, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class NativeTitlebarPart extends BrowserTitlebarPart {
    private readonly nativeHostService;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private bigSurOrNewer;
    private get macTitlebarSize();
    private maxRestoreControl;
    private resizer;
    private cachedWindowControlStyles;
    private cachedWindowControlHeight;
    constructor(id: string, targetWindow: CodeWindow, editorGroupsContainer: IEditorGroupsContainer | "main", contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    protected onMenubarVisibilityChanged(visible: boolean): void;
    protected onConfigurationChanged(event: IConfigurationChangeEvent): void;
    private onUpdateAppIconDragBehavior;
    protected installMenubar(): void;
    private onMenubarFocusChanged;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private onDidChangeWindowMaximized;
    updateStyles(): void;
    layout(width: number, height: number): void;
}
export declare class MainNativeTitlebarPart extends NativeTitlebarPart {
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
}
export declare class AuxiliaryNativeTitlebarPart extends NativeTitlebarPart implements IAuxiliaryTitlebarPart {
    readonly container: HTMLElement;
    private readonly mainTitlebar;
    private static COUNTER;
    get height(): number;
    constructor(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer, mainTitlebar: BrowserTitlebarPart, contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    get preventZoom(): boolean;
}
export declare class NativeTitleService extends BrowserTitleService {
    protected createMainTitlebarPart(): MainNativeTitlebarPart;
    protected doCreateAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): AuxiliaryNativeTitlebarPart;
}
