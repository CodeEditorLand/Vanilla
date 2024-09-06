import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ExtensionManagementError, ExtensionManagementErrorCode, IExtensionGalleryService, IExtensionIdentifier, IExtensionManagementParticipant, IExtensionManagementService, IExtensionsControlManifest, IGalleryExtension, ILocalExtension, InstallExtensionInfo, InstallExtensionResult, InstallOperation, InstallOptions, IProductVersion, Metadata, UninstallExtensionInfo, UninstallOptions } from "vs/platform/extensionManagement/common/extensionManagement";
import { ExtensionType, IExtensionManifest, TargetPlatform } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
export type ExtensionVerificationStatus = boolean | string;
export type InstallableExtension = {
    readonly manifest: IExtensionManifest;
    extension: IGalleryExtension | URI;
    options: InstallOptions;
};
export type InstallExtensionTaskOptions = InstallOptions & {
    readonly profileLocation: URI;
    readonly productVersion: IProductVersion;
};
export interface IInstallExtensionTask {
    readonly manifest: IExtensionManifest;
    readonly identifier: IExtensionIdentifier;
    readonly source: IGalleryExtension | URI;
    readonly operation: InstallOperation;
    readonly options: InstallExtensionTaskOptions;
    readonly verificationStatus?: ExtensionVerificationStatus;
    run(): Promise<ILocalExtension>;
    waitUntilTaskIsFinished(): Promise<ILocalExtension>;
    cancel(): void;
}
export type UninstallExtensionTaskOptions = UninstallOptions & {
    readonly profileLocation: URI;
};
export interface IUninstallExtensionTask {
    readonly options: UninstallExtensionTaskOptions;
    readonly extension: ILocalExtension;
    run(): Promise<void>;
    waitUntilTaskIsFinished(): Promise<void>;
    cancel(): void;
}
export declare abstract class AbstractExtensionManagementService extends Disposable implements IExtensionManagementService {
    protected readonly galleryService: IExtensionGalleryService;
    protected readonly telemetryService: ITelemetryService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected readonly logService: ILogService;
    protected readonly productService: IProductService;
    protected readonly userDataProfilesService: IUserDataProfilesService;
    readonly _serviceBrand: undefined;
    private extensionsControlManifest;
    private lastReportTimestamp;
    private readonly installingExtensions;
    private readonly uninstallingExtensions;
    private readonly _onInstallExtension;
    get onInstallExtension(): any;
    protected readonly _onDidInstallExtensions: any;
    get onDidInstallExtensions(): any;
    protected readonly _onUninstallExtension: any;
    get onUninstallExtension(): any;
    protected _onDidUninstallExtension: any;
    get onDidUninstallExtension(): any;
    protected readonly _onDidUpdateExtensionMetadata: any;
    get onDidUpdateExtensionMetadata(): any;
    private readonly participants;
    constructor(galleryService: IExtensionGalleryService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService, logService: ILogService, productService: IProductService, userDataProfilesService: IUserDataProfilesService);
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions): Promise<ILocalExtension>;
    installGalleryExtensions(extensions: InstallExtensionInfo[]): Promise<InstallExtensionResult[]>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    toggleAppliationScope(extension: ILocalExtension, fromProfileLocation: URI): Promise<ILocalExtension>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    registerParticipant(participant: IExtensionManagementParticipant): void;
    resetPinnedStateForAllUserExtensions(pinned: boolean): Promise<void>;
    protected installExtensions(extensions: InstallableExtension[]): Promise<InstallExtensionResult[]>;
    private canWaitForTask;
    private joinAllSettled;
    private getAllDepsAndPackExtensions;
    private checkAndGetCompatibleVersion;
    protected getCompatibleVersion(extension: IGalleryExtension, sameVersion: boolean, includePreRelease: boolean, productVersion: IProductVersion): Promise<IGalleryExtension | null>;
    uninstallExtensions(extensions: UninstallExtensionInfo[]): Promise<void>;
    private checkForDependents;
    private getDependentsErrorMessage;
    private getAllPackExtensionsToUninstall;
    private getDependents;
    private updateControlCache;
    abstract getTargetPlatform(): Promise<TargetPlatform>;
    abstract zip(extension: ILocalExtension): Promise<URI>;
    abstract getManifest(vsix: URI): Promise<IExtensionManifest>;
    abstract install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    abstract installFromLocation(location: URI, profileLocation: URI): Promise<ILocalExtension>;
    abstract installExtensionsFromProfile(extensions: IExtensionIdentifier[], fromProfileLocation: URI, toProfileLocation: URI): Promise<ILocalExtension[]>;
    abstract getInstalled(type?: ExtensionType, profileLocation?: URI, productVersion?: IProductVersion): Promise<ILocalExtension[]>;
    abstract copyExtensions(fromProfileLocation: URI, toProfileLocation: URI): Promise<void>;
    abstract download(extension: IGalleryExtension, operation: InstallOperation, donotVerifySignature: boolean): Promise<URI>;
    abstract reinstallFromGallery(extension: ILocalExtension): Promise<ILocalExtension>;
    abstract cleanUp(): Promise<void>;
    abstract updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>, profileLocation: URI): Promise<ILocalExtension>;
    protected abstract getCurrentExtensionsManifestLocation(): URI;
    protected abstract createInstallExtensionTask(manifest: IExtensionManifest, extension: URI | IGalleryExtension, options: InstallExtensionTaskOptions): IInstallExtensionTask;
    protected abstract createUninstallExtensionTask(extension: ILocalExtension, options: UninstallExtensionTaskOptions): IUninstallExtensionTask;
    protected abstract copyExtension(extension: ILocalExtension, fromProfileLocation: URI, toProfileLocation: URI, metadata?: Partial<Metadata>): Promise<ILocalExtension>;
}
export declare function toExtensionManagementError(error: Error, code?: ExtensionManagementErrorCode): ExtensionManagementError;
export declare abstract class AbstractExtensionTask<T> {
    private readonly barrier;
    private cancellablePromise;
    waitUntilTaskIsFinished(): Promise<T>;
    run(): Promise<T>;
    cancel(): void;
    protected abstract doRun(token: CancellationToken): Promise<T>;
}