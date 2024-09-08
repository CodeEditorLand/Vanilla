import type { IEnvironmentService } from "../../environment/common/environment.js";
import type { IFileService } from "../../files/common/files.js";
import { type IStorageService } from "../../storage/common/storage.js";
export declare function getServiceMachineId(environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService | undefined): Promise<string>;
