import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IFolderBackupInfo, IWorkspaceBackupInfo } from "vs/platform/backup/common/backup";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkspaceContextService, IWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
import { IEnterWorkspaceResult, IRecent, IRecentlyOpened, IWorkspaceFolderCreationData, IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class BrowserWorkspacesService extends Disposable implements IWorkspacesService {
    private readonly storageService;
    private readonly contextService;
    private readonly logService;
    private readonly fileService;
    private readonly environmentService;
    private readonly uriIdentityService;
    static readonly RECENTLY_OPENED_KEY = "recently.opened";
    readonly _serviceBrand: undefined;
    private readonly _onRecentlyOpenedChange;
    readonly onDidChangeRecentlyOpened: any;
    constructor(storageService: IStorageService, contextService: IWorkspaceContextService, logService: ILogService, fileService: IFileService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService);
    private registerListeners;
    private onDidChangeWorkspaceFolders;
    private addWorkspaceToRecentlyOpened;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(paths: URI[]): Promise<void>;
    private doRemoveRecentlyOpened;
    private saveRecentlyOpened;
    clearRecentlyOpened(): Promise<void>;
    enterWorkspace(workspaceUri: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    getWorkspaceIdentifier(workspaceUri: URI): Promise<IWorkspaceIdentifier>;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}