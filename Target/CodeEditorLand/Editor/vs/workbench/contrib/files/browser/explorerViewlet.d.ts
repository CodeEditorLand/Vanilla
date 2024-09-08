import "./media/explorerviewlet.css";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import type { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import type { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IViewDescriptorService, type IViewDescriptor, type ViewContainer } from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { ExplorerView } from "./views/explorerView.js";
import { OpenEditorsView } from "./views/openEditorsView.js";
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