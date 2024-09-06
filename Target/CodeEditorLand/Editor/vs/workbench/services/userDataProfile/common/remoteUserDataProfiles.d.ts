import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
export declare const IRemoteUserDataProfilesService: any;
export interface IRemoteUserDataProfilesService {
    readonly _serviceBrand: undefined;
    getRemoteProfiles(): Promise<readonly IUserDataProfile[]>;
    getRemoteProfile(localProfile: IUserDataProfile): Promise<IUserDataProfile>;
}
