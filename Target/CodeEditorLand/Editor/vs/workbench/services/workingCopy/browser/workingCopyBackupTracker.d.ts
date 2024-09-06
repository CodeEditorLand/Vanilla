import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ILifecycleService, ShutdownReason } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IWorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackup";
import { WorkingCopyBackupTracker } from "vs/workbench/services/workingCopy/common/workingCopyBackupTracker";
import { IWorkingCopyEditorService } from "vs/workbench/services/workingCopy/common/workingCopyEditorService";
import { IWorkingCopyService } from "vs/workbench/services/workingCopy/common/workingCopyService";
export declare class BrowserWorkingCopyBackupTracker extends WorkingCopyBackupTracker implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.browserWorkingCopyBackupTracker";
    constructor(workingCopyBackupService: IWorkingCopyBackupService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, lifecycleService: ILifecycleService, logService: ILogService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    protected onFinalBeforeShutdown(reason: ShutdownReason): boolean;
}
