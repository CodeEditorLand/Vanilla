import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { WorkingCopyBackupService } from "vs/workbench/services/workingCopy/common/workingCopyBackupService";
export declare class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {
    constructor(contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, logService: ILogService);
}
