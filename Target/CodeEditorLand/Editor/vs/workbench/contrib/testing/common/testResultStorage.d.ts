import { VSBuffer, VSBufferReadableStream, VSBufferWriteableStream } from "vs/base/common/buffer";
import { Disposable } from "vs/base/common/lifecycle";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { HydratedTestResult, ITestResult } from "vs/workbench/contrib/testing/common/testResult";
import { ISerializedTestResults } from "vs/workbench/contrib/testing/common/testTypes";
export declare const RETAIN_MAX_RESULTS = 128;
export interface ITestResultStorage {
    _serviceBrand: undefined;
    /**
     * Retrieves the list of stored test results.
     */
    read(): Promise<HydratedTestResult[]>;
    /**
     * Persists the list of test results.
     */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
}
export declare const ITestResultStorage: any;
export declare abstract class BaseTestResultStorage extends Disposable implements ITestResultStorage {
    private readonly uriIdentityService;
    private readonly storageService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    protected readonly stored: any;
    constructor(uriIdentityService: IUriIdentityService, storageService: IStorageService, logService: ILogService);
    /**
     * @override
     */
    read(): Promise<HydratedTestResult[]>;
    /**
     * @override
     */
    getResultOutputWriter(resultId: string): any;
    /**
     * @override
     */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
    /**
     * Reads serialized results for the test. Is allowed to throw.
     */
    protected abstract readForResultId(id: string): Promise<ISerializedTestResults | undefined>;
    /**
     * Reads output as a stream for the test.
     */
    protected abstract readOutputForResultId(id: string): Promise<VSBufferReadableStream>;
    /**
     * Reads an output range for the test.
     */
    protected abstract readOutputRangeForResultId(id: string, offset: number, length: number): Promise<VSBuffer>;
    /**
     * Deletes serialized results for the test.
     */
    protected abstract deleteForResultId(id: string): Promise<unknown>;
    /**
     * Stores test results by ID.
     */
    protected abstract storeForResultId(id: string, data: ISerializedTestResults): Promise<unknown>;
    /**
     * Reads serialized results for the test. Is allowed to throw.
     */
    protected abstract storeOutputForResultId(id: string, input: VSBufferWriteableStream): Promise<void>;
}
export declare class InMemoryResultStorage extends BaseTestResultStorage {
    readonly cache: Map<string, ISerializedTestResults>;
    protected readForResultId(id: string): Promise<any>;
    protected storeForResultId(id: string, contents: ISerializedTestResults): Promise<void>;
    protected deleteForResultId(id: string): Promise<void>;
    protected readOutputForResultId(id: string): Promise<VSBufferReadableStream>;
    protected storeOutputForResultId(id: string, input: VSBufferWriteableStream): Promise<void>;
    protected readOutputRangeForResultId(id: string, offset: number, length: number): Promise<VSBuffer>;
}
export declare class TestResultStorage extends BaseTestResultStorage {
    private readonly fileService;
    private readonly directory;
    constructor(uriIdentityService: IUriIdentityService, storageService: IStorageService, logService: ILogService, workspaceContext: IWorkspaceContextService, fileService: IFileService, environmentService: IEnvironmentService);
    protected readForResultId(id: string): Promise<any>;
    protected storeForResultId(id: string, contents: ISerializedTestResults): any;
    protected deleteForResultId(id: string): any;
    protected readOutputRangeForResultId(id: string, offset: number, length: number): Promise<VSBuffer>;
    protected readOutputForResultId(id: string): Promise<VSBufferReadableStream>;
    protected storeOutputForResultId(id: string, input: VSBufferWriteableStream): Promise<void>;
    /**
     * @inheritdoc
     */
    persist(results: ReadonlyArray<ITestResult>): Promise<void>;
    /**
     * Cleans up orphaned files. For instance, output can get orphaned if it's
     * written but the editor is closed before the test run is complete.
     */
    private cleanupDereferenced;
    private getResultJsonPath;
    private getResultOutputPath;
}
