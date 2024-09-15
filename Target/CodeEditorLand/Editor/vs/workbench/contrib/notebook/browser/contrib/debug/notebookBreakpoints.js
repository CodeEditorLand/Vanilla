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
import { Disposable, IDisposable } from "../../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../../base/common/map.js";
import { Schemas } from "../../../../../../base/common/network.js";
import { isEqual } from "../../../../../../base/common/resources.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from "../../../../../common/contributions.js";
import { IBreakpoint, IDebugService } from "../../../../debug/common/debug.js";
import { getNotebookEditorFromEditorPane } from "../../notebookBrowser.js";
import { NotebookTextModel } from "../../../common/model/notebookTextModel.js";
import { CellUri, NotebookCellsChangeType } from "../../../common/notebookCommon.js";
import { INotebookService } from "../../../common/notebookService.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { LifecyclePhase } from "../../../../../services/lifecycle/common/lifecycle.js";
let NotebookBreakpoints = class extends Disposable {
  constructor(_debugService, _notebookService, _editorService) {
    super();
    this._debugService = _debugService;
    this._editorService = _editorService;
    const listeners = new ResourceMap();
    this._register(_notebookService.onWillAddNotebookDocument((model) => {
      listeners.set(model.uri, model.onWillAddRemoveCells((e) => {
        const debugModel = this._debugService.getModel();
        if (!debugModel.getBreakpoints().length) {
          return;
        }
        if (e.rawEvent.kind !== NotebookCellsChangeType.ModelChange) {
          return;
        }
        for (const change of e.rawEvent.changes) {
          const [start, deleteCount] = change;
          if (deleteCount > 0) {
            const deleted = model.cells.slice(start, start + deleteCount);
            for (const deletedCell of deleted) {
              const cellBps = debugModel.getBreakpoints({ uri: deletedCell.uri });
              cellBps.forEach((cellBp) => this._debugService.removeBreakpoints(cellBp.getId()));
            }
          }
        }
      }));
    }));
    this._register(_notebookService.onWillRemoveNotebookDocument((model) => {
      this.updateBreakpoints(model);
      listeners.get(model.uri)?.dispose();
      listeners.delete(model.uri);
    }));
    this._register(this._debugService.getModel().onDidChangeBreakpoints((e) => {
      const newCellBp = e?.added?.find((bp) => "uri" in bp && bp.uri.scheme === Schemas.vscodeNotebookCell);
      if (newCellBp) {
        const parsed = CellUri.parse(newCellBp.uri);
        if (!parsed) {
          return;
        }
        const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
        if (!editor || !editor.hasModel() || editor.textModel.uri.toString() !== parsed.notebook.toString()) {
          return;
        }
        const cell = editor.getCellByHandle(parsed.handle);
        if (!cell) {
          return;
        }
        editor.focusElement(cell);
      }
    }));
  }
  static {
    __name(this, "NotebookBreakpoints");
  }
  updateBreakpoints(model) {
    const bps = this._debugService.getModel().getBreakpoints();
    if (!bps.length || !model.cells.length) {
      return;
    }
    const idxMap = new ResourceMap();
    model.cells.forEach((cell, i) => {
      idxMap.set(cell.uri, i);
    });
    bps.forEach((bp) => {
      const idx = idxMap.get(bp.uri);
      if (typeof idx !== "number") {
        return;
      }
      const notebook = CellUri.parse(bp.uri)?.notebook;
      if (!notebook) {
        return;
      }
      const newUri = CellUri.generate(notebook, idx);
      if (isEqual(newUri, bp.uri)) {
        return;
      }
      this._debugService.removeBreakpoints(bp.getId());
      this._debugService.addBreakpoints(newUri, [
        {
          column: bp.column,
          condition: bp.condition,
          enabled: bp.enabled,
          hitCondition: bp.hitCondition,
          logMessage: bp.logMessage,
          lineNumber: bp.lineNumber
        }
      ]);
    });
  }
};
NotebookBreakpoints = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, INotebookService),
  __decorateParam(2, IEditorService)
], NotebookBreakpoints);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookBreakpoints, LifecyclePhase.Restored);
//# sourceMappingURL=notebookBreakpoints.js.map
