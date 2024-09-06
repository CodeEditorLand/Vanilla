import { IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { AbstractTaskService, IWorkspaceFolderConfigurationResult } from "vs/workbench/contrib/tasks/browser/abstractTaskService";
import { ITaskFilter } from "vs/workbench/contrib/tasks/common/taskService";
import { ITaskSystem } from "vs/workbench/contrib/tasks/common/taskSystem";
export declare class TaskService extends AbstractTaskService {
    private static readonly ProcessTaskSystemSupportMessage;
    protected _getTaskSystem(): ITaskSystem;
    protected _computeLegacyConfiguration(workspaceFolder: IWorkspaceFolder): Promise<IWorkspaceFolderConfigurationResult>;
    protected _versionAndEngineCompatible(filter?: ITaskFilter): boolean;
}
