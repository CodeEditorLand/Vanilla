import * as performance from "vs/base/common/performance";
import * as platform from "vs/base/common/platform";
import { UriComponents, UriDto } from "vs/base/common/uri";
import { IChannel } from "vs/base/parts/ipc/common/ipc";
import { IDiagnosticInfo, IDiagnosticInfoOptions } from "vs/platform/diagnostics/common/diagnostics";
import { IRemoteAgentEnvironment } from "vs/platform/remote/common/remoteAgentEnvironment";
import { ITelemetryData, TelemetryLevel } from "vs/platform/telemetry/common/telemetry";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { IExtensionHostExitInfo } from "vs/workbench/services/remote/common/remoteAgentService";
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
