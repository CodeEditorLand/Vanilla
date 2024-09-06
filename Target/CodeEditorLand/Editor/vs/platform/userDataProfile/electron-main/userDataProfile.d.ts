import { Event } from "vs/base/common/event";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IStateService } from "vs/platform/state/node/state";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfile, IUserDataProfilesService, WillCreateProfileEvent, WillRemoveProfileEvent } from "vs/platform/userDataProfile/common/userDataProfile";
import { UserDataProfilesService } from "vs/platform/userDataProfile/node/userDataProfile";
import { IAnyWorkspaceIdentifier, IEmptyWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
export declare const IUserDataProfilesMainService: any;
export interface IUserDataProfilesMainService extends IUserDataProfilesService {
    getProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier): IUserDataProfile | undefined;
    unsetWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, transient?: boolean): void;
    getAssociatedEmptyWindows(): IEmptyWorkspaceIdentifier[];
    readonly onWillCreateProfile: Event<WillCreateProfileEvent>;
    readonly onWillRemoveProfile: Event<WillRemoveProfileEvent>;
}
export declare class UserDataProfilesMainService extends UserDataProfilesService implements IUserDataProfilesMainService {
    constructor(stateService: IStateService, uriIdentityService: IUriIdentityService, environmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    getAssociatedEmptyWindows(): IEmptyWorkspaceIdentifier[];
}
