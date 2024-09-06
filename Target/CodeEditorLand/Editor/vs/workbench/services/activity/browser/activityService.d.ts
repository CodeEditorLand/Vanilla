import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { IActivity, IActivityService } from "vs/workbench/services/activity/common/activity";
export declare class ActivityService extends Disposable implements IActivityService {
    private readonly viewDescriptorService;
    private readonly instantiationService;
    _serviceBrand: undefined;
    private readonly viewActivities;
    private readonly _onDidChangeActivity;
    readonly onDidChangeActivity: any;
    private readonly viewContainerActivities;
    private readonly globalActivities;
    constructor(viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService);
    showViewContainerActivity(viewContainerId: string, activity: IActivity): IDisposable;
    getViewContainerActivities(viewContainerId: string): IActivity[];
    showViewActivity(viewId: string, activity: IActivity): IDisposable;
    showAccountsActivity(activity: IActivity): IDisposable;
    showGlobalActivity(activity: IActivity): IDisposable;
    getActivity(id: string): IActivity[];
    private showActivity;
}
