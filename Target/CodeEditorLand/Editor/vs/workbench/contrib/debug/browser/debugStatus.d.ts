import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IDebugService } from "vs/workbench/contrib/debug/common/debug";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare class DebugStatusContribution implements IWorkbenchContribution {
    private readonly statusBarService;
    private readonly debugService;
    private showInStatusBar;
    private toDispose;
    private entryAccessor;
    constructor(statusBarService: IStatusbarService, debugService: IDebugService, configurationService: IConfigurationService);
    private get entry();
    dispose(): void;
}
