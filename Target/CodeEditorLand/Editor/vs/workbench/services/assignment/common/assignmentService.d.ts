import { IAssignmentService } from "vs/platform/assignment/common/assignment";
import { BaseAssignmentService } from "vs/platform/assignment/common/assignmentService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare const IWorkbenchAssignmentService: any;
export interface IWorkbenchAssignmentService extends IAssignmentService {
    getCurrentExperiments(): Promise<string[] | undefined>;
}
export declare class WorkbenchAssignmentService extends BaseAssignmentService {
    private telemetryService;
    constructor(telemetryService: ITelemetryService, storageService: IStorageService, configurationService: IConfigurationService, productService: IProductService, environmentService: IEnvironmentService);
    protected get experimentsEnabled(): boolean;
    getTreatment<T extends string | number | boolean>(name: string): Promise<T | undefined>;
    getCurrentExperiments(): Promise<string[] | undefined>;
}
