import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IExtensionGalleryService } from "vs/platform/extensionManagement/common/extensionManagement";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUserDataProfile, IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { ISyncResourceHandle, ISyncUserDataProfile, IUserDataManifest, IUserDataManualSyncTask, IUserDataSyncEnablementService, IUserDataSynchroniser, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncResource, IUserDataSyncResourceConflicts, IUserDataSyncResourceProviderService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, IUserDataSyncTask, SyncResource, SyncStatus, UserDataSyncError } from "vs/platform/userDataSync/common/userDataSync";
export declare class UserDataSyncService extends Disposable implements IUserDataSyncService {
    private readonly fileService;
    private readonly userDataSyncStoreService;
    private readonly userDataSyncStoreManagementService;
    private readonly instantiationService;
    private readonly logService;
    private readonly telemetryService;
    private readonly storageService;
    private readonly userDataSyncEnablementService;
    private readonly userDataProfilesService;
    private readonly userDataSyncResourceProviderService;
    private readonly userDataSyncLocalStoreService;
    _serviceBrand: any;
    private _status;
    get status(): SyncStatus;
    private _onDidChangeStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    private _onDidChangeLocal;
    readonly onDidChangeLocal: any;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts[];
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: any;
    private _syncErrors;
    private _onSyncErrors;
    readonly onSyncErrors: any;
    private _lastSyncTime;
    get lastSyncTime(): number | undefined;
    private _onDidChangeLastSyncTime;
    readonly onDidChangeLastSyncTime: Event<number>;
    private _onDidResetLocal;
    readonly onDidResetLocal: any;
    private _onDidResetRemote;
    readonly onDidResetRemote: any;
    private activeProfileSynchronizers;
    constructor(fileService: IFileService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, instantiationService: IInstantiationService, logService: IUserDataSyncLogService, telemetryService: ITelemetryService, storageService: IStorageService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataProfilesService: IUserDataProfilesService, userDataSyncResourceProviderService: IUserDataSyncResourceProviderService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService);
    createSyncTask(manifest: IUserDataManifest | null, disableCache?: boolean): Promise<IUserDataSyncTask>;
    createManualSyncTask(): Promise<IUserDataManualSyncTask>;
    private sync;
    private syncRemoteProfiles;
    private applyManualSync;
    private syncProfile;
    private stop;
    resolveContent(resource: URI): Promise<string | null>;
    replace(syncResourceHandle: ISyncResourceHandle): Promise<void>;
    accept(syncResource: IUserDataSyncResource, resource: URI, content: string | null | undefined, apply: boolean | {
        force: boolean;
    }): Promise<void>;
    hasLocalData(): Promise<boolean>;
    hasPreviouslySynced(): Promise<boolean>;
    reset(): Promise<void>;
    resetRemote(): Promise<void>;
    resetLocal(): Promise<void>;
    private cleanUpStaleStorageData;
    cleanUpRemoteData(): Promise<void>;
    saveRemoteActivityData(location: URI): Promise<void>;
    extractActivityData(activityDataResource: URI, location: URI): Promise<void>;
    private performAction;
    private performActionWithProfileSynchronizer;
    private setStatus;
    private updateConflicts;
    private updateLastSyncTime;
    getOrCreateActiveProfileSynchronizer(profile: IUserDataProfile, syncProfile: ISyncUserDataProfile | undefined): ProfileSynchronizer;
    private getActiveProfileSynchronizers;
    private clearActiveProfileSynchronizers;
    private checkEnablement;
}
declare class ProfileSynchronizer extends Disposable {
    readonly profile: IUserDataProfile;
    readonly collection: string | undefined;
    private readonly userDataSyncEnablementService;
    private readonly instantiationService;
    private readonly extensionGalleryService;
    private readonly userDataSyncStoreManagementService;
    private readonly telemetryService;
    private readonly logService;
    private readonly userDataProfilesService;
    private readonly configurationService;
    private _enabled;
    get enabled(): IUserDataSynchroniser[];
    get disabled(): SyncResource[];
    private _status;
    get status(): SyncStatus;
    private _onDidChangeStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    private _onDidChangeLocal;
    readonly onDidChangeLocal: any;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts[];
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: any;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncEnablementService: IUserDataSyncEnablementService, instantiationService: IInstantiationService, extensionGalleryService: IExtensionGalleryService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, telemetryService: ITelemetryService, logService: IUserDataSyncLogService, userDataProfilesService: IUserDataProfilesService, configurationService: IConfigurationService);
    private onDidChangeResourceEnablement;
    protected registerSynchronizer(syncResource: SyncResource): void;
    private deRegisterSynchronizer;
    createSynchronizer(syncResource: Exclude<SyncResource, SyncResource.WorkspaceState>): IUserDataSynchroniser & IDisposable;
    sync(manifest: IUserDataManifest | null, merge: boolean, executionId: string, token: CancellationToken): Promise<[SyncResource, UserDataSyncError][]>;
    apply(executionId: string, token: CancellationToken): Promise<void>;
    stop(): Promise<void>;
    resetLocal(): Promise<void>;
    private getUserDataSyncConfiguration;
    private setStatus;
    private updateStatus;
    private updateConflicts;
    private getOrder;
}
export {};
