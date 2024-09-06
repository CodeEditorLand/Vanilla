import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITestProfileService } from "vs/workbench/contrib/testing/common/testProfileService";
import { TestService } from "vs/workbench/contrib/testing/common/testServiceImpl";
import { ITestRunProfile, TestRunProfileBitset } from "vs/workbench/contrib/testing/common/testTypes";
export declare const ITestingContinuousRunService: any;
export interface ITestingContinuousRunService {
    readonly _serviceBrand: undefined;
    /**
     * Gets a list of the last test profiles that were continuously run in the workspace.
     */
    readonly lastRunProfileIds: ReadonlySet<number>;
    /**
     * Fired when a test is added or removed from continous run, or when
     * enablement is changed globally.
     */
    onDidChange: Event<string | undefined>;
    /**
     * Gets whether continous run is specifically enabled for the given test ID.
     */
    isSpecificallyEnabledFor(testId: string): boolean;
    /**
     * Gets whether continous run is specifically enabled for
     * the given test ID, or any of its parents.
     */
    isEnabledForAParentOf(testId: string): boolean;
    /**
     * Gets whether continous run is specifically enabled for
     * the given test ID, or any of its parents.
     */
    isEnabledForAChildOf(testId: string): boolean;
    /**
     * Gets whether it's enabled at all.
     */
    isEnabled(): boolean;
    /**
     * Starts a continuous auto run with a specific set of profiles, or all
     * default profiles in a group. Globally if no test is given,
     * for a specific test otherwise.
     */
    start(profile: ITestRunProfile[] | TestRunProfileBitset, testId?: string): void;
    /**
     * Stops any continuous run
     * Globally if no test is given, for a specific test otherwise.
     */
    stop(testId?: string): void;
}
export declare class TestingContinuousRunService extends Disposable implements ITestingContinuousRunService {
    private readonly testService;
    private readonly testProfileService;
    readonly _serviceBrand: undefined;
    private readonly changeEmitter;
    private globallyRunning?;
    private readonly running;
    private readonly lastRun;
    private readonly isGloballyOn;
    readonly onDidChange: any;
    get lastRunProfileIds(): any;
    constructor(testService: TestService, storageService: IStorageService, contextKeyService: IContextKeyService, testProfileService: ITestProfileService);
    /** @inheritdoc */
    isSpecificallyEnabledFor(testId: string): boolean;
    /** @inheritdoc */
    isEnabledForAParentOf(testId: string): boolean;
    /** @inheritdoc */
    isEnabledForAChildOf(testId: string): boolean;
    /** @inheritdoc */
    isEnabled(): boolean;
    /** @inheritdoc */
    start(profiles: ITestRunProfile[] | TestRunProfileBitset, testId?: string): void;
    /** @inheritdoc */
    stop(testId?: string): void;
}
