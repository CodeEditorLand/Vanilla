import type { IExperimentationTelemetry, ExperimentationService as TASClient } from "tas-client-umd";
import type { IConfigurationService } from "../../configuration/common/configuration.js";
import type { IEnvironmentService } from "../../environment/common/environment.js";
import type { IProductService } from "../../product/common/productService.js";
import { type IAssignmentService } from "./assignment.js";
export declare abstract class BaseAssignmentService implements IAssignmentService {
    private readonly machineId;
    protected readonly configurationService: IConfigurationService;
    protected readonly productService: IProductService;
    protected readonly environmentService: IEnvironmentService;
    protected telemetry: IExperimentationTelemetry;
    private keyValueStorage?;
    _serviceBrand: undefined;
    protected tasClient: Promise<TASClient> | undefined;
    private networkInitialized;
    private overrideInitDelay;
    protected get experimentsEnabled(): boolean;
    constructor(machineId: string, configurationService: IConfigurationService, productService: IProductService, environmentService: IEnvironmentService, telemetry: IExperimentationTelemetry, keyValueStorage?: any);
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
    private setupTASClient;
}
