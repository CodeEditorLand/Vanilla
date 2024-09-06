import "vs/css!./media/explorerviewlet";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { ViewPaneContainer } from "vs/workbench/browser/parts/views/viewPaneContainer";
import { IViewletViewOptions } from "vs/workbench/browser/parts/views/viewsViewlet";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IViewDescriptor, IViewDescriptorService, ViewContainer } from "vs/workbench/common/views";
import { ExplorerView } from "vs/workbench/contrib/files/browser/views/explorerView";
import { OpenEditorsView } from "vs/workbench/contrib/files/browser/views/openEditorsView";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export declare class ExplorerViewletViewsContribution extends Disposable implements IWorkbenchContribution {
    private readonly workspaceContextService;
    static readonly ID = "workbench.contrib.explorerViewletViews";
    constructor(workspaceContextService: IWorkspaceContextService, progressService: IProgressService);
    private registerViews;
    private createOpenEditorsViewDescriptor;
    private createEmptyViewDescriptor;
    private createExplorerViewDescriptor;
}
export declare class ExplorerViewPaneContainer extends ViewPaneContainer {
    private viewletVisibleContextKey;
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, contextService: IWorkspaceContextService, storageService: IStorageService, configurationService: IConfigurationService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, themeService: IThemeService, contextMenuService: IContextMenuService, extensionService: IExtensionService, viewDescriptorService: IViewDescriptorService);
    create(parent: HTMLElement): void;
    protected createView(viewDescriptor: IViewDescriptor, options: IViewletViewOptions): ViewPane;
    getExplorerView(): ExplorerView;
    getOpenEditorsView(): OpenEditorsView;
    setVisible(visible: boolean): void;
    focus(): void;
}
/**
 * Explorer viewlet container.
 */
export declare const VIEW_CONTAINER: ViewContainer;
