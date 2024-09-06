import { VSBuffer } from "vs/base/common/buffer";
import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { UriComponents } from "vs/base/common/uri";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { ITestProfileService } from "vs/workbench/contrib/testing/common/testProfileService";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
import { ITestService } from "vs/workbench/contrib/testing/common/testService";
import { CoverageDetails, ExtensionRunTestsRequest, IFileCoverage, ITestItem, ITestMessage, ITestRunProfile, ITestRunTask, ResolvedTestRunRequest, TestControllerCapability, TestResultState, TestsDiffOp } from "vs/workbench/contrib/testing/common/testTypes";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { ILocationDto, ITestControllerPatch, MainThreadTestingShape } from "../common/extHost.protocol";
export declare class MainThreadTesting extends Disposable implements MainThreadTestingShape {
    private readonly uriIdentityService;
    private readonly testService;
    private readonly testProfiles;
    private readonly resultService;
    private readonly proxy;
    private readonly diffListener;
    private readonly testProviderRegistrations;
    constructor(extHostContext: IExtHostContext, uriIdentityService: IUriIdentityService, testService: ITestService, testProfiles: ITestProfileService, resultService: ITestResultService);
    /**
     * @inheritdoc
     */
    $markTestRetired(testIds: string[] | undefined): void;
    /**
     * @inheritdoc
     */
    $publishTestRunProfile(profile: ITestRunProfile): void;
    /**
     * @inheritdoc
     */
    $updateTestRunConfig(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    /**
     * @inheritdoc
     */
    $removeTestProfile(controllerId: string, profileId: number): void;
    /**
     * @inheritdoc
     */
    $addTestsToRun(controllerId: string, runId: string, tests: ITestItem.Serialized[]): void;
    /**
     * @inheritdoc
     */
    $appendCoverage(runId: string, taskId: string, coverage: IFileCoverage.Serialized): void;
    /**
     * @inheritdoc
     */
    $startedExtensionTestRun(req: ExtensionRunTestsRequest): void;
    /**
     * @inheritdoc
     */
    $startedTestRunTask(runId: string, task: ITestRunTask): void;
    /**
     * @inheritdoc
     */
    $finishedTestRunTask(runId: string, taskId: string): void;
    /**
     * @inheritdoc
     */
    $finishedExtensionTestRun(runId: string): void;
    /**
     * @inheritdoc
     */
    $updateTestStateInRun(runId: string, taskId: string, testId: string, state: TestResultState, duration?: number): void;
    /**
     * @inheritdoc
     */
    $appendOutputToRun(runId: string, taskId: string, output: VSBuffer, locationDto?: ILocationDto, testId?: string): void;
    /**
     * @inheritdoc
     */
    $appendTestMessagesInRun(runId: string, taskId: string, testId: string, messages: ITestMessage.Serialized[]): void;
    /**
     * @inheritdoc
     */
    $registerTestController(controllerId: string, _label: string, _capabilities: TestControllerCapability): void;
    /**
     * @inheritdoc
     */
    $updateController(controllerId: string, patch: ITestControllerPatch): void;
    /**
     * @inheritdoc
     */
    $unregisterTestController(controllerId: string): void;
    /**
     * @inheritdoc
     */
    $subscribeToDiffs(): void;
    /**
     * @inheritdoc
     */
    $unsubscribeFromDiffs(): void;
    /**
     * @inheritdoc
     */
    $publishDiff(controllerId: string, diff: TestsDiffOp.Serialized[]): void;
    /**
     * @inheritdoc
     */
    $runTests(req: ResolvedTestRunRequest, token: CancellationToken): Promise<string>;
    /**
     * @inheritdoc
     */
    $getCoverageDetails(resultId: string, taskIndex: number, uri: UriComponents, token: CancellationToken): Promise<CoverageDetails.Serialized[]>;
    dispose(): void;
    private withLiveRun;
}
