import type { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import type { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { RemoteStorageService } from "../../../../platform/storage/common/storageService.js";
import type { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import type { IAnyWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import type { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
export declare class NativeWorkbenchStorageService extends RemoteStorageService {
    private readonly userDataProfileService;
    constructor(workspace: IAnyWorkspaceIdentifier | undefined, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, mainProcessService: IMainProcessService, environmentService: IEnvironmentService);
    private registerListeners;
}
