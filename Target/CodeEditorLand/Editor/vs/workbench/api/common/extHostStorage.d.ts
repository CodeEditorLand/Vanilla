import { IExtensionIdWithVersion } from "vs/platform/extensionManagement/common/extensionStorage";
import { ILogService } from "vs/platform/log/common/log";
import { IExtHostRpcService } from "vs/workbench/api/common/extHostRpcService";
import { ExtHostStorageShape } from "./extHost.protocol";
export interface IStorageChangeEvent {
    shared: boolean;
    key: string;
    value: object;
}
export declare class ExtHostStorage implements ExtHostStorageShape {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _proxy;
    private readonly _onDidChangeStorage;
    readonly onDidChangeStorage: any;
    constructor(mainContext: IExtHostRpcService, _logService: ILogService);
    registerExtensionStorageKeysToSync(extension: IExtensionIdWithVersion, keys: string[]): void;
    initializeExtensionStorage(shared: boolean, key: string, defaultValue?: object): Promise<object | undefined>;
    setValue(shared: boolean, key: string, value: object): Promise<void>;
    $acceptValue(shared: boolean, key: string, value: string): void;
    private safeParseValue;
}
export interface IExtHostStorage extends ExtHostStorage {
}
export declare const IExtHostStorage: any;
