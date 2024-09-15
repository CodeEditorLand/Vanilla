var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { localize } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../platform/clipboard/common/clipboardService.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { INotebookOutputActionContext, NOTEBOOK_ACTIONS_CATEGORY } from "./coreActions.js";
import { NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS, NOTEBOOK_CELL_HAS_OUTPUTS } from "../../common/notebookContextKeys.js";
import * as icons from "../notebookIcons.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { copyCellOutput } from "../contrib/clipboard/cellOutputClipboard.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ICellOutputViewModel, ICellViewModel, INotebookEditor, getNotebookEditorFromEditorPane } from "../notebookBrowser.js";
import { CellKind, CellUri } from "../../common/notebookCommon.js";
import { CodeCellViewModel } from "../viewModel/codeCellViewModel.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
const COPY_OUTPUT_COMMAND_ID = "notebook.cellOutput.copy";
registerAction2(class ShowAllOutputsAction extends Action2 {
  static {
    __name(this, "ShowAllOutputsAction");
  }
  constructor() {
    super({
      id: "notebook.cellOuput.showEmptyOutputs",
      title: localize("notebookActions.showAllOutput", "Show empty outputs"),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: ContextKeyExpr.and(NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS)
      },
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY
    });
  }
  run(accessor, context) {
    const cell = context.cell;
    if (cell && cell.cellKind === CellKind.Code) {
      for (let i = 1; i < cell.outputsViewModels.length; i++) {
        if (!cell.outputsViewModels[i].visible.get()) {
          cell.outputsViewModels[i].setVisible(true, true);
          cell.updateOutputHeight(i, 1, "command");
        }
      }
    }
  }
});
registerAction2(class CopyCellOutputAction extends Action2 {
  static {
    __name(this, "CopyCellOutputAction");
  }
  constructor() {
    super({
      id: COPY_OUTPUT_COMMAND_ID,
      title: localize("notebookActions.copyOutput", "Copy Cell Output"),
      menu: {
        id: MenuId.NotebookOutputToolbar,
        when: NOTEBOOK_CELL_HAS_OUTPUTS
      },
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: icons.copyIcon
    });
  }
  getNoteboookEditor(editorService, outputContext) {
    if (outputContext && "notebookEditor" in outputContext) {
      return outputContext.notebookEditor;
    }
    return getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  }
  async run(accessor, outputContext) {
    const notebookEditor = this.getNoteboookEditor(accessor.get(IEditorService), outputContext);
    if (!notebookEditor) {
      return;
    }
    let outputViewModel;
    if (outputContext && "outputId" in outputContext && typeof outputContext.outputId === "string") {
      outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
    } else if (outputContext && "outputViewModel" in outputContext) {
      outputViewModel = outputContext.outputViewModel;
    }
    if (!outputViewModel) {
      const activeCell = notebookEditor.getActiveCell();
      if (!activeCell) {
        return;
      }
      if (activeCell.focusedOutputId !== void 0) {
        outputViewModel = activeCell.outputsViewModels.find((output) => {
          return output.model.outputId === activeCell.focusedOutputId;
        });
      } else {
        outputViewModel = activeCell.outputsViewModels.find((output) => output.pickedMimeType?.isTrusted);
      }
    }
    if (!outputViewModel) {
      return;
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    if (mimeType?.startsWith("image/")) {
      const focusOptions = { skipReveal: true, outputId: outputViewModel.model.outputId, altOutputId: outputViewModel.model.alternativeOutputId };
      await notebookEditor.focusNotebookCell(outputViewModel.cellViewModel, "output", focusOptions);
      notebookEditor.copyOutputImage(outputViewModel);
    } else {
      const clipboardService = accessor.get(IClipboardService);
      const logService = accessor.get(ILogService);
      copyCellOutput(mimeType, outputViewModel, clipboardService, logService);
    }
  }
});
function getOutputViewModelFromId(outputId, notebookEditor) {
  const notebookViewModel = notebookEditor.getViewModel();
  if (notebookViewModel) {
    const codeCells = notebookViewModel.viewCells.filter((cell) => cell.cellKind === CellKind.Code);
    for (const cell of codeCells) {
      const output = cell.outputsViewModels.find((output2) => output2.model.outputId === outputId || output2.model.alternativeOutputId === outputId);
      if (output) {
        return output;
      }
    }
  }
  return void 0;
}
__name(getOutputViewModelFromId, "getOutputViewModelFromId");
const OPEN_OUTPUT_COMMAND_ID = "notebook.cellOutput.openInTextEditor";
registerAction2(class OpenCellOutputInEditorAction extends Action2 {
  static {
    __name(this, "OpenCellOutputInEditorAction");
  }
  constructor() {
    super({
      id: OPEN_OUTPUT_COMMAND_ID,
      title: localize("notebookActions.openOutputInEditor", "Open Cell Output in Text Editor"),
      f1: false,
      category: NOTEBOOK_ACTIONS_CATEGORY,
      icon: icons.copyIcon
    });
  }
  getNoteboookEditor(editorService, outputContext) {
    if (outputContext && "notebookEditor" in outputContext) {
      return outputContext.notebookEditor;
    }
    return getNotebookEditorFromEditorPane(editorService.activeEditorPane);
  }
  async run(accessor, outputContext) {
    const notebookEditor = this.getNoteboookEditor(accessor.get(IEditorService), outputContext);
    if (!notebookEditor) {
      return;
    }
    let outputViewModel;
    if (outputContext && "outputId" in outputContext && typeof outputContext.outputId === "string") {
      outputViewModel = getOutputViewModelFromId(outputContext.outputId, notebookEditor);
    } else if (outputContext && "outputViewModel" in outputContext) {
      outputViewModel = outputContext.outputViewModel;
    }
    const openerService = accessor.get(IOpenerService);
    if (outputViewModel?.model.outputId && notebookEditor.textModel?.uri) {
      openerService.open(CellUri.generateCellOutputUri(notebookEditor.textModel.uri, outputViewModel.model.outputId));
    }
  }
});
export {
  COPY_OUTPUT_COMMAND_ID,
  OPEN_OUTPUT_COMMAND_ID
};
//# sourceMappingURL=cellOutputActions.js.map
