import { Disposable } from "vs/base/common/lifecycle";
import { IRemoteAuthorityResolverService } from "vs/platform/remote/common/remoteAuthorityResolver";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadRemoteConnectionData extends Disposable {
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService);
}
