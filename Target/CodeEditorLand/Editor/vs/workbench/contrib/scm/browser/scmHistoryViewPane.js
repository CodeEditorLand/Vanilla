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
import "./media/scm.css";
import * as platform from "../../../../base/common/platform.js";
import { $, append, h, reset } from "../../../../base/browser/dom.js";
import { IHoverOptions, IManagedHoverTooltipMarkdownString } from "../../../../base/browser/ui/hover/hover.js";
import { IHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegate.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { LabelFuzzyScore } from "../../../../base/browser/ui/tree/abstractTree.js";
import { IAsyncDataSource, ITreeContextMenuEvent, ITreeNode, ITreeRenderer } from "../../../../base/browser/ui/tree/tree.js";
import { fromNow } from "../../../../base/common/date.js";
import { createMatches, FuzzyScore, IMatch } from "../../../../base/common/filters.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable, DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { autorun, autorunWithStore, autorunWithStoreHandleChanges, derived, IObservable, observableValue, waitForState, constObservable, latestChangedValue, observableFromEvent, runOnChange, signalFromObservable } from "../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService, WorkbenchHoverDelegate } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenEvent, WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { asCssVariable, ColorIdentifier, foreground } from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IViewPaneOptions, ViewAction, ViewPane, ViewPaneShowActions } from "../../../browser/parts/views/viewPane.js";
import { IViewDescriptorService, ViewContainerLocation } from "../../../common/views.js";
import { renderSCMHistoryItemGraph, toISCMHistoryItemViewModelArray, SWIMLANE_WIDTH, renderSCMHistoryGraphPlaceholder, historyItemHoverDeletionsForeground, historyItemHoverLabelForeground, historyItemHoverAdditionsForeground, historyItemHoverDefaultLabelForeground, historyItemHoverDefaultLabelBackground } from "./scmHistory.js";
import { isSCMHistoryItemLoadMoreTreeElement, isSCMHistoryItemViewModelTreeElement, isSCMRepository } from "./util.js";
import { ISCMHistoryItem, ISCMHistoryItemRef, ISCMHistoryItemViewModel, ISCMHistoryProvider, SCMHistoryItemLoadMoreTreeElement, SCMHistoryItemViewModelTreeElement } from "../common/history.js";
import { HISTORY_VIEW_PANE_ID, ISCMProvider, ISCMRepository, ISCMService, ISCMViewService } from "../common/scm.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { IWorkbenchLayoutService, Position } from "../../../services/layout/browser/layoutService.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Sequencer, Throttler } from "../../../../base/common/async.js";
import { URI } from "../../../../base/common/uri.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ActionRunner, IAction, IActionRunner } from "../../../../base/common/actions.js";
import { delta, groupBy, tail } from "../../../../base/common/arrays.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { ContextKeys } from "./scmViewPane.js";
import { IActionViewItem } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { IDropdownMenuActionViewItemOptions } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { IQuickInputService, IQuickPickItem, IQuickPickSeparator } from "../../../../platform/quickinput/common/quickInput.js";
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { clamp } from "../../../../base/common/numbers.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { compare } from "../../../../base/common/strings.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
const PICK_REPOSITORY_ACTION_ID = "workbench.scm.action.graph.pickRepository";
const PICK_HISTORY_ITEM_REFS_ACTION_ID = "workbench.scm.action.graph.pickHistoryItemRefs";
class SCMRepositoryActionViewItem extends ActionViewItem {
  constructor(_repository, action, options) {
    super(null, action, { ...options, icon: false, label: true });
    this._repository = _repository;
  }
  static {
    __name(this, "SCMRepositoryActionViewItem");
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.classList.add("scm-graph-repository-picker");
      const icon = $(".icon");
      icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.repo));
      const name = $(".name");
      name.textContent = this._repository.provider.name;
      reset(this.label, icon, name);
    }
  }
  getTooltip() {
    return this._repository.provider.name;
  }
}
class SCMHistoryItemRefsActionViewItem extends ActionViewItem {
  constructor(_repository, _historyItemsFilter, action, options) {
    super(null, action, { ...options, icon: false, label: true });
    this._repository = _repository;
    this._historyItemsFilter = _historyItemsFilter;
  }
  static {
    __name(this, "SCMHistoryItemRefsActionViewItem");
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.classList.add("scm-graph-history-item-picker");
      const icon = $(".icon");
      icon.classList.add(...ThemeIcon.asClassNameArray(Codicon.gitBranch));
      const name = $(".name");
      if (this._historyItemsFilter === "all") {
        name.textContent = localize("all", "All");
      } else if (this._historyItemsFilter === "auto") {
        name.textContent = localize("auto", "Auto");
      } else if (this._historyItemsFilter.length === 1) {
        name.textContent = this._historyItemsFilter[0].name;
        reset(this.label, ...renderLabelWithIcons(`$(git-branch) ${this._historyItemsFilter[0].name}`));
      } else {
        name.textContent = localize("items", "{0} Items", this._historyItemsFilter.length);
      }
      reset(this.label, icon, name);
    }
  }
  getTooltip() {
    if (this._historyItemsFilter === "all") {
      return localize("allHistoryItemRefs", "All history item references");
    } else if (this._historyItemsFilter === "auto") {
      const historyProvider = this._repository.provider.historyProvider.get();
      return [
        historyProvider?.historyItemRef.get()?.name,
        historyProvider?.historyItemRemoteRef.get()?.name,
        historyProvider?.historyItemBaseRef.get()?.name
      ].filter((ref) => !!ref).join(", ");
    } else if (this._historyItemsFilter.length === 1) {
      return this._historyItemsFilter[0].name;
    } else {
      return this._historyItemsFilter.map((ref) => ref.name).join(", ");
    }
  }
}
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: PICK_REPOSITORY_ACTION_ID,
      title: "",
      viewId: HISTORY_VIEW_PANE_ID,
      f1: false,
      menu: {
        id: MenuId.SCMHistoryTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.has("scm.providerCount"), ContextKeyExpr.greater("scm.providerCount", 1)),
        group: "navigation",
        order: 0
      }
    });
  }
  async runInView(_, view) {
    view.pickRepository();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: PICK_HISTORY_ITEM_REFS_ACTION_ID,
      title: "",
      icon: Codicon.gitBranch,
      viewId: HISTORY_VIEW_PANE_ID,
      f1: false,
      menu: {
        id: MenuId.SCMHistoryTitle,
        group: "navigation",
        order: 0
      }
    });
  }
  async runInView(_, view) {
    view.pickHistoryItemRef();
  }
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "workbench.scm.action.graph.refresh",
      title: localize("refreshGraph", "Refresh"),
      viewId: HISTORY_VIEW_PANE_ID,
      f1: false,
      icon: Codicon.refresh,
      menu: {
        id: MenuId.SCMHistoryTitle,
        group: "navigation",
        order: 1e3
      }
    });
  }
  async runInView(_, view) {
    view.refresh();
  }
});
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.scm.action.graph.viewChanges",
      title: localize("viewChanges", "View Changes"),
      f1: false,
      menu: [
        {
          id: MenuId.SCMChangesContext,
          group: "0_view",
          when: ContextKeyExpr.equals("config.multiDiffEditor.experimental.enabled", true)
        }
      ]
    });
  }
  async run(accessor, provider, ...historyItems) {
    const commandService = accessor.get(ICommandService);
    if (!provider || historyItems.length === 0) {
      return;
    }
    const historyItem = historyItems[0];
    const historyItemLast = historyItems[historyItems.length - 1];
    const historyProvider = provider.historyProvider.get();
    if (historyItems.length > 1) {
      const ancestor = await historyProvider?.resolveHistoryItemRefsCommonAncestor([historyItem.id, historyItemLast.id]);
      if (!ancestor || ancestor !== historyItem.id && ancestor !== historyItemLast.id) {
        return;
      }
    }
    const historyItemParentId = historyItemLast.parentIds.length > 0 ? historyItemLast.parentIds[0] : void 0;
    const historyItemChanges = await historyProvider?.provideHistoryItemChanges(historyItem.id, historyItemParentId);
    if (!historyItemChanges?.length) {
      return;
    }
    const title = historyItems.length === 1 ? `${historyItems[0].displayId ?? historyItems[0].id} - ${historyItems[0].message}` : localize("historyItemChangesEditorTitle", "All Changes ({0} \u2194 {1})", historyItemLast.displayId ?? historyItemLast.id, historyItem.displayId ?? historyItem.id);
    const rootUri = provider.rootUri;
    const path = rootUri ? rootUri.path : provider.label;
    const multiDiffSourceUri = URI.from({ scheme: "scm-history-item", path: `${path}/${historyItemParentId}..${historyItem.id}` }, true);
    commandService.executeCommand("_workbench.openMultiDiffEditor", { title, multiDiffSourceUri, resources: historyItemChanges });
  }
});
class ListDelegate {
  static {
    __name(this, "ListDelegate");
  }
  getHeight() {
    return 22;
  }
  getTemplateId(element) {
    if (isSCMHistoryItemViewModelTreeElement(element)) {
      return HistoryItemRenderer.TEMPLATE_ID;
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      return HistoryItemLoadMoreRenderer.TEMPLATE_ID;
    } else {
      throw new Error("Unknown element");
    }
  }
}
let HistoryItemRenderer = class {
  constructor(hoverDelegate, _clipboardService, _configurationService, _hoverService, _themeService) {
    this.hoverDelegate = hoverDelegate;
    this._clipboardService = _clipboardService;
    this._configurationService = _configurationService;
    this._hoverService = _hoverService;
    this._themeService = _themeService;
  }
  static {
    __name(this, "HistoryItemRenderer");
  }
  static TEMPLATE_ID = "history-item";
  get templateId() {
    return HistoryItemRenderer.TEMPLATE_ID;
  }
  _badgesConfig = observableConfigValue("scm.graph.badges", "filter", this._configurationService);
  renderTemplate(container) {
    container.parentElement.parentElement.querySelector(".monaco-tl-twistie").classList.add("force-no-twistie");
    const element = append(container, $(".history-item"));
    const graphContainer = append(element, $(".graph-container"));
    const iconLabel = new IconLabel(element, { supportIcons: true, supportHighlights: true, supportDescriptionHighlights: true });
    const labelContainer = append(element, $(".label-container"));
    element.appendChild(labelContainer);
    return { element, graphContainer, label: iconLabel, labelContainer, elementDisposables: new DisposableStore(), disposables: new DisposableStore() };
  }
  renderElement(node, index, templateData, height) {
    const historyItemViewModel = node.element.historyItemViewModel;
    const historyItem = historyItemViewModel.historyItem;
    const historyItemHover = this._hoverService.setupManagedHover(this.hoverDelegate, templateData.element, this._getHoverContent(node.element), {
      actions: this._getHoverActions(historyItem)
    });
    templateData.elementDisposables.add(historyItemHover);
    templateData.graphContainer.textContent = "";
    templateData.graphContainer.appendChild(renderSCMHistoryItemGraph(historyItemViewModel));
    const provider = node.element.repository.provider;
    const historyItemRef = provider.historyProvider.get()?.historyItemRef?.get();
    const extraClasses = historyItemRef?.revision === historyItem.id ? ["history-item-current"] : [];
    const [matches, descriptionMatches] = this._processMatches(historyItemViewModel, node.filterData);
    templateData.label.setLabel(historyItem.subject, historyItem.author, { matches, descriptionMatches, extraClasses });
    this._renderBadges(historyItem, templateData);
  }
  _renderBadges(historyItem, templateData) {
    templateData.elementDisposables.add(autorun((reader) => {
      const labelConfig = this._badgesConfig.read(reader);
      templateData.labelContainer.textContent = "";
      const firstColoredRef = historyItem.references?.find((ref) => ref.color);
      for (const ref of historyItem.references ?? []) {
        if (!ref.color && labelConfig === "filter") {
          continue;
        }
        if (ref.icon && ThemeIcon.isThemeIcon(ref.icon)) {
          const elements = h("div.label", {
            style: {
              color: ref.color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(foreground),
              backgroundColor: ref.color ? asCssVariable(ref.color) : asCssVariable(historyItemHoverDefaultLabelBackground)
            }
          }, [
            h("div.icon@icon"),
            h("div.description@description")
          ]);
          elements.icon.classList.add(...ThemeIcon.asClassNameArray(ref.icon));
          elements.description.textContent = ref.name;
          elements.description.style.display = ref === firstColoredRef ? "" : "none";
          append(templateData.labelContainer, elements.root);
        }
      }
    }));
  }
  _getHoverActions(historyItem) {
    return [
      {
        commandId: "workbench.scm.action.graph.copyHistoryItemId",
        iconClass: "codicon.codicon-copy",
        label: historyItem.displayId ?? historyItem.id,
        run: /* @__PURE__ */ __name(() => this._clipboardService.writeText(historyItem.id), "run")
      },
      {
        commandId: "workbench.scm.action.graph.copyHistoryItemMessage",
        iconClass: "codicon.codicon-copy",
        label: localize("historyItemMessage", "Message"),
        run: /* @__PURE__ */ __name(() => this._clipboardService.writeText(historyItem.message), "run")
      }
    ];
  }
  _getHoverContent(element) {
    const colorTheme = this._themeService.getColorTheme();
    const historyItem = element.historyItemViewModel.historyItem;
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    if (historyItem.author) {
      markdown.appendMarkdown(`$(account) **${historyItem.author}**`);
      if (historyItem.timestamp) {
        const dateFormatter = new Intl.DateTimeFormat(platform.language, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" });
        markdown.appendMarkdown(`, $(history) ${fromNow(historyItem.timestamp, true, true)} (${dateFormatter.format(historyItem.timestamp)})`);
      }
      markdown.appendMarkdown("\n\n");
    }
    markdown.appendMarkdown(`${historyItem.message}

`);
    if (historyItem.statistics) {
      markdown.appendMarkdown(`---

`);
      markdown.appendMarkdown(`<span>${historyItem.statistics.files === 1 ? localize("fileChanged", "{0} file changed", historyItem.statistics.files) : localize("filesChanged", "{0} files changed", historyItem.statistics.files)}</span>`);
      if (historyItem.statistics.insertions) {
        const additionsForegroundColor = colorTheme.getColor(historyItemHoverAdditionsForeground);
        markdown.appendMarkdown(`,&nbsp;<span style="color:${additionsForegroundColor};">${historyItem.statistics.insertions === 1 ? localize("insertion", "{0} insertion{1}", historyItem.statistics.insertions, "(+)") : localize("insertions", "{0} insertions{1}", historyItem.statistics.insertions, "(+)")}</span>`);
      }
      if (historyItem.statistics.deletions) {
        const deletionsForegroundColor = colorTheme.getColor(historyItemHoverDeletionsForeground);
        markdown.appendMarkdown(`,&nbsp;<span style="color:${deletionsForegroundColor};">${historyItem.statistics.deletions === 1 ? localize("deletion", "{0} deletion{1}", historyItem.statistics.deletions, "(-)") : localize("deletions", "{0} deletions{1}", historyItem.statistics.deletions, "(-)")}</span>`);
      }
    }
    if ((historyItem.references ?? []).length > 0) {
      markdown.appendMarkdown(`

---

`);
      markdown.appendMarkdown((historyItem.references ?? []).map((ref) => {
        const labelIconId = ThemeIcon.isThemeIcon(ref.icon) ? ref.icon.id : "";
        const labelBackgroundColor = ref.color ? asCssVariable(ref.color) : asCssVariable(historyItemHoverDefaultLabelBackground);
        const labelForegroundColor = ref.color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(historyItemHoverDefaultLabelForeground);
        return `<span style="color:${labelForegroundColor};background-color:${labelBackgroundColor};border-radius:2px;">&nbsp;$(${labelIconId})&nbsp;${ref.name}&nbsp;</span>`;
      }).join("&nbsp;&nbsp;"));
    }
    return { markdown, markdownNotSupportedFallback: historyItem.message };
  }
  _processMatches(historyItemViewModel, filterData) {
    if (!filterData) {
      return [void 0, void 0];
    }
    return [
      historyItemViewModel.historyItem.message === filterData.label ? createMatches(filterData.score) : void 0,
      historyItemViewModel.historyItem.author === filterData.label ? createMatches(filterData.score) : void 0
    ];
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
HistoryItemRenderer = __decorateClass([
  __decorateParam(1, IClipboardService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IThemeService)
], HistoryItemRenderer);
let HistoryItemLoadMoreRenderer = class {
  constructor(_loadingMore, _loadMoreCallback, _configurationService) {
    this._loadingMore = _loadingMore;
    this._loadMoreCallback = _loadMoreCallback;
    this._configurationService = _configurationService;
  }
  static {
    __name(this, "HistoryItemLoadMoreRenderer");
  }
  static TEMPLATE_ID = "historyItemLoadMore";
  get templateId() {
    return HistoryItemLoadMoreRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    container.parentElement.parentElement.querySelector(".monaco-tl-twistie").classList.add("force-no-twistie");
    const element = append(container, $(".history-item-load-more"));
    const graphPlaceholder = append(element, $(".graph-placeholder"));
    const historyItemPlaceholderContainer = append(element, $(".history-item-placeholder"));
    const historyItemPlaceholderLabel = new IconLabel(historyItemPlaceholderContainer, { supportIcons: true });
    return { element, graphPlaceholder, historyItemPlaceholderContainer, historyItemPlaceholderLabel, elementDisposables: new DisposableStore(), disposables: new DisposableStore() };
  }
  renderElement(element, index, templateData, height) {
    templateData.graphPlaceholder.textContent = "";
    templateData.graphPlaceholder.style.width = `${SWIMLANE_WIDTH * (element.element.graphColumns.length + 1)}px`;
    templateData.graphPlaceholder.appendChild(renderSCMHistoryGraphPlaceholder(element.element.graphColumns));
    const pageOnScroll = this._configurationService.getValue("scm.graph.pageOnScroll") === true;
    templateData.historyItemPlaceholderContainer.classList.toggle("shimmer", pageOnScroll);
    if (pageOnScroll) {
      templateData.historyItemPlaceholderLabel.setLabel("");
      this._loadMoreCallback(element.element.repository);
    } else {
      templateData.elementDisposables.add(autorun((reader) => {
        const loadingMore = this._loadingMore().read(reader);
        const icon = `$(${loadingMore ? "loading~spin" : "fold-down"})`;
        templateData.historyItemPlaceholderLabel.setLabel(localize("loadMore", "{0} Load More...", icon));
      }));
    }
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
HistoryItemLoadMoreRenderer = __decorateClass([
  __decorateParam(2, IConfigurationService)
], HistoryItemLoadMoreRenderer);
let HistoryItemHoverDelegate = class extends WorkbenchHoverDelegate {
  constructor(_viewContainerLocation, layoutService, configurationService, hoverService) {
    super("element", true, () => this.getHoverOptions(), configurationService, hoverService);
    this._viewContainerLocation = _viewContainerLocation;
    this.layoutService = layoutService;
  }
  static {
    __name(this, "HistoryItemHoverDelegate");
  }
  getHoverOptions() {
    const sideBarPosition = this.layoutService.getSideBarPosition();
    let hoverPosition;
    if (this._viewContainerLocation === ViewContainerLocation.Sidebar) {
      hoverPosition = sideBarPosition === Position.LEFT ? HoverPosition.RIGHT : HoverPosition.LEFT;
    } else if (this._viewContainerLocation === ViewContainerLocation.AuxiliaryBar) {
      hoverPosition = sideBarPosition === Position.LEFT ? HoverPosition.LEFT : HoverPosition.RIGHT;
    } else {
      hoverPosition = HoverPosition.RIGHT;
    }
    return { additionalClasses: ["history-item-hover"], position: { hoverPosition, forcePosition: true } };
  }
};
HistoryItemHoverDelegate = __decorateClass([
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IHoverService)
], HistoryItemHoverDelegate);
let SCMHistoryViewPaneActionRunner = class extends ActionRunner {
  constructor(_progressService) {
    super();
    this._progressService = _progressService;
  }
  static {
    __name(this, "SCMHistoryViewPaneActionRunner");
  }
  runAction(action, context) {
    return this._progressService.withProgress(
      { location: HISTORY_VIEW_PANE_ID },
      async () => await super.runAction(action, context)
    );
  }
};
SCMHistoryViewPaneActionRunner = __decorateClass([
  __decorateParam(0, IProgressService)
], SCMHistoryViewPaneActionRunner);
class SCMHistoryTreeAccessibilityProvider {
  static {
    __name(this, "SCMHistoryTreeAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("scm history", "Source Control History");
  }
  getAriaLabel(element) {
    if (isSCMRepository(element)) {
      return `${element.provider.name} ${element.provider.label}`;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      const historyItem = element.historyItemViewModel.historyItem;
      return `${stripIcons(historyItem.message).trim()}${historyItem.author ? `, ${historyItem.author}` : ""}`;
    } else {
      return "";
    }
  }
}
class SCMHistoryTreeIdentityProvider {
  static {
    __name(this, "SCMHistoryTreeIdentityProvider");
  }
  getId(element) {
    if (isSCMRepository(element)) {
      const provider = element.provider;
      return `repo:${provider.id}`;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      const provider = element.repository.provider;
      const historyItem = element.historyItemViewModel.historyItem;
      return `historyItem:${provider.id}/${historyItem.id}/${historyItem.parentIds.join(",")}`;
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      const provider = element.repository.provider;
      return `historyItemLoadMore:${provider.id}}`;
    } else {
      throw new Error("Invalid tree element");
    }
  }
}
class SCMHistoryTreeKeyboardNavigationLabelProvider {
  static {
    __name(this, "SCMHistoryTreeKeyboardNavigationLabelProvider");
  }
  getKeyboardNavigationLabel(element) {
    if (isSCMRepository(element)) {
      return void 0;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      return [element.historyItemViewModel.historyItem.message, element.historyItemViewModel.historyItem.author];
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      return "";
    } else {
      throw new Error("Invalid tree element");
    }
  }
}
class SCMHistoryTreeDataSource extends Disposable {
  static {
    __name(this, "SCMHistoryTreeDataSource");
  }
  async getChildren(inputOrElement) {
    if (!(inputOrElement instanceof SCMHistoryViewModel)) {
      return [];
    }
    const children = [];
    const historyItems = await inputOrElement.getHistoryItems();
    children.push(...historyItems);
    const repository = inputOrElement.repository.get();
    const lastHistoryItem = tail(historyItems);
    if (repository && lastHistoryItem && lastHistoryItem.historyItemViewModel.outputSwimlanes.length > 0) {
      children.push({
        repository,
        graphColumns: lastHistoryItem.historyItemViewModel.outputSwimlanes,
        type: "historyItemLoadMore"
      });
    }
    return children;
  }
  hasChildren(inputOrElement) {
    return inputOrElement instanceof SCMHistoryViewModel;
  }
}
let SCMHistoryViewModel = class extends Disposable {
  constructor(_configurationService, _scmService, _scmViewService) {
    super();
    this._configurationService = _configurationService;
    this._scmService = _scmService;
    this._scmViewService = _scmViewService;
    this._register(autorun((reader) => {
      const repository = this._closedRepository.read(reader);
      if (!repository) {
        return;
      }
      if (this.repository.get() === repository) {
        this._selectedRepository.set(Iterable.first(this._scmService.repositories) ?? "auto", void 0);
      }
      this._state.delete(repository);
    }));
  }
  static {
    __name(this, "SCMHistoryViewModel");
  }
  _closedRepository = observableFromEvent(
    this,
    this._scmService.onDidRemoveRepository,
    (repository) => repository
  );
  _firstRepository = this._scmService.repositoryCount > 0 ? constObservable(Iterable.first(this._scmService.repositories)) : observableFromEvent(
    this,
    Event.once(this._scmService.onDidAddRepository),
    (repository) => repository
  );
  _selectedRepository = observableValue(this, "auto");
  _graphRepository = derived((reader) => {
    const selectedRepository = this._selectedRepository.read(reader);
    if (selectedRepository !== "auto") {
      return selectedRepository;
    }
    return this._scmViewService.activeRepository.read(reader);
  });
  /**
   * The active | selected repository takes precedence over the first repository when the observable
   * values are updated in the same transaction (or during the initial read of the observable value).
   */
  repository = latestChangedValue(this, [this._firstRepository, this._graphRepository]);
  historyItemsFilter = observableValue(this, "auto");
  _state = /* @__PURE__ */ new Map();
  clearRepositoryState() {
    const repository = this.repository.get();
    if (!repository) {
      return;
    }
    this._state.delete(repository);
  }
  setLoadMore(repository, loadMore) {
    const state = this._state.get(repository);
    if (!state) {
      return;
    }
    this._state.set(repository, { ...state, loadMore });
  }
  async getHistoryItems() {
    const repository = this.repository.get();
    if (!repository) {
      return [];
    }
    let state = this._state.get(repository);
    const historyProvider = repository.provider.historyProvider.get();
    if (!historyProvider) {
      return [];
    }
    if (!state || state.loadMore) {
      const existingHistoryItems = state?.items ?? [];
      let historyItemRefs = state?.historyItemRefs;
      if (!historyItemRefs) {
        const historyItemsFilter = this.historyItemsFilter.get();
        switch (historyItemsFilter) {
          case "all":
            historyItemRefs = await historyProvider.provideHistoryItemRefs() ?? [];
            break;
          case "auto":
            historyItemRefs = [
              historyProvider.historyItemRef.get(),
              historyProvider.historyItemRemoteRef.get(),
              historyProvider.historyItemBaseRef.get()
            ].filter((ref) => !!ref);
            break;
          default:
            historyItemRefs = historyItemsFilter;
            break;
        }
      }
      const limit = clamp(this._configurationService.getValue("scm.graph.pageSize"), 1, 1e3);
      const historyItemRefIds = historyItemRefs.map((ref) => ref.revision ?? ref.id);
      const historyItems = await historyProvider.provideHistoryItems({
        historyItemRefs: historyItemRefIds,
        limit,
        skip: existingHistoryItems.length
      }) ?? [];
      state = {
        historyItemRefs,
        items: [...existingHistoryItems, ...historyItems],
        loadMore: false
      };
      this._state.set(repository, state);
    }
    const colorMap = this._getGraphColorMap(state.historyItemRefs);
    return toISCMHistoryItemViewModelArray(state.items, colorMap).map((historyItemViewModel) => ({
      repository,
      historyItemViewModel,
      type: "historyItemViewModel"
    }));
  }
  setRepository(repository) {
    this._selectedRepository.set(repository, void 0);
  }
  setHistoryItemsFilter(filter) {
    this.historyItemsFilter.set(filter, void 0);
  }
  _getGraphColorMap(historyItemRefs) {
    const repository = this.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemRef = historyProvider?.historyItemRef.get();
    const historyItemRemoteRef = historyProvider?.historyItemRemoteRef.get();
    const historyItemBaseRef = historyProvider?.historyItemBaseRef.get();
    const colorMap = /* @__PURE__ */ new Map();
    if (historyItemRef) {
      colorMap.set(historyItemRef.id, historyItemRef.color);
      if (historyItemRemoteRef) {
        colorMap.set(historyItemRemoteRef.id, historyItemRemoteRef.color);
      }
      if (historyItemBaseRef) {
        colorMap.set(historyItemBaseRef.id, historyItemBaseRef.color);
      }
    }
    for (const ref of historyItemRefs) {
      if (!colorMap.has(ref.id)) {
        colorMap.set(ref.id, void 0);
      }
    }
    return colorMap;
  }
  dispose() {
    this._state.clear();
    super.dispose();
  }
};
SCMHistoryViewModel = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ISCMService),
  __decorateParam(2, ISCMViewService)
], SCMHistoryViewModel);
let RepositoryPicker = class extends Disposable {
  constructor(_quickInputService, _scmViewService) {
    super();
    this._quickInputService = _quickInputService;
    this._scmViewService = _scmViewService;
  }
  static {
    __name(this, "RepositoryPicker");
  }
  _autoQuickPickItem = {
    label: localize("auto", "Auto"),
    description: localize("activeRepository", "Show the source control graph for the active repository"),
    repository: "auto"
  };
  async pickRepository() {
    const picks = [
      this._autoQuickPickItem,
      { type: "separator" }
    ];
    picks.push(...this._scmViewService.repositories.map((r) => ({
      label: r.provider.name,
      description: r.provider.rootUri?.fsPath,
      iconClass: ThemeIcon.asClassName(Codicon.repo),
      repository: r
    })));
    return this._quickInputService.pick(picks, {
      placeHolder: localize("scmGraphRepository", "Select the repository to view, type to filter all repositories")
    });
  }
};
RepositoryPicker = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, ISCMViewService)
], RepositoryPicker);
let HistoryItemRefPicker = class extends Disposable {
  constructor(_historyProvider, _historyItemsFilter, _quickInputService) {
    super();
    this._historyProvider = _historyProvider;
    this._historyItemsFilter = _historyItemsFilter;
    this._quickInputService = _quickInputService;
  }
  static {
    __name(this, "HistoryItemRefPicker");
  }
  _allQuickPickItem = {
    id: "all",
    label: localize("all", "All"),
    description: localize("allHistoryItemRefs", "All history item references"),
    historyItemRef: "all"
  };
  _autoQuickPickItem = {
    id: "auto",
    label: localize("auto", "Auto"),
    description: localize("currentHistoryItemRef", "Current history item reference(s)"),
    historyItemRef: "auto"
  };
  async pickHistoryItemRef() {
    const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
    this._store.add(quickPick);
    quickPick.placeholder = localize("scmGraphHistoryItemRef", "Select one/more history item references to view, type to filter");
    quickPick.canSelectMany = true;
    quickPick.hideCheckAll = true;
    quickPick.busy = true;
    quickPick.show();
    quickPick.items = await this._createQuickPickItems();
    quickPick.busy = false;
    let selectedItems = [];
    if (this._historyItemsFilter === "all") {
      selectedItems.push(this._allQuickPickItem);
      quickPick.selectedItems = [this._allQuickPickItem];
    } else if (this._historyItemsFilter === "auto") {
      selectedItems.push(this._autoQuickPickItem);
      quickPick.selectedItems = [this._autoQuickPickItem];
    } else {
      for (const item of quickPick.items) {
        if (item.type === "separator") {
          continue;
        }
        if (this._historyItemsFilter.some((ref) => ref.id === item.id)) {
          selectedItems.push(item);
        }
      }
      quickPick.selectedItems = selectedItems;
    }
    return new Promise((resolve) => {
      this._store.add(quickPick.onDidChangeSelection((items) => {
        const { added } = delta(selectedItems, items, (a, b) => compare(a.id ?? "", b.id ?? ""));
        if (added.length > 0) {
          if (added[0].historyItemRef === "all" || added[0].historyItemRef === "auto") {
            quickPick.selectedItems = [added[0]];
          } else {
            quickPick.selectedItems = [...quickPick.selectedItems.filter((i) => i.historyItemRef !== "all" && i.historyItemRef !== "auto")];
          }
        }
        selectedItems = [...quickPick.selectedItems];
      }));
      this._store.add(quickPick.onDidAccept(() => {
        if (selectedItems.length === 1 && selectedItems[0].historyItemRef === "all") {
          resolve("all");
        } else if (selectedItems.length === 1 && selectedItems[0].historyItemRef === "auto") {
          resolve("auto");
        } else {
          resolve(selectedItems.map((item) => item.historyItemRef));
        }
        quickPick.hide();
      }));
      this._store.add(quickPick.onDidHide(() => {
        resolve(void 0);
        this.dispose();
      }));
    });
  }
  async _createQuickPickItems() {
    const picks = [
      this._allQuickPickItem,
      this._autoQuickPickItem
    ];
    const historyItemRefs = await this._historyProvider.provideHistoryItemRefs() ?? [];
    const historyItemRefsByCategory = groupBy(historyItemRefs, (a, b) => compare(a.category ?? "", b.category ?? ""));
    for (const refs of historyItemRefsByCategory) {
      if (refs.length === 0) {
        continue;
      }
      picks.push({ type: "separator", label: refs[0].category });
      picks.push(...refs.map((ref) => {
        return {
          id: ref.id,
          label: ref.name,
          description: ref.description,
          iconClass: ThemeIcon.isThemeIcon(ref.icon) ? ThemeIcon.asClassName(ref.icon) : void 0,
          historyItemRef: ref
        };
      }));
    }
    return picks;
  }
};
HistoryItemRefPicker = __decorateClass([
  __decorateParam(2, IQuickInputService)
], HistoryItemRefPicker);
let SCMHistoryViewPane = class extends ViewPane {
  constructor(options, _commandService, _instantiationService, _progressService, configurationService, contextMenuService, keybindingService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, hoverService) {
    super({
      ...options,
      titleMenuId: MenuId.SCMHistoryTitle,
      showActions: ViewPaneShowActions.WhenExpanded
    }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this._commandService = _commandService;
    this._instantiationService = _instantiationService;
    this._progressService = _progressService;
    this._scmProviderCtx = ContextKeys.SCMProvider.bindTo(this.scopedContextKeyService);
    this._actionRunner = this.instantiationService.createInstance(SCMHistoryViewPaneActionRunner);
    this._register(this._actionRunner);
    this._register(this._updateChildrenThrottler);
  }
  static {
    __name(this, "SCMHistoryViewPane");
  }
  _treeContainer;
  _tree;
  _treeViewModel;
  _treeDataSource;
  _treeIdentityProvider;
  _repositoryLoadMore = observableValue(this, false);
  _repositoryOutdated = observableValue(this, false);
  _actionRunner;
  _visibilityDisposables = new DisposableStore();
  _treeOperationSequencer = new Sequencer();
  _treeLoadMoreSequencer = new Sequencer();
  _updateChildrenThrottler = new Throttler();
  _scmProviderCtx;
  renderHeaderTitle(container) {
    super.renderHeaderTitle(container, this.title);
    const element = h("div.scm-graph-view-badge-container", [
      h("div.scm-graph-view-badge.monaco-count-badge.long@badge")
    ]);
    element.badge.textContent = "Outdated";
    container.appendChild(element.root);
    this._register(autorun((reader) => {
      const outdated = this._repositoryOutdated.read(reader);
      element.root.style.display = outdated ? "" : "none";
    }));
  }
  renderBody(container) {
    super.renderBody(container);
    this._treeContainer = append(container, $(".scm-view.scm-history-view"));
    this._treeContainer.classList.add("file-icon-themable-tree");
    this._createTree(this._treeContainer);
    this.onDidChangeBodyVisibility(async (visible) => {
      if (!visible) {
        this._visibilityDisposables.clear();
        return;
      }
      this._treeViewModel = this.instantiationService.createInstance(SCMHistoryViewModel);
      this._visibilityDisposables.add(this._treeViewModel);
      await this._progressService.withProgress({ location: this.id }, async () => {
        const firstRepositoryInitialized = derived(this, (reader) => {
          const repository = this._treeViewModel.repository.read(reader);
          const historyProvider = repository?.provider.historyProvider.read(reader);
          const historyItemRef = historyProvider?.historyItemRef.read(reader);
          return historyItemRef !== void 0 ? true : void 0;
        });
        await waitForState(firstRepositoryInitialized);
        await this._treeOperationSequencer.queue(async () => {
          await this._tree.setInput(this._treeViewModel);
          this._tree.scrollTop = 0;
        });
      });
      let isFirstRun = true;
      this._visibilityDisposables.add(autorunWithStore((reader, store) => {
        const repository = this._treeViewModel.repository.read(reader);
        const historyProvider = repository?.provider.historyProvider.read(reader);
        if (!repository || !historyProvider) {
          return;
        }
        this._scmProviderCtx.set(repository.provider.contextValue);
        const historyItemRemoteRefIdSignal = signalFromObservable(this, derived((reader2) => {
          return historyProvider.historyItemRemoteRef.read(reader2)?.id;
        }));
        const historyItemRemoteRefRevision = derived((reader2) => {
          return historyProvider.historyItemRemoteRef.read(reader2)?.revision;
        });
        store.add(
          autorunWithStoreHandleChanges({
            owner: this,
            createEmptyChangeSummary: /* @__PURE__ */ __name(() => ({ refresh: false }), "createEmptyChangeSummary"),
            handleChange(context, changeSummary) {
              changeSummary.refresh = context.didChange(historyItemRemoteRefRevision) ? "ifScrollTop" : true;
              return true;
            }
          }, (reader2, changeSummary) => {
            historyItemRemoteRefIdSignal.read(reader2);
            const historyItemRefValue = historyProvider.historyItemRef.read(reader2);
            const historyItemRemoteRefRevisionValue = historyItemRemoteRefRevision.read(reader2);
            if (changeSummary.refresh === true) {
              this.refresh();
              return;
            }
            if (changeSummary.refresh === "ifScrollTop") {
              if (historyItemRefValue?.revision === historyItemRemoteRefRevisionValue) {
                this.refresh();
                return;
              }
              if (this._tree.scrollTop === 0) {
                this.refresh();
                return;
              }
              this._repositoryOutdated.set(true, void 0);
            }
          })
        );
        store.add(runOnChange(this._treeViewModel.historyItemsFilter, () => {
          this.refresh();
        }));
        if (!isFirstRun) {
          this.refresh();
        }
        isFirstRun = false;
      }));
    });
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._tree.layout(height, width);
  }
  getActionRunner() {
    return this._actionRunner;
  }
  getActionsContext() {
    return this._treeViewModel?.repository.get()?.provider;
  }
  getActionViewItem(action, options) {
    if (action.id === PICK_REPOSITORY_ACTION_ID) {
      const repository = this._treeViewModel?.repository.get();
      if (repository) {
        return new SCMRepositoryActionViewItem(repository, action, options);
      }
    } else if (action.id === PICK_HISTORY_ITEM_REFS_ACTION_ID) {
      const repository = this._treeViewModel?.repository.get();
      const historyItemsFilter = this._treeViewModel?.historyItemsFilter.get();
      if (repository && historyItemsFilter) {
        return new SCMHistoryItemRefsActionViewItem(repository, historyItemsFilter, action, options);
      }
    }
    return super.getActionViewItem(action, options);
  }
  async refresh() {
    await this._updateChildren(true);
    this.updateActions();
    this._repositoryOutdated.set(false, void 0);
    this._tree.scrollTop = 0;
  }
  async pickRepository() {
    const picker = this._instantiationService.createInstance(RepositoryPicker);
    const result = await picker.pickRepository();
    if (result) {
      this._treeViewModel.setRepository(result.repository);
    }
  }
  async pickHistoryItemRef() {
    const repository = this._treeViewModel.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    const historyItemsFilter = this._treeViewModel.historyItemsFilter.get();
    if (!historyProvider) {
      return;
    }
    const picker = this._instantiationService.createInstance(HistoryItemRefPicker, historyProvider, historyItemsFilter);
    const result = await picker.pickHistoryItemRef();
    if (result) {
      this._treeViewModel.setHistoryItemsFilter(result);
    }
  }
  _createTree(container) {
    this._treeIdentityProvider = new SCMHistoryTreeIdentityProvider();
    const historyItemHoverDelegate = this.instantiationService.createInstance(HistoryItemHoverDelegate, this.viewDescriptorService.getViewLocationById(this.id));
    this._register(historyItemHoverDelegate);
    this._treeDataSource = this.instantiationService.createInstance(SCMHistoryTreeDataSource);
    this._register(this._treeDataSource);
    this._tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "SCM History Tree",
      container,
      new ListDelegate(),
      [
        this.instantiationService.createInstance(HistoryItemRenderer, historyItemHoverDelegate),
        this.instantiationService.createInstance(
          HistoryItemLoadMoreRenderer,
          () => this._repositoryLoadMore,
          (repository) => this._loadMoreCallback(repository)
        )
      ],
      this._treeDataSource,
      {
        accessibilityProvider: new SCMHistoryTreeAccessibilityProvider(),
        identityProvider: this._treeIdentityProvider,
        collapseByDefault: /* @__PURE__ */ __name((e) => false, "collapseByDefault"),
        keyboardNavigationLabelProvider: new SCMHistoryTreeKeyboardNavigationLabelProvider(),
        horizontalScrolling: false,
        multipleSelectionSupport: false
      }
    );
    this._register(this._tree);
    this._tree.onDidOpen(this._onDidOpen, this, this._store);
    this._tree.onContextMenu(this._onContextMenu, this, this._store);
  }
  async _onDidOpen(e) {
    if (!e.element) {
      return;
    } else if (isSCMHistoryItemViewModelTreeElement(e.element)) {
      const historyItem = e.element.historyItemViewModel.historyItem;
      const historyItemParentId = historyItem.parentIds.length > 0 ? historyItem.parentIds[0] : void 0;
      const historyProvider = e.element.repository.provider.historyProvider.get();
      const historyItemChanges = await historyProvider?.provideHistoryItemChanges(historyItem.id, historyItemParentId);
      if (historyItemChanges) {
        const title = `${historyItem.displayId ?? historyItem.id} - ${historyItem.message}`;
        const rootUri = e.element.repository.provider.rootUri;
        const path = rootUri ? rootUri.path : e.element.repository.provider.label;
        const multiDiffSourceUri = URI.from({ scheme: "scm-history-item", path: `${path}/${historyItemParentId}..${historyItem.id}` }, true);
        await this._commandService.executeCommand("_workbench.openMultiDiffEditor", { title, multiDiffSourceUri, resources: historyItemChanges });
      }
    } else if (isSCMHistoryItemLoadMoreTreeElement(e.element)) {
      const pageOnScroll = this.configurationService.getValue("scm.graph.pageOnScroll") === true;
      if (!pageOnScroll) {
        this._loadMoreCallback(e.element.repository);
        this._tree.setSelection([]);
      }
    }
  }
  _onContextMenu(e) {
    const element = e.element;
    if (!element || !isSCMHistoryItemViewModelTreeElement(element)) {
      return;
    }
    this.contextMenuService.showContextMenu({
      menuId: MenuId.SCMChangesContext,
      menuActionOptions: {
        arg: element.repository.provider,
        shouldForwardArgs: true
      },
      getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
      getActionsContext: /* @__PURE__ */ __name(() => element.historyItemViewModel.historyItem, "getActionsContext")
    });
  }
  async _loadMoreCallback(repository) {
    return this._treeLoadMoreSequencer.queue(async () => {
      if (this._repositoryLoadMore.get()) {
        return;
      }
      this._repositoryLoadMore.set(true, void 0);
      this._treeViewModel.setLoadMore(repository, true);
      await this._updateChildren();
      this._repositoryLoadMore.set(false, void 0);
    });
  }
  _updateChildren(clearCache = false) {
    return this._updateChildrenThrottler.queue(
      () => this._treeOperationSequencer.queue(
        async () => {
          if (clearCache) {
            this._treeViewModel.clearRepositoryState();
          }
          await this._progressService.withProgress(
            { location: this.id },
            async () => {
              await this._tree.updateChildren(void 0, void 0, void 0, {
                // diffIdentityProvider: this._treeIdentityProvider
              });
            }
          );
        }
      )
    );
  }
  dispose() {
    this._visibilityDisposables.dispose();
    super.dispose();
  }
};
SCMHistoryViewPane = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IProgressService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IViewDescriptorService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IHoverService)
], SCMHistoryViewPane);
export {
  SCMHistoryViewPane
};
//# sourceMappingURL=scmHistoryViewPane.js.map
