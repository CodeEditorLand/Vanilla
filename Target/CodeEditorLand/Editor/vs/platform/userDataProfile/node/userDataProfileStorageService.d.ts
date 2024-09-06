import { IMainProcessService } from "vs/platform/ipc/common/mainProcessService";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { RemoteUserDataProfileStorageService } from "vs/platform/userDataProfile/common/userDataProfileStorageService";
export declare class SharedProcessUserDataProfileStorageService extends RemoteUserDataProfileStorageService {
    constructor(mainProcessService: IMainProcessService, userDataProfilesService: IUserDataProfilesService, storageService: IStorageService, logService: ILogService);
}
