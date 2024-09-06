import { IFolderBackupInfo, IWorkspaceBackupInfo } from "vs/platform/backup/common/backup";
import { IBackupMainService } from "vs/platform/backup/electron-main/backup";
import { IEmptyWindowBackupInfo } from "vs/platform/backup/node/backup";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentMainService } from "vs/platform/environment/electron-main/environmentMainService";
import { ILogService } from "vs/platform/log/common/log";
import { IStateService } from "vs/platform/state/node/state";
export declare class BackupMainService implements IBackupMainService {
    private readonly environmentMainService;
    private readonly configurationService;
    private readonly logService;
    private readonly stateService;
    readonly _serviceBrand: undefined;
    private static readonly backupWorkspacesMetadataStorageKey;
    protected backupHome: any;
    private workspaces;
    private folders;
    private emptyWindows;
    private readonly backupUriComparer;
    private readonly backupPathComparer;
    constructor(environmentMainService: IEnvironmentMainService, configurationService: IConfigurationService, logService: ILogService, stateService: IStateService);
    initialize(): Promise<void>;
    protected getWorkspaceBackups(): IWorkspaceBackupInfo[];
    protected getFolderBackups(): IFolderBackupInfo[];
    isHotExitEnabled(): boolean;
    private isHotExitOnExitAndWindowClose;
    private getHotExitConfig;
    getEmptyWindowBackups(): IEmptyWindowBackupInfo[];
    registerWorkspaceBackup(workspaceInfo: IWorkspaceBackupInfo): string;
    registerWorkspaceBackup(workspaceInfo: IWorkspaceBackupInfo, migrateFrom: string): Promise<string>;
    private moveBackupFolder;
    registerFolderBackup(folderInfo: IFolderBackupInfo): string;
    registerEmptyWindowBackup(emptyWindowInfo: IEmptyWindowBackupInfo): string;
    private validateWorkspaces;
    private validateFolders;
    private validateEmptyWorkspaces;
    private deleteStaleBackup;
    private prepareNewEmptyWindowBackup;
    private convertToEmptyWindowBackup;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
    private hasBackups;
    private doHasBackups;
    private storeWorkspacesMetadata;
    protected getFolderHash(folder: IFolderBackupInfo): string;
}
