import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILogService } from "vs/platform/log/common/log";
import { IAddressProvider } from "vs/platform/remote/common/remoteAgentConnection";
import { AbstractTunnelService, ITunnelProvider, RemoteTunnel } from "vs/platform/tunnel/common/tunnel";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class TunnelService extends AbstractTunnelService {
    private environmentService;
    constructor(logService: ILogService, environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService);
    isPortPrivileged(_port: number): boolean;
    protected retainOrCreateTunnel(tunnelProvider: IAddressProvider | ITunnelProvider, remoteHost: string, remotePort: number, _localHost: string, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    canTunnel(uri: URI): boolean;
}
