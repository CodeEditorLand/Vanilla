import { type Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import type { IChannel, IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import type { ILogService } from "../../log/common/log.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { type ISyncResourceHandle, type IUserDataManualSyncTask, type IUserDataSyncResource, type IUserDataSyncResourceConflicts, type IUserDataSyncResourceError, type IUserDataSyncService, type IUserDataSyncTask, type SyncResource, SyncStatus } from "./userDataSync.js";
export declare class UserDataSyncServiceChannel implements IServerChannel {
    private readonly service;
    private readonly userDataProfilesService;
    private readonly logService;
    private readonly manualSyncTasks;
    private readonly onManualSynchronizeResources;
    constructor(service: IUserDataSyncService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
    private _call;
    private getManualSyncTask;
    private createManualSyncTask;
    private createKey;
}
export declare class UserDataSyncServiceChannelClient extends Disposable implements IUserDataSyncService {
    private readonly userDataProfilesService;
    readonly _serviceBrand: undefined;
    private readonly channel;
    private _status;
    get status(): SyncStatus;
    private _onDidChangeStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    get onDidChangeLocal(): Event<SyncResource>;
    private _conflicts;
    get conflicts(): IUserDataSyncResourceConflicts[];
    private _onDidChangeConflicts;
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts[]>;
    private _lastSyncTime;
    get lastSyncTime(): number | undefined;
    private _onDidChangeLastSyncTime;
    readonly onDidChangeLastSyncTime: Event<number>;
    private _onSyncErrors;
    readonly onSyncErrors: Event<IUserDataSyncResourceError[]>;
    get onDidResetLocal(): Event<void>;
    get onDidResetRemote(): Event<void>;
    constructor(userDataSyncChannel: IChannel, userDataProfilesService: IUserDataProfilesService);
    createSyncTask(): Promise<IUserDataSyncTask>;
    createManualSyncTask(): Promise<IUserDataManualSyncTask>;
    reset(): Promise<void>;
    resetRemote(): Promise<void>;
    resetLocal(): Promise<void>;
    hasPreviouslySynced(): Promise<boolean>;
    hasLocalData(): Promise<boolean>;
    accept(syncResource: IUserDataSyncResource, resource: URI, content: string | null, apply: boolean | {
        force: boolean;
    }): Promise<void>;
    resolveContent(resource: URI): Promise<string | null>;
    cleanUpRemoteData(): Promise<void>;
    replace(syncResourceHandle: ISyncResourceHandle): Promise<void>;
    saveRemoteActivityData(location: URI): Promise<void>;
    extractActivityData(activityDataResource: URI, location: URI): Promise<void>;
    private updateStatus;
    private updateConflicts;
    private updateLastSyncTime;
}
