export declare const enum SearchCommandIds {
    FindInFilesActionId = "workbench.action.findInFiles",
    FocusActiveEditorCommandId = "search.action.focusActiveEditor",
    FocusSearchFromResults = "search.action.focusSearchFromResults",
    OpenMatch = "search.action.openResult",
    OpenMatchToSide = "search.action.openResultToSide",
    RemoveActionId = "search.action.remove",
    CopyPathCommandId = "search.action.copyPath",
    CopyMatchCommandId = "search.action.copyMatch",
    CopyAllCommandId = "search.action.copyAll",
    OpenInEditorCommandId = "search.action.openInEditor",
    ClearSearchHistoryCommandId = "search.action.clearHistory",
    FocusSearchListCommandID = "search.action.focusSearchList",
    ReplaceActionId = "search.action.replace",
    ReplaceAllInFileActionId = "search.action.replaceAllInFile",
    ReplaceAllInFolderActionId = "search.action.replaceAllInFolder",
    CloseReplaceWidgetActionId = "closeReplaceInFilesWidget",
    ToggleCaseSensitiveCommandId = "toggleSearchCaseSensitive",
    ToggleWholeWordCommandId = "toggleSearchWholeWord",
    ToggleRegexCommandId = "toggleSearchRegex",
    TogglePreserveCaseId = "toggleSearchPreserveCase",
    AddCursorsAtSearchResults = "addCursorsAtSearchResults",
    RevealInSideBarForSearchResults = "search.action.revealInSideBar",
    ReplaceInFilesActionId = "workbench.action.replaceInFiles",
    ShowAllSymbolsActionId = "workbench.action.showAllSymbols",
    QuickTextSearchActionId = "workbench.action.quickTextSearch",
    CancelSearchActionId = "search.action.cancel",
    RefreshSearchResultsActionId = "search.action.refreshSearchResults",
    FocusNextSearchResultActionId = "search.action.focusNextSearchResult",
    FocusPreviousSearchResultActionId = "search.action.focusPreviousSearchResult",
    ToggleSearchOnTypeActionId = "workbench.action.toggleSearchOnType",
    CollapseSearchResultsActionId = "search.action.collapseSearchResults",
    ExpandSearchResultsActionId = "search.action.expandSearchResults",
    ExpandRecursivelyCommandId = "search.action.expandRecursively",
    ClearSearchResultsActionId = "search.action.clearSearchResults",
    ViewAsTreeActionId = "search.action.viewAsTree",
    ViewAsListActionId = "search.action.viewAsList",
    ShowAIResultsActionId = "search.action.showAIResults",
    HideAIResultsActionId = "search.action.hideAIResults",
    ToggleQueryDetailsActionId = "workbench.action.search.toggleQueryDetails",
    ExcludeFolderFromSearchId = "search.action.excludeFromSearch",
    FocusNextInputActionId = "search.focus.nextInputBox",
    FocusPreviousInputActionId = "search.focus.previousInputBox",
    RestrictSearchToFolderId = "search.action.restrictSearchToFolder",
    FindInFolderId = "filesExplorer.findInFolder",
    FindInWorkspaceId = "filesExplorer.findInWorkspace"
}
export declare const SearchContext: {
    SearchViewVisibleKey: any;
    SearchViewFocusedKey: any;
    InputBoxFocusedKey: any;
    SearchInputBoxFocusedKey: any;
    ReplaceInputBoxFocusedKey: any;
    PatternIncludesFocusedKey: any;
    PatternExcludesFocusedKey: any;
    ReplaceActiveKey: any;
    HasSearchResults: any;
    FirstMatchFocusKey: any;
    FileMatchOrMatchFocusKey: any;
    FileMatchOrFolderMatchFocusKey: any;
    FileMatchOrFolderMatchWithResourceFocusKey: any;
    FileFocusKey: any;
    FolderFocusKey: any;
    ResourceFolderFocusKey: any;
    IsEditableItemKey: any;
    MatchFocusKey: any;
    ViewHasSearchPatternKey: any;
    ViewHasReplacePatternKey: any;
    ViewHasFilePatternKey: any;
    ViewHasSomeCollapsibleKey: any;
    InTreeViewKey: any;
    AIResultsVisibleKey: any;
    hasAIResultProvider: any;
};
