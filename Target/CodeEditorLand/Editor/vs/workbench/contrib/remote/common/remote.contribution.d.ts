import { ILabelService } from "vs/platform/label/common/label";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class LabelContribution implements IWorkbenchContribution {
    private readonly labelService;
    private readonly remoteAgentService;
    static readonly ID = "workbench.contrib.remoteLabel";
    constructor(labelService: ILabelService, remoteAgentService: IRemoteAgentService);
    private registerFormatters;
}
