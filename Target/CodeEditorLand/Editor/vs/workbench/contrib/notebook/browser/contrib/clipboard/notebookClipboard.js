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
import {
  getActiveElement,
  getWindow,
  isAncestor,
  isEditableElement,
  isHTMLElement
} from "../../../../../../base/browser/dom.js";
import { KeyCode, KeyMod } from "../../../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import * as platform from "../../../../../../base/common/platform.js";
import {
  RedoCommand,
  UndoCommand
} from "../../../../../../editor/browser/editorExtensions.js";
import {
  CopyAction,
  CutAction,
  PasteAction
} from "../../../../../../editor/contrib/clipboard/browser/clipboard.js";
import { localize, localize2 } from "../../../../../../nls.js";
import { Categories } from "../../../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../../../platform/contextkey/common/contextkey.js";
import { InputFocusedContextKey } from "../../../../../../platform/contextkey/common/contextkeys.js";
import { KeybindingWeight } from "../../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILogService } from "../../../../../../platform/log/common/log.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../../../common/contributions.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { showWindowLogActionId } from "../../../../../services/log/common/logConstants.js";
import {
  cloneNotebookCellTextModel
} from "../../../common/model/notebookCellTextModel.js";
import {
  CellEditType,
  SelectionStateType
} from "../../../common/notebookCommon.js";
import {
  NOTEBOOK_CELL_EDITABLE,
  NOTEBOOK_EDITOR_EDITABLE,
  NOTEBOOK_EDITOR_FOCUSED,
  NOTEBOOK_OUTPUT_FOCUSED
} from "../../../common/notebookContextKeys.js";
import { INotebookService } from "../../../common/notebookService.js";
import {
  CellOverflowToolbarGroups,
  NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT,
  NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT,
  NotebookAction,
  NotebookCellAction
} from "../../controller/coreActions.js";
import {
  cellRangeToViewCells,
  expandCellRangesWithHiddenCells,
  getNotebookEditorFromEditorPane
} from "../../notebookBrowser.js";
let _logging = false;
function toggleLogging() {
  _logging = !_logging;
}
__name(toggleLogging, "toggleLogging");
function _log(loggerService, str) {
  if (_logging) {
    loggerService.info(`[NotebookClipboard]: ${str}`);
  }
}
__name(_log, "_log");
function getFocusedEditor(accessor) {
  const loggerService = accessor.get(ILogService);
  const editorService = accessor.get(IEditorService);
  const editor = getNotebookEditorFromEditorPane(
    editorService.activeEditorPane
  );
  if (!editor) {
    _log(
      loggerService,
      "[Revive Webview] No notebook editor found for active editor pane, bypass"
    );
    return;
  }
  if (!editor.hasEditorFocus()) {
    _log(
      loggerService,
      "[Revive Webview] Notebook editor is not focused, bypass"
    );
    return;
  }
  if (!editor.hasWebviewFocus()) {
    _log(
      loggerService,
      "[Revive Webview] Notebook editor backlayer webview is not focused, bypass"
    );
    return;
  }
  const view = editor.getViewModel();
  if (view && view.viewCells.every(
    (cell) => !cell.outputIsFocused && !cell.outputIsHovered
  )) {
    return;
  }
  return { editor, loggerService };
}
__name(getFocusedEditor, "getFocusedEditor");
function getFocusedWebviewDelegate(accessor) {
  const result = getFocusedEditor(accessor);
  if (!result) {
    return;
  }
  const webview = result.editor.getInnerWebview();
  _log(
    result.loggerService,
    "[Revive Webview] Notebook editor backlayer webview is focused"
  );
  return webview;
}
__name(getFocusedWebviewDelegate, "getFocusedWebviewDelegate");
function withWebview(accessor, f) {
  const webview = getFocusedWebviewDelegate(accessor);
  if (webview) {
    f(webview);
    return true;
  }
  return false;
}
__name(withWebview, "withWebview");
function withEditor(accessor, f) {
  const result = getFocusedEditor(accessor);
  return result ? f(result.editor) : false;
}
__name(withEditor, "withEditor");
const PRIORITY = 105;
UndoCommand.addImplementation(PRIORITY, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.undo());
});
RedoCommand.addImplementation(PRIORITY, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.redo());
});
CopyAction?.addImplementation(PRIORITY, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.copy());
});
PasteAction?.addImplementation(PRIORITY, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.paste());
});
CutAction?.addImplementation(PRIORITY, "notebook-webview", (accessor) => {
  return withWebview(accessor, (webview) => webview.cut());
});
function runPasteCells(editor, activeCell, pasteCells) {
  if (!editor.hasModel()) {
    return false;
  }
  const textModel = editor.textModel;
  if (editor.isReadOnly) {
    return false;
  }
  const originalState = {
    kind: SelectionStateType.Index,
    focus: editor.getFocus(),
    selections: editor.getSelections()
  };
  if (activeCell) {
    const currCellIndex = editor.getCellIndex(activeCell);
    const newFocusIndex = typeof currCellIndex === "number" ? currCellIndex + 1 : 0;
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: newFocusIndex,
          count: 0,
          cells: pasteCells.items.map(
            (cell) => cloneNotebookCellTextModel(cell)
          )
        }
      ],
      true,
      originalState,
      () => ({
        kind: SelectionStateType.Index,
        focus: { start: newFocusIndex, end: newFocusIndex + 1 },
        selections: [
          {
            start: newFocusIndex,
            end: newFocusIndex + pasteCells.items.length
          }
        ]
      }),
      void 0,
      true
    );
  } else {
    if (editor.getLength() !== 0) {
      return false;
    }
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: 0,
          count: 0,
          cells: pasteCells.items.map(
            (cell) => cloneNotebookCellTextModel(cell)
          )
        }
      ],
      true,
      originalState,
      () => ({
        kind: SelectionStateType.Index,
        focus: { start: 0, end: 1 },
        selections: [{ start: 1, end: pasteCells.items.length + 1 }]
      }),
      void 0,
      true
    );
  }
  return true;
}
__name(runPasteCells, "runPasteCells");
function runCopyCells(accessor, editor, targetCell) {
  if (!editor.hasModel()) {
    return false;
  }
  if (editor.hasOutputTextSelection()) {
    getWindow(editor.getDomNode()).document.execCommand("copy");
    return true;
  }
  const clipboardService = accessor.get(IClipboardService);
  const notebookService = accessor.get(INotebookService);
  const selections = editor.getSelections();
  if (targetCell) {
    const targetCellIndex = editor.getCellIndex(targetCell);
    const containingSelection = selections.find(
      (selection) => selection.start <= targetCellIndex && targetCellIndex < selection.end
    );
    if (!containingSelection) {
      clipboardService.writeText(targetCell.getText());
      notebookService.setToCopy([targetCell.model], true);
      return true;
    }
  }
  const selectionRanges = expandCellRangesWithHiddenCells(
    editor,
    editor.getSelections()
  );
  const selectedCells = cellRangeToViewCells(editor, selectionRanges);
  if (!selectedCells.length) {
    return false;
  }
  clipboardService.writeText(
    selectedCells.map((cell) => cell.getText()).join("\n")
  );
  notebookService.setToCopy(
    selectedCells.map((cell) => cell.model),
    true
  );
  return true;
}
__name(runCopyCells, "runCopyCells");
function runCutCells(accessor, editor, targetCell) {
  if (!editor.hasModel() || editor.isReadOnly) {
    return false;
  }
  const textModel = editor.textModel;
  const clipboardService = accessor.get(IClipboardService);
  const notebookService = accessor.get(INotebookService);
  const selections = editor.getSelections();
  if (targetCell) {
    const targetCellIndex = editor.getCellIndex(targetCell);
    const containingSelection2 = selections.find(
      (selection) => selection.start <= targetCellIndex && targetCellIndex < selection.end
    );
    if (!containingSelection2) {
      clipboardService.writeText(targetCell.getText());
      const focus2 = editor.getFocus();
      const newFocus = focus2.end <= targetCellIndex ? focus2 : { start: focus2.start - 1, end: focus2.end - 1 };
      const newSelections = selections.map(
        (selection) => selection.end <= targetCellIndex ? selection : { start: selection.start - 1, end: selection.end - 1 }
      );
      textModel.applyEdits(
        [
          {
            editType: CellEditType.Replace,
            index: targetCellIndex,
            count: 1,
            cells: []
          }
        ],
        true,
        {
          kind: SelectionStateType.Index,
          focus: editor.getFocus(),
          selections
        },
        () => ({
          kind: SelectionStateType.Index,
          focus: newFocus,
          selections: newSelections
        }),
        void 0,
        true
      );
      notebookService.setToCopy([targetCell.model], false);
      return true;
    }
  }
  const focus = editor.getFocus();
  const containingSelection = selections.find(
    (selection) => selection.start <= focus.start && focus.end <= selection.end
  );
  if (!containingSelection) {
    const targetCell2 = editor.cellAt(focus.start);
    clipboardService.writeText(targetCell2.getText());
    const newFocus = focus.end === editor.getLength() ? { start: focus.start - 1, end: focus.end - 1 } : focus;
    const newSelections = selections.map(
      (selection) => selection.end <= focus.start ? selection : { start: selection.start - 1, end: selection.end - 1 }
    );
    textModel.applyEdits(
      [
        {
          editType: CellEditType.Replace,
          index: focus.start,
          count: 1,
          cells: []
        }
      ],
      true,
      {
        kind: SelectionStateType.Index,
        focus: editor.getFocus(),
        selections
      },
      () => ({
        kind: SelectionStateType.Index,
        focus: newFocus,
        selections: newSelections
      }),
      void 0,
      true
    );
    notebookService.setToCopy([targetCell2.model], false);
    return true;
  }
  const selectionRanges = expandCellRangesWithHiddenCells(
    editor,
    editor.getSelections()
  );
  const selectedCells = cellRangeToViewCells(editor, selectionRanges);
  if (!selectedCells.length) {
    return false;
  }
  clipboardService.writeText(
    selectedCells.map((cell) => cell.getText()).join("\n")
  );
  const edits = selectionRanges.map((range) => ({
    editType: CellEditType.Replace,
    index: range.start,
    count: range.end - range.start,
    cells: []
  }));
  const firstSelectIndex = selectionRanges[0].start;
  const newFocusedCellIndex = firstSelectIndex < textModel.cells.length - 1 ? firstSelectIndex : Math.max(textModel.cells.length - 2, 0);
  textModel.applyEdits(
    edits,
    true,
    {
      kind: SelectionStateType.Index,
      focus: editor.getFocus(),
      selections: selectionRanges
    },
    () => {
      return {
        kind: SelectionStateType.Index,
        focus: {
          start: newFocusedCellIndex,
          end: newFocusedCellIndex + 1
        },
        selections: [
          {
            start: newFocusedCellIndex,
            end: newFocusedCellIndex + 1
          }
        ]
      };
    },
    void 0,
    true
  );
  notebookService.setToCopy(
    selectedCells.map((cell) => cell.model),
    false
  );
  return true;
}
__name(runCutCells, "runCutCells");
let NotebookClipboardContribution = class extends Disposable {
  constructor(_editorService) {
    super();
    this._editorService = _editorService;
    const PRIORITY2 = 105;
    if (CopyAction) {
      this._register(CopyAction.addImplementation(PRIORITY2, "notebook-clipboard", (accessor) => {
        return this.runCopyAction(accessor);
      }));
    }
    if (PasteAction) {
      this._register(PasteAction.addImplementation(PRIORITY2, "notebook-clipboard", (accessor) => {
        return this.runPasteAction(accessor);
      }));
    }
    if (CutAction) {
      this._register(CutAction.addImplementation(PRIORITY2, "notebook-clipboard", (accessor) => {
        return this.runCutAction(accessor);
      }));
    }
  }
  static {
    __name(this, "NotebookClipboardContribution");
  }
  static ID = "workbench.contrib.notebookClipboard";
  _getContext() {
    const editor = getNotebookEditorFromEditorPane(
      this._editorService.activeEditorPane
    );
    const activeCell = editor?.getActiveCell();
    return {
      editor,
      activeCell
    };
  }
  _focusInsideEmebedMonaco(editor) {
    const windowSelection = getWindow(editor.getDomNode()).getSelection();
    if (windowSelection?.rangeCount !== 1) {
      return false;
    }
    const activeSelection = windowSelection.getRangeAt(0);
    if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
      return false;
    }
    let container = activeSelection.commonAncestorContainer;
    const body = editor.getDomNode();
    if (!body.contains(container)) {
      return false;
    }
    while (container && container !== body) {
      if (container.classList && container.classList.contains("monaco-editor")) {
        return true;
      }
      container = container.parentNode;
    }
    return false;
  }
  runCopyAction(accessor) {
    const loggerService = accessor.get(ILogService);
    const activeElement = getActiveElement();
    if (isHTMLElement(activeElement) && isEditableElement(activeElement)) {
      _log(
        loggerService,
        "[NotebookEditor] focus is on input or textarea element, bypass"
      );
      return false;
    }
    const { editor } = this._getContext();
    if (!editor) {
      _log(
        loggerService,
        "[NotebookEditor] no active notebook editor, bypass"
      );
      return false;
    }
    if (!isAncestor(activeElement, editor.getDomNode())) {
      _log(
        loggerService,
        "[NotebookEditor] focus is outside of the notebook editor, bypass"
      );
      return false;
    }
    if (this._focusInsideEmebedMonaco(editor)) {
      _log(
        loggerService,
        "[NotebookEditor] focus is on embed monaco editor, bypass"
      );
      return false;
    }
    _log(
      loggerService,
      "[NotebookEditor] run copy actions on notebook model"
    );
    return runCopyCells(accessor, editor, void 0);
  }
  runPasteAction(accessor) {
    const activeElement = getActiveElement();
    if (activeElement && isEditableElement(activeElement)) {
      return false;
    }
    const notebookService = accessor.get(INotebookService);
    const pasteCells = notebookService.getToCopy();
    if (!pasteCells) {
      return false;
    }
    const { editor, activeCell } = this._getContext();
    if (!editor) {
      return false;
    }
    return runPasteCells(editor, activeCell, pasteCells);
  }
  runCutAction(accessor) {
    const activeElement = getActiveElement();
    if (activeElement && isEditableElement(activeElement)) {
      return false;
    }
    const { editor } = this._getContext();
    if (!editor) {
      return false;
    }
    return runCutCells(accessor, editor, void 0);
  }
};
NotebookClipboardContribution = __decorateClass([
  __decorateParam(0, IEditorService)
], NotebookClipboardContribution);
registerWorkbenchContribution2(
  NotebookClipboardContribution.ID,
  NotebookClipboardContribution,
  WorkbenchPhase.BlockRestore
);
const COPY_CELL_COMMAND_ID = "notebook.cell.copy";
const CUT_CELL_COMMAND_ID = "notebook.cell.cut";
const PASTE_CELL_COMMAND_ID = "notebook.cell.paste";
const PASTE_CELL_ABOVE_COMMAND_ID = "notebook.cell.pasteAbove";
registerAction2(
  class extends NotebookCellAction {
    constructor() {
      super({
        id: COPY_CELL_COMMAND_ID,
        title: localize("notebookActions.copy", "Copy Cell"),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: NOTEBOOK_EDITOR_FOCUSED,
          group: CellOverflowToolbarGroups.Copy,
          order: 2
        },
        keybinding: platform.isNative ? void 0 : {
          primary: KeyMod.CtrlCmd | KeyCode.KeyC,
          win: {
            primary: KeyMod.CtrlCmd | KeyCode.KeyC,
            secondary: [KeyMod.CtrlCmd | KeyCode.Insert]
          },
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.not(InputFocusedContextKey)
          ),
          weight: KeybindingWeight.WorkbenchContrib
        }
      });
    }
    async runWithContext(accessor, context) {
      runCopyCells(accessor, context.notebookEditor, context.cell);
    }
  }
);
registerAction2(
  class extends NotebookCellAction {
    constructor() {
      super({
        id: CUT_CELL_COMMAND_ID,
        title: localize("notebookActions.cut", "Cut Cell"),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            NOTEBOOK_EDITOR_EDITABLE,
            NOTEBOOK_CELL_EDITABLE
          ),
          group: CellOverflowToolbarGroups.Copy,
          order: 1
        },
        keybinding: platform.isNative ? void 0 : {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.not(InputFocusedContextKey)
          ),
          primary: KeyMod.CtrlCmd | KeyCode.KeyX,
          win: {
            primary: KeyMod.CtrlCmd | KeyCode.KeyX,
            secondary: [KeyMod.Shift | KeyCode.Delete]
          },
          weight: KeybindingWeight.WorkbenchContrib
        }
      });
    }
    async runWithContext(accessor, context) {
      runCutCells(accessor, context.notebookEditor, context.cell);
    }
  }
);
registerAction2(
  class extends NotebookAction {
    constructor() {
      super({
        id: PASTE_CELL_COMMAND_ID,
        title: localize("notebookActions.paste", "Paste Cell"),
        menu: {
          id: MenuId.NotebookCellTitle,
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            NOTEBOOK_EDITOR_EDITABLE
          ),
          group: CellOverflowToolbarGroups.Copy,
          order: 3
        },
        keybinding: platform.isNative ? void 0 : {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.not(InputFocusedContextKey)
          ),
          primary: KeyMod.CtrlCmd | KeyCode.KeyV,
          win: {
            primary: KeyMod.CtrlCmd | KeyCode.KeyV,
            secondary: [KeyMod.Shift | KeyCode.Insert]
          },
          linux: {
            primary: KeyMod.CtrlCmd | KeyCode.KeyV,
            secondary: [KeyMod.Shift | KeyCode.Insert]
          },
          weight: KeybindingWeight.EditorContrib
        }
      });
    }
    async runWithContext(accessor, context) {
      const notebookService = accessor.get(INotebookService);
      const pasteCells = notebookService.getToCopy();
      if (!context.notebookEditor.hasModel() || context.notebookEditor.isReadOnly) {
        return;
      }
      if (!pasteCells) {
        return;
      }
      runPasteCells(context.notebookEditor, context.cell, pasteCells);
    }
  }
);
registerAction2(
  class extends NotebookCellAction {
    constructor() {
      super({
        id: PASTE_CELL_ABOVE_COMMAND_ID,
        title: localize(
          "notebookActions.pasteAbove",
          "Paste Cell Above"
        ),
        keybinding: {
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            ContextKeyExpr.not(InputFocusedContextKey)
          ),
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyV,
          weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
        }
      });
    }
    async runWithContext(accessor, context) {
      const notebookService = accessor.get(INotebookService);
      const pasteCells = notebookService.getToCopy();
      const editor = context.notebookEditor;
      const textModel = editor.textModel;
      if (editor.isReadOnly) {
        return;
      }
      if (!pasteCells) {
        return;
      }
      const originalState = {
        kind: SelectionStateType.Index,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      };
      const currCellIndex = context.notebookEditor.getCellIndex(
        context.cell
      );
      const newFocusIndex = currCellIndex;
      textModel.applyEdits(
        [
          {
            editType: CellEditType.Replace,
            index: currCellIndex,
            count: 0,
            cells: pasteCells.items.map(
              (cell) => cloneNotebookCellTextModel(cell)
            )
          }
        ],
        true,
        originalState,
        () => ({
          kind: SelectionStateType.Index,
          focus: { start: newFocusIndex, end: newFocusIndex + 1 },
          selections: [
            {
              start: newFocusIndex,
              end: newFocusIndex + pasteCells.items.length
            }
          ]
        }),
        void 0,
        true
      );
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.toggleNotebookClipboardLog",
        title: localize2(
          "toggleNotebookClipboardLog",
          "Toggle Notebook Clipboard Troubleshooting"
        ),
        category: Categories.Developer,
        f1: true
      });
    }
    run(accessor) {
      toggleLogging();
      if (_logging) {
        const commandService = accessor.get(ICommandService);
        commandService.executeCommand(showWindowLogActionId);
      }
    }
  }
);
registerAction2(
  class extends NotebookCellAction {
    constructor() {
      super({
        id: "notebook.cell.output.selectAll",
        title: localize("notebook.cell.output.selectAll", "Select All"),
        keybinding: {
          primary: KeyMod.CtrlCmd | KeyCode.KeyA,
          when: ContextKeyExpr.and(
            NOTEBOOK_EDITOR_FOCUSED,
            NOTEBOOK_OUTPUT_FOCUSED
          ),
          weight: NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT
        }
      });
    }
    async runWithContext(accessor, _context) {
      withEditor(accessor, (editor) => {
        if (!editor.hasEditorFocus()) {
          return false;
        }
        if (editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
          return true;
        }
        const cell = editor.getActiveCell();
        if (!cell || !cell.outputIsFocused || !editor.hasWebviewFocus()) {
          return true;
        }
        if (cell.inputInOutputIsFocused) {
          editor.selectInputContents(cell);
        } else {
          editor.selectOutputContent(cell);
        }
        return true;
      });
    }
  }
);
export {
  NotebookClipboardContribution,
  runCopyCells,
  runCutCells,
  runPasteCells
};
//# sourceMappingURL=notebookClipboard.js.map
