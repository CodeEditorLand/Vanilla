var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SCMHistoryItemLoadMoreTreeElement, SCMHistoryItemViewModelTreeElement } from "../common/history.js";
import { ISCMResource, ISCMRepository, ISCMResourceGroup, ISCMInput, ISCMActionButton, ISCMViewService, ISCMProvider } from "../common/scm.js";
import { IMenu, MenuItemAction } from "../../../../platform/actions/common/actions.js";
import { ActionBar, IActionViewItemProvider } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { Action, IAction } from "../../../../base/common/actions.js";
import { createActionViewItem, createAndFillInActionBarActions, createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { equals } from "../../../../base/common/arrays.js";
import { ActionViewItem, IBaseActionViewItemOptions } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { Command } from "../../../../editor/common/languages.js";
import { reset } from "../../../../base/browser/dom.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IResourceNode, ResourceTree } from "../../../../base/common/resourceTree.js";
function isSCMViewService(element) {
  return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
}
__name(isSCMViewService, "isSCMViewService");
function isSCMRepository(element) {
  return !!element.provider && !!element.input;
}
__name(isSCMRepository, "isSCMRepository");
function isSCMInput(element) {
  return !!element.validateInput && typeof element.value === "string";
}
__name(isSCMInput, "isSCMInput");
function isSCMActionButton(element) {
  return element.type === "actionButton";
}
__name(isSCMActionButton, "isSCMActionButton");
function isSCMResourceGroup(element) {
  return !!element.provider && !!element.resources;
}
__name(isSCMResourceGroup, "isSCMResourceGroup");
function isSCMResource(element) {
  return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}
__name(isSCMResource, "isSCMResource");
function isSCMResourceNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
}
__name(isSCMResourceNode, "isSCMResourceNode");
function isSCMHistoryItemViewModelTreeElement(element) {
  return element.type === "historyItemViewModel";
}
__name(isSCMHistoryItemViewModelTreeElement, "isSCMHistoryItemViewModelTreeElement");
function isSCMHistoryItemLoadMoreTreeElement(element) {
  return element.type === "historyItemLoadMore";
}
__name(isSCMHistoryItemLoadMoreTreeElement, "isSCMHistoryItemLoadMoreTreeElement");
const compareActions = /* @__PURE__ */ __name((a, b) => {
  if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
    return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
  }
  return a.id === b.id && a.enabled === b.enabled;
}, "compareActions");
function connectPrimaryMenu(menu, callback, primaryGroup) {
  let cachedPrimary = [];
  let cachedSecondary = [];
  const updateActions = /* @__PURE__ */ __name(() => {
    const primary = [];
    const secondary = [];
    createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, { primary, secondary }, primaryGroup);
    if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
      return;
    }
    cachedPrimary = primary;
    cachedSecondary = secondary;
    callback(primary, secondary);
  }, "updateActions");
  updateActions();
  return menu.onDidChange(updateActions);
}
__name(connectPrimaryMenu, "connectPrimaryMenu");
function connectPrimaryMenuToInlineActionBar(menu, actionBar) {
  return connectPrimaryMenu(menu, (primary) => {
    actionBar.clear();
    actionBar.push(primary, { icon: true, label: false });
  }, "inline");
}
__name(connectPrimaryMenuToInlineActionBar, "connectPrimaryMenuToInlineActionBar");
function collectContextMenuActions(menu) {
  const primary = [];
  const actions = [];
  createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, { primary, secondary: actions }, "inline");
  return actions;
}
__name(collectContextMenuActions, "collectContextMenuActions");
class StatusBarAction extends Action {
  constructor(command, commandService) {
    super(`statusbaraction{${command.id}}`, command.title, "", true);
    this.command = command;
    this.commandService = commandService;
    this.tooltip = command.tooltip || "";
  }
  static {
    __name(this, "StatusBarAction");
  }
  run() {
    return this.commandService.executeCommand(this.command.id, ...this.command.arguments || []);
  }
}
class StatusBarActionViewItem extends ActionViewItem {
  static {
    __name(this, "StatusBarActionViewItem");
  }
  constructor(action, options) {
    super(null, action, { ...options, icon: false, label: true });
  }
  updateLabel() {
    if (this.options.label && this.label) {
      reset(this.label, ...renderLabelWithIcons(this.action.label));
    }
  }
}
function getActionViewItemProvider(instaService) {
  return (action, options) => {
    if (action instanceof StatusBarAction) {
      return new StatusBarActionViewItem(action, options);
    }
    return createActionViewItem(instaService, action, options);
  };
}
__name(getActionViewItemProvider, "getActionViewItemProvider");
function getProviderKey(provider) {
  return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}
__name(getProviderKey, "getProviderKey");
function getRepositoryResourceCount(provider) {
  return provider.groups.reduce((r, g) => r + g.resources.length, 0);
}
__name(getRepositoryResourceCount, "getRepositoryResourceCount");
export {
  StatusBarAction,
  collectContextMenuActions,
  connectPrimaryMenu,
  connectPrimaryMenuToInlineActionBar,
  getActionViewItemProvider,
  getProviderKey,
  getRepositoryResourceCount,
  isSCMActionButton,
  isSCMHistoryItemLoadMoreTreeElement,
  isSCMHistoryItemViewModelTreeElement,
  isSCMInput,
  isSCMRepository,
  isSCMResource,
  isSCMResourceGroup,
  isSCMResourceNode,
  isSCMViewService
};
//# sourceMappingURL=util.js.map
