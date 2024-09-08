import type { URI } from "../../../../base/common/uri.js";
import type { IChannel } from "../../../../base/parts/ipc/common/ipc.js";
import type { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IRemoteUserDataProfilesService } from "../../userDataProfile/common/remoteUserDataProfiles.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import type { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from "./extensionManagement.js";
import { ProfileAwareExtensionManagementChannelClient } from "./extensionManagementChannelClient.js";
export declare class RemoteExtensionManagementService extends ProfileAwareExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    private readonly userDataProfilesService;
    private readonly remoteUserDataProfilesService;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, uriIdentityService: IUriIdentityService);
    protected filterEvent(profileLocation: URI, applicationScoped: boolean): Promise<boolean>;
    protected getProfileLocation(profileLocation: URI): Promise<URI>;
    protected getProfileLocation(profileLocation?: URI): Promise<URI | undefined>;
    protected switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent>;
}
