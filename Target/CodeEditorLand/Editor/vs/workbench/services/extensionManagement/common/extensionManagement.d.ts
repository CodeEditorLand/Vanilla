import { Event } from '../../../../base/common/event.js';
import { IExtension, ExtensionType, IExtensionManifest, IExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionManagementService, IGalleryExtension, ILocalExtension, InstallOptions, InstallExtensionEvent, DidUninstallExtensionEvent, InstallExtensionResult, Metadata, UninstallExtensionEvent } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { URI } from '../../../../base/common/uri.js';
export type DidChangeProfileEvent = {
    readonly added: ILocalExtension[];
    readonly removed: ILocalExtension[];
};
export declare const IProfileAwareExtensionManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IProfileAwareExtensionManagementService>;
export interface IProfileAwareExtensionManagementService extends IExtensionManagementService {
    readonly onDidChangeProfile: Event<DidChangeProfileEvent>;
}
export interface IExtensionManagementServer {
    readonly id: string;
    readonly label: string;
    readonly extensionManagementService: IProfileAwareExtensionManagementService;
}
export declare const enum ExtensionInstallLocation {
    Local = 1,
    Remote = 2,
    Web = 3
}
export declare const IExtensionManagementServerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionManagementServerService>;
export interface IExtensionManagementServerService {
    readonly _serviceBrand: undefined;
    readonly localExtensionManagementServer: IExtensionManagementServer | null;
    readonly remoteExtensionManagementServer: IExtensionManagementServer | null;
    readonly webExtensionManagementServer: IExtensionManagementServer | null;
    getExtensionManagementServer(extension: IExtension): IExtensionManagementServer | null;
    getExtensionInstallLocation(extension: IExtension): ExtensionInstallLocation | null;
}
export declare const DefaultIconPath: string;
export interface IResourceExtension {
    readonly type: 'resource';
    readonly identifier: IExtensionIdentifier;
    readonly location: URI;
    readonly manifest: IExtensionManifest;
    readonly readmeUri?: URI;
    readonly changelogUri?: URI;
}
export type InstallExtensionOnServerEvent = InstallExtensionEvent & {
    server: IExtensionManagementServer;
};
export type UninstallExtensionOnServerEvent = UninstallExtensionEvent & {
    server: IExtensionManagementServer;
};
export type DidUninstallExtensionOnServerEvent = DidUninstallExtensionEvent & {
    server: IExtensionManagementServer;
};
export type DidChangeProfileForServerEvent = DidChangeProfileEvent & {
    server: IExtensionManagementServer;
};
export declare const IWorkbenchExtensionManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchExtensionManagementService>;
export interface IWorkbenchExtensionManagementService extends IProfileAwareExtensionManagementService {
    readonly _serviceBrand: undefined;
    onInstallExtension: Event<InstallExtensionOnServerEvent>;
    onDidInstallExtensions: Event<readonly InstallExtensionResult[]>;
    onUninstallExtension: Event<UninstallExtensionOnServerEvent>;
    onDidUninstallExtension: Event<DidUninstallExtensionOnServerEvent>;
    onDidChangeProfile: Event<DidChangeProfileForServerEvent>;
    onDidEnableExtensions: Event<IExtension[]>;
    getExtensions(locations: URI[]): Promise<IResourceExtension[]>;
    getInstalledWorkspaceExtensionLocations(): URI[];
    getInstalledWorkspaceExtensions(includeInvalid: boolean): Promise<ILocalExtension[]>;
    canInstall(extension: IGalleryExtension | IResourceExtension): Promise<boolean>;
    installVSIX(location: URI, manifest: IExtensionManifest, installOptions?: InstallOptions): Promise<ILocalExtension>;
    installFromLocation(location: URI): Promise<ILocalExtension>;
    installResourceExtension(extension: IResourceExtension, installOptions: InstallOptions): Promise<ILocalExtension>;
    updateFromGallery(gallery: IGalleryExtension, extension: ILocalExtension, installOptions?: InstallOptions): Promise<ILocalExtension>;
    updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>): Promise<ILocalExtension>;
}
export declare const extensionsConfigurationNodeBase: {
    id: string;
    order: number;
    title: string;
    type: string;
};
export declare const enum EnablementState {
    DisabledByTrustRequirement = 0,
    DisabledByExtensionKind = 1,
    DisabledByEnvironment = 2,
    EnabledByEnvironment = 3,
    DisabledByVirtualWorkspace = 4,
    DisabledByExtensionDependency = 5,
    DisabledGlobally = 6,
    DisabledWorkspace = 7,
    EnabledGlobally = 8,
    EnabledWorkspace = 9
}
export declare const IWorkbenchExtensionEnablementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchExtensionEnablementService>;
export interface IWorkbenchExtensionEnablementService {
    readonly _serviceBrand: undefined;
    /**
     * Event to listen on for extension enablement changes
     */
    readonly onEnablementChanged: Event<readonly IExtension[]>;
    /**
     * Returns the enablement state for the given extension
     */
    getEnablementState(extension: IExtension): EnablementState;
    /**
     * Returns the enablement states for the given extensions
     * @param extensions list of extensions
     * @param workspaceTypeOverrides Workspace type overrides
     */
    getEnablementStates(extensions: IExtension[], workspaceTypeOverrides?: {
        trusted?: boolean;
    }): EnablementState[];
    /**
     * Returns the enablement states for the dependencies of the given extension
     */
    getDependenciesEnablementStates(extension: IExtension): [IExtension, EnablementState][];
    /**
     * Returns `true` if the enablement can be changed.
     */
    canChangeEnablement(extension: IExtension): boolean;
    /**
     * Returns `true` if the enablement can be changed.
     */
    canChangeWorkspaceEnablement(extension: IExtension): boolean;
    /**
     * Returns `true` if the given extension is enabled.
     */
    isEnabled(extension: IExtension): boolean;
    /**
     * Returns `true` if the given enablement state is enabled enablement state.
     */
    isEnabledEnablementState(enablementState: EnablementState): boolean;
    /**
     * Returns `true` if the given extension identifier is disabled globally.
     * Extensions can be disabled globally or in workspace or both.
     * If an extension is disabled in both then enablement state shows only workspace.
     * This will
     */
    isDisabledGlobally(extension: IExtension): boolean;
    /**
     * Enable or disable the given extension.
     * if `workspace` is `true` then enablement is done for workspace, otherwise globally.
     *
     * Returns a promise that resolves to boolean value.
     * if resolves to `true` then requires restart for the change to take effect.
     *
     * Throws error if enablement is requested for workspace and there is no workspace
     */
    setEnablement(extensions: IExtension[], state: EnablementState): Promise<boolean[]>;
    /**
     * Updates the enablement state of the extensions when workspace trust changes.
     */
    updateExtensionsEnablementsWhenWorkspaceTrustChanges(): Promise<void>;
}
export interface IScannedExtension extends IExtension {
    readonly metadata?: Metadata;
}
export type ScanOptions = {
    readonly skipInvalidExtensions?: boolean;
};
export declare const IWebExtensionsScannerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebExtensionsScannerService>;
export interface IWebExtensionsScannerService {
    readonly _serviceBrand: undefined;
    scanSystemExtensions(): Promise<IExtension[]>;
    scanUserExtensions(profileLocation: URI, options?: ScanOptions): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(): Promise<IExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, profileLocation: URI): Promise<IScannedExtension | null>;
    addExtension(location: URI, metadata: Metadata, profileLocation: URI): Promise<IScannedExtension>;
    addExtensionFromGallery(galleryExtension: IGalleryExtension, metadata: Metadata, profileLocation: URI): Promise<IScannedExtension>;
    removeExtension(extension: IScannedExtension, profileLocation: URI): Promise<void>;
    copyExtensions(fromProfileLocation: URI, toProfileLocation: URI, filter: (extension: IScannedExtension) => boolean): Promise<void>;
    updateMetadata(extension: IScannedExtension, metaData: Partial<Metadata>, profileLocation: URI): Promise<IScannedExtension>;
    scanExtensionManifest(extensionLocation: URI): Promise<IExtensionManifest | null>;
}
