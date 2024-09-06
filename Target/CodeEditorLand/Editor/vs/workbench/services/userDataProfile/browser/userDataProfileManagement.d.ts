import { Disposable } from "vs/base/common/lifecycle";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IRequestService } from "vs/platform/request/common/request";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfilesService, IUserDataProfileUpdateOptions } from "vs/platform/userDataProfile/common/userDataProfile";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IProfileTemplateInfo, IUserDataProfileManagementService, IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export type ProfileManagementActionExecutedClassification = {
    owner: "sandy081";
    comment: "Logged when profile management action is excuted";
    id: {
        classification: "SystemMetaData";
        purpose: "FeatureInsight";
        comment: "The identifier of the action that was run.";
    };
};
export type ProfileManagementActionExecutedEvent = {
    id: string;
};
export declare class UserDataProfileManagementService extends Disposable implements IUserDataProfileManagementService {
    private readonly userDataProfilesService;
    private readonly userDataProfileService;
    private readonly hostService;
    private readonly dialogService;
    private readonly workspaceContextService;
    private readonly extensionService;
    private readonly environmentService;
    private readonly telemetryService;
    private readonly productService;
    private readonly requestService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    constructor(userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService, hostService: IHostService, dialogService: IDialogService, workspaceContextService: IWorkspaceContextService, extensionService: IExtensionService, environmentService: IWorkbenchEnvironmentService, telemetryService: ITelemetryService, productService: IProductService, requestService: IRequestService, logService: ILogService);
    private onDidChangeProfiles;
    private onDidResetWorkspaces;
    private onDidChangeCurrentProfile;
    createProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterTransientProfile(): Promise<IUserDataProfile>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    switchProfile(profile: IUserDataProfile): Promise<void>;
    getBuiltinProfileTemplates(): Promise<IProfileTemplateInfo[]>;
    private changeCurrentProfile;
}
