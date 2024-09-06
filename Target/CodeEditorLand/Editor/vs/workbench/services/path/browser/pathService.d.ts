import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { AbstractPathService } from "../common/pathService.js";
export declare class BrowserPathService extends AbstractPathService {
    constructor(remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
}
