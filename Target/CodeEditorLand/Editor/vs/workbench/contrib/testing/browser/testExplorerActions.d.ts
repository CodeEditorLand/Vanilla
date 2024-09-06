import { CancellationToken } from "vs/base/common/cancellation";
import { Iterable } from "vs/base/common/iterator";
import { IActiveCodeEditor, ICodeEditor } from "vs/editor/browser/editorBrowser";
import { GoToLocationValues } from "vs/editor/common/config/editorOptions";
import { Position } from "vs/editor/common/core/position";
import { ITextModel } from "vs/editor/common/model";
import { SymbolNavigationAction } from "vs/editor/contrib/gotoSymbol/browser/goToCommands";
import { ReferencesModel } from "vs/editor/contrib/gotoSymbol/browser/referencesModel";
import { Action2, IAction2Options } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { ViewAction } from "vs/workbench/browser/parts/views/viewPane";
import { TestExplorerTreeElement, TestItemTreeElement } from "vs/workbench/contrib/testing/browser/explorerProjections/index";
import { TestingExplorerView } from "vs/workbench/contrib/testing/browser/testingExplorerView";
import { ITestResult } from "vs/workbench/contrib/testing/common/testResult";
import { IMainThreadTestCollection, ITestService } from "vs/workbench/contrib/testing/common/testService";
import { InternalTestItem, TestRunProfileBitset } from "vs/workbench/contrib/testing/common/testTypes";
export declare class HideTestAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: TestItemTreeElement[]): Promise<void>;
}
export declare class UnhideTestAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: InternalTestItem[]): Promise<void>;
}
export declare class UnhideAllTestsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
declare abstract class RunVisibleAction extends ViewAction<TestingExplorerView> {
    private readonly bitset;
    constructor(bitset: TestRunProfileBitset, desc: Readonly<IAction2Options>);
    /**
     * @override
     */
    runInView(accessor: ServicesAccessor, view: TestingExplorerView, ...elements: TestItemTreeElement[]): Promise<unknown>;
}
export declare class DebugAction extends RunVisibleAction {
    constructor();
}
export declare class CoverageAction extends RunVisibleAction {
    constructor();
}
export declare class RunUsingProfileAction extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, ...elements: TestItemTreeElement[]): Promise<any>;
}
export declare class RunAction extends RunVisibleAction {
    constructor();
}
export declare class SelectDefaultTestProfiles extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, onlyGroup: TestRunProfileBitset): Promise<void>;
}
export declare class ContinuousRunTestAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: TestItemTreeElement[]): Promise<any>;
}
export declare class ContinuousRunUsingProfileTestAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: TestItemTreeElement[]): Promise<any>;
}
export declare class ConfigureTestProfilesAction extends Action2 {
    constructor();
    run(acessor: ServicesAccessor, onlyGroup?: TestRunProfileBitset): Promise<void>;
}
declare class StopContinuousRunAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
declare abstract class ExecuteSelectedAction extends ViewAction<TestingExplorerView> {
    private readonly group;
    constructor(options: IAction2Options, group: TestRunProfileBitset);
    /**
     * @override
     */
    runInView(accessor: ServicesAccessor, view: TestingExplorerView): Promise<ITestResult | undefined>;
}
export declare class GetSelectedProfiles extends Action2 {
    constructor();
    /**
     * @override
     */
    run(accessor: ServicesAccessor): {
        controllerId: any;
        label: any;
        kind: any;
    }[];
}
export declare class GetExplorerSelection extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): {
        include: any;
        exclude: any;
    };
}
export declare class RunSelectedAction extends ExecuteSelectedAction {
    constructor();
}
export declare class DebugSelectedAction extends ExecuteSelectedAction {
    constructor();
}
export declare class CoverageSelectedAction extends ExecuteSelectedAction {
    constructor();
}
declare abstract class RunOrDebugAllTestsAction extends Action2 {
    private readonly group;
    private noTestsFoundError;
    constructor(options: IAction2Options, group: TestRunProfileBitset, noTestsFoundError: string);
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RunAllAction extends RunOrDebugAllTestsAction {
    constructor();
}
export declare class DebugAllAction extends RunOrDebugAllTestsAction {
    constructor();
}
export declare class CoverageAllAction extends RunOrDebugAllTestsAction {
    constructor();
}
export declare class CancelTestRunAction extends Action2 {
    constructor();
    /**
     * @override
     */
    run(accessor: ServicesAccessor, resultId?: string, taskId?: string): Promise<void>;
}
export declare class TestingViewAsListAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingViewAsTreeAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingSortByStatusAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingSortByLocationAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class TestingSortByDurationAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class ShowMostRecentOutputAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CollapseAllAction extends ViewAction<TestingExplorerView> {
    constructor();
    /**
     * @override
     */
    runInView(_accessor: ServicesAccessor, view: TestingExplorerView): void;
}
export declare class ClearTestResultsAction extends Action2 {
    constructor();
    /**
     * @override
     */
    run(accessor: ServicesAccessor): void;
}
export declare class GoToTest extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, element?: TestExplorerTreeElement, preserveFocus?: boolean): Promise<void>;
}
declare abstract class ExecuteTestAtCursor extends Action2 {
    protected readonly group: TestRunProfileBitset;
    constructor(options: IAction2Options, group: TestRunProfileBitset);
    /**
     * @override
     */
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RunAtCursor extends ExecuteTestAtCursor {
    constructor();
}
export declare class DebugAtCursor extends ExecuteTestAtCursor {
    constructor();
}
export declare class CoverageAtCursor extends ExecuteTestAtCursor {
    constructor();
}
declare abstract class ExecuteTestsInCurrentFile extends Action2 {
    protected readonly group: TestRunProfileBitset;
    constructor(options: IAction2Options, group: TestRunProfileBitset);
    /**
     * @override
     */
    run(accessor: ServicesAccessor): any;
}
export declare class RunCurrentFile extends ExecuteTestsInCurrentFile {
    constructor();
}
export declare class DebugCurrentFile extends ExecuteTestsInCurrentFile {
    constructor();
}
export declare class CoverageCurrentFile extends ExecuteTestsInCurrentFile {
    constructor();
}
export declare const discoverAndRunTests: (collection: IMainThreadTestCollection, progress: IProgressService, ids: ReadonlyArray<string>, runTests: (tests: ReadonlyArray<InternalTestItem>) => Promise<ITestResult>) => Promise<ITestResult | undefined>;
declare abstract class RunOrDebugExtsByPath extends Action2 {
    /**
     * @override
     */
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
    protected abstract getTestExtIdsToRun(accessor: ServicesAccessor, ...args: unknown[]): Iterable<string>;
    protected abstract runTest(service: ITestService, node: readonly InternalTestItem[]): Promise<ITestResult>;
}
declare abstract class RunOrDebugFailedTests extends RunOrDebugExtsByPath {
    constructor(options: IAction2Options);
    /**
     * @inheritdoc
     */
    protected getTestExtIdsToRun(accessor: ServicesAccessor): Set<string>;
}
declare abstract class RunOrDebugLastRun extends Action2 {
    constructor(options: IAction2Options);
    protected abstract getGroup(): TestRunProfileBitset;
    protected getLastTestRunRequest(accessor: ServicesAccessor, runId?: string): any;
    /** @inheritdoc */
    run(accessor: ServicesAccessor, runId?: string): Promise<void>;
}
export declare class ReRunFailedTests extends RunOrDebugFailedTests {
    constructor();
    protected runTest(service: ITestService, internalTests: InternalTestItem[]): Promise<ITestResult>;
}
export declare class DebugFailedTests extends RunOrDebugFailedTests {
    constructor();
    protected runTest(service: ITestService, internalTests: InternalTestItem[]): Promise<ITestResult>;
}
export declare class ReRunLastRun extends RunOrDebugLastRun {
    constructor();
    protected getGroup(): TestRunProfileBitset;
}
export declare class DebugLastRun extends RunOrDebugLastRun {
    constructor();
    protected getGroup(): TestRunProfileBitset;
}
export declare class CoverageLastRun extends RunOrDebugLastRun {
    constructor();
    protected getGroup(): TestRunProfileBitset;
}
export declare class SearchForTestExtension extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class OpenOutputPeek extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ToggleInlineTestOutput extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class RefreshTestsAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...elements: TestItemTreeElement[]): Promise<any>;
}
export declare class CancelTestRefreshAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class CleareCoverage extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class OpenCoverage extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): void;
}
declare abstract class TestNavigationAction extends SymbolNavigationAction {
    protected testService: ITestService;
    protected uriIdentityService: IUriIdentityService;
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: any[]): any;
    protected _getAlternativeCommand(editor: IActiveCodeEditor): string;
    protected _getGoToPreference(editor: IActiveCodeEditor): GoToLocationValues;
}
declare abstract class GoToRelatedTestAction extends TestNavigationAction {
    protected _getLocationModel(_languageFeaturesService: unknown, model: ITextModel, position: Position, token: CancellationToken): Promise<ReferencesModel | undefined>;
    protected _getNoResultFoundMessage(): string;
}
declare class GoToRelatedTest extends GoToRelatedTestAction {
    constructor();
}
declare abstract class GoToRelatedCodeAction extends TestNavigationAction {
    protected _getLocationModel(_languageFeaturesService: unknown, model: ITextModel, position: Position, token: CancellationToken): Promise<ReferencesModel | undefined>;
    protected _getNoResultFoundMessage(): string;
}
declare class GoToRelatedCode extends GoToRelatedCodeAction {
    constructor();
}
export declare const allTestActions: (typeof DebugAction | typeof RunUsingProfileAction | typeof StopContinuousRunAction | typeof TestingViewAsListAction | typeof GoToRelatedTest | typeof GoToRelatedCode)[];
export {};
