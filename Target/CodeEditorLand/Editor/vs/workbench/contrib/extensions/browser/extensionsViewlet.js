var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./media/extensionsViewlet.css";
import {
  $,
  append,
  Dimension,
  DragAndDropObserver,
  hide,
  show,
  trackFocus
} from "../../../../base/browser/dom.js";
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { Action } from "../../../../base/common/actions.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { Delayer, Promises, timeout } from "../../../../base/common/async.js";
import { createErrorWithActions } from "../../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import {
  Disposable,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { extname } from "../../../../base/common/resources.js";
import Severity from "../../../../base/common/severity.js";
import { localize, localize2 } from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { extractEditorsAndFilesDropData } from "../../../../platform/dnd/browser/dnd.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  EXTENSION_CATEGORIES,
  ExtensionType
} from "../../../../platform/extensions/common/extensions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  INotificationService,
  NotificationPriority
} from "../../../../platform/notification/common/notification.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { registerNavigableContainer } from "../../../browser/actions/widgetNavigationCommands.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import {
  VirtualWorkspaceContext,
  WorkbenchStateContext
} from "../../../common/contextkeys.js";
import { SIDE_BAR_DRAG_AND_DROP_BACKGROUND } from "../../../common/theme.js";
import {
  Extensions,
  IViewDescriptorService,
  ViewContainerLocation
} from "../../../common/views.js";
import {
  IActivityService,
  NumberBadge
} from "../../../services/activity/common/activity.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import {
  IExtensionManagementServerService,
  IWorkbenchExtensionEnablementService
} from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { SuggestEnabledInput } from "../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js";
import { Query } from "../common/extensionQuery.js";
import {
  AutoCheckUpdatesConfigurationKey,
  AutoRestartConfigurationKey,
  CloseExtensionDetailsOnViewChangeKey,
  CONTEXT_HAS_GALLERY,
  extensionsSearchActionsMenu,
  IExtensionsWorkbenchService,
  INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
  OUTDATED_EXTENSIONS_VIEW_ID,
  VIEWLET_ID,
  WORKSPACE_RECOMMENDATIONS_VIEW_ID
} from "../common/extensions.js";
import { ExtensionsInput } from "../common/extensionsInput.js";
import {
  InstallLocalExtensionsInRemoteAction,
  InstallRemoteExtensionsInLocalAction
} from "./extensionsActions.js";
import { installLocalInRemoteIcon } from "./extensionsIcons.js";
import {
  DefaultPopularExtensionsView,
  DefaultRecommendedExtensionsView,
  DeprecatedExtensionsView,
  DisabledExtensionsView,
  EnabledExtensionsView,
  ExtensionsListView,
  NONE_CATEGORY,
  OutdatedExtensionsView,
  RecentlyUpdatedExtensionsView,
  RecommendedExtensionsView,
  SearchMarketplaceExtensionsView,
  ServerInstalledExtensionsView,
  StaticQueryExtensionsView,
  UntrustedWorkspacePartiallySupportedExtensionsView,
  UntrustedWorkspaceUnsupportedExtensionsView,
  VirtualWorkspacePartiallySupportedExtensionsView,
  VirtualWorkspaceUnsupportedExtensionsView,
  WorkspaceRecommendedExtensionsView
} from "./extensionsViews.js";
const DefaultViewsContext = new RawContextKey(
  "defaultExtensionViews",
  true
);
const ExtensionsSortByContext = new RawContextKey(
  "extensionsSortByValue",
  ""
);
const SearchMarketplaceExtensionsContext = new RawContextKey(
  "searchMarketplaceExtensions",
  false
);
const SearchHasTextContext = new RawContextKey(
  "extensionSearchHasText",
  false
);
const InstalledExtensionsContext = new RawContextKey(
  "installedExtensions",
  false
);
const SearchInstalledExtensionsContext = new RawContextKey(
  "searchInstalledExtensions",
  false
);
const SearchRecentlyUpdatedExtensionsContext = new RawContextKey(
  "searchRecentlyUpdatedExtensions",
  false
);
const SearchExtensionUpdatesContext = new RawContextKey(
  "searchExtensionUpdates",
  false
);
const SearchOutdatedExtensionsContext = new RawContextKey(
  "searchOutdatedExtensions",
  false
);
const SearchEnabledExtensionsContext = new RawContextKey(
  "searchEnabledExtensions",
  false
);
const SearchDisabledExtensionsContext = new RawContextKey(
  "searchDisabledExtensions",
  false
);
const HasInstalledExtensionsContext = new RawContextKey(
  "hasInstalledExtensions",
  true
);
const BuiltInExtensionsContext = new RawContextKey(
  "builtInExtensions",
  false
);
const SearchBuiltInExtensionsContext = new RawContextKey(
  "searchBuiltInExtensions",
  false
);
const SearchUnsupportedWorkspaceExtensionsContext = new RawContextKey(
  "searchUnsupportedWorkspaceExtensions",
  false
);
const SearchDeprecatedExtensionsContext = new RawContextKey(
  "searchDeprecatedExtensions",
  false
);
const RecommendedExtensionsContext = new RawContextKey(
  "recommendedExtensions",
  false
);
const SortByUpdateDateContext = new RawContextKey(
  "sortByUpdateDate",
  false
);
const REMOTE_CATEGORY = localize2(
  { key: "remote", comment: ["Remote as in remote machine"] },
  "Remote"
);
let ExtensionsViewletViewsContribution = class extends Disposable {
  constructor(extensionManagementServerService, labelService, viewDescriptorService, contextKeyService) {
    super();
    this.extensionManagementServerService = extensionManagementServerService;
    this.labelService = labelService;
    this.contextKeyService = contextKeyService;
    this.container = viewDescriptorService.getViewContainerById(VIEWLET_ID);
    this.registerViews();
  }
  container;
  registerViews() {
    const viewDescriptors = [];
    viewDescriptors.push(...this.createDefaultExtensionsViewDescriptors());
    viewDescriptors.push(...this.createSearchExtensionsViewDescriptors());
    viewDescriptors.push(
      ...this.createRecommendedExtensionsViewDescriptors()
    );
    viewDescriptors.push(...this.createBuiltinExtensionsViewDescriptors());
    viewDescriptors.push(
      ...this.createUnsupportedWorkspaceExtensionsViewDescriptors()
    );
    viewDescriptors.push(
      ...this.createOtherLocalFilteredExtensionsViewDescriptors()
    );
    Registry.as(Extensions.ViewsRegistry).registerViews(
      viewDescriptors,
      this.container
    );
  }
  createDefaultExtensionsViewDescriptors() {
    const viewDescriptors = [];
    const servers = [];
    if (this.extensionManagementServerService.localExtensionManagementServer) {
      servers.push(
        this.extensionManagementServerService.localExtensionManagementServer
      );
    }
    if (this.extensionManagementServerService.remoteExtensionManagementServer) {
      servers.push(
        this.extensionManagementServerService.remoteExtensionManagementServer
      );
    }
    if (this.extensionManagementServerService.webExtensionManagementServer) {
      servers.push(
        this.extensionManagementServerService.webExtensionManagementServer
      );
    }
    const getViewName = (viewTitle, server) => {
      return servers.length > 1 ? `${server.label} - ${viewTitle}` : viewTitle;
    };
    let installedWebExtensionsContextChangeEvent = Event.None;
    if (this.extensionManagementServerService.webExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
      const interestingContextKeys = /* @__PURE__ */ new Set();
      interestingContextKeys.add("hasInstalledWebExtensions");
      installedWebExtensionsContextChangeEvent = Event.filter(
        this.contextKeyService.onDidChangeContext,
        (e) => e.affectsSome(interestingContextKeys)
      );
    }
    const serverLabelChangeEvent = Event.any(
      this.labelService.onDidChangeFormatters,
      installedWebExtensionsContextChangeEvent
    );
    for (const server of servers) {
      const getInstalledViewName = () => getViewName(localize("installed", "Installed"), server);
      const onDidChangeTitle = Event.map(
        serverLabelChangeEvent,
        () => getInstalledViewName()
      );
      const id = servers.length > 1 ? `workbench.views.extensions.${server.id}.installed` : `workbench.views.extensions.installed`;
      viewDescriptors.push({
        id,
        get name() {
          return {
            value: getInstalledViewName(),
            original: getViewName("Installed", server)
          };
        },
        weight: 100,
        order: 1,
        when: ContextKeyExpr.and(DefaultViewsContext),
        ctorDescriptor: new SyncDescriptor(
          ServerInstalledExtensionsView,
          [{ server, flexibleHeight: true, onDidChangeTitle }]
        ),
        /* Installed extensions views shall not be allowed to hidden when there are more than one server */
        canToggleVisibility: servers.length === 1
      });
      if (server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManagementServerService.localExtensionManagementServer) {
        this._register(
          registerAction2(
            class InstallLocalExtensionsInRemoteAction2 extends Action2 {
              constructor() {
                super({
                  id: "workbench.extensions.installLocalExtensions",
                  get title() {
                    return localize2(
                      "select and install local extensions",
                      "Install Local Extensions in '{0}'...",
                      server.label
                    );
                  },
                  category: REMOTE_CATEGORY,
                  icon: installLocalInRemoteIcon,
                  f1: true,
                  menu: {
                    id: MenuId.ViewTitle,
                    when: ContextKeyExpr.equals("view", id),
                    group: "navigation"
                  }
                });
              }
              run(accessor) {
                return accessor.get(IInstantiationService).createInstance(
                  InstallLocalExtensionsInRemoteAction
                ).run();
              }
            }
          )
        );
      }
    }
    if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
      this._register(
        registerAction2(
          class InstallRemoteExtensionsInLocalAction2 extends Action2 {
            constructor() {
              super({
                id: "workbench.extensions.actions.installLocalExtensionsInRemote",
                title: localize2(
                  "install remote in local",
                  "Install Remote Extensions Locally..."
                ),
                category: REMOTE_CATEGORY,
                f1: true
              });
            }
            run(accessor) {
              return accessor.get(IInstantiationService).createInstance(
                InstallRemoteExtensionsInLocalAction,
                "workbench.extensions.actions.installLocalExtensionsInRemote"
              ).run();
            }
          }
        )
      );
    }
    viewDescriptors.push({
      id: "workbench.views.extensions.popular",
      name: localize2("popularExtensions", "Popular"),
      ctorDescriptor: new SyncDescriptor(DefaultPopularExtensionsView, [
        { hideBadge: true }
      ]),
      when: ContextKeyExpr.and(
        DefaultViewsContext,
        ContextKeyExpr.not("hasInstalledExtensions"),
        CONTEXT_HAS_GALLERY
      ),
      weight: 60,
      order: 2,
      canToggleVisibility: false
    });
    viewDescriptors.push({
      id: "extensions.recommendedList",
      name: localize2("recommendedExtensions", "Recommended"),
      ctorDescriptor: new SyncDescriptor(
        DefaultRecommendedExtensionsView,
        [{ flexibleHeight: true }]
      ),
      when: ContextKeyExpr.and(
        DefaultViewsContext,
        SortByUpdateDateContext.negate(),
        ContextKeyExpr.not(
          "config.extensions.showRecommendationsOnlyOnDemand"
        ),
        CONTEXT_HAS_GALLERY
      ),
      weight: 40,
      order: 3,
      canToggleVisibility: true
    });
    if (servers.length === 1) {
      viewDescriptors.push({
        id: "workbench.views.extensions.enabled",
        name: localize2("enabledExtensions", "Enabled"),
        ctorDescriptor: new SyncDescriptor(EnabledExtensionsView, [{}]),
        when: ContextKeyExpr.and(
          DefaultViewsContext,
          ContextKeyExpr.has("hasInstalledExtensions")
        ),
        hideByDefault: true,
        weight: 40,
        order: 4,
        canToggleVisibility: true
      });
      viewDescriptors.push({
        id: "workbench.views.extensions.disabled",
        name: localize2("disabledExtensions", "Disabled"),
        ctorDescriptor: new SyncDescriptor(DisabledExtensionsView, [
          {}
        ]),
        when: ContextKeyExpr.and(
          DefaultViewsContext,
          ContextKeyExpr.has("hasInstalledExtensions")
        ),
        hideByDefault: true,
        weight: 10,
        order: 5,
        canToggleVisibility: true
      });
    }
    return viewDescriptors;
  }
  createSearchExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: "workbench.views.extensions.marketplace",
      name: localize2("marketPlace", "Marketplace"),
      ctorDescriptor: new SyncDescriptor(
        SearchMarketplaceExtensionsView,
        [{}]
      ),
      when: ContextKeyExpr.and(
        ContextKeyExpr.has("searchMarketplaceExtensions")
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchInstalled",
      name: localize2("installed", "Installed"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.or(
        ContextKeyExpr.has("searchInstalledExtensions"),
        ContextKeyExpr.has("installedExtensions")
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchRecentlyUpdated",
      name: localize2("recently updated", "Recently Updated"),
      ctorDescriptor: new SyncDescriptor(RecentlyUpdatedExtensionsView, [
        {}
      ]),
      when: ContextKeyExpr.or(
        SearchExtensionUpdatesContext,
        ContextKeyExpr.has("searchRecentlyUpdatedExtensions")
      ),
      order: 2
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchEnabled",
      name: localize2("enabled", "Enabled"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(
        ContextKeyExpr.has("searchEnabledExtensions")
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchDisabled",
      name: localize2("disabled", "Disabled"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(
        ContextKeyExpr.has("searchDisabledExtensions")
      )
    });
    viewDescriptors.push({
      id: OUTDATED_EXTENSIONS_VIEW_ID,
      name: localize2("availableUpdates", "Available Updates"),
      ctorDescriptor: new SyncDescriptor(OutdatedExtensionsView, [{}]),
      when: ContextKeyExpr.or(
        SearchExtensionUpdatesContext,
        ContextKeyExpr.has("searchOutdatedExtensions")
      ),
      order: 1
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchBuiltin",
      name: localize2("builtin", "Builtin"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(
        ContextKeyExpr.has("searchBuiltInExtensions")
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.searchWorkspaceUnsupported",
      name: localize2("workspaceUnsupported", "Workspace Unsupported"),
      ctorDescriptor: new SyncDescriptor(ExtensionsListView, [{}]),
      when: ContextKeyExpr.and(
        ContextKeyExpr.has("searchWorkspaceUnsupportedExtensions")
      )
    });
    return viewDescriptors;
  }
  createRecommendedExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: WORKSPACE_RECOMMENDATIONS_VIEW_ID,
      name: localize2(
        "workspaceRecommendedExtensions",
        "Workspace Recommendations"
      ),
      ctorDescriptor: new SyncDescriptor(
        WorkspaceRecommendedExtensionsView,
        [{}]
      ),
      when: ContextKeyExpr.and(
        ContextKeyExpr.has("recommendedExtensions"),
        WorkbenchStateContext.notEqualsTo("empty")
      ),
      order: 1
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.otherRecommendations",
      name: localize2(
        "otherRecommendedExtensions",
        "Other Recommendations"
      ),
      ctorDescriptor: new SyncDescriptor(RecommendedExtensionsView, [{}]),
      when: ContextKeyExpr.has("recommendedExtensions"),
      order: 2
    });
    return viewDescriptors;
  }
  createBuiltinExtensionsViewDescriptors() {
    const viewDescriptors = [];
    const configuredCategories = ["themes", "programming languages"];
    const otherCategories = EXTENSION_CATEGORIES.filter(
      (c) => !configuredCategories.includes(c.toLowerCase())
    );
    otherCategories.push(NONE_CATEGORY);
    const otherCategoriesQuery = `${otherCategories.map((c) => `category:"${c}"`).join(" ")} ${configuredCategories.map((c) => `category:"-${c}"`).join(" ")}`;
    viewDescriptors.push({
      id: "workbench.views.extensions.builtinFeatureExtensions",
      name: localize2("builtinFeatureExtensions", "Features"),
      ctorDescriptor: new SyncDescriptor(StaticQueryExtensionsView, [
        { query: `@builtin ${otherCategoriesQuery}` }
      ]),
      when: ContextKeyExpr.has("builtInExtensions")
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.builtinThemeExtensions",
      name: localize2("builtInThemesExtensions", "Themes"),
      ctorDescriptor: new SyncDescriptor(StaticQueryExtensionsView, [
        { query: `@builtin category:themes` }
      ]),
      when: ContextKeyExpr.has("builtInExtensions")
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.builtinProgrammingLanguageExtensions",
      name: localize2(
        "builtinProgrammingLanguageExtensions",
        "Programming Languages"
      ),
      ctorDescriptor: new SyncDescriptor(StaticQueryExtensionsView, [
        { query: `@builtin category:"programming languages"` }
      ]),
      when: ContextKeyExpr.has("builtInExtensions")
    });
    return viewDescriptors;
  }
  createUnsupportedWorkspaceExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: "workbench.views.extensions.untrustedUnsupportedExtensions",
      name: localize2(
        "untrustedUnsupportedExtensions",
        "Disabled in Restricted Mode"
      ),
      ctorDescriptor: new SyncDescriptor(
        UntrustedWorkspaceUnsupportedExtensionsView,
        [{}]
      ),
      when: ContextKeyExpr.and(
        SearchUnsupportedWorkspaceExtensionsContext
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.untrustedPartiallySupportedExtensions",
      name: localize2(
        "untrustedPartiallySupportedExtensions",
        "Limited in Restricted Mode"
      ),
      ctorDescriptor: new SyncDescriptor(
        UntrustedWorkspacePartiallySupportedExtensionsView,
        [{}]
      ),
      when: ContextKeyExpr.and(
        SearchUnsupportedWorkspaceExtensionsContext
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.virtualUnsupportedExtensions",
      name: localize2(
        "virtualUnsupportedExtensions",
        "Disabled in Virtual Workspaces"
      ),
      ctorDescriptor: new SyncDescriptor(
        VirtualWorkspaceUnsupportedExtensionsView,
        [{}]
      ),
      when: ContextKeyExpr.and(
        VirtualWorkspaceContext,
        SearchUnsupportedWorkspaceExtensionsContext
      )
    });
    viewDescriptors.push({
      id: "workbench.views.extensions.virtualPartiallySupportedExtensions",
      name: localize2(
        "virtualPartiallySupportedExtensions",
        "Limited in Virtual Workspaces"
      ),
      ctorDescriptor: new SyncDescriptor(
        VirtualWorkspacePartiallySupportedExtensionsView,
        [{}]
      ),
      when: ContextKeyExpr.and(
        VirtualWorkspaceContext,
        SearchUnsupportedWorkspaceExtensionsContext
      )
    });
    return viewDescriptors;
  }
  createOtherLocalFilteredExtensionsViewDescriptors() {
    const viewDescriptors = [];
    viewDescriptors.push({
      id: "workbench.views.extensions.deprecatedExtensions",
      name: localize2("deprecated", "Deprecated"),
      ctorDescriptor: new SyncDescriptor(DeprecatedExtensionsView, [{}]),
      when: ContextKeyExpr.and(SearchDeprecatedExtensionsContext)
    });
    return viewDescriptors;
  }
};
ExtensionsViewletViewsContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IContextKeyService)
], ExtensionsViewletViewsContribution);
let ExtensionsViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, progressService, instantiationService, editorGroupService, extensionsWorkbenchService, extensionManagementServerService, notificationService, paneCompositeService, themeService, configurationService, storageService, contextService, contextKeyService, contextMenuService, extensionService, viewDescriptorService, preferencesService, commandService) {
    super(
      VIEWLET_ID,
      { mergeViewWithContainerWhenSingleView: true },
      instantiationService,
      configurationService,
      layoutService,
      contextMenuService,
      telemetryService,
      extensionService,
      themeService,
      storageService,
      contextService,
      viewDescriptorService
    );
    this.progressService = progressService;
    this.editorGroupService = editorGroupService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.notificationService = notificationService;
    this.paneCompositeService = paneCompositeService;
    this.contextKeyService = contextKeyService;
    this.preferencesService = preferencesService;
    this.commandService = commandService;
    this.searchDelayer = new Delayer(500);
    this.defaultViewsContextKey = DefaultViewsContext.bindTo(contextKeyService);
    this.sortByContextKey = ExtensionsSortByContext.bindTo(contextKeyService);
    this.searchMarketplaceExtensionsContextKey = SearchMarketplaceExtensionsContext.bindTo(contextKeyService);
    this.searchHasTextContextKey = SearchHasTextContext.bindTo(contextKeyService);
    this.sortByUpdateDateContextKey = SortByUpdateDateContext.bindTo(contextKeyService);
    this.installedExtensionsContextKey = InstalledExtensionsContext.bindTo(contextKeyService);
    this.searchInstalledExtensionsContextKey = SearchInstalledExtensionsContext.bindTo(contextKeyService);
    this.searchRecentlyUpdatedExtensionsContextKey = SearchRecentlyUpdatedExtensionsContext.bindTo(contextKeyService);
    this.searchExtensionUpdatesContextKey = SearchExtensionUpdatesContext.bindTo(contextKeyService);
    this.searchWorkspaceUnsupportedExtensionsContextKey = SearchUnsupportedWorkspaceExtensionsContext.bindTo(
      contextKeyService
    );
    this.searchDeprecatedExtensionsContextKey = SearchDeprecatedExtensionsContext.bindTo(contextKeyService);
    this.searchOutdatedExtensionsContextKey = SearchOutdatedExtensionsContext.bindTo(contextKeyService);
    this.searchEnabledExtensionsContextKey = SearchEnabledExtensionsContext.bindTo(contextKeyService);
    this.searchDisabledExtensionsContextKey = SearchDisabledExtensionsContext.bindTo(contextKeyService);
    this.hasInstalledExtensionsContextKey = HasInstalledExtensionsContext.bindTo(contextKeyService);
    this.builtInExtensionsContextKey = BuiltInExtensionsContext.bindTo(contextKeyService);
    this.searchBuiltInExtensionsContextKey = SearchBuiltInExtensionsContext.bindTo(contextKeyService);
    this.recommendedExtensionsContextKey = RecommendedExtensionsContext.bindTo(contextKeyService);
    this._register(
      this.paneCompositeService.onDidPaneCompositeOpen((e) => {
        if (e.viewContainerLocation === ViewContainerLocation.Sidebar) {
          this.onViewletOpen(e.composite);
        }
      }, this)
    );
    this._register(
      extensionsWorkbenchService.onReset(() => this.refresh())
    );
    this.searchViewletState = this.getMemento(
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  defaultViewsContextKey;
  sortByContextKey;
  searchMarketplaceExtensionsContextKey;
  searchHasTextContextKey;
  sortByUpdateDateContextKey;
  installedExtensionsContextKey;
  searchInstalledExtensionsContextKey;
  searchRecentlyUpdatedExtensionsContextKey;
  searchExtensionUpdatesContextKey;
  searchOutdatedExtensionsContextKey;
  searchEnabledExtensionsContextKey;
  searchDisabledExtensionsContextKey;
  hasInstalledExtensionsContextKey;
  builtInExtensionsContextKey;
  searchBuiltInExtensionsContextKey;
  searchWorkspaceUnsupportedExtensionsContextKey;
  searchDeprecatedExtensionsContextKey;
  recommendedExtensionsContextKey;
  searchDelayer;
  root;
  searchBox;
  searchViewletState;
  get searchValue() {
    return this.searchBox?.getValue();
  }
  create(parent) {
    parent.classList.add("extensions-viewlet");
    this.root = parent;
    const overlay = append(this.root, $(".overlay"));
    const overlayBackgroundColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? "";
    overlay.style.backgroundColor = overlayBackgroundColor;
    hide(overlay);
    const header = append(this.root, $(".header"));
    const placeholder = localize(
      "searchExtensions",
      "Search Extensions in Marketplace"
    );
    const searchValue = this.searchViewletState["query.value"] ? this.searchViewletState["query.value"] : "";
    const searchContainer = append(
      header,
      $(".extensions-search-container")
    );
    this.searchBox = this._register(
      this.instantiationService.createInstance(
        SuggestEnabledInput,
        `${VIEWLET_ID}.searchbox`,
        searchContainer,
        {
          triggerCharacters: ["@"],
          sortKey: (item) => {
            if (item.indexOf(":") === -1) {
              return "a";
            } else if (/ext:/.test(item) || /id:/.test(item) || /tag:/.test(item)) {
              return "b";
            } else if (/sort:/.test(item)) {
              return "c";
            } else {
              return "d";
            }
          },
          provideResults: (query) => Query.suggestions(query)
        },
        placeholder,
        "extensions:searchinput",
        { placeholderText: placeholder, value: searchValue }
      )
    );
    this.updateInstalledExtensionsContexts();
    if (this.searchBox.getValue()) {
      this.triggerSearch();
    }
    this._register(
      this.searchBox.onInputDidChange(() => {
        this.sortByContextKey.set(
          Query.parse(this.searchBox?.getValue() ?? "").sortBy
        );
        this.triggerSearch();
      }, this)
    );
    this._register(
      this.searchBox.onShouldFocusResults(
        () => this.focusListView(),
        this
      )
    );
    const controlElement = append(
      searchContainer,
      $(".extensions-search-actions-container")
    );
    this._register(
      this.instantiationService.createInstance(
        MenuWorkbenchToolBar,
        controlElement,
        extensionsSearchActionsMenu,
        {
          toolbarOptions: {
            primaryGroup: () => true
          },
          actionViewItemProvider: (action, options) => createActionViewItem(
            this.instantiationService,
            action,
            options
          )
        }
      )
    );
    this._register(
      new DragAndDropObserver(this.root, {
        onDragEnter: (e) => {
          if (this.isSupportedDragElement(e)) {
            show(overlay);
          }
        },
        onDragLeave: (e) => {
          if (this.isSupportedDragElement(e)) {
            hide(overlay);
          }
        },
        onDragOver: (e) => {
          if (this.isSupportedDragElement(e)) {
            e.dataTransfer.dropEffect = "copy";
          }
        },
        onDrop: async (e) => {
          if (this.isSupportedDragElement(e)) {
            hide(overlay);
            const vsixs = coalesce(
              (await this.instantiationService.invokeFunction(
                (accessor) => extractEditorsAndFilesDropData(
                  accessor,
                  e
                )
              )).map(
                (editor) => editor.resource && extname(editor.resource) === ".vsix" ? editor.resource : void 0
              )
            );
            if (vsixs.length > 0) {
              try {
                await this.commandService.executeCommand(
                  INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
                  vsixs
                );
              } catch (err) {
                this.notificationService.error(err);
              }
            }
          }
        }
      })
    );
    super.create(append(this.root, $(".extensions")));
    const focusTracker = this._register(trackFocus(this.root));
    const isSearchBoxFocused = () => this.searchBox?.inputWidget.hasWidgetFocus();
    this._register(
      registerNavigableContainer({
        name: "extensionsView",
        focusNotifiers: [focusTracker],
        focusNextWidget: () => {
          if (isSearchBoxFocused()) {
            this.focusListView();
          }
        },
        focusPreviousWidget: () => {
          if (!isSearchBoxFocused()) {
            this.searchBox?.focus();
          }
        }
      })
    );
  }
  focus() {
    super.focus();
    this.searchBox?.focus();
  }
  layout(dimension) {
    if (this.root) {
      this.root.classList.toggle("narrow", dimension.width <= 250);
      this.root.classList.toggle("mini", dimension.width <= 200);
    }
    this.searchBox?.layout(
      new Dimension(dimension.width - 34 - /*padding*/
      8 - 24 * 2, 20)
    );
    super.layout(new Dimension(dimension.width, dimension.height - 41));
  }
  getOptimalWidth() {
    return 400;
  }
  search(value) {
    if (this.searchBox && this.searchBox.getValue() !== value) {
      this.searchBox.setValue(value);
    }
  }
  async refresh() {
    await this.updateInstalledExtensionsContexts();
    this.doSearch(true);
    if (this.configurationService.getValue(AutoCheckUpdatesConfigurationKey)) {
      this.extensionsWorkbenchService.checkForUpdates();
    }
  }
  async updateInstalledExtensionsContexts() {
    const result = await this.extensionsWorkbenchService.queryLocal();
    this.hasInstalledExtensionsContextKey.set(
      result.some((r) => !r.isBuiltin)
    );
  }
  triggerSearch() {
    this.searchDelayer.trigger(
      () => this.doSearch(),
      this.searchBox && this.searchBox.getValue() ? 500 : 0
    ).then(void 0, (err) => this.onError(err));
  }
  normalizedQuery() {
    return this.searchBox ? this.searchBox.getValue().trim().replace(/@category/g, "category").replace(/@tag:/g, "tag:").replace(/@ext:/g, "ext:").replace(/@featured/g, "featured").replace(
      /@popular/g,
      this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? "@web" : "@popular"
    ) : "";
  }
  saveState() {
    const value = this.searchBox ? this.searchBox.getValue() : "";
    if (ExtensionsListView.isLocalExtensionsQuery(value)) {
      this.searchViewletState["query.value"] = value;
    } else {
      this.searchViewletState["query.value"] = "";
    }
    super.saveState();
  }
  doSearch(refresh) {
    const value = this.normalizedQuery();
    this.contextKeyService.bufferChangeEvents(() => {
      const isRecommendedExtensionsQuery = ExtensionsListView.isRecommendedExtensionsQuery(value);
      this.searchHasTextContextKey.set(value.trim() !== "");
      this.installedExtensionsContextKey.set(
        ExtensionsListView.isInstalledExtensionsQuery(value)
      );
      this.searchInstalledExtensionsContextKey.set(
        ExtensionsListView.isSearchInstalledExtensionsQuery(value)
      );
      this.searchRecentlyUpdatedExtensionsContextKey.set(
        ExtensionsListView.isSearchRecentlyUpdatedQuery(value) && !ExtensionsListView.isSearchExtensionUpdatesQuery(value)
      );
      this.searchOutdatedExtensionsContextKey.set(
        ExtensionsListView.isOutdatedExtensionsQuery(value) && !ExtensionsListView.isSearchExtensionUpdatesQuery(value)
      );
      this.searchExtensionUpdatesContextKey.set(
        ExtensionsListView.isSearchExtensionUpdatesQuery(value)
      );
      this.searchEnabledExtensionsContextKey.set(
        ExtensionsListView.isEnabledExtensionsQuery(value)
      );
      this.searchDisabledExtensionsContextKey.set(
        ExtensionsListView.isDisabledExtensionsQuery(value)
      );
      this.searchBuiltInExtensionsContextKey.set(
        ExtensionsListView.isSearchBuiltInExtensionsQuery(value)
      );
      this.searchWorkspaceUnsupportedExtensionsContextKey.set(
        ExtensionsListView.isSearchWorkspaceUnsupportedExtensionsQuery(
          value
        )
      );
      this.searchDeprecatedExtensionsContextKey.set(
        ExtensionsListView.isSearchDeprecatedExtensionsQuery(value)
      );
      this.builtInExtensionsContextKey.set(
        ExtensionsListView.isBuiltInExtensionsQuery(value)
      );
      this.recommendedExtensionsContextKey.set(
        isRecommendedExtensionsQuery
      );
      this.searchMarketplaceExtensionsContextKey.set(
        !!value && !ExtensionsListView.isLocalExtensionsQuery(value) && !isRecommendedExtensionsQuery
      );
      this.sortByUpdateDateContextKey.set(
        ExtensionsListView.isSortUpdateDateQuery(value)
      );
      this.defaultViewsContextKey.set(
        !value || ExtensionsListView.isSortInstalledExtensionsQuery(value)
      );
    });
    return this.progress(
      Promise.all(
        this.panes.map(
          (view) => view.show(this.normalizedQuery(), refresh).then(
            (model) => this.alertSearchResult(model.length, view.id)
          )
        )
      )
    ).then(() => void 0);
  }
  onDidAddViewDescriptors(added) {
    const addedViews = super.onDidAddViewDescriptors(added);
    this.progress(
      Promise.all(
        addedViews.map(
          (addedView) => addedView.show(this.normalizedQuery()).then(
            (model) => this.alertSearchResult(model.length, addedView.id)
          )
        )
      )
    );
    return addedViews;
  }
  alertSearchResult(count, viewId) {
    const view = this.viewContainerModel.visibleViewDescriptors.find(
      (view2) => view2.id === viewId
    );
    switch (count) {
      case 0:
        break;
      case 1:
        if (view) {
          alert(
            localize(
              "extensionFoundInSection",
              "1 extension found in the {0} section.",
              view.name.value
            )
          );
        } else {
          alert(localize("extensionFound", "1 extension found."));
        }
        break;
      default:
        if (view) {
          alert(
            localize(
              "extensionsFoundInSection",
              "{0} extensions found in the {1} section.",
              count,
              view.name.value
            )
          );
        } else {
          alert(
            localize(
              "extensionsFound",
              "{0} extensions found.",
              count
            )
          );
        }
        break;
    }
  }
  getFirstExpandedPane() {
    for (const pane of this.panes) {
      if (pane.isExpanded() && pane instanceof ExtensionsListView) {
        return pane;
      }
    }
    return void 0;
  }
  focusListView() {
    const pane = this.getFirstExpandedPane();
    if (pane && pane.count() > 0) {
      pane.focus();
    }
  }
  onViewletOpen(viewlet) {
    if (!viewlet || viewlet.getId() === VIEWLET_ID) {
      return;
    }
    if (this.configurationService.getValue(
      CloseExtensionDetailsOnViewChangeKey
    )) {
      const promises = this.editorGroupService.groups.map((group) => {
        const editors = group.editors.filter(
          (input) => input instanceof ExtensionsInput
        );
        return group.closeEditors(editors);
      });
      Promise.all(promises);
    }
  }
  progress(promise) {
    return this.progressService.withProgress(
      { location: ProgressLocation.Extensions },
      () => promise
    );
  }
  onError(err) {
    if (isCancellationError(err)) {
      return;
    }
    const message = err && err.message || "";
    if (/ECONNREFUSED/.test(message)) {
      const error = createErrorWithActions(
        localize(
          "suggestProxyError",
          "Marketplace returned 'ECONNREFUSED'. Please check the 'http.proxy' setting."
        ),
        [
          new Action(
            "open user settings",
            localize("open user settings", "Open User Settings"),
            void 0,
            true,
            () => this.preferencesService.openUserSettings()
          )
        ]
      );
      this.notificationService.error(error);
      return;
    }
    this.notificationService.error(err);
  }
  isSupportedDragElement(e) {
    if (e.dataTransfer) {
      const typesLowerCase = e.dataTransfer.types.map(
        (t) => t.toLocaleLowerCase()
      );
      return typesLowerCase.indexOf("files") !== -1;
    }
    return false;
  }
};
ExtensionsViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IProgressService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IExtensionsWorkbenchService),
  __decorateParam(6, IExtensionManagementServerService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IPaneCompositePartService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IWorkspaceContextService),
  __decorateParam(13, IContextKeyService),
  __decorateParam(14, IContextMenuService),
  __decorateParam(15, IExtensionService),
  __decorateParam(16, IViewDescriptorService),
  __decorateParam(17, IPreferencesService),
  __decorateParam(18, ICommandService)
], ExtensionsViewPaneContainer);
let StatusUpdater = class extends Disposable {
  constructor(activityService, extensionsWorkbenchService, extensionEnablementService, configurationService) {
    super();
    this.activityService = activityService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.configurationService = configurationService;
    this.onServiceChange();
    this._register(
      Event.debounce(
        extensionsWorkbenchService.onChange,
        () => void 0,
        100,
        void 0,
        void 0,
        void 0,
        this._store
      )(this.onServiceChange, this)
    );
  }
  badgeHandle = this._register(new MutableDisposable());
  onServiceChange() {
    this.badgeHandle.clear();
    const actionRequired = this.configurationService.getValue(AutoRestartConfigurationKey) === true ? [] : this.extensionsWorkbenchService.installed.filter(
      (e) => e.runtimeState !== void 0
    );
    const outdated = this.extensionsWorkbenchService.outdated.reduce(
      (r, e) => r + (this.extensionEnablementService.isEnabled(e.local) && !actionRequired.includes(e) ? 1 : 0),
      0
    );
    const newBadgeNumber = outdated + actionRequired.length;
    if (newBadgeNumber > 0) {
      let msg = "";
      if (outdated) {
        msg += outdated === 1 ? localize(
          "extensionToUpdate",
          "{0} requires update",
          outdated
        ) : localize(
          "extensionsToUpdate",
          "{0} require update",
          outdated
        );
      }
      if (outdated > 0 && actionRequired.length > 0) {
        msg += ", ";
      }
      if (actionRequired.length) {
        msg += actionRequired.length === 1 ? localize(
          "extensionToReload",
          "{0} requires restart",
          actionRequired.length
        ) : localize(
          "extensionsToReload",
          "{0} require restart",
          actionRequired.length
        );
      }
      const badge = new NumberBadge(newBadgeNumber, () => msg);
      this.badgeHandle.value = this.activityService.showViewContainerActivity(VIEWLET_ID, {
        badge
      });
    }
  }
};
StatusUpdater = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IWorkbenchExtensionEnablementService),
  __decorateParam(3, IConfigurationService)
], StatusUpdater);
let MaliciousExtensionChecker = class {
  constructor(extensionsManagementService, hostService, logService, notificationService, environmentService) {
    this.extensionsManagementService = extensionsManagementService;
    this.hostService = hostService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.environmentService = environmentService;
    if (!this.environmentService.disableExtensions) {
      this.loopCheckForMaliciousExtensions();
    }
  }
  loopCheckForMaliciousExtensions() {
    this.checkForMaliciousExtensions().then(() => timeout(1e3 * 60 * 5)).then(() => this.loopCheckForMaliciousExtensions());
  }
  checkForMaliciousExtensions() {
    return this.extensionsManagementService.getExtensionsControlManifest().then(
      (extensionsControlManifest) => {
        return this.extensionsManagementService.getInstalled(ExtensionType.User).then((installed) => {
          const maliciousExtensions = installed.filter(
            (e) => extensionsControlManifest.malicious.some(
              (identifier) => areSameExtensions(
                e.identifier,
                identifier
              )
            )
          );
          if (maliciousExtensions.length) {
            return Promises.settled(
              maliciousExtensions.map(
                (e) => this.extensionsManagementService.uninstall(e).then(() => {
                  this.notificationService.prompt(
                    Severity.Warning,
                    localize(
                      "malicious warning",
                      "We have uninstalled '{0}' which was reported to be problematic.",
                      e.identifier.id
                    ),
                    [
                      {
                        label: localize(
                          "reloadNow",
                          "Reload Now"
                        ),
                        run: () => this.hostService.reload()
                      }
                    ],
                    {
                      sticky: true,
                      priority: NotificationPriority.URGENT
                    }
                  );
                })
              )
            );
          } else {
            return Promise.resolve(void 0);
          }
        }).then(() => void 0);
      },
      (err) => this.logService.error(err)
    );
  }
};
MaliciousExtensionChecker = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IHostService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IWorkbenchEnvironmentService)
], MaliciousExtensionChecker);
export {
  BuiltInExtensionsContext,
  DefaultViewsContext,
  ExtensionsSortByContext,
  ExtensionsViewPaneContainer,
  ExtensionsViewletViewsContribution,
  MaliciousExtensionChecker,
  RecommendedExtensionsContext,
  SearchHasTextContext,
  SearchMarketplaceExtensionsContext,
  StatusUpdater
};
