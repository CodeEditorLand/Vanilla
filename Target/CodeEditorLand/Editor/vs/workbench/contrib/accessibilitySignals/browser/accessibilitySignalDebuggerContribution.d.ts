import { Disposable } from "vs/base/common/lifecycle";
import { AccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
export declare class AccessibilitySignalLineDebuggerContribution extends Disposable implements IWorkbenchContribution {
    private readonly accessibilitySignalService;
    constructor(debugService: IDebugService, accessibilitySignalService: AccessibilitySignalService);
    private handleSession;
}
