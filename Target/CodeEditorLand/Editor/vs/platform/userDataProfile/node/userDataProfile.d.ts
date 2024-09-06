import { URI } from "vs/base/common/uri";
import { INativeEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IStateReadService, IStateService } from "vs/platform/state/node/state";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { UserDataProfilesService as BaseUserDataProfilesService, IUserDataProfilesService, StoredProfileAssociations, StoredUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
export declare class UserDataProfilesReadonlyService extends BaseUserDataProfilesService implements IUserDataProfilesService {
    private readonly stateReadonlyService;
    private readonly nativeEnvironmentService;
    protected static readonly PROFILE_ASSOCIATIONS_MIGRATION_KEY = "profileAssociationsMigration";
    constructor(stateReadonlyService: IStateReadService, uriIdentityService: IUriIdentityService, nativeEnvironmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected getDefaultProfileExtensionsLocation(): URI;
}
export declare class UserDataProfilesService extends UserDataProfilesReadonlyService implements IUserDataProfilesService {
    protected readonly stateService: IStateService;
    constructor(stateService: IStateService, uriIdentityService: IUriIdentityService, environmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
}
export declare class ServerUserDataProfilesService extends UserDataProfilesService implements IUserDataProfilesService {
    constructor(uriIdentityService: IUriIdentityService, environmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    init(): Promise<void>;
}
