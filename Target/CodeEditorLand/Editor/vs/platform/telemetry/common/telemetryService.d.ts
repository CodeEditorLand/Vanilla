import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IProductService } from "vs/platform/product/common/productService";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "vs/platform/telemetry/common/gdprTypings";
import { ICommonProperties, ITelemetryData, ITelemetryService, TelemetryLevel } from "vs/platform/telemetry/common/telemetry";
import { ITelemetryAppender } from "vs/platform/telemetry/common/telemetryUtils";
export interface ITelemetryServiceConfig {
    appenders: ITelemetryAppender[];
    sendErrorTelemetry?: boolean;
    commonProperties?: ICommonProperties;
    piiPaths?: string[];
}
export declare class TelemetryService implements ITelemetryService {
    private _configurationService;
    private _productService;
    static readonly IDLE_START_EVENT_NAME = "UserIdleStart";
    static readonly IDLE_STOP_EVENT_NAME = "UserIdleStop";
    readonly _serviceBrand: undefined;
    readonly sessionId: string;
    readonly machineId: string;
    readonly sqmId: string;
    readonly devDeviceId: string;
    readonly firstSessionDate: string;
    readonly msftInternal: boolean | undefined;
    private _appenders;
    private _commonProperties;
    private _experimentProperties;
    private _piiPaths;
    private _telemetryLevel;
    private _sendErrorTelemetry;
    private readonly _disposables;
    private _cleanupPatterns;
    constructor(config: ITelemetryServiceConfig, _configurationService: IConfigurationService, _productService: IProductService);
    setExperimentProperty(name: string, value: string): void;
    private _updateTelemetryLevel;
    get sendErrorTelemetry(): boolean;
    get telemetryLevel(): TelemetryLevel;
    dispose(): void;
    private _log;
    publicLog(eventName: string, data?: ITelemetryData): void;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    publicLogError(errorEventName: string, data?: ITelemetryData): void;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}
