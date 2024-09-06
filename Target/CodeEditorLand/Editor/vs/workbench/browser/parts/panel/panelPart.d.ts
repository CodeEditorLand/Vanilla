import "vs/css!./media/panelpart";
import { IMenuService } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IPaneCompositeBarOptions } from "vs/workbench/browser/parts/paneCompositeBar";
import { AbstractPaneCompositePart, CompositeBarPosition } from "vs/workbench/browser/parts/paneCompositePart";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class PanelPart extends AbstractPaneCompositePart {
    private commandService;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    get preferredHeight(): number | undefined;
    get preferredWidth(): number | undefined;
    static readonly activePanelSettingsKey = "workbench.panelpart.activepanelid";
    constructor(notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, commandService: ICommandService, menuService: IMenuService);
    updateStyles(): void;
    protected getCompositeBarOptions(): IPaneCompositeBarOptions;
    private fillExtraContextMenuActions;
    layout(width: number, height: number, top: number, left: number): void;
    protected shouldShowCompositeBar(): boolean;
    protected getCompositeBarPosition(): CompositeBarPosition;
    toJSON(): object;
}