import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { WorkingCopyHistoryService, type IWorkingCopyHistoryModelOptions } from "../common/workingCopyHistoryService.js";
export declare class BrowserWorkingCopyHistoryService extends WorkingCopyHistoryService {
    constructor(fileService: IFileService, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, labelService: ILabelService, logService: ILogService, configurationService: IConfigurationService);
    protected getModelOptions(): IWorkingCopyHistoryModelOptions;
}
