import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IUserDataSyncEnablementService, IUserDataSyncService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IUserDataSyncMachinesService } from "../../../../platform/userDataSync/common/userDataSyncMachines.js";
import { ViewContainer } from "../../../common/views.js";
export declare class UserDataSyncDataViews extends Disposable {
    private readonly instantiationService;
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncMachinesService;
    private readonly userDataSyncService;
    constructor(container: ViewContainer, instantiationService: IInstantiationService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncMachinesService: IUserDataSyncMachinesService, userDataSyncService: IUserDataSyncService);
    private registerViews;
    private registerConflictsView;
    private registerMachinesView;
    private registerActivityView;
    private registerExternalActivityView;
    private registerDataViewActions;
    private registerTroubleShootView;
}
