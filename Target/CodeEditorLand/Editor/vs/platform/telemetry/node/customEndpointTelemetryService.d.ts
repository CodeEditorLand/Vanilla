import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { ILoggerService, ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ICustomEndpointTelemetryService, ITelemetryData, ITelemetryEndpoint, ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class CustomEndpointTelemetryService implements ICustomEndpointTelemetryService {
    private readonly configurationService;
    private readonly telemetryService;
    private readonly logService;
    private readonly loggerService;
    private readonly environmentService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private customTelemetryServices;
    constructor(configurationService: IConfigurationService, telemetryService: ITelemetryService, logService: ILogService, loggerService: ILoggerService, environmentService: IEnvironmentService, productService: IProductService);
    private getCustomTelemetryService;
    publicLog(telemetryEndpoint: ITelemetryEndpoint, eventName: string, data?: ITelemetryData): void;
    publicLogError(telemetryEndpoint: ITelemetryEndpoint, errorEventName: string, data?: ITelemetryData): void;
}
