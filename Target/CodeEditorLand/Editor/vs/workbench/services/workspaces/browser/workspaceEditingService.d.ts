import { URI } from "../../../../base/common/uri.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService, IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";
import { WorkspaceService } from "../../configuration/browser/configurationService.js";
import { IWorkbenchConfigurationService } from "../../configuration/common/configuration.js";
import { IJSONEditingService } from "../../configuration/common/jsonEditing.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IHostService } from "../../host/browser/host.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractWorkspaceEditingService } from "./abstractWorkspaceEditingService.js";
export declare class BrowserWorkspaceEditingService extends AbstractWorkspaceEditingService {
    constructor(jsonEditingService: IJSONEditingService, contextService: WorkspaceService, configurationService: IWorkbenchConfigurationService, notificationService: INotificationService, commandService: ICommandService, fileService: IFileService, textFileService: ITextFileService, workspacesService: IWorkspacesService, environmentService: IWorkbenchEnvironmentService, fileDialogService: IFileDialogService, dialogService: IDialogService, hostService: IHostService, uriIdentityService: IUriIdentityService, workspaceTrustManagementService: IWorkspaceTrustManagementService, userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService);
    enterWorkspace(workspaceUri: URI): Promise<void>;
}
