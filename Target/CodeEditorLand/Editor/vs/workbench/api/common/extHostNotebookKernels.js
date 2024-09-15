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
import { asArray } from "../../../base/common/arrays.js";
import { DeferredPromise, timeout } from "../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../base/common/cancellation.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable, DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { ExtensionIdentifier, IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ExtHostNotebookKernelsShape, ICellExecuteUpdateDto, IMainContext, INotebookKernelDto2, MainContext, MainThreadNotebookKernelsShape, NotebookOutputDto, VariablesResult } from "./extHost.protocol.js";
import { ApiCommand, ApiCommandArgument, ApiCommandResult, ExtHostCommands } from "./extHostCommands.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { ExtHostNotebookController } from "./extHostNotebook.js";
import { ExtHostCell, ExtHostNotebookDocument } from "./extHostNotebookDocument.js";
import * as extHostTypeConverters from "./extHostTypeConverters.js";
import { NotebookCellExecutionState as ExtHostNotebookCellExecutionState, NotebookCellOutput, NotebookControllerAffinity2, NotebookVariablesRequestKind } from "./extHostTypes.js";
import { asWebviewUri } from "../../contrib/webview/common/webview.js";
import { INotebookKernelSourceAction, NotebookCellExecutionState } from "../../contrib/notebook/common/notebookCommon.js";
import { CellExecutionUpdateType } from "../../contrib/notebook/common/notebookExecutionService.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import { SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import * as vscode from "vscode";
import { variablePageSize } from "../../contrib/notebook/common/notebookKernelService.js";
let ExtHostNotebookKernels = class {
  constructor(mainContext, _initData, _extHostNotebook, _commands, _logService) {
    this._initData = _initData;
    this._extHostNotebook = _extHostNotebook;
    this._commands = _commands;
    this._logService = _logService;
    this._proxy = mainContext.getProxy(MainContext.MainThreadNotebookKernels);
    const selectKernelApiCommand = new ApiCommand(
      "notebook.selectKernel",
      "_notebook.selectKernel",
      "Trigger kernel picker for specified notebook editor widget",
      [
        new ApiCommandArgument("options", "Select kernel options", (v) => true, (v) => {
          if (v && "notebookEditor" in v && "id" in v) {
            const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
            return {
              id: v.id,
              extension: v.extension,
              notebookEditorId
            };
          } else if (v && "notebookEditor" in v) {
            const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
            if (notebookEditorId === void 0) {
              throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${v.notebookEditor.notebook.uri.toString()}`);
            }
            return { notebookEditorId };
          }
          return v;
        })
      ],
      ApiCommandResult.Void
    );
    const requestKernelVariablesApiCommand = new ApiCommand(
      "vscode.executeNotebookVariableProvider",
      "_executeNotebookVariableProvider",
      "Execute notebook variable provider",
      [ApiCommandArgument.Uri],
      new ApiCommandResult("A promise that resolves to an array of variables", (value, apiArgs) => {
        return value.map((variable) => {
          return {
            variable: {
              name: variable.name,
              value: variable.value,
              expression: variable.expression,
              type: variable.type,
              language: variable.language
            },
            hasNamedChildren: variable.hasNamedChildren,
            indexedChildrenCount: variable.indexedChildrenCount
          };
        });
      })
    );
    this._commands.registerApiCommand(selectKernelApiCommand);
    this._commands.registerApiCommand(requestKernelVariablesApiCommand);
  }
  static {
    __name(this, "ExtHostNotebookKernels");
  }
  _proxy;
  _activeExecutions = new ResourceMap();
  _activeNotebookExecutions = new ResourceMap();
  _kernelDetectionTask = /* @__PURE__ */ new Map();
  _kernelDetectionTaskHandlePool = 0;
  _kernelSourceActionProviders = /* @__PURE__ */ new Map();
  _kernelSourceActionProviderHandlePool = 0;
  _kernelData = /* @__PURE__ */ new Map();
  _handlePool = 0;
  _onDidChangeCellExecutionState = new Emitter();
  onDidChangeNotebookCellExecutionState = this._onDidChangeCellExecutionState.event;
  createNotebookController(extension, id, viewType, label, handler, preloads) {
    for (const data2 of this._kernelData.values()) {
      if (data2.controller.id === id && ExtensionIdentifier.equals(extension.identifier, data2.extensionId)) {
        throw new Error(`notebook controller with id '${id}' ALREADY exist`);
      }
    }
    const handle = this._handlePool++;
    const that = this;
    this._logService.trace(`NotebookController[${handle}], CREATED by ${extension.identifier.value}, ${id}`);
    const _defaultExecutHandler = /* @__PURE__ */ __name(() => console.warn(`NO execute handler from notebook controller '${data.id}' of extension: '${extension.identifier}'`), "_defaultExecutHandler");
    let isDisposed = false;
    const onDidChangeSelection = new Emitter();
    const onDidReceiveMessage = new Emitter();
    const data = {
      id: createKernelId(extension.identifier, id),
      notebookType: viewType,
      extensionId: extension.identifier,
      extensionLocation: extension.extensionLocation,
      label: label || extension.identifier.value,
      preloads: preloads ? preloads.map(extHostTypeConverters.NotebookRendererScript.from) : []
    };
    let _executeHandler = handler ?? _defaultExecutHandler;
    let _interruptHandler;
    let _variableProvider;
    this._proxy.$addKernel(handle, data).catch((err) => {
      console.log(err);
      isDisposed = true;
    });
    let tokenPool = 0;
    const _update = /* @__PURE__ */ __name(() => {
      if (isDisposed) {
        return;
      }
      const myToken = ++tokenPool;
      Promise.resolve().then(() => {
        if (myToken === tokenPool) {
          this._proxy.$updateKernel(handle, data);
        }
      });
    }, "_update");
    const associatedNotebooks = new ResourceMap();
    const controller = {
      get id() {
        return id;
      },
      get notebookType() {
        return data.notebookType;
      },
      onDidChangeSelectedNotebooks: onDidChangeSelection.event,
      get label() {
        return data.label;
      },
      set label(value) {
        data.label = value ?? extension.displayName ?? extension.name;
        _update();
      },
      get detail() {
        return data.detail ?? "";
      },
      set detail(value) {
        data.detail = value;
        _update();
      },
      get description() {
        return data.description ?? "";
      },
      set description(value) {
        data.description = value;
        _update();
      },
      get supportedLanguages() {
        return data.supportedLanguages;
      },
      set supportedLanguages(value) {
        data.supportedLanguages = value;
        _update();
      },
      get supportsExecutionOrder() {
        return data.supportsExecutionOrder ?? false;
      },
      set supportsExecutionOrder(value) {
        data.supportsExecutionOrder = value;
        _update();
      },
      get rendererScripts() {
        return data.preloads ? data.preloads.map(extHostTypeConverters.NotebookRendererScript.to) : [];
      },
      get executeHandler() {
        return _executeHandler;
      },
      set executeHandler(value) {
        _executeHandler = value ?? _defaultExecutHandler;
      },
      get interruptHandler() {
        return _interruptHandler;
      },
      set interruptHandler(value) {
        _interruptHandler = value;
        data.supportsInterrupt = Boolean(value);
        _update();
      },
      set variableProvider(value) {
        checkProposedApiEnabled(extension, "notebookVariableProvider");
        _variableProvider = value;
        data.hasVariableProvider = !!value;
        value?.onDidChangeVariables((e) => that._proxy.$variablesUpdated(e.uri));
        _update();
      },
      get variableProvider() {
        return _variableProvider;
      },
      createNotebookCellExecution(cell) {
        if (isDisposed) {
          throw new Error("notebook controller is DISPOSED");
        }
        if (!associatedNotebooks.has(cell.notebook.uri)) {
          that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map((u) => u.toString()));
          throw new Error(`notebook controller is NOT associated to notebook: ${cell.notebook.uri.toString()}`);
        }
        return that._createNotebookCellExecution(cell, createKernelId(extension.identifier, this.id));
      },
      createNotebookExecution(notebook) {
        checkProposedApiEnabled(extension, "notebookExecution");
        if (isDisposed) {
          throw new Error("notebook controller is DISPOSED");
        }
        if (!associatedNotebooks.has(notebook.uri)) {
          that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map((u) => u.toString()));
          throw new Error(`notebook controller is NOT associated to notebook: ${notebook.uri.toString()}`);
        }
        return that._createNotebookExecution(notebook, createKernelId(extension.identifier, this.id));
      },
      dispose: /* @__PURE__ */ __name(() => {
        if (!isDisposed) {
          this._logService.trace(`NotebookController[${handle}], DISPOSED`);
          isDisposed = true;
          this._kernelData.delete(handle);
          onDidChangeSelection.dispose();
          onDidReceiveMessage.dispose();
          this._proxy.$removeKernel(handle);
        }
      }, "dispose"),
      // --- priority
      updateNotebookAffinity(notebook, priority) {
        if (priority === NotebookControllerAffinity2.Hidden) {
          checkProposedApiEnabled(extension, "notebookControllerAffinityHidden");
        }
        that._proxy.$updateNotebookPriority(handle, notebook.uri, priority);
      },
      // --- ipc
      onDidReceiveMessage: onDidReceiveMessage.event,
      postMessage(message, editor) {
        checkProposedApiEnabled(extension, "notebookMessaging");
        return that._proxy.$postMessage(handle, editor && that._extHostNotebook.getIdByEditor(editor), message);
      },
      asWebviewUri(uri) {
        checkProposedApiEnabled(extension, "notebookMessaging");
        return asWebviewUri(uri, that._initData.remote);
      }
    };
    this._kernelData.set(handle, {
      extensionId: extension.identifier,
      controller,
      onDidReceiveMessage,
      onDidChangeSelection,
      associatedNotebooks
    });
    return controller;
  }
  getIdByController(controller) {
    for (const [_, candidate] of this._kernelData) {
      if (candidate.controller === controller) {
        return createKernelId(candidate.extensionId, controller.id);
      }
    }
    return null;
  }
  createNotebookControllerDetectionTask(extension, viewType) {
    const handle = this._kernelDetectionTaskHandlePool++;
    const that = this;
    this._logService.trace(`NotebookControllerDetectionTask[${handle}], CREATED by ${extension.identifier.value}`);
    this._proxy.$addKernelDetectionTask(handle, viewType);
    const detectionTask = {
      dispose: /* @__PURE__ */ __name(() => {
        this._kernelDetectionTask.delete(handle);
        that._proxy.$removeKernelDetectionTask(handle);
      }, "dispose")
    };
    this._kernelDetectionTask.set(handle, detectionTask);
    return detectionTask;
  }
  registerKernelSourceActionProvider(extension, viewType, provider) {
    const handle = this._kernelSourceActionProviderHandlePool++;
    const eventHandle = typeof provider.onDidChangeNotebookKernelSourceActions === "function" ? handle : void 0;
    const that = this;
    this._kernelSourceActionProviders.set(handle, provider);
    this._logService.trace(`NotebookKernelSourceActionProvider[${handle}], CREATED by ${extension.identifier.value}`);
    this._proxy.$addKernelSourceActionProvider(handle, handle, viewType);
    let subscription;
    if (eventHandle !== void 0) {
      subscription = provider.onDidChangeNotebookKernelSourceActions((_) => this._proxy.$emitNotebookKernelSourceActionsChangeEvent(eventHandle));
    }
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this._kernelSourceActionProviders.delete(handle);
        that._proxy.$removeKernelSourceActionProvider(handle, handle);
        subscription?.dispose();
      }, "dispose")
    };
  }
  async $provideKernelSourceActions(handle, token) {
    const provider = this._kernelSourceActionProviders.get(handle);
    if (provider) {
      const disposables = new DisposableStore();
      const ret = await provider.provideNotebookKernelSourceActions(token);
      return (ret ?? []).map((item) => extHostTypeConverters.NotebookKernelSourceAction.from(item, this._commands.converter, disposables));
    }
    return [];
  }
  $acceptNotebookAssociation(handle, uri, value) {
    const obj = this._kernelData.get(handle);
    if (obj) {
      const notebook = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
      if (value) {
        obj.associatedNotebooks.set(notebook.uri, true);
      } else {
        obj.associatedNotebooks.delete(notebook.uri);
      }
      this._logService.trace(`NotebookController[${handle}] ASSOCIATE notebook`, notebook.uri.toString(), value);
      obj.onDidChangeSelection.fire({
        selected: value,
        notebook: notebook.apiNotebook
      });
    }
  }
  async $executeCells(handle, uri, handles) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const document = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
    const cells = [];
    for (const cellHandle of handles) {
      const cell = document.getCell(cellHandle);
      if (cell) {
        cells.push(cell.apiCell);
      }
    }
    try {
      this._logService.trace(`NotebookController[${handle}] EXECUTE cells`, document.uri.toString(), cells.length);
      await obj.controller.executeHandler.call(obj.controller, cells, document.apiNotebook, obj.controller);
    } catch (err) {
      this._logService.error(`NotebookController[${handle}] execute cells FAILED`, err);
      console.error(err);
    }
  }
  async $cancelCells(handle, uri, handles) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const document = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
    if (obj.controller.interruptHandler) {
      await obj.controller.interruptHandler.call(obj.controller, document.apiNotebook);
    } else {
      for (const cellHandle of handles) {
        const cell = document.getCell(cellHandle);
        if (cell) {
          this._activeExecutions.get(cell.uri)?.cancel();
        }
      }
    }
    if (obj.controller.interruptHandler) {
      const items = this._activeNotebookExecutions.get(document.uri);
      this._activeNotebookExecutions.delete(document.uri);
      if (handles.length && Array.isArray(items) && items.length) {
        items.forEach((d) => d.dispose());
      }
    }
  }
  id = 0;
  variableStore = {};
  async $provideVariables(handle, requestId, notebookUri, parentId, kind, start, token) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const document = this._extHostNotebook.getNotebookDocument(URI.revive(notebookUri));
    const variableProvider = obj.controller.variableProvider;
    if (!variableProvider) {
      return;
    }
    let parent = void 0;
    if (parentId !== void 0) {
      parent = this.variableStore[parentId];
      if (!parent) {
        return;
      }
    } else {
      this.variableStore = {};
    }
    const requestKind = kind === "named" ? NotebookVariablesRequestKind.Named : NotebookVariablesRequestKind.Indexed;
    const variableResults = variableProvider.provideVariables(document.apiNotebook, parent, requestKind, start, token);
    let resultCount = 0;
    for await (const result of variableResults) {
      if (token.isCancellationRequested) {
        return;
      }
      const variable = {
        id: this.id++,
        name: result.variable.name,
        value: result.variable.value,
        type: result.variable.type,
        interfaces: result.variable.interfaces,
        language: result.variable.language,
        expression: result.variable.expression,
        hasNamedChildren: result.hasNamedChildren,
        indexedChildrenCount: result.indexedChildrenCount,
        extensionId: obj.extensionId.value
      };
      this.variableStore[variable.id] = result.variable;
      this._proxy.$receiveVariable(requestId, variable);
      if (resultCount++ >= variablePageSize) {
        return;
      }
    }
  }
  $acceptKernelMessageFromRenderer(handle, editorId, message) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const editor = this._extHostNotebook.getEditorById(editorId);
    obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
  }
  $cellExecutionChanged(uri, cellHandle, state) {
    const document = this._extHostNotebook.getNotebookDocument(URI.revive(uri));
    const cell = document.getCell(cellHandle);
    if (cell) {
      const newState = state ? extHostTypeConverters.NotebookCellExecutionState.to(state) : ExtHostNotebookCellExecutionState.Idle;
      if (newState !== void 0) {
        this._onDidChangeCellExecutionState.fire({
          cell: cell.apiCell,
          state: newState
        });
      }
    }
  }
  // ---
  _createNotebookCellExecution(cell, controllerId) {
    if (cell.index < 0) {
      throw new Error("CANNOT execute cell that has been REMOVED from notebook");
    }
    const notebook = this._extHostNotebook.getNotebookDocument(cell.notebook.uri);
    const cellObj = notebook.getCellFromApiCell(cell);
    if (!cellObj) {
      throw new Error("invalid cell");
    }
    if (this._activeExecutions.has(cellObj.uri)) {
      throw new Error(`duplicate execution for ${cellObj.uri}`);
    }
    const execution = new NotebookCellExecutionTask(controllerId, cellObj, this._proxy);
    this._activeExecutions.set(cellObj.uri, execution);
    const listener = execution.onDidChangeState(() => {
      if (execution.state === 2 /* Resolved */) {
        execution.dispose();
        listener.dispose();
        this._activeExecutions.delete(cellObj.uri);
      }
    });
    return execution.asApiObject();
  }
  // ---
  _createNotebookExecution(nb, controllerId) {
    const notebook = this._extHostNotebook.getNotebookDocument(nb.uri);
    const runningCell = nb.getCells().find((cell) => {
      const apiCell = notebook.getCellFromApiCell(cell);
      return apiCell && this._activeExecutions.has(apiCell.uri);
    });
    if (runningCell) {
      throw new Error(`duplicate cell execution for ${runningCell.document.uri}`);
    }
    if (this._activeNotebookExecutions.has(notebook.uri)) {
      throw new Error(`duplicate notebook execution for ${notebook.uri}`);
    }
    const execution = new NotebookExecutionTask(controllerId, notebook, this._proxy);
    const listener = execution.onDidChangeState(() => {
      if (execution.state === 2 /* Resolved */) {
        execution.dispose();
        listener.dispose();
        this._activeNotebookExecutions.delete(notebook.uri);
      }
    });
    this._activeNotebookExecutions.set(notebook.uri, [execution, listener]);
    return execution.asApiObject();
  }
};
ExtHostNotebookKernels = __decorateClass([
  __decorateParam(4, ILogService)
], ExtHostNotebookKernels);
var NotebookCellExecutionTaskState = /* @__PURE__ */ ((NotebookCellExecutionTaskState2) => {
  NotebookCellExecutionTaskState2[NotebookCellExecutionTaskState2["Init"] = 0] = "Init";
  NotebookCellExecutionTaskState2[NotebookCellExecutionTaskState2["Started"] = 1] = "Started";
  NotebookCellExecutionTaskState2[NotebookCellExecutionTaskState2["Resolved"] = 2] = "Resolved";
  return NotebookCellExecutionTaskState2;
})(NotebookCellExecutionTaskState || {});
class NotebookCellExecutionTask extends Disposable {
  constructor(controllerId, _cell, _proxy) {
    super();
    this._cell = _cell;
    this._proxy = _proxy;
    this._collector = new TimeoutBasedCollector(10, (updates) => this.update(updates));
    this._executionOrder = _cell.internalMetadata.executionOrder;
    this._proxy.$createExecution(this._handle, controllerId, this._cell.notebook.uri, this._cell.handle);
  }
  static {
    __name(this, "NotebookCellExecutionTask");
  }
  static HANDLE = 0;
  _handle = NotebookCellExecutionTask.HANDLE++;
  _onDidChangeState = new Emitter();
  onDidChangeState = this._onDidChangeState.event;
  _state = 0 /* Init */;
  get state() {
    return this._state;
  }
  _tokenSource = this._register(new CancellationTokenSource());
  _collector;
  _executionOrder;
  cancel() {
    this._tokenSource.cancel();
  }
  async updateSoon(update) {
    await this._collector.addItem(update);
  }
  async update(update) {
    const updates = Array.isArray(update) ? update : [update];
    return this._proxy.$updateExecution(this._handle, new SerializableObjectWithBuffers(updates));
  }
  verifyStateForOutput() {
    if (this._state === 0 /* Init */) {
      throw new Error("Must call start before modifying cell output");
    }
    if (this._state === 2 /* Resolved */) {
      throw new Error("Cannot modify cell output after calling resolve");
    }
  }
  cellIndexToHandle(cellOrCellIndex) {
    let cell = this._cell;
    if (cellOrCellIndex) {
      cell = this._cell.notebook.getCellFromApiCell(cellOrCellIndex);
    }
    if (!cell) {
      throw new Error("INVALID cell");
    }
    return cell.handle;
  }
  validateAndConvertOutputs(items) {
    return items.map((output) => {
      const newOutput = NotebookCellOutput.ensureUniqueMimeTypes(output.items, true);
      if (newOutput === output.items) {
        return extHostTypeConverters.NotebookCellOutput.from(output);
      }
      return extHostTypeConverters.NotebookCellOutput.from({
        items: newOutput,
        id: output.id,
        metadata: output.metadata
      });
    });
  }
  async updateOutputs(outputs, cell, append) {
    const handle = this.cellIndexToHandle(cell);
    const outputDtos = this.validateAndConvertOutputs(asArray(outputs));
    return this.updateSoon(
      {
        editType: CellExecutionUpdateType.Output,
        cellHandle: handle,
        append,
        outputs: outputDtos
      }
    );
  }
  async updateOutputItems(items, output, append) {
    items = NotebookCellOutput.ensureUniqueMimeTypes(asArray(items), true);
    return this.updateSoon({
      editType: CellExecutionUpdateType.OutputItems,
      items: items.map(extHostTypeConverters.NotebookCellOutputItem.from),
      outputId: output.id,
      append
    });
  }
  asApiObject() {
    const that = this;
    const result = {
      get token() {
        return that._tokenSource.token;
      },
      get cell() {
        return that._cell.apiCell;
      },
      get executionOrder() {
        return that._executionOrder;
      },
      set executionOrder(v) {
        that._executionOrder = v;
        that.update([{
          editType: CellExecutionUpdateType.ExecutionState,
          executionOrder: that._executionOrder
        }]);
      },
      start(startTime) {
        if (that._state === 2 /* Resolved */ || that._state === 1 /* Started */) {
          throw new Error("Cannot call start again");
        }
        that._state = 1 /* Started */;
        that._onDidChangeState.fire();
        that.update({
          editType: CellExecutionUpdateType.ExecutionState,
          runStartTime: startTime
        });
      },
      end(success, endTime, executionError) {
        if (that._state === 2 /* Resolved */) {
          throw new Error("Cannot call resolve twice");
        }
        that._state = 2 /* Resolved */;
        that._onDidChangeState.fire();
        that._collector.flush();
        const error = executionError ? {
          message: executionError.message,
          stack: executionError.stack,
          location: executionError?.location ? {
            startLineNumber: executionError.location.start.line,
            startColumn: executionError.location.start.character,
            endLineNumber: executionError.location.end.line,
            endColumn: executionError.location.end.character
          } : void 0,
          uri: executionError.uri
        } : void 0;
        that._proxy.$completeExecution(that._handle, new SerializableObjectWithBuffers({
          runEndTime: endTime,
          lastRunSuccess: success,
          error
        }));
      },
      clearOutput(cell) {
        that.verifyStateForOutput();
        return that.updateOutputs([], cell, false);
      },
      appendOutput(outputs, cell) {
        that.verifyStateForOutput();
        return that.updateOutputs(outputs, cell, true);
      },
      replaceOutput(outputs, cell) {
        that.verifyStateForOutput();
        return that.updateOutputs(outputs, cell, false);
      },
      appendOutputItems(items, output) {
        that.verifyStateForOutput();
        return that.updateOutputItems(items, output, true);
      },
      replaceOutputItems(items, output) {
        that.verifyStateForOutput();
        return that.updateOutputItems(items, output, false);
      }
    };
    return Object.freeze(result);
  }
}
var NotebookExecutionTaskState = /* @__PURE__ */ ((NotebookExecutionTaskState2) => {
  NotebookExecutionTaskState2[NotebookExecutionTaskState2["Init"] = 0] = "Init";
  NotebookExecutionTaskState2[NotebookExecutionTaskState2["Started"] = 1] = "Started";
  NotebookExecutionTaskState2[NotebookExecutionTaskState2["Resolved"] = 2] = "Resolved";
  return NotebookExecutionTaskState2;
})(NotebookExecutionTaskState || {});
class NotebookExecutionTask extends Disposable {
  constructor(controllerId, _notebook, _proxy) {
    super();
    this._notebook = _notebook;
    this._proxy = _proxy;
    this._proxy.$createNotebookExecution(this._handle, controllerId, this._notebook.uri);
  }
  static {
    __name(this, "NotebookExecutionTask");
  }
  static HANDLE = 0;
  _handle = NotebookExecutionTask.HANDLE++;
  _onDidChangeState = new Emitter();
  onDidChangeState = this._onDidChangeState.event;
  _state = 0 /* Init */;
  get state() {
    return this._state;
  }
  _tokenSource = this._register(new CancellationTokenSource());
  cancel() {
    this._tokenSource.cancel();
  }
  asApiObject() {
    const result = {
      start: /* @__PURE__ */ __name(() => {
        if (this._state === 2 /* Resolved */ || this._state === 1 /* Started */) {
          throw new Error("Cannot call start again");
        }
        this._state = 1 /* Started */;
        this._onDidChangeState.fire();
        this._proxy.$beginNotebookExecution(this._handle);
      }, "start"),
      end: /* @__PURE__ */ __name(() => {
        if (this._state === 2 /* Resolved */) {
          throw new Error("Cannot call resolve twice");
        }
        this._state = 2 /* Resolved */;
        this._onDidChangeState.fire();
        this._proxy.$completeNotebookExecution(this._handle);
      }, "end")
    };
    return Object.freeze(result);
  }
}
class TimeoutBasedCollector {
  constructor(delay, callback) {
    this.delay = delay;
    this.callback = callback;
  }
  static {
    __name(this, "TimeoutBasedCollector");
  }
  batch = [];
  startedTimer = Date.now();
  currentDeferred;
  addItem(item) {
    this.batch.push(item);
    if (!this.currentDeferred) {
      this.currentDeferred = new DeferredPromise();
      this.startedTimer = Date.now();
      timeout(this.delay).then(() => {
        return this.flush();
      });
    }
    if (Date.now() - this.startedTimer > this.delay) {
      return this.flush();
    }
    return this.currentDeferred.p;
  }
  flush() {
    if (this.batch.length === 0 || !this.currentDeferred) {
      return Promise.resolve();
    }
    const deferred = this.currentDeferred;
    this.currentDeferred = void 0;
    const batch = this.batch;
    this.batch = [];
    return this.callback(batch).finally(() => deferred.complete());
  }
}
function createKernelId(extensionIdentifier, id) {
  return `${extensionIdentifier.value}/${id}`;
}
__name(createKernelId, "createKernelId");
export {
  ExtHostNotebookKernels,
  createKernelId
};
//# sourceMappingURL=extHostNotebookKernels.js.map
