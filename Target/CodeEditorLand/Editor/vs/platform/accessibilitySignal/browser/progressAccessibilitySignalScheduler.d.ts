import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
/**
 * Schedules a signal to play while progress is happening.
 */
export declare class AccessibilityProgressSignalScheduler extends Disposable {
    private readonly _accessibilitySignalService;
    private _scheduler;
    private _signalLoop;
    constructor(msDelayTime: number, msLoopTime: number | undefined, _accessibilitySignalService: IAccessibilitySignalService);
    dispose(): void;
}
