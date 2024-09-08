import { TestingDisplayedCoveragePercent, type ITestingCoverageBarThresholds } from "../common/configuration.js";
import type { TestId } from "../common/testId.js";
import type { LiveTestResult } from "../common/testResult.js";
import type { ICoverageCount } from "../common/testTypes.js";
import type { CoverageBarSource } from "./testCoverageBars.js";
export declare const percent: (cc: ICoverageCount) => number;
export declare const getCoverageColor: (pct: number, thresholds: ITestingCoverageBarThresholds) => `var(${string})`;
export declare const displayPercent: (value: number, precision?: number) => string;
export declare const calculateDisplayedStat: (coverage: CoverageBarSource, method: TestingDisplayedCoveragePercent) => number;
export declare function getLabelForItem(result: LiveTestResult, testId: TestId, commonPrefixLen: number): string;
export declare namespace labels {
    const showingFilterFor: (label: string) => string;
    const clickToChangeFiltering: string;
    const percentCoverage: (percent: number, precision?: number) => string;
    const allTests: string;
    const pickShowCoverage: string;
}
