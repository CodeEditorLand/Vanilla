import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "vs/platform/telemetry/common/gdprTypings";
export declare const ITelemetryService: any;
export interface ITelemetryData {
    from?: string;
    target?: string;
    [key: string]: any;
}
export interface ITelemetryService {
    readonly _serviceBrand: undefined;
    readonly telemetryLevel: TelemetryLevel;
    readonly sessionId: string;
    readonly machineId: string;
    readonly sqmId: string;
    readonly devDeviceId: string;
    readonly firstSessionDate: string;
    readonly msftInternal?: boolean;
    /**
     * Whether error telemetry will get sent. If false, `publicLogError` will no-op.
     */
    readonly sendErrorTelemetry: boolean;
    /**
     * @deprecated Use publicLog2 and the typescript GDPR annotation where possible
     */
    publicLog(eventName: string, data?: ITelemetryData): void;
    /**
     * Sends a telemetry event that has been privacy approved.
     * Do not call this unless you have been given approval.
     */
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    /**
     * @deprecated Use publicLogError2 and the typescript GDPR annotation where possible
     */
    publicLogError(errorEventName: string, data?: ITelemetryData): void;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    setExperimentProperty(name: string, value: string): void;
}
export interface ITelemetryEndpoint {
    id: string;
    aiKey: string;
    sendErrorTelemetry: boolean;
}
export declare const ICustomEndpointTelemetryService: any;
export interface ICustomEndpointTelemetryService {
    readonly _serviceBrand: undefined;
    publicLog(endpoint: ITelemetryEndpoint, eventName: string, data?: ITelemetryData): void;
    publicLogError(endpoint: ITelemetryEndpoint, errorEventName: string, data?: ITelemetryData): void;
}
export declare const currentSessionDateStorageKey = "telemetry.currentSessionDate";
export declare const firstSessionDateStorageKey = "telemetry.firstSessionDate";
export declare const lastSessionDateStorageKey = "telemetry.lastSessionDate";
export declare const machineIdKey = "telemetry.machineId";
export declare const sqmIdKey = "telemetry.sqmId";
export declare const devDeviceIdKey = "telemetry.devDeviceId";
export declare const TELEMETRY_SECTION_ID = "telemetry";
export declare const TELEMETRY_SETTING_ID = "telemetry.telemetryLevel";
export declare const TELEMETRY_CRASH_REPORTER_SETTING_ID = "telemetry.enableCrashReporter";
export declare const TELEMETRY_OLD_SETTING_ID = "telemetry.enableTelemetry";
export declare const enum TelemetryLevel {
    NONE = 0,
    CRASH = 1,
    ERROR = 2,
    USAGE = 3
}
export declare const enum TelemetryConfiguration {
    OFF = "off",
    CRASH = "crash",
    ERROR = "error",
    ON = "all"
}
export interface ICommonProperties {
    [name: string]: string | boolean | undefined;
}
