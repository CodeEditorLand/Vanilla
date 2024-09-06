import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IURLService } from "vs/platform/url/common/url";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IWorkspaceTagsService } from "vs/workbench/contrib/tags/common/workspaceTags";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IUserDataProfileManagementService, IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare const OpenProfileMenu: any;
export declare class UserDataProfilesWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly userDataProfileManagementService;
    private readonly telemetryService;
    private readonly workspaceContextService;
    private readonly workspaceTagsService;
    private readonly editorGroupsService;
    private readonly instantiationService;
    private readonly lifecycleService;
    private readonly urlService;
    static readonly ID = "workbench.contrib.userDataProfiles";
    private readonly currentProfileContext;
    private readonly isCurrentProfileTransientContext;
    private readonly hasProfilesContext;
    constructor(userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, userDataProfileManagementService: IUserDataProfileManagementService, telemetryService: ITelemetryService, workspaceContextService: IWorkspaceContextService, workspaceTagsService: IWorkspaceTagsService, contextKeyService: IContextKeyService, editorGroupsService: IEditorGroupsService, instantiationService: IInstantiationService, lifecycleService: ILifecycleService, urlService: IURLService, environmentService: IBrowserWorkbenchEnvironmentService);
    handleURL(uri: URI): Promise<boolean>;
    private openProfilesEditor;
    private registerEditor;
    private registerActions;
    private registerOpenProfileSubMenu;
    private readonly profilesDisposable;
    private registerProfilesActions;
    private registerNewWindowWithProfileAction;
    private registerNewWindowAction;
    private registerSwitchProfileAction;
    private registerManageProfilesAction;
    private registerExportCurrentProfileAction;
    private registerCreateFromCurrentProfileAction;
    private registerNewProfileAction;
    private registerDeleteProfileAction;
    private registerHelpAction;
    private reportWorkspaceProfileInfo;
}
