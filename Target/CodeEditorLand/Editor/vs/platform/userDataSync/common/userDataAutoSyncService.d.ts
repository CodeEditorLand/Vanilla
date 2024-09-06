import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IProductService } from "../../product/common/productService.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUserDataAutoSyncService, IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, UserDataSyncError } from "./userDataSync.js";
import { IUserDataSyncAccountService } from "./userDataSyncAccount.js";
import { IUserDataSyncMachinesService } from "./userDataSyncMachines.js";
export declare class UserDataAutoSyncService extends Disposable implements IUserDataAutoSyncService {
    private readonly userDataSyncStoreManagementService;
    private readonly userDataSyncStoreService;
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncService;
    private readonly logService;
    private readonly userDataSyncAccountService;
    private readonly telemetryService;
    private readonly userDataSyncMachinesService;
    private readonly storageService;
    _serviceBrand: any;
    private readonly autoSync;
    private successiveFailures;
    private lastSyncTriggerTime;
    private readonly syncTriggerDelayer;
    private suspendUntilRestart;
    private readonly _onError;
    readonly onError: Event<UserDataSyncError>;
    private lastSyncUrl;
    private get syncUrl();
    private set syncUrl(value);
    private previousProductQuality;
    private get productQuality();
    private set productQuality(value);
    constructor(productService: IProductService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncService: IUserDataSyncService, logService: IUserDataSyncLogService, userDataSyncAccountService: IUserDataSyncAccountService, telemetryService: ITelemetryService, userDataSyncMachinesService: IUserDataSyncMachinesService, storageService: IStorageService);
    private updateAutoSync;
    protected startAutoSync(): boolean;
    private isAutoSyncEnabled;
    turnOn(): Promise<void>;
    turnOff(everywhere: boolean, softTurnOffOnError?: boolean, donotRemoveMachine?: boolean): Promise<void>;
    private updateEnablement;
    private hasProductQualityChanged;
    private onDidFinishSync;
    private disableMachineEventually;
    private hasToDisableMachineEventually;
    private stopDisableMachineEventually;
    private sources;
    triggerSync(sources: string[], skipIfSyncedRecently: boolean, disableCache: boolean): Promise<void>;
    protected getSyncTriggerDelayTime(): number;
}
