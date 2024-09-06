import { Event } from "vs/base/common/event";
import { IChannel, IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { IDiagnosticInfo, IDiagnosticInfoOptions } from "vs/platform/diagnostics/common/diagnostics";
import { PersistentConnectionEvent } from "vs/platform/remote/common/remoteAgentConnection";
import { IRemoteAgentEnvironment, RemoteAgentConnectionContext } from "vs/platform/remote/common/remoteAgentEnvironment";
import { ITelemetryData, TelemetryLevel } from "vs/platform/telemetry/common/telemetry";
export declare const IRemoteAgentService: any;
export interface IRemoteAgentService {
    readonly _serviceBrand: undefined;
    getConnection(): IRemoteAgentConnection | null;
    /**
     * Get the remote environment. In case of an error, returns `null`.
     */
    getEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    /**
     * Get the remote environment. Can return an error.
     */
    getRawEnvironment(): Promise<IRemoteAgentEnvironment | null>;
    /**
     * Get exit information for a remote extension host.
     */
    getExtensionHostExitInfo(reconnectionToken: string): Promise<IExtensionHostExitInfo | null>;
    /**
     * Gets the round trip time from the remote extension host. Note that this
     * may be delayed if the extension host is busy.
     */
    getRoundTripTime(): Promise<number | undefined>;
    /**
     * Gracefully ends the current connection, if any.
     */
    endConnection(): Promise<void>;
    getDiagnosticInfo(options: IDiagnosticInfoOptions): Promise<IDiagnosticInfo | undefined>;
    updateTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
    logTelemetry(eventName: string, data?: ITelemetryData): Promise<void>;
    flushTelemetry(): Promise<void>;
}
export interface IExtensionHostExitInfo {
    code: number;
    signal: string;
}
export interface IRemoteAgentConnection {
    readonly remoteAuthority: string;
    readonly onReconnecting: Event<void>;
    readonly onDidStateChange: Event<PersistentConnectionEvent>;
    end(): Promise<void>;
    dispose(): void;
    getChannel<T extends IChannel>(channelName: string): T;
    withChannel<T extends IChannel, R>(channelName: string, callback: (channel: T) => Promise<R>): Promise<R>;
    registerChannel<T extends IServerChannel<RemoteAgentConnectionContext>>(channelName: string, channel: T): void;
    getInitialConnectionTimeMs(): Promise<number>;
}
export interface IRemoteConnectionLatencyMeasurement {
    readonly initial: number | undefined;
    readonly current: number;
    readonly average: number;
    readonly high: boolean;
}
export declare const remoteConnectionLatencyMeasurer: {
    readonly maxSampleCount: 5;
    readonly sampleDelay: 2000;
    readonly initial: number[];
    readonly maxInitialCount: 3;
    readonly average: number[];
    readonly maxAverageCount: 100;
    readonly highLatencyMultiple: 2;
    readonly highLatencyMinThreshold: 500;
    readonly highLatencyMaxThreshold: 1500;
    lastMeasurement: IRemoteConnectionLatencyMeasurement | undefined;
    readonly latency: IRemoteConnectionLatencyMeasurement | undefined;
    measure(remoteAgentService: IRemoteAgentService): Promise<IRemoteConnectionLatencyMeasurement | undefined>;
};
