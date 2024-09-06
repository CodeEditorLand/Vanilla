import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI, UriDto } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { IChannel, IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfilesService, IUserDataProfileUpdateOptions } from "vs/platform/userDataProfile/common/userDataProfile";
import { IAnyWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
export declare class RemoteUserDataProfilesServiceChannel implements IServerChannel {
    private readonly service;
    private readonly getUriTransformer;
    constructor(service: IUserDataProfilesService, getUriTransformer: (requestContext: any) => IURITransformer);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataProfilesService extends Disposable implements IUserDataProfilesService {
    readonly profilesHome: URI;
    private readonly channel;
    readonly _serviceBrand: undefined;
    get defaultProfile(): IUserDataProfile;
    private _profiles;
    get profiles(): IUserDataProfile[];
    private readonly _onDidChangeProfiles;
    readonly onDidChangeProfiles: any;
    readonly onDidResetWorkspaces: Event<void>;
    private enabled;
    constructor(profiles: readonly UriDto<IUserDataProfile>[], profilesHome: URI, channel: IChannel);
    setEnablement(enabled: boolean): void;
    isEnabled(): boolean;
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createTransientProfile(workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    setProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, profile: IUserDataProfile): Promise<void>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
}
