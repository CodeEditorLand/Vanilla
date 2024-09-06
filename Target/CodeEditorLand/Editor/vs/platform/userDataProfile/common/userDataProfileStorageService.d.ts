import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IStorageDatabase } from "vs/base/parts/storage/common/storage";
import { IRemoteService } from "vs/platform/ipc/common/services";
import { ILogService } from "vs/platform/log/common/log";
import { IStorageService, IStorageValueChangeEvent, StorageTarget } from "vs/platform/storage/common/storage";
import { IUserDataProfile, IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
export interface IProfileStorageValueChanges {
    readonly profile: IUserDataProfile;
    readonly changes: IStorageValueChangeEvent[];
}
export interface IProfileStorageChanges {
    readonly targetChanges: IUserDataProfile[];
    readonly valueChanges: IProfileStorageValueChanges[];
}
export interface IStorageValue {
    readonly value: string | undefined;
    readonly target: StorageTarget;
}
export declare const IUserDataProfileStorageService: any;
export interface IUserDataProfileStorageService {
    readonly _serviceBrand: undefined;
    /**
     * Emitted whenever data is updated or deleted in a profile storage or target of a profile storage entry changes
     */
    readonly onDidChange: Event<IProfileStorageChanges>;
    /**
     * Return the requested profile storage data
     * @param profile The profile from which the data has to be read from
     */
    readStorageData(profile: IUserDataProfile): Promise<Map<string, IStorageValue>>;
    /**
     * Update the given profile storage data in the profile storage
     * @param profile The profile to which the data has to be written to
     * @param data Data that has to be updated
     * @param target Storage target of the data
     */
    updateStorageData(profile: IUserDataProfile, data: Map<string, string | undefined | null>, target: StorageTarget): Promise<void>;
    /**
     * Calls a function with a storage service scoped to given profile.
     */
    withProfileScopedStorageService<T>(profile: IUserDataProfile, fn: (storageService: IStorageService) => Promise<T>): Promise<T>;
}
export declare abstract class AbstractUserDataProfileStorageService extends Disposable implements IUserDataProfileStorageService {
    protected readonly storageService: IStorageService;
    _serviceBrand: undefined;
    abstract readonly onDidChange: Event<IProfileStorageChanges>;
    private readonly storageServicesMap;
    constructor(persistStorages: boolean, storageService: IStorageService);
    readStorageData(profile: IUserDataProfile): Promise<Map<string, IStorageValue>>;
    updateStorageData(profile: IUserDataProfile, data: Map<string, string | undefined | null>, target: StorageTarget): Promise<void>;
    withProfileScopedStorageService<T>(profile: IUserDataProfile, fn: (storageService: IStorageService) => Promise<T>): Promise<T>;
    private getItems;
    private writeItems;
    protected abstract createStorageDatabase(profile: IUserDataProfile): Promise<IStorageDatabase>;
}
export declare class RemoteUserDataProfileStorageService extends AbstractUserDataProfileStorageService implements IUserDataProfileStorageService {
    private readonly remoteService;
    private readonly _onDidChange;
    readonly onDidChange: Event<IProfileStorageChanges>;
    constructor(persistStorages: boolean, remoteService: IRemoteService, userDataProfilesService: IUserDataProfilesService, storageService: IStorageService, logService: ILogService);
    protected createStorageDatabase(profile: IUserDataProfile): Promise<IStorageDatabase>;
}