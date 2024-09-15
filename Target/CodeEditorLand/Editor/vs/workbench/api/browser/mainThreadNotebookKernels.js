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
import { isNonEmptyArray } from "../../../base/common/arrays.js";
import {
  AsyncIterableSource
} from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { onUnexpectedError } from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import {
  DisposableMap,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { INotebookEditorService } from "../../contrib/notebook/browser/services/notebookEditorService.js";
import {
  INotebookExecutionStateService,
  NotebookExecutionType
} from "../../contrib/notebook/common/notebookExecutionStateService.js";
import {
  INotebookKernelService
} from "../../contrib/notebook/common/notebookKernelService.js";
import { INotebookService } from "../../contrib/notebook/common/notebookService.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
import { NotebookDto } from "./mainThreadNotebookDto.js";
class MainThreadKernel {
  constructor(data, _languageService) {
    this._languageService = _languageService;
    this.id = data.id;
    this.viewType = data.notebookType;
    this.extension = data.extensionId;
    this.implementsInterrupt = data.supportsInterrupt ?? false;
    this.label = data.label;
    this.description = data.description;
    this.detail = data.detail;
    this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : _languageService.getRegisteredLanguageIds();
    this.implementsExecutionOrder = data.supportsExecutionOrder ?? false;
    this.hasVariableProvider = data.hasVariableProvider ?? false;
    this.localResourceRoot = URI.revive(data.extensionLocation);
    this.preloads = data.preloads?.map((u) => ({
      uri: URI.revive(u.uri),
      provides: u.provides
    })) ?? [];
  }
  static {
    __name(this, "MainThreadKernel");
  }
  _onDidChange = new Emitter();
  preloads;
  onDidChange = this._onDidChange.event;
  id;
  viewType;
  extension;
  implementsInterrupt;
  label;
  description;
  detail;
  supportedLanguages;
  implementsExecutionOrder;
  hasVariableProvider;
  localResourceRoot;
  get preloadUris() {
    return this.preloads.map((p) => p.uri);
  }
  get preloadProvides() {
    return this.preloads.flatMap((p) => p.provides);
  }
  update(data) {
    const event = /* @__PURE__ */ Object.create(null);
    if (data.label !== void 0) {
      this.label = data.label;
      event.label = true;
    }
    if (data.description !== void 0) {
      this.description = data.description;
      event.description = true;
    }
    if (data.detail !== void 0) {
      this.detail = data.detail;
      event.detail = true;
    }
    if (data.supportedLanguages !== void 0) {
      this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : this._languageService.getRegisteredLanguageIds();
      event.supportedLanguages = true;
    }
    if (data.supportsExecutionOrder !== void 0) {
      this.implementsExecutionOrder = data.supportsExecutionOrder;
      event.hasExecutionOrder = true;
    }
    if (data.supportsInterrupt !== void 0) {
      this.implementsInterrupt = data.supportsInterrupt;
      event.hasInterruptHandler = true;
    }
    if (data.hasVariableProvider !== void 0) {
      this.hasVariableProvider = data.hasVariableProvider;
      event.hasVariableProvider = true;
    }
    this._onDidChange.fire(event);
  }
}
class MainThreadKernelDetectionTask {
  constructor(notebookType) {
    this.notebookType = notebookType;
  }
  static {
    __name(this, "MainThreadKernelDetectionTask");
  }
}
let MainThreadNotebookKernels = class {
  constructor(extHostContext, _languageService, _notebookKernelService, _notebookExecutionStateService, _notebookService, notebookEditorService) {
    this._languageService = _languageService;
    this._notebookKernelService = _notebookKernelService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._notebookService = _notebookService;
    this._proxy = extHostContext.getProxy(
      ExtHostContext.ExtHostNotebookKernels
    );
    notebookEditorService.listNotebookEditors().forEach(this._onEditorAdd, this);
    notebookEditorService.onDidAddNotebookEditor(
      this._onEditorAdd,
      this,
      this._disposables
    );
    notebookEditorService.onDidRemoveNotebookEditor(
      this._onEditorRemove,
      this,
      this._disposables
    );
    this._disposables.add(
      toDisposable(() => {
        this._executions.forEach((e) => {
          e.complete({});
        });
        this._notebookExecutions.forEach((e) => e.complete());
      })
    );
    this._disposables.add(
      this._notebookExecutionStateService.onDidChangeExecution((e) => {
        if (e.type === NotebookExecutionType.cell) {
          this._proxy.$cellExecutionChanged(
            e.notebook,
            e.cellHandle,
            e.changed?.state
          );
        }
      })
    );
    this._disposables.add(
      this._notebookKernelService.onDidChangeSelectedNotebooks((e) => {
        for (const [handle, [kernel]] of this._kernels) {
          if (e.oldKernel === kernel.id) {
            this._proxy.$acceptNotebookAssociation(
              handle,
              e.notebook,
              false
            );
          } else if (e.newKernel === kernel.id) {
            this._proxy.$acceptNotebookAssociation(
              handle,
              e.notebook,
              true
            );
          }
        }
      })
    );
  }
  _editors = new DisposableMap();
  _disposables = new DisposableStore();
  _kernels = /* @__PURE__ */ new Map();
  _kernelDetectionTasks = /* @__PURE__ */ new Map();
  _kernelSourceActionProviders = /* @__PURE__ */ new Map();
  _kernelSourceActionProvidersEventRegistrations = /* @__PURE__ */ new Map();
  _proxy;
  _executions = /* @__PURE__ */ new Map();
  _notebookExecutions = /* @__PURE__ */ new Map();
  dispose() {
    this._disposables.dispose();
    for (const [, registration] of this._kernels.values()) {
      registration.dispose();
    }
    for (const [, registration] of this._kernelDetectionTasks.values()) {
      registration.dispose();
    }
    for (const [
      ,
      registration
    ] of this._kernelSourceActionProviders.values()) {
      registration.dispose();
    }
    this._editors.dispose();
  }
  // --- kernel ipc
  _onEditorAdd(editor) {
    const ipcListener = editor.onDidReceiveMessage((e) => {
      if (!editor.hasModel()) {
        return;
      }
      const { selected } = this._notebookKernelService.getMatchingKernel(
        editor.textModel
      );
      if (!selected) {
        return;
      }
      for (const [handle, candidate] of this._kernels) {
        if (candidate[0] === selected) {
          this._proxy.$acceptKernelMessageFromRenderer(
            handle,
            editor.getId(),
            e.message
          );
          break;
        }
      }
    });
    this._editors.set(editor, ipcListener);
  }
  _onEditorRemove(editor) {
    this._editors.deleteAndDispose(editor);
  }
  async $postMessage(handle, editorId, message) {
    const tuple = this._kernels.get(handle);
    if (!tuple) {
      throw new Error("kernel already disposed");
    }
    const [kernel] = tuple;
    let didSend = false;
    for (const [editor] of this._editors) {
      if (!editor.hasModel()) {
        continue;
      }
      if (this._notebookKernelService.getMatchingKernel(editor.textModel).selected !== kernel) {
        continue;
      }
      if (editorId === void 0) {
        editor.postMessage(message);
        didSend = true;
      } else if (editor.getId() === editorId) {
        editor.postMessage(message);
        didSend = true;
        break;
      }
    }
    return didSend;
  }
  variableRequestIndex = 0;
  variableRequestMap = /* @__PURE__ */ new Map();
  $receiveVariable(requestId, variable) {
    const source = this.variableRequestMap.get(requestId);
    if (source) {
      source.emitOne(variable);
    }
  }
  // --- kernel adding/updating/removal
  async $addKernel(handle, data) {
    const that = this;
    const kernel = new class extends MainThreadKernel {
      async executeNotebookCellsRequest(uri, handles) {
        await that._proxy.$executeCells(handle, uri, handles);
      }
      async cancelNotebookCellExecution(uri, handles) {
        await that._proxy.$cancelCells(handle, uri, handles);
      }
      provideVariables(notebookUri, parentId, kind, start, token) {
        const requestId = `${handle}variables${that.variableRequestIndex++}`;
        if (that.variableRequestMap.has(requestId)) {
          return that.variableRequestMap.get(requestId).asyncIterable;
        }
        const source = new AsyncIterableSource();
        that.variableRequestMap.set(requestId, source);
        that._proxy.$provideVariables(
          handle,
          requestId,
          notebookUri,
          parentId,
          kind,
          start,
          token
        ).then(() => {
          source.resolve();
          that.variableRequestMap.delete(requestId);
        }).catch((err) => {
          source.reject(err);
          that.variableRequestMap.delete(requestId);
        });
        return source.asyncIterable;
      }
    }(data, this._languageService);
    const disposables = this._disposables.add(new DisposableStore());
    this._kernels.set(handle, [kernel, disposables]);
    disposables.add(this._notebookKernelService.registerKernel(kernel));
  }
  $updateKernel(handle, data) {
    const tuple = this._kernels.get(handle);
    if (tuple) {
      tuple[0].update(data);
    }
  }
  $removeKernel(handle) {
    const tuple = this._kernels.get(handle);
    if (tuple) {
      tuple[1].dispose();
      this._kernels.delete(handle);
    }
  }
  $updateNotebookPriority(handle, notebook, value) {
    const tuple = this._kernels.get(handle);
    if (tuple) {
      this._notebookKernelService.updateKernelNotebookAffinity(
        tuple[0],
        URI.revive(notebook),
        value
      );
    }
  }
  // --- Cell execution
  $createExecution(handle, controllerId, rawUri, cellHandle) {
    const uri = URI.revive(rawUri);
    const notebook = this._notebookService.getNotebookTextModel(uri);
    if (!notebook) {
      throw new Error(`Notebook not found: ${uri.toString()}`);
    }
    const kernel = this._notebookKernelService.getMatchingKernel(notebook);
    if (!kernel.selected || kernel.selected.id !== controllerId) {
      throw new Error(
        `Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`
      );
    }
    const execution = this._notebookExecutionStateService.createCellExecution(
      uri,
      cellHandle
    );
    execution.confirm();
    this._executions.set(handle, execution);
  }
  $updateExecution(handle, data) {
    const updates = data.value;
    try {
      const execution = this._executions.get(handle);
      execution?.update(
        updates.map(NotebookDto.fromCellExecuteUpdateDto)
      );
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  $completeExecution(handle, data) {
    try {
      const execution = this._executions.get(handle);
      execution?.complete(
        NotebookDto.fromCellExecuteCompleteDto(data.value)
      );
    } catch (e) {
      onUnexpectedError(e);
    } finally {
      this._executions.delete(handle);
    }
  }
  // --- Notebook execution
  $createNotebookExecution(handle, controllerId, rawUri) {
    const uri = URI.revive(rawUri);
    const notebook = this._notebookService.getNotebookTextModel(uri);
    if (!notebook) {
      throw new Error(`Notebook not found: ${uri.toString()}`);
    }
    const kernel = this._notebookKernelService.getMatchingKernel(notebook);
    if (!kernel.selected || kernel.selected.id !== controllerId) {
      throw new Error(
        `Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`
      );
    }
    const execution = this._notebookExecutionStateService.createExecution(uri);
    execution.confirm();
    this._notebookExecutions.set(handle, execution);
  }
  $beginNotebookExecution(handle) {
    try {
      const execution = this._notebookExecutions.get(handle);
      execution?.begin();
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  $completeNotebookExecution(handle) {
    try {
      const execution = this._notebookExecutions.get(handle);
      execution?.complete();
    } catch (e) {
      onUnexpectedError(e);
    } finally {
      this._notebookExecutions.delete(handle);
    }
  }
  // --- notebook kernel detection task
  async $addKernelDetectionTask(handle, notebookType) {
    const kernelDetectionTask = new MainThreadKernelDetectionTask(
      notebookType
    );
    const registration = this._notebookKernelService.registerNotebookKernelDetectionTask(
      kernelDetectionTask
    );
    this._kernelDetectionTasks.set(handle, [
      kernelDetectionTask,
      registration
    ]);
  }
  $removeKernelDetectionTask(handle) {
    const tuple = this._kernelDetectionTasks.get(handle);
    if (tuple) {
      tuple[1].dispose();
      this._kernelDetectionTasks.delete(handle);
    }
  }
  // --- notebook kernel source action provider
  async $addKernelSourceActionProvider(handle, eventHandle, notebookType) {
    const kernelSourceActionProvider = {
      viewType: notebookType,
      provideKernelSourceActions: /* @__PURE__ */ __name(async () => {
        const actions = await this._proxy.$provideKernelSourceActions(
          handle,
          CancellationToken.None
        );
        return actions.map((action) => {
          let documentation = action.documentation;
          if (action.documentation && typeof action.documentation !== "string") {
            documentation = URI.revive(action.documentation);
          }
          return {
            label: action.label,
            command: action.command,
            description: action.description,
            detail: action.detail,
            documentation
          };
        });
      }, "provideKernelSourceActions")
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._kernelSourceActionProvidersEventRegistrations.set(
        eventHandle,
        emitter
      );
      kernelSourceActionProvider.onDidChangeSourceActions = emitter.event;
    }
    const registration = this._notebookKernelService.registerKernelSourceActionProvider(
      notebookType,
      kernelSourceActionProvider
    );
    this._kernelSourceActionProviders.set(handle, [
      kernelSourceActionProvider,
      registration
    ]);
  }
  $removeKernelSourceActionProvider(handle, eventHandle) {
    const tuple = this._kernelSourceActionProviders.get(handle);
    if (tuple) {
      tuple[1].dispose();
      this._kernelSourceActionProviders.delete(handle);
    }
    if (typeof eventHandle === "number") {
      this._kernelSourceActionProvidersEventRegistrations.delete(
        eventHandle
      );
    }
  }
  $emitNotebookKernelSourceActionsChangeEvent(eventHandle) {
    const emitter = this._kernelSourceActionProvidersEventRegistrations.get(
      eventHandle
    );
    if (emitter instanceof Emitter) {
      emitter.fire(void 0);
    }
  }
  $variablesUpdated(notebookUri) {
    this._notebookKernelService.notifyVariablesChange(
      URI.revive(notebookUri)
    );
  }
};
__name(MainThreadNotebookKernels, "MainThreadNotebookKernels");
MainThreadNotebookKernels = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadNotebookKernels),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, INotebookKernelService),
  __decorateParam(3, INotebookExecutionStateService),
  __decorateParam(4, INotebookService),
  __decorateParam(5, INotebookEditorService)
], MainThreadNotebookKernels);
export {
  MainThreadNotebookKernels
};
//# sourceMappingURL=mainThreadNotebookKernels.js.map
