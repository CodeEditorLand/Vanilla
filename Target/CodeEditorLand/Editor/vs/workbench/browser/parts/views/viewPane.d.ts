import "vs/css!./media/paneviewlet";
import { IActionViewItem } from "vs/base/browser/ui/actionbar/actionbar";
import { IDropdownMenuActionViewItemOptions } from "vs/base/browser/ui/dropdown/dropdownActionViewItem";
import { IListStyles } from "vs/base/browser/ui/list/listWidget";
import { IPaneOptions, IPaneStyles, Pane } from "vs/base/browser/ui/splitview/paneview";
import { IAction, IActionRunner } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { ThemeIcon } from "vs/base/common/themables";
import { PartialExcept } from "vs/base/common/types";
import { Action2, IAction2Options, MenuId } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { CompositeMenuActions } from "vs/workbench/browser/actions";
import { FilterWidget, IFilterWidgetOptions } from "vs/workbench/browser/parts/views/viewFilter";
import { IView, IViewDescriptorService, ViewContainerLocation } from "vs/workbench/common/views";
import { IAccessibleViewInformationService } from "vs/workbench/services/accessibility/common/accessibleViewInformationService";
export declare enum ViewPaneShowActions {
    /** Show the actions when the view is hovered. This is the default behavior. */
    Default = 0,
    /** Always shows the actions when the view is expanded */
    WhenExpanded = 1,
    /** Always shows the actions */
    Always = 2
}
export interface IViewPaneOptions extends IPaneOptions {
    readonly id: string;
    readonly showActions?: ViewPaneShowActions;
    readonly titleMenuId?: MenuId;
    readonly donotForwardArgs?: boolean;
    readonly singleViewPaneContainerTitle?: string;
}
export interface IFilterViewPaneOptions extends IViewPaneOptions {
    filterOptions: IFilterWidgetOptions;
}
export declare const VIEWPANE_FILTER_ACTION: any;
export declare abstract class ViewPane extends Pane implements IView {
    protected keybindingService: IKeybindingService;
    protected contextMenuService: IContextMenuService;
    protected readonly configurationService: IConfigurationService;
    protected contextKeyService: IContextKeyService;
    protected viewDescriptorService: IViewDescriptorService;
    protected instantiationService: IInstantiationService;
    protected openerService: IOpenerService;
    protected themeService: IThemeService;
    protected telemetryService: ITelemetryService;
    protected readonly hoverService: IHoverService;
    protected readonly accessibleViewInformationService?: any;
    private static readonly AlwaysShowActionsConfig;
    private _onDidFocus;
    readonly onDidFocus: Event<void>;
    private _onDidBlur;
    readonly onDidBlur: Event<void>;
    private _onDidChangeBodyVisibility;
    readonly onDidChangeBodyVisibility: Event<boolean>;
    protected _onDidChangeTitleArea: any;
    readonly onDidChangeTitleArea: Event<void>;
    protected _onDidChangeViewWelcomeState: any;
    readonly onDidChangeViewWelcomeState: Event<void>;
    private _isVisible;
    readonly id: string;
    private _title;
    get title(): string;
    private _titleDescription;
    get titleDescription(): string | undefined;
    private _singleViewPaneContainerTitle;
    get singleViewPaneContainerTitle(): string | undefined;
    readonly menuActions: CompositeMenuActions;
    private progressBar;
    private progressIndicator;
    private toolbar?;
    private readonly showActions;
    private headerContainer?;
    private titleContainer?;
    private titleContainerHover?;
    private titleDescriptionContainer?;
    private titleDescriptionContainerHover?;
    private iconContainer?;
    private iconContainerHover?;
    protected twistiesContainer?: HTMLElement;
    private viewWelcomeController;
    protected readonly scopedContextKeyService: IContextKeyService;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, accessibleViewInformationService?: any);
    get headerVisible(): boolean;
    set headerVisible(visible: boolean);
    setVisible(visible: boolean): void;
    isVisible(): boolean;
    isBodyVisible(): boolean;
    setExpanded(expanded: boolean): boolean;
    render(): void;
    protected renderHeader(container: HTMLElement): void;
    protected updateHeader(): void;
    private updateTwistyIcon;
    protected getTwistyIcon(expanded: boolean): ThemeIcon;
    style(styles: IPaneStyles): void;
    private getIcon;
    protected renderHeaderTitle(container: HTMLElement, title: string): void;
    private _getAriaLabel;
    protected updateTitle(title: string): void;
    private setTitleDescription;
    protected updateTitleDescription(description?: string | undefined): void;
    private calculateTitle;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    onDidScrollRoot(): void;
    getProgressIndicator(): IProgressIndicator;
    protected getProgressLocation(): string;
    protected getLocationBasedColors(): IViewPaneLocationColors;
    focus(): void;
    private setActions;
    private updateActionsVisibility;
    protected updateActions(): void;
    getActionViewItem(action: IAction, options?: IDropdownMenuActionViewItemOptions): IActionViewItem | undefined;
    getActionsContext(): unknown;
    getActionRunner(): IActionRunner | undefined;
    getOptimalWidth(): number;
    saveState(): void;
    shouldShowWelcome(): boolean;
    getFilterWidget(): FilterWidget | undefined;
    shouldShowFilterInHeader(): boolean;
}
export declare abstract class FilterViewPane extends ViewPane {
    readonly filterWidget: FilterWidget;
    private dimension;
    private filterContainer;
    constructor(options: IFilterViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, accessibleViewService?: IAccessibleViewInformationService);
    getFilterWidget(): FilterWidget;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    shouldShowFilterInHeader(): boolean;
    protected abstract layoutBodyContent(height: number, width: number): void;
}
export interface IViewPaneLocationColors {
    background: string;
    listOverrideStyles: PartialExcept<IListStyles, "listBackground" | "treeStickyScrollBackground">;
}
export declare function getLocationBasedViewColors(location: ViewContainerLocation | null): IViewPaneLocationColors;
export declare abstract class ViewAction<T extends IView> extends Action2 {
    readonly desc: Readonly<IAction2Options> & {
        viewId: string;
    };
    constructor(desc: Readonly<IAction2Options> & {
        viewId: string;
    });
    run(accessor: ServicesAccessor, ...args: any[]): any;
    abstract runInView(accessor: ServicesAccessor, view: T, ...args: any[]): any;
}
