import { Dimension } from "../../base/browser/dom.js";
import { IActionViewItem } from "../../base/browser/ui/actionbar/actionbar.js";
import { IBaseActionViewItemOptions } from "../../base/browser/ui/actionbar/actionViewItems.js";
import { IBoundarySashes } from "../../base/browser/ui/sash/sash.js";
import { IAction } from "../../base/common/actions.js";
import { URI } from "../../base/common/uri.js";
import { MenuId } from "../../platform/actions/common/actions.js";
import { IContextMenuService } from "../../platform/contextview/browser/contextView.js";
import { BrandedService, IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../platform/workspace/common/workspace.js";
import { IPaneComposite } from "../common/panecomposite.js";
import { IView } from "../common/views.js";
import { IExtensionService } from "../services/extensions/common/extensions.js";
import { Composite, CompositeDescriptor, CompositeRegistry } from "./composite.js";
import { ViewPaneContainer } from "./parts/views/viewPaneContainer.js";
export declare abstract class PaneComposite extends Composite implements IPaneComposite {
    protected storageService: IStorageService;
    protected instantiationService: IInstantiationService;
    protected contextMenuService: IContextMenuService;
    protected extensionService: IExtensionService;
    protected contextService: IWorkspaceContextService;
    private viewPaneContainer?;
    constructor(id: string, telemetryService: ITelemetryService, storageService: IStorageService, instantiationService: IInstantiationService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, contextService: IWorkspaceContextService);
    create(parent: HTMLElement): void;
    setVisible(visible: boolean): void;
    layout(dimension: Dimension): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    getOptimalWidth(): number;
    openView<T extends IView>(id: string, focus?: boolean): T | undefined;
    getViewPaneContainer(): ViewPaneContainer | undefined;
    getActionsContext(): unknown;
    getContextMenuActions(): readonly IAction[];
    getMenuIds(): MenuId[];
    getActions(): readonly IAction[];
    getSecondaryActions(): readonly IAction[];
    getActionViewItem(action: IAction, options: IBaseActionViewItemOptions): IActionViewItem | undefined;
    getTitle(): string;
    focus(): void;
    protected abstract createViewPaneContainer(parent: HTMLElement): ViewPaneContainer;
}
/**
 * A Pane Composite descriptor is a lightweight descriptor of a Pane Composite in the workbench.
 */
export declare class PaneCompositeDescriptor extends CompositeDescriptor<PaneComposite> {
    readonly iconUrl?: URI | undefined;
    static create<Services extends BrandedService[]>(ctor: {
        new (...services: Services): PaneComposite;
    }, id: string, name: string, cssClass?: string, order?: number, requestedIndex?: number, iconUrl?: URI): PaneCompositeDescriptor;
    private constructor();
}
export declare const Extensions: {
    Viewlets: string;
    Panels: string;
    Auxiliary: string;
};
export declare class PaneCompositeRegistry extends CompositeRegistry<PaneComposite> {
    /**
     * Registers a viewlet to the platform.
     */
    registerPaneComposite(descriptor: PaneCompositeDescriptor): void;
    /**
     * Deregisters a viewlet to the platform.
     */
    deregisterPaneComposite(id: string): void;
    /**
     * Returns the viewlet descriptor for the given id or null if none.
     */
    getPaneComposite(id: string): PaneCompositeDescriptor;
    /**
     * Returns an array of registered viewlets known to the platform.
     */
    getPaneComposites(): PaneCompositeDescriptor[];
}
