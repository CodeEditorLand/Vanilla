import type * as performance from "../../../../base/common/performance.js";
import type * as platform from "../../../../base/common/platform.js";
import { type UriComponents, type UriDto } from "../../../../base/common/uri.js";
import type { IChannel } from "../../../../base/parts/ipc/common/ipc.js";
import type { IDiagnosticInfo, IDiagnosticInfoOptions } from "../../../../platform/diagnostics/common/diagnostics.js";
import type { IRemoteAgentEnvironment } from "../../../../platform/remote/common/remoteAgentEnvironment.js";
import type { ITelemetryData, TelemetryLevel } from "../../../../platform/telemetry/common/telemetry.js";
import type { IUserDataProfile } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import type { IExtensionHostExitInfo } from "./remoteAgentService.js";
export interface IGetEnvironmentDataArguments {
    remoteAuthority: string;
    profile?: string;
}
export interface IGetExtensionHostExitInfoArguments {
    remoteAuthority: string;
    reconnectionToken: string;
}
export interface IRemoteAgentEnvironmentDTO {
    pid: number;
    connectionToken: string;
    appRoot: UriComponents;
    settingsPath: UriComponents;
    logsPath: UriComponents;
    extensionHostLogsPath: UriComponents;
    globalStorageHome: UriComponents;
    workspaceStorageHome: UriComponents;
    localHistoryHome: UriComponents;
    userHome: UriComponents;
    os: platform.OperatingSystem;
    arch: string;
    marks: performance.PerformanceMark[];
    useHostProxy: boolean;
    profiles: {
        all: UriDto<IUserDataProfile[]>;
        home: UriComponents;
    };
    isUnsupportedGlibc: boolean;
}
export declare class RemoteExtensionEnvironmentChannelClient {
    static getEnvironmentData(channel: IChannel, remoteAuthority: string, profile: string | undefined): Promise<IRemoteAgentEnvironment>;
    static getExtensionHostExitInfo(channel: IChannel, remoteAuthority: string, reconnectionToken: string): Promise<IExtensionHostExitInfo | null>;
    static getDiagnosticInfo(channel: IChannel, options: IDiagnosticInfoOptions): Promise<IDiagnosticInfo>;
    static updateTelemetryLevel(channel: IChannel, telemetryLevel: TelemetryLevel): Promise<void>;
    static logTelemetry(channel: IChannel, eventName: string, data: ITelemetryData): Promise<void>;
    static flushTelemetry(channel: IChannel): Promise<void>;
    static ping(channel: IChannel): Promise<void>;
}
