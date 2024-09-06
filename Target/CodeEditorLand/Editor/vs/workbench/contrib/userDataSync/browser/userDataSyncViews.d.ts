import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUserDataSyncEnablementService, IUserDataSyncService } from "vs/platform/userDataSync/common/userDataSync";
import { IUserDataSyncMachinesService } from "vs/platform/userDataSync/common/userDataSyncMachines";
import { ViewContainer } from "vs/workbench/common/views";
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
