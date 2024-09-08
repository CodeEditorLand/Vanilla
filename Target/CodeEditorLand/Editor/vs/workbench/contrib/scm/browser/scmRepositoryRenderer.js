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
import "./media/scm.css";
import { $, append } from "../../../../base/browser/dom.js";
import { CountBadge } from "../../../../base/browser/ui/countBadge/countBadge.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { ActionRunner } from "../../../../base/common/actions.js";
import {
  combinedDisposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { autorun } from "../../../../base/common/observable.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import {
  IMenuService,
  MenuId,
  MenuItemAction
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { defaultCountBadgeStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import {
  ISCMViewService
} from "../common/scm.js";
import {
  connectPrimaryMenu,
  getRepositoryResourceCount,
  isSCMRepository,
  StatusBarAction
} from "./util.js";
class RepositoryActionRunner extends ActionRunner {
  constructor(getSelectedRepositories) {
    super();
    this.getSelectedRepositories = getSelectedRepositories;
  }
  async runAction(action, context) {
    if (!(action instanceof MenuItemAction)) {
      return super.runAction(action, context);
    }
    const selection = this.getSelectedRepositories().map((r) => r.provider);
    const actionContext = selection.some((s) => s === context) ? selection : [context];
    await action.run(...actionContext);
  }
}
let RepositoryRenderer = class {
  constructor(toolbarMenuId, actionViewItemProvider, commandService, contextKeyService, contextMenuService, hoverService, keybindingService, menuService, scmViewService, telemetryService) {
    this.toolbarMenuId = toolbarMenuId;
    this.actionViewItemProvider = actionViewItemProvider;
    this.commandService = commandService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.scmViewService = scmViewService;
    this.telemetryService = telemetryService;
  }
  static TEMPLATE_ID = "repository";
  get templateId() {
    return RepositoryRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    if (container.classList.contains("monaco-tl-contents")) {
      container.parentElement.parentElement.querySelector(
        ".monaco-tl-twistie"
      ).classList.add("force-twistie");
    }
    const provider = append(container, $(".scm-provider"));
    const label = append(provider, $(".label"));
    const labelCustomHover = this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("mouse"),
      label,
      "",
      {}
    );
    const name = append(label, $("span.name"));
    const description = append(label, $("span.description"));
    const actions = append(provider, $(".actions"));
    const toolBar = new WorkbenchToolBar(
      actions,
      {
        actionViewItemProvider: this.actionViewItemProvider,
        resetMenu: this.toolbarMenuId
      },
      this.menuService,
      this.contextKeyService,
      this.contextMenuService,
      this.keybindingService,
      this.commandService,
      this.telemetryService
    );
    const countContainer = append(provider, $(".count"));
    const count = new CountBadge(
      countContainer,
      {},
      defaultCountBadgeStyles
    );
    const visibilityDisposable = toolBar.onDidChangeDropdownVisibility(
      (e) => provider.classList.toggle("active", e)
    );
    const templateDisposable = combinedDisposable(
      labelCustomHover,
      visibilityDisposable,
      toolBar
    );
    return {
      label,
      labelCustomHover,
      name,
      description,
      countContainer,
      count,
      toolBar,
      elementDisposables: new DisposableStore(),
      templateDisposable
    };
  }
  renderElement(arg, index, templateData, height) {
    const repository = isSCMRepository(arg) ? arg : arg.element;
    templateData.name.textContent = repository.provider.name;
    if (repository.provider.rootUri) {
      templateData.labelCustomHover.update(
        `${repository.provider.label}: ${repository.provider.rootUri.fsPath}`
      );
      templateData.description.textContent = repository.provider.label;
    } else {
      templateData.labelCustomHover.update(repository.provider.label);
      templateData.description.textContent = "";
    }
    let statusPrimaryActions = [];
    let menuPrimaryActions = [];
    let menuSecondaryActions = [];
    const updateToolbar = () => {
      templateData.toolBar.setActions(
        [...statusPrimaryActions, ...menuPrimaryActions],
        menuSecondaryActions
      );
    };
    templateData.elementDisposables.add(
      autorun((reader) => {
        const commands = repository.provider.statusBarCommands.read(reader) ?? [];
        statusPrimaryActions = commands.map(
          (c) => new StatusBarAction(c, this.commandService)
        );
        updateToolbar();
      })
    );
    templateData.elementDisposables.add(
      autorun((reader) => {
        const count = repository.provider.count.read(reader) ?? getRepositoryResourceCount(repository.provider);
        templateData.countContainer.setAttribute(
          "data-count",
          String(count)
        );
        templateData.count.setCount(count);
      })
    );
    const repositoryMenus = this.scmViewService.menus.getRepositoryMenus(
      repository.provider
    );
    const menu = this.toolbarMenuId === MenuId.SCMTitle ? repositoryMenus.titleMenu.menu : repositoryMenus.repositoryMenu;
    templateData.elementDisposables.add(
      connectPrimaryMenu(menu, (primary, secondary) => {
        menuPrimaryActions = primary;
        menuSecondaryActions = secondary;
        updateToolbar();
      })
    );
    templateData.toolBar.context = repository.provider;
  }
  renderCompressedElements() {
    throw new Error("Should never happen since node is incompressible");
  }
  disposeElement(group, index, template) {
    template.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.templateDisposable.dispose();
  }
};
RepositoryRenderer = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IMenuService),
  __decorateParam(8, ISCMViewService),
  __decorateParam(9, ITelemetryService)
], RepositoryRenderer);
export {
  RepositoryActionRunner,
  RepositoryRenderer
};
