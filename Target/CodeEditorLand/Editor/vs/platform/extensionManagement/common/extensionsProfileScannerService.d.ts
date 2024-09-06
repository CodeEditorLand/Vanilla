import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { Metadata } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtension, IExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
export declare const enum ExtensionsProfileScanningErrorCode {
    /**
     * Error when trying to scan extensions from a profile that does not exist.
     */
    ERROR_PROFILE_NOT_FOUND = "ERROR_PROFILE_NOT_FOUND",
    /**
     * Error when profile file is invalid.
     */
    ERROR_INVALID_CONTENT = "ERROR_INVALID_CONTENT"
}
export declare class ExtensionsProfileScanningError extends Error {
    code: ExtensionsProfileScanningErrorCode;
    constructor(message: string, code: ExtensionsProfileScanningErrorCode);
}
export interface IScannedProfileExtension {
    readonly identifier: IExtensionIdentifier;
    readonly version: string;
    readonly location: URI;
    readonly metadata?: Metadata;
}
export interface ProfileExtensionsEvent {
    readonly extensions: readonly IScannedProfileExtension[];
    readonly profileLocation: URI;
}
export interface DidAddProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface DidRemoveProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface IProfileExtensionsScanOptions {
    readonly bailOutWhenFileNotFound?: boolean;
}
export declare const IExtensionsProfileScannerService: any;
export interface IExtensionsProfileScannerService {
    readonly _serviceBrand: undefined;
    readonly onAddExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidAddExtensions: Event<DidAddProfileExtensionsEvent>;
    readonly onRemoveExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidRemoveExtensions: Event<DidRemoveProfileExtensionsEvent>;
    scanProfileExtensions(profileLocation: URI, options?: IProfileExtensionsScanOptions): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [IExtension, Metadata | undefined][], profileLocation: URI, keepExistingVersions?: boolean): Promise<IScannedProfileExtension[]>;
    updateMetadata(extensions: [IExtension, Metadata | undefined][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionFromProfile(extension: IExtension, profileLocation: URI): Promise<void>;
}
export declare abstract class AbstractExtensionsProfileScannerService extends Disposable implements IExtensionsProfileScannerService {
    private readonly extensionsLocation;
    private readonly fileService;
    private readonly userDataProfilesService;
    private readonly uriIdentityService;
    private readonly telemetryService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onAddExtensions;
    readonly onAddExtensions: any;
    private readonly _onDidAddExtensions;
    readonly onDidAddExtensions: any;
    private readonly _onRemoveExtensions;
    readonly onRemoveExtensions: any;
    private readonly _onDidRemoveExtensions;
    readonly onDidRemoveExtensions: any;
    private readonly resourcesAccessQueueMap;
    constructor(extensionsLocation: URI, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, telemetryService: ITelemetryService, logService: ILogService);
    scanProfileExtensions(profileLocation: URI, options?: IProfileExtensionsScanOptions): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [IExtension, Metadata | undefined][], profileLocation: URI, keepExistingVersions?: boolean): Promise<IScannedProfileExtension[]>;
    updateMetadata(extensions: [IExtension, Metadata][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionFromProfile(extension: IExtension, profileLocation: URI): Promise<void>;
    private withProfileExtensions;
    private reportAndThrowInvalidConentError;
    private toRelativePath;
    private resolveExtensionLocation;
    private _migrationPromise;
    private migrateFromOldDefaultProfileExtensionsLocation;
    private getResourceAccessQueue;
}
