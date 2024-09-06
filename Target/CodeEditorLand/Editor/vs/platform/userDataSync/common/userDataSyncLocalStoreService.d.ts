import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IResourceRefHandle, IUserDataSyncLocalStoreService, IUserDataSyncLogService, SyncResource } from "vs/platform/userDataSync/common/userDataSync";
export declare class UserDataSyncLocalStoreService extends Disposable implements IUserDataSyncLocalStoreService {
    private readonly environmentService;
    private readonly fileService;
    private readonly configurationService;
    private readonly logService;
    private readonly userDataProfilesService;
    _serviceBrand: any;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, configurationService: IConfigurationService, logService: IUserDataSyncLogService, userDataProfilesService: IUserDataProfilesService);
    private cleanUp;
    getAllResourceRefs(resource: SyncResource, collection?: string, root?: URI): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resourceKey: SyncResource, ref: string, collection?: string, root?: URI): Promise<string | null>;
    writeResource(resourceKey: SyncResource, content: string, cTime: Date, collection?: string, root?: URI): Promise<void>;
    private getResourceBackupHome;
    private cleanUpBackup;
    private getCreationTime;
}
