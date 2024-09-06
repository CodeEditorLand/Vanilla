import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { RemoteStorageService } from "vs/platform/storage/common/storageService";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IAnyWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class NativeWorkbenchStorageService extends RemoteStorageService {
    private readonly userDataProfileService;
    constructor(workspace: IAnyWorkspaceIdentifier | undefined, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, mainProcessService: IMainProcessService, environmentService: IEnvironmentService);
    private registerListeners;
}
