var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { asArray } from "../../../base/common/arrays.js";
import { asPromise } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import {
  ErrorNoTelemetry,
  NotSupportedError
} from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { Schemas } from "../../../base/common/network.js";
import * as Platform from "../../../base/common/platform.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { USER_TASKS_GROUP_KEY } from "../../contrib/tasks/common/tasks.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostApiDeprecationService } from "./extHostApiDeprecationService.js";
import { IExtHostConfiguration } from "./extHostConfiguration.js";
import { IExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IExtHostTerminalService } from "./extHostTerminalService.js";
import * as types from "./extHostTypes.js";
import {
  IExtHostWorkspace
} from "./extHostWorkspace.js";
var TaskDefinitionDTO;
((TaskDefinitionDTO2) => {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  TaskDefinitionDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  TaskDefinitionDTO2.to = to;
})(TaskDefinitionDTO || (TaskDefinitionDTO = {}));
var TaskPresentationOptionsDTO;
((TaskPresentationOptionsDTO2) => {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  TaskPresentationOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  TaskPresentationOptionsDTO2.to = to;
})(TaskPresentationOptionsDTO || (TaskPresentationOptionsDTO = {}));
var ProcessExecutionOptionsDTO;
((ProcessExecutionOptionsDTO2) => {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  ProcessExecutionOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  ProcessExecutionOptionsDTO2.to = to;
})(ProcessExecutionOptionsDTO || (ProcessExecutionOptionsDTO = {}));
var ProcessExecutionDTO;
((ProcessExecutionDTO2) => {
  function is(value) {
    if (value) {
      const candidate = value;
      return candidate && !!candidate.process;
    } else {
      return false;
    }
  }
  ProcessExecutionDTO2.is = is;
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    const result = {
      process: value.process,
      args: value.args
    };
    if (value.options) {
      result.options = ProcessExecutionOptionsDTO.from(value.options);
    }
    return result;
  }
  ProcessExecutionDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return new types.ProcessExecution(
      value.process,
      value.args,
      value.options
    );
  }
  ProcessExecutionDTO2.to = to;
})(ProcessExecutionDTO || (ProcessExecutionDTO = {}));
var ShellExecutionOptionsDTO;
((ShellExecutionOptionsDTO2) => {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  ShellExecutionOptionsDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return value;
  }
  ShellExecutionOptionsDTO2.to = to;
})(ShellExecutionOptionsDTO || (ShellExecutionOptionsDTO = {}));
var ShellExecutionDTO;
((ShellExecutionDTO2) => {
  function is(value) {
    if (value) {
      const candidate = value;
      return candidate && (!!candidate.commandLine || !!candidate.command);
    } else {
      return false;
    }
  }
  ShellExecutionDTO2.is = is;
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    const result = {};
    if (value.commandLine !== void 0) {
      result.commandLine = value.commandLine;
    } else {
      result.command = value.command;
      result.args = value.args;
    }
    if (value.options) {
      result.options = ShellExecutionOptionsDTO.from(value.options);
    }
    return result;
  }
  ShellExecutionDTO2.from = from;
  function to(value) {
    if (value === void 0 || value === null || value.command === void 0 && value.commandLine === void 0) {
      return void 0;
    }
    if (value.commandLine) {
      return new types.ShellExecution(value.commandLine, value.options);
    } else {
      return new types.ShellExecution(
        value.command,
        value.args ? value.args : [],
        value.options
      );
    }
  }
  ShellExecutionDTO2.to = to;
})(ShellExecutionDTO || (ShellExecutionDTO = {}));
var CustomExecutionDTO;
((CustomExecutionDTO2) => {
  function is(value) {
    if (value) {
      const candidate = value;
      return candidate && candidate.customExecution === "customExecution";
    } else {
      return false;
    }
  }
  CustomExecutionDTO2.is = is;
  function from(value) {
    return {
      customExecution: "customExecution"
    };
  }
  CustomExecutionDTO2.from = from;
  function to(taskId, providedCustomExeutions) {
    return providedCustomExeutions.get(taskId);
  }
  CustomExecutionDTO2.to = to;
})(CustomExecutionDTO || (CustomExecutionDTO = {}));
var TaskHandleDTO;
((TaskHandleDTO2) => {
  function from(value, workspaceService) {
    let folder;
    if (value.scope !== void 0 && typeof value.scope !== "number") {
      folder = value.scope.uri;
    } else if (value.scope !== void 0 && typeof value.scope === "number") {
      if (value.scope === types.TaskScope.Workspace && workspaceService && workspaceService.workspaceFile) {
        folder = workspaceService.workspaceFile;
      } else {
        folder = USER_TASKS_GROUP_KEY;
      }
    }
    return {
      id: value._id,
      workspaceFolder: folder
    };
  }
  TaskHandleDTO2.from = from;
})(TaskHandleDTO || (TaskHandleDTO = {}));
var TaskGroupDTO;
((TaskGroupDTO2) => {
  function from(value) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    return { _id: value.id, isDefault: value.isDefault };
  }
  TaskGroupDTO2.from = from;
})(TaskGroupDTO || (TaskGroupDTO = {}));
var TaskDTO;
((TaskDTO2) => {
  function fromMany(tasks, extension) {
    if (tasks === void 0 || tasks === null) {
      return [];
    }
    const result = [];
    for (const task of tasks) {
      const converted = from(task, extension);
      if (converted) {
        result.push(converted);
      }
    }
    return result;
  }
  TaskDTO2.fromMany = fromMany;
  function from(value, extension) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    let execution;
    if (value.execution instanceof types.ProcessExecution) {
      execution = ProcessExecutionDTO.from(value.execution);
    } else if (value.execution instanceof types.ShellExecution) {
      execution = ShellExecutionDTO.from(value.execution);
    } else if (value.execution && value.execution instanceof types.CustomExecution) {
      execution = CustomExecutionDTO.from(
        value.execution
      );
    }
    const definition = TaskDefinitionDTO.from(value.definition);
    let scope;
    if (value.scope) {
      if (typeof value.scope === "number") {
        scope = value.scope;
      } else {
        scope = value.scope.uri;
      }
    } else {
      scope = types.TaskScope.Workspace;
    }
    if (!definition || !scope) {
      return void 0;
    }
    const result = {
      _id: value._id,
      definition,
      name: value.name,
      source: {
        extensionId: extension.identifier.value,
        label: value.source,
        scope
      },
      execution,
      isBackground: value.isBackground,
      group: TaskGroupDTO.from(value.group),
      presentationOptions: TaskPresentationOptionsDTO.from(
        value.presentationOptions
      ),
      problemMatchers: asArray(value.problemMatchers),
      hasDefinedMatchers: value.hasDefinedMatchers,
      runOptions: value.runOptions ? value.runOptions : { reevaluateOnRerun: true },
      detail: value.detail
    };
    return result;
  }
  TaskDTO2.from = from;
  async function to(value, workspace, providedCustomExeutions) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    let execution;
    if (ProcessExecutionDTO.is(value.execution)) {
      execution = ProcessExecutionDTO.to(value.execution);
    } else if (ShellExecutionDTO.is(value.execution)) {
      execution = ShellExecutionDTO.to(value.execution);
    } else if (CustomExecutionDTO.is(value.execution)) {
      execution = CustomExecutionDTO.to(
        value._id,
        providedCustomExeutions
      );
    }
    const definition = TaskDefinitionDTO.to(value.definition);
    let scope;
    if (value.source) {
      if (value.source.scope !== void 0) {
        if (typeof value.source.scope === "number") {
          scope = value.source.scope;
        } else {
          scope = await workspace.resolveWorkspaceFolder(
            URI.revive(value.source.scope)
          );
        }
      } else {
        scope = types.TaskScope.Workspace;
      }
    }
    if (!definition || !scope) {
      return void 0;
    }
    const result = new types.Task(
      definition,
      scope,
      value.name,
      value.source.label,
      execution,
      value.problemMatchers
    );
    if (value.isBackground !== void 0) {
      result.isBackground = value.isBackground;
    }
    if (value.group !== void 0) {
      result.group = types.TaskGroup.from(value.group._id);
      if (result.group && value.group.isDefault) {
        result.group = new types.TaskGroup(
          result.group.id,
          result.group.label
        );
        if (value.group.isDefault === true) {
          result.group.isDefault = value.group.isDefault;
        }
      }
    }
    if (value.presentationOptions) {
      result.presentationOptions = TaskPresentationOptionsDTO.to(
        value.presentationOptions
      );
    }
    if (value._id) {
      result._id = value._id;
    }
    if (value.detail) {
      result.detail = value.detail;
    }
    return result;
  }
  TaskDTO2.to = to;
})(TaskDTO || (TaskDTO = {}));
var TaskFilterDTO;
((TaskFilterDTO2) => {
  function from(value) {
    return value;
  }
  TaskFilterDTO2.from = from;
  function to(value) {
    if (!value) {
      return void 0;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), value);
  }
  TaskFilterDTO2.to = to;
})(TaskFilterDTO || (TaskFilterDTO = {}));
class TaskExecutionImpl {
  constructor(tasks, _id, _task) {
    this._id = _id;
    this._task = _task;
    this.#tasks = tasks;
  }
  #tasks;
  get task() {
    return this._task;
  }
  terminate() {
    this.#tasks.terminateTask(this);
  }
  fireDidStartProcess(value) {
  }
  fireDidEndProcess(value) {
  }
}
let ExtHostTaskBase = class {
  _serviceBrand;
  _proxy;
  _workspaceProvider;
  _editorService;
  _configurationService;
  _terminalService;
  _logService;
  _deprecationService;
  _handleCounter;
  _handlers;
  _taskExecutions;
  _taskExecutionPromises;
  _providedCustomExecutions2;
  _notProvidedCustomExecutions;
  // Used for custom executions tasks that are created and run through executeTask.
  _activeCustomExecutions2;
  _lastStartedTask;
  _onDidExecuteTask = new Emitter();
  _onDidTerminateTask = new Emitter();
  _onDidTaskProcessStarted = new Emitter();
  _onDidTaskProcessEnded = new Emitter();
  constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadTask);
    this._workspaceProvider = workspaceService;
    this._editorService = editorService;
    this._configurationService = configurationService;
    this._terminalService = extHostTerminalService;
    this._handleCounter = 0;
    this._handlers = /* @__PURE__ */ new Map();
    this._taskExecutions = /* @__PURE__ */ new Map();
    this._taskExecutionPromises = /* @__PURE__ */ new Map();
    this._providedCustomExecutions2 = /* @__PURE__ */ new Map();
    this._notProvidedCustomExecutions = /* @__PURE__ */ new Set();
    this._activeCustomExecutions2 = /* @__PURE__ */ new Map();
    this._logService = logService;
    this._deprecationService = deprecationService;
    this._proxy.$registerSupportedExecutions(true);
  }
  registerTaskProvider(extension, type, provider) {
    if (!provider) {
      return new types.Disposable(() => {
      });
    }
    const handle = this.nextHandle();
    this._handlers.set(handle, { type, provider, extension });
    this._proxy.$registerTaskProvider(handle, type);
    return new types.Disposable(() => {
      this._handlers.delete(handle);
      this._proxy.$unregisterTaskProvider(handle);
    });
  }
  registerTaskSystem(scheme, info) {
    this._proxy.$registerTaskSystem(scheme, info);
  }
  fetchTasks(filter) {
    return this._proxy.$fetchTasks(TaskFilterDTO.from(filter)).then(async (values) => {
      const result = [];
      for (const value of values) {
        const task = await TaskDTO.to(
          value,
          this._workspaceProvider,
          this._providedCustomExecutions2
        );
        if (task) {
          result.push(task);
        }
      }
      return result;
    });
  }
  get taskExecutions() {
    const result = [];
    this._taskExecutions.forEach((value) => result.push(value));
    return result;
  }
  terminateTask(execution) {
    if (!(execution instanceof TaskExecutionImpl)) {
      throw new Error("No valid task execution provided");
    }
    return this._proxy.$terminateTask(execution._id);
  }
  get onDidStartTask() {
    return this._onDidExecuteTask.event;
  }
  async $onDidStartTask(execution, terminalId, resolvedDefinition) {
    const customExecution = this._providedCustomExecutions2.get(execution.id);
    if (customExecution) {
      this._activeCustomExecutions2.set(execution.id, customExecution);
      this._terminalService.attachPtyToTerminal(
        terminalId,
        await customExecution.callback(resolvedDefinition)
      );
    }
    this._lastStartedTask = execution.id;
    this._onDidExecuteTask.fire({
      execution: await this.getTaskExecution(execution)
    });
  }
  get onDidEndTask() {
    return this._onDidTerminateTask.event;
  }
  async $OnDidEndTask(execution) {
    if (!this._taskExecutionPromises.has(execution.id)) {
      return;
    }
    const _execution = await this.getTaskExecution(execution);
    this._taskExecutionPromises.delete(execution.id);
    this._taskExecutions.delete(execution.id);
    this.customExecutionComplete(execution);
    this._onDidTerminateTask.fire({
      execution: _execution
    });
  }
  get onDidStartTaskProcess() {
    return this._onDidTaskProcessStarted.event;
  }
  async $onDidStartTaskProcess(value) {
    const execution = await this.getTaskExecution(value.id);
    this._onDidTaskProcessStarted.fire({
      execution,
      processId: value.processId
    });
  }
  get onDidEndTaskProcess() {
    return this._onDidTaskProcessEnded.event;
  }
  async $onDidEndTaskProcess(value) {
    const execution = await this.getTaskExecution(value.id);
    this._onDidTaskProcessEnded.fire({
      execution,
      exitCode: value.exitCode
    });
  }
  $provideTasks(handle, validTypes) {
    const handler = this._handlers.get(handle);
    if (!handler) {
      return Promise.reject(new Error("no handler found"));
    }
    const taskIdPromises = [];
    const fetchPromise = asPromise(
      () => handler.provider.provideTasks(CancellationToken.None)
    ).then((value) => {
      return this.provideTasksInternal(
        validTypes,
        taskIdPromises,
        handler,
        value
      );
    });
    return new Promise((resolve) => {
      fetchPromise.then((result) => {
        Promise.all(taskIdPromises).then(() => {
          resolve(result);
        });
      });
    });
  }
  async $resolveTask(handle, taskDTO) {
    const handler = this._handlers.get(handle);
    if (!handler) {
      return Promise.reject(new Error("no handler found"));
    }
    if (taskDTO.definition.type !== handler.type) {
      throw new Error(
        `Unexpected: Task of type [${taskDTO.definition.type}] cannot be resolved by provider of type [${handler.type}].`
      );
    }
    const task = await TaskDTO.to(
      taskDTO,
      this._workspaceProvider,
      this._providedCustomExecutions2
    );
    if (!task) {
      throw new Error("Unexpected: Task cannot be resolved.");
    }
    const resolvedTask = await handler.provider.resolveTask(
      task,
      CancellationToken.None
    );
    if (!resolvedTask) {
      return;
    }
    this.checkDeprecation(resolvedTask, handler);
    const resolvedTaskDTO = TaskDTO.from(
      resolvedTask,
      handler.extension
    );
    if (!resolvedTaskDTO) {
      throw new Error("Unexpected: Task cannot be resolved.");
    }
    if (resolvedTask.definition !== task.definition) {
      throw new Error(
        "Unexpected: The resolved task definition must be the same object as the original task definition. The task definition cannot be changed."
      );
    }
    if (CustomExecutionDTO.is(resolvedTaskDTO.execution)) {
      await this.addCustomExecution(resolvedTaskDTO, resolvedTask, true);
    }
    return await this.resolveTaskInternal(resolvedTaskDTO);
  }
  nextHandle() {
    return this._handleCounter++;
  }
  async addCustomExecution(taskDTO, task, isProvided) {
    const taskId = await this._proxy.$createTaskId(taskDTO);
    if (!isProvided && !this._providedCustomExecutions2.has(taskId)) {
      this._notProvidedCustomExecutions.add(taskId);
      this._activeCustomExecutions2.set(
        taskId,
        task.execution
      );
    }
    this._providedCustomExecutions2.set(
      taskId,
      task.execution
    );
  }
  async getTaskExecution(execution, task) {
    if (typeof execution === "string") {
      const taskExecution = this._taskExecutionPromises.get(execution);
      if (!taskExecution) {
        throw new ErrorNoTelemetry(
          "Unexpected: The specified task is missing an execution"
        );
      }
      return taskExecution;
    }
    const result = this._taskExecutionPromises.get(execution.id);
    if (result) {
      return result;
    }
    let executionPromise;
    if (task) {
      executionPromise = Promise.resolve(
        new TaskExecutionImpl(this, execution.id, task)
      );
    } else {
      executionPromise = TaskDTO.to(
        execution.task,
        this._workspaceProvider,
        this._providedCustomExecutions2
      ).then((t) => {
        if (!t) {
          throw new ErrorNoTelemetry(
            "Unexpected: Task does not exist."
          );
        }
        return new TaskExecutionImpl(this, execution.id, t);
      });
    }
    this._taskExecutionPromises.set(execution.id, executionPromise);
    return executionPromise.then((taskExecution) => {
      this._taskExecutions.set(execution.id, taskExecution);
      return taskExecution;
    });
  }
  checkDeprecation(task, handler) {
    const tTask = task;
    if (tTask._deprecated) {
      this._deprecationService.report(
        "Task.constructor",
        handler.extension,
        "Use the Task constructor that takes a `scope` instead."
      );
    }
  }
  customExecutionComplete(execution) {
    const extensionCallback2 = this._activeCustomExecutions2.get(execution.id);
    if (extensionCallback2) {
      this._activeCustomExecutions2.delete(execution.id);
    }
    if (this._notProvidedCustomExecutions.has(execution.id) && this._lastStartedTask !== execution.id) {
      this._providedCustomExecutions2.delete(execution.id);
      this._notProvidedCustomExecutions.delete(execution.id);
    }
    const iterator = this._notProvidedCustomExecutions.values();
    let iteratorResult = iterator.next();
    while (!iteratorResult.done) {
      if (!this._activeCustomExecutions2.has(iteratorResult.value) && this._lastStartedTask !== iteratorResult.value) {
        this._providedCustomExecutions2.delete(iteratorResult.value);
        this._notProvidedCustomExecutions.delete(iteratorResult.value);
      }
      iteratorResult = iterator.next();
    }
  }
};
ExtHostTaskBase = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostWorkspace),
  __decorateParam(3, IExtHostDocumentsAndEditors),
  __decorateParam(4, IExtHostConfiguration),
  __decorateParam(5, IExtHostTerminalService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IExtHostApiDeprecationService)
], ExtHostTaskBase);
let WorkerExtHostTask = class extends ExtHostTaskBase {
  constructor(extHostRpc, initData, workspaceService, editorService, configurationService, extHostTerminalService, logService, deprecationService) {
    super(
      extHostRpc,
      initData,
      workspaceService,
      editorService,
      configurationService,
      extHostTerminalService,
      logService,
      deprecationService
    );
    this.registerTaskSystem(Schemas.vscodeRemote, {
      scheme: Schemas.vscodeRemote,
      authority: "",
      platform: Platform.PlatformToString(Platform.Platform.Web)
    });
  }
  async executeTask(extension, task) {
    if (!task.execution) {
      throw new Error("Tasks to execute must include an execution");
    }
    const dto = TaskDTO.from(task, extension);
    if (dto === void 0) {
      throw new Error("Task is not valid");
    }
    if (CustomExecutionDTO.is(dto.execution)) {
      await this.addCustomExecution(dto, task, false);
    } else {
      throw new NotSupportedError();
    }
    const execution = await this.getTaskExecution(
      await this._proxy.$getTaskExecution(dto),
      task
    );
    this._proxy.$executeTask(dto).catch((error) => {
      throw new Error(error);
    });
    return execution;
  }
  provideTasksInternal(validTypes, taskIdPromises, handler, value) {
    const taskDTOs = [];
    if (value) {
      for (const task of value) {
        this.checkDeprecation(task, handler);
        if (!task.definition || !validTypes[task.definition.type]) {
          const source = task.source ? task.source : "No task source";
          this._logService.warn(
            `The task [${source}, ${task.name}] uses an undefined task type. The task will be ignored in the future.`
          );
        }
        const taskDTO = TaskDTO.from(
          task,
          handler.extension
        );
        if (taskDTO && CustomExecutionDTO.is(taskDTO.execution)) {
          taskDTOs.push(taskDTO);
          taskIdPromises.push(
            this.addCustomExecution(taskDTO, task, true)
          );
        } else {
          this._logService.warn(
            "Only custom execution tasks supported."
          );
        }
      }
    }
    return {
      tasks: taskDTOs,
      extension: handler.extension
    };
  }
  async resolveTaskInternal(resolvedTaskDTO) {
    if (CustomExecutionDTO.is(resolvedTaskDTO.execution)) {
      return resolvedTaskDTO;
    } else {
      this._logService.warn("Only custom execution tasks supported.");
    }
    return void 0;
  }
  async $resolveVariables(uriComponents, toResolve) {
    const result = {
      process: void 0,
      variables: /* @__PURE__ */ Object.create(null)
    };
    return result;
  }
  async $jsonTasksSupported() {
    return false;
  }
  async $findExecutable(command, cwd, paths) {
    return void 0;
  }
};
WorkerExtHostTask = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostWorkspace),
  __decorateParam(3, IExtHostDocumentsAndEditors),
  __decorateParam(4, IExtHostConfiguration),
  __decorateParam(5, IExtHostTerminalService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IExtHostApiDeprecationService)
], WorkerExtHostTask);
const IExtHostTask = createDecorator("IExtHostTask");
export {
  CustomExecutionDTO,
  ExtHostTaskBase,
  IExtHostTask,
  TaskDTO,
  TaskHandleDTO,
  WorkerExtHostTask
};
