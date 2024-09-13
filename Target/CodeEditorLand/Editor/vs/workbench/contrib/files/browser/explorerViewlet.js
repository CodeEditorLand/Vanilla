var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import "./media/explorerviewlet.css";
import { isMouseEvent } from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { mark } from "../../../../base/common/performance.js";
import { isMacintosh, isWeb } from "../../../../base/common/platform.js";
import { localize, localize2 } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IsWebContext } from "../../../../platform/contextkey/common/contextkeys.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import { OpenRecentAction } from "../../../browser/actions/windowActions.js";
import {
  AddRootFolderAction,
  OpenFileFolderAction,
  OpenFolderAction,
  OpenFolderViaWorkspaceAction
} from "../../../browser/actions/workspaceActions.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import {
  OpenFolderWorkspaceSupportContext,
  RemoteNameContext,
  WorkbenchStateContext
} from "../../../common/contextkeys.js";
import {
  Extensions,
  IViewDescriptorService,
  ViewContainerLocation,
  ViewContentGroups
} from "../../../common/views.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import {
  ExplorerViewletVisibleContext,
  VIEWLET_ID,
  VIEW_ID
} from "../common/files.js";
import { EmptyView } from "./views/emptyView.js";
import { ExplorerView } from "./views/explorerView.js";
import { OpenEditorsView } from "./views/openEditorsView.js";
const explorerViewIcon = registerIcon(
  "explorer-view-icon",
  Codicon.files,
  localize("explorerViewIcon", "View icon of the explorer view.")
);
const openEditorsViewIcon = registerIcon(
  "open-editors-view-icon",
  Codicon.book,
  localize("openEditorsIcon", "View icon of the open editors view.")
);
let ExplorerViewletViewsContribution = class extends Disposable {
  constructor(workspaceContextService, progressService) {
    super();
    this.workspaceContextService = workspaceContextService;
    progressService.withProgress({ location: ProgressLocation.Explorer }, () => workspaceContextService.getCompleteWorkspace()).finally(() => {
      this.registerViews();
      this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.registerViews()));
      this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.registerViews()));
    });
  }
  static {
    __name(this, "ExplorerViewletViewsContribution");
  }
  static ID = "workbench.contrib.explorerViewletViews";
  registerViews() {
    mark("code/willRegisterExplorerViews");
    const viewDescriptors = viewsRegistry.getViews(VIEW_CONTAINER);
    const viewDescriptorsToRegister = [];
    const viewDescriptorsToDeregister = [];
    const openEditorsViewDescriptor = this.createOpenEditorsViewDescriptor();
    if (!viewDescriptors.some((v) => v.id === openEditorsViewDescriptor.id)) {
      viewDescriptorsToRegister.push(openEditorsViewDescriptor);
    }
    const explorerViewDescriptor = this.createExplorerViewDescriptor();
    const registeredExplorerViewDescriptor = viewDescriptors.find(
      (v) => v.id === explorerViewDescriptor.id
    );
    const emptyViewDescriptor = this.createEmptyViewDescriptor();
    const registeredEmptyViewDescriptor = viewDescriptors.find(
      (v) => v.id === emptyViewDescriptor.id
    );
    if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY || this.workspaceContextService.getWorkspace().folders.length === 0) {
      if (registeredExplorerViewDescriptor) {
        viewDescriptorsToDeregister.push(
          registeredExplorerViewDescriptor
        );
      }
      if (!registeredEmptyViewDescriptor) {
        viewDescriptorsToRegister.push(emptyViewDescriptor);
      }
    } else {
      if (registeredEmptyViewDescriptor) {
        viewDescriptorsToDeregister.push(registeredEmptyViewDescriptor);
      }
      if (!registeredExplorerViewDescriptor) {
        viewDescriptorsToRegister.push(explorerViewDescriptor);
      }
    }
    if (viewDescriptorsToDeregister.length) {
      viewsRegistry.deregisterViews(
        viewDescriptorsToDeregister,
        VIEW_CONTAINER
      );
    }
    if (viewDescriptorsToRegister.length) {
      viewsRegistry.registerViews(
        viewDescriptorsToRegister,
        VIEW_CONTAINER
      );
    }
    mark("code/didRegisterExplorerViews");
  }
  createOpenEditorsViewDescriptor() {
    return {
      id: OpenEditorsView.ID,
      name: OpenEditorsView.NAME,
      ctorDescriptor: new SyncDescriptor(OpenEditorsView),
      containerIcon: openEditorsViewIcon,
      order: 0,
      canToggleVisibility: true,
      canMoveView: true,
      collapsed: false,
      hideByDefault: true,
      focusCommand: {
        id: "workbench.files.action.focusOpenEditorsView",
        keybindings: {
          primary: KeyChord(
            KeyMod.CtrlCmd | KeyCode.KeyK,
            KeyCode.KeyE
          )
        }
      }
    };
  }
  createEmptyViewDescriptor() {
    return {
      id: EmptyView.ID,
      name: EmptyView.NAME,
      containerIcon: explorerViewIcon,
      ctorDescriptor: new SyncDescriptor(EmptyView),
      order: 1,
      canToggleVisibility: true,
      focusCommand: {
        id: "workbench.explorer.fileView.focus"
      }
    };
  }
  createExplorerViewDescriptor() {
    return {
      id: VIEW_ID,
      name: localize2("folders", "Folders"),
      containerIcon: explorerViewIcon,
      ctorDescriptor: new SyncDescriptor(ExplorerView),
      order: 1,
      canMoveView: true,
      canToggleVisibility: false,
      focusCommand: {
        id: "workbench.explorer.fileView.focus"
      }
    };
  }
};
ExplorerViewletViewsContribution = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IProgressService)
], ExplorerViewletViewsContribution);
let ExplorerViewPaneContainer = class extends ViewPaneContainer {
  static {
    __name(this, "ExplorerViewPaneContainer");
  }
  viewletVisibleContextKey;
  constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, contextKeyService, themeService, contextMenuService, extensionService, viewDescriptorService) {
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
    this.viewletVisibleContextKey = ExplorerViewletVisibleContext.bindTo(contextKeyService);
    this._register(
      this.contextService.onDidChangeWorkspaceName(
        (e) => this.updateTitleArea()
      )
    );
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("explorer-viewlet");
  }
  createView(viewDescriptor, options) {
    if (viewDescriptor.id === VIEW_ID) {
      return this.instantiationService.createInstance(ExplorerView, {
        ...options,
        delegate: {
          willOpenElement: /* @__PURE__ */ __name((e) => {
            if (!isMouseEvent(e)) {
              return;
            }
            const openEditorsView = this.getOpenEditorsView();
            if (openEditorsView) {
              let delay = 0;
              const config = this.configurationService.getValue();
              if (!!config.workbench?.editor?.enablePreview) {
                delay = 250;
              }
              openEditorsView.setStructuralRefreshDelay(delay);
            }
          }, "willOpenElement"),
          didOpenElement: /* @__PURE__ */ __name((e) => {
            if (!isMouseEvent(e)) {
              return;
            }
            const openEditorsView = this.getOpenEditorsView();
            openEditorsView?.setStructuralRefreshDelay(0);
          }, "didOpenElement")
        }
      });
    }
    return super.createView(viewDescriptor, options);
  }
  getExplorerView() {
    return this.getView(VIEW_ID);
  }
  getOpenEditorsView() {
    return this.getView(OpenEditorsView.ID);
  }
  setVisible(visible) {
    this.viewletVisibleContextKey.set(visible);
    super.setVisible(visible);
  }
  focus() {
    const explorerView = this.getView(VIEW_ID);
    if (explorerView && this.panes.every((p) => !p.isExpanded())) {
      explorerView.setExpanded(true);
    }
    if (explorerView?.isExpanded()) {
      explorerView.focus();
    } else {
      super.focus();
    }
  }
};
ExplorerViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IViewDescriptorService)
], ExplorerViewPaneContainer);
const viewContainerRegistry = Registry.as(
  Extensions.ViewContainersRegistry
);
const VIEW_CONTAINER = viewContainerRegistry.registerViewContainer(
  {
    id: VIEWLET_ID,
    title: localize2("explore", "Explorer"),
    ctorDescriptor: new SyncDescriptor(ExplorerViewPaneContainer),
    storageId: "workbench.explorer.views.state",
    icon: explorerViewIcon,
    alwaysUseContainerInfo: true,
    hideIfEmpty: true,
    order: 0,
    openCommandActionDescriptor: {
      id: VIEWLET_ID,
      title: localize2("explore", "Explorer"),
      mnemonicTitle: localize(
        {
          key: "miViewExplorer",
          comment: ["&& denotes a mnemonic"]
        },
        "&&Explorer"
      ),
      keybindings: {
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyE
      },
      order: 0
    }
  },
  ViewContainerLocation.Sidebar,
  { isDefault: true }
);
const openFolder = localize("openFolder", "Open Folder");
const addAFolder = localize("addAFolder", "add a folder");
const openRecent = localize("openRecent", "Open Recent");
const addRootFolderButton = `[${openFolder}](command:${AddRootFolderAction.ID})`;
const addAFolderButton = `[${addAFolder}](command:${AddRootFolderAction.ID})`;
const openFolderButton = `[${openFolder}](command:${isMacintosh && !isWeb ? OpenFileFolderAction.ID : OpenFolderAction.ID})`;
const openFolderViaWorkspaceButton = `[${openFolder}](command:${OpenFolderViaWorkspaceAction.ID})`;
const openRecentButton = `[${openRecent}](command:${OpenRecentAction.ID})`;
const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
viewsRegistry.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    {
      key: "noWorkspaceHelp",
      comment: [
        'Please do not translate the word "command", it is part of our internal syntax which must not change'
      ]
    },
    "You have not yet added a folder to the workspace.\n{0}",
    addRootFolderButton
  ),
  when: ContextKeyExpr.and(
    // inside a .code-workspace
    WorkbenchStateContext.isEqualTo("workspace"),
    // unless we cannot enter or open workspaces (e.g. web serverless)
    OpenFolderWorkspaceSupportContext
  ),
  group: ViewContentGroups.Open,
  order: 1
});
viewsRegistry.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    {
      key: "noFolderHelpWeb",
      comment: [
        'Please do not translate the word "command", it is part of our internal syntax which must not change'
      ]
    },
    "You have not yet opened a folder.\n{0}\n{1}",
    openFolderViaWorkspaceButton,
    openRecentButton
  ),
  when: ContextKeyExpr.and(
    // inside a .code-workspace
    WorkbenchStateContext.isEqualTo("workspace"),
    // we cannot enter workspaces (e.g. web serverless)
    OpenFolderWorkspaceSupportContext.toNegated()
  ),
  group: ViewContentGroups.Open,
  order: 1
});
viewsRegistry.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    {
      key: "remoteNoFolderHelp",
      comment: [
        'Please do not translate the word "command", it is part of our internal syntax which must not change'
      ]
    },
    "Connected to remote.\n{0}",
    openFolderButton
  ),
  when: ContextKeyExpr.and(
    // not inside a .code-workspace
    WorkbenchStateContext.notEqualsTo("workspace"),
    // connected to a remote
    RemoteNameContext.notEqualsTo(""),
    // but not in web
    IsWebContext.toNegated()
  ),
  group: ViewContentGroups.Open,
  order: 1
});
viewsRegistry.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    {
      key: "noFolderButEditorsHelp",
      comment: [
        'Please do not translate the word "command", it is part of our internal syntax which must not change'
      ]
    },
    "You have not yet opened a folder.\n{0}\nOpening a folder will close all currently open editors. To keep them open, {1} instead.",
    openFolderButton,
    addAFolderButton
  ),
  when: ContextKeyExpr.and(
    // editors are opened
    ContextKeyExpr.has("editorIsOpen"),
    ContextKeyExpr.or(
      // not inside a .code-workspace and local
      ContextKeyExpr.and(
        WorkbenchStateContext.notEqualsTo("workspace"),
        RemoteNameContext.isEqualTo("")
      ),
      // not inside a .code-workspace and web
      ContextKeyExpr.and(
        WorkbenchStateContext.notEqualsTo("workspace"),
        IsWebContext
      )
    )
  ),
  group: ViewContentGroups.Open,
  order: 1
});
viewsRegistry.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    {
      key: "noFolderHelp",
      comment: [
        'Please do not translate the word "command", it is part of our internal syntax which must not change'
      ]
    },
    "You have not yet opened a folder.\n{0}",
    openFolderButton
  ),
  when: ContextKeyExpr.and(
    // no editor is open
    ContextKeyExpr.has("editorIsOpen")?.negate(),
    ContextKeyExpr.or(
      // not inside a .code-workspace and local
      ContextKeyExpr.and(
        WorkbenchStateContext.notEqualsTo("workspace"),
        RemoteNameContext.isEqualTo("")
      ),
      // not inside a .code-workspace and web
      ContextKeyExpr.and(
        WorkbenchStateContext.notEqualsTo("workspace"),
        IsWebContext
      )
    )
  ),
  group: ViewContentGroups.Open,
  order: 1
});
export {
  ExplorerViewPaneContainer,
  ExplorerViewletViewsContribution,
  VIEW_CONTAINER
};
//# sourceMappingURL=explorerViewlet.js.map
