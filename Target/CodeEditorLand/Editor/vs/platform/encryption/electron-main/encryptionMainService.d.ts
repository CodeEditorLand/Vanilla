import { IEncryptionMainService, KnownStorageProvider } from "vs/platform/encryption/common/encryptionService";
import { ILogService } from "vs/platform/log/common/log";
export declare class EncryptionMainService implements IEncryptionMainService {
    private readonly logService;
    _serviceBrand: undefined;
    constructor(logService: ILogService);
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
    isEncryptionAvailable(): Promise<boolean>;
    getKeyStorageProvider(): Promise<KnownStorageProvider>;
    setUsePlainTextEncryption(): Promise<void>;
}
