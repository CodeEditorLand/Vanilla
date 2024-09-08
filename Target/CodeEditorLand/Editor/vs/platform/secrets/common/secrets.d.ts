import { SequencerByKey } from "../../../base/common/async.js";
import { Emitter, type Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IEncryptionService } from "../../encryption/common/encryptionService.js";
import { ILogService } from "../../log/common/log.js";
import { IStorageService } from "../../storage/common/storage.js";
export declare const ISecretStorageService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISecretStorageService>;
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
    protected readonly onDidChangeSecretEmitter: Emitter<string>;
    onDidChangeSecret: Event<string>;
    protected readonly _sequencer: SequencerByKey<string>;
    private _type;
    private readonly _onDidChangeValueDisposable;
    constructor(_useInMemoryStorage: boolean, _storageService: IStorageService, _encryptionService: IEncryptionService, _logService: ILogService);
    /**
     * @Note initialize must be called first so that this can be resolved properly
     * otherwise it will return 'unknown'.
     */
    get type(): "unknown" | "in-memory" | "persisted";
    private _lazyStorageService;
    protected get resolvedStorageService(): Promise<IStorageService>;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
    private initialize;
    protected reinitialize(): void;
    private onDidChangeValue;
    private getKey;
}
