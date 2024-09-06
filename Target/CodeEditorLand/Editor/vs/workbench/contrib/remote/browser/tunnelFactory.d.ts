import { Disposable } from "vs/base/common/lifecycle";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILogService } from "vs/platform/log/common/log";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITunnelService } from "vs/platform/tunnel/common/tunnel";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IRemoteExplorerService } from "vs/workbench/services/remote/common/remoteExplorerService";
export declare class TunnelFactoryContribution extends Disposable implements IWorkbenchContribution {
    private openerService;
    static readonly ID = "workbench.contrib.tunnelFactory";
    constructor(tunnelService: ITunnelService, environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, remoteExplorerService: IRemoteExplorerService, logService: ILogService, contextKeyService: IContextKeyService);
    private resolveExternalUri;
}
