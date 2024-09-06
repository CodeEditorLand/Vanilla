import { AddFirstParameterToFunctions } from "vs/base/common/types";
import { URI } from "vs/base/common/uri";
import { IFolderBackupInfo, IWorkspaceBackupInfo } from "vs/platform/backup/common/backup";
import { IBackupMainService } from "vs/platform/backup/electron-main/backup";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
import { IWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
import { IEnterWorkspaceResult, IRecent, IRecentlyOpened, IWorkspaceFolderCreationData, IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { IWorkspacesHistoryMainService } from "vs/platform/workspaces/electron-main/workspacesHistoryMainService";
import { IWorkspacesManagementMainService } from "vs/platform/workspaces/electron-main/workspacesManagementMainService";
export declare class WorkspacesMainService implements AddFirstParameterToFunctions<IWorkspacesService, Promise<unknown>, number> {
    private readonly workspacesManagementMainService;
    private readonly windowsMainService;
    private readonly workspacesHistoryMainService;
    private readonly backupMainService;
    readonly _serviceBrand: undefined;
    constructor(workspacesManagementMainService: IWorkspacesManagementMainService, windowsMainService: IWindowsMainService, workspacesHistoryMainService: IWorkspacesHistoryMainService, backupMainService: IBackupMainService);
    enterWorkspace(windowId: number, path: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(windowId: number, folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(windowId: number, workspace: IWorkspaceIdentifier): Promise<void>;
    getWorkspaceIdentifier(windowId: number, workspacePath: URI): Promise<IWorkspaceIdentifier>;
    readonly onDidChangeRecentlyOpened: any;
    getRecentlyOpened(windowId: number): Promise<IRecentlyOpened>;
    addRecentlyOpened(windowId: number, recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(windowId: number, paths: URI[]): Promise<void>;
    clearRecentlyOpened(windowId: number): Promise<void>;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
