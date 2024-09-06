import { IMainProcessDiagnostics, IRemoteDiagnosticError, IRemoteDiagnosticInfo } from "vs/platform/diagnostics/common/diagnostics";
import { ILogService } from "vs/platform/log/common/log";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
import { IWorkspacesManagementMainService } from "vs/platform/workspaces/electron-main/workspacesManagementMainService";
export declare const ID = "diagnosticsMainService";
export declare const IDiagnosticsMainService: any;
export interface IRemoteDiagnosticOptions {
    includeProcesses?: boolean;
    includeWorkspaceMetadata?: boolean;
}
export interface IDiagnosticsMainService {
    readonly _serviceBrand: undefined;
    getRemoteDiagnostics(options: IRemoteDiagnosticOptions): Promise<(IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]>;
    getMainDiagnostics(): Promise<IMainProcessDiagnostics>;
}
export declare class DiagnosticsMainService implements IDiagnosticsMainService {
    private readonly windowsMainService;
    private readonly workspacesManagementMainService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(windowsMainService: IWindowsMainService, workspacesManagementMainService: IWorkspacesManagementMainService, logService: ILogService);
    getRemoteDiagnostics(options: IRemoteDiagnosticOptions): Promise<(IRemoteDiagnosticInfo | IRemoteDiagnosticError)[]>;
    getMainDiagnostics(): Promise<IMainProcessDiagnostics>;
    private codeWindowToInfo;
    private browserWindowToInfo;
    private getFolderURIs;
}
