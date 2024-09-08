import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { observableFromEvent } from "../../../../base/common/observable.js";
import * as nls from "../../../../nls.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import {
  CellKind,
  NotebookCellExecutionState
} from "../common/notebookCommon.js";
import {
  NotebookExecutionType
} from "../common/notebookExecutionStateService.js";
class NotebookAccessibilityProvider extends Disposable {
  constructor(notebookExecutionStateService, viewModel, keybindingService, configurationService) {
    super();
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.viewModel = viewModel;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this._register(
      Event.debounce(
        this.notebookExecutionStateService.onDidChangeExecution,
        (last, e) => this.mergeEvents(last, e),
        100
      )((cellHandles) => {
        const viewModel2 = this.viewModel();
        if (viewModel2) {
          for (const handle of cellHandles) {
            const cellModel = viewModel2.getCellByHandle(handle);
            if (cellModel) {
              this._onDidAriaLabelChange.fire(
                cellModel
              );
            }
          }
        }
      }, this)
    );
  }
  _onDidAriaLabelChange = new Emitter();
  onDidAriaLabelChange = this._onDidAriaLabelChange.event;
  getAriaLabel(element) {
    const event = Event.filter(
      this.onDidAriaLabelChange,
      (e) => e === element
    );
    return observableFromEvent(this, event, () => {
      const viewModel = this.viewModel();
      if (!viewModel) {
        return "";
      }
      const index = viewModel.getCellIndex(element);
      if (index >= 0) {
        return this.getLabel(index, element);
      }
      return "";
    });
  }
  getLabel(index, element) {
    const executionState = this.notebookExecutionStateService.getCellExecution(
      element.uri
    )?.state;
    const executionLabel = executionState === NotebookCellExecutionState.Executing ? ", executing" : executionState === NotebookCellExecutionState.Pending ? ", pending" : "";
    return `Cell ${index}, ${element.cellKind === CellKind.Markup ? "markdown" : "code"} cell${executionLabel}`;
  }
  getWidgetAriaLabel() {
    const keybinding = this.keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp)?.getLabel();
    if (this.configurationService.getValue(
      AccessibilityVerbositySettingId.Notebook
    )) {
      return keybinding ? nls.localize(
        "notebookTreeAriaLabelHelp",
        "Notebook\nUse {0} for accessibility help",
        keybinding
      ) : nls.localize(
        "notebookTreeAriaLabelHelpNoKb",
        "Notebook\nRun the Open Accessibility Help command for more information",
        keybinding
      );
    }
    return nls.localize("notebookTreeAriaLabel", "Notebook");
  }
  mergeEvents(last, e) {
    const viewModel = this.viewModel();
    const result = last || [];
    if (viewModel && e.type === NotebookExecutionType.cell && e.affectsNotebook(viewModel.uri)) {
      if (result.indexOf(e.cellHandle) < 0) {
        result.push(e.cellHandle);
      }
    }
    return result;
  }
}
export {
  NotebookAccessibilityProvider
};
