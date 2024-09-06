import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { AbstractPathService } from "../common/pathService.js";
export declare class NativePathService extends AbstractPathService {
    constructor(remoteAgentService: IRemoteAgentService, environmentService: INativeWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
}
