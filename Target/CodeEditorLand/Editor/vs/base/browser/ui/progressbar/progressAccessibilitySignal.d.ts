import { IDisposable } from "vs/base/common/lifecycle";
export interface IScopedAccessibilityProgressSignalDelegate extends IDisposable {
}
export declare function setProgressAcccessibilitySignalScheduler(progressAccessibilitySignalScheduler: (msDelayTime: number, msLoopTime?: number) => IScopedAccessibilityProgressSignalDelegate): void;
export declare function getProgressAcccessibilitySignalScheduler(msDelayTime: number, msLoopTime?: number): IScopedAccessibilityProgressSignalDelegate;
