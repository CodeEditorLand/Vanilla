import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IEditorGroupsService } from "../../editor/common/editorGroupsService.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService, ShutdownReason } from "../../lifecycle/common/lifecycle.js";
import { IWorkingCopy, IWorkingCopyIdentifier } from "./workingCopy.js";
import { IWorkingCopyBackupService } from "./workingCopyBackup.js";
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from "./workingCopyEditorService.js";
import { IWorkingCopyService } from "./workingCopyService.js";
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
