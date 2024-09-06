import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ITerminalInstanceService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class RemoteTerminalBackendContribution implements IWorkbenchContribution {
    static ID: string;
    constructor(instantiationService: IInstantiationService, remoteAgentService: IRemoteAgentService, terminalInstanceService: ITerminalInstanceService);
}
