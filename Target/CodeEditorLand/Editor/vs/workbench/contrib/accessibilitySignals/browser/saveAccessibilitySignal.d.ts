import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
export declare class SaveAccessibilitySignalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _accessibilitySignalService;
    private readonly _workingCopyService;
    static readonly ID = "workbench.contrib.saveAccessibilitySignal";
    constructor(_accessibilitySignalService: IAccessibilitySignalService, _workingCopyService: IWorkingCopyService);
}
