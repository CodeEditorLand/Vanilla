import { CancellationToken } from "vs/base/common/cancellation";
import { ITransaction } from "vs/base/common/observable";
import { URI } from "vs/base/common/uri";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { TestId } from "vs/workbench/contrib/testing/common/testId";
import { LiveTestResult } from "vs/workbench/contrib/testing/common/testResult";
import { CoverageDetails, ICoverageCount, IFileCoverage } from "vs/workbench/contrib/testing/common/testTypes";
export interface ICoverageAccessor {
    getCoverageDetails: (id: string, testId: string | undefined, token: CancellationToken) => Promise<CoverageDetails[]>;
}
/**
 * Class that exposese coverage information for a run.
 */
export declare class TestCoverage {
    readonly result: LiveTestResult;
    readonly fromTaskId: string;
    private readonly uriIdentityService;
    private readonly accessor;
    private readonly fileCoverage;
    readonly didAddCoverage: any;
    readonly tree: any;
    readonly associatedData: Map<unknown, unknown>;
    constructor(result: LiveTestResult, fromTaskId: string, uriIdentityService: IUriIdentityService, accessor: ICoverageAccessor);
    /** Gets all test IDs that were included in this test run. */
    allPerTestIDs(): Generator<any, void, unknown>;
    append(coverage: IFileCoverage, tx: ITransaction | undefined): void;
    /**
     * Builds a new tree filtered to per-test coverage data for the given ID.
     */
    filterTreeForTest(testId: TestId): any;
    /**
     * Gets coverage information for all files.
     */
    getAllFiles(): any;
    /**
     * Gets coverage information for a specific file.
     */
    getUri(uri: URI): any;
    /**
     * Gets computed information for a file, including DFS-computed information
     * from child tests.
     */
    getComputedForUri(uri: URI): any;
    private treePathForUri;
    private treePathToUri;
}
export declare const getTotalCoveragePercent: (statement: ICoverageCount, branch: ICoverageCount | undefined, function_: ICoverageCount | undefined) => number;
export declare abstract class AbstractFileCoverage {
    readonly fromResult: LiveTestResult;
    id: string;
    readonly uri: URI;
    statement: ICoverageCount;
    branch?: ICoverageCount;
    declaration?: ICoverageCount;
    readonly didChange: any;
    /**
     * Gets the total coverage percent based on information provided.
     * This is based on the Clover total coverage formula
     */
    get tpc(): number;
    /**
     * Per-test coverage data for this file, if available.
     */
    perTestData?: Set<string>;
    constructor(coverage: IFileCoverage, fromResult: LiveTestResult);
}
/**
 * File coverage info computed from children in the tree, not provided by the
 * extension.
 */
export declare class ComputedFileCoverage extends AbstractFileCoverage {
}
/**
 * A virtual node that doesn't have any added coverage info.
 */
export declare class BypassedFileCoverage extends ComputedFileCoverage {
    constructor(uri: URI, result: LiveTestResult);
}
export declare class FileCoverage extends AbstractFileCoverage {
    private readonly accessor;
    private _details?;
    private resolved?;
    private _detailsForTest?;
    /** Gets whether details are synchronously available */
    get hasSynchronousDetails(): boolean | undefined;
    constructor(coverage: IFileCoverage, fromResult: LiveTestResult, accessor: ICoverageAccessor);
    /**
     * Gets per-line coverage details.
     */
    detailsForTest(_testId: TestId, token?: any): Promise<CoverageDetails[]>;
    /**
     * Gets per-line coverage details.
     */
    details(token?: any): Promise<CoverageDetails[]>;
}
export declare const totalFromCoverageDetails: (uri: URI, details: CoverageDetails[]) => IFileCoverage;
