import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { ITestProfileService } from "vs/workbench/contrib/testing/common/testProfileService";
import { ITestResult, LiveTestResult, TestResultItemChange } from "vs/workbench/contrib/testing/common/testResult";
import { ITestResultStorage } from "vs/workbench/contrib/testing/common/testResultStorage";
import { ExtensionRunTestsRequest, ResolvedTestRunRequest, TestResultItem } from "vs/workbench/contrib/testing/common/testTypes";
export type ResultChangeEvent = {
    completed: LiveTestResult;
} | {
    started: LiveTestResult;
} | {
    inserted: ITestResult;
} | {
    removed: ITestResult[];
};
export interface ITestResultService {
    readonly _serviceBrand: undefined;
    /**
     * Fired after any results are added, removed, or completed.
     */
    readonly onResultsChanged: Event<ResultChangeEvent>;
    /**
     * Fired when a test changed it state, or its computed state is updated.
     */
    readonly onTestChanged: Event<TestResultItemChange>;
    /**
     * List of known test results.
     */
    readonly results: ReadonlyArray<ITestResult>;
    /**
     * Discards all completed test results.
     */
    clear(): void;
    /**
     * Creates a new, live test result.
     */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    /**
     * Adds a new test result to the collection.
     */
    push<T extends ITestResult>(result: T): T;
    /**
     * Looks up a set of test results by ID.
     */
    getResult(resultId: string): ITestResult | undefined;
    /**
     * Looks up a test's most recent state, by its extension-assigned ID.
     */
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
}
export declare const ITestResultService: any;
export declare class TestResultService extends Disposable implements ITestResultService {
    private readonly storage;
    private readonly testProfiles;
    private readonly telemetryService;
    _serviceBrand: undefined;
    private changeResultEmitter;
    private _results;
    private readonly _resultsDisposables;
    private testChangeEmitter;
    /**
     * @inheritdoc
     */
    get results(): ITestResult[];
    /**
     * @inheritdoc
     */
    readonly onResultsChanged: any;
    /**
     * @inheritdoc
     */
    readonly onTestChanged: any;
    private readonly isRunning;
    private readonly hasAnyResults;
    private readonly loadResults;
    protected readonly persistScheduler: any;
    constructor(contextKeyService: IContextKeyService, storage: ITestResultStorage, testProfiles: ITestProfileService, telemetryService: ITelemetryService);
    /**
     * @inheritdoc
     */
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
    /**
     * @inheritdoc
     */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): any;
    /**
     * @inheritdoc
     */
    push<T extends ITestResult>(result: T): T;
    /**
     * @inheritdoc
     */
    getResult(id: string): any;
    /**
     * @inheritdoc
     */
    clear(): void;
    private onComplete;
    private resort;
    private updateIsRunning;
    protected persistImmediately(): Promise<void>;
}
