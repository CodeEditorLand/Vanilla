import { TestResultState, TestRunProfileBitset } from "./testTypes.js";
export declare enum Testing {
    ViewletId = "workbench.view.extension.test",
    ExplorerViewId = "workbench.view.testing",
    OutputPeekContributionId = "editor.contrib.testingOutputPeek",
    DecorationsContributionId = "editor.contrib.testingDecorations",
    CoverageDecorationsContributionId = "editor.contrib.coverageDecorations",
    CoverageViewId = "workbench.view.testCoverage",
    ResultsPanelId = "workbench.panel.testResults",
    ResultsViewId = "workbench.panel.testResults.view",
    MessageLanguageId = "vscodeInternalTestMessage"
}
export declare enum TestExplorerViewMode {
    List = "list",
    Tree = "true"
}
export declare enum TestExplorerViewSorting {
    ByLocation = "location",
    ByStatus = "status",
    ByDuration = "duration"
}
export declare const labelForTestInState: (label: string, state: TestResultState) => string;
export declare const testConfigurationGroupNames: Partial<Record<TestRunProfileBitset, string | undefined>>;
export declare enum TestCommandId {
    CancelTestRefreshAction = "testing.cancelTestRefresh",
    CancelTestRunAction = "testing.cancelRun",
    ClearTestResultsAction = "testing.clearTestResults",
    CollapseAllAction = "testing.collapseAll",
    ConfigureTestProfilesAction = "testing.configureProfile",
    ContinousRunUsingForTest = "testing.continuousRunUsingForTest",
    CoverageAtCursor = "testing.coverageAtCursor",
    CoverageByUri = "testing.coverage.uri",
    CoverageClear = "testing.coverage.close",
    CoverageCurrentFile = "testing.coverageCurrentFile",
    CoverageFilterToTest = "testing.coverageFilterToTest",
    CoverageFilterToTestInEditor = "testing.coverageFilterToTestInEditor",
    CoverageLastRun = "testing.coverageLastRun",
    CoverageSelectedAction = "testing.coverageSelected",
    CoverageToggleToolbar = "testing.coverageToggleToolbar",
    CoverageViewChangeSorting = "testing.coverageViewChangeSorting",
    DebugAction = "testing.debug",
    DebugAllAction = "testing.debugAll",
    DebugAtCursor = "testing.debugAtCursor",
    DebugByUri = "testing.debug.uri",
    DebugCurrentFile = "testing.debugCurrentFile",
    DebugFailedTests = "testing.debugFailTests",
    DebugLastRun = "testing.debugLastRun",
    DebugSelectedAction = "testing.debugSelected",
    FilterAction = "workbench.actions.treeView.testExplorer.filter",
    GetExplorerSelection = "_testing.getExplorerSelection",
    GetSelectedProfiles = "testing.getSelectedProfiles",
    GoToTest = "testing.editFocusedTest",
    GoToRelatedTest = "testing.goToRelatedTest",
    PeekRelatedTest = "testing.peekRelatedTest",
    GoToRelatedCode = "testing.goToRelatedCode",
    PeekRelatedCode = "testing.peekRelatedCode",
    HideTestAction = "testing.hideTest",
    OpenCoverage = "testing.openCoverage",
    OpenOutputPeek = "testing.openOutputPeek",
    RefreshTestsAction = "testing.refreshTests",
    ReRunFailedTests = "testing.reRunFailTests",
    ReRunLastRun = "testing.reRunLastRun",
    RunAction = "testing.run",
    RunAllAction = "testing.runAll",
    RunAllWithCoverageAction = "testing.coverageAll",
    RunAtCursor = "testing.runAtCursor",
    RunByUri = "testing.run.uri",
    RunCurrentFile = "testing.runCurrentFile",
    RunSelectedAction = "testing.runSelected",
    RunUsingProfileAction = "testing.runUsing",
    RunWithCoverageAction = "testing.coverage",
    SearchForTestExtension = "testing.searchForTestExtension",
    SelectDefaultTestProfiles = "testing.selectDefaultTestProfiles",
    ShowMostRecentOutputAction = "testing.showMostRecentOutput",
    StartContinousRun = "testing.startContinuousRun",
    StopContinousRun = "testing.stopContinuousRun",
    TestingSortByDurationAction = "testing.sortByDuration",
    TestingSortByLocationAction = "testing.sortByLocation",
    TestingSortByStatusAction = "testing.sortByStatus",
    TestingViewAsListAction = "testing.viewAsList",
    TestingViewAsTreeAction = "testing.viewAsTree",
    ToggleContinousRunForTest = "testing.toggleContinuousRunForTest",
    ToggleInlineTestOutput = "testing.toggleInlineTestOutput",
    UnhideAllTestsAction = "testing.unhideAllTests",
    UnhideTestAction = "testing.unhideTest"
}
