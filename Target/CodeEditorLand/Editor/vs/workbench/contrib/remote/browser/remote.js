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
import "./media/remoteViewlet.css";
import * as dom from "../../../../base/browser/dom.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import Severity from "../../../../base/common/severity.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isStringArray } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import * as nls from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  PersistentConnectionEventType
} from "../../../../platform/remote/common/remoteAgentConnection.js";
import { getRemoteName } from "../../../../platform/remote/common/remoteHosts.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { getVirtualWorkspaceLocation } from "../../../../platform/workspace/common/virtualWorkspace.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ReloadWindowAction } from "../../../browser/actions/windowActions.js";
import {
  ViewPane
} from "../../../browser/parts/views/viewPane.js";
import { FilterViewPaneContainer } from "../../../browser/parts/views/viewsViewlet.js";
import {
  Extensions,
  IViewDescriptorService,
  ViewContainerLocation
} from "../../../common/views.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import {
  IExtensionService,
  isProposedApiEnabled
} from "../../../services/extensions/common/extensions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import {
  IRemoteExplorerService
} from "../../../services/remote/common/remoteExplorerService.js";
import { ITimerService } from "../../../services/timer/browser/timerService.js";
import { IWalkthroughsService } from "../../welcomeGettingStarted/browser/gettingStartedService.js";
import { SwitchRemoteViewItem } from "./explorerViewItems.js";
import { VIEWLET_ID } from "./remoteExplorer.js";
import * as icons from "./remoteIcons.js";
class HelpTreeVirtualDelegate {
  static {
    __name(this, "HelpTreeVirtualDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return "HelpItemTemplate";
  }
}
class HelpTreeRenderer {
  static {
    __name(this, "HelpTreeRenderer");
  }
  templateId = "HelpItemTemplate";
  renderTemplate(container) {
    container.classList.add("remote-help-tree-node-item");
    const icon = dom.append(
      container,
      dom.$(".remote-help-tree-node-item-icon")
    );
    const parent = container;
    return { parent, icon };
  }
  renderElement(element, index, templateData, height) {
    const container = templateData.parent;
    dom.append(container, templateData.icon);
    templateData.icon.classList.add(...element.element.iconClasses);
    const labelContainer = dom.append(container, dom.$(".help-item-label"));
    labelContainer.innerText = element.element.label;
  }
  disposeTemplate(templateData) {
  }
}
class HelpDataSource {
  static {
    __name(this, "HelpDataSource");
  }
  hasChildren(element) {
    return element instanceof HelpModel;
  }
  getChildren(element) {
    if (element instanceof HelpModel && element.items) {
      return element.items;
    }
    return [];
  }
}
class HelpModel {
  constructor(viewModel, openerService, quickInputService, commandService, remoteExplorerService, environmentService, workspaceContextService, walkthroughsService) {
    this.viewModel = viewModel;
    this.openerService = openerService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.remoteExplorerService = remoteExplorerService;
    this.environmentService = environmentService;
    this.workspaceContextService = workspaceContextService;
    this.walkthroughsService = walkthroughsService;
    this.updateItems();
    viewModel.onDidChangeHelpInformation(() => this.updateItems());
  }
  static {
    __name(this, "HelpModel");
  }
  items;
  createHelpItemValue(info, infoKey) {
    return new HelpItemValue(
      this.commandService,
      this.walkthroughsService,
      info.extensionDescription,
      typeof info.remoteName === "string" ? [info.remoteName] : info.remoteName,
      info.virtualWorkspace,
      info[infoKey]
    );
  }
  updateItems() {
    const helpItems = [];
    const getStarted = this.viewModel.helpInformation.filter(
      (info) => info.getStarted
    );
    if (getStarted.length) {
      const helpItemValues = getStarted.map(
        (info) => this.createHelpItemValue(info, "getStarted")
      );
      const getStartedHelpItem = this.items?.find(
        (item) => item.icon === icons.getStartedIcon
      ) ?? new GetStartedHelpItem(
        icons.getStartedIcon,
        nls.localize("remote.help.getStarted", "Get Started"),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService,
        this.commandService
      );
      getStartedHelpItem.values = helpItemValues;
      helpItems.push(getStartedHelpItem);
    }
    const documentation = this.viewModel.helpInformation.filter(
      (info) => info.documentation
    );
    if (documentation.length) {
      const helpItemValues = documentation.map(
        (info) => this.createHelpItemValue(info, "documentation")
      );
      const documentationHelpItem = this.items?.find(
        (item) => item.icon === icons.documentationIcon
      ) ?? new HelpItem(
        icons.documentationIcon,
        nls.localize(
          "remote.help.documentation",
          "Read Documentation"
        ),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService
      );
      documentationHelpItem.values = helpItemValues;
      helpItems.push(documentationHelpItem);
    }
    const issues = this.viewModel.helpInformation.filter(
      (info) => info.issues
    );
    if (issues.length) {
      const helpItemValues = issues.map(
        (info) => this.createHelpItemValue(info, "issues")
      );
      const reviewIssuesHelpItem = this.items?.find(
        (item) => item.icon === icons.reviewIssuesIcon
      ) ?? new HelpItem(
        icons.reviewIssuesIcon,
        nls.localize("remote.help.issues", "Review Issues"),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService
      );
      reviewIssuesHelpItem.values = helpItemValues;
      helpItems.push(reviewIssuesHelpItem);
    }
    if (helpItems.length) {
      const helpItemValues = this.viewModel.helpInformation.map(
        (info) => this.createHelpItemValue(info, "reportIssue")
      );
      const issueReporterItem = this.items?.find(
        (item) => item.icon === icons.reportIssuesIcon
      ) ?? new IssueReporterItem(
        icons.reportIssuesIcon,
        nls.localize("remote.help.report", "Report Issue"),
        helpItemValues,
        this.quickInputService,
        this.environmentService,
        this.commandService,
        this.openerService,
        this.remoteExplorerService,
        this.workspaceContextService
      );
      issueReporterItem.values = helpItemValues;
      helpItems.push(issueReporterItem);
    }
    if (helpItems.length) {
      this.items = helpItems;
    }
  }
}
class HelpItemValue {
  constructor(commandService, walkthroughService, extensionDescription, remoteAuthority, virtualWorkspace, urlOrCommandOrId) {
    this.commandService = commandService;
    this.walkthroughService = walkthroughService;
    this.extensionDescription = extensionDescription;
    this.remoteAuthority = remoteAuthority;
    this.virtualWorkspace = virtualWorkspace;
    this.urlOrCommandOrId = urlOrCommandOrId;
  }
  static {
    __name(this, "HelpItemValue");
  }
  _url;
  _description;
  get description() {
    return this.getUrl().then(() => this._description);
  }
  get url() {
    return this.getUrl();
  }
  async getUrl() {
    if (this._url === void 0) {
      if (typeof this.urlOrCommandOrId === "string") {
        const url = URI.parse(this.urlOrCommandOrId);
        if (url.authority) {
          this._url = this.urlOrCommandOrId;
        } else {
          const urlCommand = this.commandService.executeCommand(this.urlOrCommandOrId).then((result) => {
            this._url = result;
            return this._url;
          });
          const emptyString = new Promise(
            (resolve) => setTimeout(() => resolve(""), 500)
          );
          this._url = await Promise.race([urlCommand, emptyString]);
        }
      } else if (this.urlOrCommandOrId?.id) {
        try {
          const walkthroughId = `${this.extensionDescription.id}#${this.urlOrCommandOrId.id}`;
          const walkthrough = await this.walkthroughService.getWalkthrough(
            walkthroughId
          );
          this._description = walkthrough.title;
          this._url = walkthroughId;
        } catch {
        }
      }
    }
    if (this._url === void 0) {
      this._url = "";
    }
    return this._url;
  }
}
class HelpItemBase {
  constructor(icon, label, values, quickInputService, environmentService, remoteExplorerService, workspaceContextService) {
    this.icon = icon;
    this.label = label;
    this.values = values;
    this.quickInputService = quickInputService;
    this.environmentService = environmentService;
    this.remoteExplorerService = remoteExplorerService;
    this.workspaceContextService = workspaceContextService;
    this.iconClasses.push(...ThemeIcon.asClassNameArray(icon));
    this.iconClasses.push("remote-help-tree-node-item-icon");
  }
  static {
    __name(this, "HelpItemBase");
  }
  iconClasses = [];
  async getActions() {
    return (await Promise.all(
      this.values.map(async (value) => {
        return {
          label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
          description: await value.description ?? await value.url,
          url: await value.url,
          extensionDescription: value.extensionDescription
        };
      })
    )).filter((item) => item.description);
  }
  async handleClick() {
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
        if (remoteAuthority.startsWith(
          this.remoteExplorerService.targetType[i]
        )) {
          for (const value of this.values) {
            if (value.remoteAuthority) {
              for (const authority of value.remoteAuthority) {
                if (remoteAuthority.startsWith(authority)) {
                  await this.takeAction(
                    value.extensionDescription,
                    await value.url
                  );
                  return;
                }
              }
            }
          }
        }
      }
    } else {
      const virtualWorkspace = getVirtualWorkspaceLocation(
        this.workspaceContextService.getWorkspace()
      )?.scheme;
      if (virtualWorkspace) {
        for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
          for (const value of this.values) {
            if (value.virtualWorkspace && value.remoteAuthority) {
              for (const authority of value.remoteAuthority) {
                if (this.remoteExplorerService.targetType[i].startsWith(authority) && virtualWorkspace.startsWith(
                  value.virtualWorkspace
                )) {
                  await this.takeAction(
                    value.extensionDescription,
                    await value.url
                  );
                  return;
                }
              }
            }
          }
        }
      }
    }
    if (this.values.length > 1) {
      const actions = await this.getActions();
      if (actions.length) {
        const action = await this.quickInputService.pick(actions, {
          placeHolder: nls.localize(
            "pickRemoteExtension",
            "Select url to open"
          )
        });
        if (action) {
          await this.takeAction(
            action.extensionDescription,
            action.url
          );
        }
      }
    } else {
      await this.takeAction(
        this.values[0].extensionDescription,
        await this.values[0].url
      );
    }
  }
}
class GetStartedHelpItem extends HelpItemBase {
  constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService, commandService) {
    super(
      icon,
      label,
      values,
      quickInputService,
      environmentService,
      remoteExplorerService,
      workspaceContextService
    );
    this.openerService = openerService;
    this.commandService = commandService;
  }
  static {
    __name(this, "GetStartedHelpItem");
  }
  async takeAction(extensionDescription, urlOrWalkthroughId) {
    if ([Schemas.http, Schemas.https].includes(
      URI.parse(urlOrWalkthroughId).scheme
    )) {
      this.openerService.open(urlOrWalkthroughId, {
        allowCommands: true
      });
      return;
    }
    this.commandService.executeCommand(
      "workbench.action.openWalkthrough",
      urlOrWalkthroughId
    );
  }
}
class HelpItem extends HelpItemBase {
  constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService, workspaceContextService) {
    super(
      icon,
      label,
      values,
      quickInputService,
      environmentService,
      remoteExplorerService,
      workspaceContextService
    );
    this.openerService = openerService;
  }
  static {
    __name(this, "HelpItem");
  }
  async takeAction(extensionDescription, url) {
    await this.openerService.open(URI.parse(url), { allowCommands: true });
  }
}
class IssueReporterItem extends HelpItemBase {
  constructor(icon, label, values, quickInputService, environmentService, commandService, openerService, remoteExplorerService, workspaceContextService) {
    super(
      icon,
      label,
      values,
      quickInputService,
      environmentService,
      remoteExplorerService,
      workspaceContextService
    );
    this.commandService = commandService;
    this.openerService = openerService;
  }
  static {
    __name(this, "IssueReporterItem");
  }
  async getActions() {
    return Promise.all(
      this.values.map(async (value) => {
        return {
          label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
          description: "",
          url: await value.url,
          extensionDescription: value.extensionDescription
        };
      })
    );
  }
  async takeAction(extensionDescription, url) {
    if (url) {
      await this.openerService.open(URI.parse(url));
    } else {
      await this.commandService.executeCommand(
        "workbench.action.openIssueReporter",
        [extensionDescription.identifier.value]
      );
    }
  }
}
let HelpPanel = class extends ViewPane {
  constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, remoteExplorerService, environmentService, themeService, telemetryService, hoverService, workspaceContextService, walkthroughsService) {
    super(
      options,
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      instantiationService,
      openerService,
      themeService,
      telemetryService,
      hoverService
    );
    this.viewModel = viewModel;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.remoteExplorerService = remoteExplorerService;
    this.environmentService = environmentService;
    this.workspaceContextService = workspaceContextService;
    this.walkthroughsService = walkthroughsService;
  }
  static {
    __name(this, "HelpPanel");
  }
  static ID = "~remote.helpPanel";
  static TITLE = nls.localize2("remote.help", "Help and feedback");
  tree;
  renderBody(container) {
    super.renderBody(container);
    container.classList.add("remote-help");
    const treeContainer = document.createElement("div");
    treeContainer.classList.add("remote-help-content");
    container.appendChild(treeContainer);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "RemoteHelp",
      treeContainer,
      new HelpTreeVirtualDelegate(),
      [new HelpTreeRenderer()],
      new HelpDataSource(),
      {
        accessibilityProvider: {
          getAriaLabel: /* @__PURE__ */ __name((item) => {
            return item.label;
          }, "getAriaLabel"),
          getWidgetAriaLabel: /* @__PURE__ */ __name(() => nls.localize("remotehelp", "Remote Help"), "getWidgetAriaLabel")
        }
      }
    );
    const model = new HelpModel(
      this.viewModel,
      this.openerService,
      this.quickInputService,
      this.commandService,
      this.remoteExplorerService,
      this.environmentService,
      this.workspaceContextService,
      this.walkthroughsService
    );
    this.tree.setInput(model);
    this._register(
      Event.debounce(
        this.tree.onDidOpen,
        (last, event) => event,
        75,
        true
      )((e) => {
        e.element?.handleClick();
      })
    );
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.tree.layout(height, width);
  }
};
HelpPanel = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IViewDescriptorService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IQuickInputService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IRemoteExplorerService),
  __decorateParam(12, IWorkbenchEnvironmentService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, ITelemetryService),
  __decorateParam(15, IHoverService),
  __decorateParam(16, IWorkspaceContextService),
  __decorateParam(17, IWalkthroughsService)
], HelpPanel);
class HelpPanelDescriptor {
  static {
    __name(this, "HelpPanelDescriptor");
  }
  id = HelpPanel.ID;
  name = HelpPanel.TITLE;
  ctorDescriptor;
  canToggleVisibility = true;
  hideByDefault = false;
  group = "help@50";
  order = -10;
  constructor(viewModel) {
    this.ctorDescriptor = new SyncDescriptor(HelpPanel, [viewModel]);
  }
}
let RemoteViewPaneContainer = class extends FilterViewPaneContainer {
  constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, themeService, contextMenuService, extensionService, remoteExplorerService, viewDescriptorService) {
    super(
      VIEWLET_ID,
      remoteExplorerService.onDidChangeTargetType,
      configurationService,
      layoutService,
      telemetryService,
      storageService,
      instantiationService,
      themeService,
      contextMenuService,
      extensionService,
      contextService,
      viewDescriptorService
    );
    this.remoteExplorerService = remoteExplorerService;
    this.addConstantViewDescriptors([this.helpPanelDescriptor]);
    this._register(
      this.remoteSwitcher = this.instantiationService.createInstance(SwitchRemoteViewItem)
    );
    this.remoteExplorerService.onDidChangeHelpInformation((extensions) => {
      this._setHelpInformation(extensions);
    });
    this._setHelpInformation(this.remoteExplorerService.helpInformation);
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    this.remoteSwitcher.createOptionItems(
      viewsRegistry.getViews(this.viewContainer)
    );
    this._register(
      viewsRegistry.onViewsRegistered((e) => {
        const remoteViews = [];
        for (const view of e) {
          if (view.viewContainer.id === VIEWLET_ID) {
            remoteViews.push(...view.views);
          }
        }
        if (remoteViews.length > 0) {
          this.remoteSwitcher.createOptionItems(remoteViews);
        }
      })
    );
    this._register(
      viewsRegistry.onViewsDeregistered((e) => {
        if (e.viewContainer.id === VIEWLET_ID) {
          this.remoteSwitcher.removeOptionItems(e.views);
        }
      })
    );
  }
  static {
    __name(this, "RemoteViewPaneContainer");
  }
  helpPanelDescriptor = new HelpPanelDescriptor(this);
  helpInformation = [];
  _onDidChangeHelpInformation = new Emitter();
  onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
  hasRegisteredHelpView = false;
  remoteSwitcher;
  _setHelpInformation(extensions) {
    const helpInformation = [];
    for (const extension of extensions) {
      this._handleRemoteInfoExtensionPoint(extension, helpInformation);
    }
    this.helpInformation = helpInformation;
    this._onDidChangeHelpInformation.fire();
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    if (this.helpInformation.length && !this.hasRegisteredHelpView) {
      const view = viewsRegistry.getView(this.helpPanelDescriptor.id);
      if (!view) {
        viewsRegistry.registerViews(
          [this.helpPanelDescriptor],
          this.viewContainer
        );
      }
      this.hasRegisteredHelpView = true;
    } else if (this.hasRegisteredHelpView) {
      viewsRegistry.deregisterViews(
        [this.helpPanelDescriptor],
        this.viewContainer
      );
      this.hasRegisteredHelpView = false;
    }
  }
  _handleRemoteInfoExtensionPoint(extension, helpInformation) {
    if (!isProposedApiEnabled(extension.description, "contribRemoteHelp")) {
      return;
    }
    if (!extension.value.documentation && !extension.value.getStarted && !extension.value.issues) {
      return;
    }
    helpInformation.push({
      extensionDescription: extension.description,
      getStarted: extension.value.getStarted,
      documentation: extension.value.documentation,
      reportIssue: extension.value.reportIssue,
      issues: extension.value.issues,
      remoteName: extension.value.remoteName,
      virtualWorkspace: extension.value.virtualWorkspace
    });
  }
  getFilterOn(viewDescriptor) {
    return isStringArray(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority[0] : viewDescriptor.remoteAuthority;
  }
  setFilter(viewDescriptor) {
    this.remoteExplorerService.targetType = isStringArray(
      viewDescriptor.remoteAuthority
    ) ? viewDescriptor.remoteAuthority : [viewDescriptor.remoteAuthority];
  }
  getTitle() {
    const title = nls.localize("remote.explorer", "Remote Explorer");
    return title;
  }
};
RemoteViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, IRemoteExplorerService),
  __decorateParam(10, IViewDescriptorService)
], RemoteViewPaneContainer);
Registry.as(
  Extensions.ViewContainersRegistry
).registerViewContainer(
  {
    id: VIEWLET_ID,
    title: nls.localize2("remote.explorer", "Remote Explorer"),
    ctorDescriptor: new SyncDescriptor(RemoteViewPaneContainer),
    hideIfEmpty: true,
    viewOrderDelegate: {
      getOrder: /* @__PURE__ */ __name((group) => {
        if (!group) {
          return;
        }
        let matches = /^targets@(\d+)$/.exec(group);
        if (matches) {
          return -1e3;
        }
        matches = /^details(@(\d+))?$/.exec(group);
        if (matches) {
          return -500 + Number(matches[2]);
        }
        matches = /^help(@(\d+))?$/.exec(group);
        if (matches) {
          return -10;
        }
        return;
      }, "getOrder")
    },
    icon: icons.remoteExplorerViewIcon,
    order: 4
  },
  ViewContainerLocation.Sidebar
);
let RemoteMarkers = class {
  static {
    __name(this, "RemoteMarkers");
  }
  constructor(remoteAgentService, timerService) {
    remoteAgentService.getEnvironment().then((remoteEnv) => {
      if (remoteEnv) {
        timerService.setPerformanceMarks("server", remoteEnv.marks);
      }
    });
  }
};
RemoteMarkers = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, ITimerService)
], RemoteMarkers);
class VisibleProgress {
  static {
    __name(this, "VisibleProgress");
  }
  location;
  _isDisposed;
  _lastReport;
  _currentProgressPromiseResolve;
  _currentProgress;
  _currentTimer;
  get lastReport() {
    return this._lastReport;
  }
  constructor(progressService, location, initialReport, buttons, onDidCancel) {
    this.location = location;
    this._isDisposed = false;
    this._lastReport = initialReport;
    this._currentProgressPromiseResolve = null;
    this._currentProgress = null;
    this._currentTimer = null;
    const promise = new Promise(
      (resolve) => this._currentProgressPromiseResolve = resolve
    );
    progressService.withProgress(
      { location, buttons },
      (progress) => {
        if (!this._isDisposed) {
          this._currentProgress = progress;
        }
        return promise;
      },
      (choice) => onDidCancel(choice, this._lastReport)
    );
    if (this._lastReport) {
      this.report();
    }
  }
  dispose() {
    this._isDisposed = true;
    if (this._currentProgressPromiseResolve) {
      this._currentProgressPromiseResolve();
      this._currentProgressPromiseResolve = null;
    }
    this._currentProgress = null;
    if (this._currentTimer) {
      this._currentTimer.dispose();
      this._currentTimer = null;
    }
  }
  report(message) {
    if (message) {
      this._lastReport = message;
    }
    if (this._lastReport && this._currentProgress) {
      this._currentProgress.report({ message: this._lastReport });
    }
  }
  startTimer(completionTime) {
    this.stopTimer();
    this._currentTimer = new ReconnectionTimer(this, completionTime);
  }
  stopTimer() {
    if (this._currentTimer) {
      this._currentTimer.dispose();
      this._currentTimer = null;
    }
  }
}
class ReconnectionTimer {
  static {
    __name(this, "ReconnectionTimer");
  }
  _parent;
  _completionTime;
  _renderInterval;
  constructor(parent, completionTime) {
    this._parent = parent;
    this._completionTime = completionTime;
    this._renderInterval = dom.disposableWindowInterval(
      mainWindow,
      () => this._render(),
      1e3
    );
    this._render();
  }
  dispose() {
    this._renderInterval.dispose();
  }
  _render() {
    const remainingTimeMs = this._completionTime - Date.now();
    if (remainingTimeMs < 0) {
      return;
    }
    const remainingTime = Math.ceil(remainingTimeMs / 1e3);
    if (remainingTime === 1) {
      this._parent.report(
        nls.localize(
          "reconnectionWaitOne",
          "Attempting to reconnect in {0} second...",
          remainingTime
        )
      );
    } else {
      this._parent.report(
        nls.localize(
          "reconnectionWaitMany",
          "Attempting to reconnect in {0} seconds...",
          remainingTime
        )
      );
    }
  }
}
const DISCONNECT_PROMPT_TIME = 40 * 1e3;
let RemoteAgentConnectionStatusListener = class extends Disposable {
  static {
    __name(this, "RemoteAgentConnectionStatusListener");
  }
  _reloadWindowShown = false;
  constructor(remoteAgentService, progressService, dialogService, commandService, quickInputService, logService, environmentService, telemetryService) {
    super();
    const connection = remoteAgentService.getConnection();
    if (connection) {
      let showProgress2 = function(location, buttons, initialReport = null) {
        if (visibleProgress) {
          visibleProgress.dispose();
          visibleProgress = null;
        }
        if (!location) {
          location = quickInputVisible ? ProgressLocation.Notification : ProgressLocation.Dialog;
        }
        return new VisibleProgress(
          progressService,
          location,
          initialReport,
          buttons.map((button) => button.label),
          (choice, lastReport) => {
            if (typeof choice !== "undefined" && buttons[choice]) {
              buttons[choice].callback();
            } else if (location === ProgressLocation.Dialog) {
              visibleProgress = showProgress2(
                ProgressLocation.Notification,
                buttons,
                lastReport
              );
            } else {
              hideProgress2();
            }
          }
        );
      }, hideProgress2 = function() {
        if (visibleProgress) {
          visibleProgress.dispose();
          visibleProgress = null;
        }
      };
      var showProgress = showProgress2, hideProgress = hideProgress2;
      __name(showProgress2, "showProgress");
      __name(hideProgress2, "hideProgress");
      let quickInputVisible = false;
      this._register(
        quickInputService.onShow(() => quickInputVisible = true)
      );
      this._register(
        quickInputService.onHide(() => quickInputVisible = false)
      );
      let visibleProgress = null;
      let reconnectWaitEvent = null;
      let disposableListener = null;
      let reconnectionToken = "";
      let lastIncomingDataTime = 0;
      let reconnectionAttempts = 0;
      const reconnectButton = {
        label: nls.localize("reconnectNow", "Reconnect Now"),
        callback: /* @__PURE__ */ __name(() => {
          reconnectWaitEvent?.skipWait();
        }, "callback")
      };
      const reloadButton = {
        label: nls.localize("reloadWindow", "Reload Window"),
        callback: /* @__PURE__ */ __name(() => {
          telemetryService.publicLog2("remoteReconnectionReload", {
            remoteName: getRemoteName(
              environmentService.remoteAuthority
            ),
            reconnectionToken,
            millisSinceLastIncomingData: Date.now() - lastIncomingDataTime,
            attempt: reconnectionAttempts
          });
          commandService.executeCommand(ReloadWindowAction.ID);
        }, "callback")
      };
      connection.onDidStateChange((e) => {
        visibleProgress?.stopTimer();
        if (disposableListener) {
          disposableListener.dispose();
          disposableListener = null;
        }
        switch (e.type) {
          case PersistentConnectionEventType.ConnectionLost:
            reconnectionToken = e.reconnectionToken;
            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
            reconnectionAttempts = 0;
            telemetryService.publicLog2("remoteConnectionLost", {
              remoteName: getRemoteName(
                environmentService.remoteAuthority
              ),
              reconnectionToken: e.reconnectionToken
            });
            if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
              if (!visibleProgress) {
                visibleProgress = showProgress2(null, [
                  reconnectButton,
                  reloadButton
                ]);
              }
              visibleProgress.report(
                nls.localize(
                  "connectionLost",
                  "Connection Lost"
                )
              );
            }
            break;
          case PersistentConnectionEventType.ReconnectionWait:
            if (visibleProgress) {
              reconnectWaitEvent = e;
              visibleProgress = showProgress2(null, [
                reconnectButton,
                reloadButton
              ]);
              visibleProgress.startTimer(
                Date.now() + 1e3 * e.durationSeconds
              );
            }
            break;
          case PersistentConnectionEventType.ReconnectionRunning:
            reconnectionToken = e.reconnectionToken;
            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
            reconnectionAttempts = e.attempt;
            telemetryService.publicLog2("remoteReconnectionRunning", {
              remoteName: getRemoteName(
                environmentService.remoteAuthority
              ),
              reconnectionToken: e.reconnectionToken,
              millisSinceLastIncomingData: e.millisSinceLastIncomingData,
              attempt: e.attempt
            });
            if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
              visibleProgress = showProgress2(null, [
                reloadButton
              ]);
              visibleProgress.report(
                nls.localize(
                  "reconnectionRunning",
                  "Disconnected. Attempting to reconnect..."
                )
              );
              disposableListener = quickInputService.onShow(
                () => {
                  if (visibleProgress && visibleProgress.location === ProgressLocation.Dialog) {
                    visibleProgress = showProgress2(
                      ProgressLocation.Notification,
                      [reloadButton],
                      visibleProgress.lastReport
                    );
                  }
                }
              );
            }
            break;
          case PersistentConnectionEventType.ReconnectionPermanentFailure:
            reconnectionToken = e.reconnectionToken;
            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
            reconnectionAttempts = e.attempt;
            telemetryService.publicLog2("remoteReconnectionPermanentFailure", {
              remoteName: getRemoteName(
                environmentService.remoteAuthority
              ),
              reconnectionToken: e.reconnectionToken,
              millisSinceLastIncomingData: e.millisSinceLastIncomingData,
              attempt: e.attempt,
              handled: e.handled
            });
            hideProgress2();
            if (e.handled) {
              logService.info(
                `Error handled: Not showing a notification for the error.`
              );
              console.log(
                `Error handled: Not showing a notification for the error.`
              );
            } else if (!this._reloadWindowShown) {
              this._reloadWindowShown = true;
              dialogService.confirm({
                type: Severity.Error,
                message: nls.localize(
                  "reconnectionPermanentFailure",
                  "Cannot reconnect. Please reload the window."
                ),
                primaryButton: nls.localize(
                  {
                    key: "reloadWindow.dialog",
                    comment: ["&& denotes a mnemonic"]
                  },
                  "&&Reload Window"
                )
              }).then((result) => {
                if (result.confirmed) {
                  commandService.executeCommand(
                    ReloadWindowAction.ID
                  );
                }
              });
            }
            break;
          case PersistentConnectionEventType.ConnectionGain:
            reconnectionToken = e.reconnectionToken;
            lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
            reconnectionAttempts = e.attempt;
            telemetryService.publicLog2("remoteConnectionGain", {
              remoteName: getRemoteName(
                environmentService.remoteAuthority
              ),
              reconnectionToken: e.reconnectionToken,
              millisSinceLastIncomingData: e.millisSinceLastIncomingData,
              attempt: e.attempt
            });
            hideProgress2();
            break;
        }
      });
    }
  }
};
RemoteAgentConnectionStatusListener = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IProgressService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, ITelemetryService)
], RemoteAgentConnectionStatusListener);
export {
  RemoteAgentConnectionStatusListener,
  RemoteMarkers
};
//# sourceMappingURL=remote.js.map
