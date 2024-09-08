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
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { MessageType } from "../../../../base/browser/ui/inputbox/inputBox.js";
import {
  ObjectTreeElementCollapseState
} from "../../../../base/browser/ui/tree/tree.js";
import { Delayer, RunOnceScheduler } from "../../../../base/common/async.js";
import * as errors from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import * as network from "../../../../base/common/network.js";
import * as env from "../../../../base/common/platform.js";
import * as strings from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import "./media/searchview.css";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import {
  getCodeEditor,
  isCodeEditor,
  isDiffEditor
} from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import { CommonFindController } from "../../../../editor/contrib/find/browser/findController.js";
import { MultiCursorSelectionController } from "../../../../editor/contrib/multicursor/browser/multicursor.js";
import * as nls from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  IContextMenuService,
  IContextViewService
} from "../../../../platform/contextview/browser/contextView.js";
import {
  IDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import {
  FileChangeType,
  IFileService
} from "../../../../platform/files/common/files.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  WorkbenchCompressibleObjectTree,
  getSelectionKeyboardEvent
} from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import {
  IOpenerService,
  withSelection
} from "../../../../platform/opener/common/opener.js";
import {
  IProgressService
} from "../../../../platform/progress/common/progress.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  defaultInputBoxStyles,
  defaultToggleStyles
} from "../../../../platform/theme/browser/defaultStyles.js";
import {
  IThemeService
} from "../../../../platform/theme/common/themeService.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import {
  OpenFileFolderAction,
  OpenFolderAction
} from "../../../browser/actions/workspaceActions.js";
import { ResourceListDnDHandler } from "../../../browser/dnd.js";
import { ResourceLabels } from "../../../browser/labels.js";
import {
  ViewPane
} from "../../../browser/parts/views/viewPane.js";
import { Memento } from "../../../common/memento.js";
import { IViewDescriptorService } from "../../../common/views.js";
import {
  ACTIVE_GROUP,
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import {
  IPreferencesService
} from "../../../services/preferences/common/preferences.js";
import {
  QueryBuilder
} from "../../../services/search/common/queryBuilder.js";
import {
  QueryType,
  SearchCompletionExitCode,
  SearchSortOrder,
  TextSearchCompleteMessageType,
  ViewMode
} from "../../../services/search/common/search.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { NotebookEditor } from "../../notebook/browser/notebookEditor.js";
import { INotebookService } from "../../notebook/common/notebookService.js";
import { createEditorFromSearchResult } from "../../searchEditor/browser/searchEditorActions.js";
import * as Constants from "../common/constants.js";
import {
  SearchStateKey,
  SearchUIState,
  getOutOfWorkspaceEditorResources
} from "../common/search.js";
import {
  ISearchHistoryService,
  SearchHistoryService
} from "../common/searchHistoryService.js";
import {
  ExcludePatternInputWidget,
  IncludePatternInputWidget
} from "./patternInputWidget.js";
import { IReplaceService } from "./replace.js";
import { appendKeyBindingLabel } from "./searchActionsBase.js";
import { searchDetailsIcon } from "./searchIcons.js";
import { renderSearchMessage } from "./searchMessage.js";
import {
  FileMatch,
  FolderMatch,
  FolderMatchWithResource,
  ISearchViewModelWorkbenchService,
  Match,
  MatchInNotebook,
  SearchModelLocation,
  SearchResult,
  searchMatchComparer
} from "./searchModel.js";
import {
  FileMatchRenderer,
  FolderMatchRenderer,
  MatchRenderer,
  SearchAccessibilityProvider,
  SearchDelegate
} from "./searchResultsView.js";
import { SearchWidget } from "./searchWidget.js";
const $ = dom.$;
var SearchViewPosition = /* @__PURE__ */ ((SearchViewPosition2) => {
  SearchViewPosition2[SearchViewPosition2["SideBar"] = 0] = "SideBar";
  SearchViewPosition2[SearchViewPosition2["Panel"] = 1] = "Panel";
  return SearchViewPosition2;
})(SearchViewPosition || {});
const SEARCH_CANCELLED_MESSAGE = nls.localize(
  "searchCanceled",
  "Search was canceled before any results could be found - "
);
const DEBOUNCE_DELAY = 75;
let SearchView = class extends ViewPane {
  constructor(options, fileService, editorService, codeEditorService, progressService, notificationService, dialogService, commandService, contextViewService, instantiationService, viewDescriptorService, configurationService, contextService, searchViewModelWorkbenchService, contextKeyService, replaceService, textFileService, preferencesService, themeService, searchHistoryService, contextMenuService, accessibilityService, keybindingService, storageService, openerService, telemetryService, hoverService, notebookService, logService, accessibilitySignalService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this.fileService = fileService;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this.progressService = progressService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.contextViewService = contextViewService;
    this.contextService = contextService;
    this.searchViewModelWorkbenchService = searchViewModelWorkbenchService;
    this.replaceService = replaceService;
    this.textFileService = textFileService;
    this.preferencesService = preferencesService;
    this.searchHistoryService = searchHistoryService;
    this.accessibilityService = accessibilityService;
    this.storageService = storageService;
    this.notebookService = notebookService;
    this.logService = logService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.container = dom.$(".search-view");
    this.viewletVisible = Constants.SearchContext.SearchViewVisibleKey.bindTo(this.contextKeyService);
    this.firstMatchFocused = Constants.SearchContext.FirstMatchFocusKey.bindTo(this.contextKeyService);
    this.fileMatchOrMatchFocused = Constants.SearchContext.FileMatchOrMatchFocusKey.bindTo(this.contextKeyService);
    this.fileMatchOrFolderMatchFocus = Constants.SearchContext.FileMatchOrFolderMatchFocusKey.bindTo(this.contextKeyService);
    this.fileMatchOrFolderMatchWithResourceFocus = Constants.SearchContext.FileMatchOrFolderMatchWithResourceFocusKey.bindTo(this.contextKeyService);
    this.fileMatchFocused = Constants.SearchContext.FileFocusKey.bindTo(this.contextKeyService);
    this.folderMatchFocused = Constants.SearchContext.FolderFocusKey.bindTo(this.contextKeyService);
    this.folderMatchWithResourceFocused = Constants.SearchContext.ResourceFolderFocusKey.bindTo(this.contextKeyService);
    this.hasSearchResultsKey = Constants.SearchContext.HasSearchResults.bindTo(this.contextKeyService);
    this.matchFocused = Constants.SearchContext.MatchFocusKey.bindTo(this.contextKeyService);
    this.searchStateKey = SearchStateKey.bindTo(this.contextKeyService);
    this.hasSearchPatternKey = Constants.SearchContext.ViewHasSearchPatternKey.bindTo(this.contextKeyService);
    this.hasReplacePatternKey = Constants.SearchContext.ViewHasReplacePatternKey.bindTo(this.contextKeyService);
    this.hasFilePatternKey = Constants.SearchContext.ViewHasFilePatternKey.bindTo(this.contextKeyService);
    this.hasSomeCollapsibleResultKey = Constants.SearchContext.ViewHasSomeCollapsibleKey.bindTo(this.contextKeyService);
    this.treeViewKey = Constants.SearchContext.InTreeViewKey.bindTo(this.contextKeyService);
    this.aiResultsVisibleKey = Constants.SearchContext.AIResultsVisibleKey.bindTo(this.contextKeyService);
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      const keys = Constants.SearchContext.hasAIResultProvider.keys();
      if (e.affectsSome(new Set(keys))) {
        this.refreshHasAISetting();
      }
    }));
    this.contextKeyService = this._register(this.contextKeyService.createScoped(this.container));
    Constants.SearchContext.SearchViewFocusedKey.bindTo(this.contextKeyService).set(true);
    this.inputBoxFocused = Constants.SearchContext.InputBoxFocusedKey.bindTo(this.contextKeyService);
    this.inputPatternIncludesFocused = Constants.SearchContext.PatternIncludesFocusedKey.bindTo(this.contextKeyService);
    this.inputPatternExclusionsFocused = Constants.SearchContext.PatternExcludesFocusedKey.bindTo(this.contextKeyService);
    this.isEditableItem = Constants.SearchContext.IsEditableItemKey.bindTo(this.contextKeyService);
    this.instantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, this.contextKeyService])
    ));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("search.sortOrder")) {
        if (this.searchConfig.sortOrder === SearchSortOrder.Modified) {
          this.removeFileStats();
        }
        this.refreshTree();
      } else if (e.affectsConfiguration("search.aiResults")) {
        this.refreshHasAISetting();
      }
    }));
    this.viewModel = this.searchViewModelWorkbenchService.searchModel;
    this.queryBuilder = this.instantiationService.createInstance(QueryBuilder);
    this.memento = new Memento(this.id, storageService);
    this.viewletState = this.memento.getMemento(StorageScope.WORKSPACE, StorageTarget.MACHINE);
    this._register(this.fileService.onDidFilesChange((e) => this.onFilesChanged(e)));
    this._register(this.textFileService.untitled.onWillDispose((model) => this.onUntitledDidDispose(model.resource)));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.onDidChangeWorkbenchState()));
    this._register(this.searchHistoryService.onDidClearHistory(() => this.clearHistory()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationUpdated(e)));
    this.delayedRefresh = this._register(new Delayer(250));
    this.addToSearchHistoryDelayer = this._register(new Delayer(2e3));
    this.toggleCollapseStateDelayer = this._register(new Delayer(100));
    this.triggerQueryDelayer = this._register(new Delayer(0));
    this.treeAccessibilityProvider = this.instantiationService.createInstance(SearchAccessibilityProvider, this);
    this.isTreeLayoutViewVisible = this.viewletState["view.treeLayout"] ?? this.searchConfig.defaultViewMode === ViewMode.Tree;
    this._refreshResultsScheduler = this._register(new RunOnceScheduler(this._updateResults.bind(this), 80));
    this._register(this.storageService.onWillSaveState(() => {
      this._saveSearchHistoryService();
    }));
    this._register(this.storageService.onDidChangeValue(StorageScope.WORKSPACE, SearchHistoryService.SEARCH_HISTORY_KEY, this._register(new DisposableStore()))(() => {
      const restoredHistory = this.searchHistoryService.load();
      if (restoredHistory.include) {
        this.inputPatternIncludes.prependHistory(restoredHistory.include);
      }
      if (restoredHistory.exclude) {
        this.inputPatternExcludes.prependHistory(restoredHistory.exclude);
      }
      if (restoredHistory.search) {
        this.searchWidget.prependSearchHistory(restoredHistory.search);
      }
      if (restoredHistory.replace) {
        this.searchWidget.prependReplaceHistory(restoredHistory.replace);
      }
    }));
    this.changedWhileHidden = this.hasSearchResults();
  }
  static ACTIONS_RIGHT_CLASS_NAME = "actions-right";
  isDisposed = false;
  container;
  queryBuilder;
  viewModel;
  memento;
  viewletVisible;
  inputBoxFocused;
  inputPatternIncludesFocused;
  inputPatternExclusionsFocused;
  firstMatchFocused;
  fileMatchOrMatchFocused;
  fileMatchOrFolderMatchFocus;
  fileMatchOrFolderMatchWithResourceFocus;
  fileMatchFocused;
  folderMatchFocused;
  folderMatchWithResourceFocused;
  matchFocused;
  isEditableItem;
  hasSearchResultsKey;
  lastFocusState = "input";
  searchStateKey;
  hasSearchPatternKey;
  hasReplacePatternKey;
  hasFilePatternKey;
  hasSomeCollapsibleResultKey;
  tree;
  treeLabels;
  viewletState;
  messagesElement;
  messageDisposables = new DisposableStore();
  searchWidgetsContainerElement;
  searchWidget;
  size;
  queryDetails;
  toggleQueryDetailsButton;
  inputPatternExcludes;
  inputPatternIncludes;
  resultsElement;
  currentSelectedFileMatch;
  delayedRefresh;
  changedWhileHidden;
  searchWithoutFolderMessageElement;
  currentSearchQ = Promise.resolve();
  addToSearchHistoryDelayer;
  toggleCollapseStateDelayer;
  triggerQueryDelayer;
  pauseSearching = false;
  treeAccessibilityProvider;
  treeViewKey;
  aiResultsVisibleKey;
  _visibleMatches = 0;
  _refreshResultsScheduler;
  _onSearchResultChangedDisposable;
  _stashedQueryDetailsVisibility = void 0;
  _stashedReplaceVisibility = void 0;
  get isTreeLayoutViewVisible() {
    return this.treeViewKey.get() ?? false;
  }
  set isTreeLayoutViewVisible(visible) {
    this.treeViewKey.set(visible);
  }
  get aiResultsVisible() {
    return this.aiResultsVisibleKey.get() ?? false;
  }
  set aiResultsVisible(visible) {
    this.aiResultsVisibleKey.set(visible);
  }
  setTreeView(visible) {
    if (visible === this.isTreeLayoutViewVisible) {
      return;
    }
    this.isTreeLayoutViewVisible = visible;
    this.updateIndentStyles(this.themeService.getFileIconTheme());
    this.refreshTree();
  }
  async setAIResultsVisible(visible) {
    if (visible === this.aiResultsVisible) {
      return;
    }
    if (visible) {
      this._stashedQueryDetailsVisibility = this._queryDetailsHidden();
      this._stashedReplaceVisibility = this.searchWidget.isReplaceShown();
      this.searchWidget.toggleReplace(false);
      this.toggleQueryDetailsButton.style.display = "none";
      this.searchWidget.replaceButtonVisibility = false;
      this.toggleQueryDetails(void 0, false);
    } else {
      this.toggleQueryDetailsButton.style.display = "";
      this.searchWidget.replaceButtonVisibility = true;
      if (this._stashedReplaceVisibility) {
        this.searchWidget.toggleReplace(this._stashedReplaceVisibility);
      }
      if (this._stashedQueryDetailsVisibility) {
        this.toggleQueryDetails(
          void 0,
          this._stashedQueryDetailsVisibility
        );
      }
    }
    this.aiResultsVisible = visible;
    if (this.viewModel.searchResult.isEmpty()) {
      return;
    }
    this.model.cancelAISearch();
    if (visible) {
      await this.model.addAIResults();
    }
    this.onSearchResultsChanged();
    this.onSearchComplete(
      () => {
      },
      void 0,
      void 0,
      this.viewModel.searchResult.getCachedSearchComplete(visible)
    );
  }
  get state() {
    return this.searchStateKey.get() ?? SearchUIState.Idle;
  }
  set state(v) {
    this.searchStateKey.set(v);
  }
  getContainer() {
    return this.container;
  }
  get searchResult() {
    return this.viewModel && this.viewModel.searchResult;
  }
  get model() {
    return this.viewModel;
  }
  refreshHasAISetting() {
    const val = this.shouldShowAIButton();
    if (val && this.searchWidget.searchInput) {
      this.searchWidget.searchInput.sparkleVisible = val;
    }
  }
  onDidChangeWorkbenchState() {
    if (this.contextService.getWorkbenchState() !== WorkbenchState.EMPTY && this.searchWithoutFolderMessageElement) {
      dom.hide(this.searchWithoutFolderMessageElement);
    }
  }
  refreshInputs() {
    this.pauseSearching = true;
    this.searchWidget.setValue(
      this.viewModel.searchResult.query?.contentPattern.pattern ?? ""
    );
    this.searchWidget.setReplaceAllActionState(false);
    this.searchWidget.toggleReplace(true);
    this.inputPatternIncludes.setOnlySearchInOpenEditors(
      this.viewModel.searchResult.query?.onlyOpenEditors || false
    );
    this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(
      !this.viewModel.searchResult.query?.userDisabledExcludesAndIgnoreFiles || true
    );
    this.searchIncludePattern.setValue("");
    this.searchExcludePattern.setValue("");
    this.pauseSearching = false;
  }
  async replaceSearchModel(searchModel, asyncResults) {
    let progressComplete;
    this.progressService.withProgress(
      { location: this.getProgressLocation(), delay: 0 },
      (_progress) => {
        return new Promise(
          (resolve) => progressComplete = resolve
        );
      }
    );
    const slowTimer = setTimeout(() => {
      this.state = SearchUIState.SlowSearch;
    }, 2e3);
    this._refreshResultsScheduler.schedule();
    searchModel.location = SearchModelLocation.PANEL;
    searchModel.replaceActive = this.viewModel.isReplaceActive();
    searchModel.replaceString = this.searchWidget.getReplaceValue();
    this._onSearchResultChangedDisposable?.dispose();
    this._onSearchResultChangedDisposable = this._register(
      searchModel.onSearchResultChanged(
        (event) => this.onSearchResultsChanged(event)
      )
    );
    this.searchViewModelWorkbenchService.searchModel = searchModel;
    this.viewModel = searchModel;
    this.onSearchResultsChanged();
    this.refreshInputs();
    asyncResults.then(
      (complete) => {
        clearTimeout(slowTimer);
        this.onSearchComplete(
          progressComplete,
          void 0,
          void 0,
          complete
        );
      },
      (e) => {
        clearTimeout(slowTimer);
        this.onSearchError(e, progressComplete, void 0, void 0);
      }
    );
    const collapseResults = this.searchConfig.collapseResults;
    if (collapseResults !== "alwaysCollapse" && this.viewModel.searchResult.matches(this.aiResultsVisible).length === 1) {
      const onlyMatch = this.viewModel.searchResult.matches(
        this.aiResultsVisible
      )[0];
      if (onlyMatch.count() < 50) {
        this.tree.expand(onlyMatch);
      }
    }
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.container = dom.append(parent, dom.$(".search-view"));
    this.searchWidgetsContainerElement = dom.append(
      this.container,
      $(".search-widgets-container")
    );
    this.createSearchWidget(this.searchWidgetsContainerElement);
    this.refreshHasAISetting();
    const history = this.searchHistoryService.load();
    const filePatterns = this.viewletState["query.filePatterns"] || "";
    const patternExclusions = this.viewletState["query.folderExclusions"] || "";
    const patternExclusionsHistory = history.exclude || [];
    const patternIncludes = this.viewletState["query.folderIncludes"] || "";
    const patternIncludesHistory = history.include || [];
    const onlyOpenEditors = this.viewletState["query.onlyOpenEditors"] || false;
    const queryDetailsExpanded = this.viewletState["query.queryDetailsExpanded"] || "";
    const useExcludesAndIgnoreFiles = typeof this.viewletState["query.useExcludesAndIgnoreFiles"] === "boolean" ? this.viewletState["query.useExcludesAndIgnoreFiles"] : true;
    this.queryDetails = dom.append(
      this.searchWidgetsContainerElement,
      $(".query-details")
    );
    const toggleQueryDetailsLabel = nls.localize(
      "moreSearch",
      "Toggle Search Details"
    );
    this.toggleQueryDetailsButton = dom.append(
      this.queryDetails,
      $(".more" + ThemeIcon.asCSSSelector(searchDetailsIcon), {
        tabindex: 0,
        role: "button",
        "aria-label": toggleQueryDetailsLabel
      })
    );
    this._register(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("element"),
        this.toggleQueryDetailsButton,
        toggleQueryDetailsLabel
      )
    );
    this._register(
      dom.addDisposableListener(
        this.toggleQueryDetailsButton,
        dom.EventType.CLICK,
        (e) => {
          dom.EventHelper.stop(e);
          this.toggleQueryDetails(
            !this.accessibilityService.isScreenReaderOptimized()
          );
        }
      )
    );
    this._register(
      dom.addDisposableListener(
        this.toggleQueryDetailsButton,
        dom.EventType.KEY_UP,
        (e) => {
          const event = new StandardKeyboardEvent(e);
          if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
            dom.EventHelper.stop(e);
            this.toggleQueryDetails(false);
          }
        }
      )
    );
    this._register(
      dom.addDisposableListener(
        this.toggleQueryDetailsButton,
        dom.EventType.KEY_DOWN,
        (e) => {
          const event = new StandardKeyboardEvent(e);
          if (event.equals(KeyMod.Shift | KeyCode.Tab)) {
            if (this.searchWidget.isReplaceActive()) {
              this.searchWidget.focusReplaceAllAction();
            } else {
              this.searchWidget.isReplaceShown() ? this.searchWidget.replaceInput?.focusOnPreserve() : this.searchWidget.focusRegexAction();
            }
            dom.EventHelper.stop(e);
          }
        }
      )
    );
    const folderIncludesList = dom.append(
      this.queryDetails,
      $(".file-types.includes")
    );
    const filesToIncludeTitle = nls.localize(
      "searchScope.includes",
      "files to include"
    );
    dom.append(folderIncludesList, $("h4", void 0, filesToIncludeTitle));
    this.inputPatternIncludes = this._register(
      this.instantiationService.createInstance(
        IncludePatternInputWidget,
        folderIncludesList,
        this.contextViewService,
        {
          ariaLabel: filesToIncludeTitle,
          placeholder: nls.localize(
            "placeholder.includes",
            "e.g. *.ts, src/**/include"
          ),
          showPlaceholderOnFocus: true,
          history: patternIncludesHistory,
          inputBoxStyles: defaultInputBoxStyles
        }
      )
    );
    this.inputPatternIncludes.setValue(patternIncludes);
    this.inputPatternIncludes.setOnlySearchInOpenEditors(onlyOpenEditors);
    this._register(
      this.inputPatternIncludes.onCancel(() => this.cancelSearch(false))
    );
    this._register(
      this.inputPatternIncludes.onChangeSearchInEditorsBox(
        () => this.triggerQueryChange()
      )
    );
    this.trackInputBox(
      this.inputPatternIncludes.inputFocusTracker,
      this.inputPatternIncludesFocused
    );
    const excludesList = dom.append(
      this.queryDetails,
      $(".file-types.excludes")
    );
    const excludesTitle = nls.localize(
      "searchScope.excludes",
      "files to exclude"
    );
    dom.append(excludesList, $("h4", void 0, excludesTitle));
    this.inputPatternExcludes = this._register(
      this.instantiationService.createInstance(
        ExcludePatternInputWidget,
        excludesList,
        this.contextViewService,
        {
          ariaLabel: excludesTitle,
          placeholder: nls.localize(
            "placeholder.excludes",
            "e.g. *.ts, src/**/exclude"
          ),
          showPlaceholderOnFocus: true,
          history: patternExclusionsHistory,
          inputBoxStyles: defaultInputBoxStyles
        }
      )
    );
    this.inputPatternExcludes.setValue(patternExclusions);
    this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(
      useExcludesAndIgnoreFiles
    );
    this._register(
      this.inputPatternExcludes.onCancel(() => this.cancelSearch(false))
    );
    this._register(
      this.inputPatternExcludes.onChangeIgnoreBox(
        () => this.triggerQueryChange()
      )
    );
    this.trackInputBox(
      this.inputPatternExcludes.inputFocusTracker,
      this.inputPatternExclusionsFocused
    );
    const updateHasFilePatternKey = () => this.hasFilePatternKey.set(
      this.inputPatternIncludes.getValue().length > 0 || this.inputPatternExcludes.getValue().length > 0
    );
    updateHasFilePatternKey();
    const onFilePatternSubmit = (triggeredOnType) => {
      this.triggerQueryChange({
        triggeredOnType,
        delay: this.searchConfig.searchOnTypeDebouncePeriod
      });
      if (triggeredOnType) {
        updateHasFilePatternKey();
      }
    };
    this._register(this.inputPatternIncludes.onSubmit(onFilePatternSubmit));
    this._register(this.inputPatternExcludes.onSubmit(onFilePatternSubmit));
    this.messagesElement = dom.append(
      this.container,
      $(".messages.text-search-provider-messages")
    );
    if (this.contextService.getWorkbenchState() === WorkbenchState.EMPTY) {
      this.showSearchWithoutFolderMessage();
    }
    this.createSearchResultsView(this.container);
    if (filePatterns !== "" || patternExclusions !== "" || patternIncludes !== "" || queryDetailsExpanded !== "" || !useExcludesAndIgnoreFiles) {
      this.toggleQueryDetails(true, true, true);
    }
    this._onSearchResultChangedDisposable = this._register(
      this.viewModel.onSearchResultChanged(
        (event) => this.onSearchResultsChanged(event)
      )
    );
    this._register(
      this.onDidChangeBodyVisibility(
        (visible) => this.onVisibilityChanged(visible)
      )
    );
    this.updateIndentStyles(this.themeService.getFileIconTheme());
    this._register(
      this.themeService.onDidFileIconThemeChange(
        this.updateIndentStyles,
        this
      )
    );
  }
  updateIndentStyles(theme) {
    this.resultsElement.classList.toggle(
      "hide-arrows",
      this.isTreeLayoutViewVisible && theme.hidesExplorerArrows
    );
  }
  onVisibilityChanged(visible) {
    this.viewletVisible.set(visible);
    if (visible) {
      if (this.changedWhileHidden) {
        this.refreshAndUpdateCount();
        this.changedWhileHidden = false;
      }
    } else {
      this.lastFocusState = "input";
    }
    this.viewModel?.searchResult.toggleHighlights(visible);
  }
  get searchAndReplaceWidget() {
    return this.searchWidget;
  }
  get searchIncludePattern() {
    return this.inputPatternIncludes;
  }
  get searchExcludePattern() {
    return this.inputPatternExcludes;
  }
  createSearchWidget(container) {
    const contentPattern = this.viewletState["query.contentPattern"] || "";
    const replaceText = this.viewletState["query.replaceText"] || "";
    const isRegex = this.viewletState["query.regex"] === true;
    const isWholeWords = this.viewletState["query.wholeWords"] === true;
    const isCaseSensitive = this.viewletState["query.caseSensitive"] === true;
    const history = this.searchHistoryService.load();
    const searchHistory = history.search || this.viewletState["query.searchHistory"] || [];
    const replaceHistory = history.replace || this.viewletState["query.replaceHistory"] || [];
    const showReplace = typeof this.viewletState["view.showReplace"] === "boolean" ? this.viewletState["view.showReplace"] : true;
    const preserveCase = this.viewletState["query.preserveCase"] === true;
    const isInNotebookMarkdownInput = this.viewletState["query.isInNotebookMarkdownInput"] ?? true;
    const isInNotebookMarkdownPreview = this.viewletState["query.isInNotebookMarkdownPreview"] ?? true;
    const isInNotebookCellInput = this.viewletState["query.isInNotebookCellInput"] ?? true;
    const isInNotebookCellOutput = this.viewletState["query.isInNotebookCellOutput"] ?? true;
    this.searchWidget = this._register(
      this.instantiationService.createInstance(SearchWidget, container, {
        value: contentPattern,
        replaceValue: replaceText,
        isRegex,
        isCaseSensitive,
        isWholeWords,
        searchHistory,
        replaceHistory,
        preserveCase,
        inputBoxStyles: defaultInputBoxStyles,
        toggleStyles: defaultToggleStyles,
        notebookOptions: {
          isInNotebookMarkdownInput,
          isInNotebookMarkdownPreview,
          isInNotebookCellInput,
          isInNotebookCellOutput
        },
        initialAIButtonVisibility: this.shouldShowAIButton()
      })
    );
    if (!this.searchWidget.searchInput || !this.searchWidget.replaceInput) {
      this.logService.warn(
        `Cannot fully create search widget. Search or replace input undefined. SearchInput: ${this.searchWidget.searchInput}, ReplaceInput: ${this.searchWidget.replaceInput}`
      );
      return;
    }
    if (showReplace) {
      this.searchWidget.toggleReplace(true);
    }
    this._register(
      this.searchWidget.onSearchSubmit(
        (options) => this.triggerQueryChange(options)
      )
    );
    this._register(
      this.searchWidget.onSearchCancel(
        ({ focus }) => this.cancelSearch(focus)
      )
    );
    this._register(
      this.searchWidget.searchInput.onDidOptionChange(() => {
        if (this.searchWidget.searchInput && this.searchWidget.searchInput.isAIEnabled !== this.aiResultsVisible) {
          this.setAIResultsVisible(
            this.searchWidget.searchInput.isAIEnabled
          );
        } else {
          this.triggerQueryChange();
        }
      })
    );
    this._register(
      this.searchWidget.getNotebookFilters().onDidChange(() => this.triggerQueryChange())
    );
    const updateHasPatternKey = () => this.hasSearchPatternKey.set(
      this.searchWidget.searchInput ? this.searchWidget.searchInput.getValue().length > 0 : false
    );
    updateHasPatternKey();
    this._register(
      this.searchWidget.searchInput.onDidChange(
        () => updateHasPatternKey()
      )
    );
    const updateHasReplacePatternKey = () => this.hasReplacePatternKey.set(
      this.searchWidget.getReplaceValue().length > 0
    );
    updateHasReplacePatternKey();
    this._register(
      this.searchWidget.replaceInput.inputBox.onDidChange(
        () => updateHasReplacePatternKey()
      )
    );
    this._register(
      this.searchWidget.onDidHeightChange(() => this.reLayout())
    );
    this._register(
      this.searchWidget.onReplaceToggled(() => this.reLayout())
    );
    this._register(
      this.searchWidget.onReplaceStateChange((state) => {
        this.viewModel.replaceActive = state;
        this.refreshTree();
      })
    );
    this._register(
      this.searchWidget.onPreserveCaseChange((state) => {
        this.viewModel.preserveCase = state;
        this.refreshTree();
      })
    );
    this._register(
      this.searchWidget.onReplaceValueChanged(() => {
        this.viewModel.replaceString = this.searchWidget.getReplaceValue();
        this.delayedRefresh.trigger(() => this.refreshTree());
      })
    );
    this._register(
      this.searchWidget.onBlur(() => {
        this.toggleQueryDetailsButton.focus();
      })
    );
    this._register(this.searchWidget.onReplaceAll(() => this.replaceAll()));
    this.trackInputBox(this.searchWidget.searchInputFocusTracker);
    this.trackInputBox(this.searchWidget.replaceInputFocusTracker);
  }
  shouldShowAIButton() {
    const hasProvider = Constants.SearchContext.hasAIResultProvider.getValue(
      this.contextKeyService
    );
    return !!(this.configurationService.getValue("search.aiResults") && hasProvider);
  }
  onConfigurationUpdated(event) {
    if (event && (event.affectsConfiguration("search.decorations.colors") || event.affectsConfiguration("search.decorations.badges"))) {
      this.refreshTree();
    }
  }
  trackInputBox(inputFocusTracker, contextKey) {
    if (!inputFocusTracker) {
      return;
    }
    this._register(
      inputFocusTracker.onDidFocus(() => {
        this.lastFocusState = "input";
        this.inputBoxFocused.set(true);
        contextKey?.set(true);
      })
    );
    this._register(
      inputFocusTracker.onDidBlur(() => {
        this.inputBoxFocused.set(
          this.searchWidget.searchInputHasFocus() || this.searchWidget.replaceInputHasFocus() || this.inputPatternIncludes.inputHasFocus() || this.inputPatternExcludes.inputHasFocus()
        );
        contextKey?.set(false);
      })
    );
  }
  onSearchResultsChanged(event) {
    if (this.isVisible()) {
      return this.refreshAndUpdateCount(event);
    } else {
      this.changedWhileHidden = true;
    }
  }
  refreshAndUpdateCount(event) {
    this.searchWidget.setReplaceAllActionState(
      !this.viewModel.searchResult.isEmpty(this.aiResultsVisible)
    );
    this.updateSearchResultCount(
      this.viewModel.searchResult.query.userDisabledExcludesAndIgnoreFiles,
      this.viewModel.searchResult.query?.onlyOpenEditors,
      event?.clearingAll
    );
    return this.refreshTree(event);
  }
  refreshTree(event) {
    const collapseResults = this.searchConfig.collapseResults;
    if (!event || event.added || event.removed) {
      if (this.searchConfig.sortOrder === SearchSortOrder.Modified) {
        this.retrieveFileStats().then(
          () => this.tree.setChildren(
            null,
            this.createResultIterator(collapseResults)
          )
        );
      } else {
        this.tree.setChildren(
          null,
          this.createResultIterator(collapseResults)
        );
      }
    } else {
      if (this.searchConfig.sortOrder === SearchSortOrder.CountAscending || this.searchConfig.sortOrder === SearchSortOrder.CountDescending) {
        this.tree.setChildren(
          null,
          this.createResultIterator(collapseResults)
        );
      } else {
        event.elements.forEach((element) => {
          this.tree.setChildren(
            element,
            this.createIterator(element, collapseResults)
          );
          this.tree.rerender(element);
        });
      }
    }
  }
  createResultIterator(collapseResults) {
    const folderMatches = this.searchResult.folderMatches(this.aiResultsVisible).filter((fm) => !fm.isEmpty()).sort(searchMatchComparer);
    if (folderMatches.length === 1) {
      return this.createFolderIterator(
        folderMatches[0],
        collapseResults,
        true
      );
    }
    return Iterable.map(
      folderMatches,
      (folderMatch) => {
        const children = this.createFolderIterator(
          folderMatch,
          collapseResults,
          true
        );
        return { element: folderMatch, children, incompressible: true };
      }
    );
  }
  createFolderIterator(folderMatch, collapseResults, childFolderIncompressible) {
    const sortOrder = this.searchConfig.sortOrder;
    const matchArray = this.isTreeLayoutViewVisible ? folderMatch.matches() : folderMatch.allDownstreamFileMatches();
    const matches = matchArray.sort(
      (a, b) => searchMatchComparer(a, b, sortOrder)
    );
    return Iterable.map(
      matches,
      (match) => {
        let children;
        if (match instanceof FileMatch) {
          children = this.createFileIterator(match);
        } else {
          children = this.createFolderIterator(
            match,
            collapseResults,
            false
          );
        }
        const collapsed = collapseResults === "alwaysCollapse" || match.count() > 10 && collapseResults !== "alwaysExpand" ? ObjectTreeElementCollapseState.PreserveOrCollapsed : ObjectTreeElementCollapseState.PreserveOrExpanded;
        return {
          element: match,
          children,
          collapsed,
          incompressible: match instanceof FileMatch ? true : childFolderIncompressible
        };
      }
    );
  }
  createFileIterator(fileMatch) {
    let matches = fileMatch.matches().sort(searchMatchComparer);
    if (!this.aiResultsVisible) {
      matches = matches.filter((e) => !e.aiContributed);
    }
    return Iterable.map(
      matches,
      (r) => ({
        element: r,
        incompressible: true
      })
    );
  }
  createIterator(match, collapseResults) {
    return match instanceof SearchResult ? this.createResultIterator(collapseResults) : match instanceof FolderMatch ? this.createFolderIterator(match, collapseResults, false) : this.createFileIterator(match);
  }
  replaceAll() {
    if (this.viewModel.searchResult.count() === 0) {
      return;
    }
    const occurrences = this.viewModel.searchResult.count();
    const fileCount = this.viewModel.searchResult.fileCount();
    const replaceValue = this.searchWidget.getReplaceValue() || "";
    const afterReplaceAllMessage = this.buildAfterReplaceAllMessage(
      occurrences,
      fileCount,
      replaceValue
    );
    let progressComplete;
    let progressReporter;
    this.progressService.withProgress(
      {
        location: this.getProgressLocation(),
        delay: 100,
        total: occurrences
      },
      (p) => {
        progressReporter = p;
        return new Promise(
          (resolve) => progressComplete = resolve
        );
      }
    );
    const confirmation = {
      title: nls.localize("replaceAll.confirmation.title", "Replace All"),
      message: this.buildReplaceAllConfirmationMessage(
        occurrences,
        fileCount,
        replaceValue
      ),
      primaryButton: nls.localize(
        {
          key: "replaceAll.confirm.button",
          comment: ["&& denotes a mnemonic"]
        },
        "&&Replace"
      )
    };
    this.dialogService.confirm(confirmation).then((res) => {
      if (res.confirmed) {
        this.searchWidget.setReplaceAllActionState(false);
        this.viewModel.searchResult.replaceAll(progressReporter).then(
          () => {
            progressComplete();
            const messageEl = this.clearMessage();
            dom.append(messageEl, afterReplaceAllMessage);
            this.reLayout();
          },
          (error) => {
            progressComplete();
            errors.isCancellationError(error);
            this.notificationService.error(error);
          }
        );
      } else {
        progressComplete();
      }
    });
  }
  buildAfterReplaceAllMessage(occurrences, fileCount, replaceValue) {
    if (occurrences === 1) {
      if (fileCount === 1) {
        if (replaceValue) {
          return nls.localize(
            "replaceAll.occurrence.file.message",
            "Replaced {0} occurrence across {1} file with '{2}'.",
            occurrences,
            fileCount,
            replaceValue
          );
        }
        return nls.localize(
          "removeAll.occurrence.file.message",
          "Replaced {0} occurrence across {1} file.",
          occurrences,
          fileCount
        );
      }
      if (replaceValue) {
        return nls.localize(
          "replaceAll.occurrence.files.message",
          "Replaced {0} occurrence across {1} files with '{2}'.",
          occurrences,
          fileCount,
          replaceValue
        );
      }
      return nls.localize(
        "removeAll.occurrence.files.message",
        "Replaced {0} occurrence across {1} files.",
        occurrences,
        fileCount
      );
    }
    if (fileCount === 1) {
      if (replaceValue) {
        return nls.localize(
          "replaceAll.occurrences.file.message",
          "Replaced {0} occurrences across {1} file with '{2}'.",
          occurrences,
          fileCount,
          replaceValue
        );
      }
      return nls.localize(
        "removeAll.occurrences.file.message",
        "Replaced {0} occurrences across {1} file.",
        occurrences,
        fileCount
      );
    }
    if (replaceValue) {
      return nls.localize(
        "replaceAll.occurrences.files.message",
        "Replaced {0} occurrences across {1} files with '{2}'.",
        occurrences,
        fileCount,
        replaceValue
      );
    }
    return nls.localize(
      "removeAll.occurrences.files.message",
      "Replaced {0} occurrences across {1} files.",
      occurrences,
      fileCount
    );
  }
  buildReplaceAllConfirmationMessage(occurrences, fileCount, replaceValue) {
    if (occurrences === 1) {
      if (fileCount === 1) {
        if (replaceValue) {
          return nls.localize(
            "removeAll.occurrence.file.confirmation.message",
            "Replace {0} occurrence across {1} file with '{2}'?",
            occurrences,
            fileCount,
            replaceValue
          );
        }
        return nls.localize(
          "replaceAll.occurrence.file.confirmation.message",
          "Replace {0} occurrence across {1} file?",
          occurrences,
          fileCount
        );
      }
      if (replaceValue) {
        return nls.localize(
          "removeAll.occurrence.files.confirmation.message",
          "Replace {0} occurrence across {1} files with '{2}'?",
          occurrences,
          fileCount,
          replaceValue
        );
      }
      return nls.localize(
        "replaceAll.occurrence.files.confirmation.message",
        "Replace {0} occurrence across {1} files?",
        occurrences,
        fileCount
      );
    }
    if (fileCount === 1) {
      if (replaceValue) {
        return nls.localize(
          "removeAll.occurrences.file.confirmation.message",
          "Replace {0} occurrences across {1} file with '{2}'?",
          occurrences,
          fileCount,
          replaceValue
        );
      }
      return nls.localize(
        "replaceAll.occurrences.file.confirmation.message",
        "Replace {0} occurrences across {1} file?",
        occurrences,
        fileCount
      );
    }
    if (replaceValue) {
      return nls.localize(
        "removeAll.occurrences.files.confirmation.message",
        "Replace {0} occurrences across {1} files with '{2}'?",
        occurrences,
        fileCount,
        replaceValue
      );
    }
    return nls.localize(
      "replaceAll.occurrences.files.confirmation.message",
      "Replace {0} occurrences across {1} files?",
      occurrences,
      fileCount
    );
  }
  clearMessage() {
    this.searchWithoutFolderMessageElement = void 0;
    const wasHidden = this.messagesElement.style.display === "none";
    dom.clearNode(this.messagesElement);
    dom.show(this.messagesElement);
    this.messageDisposables.clear();
    const newMessage = dom.append(this.messagesElement, $(".message"));
    if (wasHidden) {
      this.reLayout();
    }
    return newMessage;
  }
  createSearchResultsView(container) {
    this.resultsElement = dom.append(
      container,
      $(".results.show-file-icons.file-icon-themable-tree")
    );
    const delegate = this.instantiationService.createInstance(SearchDelegate);
    const identityProvider = {
      getId(element) {
        return element.id();
      }
    };
    this.treeLabels = this._register(
      this.instantiationService.createInstance(ResourceLabels, {
        onDidChangeVisibility: this.onDidChangeBodyVisibility
      })
    );
    this.tree = this._register(
      this.instantiationService.createInstance(
        WorkbenchCompressibleObjectTree,
        "SearchView",
        this.resultsElement,
        delegate,
        [
          this._register(
            this.instantiationService.createInstance(
              FolderMatchRenderer,
              this,
              this.treeLabels
            )
          ),
          this._register(
            this.instantiationService.createInstance(
              FileMatchRenderer,
              this,
              this.treeLabels
            )
          ),
          this._register(
            this.instantiationService.createInstance(
              MatchRenderer,
              this
            )
          )
        ],
        {
          identityProvider,
          accessibilityProvider: this.treeAccessibilityProvider,
          dnd: this.instantiationService.createInstance(
            ResourceListDnDHandler,
            (element) => {
              if (element instanceof FileMatch) {
                return element.resource;
              }
              if (element instanceof Match) {
                return withSelection(
                  element.parent().resource,
                  element.range()
                );
              }
              return null;
            }
          ),
          multipleSelectionSupport: true,
          selectionNavigation: true,
          overrideStyles: this.getLocationBasedColors().listOverrideStyles,
          paddingBottom: SearchDelegate.ITEM_HEIGHT
        }
      )
    );
    this._register(this.tree.onContextMenu((e) => this.onContextMenu(e)));
    const updateHasSomeCollapsible = () => this.toggleCollapseStateDelayer.trigger(
      () => this.hasSomeCollapsibleResultKey.set(this.hasSomeCollapsible())
    );
    updateHasSomeCollapsible();
    this._register(
      this.tree.onDidChangeCollapseState(
        () => updateHasSomeCollapsible()
      )
    );
    this._register(
      this.tree.onDidChangeModel(() => updateHasSomeCollapsible())
    );
    this._register(
      Event.debounce(
        this.tree.onDidOpen,
        (last, event) => event,
        DEBOUNCE_DELAY,
        true
      )((options) => {
        if (options.element instanceof Match) {
          const selectedMatch = options.element;
          this.currentSelectedFileMatch?.setSelectedMatch(null);
          this.currentSelectedFileMatch = selectedMatch.parent();
          this.currentSelectedFileMatch.setSelectedMatch(
            selectedMatch
          );
          this.onFocus(
            selectedMatch,
            options.editorOptions.preserveFocus,
            options.sideBySide,
            options.editorOptions.pinned
          );
        }
      })
    );
    this._register(
      Event.debounce(
        this.tree.onDidChangeFocus,
        (last, event) => event,
        DEBOUNCE_DELAY,
        true
      )(() => {
        const selection = this.tree.getSelection();
        const focus = this.tree.getFocus()[0];
        if (selection.length > 1 && focus instanceof Match) {
          this.onFocus(focus, true);
        }
      })
    );
    this._register(
      Event.any(
        this.tree.onDidFocus,
        this.tree.onDidChangeFocus
      )(() => {
        const focus = this.tree.getFocus()[0];
        if (this.tree.isDOMFocused()) {
          this.firstMatchFocused.set(
            this.tree.navigate().first() === focus
          );
          this.fileMatchOrMatchFocused.set(!!focus);
          this.fileMatchFocused.set(focus instanceof FileMatch);
          this.folderMatchFocused.set(focus instanceof FolderMatch);
          this.matchFocused.set(focus instanceof Match);
          this.fileMatchOrFolderMatchFocus.set(
            focus instanceof FileMatch || focus instanceof FolderMatch
          );
          this.fileMatchOrFolderMatchWithResourceFocus.set(
            focus instanceof FileMatch || focus instanceof FolderMatchWithResource
          );
          this.folderMatchWithResourceFocused.set(
            focus instanceof FolderMatchWithResource
          );
          this.lastFocusState = "tree";
        }
        let editable = false;
        if (focus instanceof Match) {
          editable = focus instanceof MatchInNotebook ? !focus.isReadonly() : true;
        } else if (focus instanceof FileMatch) {
          editable = !focus.hasOnlyReadOnlyMatches();
        } else if (focus instanceof FolderMatch) {
          editable = !focus.hasOnlyReadOnlyMatches();
        }
        this.isEditableItem.set(editable);
      })
    );
    this._register(
      this.tree.onDidBlur(() => {
        this.firstMatchFocused.reset();
        this.fileMatchOrMatchFocused.reset();
        this.fileMatchFocused.reset();
        this.folderMatchFocused.reset();
        this.matchFocused.reset();
        this.fileMatchOrFolderMatchFocus.reset();
        this.fileMatchOrFolderMatchWithResourceFocus.reset();
        this.folderMatchWithResourceFocused.reset();
        this.isEditableItem.reset();
      })
    );
  }
  onContextMenu(e) {
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
    this.contextMenuService.showContextMenu({
      menuId: MenuId.SearchContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: this.contextKeyService,
      getAnchor: () => e.anchor,
      getActionsContext: () => e.element
    });
  }
  hasSomeCollapsible() {
    const viewer = this.getControl();
    const navigator = viewer.navigate();
    let node = navigator.first();
    do {
      if (!viewer.isCollapsed(node)) {
        return true;
      }
    } while (node = navigator.next());
    return false;
  }
  selectNextMatch() {
    if (!this.hasSearchResults()) {
      return;
    }
    const [selected] = this.tree.getSelection();
    if (selected && !(selected instanceof Match)) {
      if (this.tree.isCollapsed(selected)) {
        this.tree.expand(selected);
      }
    }
    const navigator = this.tree.navigate(selected);
    let next = navigator.next();
    if (!next) {
      next = navigator.first();
    }
    while (next && !(next instanceof Match)) {
      if (this.tree.isCollapsed(next)) {
        this.tree.expand(next);
      }
      next = navigator.next();
    }
    if (next) {
      if (next === selected) {
        this.tree.setFocus([]);
      }
      const event = getSelectionKeyboardEvent(void 0, false, false);
      this.tree.setFocus([next], event);
      this.tree.setSelection([next], event);
      this.tree.reveal(next);
      const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(next);
      if (ariaLabel) {
        aria.status(ariaLabel);
      }
    }
  }
  selectPreviousMatch() {
    if (!this.hasSearchResults()) {
      return;
    }
    const [selected] = this.tree.getSelection();
    let navigator = this.tree.navigate(selected);
    let prev = navigator.previous();
    while (!prev || !(prev instanceof Match) && !this.tree.isCollapsed(prev)) {
      const nextPrev = prev ? navigator.previous() : navigator.last();
      if (!prev && !nextPrev) {
        return;
      }
      prev = nextPrev;
    }
    while (!(prev instanceof Match)) {
      const nextItem = navigator.next();
      this.tree.expand(prev);
      navigator = this.tree.navigate(nextItem);
      prev = nextItem ? navigator.previous() : navigator.last();
    }
    if (prev) {
      if (prev === selected) {
        this.tree.setFocus([]);
      }
      const event = getSelectionKeyboardEvent(void 0, false, false);
      this.tree.setFocus([prev], event);
      this.tree.setSelection([prev], event);
      this.tree.reveal(prev);
      const ariaLabel = this.treeAccessibilityProvider.getAriaLabel(prev);
      if (ariaLabel) {
        aria.status(ariaLabel);
      }
    }
  }
  moveFocusToResults() {
    this.tree.domFocus();
  }
  focus() {
    super.focus();
    if (this.lastFocusState === "input" || !this.hasSearchResults()) {
      const updatedText = this.searchConfig.seedOnFocus ? this.updateTextFromSelection({ allowSearchOnType: false }) : false;
      this.searchWidget.focus(void 0, void 0, updatedText);
    } else {
      this.tree.domFocus();
    }
  }
  updateTextFromFindWidgetOrSelection({
    allowUnselectedWord = true,
    allowSearchOnType = true
  }) {
    let activeEditor = this.editorService.activeTextEditorControl;
    if (isCodeEditor(activeEditor) && !activeEditor?.hasTextFocus()) {
      const controller = CommonFindController.get(activeEditor);
      if (controller && controller.isFindInputFocused()) {
        return this.updateTextFromFindWidget(controller, {
          allowSearchOnType
        });
      }
      const editors = this.codeEditorService.listCodeEditors();
      activeEditor = editors.find(
        (editor) => editor instanceof EmbeddedCodeEditorWidget && editor.getParentEditor() === activeEditor && editor.hasTextFocus()
      ) ?? activeEditor;
    }
    return this.updateTextFromSelection(
      { allowUnselectedWord, allowSearchOnType },
      activeEditor
    );
  }
  updateTextFromFindWidget(controller, { allowSearchOnType = true }) {
    if (!this.searchConfig.seedWithNearestWord && (dom.getActiveWindow().getSelection()?.toString() ?? "") === "") {
      return false;
    }
    const searchString = controller.getState().searchString;
    if (searchString === "") {
      return false;
    }
    this.searchWidget.searchInput?.setCaseSensitive(
      controller.getState().matchCase
    );
    this.searchWidget.searchInput?.setWholeWords(
      controller.getState().wholeWord
    );
    this.searchWidget.searchInput?.setRegex(controller.getState().isRegex);
    this.updateText(searchString, allowSearchOnType);
    return true;
  }
  updateTextFromSelection({ allowUnselectedWord = true, allowSearchOnType = true }, editor) {
    const seedSearchStringFromSelection = this.configurationService.getValue("editor").find.seedSearchStringFromSelection;
    if (!seedSearchStringFromSelection || seedSearchStringFromSelection === "never") {
      return false;
    }
    let selectedText = this.getSearchTextFromEditor(
      allowUnselectedWord,
      editor
    );
    if (selectedText === null) {
      return false;
    }
    if (this.searchWidget.searchInput?.getRegex()) {
      selectedText = strings.escapeRegExpCharacters(selectedText);
    }
    this.updateText(selectedText, allowSearchOnType);
    return true;
  }
  updateText(text, allowSearchOnType = true) {
    if (allowSearchOnType && !this.viewModel.searchResult.isDirty) {
      this.searchWidget.setValue(text);
    } else {
      this.pauseSearching = true;
      this.searchWidget.setValue(text);
      this.pauseSearching = false;
    }
  }
  focusNextInputBox() {
    if (this.searchWidget.searchInputHasFocus()) {
      if (this.searchWidget.isReplaceShown()) {
        this.searchWidget.focus(true, true);
      } else {
        this.moveFocusFromSearchOrReplace();
      }
      return;
    }
    if (this.searchWidget.replaceInputHasFocus()) {
      this.moveFocusFromSearchOrReplace();
      return;
    }
    if (this.inputPatternIncludes.inputHasFocus()) {
      this.inputPatternExcludes.focus();
      this.inputPatternExcludes.select();
      return;
    }
    if (this.inputPatternExcludes.inputHasFocus()) {
      this.selectTreeIfNotSelected();
      return;
    }
  }
  moveFocusFromSearchOrReplace() {
    if (this.showsFileTypes()) {
      this.toggleQueryDetails(true, this.showsFileTypes());
    } else {
      this.selectTreeIfNotSelected();
    }
  }
  focusPreviousInputBox() {
    if (this.searchWidget.searchInputHasFocus()) {
      return;
    }
    if (this.searchWidget.replaceInputHasFocus()) {
      this.searchWidget.focus(true);
      return;
    }
    if (this.inputPatternIncludes.inputHasFocus()) {
      this.searchWidget.focus(true, true);
      return;
    }
    if (this.inputPatternExcludes.inputHasFocus()) {
      this.inputPatternIncludes.focus();
      this.inputPatternIncludes.select();
      return;
    }
    if (this.tree.isDOMFocused()) {
      this.moveFocusFromResults();
      return;
    }
  }
  moveFocusFromResults() {
    if (this.showsFileTypes()) {
      this.toggleQueryDetails(true, true, false, true);
    } else {
      this.searchWidget.focus(true, true);
    }
  }
  reLayout() {
    if (this.isDisposed || !this.size) {
      return;
    }
    const actionsPosition = this.searchConfig.actionsPosition;
    this.getContainer().classList.toggle(
      SearchView.ACTIONS_RIGHT_CLASS_NAME,
      actionsPosition === "right"
    );
    this.searchWidget.setWidth(
      this.size.width - 28
      /* container margin */
    );
    this.inputPatternExcludes.setWidth(
      this.size.width - 28
    );
    this.inputPatternIncludes.setWidth(
      this.size.width - 28
    );
    const widgetHeight = dom.getTotalHeight(
      this.searchWidgetsContainerElement
    );
    const messagesHeight = dom.getTotalHeight(this.messagesElement);
    this.tree.layout(
      this.size.height - widgetHeight - messagesHeight,
      this.size.width - 28
    );
  }
  layoutBody(height, width) {
    super.layoutBody(height, width);
    this.size = new dom.Dimension(width, height);
    this.reLayout();
  }
  getControl() {
    return this.tree;
  }
  allSearchFieldsClear() {
    return this.searchWidget.getReplaceValue() === "" && (!this.searchWidget.searchInput || this.searchWidget.searchInput.getValue() === "");
  }
  allFilePatternFieldsClear() {
    return this.searchExcludePattern.getValue() === "" && this.searchIncludePattern.getValue() === "";
  }
  hasSearchResults() {
    return !this.viewModel.searchResult.isEmpty(this.aiResultsVisible);
  }
  clearSearchResults(clearInput = true) {
    this.viewModel.searchResult.clear();
    this.showEmptyStage(true);
    if (this.contextService.getWorkbenchState() === WorkbenchState.EMPTY) {
      this.showSearchWithoutFolderMessage();
    }
    if (clearInput) {
      if (this.allSearchFieldsClear()) {
        this.clearFilePatternFields();
      }
      this.searchWidget.clear();
    }
    this.viewModel.cancelSearch();
    this.tree.ariaLabel = nls.localize("emptySearch", "Empty Search");
    this.accessibilitySignalService.playSignal(AccessibilitySignal.clear);
    this.reLayout();
  }
  clearFilePatternFields() {
    this.searchExcludePattern.clear();
    this.searchIncludePattern.clear();
  }
  cancelSearch(focus = true) {
    if (this.viewModel.cancelSearch()) {
      if (focus) {
        this.searchWidget.focus();
      }
      return true;
    }
    return false;
  }
  selectTreeIfNotSelected() {
    if (this.tree.getNode(null)) {
      this.tree.domFocus();
      const selection = this.tree.getSelection();
      if (selection.length === 0) {
        const event = getSelectionKeyboardEvent();
        this.tree.focusNext(void 0, void 0, event);
        this.tree.setSelection(this.tree.getFocus(), event);
      }
    }
  }
  getSearchTextFromEditor(allowUnselectedWord, editor) {
    if (dom.isAncestorOfActiveElement(this.getContainer())) {
      return null;
    }
    editor = editor ?? this.editorService.activeTextEditorControl;
    if (!editor) {
      return null;
    }
    const allowUnselected = this.searchConfig.seedWithNearestWord && allowUnselectedWord;
    return getSelectionTextFromEditor(allowUnselected, editor);
  }
  showsFileTypes() {
    return this.queryDetails.classList.contains("more");
  }
  toggleCaseSensitive() {
    this.searchWidget.searchInput?.setCaseSensitive(
      !this.searchWidget.searchInput.getCaseSensitive()
    );
    this.triggerQueryChange();
  }
  toggleWholeWords() {
    this.searchWidget.searchInput?.setWholeWords(
      !this.searchWidget.searchInput.getWholeWords()
    );
    this.triggerQueryChange();
  }
  toggleRegex() {
    this.searchWidget.searchInput?.setRegex(
      !this.searchWidget.searchInput.getRegex()
    );
    this.triggerQueryChange();
  }
  togglePreserveCase() {
    this.searchWidget.replaceInput?.setPreserveCase(
      !this.searchWidget.replaceInput.getPreserveCase()
    );
    this.triggerQueryChange();
  }
  setSearchParameters(args = {}) {
    if (typeof args.isCaseSensitive === "boolean") {
      this.searchWidget.searchInput?.setCaseSensitive(
        args.isCaseSensitive
      );
    }
    if (typeof args.matchWholeWord === "boolean") {
      this.searchWidget.searchInput?.setWholeWords(args.matchWholeWord);
    }
    if (typeof args.isRegex === "boolean") {
      this.searchWidget.searchInput?.setRegex(args.isRegex);
    }
    if (typeof args.filesToInclude === "string") {
      this.searchIncludePattern.setValue(String(args.filesToInclude));
    }
    if (typeof args.filesToExclude === "string") {
      this.searchExcludePattern.setValue(String(args.filesToExclude));
    }
    if (typeof args.query === "string") {
      this.searchWidget.searchInput?.setValue(args.query);
    }
    if (typeof args.replace === "string") {
      this.searchWidget.replaceInput?.setValue(args.replace);
    } else if (this.searchWidget.replaceInput && this.searchWidget.replaceInput.getValue() !== "") {
      this.searchWidget.replaceInput.setValue("");
    }
    if (typeof args.triggerSearch === "boolean" && args.triggerSearch) {
      this.triggerQueryChange();
    }
    if (typeof args.preserveCase === "boolean") {
      this.searchWidget.replaceInput?.setPreserveCase(args.preserveCase);
    }
    if (typeof args.useExcludeSettingsAndIgnoreFiles === "boolean") {
      this.inputPatternExcludes.setUseExcludesAndIgnoreFiles(
        args.useExcludeSettingsAndIgnoreFiles
      );
    }
    if (typeof args.onlyOpenEditors === "boolean") {
      this.searchIncludePattern.setOnlySearchInOpenEditors(
        args.onlyOpenEditors
      );
    }
  }
  toggleQueryDetails(moveFocus = true, show, skipLayout, reverse) {
    const cls = "more";
    show = typeof show === "undefined" ? !this.queryDetails.classList.contains(cls) : Boolean(show);
    this.viewletState["query.queryDetailsExpanded"] = show;
    skipLayout = Boolean(skipLayout);
    if (show) {
      this.toggleQueryDetailsButton.setAttribute("aria-expanded", "true");
      this.queryDetails.classList.add(cls);
      if (moveFocus) {
        if (reverse) {
          this.inputPatternExcludes.focus();
          this.inputPatternExcludes.select();
        } else {
          this.inputPatternIncludes.focus();
          this.inputPatternIncludes.select();
        }
      }
    } else {
      this.toggleQueryDetailsButton.setAttribute(
        "aria-expanded",
        "false"
      );
      this.queryDetails.classList.remove(cls);
      if (moveFocus) {
        this.searchWidget.focus();
      }
    }
    if (!skipLayout && this.size) {
      this.reLayout();
    }
  }
  _queryDetailsHidden() {
    return this.queryDetails.classList.contains("more");
  }
  searchInFolders(folderPaths = []) {
    this._searchWithIncludeOrExclude(true, folderPaths);
  }
  searchOutsideOfFolders(folderPaths = []) {
    this._searchWithIncludeOrExclude(false, folderPaths);
  }
  _searchWithIncludeOrExclude(include, folderPaths) {
    if (!folderPaths.length || folderPaths.some((folderPath) => folderPath === ".")) {
      this.inputPatternIncludes.setValue("");
      this.searchWidget.focus();
      return;
    }
    if (!this.showsFileTypes()) {
      this.toggleQueryDetails(true, true);
    }
    (include ? this.inputPatternIncludes : this.inputPatternExcludes).setValue(folderPaths.join(", "));
    this.searchWidget.focus(false);
  }
  triggerQueryChange(_options) {
    const options = {
      preserveFocus: true,
      triggeredOnType: false,
      delay: 0,
      ..._options
    };
    if (options.triggeredOnType && !this.searchConfig.searchOnType) {
      return;
    }
    if (!this.pauseSearching) {
      const delay = options.triggeredOnType ? options.delay : 0;
      this.triggerQueryDelayer.trigger(() => {
        this._onQueryChanged(
          options.preserveFocus,
          options.triggeredOnType
        );
      }, delay);
    }
  }
  _onQueryChanged(preserveFocus, triggeredOnType = false) {
    if (!this.searchWidget.searchInput?.inputBox.isInputValid()) {
      return;
    }
    const isRegex = this.searchWidget.searchInput.getRegex();
    const isInNotebookMarkdownInput = this.searchWidget.getNotebookFilters().markupInput;
    const isInNotebookMarkdownPreview = this.searchWidget.getNotebookFilters().markupPreview;
    const isInNotebookCellInput = this.searchWidget.getNotebookFilters().codeInput;
    const isInNotebookCellOutput = this.searchWidget.getNotebookFilters().codeOutput;
    const isWholeWords = this.searchWidget.searchInput.getWholeWords();
    const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
    const contentPattern = this.searchWidget.searchInput.getValue();
    const excludePatternText = this.inputPatternExcludes.getValue().trim();
    const includePatternText = this.inputPatternIncludes.getValue().trim();
    const useExcludesAndIgnoreFiles = this.inputPatternExcludes.useExcludesAndIgnoreFiles();
    const onlySearchInOpenEditors = this.inputPatternIncludes.onlySearchInOpenEditors();
    if (contentPattern.length === 0) {
      this.clearSearchResults(false);
      this.clearMessage();
      return;
    }
    const content = {
      pattern: contentPattern,
      isRegExp: isRegex,
      isCaseSensitive,
      isWordMatch: isWholeWords,
      notebookInfo: {
        isInNotebookMarkdownInput,
        isInNotebookMarkdownPreview,
        isInNotebookCellInput,
        isInNotebookCellOutput
      }
    };
    const excludePattern = [
      { pattern: this.inputPatternExcludes.getValue() }
    ];
    const includePattern = this.inputPatternIncludes.getValue();
    const charsPerLine = content.isRegExp ? 1e4 : 1e3;
    const options = {
      _reason: "searchView",
      extraFileResources: this.instantiationService.invokeFunction(
        getOutOfWorkspaceEditorResources
      ),
      maxResults: this.searchConfig.maxResults ?? void 0,
      disregardIgnoreFiles: !useExcludesAndIgnoreFiles || void 0,
      disregardExcludeSettings: !useExcludesAndIgnoreFiles || void 0,
      onlyOpenEditors: onlySearchInOpenEditors,
      excludePattern,
      includePattern,
      previewOptions: {
        matchLines: 1,
        charsPerLine
      },
      isSmartCase: this.searchConfig.smartCase,
      expandPatterns: true
    };
    const folderResources = this.contextService.getWorkspace().folders;
    const onQueryValidationError = (err) => {
      this.searchWidget.searchInput?.showMessage({
        content: err.message,
        type: MessageType.ERROR
      });
      this.viewModel.searchResult.clear();
    };
    let query;
    try {
      query = this.queryBuilder.text(
        content,
        folderResources.map((folder) => folder.uri),
        options
      );
    } catch (err) {
      onQueryValidationError(err);
      return;
    }
    this.validateQuery(query).then(() => {
      this.onQueryTriggered(
        query,
        options,
        excludePatternText,
        includePatternText,
        triggeredOnType
      );
      if (!preserveFocus) {
        this.searchWidget.focus(false, void 0, true);
      }
    }, onQueryValidationError);
  }
  validateQuery(query) {
    const folderQueriesExistP = query.folderQueries.map((fq) => {
      return this.fileService.exists(fq.folder).catch(() => false);
    });
    return Promise.all(folderQueriesExistP).then((existResults) => {
      const existingFolderQueries = query.folderQueries.filter(
        (folderQuery, i) => existResults[i]
      );
      if (!query.folderQueries.length || existingFolderQueries.length) {
        query.folderQueries = existingFolderQueries;
      } else {
        const nonExistantPath = query.folderQueries[0].folder.fsPath;
        const searchPathNotFoundError = nls.localize(
          "searchPathNotFoundError",
          "Search path not found: {0}",
          nonExistantPath
        );
        return Promise.reject(new Error(searchPathNotFoundError));
      }
      return void 0;
    });
  }
  onQueryTriggered(query, options, excludePatternText, includePatternText, triggeredOnType) {
    this.addToSearchHistoryDelayer.trigger(() => {
      this.searchWidget.searchInput?.onSearchSubmit();
      this.inputPatternExcludes.onSearchSubmit();
      this.inputPatternIncludes.onSearchSubmit();
    });
    this.viewModel.cancelSearch(true);
    this.viewModel.cancelAISearch(true);
    this.currentSearchQ = this.currentSearchQ.then(
      () => this.doSearch(
        query,
        excludePatternText,
        includePatternText,
        triggeredOnType
      )
    ).then(
      () => void 0,
      () => void 0
    );
  }
  _updateResults() {
    if (this.state === SearchUIState.Idle) {
      return;
    }
    try {
      const fileCount = this.viewModel.searchResult.fileCount(
        this.aiResultsVisible
      );
      if (this._visibleMatches !== fileCount) {
        this._visibleMatches = fileCount;
        this.refreshAndUpdateCount();
      }
    } finally {
      this._refreshResultsScheduler.schedule();
    }
  }
  onSearchComplete(progressComplete, excludePatternText, includePatternText, completed) {
    this.state = SearchUIState.Idle;
    progressComplete();
    this.onSearchResultsChanged();
    const collapseResults = this.searchConfig.collapseResults;
    if (collapseResults !== "alwaysCollapse" && this.viewModel.searchResult.matches(this.aiResultsVisible).length === 1) {
      const onlyMatch = this.viewModel.searchResult.matches(
        this.aiResultsVisible
      )[0];
      if (onlyMatch.count() < 50) {
        this.tree.expand(onlyMatch);
      }
    }
    const hasResults = !this.viewModel.searchResult.isEmpty(
      this.aiResultsVisible
    );
    if (completed?.exit === SearchCompletionExitCode.NewSearchStarted) {
      return;
    }
    if (hasResults) {
      this.viewModel.searchResult.toggleHighlights(this.isVisible());
      aria.status(
        nls.localize(
          "ariaSearchResultsStatus",
          "Search returned {0} results in {1} files",
          this.viewModel.searchResult.count(this.aiResultsVisible),
          this.viewModel.searchResult.fileCount()
        )
      );
    } else {
      const hasExcludes = !!excludePatternText;
      const hasIncludes = !!includePatternText;
      let message;
      if (!completed) {
        message = SEARCH_CANCELLED_MESSAGE;
      } else if (this.inputPatternIncludes.onlySearchInOpenEditors()) {
        if (hasIncludes && hasExcludes) {
          message = nls.localize(
            "noOpenEditorResultsIncludesExcludes",
            "No results found in open editors matching '{0}' excluding '{1}' - ",
            includePatternText,
            excludePatternText
          );
        } else if (hasIncludes) {
          message = nls.localize(
            "noOpenEditorResultsIncludes",
            "No results found in open editors matching '{0}' - ",
            includePatternText
          );
        } else if (hasExcludes) {
          message = nls.localize(
            "noOpenEditorResultsExcludes",
            "No results found in open editors excluding '{0}' - ",
            excludePatternText
          );
        } else {
          message = nls.localize(
            "noOpenEditorResultsFound",
            "No results found in open editors. Review your settings for configured exclusions and check your gitignore files - "
          );
        }
      } else if (hasIncludes && hasExcludes) {
        message = nls.localize(
          "noResultsIncludesExcludes",
          "No results found in '{0}' excluding '{1}' - ",
          includePatternText,
          excludePatternText
        );
      } else if (hasIncludes) {
        message = nls.localize(
          "noResultsIncludes",
          "No results found in '{0}' - ",
          includePatternText
        );
      } else if (hasExcludes) {
        message = nls.localize(
          "noResultsExcludes",
          "No results found excluding '{0}' - ",
          excludePatternText
        );
      } else {
        message = nls.localize(
          "noResultsFound",
          "No results found. Review your settings for configured exclusions and check your gitignore files - "
        );
      }
      aria.status(message);
      const messageEl = this.clearMessage();
      dom.append(messageEl, message);
      if (!completed) {
        const searchAgainButton = this.messageDisposables.add(
          new SearchLinkButton(
            nls.localize("rerunSearch.message", "Search again"),
            () => this.triggerQueryChange({ preserveFocus: false }),
            this.hoverService
          )
        );
        dom.append(messageEl, searchAgainButton.element);
      } else if (hasIncludes || hasExcludes) {
        const searchAgainButton = this.messageDisposables.add(
          new SearchLinkButton(
            nls.localize(
              "rerunSearchInAll.message",
              "Search again in all files"
            ),
            this.onSearchAgain.bind(this),
            this.hoverService
          )
        );
        dom.append(messageEl, searchAgainButton.element);
      } else {
        const openSettingsButton = this.messageDisposables.add(
          new SearchLinkButton(
            nls.localize("openSettings.message", "Open Settings"),
            this.onOpenSettings.bind(this),
            this.hoverService
          )
        );
        dom.append(messageEl, openSettingsButton.element);
      }
      if (completed) {
        dom.append(messageEl, $("span", void 0, " - "));
        const learnMoreButton = this.messageDisposables.add(
          new SearchLinkButton(
            nls.localize("openSettings.learnMore", "Learn More"),
            this.onLearnMore.bind(this),
            this.hoverService
          )
        );
        dom.append(messageEl, learnMoreButton.element);
      }
      if (this.contextService.getWorkbenchState() === WorkbenchState.EMPTY) {
        this.showSearchWithoutFolderMessage();
      }
      this.reLayout();
    }
    if (completed && completed.limitHit) {
      completed.messages.push({
        type: TextSearchCompleteMessageType.Warning,
        text: nls.localize(
          "searchMaxResultsWarning",
          "The result set only contains a subset of all matches. Be more specific in your search to narrow down the results."
        )
      });
    }
    if (completed && completed.messages) {
      for (const message of completed.messages) {
        this.addMessage(message);
      }
    }
    this.reLayout();
  }
  onSearchError(e, progressComplete, excludePatternText, includePatternText, completed) {
    this.state = SearchUIState.Idle;
    if (errors.isCancellationError(e)) {
      return this.onSearchComplete(
        progressComplete,
        excludePatternText,
        includePatternText,
        completed
      );
    } else {
      progressComplete();
      this.searchWidget.searchInput?.showMessage({
        content: e.message,
        type: MessageType.ERROR
      });
      this.viewModel.searchResult.clear();
      return Promise.resolve();
    }
  }
  doSearch(query, excludePatternText, includePatternText, triggeredOnType) {
    let progressComplete;
    this.progressService.withProgress(
      {
        location: this.getProgressLocation(),
        delay: triggeredOnType ? 300 : 0
      },
      (_progress) => {
        return new Promise(
          (resolve) => progressComplete = resolve
        );
      }
    );
    this.searchWidget.searchInput?.clearMessage();
    this.state = SearchUIState.Searching;
    this.showEmptyStage();
    const slowTimer = setTimeout(() => {
      this.state = SearchUIState.SlowSearch;
    }, 2e3);
    this._visibleMatches = 0;
    this._refreshResultsScheduler.schedule();
    this.searchWidget.setReplaceAllActionState(false);
    this.tree.setSelection([]);
    this.tree.setFocus([]);
    this.viewModel.replaceString = this.searchWidget.getReplaceValue();
    const result = this.viewModel.search(query);
    if (this.aiResultsVisible) {
      const aiResult = this.viewModel.aiSearch({
        ...query,
        contentPattern: query.contentPattern.pattern,
        type: QueryType.aiText
      });
      return result.asyncResults.then(
        () => aiResult.then(
          (complete) => {
            clearTimeout(slowTimer);
            this.onSearchComplete(
              progressComplete,
              excludePatternText,
              includePatternText,
              complete
            );
          },
          (e) => {
            clearTimeout(slowTimer);
            this.onSearchError(
              e,
              progressComplete,
              excludePatternText,
              includePatternText
            );
          }
        )
      );
    }
    return result.asyncResults.then(
      (complete) => {
        clearTimeout(slowTimer);
        this.onSearchComplete(
          progressComplete,
          excludePatternText,
          includePatternText,
          complete
        );
      },
      (e) => {
        clearTimeout(slowTimer);
        this.onSearchError(
          e,
          progressComplete,
          excludePatternText,
          includePatternText
        );
      }
    );
  }
  onOpenSettings(e) {
    dom.EventHelper.stop(e, false);
    this.openSettings(
      "@id:files.exclude,search.exclude,search.useParentIgnoreFiles,search.useGlobalIgnoreFiles,search.useIgnoreFiles"
    );
  }
  openSettings(query) {
    const options = { query };
    return this.contextService.getWorkbenchState() !== WorkbenchState.EMPTY ? this.preferencesService.openWorkspaceSettings(options) : this.preferencesService.openUserSettings(options);
  }
  onLearnMore() {
    this.openerService.open(
      URI.parse("https://go.microsoft.com/fwlink/?linkid=853977")
    );
  }
  onSearchAgain() {
    this.inputPatternExcludes.setValue("");
    this.inputPatternIncludes.setValue("");
    this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
    this.triggerQueryChange({ preserveFocus: false });
  }
  onEnableExcludes() {
    this.toggleQueryDetails(false, true);
    this.searchExcludePattern.setUseExcludesAndIgnoreFiles(true);
  }
  onDisableSearchInOpenEditors() {
    this.toggleQueryDetails(false, true);
    this.inputPatternIncludes.setOnlySearchInOpenEditors(false);
  }
  updateSearchResultCount(disregardExcludesAndIgnores, onlyOpenEditors, clear = false) {
    const fileCount = this.viewModel.searchResult.fileCount(
      this.aiResultsVisible
    );
    const resultCount = this.viewModel.searchResult.count(
      this.aiResultsVisible
    );
    this.hasSearchResultsKey.set(fileCount > 0);
    const msgWasHidden = this.messagesElement.style.display === "none";
    const messageEl = this.clearMessage();
    const resultMsg = clear ? "" : this.buildResultCountMessage(resultCount, fileCount);
    this.tree.ariaLabel = resultMsg + nls.localize(
      "forTerm",
      " - Search: {0}",
      this.searchResult.query?.contentPattern.pattern ?? ""
    );
    dom.append(messageEl, resultMsg);
    if (fileCount > 0) {
      if (disregardExcludesAndIgnores) {
        const excludesDisabledMessage = " - " + nls.localize(
          "useIgnoresAndExcludesDisabled",
          "exclude settings and ignore files are disabled"
        ) + " ";
        const enableExcludesButton = this.messageDisposables.add(
          new SearchLinkButton(
            nls.localize("excludes.enable", "enable"),
            this.onEnableExcludes.bind(this),
            this.hoverService,
            nls.localize(
              "useExcludesAndIgnoreFilesDescription",
              "Use Exclude Settings and Ignore Files"
            )
          )
        );
        dom.append(
          messageEl,
          $(
            "span",
            void 0,
            excludesDisabledMessage,
            "(",
            enableExcludesButton.element,
            ")"
          )
        );
      }
      if (onlyOpenEditors) {
        const searchingInOpenMessage = " - " + nls.localize(
          "onlyOpenEditors",
          "searching only in open files"
        ) + " ";
        const disableOpenEditorsButton = this.messageDisposables.add(
          new SearchLinkButton(
            nls.localize("openEditors.disable", "disable"),
            this.onDisableSearchInOpenEditors.bind(this),
            this.hoverService,
            nls.localize(
              "disableOpenEditors",
              "Search in entire workspace"
            )
          )
        );
        dom.append(
          messageEl,
          $(
            "span",
            void 0,
            searchingInOpenMessage,
            "(",
            disableOpenEditorsButton.element,
            ")"
          )
        );
      }
      dom.append(messageEl, " - ");
      const openInEditorTooltip = appendKeyBindingLabel(
        nls.localize(
          "openInEditor.tooltip",
          "Copy current search results to an editor"
        ),
        this.keybindingService.lookupKeybinding(
          Constants.SearchCommandIds.OpenInEditorCommandId
        )
      );
      const openInEditorButton = this.messageDisposables.add(
        new SearchLinkButton(
          nls.localize("openInEditor.message", "Open in editor"),
          () => this.instantiationService.invokeFunction(
            createEditorFromSearchResult,
            this.searchResult,
            this.searchIncludePattern.getValue(),
            this.searchExcludePattern.getValue(),
            this.searchIncludePattern.onlySearchInOpenEditors()
          ),
          this.hoverService,
          openInEditorTooltip
        )
      );
      dom.append(messageEl, openInEditorButton.element);
      this.reLayout();
    } else if (!msgWasHidden) {
      dom.hide(this.messagesElement);
    }
  }
  addMessage(message) {
    const messageBox = this.messagesElement.firstChild;
    if (!messageBox) {
      return;
    }
    dom.append(
      messageBox,
      renderSearchMessage(
        message,
        this.instantiationService,
        this.notificationService,
        this.openerService,
        this.commandService,
        this.messageDisposables,
        () => this.triggerQueryChange()
      )
    );
  }
  buildResultCountMessage(resultCount, fileCount) {
    if (resultCount === 1 && fileCount === 1) {
      return nls.localize(
        "search.file.result",
        "{0} result in {1} file",
        resultCount,
        fileCount
      );
    } else if (resultCount === 1) {
      return nls.localize(
        "search.files.result",
        "{0} result in {1} files",
        resultCount,
        fileCount
      );
    } else if (fileCount === 1) {
      return nls.localize(
        "search.file.results",
        "{0} results in {1} file",
        resultCount,
        fileCount
      );
    } else {
      return nls.localize(
        "search.files.results",
        "{0} results in {1} files",
        resultCount,
        fileCount
      );
    }
  }
  showSearchWithoutFolderMessage() {
    this.searchWithoutFolderMessageElement = this.clearMessage();
    const textEl = dom.append(
      this.searchWithoutFolderMessageElement,
      $(
        "p",
        void 0,
        nls.localize(
          "searchWithoutFolder",
          "You have not opened or specified a folder. Only open files are currently searched - "
        )
      )
    );
    const openFolderButton = this.messageDisposables.add(
      new SearchLinkButton(
        nls.localize("openFolder", "Open Folder"),
        () => {
          this.commandService.executeCommand(
            env.isMacintosh && env.isNative ? OpenFileFolderAction.ID : OpenFolderAction.ID
          ).catch((err) => errors.onUnexpectedError(err));
        },
        this.hoverService
      )
    );
    dom.append(textEl, openFolderButton.element);
  }
  showEmptyStage(forceHideMessages = false) {
    const showingCancelled = (this.messagesElement.firstChild?.textContent?.indexOf(
      SEARCH_CANCELLED_MESSAGE
    ) ?? -1) > -1;
    if (showingCancelled || forceHideMessages || !this.configurationService.getValue().search.searchOnType) {
      dom.hide(this.messagesElement);
    }
    dom.show(this.resultsElement);
    this.currentSelectedFileMatch = void 0;
  }
  shouldOpenInNotebookEditor(match, uri) {
    return match instanceof MatchInNotebook || uri.scheme !== network.Schemas.untitled && this.notebookService.getContributedNotebookTypes(uri).length > 0;
  }
  onFocus(lineMatch, preserveFocus, sideBySide, pinned) {
    const useReplacePreview = this.configurationService.getValue().search.useReplacePreview;
    const resource = lineMatch instanceof Match ? lineMatch.parent().resource : lineMatch.resource;
    return useReplacePreview && this.viewModel.isReplaceActive() && !!this.viewModel.replaceString && !this.shouldOpenInNotebookEditor(lineMatch, resource) ? this.replaceService.openReplacePreview(
      lineMatch,
      preserveFocus,
      sideBySide,
      pinned
    ) : this.open(lineMatch, preserveFocus, sideBySide, pinned, resource);
  }
  async open(element, preserveFocus, sideBySide, pinned, resourceInput) {
    const selection = getEditorSelectionFromMatch(element, this.viewModel);
    const oldParentMatches = element instanceof Match ? element.parent().matches() : [];
    const resource = resourceInput ?? (element instanceof Match ? element.parent().resource : element.resource);
    let editor;
    const options = {
      preserveFocus,
      pinned,
      selection,
      revealIfVisible: true
    };
    try {
      editor = await this.editorService.openEditor(
        {
          resource,
          options
        },
        sideBySide ? SIDE_GROUP : ACTIVE_GROUP
      );
      const editorControl = editor?.getControl();
      if (element instanceof Match && preserveFocus && isCodeEditor(editorControl)) {
        this.viewModel.searchResult.rangeHighlightDecorations.highlightRange(
          editorControl.getModel(),
          element.range()
        );
      } else {
        this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
      }
    } catch (err) {
      errors.onUnexpectedError(err);
      return;
    }
    if (editor instanceof NotebookEditor) {
      const elemParent = element.parent();
      if (element instanceof Match) {
        if (element instanceof MatchInNotebook) {
          element.parent().showMatch(element);
        } else {
          const editorWidget = editor.getControl();
          if (editorWidget) {
            elemParent.bindNotebookEditorWidget(editorWidget);
            await elemParent.updateMatchesForEditorWidget();
            const matchIndex = oldParentMatches.findIndex(
              (e) => e.id() === element.id()
            );
            const matches = elemParent.matches();
            const match = matchIndex >= matches.length ? matches[matches.length - 1] : matches[matchIndex];
            if (match instanceof MatchInNotebook) {
              elemParent.showMatch(match);
              if (!this.tree.getFocus().includes(match) || !this.tree.getSelection().includes(match)) {
                this.tree.setSelection(
                  [match],
                  getSelectionKeyboardEvent()
                );
                this.tree.setFocus([match]);
              }
            }
          }
        }
      }
    }
  }
  openEditorWithMultiCursor(element) {
    const resource = element instanceof Match ? element.parent().resource : element.resource;
    return this.editorService.openEditor({
      resource,
      options: {
        preserveFocus: false,
        pinned: true,
        revealIfVisible: true
      }
    }).then((editor) => {
      if (editor) {
        let fileMatch = null;
        if (element instanceof FileMatch) {
          fileMatch = element;
        } else if (element instanceof Match) {
          fileMatch = element.parent();
        }
        if (fileMatch) {
          const selections = fileMatch.matches().map(
            (m) => new Selection(
              m.range().startLineNumber,
              m.range().startColumn,
              m.range().endLineNumber,
              m.range().endColumn
            )
          );
          const codeEditor = getCodeEditor(editor.getControl());
          if (codeEditor) {
            const multiCursorController = MultiCursorSelectionController.get(codeEditor);
            multiCursorController?.selectAllUsingSelections(
              selections
            );
          }
        }
      }
      this.viewModel.searchResult.rangeHighlightDecorations.removeHighlightRange();
    }, errors.onUnexpectedError);
  }
  onUntitledDidDispose(resource) {
    if (!this.viewModel) {
      return;
    }
    let matches = this.viewModel.searchResult.matches();
    for (let i = 0, len = matches.length; i < len; i++) {
      if (resource.toString() === matches[i].resource.toString()) {
        this.viewModel.searchResult.remove(matches[i]);
      }
    }
    matches = this.viewModel.searchResult.matches(true);
    for (let i = 0, len = matches.length; i < len; i++) {
      if (resource.toString() === matches[i].resource.toString()) {
        this.viewModel.searchResult.remove(matches[i]);
      }
    }
  }
  onFilesChanged(e) {
    if (!this.viewModel || this.searchConfig.sortOrder !== SearchSortOrder.Modified && !e.gotDeleted()) {
      return;
    }
    const matches = this.viewModel.searchResult.matches();
    if (e.gotDeleted()) {
      const deletedMatches = matches.filter(
        (m) => e.contains(m.resource, FileChangeType.DELETED)
      );
      this.viewModel.searchResult.remove(deletedMatches);
    } else {
      const changedMatches = matches.filter(
        (m) => e.contains(m.resource)
      );
      if (changedMatches.length && this.searchConfig.sortOrder === SearchSortOrder.Modified) {
        this.updateFileStats(changedMatches).then(
          () => this.refreshTree()
        );
      }
    }
  }
  get searchConfig() {
    return this.configurationService.getValue(
      "search"
    );
  }
  clearHistory() {
    this.searchWidget.clearHistory();
    this.inputPatternExcludes.clearHistory();
    this.inputPatternIncludes.clearHistory();
  }
  saveState() {
    if (!this.searchWidget) {
      return;
    }
    const patternExcludes = this.inputPatternExcludes?.getValue().trim() ?? "";
    const patternIncludes = this.inputPatternIncludes?.getValue().trim() ?? "";
    const onlyOpenEditors = this.inputPatternIncludes?.onlySearchInOpenEditors() ?? false;
    const useExcludesAndIgnoreFiles = this.inputPatternExcludes?.useExcludesAndIgnoreFiles() ?? true;
    const preserveCase = this.viewModel.preserveCase;
    if (this.searchWidget.searchInput) {
      const isRegex = this.searchWidget.searchInput.getRegex();
      const isWholeWords = this.searchWidget.searchInput.getWholeWords();
      const isCaseSensitive = this.searchWidget.searchInput.getCaseSensitive();
      const contentPattern = this.searchWidget.searchInput.getValue();
      const isInNotebookCellInput = this.searchWidget.getNotebookFilters().codeInput;
      const isInNotebookCellOutput = this.searchWidget.getNotebookFilters().codeOutput;
      const isInNotebookMarkdownInput = this.searchWidget.getNotebookFilters().markupInput;
      const isInNotebookMarkdownPreview = this.searchWidget.getNotebookFilters().markupPreview;
      this.viewletState["query.contentPattern"] = contentPattern;
      this.viewletState["query.regex"] = isRegex;
      this.viewletState["query.wholeWords"] = isWholeWords;
      this.viewletState["query.caseSensitive"] = isCaseSensitive;
      this.viewletState["query.isInNotebookMarkdownInput"] = isInNotebookMarkdownInput;
      this.viewletState["query.isInNotebookMarkdownPreview"] = isInNotebookMarkdownPreview;
      this.viewletState["query.isInNotebookCellInput"] = isInNotebookCellInput;
      this.viewletState["query.isInNotebookCellOutput"] = isInNotebookCellOutput;
    }
    this.viewletState["query.folderExclusions"] = patternExcludes;
    this.viewletState["query.folderIncludes"] = patternIncludes;
    this.viewletState["query.useExcludesAndIgnoreFiles"] = useExcludesAndIgnoreFiles;
    this.viewletState["query.preserveCase"] = preserveCase;
    this.viewletState["query.onlyOpenEditors"] = onlyOpenEditors;
    const isReplaceShown = this.searchAndReplaceWidget.isReplaceShown();
    this.viewletState["view.showReplace"] = isReplaceShown;
    this.viewletState["view.treeLayout"] = this.isTreeLayoutViewVisible;
    this.viewletState["query.replaceText"] = isReplaceShown && this.searchWidget.getReplaceValue();
    this._saveSearchHistoryService();
    this.memento.saveMemento();
    super.saveState();
  }
  _saveSearchHistoryService() {
    if (this.searchWidget === void 0) {
      return;
    }
    const history = /* @__PURE__ */ Object.create(null);
    const searchHistory = this.searchWidget.getSearchHistory();
    if (searchHistory && searchHistory.length) {
      history.search = searchHistory;
    }
    const replaceHistory = this.searchWidget.getReplaceHistory();
    if (replaceHistory && replaceHistory.length) {
      history.replace = replaceHistory;
    }
    const patternExcludesHistory = this.inputPatternExcludes.getHistory();
    if (patternExcludesHistory && patternExcludesHistory.length) {
      history.exclude = patternExcludesHistory;
    }
    const patternIncludesHistory = this.inputPatternIncludes.getHistory();
    if (patternIncludesHistory && patternIncludesHistory.length) {
      history.include = patternIncludesHistory;
    }
    this.searchHistoryService.save(history);
  }
  async retrieveFileStats() {
    const files = this.searchResult.matches(this.aiResultsVisible).filter((f) => !f.fileStat).map((f) => f.resolveFileStat(this.fileService));
    await Promise.all(files);
  }
  async updateFileStats(elements) {
    const files = elements.map((f) => f.resolveFileStat(this.fileService));
    await Promise.all(files);
  }
  removeFileStats() {
    for (const fileMatch of this.searchResult.matches()) {
      fileMatch.fileStat = void 0;
    }
    for (const fileMatch of this.searchResult.matches(true)) {
      fileMatch.fileStat = void 0;
    }
  }
  dispose() {
    this.isDisposed = true;
    this.saveState();
    super.dispose();
  }
};
SearchView = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IProgressService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IContextViewService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IViewDescriptorService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IWorkspaceContextService),
  __decorateParam(13, ISearchViewModelWorkbenchService),
  __decorateParam(14, IContextKeyService),
  __decorateParam(15, IReplaceService),
  __decorateParam(16, ITextFileService),
  __decorateParam(17, IPreferencesService),
  __decorateParam(18, IThemeService),
  __decorateParam(19, ISearchHistoryService),
  __decorateParam(20, IContextMenuService),
  __decorateParam(21, IAccessibilityService),
  __decorateParam(22, IKeybindingService),
  __decorateParam(23, IStorageService),
  __decorateParam(24, IOpenerService),
  __decorateParam(25, ITelemetryService),
  __decorateParam(26, IHoverService),
  __decorateParam(27, INotebookService),
  __decorateParam(28, ILogService),
  __decorateParam(29, IAccessibilitySignalService)
], SearchView);
class SearchLinkButton extends Disposable {
  element;
  constructor(label, handler, hoverService, tooltip) {
    super();
    this.element = $("a.pointer", { tabindex: 0 }, label);
    this._register(
      hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        this.element,
        tooltip
      )
    );
    this.addEventHandlers(handler);
  }
  addEventHandlers(handler) {
    const wrappedHandler = (e) => {
      dom.EventHelper.stop(e, false);
      handler(e);
    };
    this._register(
      dom.addDisposableListener(
        this.element,
        dom.EventType.CLICK,
        wrappedHandler
      )
    );
    this._register(
      dom.addDisposableListener(
        this.element,
        dom.EventType.KEY_DOWN,
        (e) => {
          const event = new StandardKeyboardEvent(e);
          if (event.equals(KeyCode.Space) || event.equals(KeyCode.Enter)) {
            wrappedHandler(e);
            event.preventDefault();
            event.stopPropagation();
          }
        }
      )
    );
  }
}
function getEditorSelectionFromMatch(element, viewModel) {
  let match = null;
  if (element instanceof Match) {
    match = element;
  }
  if (element instanceof FileMatch && element.count() > 0) {
    match = element.matches()[element.matches().length - 1];
  }
  if (match) {
    const range = match.range();
    if (viewModel.isReplaceActive() && !!viewModel.replaceString) {
      const replaceString = match.replaceString;
      return {
        startLineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        endLineNumber: range.startLineNumber,
        endColumn: range.startColumn + replaceString.length
      };
    }
    return range;
  }
  return void 0;
}
function getSelectionTextFromEditor(allowUnselectedWord, activeEditor) {
  let editor = activeEditor;
  if (isDiffEditor(editor)) {
    if (editor.getOriginalEditor().hasTextFocus()) {
      editor = editor.getOriginalEditor();
    } else {
      editor = editor.getModifiedEditor();
    }
  }
  if (!isCodeEditor(editor) || !editor.hasModel()) {
    return null;
  }
  const range = editor.getSelection();
  if (!range) {
    return null;
  }
  if (range.isEmpty()) {
    if (allowUnselectedWord) {
      const wordAtPosition = editor.getModel().getWordAtPosition(range.getStartPosition());
      return wordAtPosition?.word ?? null;
    } else {
      return null;
    }
  }
  let searchText = "";
  for (let i = range.startLineNumber; i <= range.endLineNumber; i++) {
    let lineText = editor.getModel().getLineContent(i);
    if (i === range.endLineNumber) {
      lineText = lineText.substring(0, range.endColumn - 1);
    }
    if (i === range.startLineNumber) {
      lineText = lineText.substring(range.startColumn - 1);
    }
    if (i !== range.startLineNumber) {
      lineText = "\n" + lineText;
    }
    searchText += lineText;
  }
  return searchText;
}
export {
  SearchView,
  SearchViewPosition,
  getEditorSelectionFromMatch,
  getSelectionTextFromEditor
};
