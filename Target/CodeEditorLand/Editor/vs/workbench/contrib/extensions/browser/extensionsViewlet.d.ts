import "vs/css!./media/extensionsViewlet";
import { Dimension } from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IExtensionManagementService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ViewPane } from "vs/workbench/browser/parts/views/viewPane";
import { ViewPaneContainer } from "vs/workbench/browser/parts/views/viewPaneContainer";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IAddedViewDescriptorRef, IViewDescriptorService } from "vs/workbench/common/views";
import { IActivityService } from "vs/workbench/services/activity/common/activity";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionManagementServerService, IWorkbenchExtensionEnablementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
import { IExtensionsViewPaneContainer, IExtensionsWorkbenchService } from "../common/extensions";
export declare const DefaultViewsContext: any;
export declare const ExtensionsSortByContext: any;
export declare const SearchMarketplaceExtensionsContext: any;
export declare const SearchHasTextContext: any;
export declare const BuiltInExtensionsContext: any;
export declare const RecommendedExtensionsContext: any;
export declare class ExtensionsViewletViewsContribution extends Disposable implements IWorkbenchContribution {
    private readonly extensionManagementServerService;
    private readonly labelService;
    private readonly contextKeyService;
    private readonly container;
    constructor(extensionManagementServerService: IExtensionManagementServerService, labelService: ILabelService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService);
    private registerViews;
    private createDefaultExtensionsViewDescriptors;
    private createSearchExtensionsViewDescriptors;
    private createRecommendedExtensionsViewDescriptors;
    private createBuiltinExtensionsViewDescriptors;
    private createUnsupportedWorkspaceExtensionsViewDescriptors;
    private createOtherLocalFilteredExtensionsViewDescriptors;
}
export declare class ExtensionsViewPaneContainer extends ViewPaneContainer implements IExtensionsViewPaneContainer {
    private readonly progressService;
    private readonly editorGroupService;
    private readonly extensionsWorkbenchService;
    private readonly extensionManagementServerService;
    private readonly notificationService;
    private readonly paneCompositeService;
    private readonly contextKeyService;
    private readonly preferencesService;
    private readonly commandService;
    private defaultViewsContextKey;
    private sortByContextKey;
    private searchMarketplaceExtensionsContextKey;
    private searchHasTextContextKey;
    private sortByUpdateDateContextKey;
    private installedExtensionsContextKey;
    private searchInstalledExtensionsContextKey;
    private searchRecentlyUpdatedExtensionsContextKey;
    private searchExtensionUpdatesContextKey;
    private searchOutdatedExtensionsContextKey;
    private searchEnabledExtensionsContextKey;
    private searchDisabledExtensionsContextKey;
    private hasInstalledExtensionsContextKey;
    private builtInExtensionsContextKey;
    private searchBuiltInExtensionsContextKey;
    private searchWorkspaceUnsupportedExtensionsContextKey;
    private searchDeprecatedExtensionsContextKey;
    private recommendedExtensionsContextKey;
    private searchDelayer;
    private root;
    private searchBox;
    private readonly searchViewletState;
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, progressService: IProgressService, instantiationService: IInstantiationService, editorGroupService: IEditorGroupsService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionManagementServerService: IExtensionManagementServerService, notificationService: INotificationService, paneCompositeService: IPaneCompositePartService, themeService: IThemeService, configurationService: IConfigurationService, storageService: IStorageService, contextService: IWorkspaceContextService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, extensionService: IExtensionService, viewDescriptorService: IViewDescriptorService, preferencesService: IPreferencesService, commandService: ICommandService);
    get searchValue(): string | undefined;
    create(parent: HTMLElement): void;
    focus(): void;
    layout(dimension: Dimension): void;
    getOptimalWidth(): number;
    search(value: string): void;
    refresh(): Promise<void>;
    private updateInstalledExtensionsContexts;
    private triggerSearch;
    private normalizedQuery;
    protected saveState(): void;
    private doSearch;
    protected onDidAddViewDescriptors(added: IAddedViewDescriptorRef[]): ViewPane[];
    private alertSearchResult;
    private getFirstExpandedPane;
    private focusListView;
    private onViewletOpen;
    private progress;
    private onError;
    private isSupportedDragElement;
}
export declare class StatusUpdater extends Disposable implements IWorkbenchContribution {
    private readonly activityService;
    private readonly extensionsWorkbenchService;
    private readonly extensionEnablementService;
    private readonly configurationService;
    private readonly badgeHandle;
    constructor(activityService: IActivityService, extensionsWorkbenchService: IExtensionsWorkbenchService, extensionEnablementService: IWorkbenchExtensionEnablementService, configurationService: IConfigurationService);
    private onServiceChange;
}
export declare class MaliciousExtensionChecker implements IWorkbenchContribution {
    private readonly extensionsManagementService;
    private readonly hostService;
    private readonly logService;
    private readonly notificationService;
    private readonly environmentService;
    constructor(extensionsManagementService: IExtensionManagementService, hostService: IHostService, logService: ILogService, notificationService: INotificationService, environmentService: IWorkbenchEnvironmentService);
    private loopCheckForMaliciousExtensions;
    private checkForMaliciousExtensions;
}
