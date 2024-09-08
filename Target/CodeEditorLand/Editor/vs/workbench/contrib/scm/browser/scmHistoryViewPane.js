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
import { $, append, h, reset } from "../../../../base/browser/dom.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import {
  ActionRunner
} from "../../../../base/common/actions.js";
import { tail } from "../../../../base/common/arrays.js";
import { Sequencer, Throttler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { fromNow } from "../../../../base/common/date.js";
import { structuralEquals } from "../../../../base/common/equals.js";
import { Event } from "../../../../base/common/event.js";
import {
  createMatches
} from "../../../../base/common/filters.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { stripIcons } from "../../../../base/common/iconLabels.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { clamp } from "../../../../base/common/numbers.js";
import {
  autorun,
  autorunWithStore,
  autorunWithStoreHandleChanges,
  derived,
  derivedOpts,
  observableValue
} from "../../../../base/common/observable.js";
import {
  constObservable,
  derivedConstOnceDefined,
  latestChangedValue,
  observableFromEvent
} from "../../../../base/common/observableInternal/utils.js";
import * as platform from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import {
  IHoverService,
  WorkbenchHoverDelegate
} from "../../../../platform/hover/browser/hover.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  WorkbenchAsyncDataTree
} from "../../../../platform/list/browser/listService.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  asCssVariable,
  foreground
} from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  ViewAction,
  ViewPane,
  ViewPaneShowActions
} from "../../../browser/parts/views/viewPane.js";
import {
  IViewDescriptorService,
  ViewContainerLocation
} from "../../../common/views.js";
import {
  IWorkbenchLayoutService,
  Position
} from "../../../services/layout/browser/layoutService.js";
import {
  HISTORY_VIEW_PANE_ID,
  ISCMService,
  ISCMViewService
} from "../common/scm.js";
import {
  historyItemGroupBase,
  historyItemGroupLocal,
  historyItemGroupRemote,
  historyItemHoverAdditionsForeground,
  historyItemHoverDefaultLabelBackground,
  historyItemHoverDefaultLabelForeground,
  historyItemHoverDeletionsForeground,
  historyItemHoverLabelForeground,
  renderSCMHistoryGraphPlaceholder,
  renderSCMHistoryItemGraph,
  SWIMLANE_WIDTH,
  toISCMHistoryItemViewModelArray
} from "./scmHistory.js";
import { ContextKeys } from "./scmViewPane.js";
import {
  isSCMHistoryItemLoadMoreTreeElement,
  isSCMHistoryItemViewModelTreeElement,
  isSCMRepository
} from "./util.js";
class SCMRepositoryActionViewItem extends ActionViewItem {
  constructor(_repository, action, options) {
    super(null, action, { ...options, icon: false, label: true });
    this._repository = _repository;
  }
  updateLabel() {
    if (this.options.label && this.label) {
      this.label.classList.add("scm-graph-repository-picker");
      reset(
        this.label,
        ...renderLabelWithIcons(
          `$(repo) ${this._repository.provider.name}`
        )
      );
    }
  }
}
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: "workbench.scm.action.repository",
        title: "",
        viewId: HISTORY_VIEW_PANE_ID,
        f1: false,
        menu: {
          id: MenuId.SCMHistoryTitle,
          when: ContextKeyExpr.and(
            ContextKeyExpr.has("scm.providerCount"),
            ContextKeyExpr.greater("scm.providerCount", 1)
          ),
          group: "navigation",
          order: 0
        }
      });
    }
    async runInView(_, view) {
      view.pickRepository();
    }
  }
);
registerAction2(
  class extends ViewAction {
    constructor() {
      super({
        id: "workbench.scm.action.refreshGraph",
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
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.scm.action.scm.viewChanges",
        title: localize("viewChanges", "View Changes"),
        f1: false,
        menu: [
          {
            id: MenuId.SCMChangesContext,
            group: "0_view",
            when: ContextKeyExpr.equals(
              "config.multiDiffEditor.experimental.enabled",
              true
            )
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
        const ancestor = await historyProvider?.resolveHistoryItemGroupCommonAncestor(
          [historyItem.id, historyItemLast.id]
        );
        if (!ancestor || ancestor !== historyItem.id && ancestor !== historyItemLast.id) {
          return;
        }
      }
      const historyItemParentId = historyItemLast.parentIds.length > 0 ? historyItemLast.parentIds[0] : void 0;
      const historyItemChanges = await historyProvider?.provideHistoryItemChanges(
        historyItem.id,
        historyItemParentId
      );
      if (!historyItemChanges?.length) {
        return;
      }
      const title = historyItems.length === 1 ? `${historyItems[0].displayId ?? historyItems[0].id} - ${historyItems[0].message}` : localize(
        "historyItemChangesEditorTitle",
        "All Changes ({0} \u2194 {1})",
        historyItemLast.displayId ?? historyItemLast.id,
        historyItem.displayId ?? historyItem.id
      );
      const rootUri = provider.rootUri;
      const path = rootUri ? rootUri.path : provider.label;
      const multiDiffSourceUri = URI.from(
        {
          scheme: "scm-history-item",
          path: `${path}/${historyItemParentId}..${historyItem.id}`
        },
        true
      );
      commandService.executeCommand("_workbench.openMultiDiffEditor", {
        title,
        multiDiffSourceUri,
        resources: historyItemChanges
      });
    }
  }
);
class ListDelegate {
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
  constructor(hoverDelegate, _configurationService, _hoverService, _themeService) {
    this.hoverDelegate = hoverDelegate;
    this._configurationService = _configurationService;
    this._hoverService = _hoverService;
    this._themeService = _themeService;
  }
  static TEMPLATE_ID = "history-item";
  get templateId() {
    return HistoryItemRenderer.TEMPLATE_ID;
  }
  _badgesConfig = observableConfigValue(
    "scm.graph.badges",
    "filter",
    this._configurationService
  );
  renderTemplate(container) {
    container.parentElement.parentElement.querySelector(
      ".monaco-tl-twistie"
    ).classList.add("force-no-twistie");
    const element = append(container, $(".history-item"));
    const graphContainer = append(element, $(".graph-container"));
    const iconLabel = new IconLabel(element, {
      supportIcons: true,
      supportHighlights: true,
      supportDescriptionHighlights: true
    });
    const labelContainer = append(element, $(".label-container"));
    element.appendChild(labelContainer);
    return {
      element,
      graphContainer,
      label: iconLabel,
      labelContainer,
      elementDisposables: new DisposableStore(),
      disposables: new DisposableStore()
    };
  }
  renderElement(node, index, templateData, height) {
    const historyItemViewModel = node.element.historyItemViewModel;
    const historyItem = historyItemViewModel.historyItem;
    const historyItemHover = this._hoverService.setupManagedHover(
      this.hoverDelegate,
      templateData.element,
      this.getTooltip(node.element)
    );
    templateData.elementDisposables.add(historyItemHover);
    templateData.graphContainer.textContent = "";
    templateData.graphContainer.appendChild(
      renderSCMHistoryItemGraph(historyItemViewModel)
    );
    const provider = node.element.repository.provider;
    const currentHistoryItemGroup = provider.historyProvider.get()?.currentHistoryItemGroup?.get();
    const extraClasses = currentHistoryItemGroup?.revision === historyItem.id ? ["history-item-current"] : [];
    const [matches, descriptionMatches] = this.processMatches(
      historyItemViewModel,
      node.filterData
    );
    templateData.label.setLabel(historyItem.subject, historyItem.author, {
      matches,
      descriptionMatches,
      extraClasses
    });
    this._renderLabels(historyItem, templateData);
  }
  _renderLabels(historyItem, templateData) {
    templateData.elementDisposables.add(
      autorun((reader) => {
        const labelConfig = this._badgesConfig.read(reader);
        templateData.labelContainer.textContent = "";
        const firstColoredLabel = historyItem.labels?.find(
          (label) => label.color
        );
        for (const label of historyItem.labels ?? []) {
          if (!label.color && labelConfig === "filter") {
            continue;
          }
          if (label.icon && ThemeIcon.isThemeIcon(label.icon)) {
            const elements = h(
              "div.label",
              {
                style: {
                  color: label.color ? asCssVariable(
                    historyItemHoverLabelForeground
                  ) : asCssVariable(foreground),
                  backgroundColor: label.color ? asCssVariable(label.color) : asCssVariable(
                    historyItemHoverDefaultLabelBackground
                  )
                }
              },
              [
                h("div.icon@icon"),
                h("div.description@description")
              ]
            );
            elements.icon.classList.add(
              ...ThemeIcon.asClassNameArray(label.icon)
            );
            elements.description.textContent = label.title;
            elements.description.style.display = label === firstColoredLabel ? "" : "none";
            append(templateData.labelContainer, elements.root);
          }
        }
      })
    );
  }
  getTooltip(element) {
    const colorTheme = this._themeService.getColorTheme();
    const historyItem = element.historyItemViewModel.historyItem;
    const markdown = new MarkdownString("", {
      isTrusted: true,
      supportThemeIcons: true
    });
    markdown.appendMarkdown(
      `$(git-commit) \`${historyItem.displayId ?? historyItem.id}\`

`
    );
    if (historyItem.author) {
      markdown.appendMarkdown(`$(account) **${historyItem.author}**`);
      if (historyItem.timestamp) {
        const dateFormatter = new Intl.DateTimeFormat(
          platform.language,
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
          }
        );
        markdown.appendMarkdown(
          `, $(history) ${fromNow(historyItem.timestamp, true, true)} (${dateFormatter.format(historyItem.timestamp)})`
        );
      }
      markdown.appendMarkdown("\n\n");
    }
    markdown.appendMarkdown(`${historyItem.message}

`);
    if (historyItem.statistics) {
      markdown.appendMarkdown(`---

`);
      markdown.appendMarkdown(
        `<span>${historyItem.statistics.files === 1 ? localize(
          "fileChanged",
          "{0} file changed",
          historyItem.statistics.files
        ) : localize(
          "filesChanged",
          "{0} files changed",
          historyItem.statistics.files
        )}</span>`
      );
      if (historyItem.statistics.insertions) {
        const additionsForegroundColor = colorTheme.getColor(
          historyItemHoverAdditionsForeground
        );
        markdown.appendMarkdown(
          `,&nbsp;<span style="color:${additionsForegroundColor};">${historyItem.statistics.insertions === 1 ? localize(
            "insertion",
            "{0} insertion{1}",
            historyItem.statistics.insertions,
            "(+)"
          ) : localize(
            "insertions",
            "{0} insertions{1}",
            historyItem.statistics.insertions,
            "(+)"
          )}</span>`
        );
      }
      if (historyItem.statistics.deletions) {
        const deletionsForegroundColor = colorTheme.getColor(
          historyItemHoverDeletionsForeground
        );
        markdown.appendMarkdown(
          `,&nbsp;<span style="color:${deletionsForegroundColor};">${historyItem.statistics.deletions === 1 ? localize(
            "deletion",
            "{0} deletion{1}",
            historyItem.statistics.deletions,
            "(-)"
          ) : localize(
            "deletions",
            "{0} deletions{1}",
            historyItem.statistics.deletions,
            "(-)"
          )}</span>`
        );
      }
    }
    if ((historyItem.labels ?? []).length > 0) {
      markdown.appendMarkdown(`

---

`);
      markdown.appendMarkdown(
        (historyItem.labels ?? []).map((label) => {
          const labelIconId = ThemeIcon.isThemeIcon(label.icon) ? label.icon.id : "";
          const labelBackgroundColor = label.color ? asCssVariable(label.color) : asCssVariable(
            historyItemHoverDefaultLabelBackground
          );
          const labelForegroundColor = label.color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(
            historyItemHoverDefaultLabelForeground
          );
          return `<span style="color:${labelForegroundColor};background-color:${labelBackgroundColor};border-radius:2px;">&nbsp;$(${labelIconId})&nbsp;${label.title}&nbsp;</span>`;
        }).join("&nbsp;&nbsp;")
      );
    }
    return { markdown, markdownNotSupportedFallback: historyItem.message };
  }
  processMatches(historyItemViewModel, filterData) {
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
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IThemeService)
], HistoryItemRenderer);
let HistoryItemLoadMoreRenderer = class {
  constructor(_loadingMore, _loadMoreCallback, _configurationService) {
    this._loadingMore = _loadingMore;
    this._loadMoreCallback = _loadMoreCallback;
    this._configurationService = _configurationService;
  }
  static TEMPLATE_ID = "historyItemLoadMore";
  get templateId() {
    return HistoryItemLoadMoreRenderer.TEMPLATE_ID;
  }
  renderTemplate(container) {
    container.parentElement.parentElement.querySelector(
      ".monaco-tl-twistie"
    ).classList.add("force-no-twistie");
    const element = append(container, $(".history-item-load-more"));
    const graphPlaceholder = append(element, $(".graph-placeholder"));
    const historyItemPlaceholderContainer = append(
      element,
      $(".history-item-placeholder")
    );
    const historyItemPlaceholderLabel = new IconLabel(
      historyItemPlaceholderContainer,
      { supportIcons: true }
    );
    return {
      element,
      graphPlaceholder,
      historyItemPlaceholderContainer,
      historyItemPlaceholderLabel,
      elementDisposables: new DisposableStore(),
      disposables: new DisposableStore()
    };
  }
  renderElement(element, index, templateData, height) {
    templateData.graphPlaceholder.textContent = "";
    templateData.graphPlaceholder.style.width = `${SWIMLANE_WIDTH * (element.element.graphColumns.length + 1)}px`;
    templateData.graphPlaceholder.appendChild(
      renderSCMHistoryGraphPlaceholder(element.element.graphColumns)
    );
    const pageOnScroll = this._configurationService.getValue(
      "scm.graph.pageOnScroll"
    ) === true;
    templateData.historyItemPlaceholderContainer.classList.toggle(
      "shimmer",
      pageOnScroll
    );
    if (pageOnScroll) {
      templateData.historyItemPlaceholderLabel.setLabel("");
      this._loadMoreCallback(element.element.repository);
    } else {
      templateData.elementDisposables.add(
        autorun((reader) => {
          const loadingMore = this._loadingMore().read(reader);
          const icon = `$(${loadingMore ? "loading~spin" : "fold-down"})`;
          templateData.historyItemPlaceholderLabel.setLabel(
            localize("loadMore", "{0} Load More...", icon)
          );
        })
      );
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
    super(
      "element",
      true,
      () => this.getHoverOptions(),
      configurationService,
      hoverService
    );
    this._viewContainerLocation = _viewContainerLocation;
    this.layoutService = layoutService;
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
    return {
      additionalClasses: ["history-item-hover"],
      position: { hoverPosition, forcePosition: true }
    };
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
  getKeyboardNavigationLabel(element) {
    if (isSCMRepository(element)) {
      return void 0;
    } else if (isSCMHistoryItemViewModelTreeElement(element)) {
      return [
        element.historyItemViewModel.historyItem.message,
        element.historyItemViewModel.historyItem.author
      ];
    } else if (isSCMHistoryItemLoadMoreTreeElement(element)) {
      return "";
    } else {
      throw new Error("Invalid tree element");
    }
  }
}
class SCMHistoryTreeDataSource extends Disposable {
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
    this._register(
      autorun((reader) => {
        const repository = this._closedRepository.read(reader);
        if (!repository) {
          return;
        }
        if (this.repository.get() === repository) {
          this._selectedRepository.set(
            Iterable.first(this._scmService.repositories) ?? "auto",
            void 0
          );
        }
        this._state.delete(repository);
      })
    );
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
  repository = latestChangedValue(this, [
    this._firstRepository,
    this._graphRepository
  ]);
  _historyItemGroupFilter = observableValue(this, "auto");
  historyItemGroupFilter = derived((reader) => {
    const filter = this._historyItemGroupFilter.read(reader);
    if (Array.isArray(filter)) {
      return filter;
    }
    if (filter === "all") {
      return [];
    }
    const repository = this.repository.get();
    const historyProvider = repository?.provider.historyProvider.get();
    const currentHistoryItemGroup = historyProvider?.currentHistoryItemGroup.get();
    if (!currentHistoryItemGroup) {
      return [];
    }
    return [
      currentHistoryItemGroup.revision ?? currentHistoryItemGroup.id,
      ...currentHistoryItemGroup.remote ? [
        currentHistoryItemGroup.remote.revision ?? currentHistoryItemGroup.remote.id
      ] : [],
      ...currentHistoryItemGroup.base ? [
        currentHistoryItemGroup.base.revision ?? currentHistoryItemGroup.base.id
      ] : []
    ];
  });
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
    const currentHistoryItemGroup = state?.currentHistoryItemGroup ?? historyProvider?.currentHistoryItemGroup.get();
    if (!historyProvider || !currentHistoryItemGroup) {
      return [];
    }
    if (!state || state.loadMore) {
      const existingHistoryItems = state?.items ?? [];
      const historyItemGroupIds = this.historyItemGroupFilter.get();
      const limit = clamp(
        this._configurationService.getValue(
          "scm.graph.pageSize"
        ),
        1,
        1e3
      );
      const historyItems = await historyProvider.provideHistoryItems({
        historyItemGroupIds,
        limit,
        skip: existingHistoryItems.length
      }) ?? [];
      state = {
        currentHistoryItemGroup,
        items: [...existingHistoryItems, ...historyItems],
        loadMore: false
      };
      this._state.set(repository, state);
    }
    const colorMap = this._getGraphColorMap(currentHistoryItemGroup);
    return toISCMHistoryItemViewModelArray(state.items, colorMap).map(
      (historyItemViewModel) => ({
        repository,
        historyItemViewModel,
        type: "historyItemViewModel"
      })
    );
  }
  setRepository(repository) {
    this._selectedRepository.set(repository, void 0);
  }
  _getGraphColorMap(currentHistoryItemGroup) {
    const colorMap = /* @__PURE__ */ new Map([
      [currentHistoryItemGroup.name, historyItemGroupLocal]
    ]);
    if (currentHistoryItemGroup.remote) {
      colorMap.set(
        currentHistoryItemGroup.remote.name,
        historyItemGroupRemote
      );
    }
    if (currentHistoryItemGroup.base) {
      colorMap.set(
        currentHistoryItemGroup.base.name,
        historyItemGroupBase
      );
    }
    if (this._historyItemGroupFilter.get() === "all") {
      colorMap.set("*", "");
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
let SCMHistoryViewPane = class extends ViewPane {
  constructor(options, _commandService, _scmViewService, _progressService, _quickInputService, configurationService, contextMenuService, keybindingService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, hoverService) {
    super(
      {
        ...options,
        titleMenuId: MenuId.SCMHistoryTitle,
        showActions: ViewPaneShowActions.WhenExpanded
      },
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
    this._commandService = _commandService;
    this._scmViewService = _scmViewService;
    this._progressService = _progressService;
    this._quickInputService = _quickInputService;
    this._scmProviderCtx = ContextKeys.SCMProvider.bindTo(
      this.scopedContextKeyService
    );
    this._actionRunner = this.instantiationService.createInstance(
      SCMHistoryViewPaneActionRunner
    );
    this._register(this._actionRunner);
    this._register(this._updateChildrenThrottler);
  }
  _treeContainer;
  _tree;
  _treeViewModel;
  _treeDataSource;
  _treeIdentityProvider;
  _repositoryLoadMore = observableValue(this, false);
  _actionRunner;
  _visibilityDisposables = new DisposableStore();
  _treeOperationSequencer = new Sequencer();
  _treeLoadMoreSequencer = new Sequencer();
  _updateChildrenThrottler = new Throttler();
  _scmProviderCtx;
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this._tree.layout(height, width);
  }
  renderBody(container) {
    super.renderBody(container);
    this._treeContainer = append(
      container,
      $(".scm-view.scm-history-view")
    );
    this._treeContainer.classList.add("file-icon-themable-tree");
    this._createTree(this._treeContainer);
    this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        this._treeViewModel = this.instantiationService.createInstance(
          SCMHistoryViewModel
        );
        this._visibilityDisposables.add(this._treeViewModel);
        const firstRepository = derivedConstOnceDefined(
          this,
          (reader) => {
            const repository = this._treeViewModel.repository.read(reader);
            const historyProvider = repository?.provider.historyProvider.read(reader);
            const currentHistoryItemGroup = historyProvider?.currentHistoryItemGroup.read(
              reader
            );
            return currentHistoryItemGroup !== void 0 ? repository : void 0;
          }
        );
        this._visibilityDisposables.add(
          autorunWithStore(async (reader, store) => {
            const repository = firstRepository.read(reader);
            if (!repository) {
              return;
            }
            this._treeOperationSequencer.queue(async () => {
              await this._tree.setInput(this._treeViewModel);
              this._tree.scrollTop = 0;
            });
            store.add(
              autorunWithStoreHandleChanges(
                {
                  owner: this,
                  createEmptyChangeSummary: () => ({
                    refresh: false
                  }),
                  handleChange(_, changeSummary) {
                    changeSummary.refresh = true;
                    return true;
                  }
                },
                (reader2, changeSummary, store2) => {
                  const repository2 = this._treeViewModel.repository.read(
                    reader2
                  );
                  const historyProvider = repository2?.provider.historyProvider.read(
                    reader2
                  );
                  if (!repository2 || !historyProvider) {
                    return;
                  }
                  this._scmProviderCtx.set(
                    repository2.provider.contextValue
                  );
                  const historyItemGroup = derivedOpts(
                    {
                      owner: this,
                      equalsFn: structuralEquals
                    },
                    (reader3) => {
                      const currentHistoryItemGroup = historyProvider.currentHistoryItemGroup.read(
                        reader3
                      );
                      return currentHistoryItemGroup ? {
                        id: currentHistoryItemGroup.id,
                        revision: currentHistoryItemGroup.revision,
                        remoteId: currentHistoryItemGroup.remote?.id
                      } : void 0;
                    }
                  );
                  const historyItemRemoteRevision = derived(
                    (reader3) => {
                      return historyProvider.currentHistoryItemGroup.read(
                        reader3
                      )?.remote?.revision;
                    }
                  );
                  store2.add(
                    autorunWithStoreHandleChanges(
                      {
                        owner: this,
                        createEmptyChangeSummary: () => ({ refresh: false }),
                        handleChange(context, changeSummary2) {
                          changeSummary2.refresh = context.didChange(
                            historyItemRemoteRevision
                          ) ? "ifScrollTop" : true;
                          return true;
                        }
                      },
                      (reader3, changeSummary2) => {
                        if (!historyItemGroup.read(
                          reader3
                        ) && !historyItemRemoteRevision.read(
                          reader3
                        ) || changeSummary2.refresh === false) {
                          return;
                        }
                        if (changeSummary2.refresh === true) {
                          this.refresh();
                          return;
                        }
                        if (changeSummary2.refresh === "ifScrollTop") {
                          if (this._tree.scrollTop === 0) {
                            this.refresh();
                            return;
                          }
                          this.updateTitleDescription(
                            localize(
                              "outdated",
                              "OUTDATED"
                            )
                          );
                        }
                      }
                    )
                  );
                  if (changeSummary.refresh) {
                    this.refresh();
                  }
                }
              )
            );
          })
        );
      } else {
        this._visibilityDisposables.clear();
      }
    });
  }
  getActionRunner() {
    return this._actionRunner;
  }
  getActionsContext() {
    return this._treeViewModel?.repository.get()?.provider;
  }
  getActionViewItem(action, options) {
    if (action.id === "workbench.scm.action.repository") {
      const repository = this._treeViewModel?.repository.get();
      if (repository) {
        return new SCMRepositoryActionViewItem(
          repository,
          action,
          options
        );
      }
    }
    return super.getActionViewItem(action, options);
  }
  async refresh() {
    await this._updateChildren(true);
    this.updateActions();
    this.updateTitleDescription(void 0);
    this._tree.scrollTop = 0;
  }
  async pickRepository() {
    const picks = [
      {
        label: localize("auto", "Auto"),
        description: localize(
          "activeRepository",
          "Show the source control graph for the active repository"
        ),
        repository: "auto"
      },
      {
        type: "separator"
      }
    ];
    picks.push(
      ...this._scmViewService.repositories.map((r) => ({
        label: r.provider.name,
        description: r.provider.rootUri?.fsPath,
        iconClass: ThemeIcon.asClassName(Codicon.repo),
        repository: r
      }))
    );
    const result = await this._quickInputService.pick(picks, {
      placeHolder: localize(
        "scmGraphRepository",
        "Select the repository to view, type to filter all repositories"
      )
    });
    if (result) {
      this._treeViewModel.setRepository(result.repository);
    }
  }
  _createTree(container) {
    this._treeIdentityProvider = new SCMHistoryTreeIdentityProvider();
    const historyItemHoverDelegate = this.instantiationService.createInstance(
      HistoryItemHoverDelegate,
      this.viewDescriptorService.getViewLocationById(this.id)
    );
    this._register(historyItemHoverDelegate);
    this._treeDataSource = this.instantiationService.createInstance(
      SCMHistoryTreeDataSource
    );
    this._register(this._treeDataSource);
    this._tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "SCM History Tree",
      container,
      new ListDelegate(),
      [
        this.instantiationService.createInstance(
          HistoryItemRenderer,
          historyItemHoverDelegate
        ),
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
        collapseByDefault: (e) => false,
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
      const historyItemChanges = await historyProvider?.provideHistoryItemChanges(
        historyItem.id,
        historyItemParentId
      );
      if (historyItemChanges) {
        const title = `${historyItem.displayId ?? historyItem.id} - ${historyItem.message}`;
        const rootUri = e.element.repository.provider.rootUri;
        const path = rootUri ? rootUri.path : e.element.repository.provider.label;
        const multiDiffSourceUri = URI.from(
          {
            scheme: "scm-history-item",
            path: `${path}/${historyItemParentId}..${historyItem.id}`
          },
          true
        );
        await this._commandService.executeCommand(
          "_workbench.openMultiDiffEditor",
          {
            title,
            multiDiffSourceUri,
            resources: historyItemChanges
          }
        );
      }
    } else if (isSCMHistoryItemLoadMoreTreeElement(e.element)) {
      const pageOnScroll = this.configurationService.getValue(
        "scm.graph.pageOnScroll"
      ) === true;
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
      getAnchor: () => e.anchor,
      getActionsContext: () => element.historyItemViewModel.historyItem
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
      () => this._treeOperationSequencer.queue(async () => {
        if (clearCache) {
          this._treeViewModel.clearRepositoryState();
        }
        await this._progressService.withProgress(
          { location: this.id },
          async () => {
            await this._tree.updateChildren(
              void 0,
              void 0,
              void 0,
              {
                // diffIdentityProvider: this._treeIdentityProvider
              }
            );
          }
        );
      })
    );
  }
  dispose() {
    this._visibilityDisposables.dispose();
    super.dispose();
  }
};
SCMHistoryViewPane = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, ISCMViewService),
  __decorateParam(3, IProgressService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IOpenerService),
  __decorateParam(12, IThemeService),
  __decorateParam(13, ITelemetryService),
  __decorateParam(14, IHoverService)
], SCMHistoryViewPane);
export {
  SCMHistoryViewPane
};
