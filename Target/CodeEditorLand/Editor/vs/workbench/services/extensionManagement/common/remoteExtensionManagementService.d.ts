import { URI } from "vs/base/common/uri";
import { IChannel } from "vs/base/parts/ipc/common/ipc";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { ProfileAwareExtensionManagementChannelClient } from "vs/workbench/services/extensionManagement/common/extensionManagementChannelClient";
import { IRemoteUserDataProfilesService } from "vs/workbench/services/userDataProfile/common/remoteUserDataProfiles";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class RemoteExtensionManagementService extends ProfileAwareExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    private readonly userDataProfilesService;
    private readonly remoteUserDataProfilesService;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, uriIdentityService: IUriIdentityService);
    protected filterEvent(profileLocation: URI, applicationScoped: boolean): Promise<boolean>;
    protected getProfileLocation(profileLocation: URI): Promise<URI>;
    protected getProfileLocation(profileLocation?: URI): Promise<URI | undefined>;
    protected switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent>;
}
