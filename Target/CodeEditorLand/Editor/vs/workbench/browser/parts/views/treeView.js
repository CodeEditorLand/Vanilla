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
import { DataTransfers, IDragAndDropData } from "../../../../base/browser/dnd.js";
import * as DOM from "../../../../base/browser/dom.js";
import { renderMarkdownAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { ActionBar, IActionViewItemProvider } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { IIdentityProvider, IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { ElementsDragAndDropData, ListViewTargetSector } from "../../../../base/browser/ui/list/listView.js";
import { IAsyncDataSource, ITreeContextMenuEvent, ITreeDragAndDrop, ITreeDragOverReaction, ITreeNode, ITreeRenderer, TreeDragOverBubble } from "../../../../base/browser/ui/tree/tree.js";
import { CollapseAllAction } from "../../../../base/browser/ui/tree/treeDefaults.js";
import { ActionRunner, IAction, Separator } from "../../../../base/common/actions.js";
import { timeout } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { createMatches, FuzzyScore } from "../../../../base/common/filters.js";
import { IMarkdownString, isMarkdownString, MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, IDisposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../base/common/mime.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename, dirname } from "../../../../base/common/resources.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import "./media/views.css";
import { VSDataTransfer } from "../../../../base/common/dataTransfer.js";
import { localize } from "../../../../nls.js";
import { createActionViewItem, createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry, ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, ContextKeyExpression, IContextKey, IContextKeyChangeEvent, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { ColorScheme } from "../../../../platform/theme/common/theme.js";
import { FileThemeIcon, FolderThemeIcon, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { fillEditorsDragData } from "../../dnd.js";
import { IResourceLabel, ResourceLabels } from "../../labels.js";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from "../editor/editorCommands.js";
import { getLocationBasedViewColors, IViewPaneOptions, ViewPane } from "./viewPane.js";
import { IViewletViewOptions } from "./viewsViewlet.js";
import { Extensions, ITreeItem, ITreeItemLabel, ITreeView, ITreeViewDataProvider, ITreeViewDescriptor, ITreeViewDragAndDropController, IViewBadge, IViewDescriptorService, IViewsRegistry, ResolvableTreeItem, TreeCommand, TreeItemCollapsibleState, TreeViewItemHandleArg, TreeViewPaneHandleArg, ViewContainer, ViewContainerLocation } from "../../../common/views.js";
import { IActivityService, NumberBadge } from "../../../services/activity/common/activity.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHoverService, WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { CodeDataTransfers, LocalSelectionTransfer } from "../../../../platform/dnd/browser/dnd.js";
import { toExternalVSDataTransfer } from "../../../../editor/browser/dnd.js";
import { CheckboxStateHandler, TreeItemCheckbox } from "./checkbox.js";
import { setTimeout0 } from "../../../../base/common/platform.js";
import { AriaRole } from "../../../../base/browser/ui/aria/aria.js";
import { TelemetryTrustedValue } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { ITreeViewsDnDService } from "../../../../editor/common/services/treeViewsDndService.js";
import { DraggedTreeItemsIdentifier } from "../../../../editor/common/services/treeViewsDnd.js";
import { IMarkdownRenderResult, MarkdownRenderer } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { parseLinkedText } from "../../../../base/common/linkedText.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IAccessibleViewInformationService } from "../../../services/accessibility/common/accessibleViewInformationService.js";
import { Command } from "../../../../editor/common/languages.js";
let TreeViewPane = class extends ViewPane {
  static {
    __name(this, "TreeViewPane");
  }
  treeView;
  _container;
  _actionRunner;
  constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService, hoverService, accessibleViewService) {
    super({ ...options, titleMenuId: MenuId.ViewTitle, donotForwardArgs: false }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService, accessibleViewService);
    const { treeView } = Registry.as(Extensions.ViewsRegistry).getView(options.id);
    this.treeView = treeView;
    this._register(this.treeView.onDidChangeActions(() => this.updateActions(), this));
    this._register(this.treeView.onDidChangeTitle((newTitle) => this.updateTitle(newTitle)));
    this._register(this.treeView.onDidChangeDescription((newDescription) => this.updateTitleDescription(newDescription)));
    this._register(toDisposable(() => {
      if (this._container && this.treeView.container && this._container === this.treeView.container) {
        this.treeView.setVisibility(false);
      }
    }));
    this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
    this._register(this.treeView.onDidChangeWelcomeState(() => this._onDidChangeViewWelcomeState.fire()));
    if (options.title !== this.treeView.title) {
      this.updateTitle(this.treeView.title);
    }
    if (options.titleDescription !== this.treeView.description) {
      this.updateTitleDescription(this.treeView.description);
    }
    this._actionRunner = new MultipleSelectionActionRunner(notificationService, () => this.treeView.getSelection());
    this.updateTreeVisibility();
  }
  focus() {
    super.focus();
    this.treeView.focus();
  }
  renderBody(container) {
    this._container = container;
    super.renderBody(container);
    this.renderTreeView(container);
  }
  shouldShowWelcome() {
    return (this.treeView.dataProvider === void 0 || !!this.treeView.dataProvider.isTreeEmpty) && (this.treeView.message === void 0 || this.treeView.message === "");
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.layoutTreeView(height, width);
  }
  getOptimalWidth() {
    return this.treeView.getOptimalWidth();
  }
  renderTreeView(container) {
    this.treeView.show(container);
  }
  layoutTreeView(height, width) {
    this.treeView.layout(height, width);
  }
  updateTreeVisibility() {
    this.treeView.setVisibility(this.isBodyVisible());
  }
  getActionRunner() {
    return this._actionRunner;
  }
  getActionsContext() {
    return { $treeViewId: this.id, $focusedTreeItem: true, $selectedTreeItems: true };
  }
};
TreeViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IAccessibleViewInformationService)
], TreeViewPane);
class Root {
  static {
    __name(this, "Root");
  }
  label = { label: "root" };
  handle = "0";
  parentHandle = void 0;
  collapsibleState = TreeItemCollapsibleState.Expanded;
  children = void 0;
}
function commandPreconditions(commandId) {
  const command = CommandsRegistry.getCommand(commandId);
  if (command) {
    const commandAction = MenuRegistry.getCommand(command.id);
    return commandAction && commandAction.precondition;
  }
  return void 0;
}
__name(commandPreconditions, "commandPreconditions");
function isTreeCommandEnabled(treeCommand, contextKeyService) {
  const commandId = treeCommand.originalId ? treeCommand.originalId : treeCommand.id;
  const precondition = commandPreconditions(commandId);
  if (precondition) {
    return contextKeyService.contextMatchesRules(precondition);
  }
  return true;
}
__name(isTreeCommandEnabled, "isTreeCommandEnabled");
function isRenderedMessageValue(messageValue) {
  return !!messageValue && typeof messageValue !== "string" && "element" in messageValue && "disposables" in messageValue;
}
__name(isRenderedMessageValue, "isRenderedMessageValue");
const noDataProviderMessage = localize("no-dataprovider", "There is no data provider registered that can provide view data.");
const RawCustomTreeViewContextKey = new RawContextKey("customTreeView", false);
class Tree extends WorkbenchAsyncDataTree {
  static {
    __name(this, "Tree");
  }
}
let AbstractTreeView = class extends Disposable {
  constructor(id, _title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService, openerService) {
    super();
    this.id = id;
    this._title = _title;
    this.themeService = themeService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.progressService = progressService;
    this.contextMenuService = contextMenuService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.viewDescriptorService = viewDescriptorService;
    this.hoverService = hoverService;
    this.contextKeyService = contextKeyService;
    this.activityService = activityService;
    this.logService = logService;
    this.openerService = openerService;
    this.root = new Root();
    this.lastActive = this.root;
  }
  static {
    __name(this, "AbstractTreeView");
  }
  isVisible = false;
  _hasIconForParentNode = false;
  _hasIconForLeafNode = false;
  collapseAllContextKey;
  collapseAllContext;
  collapseAllToggleContextKey;
  collapseAllToggleContext;
  refreshContextKey;
  refreshContext;
  focused = false;
  domNode;
  treeContainer;
  _messageValue;
  _canSelectMany = false;
  _manuallyManageCheckboxes = false;
  messageElement;
  tree;
  treeLabels;
  treeViewDnd;
  _container;
  root;
  markdownRenderer;
  elementsToRefresh = [];
  lastSelection = [];
  lastActive;
  _onDidExpandItem = this._register(new Emitter());
  onDidExpandItem = this._onDidExpandItem.event;
  _onDidCollapseItem = this._register(new Emitter());
  onDidCollapseItem = this._onDidCollapseItem.event;
  _onDidChangeSelectionAndFocus = this._register(new Emitter());
  onDidChangeSelectionAndFocus = this._onDidChangeSelectionAndFocus.event;
  _onDidChangeVisibility = this._register(new Emitter());
  onDidChangeVisibility = this._onDidChangeVisibility.event;
  _onDidChangeActions = this._register(new Emitter());
  onDidChangeActions = this._onDidChangeActions.event;
  _onDidChangeWelcomeState = this._register(new Emitter());
  onDidChangeWelcomeState = this._onDidChangeWelcomeState.event;
  _onDidChangeTitle = this._register(new Emitter());
  onDidChangeTitle = this._onDidChangeTitle.event;
  _onDidChangeDescription = this._register(new Emitter());
  onDidChangeDescription = this._onDidChangeDescription.event;
  _onDidChangeCheckboxState = this._register(new Emitter());
  onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
  _onDidCompleteRefresh = this._register(new Emitter());
  _isInitialized = false;
  initialize() {
    if (this._isInitialized) {
      return;
    }
    this._isInitialized = true;
    this.contextKeyService.bufferChangeEvents(() => {
      this.initializeShowCollapseAllAction();
      this.initializeCollapseAllToggle();
      this.initializeShowRefreshAction();
    });
    this.treeViewDnd = this.instantiationService.createInstance(CustomTreeViewDragAndDrop, this.id);
    if (this._dragAndDropController) {
      this.treeViewDnd.controller = this._dragAndDropController;
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("explorer.decorations")) {
        this.doRefresh([this.root]);
      }
    }));
    this._register(this.viewDescriptorService.onDidChangeLocation(({ views, from, to }) => {
      if (views.some((v) => v.id === this.id)) {
        this.tree?.updateOptions({ overrideStyles: getLocationBasedViewColors(this.viewLocation).listOverrideStyles });
      }
    }));
    this.registerActions();
    this.create();
  }
  get viewContainer() {
    return this.viewDescriptorService.getViewContainerByViewId(this.id);
  }
  get viewLocation() {
    return this.viewDescriptorService.getViewLocationById(this.id);
  }
  _dragAndDropController;
  get dragAndDropController() {
    return this._dragAndDropController;
  }
  set dragAndDropController(dnd) {
    this._dragAndDropController = dnd;
    if (this.treeViewDnd) {
      this.treeViewDnd.controller = dnd;
    }
  }
  _dataProvider;
  get dataProvider() {
    return this._dataProvider;
  }
  set dataProvider(dataProvider) {
    if (dataProvider) {
      if (this.visible) {
        this.activate();
      }
      const self = this;
      this._dataProvider = new class {
        _isEmpty = true;
        _onDidChangeEmpty = new Emitter();
        onDidChangeEmpty = this._onDidChangeEmpty.event;
        get isTreeEmpty() {
          return this._isEmpty;
        }
        async getChildren(node) {
          let children;
          const checkboxesUpdated = [];
          if (node && node.children) {
            children = node.children;
          } else {
            node = node ?? self.root;
            node.children = await (node instanceof Root ? dataProvider.getChildren() : dataProvider.getChildren(node));
            children = node.children ?? [];
            children.forEach((child) => {
              child.parent = node;
              if (!self.manuallyManageCheckboxes && node?.checkbox?.isChecked === true && child.checkbox?.isChecked === false) {
                child.checkbox.isChecked = true;
                checkboxesUpdated.push(child);
              }
            });
          }
          if (node instanceof Root) {
            const oldEmpty = this._isEmpty;
            this._isEmpty = children.length === 0;
            if (oldEmpty !== this._isEmpty) {
              this._onDidChangeEmpty.fire();
            }
          }
          if (checkboxesUpdated.length > 0) {
            self._onDidChangeCheckboxState.fire(checkboxesUpdated);
          }
          return children;
        }
      }();
      if (this._dataProvider.onDidChangeEmpty) {
        this._register(this._dataProvider.onDidChangeEmpty(() => {
          this.updateCollapseAllToggle();
          this._onDidChangeWelcomeState.fire();
        }));
      }
      this.updateMessage();
      this.refresh();
    } else {
      this._dataProvider = void 0;
      this.treeDisposables.clear();
      this.activated = false;
      this.updateMessage();
    }
    this._onDidChangeWelcomeState.fire();
  }
  _message;
  get message() {
    return this._message;
  }
  set message(message) {
    this._message = message;
    this.updateMessage();
    this._onDidChangeWelcomeState.fire();
  }
  get title() {
    return this._title;
  }
  set title(name) {
    this._title = name;
    this._onDidChangeTitle.fire(this._title);
  }
  _description;
  get description() {
    return this._description;
  }
  set description(description) {
    this._description = description;
    this._onDidChangeDescription.fire(this._description);
  }
  _badge;
  _activity = this._register(new MutableDisposable());
  get badge() {
    return this._badge;
  }
  set badge(badge) {
    if (this._badge?.value === badge?.value && this._badge?.tooltip === badge?.tooltip) {
      return;
    }
    this._badge = badge;
    if (badge) {
      const activity = {
        badge: new NumberBadge(badge.value, () => badge.tooltip),
        priority: 50
      };
      this._activity.value = this.activityService.showViewActivity(this.id, activity);
    } else {
      this._activity.clear();
    }
  }
  get canSelectMany() {
    return this._canSelectMany;
  }
  set canSelectMany(canSelectMany) {
    const oldCanSelectMany = this._canSelectMany;
    this._canSelectMany = canSelectMany;
    if (this._canSelectMany !== oldCanSelectMany) {
      this.tree?.updateOptions({ multipleSelectionSupport: this.canSelectMany });
    }
  }
  get manuallyManageCheckboxes() {
    return this._manuallyManageCheckboxes;
  }
  set manuallyManageCheckboxes(manuallyManageCheckboxes) {
    this._manuallyManageCheckboxes = manuallyManageCheckboxes;
  }
  get hasIconForParentNode() {
    return this._hasIconForParentNode;
  }
  get hasIconForLeafNode() {
    return this._hasIconForLeafNode;
  }
  get visible() {
    return this.isVisible;
  }
  initializeShowCollapseAllAction(startingValue = false) {
    if (!this.collapseAllContext) {
      this.collapseAllContextKey = new RawContextKey(`treeView.${this.id}.enableCollapseAll`, startingValue, localize("treeView.enableCollapseAll", "Whether the the tree view with id {0} enables collapse all.", this.id));
      this.collapseAllContext = this.collapseAllContextKey.bindTo(this.contextKeyService);
    }
    return true;
  }
  get showCollapseAllAction() {
    this.initializeShowCollapseAllAction();
    return !!this.collapseAllContext?.get();
  }
  set showCollapseAllAction(showCollapseAllAction) {
    this.initializeShowCollapseAllAction(showCollapseAllAction);
    this.collapseAllContext?.set(showCollapseAllAction);
  }
  initializeShowRefreshAction(startingValue = false) {
    if (!this.refreshContext) {
      this.refreshContextKey = new RawContextKey(`treeView.${this.id}.enableRefresh`, startingValue, localize("treeView.enableRefresh", "Whether the tree view with id {0} enables refresh.", this.id));
      this.refreshContext = this.refreshContextKey.bindTo(this.contextKeyService);
    }
  }
  get showRefreshAction() {
    this.initializeShowRefreshAction();
    return !!this.refreshContext?.get();
  }
  set showRefreshAction(showRefreshAction) {
    this.initializeShowRefreshAction(showRefreshAction);
    this.refreshContext?.set(showRefreshAction);
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.treeView.${that.id}.refresh`,
          title: localize("refresh", "Refresh"),
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", that.id), that.refreshContextKey),
            group: "navigation",
            order: Number.MAX_SAFE_INTEGER - 1
          },
          icon: Codicon.refresh
        });
      }
      async run() {
        return that.refresh();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.treeView.${that.id}.collapseAll`,
          title: localize("collapseAll", "Collapse All"),
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", that.id), that.collapseAllContextKey),
            group: "navigation",
            order: Number.MAX_SAFE_INTEGER
          },
          precondition: that.collapseAllToggleContextKey,
          icon: Codicon.collapseAll
        });
      }
      async run() {
        if (that.tree) {
          return new CollapseAllAction(that.tree, true).run();
        }
      }
    }));
  }
  setVisibility(isVisible) {
    this.initialize();
    isVisible = !!isVisible;
    if (this.isVisible === isVisible) {
      return;
    }
    this.isVisible = isVisible;
    if (this.tree) {
      if (this.isVisible) {
        DOM.show(this.tree.getHTMLElement());
      } else {
        DOM.hide(this.tree.getHTMLElement());
      }
      if (this.isVisible && this.elementsToRefresh.length && this.dataProvider) {
        this.doRefresh(this.elementsToRefresh);
        this.elementsToRefresh = [];
      }
    }
    setTimeout0(() => {
      if (this.dataProvider) {
        this._onDidChangeVisibility.fire(this.isVisible);
      }
    });
    if (this.visible) {
      this.activate();
    }
  }
  activated = false;
  focus(reveal = true, revealItem) {
    if (this.tree && this.root.children && this.root.children.length > 0) {
      const element = revealItem ?? this.tree.getSelection()[0];
      if (element && reveal) {
        this.tree.reveal(element, 0.5);
      }
      this.tree.domFocus();
    } else if (this.tree && this.treeContainer && !this.treeContainer.classList.contains("hide")) {
      this.tree.domFocus();
    } else {
      this.domNode.focus();
    }
  }
  show(container) {
    this._container = container;
    DOM.append(container, this.domNode);
  }
  create() {
    this.domNode = DOM.$(".tree-explorer-viewlet-tree-view");
    this.messageElement = DOM.append(this.domNode, DOM.$(".message"));
    this.updateMessage();
    this.treeContainer = DOM.append(this.domNode, DOM.$(".customview-tree"));
    this.treeContainer.classList.add("file-icon-themable-tree", "show-file-icons");
    const focusTracker = this._register(DOM.trackFocus(this.domNode));
    this._register(focusTracker.onDidFocus(() => this.focused = true));
    this._register(focusTracker.onDidBlur(() => this.focused = false));
  }
  treeDisposables = this._register(new DisposableStore());
  createTree() {
    this.treeDisposables.clear();
    const actionViewItemProvider = createActionViewItem.bind(void 0, this.instantiationService);
    const treeMenus = this.treeDisposables.add(this.instantiationService.createInstance(TreeMenus, this.id));
    this.treeLabels = this.treeDisposables.add(this.instantiationService.createInstance(ResourceLabels, this));
    const dataSource = this.instantiationService.createInstance(TreeDataSource, this, (task) => this.progressService.withProgress({ location: this.id }, () => task));
    const aligner = new Aligner(this.themeService);
    const checkboxStateHandler = this.treeDisposables.add(new CheckboxStateHandler());
    const renderer = this.instantiationService.createInstance(TreeRenderer, this.id, treeMenus, this.treeLabels, actionViewItemProvider, aligner, checkboxStateHandler, () => this.manuallyManageCheckboxes);
    this.treeDisposables.add(renderer.onDidChangeCheckboxState((e) => this._onDidChangeCheckboxState.fire(e)));
    const widgetAriaLabel = this._title;
    this.tree = this.treeDisposables.add(this.instantiationService.createInstance(
      Tree,
      this.id,
      this.treeContainer,
      new TreeViewDelegate(),
      [renderer],
      dataSource,
      {
        identityProvider: new TreeViewIdentityProvider(),
        accessibilityProvider: {
          getAriaLabel(element) {
            if (element.accessibilityInformation) {
              return element.accessibilityInformation.label;
            }
            if (isString(element.tooltip)) {
              return element.tooltip;
            } else {
              if (element.resourceUri && !element.label) {
                return null;
              }
              let buildAriaLabel = "";
              if (element.label) {
                buildAriaLabel += element.label.label + " ";
              }
              if (element.description) {
                buildAriaLabel += element.description;
              }
              return buildAriaLabel;
            }
          },
          getRole(element) {
            return element.accessibilityInformation?.role ?? "treeitem";
          },
          getWidgetAriaLabel() {
            return widgetAriaLabel;
          }
        },
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: /* @__PURE__ */ __name((item) => {
            return item.label ? item.label.label : item.resourceUri ? basename(URI.revive(item.resourceUri)) : void 0;
          }, "getKeyboardNavigationLabel")
        },
        expandOnlyOnTwistieClick: /* @__PURE__ */ __name((e) => {
          return !!e.command || !!e.checkbox || this.configurationService.getValue("workbench.tree.expandMode") === "doubleClick";
        }, "expandOnlyOnTwistieClick"),
        collapseByDefault: /* @__PURE__ */ __name((e) => {
          return e.collapsibleState !== TreeItemCollapsibleState.Expanded;
        }, "collapseByDefault"),
        multipleSelectionSupport: this.canSelectMany,
        dnd: this.treeViewDnd,
        overrideStyles: getLocationBasedViewColors(this.viewLocation).listOverrideStyles
      }
    ));
    this.treeDisposables.add(renderer.onDidChangeMenuContext((e) => e.forEach((e2) => this.tree?.rerender(e2))));
    this.treeDisposables.add(this.tree);
    treeMenus.setContextKeyService(this.tree.contextKeyService);
    aligner.tree = this.tree;
    const actionRunner = new MultipleSelectionActionRunner(this.notificationService, () => this.tree.getSelection());
    renderer.actionRunner = actionRunner;
    this.tree.contextKeyService.createKey(this.id, true);
    const customTreeKey = RawCustomTreeViewContextKey.bindTo(this.tree.contextKeyService);
    customTreeKey.set(true);
    this.treeDisposables.add(this.tree.onContextMenu((e) => this.onContextMenu(treeMenus, e, actionRunner)));
    this.treeDisposables.add(this.tree.onDidChangeSelection((e) => {
      this.lastSelection = e.elements;
      this.lastActive = this.tree?.getFocus()[0] ?? this.lastActive;
      this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
    }));
    this.treeDisposables.add(this.tree.onDidChangeFocus((e) => {
      if (e.elements.length && e.elements[0] !== this.lastActive) {
        this.lastActive = e.elements[0];
        this.lastSelection = this.tree?.getSelection() ?? this.lastSelection;
        this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
      }
    }));
    this.treeDisposables.add(this.tree.onDidChangeCollapseState((e) => {
      if (!e.node.element) {
        return;
      }
      const element = Array.isArray(e.node.element.element) ? e.node.element.element[0] : e.node.element.element;
      if (e.node.collapsed) {
        this._onDidCollapseItem.fire(element);
      } else {
        this._onDidExpandItem.fire(element);
      }
    }));
    this.tree.setInput(this.root).then(() => this.updateContentAreas());
    this.treeDisposables.add(this.tree.onDidOpen(async (e) => {
      if (!e.browserEvent) {
        return;
      }
      if (e.browserEvent.target && e.browserEvent.target.classList.contains(TreeItemCheckbox.checkboxClass)) {
        return;
      }
      const selection = this.tree.getSelection();
      const command = await this.resolveCommand(selection.length === 1 ? selection[0] : void 0);
      if (command && isTreeCommandEnabled(command, this.contextKeyService)) {
        let args = command.arguments || [];
        if (command.id === API_OPEN_EDITOR_COMMAND_ID || command.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
          args = [...args, e];
        }
        try {
          await this.commandService.executeCommand(command.id, ...args);
        } catch (err) {
          this.notificationService.error(err);
        }
      }
    }));
    this.treeDisposables.add(treeMenus.onDidChange((changed) => {
      if (this.tree?.hasNode(changed)) {
        this.tree?.rerender(changed);
      }
    }));
  }
  async resolveCommand(element) {
    let command = element?.command;
    if (element && !command) {
      if (element instanceof ResolvableTreeItem && element.hasResolve) {
        await element.resolve(CancellationToken.None);
        command = element.command;
      }
    }
    return command;
  }
  onContextMenu(treeMenus, treeEvent, actionRunner) {
    this.hoverService.hideHover();
    const node = treeEvent.element;
    if (node === null) {
      return;
    }
    const event = treeEvent.browserEvent;
    event.preventDefault();
    event.stopPropagation();
    this.tree.setFocus([node]);
    let selected = this.canSelectMany ? this.getSelection() : [];
    if (!selected.find((item) => item.handle === node.handle)) {
      selected = [node];
    }
    const actions = treeMenus.getResourceContextActions(selected);
    if (!actions.length) {
      return;
    }
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => treeEvent.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
      getActionViewItem: /* @__PURE__ */ __name((action) => {
        const keybinding = this.keybindingService.lookupKeybinding(action.id);
        if (keybinding) {
          return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
        }
        return void 0;
      }, "getActionViewItem"),
      onHide: /* @__PURE__ */ __name((wasCancelled) => {
        if (wasCancelled) {
          this.tree.domFocus();
        }
      }, "onHide"),
      getActionsContext: /* @__PURE__ */ __name(() => ({ $treeViewId: this.id, $treeItemHandle: node.handle }), "getActionsContext"),
      actionRunner
    });
  }
  updateMessage() {
    if (this._message) {
      this.showMessage(this._message);
    } else if (!this.dataProvider) {
      this.showMessage(noDataProviderMessage);
    } else {
      this.hideMessage();
    }
    this.updateContentAreas();
  }
  processMessage(message, disposables) {
    const lines = message.value.split("\n");
    const result = [];
    let hasFoundButton = false;
    for (const line of lines) {
      const linkedText = parseLinkedText(line);
      if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== "string") {
        const node = linkedText.nodes[0];
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        const button = new Button(buttonContainer, { title: node.title, secondary: hasFoundButton, supportIcons: true, ...defaultButtonStyles });
        button.label = node.label;
        button.onDidClick((_) => {
          this.openerService.open(node.href, { allowCommands: true });
        }, null, disposables);
        const href = URI.parse(node.href);
        if (href.scheme === Schemas.command) {
          const preConditions = commandPreconditions(href.path);
          if (preConditions) {
            button.enabled = this.contextKeyService.contextMatchesRules(preConditions);
            disposables.add(this.contextKeyService.onDidChangeContext((e) => {
              if (e.affectsSome(new Set(preConditions.keys()))) {
                button.enabled = this.contextKeyService.contextMatchesRules(preConditions);
              }
            }));
          }
        }
        disposables.add(button);
        hasFoundButton = true;
        result.push(buttonContainer);
      } else {
        hasFoundButton = false;
        const rendered = this.markdownRenderer.render(new MarkdownString(line, { isTrusted: message.isTrusted, supportThemeIcons: message.supportThemeIcons, supportHtml: message.supportHtml }));
        result.push(rendered.element);
        disposables.add(rendered);
      }
    }
    const container = document.createElement("div");
    container.classList.add("rendered-message");
    for (const child of result) {
      if (DOM.isHTMLElement(child)) {
        container.appendChild(child);
      } else {
        container.appendChild(child.element);
      }
    }
    return container;
  }
  showMessage(message) {
    if (isRenderedMessageValue(this._messageValue)) {
      this._messageValue.disposables.dispose();
    }
    if (isMarkdownString(message) && !this.markdownRenderer) {
      this.markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
    }
    if (isMarkdownString(message)) {
      const disposables = new DisposableStore();
      const renderedMessage = this.processMessage(message, disposables);
      this._messageValue = { element: renderedMessage, disposables };
    } else {
      this._messageValue = message;
    }
    if (!this.messageElement) {
      return;
    }
    this.messageElement.classList.remove("hide");
    this.resetMessageElement();
    if (typeof this._messageValue === "string" && !isFalsyOrWhitespace(this._messageValue)) {
      this.messageElement.textContent = this._messageValue;
    } else if (isRenderedMessageValue(this._messageValue)) {
      this.messageElement.appendChild(this._messageValue.element);
    }
    this.layout(this._height, this._width);
  }
  hideMessage() {
    this.resetMessageElement();
    this.messageElement?.classList.add("hide");
    this.layout(this._height, this._width);
  }
  resetMessageElement() {
    if (this.messageElement) {
      DOM.clearNode(this.messageElement);
    }
  }
  _height = 0;
  _width = 0;
  layout(height, width) {
    if (height && width && this.messageElement && this.treeContainer) {
      this._height = height;
      this._width = width;
      const treeHeight = height - DOM.getTotalHeight(this.messageElement);
      this.treeContainer.style.height = treeHeight + "px";
      this.tree?.layout(treeHeight, width);
    }
  }
  getOptimalWidth() {
    if (this.tree) {
      const parentNode = this.tree.getHTMLElement();
      const childNodes = [].slice.call(parentNode.querySelectorAll(".outline-item-label > a"));
      return DOM.getLargestChildWidth(parentNode, childNodes);
    }
    return 0;
  }
  async refresh(elements) {
    if (this.dataProvider && this.tree) {
      if (this.refreshing) {
        await Event.toPromise(this._onDidCompleteRefresh.event);
      }
      if (!elements) {
        elements = [this.root];
        this.elementsToRefresh = [];
      }
      for (const element of elements) {
        element.children = void 0;
      }
      if (this.isVisible) {
        return this.doRefresh(elements);
      } else {
        if (this.elementsToRefresh.length) {
          const seen = /* @__PURE__ */ new Set();
          this.elementsToRefresh.forEach((element) => seen.add(element.handle));
          for (const element of elements) {
            if (!seen.has(element.handle)) {
              this.elementsToRefresh.push(element);
            }
          }
        } else {
          this.elementsToRefresh.push(...elements);
        }
      }
    }
    return void 0;
  }
  async expand(itemOrItems) {
    const tree = this.tree;
    if (!tree) {
      return;
    }
    try {
      itemOrItems = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
      for (const element of itemOrItems) {
        await tree.expand(element, false);
      }
    } catch (e) {
    }
  }
  isCollapsed(item) {
    return !!this.tree?.isCollapsed(item);
  }
  setSelection(items) {
    this.tree?.setSelection(items);
  }
  getSelection() {
    return this.tree?.getSelection() ?? [];
  }
  setFocus(item) {
    if (this.tree) {
      if (item) {
        this.focus(true, item);
        this.tree.setFocus([item]);
      } else if (this.tree.getFocus().length === 0) {
        this.tree.setFocus([]);
      }
    }
  }
  async reveal(item) {
    if (this.tree) {
      return this.tree.reveal(item);
    }
  }
  refreshing = false;
  async doRefresh(elements) {
    const tree = this.tree;
    if (tree && this.visible) {
      this.refreshing = true;
      const oldSelection = tree.getSelection();
      try {
        await Promise.all(elements.map((element) => tree.updateChildren(element, true, true)));
      } catch (e) {
        this.logService.error(e);
      }
      const newSelection = tree.getSelection();
      if (oldSelection.length !== newSelection.length || oldSelection.some((value, index) => value.handle !== newSelection[index].handle)) {
        this.lastSelection = newSelection;
        this._onDidChangeSelectionAndFocus.fire({ selection: this.lastSelection, focus: this.lastActive });
      }
      this.refreshing = false;
      this._onDidCompleteRefresh.fire();
      this.updateContentAreas();
      if (this.focused) {
        this.focus(false);
      }
      this.updateCollapseAllToggle();
    }
  }
  initializeCollapseAllToggle() {
    if (!this.collapseAllToggleContext) {
      this.collapseAllToggleContextKey = new RawContextKey(`treeView.${this.id}.toggleCollapseAll`, false, localize("treeView.toggleCollapseAll", "Whether collapse all is toggled for the tree view with id {0}.", this.id));
      this.collapseAllToggleContext = this.collapseAllToggleContextKey.bindTo(this.contextKeyService);
    }
  }
  updateCollapseAllToggle() {
    if (this.showCollapseAllAction) {
      this.initializeCollapseAllToggle();
      this.collapseAllToggleContext?.set(!!this.root.children && this.root.children.length > 0 && this.root.children.some((value) => value.collapsibleState !== TreeItemCollapsibleState.None));
    }
  }
  updateContentAreas() {
    const isTreeEmpty = !this.root.children || this.root.children.length === 0;
    if (this._messageValue && isTreeEmpty && !this.refreshing && this.treeContainer) {
      if (!this.dragAndDropController) {
        this.treeContainer.classList.add("hide");
      }
      this.domNode.setAttribute("tabindex", "0");
    } else if (this.treeContainer) {
      this.treeContainer.classList.remove("hide");
      if (this.domNode === DOM.getActiveElement()) {
        this.focus();
      }
      this.domNode.removeAttribute("tabindex");
    }
  }
  get container() {
    return this._container;
  }
};
AbstractTreeView = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IViewDescriptorService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IActivityService),
  __decorateParam(14, ILogService),
  __decorateParam(15, IOpenerService)
], AbstractTreeView);
class TreeViewIdentityProvider {
  static {
    __name(this, "TreeViewIdentityProvider");
  }
  getId(element) {
    return element.handle;
  }
}
class TreeViewDelegate {
  static {
    __name(this, "TreeViewDelegate");
  }
  getHeight(element) {
    return TreeRenderer.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return TreeRenderer.TREE_TEMPLATE_ID;
  }
}
class TreeDataSource {
  constructor(treeView, withProgress) {
    this.treeView = treeView;
    this.withProgress = withProgress;
  }
  static {
    __name(this, "TreeDataSource");
  }
  hasChildren(element) {
    return !!this.treeView.dataProvider && element.collapsibleState !== TreeItemCollapsibleState.None;
  }
  async getChildren(element) {
    let result = [];
    if (this.treeView.dataProvider) {
      try {
        result = await this.withProgress(this.treeView.dataProvider.getChildren(element)) ?? [];
      } catch (e) {
        if (!e.message.startsWith("Bad progress location:")) {
          throw e;
        }
      }
    }
    return result;
  }
}
let TreeRenderer = class extends Disposable {
  // tree item handle to template data
  constructor(treeViewId, menus, labels, actionViewItemProvider, aligner, checkboxStateHandler, manuallyManageCheckboxes, themeService, configurationService, labelService, contextKeyService, hoverService, instantiationService) {
    super();
    this.treeViewId = treeViewId;
    this.menus = menus;
    this.labels = labels;
    this.actionViewItemProvider = actionViewItemProvider;
    this.aligner = aligner;
    this.checkboxStateHandler = checkboxStateHandler;
    this.manuallyManageCheckboxes = manuallyManageCheckboxes;
    this.themeService = themeService;
    this.configurationService = configurationService;
    this.labelService = labelService;
    this.contextKeyService = contextKeyService;
    this.hoverService = hoverService;
    this._hoverDelegate = this._register(instantiationService.createInstance(WorkbenchHoverDelegate, "mouse", false, {}));
    this._register(this.themeService.onDidFileIconThemeChange(() => this.rerender()));
    this._register(this.themeService.onDidColorThemeChange(() => this.rerender()));
    this._register(checkboxStateHandler.onDidChangeCheckboxState((items) => {
      this.updateCheckboxes(items);
    }));
    this._register(this.contextKeyService.onDidChangeContext((e) => this.onDidChangeContext(e)));
  }
  static {
    __name(this, "TreeRenderer");
  }
  static ITEM_HEIGHT = 22;
  static TREE_TEMPLATE_ID = "treeExplorer";
  _onDidChangeCheckboxState = this._register(new Emitter());
  onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
  _onDidChangeMenuContext = this._register(new Emitter());
  onDidChangeMenuContext = this._onDidChangeMenuContext.event;
  _actionRunner;
  _hoverDelegate;
  _hasCheckbox = false;
  _renderedElements = /* @__PURE__ */ new Map();
  get templateId() {
    return TreeRenderer.TREE_TEMPLATE_ID;
  }
  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
  }
  renderTemplate(container) {
    container.classList.add("custom-view-tree-node-item");
    const checkboxContainer = DOM.append(container, DOM.$(""));
    const resourceLabel = this.labels.create(container, { supportHighlights: true, hoverDelegate: this._hoverDelegate });
    const icon = DOM.prepend(resourceLabel.element, DOM.$(".custom-view-tree-node-item-icon"));
    const actionsContainer = DOM.append(resourceLabel.element, DOM.$(".actions"));
    const actionBar = new ActionBar(actionsContainer, {
      actionViewItemProvider: this.actionViewItemProvider
    });
    return { resourceLabel, icon, checkboxContainer, actionBar, container };
  }
  getHover(label, resource, node) {
    if (!(node instanceof ResolvableTreeItem) || !node.hasResolve) {
      if (resource && !node.tooltip) {
        return void 0;
      } else if (node.tooltip === void 0) {
        return label;
      } else if (!isString(node.tooltip)) {
        return { markdown: node.tooltip, markdownNotSupportedFallback: resource ? void 0 : renderMarkdownAsPlaintext(node.tooltip) };
      } else if (node.tooltip !== "") {
        return node.tooltip;
      } else {
        return void 0;
      }
    }
    return {
      markdown: typeof node.tooltip === "string" ? node.tooltip : (token) => {
        return new Promise((resolve) => {
          node.resolve(token).then(() => resolve(node.tooltip));
        });
      },
      markdownNotSupportedFallback: resource ? void 0 : label ?? ""
      // Passing undefined as the fallback for a resource falls back to the old native hover
    };
  }
  renderElement(element, index, templateData) {
    const node = element.element;
    const resource = node.resourceUri ? URI.revive(node.resourceUri) : null;
    const treeItemLabel = node.label ? node.label : resource ? { label: basename(resource) } : void 0;
    const description = isString(node.description) ? node.description : resource && node.description === true ? this.labelService.getUriLabel(dirname(resource), { relative: true }) : void 0;
    const label = treeItemLabel ? treeItemLabel.label : void 0;
    const matches = treeItemLabel && treeItemLabel.highlights && label ? treeItemLabel.highlights.map(([start, end]) => {
      if (start < 0) {
        start = label.length + start;
      }
      if (end < 0) {
        end = label.length + end;
      }
      if (start >= label.length || end > label.length) {
        return { start: 0, end: 0 };
      }
      if (start > end) {
        const swap = start;
        start = end;
        end = swap;
      }
      return { start, end };
    }) : void 0;
    const icon = this.themeService.getColorTheme().type === ColorScheme.LIGHT ? node.icon : node.iconDark;
    const iconUrl = icon ? URI.revive(icon) : void 0;
    const title = this.getHover(label, resource, node);
    templateData.actionBar.clear();
    templateData.icon.style.color = "";
    let commandEnabled = true;
    if (node.command) {
      commandEnabled = isTreeCommandEnabled(node.command, this.contextKeyService);
    }
    this.renderCheckbox(node, templateData);
    if (resource) {
      const fileDecorations = this.configurationService.getValue("explorer.decorations");
      const labelResource = resource ? resource : URI.parse("missing:_icon_resource");
      templateData.resourceLabel.setResource({ name: label, description, resource: labelResource }, {
        fileKind: this.getFileKind(node),
        title,
        hideIcon: this.shouldHideResourceLabelIcon(iconUrl, node.themeIcon),
        fileDecorations,
        extraClasses: ["custom-view-tree-node-item-resourceLabel"],
        matches: matches ? matches : createMatches(element.filterData),
        strikethrough: treeItemLabel?.strikethrough,
        disabledCommand: !commandEnabled,
        labelEscapeNewLines: true,
        forceLabel: !!node.label
      });
    } else {
      templateData.resourceLabel.setResource({ name: label, description }, {
        title,
        hideIcon: true,
        extraClasses: ["custom-view-tree-node-item-resourceLabel"],
        matches: matches ? matches : createMatches(element.filterData),
        strikethrough: treeItemLabel?.strikethrough,
        disabledCommand: !commandEnabled,
        labelEscapeNewLines: true
      });
    }
    if (iconUrl) {
      templateData.icon.className = "custom-view-tree-node-item-icon";
      templateData.icon.style.backgroundImage = DOM.asCSSUrl(iconUrl);
    } else {
      let iconClass;
      if (this.shouldShowThemeIcon(!!resource, node.themeIcon)) {
        iconClass = ThemeIcon.asClassName(node.themeIcon);
        if (node.themeIcon.color) {
          templateData.icon.style.color = this.themeService.getColorTheme().getColor(node.themeIcon.color.id)?.toString() ?? "";
        }
      }
      templateData.icon.className = iconClass ? `custom-view-tree-node-item-icon ${iconClass}` : "";
      templateData.icon.style.backgroundImage = "";
    }
    if (!commandEnabled) {
      templateData.icon.className = templateData.icon.className + " disabled";
      if (templateData.container.parentElement) {
        templateData.container.parentElement.className = templateData.container.parentElement.className + " disabled";
      }
    }
    templateData.actionBar.context = { $treeViewId: this.treeViewId, $treeItemHandle: node.handle };
    const menuActions = this.menus.getResourceActions([node]);
    templateData.actionBar.push(menuActions, { icon: true, label: false });
    if (this._actionRunner) {
      templateData.actionBar.actionRunner = this._actionRunner;
    }
    this.setAlignment(templateData.container, node);
    const renderedItems = this._renderedElements.get(element.element.handle) ?? [];
    this._renderedElements.set(element.element.handle, [...renderedItems, { original: element, rendered: templateData }]);
  }
  rerender() {
    const keys = new Set(this._renderedElements.keys());
    for (const key of keys) {
      const values = this._renderedElements.get(key) ?? [];
      for (const value of values) {
        this.disposeElement(value.original, 0, value.rendered);
        this.renderElement(value.original, 0, value.rendered);
      }
    }
  }
  renderCheckbox(node, templateData) {
    if (node.checkbox) {
      if (!this._hasCheckbox) {
        this._hasCheckbox = true;
        this.rerender();
      }
      if (!templateData.checkbox) {
        const checkbox = new TreeItemCheckbox(templateData.checkboxContainer, this.checkboxStateHandler, this._hoverDelegate, this.hoverService);
        templateData.checkbox = checkbox;
      }
      templateData.checkbox.render(node);
    } else if (templateData.checkbox) {
      templateData.checkbox.dispose();
      templateData.checkbox = void 0;
    }
  }
  setAlignment(container, treeItem) {
    container.parentElement.classList.toggle("align-icon-with-twisty", !this._hasCheckbox && this.aligner.alignIconWithTwisty(treeItem));
  }
  shouldHideResourceLabelIcon(iconUrl, icon) {
    return !!iconUrl || !!icon && !this.isFileKindThemeIcon(icon);
  }
  shouldShowThemeIcon(hasResource, icon) {
    if (!icon) {
      return false;
    }
    return !(hasResource && this.isFileKindThemeIcon(icon));
  }
  isFolderThemeIcon(icon) {
    return icon?.id === FolderThemeIcon.id;
  }
  isFileKindThemeIcon(icon) {
    if (icon) {
      return icon.id === FileThemeIcon.id || this.isFolderThemeIcon(icon);
    } else {
      return false;
    }
  }
  getFileKind(node) {
    if (node.themeIcon) {
      switch (node.themeIcon.id) {
        case FileThemeIcon.id:
          return FileKind.FILE;
        case FolderThemeIcon.id:
          return FileKind.FOLDER;
      }
    }
    return node.collapsibleState === TreeItemCollapsibleState.Collapsed || node.collapsibleState === TreeItemCollapsibleState.Expanded ? FileKind.FOLDER : FileKind.FILE;
  }
  onDidChangeContext(e) {
    const items = [];
    for (const [_, elements] of this._renderedElements) {
      for (const element of elements) {
        if (e.affectsSome(this.menus.getElementOverlayContexts(element.original.element)) || e.affectsSome(this.menus.getEntireMenuContexts())) {
          items.push(element.original.element);
        }
      }
    }
    if (items.length) {
      this._onDidChangeMenuContext.fire(items);
    }
  }
  updateCheckboxes(items) {
    const additionalItems = [];
    if (!this.manuallyManageCheckboxes()) {
      for (const item of items) {
        if (item.checkbox !== void 0) {
          let checkChildren2 = function(currentItem) {
            for (const child of currentItem.children ?? []) {
              if (child.checkbox !== void 0 && currentItem.checkbox !== void 0 && child.checkbox.isChecked !== currentItem.checkbox.isChecked) {
                child.checkbox.isChecked = currentItem.checkbox.isChecked;
                additionalItems.push(child);
                checkChildren2(child);
              }
            }
          }, checkParents2 = function(currentItem) {
            if (currentItem.parent && currentItem.parent.checkbox !== void 0 && currentItem.parent.children) {
              if (visitedParents.has(currentItem.parent)) {
                return;
              } else {
                visitedParents.add(currentItem.parent);
              }
              let someUnchecked = false;
              let someChecked = false;
              for (const child of currentItem.parent.children) {
                if (someUnchecked && someChecked) {
                  break;
                }
                if (child.checkbox !== void 0) {
                  if (child.checkbox.isChecked) {
                    someChecked = true;
                  } else {
                    someUnchecked = true;
                  }
                }
              }
              if (someChecked && !someUnchecked && currentItem.parent.checkbox.isChecked !== true) {
                currentItem.parent.checkbox.isChecked = true;
                additionalItems.push(currentItem.parent);
                checkParents2(currentItem.parent);
              } else if (someUnchecked && currentItem.parent.checkbox.isChecked !== false) {
                currentItem.parent.checkbox.isChecked = false;
                additionalItems.push(currentItem.parent);
                checkParents2(currentItem.parent);
              }
            }
          };
          var checkChildren = checkChildren2, checkParents = checkParents2;
          __name(checkChildren2, "checkChildren");
          __name(checkParents2, "checkParents");
          checkChildren2(item);
          const visitedParents = /* @__PURE__ */ new Set();
          checkParents2(item);
        }
      }
    }
    items = items.concat(additionalItems);
    items.forEach((item) => {
      const renderedItems = this._renderedElements.get(item.handle);
      if (renderedItems) {
        renderedItems.forEach((renderedItems2) => renderedItems2.rendered.checkbox?.render(item));
      }
    });
    this._onDidChangeCheckboxState.fire(items);
  }
  disposeElement(resource, index, templateData) {
    const itemRenders = this._renderedElements.get(resource.element.handle) ?? [];
    const renderedIndex = itemRenders.findIndex((renderedItem) => templateData === renderedItem.rendered);
    if (itemRenders.length === 1) {
      this._renderedElements.delete(resource.element.handle);
    } else if (itemRenders.length > 0) {
      itemRenders.splice(renderedIndex, 1);
    }
    templateData.checkbox?.dispose();
    templateData.checkbox = void 0;
  }
  disposeTemplate(templateData) {
    templateData.resourceLabel.dispose();
    templateData.actionBar.dispose();
  }
};
TreeRenderer = __decorateClass([
  __decorateParam(7, IThemeService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IInstantiationService)
], TreeRenderer);
class Aligner extends Disposable {
  constructor(themeService) {
    super();
    this.themeService = themeService;
  }
  static {
    __name(this, "Aligner");
  }
  _tree;
  set tree(tree) {
    this._tree = tree;
  }
  alignIconWithTwisty(treeItem) {
    if (treeItem.collapsibleState !== TreeItemCollapsibleState.None) {
      return false;
    }
    if (!this.hasIcon(treeItem)) {
      return false;
    }
    if (this._tree) {
      const parent = this._tree.getParentElement(treeItem) || this._tree.getInput();
      if (this.hasIcon(parent)) {
        return !!parent.children && parent.children.some((c) => c.collapsibleState !== TreeItemCollapsibleState.None && !this.hasIcon(c));
      }
      return !!parent.children && parent.children.every((c) => c.collapsibleState === TreeItemCollapsibleState.None || !this.hasIcon(c));
    } else {
      return false;
    }
  }
  hasIcon(node) {
    const icon = this.themeService.getColorTheme().type === ColorScheme.LIGHT ? node.icon : node.iconDark;
    if (icon) {
      return true;
    }
    if (node.resourceUri || node.themeIcon) {
      const fileIconTheme = this.themeService.getFileIconTheme();
      const isFolder = node.themeIcon ? node.themeIcon.id === FolderThemeIcon.id : node.collapsibleState !== TreeItemCollapsibleState.None;
      if (isFolder) {
        return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
      }
      return fileIconTheme.hasFileIcons;
    }
    return false;
  }
}
class MultipleSelectionActionRunner extends ActionRunner {
  constructor(notificationService, getSelectedResources) {
    super();
    this.getSelectedResources = getSelectedResources;
    this._register(this.onDidRun((e) => {
      if (e.error && !isCancellationError(e.error)) {
        notificationService.error(localize("command-error", "Error running command {1}: {0}. This is likely caused by the extension that contributes {1}.", e.error.message, e.action.id));
      }
    }));
  }
  static {
    __name(this, "MultipleSelectionActionRunner");
  }
  async runAction(action, context) {
    const selection = this.getSelectedResources();
    let selectionHandleArgs = void 0;
    let actionInSelected = false;
    if (selection.length > 1) {
      selectionHandleArgs = selection.map((selected) => {
        if (selected.handle === context.$treeItemHandle || context.$selectedTreeItems) {
          actionInSelected = true;
        }
        return { $treeViewId: context.$treeViewId, $treeItemHandle: selected.handle };
      });
    }
    if (!actionInSelected && selectionHandleArgs) {
      selectionHandleArgs = void 0;
    }
    await action.run(context, selectionHandleArgs);
  }
}
let TreeMenus = class {
  constructor(id, menuService) {
    this.id = id;
    this.menuService = menuService;
  }
  static {
    __name(this, "TreeMenus");
  }
  contextKeyService;
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  /**
   * Gets only the actions that apply to all of the given elements.
   */
  getResourceActions(elements) {
    const actions = this.getActions(this.getMenuId(), elements);
    return actions.primary;
  }
  /**
   * Gets only the actions that apply to all of the given elements.
   */
  getResourceContextActions(elements) {
    return this.getActions(this.getMenuId(), elements).secondary;
  }
  setContextKeyService(service) {
    this.contextKeyService = service;
  }
  filterNonUniversalActions(groups, newActions) {
    const newActionsSet = new Set(newActions.map((a) => a.id));
    for (const group of groups) {
      const actions = group.keys();
      for (const action of actions) {
        if (!newActionsSet.has(action)) {
          group.delete(action);
        }
      }
    }
  }
  buildMenu(groups) {
    const result = [];
    for (const group of groups) {
      if (group.size > 0) {
        if (result.length) {
          result.push(new Separator());
        }
        result.push(...group.values());
      }
    }
    return result;
  }
  createGroups(actions) {
    const groups = [];
    let group = /* @__PURE__ */ new Map();
    for (const action of actions) {
      if (action instanceof Separator) {
        groups.push(group);
        group = /* @__PURE__ */ new Map();
      } else {
        group.set(action.id, action);
      }
    }
    groups.push(group);
    return groups;
  }
  getElementOverlayContexts(element) {
    return /* @__PURE__ */ new Map([
      ["view", this.id],
      ["viewItem", element.contextValue]
    ]);
  }
  getEntireMenuContexts() {
    return this.menuService.getMenuContexts(this.getMenuId());
  }
  getMenuId() {
    return MenuId.ViewItemContext;
  }
  getActions(menuId, elements) {
    if (!this.contextKeyService) {
      return { primary: [], secondary: [] };
    }
    let primaryGroups = [];
    let secondaryGroups = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const contextKeyService = this.contextKeyService.createOverlay(this.getElementOverlayContexts(element));
      const menuData = this.menuService.getMenuActions(menuId, contextKeyService, { shouldForwardArgs: true });
      const primary = [];
      const secondary = [];
      const result = { primary, secondary };
      createAndFillInContextMenuActions(menuData, result, "inline");
      if (i === 0) {
        primaryGroups = this.createGroups(result.primary);
        secondaryGroups = this.createGroups(result.secondary);
      } else {
        this.filterNonUniversalActions(primaryGroups, result.primary);
        this.filterNonUniversalActions(secondaryGroups, result.secondary);
      }
    }
    return { primary: this.buildMenu(primaryGroups), secondary: this.buildMenu(secondaryGroups) };
  }
  dispose() {
    this.contextKeyService = void 0;
  }
};
TreeMenus = __decorateClass([
  __decorateParam(1, IMenuService)
], TreeMenus);
let CustomTreeView = class extends AbstractTreeView {
  constructor(id, title, extensionId, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, contextKeyService, hoverService, extensionService, activityService, telemetryService, logService, openerService) {
    super(id, title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService, openerService);
    this.extensionId = extensionId;
    this.extensionService = extensionService;
    this.telemetryService = telemetryService;
  }
  static {
    __name(this, "CustomTreeView");
  }
  activate() {
    if (!this.activated) {
      this.telemetryService.publicLog2("Extension:ViewActivate", {
        extensionId: new TelemetryTrustedValue(this.extensionId),
        id: this.id
      });
      this.createTree();
      this.progressService.withProgress({ location: this.id }, () => this.extensionService.activateByEvent(`onView:${this.id}`)).then(() => timeout(2e3)).then(() => {
        this.updateMessage();
      });
      this.activated = true;
    }
  }
};
CustomTreeView = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IProgressService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IViewDescriptorService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IHoverService),
  __decorateParam(14, IExtensionService),
  __decorateParam(15, IActivityService),
  __decorateParam(16, ITelemetryService),
  __decorateParam(17, ILogService),
  __decorateParam(18, IOpenerService)
], CustomTreeView);
class TreeView extends AbstractTreeView {
  static {
    __name(this, "TreeView");
  }
  activate() {
    if (!this.activated) {
      this.createTree();
      this.activated = true;
    }
  }
}
let CustomTreeViewDragAndDrop = class {
  constructor(treeId, labelService, instantiationService, treeViewsDragAndDropService, logService) {
    this.treeId = treeId;
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.treeViewsDragAndDropService = treeViewsDragAndDropService;
    this.logService = logService;
    this.treeMimeType = `application/vnd.code.tree.${treeId.toLowerCase()}`;
  }
  static {
    __name(this, "CustomTreeViewDragAndDrop");
  }
  treeMimeType;
  treeItemsTransfer = LocalSelectionTransfer.getInstance();
  dragCancellationToken;
  dndController;
  set controller(controller) {
    this.dndController = controller;
  }
  handleDragAndLog(dndController, itemHandles, uuid, dragCancellationToken) {
    return dndController.handleDrag(itemHandles, uuid, dragCancellationToken).then((additionalDataTransfer) => {
      if (additionalDataTransfer) {
        const unlistedTypes = [];
        for (const item of additionalDataTransfer) {
          if (item[0] !== this.treeMimeType && dndController.dragMimeTypes.findIndex((value) => value === item[0]) < 0) {
            unlistedTypes.push(item[0]);
          }
        }
        if (unlistedTypes.length) {
          this.logService.warn(`Drag and drop controller for tree ${this.treeId} adds the following data transfer types but does not declare them in dragMimeTypes: ${unlistedTypes.join(", ")}`);
        }
      }
      return additionalDataTransfer;
    });
  }
  addExtensionProvidedTransferTypes(originalEvent, itemHandles) {
    if (!originalEvent.dataTransfer || !this.dndController) {
      return;
    }
    const uuid = generateUuid();
    this.dragCancellationToken = new CancellationTokenSource();
    this.treeViewsDragAndDropService.addDragOperationTransfer(uuid, this.handleDragAndLog(this.dndController, itemHandles, uuid, this.dragCancellationToken.token));
    this.treeItemsTransfer.setData([new DraggedTreeItemsIdentifier(uuid)], DraggedTreeItemsIdentifier.prototype);
    originalEvent.dataTransfer.clearData(Mimes.text);
    if (this.dndController.dragMimeTypes.find((element) => element === Mimes.uriList)) {
      originalEvent.dataTransfer?.setData(DataTransfers.RESOURCES, "");
    }
    this.dndController.dragMimeTypes.forEach((supportedType) => {
      originalEvent.dataTransfer?.setData(supportedType, "");
    });
  }
  addResourceInfoToTransfer(originalEvent, resources) {
    if (resources.length && originalEvent.dataTransfer) {
      this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, resources, originalEvent));
      const fileResources = resources.filter((s) => s.scheme === Schemas.file).map((r) => r.fsPath);
      if (fileResources.length) {
        originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
      }
    }
  }
  onDragStart(data, originalEvent) {
    if (originalEvent.dataTransfer) {
      const treeItemsData = data.getData();
      const resources = [];
      const sourceInfo = {
        id: this.treeId,
        itemHandles: []
      };
      treeItemsData.forEach((item) => {
        sourceInfo.itemHandles.push(item.handle);
        if (item.resourceUri) {
          resources.push(URI.revive(item.resourceUri));
        }
      });
      this.addResourceInfoToTransfer(originalEvent, resources);
      this.addExtensionProvidedTransferTypes(originalEvent, sourceInfo.itemHandles);
      originalEvent.dataTransfer.setData(
        this.treeMimeType,
        JSON.stringify(sourceInfo)
      );
    }
  }
  debugLog(types) {
    if (types.size) {
      this.logService.debug(`TreeView dragged mime types: ${Array.from(types).join(", ")}`);
    } else {
      this.logService.debug(`TreeView dragged with no supported mime types.`);
    }
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    const dataTransfer = toExternalVSDataTransfer(originalEvent.dataTransfer);
    const types = new Set(Array.from(dataTransfer, (x) => x[0]));
    if (originalEvent.dataTransfer) {
      for (const item of originalEvent.dataTransfer.items) {
        if (item.kind === "file" || item.type === DataTransfers.RESOURCES.toLowerCase()) {
          types.add(Mimes.uriList);
          break;
        }
      }
    }
    this.debugLog(types);
    const dndController = this.dndController;
    if (!dndController || !originalEvent.dataTransfer || dndController.dropMimeTypes.length === 0) {
      return false;
    }
    const dragContainersSupportedType = Array.from(types).some((value, index) => {
      if (value === this.treeMimeType) {
        return true;
      } else {
        return dndController.dropMimeTypes.indexOf(value) >= 0;
      }
    });
    if (dragContainersSupportedType) {
      return { accept: true, bubble: TreeDragOverBubble.Down, autoExpand: true };
    }
    return false;
  }
  getDragURI(element) {
    if (!this.dndController) {
      return null;
    }
    return element.resourceUri ? URI.revive(element.resourceUri).toString() : element.handle;
  }
  getDragLabel(elements) {
    if (!this.dndController) {
      return void 0;
    }
    if (elements.length > 1) {
      return String(elements.length);
    }
    const element = elements[0];
    return element.label ? element.label.label : element.resourceUri ? this.labelService.getUriLabel(URI.revive(element.resourceUri)) : void 0;
  }
  async drop(data, targetNode, targetIndex, targetSector, originalEvent) {
    const dndController = this.dndController;
    if (!originalEvent.dataTransfer || !dndController) {
      return;
    }
    let treeSourceInfo;
    let willDropUuid;
    if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
      willDropUuid = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype)[0].identifier;
    }
    const originalDataTransfer = toExternalVSDataTransfer(originalEvent.dataTransfer, true);
    const outDataTransfer = new VSDataTransfer();
    for (const [type, item] of originalDataTransfer) {
      if (type === this.treeMimeType || dndController.dropMimeTypes.includes(type) || item.asFile() && dndController.dropMimeTypes.includes(DataTransfers.FILES.toLowerCase())) {
        outDataTransfer.append(type, item);
        if (type === this.treeMimeType) {
          try {
            treeSourceInfo = JSON.parse(await item.asString());
          } catch {
          }
        }
      }
    }
    const additionalDataTransfer = await this.treeViewsDragAndDropService.removeDragOperationTransfer(willDropUuid);
    if (additionalDataTransfer) {
      for (const [type, item] of additionalDataTransfer) {
        outDataTransfer.append(type, item);
      }
    }
    return dndController.handleDrop(outDataTransfer, targetNode, CancellationToken.None, willDropUuid, treeSourceInfo?.id, treeSourceInfo?.itemHandles);
  }
  onDragEnd(originalEvent) {
    if (originalEvent.dataTransfer?.dropEffect === "none") {
      this.dragCancellationToken?.cancel();
    }
  }
  dispose() {
  }
};
CustomTreeViewDragAndDrop = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITreeViewsDnDService),
  __decorateParam(4, ILogService)
], CustomTreeViewDragAndDrop);
export {
  CustomTreeView,
  CustomTreeViewDragAndDrop,
  RawCustomTreeViewContextKey,
  TreeView,
  TreeViewPane
};
//# sourceMappingURL=treeView.js.map
