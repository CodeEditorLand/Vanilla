import { Disposable } from "../../../base/common/lifecycle.js";
import { IRemoteAuthorityResolverService } from "../../../platform/remote/common/remoteAuthorityResolver.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadRemoteConnectionData extends Disposable {
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService);
}
