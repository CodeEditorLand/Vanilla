import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { IDebugService } from "../common/debug.js";
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
