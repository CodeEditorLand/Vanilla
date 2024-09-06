import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IEditorGroupsService } from "../../editor/common/editorGroupsService.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService, ShutdownReason } from "../../lifecycle/common/lifecycle.js";
import { IWorkingCopyBackupService } from "../common/workingCopyBackup.js";
import { WorkingCopyBackupTracker } from "../common/workingCopyBackupTracker.js";
import { IWorkingCopyEditorService } from "../common/workingCopyEditorService.js";
import { IWorkingCopyService } from "../common/workingCopyService.js";
export declare class BrowserWorkingCopyBackupTracker extends WorkingCopyBackupTracker implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.browserWorkingCopyBackupTracker";
    constructor(workingCopyBackupService: IWorkingCopyBackupService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, lifecycleService: ILifecycleService, logService: ILogService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    protected onFinalBeforeShutdown(reason: ShutdownReason): boolean;
}
