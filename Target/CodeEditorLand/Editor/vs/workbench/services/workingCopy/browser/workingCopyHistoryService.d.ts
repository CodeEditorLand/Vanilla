import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IFileService } from "vs/platform/files/common/files";
import { ILabelService } from "vs/platform/label/common/label";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { IWorkingCopyHistoryModelOptions, WorkingCopyHistoryService } from "vs/workbench/services/workingCopy/common/workingCopyHistoryService";
export declare class BrowserWorkingCopyHistoryService extends WorkingCopyHistoryService {
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, logService: ILogService, configurationService: IConfigurationService);
    protected getModelOptions(): IWorkingCopyHistoryModelOptions;
}
