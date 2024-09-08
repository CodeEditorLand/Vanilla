import { type Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import type { TunnelInformation, TunnelPrivacy } from "../../../../platform/remote/common/remoteAuthorityResolver.js";
import { type RemoteTunnel, type TunnelProtocol } from "../../../../platform/tunnel/common/tunnel.js";
import type { IEditableData } from "../../../common/views.js";
import { type IExtensionPointUser } from "../../extensions/common/extensionsRegistry.js";
import { TunnelModel, type Attributes, type CandidatePort, type TunnelCloseReason, type TunnelProperties, type TunnelSource } from "./tunnelModel.js";
export declare const IRemoteExplorerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRemoteExplorerService>;
export declare const REMOTE_EXPLORER_TYPE_KEY: string;
export declare const TUNNEL_VIEW_ID = "~remote.forwardedPorts";
export declare const TUNNEL_VIEW_CONTAINER_ID = "~remote.forwardedPortsContainer";
export declare const PORT_AUTO_FORWARD_SETTING = "remote.autoForwardPorts";
export declare const PORT_AUTO_SOURCE_SETTING = "remote.autoForwardPortsSource";
export declare const PORT_AUTO_FALLBACK_SETTING = "remote.autoForwardPortsFallback";
export declare const PORT_AUTO_SOURCE_SETTING_PROCESS = "process";
export declare const PORT_AUTO_SOURCE_SETTING_OUTPUT = "output";
export declare const PORT_AUTO_SOURCE_SETTING_HYBRID = "hybrid";
export declare enum TunnelType {
    Candidate = "Candidate",
    Detected = "Detected",
    Forwarded = "Forwarded",
    Add = "Add"
}
export interface ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    localAddress?: string;
    protocol: TunnelProtocol;
    localUri?: URI;
    localPort?: number;
    name?: string;
    closeable?: boolean;
    source: {
        source: TunnelSource;
        description: string;
    };
    privacy: TunnelPrivacy;
    processDescription?: string;
    readonly label: string;
}
export declare enum TunnelEditId {
    None = 0,
    New = 1,
    Label = 2,
    LocalPort = 3
}
export interface HelpInformation {
    extensionDescription: IExtensionDescription;
    getStarted?: string | {
        id: string;
    };
    documentation?: string;
    issues?: string;
    reportIssue?: string;
    remoteName?: string[] | string;
    virtualWorkspace?: string;
}
export interface IRemoteExplorerService {
    readonly _serviceBrand: undefined;
    onDidChangeTargetType: Event<string[]>;
    targetType: string[];
    onDidChangeHelpInformation: Event<readonly IExtensionPointUser<HelpInformation>[]>;
    helpInformation: IExtensionPointUser<HelpInformation>[];
    readonly tunnelModel: TunnelModel;
    onDidChangeEditable: Event<{
        tunnel: ITunnelItem;
        editId: TunnelEditId;
    } | undefined>;
    setEditable(tunnelItem: ITunnelItem | undefined, editId: TunnelEditId, data: IEditableData | null): void;
    getEditableData(tunnelItem: ITunnelItem | undefined, editId?: TunnelEditId): IEditableData | undefined;
    forward(tunnelProperties: TunnelProperties, attributes?: Attributes | null): Promise<RemoteTunnel | string | undefined>;
    close(remote: {
        host: string;
        port: number;
    }, reason: TunnelCloseReason): Promise<void>;
    setTunnelInformation(tunnelInformation: TunnelInformation | undefined): void;
    setCandidateFilter(filter: ((candidates: CandidatePort[]) => Promise<CandidatePort[]>) | undefined): IDisposable;
    onFoundNewCandidates(candidates: CandidatePort[]): void;
    restore(): Promise<void>;
    enablePortsFeatures(): void;
    onEnabledPortsFeatures: Event<void>;
    portsFeaturesEnabled: boolean;
    readonly namedProcesses: Map<number, string>;
}
