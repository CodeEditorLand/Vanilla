import { ILocalExtension, IGalleryExtension, InstallOptions, UninstallOptions, Metadata, InstallExtensionResult, InstallExtensionInfo, IProductVersion, UninstallExtensionInfo } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { URI } from '../../../../base/common/uri.js';
import { ExtensionIdentifier, ExtensionType } from '../../../../platform/extensions/common/extensions.js';
import { ExtensionManagementChannelClient as BaseExtensionManagementChannelClient, ExtensionEventResult } from '../../../../platform/extensionManagement/common/extensionManagementIpc.js';
import { IChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { Emitter } from '../../../../base/common/event.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from './extensionManagement.js';
export declare abstract class ProfileAwareExtensionManagementChannelClient extends BaseExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    protected readonly userDataProfileService: IUserDataProfileService;
    protected readonly uriIdentityService: IUriIdentityService;
    private readonly _onDidChangeProfile;
    readonly onDidChangeProfile: import("../../../../base/common/event.js").Event<{
        readonly added: ILocalExtension[];
        readonly removed: ILocalExtension[];
    }>;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService);
    protected fireEvent<E extends ExtensionEventResult>(event: Emitter<E>, data: E): Promise<void>;
    protected fireEvent<E extends ExtensionEventResult>(event: Emitter<readonly E[]>, data: E[]): Promise<void>;
    install(vsix: URI, installOptions?: InstallOptions): Promise<ILocalExtension>;
    installFromLocation(location: URI, profileLocation: URI): Promise<ILocalExtension>;
    installFromGallery(extension: IGalleryExtension, installOptions?: InstallOptions): Promise<ILocalExtension>;
    installGalleryExtensions(extensions: InstallExtensionInfo[]): Promise<InstallExtensionResult[]>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    uninstallExtensions(extensions: UninstallExtensionInfo[]): Promise<void>;
    getInstalled(type?: ExtensionType | null, extensionsProfileResource?: URI, productVersion?: IProductVersion): Promise<ILocalExtension[]>;
    updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>, extensionsProfileResource?: URI): Promise<ILocalExtension>;
    toggleAppliationScope(local: ILocalExtension, fromProfileLocation: URI): Promise<ILocalExtension>;
    copyExtensions(fromProfileLocation: URI, toProfileLocation: URI): Promise<void>;
    private whenProfileChanged;
    protected switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent>;
    protected getProfileLocation(profileLocation: URI): Promise<URI>;
    protected getProfileLocation(profileLocation?: URI): Promise<URI | undefined>;
    protected abstract filterEvent(profileLocation: URI, isApplicationScoped: boolean): boolean | Promise<boolean>;
}
