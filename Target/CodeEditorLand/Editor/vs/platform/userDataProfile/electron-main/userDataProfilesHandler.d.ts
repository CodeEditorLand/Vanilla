import { Disposable } from "vs/base/common/lifecycle";
import { ILifecycleMainService } from "vs/platform/lifecycle/electron-main/lifecycleMainService";
import { IUserDataProfilesMainService } from "vs/platform/userDataProfile/electron-main/userDataProfile";
import { IWindowsMainService } from "vs/platform/windows/electron-main/windows";
export declare class UserDataProfilesHandler extends Disposable {
    private readonly userDataProfilesService;
    private readonly windowsMainService;
    constructor(lifecycleMainService: ILifecycleMainService, userDataProfilesService: IUserDataProfilesMainService, windowsMainService: IWindowsMainService);
    private unsetProfileForWorkspace;
    private getWorkspace;
    private cleanUpEmptyWindowAssociations;
}
