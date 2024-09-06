import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
export declare class ReplAccessibilityAnnouncer extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor(debugService: IDebugService, accessibilityService: IAccessibilityService, logService: ILogService);
}
