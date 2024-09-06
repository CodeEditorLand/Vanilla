import { IEncryptionService, KnownStorageProvider } from "vs/platform/encryption/common/encryptionService";
export declare class EncryptionService implements IEncryptionService {
    readonly _serviceBrand: undefined;
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
    isEncryptionAvailable(): Promise<boolean>;
    getKeyStorageProvider(): Promise<KnownStorageProvider>;
    setUsePlainTextEncryption(): Promise<void>;
}
