import { CoverageBarSource } from "vs/workbench/contrib/testing/browser/testCoverageBars";
import { ITestingCoverageBarThresholds, TestingDisplayedCoveragePercent } from "vs/workbench/contrib/testing/common/configuration";
import { TestId } from "vs/workbench/contrib/testing/common/testId";
import { LiveTestResult } from "vs/workbench/contrib/testing/common/testResult";
import { ICoverageCount } from "vs/workbench/contrib/testing/common/testTypes";
export declare const percent: (cc: ICoverageCount) => any;
export declare const getCoverageColor: (pct: number, thresholds: ITestingCoverageBarThresholds) => `var(${any})`;
export declare const displayPercent: (value: number, precision?: number) => string;
export declare const calculateDisplayedStat: (coverage: CoverageBarSource, method: TestingDisplayedCoveragePercent) => any;
export declare function getLabelForItem(result: LiveTestResult, testId: TestId, commonPrefixLen: number): string;
export declare namespace labels {
    const showingFilterFor: (label: string) => any;
    const clickToChangeFiltering: any;
    const percentCoverage: (percent: number, precision?: number) => any;
    const allTests: any;
    const pickShowCoverage: any;
}
