import type { IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { type ITaskFilter } from "../common/taskService.js";
import type { ITaskSystem } from "../common/taskSystem.js";
import { AbstractTaskService, type IWorkspaceFolderConfigurationResult } from "./abstractTaskService.js";
export declare class TaskService extends AbstractTaskService {
    private static readonly ProcessTaskSystemSupportMessage;
    protected _getTaskSystem(): ITaskSystem;
    protected _computeLegacyConfiguration(workspaceFolder: IWorkspaceFolder): Promise<IWorkspaceFolderConfigurationResult>;
    protected _versionAndEngineCompatible(filter?: ITaskFilter): boolean;
}
