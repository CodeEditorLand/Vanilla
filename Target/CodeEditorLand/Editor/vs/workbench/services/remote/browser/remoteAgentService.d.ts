import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IRemoteAuthorityResolverService } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { IRemoteSocketFactoryService } from "../../../../platform/remote/common/remoteSocketFactoryService.js";
import { ISignService } from "../../../../platform/sign/common/sign.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractRemoteAgentService } from "../common/abstractRemoteAgentService.js";
import { IRemoteAgentService } from "../common/remoteAgentService.js";
export declare class RemoteAgentService extends AbstractRemoteAgentService implements IRemoteAgentService {
    constructor(remoteSocketFactoryService: IRemoteSocketFactoryService, userDataProfileService: IUserDataProfileService, environmentService: IWorkbenchEnvironmentService, productService: IProductService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, signService: ISignService, logService: ILogService);
}
