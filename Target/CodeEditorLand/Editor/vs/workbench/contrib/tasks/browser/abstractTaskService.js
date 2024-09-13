var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Action } from "../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import * as glob from "../../../../base/common/glob.js";
import * as json from "../../../../base/common/json.js";
import {
  Disposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { LRUCache, Touch } from "../../../../base/common/map.js";
import * as Objects from "../../../../base/common/objects.js";
import {
  ValidationState,
  ValidationStatus
} from "../../../../base/common/parsers.js";
import * as Platform from "../../../../base/common/platform.js";
import { TerminateResponseCode } from "../../../../base/common/processes.js";
import * as resources from "../../../../base/common/resources.js";
import Severity from "../../../../base/common/severity.js";
import * as Types from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import * as UUID from "../../../../base/common/uuid.js";
import * as nls from "../../../../nls.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import {
  IFileService
} from "../../../../platform/files/common/files.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  ProblemMatcherRegistry
} from "../common/problemMatcher.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import {
  IWorkspaceContextService,
  WorkbenchState,
  WorkspaceFolder
} from "../../../../platform/workspace/common/workspace.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { Markers } from "../../markers/common/markers.js";
import {
  IOutputService
} from "../../../services/output/common/output.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import {
  ITerminalGroupService,
  ITerminalService
} from "../../terminal/browser/terminal.js";
import { ITerminalProfileResolverService } from "../../terminal/common/terminal.js";
import {
  CustomExecutionSupportedContext,
  ProcessExecutionSupportedContext,
  ServerlessWebContext,
  ShellExecutionSupportedContext,
  TaskCommandsRegistered,
  TaskExecutionSupportedContext
} from "../common/taskService.js";
import {
  TaskError,
  TaskErrors,
  TaskExecuteKind
} from "../common/taskSystem.js";
import { getTemplates as getTaskTemplates } from "../common/taskTemplates.js";
import {
  ConfiguringTask,
  ContributedTask,
  CustomTask,
  ExecutionEngine,
  InMemoryTask,
  JsonSchemaVersion,
  KeyedTaskIdentifier,
  RuntimeType,
  TASK_RUNNING_STATE,
  TaskDefinition,
  TaskEventKind,
  TaskGroup,
  TaskRunSource,
  TaskSettingId,
  TaskSorter,
  TaskSourceKind,
  TasksSchemaProperties,
  USER_TASKS_GROUP_KEY
} from "../common/tasks.js";
import * as TaskConfig from "../common/taskConfiguration.js";
import { TerminalTaskSystem } from "./terminalTaskSystem.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { TaskDefinitionRegistry } from "../common/taskDefinitionRegistry.js";
import { raceTimeout } from "../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { toFormattedString } from "../../../../base/common/jsonFormatter.js";
import { Schemas } from "../../../../base/common/network.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import { TextEditorSelectionRevealType } from "../../../../platform/editor/common/editor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { TerminalExitReason } from "../../../../platform/terminal/common/terminal.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import {
  IWorkspaceTrustManagementService,
  IWorkspaceTrustRequestService
} from "../../../../platform/workspace/common/workspaceTrust.js";
import { VirtualWorkspaceContext } from "../../../common/contextkeys.js";
import { EditorResourceAccessor, SaveReason } from "../../../common/editor.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import {
  ILifecycleService,
  ShutdownReason,
  StartupKind
} from "../../../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import {
  QUICKOPEN_DETAIL_CONFIG,
  QUICKOPEN_SKIP_CONFIG,
  TaskQuickPick,
  configureTaskIcon,
  isWorkspaceFolder
} from "./taskQuickPick.js";
const QUICKOPEN_HISTORY_LIMIT_CONFIG = "task.quickOpen.history";
const PROBLEM_MATCHER_NEVER_CONFIG = "task.problemMatchers.neverPrompt";
const USE_SLOW_PICKER = "task.quickOpen.showAll";
var ConfigureTaskAction;
((ConfigureTaskAction2) => {
  ConfigureTaskAction2.ID = "workbench.action.tasks.configureTaskRunner";
  ConfigureTaskAction2.TEXT = nls.localize2(
    "ConfigureTaskRunnerAction.label",
    "Configure Task"
  );
})(ConfigureTaskAction || (ConfigureTaskAction = {}));
class ProblemReporter {
  constructor(_outputChannel) {
    this._outputChannel = _outputChannel;
    this._validationStatus = new ValidationStatus();
  }
  static {
    __name(this, "ProblemReporter");
  }
  _validationStatus;
  info(message) {
    this._validationStatus.state = ValidationState.Info;
    this._outputChannel.append(message + "\n");
  }
  warn(message) {
    this._validationStatus.state = ValidationState.Warning;
    this._outputChannel.append(message + "\n");
  }
  error(message) {
    this._validationStatus.state = ValidationState.Error;
    this._outputChannel.append(message + "\n");
  }
  fatal(message) {
    this._validationStatus.state = ValidationState.Fatal;
    this._outputChannel.append(message + "\n");
  }
  get status() {
    return this._validationStatus;
  }
}
class TaskMap {
  static {
    __name(this, "TaskMap");
  }
  _store = /* @__PURE__ */ new Map();
  forEach(callback) {
    this._store.forEach(callback);
  }
  static getKey(workspaceFolder) {
    let key;
    if (Types.isString(workspaceFolder)) {
      key = workspaceFolder;
    } else {
      const uri = isWorkspaceFolder(
        workspaceFolder
      ) ? workspaceFolder.uri : workspaceFolder.configuration;
      key = uri ? uri.toString() : "";
    }
    return key;
  }
  get(workspaceFolder) {
    const key = TaskMap.getKey(workspaceFolder);
    let result = this._store.get(key);
    if (!result) {
      result = [];
      this._store.set(key, result);
    }
    return result;
  }
  add(workspaceFolder, ...task) {
    const key = TaskMap.getKey(workspaceFolder);
    let values = this._store.get(key);
    if (!values) {
      values = [];
      this._store.set(key, values);
    }
    values.push(...task);
  }
  all() {
    const result = [];
    this._store.forEach((values) => result.push(...values));
    return result;
  }
}
let AbstractTaskService = class extends Disposable {
  constructor(_configurationService, _markerService, _outputService, _paneCompositeService, _viewsService, _commandService, _editorService, _fileService, _contextService, _telemetryService, _textFileService, _modelService, _extensionService, _quickInputService, _configurationResolverService, _terminalService, _terminalGroupService, _storageService, _progressService, _openerService, _dialogService, _notificationService, _contextKeyService, _environmentService, _terminalProfileResolverService, _pathService, _textModelResolverService, _preferencesService, _viewDescriptorService, _workspaceTrustRequestService, _workspaceTrustManagementService, _logService, _themeService, _lifecycleService, remoteAgentService, _instantiationService) {
    super();
    this._configurationService = _configurationService;
    this._markerService = _markerService;
    this._outputService = _outputService;
    this._paneCompositeService = _paneCompositeService;
    this._viewsService = _viewsService;
    this._commandService = _commandService;
    this._editorService = _editorService;
    this._fileService = _fileService;
    this._contextService = _contextService;
    this._telemetryService = _telemetryService;
    this._textFileService = _textFileService;
    this._modelService = _modelService;
    this._extensionService = _extensionService;
    this._quickInputService = _quickInputService;
    this._configurationResolverService = _configurationResolverService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._storageService = _storageService;
    this._progressService = _progressService;
    this._openerService = _openerService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._contextKeyService = _contextKeyService;
    this._environmentService = _environmentService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._pathService = _pathService;
    this._textModelResolverService = _textModelResolverService;
    this._preferencesService = _preferencesService;
    this._viewDescriptorService = _viewDescriptorService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._logService = _logService;
    this._themeService = _themeService;
    this._lifecycleService = _lifecycleService;
    this._instantiationService = _instantiationService;
    this._whenTaskSystemReady = Event.toPromise(this.onDidChangeTaskSystemInfo);
    this._workspaceTasksPromise = void 0;
    this._taskSystem = void 0;
    this._taskSystemListeners = void 0;
    this._outputChannel = this._outputService.getChannel(AbstractTaskService.OutputChannelId);
    this._providers = /* @__PURE__ */ new Map();
    this._providerTypes = /* @__PURE__ */ new Map();
    this._taskSystemInfos = /* @__PURE__ */ new Map();
    this._register(this._contextService.onDidChangeWorkspaceFolders(() => {
      const folderSetup = this._computeWorkspaceFolderSetup();
      if (this.executionEngine !== folderSetup[2]) {
        this._disposeTaskSystemListeners();
        this._taskSystem = void 0;
      }
      this._updateSetup(folderSetup);
      return this._updateWorkspaceTasks(TaskRunSource.FolderOpen);
    }));
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (!e.affectsConfiguration("tasks") || !this._taskSystem && !this._workspaceTasksPromise) {
        return;
      }
      if (!this._taskSystem || this._taskSystem instanceof TerminalTaskSystem) {
        this._outputChannel.clear();
      }
      if (e.affectsConfiguration(TaskSettingId.Reconnection)) {
        if (!this._configurationService.getValue(TaskSettingId.Reconnection)) {
          this._persistentTasks?.clear();
          this._storageService.remove(AbstractTaskService.PersistentTasks_Key, StorageScope.WORKSPACE);
        }
      }
      this._setTaskLRUCacheLimit();
      await this._updateWorkspaceTasks(TaskRunSource.ConfigurationChange);
      this._onDidChangeTaskConfig.fire();
    }));
    this._taskRunningState = TASK_RUNNING_STATE.bindTo(_contextKeyService);
    this._onDidStateChange = this._register(new Emitter());
    this._registerCommands().then(() => TaskCommandsRegistered.bindTo(this._contextKeyService).set(true));
    ServerlessWebContext.bindTo(this._contextKeyService).set(Platform.isWeb && !remoteAgentService.getConnection()?.remoteAuthority);
    this._configurationResolverService.contributeVariable("defaultBuildTask", async () => {
      let tasks = await this._getTasksForGroup(TaskGroup.Build, true);
      if (tasks.length > 0) {
        const defaults2 = this._getDefaultTasks(tasks);
        if (defaults2.length === 1) {
          return defaults2[0]._label;
        }
      }
      tasks = await this._getTasksForGroup(TaskGroup.Build);
      const defaults = this._getDefaultTasks(tasks);
      if (defaults.length === 1) {
        return defaults[0]._label;
      } else if (defaults.length) {
        tasks = defaults;
      }
      let entry;
      if (tasks && tasks.length > 0) {
        entry = await this._showQuickPick(tasks, nls.localize("TaskService.pickBuildTaskForLabel", "Select the build task (there is no default build task defined)"));
      }
      const task = entry ? entry.task : void 0;
      if (!task) {
        return void 0;
      }
      return task._label;
    });
    this._register(this._lifecycleService.onBeforeShutdown((e) => {
      this._willRestart = e.reason !== ShutdownReason.RELOAD;
    }));
    this._register(this.onDidStateChange((e) => {
      this._log(nls.localize("taskEvent", "Task Event kind: {0}", e.kind), true);
      if (e.kind === TaskEventKind.Changed) {
      } else if ((this._willRestart || e.kind === TaskEventKind.Terminated && e.exitReason === TerminalExitReason.User) && e.taskId) {
        const key = e.__task.getKey();
        if (key) {
          this.removePersistentTask(key);
        }
      } else if (e.kind === TaskEventKind.Start && e.__task && e.__task.getWorkspaceFolder()) {
        this._setPersistentTask(e.__task);
      }
    }));
    this._waitForAllSupportedExecutions = new Promise((resolve) => {
      Event.once(this._onDidRegisterAllSupportedExecutions.event)(() => resolve());
    });
    if (this._terminalService.getReconnectedTerminals("Task")?.length) {
      this._attemptTaskReconnection();
    } else {
      this._terminalService.whenConnected.then(() => {
        if (this._terminalService.getReconnectedTerminals("Task")?.length) {
          this._attemptTaskReconnection();
        } else {
          this._tasksReconnected = true;
          this._onDidReconnectToTasks.fire();
        }
      });
    }
    this._upgrade();
  }
  static {
    __name(this, "AbstractTaskService");
  }
  // private static autoDetectTelemetryName: string = 'taskServer.autoDetect';
  static RecentlyUsedTasks_Key = "workbench.tasks.recentlyUsedTasks";
  static RecentlyUsedTasks_KeyV2 = "workbench.tasks.recentlyUsedTasks2";
  static PersistentTasks_Key = "workbench.tasks.persistentTasks";
  static IgnoreTask010DonotShowAgain_key = "workbench.tasks.ignoreTask010Shown";
  _serviceBrand;
  static OutputChannelId = "tasks";
  static OutputChannelLabel = nls.localize("tasks", "Tasks");
  static _nextHandle = 0;
  _tasksReconnected = false;
  _schemaVersion;
  _executionEngine;
  _workspaceFolders;
  _workspace;
  _ignoredWorkspaceFolders;
  _showIgnoreMessage;
  _providers;
  _providerTypes;
  _taskSystemInfos;
  _workspaceTasksPromise;
  _whenTaskSystemReady;
  _taskSystem;
  _taskSystemListeners = [];
  _recentlyUsedTasksV1;
  _recentlyUsedTasks;
  _persistentTasks;
  _taskRunningState;
  _outputChannel;
  _onDidStateChange;
  _waitForAllSupportedExecutions;
  _onDidRegisterSupportedExecutions = new Emitter();
  _onDidRegisterAllSupportedExecutions = new Emitter();
  _onDidChangeTaskSystemInfo = new Emitter();
  _willRestart = false;
  onDidChangeTaskSystemInfo = this._onDidChangeTaskSystemInfo.event;
  _onDidReconnectToTasks = new Emitter();
  onDidReconnectToTasks = this._onDidReconnectToTasks.event;
  _onDidChangeTaskConfig = new Emitter();
  onDidChangeTaskConfig = this._onDidChangeTaskConfig.event;
  get isReconnected() {
    return this._tasksReconnected;
  }
  _onDidChangeTaskProviders = this._register(new Emitter());
  onDidChangeTaskProviders = this._onDidChangeTaskProviders.event;
  registerSupportedExecutions(custom, shell, process) {
    if (custom !== void 0) {
      const customContext = CustomExecutionSupportedContext.bindTo(
        this._contextKeyService
      );
      customContext.set(custom);
    }
    const isVirtual = !!VirtualWorkspaceContext.getValue(
      this._contextKeyService
    );
    if (shell !== void 0) {
      const shellContext = ShellExecutionSupportedContext.bindTo(
        this._contextKeyService
      );
      shellContext.set(shell && !isVirtual);
    }
    if (process !== void 0) {
      const processContext = ProcessExecutionSupportedContext.bindTo(
        this._contextKeyService
      );
      processContext.set(process && !isVirtual);
    }
    this._workspaceTasksPromise = void 0;
    this._onDidRegisterSupportedExecutions.fire();
    if (Platform.isWeb || custom && shell && process) {
      this._onDidRegisterAllSupportedExecutions.fire();
    }
  }
  _attemptTaskReconnection() {
    if (this._lifecycleService.startupKind !== StartupKind.ReloadedWindow) {
      this._log(
        nls.localize(
          "TaskService.skippingReconnection",
          "Startup kind not window reload, setting connected and removing persistent tasks"
        ),
        true
      );
      this._tasksReconnected = true;
      this._storageService.remove(
        AbstractTaskService.PersistentTasks_Key,
        StorageScope.WORKSPACE
      );
    }
    if (!this._configurationService.getValue(TaskSettingId.Reconnection) || this._tasksReconnected) {
      this._log(
        nls.localize(
          "TaskService.notConnecting",
          "Setting tasks connected configured value {0}, tasks were already reconnected {1}",
          this._configurationService.getValue(
            TaskSettingId.Reconnection
          ),
          this._tasksReconnected
        ),
        true
      );
      this._tasksReconnected = true;
      return;
    }
    this._log(
      nls.localize(
        "TaskService.reconnecting",
        "Reconnecting to running tasks..."
      ),
      true
    );
    this.getWorkspaceTasks(TaskRunSource.Reconnect).then(async () => {
      this._tasksReconnected = await this._reconnectTasks();
      this._log(
        nls.localize(
          "TaskService.reconnected",
          "Reconnected to running tasks."
        ),
        true
      );
      this._onDidReconnectToTasks.fire();
    });
  }
  async _reconnectTasks() {
    const tasks = await this.getSavedTasks("persistent");
    if (!tasks.length) {
      this._log(
        nls.localize(
          "TaskService.noTasks",
          "No persistent tasks to reconnect."
        ),
        true
      );
      return true;
    }
    const taskLabels = tasks.map((task) => task._label).join(", ");
    this._log(
      nls.localize(
        "TaskService.reconnectingTasks",
        "Reconnecting to {0} tasks...",
        taskLabels
      ),
      true
    );
    for (const task of tasks) {
      if (ConfiguringTask.is(task)) {
        const resolved = await this.tryResolveTask(task);
        if (resolved) {
          this.run(resolved, void 0, TaskRunSource.Reconnect);
        }
      } else {
        this.run(task, void 0, TaskRunSource.Reconnect);
      }
    }
    return true;
  }
  get onDidStateChange() {
    return this._onDidStateChange.event;
  }
  get supportsMultipleTaskExecutions() {
    return this.inTerminal();
  }
  async _registerCommands() {
    CommandsRegistry.registerCommand({
      id: "workbench.action.tasks.runTask",
      handler: /* @__PURE__ */ __name(async (accessor, arg) => {
        if (await this._trust()) {
          await this._runTaskCommand(arg);
        }
      }, "handler"),
      metadata: {
        description: "Run Task",
        args: [
          {
            name: "args",
            isOptional: true,
            description: nls.localize(
              "runTask.arg",
              "Filters the tasks shown in the quickpick"
            ),
            schema: {
              anyOf: [
                {
                  type: "string",
                  description: nls.localize(
                    "runTask.label",
                    "The task's label or a term to filter by"
                  )
                },
                {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      description: nls.localize(
                        "runTask.type",
                        "The contributed task type"
                      )
                    },
                    task: {
                      type: "string",
                      description: nls.localize(
                        "runTask.task",
                        "The task's label or a term to filter by"
                      )
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    });
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.reRunTask",
      async (accessor, arg) => {
        if (await this._trust()) {
          this._reRunTaskCommand();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.restartTask",
      async (accessor, arg) => {
        if (await this._trust()) {
          this._runRestartTaskCommand(arg);
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.terminate",
      async (accessor, arg) => {
        if (await this._trust()) {
          this._runTerminateCommand(arg);
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.showLog",
      () => {
        this._showOutput(void 0, true);
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.build",
      async () => {
        if (await this._trust()) {
          this._runBuildCommand();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.test",
      async () => {
        if (await this._trust()) {
          this._runTestCommand();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.configureTaskRunner",
      async () => {
        if (await this._trust()) {
          this._runConfigureTasks();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.configureDefaultBuildTask",
      async () => {
        if (await this._trust()) {
          this._runConfigureDefaultBuildTask();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.configureDefaultTestTask",
      async () => {
        if (await this._trust()) {
          this._runConfigureDefaultTestTask();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.showTasks",
      async () => {
        if (await this._trust()) {
          return this.runShowTasks();
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.toggleProblems",
      () => this._commandService.executeCommand(
        Markers.TOGGLE_MARKERS_VIEW_ACTION_ID
      )
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.openUserTasks",
      async () => {
        const resource = this._getResourceForKind(TaskSourceKind.User);
        if (resource) {
          this._openTaskFile(resource, TaskSourceKind.User);
        }
      }
    );
    CommandsRegistry.registerCommand(
      "workbench.action.tasks.openWorkspaceFileTasks",
      async () => {
        const resource = this._getResourceForKind(
          TaskSourceKind.WorkspaceFile
        );
        if (resource) {
          this._openTaskFile(resource, TaskSourceKind.WorkspaceFile);
        }
      }
    );
  }
  get workspaceFolders() {
    if (!this._workspaceFolders) {
      this._updateSetup();
    }
    return this._workspaceFolders;
  }
  get ignoredWorkspaceFolders() {
    if (!this._ignoredWorkspaceFolders) {
      this._updateSetup();
    }
    return this._ignoredWorkspaceFolders;
  }
  get executionEngine() {
    if (this._executionEngine === void 0) {
      this._updateSetup();
    }
    return this._executionEngine;
  }
  get schemaVersion() {
    if (this._schemaVersion === void 0) {
      this._updateSetup();
    }
    return this._schemaVersion;
  }
  get showIgnoreMessage() {
    if (this._showIgnoreMessage === void 0) {
      this._showIgnoreMessage = !this._storageService.getBoolean(
        AbstractTaskService.IgnoreTask010DonotShowAgain_key,
        StorageScope.WORKSPACE,
        false
      );
    }
    return this._showIgnoreMessage;
  }
  _getActivationEvents(type) {
    const result = [];
    result.push("onCommand:workbench.action.tasks.runTask");
    if (type) {
      result.push(`onTaskType:${type}`);
    } else {
      for (const definition of TaskDefinitionRegistry.all()) {
        result.push(`onTaskType:${definition.taskType}`);
      }
    }
    return result;
  }
  async _activateTaskProviders(type) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    this._log("Activating task providers " + (type ?? "all"));
    await raceTimeout(
      Promise.all(
        this._getActivationEvents(type).map(
          (activationEvent) => this._extensionService.activateByEvent(activationEvent)
        )
      ),
      5e3,
      () => console.warn(
        "Timed out activating extensions for task providers"
      )
    );
  }
  _updateSetup(setup) {
    if (!setup) {
      setup = this._computeWorkspaceFolderSetup();
    }
    this._workspaceFolders = setup[0];
    if (this._ignoredWorkspaceFolders) {
      if (this._ignoredWorkspaceFolders.length !== setup[1].length) {
        this._showIgnoreMessage = void 0;
      } else {
        const set = /* @__PURE__ */ new Set();
        this._ignoredWorkspaceFolders.forEach(
          (folder) => set.add(folder.uri.toString())
        );
        for (const folder of setup[1]) {
          if (!set.has(folder.uri.toString())) {
            this._showIgnoreMessage = void 0;
            break;
          }
        }
      }
    }
    this._ignoredWorkspaceFolders = setup[1];
    this._executionEngine = setup[2];
    this._schemaVersion = setup[3];
    this._workspace = setup[4];
  }
  _showOutput(runSource = TaskRunSource.User, userRequested) {
    if (!VirtualWorkspaceContext.getValue(this._contextKeyService) && (runSource === TaskRunSource.User || runSource === TaskRunSource.ConfigurationChange)) {
      if (userRequested) {
        this._outputService.showChannel(this._outputChannel.id, true);
      } else {
        this._notificationService.prompt(
          Severity.Warning,
          nls.localize(
            "taskServiceOutputPrompt",
            "There are task errors. See the output for details."
          ),
          [
            {
              label: nls.localize("showOutput", "Show output"),
              run: /* @__PURE__ */ __name(() => {
                this._outputService.showChannel(
                  this._outputChannel.id,
                  true
                );
              }, "run")
            }
          ]
        );
      }
    }
  }
  _disposeTaskSystemListeners() {
    if (this._taskSystemListeners) {
      dispose(this._taskSystemListeners);
      this._taskSystemListeners = void 0;
    }
  }
  registerTaskProvider(provider, type) {
    if (!provider) {
      return {
        dispose: /* @__PURE__ */ __name(() => {
        }, "dispose")
      };
    }
    const handle = AbstractTaskService._nextHandle++;
    this._providers.set(handle, provider);
    this._providerTypes.set(handle, type);
    this._onDidChangeTaskProviders.fire();
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._providers.delete(handle);
        this._providerTypes.delete(handle);
        this._onDidChangeTaskProviders.fire();
      }, "dispose")
    };
  }
  get hasTaskSystemInfo() {
    const infosCount = Array.from(this._taskSystemInfos.values()).flat().length;
    if (this._environmentService.remoteAuthority) {
      return infosCount > 1;
    }
    return infosCount > 0;
  }
  registerTaskSystem(key, info) {
    if (info.platform === Platform.Platform.Web) {
      key = this.workspaceFolders.length ? this.workspaceFolders[0].uri.scheme : key;
    }
    if (this._taskSystemInfos.has(key)) {
      const infos = this._taskSystemInfos.get(key);
      if (info.platform === Platform.Platform.Web) {
        infos.push(info);
      } else {
        infos.unshift(info);
      }
    } else {
      this._taskSystemInfos.set(key, [info]);
    }
    if (this.hasTaskSystemInfo) {
      this._onDidChangeTaskSystemInfo.fire();
    }
  }
  _getTaskSystemInfo(key) {
    const infos = this._taskSystemInfos.get(key);
    return infos && infos.length ? infos[0] : void 0;
  }
  extensionCallbackTaskComplete(task, result) {
    if (!this._taskSystem) {
      return Promise.resolve();
    }
    return this._taskSystem.customExecutionComplete(task, result);
  }
  /**
   * Get a subset of workspace tasks that match a certain predicate.
   */
  async _findWorkspaceTasks(predicate) {
    const result = [];
    const tasks = await this.getWorkspaceTasks();
    for (const [, workspaceTasks] of tasks) {
      if (workspaceTasks.configurations) {
        for (const taskName in workspaceTasks.configurations.byIdentifier) {
          const task = workspaceTasks.configurations.byIdentifier[taskName];
          if (predicate(task, workspaceTasks.workspaceFolder)) {
            result.push(task);
          }
        }
      }
      if (workspaceTasks.set) {
        for (const task of workspaceTasks.set.tasks) {
          if (predicate(task, workspaceTasks.workspaceFolder)) {
            result.push(task);
          }
        }
      }
    }
    return result;
  }
  async _findWorkspaceTasksInGroup(group, isDefault) {
    return this._findWorkspaceTasks((task) => {
      const taskGroup = task.configurationProperties.group;
      if (taskGroup && typeof taskGroup !== "string") {
        return taskGroup._id === group._id && (!isDefault || !!taskGroup.isDefault);
      }
      return false;
    });
  }
  async getTask(folder, identifier, compareId = false, type = void 0) {
    if (!await this._trust()) {
      return;
    }
    const name = Types.isString(folder) ? folder : isWorkspaceFolder(folder) ? folder.name : folder.configuration ? resources.basename(folder.configuration) : void 0;
    if (this.ignoredWorkspaceFolders.some(
      (ignored) => ignored.name === name
    )) {
      return Promise.reject(
        new Error(
          nls.localize(
            "TaskServer.folderIgnored",
            "The folder {0} is ignored since it uses task version 0.1.0",
            name
          )
        )
      );
    }
    const key = Types.isString(
      identifier
    ) ? identifier : TaskDefinition.createTaskIdentifier(identifier, console);
    if (key === void 0) {
      return Promise.resolve(void 0);
    }
    const requestedFolder = TaskMap.getKey(folder);
    const matchedTasks = await this._findWorkspaceTasks(
      (task, workspaceFolder) => {
        const taskFolder = TaskMap.getKey(workspaceFolder);
        if (taskFolder !== requestedFolder && taskFolder !== USER_TASKS_GROUP_KEY) {
          return false;
        }
        return task.matches(key, compareId);
      }
    );
    matchedTasks.sort(
      (task) => task._source.kind === TaskSourceKind.Extension ? 1 : -1
    );
    if (matchedTasks.length > 0) {
      const task = matchedTasks[0];
      if (ConfiguringTask.is(task)) {
        return this.tryResolveTask(task);
      } else {
        return task;
      }
    }
    const map = await this._getGroupedTasks({ type });
    let values = map.get(folder);
    values = values.concat(map.get(USER_TASKS_GROUP_KEY));
    if (!values) {
      return void 0;
    }
    values = values.filter((task) => task.matches(key, compareId)).sort(
      (task) => task._source.kind === TaskSourceKind.Extension ? 1 : -1
    );
    return values.length > 0 ? values[0] : void 0;
  }
  async tryResolveTask(configuringTask) {
    if (!await this._trust()) {
      return;
    }
    await this._activateTaskProviders(configuringTask.type);
    let matchingProvider;
    let matchingProviderUnavailable = false;
    for (const [handle, provider] of this._providers) {
      const providerType = this._providerTypes.get(handle);
      if (configuringTask.type === providerType) {
        if (providerType && !this._isTaskProviderEnabled(providerType)) {
          matchingProviderUnavailable = true;
          continue;
        }
        matchingProvider = provider;
        break;
      }
    }
    if (!matchingProvider) {
      if (matchingProviderUnavailable) {
        this._log(
          nls.localize(
            "TaskService.providerUnavailable",
            "Warning: {0} tasks are unavailable in the current environment.",
            configuringTask.configures.type
          )
        );
      }
      return;
    }
    try {
      const resolvedTask = await matchingProvider.resolveTask(configuringTask);
      if (resolvedTask && resolvedTask._id === configuringTask._id) {
        return TaskConfig.createCustomTask(
          resolvedTask,
          configuringTask
        );
      }
    } catch (error) {
    }
    const tasks = await this.tasks({ type: configuringTask.type });
    for (const task of tasks) {
      if (task._id === configuringTask._id) {
        return TaskConfig.createCustomTask(
          task,
          configuringTask
        );
      }
    }
    return;
  }
  async tasks(filter) {
    if (!await this._trust()) {
      return [];
    }
    if (!this._versionAndEngineCompatible(filter)) {
      return Promise.resolve([]);
    }
    return this._getGroupedTasks(filter).then(
      (map) => this.applyFilterToTaskMap(filter, map)
    );
  }
  async getKnownTasks(filter) {
    if (!this._versionAndEngineCompatible(filter)) {
      return Promise.resolve([]);
    }
    return this._getGroupedTasks(filter, true, true).then(
      (map) => this.applyFilterToTaskMap(filter, map)
    );
  }
  taskTypes() {
    const types = [];
    if (this._isProvideTasksEnabled()) {
      for (const definition of TaskDefinitionRegistry.all()) {
        if (this._isTaskProviderEnabled(definition.taskType)) {
          types.push(definition.taskType);
        }
      }
    }
    return types;
  }
  createSorter() {
    return new TaskSorter(
      this._contextService.getWorkspace() ? this._contextService.getWorkspace().folders : []
    );
  }
  _isActive() {
    if (!this._taskSystem) {
      return Promise.resolve(false);
    }
    return this._taskSystem.isActive();
  }
  async getActiveTasks() {
    if (!this._taskSystem) {
      return [];
    }
    return this._taskSystem.getActiveTasks();
  }
  async getBusyTasks() {
    if (!this._taskSystem) {
      return [];
    }
    return this._taskSystem.getBusyTasks();
  }
  getRecentlyUsedTasksV1() {
    if (this._recentlyUsedTasksV1) {
      return this._recentlyUsedTasksV1;
    }
    const quickOpenHistoryLimit = this._configurationService.getValue(
      QUICKOPEN_HISTORY_LIMIT_CONFIG
    );
    this._recentlyUsedTasksV1 = new LRUCache(
      quickOpenHistoryLimit
    );
    const storageValue = this._storageService.get(
      AbstractTaskService.RecentlyUsedTasks_Key,
      StorageScope.WORKSPACE
    );
    if (storageValue) {
      try {
        const values = JSON.parse(storageValue);
        if (Array.isArray(values)) {
          for (const value of values) {
            this._recentlyUsedTasksV1.set(value, value);
          }
        }
      } catch (error) {
      }
    }
    return this._recentlyUsedTasksV1;
  }
  applyFilterToTaskMap(filter, map) {
    if (!filter || !filter.type) {
      return map.all();
    }
    const result = [];
    map.forEach((tasks) => {
      for (const task of tasks) {
        if (ContributedTask.is(task) && (task.defines.type === filter.type || task._source.label === filter.type)) {
          result.push(task);
        } else if (CustomTask.is(task)) {
          if (task.type === filter.type) {
            result.push(task);
          } else {
            const customizes = task.customizes();
            if (customizes && customizes.type === filter.type) {
              result.push(task);
            }
          }
        }
      }
    });
    return result;
  }
  _getTasksFromStorage(type) {
    return type === "persistent" ? this._getPersistentTasks() : this._getRecentTasks();
  }
  _getRecentTasks() {
    if (this._recentlyUsedTasks) {
      return this._recentlyUsedTasks;
    }
    const quickOpenHistoryLimit = this._configurationService.getValue(
      QUICKOPEN_HISTORY_LIMIT_CONFIG
    );
    this._recentlyUsedTasks = new LRUCache(
      quickOpenHistoryLimit
    );
    const storageValue = this._storageService.get(
      AbstractTaskService.RecentlyUsedTasks_KeyV2,
      StorageScope.WORKSPACE
    );
    if (storageValue) {
      try {
        const values = JSON.parse(storageValue);
        if (Array.isArray(values)) {
          for (const value of values) {
            this._recentlyUsedTasks.set(value[0], value[1]);
          }
        }
      } catch (error) {
      }
    }
    return this._recentlyUsedTasks;
  }
  _getPersistentTasks() {
    if (this._persistentTasks) {
      this._log(
        nls.localize(
          "taskService.gettingCachedTasks",
          "Returning cached tasks {0}",
          this._persistentTasks.size
        ),
        true
      );
      return this._persistentTasks;
    }
    this._persistentTasks = new LRUCache(10);
    const storageValue = this._storageService.get(
      AbstractTaskService.PersistentTasks_Key,
      StorageScope.WORKSPACE
    );
    if (storageValue) {
      try {
        const values = JSON.parse(storageValue);
        if (Array.isArray(values)) {
          for (const value of values) {
            this._persistentTasks.set(value[0], value[1]);
          }
        }
      } catch (error) {
      }
    }
    return this._persistentTasks;
  }
  _getFolderFromTaskKey(key) {
    const keyValue = JSON.parse(key);
    return {
      folder: keyValue.folder,
      isWorkspaceFile: keyValue.id?.endsWith(
        TaskSourceKind.WorkspaceFile
      )
    };
  }
  async getSavedTasks(type) {
    const folderMap = /* @__PURE__ */ Object.create(null);
    this.workspaceFolders.forEach((folder) => {
      folderMap[folder.uri.toString()] = folder;
    });
    const folderToTasksMap = /* @__PURE__ */ new Map();
    const workspaceToTaskMap = /* @__PURE__ */ new Map();
    const storedTasks = this._getTasksFromStorage(type);
    const tasks = [];
    this._log(
      nls.localize(
        "taskService.getSavedTasks",
        "Fetching tasks from task storage."
      ),
      true
    );
    function addTaskToMap(map, folder, task) {
      if (folder && !map.has(folder)) {
        map.set(folder, []);
      }
      if (folder && (folderMap[folder] || folder === USER_TASKS_GROUP_KEY) && task) {
        map.get(folder).push(task);
      }
    }
    __name(addTaskToMap, "addTaskToMap");
    for (const entry of storedTasks.entries()) {
      try {
        const key = entry[0];
        const task = JSON.parse(entry[1]);
        const folderInfo = this._getFolderFromTaskKey(key);
        this._log(
          nls.localize(
            "taskService.getSavedTasks.reading",
            "Reading tasks from task storage, {0}, {1}, {2}",
            key,
            task,
            folderInfo.folder
          ),
          true
        );
        addTaskToMap(
          folderInfo.isWorkspaceFile ? workspaceToTaskMap : folderToTasksMap,
          folderInfo.folder,
          task
        );
      } catch (error) {
        this._log(
          nls.localize(
            "taskService.getSavedTasks.error",
            "Fetching a task from task storage failed: {0}.",
            error
          ),
          true
        );
      }
    }
    const readTasksMap = /* @__PURE__ */ new Map();
    async function readTasks(that, map, isWorkspaceFile) {
      for (const key of map.keys()) {
        const custom = [];
        const customized = /* @__PURE__ */ Object.create(null);
        const taskConfigSource = folderMap[key] ? isWorkspaceFile ? TaskConfig.TaskConfigSource.WorkspaceFile : TaskConfig.TaskConfigSource.TasksJson : TaskConfig.TaskConfigSource.User;
        await that._computeTasksForSingleConfig(
          folderMap[key] ?? await that._getAFolder(),
          {
            version: "2.0.0",
            tasks: map.get(key)
          },
          TaskRunSource.System,
          custom,
          customized,
          taskConfigSource,
          true
        );
        custom.forEach((task) => {
          const taskKey = task.getKey();
          if (taskKey) {
            readTasksMap.set(taskKey, task);
          }
        });
        for (const configuration in customized) {
          const taskKey = customized[configuration].getKey();
          if (taskKey) {
            readTasksMap.set(taskKey, customized[configuration]);
          }
        }
      }
    }
    __name(readTasks, "readTasks");
    await readTasks(this, folderToTasksMap, false);
    await readTasks(this, workspaceToTaskMap, true);
    for (const key of storedTasks.keys()) {
      if (readTasksMap.has(key)) {
        tasks.push(readTasksMap.get(key));
        this._log(
          nls.localize(
            "taskService.getSavedTasks.resolved",
            "Resolved task {0}",
            key
          ),
          true
        );
      } else {
        this._log(
          nls.localize(
            "taskService.getSavedTasks.unresolved",
            "Unable to resolve task {0} ",
            key
          ),
          true
        );
      }
    }
    return tasks;
  }
  removeRecentlyUsedTask(taskRecentlyUsedKey) {
    if (this._getTasksFromStorage("historical").has(taskRecentlyUsedKey)) {
      this._getTasksFromStorage("historical").delete(taskRecentlyUsedKey);
      this._saveRecentlyUsedTasks();
    }
  }
  removePersistentTask(key) {
    this._log(
      nls.localize(
        "taskService.removePersistentTask",
        "Removing persistent task {0}",
        key
      ),
      true
    );
    if (this._getTasksFromStorage("persistent").has(key)) {
      this._getTasksFromStorage("persistent").delete(key);
      this._savePersistentTasks();
    }
  }
  _setTaskLRUCacheLimit() {
    const quickOpenHistoryLimit = this._configurationService.getValue(
      QUICKOPEN_HISTORY_LIMIT_CONFIG
    );
    if (this._recentlyUsedTasks) {
      this._recentlyUsedTasks.limit = quickOpenHistoryLimit;
    }
  }
  async _setRecentlyUsedTask(task) {
    let key = task.getKey();
    if (!InMemoryTask.is(task) && key) {
      const customizations = this._createCustomizableTask(task);
      if (ContributedTask.is(task) && customizations) {
        const custom = [];
        const customized = /* @__PURE__ */ Object.create(null);
        await this._computeTasksForSingleConfig(
          task._source.workspaceFolder ?? this.workspaceFolders[0],
          {
            version: "2.0.0",
            tasks: [customizations]
          },
          TaskRunSource.System,
          custom,
          customized,
          TaskConfig.TaskConfigSource.TasksJson,
          true
        );
        for (const configuration in customized) {
          key = customized[configuration].getKey();
        }
      }
      this._getTasksFromStorage("historical").set(
        key,
        JSON.stringify(customizations)
      );
      this._saveRecentlyUsedTasks();
    }
  }
  _saveRecentlyUsedTasks() {
    if (!this._recentlyUsedTasks) {
      return;
    }
    const quickOpenHistoryLimit = this._configurationService.getValue(
      QUICKOPEN_HISTORY_LIMIT_CONFIG
    );
    if (quickOpenHistoryLimit === 0) {
      return;
    }
    let keys = [...this._recentlyUsedTasks.keys()];
    if (keys.length > quickOpenHistoryLimit) {
      keys = keys.slice(0, quickOpenHistoryLimit);
    }
    const keyValues = [];
    for (const key of keys) {
      keyValues.push([
        key,
        this._recentlyUsedTasks.get(key, Touch.None)
      ]);
    }
    this._storageService.store(
      AbstractTaskService.RecentlyUsedTasks_KeyV2,
      JSON.stringify(keyValues),
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  async _setPersistentTask(task) {
    if (!this._configurationService.getValue(TaskSettingId.Reconnection)) {
      return;
    }
    let key = task.getKey();
    if (!InMemoryTask.is(task) && key) {
      const customizations = this._createCustomizableTask(task);
      if (ContributedTask.is(task) && customizations) {
        const custom = [];
        const customized = /* @__PURE__ */ Object.create(null);
        await this._computeTasksForSingleConfig(
          task._source.workspaceFolder ?? this.workspaceFolders[0],
          {
            version: "2.0.0",
            tasks: [customizations]
          },
          TaskRunSource.System,
          custom,
          customized,
          TaskConfig.TaskConfigSource.TasksJson,
          true
        );
        for (const configuration in customized) {
          key = customized[configuration].getKey();
        }
      }
      if (!task.configurationProperties.isBackground) {
        return;
      }
      this._log(
        nls.localize(
          "taskService.setPersistentTask",
          "Setting persistent task {0}",
          key
        ),
        true
      );
      this._getTasksFromStorage("persistent").set(
        key,
        JSON.stringify(customizations)
      );
      this._savePersistentTasks();
    }
  }
  _savePersistentTasks() {
    this._persistentTasks = this._getTasksFromStorage("persistent");
    const keys = [...this._persistentTasks.keys()];
    const keyValues = [];
    for (const key of keys) {
      keyValues.push([key, this._persistentTasks.get(key, Touch.None)]);
    }
    this._log(
      nls.localize(
        "savePersistentTask",
        "Saving persistent tasks: {0}",
        keys.join(", ")
      ),
      true
    );
    this._storageService.store(
      AbstractTaskService.PersistentTasks_Key,
      JSON.stringify(keyValues),
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
  }
  _openDocumentation() {
    this._openerService.open(
      URI.parse(
        "https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher"
      )
    );
  }
  async _findSingleWorkspaceTaskOfGroup(group) {
    const tasksOfGroup = await this._findWorkspaceTasksInGroup(group, true);
    if (tasksOfGroup.length === 1 && typeof tasksOfGroup[0].configurationProperties.group !== "string" && tasksOfGroup[0].configurationProperties.group?.isDefault) {
      let resolvedTask;
      if (ConfiguringTask.is(tasksOfGroup[0])) {
        resolvedTask = await this.tryResolveTask(tasksOfGroup[0]);
      } else {
        resolvedTask = tasksOfGroup[0];
      }
      if (resolvedTask) {
        return this.run(resolvedTask, void 0, TaskRunSource.User);
      }
    }
    return void 0;
  }
  async _build() {
    const tryBuildShortcut = await this._findSingleWorkspaceTaskOfGroup(
      TaskGroup.Build
    );
    if (tryBuildShortcut) {
      return tryBuildShortcut;
    }
    return this._getGroupedTasksAndExecute();
  }
  async _runTest() {
    const tryTestShortcut = await this._findSingleWorkspaceTaskOfGroup(
      TaskGroup.Test
    );
    if (tryTestShortcut) {
      return tryTestShortcut;
    }
    return this._getGroupedTasksAndExecute(true);
  }
  async _getGroupedTasksAndExecute(test) {
    const tasks = await this._getGroupedTasks();
    const runnable = this._createRunnableTask(
      tasks,
      test ? TaskGroup.Test : TaskGroup.Build
    );
    if (!runnable || !runnable.task) {
      if (test) {
        if (this.schemaVersion === JsonSchemaVersion.V0_1_0) {
          throw new TaskError(
            Severity.Info,
            nls.localize(
              "TaskService.noTestTask1",
              "No test task defined. Mark a task with 'isTestCommand' in the tasks.json file."
            ),
            TaskErrors.NoTestTask
          );
        } else {
          throw new TaskError(
            Severity.Info,
            nls.localize(
              "TaskService.noTestTask2",
              "No test task defined. Mark a task with as a 'test' group in the tasks.json file."
            ),
            TaskErrors.NoTestTask
          );
        }
      } else if (this.schemaVersion === JsonSchemaVersion.V0_1_0) {
        throw new TaskError(
          Severity.Info,
          nls.localize(
            "TaskService.noBuildTask1",
            "No build task defined. Mark a task with 'isBuildCommand' in the tasks.json file."
          ),
          TaskErrors.NoBuildTask
        );
      } else {
        throw new TaskError(
          Severity.Info,
          nls.localize(
            "TaskService.noBuildTask2",
            "No build task defined. Mark a task with as a 'build' group in the tasks.json file."
          ),
          TaskErrors.NoBuildTask
        );
      }
    }
    let executeTaskResult;
    try {
      executeTaskResult = await this._executeTask(
        runnable.task,
        runnable.resolver,
        TaskRunSource.User
      );
    } catch (error) {
      this._handleError(error);
      return Promise.reject(error);
    }
    return executeTaskResult;
  }
  async run(task, options, runSource = TaskRunSource.System) {
    if (!await this._trust()) {
      return;
    }
    if (!task) {
      throw new TaskError(
        Severity.Info,
        nls.localize(
          "TaskServer.noTask",
          "Task to execute is undefined"
        ),
        TaskErrors.TaskNotFound
      );
    }
    const resolver = this._createResolver();
    let executeTaskResult;
    try {
      if (options && options.attachProblemMatcher && this._shouldAttachProblemMatcher(task) && !InMemoryTask.is(task)) {
        const taskToExecute = await this._attachProblemMatcher(task);
        if (taskToExecute) {
          executeTaskResult = await this._executeTask(
            taskToExecute,
            resolver,
            runSource
          );
        }
      } else {
        executeTaskResult = await this._executeTask(
          task,
          resolver,
          runSource
        );
      }
      return executeTaskResult;
    } catch (error) {
      this._handleError(error);
      return Promise.reject(error);
    }
  }
  _isProvideTasksEnabled() {
    const settingValue = this._configurationService.getValue(
      TaskSettingId.AutoDetect
    );
    return settingValue === "on";
  }
  _isProblemMatcherPromptEnabled(type) {
    const settingValue = this._configurationService.getValue(
      PROBLEM_MATCHER_NEVER_CONFIG
    );
    if (Types.isBoolean(settingValue)) {
      return !settingValue;
    }
    if (type === void 0) {
      return true;
    }
    const settingValueMap = settingValue;
    return !settingValueMap[type];
  }
  _getTypeForTask(task) {
    let type;
    if (CustomTask.is(task)) {
      const configProperties = task._source.config.element;
      type = configProperties.type;
    } else {
      type = task.getDefinition().type;
    }
    return type;
  }
  _shouldAttachProblemMatcher(task) {
    const enabled = this._isProblemMatcherPromptEnabled(
      this._getTypeForTask(task)
    );
    if (enabled === false) {
      return false;
    }
    if (!this._canCustomize(task)) {
      return false;
    }
    if (task.configurationProperties.group !== void 0 && task.configurationProperties.group !== TaskGroup.Build) {
      return false;
    }
    if (task.configurationProperties.problemMatchers !== void 0 && task.configurationProperties.problemMatchers.length > 0) {
      return false;
    }
    if (ContributedTask.is(task)) {
      return !task.hasDefinedMatchers && !!task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length === 0;
    }
    if (CustomTask.is(task)) {
      const configProperties = task._source.config.element;
      return configProperties.problemMatcher === void 0 && !task.hasDefinedMatchers;
    }
    return false;
  }
  async _updateNeverProblemMatcherSetting(type) {
    const current = this._configurationService.getValue(
      PROBLEM_MATCHER_NEVER_CONFIG
    );
    if (current === true) {
      return;
    }
    let newValue;
    if (current !== false) {
      newValue = current;
    } else {
      newValue = /* @__PURE__ */ Object.create(null);
    }
    newValue[type] = true;
    return this._configurationService.updateValue(
      PROBLEM_MATCHER_NEVER_CONFIG,
      newValue
    );
  }
  async _attachProblemMatcher(task) {
    let entries = [];
    for (const key of ProblemMatcherRegistry.keys()) {
      const matcher = ProblemMatcherRegistry.get(key);
      if (matcher.deprecated) {
        continue;
      }
      if (matcher.name === matcher.label) {
        entries.push({ label: matcher.name, matcher });
      } else {
        entries.push({
          label: matcher.label,
          description: `$${matcher.name}`,
          matcher
        });
      }
    }
    if (entries.length === 0) {
      return;
    }
    entries = entries.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.localeCompare(b.label);
      } else {
        return 0;
      }
    });
    entries.unshift({
      type: "separator",
      label: nls.localize("TaskService.associate", "associate")
    });
    let taskType;
    if (CustomTask.is(task)) {
      const configProperties = task._source.config.element;
      taskType = configProperties.type;
    } else {
      taskType = task.getDefinition().type;
    }
    entries.unshift(
      {
        label: nls.localize(
          "TaskService.attachProblemMatcher.continueWithout",
          "Continue without scanning the task output"
        ),
        matcher: void 0
      },
      {
        label: nls.localize(
          "TaskService.attachProblemMatcher.never",
          "Never scan the task output for this task"
        ),
        matcher: void 0,
        never: true
      },
      {
        label: nls.localize(
          "TaskService.attachProblemMatcher.neverType",
          "Never scan the task output for {0} tasks",
          taskType
        ),
        matcher: void 0,
        setting: taskType
      },
      {
        label: nls.localize(
          "TaskService.attachProblemMatcher.learnMoreAbout",
          "Learn more about scanning the task output"
        ),
        matcher: void 0,
        learnMore: true
      }
    );
    const problemMatcher = await this._quickInputService.pick(entries, {
      placeHolder: nls.localize(
        "selectProblemMatcher",
        "Select for which kind of errors and warnings to scan the task output"
      )
    });
    if (!problemMatcher) {
      return task;
    }
    if (problemMatcher.learnMore) {
      this._openDocumentation();
      return void 0;
    }
    if (problemMatcher.never) {
      this.customize(task, { problemMatcher: [] }, true);
      return task;
    }
    if (problemMatcher.matcher) {
      const newTask = task.clone();
      const matcherReference = `$${problemMatcher.matcher.name}`;
      const properties = {
        problemMatcher: [matcherReference]
      };
      newTask.configurationProperties.problemMatchers = [
        matcherReference
      ];
      const matcher = ProblemMatcherRegistry.get(
        problemMatcher.matcher.name
      );
      if (matcher && matcher.watching !== void 0) {
        properties.isBackground = true;
        newTask.configurationProperties.isBackground = true;
      }
      this.customize(task, properties, true);
      return newTask;
    }
    if (problemMatcher.setting) {
      await this._updateNeverProblemMatcherSetting(
        problemMatcher.setting
      );
    }
    return task;
  }
  async _getTasksForGroup(group, waitToActivate) {
    const groups = await this._getGroupedTasks(void 0, waitToActivate);
    const result = [];
    groups.forEach((tasks) => {
      for (const task of tasks) {
        const configTaskGroup = TaskGroup.from(
          task.configurationProperties.group
        );
        if (configTaskGroup?._id === group._id) {
          result.push(task);
        }
      }
    });
    return result;
  }
  needsFolderQualification() {
    return this._contextService.getWorkbenchState() === WorkbenchState.WORKSPACE;
  }
  _canCustomize(task) {
    if (this.schemaVersion !== JsonSchemaVersion.V2_0_0) {
      return false;
    }
    if (CustomTask.is(task)) {
      return true;
    }
    if (ContributedTask.is(task)) {
      return !!task.getWorkspaceFolder();
    }
    return false;
  }
  async _formatTaskForJson(resource, task) {
    let reference;
    let stringValue = "";
    try {
      reference = await this._textModelResolverService.createModelReference(
        resource
      );
      const model = reference.object.textEditorModel;
      const { tabSize, insertSpaces } = model.getOptions();
      const eol = model.getEOL();
      let stringified = toFormattedString(task, {
        eol,
        tabSize,
        insertSpaces
      });
      const regex = new RegExp(
        eol + (insertSpaces ? " ".repeat(tabSize) : "\\t"),
        "g"
      );
      stringified = stringified.replace(
        regex,
        eol + (insertSpaces ? " ".repeat(tabSize * 3) : "			")
      );
      const twoTabs = insertSpaces ? " ".repeat(tabSize * 2) : "		";
      stringValue = twoTabs + stringified.slice(0, stringified.length - 1) + twoTabs + stringified.slice(stringified.length - 1);
    } finally {
      reference?.dispose();
    }
    return stringValue;
  }
  async _openEditorAtTask(resource, task, configIndex = -1) {
    if (resource === void 0) {
      return Promise.resolve(false);
    }
    const fileContent = await this._fileService.readFile(resource);
    const content = fileContent.value;
    if (!content || !task) {
      return false;
    }
    const contentValue = content.toString();
    let stringValue;
    if (configIndex !== -1) {
      const json2 = this._configurationService.getValue(
        "tasks",
        { resource }
      );
      if (json2.tasks && json2.tasks.length > configIndex) {
        stringValue = await this._formatTaskForJson(
          resource,
          json2.tasks[configIndex]
        );
      }
    }
    if (!stringValue) {
      if (typeof task === "string") {
        stringValue = task;
      } else {
        stringValue = await this._formatTaskForJson(resource, task);
      }
    }
    const index = contentValue.indexOf(stringValue);
    let startLineNumber = 1;
    for (let i = 0; i < index; i++) {
      if (contentValue.charAt(i) === "\n") {
        startLineNumber++;
      }
    }
    let endLineNumber = startLineNumber;
    for (let i = 0; i < stringValue.length; i++) {
      if (stringValue.charAt(i) === "\n") {
        endLineNumber++;
      }
    }
    const selection = startLineNumber > 1 ? {
      startLineNumber,
      startColumn: startLineNumber === endLineNumber ? 4 : 3,
      endLineNumber,
      endColumn: startLineNumber === endLineNumber ? void 0 : 4
    } : void 0;
    await this._editorService.openEditor({
      resource,
      options: {
        pinned: false,
        forceReload: true,
        // because content might have changed
        selection,
        selectionRevealType: TextEditorSelectionRevealType.CenterIfOutsideViewport
      }
    });
    return !!selection;
  }
  _createCustomizableTask(task) {
    let toCustomize;
    const taskConfig = CustomTask.is(task) || ConfiguringTask.is(task) ? task._source.config : void 0;
    if (taskConfig && taskConfig.element) {
      toCustomize = { ...taskConfig.element };
    } else if (ContributedTask.is(task)) {
      toCustomize = {};
      const identifier = Object.assign(
        /* @__PURE__ */ Object.create(null),
        task.defines
      );
      delete identifier["_key"];
      Object.keys(identifier).forEach(
        (key) => toCustomize[key] = identifier[key]
      );
      if (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length > 0 && Types.isStringArray(
        task.configurationProperties.problemMatchers
      )) {
        toCustomize.problemMatcher = task.configurationProperties.problemMatchers;
      }
      if (task.configurationProperties.group) {
        toCustomize.group = TaskConfig.GroupKind.to(
          task.configurationProperties.group
        );
      }
    }
    if (!toCustomize) {
      return void 0;
    }
    if (toCustomize.problemMatcher === void 0 && task.configurationProperties.problemMatchers === void 0 || task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length === 0) {
      toCustomize.problemMatcher = [];
    }
    if (task._source.label !== "Workspace") {
      toCustomize.label = task.configurationProperties.identifier;
    } else {
      toCustomize.label = task._label;
    }
    toCustomize.detail = task.configurationProperties.detail;
    return toCustomize;
  }
  async customize(task, properties, openConfig) {
    if (!await this._trust()) {
      return;
    }
    const workspaceFolder = task.getWorkspaceFolder();
    if (!workspaceFolder) {
      return Promise.resolve(void 0);
    }
    const configuration = this._getConfiguration(
      workspaceFolder,
      task._source.kind
    );
    if (configuration.hasParseErrors) {
      this._notificationService.warn(
        nls.localize(
          "customizeParseErrors",
          "The current task configuration has errors. Please fix the errors first before customizing a task."
        )
      );
      return Promise.resolve(void 0);
    }
    const fileConfig = configuration.config;
    const toCustomize = this._createCustomizableTask(task);
    if (!toCustomize) {
      return Promise.resolve(void 0);
    }
    const index = CustomTask.is(task) ? task._source.config.index : void 0;
    if (properties) {
      for (const property of Object.getOwnPropertyNames(properties)) {
        const value = properties[property];
        if (value !== void 0 && value !== null) {
          toCustomize[property] = value;
        }
      }
    }
    if (fileConfig) {
      if (index === -1 && properties) {
        if (properties.problemMatcher !== void 0) {
          fileConfig.problemMatcher = properties.problemMatcher;
          await this._writeConfiguration(
            workspaceFolder,
            "tasks.problemMatchers",
            fileConfig.problemMatcher,
            task._source.kind
          );
        } else if (properties.group !== void 0) {
          fileConfig.group = properties.group;
          await this._writeConfiguration(
            workspaceFolder,
            "tasks.group",
            fileConfig.group,
            task._source.kind
          );
        }
      } else {
        if (!Array.isArray(fileConfig.tasks)) {
          fileConfig.tasks = [];
        }
        if (index === void 0) {
          fileConfig.tasks.push(toCustomize);
        } else {
          fileConfig.tasks[index] = toCustomize;
        }
        await this._writeConfiguration(
          workspaceFolder,
          "tasks.tasks",
          fileConfig.tasks,
          task._source.kind
        );
      }
    } else {
      const value = {
        version: "2.0.0",
        tasks: [toCustomize]
      };
      let content = [
        "{",
        nls.localize(
          "tasksJsonComment",
          "	// See https://go.microsoft.com/fwlink/?LinkId=733558 \n	// for the documentation about the tasks.json format"
        )
      ].join("\n") + JSON.stringify(value, null, "	").substr(1);
      const editorConfig = this._configurationService.getValue();
      if (editorConfig.editor.insertSpaces) {
        content = content.replace(
          /(\n)(\t+)/g,
          (_, s1, s2) => s1 + " ".repeat(s2.length * editorConfig.editor.tabSize)
        );
      }
      await this._textFileService.create([
        {
          resource: workspaceFolder.toResource(".vscode/tasks.json"),
          value: content
        }
      ]);
    }
    if (openConfig) {
      this._openEditorAtTask(this._getResourceForTask(task), toCustomize);
    }
  }
  _writeConfiguration(workspaceFolder, key, value, source) {
    let target;
    switch (source) {
      case TaskSourceKind.User:
        target = ConfigurationTarget.USER;
        break;
      case TaskSourceKind.WorkspaceFile:
        target = ConfigurationTarget.WORKSPACE;
        break;
      default:
        if (this._contextService.getWorkbenchState() === WorkbenchState.FOLDER) {
          target = ConfigurationTarget.WORKSPACE;
        } else if (this._contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
          target = ConfigurationTarget.WORKSPACE_FOLDER;
        }
    }
    if (target) {
      return this._configurationService.updateValue(
        key,
        value,
        { resource: workspaceFolder.uri },
        target
      );
    } else {
      return void 0;
    }
  }
  _getResourceForKind(kind) {
    this._updateSetup();
    switch (kind) {
      case TaskSourceKind.User: {
        return resources.joinPath(
          resources.dirname(
            this._preferencesService.userSettingsResource
          ),
          "tasks.json"
        );
      }
      case TaskSourceKind.WorkspaceFile: {
        if (this._workspace && this._workspace.configuration) {
          return this._workspace.configuration;
        }
      }
      default: {
        return void 0;
      }
    }
  }
  _getResourceForTask(task) {
    if (CustomTask.is(task)) {
      let uri = this._getResourceForKind(task._source.kind);
      if (!uri) {
        const taskFolder = task.getWorkspaceFolder();
        if (taskFolder) {
          uri = taskFolder.toResource(task._source.config.file);
        } else {
          uri = this.workspaceFolders[0].uri;
        }
      }
      return uri;
    } else {
      return task.getWorkspaceFolder().toResource(".vscode/tasks.json");
    }
  }
  async openConfig(task) {
    let resource;
    if (task) {
      resource = this._getResourceForTask(task);
    } else {
      resource = this._workspaceFolders && this._workspaceFolders.length > 0 ? this._workspaceFolders[0].toResource(".vscode/tasks.json") : void 0;
    }
    return this._openEditorAtTask(
      resource,
      task ? task._label : void 0,
      task ? task._source.config.index : -1
    );
  }
  _createRunnableTask(tasks, group) {
    const resolverData = /* @__PURE__ */ new Map();
    const workspaceTasks = [];
    const extensionTasks = [];
    tasks.forEach((tasks2, folder) => {
      let data = resolverData.get(folder);
      if (!data) {
        data = {
          id: /* @__PURE__ */ new Map(),
          label: /* @__PURE__ */ new Map(),
          identifier: /* @__PURE__ */ new Map()
        };
        resolverData.set(folder, data);
      }
      for (const task of tasks2) {
        data.id.set(task._id, task);
        data.label.set(task._label, task);
        if (task.configurationProperties.identifier) {
          data.identifier.set(
            task.configurationProperties.identifier,
            task
          );
        }
        if (group && task.configurationProperties.group === group) {
          if (task._source.kind === TaskSourceKind.Workspace) {
            workspaceTasks.push(task);
          } else {
            extensionTasks.push(task);
          }
        }
      }
    });
    const resolver = {
      resolve: /* @__PURE__ */ __name(async (uri, alias) => {
        const data = resolverData.get(
          typeof uri === "string" ? uri : uri.toString()
        );
        if (!data) {
          return void 0;
        }
        return data.id.get(alias) || data.label.get(alias) || data.identifier.get(alias);
      }, "resolve")
    };
    if (workspaceTasks.length > 0) {
      if (workspaceTasks.length > 1) {
        this._log(
          nls.localize(
            "moreThanOneBuildTask",
            "There are many build tasks defined in the tasks.json. Executing the first one."
          )
        );
      }
      return { task: workspaceTasks[0], resolver };
    }
    if (extensionTasks.length === 0) {
      return void 0;
    }
    if (extensionTasks.length === 1) {
      return { task: extensionTasks[0], resolver };
    } else {
      const id = UUID.generateUuid();
      const task = new InMemoryTask(
        id,
        { kind: TaskSourceKind.InMemory, label: "inMemory" },
        id,
        "inMemory",
        { reevaluateOnRerun: true },
        {
          identifier: id,
          dependsOn: extensionTasks.map((extensionTask) => {
            return {
              uri: extensionTask.getWorkspaceFolder().uri,
              task: extensionTask._id
            };
          }),
          name: id
        }
      );
      return { task, resolver };
    }
  }
  _createResolver(grouped) {
    let resolverData;
    async function quickResolve(that, uri, identifier) {
      const foundTasks = await that._findWorkspaceTasks(
        (task2) => {
          const taskUri = ConfiguringTask.is(task2) || CustomTask.is(task2) ? task2._source.config.workspaceFolder?.uri : void 0;
          const originalUri = typeof uri === "string" ? uri : uri.toString();
          if (taskUri?.toString() !== originalUri) {
            return false;
          }
          if (Types.isString(identifier)) {
            return task2._label === identifier || task2.configurationProperties.identifier === identifier;
          } else {
            const keyedIdentifier = task2.getDefinition(true);
            const searchIdentifier = TaskDefinition.createTaskIdentifier(
              identifier,
              console
            );
            return searchIdentifier && keyedIdentifier ? searchIdentifier._key === keyedIdentifier._key : false;
          }
        }
      );
      if (foundTasks.length === 0) {
        return void 0;
      }
      const task = foundTasks[0];
      if (ConfiguringTask.is(task)) {
        return that.tryResolveTask(task);
      }
      return task;
    }
    __name(quickResolve, "quickResolve");
    async function getResolverData(that) {
      if (resolverData === void 0) {
        resolverData = /* @__PURE__ */ new Map();
        (grouped || await that._getGroupedTasks()).forEach(
          (tasks, folder) => {
            let data = resolverData.get(folder);
            if (!data) {
              data = {
                label: /* @__PURE__ */ new Map(),
                identifier: /* @__PURE__ */ new Map(),
                taskIdentifier: /* @__PURE__ */ new Map()
              };
              resolverData.set(folder, data);
            }
            for (const task of tasks) {
              data.label.set(task._label, task);
              if (task.configurationProperties.identifier) {
                data.identifier.set(
                  task.configurationProperties.identifier,
                  task
                );
              }
              const keyedIdentifier = task.getDefinition(true);
              if (keyedIdentifier !== void 0) {
                data.taskIdentifier.set(
                  keyedIdentifier._key,
                  task
                );
              }
            }
          }
        );
      }
      return resolverData;
    }
    __name(getResolverData, "getResolverData");
    async function fullResolve(that, uri, identifier) {
      const allResolverData = await getResolverData(that);
      const data = allResolverData.get(
        typeof uri === "string" ? uri : uri.toString()
      );
      if (!data) {
        return void 0;
      }
      if (Types.isString(identifier)) {
        return data.label.get(identifier) || data.identifier.get(identifier);
      } else {
        const key = TaskDefinition.createTaskIdentifier(
          identifier,
          console
        );
        return key !== void 0 ? data.taskIdentifier.get(key._key) : void 0;
      }
    }
    __name(fullResolve, "fullResolve");
    return {
      resolve: /* @__PURE__ */ __name(async (uri, identifier) => {
        if (!identifier) {
          return void 0;
        }
        if (resolverData === void 0 && grouped === void 0) {
          return await quickResolve(this, uri, identifier) ?? fullResolve(this, uri, identifier);
        } else {
          return fullResolve(this, uri, identifier);
        }
      }, "resolve")
    };
  }
  async _saveBeforeRun() {
    let SaveBeforeRunConfigOptions;
    ((SaveBeforeRunConfigOptions2) => {
      SaveBeforeRunConfigOptions2["Always"] = "always";
      SaveBeforeRunConfigOptions2["Never"] = "never";
      SaveBeforeRunConfigOptions2["Prompt"] = "prompt";
    })(SaveBeforeRunConfigOptions || (SaveBeforeRunConfigOptions = {}));
    const saveBeforeRunTaskConfig = this._configurationService.getValue(TaskSettingId.SaveBeforeRun);
    if (saveBeforeRunTaskConfig === "never" /* Never */) {
      return false;
    } else if (saveBeforeRunTaskConfig === "prompt" /* Prompt */ && this._editorService.editors.some((e) => e.isDirty())) {
      const { confirmed } = await this._dialogService.confirm({
        message: nls.localize(
          "TaskSystem.saveBeforeRun.prompt.title",
          "Save all editors?"
        ),
        detail: nls.localize(
          "detail",
          "Do you want to save all editors before running the task?"
        ),
        primaryButton: nls.localize(
          {
            key: "saveBeforeRun.save",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Save"
        ),
        cancelButton: nls.localize(
          {
            key: "saveBeforeRun.dontSave",
            comment: ["&& denotes a mnemonic"]
          },
          "Do&&n't Save"
        )
      });
      if (!confirmed) {
        return false;
      }
    }
    await this._editorService.saveAll({ reason: SaveReason.AUTO });
    return true;
  }
  async _executeTask(task, resolver, runSource) {
    let taskToRun = task;
    if (await this._saveBeforeRun()) {
      await this._configurationService.reloadConfiguration();
      await this._updateWorkspaceTasks();
      const taskFolder = task.getWorkspaceFolder();
      const taskIdentifier = task.configurationProperties.identifier;
      const taskType = CustomTask.is(task) ? task.customizes()?.type : ContributedTask.is(task) ? task.type : void 0;
      taskToRun = (taskFolder && taskIdentifier && runSource === TaskRunSource.User ? await this.getTask(
        taskFolder,
        taskIdentifier,
        false,
        taskType
      ) : task) ?? task;
    }
    await ProblemMatcherRegistry.onReady();
    const executeResult = runSource === TaskRunSource.Reconnect ? this._getTaskSystem().reconnect(taskToRun, resolver) : this._getTaskSystem().run(taskToRun, resolver);
    if (executeResult) {
      return this._handleExecuteResult(executeResult, runSource);
    }
    return { exitCode: 0 };
  }
  async _handleExecuteResult(executeResult, runSource) {
    if (runSource === TaskRunSource.User) {
      await this._setRecentlyUsedTask(executeResult.task);
    }
    if (executeResult.kind === TaskExecuteKind.Active) {
      const active = executeResult.active;
      if (active && active.same && runSource === TaskRunSource.FolderOpen || runSource === TaskRunSource.Reconnect) {
        this._logService.debug(
          "Ignoring task that is already active",
          executeResult.task
        );
        return executeResult.promise;
      }
      if (active && active.same) {
        if (this._taskSystem?.isTaskVisible(executeResult.task)) {
          const message = nls.localize(
            "TaskSystem.activeSame.noBackground",
            "The task '{0}' is already active.",
            executeResult.task.getQualifiedLabel()
          );
          const lastInstance = this._getTaskSystem().getLastInstance(
            executeResult.task
          ) ?? executeResult.task;
          this._notificationService.prompt(
            Severity.Warning,
            message,
            [
              {
                label: nls.localize(
                  "terminateTask",
                  "Terminate Task"
                ),
                run: /* @__PURE__ */ __name(() => this.terminate(lastInstance), "run")
              },
              {
                label: nls.localize(
                  "restartTask",
                  "Restart Task"
                ),
                run: /* @__PURE__ */ __name(() => this._restart(lastInstance), "run")
              }
            ],
            { sticky: true }
          );
        } else {
          this._taskSystem?.revealTask(executeResult.task);
        }
      } else {
        throw new TaskError(
          Severity.Warning,
          nls.localize(
            "TaskSystem.active",
            "There is already a task running. Terminate it first before executing another task."
          ),
          TaskErrors.RunningTask
        );
      }
    }
    this._setRecentlyUsedTask(executeResult.task);
    return executeResult.promise;
  }
  async _restart(task) {
    if (!this._taskSystem) {
      return;
    }
    const response = await this._taskSystem.terminate(task);
    if (response.success) {
      try {
        await this.run(task);
      } catch {
      }
    } else {
      this._notificationService.warn(
        nls.localize(
          "TaskSystem.restartFailed",
          "Failed to terminate and restart task {0}",
          Types.isString(task) ? task : task.configurationProperties.name
        )
      );
    }
  }
  async terminate(task) {
    if (!await this._trust()) {
      return { success: true, task: void 0 };
    }
    if (!this._taskSystem) {
      return { success: true, task: void 0 };
    }
    return this._taskSystem.terminate(task);
  }
  _terminateAll() {
    if (!this._taskSystem) {
      return Promise.resolve([]);
    }
    return this._taskSystem.terminateAll();
  }
  _createTerminalTaskSystem() {
    return new TerminalTaskSystem(
      this._terminalService,
      this._terminalGroupService,
      this._outputService,
      this._paneCompositeService,
      this._viewsService,
      this._markerService,
      this._modelService,
      this._configurationResolverService,
      this._contextService,
      this._environmentService,
      AbstractTaskService.OutputChannelId,
      this._fileService,
      this._terminalProfileResolverService,
      this._pathService,
      this._viewDescriptorService,
      this._logService,
      this._notificationService,
      this._instantiationService,
      (workspaceFolder) => {
        if (workspaceFolder) {
          return this._getTaskSystemInfo(workspaceFolder.uri.scheme);
        } else if (this._taskSystemInfos.size > 0) {
          const infos = Array.from(this._taskSystemInfos.entries());
          const notFile = infos.filter(
            (info) => info[0] !== Schemas.file
          );
          if (notFile.length > 0) {
            return notFile[0][1][0];
          }
          return infos[0][1][0];
        } else {
          return void 0;
        }
      }
    );
  }
  _isTaskProviderEnabled(type) {
    const definition = TaskDefinitionRegistry.get(type);
    return !definition || !definition.when || this._contextKeyService.contextMatchesRules(definition.when);
  }
  async _getGroupedTasks(filter, waitToActivate, knownOnlyOrTrusted) {
    await this._waitForAllSupportedExecutions;
    const type = filter?.type;
    const needsRecentTasksMigration = this._needsRecentTasksMigration();
    if (!waitToActivate) {
      await this._activateTaskProviders(filter?.type);
    }
    const validTypes = /* @__PURE__ */ Object.create(null);
    TaskDefinitionRegistry.all().forEach(
      (definition) => validTypes[definition.taskType] = true
    );
    validTypes["shell"] = true;
    validTypes["process"] = true;
    const contributedTaskSets = await new Promise((resolve) => {
      const result2 = [];
      let counter = 0;
      const done = /* @__PURE__ */ __name((value) => {
        if (value) {
          result2.push(value);
        }
        if (--counter === 0) {
          resolve(result2);
        }
      }, "done");
      const error = /* @__PURE__ */ __name((error2) => {
        try {
          if (error2 && Types.isString(error2.message)) {
            this._log(`Error: ${error2.message}
`);
            this._showOutput();
          } else {
            this._log(
              "Unknown error received while collecting tasks from providers."
            );
            this._showOutput();
          }
        } finally {
          if (--counter === 0) {
            resolve(result2);
          }
        }
      }, "error");
      if (this._isProvideTasksEnabled() && this.schemaVersion === JsonSchemaVersion.V2_0_0 && this._providers.size > 0) {
        let foundAnyProviders = false;
        for (const [handle, provider] of this._providers) {
          const providerType = this._providerTypes.get(handle);
          if (type === void 0 || type === providerType) {
            if (providerType && !this._isTaskProviderEnabled(providerType)) {
              continue;
            }
            foundAnyProviders = true;
            counter++;
            raceTimeout(
              provider.provideTasks(validTypes).then((taskSet) => {
                for (const task of taskSet.tasks) {
                  if (task.type !== this._providerTypes.get(handle)) {
                    this._log(
                      nls.localize(
                        "unexpectedTaskType",
                        'The task provider for "{0}" tasks unexpectedly provided a task of type "{1}".\n',
                        this._providerTypes.get(
                          handle
                        ),
                        task.type
                      )
                    );
                    if (task.type !== "shell" && task.type !== "process") {
                      this._showOutput();
                    }
                    break;
                  }
                }
                return done(taskSet);
              }, error),
              5e3,
              () => {
                console.error(
                  "Timed out getting tasks from ",
                  providerType
                );
                done(void 0);
              }
            );
          }
        }
        if (!foundAnyProviders) {
          resolve(result2);
        }
      } else {
        resolve(result2);
      }
    });
    const result = new TaskMap();
    const contributedTasks = new TaskMap();
    for (const set of contributedTaskSets) {
      for (const task of set.tasks) {
        const workspaceFolder = task.getWorkspaceFolder();
        if (workspaceFolder) {
          contributedTasks.add(workspaceFolder, task);
        }
      }
    }
    try {
      let tasks = [];
      if (!knownOnlyOrTrusted || this._workspaceTrustManagementService.isWorkspaceTrusted()) {
        tasks = Array.from(await this.getWorkspaceTasks());
      }
      await Promise.all(
        this._getCustomTaskPromises(
          tasks,
          filter,
          result,
          contributedTasks,
          waitToActivate
        )
      );
      if (needsRecentTasksMigration) {
        await this._migrateRecentTasks(result.all());
      }
      return result;
    } catch {
      const result2 = new TaskMap();
      for (const set of contributedTaskSets) {
        for (const task of set.tasks) {
          const folder = task.getWorkspaceFolder();
          if (folder) {
            result2.add(folder, task);
          }
        }
      }
      return result2;
    }
  }
  _getCustomTaskPromises(customTasksKeyValuePairs, filter, result, contributedTasks, waitToActivate) {
    return customTasksKeyValuePairs.map(async ([key, folderTasks]) => {
      const contributed = contributedTasks.get(key);
      if (!folderTasks.set) {
        if (contributed) {
          result.add(key, ...contributed);
        }
        return;
      }
      if (this._contextService.getWorkbenchState() === WorkbenchState.EMPTY) {
        result.add(key, ...folderTasks.set.tasks);
      } else {
        const configurations = folderTasks.configurations;
        const legacyTaskConfigurations = folderTasks.set ? this._getLegacyTaskConfigurations(folderTasks.set) : void 0;
        const customTasksToDelete = [];
        if (configurations || legacyTaskConfigurations) {
          const unUsedConfigurations = /* @__PURE__ */ new Set();
          if (configurations) {
            Object.keys(configurations.byIdentifier).forEach(
              (key2) => unUsedConfigurations.add(key2)
            );
          }
          for (const task of contributed) {
            if (!ContributedTask.is(task)) {
              continue;
            }
            if (configurations) {
              const configuringTask = configurations.byIdentifier[task.defines._key];
              if (configuringTask) {
                unUsedConfigurations.delete(task.defines._key);
                result.add(
                  key,
                  TaskConfig.createCustomTask(
                    task,
                    configuringTask
                  )
                );
              } else {
                result.add(key, task);
              }
            } else if (legacyTaskConfigurations) {
              const configuringTask = legacyTaskConfigurations[task.defines._key];
              if (configuringTask) {
                result.add(
                  key,
                  TaskConfig.createCustomTask(
                    task,
                    configuringTask
                  )
                );
                customTasksToDelete.push(configuringTask);
              } else {
                result.add(key, task);
              }
            } else {
              result.add(key, task);
            }
          }
          if (customTasksToDelete.length > 0) {
            const toDelete = customTasksToDelete.reduce((map, task) => {
              map[task._id] = true;
              return map;
            }, /* @__PURE__ */ Object.create(null));
            for (const task of folderTasks.set.tasks) {
              if (toDelete[task._id]) {
                continue;
              }
              result.add(key, task);
            }
          } else {
            result.add(key, ...folderTasks.set.tasks);
          }
          const unUsedConfigurationsAsArray = Array.from(unUsedConfigurations);
          const unUsedConfigurationPromises = unUsedConfigurationsAsArray.map(async (value) => {
            const configuringTask = configurations.byIdentifier[value];
            if (filter?.type && filter.type !== configuringTask.configures.type) {
              return;
            }
            let requiredTaskProviderUnavailable = false;
            for (const [handle, provider] of this._providers) {
              const providerType = this._providerTypes.get(handle);
              if (configuringTask.type === providerType) {
                if (providerType && !this._isTaskProviderEnabled(
                  providerType
                )) {
                  requiredTaskProviderUnavailable = true;
                  continue;
                }
                try {
                  const resolvedTask = await provider.resolveTask(
                    configuringTask
                  );
                  if (resolvedTask && resolvedTask._id === configuringTask._id) {
                    result.add(
                      key,
                      TaskConfig.createCustomTask(
                        resolvedTask,
                        configuringTask
                      )
                    );
                    return;
                  }
                } catch (error) {
                }
              }
            }
            if (requiredTaskProviderUnavailable) {
              this._log(
                nls.localize(
                  "TaskService.providerUnavailable",
                  "Warning: {0} tasks are unavailable in the current environment.",
                  configuringTask.configures.type
                )
              );
            } else if (!waitToActivate) {
              this._log(
                nls.localize(
                  "TaskService.noConfiguration",
                  "Error: The {0} task detection didn't contribute a task for the following configuration:\n{1}\nThe task will be ignored.",
                  configuringTask.configures.type,
                  JSON.stringify(
                    configuringTask._source.config.element,
                    void 0,
                    4
                  )
                )
              );
              this._showOutput();
            }
          });
          await Promise.all(unUsedConfigurationPromises);
        } else {
          result.add(key, ...folderTasks.set.tasks);
          result.add(key, ...contributed);
        }
      }
    });
  }
  _getLegacyTaskConfigurations(workspaceTasks) {
    let result;
    function getResult() {
      if (result) {
        return result;
      }
      result = /* @__PURE__ */ Object.create(null);
      return result;
    }
    __name(getResult, "getResult");
    for (const task of workspaceTasks.tasks) {
      if (CustomTask.is(task)) {
        const commandName = task.command && task.command.name;
        if (commandName === "gulp" || commandName === "grunt" || commandName === "jake") {
          const identifier = KeyedTaskIdentifier.create({
            type: commandName,
            task: task.configurationProperties.name
          });
          getResult()[identifier._key] = task;
        }
      }
    }
    return result;
  }
  async getWorkspaceTasks(runSource = TaskRunSource.User) {
    if (!await this._trust()) {
      return /* @__PURE__ */ new Map();
    }
    await raceTimeout(this._waitForAllSupportedExecutions, 2e3, () => {
      this._logService.warn(
        "Timed out waiting for all supported executions"
      );
    });
    await this._whenTaskSystemReady;
    if (this._workspaceTasksPromise) {
      return this._workspaceTasksPromise;
    }
    return this._updateWorkspaceTasks(runSource);
  }
  _updateWorkspaceTasks(runSource = TaskRunSource.User) {
    this._workspaceTasksPromise = this._computeWorkspaceTasks(runSource);
    return this._workspaceTasksPromise;
  }
  async _getAFolder() {
    let folder = this.workspaceFolders.length > 0 ? this.workspaceFolders[0] : void 0;
    if (!folder) {
      const userhome = await this._pathService.userHome();
      folder = new WorkspaceFolder({
        uri: userhome,
        name: resources.basename(userhome),
        index: 0
      });
    }
    return folder;
  }
  async _computeWorkspaceTasks(runSource = TaskRunSource.User) {
    const promises = [];
    for (const folder2 of this.workspaceFolders) {
      promises.push(this._computeWorkspaceFolderTasks(folder2, runSource));
    }
    const values = await Promise.all(promises);
    const result = /* @__PURE__ */ new Map();
    for (const value of values) {
      if (value) {
        result.set(value.workspaceFolder.uri.toString(), value);
      }
    }
    const folder = await this._getAFolder();
    if (this._contextService.getWorkbenchState() !== WorkbenchState.EMPTY) {
      const workspaceFileTasks = await this._computeWorkspaceFileTasks(
        folder,
        runSource
      );
      if (workspaceFileTasks && this._workspace && this._workspace.configuration) {
        result.set(
          this._workspace.configuration.toString(),
          workspaceFileTasks
        );
      }
    }
    const userTasks = await this._computeUserTasks(folder, runSource);
    if (userTasks) {
      result.set(USER_TASKS_GROUP_KEY, userTasks);
    }
    return result;
  }
  get _jsonTasksSupported() {
    return ShellExecutionSupportedContext.getValue(this._contextKeyService) === true && ProcessExecutionSupportedContext.getValue(
      this._contextKeyService
    ) === true;
  }
  async _computeWorkspaceFolderTasks(workspaceFolder, runSource = TaskRunSource.User) {
    const workspaceFolderConfiguration = this._executionEngine === ExecutionEngine.Process ? await this._computeLegacyConfiguration(workspaceFolder) : await this._computeConfiguration(workspaceFolder);
    if (!workspaceFolderConfiguration || !workspaceFolderConfiguration.config || workspaceFolderConfiguration.hasErrors) {
      return Promise.resolve({
        workspaceFolder,
        set: void 0,
        configurations: void 0,
        hasErrors: workspaceFolderConfiguration ? workspaceFolderConfiguration.hasErrors : false
      });
    }
    await ProblemMatcherRegistry.onReady();
    const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
    const problemReporter = new ProblemReporter(this._outputChannel);
    const parseResult = TaskConfig.parse(
      workspaceFolder,
      void 0,
      taskSystemInfo ? taskSystemInfo.platform : Platform.platform,
      workspaceFolderConfiguration.config,
      problemReporter,
      TaskConfig.TaskConfigSource.TasksJson,
      this._contextKeyService
    );
    let hasErrors = false;
    if (!parseResult.validationStatus.isOK() && parseResult.validationStatus.state !== ValidationState.Info) {
      hasErrors = true;
      this._showOutput(runSource);
    }
    if (problemReporter.status.isFatal()) {
      problemReporter.fatal(
        nls.localize(
          "TaskSystem.configurationErrors",
          "Error: the provided task configuration has validation errors and can't not be used. Please correct the errors first."
        )
      );
      return {
        workspaceFolder,
        set: void 0,
        configurations: void 0,
        hasErrors
      };
    }
    let customizedTasks;
    if (parseResult.configured && parseResult.configured.length > 0) {
      customizedTasks = {
        byIdentifier: /* @__PURE__ */ Object.create(null)
      };
      for (const task of parseResult.configured) {
        customizedTasks.byIdentifier[task.configures._key] = task;
      }
    }
    if (!this._jsonTasksSupported && parseResult.custom.length > 0) {
      console.warn("Custom workspace tasks are not supported.");
    }
    return {
      workspaceFolder,
      set: { tasks: this._jsonTasksSupported ? parseResult.custom : [] },
      configurations: customizedTasks,
      hasErrors
    };
  }
  _testParseExternalConfig(config, location) {
    if (!config) {
      return { config: void 0, hasParseErrors: false };
    }
    const parseErrors = config.$parseErrors;
    if (parseErrors) {
      let isAffected = false;
      for (const parseError of parseErrors) {
        if (/tasks\.json$/.test(parseError)) {
          isAffected = true;
          break;
        }
      }
      if (isAffected) {
        this._log(
          nls.localize(
            {
              key: "TaskSystem.invalidTaskJsonOther",
              comment: [
                "Message notifies of an error in one of several places there is tasks related json, not necessarily in a file named tasks.json"
              ]
            },
            "Error: The content of the tasks json in {0} has syntax errors. Please correct them before executing a task.",
            location
          )
        );
        this._showOutput();
        return { config, hasParseErrors: true };
      }
    }
    return { config, hasParseErrors: false };
  }
  _log(value, verbose) {
    if (!verbose || this._configurationService.getValue(TaskSettingId.VerboseLogging)) {
      this._outputChannel.append(value + "\n");
    }
  }
  async _computeWorkspaceFileTasks(workspaceFolder, runSource = TaskRunSource.User) {
    if (this._executionEngine === ExecutionEngine.Process) {
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    const workspaceFileConfig = this._getConfiguration(
      workspaceFolder,
      TaskSourceKind.WorkspaceFile
    );
    const configuration = this._testParseExternalConfig(
      workspaceFileConfig.config,
      nls.localize(
        "TasksSystem.locationWorkspaceConfig",
        "workspace file"
      )
    );
    const customizedTasks = {
      byIdentifier: /* @__PURE__ */ Object.create(null)
    };
    const custom = [];
    await this._computeTasksForSingleConfig(
      workspaceFolder,
      configuration.config,
      runSource,
      custom,
      customizedTasks.byIdentifier,
      TaskConfig.TaskConfigSource.WorkspaceFile
    );
    const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : ExecutionEngine.Terminal;
    if (engine === ExecutionEngine.Process) {
      this._notificationService.warn(
        nls.localize(
          "TaskSystem.versionWorkspaceFile",
          "Only tasks version 2.0.0 permitted in workspace configuration files."
        )
      );
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    return {
      workspaceFolder,
      set: { tasks: custom },
      configurations: customizedTasks,
      hasErrors: configuration.hasParseErrors
    };
  }
  async _computeUserTasks(workspaceFolder, runSource = TaskRunSource.User) {
    if (this._executionEngine === ExecutionEngine.Process) {
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    const userTasksConfig = this._getConfiguration(
      workspaceFolder,
      TaskSourceKind.User
    );
    const configuration = this._testParseExternalConfig(
      userTasksConfig.config,
      nls.localize("TasksSystem.locationUserConfig", "user settings")
    );
    const customizedTasks = {
      byIdentifier: /* @__PURE__ */ Object.create(null)
    };
    const custom = [];
    await this._computeTasksForSingleConfig(
      workspaceFolder,
      configuration.config,
      runSource,
      custom,
      customizedTasks.byIdentifier,
      TaskConfig.TaskConfigSource.User
    );
    const engine = configuration.config ? TaskConfig.ExecutionEngine.from(configuration.config) : ExecutionEngine.Terminal;
    if (engine === ExecutionEngine.Process) {
      this._notificationService.warn(
        nls.localize(
          "TaskSystem.versionSettings",
          "Only tasks version 2.0.0 permitted in user settings."
        )
      );
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    return {
      workspaceFolder,
      set: { tasks: custom },
      configurations: customizedTasks,
      hasErrors: configuration.hasParseErrors
    };
  }
  _emptyWorkspaceTaskResults(workspaceFolder) {
    return {
      workspaceFolder,
      set: void 0,
      configurations: void 0,
      hasErrors: false
    };
  }
  async _computeTasksForSingleConfig(workspaceFolder, config, runSource, custom, customized, source, isRecentTask = false) {
    if (!config) {
      return false;
    } else if (!workspaceFolder) {
      this._logService.trace(
        "TaskService.computeTasksForSingleConfig: no workspace folder for worskspace",
        this._workspace?.id
      );
      return false;
    }
    const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
    const problemReporter = new ProblemReporter(this._outputChannel);
    const parseResult = TaskConfig.parse(
      workspaceFolder,
      this._workspace,
      taskSystemInfo ? taskSystemInfo.platform : Platform.platform,
      config,
      problemReporter,
      source,
      this._contextKeyService,
      isRecentTask
    );
    let hasErrors = false;
    if (!parseResult.validationStatus.isOK() && parseResult.validationStatus.state !== ValidationState.Info) {
      this._showOutput(runSource);
      hasErrors = true;
    }
    if (problemReporter.status.isFatal()) {
      problemReporter.fatal(
        nls.localize(
          "TaskSystem.configurationErrors",
          "Error: the provided task configuration has validation errors and can't not be used. Please correct the errors first."
        )
      );
      return hasErrors;
    }
    if (parseResult.configured && parseResult.configured.length > 0) {
      for (const task of parseResult.configured) {
        customized[task.configures._key] = task;
      }
    }
    if (!this._jsonTasksSupported && parseResult.custom.length > 0) {
      console.warn("Custom workspace tasks are not supported.");
    } else {
      for (const task of parseResult.custom) {
        custom.push(task);
      }
    }
    return hasErrors;
  }
  _computeConfiguration(workspaceFolder) {
    const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
    return Promise.resolve({
      workspaceFolder,
      config,
      hasErrors: hasParseErrors
    });
  }
  _computeWorkspaceFolderSetup() {
    const workspaceFolders = [];
    const ignoredWorkspaceFolders = [];
    let executionEngine = ExecutionEngine.Terminal;
    let schemaVersion = JsonSchemaVersion.V2_0_0;
    let workspace;
    if (this._contextService.getWorkbenchState() === WorkbenchState.FOLDER) {
      const workspaceFolder = this._contextService.getWorkspace().folders[0];
      workspaceFolders.push(workspaceFolder);
      executionEngine = this._computeExecutionEngine(workspaceFolder);
      const telemetryData = {
        executionEngineVersion: executionEngine
      };
      this._telemetryService.publicLog(
        "taskService.engineVersion",
        telemetryData
      );
      schemaVersion = this._computeJsonSchemaVersion(workspaceFolder);
    } else if (this._contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      workspace = this._contextService.getWorkspace();
      for (const workspaceFolder of this._contextService.getWorkspace().folders) {
        if (schemaVersion === this._computeJsonSchemaVersion(workspaceFolder)) {
          workspaceFolders.push(workspaceFolder);
        } else {
          ignoredWorkspaceFolders.push(workspaceFolder);
          this._log(
            nls.localize(
              "taskService.ignoreingFolder",
              "Ignoring task configurations for workspace folder {0}. Multi folder workspace task support requires that all folders use task version 2.0.0",
              workspaceFolder.uri.fsPath
            )
          );
        }
      }
    }
    return [
      workspaceFolders,
      ignoredWorkspaceFolders,
      executionEngine,
      schemaVersion,
      workspace
    ];
  }
  _computeExecutionEngine(workspaceFolder) {
    const { config } = this._getConfiguration(workspaceFolder);
    if (!config) {
      return ExecutionEngine._default;
    }
    return TaskConfig.ExecutionEngine.from(config);
  }
  _computeJsonSchemaVersion(workspaceFolder) {
    const { config } = this._getConfiguration(workspaceFolder);
    if (!config) {
      return JsonSchemaVersion.V2_0_0;
    }
    return TaskConfig.JsonSchemaVersion.from(config);
  }
  _getConfiguration(workspaceFolder, source) {
    let result;
    if (source !== TaskSourceKind.User && this._contextService.getWorkbenchState() === WorkbenchState.EMPTY) {
      result = void 0;
    } else {
      const wholeConfig = this._configurationService.inspect(
        "tasks",
        { resource: workspaceFolder.uri }
      );
      switch (source) {
        case TaskSourceKind.User: {
          if (wholeConfig.userValue !== wholeConfig.workspaceFolderValue) {
            result = Objects.deepClone(wholeConfig.userValue);
          }
          break;
        }
        case TaskSourceKind.Workspace:
          result = Objects.deepClone(
            wholeConfig.workspaceFolderValue
          );
          break;
        case TaskSourceKind.WorkspaceFile: {
          if (this._contextService.getWorkbenchState() === WorkbenchState.WORKSPACE && wholeConfig.workspaceFolderValue !== wholeConfig.workspaceValue) {
            result = Objects.deepClone(wholeConfig.workspaceValue);
          }
          break;
        }
        default:
          result = Objects.deepClone(
            wholeConfig.workspaceFolderValue
          );
      }
    }
    if (!result) {
      return { config: void 0, hasParseErrors: false };
    }
    const parseErrors = result.$parseErrors;
    if (parseErrors) {
      let isAffected = false;
      for (const parseError of parseErrors) {
        if (/tasks\.json$/.test(parseError)) {
          isAffected = true;
          break;
        }
      }
      if (isAffected) {
        this._log(
          nls.localize(
            "TaskSystem.invalidTaskJson",
            "Error: The content of the tasks.json file has syntax errors. Please correct them before executing a task."
          )
        );
        this._showOutput();
        return { config: void 0, hasParseErrors: true };
      }
    }
    return { config: result, hasParseErrors: false };
  }
  inTerminal() {
    if (this._taskSystem) {
      return this._taskSystem instanceof TerminalTaskSystem;
    }
    return this._executionEngine === ExecutionEngine.Terminal;
  }
  configureAction() {
    const thisCapture = this;
    return new class extends Action {
      constructor() {
        super(
          ConfigureTaskAction.ID,
          ConfigureTaskAction.TEXT.value,
          void 0,
          true,
          () => {
            thisCapture._runConfigureTasks();
            return Promise.resolve(void 0);
          }
        );
      }
    }();
  }
  _handleError(err) {
    let showOutput = true;
    if (err instanceof TaskError) {
      const buildError = err;
      const needsConfig = buildError.code === TaskErrors.NotConfigured || buildError.code === TaskErrors.NoBuildTask || buildError.code === TaskErrors.NoTestTask;
      const needsTerminate = buildError.code === TaskErrors.RunningTask;
      if (needsConfig || needsTerminate) {
        this._notificationService.prompt(
          buildError.severity,
          buildError.message,
          [
            {
              label: needsConfig ? ConfigureTaskAction.TEXT.value : nls.localize(
                "TerminateAction.label",
                "Terminate Task"
              ),
              run: /* @__PURE__ */ __name(() => {
                if (needsConfig) {
                  this._runConfigureTasks();
                } else {
                  this._runTerminateCommand();
                }
              }, "run")
            }
          ]
        );
      } else {
        this._notificationService.notify({
          severity: buildError.severity,
          message: buildError.message
        });
      }
    } else if (err instanceof Error) {
      const error = err;
      this._notificationService.error(error.message);
      showOutput = false;
    } else if (Types.isString(err)) {
      this._notificationService.error(err);
    } else {
      this._notificationService.error(
        nls.localize(
          "TaskSystem.unknownError",
          "An error has occurred while running a task. See task log for details."
        )
      );
    }
    if (showOutput) {
      this._showOutput();
    }
  }
  _showDetail() {
    return this._configurationService.getValue(
      QUICKOPEN_DETAIL_CONFIG
    );
  }
  async _createTaskQuickPickEntries(tasks, group = false, sort = false, selectedEntry, includeRecents = true) {
    let encounteredTasks = {};
    if (tasks === void 0 || tasks === null || tasks.length === 0) {
      return [];
    }
    const TaskQuickPickEntry = /* @__PURE__ */ __name((task) => {
      const newEntry = {
        label: task._label,
        description: this.getTaskDescription(task),
        task,
        detail: this._showDetail() ? task.configurationProperties.detail : void 0
      };
      if (encounteredTasks[task._id]) {
        if (encounteredTasks[task._id].length === 1) {
          encounteredTasks[task._id][0].label += " (1)";
        }
        newEntry.label = newEntry.label + " (" + (encounteredTasks[task._id].length + 1).toString() + ")";
      } else {
        encounteredTasks[task._id] = [];
      }
      encounteredTasks[task._id].push(newEntry);
      return newEntry;
    }, "TaskQuickPickEntry");
    function fillEntries(entries2, tasks2, groupLabel) {
      if (tasks2.length) {
        entries2.push({ type: "separator", label: groupLabel });
      }
      for (const task of tasks2) {
        const entry = TaskQuickPickEntry(task);
        entry.buttons = [
          {
            iconClass: ThemeIcon.asClassName(configureTaskIcon),
            tooltip: nls.localize(
              "configureTask",
              "Configure Task"
            )
          }
        ];
        if (selectedEntry && task === selectedEntry.task) {
          entries2.unshift(selectedEntry);
        } else {
          entries2.push(entry);
        }
      }
    }
    __name(fillEntries, "fillEntries");
    let entries;
    if (group) {
      entries = [];
      if (tasks.length === 1) {
        entries.push(TaskQuickPickEntry(tasks[0]));
      } else {
        const recentlyUsedTasks = await this.getSavedTasks("historical");
        const recent = [];
        const recentSet = /* @__PURE__ */ new Set();
        let configured = [];
        let detected = [];
        const taskMap = /* @__PURE__ */ Object.create(null);
        tasks.forEach((task) => {
          const key = task.getCommonTaskId();
          if (key) {
            taskMap[key] = task;
          }
        });
        recentlyUsedTasks.reverse().forEach((recentTask) => {
          const key = recentTask.getCommonTaskId();
          if (key) {
            recentSet.add(key);
            const task = taskMap[key];
            if (task) {
              recent.push(task);
            }
          }
        });
        for (const task of tasks) {
          const key = task.getCommonTaskId();
          if (!key || !recentSet.has(key)) {
            if (task._source.kind === TaskSourceKind.Workspace || task._source.kind === TaskSourceKind.User) {
              configured.push(task);
            } else {
              detected.push(task);
            }
          }
        }
        const sorter = this.createSorter();
        if (includeRecents) {
          fillEntries(
            entries,
            recent,
            nls.localize("recentlyUsed", "recently used tasks")
          );
        }
        configured = configured.sort((a, b) => sorter.compare(a, b));
        fillEntries(
          entries,
          configured,
          nls.localize("configured", "configured tasks")
        );
        detected = detected.sort((a, b) => sorter.compare(a, b));
        fillEntries(
          entries,
          detected,
          nls.localize("detected", "detected tasks")
        );
      }
    } else {
      if (sort) {
        const sorter = this.createSorter();
        tasks = tasks.sort((a, b) => sorter.compare(a, b));
      }
      entries = tasks.map(
        (task) => TaskQuickPickEntry(task)
      );
    }
    encounteredTasks = {};
    return entries;
  }
  async _showTwoLevelQuickPick(placeHolder, defaultEntry, type, name) {
    return this._instantiationService.createInstance(TaskQuickPick).show(placeHolder, defaultEntry, type, name);
  }
  async _showQuickPick(tasks, placeHolder, defaultEntry, group = false, sort = false, selectedEntry, additionalEntries, name) {
    const resolvedTasks = await tasks;
    const entries = await raceTimeout(
      this._createTaskQuickPickEntries(
        resolvedTasks,
        group,
        sort,
        selectedEntry
      ),
      200,
      () => void 0
    );
    if (!entries) {
      return void 0;
    }
    if (entries.length === 1 && this._configurationService.getValue(QUICKOPEN_SKIP_CONFIG)) {
      return entries[0];
    } else if (entries.length === 0 && defaultEntry) {
      entries.push(defaultEntry);
    } else if (entries.length > 1 && additionalEntries && additionalEntries.length > 0) {
      entries.push({ type: "separator", label: "" });
      entries.push(additionalEntries[0]);
    }
    return this._quickInputService.pick(entries, {
      value: name,
      placeHolder,
      matchOnDescription: true,
      onDidTriggerItemButton: /* @__PURE__ */ __name((context) => {
        const task = context.item.task;
        this._quickInputService.cancel();
        if (ContributedTask.is(task)) {
          this.customize(task, void 0, true);
        } else if (CustomTask.is(task)) {
          this.openConfig(task);
        }
      }, "onDidTriggerItemButton")
    });
  }
  _needsRecentTasksMigration() {
    return this.getRecentlyUsedTasksV1().size > 0 && this._getTasksFromStorage("historical").size === 0;
  }
  async _migrateRecentTasks(tasks) {
    if (!this._needsRecentTasksMigration()) {
      return;
    }
    const recentlyUsedTasks = this.getRecentlyUsedTasksV1();
    const taskMap = /* @__PURE__ */ Object.create(null);
    tasks.forEach((task) => {
      const key = task.getKey();
      if (key) {
        taskMap[key] = task;
      }
    });
    const reversed = [...recentlyUsedTasks.keys()].reverse();
    for (const key in reversed) {
      const task = taskMap[key];
      if (task) {
        await this._setRecentlyUsedTask(task);
      }
    }
    this._storageService.remove(
      AbstractTaskService.RecentlyUsedTasks_Key,
      StorageScope.WORKSPACE
    );
  }
  _showIgnoredFoldersMessage() {
    if (this.ignoredWorkspaceFolders.length === 0 || !this.showIgnoreMessage) {
      return Promise.resolve(void 0);
    }
    this._notificationService.prompt(
      Severity.Info,
      nls.localize(
        "TaskService.ignoredFolder",
        "The following workspace folders are ignored since they use task version 0.1.0: {0}",
        this.ignoredWorkspaceFolders.map((f) => f.name).join(", ")
      ),
      [
        {
          label: nls.localize(
            "TaskService.notAgain",
            "Don't Show Again"
          ),
          isSecondary: true,
          run: /* @__PURE__ */ __name(() => {
            this._storageService.store(
              AbstractTaskService.IgnoreTask010DonotShowAgain_key,
              true,
              StorageScope.WORKSPACE,
              StorageTarget.MACHINE
            );
            this._showIgnoreMessage = false;
          }, "run")
        }
      ]
    );
    return Promise.resolve(void 0);
  }
  async _trust() {
    if (ServerlessWebContext && !TaskExecutionSupportedContext) {
      return false;
    }
    await this._workspaceTrustManagementService.workspaceTrustInitialized;
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      return await this._workspaceTrustRequestService.requestWorkspaceTrust(
        {
          message: nls.localize(
            "TaskService.requestTrust",
            "Listing and running tasks requires that some of the files in this workspace be executed as code."
          )
        }
      ) === true;
    }
    return true;
  }
  async _runTaskCommand(filter) {
    if (!this._tasksReconnected) {
      return;
    }
    if (!filter) {
      return this._doRunTaskCommand();
    }
    const type = typeof filter === "string" ? void 0 : filter.type;
    const taskName = typeof filter === "string" ? filter : filter.task;
    const grouped = await this._getGroupedTasks({ type });
    const identifier = this._getTaskIdentifier(filter);
    const tasks = grouped.all();
    const resolver = this._createResolver(grouped);
    const folderURIs = this._contextService.getWorkspace().folders.map((folder) => folder.uri);
    if (this._contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      folderURIs.push(this._contextService.getWorkspace().configuration);
    }
    folderURIs.push(USER_TASKS_GROUP_KEY);
    if (identifier) {
      for (const uri of folderURIs) {
        const task = await resolver.resolve(uri, identifier);
        if (task) {
          this.run(task);
          return;
        }
      }
    }
    const exactMatchTask = taskName ? tasks.find(
      (t) => t.configurationProperties.identifier === taskName || t.getDefinition(true)?.configurationProperties?.identifier === taskName
    ) : void 0;
    if (!exactMatchTask) {
      return this._doRunTaskCommand(tasks, type, taskName);
    }
    for (const uri of folderURIs) {
      const task = await resolver.resolve(uri, taskName);
      if (task) {
        await this.run(
          task,
          { attachProblemMatcher: true },
          TaskRunSource.User
        );
        return;
      }
    }
  }
  _tasksAndGroupedTasks(filter) {
    if (!this._versionAndEngineCompatible(filter)) {
      return {
        tasks: Promise.resolve([]),
        grouped: Promise.resolve(new TaskMap())
      };
    }
    const grouped = this._getGroupedTasks(filter);
    const tasks = grouped.then((map) => {
      if (!filter || !filter.type) {
        return map.all();
      }
      const result = [];
      map.forEach((tasks2) => {
        for (const task of tasks2) {
          if (ContributedTask.is(task) && task.defines.type === filter.type) {
            result.push(task);
          } else if (CustomTask.is(task)) {
            if (task.type === filter.type) {
              result.push(task);
            } else {
              const customizes = task.customizes();
              if (customizes && customizes.type === filter.type) {
                result.push(task);
              }
            }
          }
        }
      });
      return result;
    });
    return { tasks, grouped };
  }
  _doRunTaskCommand(tasks, type, name) {
    const pickThen = /* @__PURE__ */ __name((task) => {
      if (task === void 0) {
        return;
      }
      if (task === null) {
        this._runConfigureTasks();
      } else {
        this.run(
          task,
          { attachProblemMatcher: true },
          TaskRunSource.User
        ).then(void 0, (reason) => {
        });
      }
    }, "pickThen");
    const placeholder = nls.localize(
      "TaskService.pickRunTask",
      "Select the task to run"
    );
    this._showIgnoredFoldersMessage().then(() => {
      if (this._configurationService.getValue(USE_SLOW_PICKER)) {
        let taskResult;
        if (!tasks) {
          taskResult = this._tasksAndGroupedTasks();
        }
        this._showQuickPick(
          tasks ? tasks : taskResult.tasks,
          placeholder,
          {
            label: "$(plus) " + nls.localize(
              "TaskService.noEntryToRun",
              "Configure a Task"
            ),
            task: null
          },
          true,
          void 0,
          void 0,
          void 0,
          name
        ).then((entry) => {
          return pickThen(entry ? entry.task : void 0);
        });
      } else {
        this._showTwoLevelQuickPick(
          placeholder,
          {
            label: "$(plus) " + nls.localize(
              "TaskService.noEntryToRun",
              "Configure a Task"
            ),
            task: null
          },
          type,
          name
        ).then(pickThen);
      }
    });
  }
  _reRunTaskCommand() {
    ProblemMatcherRegistry.onReady().then(() => {
      return this._editorService.saveAll({ reason: SaveReason.AUTO }).then(() => {
        const executeResult = this._getTaskSystem().rerun();
        if (executeResult) {
          return this._handleExecuteResult(executeResult);
        } else {
          if (!this._taskRunningState.get()) {
            this._doRunTaskCommand();
          }
          return Promise.resolve(void 0);
        }
      });
    });
  }
  /**
   *
   * @param tasks - The tasks which need to be filtered
   * @param tasksInList - This tells splitPerGroupType to filter out globbed tasks (into defaults)
   * @returns
   */
  _getDefaultTasks(tasks, taskGlobsInList = false) {
    const defaults = [];
    for (const task of tasks.filter(
      (t) => !!t.configurationProperties.group
    )) {
      if (taskGlobsInList && typeof task.configurationProperties.group.isDefault === "string") {
        defaults.push(task);
      } else if (!taskGlobsInList && task.configurationProperties.group.isDefault === true) {
        defaults.push(task);
      }
    }
    return defaults;
  }
  _runTaskGroupCommand(taskGroup, strings, configure, legacyCommand) {
    if (this.schemaVersion === JsonSchemaVersion.V0_1_0) {
      legacyCommand();
      return;
    }
    const options = {
      location: ProgressLocation.Window,
      title: strings.fetching
    };
    const promise = (async () => {
      async function runSingleTask(task, problemMatcherOptions, that) {
        that.run(task, problemMatcherOptions, TaskRunSource.User).then(
          void 0,
          (reason) => {
          }
        );
      }
      __name(runSingleTask, "runSingleTask");
      const chooseAndRunTask = /* @__PURE__ */ __name((tasks) => {
        this._showIgnoredFoldersMessage().then(() => {
          this._showQuickPick(
            tasks,
            strings.select,
            {
              label: strings.notFoundConfigure,
              task: null
            },
            true
          ).then((entry) => {
            const task = entry ? entry.task : void 0;
            if (task === void 0) {
              return;
            }
            if (task === null) {
              configure.apply(this);
              return;
            }
            runSingleTask(
              task,
              { attachProblemMatcher: true },
              this
            );
          });
        });
      }, "chooseAndRunTask");
      let groupTasks = [];
      const { globGroupTasks, globTasksDetected } = await this._getGlobTasks(taskGroup._id);
      groupTasks = [...globGroupTasks];
      if (!globTasksDetected && groupTasks.length === 0) {
        groupTasks = await this._findWorkspaceTasksInGroup(
          taskGroup,
          true
        );
      }
      const handleMultipleTasks = /* @__PURE__ */ __name((areGlobTasks) => {
        return this._getTasksForGroup(taskGroup).then((tasks) => {
          if (tasks.length > 0) {
            const defaults = this._getDefaultTasks(
              tasks,
              areGlobTasks
            );
            if (defaults.length === 1) {
              runSingleTask(defaults[0], void 0, this);
              return;
            } else if (defaults.length > 0) {
              tasks = defaults;
            }
          }
          chooseAndRunTask(tasks);
        });
      }, "handleMultipleTasks");
      const resolveTaskAndRun = /* @__PURE__ */ __name((taskGroupTask) => {
        if (ConfiguringTask.is(taskGroupTask)) {
          this.tryResolveTask(taskGroupTask).then((resolvedTask) => {
            runSingleTask(resolvedTask, void 0, this);
          });
        } else {
          runSingleTask(taskGroupTask, void 0, this);
        }
      }, "resolveTaskAndRun");
      if (groupTasks.length === 1) {
        return resolveTaskAndRun(groupTasks[0]);
      }
      if (globTasksDetected && groupTasks.length > 1) {
        return handleMultipleTasks(true);
      }
      if (!groupTasks.length) {
        groupTasks = await this._findWorkspaceTasksInGroup(
          taskGroup,
          true
        );
      }
      if (groupTasks.length === 1) {
        return resolveTaskAndRun(groupTasks[0]);
      }
      return handleMultipleTasks(false);
    })();
    this._progressService.withProgress(options, () => promise);
  }
  async _getGlobTasks(taskGroupId) {
    let globTasksDetected = false;
    const absoluteURI = EditorResourceAccessor.getOriginalUri(
      this._editorService.activeEditor
    );
    if (absoluteURI) {
      const workspaceFolder = this._contextService.getWorkspaceFolder(absoluteURI);
      if (workspaceFolder) {
        const configuredTasks = this._getConfiguration(workspaceFolder)?.config?.tasks;
        if (configuredTasks) {
          globTasksDetected = configuredTasks.filter(
            (task) => task.group && typeof task.group !== "string" && typeof task.group.isDefault === "string"
          ).length > 0;
          if (globTasksDetected) {
            const relativePath = workspaceFolder?.uri ? resources.relativePath(
              workspaceFolder.uri,
              absoluteURI
            ) ?? absoluteURI.path : absoluteURI.path;
            const globGroupTasks = await this._findWorkspaceTasks(
              (task) => {
                const currentTaskGroup = task.configurationProperties.group;
                if (currentTaskGroup && typeof currentTaskGroup !== "string" && typeof currentTaskGroup.isDefault === "string") {
                  return currentTaskGroup._id === taskGroupId && glob.match(
                    currentTaskGroup.isDefault,
                    relativePath
                  );
                }
                globTasksDetected = false;
                return false;
              }
            );
            return { globGroupTasks, globTasksDetected };
          }
        }
      }
    }
    return { globGroupTasks: [], globTasksDetected };
  }
  _runBuildCommand() {
    if (!this._tasksReconnected) {
      return;
    }
    return this._runTaskGroupCommand(
      TaskGroup.Build,
      {
        fetching: nls.localize(
          "TaskService.fetchingBuildTasks",
          "Fetching build tasks..."
        ),
        select: nls.localize(
          "TaskService.pickBuildTask",
          "Select the build task to run"
        ),
        notFoundConfigure: nls.localize(
          "TaskService.noBuildTask",
          "No build task to run found. Configure Build Task..."
        )
      },
      this._runConfigureDefaultBuildTask,
      this._build
    );
  }
  _runTestCommand() {
    return this._runTaskGroupCommand(
      TaskGroup.Test,
      {
        fetching: nls.localize(
          "TaskService.fetchingTestTasks",
          "Fetching test tasks..."
        ),
        select: nls.localize(
          "TaskService.pickTestTask",
          "Select the test task to run"
        ),
        notFoundConfigure: nls.localize(
          "TaskService.noTestTaskTerminal",
          "No test task to run found. Configure Tasks..."
        )
      },
      this._runConfigureDefaultTestTask,
      this._runTest
    );
  }
  _runTerminateCommand(arg) {
    if (arg === "terminateAll") {
      this._terminateAll();
      return;
    }
    const runQuickPick = /* @__PURE__ */ __name((promise) => {
      this._showQuickPick(
        promise || this.getActiveTasks(),
        nls.localize(
          "TaskService.taskToTerminate",
          "Select a task to terminate"
        ),
        {
          label: nls.localize(
            "TaskService.noTaskRunning",
            "No task is currently running"
          ),
          task: void 0
        },
        false,
        true,
        void 0,
        [
          {
            label: nls.localize(
              "TaskService.terminateAllRunningTasks",
              "All Running Tasks"
            ),
            id: "terminateAll",
            task: void 0
          }
        ]
      ).then((entry) => {
        if (entry && entry.id === "terminateAll") {
          this._terminateAll();
        }
        const task = entry ? entry.task : void 0;
        if (task === void 0 || task === null) {
          return;
        }
        this.terminate(task);
      });
    }, "runQuickPick");
    if (this.inTerminal()) {
      const identifier = this._getTaskIdentifier(arg);
      let promise;
      if (identifier !== void 0) {
        promise = this.getActiveTasks();
        promise.then((tasks) => {
          for (const task of tasks) {
            if (task.matches(identifier)) {
              this.terminate(task);
              return;
            }
          }
          runQuickPick(promise);
        });
      } else {
        runQuickPick();
      }
    } else {
      this._isActive().then((active) => {
        if (active) {
          this._terminateAll().then((responses) => {
            const response = responses[0];
            if (response.success) {
              return;
            }
            if (response.code && response.code === TerminateResponseCode.ProcessNotFound) {
              this._notificationService.error(
                nls.localize(
                  "TerminateAction.noProcess",
                  "The launched process doesn't exist anymore. If the task spawned background tasks exiting VS Code might result in orphaned processes."
                )
              );
            } else {
              this._notificationService.error(
                nls.localize(
                  "TerminateAction.failed",
                  "Failed to terminate running task"
                )
              );
            }
          });
        }
      });
    }
  }
  async _runRestartTaskCommand(arg) {
    const activeTasks = await this.getActiveTasks();
    if (activeTasks.length === 1) {
      this._restart(activeTasks[0]);
      return;
    }
    if (this.inTerminal()) {
      const identifier = this._getTaskIdentifier(arg);
      if (identifier !== void 0) {
        for (const task of activeTasks) {
          if (task.matches(identifier)) {
            this._restart(task);
            return;
          }
        }
      }
      const entry = await this._showQuickPick(
        activeTasks,
        nls.localize(
          "TaskService.taskToRestart",
          "Select the task to restart"
        ),
        {
          label: nls.localize(
            "TaskService.noTaskToRestart",
            "No task to restart"
          ),
          task: null
        },
        false,
        true
      );
      if (entry && entry.task) {
        this._restart(entry.task);
      }
    } else if (activeTasks.length > 0) {
      this._restart(activeTasks[0]);
    }
  }
  _getTaskIdentifier(filter) {
    let result;
    if (Types.isString(filter)) {
      result = filter;
    } else if (filter && Types.isString(filter.type)) {
      result = TaskDefinition.createTaskIdentifier(filter, console);
    }
    return result;
  }
  _configHasTasks(taskConfig) {
    return !!taskConfig && !!taskConfig.tasks && taskConfig.tasks.length > 0;
  }
  _openTaskFile(resource, taskSource) {
    let configFileCreated = false;
    this._fileService.stat(resource).then(
      (stat) => stat,
      () => void 0
    ).then(async (stat) => {
      const fileExists = !!stat;
      const configValue = this._configurationService.inspect(
        "tasks",
        { resource }
      );
      let tasksExistInFile;
      let target;
      switch (taskSource) {
        case TaskSourceKind.User:
          tasksExistInFile = this._configHasTasks(
            configValue.userValue
          );
          target = ConfigurationTarget.USER;
          break;
        case TaskSourceKind.WorkspaceFile:
          tasksExistInFile = this._configHasTasks(
            configValue.workspaceValue
          );
          target = ConfigurationTarget.WORKSPACE;
          break;
        default:
          tasksExistInFile = this._configHasTasks(
            configValue.workspaceFolderValue
          );
          target = ConfigurationTarget.WORKSPACE_FOLDER;
      }
      let content;
      if (!tasksExistInFile) {
        const pickTemplateResult = await this._quickInputService.pick(getTaskTemplates(), {
          placeHolder: nls.localize(
            "TaskService.template",
            "Select a Task Template"
          )
        });
        if (!pickTemplateResult) {
          return Promise.resolve(void 0);
        }
        content = pickTemplateResult.content;
        const editorConfig = this._configurationService.getValue();
        if (editorConfig.editor.insertSpaces) {
          content = content.replace(
            /(\n)(\t+)/g,
            (_, s1, s2) => s1 + " ".repeat(
              s2.length * editorConfig.editor.tabSize
            )
          );
        }
        configFileCreated = true;
      }
      if (!fileExists && content) {
        return this._textFileService.create([{ resource, value: content }]).then((result) => {
          return result[0].resource;
        });
      } else if (fileExists && (tasksExistInFile || content)) {
        const statResource = stat?.resource;
        if (content && statResource) {
          this._configurationService.updateValue(
            "tasks",
            json.parse(content),
            { resource: statResource },
            target
          );
        }
        return statResource;
      }
      return void 0;
    }).then((resource2) => {
      if (!resource2) {
        return;
      }
      this._editorService.openEditor({
        resource: resource2,
        options: {
          pinned: configFileCreated
          // pin only if config file is created #8727
        }
      });
    });
  }
  _isTaskEntry(value) {
    const candidate = value;
    return candidate && !!candidate.task;
  }
  _isSettingEntry(value) {
    const candidate = value;
    return candidate && !!candidate.settingType;
  }
  _configureTask(task) {
    if (ContributedTask.is(task)) {
      this.customize(task, void 0, true);
    } else if (CustomTask.is(task)) {
      this.openConfig(task);
    } else if (ConfiguringTask.is(task)) {
    }
  }
  _handleSelection(selection) {
    if (!selection) {
      return;
    }
    if (this._isTaskEntry(selection)) {
      this._configureTask(selection.task);
    } else if (this._isSettingEntry(selection)) {
      const taskQuickPick = this._instantiationService.createInstance(TaskQuickPick);
      taskQuickPick.handleSettingOption(selection.settingType);
    } else if (selection.folder && this._contextService.getWorkbenchState() !== WorkbenchState.EMPTY) {
      this._openTaskFile(
        selection.folder.toResource(".vscode/tasks.json"),
        TaskSourceKind.Workspace
      );
    } else {
      const resource = this._getResourceForKind(TaskSourceKind.User);
      if (resource) {
        this._openTaskFile(resource, TaskSourceKind.User);
      }
    }
  }
  getTaskDescription(task) {
    let description;
    if (task._source.kind === TaskSourceKind.User) {
      description = nls.localize("taskQuickPick.userSettings", "User");
    } else if (task._source.kind === TaskSourceKind.WorkspaceFile) {
      description = task.getWorkspaceFileName();
    } else if (this.needsFolderQualification()) {
      const workspaceFolder = task.getWorkspaceFolder();
      if (workspaceFolder) {
        description = workspaceFolder.name;
      }
    }
    return description;
  }
  async _runConfigureTasks() {
    if (!await this._trust()) {
      return;
    }
    let taskPromise;
    if (this.schemaVersion === JsonSchemaVersion.V2_0_0) {
      taskPromise = this._getGroupedTasks();
    } else {
      taskPromise = Promise.resolve(new TaskMap());
    }
    const stats = this._contextService.getWorkspace().folders.map(
      (folder) => {
        return this._fileService.stat(folder.toResource(".vscode/tasks.json")).then(
          (stat) => stat,
          () => void 0
        );
      }
    );
    const createLabel = nls.localize(
      "TaskService.createJsonFile",
      "Create tasks.json file from template"
    );
    const openLabel = nls.localize(
      "TaskService.openJsonFile",
      "Open tasks.json file"
    );
    const tokenSource = new CancellationTokenSource();
    const cancellationToken = tokenSource.token;
    const entries = Promise.all(stats).then((stats2) => {
      return taskPromise.then((taskMap) => {
        const entries2 = [];
        let configuredCount = 0;
        let tasks = taskMap.all();
        if (tasks.length > 0) {
          tasks = tasks.sort(
            (a, b) => a._label.localeCompare(b._label)
          );
          for (const task of tasks) {
            const entry = {
              label: TaskQuickPick.getTaskLabelWithIcon(task),
              task,
              description: this.getTaskDescription(task),
              detail: this._showDetail() ? task.configurationProperties.detail : void 0
            };
            TaskQuickPick.applyColorStyles(
              task,
              entry,
              this._themeService
            );
            entries2.push(entry);
            if (!ContributedTask.is(task)) {
              configuredCount++;
            }
          }
        }
        const needsCreateOrOpen = configuredCount === 0;
        if (needsCreateOrOpen || taskMap.get(USER_TASKS_GROUP_KEY).length === configuredCount) {
          const label = stats2[0] !== void 0 ? openLabel : createLabel;
          if (entries2.length) {
            entries2.push({ type: "separator" });
          }
          entries2.push({
            label,
            folder: this._contextService.getWorkspace().folders[0]
          });
        }
        if (entries2.length === 1 && !needsCreateOrOpen) {
          tokenSource.cancel();
        }
        return entries2;
      });
    });
    const timeout = await Promise.race([
      new Promise((resolve) => {
        entries.then(() => resolve(false));
      }),
      new Promise((resolve) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, 200);
      })
    ]);
    if (!timeout && (await entries).length === 1 && this._configurationService.getValue(QUICKOPEN_SKIP_CONFIG)) {
      const entry = (await entries)[0];
      if (entry.task) {
        this._handleSelection(entry);
        return;
      }
    }
    const entriesWithSettings = entries.then((resolvedEntries) => {
      resolvedEntries.push(
        ...TaskQuickPick.allSettingEntries(this._configurationService)
      );
      return resolvedEntries;
    });
    this._quickInputService.pick(
      entriesWithSettings,
      {
        placeHolder: nls.localize(
          "TaskService.pickTask",
          "Select a task to configure"
        )
      },
      cancellationToken
    ).then(async (selection) => {
      if (cancellationToken.isCancellationRequested) {
        const task = (await entries)[0];
        if (task.task) {
          selection = task;
        }
      }
      this._handleSelection(selection);
    });
  }
  _runConfigureDefaultBuildTask() {
    if (this.schemaVersion === JsonSchemaVersion.V2_0_0) {
      this.tasks().then((tasks) => {
        if (tasks.length === 0) {
          this._runConfigureTasks();
          return;
        }
        const entries = [];
        let selectedTask;
        let selectedEntry;
        this._showIgnoredFoldersMessage().then(async () => {
          const { globGroupTasks } = await this._getGlobTasks(
            TaskGroup.Build._id
          );
          let defaultTasks = globGroupTasks;
          if (!defaultTasks?.length) {
            defaultTasks = this._getDefaultTasks(tasks, false);
          }
          let defaultBuildTask;
          if (defaultTasks.length === 1) {
            const group = defaultTasks[0].configurationProperties.group;
            if (group) {
              if (typeof group === "string" && group === TaskGroup.Build._id) {
                defaultBuildTask = defaultTasks[0];
              } else {
                defaultBuildTask = defaultTasks[0];
              }
            }
          }
          for (const task of tasks) {
            if (task === defaultBuildTask) {
              const label = nls.localize(
                "TaskService.defaultBuildTaskExists",
                "{0} is already marked as the default build task",
                TaskQuickPick.getTaskLabelWithIcon(
                  task,
                  task.getQualifiedLabel()
                )
              );
              selectedTask = task;
              selectedEntry = {
                label,
                task,
                description: this.getTaskDescription(task),
                detail: this._showDetail() ? task.configurationProperties.detail : void 0
              };
              TaskQuickPick.applyColorStyles(
                task,
                selectedEntry,
                this._themeService
              );
            } else {
              const entry = {
                label: TaskQuickPick.getTaskLabelWithIcon(task),
                task,
                description: this.getTaskDescription(task),
                detail: this._showDetail() ? task.configurationProperties.detail : void 0
              };
              TaskQuickPick.applyColorStyles(
                task,
                entry,
                this._themeService
              );
              entries.push(entry);
            }
          }
          if (selectedEntry) {
            entries.unshift(selectedEntry);
          }
          const tokenSource = new CancellationTokenSource();
          const cancellationToken = tokenSource.token;
          this._quickInputService.pick(
            entries,
            {
              placeHolder: nls.localize(
                "TaskService.pickTask",
                "Select a task to configure"
              )
            },
            cancellationToken
          ).then(async (entry) => {
            if (cancellationToken.isCancellationRequested) {
              const task2 = (await entries)[0];
              if (task2.task) {
                entry = task2;
              }
            }
            const task = entry && "task" in entry ? entry.task : void 0;
            if (task === void 0 || task === null) {
              return;
            }
            if (task === selectedTask && CustomTask.is(task)) {
              this.openConfig(task);
            }
            if (!InMemoryTask.is(task)) {
              this.customize(
                task,
                {
                  group: {
                    kind: "build",
                    isDefault: true
                  }
                },
                true
              ).then(() => {
                if (selectedTask && task !== selectedTask && !InMemoryTask.is(selectedTask)) {
                  this.customize(
                    selectedTask,
                    { group: "build" },
                    false
                  );
                }
              });
            }
          });
          this._quickInputService.pick(entries, {
            placeHolder: nls.localize(
              "TaskService.pickDefaultBuildTask",
              "Select the task to be used as the default build task"
            )
          }).then((entry) => {
            const task = entry && "task" in entry ? entry.task : void 0;
            if (task === void 0 || task === null) {
              return;
            }
            if (task === selectedTask && CustomTask.is(task)) {
              this.openConfig(task);
            }
            if (!InMemoryTask.is(task)) {
              this.customize(
                task,
                {
                  group: {
                    kind: "build",
                    isDefault: true
                  }
                },
                true
              ).then(() => {
                if (selectedTask && task !== selectedTask && !InMemoryTask.is(selectedTask)) {
                  this.customize(
                    selectedTask,
                    { group: "build" },
                    false
                  );
                }
              });
            }
          });
        });
      });
    } else {
      this._runConfigureTasks();
    }
  }
  _runConfigureDefaultTestTask() {
    if (this.schemaVersion === JsonSchemaVersion.V2_0_0) {
      this.tasks().then((tasks) => {
        if (tasks.length === 0) {
          this._runConfigureTasks();
          return;
        }
        let selectedTask;
        let selectedEntry;
        for (const task of tasks) {
          const taskGroup = TaskGroup.from(
            task.configurationProperties.group
          );
          if (taskGroup && taskGroup.isDefault && taskGroup._id === TaskGroup.Test._id) {
            selectedTask = task;
            break;
          }
        }
        if (selectedTask) {
          selectedEntry = {
            label: nls.localize(
              "TaskService.defaultTestTaskExists",
              "{0} is already marked as the default test task.",
              selectedTask.getQualifiedLabel()
            ),
            task: selectedTask,
            detail: this._showDetail() ? selectedTask.configurationProperties.detail : void 0
          };
        }
        this._showIgnoredFoldersMessage().then(() => {
          this._showQuickPick(
            tasks,
            nls.localize(
              "TaskService.pickDefaultTestTask",
              "Select the task to be used as the default test task"
            ),
            void 0,
            true,
            false,
            selectedEntry
          ).then((entry) => {
            const task = entry ? entry.task : void 0;
            if (!task) {
              return;
            }
            if (task === selectedTask && CustomTask.is(task)) {
              this.openConfig(task);
            }
            if (!InMemoryTask.is(task)) {
              this.customize(
                task,
                { group: { kind: "test", isDefault: true } },
                true
              ).then(() => {
                if (selectedTask && task !== selectedTask && !InMemoryTask.is(selectedTask)) {
                  this.customize(
                    selectedTask,
                    { group: "test" },
                    false
                  );
                }
              });
            }
          });
        });
      });
    } else {
      this._runConfigureTasks();
    }
  }
  async runShowTasks() {
    const activeTasksPromise = this.getActiveTasks();
    const activeTasks = await activeTasksPromise;
    let group;
    if (activeTasks.length === 1) {
      this._taskSystem.revealTask(activeTasks[0]);
    } else if (activeTasks.length && activeTasks.every((task) => {
      if (InMemoryTask.is(task)) {
        return false;
      }
      if (!group) {
        group = task.command.presentation?.group;
      }
      return task.command.presentation?.group && task.command.presentation.group === group;
    })) {
      this._taskSystem.revealTask(activeTasks[0]);
    } else {
      this._showQuickPick(
        activeTasksPromise,
        nls.localize(
          "TaskService.pickShowTask",
          "Select the task to show its output"
        ),
        {
          label: nls.localize(
            "TaskService.noTaskIsRunning",
            "No task is running"
          ),
          task: null
        },
        false,
        true
      ).then((entry) => {
        const task = entry ? entry.task : void 0;
        if (task === void 0 || task === null) {
          return;
        }
        this._taskSystem.revealTask(task);
      });
    }
  }
  async _createTasksDotOld(folder) {
    const tasksFile = folder.toResource(".vscode/tasks.json");
    if (await this._fileService.exists(tasksFile)) {
      const oldFile = tasksFile.with({ path: `${tasksFile.path}.old` });
      await this._fileService.copy(tasksFile, oldFile, true);
      return [oldFile, tasksFile];
    }
    return void 0;
  }
  _upgradeTask(task, suppressTaskName, globalConfig) {
    if (!CustomTask.is(task)) {
      return;
    }
    const configElement = {
      label: task._label
    };
    const oldTaskTypes = /* @__PURE__ */ new Set(["gulp", "jake", "grunt"]);
    if (Types.isString(task.command.name) && oldTaskTypes.has(task.command.name)) {
      configElement.type = task.command.name;
      configElement.task = task.command.args[0];
    } else {
      if (task.command.runtime === RuntimeType.Shell) {
        configElement.type = RuntimeType.toString(RuntimeType.Shell);
      }
      if (task.command.name && !suppressTaskName && !globalConfig.windows?.command && !globalConfig.osx?.command && !globalConfig.linux?.command) {
        configElement.command = task.command.name;
      } else if (suppressTaskName) {
        configElement.command = task._source.config.element.command;
      }
      if (task.command.args && (!Array.isArray(task.command.args) || task.command.args.length > 0)) {
        if (!globalConfig.windows?.args && !globalConfig.osx?.args && !globalConfig.linux?.args) {
          configElement.args = task.command.args;
        } else {
          configElement.args = task._source.config.element.args;
        }
      }
    }
    if (task.configurationProperties.presentation) {
      configElement.presentation = task.configurationProperties.presentation;
    }
    if (task.configurationProperties.isBackground) {
      configElement.isBackground = task.configurationProperties.isBackground;
    }
    if (task.configurationProperties.problemMatchers) {
      configElement.problemMatcher = task._source.config.element.problemMatcher;
    }
    if (task.configurationProperties.group) {
      configElement.group = task.configurationProperties.group;
    }
    task._source.config.element = configElement;
    const tempTask = new CustomTask(
      task._id,
      task._source,
      task._label,
      task.type,
      task.command,
      task.hasDefinedMatchers,
      task.runOptions,
      task.configurationProperties
    );
    const configTask = this._createCustomizableTask(tempTask);
    if (configTask) {
      return configTask;
    }
    return;
  }
  async _upgrade() {
    if (this.schemaVersion === JsonSchemaVersion.V2_0_0) {
      return;
    }
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      this._register(
        Event.once(
          this._workspaceTrustManagementService.onDidChangeTrust
        )((isTrusted) => {
          if (isTrusted) {
            this._upgrade();
          }
        })
      );
      return;
    }
    const tasks = await this._getGroupedTasks();
    const fileDiffs = [];
    for (const folder of this.workspaceFolders) {
      const diff = await this._createTasksDotOld(folder);
      if (diff) {
        fileDiffs.push(diff);
      }
      if (!diff) {
        continue;
      }
      const configTasks = [];
      const suppressTaskName = !!this._configurationService.getValue(
        TasksSchemaProperties.SuppressTaskName,
        { resource: folder.uri }
      );
      const globalConfig = {
        windows: this._configurationService.getValue(
          TasksSchemaProperties.Windows,
          { resource: folder.uri }
        ),
        osx: this._configurationService.getValue(
          TasksSchemaProperties.Osx,
          { resource: folder.uri }
        ),
        linux: this._configurationService.getValue(
          TasksSchemaProperties.Linux,
          { resource: folder.uri }
        )
      };
      tasks.get(folder).forEach((task) => {
        const configTask = this._upgradeTask(
          task,
          suppressTaskName,
          globalConfig
        );
        if (configTask) {
          configTasks.push(configTask);
        }
      });
      this._taskSystem = void 0;
      this._workspaceTasksPromise = void 0;
      await this._writeConfiguration(folder, "tasks.tasks", configTasks);
      await this._writeConfiguration(folder, "tasks.version", "2.0.0");
      if (this._configurationService.getValue(
        TasksSchemaProperties.ShowOutput,
        { resource: folder.uri }
      )) {
        await this._configurationService.updateValue(
          TasksSchemaProperties.ShowOutput,
          void 0,
          { resource: folder.uri }
        );
      }
      if (this._configurationService.getValue(
        TasksSchemaProperties.IsShellCommand,
        { resource: folder.uri }
      )) {
        await this._configurationService.updateValue(
          TasksSchemaProperties.IsShellCommand,
          void 0,
          { resource: folder.uri }
        );
      }
      if (this._configurationService.getValue(
        TasksSchemaProperties.SuppressTaskName,
        { resource: folder.uri }
      )) {
        await this._configurationService.updateValue(
          TasksSchemaProperties.SuppressTaskName,
          void 0,
          { resource: folder.uri }
        );
      }
    }
    this._updateSetup();
    this._notificationService.prompt(
      Severity.Warning,
      fileDiffs.length === 1 ? nls.localize(
        "taskService.upgradeVersion",
        "The deprecated tasks version 0.1.0 has been removed. Your tasks have been upgraded to version 2.0.0. Open the diff to review the upgrade."
      ) : nls.localize(
        "taskService.upgradeVersionPlural",
        "The deprecated tasks version 0.1.0 has been removed. Your tasks have been upgraded to version 2.0.0. Open the diffs to review the upgrade."
      ),
      [
        {
          label: fileDiffs.length === 1 ? nls.localize("taskService.openDiff", "Open diff") : nls.localize(
            "taskService.openDiffs",
            "Open diffs"
          ),
          run: /* @__PURE__ */ __name(async () => {
            for (const upgrade of fileDiffs) {
              await this._editorService.openEditor({
                original: { resource: upgrade[0] },
                modified: { resource: upgrade[1] }
              });
            }
          }, "run")
        }
      ]
    );
  }
};
AbstractTaskService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IOutputService),
  __decorateParam(3, IPaneCompositePartService),
  __decorateParam(4, IViewsService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, ITextFileService),
  __decorateParam(11, IModelService),
  __decorateParam(12, IExtensionService),
  __decorateParam(13, IQuickInputService),
  __decorateParam(14, IConfigurationResolverService),
  __decorateParam(15, ITerminalService),
  __decorateParam(16, ITerminalGroupService),
  __decorateParam(17, IStorageService),
  __decorateParam(18, IProgressService),
  __decorateParam(19, IOpenerService),
  __decorateParam(20, IDialogService),
  __decorateParam(21, INotificationService),
  __decorateParam(22, IContextKeyService),
  __decorateParam(23, IWorkbenchEnvironmentService),
  __decorateParam(24, ITerminalProfileResolverService),
  __decorateParam(25, IPathService),
  __decorateParam(26, ITextModelService),
  __decorateParam(27, IPreferencesService),
  __decorateParam(28, IViewDescriptorService),
  __decorateParam(29, IWorkspaceTrustRequestService),
  __decorateParam(30, IWorkspaceTrustManagementService),
  __decorateParam(31, ILogService),
  __decorateParam(32, IThemeService),
  __decorateParam(33, ILifecycleService),
  __decorateParam(34, IRemoteAgentService),
  __decorateParam(35, IInstantiationService)
], AbstractTaskService);
export {
  AbstractTaskService,
  ConfigureTaskAction
};
//# sourceMappingURL=abstractTaskService.js.map
