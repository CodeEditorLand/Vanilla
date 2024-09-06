import { Disposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IAddress } from "vs/platform/remote/common/remoteAgentConnection";
import { ISharedProcessTunnel, ISharedProcessTunnelService } from "vs/platform/remote/common/sharedProcessTunnelService";
import { ISharedTunnelsService } from "vs/platform/tunnel/common/tunnel";
export declare class SharedProcessTunnelService extends Disposable implements ISharedProcessTunnelService {
    private readonly _tunnelService;
    private readonly _logService;
    _serviceBrand: undefined;
    private static _lastId;
    private readonly _tunnels;
    private readonly _disposedTunnels;
    constructor(_tunnelService: ISharedTunnelsService, _logService: ILogService);
    dispose(): void;
    createTunnel(): Promise<{
        id: string;
    }>;
    startTunnel(authority: string, id: string, tunnelRemoteHost: string, tunnelRemotePort: number, tunnelLocalHost: string, tunnelLocalPort: number | undefined, elevateIfNeeded: boolean | undefined): Promise<ISharedProcessTunnel>;
    setAddress(id: string, address: IAddress): Promise<void>;
    destroyTunnel(id: string): Promise<void>;
}
