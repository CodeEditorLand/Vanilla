import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { WorkingCopyBackupService } from "../common/workingCopyBackupService.js";
export declare class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {
    constructor(contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, logService: ILogService);
}
