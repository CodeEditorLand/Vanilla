import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IURITransformer } from "../../../base/common/uriIpc.js";
import { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import { ExtensionType, IExtensionManifest, TargetPlatform } from "../../extensions/common/extensions.js";
import { DidUninstallExtensionEvent, DidUpdateExtensionMetadata, IExtensionIdentifier, IExtensionManagementService, IExtensionsControlManifest, IExtensionTipsService, IGalleryExtension, ILocalExtension, InstallExtensionEvent, InstallExtensionInfo, InstallExtensionResult, InstallOperation, InstallOptions, IProductVersion, Metadata, UninstallExtensionEvent, UninstallExtensionInfo, UninstallOptions } from "./extensionManagement.js";
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
    get onInstallExtension(): Event<InstallExtensionEvent>;
    private readonly _onDidInstallExtensions;
    get onDidInstallExtensions(): Event<readonly InstallExtensionResult[]>;
    private readonly _onUninstallExtension;
    get onUninstallExtension(): Event<UninstallExtensionEvent>;
    private readonly _onDidUninstallExtension;
    get onDidUninstallExtension(): Event<DidUninstallExtensionEvent>;
    private readonly _onDidUpdateExtensionMetadata;
    get onDidUpdateExtensionMetadata(): Event<DidUpdateExtensionMetadata>;
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
