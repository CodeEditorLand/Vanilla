import type * as vscode from "vscode";
import { Disposable, type IDisposable } from "../../../base/common/lifecycle.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { type ProvidedPortAttributes, type RemoteTunnel, type TunnelCreationOptions, type TunnelOptions } from "../../../platform/tunnel/common/tunnel.js";
import type { CandidatePort } from "../../services/remote/common/tunnelModel.js";
import { type ExtHostTunnelServiceShape, type MainThreadTunnelServiceShape, type PortAttributesSelector, type TunnelDto } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export declare namespace TunnelDtoConverter {
    function fromApiTunnel(tunnel: vscode.Tunnel): TunnelDto;
    function fromServiceTunnel(tunnel: RemoteTunnel): TunnelDto;
}
export interface Tunnel extends vscode.Disposable {
    remote: {
        port: number;
        host: string;
    };
    localAddress: string;
}
export interface IExtHostTunnelService extends ExtHostTunnelServiceShape {
    readonly _serviceBrand: undefined;
    openTunnel(extension: IExtensionDescription, forward: TunnelOptions): Promise<vscode.Tunnel | undefined>;
    getTunnels(): Promise<vscode.TunnelDescription[]>;
    onDidChangeTunnels: vscode.Event<void>;
    setTunnelFactory(provider: vscode.RemoteAuthorityResolver | undefined, managedRemoteAuthority: vscode.ManagedResolvedAuthority | undefined): Promise<IDisposable>;
    registerPortsAttributesProvider(portSelector: PortAttributesSelector, provider: vscode.PortAttributesProvider): IDisposable;
    registerTunnelProvider(provider: vscode.TunnelProvider, information: vscode.TunnelInformation): Promise<IDisposable>;
}
export declare const IExtHostTunnelService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTunnelService>;
export declare class ExtHostTunnelService extends Disposable implements IExtHostTunnelService {
    protected readonly logService: ILogService;
    readonly _serviceBrand: undefined;
    protected readonly _proxy: MainThreadTunnelServiceShape;
    private _forwardPortProvider;
    private _showCandidatePort;
    private _extensionTunnels;
    private _onDidChangeTunnels;
    onDidChangeTunnels: vscode.Event<void>;
    private _providerHandleCounter;
    private _portAttributesProviders;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, logService: ILogService);
    openTunnel(extension: IExtensionDescription, forward: TunnelOptions): Promise<vscode.Tunnel | undefined>;
    getTunnels(): Promise<vscode.TunnelDescription[]>;
    private nextPortAttributesProviderHandle;
    registerPortsAttributesProvider(portSelector: PortAttributesSelector, provider: vscode.PortAttributesProvider): vscode.Disposable;
    $providePortAttributes(handles: number[], ports: number[], pid: number | undefined, commandLine: string | undefined, cancellationToken: vscode.CancellationToken): Promise<ProvidedPortAttributes[]>;
    $registerCandidateFinder(_enable: boolean): Promise<void>;
    registerTunnelProvider(provider: vscode.TunnelProvider, information: vscode.TunnelInformation): Promise<IDisposable>;
    /**
     * Applies the tunnel metadata and factory found in the remote authority
     * resolver to the tunnel system.
     *
     * `managedRemoteAuthority` should be be passed if the resolver returned on.
     * If this is the case, the tunnel cannot be connected to via a websocket from
     * the share process, so a synethic tunnel factory is used as a default.
     */
    setTunnelFactory(provider: vscode.RemoteAuthorityResolver | undefined, managedRemoteAuthority: vscode.ManagedResolvedAuthority | undefined): Promise<IDisposable>;
    protected makeManagedTunnelFactory(_authority: vscode.ManagedResolvedAuthority): vscode.RemoteAuthorityResolver["tunnelFactory"];
    $closeTunnel(remote: {
        host: string;
        port: number;
    }, silent?: boolean): Promise<void>;
    $onDidTunnelsChange(): Promise<void>;
    $forwardPort(tunnelOptions: TunnelOptions, tunnelCreationOptions: TunnelCreationOptions): Promise<TunnelDto | string | undefined>;
    $applyCandidateFilter(candidates: CandidatePort[]): Promise<CandidatePort[]>;
}
