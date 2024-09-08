var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  IDialogService,
  IFileDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";
import { IWorkbenchConfigurationService } from "../../configuration/common/configuration.js";
import { IJSONEditingService } from "../../configuration/common/jsonEditing.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IHostService } from "../../host/browser/host.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { IWorkspaceEditingService } from "../common/workspaceEditing.js";
import { AbstractWorkspaceEditingService } from "./abstractWorkspaceEditingService.js";
let BrowserWorkspaceEditingService = class extends AbstractWorkspaceEditingService {
  constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
    super(
      jsonEditingService,
      contextService,
      configurationService,
      notificationService,
      commandService,
      fileService,
      textFileService,
      workspacesService,
      environmentService,
      fileDialogService,
      dialogService,
      hostService,
      uriIdentityService,
      workspaceTrustManagementService,
      userDataProfilesService,
      userDataProfileService
    );
  }
  async enterWorkspace(workspaceUri) {
    const result = await this.doEnterWorkspace(workspaceUri);
    if (result) {
      await this.hostService.openWindow([{ workspaceUri }], {
        forceReuseWindow: true
      });
    }
  }
};
BrowserWorkspaceEditingService = __decorateClass([
  __decorateParam(0, IJSONEditingService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IWorkspacesService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IFileDialogService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IUriIdentityService),
  __decorateParam(13, IWorkspaceTrustManagementService),
  __decorateParam(14, IUserDataProfilesService),
  __decorateParam(15, IUserDataProfileService)
], BrowserWorkspaceEditingService);
registerSingleton(
  IWorkspaceEditingService,
  BrowserWorkspaceEditingService,
  InstantiationType.Delayed
);
export {
  BrowserWorkspaceEditingService
};
