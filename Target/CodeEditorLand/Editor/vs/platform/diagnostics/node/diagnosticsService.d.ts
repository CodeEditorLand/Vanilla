import { IProductService } from "../../product/common/productService.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import type { IWorkspace } from "../../workspace/common/workspace.js";
import { type IDiagnosticsService, type IMachineInfo, type IMainProcessDiagnostics, type IRemoteDiagnosticError, type IRemoteDiagnosticInfo, type IWorkspaceInformation, type PerformanceInfo, type SystemInfo, type WorkspaceStatItem, type WorkspaceStats } from "../common/diagnostics.js";
export declare function collectWorkspaceStats(folder: string, filter: string[]): Promise<WorkspaceStats>;
export declare function getMachineInfo(): IMachineInfo;
export declare function collectLaunchConfigs(folder: string): Promise<WorkspaceStatItem[]>;
export declare class DiagnosticsService implements IDiagnosticsService {
    private readonly telemetryService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(telemetryService: ITelemetryService, productService: IProductService);
    private formatMachineInfo;
    private formatEnvironment;
    getPerformanceInfo(info: IMainProcessDiagnostics, remoteData: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<PerformanceInfo>;
    getSystemInfo(info: IMainProcessDiagnostics, remoteData: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<SystemInfo>;
    getDiagnostics(info: IMainProcessDiagnostics, remoteDiagnostics: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<string>;
    private formatWorkspaceStats;
    private expandGPUFeatures;
    private formatWorkspaceMetadata;
    private formatProcessList;
    private formatProcessItem;
    getWorkspaceFileExtensions(workspace: IWorkspace): Promise<{
        extensions: string[];
    }>;
    reportWorkspaceStats(workspace: IWorkspaceInformation): Promise<void>;
}
