import { Action } from "vs/base/common/actions";
import { Emitter, Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { LRUCache } from "vs/base/common/map";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKey, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IMarkerService } from "vs/platform/markers/common/markers";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IQuickInputService, IQuickPickItem } from "vs/platform/quickinput/common/quickInput";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspace, IWorkspaceContextService, IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "vs/platform/workspace/common/workspaceTrust";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { ConfiguringTask, ContributedTask, CustomTask, ExecutionEngine, ITaskEvent, ITaskIdentifier, Task, TaskRunSource, TaskSorter } from "vs/workbench/contrib/tasks/common/tasks";
import { ICustomizationProperties, IProblemMatcherRunOptions, ITaskFilter, ITaskProvider, ITaskService, IWorkspaceFolderTaskResult } from "vs/workbench/contrib/tasks/common/taskService";
import { ITaskSummary, ITaskSystem, ITaskSystemInfo, ITaskTerminateResponse } from "vs/workbench/contrib/tasks/common/taskSystem";
import { ITerminalGroupService, ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { ITerminalProfileResolverService } from "vs/workbench/contrib/terminal/common/terminal";
import { IConfigurationResolverService } from "vs/workbench/services/configurationResolver/common/configurationResolver";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IOutputChannel, IOutputService } from "vs/workbench/services/output/common/output";
import { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
import { IRemoteAgentService } from "vs/workbench/services/remote/common/remoteAgentService";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
import * as TaskConfig from "../common/taskConfiguration";
export declare namespace ConfigureTaskAction {
    const ID = "workbench.action.tasks.configureTaskRunner";
    const TEXT: any;
}
export type TaskQuickPickEntryType = (IQuickPickItem & {
    task: Task;
}) | (IQuickPickItem & {
    folder: IWorkspaceFolder;
}) | (IQuickPickItem & {
    settingType: string;
});
export interface IWorkspaceFolderConfigurationResult {
    workspaceFolder: IWorkspaceFolder;
    config: TaskConfig.IExternalTaskRunnerConfiguration | undefined;
    hasErrors: boolean;
}
export declare abstract class AbstractTaskService extends Disposable implements ITaskService {
    private readonly _configurationService;
    protected readonly _markerService: IMarkerService;
    protected readonly _outputService: IOutputService;
    private readonly _paneCompositeService;
    private readonly _viewsService;
    private readonly _commandService;
    private readonly _editorService;
    protected readonly _fileService: IFileService;
    protected readonly _contextService: IWorkspaceContextService;
    protected readonly _telemetryService: ITelemetryService;
    private readonly _textFileService;
    protected readonly _modelService: IModelService;
    private readonly _extensionService;
    private readonly _quickInputService;
    protected readonly _configurationResolverService: IConfigurationResolverService;
    private readonly _terminalService;
    private readonly _terminalGroupService;
    private readonly _storageService;
    private readonly _progressService;
    private readonly _openerService;
    protected readonly _dialogService: IDialogService;
    private readonly _notificationService;
    protected readonly _contextKeyService: IContextKeyService;
    private readonly _environmentService;
    private readonly _terminalProfileResolverService;
    private readonly _pathService;
    private readonly _textModelResolverService;
    private readonly _preferencesService;
    private readonly _viewDescriptorService;
    private readonly _workspaceTrustRequestService;
    private readonly _workspaceTrustManagementService;
    private readonly _logService;
    private readonly _themeService;
    private readonly _lifecycleService;
    private readonly _instantiationService;
    private static readonly RecentlyUsedTasks_Key;
    private static readonly RecentlyUsedTasks_KeyV2;
    private static readonly PersistentTasks_Key;
    private static readonly IgnoreTask010DonotShowAgain_key;
    _serviceBrand: undefined;
    static OutputChannelId: string;
    static OutputChannelLabel: string;
    private static _nextHandle;
    private _tasksReconnected;
    private _schemaVersion;
    private _executionEngine;
    private _workspaceFolders;
    private _workspace;
    private _ignoredWorkspaceFolders;
    private _showIgnoreMessage?;
    private _providers;
    private _providerTypes;
    protected _taskSystemInfos: Map<string, ITaskSystemInfo[]>;
    protected _workspaceTasksPromise?: Promise<Map<string, IWorkspaceFolderTaskResult>>;
    protected readonly _whenTaskSystemReady: Promise<void>;
    protected _taskSystem?: ITaskSystem;
    protected _taskSystemListeners?: IDisposable[];
    private _recentlyUsedTasksV1;
    private _recentlyUsedTasks;
    private _persistentTasks;
    protected _taskRunningState: IContextKey<boolean>;
    protected _outputChannel: IOutputChannel;
    protected readonly _onDidStateChange: Emitter<ITaskEvent>;
    private _waitForAllSupportedExecutions;
    private _onDidRegisterSupportedExecutions;
    private _onDidRegisterAllSupportedExecutions;
    private _onDidChangeTaskSystemInfo;
    private _willRestart;
    onDidChangeTaskSystemInfo: Event<void>;
    private _onDidReconnectToTasks;
    onDidReconnectToTasks: Event<void>;
    private _onDidChangeTaskConfig;
    onDidChangeTaskConfig: Event<void>;
    get isReconnected(): boolean;
    private _onDidChangeTaskProviders;
    onDidChangeTaskProviders: any;
    constructor(_configurationService: IConfigurationService, _markerService: IMarkerService, _outputService: IOutputService, _paneCompositeService: IPaneCompositePartService, _viewsService: IViewsService, _commandService: ICommandService, _editorService: IEditorService, _fileService: IFileService, _contextService: IWorkspaceContextService, _telemetryService: ITelemetryService, _textFileService: ITextFileService, _modelService: IModelService, _extensionService: IExtensionService, _quickInputService: IQuickInputService, _configurationResolverService: IConfigurationResolverService, _terminalService: ITerminalService, _terminalGroupService: ITerminalGroupService, _storageService: IStorageService, _progressService: IProgressService, _openerService: IOpenerService, _dialogService: IDialogService, _notificationService: INotificationService, _contextKeyService: IContextKeyService, _environmentService: IWorkbenchEnvironmentService, _terminalProfileResolverService: ITerminalProfileResolverService, _pathService: IPathService, _textModelResolverService: ITextModelService, _preferencesService: IPreferencesService, _viewDescriptorService: IViewDescriptorService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _logService: ILogService, _themeService: IThemeService, _lifecycleService: ILifecycleService, remoteAgentService: IRemoteAgentService, _instantiationService: IInstantiationService);
    registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): void;
    private _attemptTaskReconnection;
    private _reconnectTasks;
    get onDidStateChange(): Event<ITaskEvent>;
    get supportsMultipleTaskExecutions(): boolean;
    private _registerCommands;
    private get workspaceFolders();
    private get ignoredWorkspaceFolders();
    protected get executionEngine(): ExecutionEngine;
    private get schemaVersion();
    private get showIgnoreMessage();
    private _getActivationEvents;
    private _activateTaskProviders;
    private _updateSetup;
    protected _showOutput(runSource?: TaskRunSource, userRequested?: boolean): void;
    protected _disposeTaskSystemListeners(): void;
    registerTaskProvider(provider: ITaskProvider, type: string): IDisposable;
    get hasTaskSystemInfo(): boolean;
    registerTaskSystem(key: string, info: ITaskSystemInfo): void;
    private _getTaskSystemInfo;
    extensionCallbackTaskComplete(task: Task, result: number): Promise<void>;
    /**
     * Get a subset of workspace tasks that match a certain predicate.
     */
    private _findWorkspaceTasks;
    private _findWorkspaceTasksInGroup;
    getTask(folder: IWorkspace | IWorkspaceFolder | string, identifier: string | ITaskIdentifier, compareId?: boolean, type?: string | undefined): Promise<Task | undefined>;
    tryResolveTask(configuringTask: ConfiguringTask): Promise<Task | undefined>;
    protected abstract _versionAndEngineCompatible(filter?: ITaskFilter): boolean;
    tasks(filter?: ITaskFilter): Promise<Task[]>;
    getKnownTasks(filter?: ITaskFilter): Promise<Task[]>;
    taskTypes(): string[];
    createSorter(): TaskSorter;
    private _isActive;
    getActiveTasks(): Promise<Task[]>;
    getBusyTasks(): Promise<Task[]>;
    getRecentlyUsedTasksV1(): LRUCache<string, string>;
    private applyFilterToTaskMap;
    private _getTasksFromStorage;
    private _getRecentTasks;
    private _getPersistentTasks;
    private _getFolderFromTaskKey;
    getSavedTasks(type: "persistent" | "historical"): Promise<(Task | ConfiguringTask)[]>;
    removeRecentlyUsedTask(taskRecentlyUsedKey: string): void;
    removePersistentTask(key: string): void;
    private _setTaskLRUCacheLimit;
    private _setRecentlyUsedTask;
    private _saveRecentlyUsedTasks;
    private _setPersistentTask;
    private _savePersistentTasks;
    private _openDocumentation;
    private _findSingleWorkspaceTaskOfGroup;
    private _build;
    private _runTest;
    private _getGroupedTasksAndExecute;
    run(task: Task | undefined, options?: IProblemMatcherRunOptions, runSource?: TaskRunSource): Promise<ITaskSummary | undefined>;
    private _isProvideTasksEnabled;
    private _isProblemMatcherPromptEnabled;
    private _getTypeForTask;
    private _shouldAttachProblemMatcher;
    private _updateNeverProblemMatcherSetting;
    private _attachProblemMatcher;
    private _getTasksForGroup;
    needsFolderQualification(): boolean;
    private _canCustomize;
    private _formatTaskForJson;
    private _openEditorAtTask;
    private _createCustomizableTask;
    customize(task: ContributedTask | CustomTask | ConfiguringTask, properties?: ICustomizationProperties, openConfig?: boolean): Promise<void>;
    private _writeConfiguration;
    private _getResourceForKind;
    private _getResourceForTask;
    openConfig(task: CustomTask | ConfiguringTask | undefined): Promise<boolean>;
    private _createRunnableTask;
    private _createResolver;
    private _saveBeforeRun;
    private _executeTask;
    private _handleExecuteResult;
    private _restart;
    terminate(task: Task): Promise<ITaskTerminateResponse>;
    private _terminateAll;
    protected _createTerminalTaskSystem(): ITaskSystem;
    protected abstract _getTaskSystem(): ITaskSystem;
    private _isTaskProviderEnabled;
    private _getGroupedTasks;
    private _getCustomTaskPromises;
    private _getLegacyTaskConfigurations;
    getWorkspaceTasks(runSource?: TaskRunSource): Promise<Map<string, IWorkspaceFolderTaskResult>>;
    private _updateWorkspaceTasks;
    private _getAFolder;
    protected _computeWorkspaceTasks(runSource?: TaskRunSource): Promise<Map<string, IWorkspaceFolderTaskResult>>;
    private get _jsonTasksSupported();
    private _computeWorkspaceFolderTasks;
    private _testParseExternalConfig;
    private _log;
    private _computeWorkspaceFileTasks;
    private _computeUserTasks;
    private _emptyWorkspaceTaskResults;
    private _computeTasksForSingleConfig;
    private _computeConfiguration;
    protected abstract _computeLegacyConfiguration(workspaceFolder: IWorkspaceFolder): Promise<IWorkspaceFolderConfigurationResult>;
    private _computeWorkspaceFolderSetup;
    private _computeExecutionEngine;
    private _computeJsonSchemaVersion;
    protected _getConfiguration(workspaceFolder: IWorkspaceFolder, source?: string): {
        config: TaskConfig.IExternalTaskRunnerConfiguration | undefined;
        hasParseErrors: boolean;
    };
    inTerminal(): boolean;
    configureAction(): Action;
    private _handleError;
    private _showDetail;
    private _createTaskQuickPickEntries;
    private _showTwoLevelQuickPick;
    private _showQuickPick;
    private _needsRecentTasksMigration;
    private _migrateRecentTasks;
    private _showIgnoredFoldersMessage;
    private _trust;
    private _runTaskCommand;
    private _tasksAndGroupedTasks;
    private _doRunTaskCommand;
    private _reRunTaskCommand;
    /**
     *
     * @param tasks - The tasks which need to be filtered
     * @param tasksInList - This tells splitPerGroupType to filter out globbed tasks (into defaults)
     * @returns
     */
    private _getDefaultTasks;
    private _runTaskGroupCommand;
    private _getGlobTasks;
    private _runBuildCommand;
    private _runTestCommand;
    private _runTerminateCommand;
    private _runRestartTaskCommand;
    private _getTaskIdentifier;
    private _configHasTasks;
    private _openTaskFile;
    private _isTaskEntry;
    private _isSettingEntry;
    private _configureTask;
    private _handleSelection;
    getTaskDescription(task: Task | ConfiguringTask): string | undefined;
    private _runConfigureTasks;
    private _runConfigureDefaultBuildTask;
    private _runConfigureDefaultTestTask;
    runShowTasks(): Promise<void>;
    private _createTasksDotOld;
    private _upgradeTask;
    private _upgrade;
}
