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
import * as dom from "../../../../base/browser/dom.js";
import {
  ActionBar
} from "../../../../base/browser/ui/actionbar/actionbar.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import {
  DefaultKeyboardNavigationDelegate
} from "../../../../base/browser/ui/list/listWidget.js";
import {
  TreeVisibility
} from "../../../../base/browser/ui/tree/tree.js";
import {
  Action,
  ActionRunner,
  Separator
} from "../../../../base/common/actions.js";
import { mapFindFirst } from "../../../../base/common/arraysFind.js";
import {
  RunOnceScheduler,
  disposableTimeout
} from "../../../../base/common/async.js";
import { Color, RGBA } from "../../../../base/common/color.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  observableFromEvent
} from "../../../../base/common/observable.js";
import { fuzzyContains } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isDefined } from "../../../../base/common/types.js";
import "./media/testing.css";
import { MarkdownRenderer } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { localize } from "../../../../nls.js";
import { DropdownWithPrimaryActionViewItem } from "../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js";
import {
  MenuEntryActionViewItem,
  createActionViewItem,
  createAndFillInActionBarActions,
  createAndFillInContextMenuActions
} from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import {
  IMenuService,
  MenuId,
  MenuItemAction
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { UnmanagedProgress } from "../../../../platform/progress/common/progress.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget,
  WillSaveStateReason
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { foreground } from "../../../../platform/theme/common/colorRegistry.js";
import { spinningLoading } from "../../../../platform/theme/common/iconRegistry.js";
import {
  IThemeService,
  registerThemingParticipant
} from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { registerNavigableContainer } from "../../../browser/actions/widgetNavigationCommands.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { IViewDescriptorService } from "../../../common/views.js";
import {
  IActivityService,
  IconBadge,
  NumberBadge
} from "../../../services/activity/common/activity.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  TestingConfigKeys,
  TestingCountBadge,
  getTestingConfiguration
} from "../common/configuration.js";
import {
  TestCommandId,
  TestExplorerViewMode,
  TestExplorerViewSorting,
  Testing,
  labelForTestInState
} from "../common/constants.js";
import { StoredValue } from "../common/storedValue.js";
import {
  ITestExplorerFilterState,
  TestFilterTerm
} from "../common/testExplorerFilterState.js";
import { TestId } from "../common/testId.js";
import {
  ITestProfileService,
  canUseProfileWithTest
} from "../common/testProfileService.js";
import {
  LiveTestResult,
  TestResultItemChangeReason
} from "../common/testResult.js";
import { ITestResultService } from "../common/testResultService.js";
import {
  ITestService,
  testCollectionIsEmpty
} from "../common/testService.js";
import {
  TestControllerCapability,
  TestItemExpandState,
  TestResultState,
  TestRunProfileBitset
} from "../common/testTypes.js";
import { TestingContextKeys } from "../common/testingContextKeys.js";
import { ITestingContinuousRunService } from "../common/testingContinuousRunService.js";
import { ITestingPeekOpener } from "../common/testingPeekOpener.js";
import {
  cmpPriority,
  isFailedState,
  isStateWithResult,
  statesInOrder
} from "../common/testingStates.js";
import {
  TestItemTreeElement,
  TestTreeErrorMessage
} from "./explorerProjections/index.js";
import { ListProjection } from "./explorerProjections/listProjection.js";
import { getTestItemContextOverlay } from "./explorerProjections/testItemContextOverlay.js";
import { TestingObjectTree } from "./explorerProjections/testingObjectTree.js";
import { TreeProjection } from "./explorerProjections/treeProjection.js";
import * as icons from "./icons.js";
import { DebugLastRun, ReRunLastRun } from "./testExplorerActions.js";
import { TestingExplorerFilter } from "./testingExplorerFilter.js";
import {
  collectTestStateCounts,
  getTestProgressText
} from "./testingProgressUiService.js";
var LastFocusState = /* @__PURE__ */ ((LastFocusState2) => {
  LastFocusState2[LastFocusState2["Input"] = 0] = "Input";
  LastFocusState2[LastFocusState2["Tree"] = 1] = "Tree";
  return LastFocusState2;
})(LastFocusState || {});
let TestingExplorerView = class extends ViewPane {
  constructor(options, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, testService, telemetryService, hoverService, testProfileService, commandService, menuService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this.testService = testService;
    this.testProfileService = testProfileService;
    this.commandService = commandService;
    this.menuService = menuService;
    const relayout = this._register(new RunOnceScheduler(() => this.layoutBody(), 1));
    this._register(this.onDidChangeViewWelcomeState(() => {
      if (!this.shouldShowWelcome()) {
        relayout.schedule();
      }
    }));
    this._register(testService.collection.onBusyProvidersChange((busy) => {
      this.updateDiscoveryProgress(busy);
    }));
    this._register(testProfileService.onDidChange(() => this.updateActions()));
  }
  static {
    __name(this, "TestingExplorerView");
  }
  viewModel;
  filterActionBar = this._register(new MutableDisposable());
  container;
  treeHeader;
  discoveryProgress = this._register(
    new MutableDisposable()
  );
  filter = this._register(
    new MutableDisposable()
  );
  filterFocusListener = this._register(
    new MutableDisposable()
  );
  dimensions = { width: 0, height: 0 };
  lastFocusState = 0 /* Input */;
  get focusedTreeElements() {
    return this.viewModel.tree.getFocus().filter(isDefined);
  }
  shouldShowWelcome() {
    return this.viewModel?.welcomeExperience === 1 /* ForWorkspace */;
  }
  focus() {
    super.focus();
    if (this.lastFocusState === 1 /* Tree */) {
      this.viewModel.tree.domFocus();
    } else {
      this.filter.value?.focus();
    }
  }
  /**
   * Gets include/exclude items in the tree, based either on visible tests
   * or a use selection.
   */
  getTreeIncludeExclude(withinItems, profile, filterToType = "visible") {
    const projection = this.viewModel.projection.value;
    if (!projection) {
      return { include: [], exclude: [] };
    }
    const include = /* @__PURE__ */ new Set();
    const exclude = [];
    const attempt = /* @__PURE__ */ __name((element, alreadyIncluded) => {
      if (!(element instanceof TestItemTreeElement) || !this.viewModel.tree.hasElement(element)) {
        return;
      }
      const inTree = this.viewModel.tree.getNode(element);
      if (!inTree.visible) {
        if (alreadyIncluded) {
          exclude.push(element.test);
        }
        return;
      }
      if (
        // If it's not already included...
        !alreadyIncluded && // And it can be run using the current profile (if any)
        (!profile || canUseProfileWithTest(profile, element.test)) && // And either it's a leaf node or most children are included, the  include it.
        (inTree.children.length === 0 || inTree.visibleChildrenCount * 2 >= inTree.children.length) && // And not if we're only showing a single of its children, since it
        // probably fans out later. (Worse case we'll directly include its single child)
        inTree.visibleChildrenCount !== 1
      ) {
        include.add(element.test);
        alreadyIncluded = true;
      }
      for (const child of element.children) {
        attempt(child, alreadyIncluded);
      }
    }, "attempt");
    if (filterToType === "selected") {
      const sel = this.viewModel.tree.getSelection().filter(isDefined);
      if (sel.length) {
        L: for (const node of sel) {
          if (node instanceof TestItemTreeElement) {
            for (let i = node; i; i = i.parent) {
              if (include.has(i.test)) {
                continue L;
              }
            }
            include.add(node.test);
            node.children.forEach((c) => attempt(c, true));
          }
        }
        return { include: [...include], exclude };
      }
    }
    for (const root of withinItems || this.testService.collection.rootItems) {
      const element = projection.getElementByTestId(root.item.extId);
      if (!element) {
        continue;
      }
      if (profile && !canUseProfileWithTest(profile, root)) {
        continue;
      }
      if (this.viewModel.tree.hasElement(element)) {
        attempt(element, false);
      } else {
        const visibleChildren = [...element.children].reduce(
          (acc, c) => this.viewModel.tree.hasElement(c) && this.viewModel.tree.getNode(c).visible ? acc + 1 : acc,
          0
        );
        if (element.children.size > 0 && visibleChildren * 2 >= element.children.size) {
          include.add(element.test);
          element.children.forEach((c) => attempt(c, true));
        } else {
          element.children.forEach((c) => attempt(c, false));
        }
      }
    }
    return { include: [...include], exclude };
  }
  render() {
    super.render();
    this._register(
      registerNavigableContainer({
        name: "testingExplorerView",
        focusNotifiers: [this],
        focusNextWidget: /* @__PURE__ */ __name(() => {
          if (!this.viewModel.tree.isDOMFocused()) {
            this.viewModel.tree.domFocus();
          }
        }, "focusNextWidget"),
        focusPreviousWidget: /* @__PURE__ */ __name(() => {
          if (this.viewModel.tree.isDOMFocused()) {
            this.filter.value?.focus();
          }
        }, "focusPreviousWidget")
      })
    );
  }
  /**
   * @override
   */
  renderBody(container) {
    super.renderBody(container);
    this.container = dom.append(container, dom.$(".test-explorer"));
    this.treeHeader = dom.append(
      this.container,
      dom.$(".test-explorer-header")
    );
    this.filterActionBar.value = this.createFilterActionBar();
    const messagesContainer = dom.append(
      this.treeHeader,
      dom.$(".result-summary-container")
    );
    this._register(
      this.instantiationService.createInstance(
        ResultSummaryView,
        messagesContainer
      )
    );
    const listContainer = dom.append(
      this.container,
      dom.$(".test-explorer-tree")
    );
    this.viewModel = this.instantiationService.createInstance(
      TestingExplorerViewModel,
      listContainer,
      this.onDidChangeBodyVisibility
    );
    this._register(
      this.viewModel.tree.onDidFocus(
        () => this.lastFocusState = 1 /* Tree */
      )
    );
    this._register(
      this.viewModel.onChangeWelcomeVisibility(
        () => this._onDidChangeViewWelcomeState.fire()
      )
    );
    this._register(this.viewModel);
    this._onDidChangeViewWelcomeState.fire();
  }
  /** @override  */
  getActionViewItem(action, options) {
    switch (action.id) {
      case TestCommandId.FilterAction:
        this.filter.value = this.instantiationService.createInstance(
          TestingExplorerFilter,
          action,
          options
        );
        this.filterFocusListener.value = this.filter.value.onDidFocus(
          () => this.lastFocusState = 0 /* Input */
        );
        return this.filter.value;
      case TestCommandId.RunSelectedAction:
        return this.getRunGroupDropdown(
          TestRunProfileBitset.Run,
          action,
          options
        );
      case TestCommandId.DebugSelectedAction:
        return this.getRunGroupDropdown(
          TestRunProfileBitset.Debug,
          action,
          options
        );
      default:
        return super.getActionViewItem(action, options);
    }
  }
  /** @inheritdoc */
  getTestConfigGroupActions(group) {
    const profileActions = [];
    let participatingGroups = 0;
    let hasConfigurable = false;
    const defaults = this.testProfileService.getGroupDefaultProfiles(group);
    for (const { profiles, controller } of this.testProfileService.all()) {
      let hasAdded = false;
      for (const profile of profiles) {
        if (profile.group !== group) {
          continue;
        }
        if (!hasAdded) {
          hasAdded = true;
          participatingGroups++;
          profileActions.push(
            new Action(
              `${controller.id}.$root`,
              controller.label.get(),
              void 0,
              false
            )
          );
        }
        hasConfigurable = hasConfigurable || profile.hasConfigurationHandler;
        profileActions.push(
          new Action(
            `${controller.id}.${profile.profileId}`,
            defaults.includes(profile) ? localize(
              "defaultTestProfile",
              "{0} (Default)",
              profile.label
            ) : profile.label,
            void 0,
            void 0,
            () => {
              const { include, exclude } = this.getTreeIncludeExclude(void 0, profile);
              this.testService.runResolvedTests({
                exclude: exclude.map((e) => e.item.extId),
                group: profile.group,
                targets: [
                  {
                    profileId: profile.profileId,
                    controllerId: profile.controllerId,
                    testIds: include.map(
                      (i) => i.item.extId
                    )
                  }
                ]
              });
            }
          )
        );
      }
    }
    const menuActions = [];
    const contextKeys = [];
    if (group === TestRunProfileBitset.Run) {
      contextKeys.push(["testing.profile.context.group", "run"]);
    }
    if (group === TestRunProfileBitset.Debug) {
      contextKeys.push(["testing.profile.context.group", "debug"]);
    }
    if (group === TestRunProfileBitset.Coverage) {
      contextKeys.push(["testing.profile.context.group", "coverage"]);
    }
    const key = this.contextKeyService.createOverlay(contextKeys);
    const menu = this.menuService.getMenuActions(
      MenuId.TestProfilesContext,
      key
    );
    createAndFillInContextMenuActions(menu, menuActions);
    const postActions = [];
    if (profileActions.length > 1) {
      postActions.push(
        new Action(
          "selectDefaultTestConfigurations",
          localize("selectDefaultConfigs", "Select Default Profile"),
          void 0,
          void 0,
          () => this.commandService.executeCommand(
            TestCommandId.SelectDefaultTestProfiles,
            group
          )
        )
      );
    }
    if (hasConfigurable) {
      postActions.push(
        new Action(
          "configureTestProfiles",
          localize(
            "configureTestProfiles",
            "Configure Test Profiles"
          ),
          void 0,
          void 0,
          () => this.commandService.executeCommand(
            TestCommandId.ConfigureTestProfilesAction,
            group
          )
        )
      );
    }
    return menuActions.length > 0 ? Separator.join(profileActions, menuActions, postActions) : Separator.join(profileActions, postActions);
  }
  /**
   * @override
   */
  saveState() {
    this.filter.value?.saveState();
    super.saveState();
  }
  getRunGroupDropdown(group, defaultAction, options) {
    const dropdownActions = this.getTestConfigGroupActions(group);
    if (dropdownActions.length < 2) {
      return super.getActionViewItem(defaultAction, options);
    }
    const primaryAction = this.instantiationService.createInstance(
      MenuItemAction,
      {
        id: defaultAction.id,
        title: defaultAction.label,
        icon: group === TestRunProfileBitset.Run ? icons.testingRunAllIcon : icons.testingDebugAllIcon
      },
      void 0,
      void 0,
      void 0,
      void 0
    );
    const dropdownAction = new Action(
      "selectRunConfig",
      "Select Configuration...",
      "codicon-chevron-down",
      true
    );
    return this.instantiationService.createInstance(
      DropdownWithPrimaryActionViewItem,
      primaryAction,
      dropdownAction,
      dropdownActions,
      "",
      this.contextMenuService,
      options
    );
  }
  createFilterActionBar() {
    const bar = new ActionBar(this.treeHeader, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => this.getActionViewItem(action, options), "actionViewItemProvider"),
      triggerKeys: { keyDown: false, keys: [] }
    });
    bar.push(new Action(TestCommandId.FilterAction));
    bar.getContainer().classList.add("testing-filter-action-bar");
    return bar;
  }
  updateDiscoveryProgress(busy) {
    if (!busy && this.discoveryProgress) {
      this.discoveryProgress.clear();
    } else if (busy && !this.discoveryProgress.value) {
      this.discoveryProgress.value = this.instantiationService.createInstance(UnmanagedProgress, {
        location: this.getProgressLocation()
      });
    }
  }
  /**
   * @override
   */
  layoutBody(height = this.dimensions.height, width = this.dimensions.width) {
    super.layoutBody(height, width);
    this.dimensions.height = height;
    this.dimensions.width = width;
    this.container.style.height = `${height}px`;
    this.viewModel?.layout(height - this.treeHeader.clientHeight, width);
    this.filter.value?.layout(width);
  }
};
TestingExplorerView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ITestService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, ITestProfileService),
  __decorateParam(13, ICommandService),
  __decorateParam(14, IMenuService)
], TestingExplorerView);
const SUMMARY_RENDER_INTERVAL = 200;
let ResultSummaryView = class extends Disposable {
  constructor(container, resultService, activityService, crService, configurationService, instantiationService, hoverService) {
    super();
    this.container = container;
    this.resultService = resultService;
    this.activityService = activityService;
    this.crService = crService;
    this.badgeType = configurationService.getValue(TestingConfigKeys.CountBadge);
    this._register(resultService.onResultsChanged(this.render, this));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TestingConfigKeys.CountBadge)) {
        this.badgeType = configurationService.getValue(TestingConfigKeys.CountBadge);
        this.render();
      }
    }));
    this.countHover = this._register(hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.elements.count, ""));
    const ab = this._register(new ActionBar(this.elements.rerun, {
      actionViewItemProvider: /* @__PURE__ */ __name((action, options) => createActionViewItem(instantiationService, action, options), "actionViewItemProvider")
    }));
    ab.push(instantiationService.createInstance(
      MenuItemAction,
      { ...new ReRunLastRun().desc, icon: icons.testingRerunIcon },
      { ...new DebugLastRun().desc, icon: icons.testingDebugIcon },
      {},
      void 0,
      void 0
    ), { icon: true, label: false });
    this.render();
  }
  static {
    __name(this, "ResultSummaryView");
  }
  elementsWereAttached = false;
  badgeType;
  lastBadge;
  countHover;
  badgeDisposable = this._register(new MutableDisposable());
  renderLoop = this._register(
    new RunOnceScheduler(() => this.render(), SUMMARY_RENDER_INTERVAL)
  );
  elements = dom.h("div.result-summary", [
    dom.h("div@status"),
    dom.h("div@count"),
    dom.h("div@count"),
    dom.h("span"),
    dom.h("duration@duration"),
    dom.h("a@rerun")
  ]);
  render() {
    const { results } = this.resultService;
    const { count, root, status, duration, rerun } = this.elements;
    if (!results.length) {
      if (this.elementsWereAttached) {
        root.remove();
        this.elementsWereAttached = false;
      }
      this.container.innerText = localize(
        "noResults",
        "No test results yet."
      );
      this.badgeDisposable.clear();
      return;
    }
    const live = results.filter((r) => !r.completedAt);
    let counts;
    if (live.length) {
      status.className = ThemeIcon.asClassName(spinningLoading);
      counts = collectTestStateCounts(true, live);
      this.renderLoop.schedule();
      const last = live[live.length - 1];
      duration.textContent = formatDuration(Date.now() - last.startedAt);
      rerun.style.display = "none";
    } else {
      const last = results[0];
      const dominantState = mapFindFirst(
        statesInOrder,
        (s) => last.counts[s] > 0 ? s : void 0
      );
      status.className = ThemeIcon.asClassName(
        icons.testingStatesToIcons.get(
          dominantState ?? TestResultState.Unset
        )
      );
      counts = collectTestStateCounts(false, [last]);
      duration.textContent = last instanceof LiveTestResult ? formatDuration(last.completedAt - last.startedAt) : "";
      rerun.style.display = "block";
    }
    count.textContent = `${counts.passed}/${counts.totalWillBeRun}`;
    this.countHover.update(getTestProgressText(counts));
    this.renderActivityBadge(counts);
    if (!this.elementsWereAttached) {
      dom.clearNode(this.container);
      this.container.appendChild(root);
      this.elementsWereAttached = true;
    }
  }
  renderActivityBadge(countSummary) {
    if (countSummary && this.badgeType !== TestingCountBadge.Off && countSummary[this.badgeType] !== 0) {
      if (this.lastBadge instanceof NumberBadge && this.lastBadge.number === countSummary[this.badgeType]) {
        return;
      }
      this.lastBadge = new NumberBadge(
        countSummary[this.badgeType],
        (num) => this.getLocalizedBadgeString(this.badgeType, num)
      );
    } else if (this.crService.isEnabled()) {
      if (this.lastBadge instanceof IconBadge && this.lastBadge.icon === icons.testingContinuousIsOn) {
        return;
      }
      this.lastBadge = new IconBadge(
        icons.testingContinuousIsOn,
        () => localize(
          "testingContinuousBadge",
          "Tests are being watched for changes"
        )
      );
    } else {
      if (!this.lastBadge) {
        return;
      }
      this.lastBadge = void 0;
    }
    this.badgeDisposable.value = this.lastBadge && this.activityService.showViewActivity(Testing.ExplorerViewId, {
      badge: this.lastBadge
    });
  }
  getLocalizedBadgeString(countBadgeType, count) {
    switch (countBadgeType) {
      case TestingCountBadge.Passed:
        return localize(
          "testingCountBadgePassed",
          "{0} passed tests",
          count
        );
      case TestingCountBadge.Skipped:
        return localize(
          "testingCountBadgeSkipped",
          "{0} skipped tests",
          count
        );
      default:
        return localize(
          "testingCountBadgeFailed",
          "{0} failed tests",
          count
        );
    }
  }
};
ResultSummaryView = __decorateClass([
  __decorateParam(1, ITestResultService),
  __decorateParam(2, IActivityService),
  __decorateParam(3, ITestingContinuousRunService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IHoverService)
], ResultSummaryView);
var WelcomeExperience = /* @__PURE__ */ ((WelcomeExperience2) => {
  WelcomeExperience2[WelcomeExperience2["None"] = 0] = "None";
  WelcomeExperience2[WelcomeExperience2["ForWorkspace"] = 1] = "ForWorkspace";
  WelcomeExperience2[WelcomeExperience2["ForDocument"] = 2] = "ForDocument";
  return WelcomeExperience2;
})(WelcomeExperience || {});
let TestingExplorerViewModel = class extends Disposable {
  constructor(listContainer, onDidChangeVisibility, configurationService, editorService, editorGroupsService, menuService, contextMenuService, testService, filterState, instantiationService, storageService, contextKeyService, testResults, peekOpener, testProfileService, crService, commandService) {
    super();
    this.menuService = menuService;
    this.contextMenuService = contextMenuService;
    this.testService = testService;
    this.filterState = filterState;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.testResults = testResults;
    this.peekOpener = peekOpener;
    this.testProfileService = testProfileService;
    this.crService = crService;
    this.hasPendingReveal = !!filterState.reveal.value;
    this.noTestForDocumentWidget = this._register(instantiationService.createInstance(NoTestsForDocumentWidget, listContainer));
    this._viewMode.set(this.storageService.get("testing.viewMode", StorageScope.WORKSPACE, TestExplorerViewMode.Tree));
    this._viewSorting.set(this.storageService.get("testing.viewSorting", StorageScope.WORKSPACE, TestExplorerViewSorting.ByLocation));
    this.reevaluateWelcomeState();
    this.filter = this.instantiationService.createInstance(TestsFilter, testService.collection);
    this.tree = instantiationService.createInstance(
      TestingObjectTree,
      "Test Explorer List",
      listContainer,
      new ListDelegate(),
      [
        instantiationService.createInstance(TestItemRenderer, this.actionRunner),
        instantiationService.createInstance(ErrorRenderer)
      ],
      {
        identityProvider: instantiationService.createInstance(IdentityProvider),
        hideTwistiesOfChildlessElements: false,
        sorter: instantiationService.createInstance(TreeSorter, this),
        keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
        accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
        filter: this.filter,
        findWidgetEnabled: false,
        openOnSingleClick: false
      }
    );
    const collapseStateSaver = this._register(new RunOnceScheduler(() => {
      const state = this.tree.getOptimizedViewState(this.lastViewState.get({}));
      const projection = this.projection.value;
      if (projection) {
        projection.lastState = state;
      }
    }, 3e3));
    this._register(this.tree.onDidChangeCollapseState((evt) => {
      if (evt.node.element instanceof TestItemTreeElement) {
        if (!evt.node.collapsed) {
          this.projection.value?.expandElement(evt.node.element, evt.deep ? Number.POSITIVE_INFINITY : 0);
        }
        collapseStateSaver.schedule();
      }
    }));
    this._register(this.crService.onDidChange((testId) => {
      if (testId) {
        const elem = this.projection.value?.getElementByTestId(testId);
        this.tree.resort(elem?.parent && this.tree.hasElement(elem.parent) ? elem.parent : null, false);
      }
    }));
    this._register(onDidChangeVisibility((visible) => {
      if (visible) {
        this.ensureProjection();
      }
    }));
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    this._register(Event.any(
      filterState.text.onDidChange,
      filterState.fuzzy.onDidChange,
      testService.excluded.onTestExclusionsChanged
    )(this.tree.refilter, this.tree));
    this._register(this.tree.onDidOpen((e) => {
      if (e.element instanceof TestItemTreeElement && !e.element.children.size && e.element.test.item.uri) {
        commandService.executeCommand("vscode.revealTest", e.element.test.item.extId);
      }
    }));
    this._register(this.tree);
    this._register(this.onChangeWelcomeVisibility((e) => {
      this.noTestForDocumentWidget.setVisible(e === 2 /* ForDocument */);
    }));
    this._register(dom.addStandardDisposableListener(this.tree.getHTMLElement(), "keydown", (evt) => {
      if (evt.equals(KeyCode.Enter)) {
        this.handleExecuteKeypress(evt);
      } else if (DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
        filterState.text.value = evt.browserEvent.key;
        filterState.focusInput();
      }
    }));
    this._register(filterState.reveal.onDidChange((id) => this.revealById(id, void 0, false)));
    this._register(onDidChangeVisibility((visible) => {
      if (visible) {
        filterState.focusInput();
      }
    }));
    this._register(this.tree.onDidChangeSelection((evt) => {
      if (dom.isMouseEvent(evt.browserEvent) && (evt.browserEvent.altKey || evt.browserEvent.shiftKey)) {
        return;
      }
      const selected = evt.elements[0];
      if (selected && evt.browserEvent && selected instanceof TestItemTreeElement && selected.children.size === 0 && selected.test.expand === TestItemExpandState.NotExpandable) {
        this.tryPeekError(selected);
      }
    }));
    let followRunningTests = getTestingConfiguration(configurationService, TestingConfigKeys.FollowRunningTest);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TestingConfigKeys.FollowRunningTest)) {
        followRunningTests = getTestingConfiguration(configurationService, TestingConfigKeys.FollowRunningTest);
      }
    }));
    let alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, TestingConfigKeys.AlwaysRevealTestOnStateChange);
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TestingConfigKeys.AlwaysRevealTestOnStateChange)) {
        alwaysRevealTestAfterStateChange = getTestingConfiguration(configurationService, TestingConfigKeys.AlwaysRevealTestOnStateChange);
      }
    }));
    this._register(testResults.onTestChanged((evt) => {
      if (!followRunningTests) {
        return;
      }
      if (evt.reason !== TestResultItemChangeReason.OwnStateChange) {
        return;
      }
      if (this.tree.selectionSize > 1) {
        return;
      }
      if (evt.item.ownComputedState !== TestResultState.Running && !(evt.previousState === TestResultState.Queued && isStateWithResult(evt.item.ownComputedState))) {
        return;
      }
      this.revealById(evt.item.item.extId, alwaysRevealTestAfterStateChange, false);
    }));
    this._register(testResults.onResultsChanged(() => {
      this.tree.resort(null);
    }));
    this._register(this.testProfileService.onDidChange(() => {
      this.tree.rerender();
    }));
    const allOpenEditorInputs = observableFromEvent(
      this,
      editorService.onDidEditorsChange,
      () => new Set(editorGroupsService.groups.flatMap((g) => g.editors).map((e) => e.resource).filter(isDefined))
    );
    const activeResource = observableFromEvent(this, editorService.onDidActiveEditorChange, () => {
      if (editorService.activeEditor instanceof DiffEditorInput) {
        return editorService.activeEditor.primary.resource;
      } else {
        return editorService.activeEditor?.resource;
      }
    });
    const filterText = observableFromEvent(this.filterState.text.onDidChange, () => this.filterState.text);
    this._register(autorun((reader) => {
      filterText.read(reader);
      if (this.filterState.isFilteringFor(TestFilterTerm.OpenedFiles)) {
        this.filter.filterToDocumentUri([...allOpenEditorInputs.read(reader)]);
      } else {
        this.filter.filterToDocumentUri([activeResource.read(reader)].filter(isDefined));
      }
      if (this.filterState.isFilteringFor(TestFilterTerm.CurrentDoc) || this.filterState.isFilteringFor(TestFilterTerm.OpenedFiles)) {
        this.tree.refilter();
      }
    }));
    this._register(this.storageService.onWillSaveState(({ reason }) => {
      if (reason === WillSaveStateReason.SHUTDOWN) {
        this.lastViewState.store(this.tree.getOptimizedViewState());
      }
    }));
  }
  static {
    __name(this, "TestingExplorerViewModel");
  }
  tree;
  filter;
  projection = this._register(
    new MutableDisposable()
  );
  revealTimeout = new MutableDisposable();
  _viewMode = TestingContextKeys.viewMode.bindTo(
    this.contextKeyService
  );
  _viewSorting = TestingContextKeys.viewSorting.bindTo(
    this.contextKeyService
  );
  welcomeVisibilityEmitter = new Emitter();
  actionRunner = new TestExplorerActionRunner(
    () => this.tree.getSelection().filter(isDefined)
  );
  lastViewState = this._register(
    new StoredValue(
      {
        key: "testing.treeState",
        scope: StorageScope.WORKSPACE,
        target: StorageTarget.MACHINE
      },
      this.storageService
    )
  );
  noTestForDocumentWidget;
  /**
   * Whether there's a reveal request which has not yet been delivered. This
   * can happen if the user asks to reveal before the test tree is loaded.
   * We check to see if the reveal request is present on each tree update,
   * and do it then if so.
   */
  hasPendingReveal = false;
  /**
   * Fires when the visibility of the placeholder state changes.
   */
  onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
  /**
   * Gets whether the welcome should be visible.
   */
  welcomeExperience = 0 /* None */;
  get viewMode() {
    return this._viewMode.get() ?? TestExplorerViewMode.Tree;
  }
  set viewMode(newMode) {
    if (newMode === this._viewMode.get()) {
      return;
    }
    this._viewMode.set(newMode);
    this.updatePreferredProjection();
    this.storageService.store(
      "testing.viewMode",
      newMode,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  get viewSorting() {
    return this._viewSorting.get() ?? TestExplorerViewSorting.ByStatus;
  }
  set viewSorting(newSorting) {
    if (newSorting === this._viewSorting.get()) {
      return;
    }
    this._viewSorting.set(newSorting);
    this.tree.resort(null);
    this.storageService.store(
      "testing.viewSorting",
      newSorting,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  /**
   * Re-layout the tree.
   */
  layout(height, width) {
    this.tree.layout(height, width);
  }
  /**
   * Tries to reveal by extension ID. Queues the request if the extension
   * ID is not currently available.
   */
  revealById(id, expand = true, focus = true) {
    if (!id) {
      this.hasPendingReveal = false;
      return;
    }
    const projection = this.ensureProjection();
    let expandToLevel = 0;
    const idPath = [...TestId.fromString(id).idsFromRoot()];
    for (let i = idPath.length - 1; i >= expandToLevel; i--) {
      const element = projection.getElementByTestId(idPath[i].toString());
      if (!element || !this.tree.hasElement(element)) {
        continue;
      }
      if (i < idPath.length - 1) {
        if (expand) {
          this.tree.expand(element);
          expandToLevel = i + 1;
          i = idPath.length - 1;
          continue;
        }
      }
      let focusTarget = element;
      for (let n = element; n instanceof TestItemTreeElement; n = n.parent) {
        if (n.test && this.testService.excluded.contains(n.test)) {
          this.filterState.toggleFilteringFor(
            TestFilterTerm.Hidden,
            true
          );
          break;
        }
        if (!expand && this.tree.hasElement(n) && this.tree.isCollapsed(n)) {
          focusTarget = n;
        }
      }
      this.filterState.reveal.value = void 0;
      this.hasPendingReveal = false;
      if (focus) {
        this.tree.domFocus();
      }
      if (this.tree.getRelativeTop(focusTarget) === null) {
        this.tree.reveal(focusTarget, 0.5);
      }
      this.revealTimeout.value = disposableTimeout(() => {
        this.tree.setFocus([focusTarget]);
        this.tree.setSelection([focusTarget]);
      }, 1);
      return;
    }
    this.hasPendingReveal = true;
  }
  /**
   * Collapse all items in the tree.
   */
  async collapseAll() {
    this.tree.collapseAll();
  }
  /**
   * Tries to peek the first test error, if the item is in a failed state.
   */
  tryPeekError(item) {
    const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
    return lookup && lookup[1].tasks.some((s) => isFailedState(s.state)) ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], {
      preserveFocus: true
    }) : false;
  }
  onContextMenu(evt) {
    const element = evt.element;
    if (!(element instanceof TestItemTreeElement)) {
      return;
    }
    const { actions } = getActionableElementActions(
      this.contextKeyService,
      this.menuService,
      this.testService,
      this.crService,
      this.testProfileService,
      element
    );
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => evt.anchor, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions.secondary, "getActions"),
      getActionsContext: /* @__PURE__ */ __name(() => element, "getActionsContext"),
      actionRunner: this.actionRunner
    });
  }
  handleExecuteKeypress(evt) {
    const focused = this.tree.getFocus();
    const selected = this.tree.getSelection();
    let targeted;
    if (focused.length === 1 && selected.includes(focused[0])) {
      evt.browserEvent?.preventDefault();
      targeted = selected;
    } else {
      targeted = focused;
    }
    const toRun = targeted.filter(
      (e) => e instanceof TestItemTreeElement
    );
    if (toRun.length) {
      this.testService.runTests({
        group: TestRunProfileBitset.Run,
        tests: toRun.map((t) => t.test)
      });
    }
  }
  reevaluateWelcomeState() {
    const shouldShowWelcome = this.testService.collection.busyProviders === 0 && testCollectionIsEmpty(this.testService.collection);
    const welcomeExperience = shouldShowWelcome ? this.filterState.isFilteringFor(TestFilterTerm.CurrentDoc) ? 2 /* ForDocument */ : 1 /* ForWorkspace */ : 0 /* None */;
    if (welcomeExperience !== this.welcomeExperience) {
      this.welcomeExperience = welcomeExperience;
      this.welcomeVisibilityEmitter.fire(welcomeExperience);
    }
  }
  ensureProjection() {
    return this.projection.value ?? this.updatePreferredProjection();
  }
  updatePreferredProjection() {
    this.projection.clear();
    const lastState = this.lastViewState.get({});
    if (this._viewMode.get() === TestExplorerViewMode.List) {
      this.projection.value = this.instantiationService.createInstance(
        ListProjection,
        lastState
      );
    } else {
      this.projection.value = this.instantiationService.createInstance(
        TreeProjection,
        lastState
      );
    }
    const scheduler = this._register(
      new RunOnceScheduler(() => this.applyProjectionChanges(), 200)
    );
    this.projection.value.onUpdate(() => {
      if (!scheduler.isScheduled()) {
        scheduler.schedule();
      }
    });
    this.applyProjectionChanges();
    return this.projection.value;
  }
  applyProjectionChanges() {
    this.reevaluateWelcomeState();
    this.projection.value?.applyTo(this.tree);
    this.tree.refilter();
    if (this.hasPendingReveal) {
      this.revealById(this.filterState.reveal.value);
    }
  }
  /**
   * Gets the selected tests from the tree.
   */
  getSelectedTests() {
    return this.tree.getSelection();
  }
};
TestingExplorerViewModel = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, ITestService),
  __decorateParam(8, ITestExplorerFilterState),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, ITestResultService),
  __decorateParam(13, ITestingPeekOpener),
  __decorateParam(14, ITestProfileService),
  __decorateParam(15, ITestingContinuousRunService),
  __decorateParam(16, ICommandService)
], TestingExplorerViewModel);
var FilterResult = /* @__PURE__ */ ((FilterResult2) => {
  FilterResult2[FilterResult2["Exclude"] = 0] = "Exclude";
  FilterResult2[FilterResult2["Inherit"] = 1] = "Inherit";
  FilterResult2[FilterResult2["Include"] = 2] = "Include";
  return FilterResult2;
})(FilterResult || {});
const hasNodeInOrParentOfUri = /* @__PURE__ */ __name((collection, ident, testUri, fromNode) => {
  const queue = [
    fromNode ? [fromNode] : collection.rootIds
  ];
  while (queue.length) {
    for (const id of queue.pop()) {
      const node = collection.getNodeById(id);
      if (!node) {
        continue;
      }
      if (!node.item.uri || !ident.extUri.isEqualOrParent(testUri, node.item.uri)) {
        continue;
      }
      if (node.item.range || node.expand === TestItemExpandState.Expandable) {
        return true;
      }
      queue.push(node.children);
    }
  }
  return false;
}, "hasNodeInOrParentOfUri");
let TestsFilter = class {
  constructor(collection, state, testService, uriIdentityService) {
    this.collection = collection;
    this.state = state;
    this.testService = testService;
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "TestsFilter");
  }
  documentUris = [];
  /**
   * @inheritdoc
   */
  filter(element) {
    if (element instanceof TestTreeErrorMessage) {
      return TreeVisibility.Visible;
    }
    if (element.test && !this.state.isFilteringFor(TestFilterTerm.Hidden) && this.testService.excluded.contains(element.test)) {
      return TreeVisibility.Hidden;
    }
    switch (Math.min(
      this.testFilterText(element),
      this.testLocation(element),
      this.testState(element),
      this.testTags(element)
    )) {
      case 0 /* Exclude */:
        return TreeVisibility.Hidden;
      case 2 /* Include */:
        return TreeVisibility.Visible;
      default:
        return TreeVisibility.Recurse;
    }
  }
  filterToDocumentUri(uris) {
    this.documentUris = [...uris];
  }
  testTags(element) {
    if (!this.state.includeTags.size && !this.state.excludeTags.size) {
      return 2 /* Include */;
    }
    return (this.state.includeTags.size ? element.test.item.tags.some((t) => this.state.includeTags.has(t)) : true) && element.test.item.tags.every((t) => !this.state.excludeTags.has(t)) ? 2 /* Include */ : 1 /* Inherit */;
  }
  testState(element) {
    if (this.state.isFilteringFor(TestFilterTerm.Failed)) {
      return isFailedState(element.state) ? 2 /* Include */ : 1 /* Inherit */;
    }
    if (this.state.isFilteringFor(TestFilterTerm.Executed)) {
      return element.state !== TestResultState.Unset ? 2 /* Include */ : 1 /* Inherit */;
    }
    return 2 /* Include */;
  }
  testLocation(element) {
    if (this.documentUris.length === 0) {
      return 2 /* Include */;
    }
    if (!this.state.isFilteringFor(TestFilterTerm.CurrentDoc) && !this.state.isFilteringFor(TestFilterTerm.OpenedFiles) || !(element instanceof TestItemTreeElement)) {
      return 2 /* Include */;
    }
    if (this.documentUris.some(
      (uri) => hasNodeInOrParentOfUri(
        this.collection,
        this.uriIdentityService,
        uri,
        element.test.item.extId
      )
    )) {
      return 2 /* Include */;
    }
    return 1 /* Inherit */;
  }
  testFilterText(element) {
    if (this.state.globList.length === 0) {
      return 2 /* Include */;
    }
    const fuzzy = this.state.fuzzy.value;
    for (let e = element; e; e = e.parent) {
      let included = this.state.globList[0].include === false ? 2 /* Include */ : 1 /* Inherit */;
      const data = e.test.item.label.toLowerCase();
      for (const { include, text } of this.state.globList) {
        if (fuzzy ? fuzzyContains(data, text) : data.includes(text)) {
          included = include ? 2 /* Include */ : 0 /* Exclude */;
        }
      }
      if (included !== 1 /* Inherit */) {
        return included;
      }
    }
    return 1 /* Inherit */;
  }
};
TestsFilter = __decorateClass([
  __decorateParam(1, ITestExplorerFilterState),
  __decorateParam(2, ITestService),
  __decorateParam(3, IUriIdentityService)
], TestsFilter);
class TreeSorter {
  constructor(viewModel) {
    this.viewModel = viewModel;
  }
  static {
    __name(this, "TreeSorter");
  }
  compare(a, b) {
    if (a instanceof TestTreeErrorMessage || b instanceof TestTreeErrorMessage) {
      return (a instanceof TestTreeErrorMessage ? -1 : 0) + (b instanceof TestTreeErrorMessage ? 1 : 0);
    }
    const durationDelta = (b.duration || 0) - (a.duration || 0);
    if (this.viewModel.viewSorting === TestExplorerViewSorting.ByDuration && durationDelta !== 0) {
      return durationDelta;
    }
    const stateDelta = cmpPriority(a.state, b.state);
    if (this.viewModel.viewSorting === TestExplorerViewSorting.ByStatus && stateDelta !== 0) {
      return stateDelta;
    }
    let inSameLocation = false;
    if (a instanceof TestItemTreeElement && b instanceof TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
      inSameLocation = true;
      const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
      if (delta !== 0) {
        return delta;
      }
    }
    const sa = a.test.item.sortText;
    const sb = b.test.item.sortText;
    return inSameLocation && !sa && !sb ? 0 : (sa || a.test.item.label).localeCompare(sb || b.test.item.label);
  }
}
let NoTestsForDocumentWidget = class extends Disposable {
  static {
    __name(this, "NoTestsForDocumentWidget");
  }
  el;
  constructor(container, filterState) {
    super();
    const el = this.el = dom.append(
      container,
      dom.$(".testing-no-test-placeholder")
    );
    const emptyParagraph = dom.append(el, dom.$("p"));
    emptyParagraph.innerText = localize(
      "testingNoTest",
      "No tests were found in this file."
    );
    const buttonLabel = localize(
      "testingFindExtension",
      "Show Workspace Tests"
    );
    const button = this._register(
      new Button(el, { title: buttonLabel, ...defaultButtonStyles })
    );
    button.label = buttonLabel;
    this._register(
      button.onDidClick(
        () => filterState.toggleFilteringFor(
          TestFilterTerm.CurrentDoc,
          false
        )
      )
    );
  }
  setVisible(isVisible) {
    this.el.classList.toggle("visible", isVisible);
  }
};
NoTestsForDocumentWidget = __decorateClass([
  __decorateParam(1, ITestExplorerFilterState)
], NoTestsForDocumentWidget);
class TestExplorerActionRunner extends ActionRunner {
  constructor(getSelectedTests) {
    super();
    this.getSelectedTests = getSelectedTests;
  }
  static {
    __name(this, "TestExplorerActionRunner");
  }
  async runAction(action, context) {
    if (!(action instanceof MenuItemAction)) {
      return super.runAction(action, context);
    }
    const selection = this.getSelectedTests();
    const contextIsSelected = selection.some((s) => s === context);
    const actualContext = contextIsSelected ? selection : [context];
    const actionable = actualContext.filter(
      (t) => t instanceof TestItemTreeElement
    );
    await action.run(...actionable);
  }
}
const getLabelForTestTreeElement = /* @__PURE__ */ __name((element) => {
  let label = labelForTestInState(
    element.description || element.test.item.label,
    element.state
  );
  if (element instanceof TestItemTreeElement) {
    if (element.duration !== void 0) {
      label = localize(
        {
          key: "testing.treeElementLabelDuration",
          comment: [
            "{0} is the original label in testing.treeElementLabel, {1} is a duration"
          ]
        },
        "{0}, in {1}",
        label,
        formatDuration(element.duration)
      );
    }
    if (element.retired) {
      label = localize(
        {
          key: "testing.treeElementLabelOutdated",
          comment: [
            "{0} is the original label in testing.treeElementLabel"
          ]
        },
        "{0}, outdated result",
        label
      );
    }
  }
  return label;
}, "getLabelForTestTreeElement");
class ListAccessibilityProvider {
  static {
    __name(this, "ListAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("testExplorer", "Test Explorer");
  }
  getAriaLabel(element) {
    return element instanceof TestTreeErrorMessage ? element.description : getLabelForTestTreeElement(element);
  }
}
class TreeKeyboardNavigationLabelProvider {
  static {
    __name(this, "TreeKeyboardNavigationLabelProvider");
  }
  getKeyboardNavigationLabel(element) {
    return element instanceof TestTreeErrorMessage ? element.message : element.test.item.label;
  }
}
class ListDelegate {
  static {
    __name(this, "ListDelegate");
  }
  getHeight(element) {
    return element instanceof TestTreeErrorMessage ? 17 + 10 : 22;
  }
  getTemplateId(element) {
    if (element instanceof TestTreeErrorMessage) {
      return ErrorRenderer.ID;
    }
    return TestItemRenderer.ID;
  }
}
class IdentityProvider {
  static {
    __name(this, "IdentityProvider");
  }
  getId(element) {
    return element.treeId;
  }
}
let ErrorRenderer = class {
  constructor(hoverService, instantionService) {
    this.hoverService = hoverService;
    this.renderer = instantionService.createInstance(MarkdownRenderer, {});
  }
  static {
    __name(this, "ErrorRenderer");
  }
  static ID = "error";
  renderer;
  get templateId() {
    return ErrorRenderer.ID;
  }
  renderTemplate(container) {
    const label = dom.append(container, dom.$(".error"));
    return { label, disposable: new DisposableStore() };
  }
  renderElement({ element }, _, data) {
    dom.clearNode(data.label);
    if (typeof element.message === "string") {
      data.label.innerText = element.message;
    } else {
      const result = this.renderer.render(element.message, {
        inline: true
      });
      data.label.appendChild(result.element);
    }
    data.disposable.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        data.label,
        element.description
      )
    );
  }
  disposeTemplate(data) {
    data.disposable.dispose();
  }
};
ErrorRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, IInstantiationService)
], ErrorRenderer);
let TestItemRenderer = class extends Disposable {
  constructor(actionRunner, menuService, testService, profiles, contextKeyService, instantiationService, crService, hoverService) {
    super();
    this.actionRunner = actionRunner;
    this.menuService = menuService;
    this.testService = testService;
    this.profiles = profiles;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.crService = crService;
    this.hoverService = hoverService;
  }
  static {
    __name(this, "TestItemRenderer");
  }
  static ID = "testItem";
  /**
   * @inheritdoc
   */
  templateId = TestItemRenderer.ID;
  /**
   * @inheritdoc
   */
  renderTemplate(container) {
    const wrapper = dom.append(container, dom.$(".test-item"));
    const icon = dom.append(wrapper, dom.$(".computed-state"));
    const label = dom.append(wrapper, dom.$(".label"));
    const disposable = new DisposableStore();
    dom.append(
      wrapper,
      dom.$(ThemeIcon.asCSSSelector(icons.testingHiddenIcon))
    );
    const actionBar = disposable.add(
      new ActionBar(wrapper, {
        actionRunner: this.actionRunner,
        actionViewItemProvider: /* @__PURE__ */ __name((action, options) => action instanceof MenuItemAction ? this.instantiationService.createInstance(
          MenuEntryActionViewItem,
          action,
          { hoverDelegate: options.hoverDelegate }
        ) : void 0, "actionViewItemProvider")
      })
    );
    disposable.add(
      this.crService.onDidChange((changed) => {
        const id = templateData.current?.test.item.extId;
        if (id && (!changed || changed === id || TestId.isChild(id, changed))) {
          this.fillActionBar(templateData.current, templateData);
        }
      })
    );
    const templateData = {
      wrapper,
      label,
      actionBar,
      icon,
      elementDisposable: new DisposableStore(),
      templateDisposable: disposable
    };
    return templateData;
  }
  /**
   * @inheritdoc
   */
  disposeTemplate(templateData) {
    templateData.templateDisposable.clear();
  }
  /**
   * @inheritdoc
   */
  disposeElement(_element, _, templateData) {
    templateData.elementDisposable.clear();
  }
  fillActionBar(element, data) {
    const { actions, contextOverlay } = getActionableElementActions(
      this.contextKeyService,
      this.menuService,
      this.testService,
      this.crService,
      this.profiles,
      element
    );
    const crSelf = !!contextOverlay.getContextKeyValue(
      TestingContextKeys.isContinuousModeOn.key
    );
    const crChild = !crSelf && this.crService.isEnabledForAChildOf(element.test.item.extId);
    data.actionBar.domNode.classList.toggle(
      "testing-is-continuous-run",
      crSelf || crChild
    );
    data.actionBar.clear();
    data.actionBar.context = element;
    data.actionBar.push(actions.primary, { icon: true, label: false });
  }
  /**
   * @inheritdoc
   */
  renderElement(node, _depth, data) {
    data.elementDisposable.clear();
    data.current = node.element;
    this.fillActionBar(node.element, data);
    data.elementDisposable.add(
      node.element.onChange(() => this._renderElement(node, data))
    );
    this._renderElement(node, data);
  }
  _renderElement(node, data) {
    const testHidden = this.testService.excluded.contains(
      node.element.test
    );
    data.wrapper.classList.toggle("test-is-hidden", testHidden);
    const icon = icons.testingStatesToIcons.get(
      node.element.test.expand === TestItemExpandState.BusyExpanding || node.element.test.item.busy ? TestResultState.Running : node.element.state
    );
    data.icon.className = "computed-state " + (icon ? ThemeIcon.asClassName(icon) : "");
    if (node.element.retired) {
      data.icon.className += " retired";
    }
    data.elementDisposable.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        data.label,
        getLabelForTestTreeElement(node.element)
      )
    );
    if (node.element.test.item.label.trim()) {
      dom.reset(
        data.label,
        ...renderLabelWithIcons(node.element.test.item.label)
      );
    } else {
      data.label.textContent = String.fromCharCode(160);
    }
    let description = node.element.description;
    if (node.element.duration !== void 0) {
      description = description ? `${description}: ${formatDuration(node.element.duration)}` : formatDuration(node.element.duration);
    }
    if (description) {
      dom.append(
        data.label,
        dom.$("span.test-label-description", {}, description)
      );
    }
  }
};
TestItemRenderer = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, ITestService),
  __decorateParam(3, ITestProfileService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ITestingContinuousRunService),
  __decorateParam(7, IHoverService)
], TestItemRenderer);
const formatDuration = /* @__PURE__ */ __name((ms) => {
  if (ms < 10) {
    return `${ms.toFixed(1)}ms`;
  }
  if (ms < 1e3) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1e3).toFixed(1)}s`;
}, "formatDuration");
const getActionableElementActions = /* @__PURE__ */ __name((contextKeyService, menuService, testService, crService, profiles, element) => {
  const test = element instanceof TestItemTreeElement ? element.test : void 0;
  const contextKeys = getTestItemContextOverlay(
    test,
    test ? profiles.capabilitiesForTest(test.item) : 0
  );
  contextKeys.push(["view", Testing.ExplorerViewId]);
  if (test) {
    const ctrl = testService.getTestController(test.controllerId);
    const supportsCr = !!ctrl && profiles.getControllerProfiles(ctrl.id).some((p) => p.supportsContinuousRun);
    contextKeys.push(
      [
        TestingContextKeys.canRefreshTests.key,
        ctrl && !!(ctrl.capabilities.get() & TestControllerCapability.Refresh) && TestId.isRoot(test.item.extId)
      ],
      [
        TestingContextKeys.testItemIsHidden.key,
        testService.excluded.contains(test)
      ],
      [
        TestingContextKeys.isContinuousModeOn.key,
        supportsCr && crService.isSpecificallyEnabledFor(test.item.extId)
      ],
      [
        TestingContextKeys.isParentRunningContinuously.key,
        supportsCr && crService.isEnabledForAParentOf(test.item.extId)
      ],
      [TestingContextKeys.supportsContinuousRun.key, supportsCr]
    );
  }
  const contextOverlay = contextKeyService.createOverlay(contextKeys);
  const menu = menuService.getMenuActions(MenuId.TestItem, contextOverlay, {
    shouldForwardArgs: true
  });
  const primary = [];
  const secondary = [];
  const result = { primary, secondary };
  createAndFillInActionBarActions(menu, result, "inline");
  return { actions: result, contextOverlay };
}, "getActionableElementActions");
registerThemingParticipant((theme, collector) => {
  if (theme.type === "dark") {
    const foregroundColor = theme.getColor(foreground);
    if (foregroundColor) {
      const fgWithOpacity = new Color(
        new RGBA(
          foregroundColor.rgba.r,
          foregroundColor.rgba.g,
          foregroundColor.rgba.b,
          0.65
        )
      );
      collector.addRule(
        `.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`
      );
    }
  }
});
export {
  TestingExplorerView
};
//# sourceMappingURL=testingExplorerView.js.map
