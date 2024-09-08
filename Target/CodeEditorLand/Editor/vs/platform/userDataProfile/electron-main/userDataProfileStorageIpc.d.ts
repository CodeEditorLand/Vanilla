import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import type { IServerChannel } from "../../../base/parts/ipc/common/ipc.js";
import type { ILogService } from "../../log/common/log.js";
import type { IBaseSerializableStorageRequest } from "../../storage/common/storageIpc.js";
import type { IStorageMainService } from "../../storage/electron-main/storageMainService.js";
import type { IUserDataProfilesService } from "../common/userDataProfile.js";
export declare class ProfileStorageChangesListenerChannel extends Disposable implements IServerChannel {
    private readonly storageMainService;
    private readonly userDataProfilesService;
    private readonly logService;
    private readonly _onDidChange;
    constructor(storageMainService: IStorageMainService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    private registerStorageChangeListeners;
    private onDidChangeApplicationStorage;
    private onDidChangeProfileStorage;
    private triggerEvents;
    listen(_: unknown, event: string, arg: IBaseSerializableStorageRequest): Event<any>;
    call(_: unknown, command: string): Promise<any>;
}
