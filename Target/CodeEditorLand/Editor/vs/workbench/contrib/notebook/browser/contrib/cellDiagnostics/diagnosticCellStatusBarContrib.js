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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { autorun } from "../../../../../../base/common/observable.js";
import { localize } from "../../../../../../nls.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.js";
import {
  CellStatusbarAlignment
} from "../../../common/notebookCommon.js";
import { registerNotebookContribution } from "../../notebookEditorExtensions.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { NotebookStatusBarController } from "../cellStatusBar/executionStatusBarItemController.js";
import { OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID } from "./cellDiagnosticsActions.js";
let DiagnosticCellStatusBarContrib = class extends Disposable {
  static {
    __name(this, "DiagnosticCellStatusBarContrib");
  }
  static id = "workbench.notebook.statusBar.diagtnostic";
  constructor(notebookEditor, instantiationService) {
    super();
    this._register(
      new NotebookStatusBarController(
        notebookEditor,
        (vm, cell) => cell instanceof CodeCellViewModel ? instantiationService.createInstance(
          DiagnosticCellStatusBarItem,
          vm,
          cell
        ) : Disposable.None
      )
    );
  }
};
DiagnosticCellStatusBarContrib = __decorateClass([
  __decorateParam(1, IInstantiationService)
], DiagnosticCellStatusBarContrib);
registerNotebookContribution(
  DiagnosticCellStatusBarContrib.id,
  DiagnosticCellStatusBarContrib
);
let DiagnosticCellStatusBarItem = class extends Disposable {
  constructor(_notebookViewModel, cell, keybindingService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this.cell = cell;
    this.keybindingService = keybindingService;
    this._register(autorun((reader) => this.updateSparkleItem(reader.readObservable(cell.excecutionError))));
  }
  static {
    __name(this, "DiagnosticCellStatusBarItem");
  }
  _currentItemIds = [];
  async updateSparkleItem(error) {
    let item;
    if (error?.location) {
      const keybinding = this.keybindingService.lookupKeybinding(OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID)?.getLabel();
      const tooltip = localize(
        "notebook.cell.status.diagnostic",
        "Quick Actions {0}",
        `(${keybinding})`
      );
      item = {
        text: `$(sparkle)`,
        tooltip,
        alignment: CellStatusbarAlignment.Left,
        command: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
        priority: Number.MAX_SAFE_INTEGER - 1
      };
    }
    const items = item ? [item] : [];
    this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(
      this._currentItemIds,
      [{ handle: this.cell.handle, items }]
    );
  }
  dispose() {
    super.dispose();
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [
      { handle: this.cell.handle, items: [] }
    ]);
  }
};
DiagnosticCellStatusBarItem = __decorateClass([
  __decorateParam(2, IKeybindingService)
], DiagnosticCellStatusBarItem);
export {
  DiagnosticCellStatusBarContrib
};
//# sourceMappingURL=diagnosticCellStatusBarContrib.js.map
