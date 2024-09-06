import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ISharedProcessService } from "vs/platform/ipc/electron-sandbox/services";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "vs/platform/telemetry/common/gdprTypings";
import { ITelemetryData, ITelemetryService, TelemetryLevel } from "vs/platform/telemetry/common/telemetry";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
export declare class TelemetryService extends Disposable implements ITelemetryService {
    readonly _serviceBrand: undefined;
    private impl;
    readonly sendErrorTelemetry: boolean;
    get sessionId(): string;
    get machineId(): string;
    get sqmId(): string;
    get devDeviceId(): string;
    get firstSessionDate(): string;
    get msftInternal(): boolean | undefined;
    constructor(environmentService: INativeWorkbenchEnvironmentService, productService: IProductService, sharedProcessService: ISharedProcessService, storageService: IStorageService, configurationService: IConfigurationService);
    setExperimentProperty(name: string, value: string): void;
    get telemetryLevel(): TelemetryLevel;
    publicLog(eventName: string, data?: ITelemetryData): void;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    publicLogError(errorEventName: string, data?: ITelemetryData): void;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}
