import { IStringDictionary } from "vs/base/common/collections";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IExtensionManagementService, IGalleryExtension } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtension } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
export interface IExtensionIdWithVersion {
    id: string;
    version: string;
}
export declare const IExtensionStorageService: any;
export interface IExtensionStorageService {
    readonly _serviceBrand: undefined;
    getExtensionState(extension: IExtension | IGalleryExtension | string, global: boolean): IStringDictionary<any> | undefined;
    getExtensionStateRaw(extension: IExtension | IGalleryExtension | string, global: boolean): string | undefined;
    setExtensionState(extension: IExtension | IGalleryExtension | string, state: IStringDictionary<any> | undefined, global: boolean): void;
    readonly onDidChangeExtensionStorageToSync: Event<void>;
    setKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion, keys: string[]): void;
    getKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion): string[] | undefined;
    addToMigrationList(from: string, to: string): void;
    getSourceExtensionToMigrate(target: string): string | undefined;
}
export declare class ExtensionStorageService extends Disposable implements IExtensionStorageService {
    private readonly storageService;
    private readonly productService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private static LARGE_STATE_WARNING_THRESHOLD;
    private static toKey;
    private static fromKey;
    static removeOutdatedExtensionVersions(extensionManagementService: IExtensionManagementService, storageService: IStorageService): Promise<void>;
    private static readAllExtensionsWithKeysForSync;
    private readonly _onDidChangeExtensionStorageToSync;
    readonly onDidChangeExtensionStorageToSync: any;
    private readonly extensionsWithKeysForSync;
    constructor(storageService: IStorageService, productService: IProductService, logService: ILogService);
    private onDidChangeStorageValue;
    private getExtensionId;
    getExtensionState(extension: IExtension | IGalleryExtension | string, global: boolean): IStringDictionary<any> | undefined;
    getExtensionStateRaw(extension: IExtension | IGalleryExtension | string, global: boolean): string | undefined;
    setExtensionState(extension: IExtension | IGalleryExtension | string, state: IStringDictionary<any> | undefined, global: boolean): void;
    setKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion, keys: string[]): void;
    getKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion): string[] | undefined;
    addToMigrationList(from: string, to: string): void;
    getSourceExtensionToMigrate(toExtensionId: string): string | undefined;
    private get migrationList();
    private set migrationList(value);
}
