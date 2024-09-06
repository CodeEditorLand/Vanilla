import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ITestCoverageService } from "vs/workbench/contrib/testing/common/testCoverageService";
import { ITestResult } from "vs/workbench/contrib/testing/common/testResult";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
/** Workbench contribution that triggers updates in the TestingProgressUi service */
export declare class TestingProgressTrigger extends Disposable {
    private readonly configurationService;
    private readonly viewsService;
    constructor(resultService: ITestResultService, testCoverageService: ITestCoverageService, configurationService: IConfigurationService, viewsService: IViewsService);
    private attachAutoOpenForNewResults;
    private openExplorerView;
    private openResultsView;
}
export type CountSummary = ReturnType<typeof collectTestStateCounts>;
export declare const collectTestStateCounts: (isRunning: boolean, results: ReadonlyArray<ITestResult>) => {
    isRunning: boolean;
    passed: number;
    failed: number;
    runSoFar: number;
    totalWillBeRun: number;
    skipped: number;
};
export declare const getTestProgressText: ({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed, }: CountSummary) => any;
