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
import { Disposable, IDisposable, toDisposable } from "../../../../../../base/common/lifecycle.js";
import { IMarkerData, IMarkerService } from "../../../../../../platform/markers/common/markers.js";
import { IRange } from "../../../../../../editor/common/core/range.js";
import { ICellExecutionError, ICellExecutionStateChangedEvent, IExecutionStateChangedEvent, INotebookExecutionStateService, NotebookExecutionType } from "../../../common/notebookExecutionStateService.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { CellKind, NotebookSetting } from "../../../common/notebookCommon.js";
import { INotebookEditor, INotebookEditorContribution } from "../../notebookBrowser.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { Iterable } from "../../../../../../base/common/iterator.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { URI } from "../../../../../../base/common/uri.js";
import { Event } from "../../../../../../base/common/event.js";
import { IChatAgentService } from "../../../../chat/common/chatAgents.js";
let CellDiagnostics = class extends Disposable {
  constructor(notebookEditor, notebookExecutionStateService, markerService, chatAgentService, configurationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.markerService = markerService;
    this.chatAgentService = chatAgentService;
    this.configurationService = configurationService;
    this.updateEnabled();
    this._register(chatAgentService.onDidChangeAgents(() => this.updateEnabled()));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.cellFailureDiagnostics)) {
        this.updateEnabled();
      }
    }));
  }
  static {
    __name(this, "CellDiagnostics");
  }
  static ID = "workbench.notebook.cellDiagnostics";
  enabled = false;
  listening = false;
  diagnosticsByHandle = /* @__PURE__ */ new Map();
  updateEnabled() {
    const settingEnabled = this.configurationService.getValue(NotebookSetting.cellFailureDiagnostics);
    if (this.enabled && (!settingEnabled || Iterable.isEmpty(this.chatAgentService.getAgents()))) {
      this.enabled = false;
      this.clearAll();
    } else if (!this.enabled && settingEnabled && !Iterable.isEmpty(this.chatAgentService.getAgents())) {
      this.enabled = true;
      if (!this.listening) {
        this.listening = true;
        this._register(Event.accumulate(
          this.notebookExecutionStateService.onDidChangeExecution,
          200
        )((e) => this.handleChangeExecutionState(e)));
      }
    }
  }
  handleChangeExecutionState(changes) {
    if (!this.enabled) {
      return;
    }
    const handled = /* @__PURE__ */ new Set();
    for (const e of changes.reverse()) {
      const notebookUri = this.notebookEditor.textModel?.uri;
      if (e.type === NotebookExecutionType.cell && notebookUri && e.affectsNotebook(notebookUri) && !handled.has(e.cellHandle)) {
        handled.add(e.cellHandle);
        if (!!e.changed) {
          this.clear(e.cellHandle);
        } else {
          this.setDiagnostics(e.cellHandle);
        }
      }
    }
  }
  clearAll() {
    for (const handle of this.diagnosticsByHandle.keys()) {
      this.clear(handle);
    }
  }
  clear(cellHandle) {
    const diagnostic = this.diagnosticsByHandle.get(cellHandle);
    if (diagnostic) {
      for (const disposable of diagnostic.disposables) {
        disposable.dispose();
      }
      this.diagnosticsByHandle.delete(cellHandle);
    }
  }
  setDiagnostics(cellHandle) {
    if (this.diagnosticsByHandle.has(cellHandle)) {
      return;
    }
    const cell = this.notebookEditor.getCellByHandle(cellHandle);
    if (!cell || cell.cellKind !== CellKind.Code) {
      return;
    }
    const metadata = cell.model.internalMetadata;
    if (cell instanceof CodeCellViewModel && !metadata.lastRunSuccess && metadata?.error?.location) {
      const disposables = [];
      const marker = this.createMarkerData(metadata.error.message, metadata.error.location);
      this.markerService.changeOne(CellDiagnostics.ID, cell.uri, [marker]);
      disposables.push(toDisposable(() => this.markerService.changeOne(CellDiagnostics.ID, cell.uri, [])));
      cell.excecutionError.set(metadata.error, void 0);
      disposables.push(toDisposable(() => cell.excecutionError.set(void 0, void 0)));
      disposables.push(cell.model.onDidChangeOutputs(() => {
        if (cell.model.outputs.length === 0) {
          this.clear(cellHandle);
        }
      }));
      disposables.push(cell.model.onDidChangeContent(() => {
        this.clear(cellHandle);
      }));
      this.diagnosticsByHandle.set(cellHandle, { cellUri: cell.uri, error: metadata.error, disposables });
    }
  }
  createMarkerData(message, location) {
    return {
      severity: 8,
      message,
      startLineNumber: location.startLineNumber + 1,
      startColumn: location.startColumn + 1,
      endLineNumber: location.endLineNumber + 1,
      endColumn: location.endColumn + 1,
      source: "Cell Execution Error"
    };
  }
  dispose() {
    super.dispose();
    this.clearAll();
  }
};
CellDiagnostics = __decorateClass([
  __decorateParam(1, INotebookExecutionStateService),
  __decorateParam(2, IMarkerService),
  __decorateParam(3, IChatAgentService),
  __decorateParam(4, IConfigurationService)
], CellDiagnostics);
registerNotebookContribution(CellDiagnostics.ID, CellDiagnostics);
export {
  CellDiagnostics
};
//# sourceMappingURL=cellDiagnosticEditorContrib.js.map
