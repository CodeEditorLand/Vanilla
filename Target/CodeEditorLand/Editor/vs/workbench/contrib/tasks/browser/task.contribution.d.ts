import { Disposable } from "vs/base/common/lifecycle";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ITaskService } from "vs/workbench/contrib/tasks/common/taskService";
import { IStatusbarService } from "vs/workbench/services/statusbar/browser/statusbar";
export declare class TaskStatusBarContributions extends Disposable implements IWorkbenchContribution {
    private readonly _taskService;
    private readonly _statusbarService;
    private readonly _progressService;
    private _runningTasksStatusItem;
    private _activeTasksCount;
    constructor(_taskService: ITaskService, _statusbarService: IStatusbarService, _progressService: IProgressService);
    private _registerListeners;
    private _updateRunningTasksStatus;
    private _ignoreEventForUpdateRunningTasksCount;
}
export declare class TaskRegistryContribution extends Disposable implements IWorkbenchContribution {
    static ID: string;
    constructor();
}
