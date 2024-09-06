import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { Position } from "vs/editor/common/core/position";
import { Location } from "vs/editor/common/languages";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceTrustRequestService } from "vs/platform/workspace/common/workspaceTrust";
import { TestExclusions } from "vs/workbench/contrib/testing/common/testExclusions";
import { ITestProfileService } from "vs/workbench/contrib/testing/common/testProfileService";
import { ITestResult } from "vs/workbench/contrib/testing/common/testResult";
import { ITestResultService } from "vs/workbench/contrib/testing/common/testResultService";
import { AmbiguousRunTestsRequest, IMainThreadTestController, IMainThreadTestHostProxy, ITestFollowups, ITestService } from "vs/workbench/contrib/testing/common/testService";
import { InternalTestItem, ResolvedTestRunRequest, TestMessageFollowupRequest, TestsDiff } from "vs/workbench/contrib/testing/common/testTypes";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class TestService extends Disposable implements ITestService {
    private readonly uriIdentityService;
    private readonly storage;
    private readonly editorService;
    private readonly testProfiles;
    private readonly notificationService;
    private readonly configurationService;
    private readonly testResults;
    private readonly workspaceTrustRequestService;
    readonly _serviceBrand: undefined;
    private testControllers;
    private testExtHosts;
    private readonly cancelExtensionTestRunEmitter;
    private readonly willProcessDiffEmitter;
    private readonly didProcessDiffEmitter;
    private readonly testRefreshCancellations;
    private readonly isRefreshingTests;
    private readonly activeEditorHasTests;
    /**
     * Cancellation for runs requested by the user being managed by the UI.
     * Test runs initiated by extensions are not included here.
     */
    private readonly uiRunningTests;
    /**
     * @inheritdoc
     */
    readonly onWillProcessDiff: any;
    /**
     * @inheritdoc
     */
    readonly onDidProcessDiff: any;
    /**
     * @inheritdoc
     */
    readonly onDidCancelTestRun: any;
    /**
     * @inheritdoc
     */
    readonly collection: any;
    /**
     * @inheritdoc
     */
    readonly excluded: TestExclusions;
    /**
     * @inheritdoc
     */
    readonly showInlineOutput: any;
    constructor(contextKeyService: IContextKeyService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService, storage: IStorageService, editorService: IEditorService, testProfiles: ITestProfileService, notificationService: INotificationService, configurationService: IConfigurationService, testResults: ITestResultService, workspaceTrustRequestService: IWorkspaceTrustRequestService);
    /**
     * @inheritdoc
     */
    expandTest(id: string, levels: number): Promise<void>;
    /**
     * @inheritdoc
     */
    cancelTestRun(runId?: string, taskId?: string): void;
    /**
     * @inheritdoc
     */
    runTests(req: AmbiguousRunTestsRequest, token?: any): Promise<ITestResult>;
    /** @inheritdoc */
    startContinuousRun(req: ResolvedTestRunRequest, token: CancellationToken): Promise<void>;
    /**
     * @inheritdoc
     */
    runResolvedTests(req: ResolvedTestRunRequest, token?: any): Promise<any>;
    /**
     * @inheritdoc
     */
    provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<ITestFollowups>;
    /**
     * @inheritdoc
     */
    publishDiff(_controllerId: string, diff: TestsDiff): void;
    /**
     * @inheritdoc
     */
    getTestController(id: string): any;
    /**
     * @inheritdoc
     */
    syncTests(): Promise<void>;
    /**
     * @inheritdoc
     */
    refreshTests(controllerId?: string): Promise<void>;
    /**
     * @inheritdoc
     */
    cancelRefreshTests(): void;
    /**
     * @inheritdoc
     */
    registerExtHost(controller: IMainThreadTestHostProxy): IDisposable;
    /**
     * @inheritdoc
     */
    getTestsRelatedToCode(uri: URI, position: Position, token?: CancellationToken): Promise<InternalTestItem[]>;
    /**
     * @inheritdoc
     */
    registerTestController(id: string, controller: IMainThreadTestController): IDisposable;
    /**
     * @inheritdoc
     */
    getCodeRelatedToTest(test: InternalTestItem, token?: CancellationToken): Promise<Location[]>;
    private updateEditorContextKeys;
    private saveAllBeforeTest;
}
