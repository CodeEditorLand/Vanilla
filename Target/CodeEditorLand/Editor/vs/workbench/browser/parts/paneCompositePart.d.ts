import "vs/css!./media/paneCompositePart";
import { Dimension } from "vs/base/browser/dom";
import { IView } from "vs/base/browser/ui/grid/grid";
import { SubmenuAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IContextKey, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProgressIndicator } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { Composite } from "vs/workbench/browser/composite";
import { PaneComposite, PaneCompositeDescriptor } from "vs/workbench/browser/panecomposite";
import { IPartOptions } from "vs/workbench/browser/part";
import { CompositePart, ICompositeTitleLabel } from "vs/workbench/browser/parts/compositePart";
import { IPaneCompositeBarOptions, PaneCompositeBar } from "vs/workbench/browser/parts/paneCompositeBar";
import { IPaneComposite } from "vs/workbench/common/panecomposite";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IWorkbenchLayoutService, Parts } from "vs/workbench/services/layout/browser/layoutService";
export declare enum CompositeBarPosition {
    TOP = 0,
    TITLE = 1,
    BOTTOM = 2
}
export interface IPaneCompositePart extends IView {
    readonly partId: Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART;
    readonly onDidPaneCompositeOpen: Event<IPaneComposite>;
    readonly onDidPaneCompositeClose: Event<IPaneComposite>;
    /**
     * Opens a viewlet with the given identifier and pass keyboard focus to it if specified.
     */
    openPaneComposite(id: string | undefined, focus?: boolean): Promise<IPaneComposite | undefined>;
    /**
     * Returns the current active viewlet if any.
     */
    getActivePaneComposite(): IPaneComposite | undefined;
    /**
     * Returns the viewlet by id.
     */
    getPaneComposite(id: string): PaneCompositeDescriptor | undefined;
    /**
     * Returns all enabled viewlets
     */
    getPaneComposites(): PaneCompositeDescriptor[];
    /**
     * Returns the progress indicator for the side bar.
     */
    getProgressIndicator(id: string): IProgressIndicator | undefined;
    /**
     * Hide the active viewlet.
     */
    hideActivePaneComposite(): void;
    /**
     * Return the last active viewlet id.
     */
    getLastActivePaneCompositeId(): string;
    /**
     * Returns id of pinned view containers following the visual order.
     */
    getPinnedPaneCompositeIds(): string[];
    /**
     * Returns id of visible view containers following the visual order.
     */
    getVisiblePaneCompositeIds(): string[];
}
export declare abstract class AbstractPaneCompositePart extends CompositePart<PaneComposite> implements IPaneCompositePart {
    readonly partId: Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART;
    private readonly activePaneContextKey;
    private paneFocusContextKey;
    private readonly viewDescriptorService;
    protected readonly contextKeyService: IContextKeyService;
    private readonly extensionService;
    protected readonly menuService: IMenuService;
    private static readonly MIN_COMPOSITE_BAR_WIDTH;
    get snap(): boolean;
    get onDidPaneCompositeOpen(): Event<IPaneComposite>;
    readonly onDidPaneCompositeClose: Event<IPaneComposite>;
    private readonly location;
    private titleContainer;
    private headerFooterCompositeBarContainer;
    protected readonly headerFooterCompositeBarDispoables: any;
    private paneCompositeBarContainer;
    private readonly paneCompositeBar;
    private compositeBarPosition;
    private emptyPaneMessageElement;
    private globalToolBar;
    private readonly globalActions;
    private blockOpening;
    protected contentDimension: Dimension | undefined;
    constructor(partId: Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART, partOptions: IPartOptions, activePaneCompositeSettingsKey: string, activePaneContextKey: IContextKey<string>, paneFocusContextKey: IContextKey<boolean>, nameForTelemetry: string, compositeCSSClass: string, titleForegroundColor: string | undefined, notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, menuService: IMenuService);
    private registerListeners;
    private onDidOpen;
    private onDidClose;
    protected showComposite(composite: Composite): void;
    protected hideActiveComposite(): Composite | undefined;
    create(parent: HTMLElement): void;
    private createEmptyPaneMessage;
    protected createTitleArea(parent: HTMLElement): HTMLElement;
    protected createTitleLabel(parent: HTMLElement): ICompositeTitleLabel;
    protected updateCompositeBar(): void;
    protected createHeaderArea(): HTMLElement;
    protected createFooterArea(): HTMLElement;
    protected createHeaderFooterCompositeBarArea(area: HTMLElement): HTMLElement;
    private removeFooterHeaderArea;
    protected createCompositeBar(): PaneCompositeBar;
    protected onTitleAreaUpdate(compositeId: string): void;
    openPaneComposite(id?: string, focus?: boolean): Promise<PaneComposite | undefined>;
    private doOpenPaneComposite;
    getPaneComposite(id: string): PaneCompositeDescriptor | undefined;
    getPaneComposites(): PaneCompositeDescriptor[];
    getPinnedPaneCompositeIds(): string[];
    getVisiblePaneCompositeIds(): string[];
    getActivePaneComposite(): IPaneComposite | undefined;
    getLastActivePaneCompositeId(): string;
    hideActivePaneComposite(): void;
    protected focusCompositeBar(): void;
    layout(width: number, height: number, top: number, left: number): void;
    private layoutCompositeBar;
    private layoutEmptyMessage;
    private updateGlobalToolbarActions;
    protected getToolbarWidth(): number;
    private onTitleAreaContextMenu;
    private onCompositeBarAreaContextMenu;
    private onCompositeBarContextMenu;
    protected getViewsSubmenuAction(): SubmenuAction | undefined;
    protected abstract shouldShowCompositeBar(): boolean;
    protected abstract getCompositeBarOptions(): IPaneCompositeBarOptions;
    protected abstract getCompositeBarPosition(): CompositeBarPosition;
}
