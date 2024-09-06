import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IAddressProvider, IConnectionOptions } from "vs/platform/remote/common/remoteAgentConnection";
import { IRemoteSocketFactoryService } from "vs/platform/remote/common/remoteSocketFactoryService";
import { ISignService } from "vs/platform/sign/common/sign";
import { AbstractTunnelService, ISharedTunnelsService, ITunnelProvider, RemoteTunnel } from "vs/platform/tunnel/common/tunnel";
export declare class NodeRemoteTunnel extends Disposable implements RemoteTunnel {
    private readonly defaultTunnelHost;
    private readonly suggestedLocalPort?;
    readonly tunnelRemotePort: number;
    tunnelLocalPort: number;
    tunnelRemoteHost: string;
    localAddress: string;
    readonly privacy: any;
    private readonly _options;
    private readonly _server;
    private readonly _barrier;
    private readonly _listeningListener;
    private readonly _connectionListener;
    private readonly _errorListener;
    private readonly _socketsDispose;
    constructor(options: IConnectionOptions, defaultTunnelHost: string, tunnelRemoteHost: string, tunnelRemotePort: number, suggestedLocalPort?: number | undefined);
    dispose(): Promise<void>;
    waitForReady(): Promise<this>;
    private _onConnection;
    private _mirrorGenericSocket;
    private _mirrorNodeSocket;
}
export declare class BaseTunnelService extends AbstractTunnelService {
    private readonly remoteSocketFactoryService;
    private readonly signService;
    private readonly productService;
    constructor(remoteSocketFactoryService: IRemoteSocketFactoryService, logService: ILogService, signService: ISignService, productService: IProductService, configurationService: IConfigurationService);
    isPortPrivileged(port: number): boolean;
    protected retainOrCreateTunnel(addressOrTunnelProvider: IAddressProvider | ITunnelProvider, remoteHost: string, remotePort: number, localHost: string, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
}
export declare class TunnelService extends BaseTunnelService {
    constructor(remoteSocketFactoryService: IRemoteSocketFactoryService, logService: ILogService, signService: ISignService, productService: IProductService, configurationService: IConfigurationService);
}
export declare class SharedTunnelsService extends Disposable implements ISharedTunnelsService {
    protected readonly remoteSocketFactoryService: IRemoteSocketFactoryService;
    protected readonly logService: ILogService;
    private readonly productService;
    private readonly signService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private readonly _tunnelServices;
    constructor(remoteSocketFactoryService: IRemoteSocketFactoryService, logService: ILogService, productService: IProductService, signService: ISignService, configurationService: IConfigurationService);
    openTunnel(authority: string, addressProvider: IAddressProvider | undefined, remoteHost: string | undefined, remotePort: number, localHost: string, localPort?: number, elevateIfNeeded?: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined>;
}
