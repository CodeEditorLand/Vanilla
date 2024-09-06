import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IProductService } from "vs/platform/product/common/productService";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "vs/platform/telemetry/common/gdprTypings";
import { ITelemetryData, ITelemetryService, TelemetryLevel } from "vs/platform/telemetry/common/telemetry";
import { ITelemetryServiceConfig, TelemetryService } from "vs/platform/telemetry/common/telemetryService";
export interface IServerTelemetryService extends ITelemetryService {
    updateInjectedTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
}
export declare class ServerTelemetryService extends TelemetryService implements IServerTelemetryService {
    private _injectedTelemetryLevel;
    constructor(config: ITelemetryServiceConfig, injectedTelemetryLevel: TelemetryLevel, _configurationService: IConfigurationService, _productService: IProductService);
    publicLog(eventName: string, data?: ITelemetryData): any;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): any;
    publicLogError(errorEventName: string, data?: ITelemetryData): any;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): any;
    updateInjectedTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
}
export declare const ServerNullTelemetryService: {
    updateInjectedTelemetryLevel(): Promise<void>;
};
export declare const IServerTelemetryService: any;
