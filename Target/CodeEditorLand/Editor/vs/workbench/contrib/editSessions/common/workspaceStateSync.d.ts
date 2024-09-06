import { CancellationToken } from "vs/base/common/cancellation";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview, ISyncResourcePreview } from "vs/platform/userDataSync/common/abstractSynchronizer";
import { IRemoteUserData, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncStoreService } from "vs/platform/userDataSync/common/userDataSync";
import { IEditSessionsStorageService } from "vs/workbench/contrib/editSessions/common/editSessions";
import { IWorkspaceIdentityService } from "vs/workbench/services/workspaces/common/workspaceIdentityService";
export declare class WorkspaceStateSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly workspaceIdentityService;
    private readonly editSessionsStorageService;
    protected version: number;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, logService: IUserDataSyncLogService, fileService: IFileService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, configurationService: IConfigurationService, storageService: IStorageService, uriIdentityService: IUriIdentityService, workspaceIdentityService: IWorkspaceIdentityService, editSessionsStorageService: IEditSessionsStorageService);
    sync(): Promise<void>;
    apply(): Promise<ISyncResourcePreview | null>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, result: [IResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration, token: CancellationToken): Promise<IResourcePreview[]>;
    protected getMergeResult(resourcePreview: IResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
}
