import { reset } from "../../../../base/browser/dom.js";
import {
  ActionViewItem
} from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Action } from "../../../../base/common/actions.js";
import { equals } from "../../../../base/common/arrays.js";
import {
  ResourceTree
} from "../../../../base/common/resourceTree.js";
import {
  createActionViewItem,
  createAndFillInActionBarActions,
  createAndFillInContextMenuActions
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  MenuItemAction
} from "../../../../platform/actions/common/actions.js";
function isSCMViewService(element) {
  return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
}
function isSCMRepository(element) {
  return !!element.provider && !!element.input;
}
function isSCMInput(element) {
  return !!element.validateInput && typeof element.value === "string";
}
function isSCMActionButton(element) {
  return element.type === "actionButton";
}
function isSCMResourceGroup(element) {
  return !!element.provider && !!element.resources;
}
function isSCMResource(element) {
  return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}
function isSCMResourceNode(element) {
  return ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
}
function isSCMHistoryItemViewModelTreeElement(element) {
  return element.type === "historyItemViewModel";
}
function isSCMHistoryItemLoadMoreTreeElement(element) {
  return element.type === "historyItemLoadMore";
}
const compareActions = (a, b) => {
  if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
    return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
  }
  return a.id === b.id && a.enabled === b.enabled;
};
function connectPrimaryMenu(menu, callback, primaryGroup) {
  let cachedPrimary = [];
  let cachedSecondary = [];
  const updateActions = () => {
    const primary = [];
    const secondary = [];
    createAndFillInActionBarActions(
      menu,
      { shouldForwardArgs: true },
      { primary, secondary },
      primaryGroup
    );
    if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
      return;
    }
    cachedPrimary = primary;
    cachedSecondary = secondary;
    callback(primary, secondary);
  };
  updateActions();
  return menu.onDidChange(updateActions);
}
function connectPrimaryMenuToInlineActionBar(menu, actionBar) {
  return connectPrimaryMenu(
    menu,
    (primary) => {
      actionBar.clear();
      actionBar.push(primary, { icon: true, label: false });
    },
    "inline"
  );
}
function collectContextMenuActions(menu) {
  const primary = [];
  const actions = [];
  createAndFillInContextMenuActions(
    menu,
    { shouldForwardArgs: true },
    { primary, secondary: actions },
    "inline"
  );
  return actions;
}
class StatusBarAction extends Action {
  constructor(command, commandService) {
    super(`statusbaraction{${command.id}}`, command.title, "", true);
    this.command = command;
    this.commandService = commandService;
    this.tooltip = command.tooltip || "";
  }
  run() {
    return this.commandService.executeCommand(
      this.command.id,
      ...this.command.arguments || []
    );
  }
}
class StatusBarActionViewItem extends ActionViewItem {
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
function getProviderKey(provider) {
  return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ""}`;
}
function getRepositoryResourceCount(provider) {
  return provider.groups.reduce((r, g) => r + g.resources.length, 0);
}
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
