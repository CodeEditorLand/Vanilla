import { IDialogService, IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { ILogService } from "vs/platform/log/common/log";
import { INativeHostService } from "vs/platform/native/common/native";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ILifecycleService, ShutdownReason } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IWorkingCopy } from "vs/workbench/services/workingCopy/common/workingCopy";
import { IWorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackup";
import { WorkingCopyBackupTracker } from "vs/workbench/services/workingCopy/common/workingCopyBackupTracker";
import { IWorkingCopyEditorService } from "vs/workbench/services/workingCopy/common/workingCopyEditorService";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
export declare class NativeWorkingCopyBackupTracker extends WorkingCopyBackupTracker implements IWorkbenchContribution {
    private readonly fileDialogService;
    private readonly dialogService;
    private readonly contextService;
    private readonly nativeHostService;
    private readonly environmentService;
    private readonly progressService;
    static readonly ID = "workbench.contrib.nativeWorkingCopyBackupTracker";
    constructor(workingCopyBackupService: IWorkingCopyBackupService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, lifecycleService: ILifecycleService, fileDialogService: IFileDialogService, dialogService: IDialogService, contextService: IWorkspaceContextService, nativeHostService: INativeHostService, logService: ILogService, environmentService: IEnvironmentService, progressService: IProgressService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    protected onFinalBeforeShutdown(reason: ShutdownReason): Promise<boolean>;
    protected onBeforeShutdownWithModified(reason: ShutdownReason, modifiedWorkingCopies: readonly IWorkingCopy[]): Promise<boolean>;
    private handleModifiedBeforeShutdown;
    private shouldBackupBeforeShutdown;
    private showErrorDialog;
    private toForceShutdownLabel;
    private backupBeforeShutdown;
    private confirmBeforeShutdown;
    private doSaveAllBeforeShutdown;
    private doRevertAllBeforeShutdown;
    private onBeforeShutdownWithoutModified;
    private noVeto;
    private discardBackupsBeforeShutdown;
    private withProgressAndCancellation;
}
