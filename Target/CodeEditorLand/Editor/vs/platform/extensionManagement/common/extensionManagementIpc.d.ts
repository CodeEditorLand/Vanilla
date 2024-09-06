import { Emitter, Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IURITransformer } from "vs/base/common/uriIpc";
import { IChannel, IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { DidUninstallExtensionEvent, DidUpdateExtensionMetadata, IExtensionIdentifier, IExtensionManagementService, IExtensionsControlManifest, IExtensionTipsService, IGalleryExtension, ILocalExtension, InstallExtensionEvent, InstallExtensionInfo, InstallExtensionResult, InstallOperation, InstallOptions, IProductVersion, Metadata, UninstallExtensionEvent, UninstallExtensionInfo, UninstallOptions } from "vs/platform/extensionManagement/common/extensionManagement";
import { ExtensionType, IExtensionManifest, TargetPlatform } from "vs/platform/extensions/common/extensions";
export declare class ExtensionManagementChannel implements IServerChannel {
    private service;
    private getUriTransformer;
    onInstallExtension: Event<InstallExtensionEvent>;
    onDidInstallExtensions: Event<readonly InstallExtensionResult[]>;
    onUninstallExtension: Event<UninstallExtensionEvent>;
    onDidUninstallExtension: Event<DidUninstallExtensionEvent>;
    onDidUpdateExtensionMetadata: Event<DidUpdateExtensionMetadata>;
    constructor(service: IExtensionManagementService, getUriTransformer: (requestContext: any) => IURITransformer | null);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export interface ExtensionEventResult {
    readonly profileLocation: URI;
    readonly local?: ILocalExtension;
    readonly applicationScoped?: boolean;
}
export declare class ExtensionManagementChannelClient extends Disposable implements IExtensionManagementService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private readonly _onInstallExtension;
    get onInstallExtension(): any;
    private readonly _onDidInstallExtensions;
    get onDidInstallExtensions(): any;
    private readonly _onUninstallExtension;
    get onUninstallExtension(): any;
    private readonly _onDidUninstallExtension;
    get onDidUninstallExtension(): any;
    private readonly _onDidUpdateExtensionMetadata;
    get onDidUpdateExtensionMetadata(): any;
    constructor(channel: IChannel);
    protected fireEvent<E extends ExtensionEventResult>(event: Emitter<E>, data: E): void;
    protected fireEvent<E extends ExtensionEventResult>(event: Emitter<readonly E[]>, data: E[]): void;
    private isUriComponents;
    protected _targetPlatformPromise: Promise<TargetPlatform> | undefined;
    getTargetPlatform(): Promise<TargetPlatform>;
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    zip(extension: ILocalExtension): Promise<URI>;
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    installFromLocation(location: URI, profileLocation: URI): Promise<ILocalExtension>;
    installExtensionsFromProfile(extensions: IExtensionIdentifier[], fromProfileLocation: URI, toProfileLocation: URI): Promise<ILocalExtension[]>;
    getManifest(vsix: URI): Promise<IExtensionManifest>;
    installFromGallery(extension: IGalleryExtension, installOptions?: InstallOptions): Promise<ILocalExtension>;
    installGalleryExtensions(extensions: InstallExtensionInfo[]): Promise<InstallExtensionResult[]>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    uninstallExtensions(extensions: UninstallExtensionInfo[]): Promise<void>;
    reinstallFromGallery(extension: ILocalExtension): Promise<ILocalExtension>;
    getInstalled(type?: ExtensionType | null, extensionsProfileResource?: URI, productVersion?: IProductVersion): Promise<ILocalExtension[]>;
    updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>, extensionsProfileResource?: URI): Promise<ILocalExtension>;
    resetPinnedStateForAllUserExtensions(pinned: boolean): Promise<void>;
    toggleAppliationScope(local: ILocalExtension, fromProfileLocation: URI): Promise<ILocalExtension>;
    copyExtensions(fromProfileLocation: URI, toProfileLocation: URI): Promise<void>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    download(extension: IGalleryExtension, operation: InstallOperation, donotVerifySignature: boolean): Promise<URI>;
    cleanUp(): Promise<void>;
    registerParticipant(): void;
}
export declare class ExtensionTipsChannel implements IServerChannel {
    private service;
    constructor(service: IExtensionTipsService);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
