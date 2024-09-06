import { URI } from "vs/base/common/uri";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IDialogService, IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IWorkspacesService } from "vs/platform/workspaces/common/workspaces";
import { WorkspaceService } from "vs/workbench/services/configuration/browser/configurationService";
import { IWorkbenchConfigurationService } from "vs/workbench/services/configuration/common/configuration";
import { IJSONEditingService } from "vs/workbench/services/configuration/common/jsonEditing";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
import { AbstractWorkspaceEditingService } from "vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService";
export declare class BrowserWorkspaceEditingService extends AbstractWorkspaceEditingService {
    constructor(jsonEditingService: IJSONEditingService, contextService: WorkspaceService, configurationService: IWorkbenchConfigurationService, notificationService: INotificationService, commandService: ICommandService, fileService: IFileService, textFileService: ITextFileService, workspacesService: IWorkspacesService, environmentService: IWorkbenchEnvironmentService, fileDialogService: IFileDialogService, dialogService: IDialogService, hostService: IHostService, uriIdentityService: IUriIdentityService, workspaceTrustManagementService: IWorkspaceTrustManagementService, userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService);
    enterWorkspace(workspaceUri: URI): Promise<void>;
}
