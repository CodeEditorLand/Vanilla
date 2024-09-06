import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ISettableObservable } from "vs/base/common/observable";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { TestCoverage } from "vs/workbench/contrib/testing/common/testCoverage";
import { TestId } from "vs/workbench/contrib/testing/common/testId";
import { ITestRunTaskResults } from "vs/workbench/contrib/testing/common/testResult";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare const ITestCoverageService: any;
export interface ITestCoverageService {
    readonly _serviceBrand: undefined;
    /**
     * Settable observable that can be used to show the test coverage instance
     * currently in the editor.
     */
    readonly selected: IObservable<TestCoverage | undefined>;
    /**
     * Filter to per-test coverage from the given test ID.
     */
    readonly filterToTest: ISettableObservable<TestId | undefined>;
    /**
     * Whether inline coverage is shown.
     */
    readonly showInline: ISettableObservable<boolean>;
    /**
     * Opens a test coverage report from a task, optionally focusing it in the editor.
     */
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    /**
     * Closes any open coverage.
     */
    closeCoverage(): void;
}
export declare class TestCoverageService extends Disposable implements ITestCoverageService {
    private readonly viewsService;
    readonly _serviceBrand: undefined;
    private readonly lastOpenCts;
    readonly selected: any;
    readonly filterToTest: any;
    readonly showInline: any;
    constructor(contextKeyService: IContextKeyService, resultService: ITestResultService, configService: IConfigurationService, viewsService: IViewsService);
    /** @inheritdoc */
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    /** @inheritdoc */
    closeCoverage(): void;
}
