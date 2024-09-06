import { Disposable } from "vs/base/common/lifecycle";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class UserDataProfileService extends Disposable implements IUserDataProfileService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeCurrentProfile;
    readonly onDidChangeCurrentProfile: any;
    private _currentProfile;
    get currentProfile(): IUserDataProfile;
    constructor(currentProfile: IUserDataProfile);
    updateCurrentProfile(userDataProfile: IUserDataProfile): Promise<void>;
    getShortName(profile: IUserDataProfile): string;
}
