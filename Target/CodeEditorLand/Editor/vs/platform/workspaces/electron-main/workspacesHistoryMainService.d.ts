import { Event as CommonEvent } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IDialogMainService } from "vs/platform/dialogs/electron-main/dialogMainService";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { ILogService } from "vs/platform/log/common/log";
import { IApplicationStorageMainService } from "vs/platform/storage/electron-main/storageMainService";
import { IRecent, IRecentlyOpened } from "vs/platform/workspaces/common/workspaces";
import { IWorkspacesManagementMainService } from "vs/platform/workspaces/electron-main/workspacesManagementMainService";
export declare const IWorkspacesHistoryMainService: any;
export interface IWorkspacesHistoryMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeRecentlyOpened: CommonEvent<void>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    removeRecentlyOpened(paths: URI[]): Promise<void>;
    clearRecentlyOpened(options?: {
        confirm?: boolean;
    }): Promise<void>;
}
export declare class WorkspacesHistoryMainService extends Disposable implements IWorkspacesHistoryMainService {
    private readonly logService;
    private readonly workspacesManagementMainService;
    private readonly lifecycleMainService;
    private readonly applicationStorageMainService;
    private readonly dialogMainService;
    private static readonly MAX_TOTAL_RECENT_ENTRIES;
    private static readonly RECENTLY_OPENED_STORAGE_KEY;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeRecentlyOpened;
    readonly onDidChangeRecentlyOpened: any;
    constructor(logService: ILogService, workspacesManagementMainService: IWorkspacesManagementMainService, lifecycleMainService: ILifecycleMainService, applicationStorageMainService: IApplicationStorageMainService, dialogMainService: IDialogMainService);
    private registerListeners;
    addRecentlyOpened(recentToAdd: IRecent[]): Promise<void>;
    removeRecentlyOpened(recentToRemove: URI[]): Promise<void>;
    clearRecentlyOpened(options?: {
        confirm?: boolean;
    }): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    private mergeEntriesFromStorage;
    private getRecentlyOpenedFromStorage;
    private saveRecentlyOpened;
    private location;
    private containsWorkspace;
    private containsFolder;
    private containsFile;
    private static readonly MAX_MACOS_DOCK_RECENT_WORKSPACES;
    private static readonly MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL;
    private static readonly MAX_WINDOWS_JUMP_LIST_ENTRIES;
    private static readonly COMMON_FILES_FILTER;
    private readonly macOSRecentDocumentsUpdater;
    private handleWindowsJumpList;
    private updateWindowsJumpList;
    private getWindowsJumpListLabel;
    private renderJumpListPathDescription;
    private updateMacOSRecentDocuments;
}
