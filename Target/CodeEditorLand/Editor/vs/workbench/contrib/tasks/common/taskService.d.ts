import { Action } from "vs/base/common/actions";
import { IStringDictionary } from "vs/base/common/collections";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { IWorkspace, IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { ConfiguringTask, ContributedTask, CustomTask, ITaskEvent, ITaskIdentifier, ITaskSet, Task, TaskRunSource, TaskSorter } from "vs/workbench/contrib/tasks/common/tasks";
import { ITaskSummary, ITaskSystemInfo, ITaskTerminateResponse } from "vs/workbench/contrib/tasks/common/taskSystem";
export type { ITaskSummary, Task, ITaskTerminateResponse as TaskTerminateResponse, };
export declare const CustomExecutionSupportedContext: any;
export declare const ShellExecutionSupportedContext: any;
export declare const TaskCommandsRegistered: any;
export declare const ProcessExecutionSupportedContext: any;
export declare const ServerlessWebContext: any;
export declare const TaskExecutionSupportedContext: any;
export declare const ITaskService: any;
export interface ITaskProvider {
    provideTasks(validTypes: IStringDictionary<boolean>): Promise<ITaskSet>;
    resolveTask(task: ConfiguringTask): Promise<ContributedTask | undefined>;
}
export interface IProblemMatcherRunOptions {
    attachProblemMatcher?: boolean;
}
export interface ICustomizationProperties {
    group?: string | {
        kind?: string;
        isDefault?: boolean;
    };
    problemMatcher?: string | string[];
    isBackground?: boolean;
    color?: string;
    icon?: string;
}
export interface ITaskFilter {
    version?: string;
    type?: string;
    task?: string;
}
interface IWorkspaceTaskResult {
    set: ITaskSet | undefined;
    configurations: {
        byIdentifier: IStringDictionary<ConfiguringTask>;
    } | undefined;
    hasErrors: boolean;
}
export interface IWorkspaceFolderTaskResult extends IWorkspaceTaskResult {
    workspaceFolder: IWorkspaceFolder;
}
export interface ITaskService {
    readonly _serviceBrand: undefined;
    onDidStateChange: Event<ITaskEvent>;
    /** Fired when task providers are registered or unregistered */
    onDidChangeTaskProviders: Event<void>;
    isReconnected: boolean;
    onDidReconnectToTasks: Event<void>;
    supportsMultipleTaskExecutions: boolean;
    configureAction(): Action;
    run(task: Task | undefined, options?: IProblemMatcherRunOptions): Promise<ITaskSummary | undefined>;
    inTerminal(): boolean;
    getActiveTasks(): Promise<Task[]>;
    getBusyTasks(): Promise<Task[]>;
    terminate(task: Task): Promise<ITaskTerminateResponse>;
    tasks(filter?: ITaskFilter): Promise<Task[]>;
    /**
     * Gets tasks currently known to the task system. Unlike {@link tasks},
     * this does not activate extensions or prompt for workspace trust.
     */
    getKnownTasks(filter?: ITaskFilter): Promise<Task[]>;
    taskTypes(): string[];
    getWorkspaceTasks(runSource?: TaskRunSource): Promise<Map<string, IWorkspaceFolderTaskResult>>;
    getSavedTasks(type: "persistent" | "historical"): Promise<(Task | ConfiguringTask)[]>;
    removeRecentlyUsedTask(taskRecentlyUsedKey: string): void;
    /**
     * @param alias The task's name, label or defined identifier.
     */
    getTask(workspaceFolder: IWorkspace | IWorkspaceFolder | string, alias: string | ITaskIdentifier, compareId?: boolean): Promise<Task | undefined>;
    tryResolveTask(configuringTask: ConfiguringTask): Promise<Task | undefined>;
    createSorter(): TaskSorter;
    getTaskDescription(task: Task | ConfiguringTask): string | undefined;
    customize(task: ContributedTask | CustomTask | ConfiguringTask, properties?: {}, openConfig?: boolean): Promise<void>;
    openConfig(task: CustomTask | ConfiguringTask | undefined): Promise<boolean>;
    registerTaskProvider(taskProvider: ITaskProvider, type: string): IDisposable;
    registerTaskSystem(scheme: string, taskSystemInfo: ITaskSystemInfo): void;
    onDidChangeTaskSystemInfo: Event<void>;
    onDidChangeTaskConfig: Event<void>;
    readonly hasTaskSystemInfo: boolean;
    registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): void;
    extensionCallbackTaskComplete(task: Task, result: number | undefined): Promise<void>;
}
