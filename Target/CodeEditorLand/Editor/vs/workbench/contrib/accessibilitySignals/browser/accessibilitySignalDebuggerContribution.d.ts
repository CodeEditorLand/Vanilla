import { Disposable } from "../../../../base/common/lifecycle.js";
import { type AccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import { IDebugService } from "../../debug/common/debug.js";
export declare class AccessibilitySignalLineDebuggerContribution extends Disposable implements IWorkbenchContribution {
    private readonly accessibilitySignalService;
    constructor(debugService: IDebugService, accessibilitySignalService: AccessibilitySignalService);
    private handleSession;
}
