import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ILifecycleService, ShutdownReason } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IWorkingCopy } from "vs/workbench/services/workingCopy/common/workingCopy";
import { IWorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackup";
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from "vs/workbench/services/workingCopy/common/workingCopyEditorService";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
/**
 * The working copy backup tracker deals with:
 * - restoring backups that exist
 * - creating backups for modified working copies
 * - deleting backups for saved working copies
 * - handling backups on shutdown
 */
export declare abstract class WorkingCopyBackupTracker extends Disposable {
    protected readonly workingCopyBackupService: IWorkingCopyBackupService;
    protected readonly workingCopyService: IWorkingCopyService;
    protected readonly logService: ILogService;
    private readonly lifecycleService;
    protected readonly filesConfigurationService: IFilesConfigurationService;
    private readonly workingCopyEditorService;
    protected readonly editorService: IEditorService;
    private readonly editorGroupService;
    constructor(workingCopyBackupService: IWorkingCopyBackupService, workingCopyService: IWorkingCopyService, logService: ILogService, lifecycleService: ILifecycleService, filesConfigurationService: IFilesConfigurationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    private registerListeners;
    protected abstract onFinalBeforeShutdown(reason: ShutdownReason): boolean | Promise<boolean>;
    private onWillShutdown;
    private static readonly DEFAULT_BACKUP_SCHEDULE_DELAYS;
    private readonly mapWorkingCopyToContentVersion;
    protected readonly pendingBackupOperations: Map<IWorkingCopyIdentifier, {
        disposable: IDisposable;
        cancel: () => void;
    }>;
    private suspended;
    private onDidRegister;
    private onDidUnregister;
    private onDidChangeDirty;
    private onDidChangeContent;
    private scheduleBackup;
    protected getBackupScheduleDelay(workingCopy: IWorkingCopy): number;
    protected getContentVersion(workingCopy: IWorkingCopy): number;
    private discardBackup;
    private doDiscardBackup;
    private cancelBackupOperation;
    private doClearPendingBackupOperation;
    protected cancelBackupOperations(): void;
    protected suspendBackupOperations(): {
        resume: () => void;
    };
    protected readonly unrestoredBackups: Set<IWorkingCopyIdentifier>;
    protected readonly whenReady: Promise<void>;
    private _isReady;
    protected get isReady(): boolean;
    private resolveBackupsToRestore;
    protected restoreBackups(handler: IWorkingCopyEditorHandler): Promise<void>;
}
