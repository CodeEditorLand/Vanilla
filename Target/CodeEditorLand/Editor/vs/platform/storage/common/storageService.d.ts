import { IStorage } from "vs/base/parts/storage/common/storage";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IRemoteService } from "vs/platform/ipc/common/services";
import { AbstractStorageService, StorageScope } from "vs/platform/storage/common/storage";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { IAnyWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
export declare class RemoteStorageService extends AbstractStorageService {
    private readonly initialWorkspace;
    private readonly initialProfiles;
    private readonly remoteService;
    private readonly environmentService;
    private readonly applicationStorageProfile;
    private readonly applicationStorage;
    private profileStorageProfile;
    private readonly profileStorageDisposables;
    private profileStorage;
    private workspaceStorageId;
    private readonly workspaceStorageDisposables;
    private workspaceStorage;
    constructor(initialWorkspace: IAnyWorkspaceIdentifier | undefined, initialProfiles: {
        defaultProfile: IUserDataProfile;
        currentProfile: IUserDataProfile;
    }, remoteService: IRemoteService, environmentService: IEnvironmentService);
    private createApplicationStorage;
    private createProfileStorage;
    private createWorkspaceStorage;
    protected doInitialize(): Promise<void>;
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    close(): Promise<void>;
    protected switchToProfile(toProfile: IUserDataProfile): Promise<void>;
    protected switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier, preserveData: boolean): Promise<void>;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
