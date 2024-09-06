import "vs/css!./media/compositepart";
import { IActionViewItem } from "vs/base/browser/ui/actionbar/actionbar";
import { IBaseActionViewItemOptions } from "vs/base/browser/ui/actionbar/actionViewItems";
import { AnchorAlignment } from "vs/base/browser/ui/contextview/contextview";
import { IHoverDelegate } from "vs/base/browser/ui/hover/hoverDelegate";
import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { IAction } from "vs/base/common/actions";
import { WorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import type { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProgressIndicator } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { Composite, CompositeRegistry } from "vs/workbench/browser/composite";
import { IPartOptions, Part } from "vs/workbench/browser/part";
import { IComposite } from "vs/workbench/common/composite";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export interface ICompositeTitleLabel {
    /**
     * Asks to update the title for the composite with the given ID.
     */
    updateTitle(id: string, title: string, keybinding?: string): void;
    /**
     * Called when theming information changes.
     */
    updateStyles(): void;
}
export declare abstract class CompositePart<T extends Composite> extends Part {
    private readonly notificationService;
    protected readonly storageService: IStorageService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    private readonly hoverService;
    protected readonly instantiationService: IInstantiationService;
    protected readonly registry: CompositeRegistry<T>;
    private readonly activeCompositeSettingsKey;
    private readonly defaultCompositeId;
    private readonly nameForTelemetry;
    private readonly compositeCSSClass;
    private readonly titleForegroundColor;
    protected readonly onDidCompositeOpen: any;
    protected readonly onDidCompositeClose: any;
    protected toolBar: WorkbenchToolBar | undefined;
    protected titleLabelElement: HTMLElement | undefined;
    protected readonly toolbarHoverDelegate: IHoverDelegate;
    private readonly mapCompositeToCompositeContainer;
    private readonly mapActionsBindingToComposite;
    private activeComposite;
    private lastActiveCompositeId;
    private readonly instantiatedCompositeItems;
    protected titleLabel: ICompositeTitleLabel | undefined;
    private progressBar;
    private contentAreaSize;
    private readonly actionsListener;
    private currentCompositeOpenToken;
    private boundarySashes;
    constructor(notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, registry: CompositeRegistry<T>, activeCompositeSettingsKey: string, defaultCompositeId: string, nameForTelemetry: string, compositeCSSClass: string, titleForegroundColor: string | undefined, id: string, options: IPartOptions);
    protected openComposite(id: string, focus?: boolean): Composite | undefined;
    private doOpenComposite;
    protected createComposite(id: string, isActive?: boolean): Composite;
    protected showComposite(composite: Composite): void;
    protected onTitleAreaUpdate(compositeId: string): void;
    private updateTitle;
    private collectCompositeActions;
    protected getActiveComposite(): IComposite | undefined;
    protected getLastActiveCompositeId(): string;
    protected hideActiveComposite(): Composite | undefined;
    protected createTitleArea(parent: HTMLElement): HTMLElement;
    protected createTitleLabel(parent: HTMLElement): ICompositeTitleLabel;
    protected createHeaderArea(): HTMLElement;
    protected createFooterArea(): HTMLElement;
    updateStyles(): void;
    protected actionViewItemProvider(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    protected actionsContextProvider(): unknown;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    getProgressIndicator(id: string): IProgressIndicator | undefined;
    protected getTitleAreaDropDownAnchorAlignment(): AnchorAlignment;
    layout(width: number, height: number, top: number, left: number): void;
    setBoundarySashes?(sashes: IBoundarySashes): void;
    protected removeComposite(compositeId: string): boolean;
    dispose(): void;
}
