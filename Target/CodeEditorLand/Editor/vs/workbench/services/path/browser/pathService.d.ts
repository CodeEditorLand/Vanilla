import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { AbstractPathService } from "vs/workbench/services/path/common/pathService";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
export declare class BrowserPathService extends AbstractPathService {
    constructor(remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
}
