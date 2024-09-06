import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ITitleService } from "../../../services/title/browser/titleService.js";
import { IDebugService } from "../common/debug.js";
export declare class DebugTitleContribution implements IWorkbenchContribution {
    private toDispose;
    constructor(debugService: IDebugService, hostService: IHostService, titleService: ITitleService);
    dispose(): void;
}
