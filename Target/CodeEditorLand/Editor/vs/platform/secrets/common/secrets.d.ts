import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IEncryptionService } from "vs/platform/encryption/common/encryptionService";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService } from "vs/platform/storage/common/storage";
export declare const ISecretStorageService: any;
export interface ISecretStorageProvider {
    type: "in-memory" | "persisted" | "unknown";
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
export interface ISecretStorageService extends ISecretStorageProvider {
    readonly _serviceBrand: undefined;
    onDidChangeSecret: Event<string>;
}
export declare class BaseSecretStorageService extends Disposable implements ISecretStorageService {
    private readonly _useInMemoryStorage;
    private _storageService;
    protected _encryptionService: IEncryptionService;
    protected readonly _logService: ILogService;
    readonly _serviceBrand: undefined;
    private readonly _storagePrefix;
    protected readonly onDidChangeSecretEmitter: any;
    onDidChangeSecret: Event<string>;
    protected readonly _sequencer: any;
    private _type;
    private readonly _onDidChangeValueDisposable;
    constructor(_useInMemoryStorage: boolean, _storageService: IStorageService, _encryptionService: IEncryptionService, _logService: ILogService);
    /**
     * @Note initialize must be called first so that this can be resolved properly
     * otherwise it will return 'unknown'.
     */
    get type(): "unknown" | "in-memory" | "persisted";
    private _lazyStorageService;
    protected get resolvedStorageService(): any;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    private initialize;
    protected reinitialize(): void;
    private onDidChangeValue;
    private getKey;
}
