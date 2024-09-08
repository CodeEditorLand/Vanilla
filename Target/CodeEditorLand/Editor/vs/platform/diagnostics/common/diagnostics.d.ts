import type { IStringDictionary } from "../../../base/common/collections.js";
import type { ProcessItem } from "../../../base/common/processes.js";
import type { UriComponents } from "../../../base/common/uri.js";
import type { IWorkspace } from "../../workspace/common/workspace.js";
export declare const ID = "diagnosticsService";
export declare const IDiagnosticsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDiagnosticsService>;
export interface IDiagnosticsService {
    readonly _serviceBrand: undefined;
    getPerformanceInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<PerformanceInfo>;
    getSystemInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<SystemInfo>;
    getDiagnostics(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<string>;
    getWorkspaceFileExtensions(workspace: IWorkspace): Promise<{
        extensions: string[];
    }>;
    reportWorkspaceStats(workspace: IWorkspaceInformation): Promise<void>;
}
export interface IMachineInfo {
    os: string;
    cpus?: string;
    memory: string;
    vmHint: string;
    linuxEnv?: ILinuxEnv;
}
export interface ILinuxEnv {
    desktopSession?: string;
    xdgSessionDesktop?: string;
    xdgCurrentDesktop?: string;
    xdgSessionType?: string;
}
export interface IDiagnosticInfo {
    machineInfo: IMachineInfo;
    workspaceMetadata?: IStringDictionary<WorkspaceStats>;
    processes?: ProcessItem;
}
export interface SystemInfo extends IMachineInfo {
    processArgs: string;
    gpuStatus: any;
    screenReader: string;
    remoteData: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[];
    load?: string;
}
export interface IRemoteDiagnosticInfo extends IDiagnosticInfo {
    hostName: string;
    latency?: {
        current: number;
        average: number;
    };
}
export interface IRemoteDiagnosticError {
    hostName: string;
    errorMessage: string;
}
export interface IDiagnosticInfoOptions {
    includeProcesses?: boolean;
    folders?: UriComponents[];
    includeExtensions?: boolean;
}
export interface WorkspaceStatItem {
    name: string;
    count: number;
}
export interface WorkspaceStats {
    fileTypes: WorkspaceStatItem[];
    configFiles: WorkspaceStatItem[];
    fileCount: number;
    maxFilesReached: boolean;
    launchConfigFiles: WorkspaceStatItem[];
    totalScanTime: number;
    totalReaddirCount: number;
}
export interface PerformanceInfo {
    processInfo?: string;
    workspaceInfo?: string;
}
export interface IWorkspaceInformation extends IWorkspace {
    telemetryId: string | undefined;
    rendererSessionId: string;
}
export declare function isRemoteDiagnosticError(x: any): x is IRemoteDiagnosticError;
export declare class NullDiagnosticsService implements IDiagnosticsService {
    _serviceBrand: undefined;
    getPerformanceInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<PerformanceInfo>;
    getSystemInfo(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<SystemInfo>;
    getDiagnostics(mainProcessInfo: IMainProcessDiagnostics, remoteInfo: (IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]): Promise<string>;
    getWorkspaceFileExtensions(workspace: IWorkspace): Promise<{
        extensions: string[];
    }>;
    reportWorkspaceStats(workspace: IWorkspaceInformation): Promise<void>;
}
export interface IWindowDiagnostics {
    readonly id: number;
    readonly pid: number;
    readonly title: string;
    readonly folderURIs: UriComponents[];
    readonly remoteAuthority?: string;
}
export interface IProcessDiagnostics {
    readonly pid: number;
    readonly name: string;
}
export interface IMainProcessDiagnostics {
    readonly mainPID: number;
    readonly mainArguments: string[];
    readonly windows: IWindowDiagnostics[];
    readonly pidToNames: IProcessDiagnostics[];
    readonly screenReader: boolean;
    readonly gpuFeatureStatus: any;
}