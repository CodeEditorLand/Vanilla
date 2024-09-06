import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IRemoteAuthorityResolverService } from "vs/platform/remote/common/remoteAuthorityResolver";
import { IRemoteSocketFactoryService } from "vs/platform/remote/common/remoteSocketFactoryService";
import { ISignService } from "vs/platform/sign/common/sign";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { AbstractRemoteAgentService } from "vs/workbench/services/remote/common/abstractRemoteAgentService";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class RemoteAgentService extends AbstractRemoteAgentService implements IRemoteAgentService {
    constructor(remoteSocketFactoryService: IRemoteSocketFactoryService, userDataProfileService: IUserDataProfileService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, signService: ISignService, logService: ILogService);
}
