import { IMainProcessService } from "../../ipc/common/mainProcessService.js";
import { ILogService } from "../../log/common/log.js";
import { IStorageService } from "../../storage/common/storage.js";
import { IUserDataProfilesService } from "../common/userDataProfile.js";
import { RemoteUserDataProfileStorageService } from "../common/userDataProfileStorageService.js";
export declare class SharedProcessUserDataProfileStorageService extends RemoteUserDataProfileStorageService {
    constructor(mainProcessService: IMainProcessService, userDataProfilesService: IUserDataProfilesService, storageService: IStorageService, logService: ILogService);
}
