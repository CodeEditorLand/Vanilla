import { IDisposable } from "vs/base/common/lifecycle";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IMarkerService } from "vs/platform/markers/common/markers";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IWorkspace, IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { ITaskIdentifier } from "vs/workbench/contrib/tasks/common/tasks";
import { ITaskService, ITaskSummary } from "vs/workbench/contrib/tasks/common/taskService";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare const enum TaskRunResult {
    Failure = 0,
    Success = 1
}
interface IRunnerTaskSummary extends ITaskSummary {
    cancelled?: boolean;
}
export declare class DebugTaskRunner implements IDisposable {
    private readonly taskService;
    private readonly markerService;
    private readonly configurationService;
    private readonly viewsService;
    private readonly dialogService;
    private readonly storageService;
    private readonly commandService;
    private readonly progressService;
    private globalCancellation;
    constructor(taskService: ITaskService, markerService: IMarkerService, configurationService: IConfigurationService, viewsService: IViewsService, dialogService: IDialogService, storageService: IStorageService, commandService: ICommandService, progressService: IProgressService);
    cancel(): void;
    dispose(): void;
    runTaskAndCheckErrors(root: IWorkspaceFolder | IWorkspace | undefined, taskId: string | ITaskIdentifier | undefined): Promise<TaskRunResult>;
    runTask(root: IWorkspace | IWorkspaceFolder | undefined, taskId: string | ITaskIdentifier | undefined, token?: any): Promise<IRunnerTaskSummary | null>;
}
export {};
