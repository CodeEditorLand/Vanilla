var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { WorkbenchListFocusContextKey } from "../../../../platform/list/browser/listService.js";
import { VIEW_ID } from "../../../services/search/common/search.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import * as Constants from "../common/constants.js";
import { SearchStateKey, SearchUIState } from "../common/search.js";
import { ISearchHistoryService } from "../common/searchHistoryService.js";
import { category, getSearchView } from "./searchActionsBase.js";
import {
  searchClearIcon,
  searchCollapseAllIcon,
  searchExpandAllIcon,
  searchRefreshIcon,
  searchShowAsList,
  searchShowAsTree,
  searchStopIcon
} from "./searchIcons.js";
import {
  FileMatch,
  FolderMatch,
  FolderMatchNoRoot,
  FolderMatchWorkspaceRoot,
  Match,
  SearchResult
} from "./searchModel.js";
registerAction2(
  class ClearSearchHistoryCommandAction extends Action2 {
    static {
      __name(this, "ClearSearchHistoryCommandAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ClearSearchHistoryCommandId,
        title: nls.localize2(
          "clearSearchHistoryLabel",
          "Clear Search History"
        ),
        category,
        f1: true
      });
    }
    async run(accessor) {
      clearHistoryCommand(accessor);
    }
  }
);
registerAction2(
  class CancelSearchAction extends Action2 {
    static {
      __name(this, "CancelSearchAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.CancelSearchActionId,
        title: nls.localize2(
          "CancelSearchAction.label",
          "Cancel Search"
        ),
        icon: searchStopIcon,
        category,
        f1: true,
        precondition: SearchStateKey.isEqualTo(
          SearchUIState.Idle
        ).negate(),
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          when: ContextKeyExpr.and(
            Constants.SearchContext.SearchViewVisibleKey,
            WorkbenchListFocusContextKey
          ),
          primary: KeyCode.Escape
        },
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 0,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals("view", VIEW_ID),
              SearchStateKey.isEqualTo(SearchUIState.SlowSearch)
            )
          }
        ]
      });
    }
    run(accessor) {
      return cancelSearch(accessor);
    }
  }
);
registerAction2(
  class RefreshAction extends Action2 {
    static {
      __name(this, "RefreshAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.RefreshSearchResultsActionId,
        title: nls.localize2("RefreshAction.label", "Refresh"),
        icon: searchRefreshIcon,
        precondition: Constants.SearchContext.ViewHasSearchPatternKey,
        category,
        f1: true,
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 0,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals("view", VIEW_ID),
              SearchStateKey.isEqualTo(
                SearchUIState.SlowSearch
              ).negate()
            )
          }
        ]
      });
    }
    run(accessor, ...args) {
      return refreshSearch(accessor);
    }
  }
);
registerAction2(
  class CollapseDeepestExpandedLevelAction extends Action2 {
    static {
      __name(this, "CollapseDeepestExpandedLevelAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.CollapseSearchResultsActionId,
        title: nls.localize2(
          "CollapseDeepestExpandedLevelAction.label",
          "Collapse All"
        ),
        category,
        icon: searchCollapseAllIcon,
        f1: true,
        precondition: ContextKeyExpr.and(
          Constants.SearchContext.HasSearchResults,
          Constants.SearchContext.ViewHasSomeCollapsibleKey
        ),
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 4,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals("view", VIEW_ID),
              ContextKeyExpr.or(
                Constants.SearchContext.HasSearchResults.negate(),
                Constants.SearchContext.ViewHasSomeCollapsibleKey
              )
            )
          }
        ]
      });
    }
    run(accessor, ...args) {
      return collapseDeepestExpandedLevel(accessor);
    }
  }
);
registerAction2(
  class ExpandAllAction extends Action2 {
    static {
      __name(this, "ExpandAllAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ExpandSearchResultsActionId,
        title: nls.localize2("ExpandAllAction.label", "Expand All"),
        category,
        icon: searchExpandAllIcon,
        f1: true,
        precondition: ContextKeyExpr.and(
          Constants.SearchContext.HasSearchResults,
          Constants.SearchContext.ViewHasSomeCollapsibleKey.toNegated()
        ),
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 4,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals("view", VIEW_ID),
              Constants.SearchContext.HasSearchResults,
              Constants.SearchContext.ViewHasSomeCollapsibleKey.toNegated()
            )
          }
        ]
      });
    }
    run(accessor, ...args) {
      return expandAll(accessor);
    }
  }
);
registerAction2(
  class ClearSearchResultsAction extends Action2 {
    static {
      __name(this, "ClearSearchResultsAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ClearSearchResultsActionId,
        title: nls.localize2(
          "ClearSearchResultsAction.label",
          "Clear Search Results"
        ),
        category,
        icon: searchClearIcon,
        f1: true,
        precondition: ContextKeyExpr.or(
          Constants.SearchContext.HasSearchResults,
          Constants.SearchContext.ViewHasSearchPatternKey,
          Constants.SearchContext.ViewHasReplacePatternKey,
          Constants.SearchContext.ViewHasFilePatternKey
        ),
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 1,
            when: ContextKeyExpr.equals("view", VIEW_ID)
          }
        ]
      });
    }
    run(accessor, ...args) {
      return clearSearchResults(accessor);
    }
  }
);
registerAction2(
  class ViewAsTreeAction extends Action2 {
    static {
      __name(this, "ViewAsTreeAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ViewAsTreeActionId,
        title: nls.localize2("ViewAsTreeAction.label", "View as Tree"),
        category,
        icon: searchShowAsList,
        f1: true,
        precondition: ContextKeyExpr.and(
          Constants.SearchContext.HasSearchResults,
          Constants.SearchContext.InTreeViewKey.toNegated()
        ),
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 2,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals("view", VIEW_ID),
              Constants.SearchContext.InTreeViewKey.toNegated()
            )
          }
        ]
      });
    }
    run(accessor, ...args) {
      const searchView = getSearchView(accessor.get(IViewsService));
      if (searchView) {
        searchView.setTreeView(true);
      }
    }
  }
);
registerAction2(
  class ViewAsListAction extends Action2 {
    static {
      __name(this, "ViewAsListAction");
    }
    constructor() {
      super({
        id: Constants.SearchCommandIds.ViewAsListActionId,
        title: nls.localize2("ViewAsListAction.label", "View as List"),
        category,
        icon: searchShowAsTree,
        f1: true,
        precondition: ContextKeyExpr.and(
          Constants.SearchContext.HasSearchResults,
          Constants.SearchContext.InTreeViewKey
        ),
        menu: [
          {
            id: MenuId.ViewTitle,
            group: "navigation",
            order: 2,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals("view", VIEW_ID),
              Constants.SearchContext.InTreeViewKey
            )
          }
        ]
      });
    }
    run(accessor, ...args) {
      const searchView = getSearchView(accessor.get(IViewsService));
      if (searchView) {
        searchView.setTreeView(false);
      }
    }
  }
);
const clearHistoryCommand = /* @__PURE__ */ __name((accessor) => {
  const searchHistoryService = accessor.get(ISearchHistoryService);
  searchHistoryService.clearHistory();
}, "clearHistoryCommand");
function expandAll(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    viewer.expandAll();
  }
}
__name(expandAll, "expandAll");
function clearSearchResults(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.clearSearchResults();
}
__name(clearSearchResults, "clearSearchResults");
function cancelSearch(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.cancelSearch();
}
__name(cancelSearch, "cancelSearch");
function refreshSearch(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.triggerQueryChange({ preserveFocus: false });
}
__name(refreshSearch, "refreshSearch");
function collapseDeepestExpandedLevel(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    const navigator = viewer.navigate();
    let node = navigator.first();
    let canCollapseFileMatchLevel = false;
    let canCollapseFirstLevel = false;
    if (node instanceof FolderMatchWorkspaceRoot || searchView.isTreeLayoutViewVisible) {
      while (node = navigator.next()) {
        if (node instanceof Match) {
          canCollapseFileMatchLevel = true;
          break;
        }
        if (searchView.isTreeLayoutViewVisible && !canCollapseFirstLevel) {
          let nodeToTest = node;
          if (node instanceof FolderMatch) {
            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
            nodeToTest = compressionStartNode && !(compressionStartNode instanceof Match) ? compressionStartNode : node;
          }
          const immediateParent = nodeToTest.parent();
          if (!(immediateParent instanceof FolderMatchWorkspaceRoot || immediateParent instanceof FolderMatchNoRoot || immediateParent instanceof SearchResult)) {
            canCollapseFirstLevel = true;
          }
        }
      }
    }
    if (canCollapseFileMatchLevel) {
      node = navigator.first();
      do {
        if (node instanceof FileMatch) {
          viewer.collapse(node);
        }
      } while (node = navigator.next());
    } else if (canCollapseFirstLevel) {
      node = navigator.first();
      if (node) {
        do {
          let nodeToTest = node;
          if (node instanceof FolderMatch) {
            const compressionStartNode = viewer.getCompressedTreeNode(node).element?.elements[0];
            nodeToTest = compressionStartNode && !(compressionStartNode instanceof Match) ? compressionStartNode : node;
          }
          const immediateParent = nodeToTest.parent();
          if (immediateParent instanceof FolderMatchWorkspaceRoot || immediateParent instanceof FolderMatchNoRoot) {
            if (viewer.hasElement(node)) {
              viewer.collapse(node, true);
            } else {
              viewer.collapseAll();
            }
          }
        } while (node = navigator.next());
      }
    } else {
      viewer.collapseAll();
    }
    const firstFocusParent = viewer.getFocus()[0]?.parent();
    if (firstFocusParent && (firstFocusParent instanceof FolderMatch || firstFocusParent instanceof FileMatch) && viewer.hasElement(firstFocusParent) && viewer.isCollapsed(firstFocusParent)) {
      viewer.domFocus();
      viewer.focusFirst();
      viewer.setSelection(viewer.getFocus());
    }
  }
}
__name(collapseDeepestExpandedLevel, "collapseDeepestExpandedLevel");
//# sourceMappingURL=searchActionsTopBar.js.map
