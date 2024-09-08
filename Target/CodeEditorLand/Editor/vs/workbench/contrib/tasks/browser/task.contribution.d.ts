import { Disposable } from "../../../../base/common/lifecycle.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { type IWorkbenchContribution } from "../../../common/contributions.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { ITaskService } from "../common/taskService.js";
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
