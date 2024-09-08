import type { IStringDictionary } from "../../../base/common/collections.js";
import { Emitter, type Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { URI, type UriDto } from "../../../base/common/uri.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { ILogService } from "../../log/common/log.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { type IAnyWorkspaceIdentifier } from "../../workspace/common/workspace.js";
export declare enum ProfileResourceType {
    Settings = "settings",
    Keybindings = "keybindings",
    Snippets = "snippets",
    Tasks = "tasks",
    Extensions = "extensions",
    GlobalState = "globalState"
}
/**
 * Flags to indicate whether to use the default profile or not.
 */
export type UseDefaultProfileFlags = {
    [key in ProfileResourceType]?: boolean;
};
export type ProfileResourceTypeFlags = UseDefaultProfileFlags;
export interface IUserDataProfile {
    readonly id: string;
    readonly isDefault: boolean;
    readonly name: string;
    readonly shortName?: string;
    readonly icon?: string;
    readonly location: URI;
    readonly globalStorageHome: URI;
    readonly settingsResource: URI;
    readonly keybindingsResource: URI;
    readonly tasksResource: URI;
    readonly snippetsHome: URI;
    readonly extensionsResource: URI;
    readonly cacheHome: URI;
    readonly useDefaultFlags?: UseDefaultProfileFlags;
    readonly isTransient?: boolean;
}
export declare function isUserDataProfile(thing: unknown): thing is IUserDataProfile;
export type DidChangeProfilesEvent = {
    readonly added: readonly IUserDataProfile[];
    readonly removed: readonly IUserDataProfile[];
    readonly updated: readonly IUserDataProfile[];
    readonly all: readonly IUserDataProfile[];
};
export type WillCreateProfileEvent = {
    profile: IUserDataProfile;
    join(promise: Promise<void>): void;
};
export type WillRemoveProfileEvent = {
    profile: IUserDataProfile;
    join(promise: Promise<void>): void;
};
export interface IUserDataProfileOptions {
    readonly shortName?: string;
    readonly icon?: string;
    readonly useDefaultFlags?: UseDefaultProfileFlags;
    readonly transient?: boolean;
}
export interface IUserDataProfileUpdateOptions extends Omit<IUserDataProfileOptions, "icon"> {
    readonly name?: string;
    readonly icon?: string | null;
}
export declare const IUserDataProfilesService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataProfilesService>;
export interface IUserDataProfilesService {
    readonly _serviceBrand: undefined;
    readonly profilesHome: URI;
    readonly defaultProfile: IUserDataProfile;
    readonly onDidChangeProfiles: Event<DidChangeProfilesEvent>;
    readonly profiles: readonly IUserDataProfile[];
    readonly onDidResetWorkspaces: Event<void>;
    isEnabled(): boolean;
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createTransientProfile(workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    updateProfile(profile: IUserDataProfile, options?: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    setProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, profile: IUserDataProfile): Promise<void>;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
}
export declare function reviveProfile(profile: UriDto<IUserDataProfile>, scheme: string): IUserDataProfile;
export declare function toUserDataProfile(id: string, name: string, location: URI, profilesCacheHome: URI, options?: IUserDataProfileOptions, defaultProfile?: IUserDataProfile): IUserDataProfile;
export type UserDataProfilesObject = {
    profiles: IUserDataProfile[];
    workspaces: ResourceMap<IUserDataProfile>;
    emptyWindows: Map<string, IUserDataProfile>;
};
type TransientUserDataProfilesObject = UserDataProfilesObject & {
    folders: ResourceMap<IUserDataProfile>;
};
export type StoredUserDataProfile = {
    name: string;
    location: URI;
    shortName?: string;
    icon?: string;
    useDefaultFlags?: UseDefaultProfileFlags;
};
export type StoredProfileAssociations = {
    workspaces?: IStringDictionary<string>;
    emptyWindows?: IStringDictionary<string>;
};
export declare class UserDataProfilesService extends Disposable implements IUserDataProfilesService {
    protected readonly environmentService: IEnvironmentService;
    protected readonly fileService: IFileService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly logService: ILogService;
    protected static readonly PROFILES_KEY = "userDataProfiles";
    protected static readonly PROFILE_ASSOCIATIONS_KEY = "profileAssociations";
    readonly _serviceBrand: undefined;
    protected enabled: boolean;
    readonly profilesHome: URI;
    private readonly profilesCacheHome;
    get defaultProfile(): IUserDataProfile;
    get profiles(): IUserDataProfile[];
    protected readonly _onDidChangeProfiles: Emitter<DidChangeProfilesEvent>;
    readonly onDidChangeProfiles: Event<DidChangeProfilesEvent>;
    protected readonly _onWillCreateProfile: Emitter<WillCreateProfileEvent>;
    readonly onWillCreateProfile: Event<WillCreateProfileEvent>;
    protected readonly _onWillRemoveProfile: Emitter<WillRemoveProfileEvent>;
    readonly onWillRemoveProfile: Event<WillRemoveProfileEvent>;
    private readonly _onDidResetWorkspaces;
    readonly onDidResetWorkspaces: Event<void>;
    private profileCreationPromises;
    protected readonly transientProfilesObject: TransientUserDataProfilesObject;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    init(): void;
    setEnablement(enabled: boolean): void;
    isEnabled(): boolean;
    protected _profilesObject: UserDataProfilesObject | undefined;
    protected get profilesObject(): UserDataProfilesObject;
    private createDefaultProfile;
    createTransientProfile(workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    private doCreateProfile;
    updateProfile(profileToUpdate: IUserDataProfile, options: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profileToRemove: IUserDataProfile): Promise<void>;
    setProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, profileToSet: IUserDataProfile): Promise<void>;
    unsetWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, transient?: boolean): void;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
    getProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier): IUserDataProfile | undefined;
    protected getWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier): URI | string;
    private isProfileAssociatedToWorkspace;
    private updateProfiles;
    protected triggerProfilesChanges(added: IUserDataProfile[], removed: IUserDataProfile[], updated: IUserDataProfile[]): void;
    private updateWorkspaceAssociation;
    private updateStoredProfileAssociations;
    protected migrateStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): StoredProfileAssociations;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
    protected getDefaultProfileExtensionsLocation(): URI | undefined;
}
export declare class InMemoryUserDataProfilesService extends UserDataProfilesService {
    private storedProfiles;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    private storedProfileAssociations;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
}
export {};
