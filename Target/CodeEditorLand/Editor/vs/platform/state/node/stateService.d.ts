import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IFileService } from "vs/platform/files/common/files";
import { ILogService } from "vs/platform/log/common/log";
import { IStateReadService, IStateService } from "vs/platform/state/node/state";
export declare const enum SaveStrategy {
    IMMEDIATE = 0,
    DELAYED = 1
}
export declare class FileStorage extends Disposable {
    private readonly storagePath;
    private readonly saveStrategy;
    private readonly logService;
    private readonly fileService;
    private storage;
    private lastSavedStorageContents;
    private readonly flushDelayer;
    private initializing;
    private closing;
    constructor(storagePath: URI, saveStrategy: SaveStrategy, logService: ILogService, fileService: IFileService);
    init(): Promise<void>;
    private doInit;
    getItem<T>(key: string, defaultValue: T): T;
    getItem<T>(key: string, defaultValue?: T): T | undefined;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    removeItem(key: string): void;
    private save;
    private doSave;
    close(): Promise<void>;
}
export declare class StateReadonlyService extends Disposable implements IStateReadService {
    readonly _serviceBrand: undefined;
    protected readonly fileStorage: FileStorage;
    constructor(saveStrategy: SaveStrategy, environmentService: IEnvironmentService, logService: ILogService, fileService: IFileService);
    init(): Promise<void>;
    getItem<T>(key: string, defaultValue: T): T;
    getItem<T>(key: string, defaultValue?: T): T | undefined;
}
export declare class StateService extends StateReadonlyService implements IStateService {
    readonly _serviceBrand: undefined;
    setItem(key: string, data?: object | string | number | boolean | undefined | null): void;
    setItems(items: readonly {
        key: string;
        data?: object | string | number | boolean | undefined | null;
    }[]): void;
    removeItem(key: string): void;
    close(): Promise<void>;
}