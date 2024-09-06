import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IChannel, IServerChannel } from "vs/base/parts/ipc/common/ipc";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IProductService } from "vs/platform/product/common/productService";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IUserDataSyncStore, IUserDataSyncStoreManagementService, UserDataSyncStoreType } from "vs/platform/userDataSync/common/userDataSync";
import { IUserDataSyncAccount, IUserDataSyncAccountService } from "vs/platform/userDataSync/common/userDataSyncAccount";
import { AbstractUserDataSyncStoreManagementService } from "vs/platform/userDataSync/common/userDataSyncStoreService";
export declare class UserDataSyncAccountServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncAccountService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncAccountServiceChannelClient extends Disposable implements IUserDataSyncAccountService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private _account;
    get account(): IUserDataSyncAccount | undefined;
    get onTokenFailed(): Event<boolean>;
    private _onDidChangeAccount;
    readonly onDidChangeAccount: any;
    constructor(channel: IChannel);
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<undefined>;
}
export declare class UserDataSyncStoreManagementServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncStoreManagementService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncStoreManagementServiceChannelClient extends AbstractUserDataSyncStoreManagementService implements IUserDataSyncStoreManagementService {
    private readonly channel;
    constructor(channel: IChannel, productService: IProductService, configurationService: IConfigurationService, storageService: IStorageService);
    switch(type: UserDataSyncStoreType): Promise<void>;
    getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore>;
    private revive;
}
