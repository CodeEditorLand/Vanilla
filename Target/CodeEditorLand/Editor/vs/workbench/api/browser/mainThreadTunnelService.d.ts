import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILogService } from "vs/platform/log/common/log";
import { INotificationService } from "vs/platform/notification/common/notification";
import type { TunnelDescription } from "vs/platform/remote/common/remoteAuthorityResolver";
import { ITunnelService, PortAttributesProvider, ProvidedPortAttributes, TunnelOptions, TunnelProviderFeatures } from "vs/platform/tunnel/common/tunnel";
import { CandidatePortSource, MainThreadTunnelServiceShape, PortAttributesSelector, TunnelDto } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IRemoteExplorerService } from "vs/workbench/services/remote/common/remoteExplorerService";
import { CandidatePort } from "vs/workbench/services/remote/common/tunnelModel";
export declare class MainThreadTunnelService extends Disposable implements MainThreadTunnelServiceShape, PortAttributesProvider {
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly notificationService;
    private readonly configurationService;
    private readonly logService;
    private readonly remoteAgentService;
    private readonly contextKeyService;
    private readonly _proxy;
    private elevateionRetry;
    private portsAttributesProviders;
    constructor(extHostContext: IExtHostContext, remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, notificationService: INotificationService, configurationService: IConfigurationService, logService: ILogService, remoteAgentService: IRemoteAgentService, contextKeyService: IContextKeyService);
    private processFindingEnabled;
    $setRemoteTunnelService(processId: number): Promise<void>;
    private _alreadyRegistered;
    $registerPortsAttributesProvider(selector: PortAttributesSelector, providerHandle: number): Promise<void>;
    $unregisterPortsAttributesProvider(providerHandle: number): Promise<void>;
    providePortAttributes(ports: number[], pid: number | undefined, commandLine: string | undefined, token: CancellationToken): Promise<ProvidedPortAttributes[]>;
    $openTunnel(tunnelOptions: TunnelOptions, source: string): Promise<TunnelDto | undefined>;
    private elevationPrompt;
    $closeTunnel(remote: {
        host: string;
        port: number;
    }): Promise<void>;
    $getTunnels(): Promise<TunnelDescription[]>;
    $onFoundNewCandidates(candidates: CandidatePort[]): Promise<void>;
    $setTunnelProvider(features?: TunnelProviderFeatures): Promise<void>;
    $setCandidateFilter(): Promise<void>;
    $setCandidatePortSource(source: CandidatePortSource): Promise<void>;
}
