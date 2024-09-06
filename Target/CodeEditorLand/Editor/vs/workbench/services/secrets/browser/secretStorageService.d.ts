import { IEncryptionService } from "vs/platform/encryption/common/encryptionService";
import { ILogService } from "vs/platform/log/common/log";
import { BaseSecretStorageService } from "vs/platform/secrets/common/secrets";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
export declare class BrowserSecretStorageService extends BaseSecretStorageService {
    private readonly _secretStorageProvider;
    private readonly _embedderSequencer;
    constructor(storageService: IStorageService, encryptionService: IEncryptionService, environmentService: IBrowserWorkbenchEnvironmentService, logService: ILogService);
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    get type(): any;
}
