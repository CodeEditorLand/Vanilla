var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarshalledId } from "../../../../../base/common/marshallingIds.js";
import { isEqual } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../../nls.js";
import {
  Action2,
  MenuId,
  MenuRegistry
} from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { isEditorCommandsContext } from "../../../../common/editor.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import {
  INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR,
  NOTEBOOK_EDITOR_EDITABLE,
  NOTEBOOK_EDITOR_FOCUSED,
  NOTEBOOK_IS_ACTIVE_EDITOR,
  NOTEBOOK_KERNEL_COUNT,
  NOTEBOOK_KERNEL_SOURCE_COUNT
} from "../../common/notebookContextKeys.js";
import { isICellRange } from "../../common/notebookRange.js";
import {
  cellRangeToViewCells,
  getNotebookEditorFromEditorPane
} from "../notebookBrowser.js";
import { INotebookEditorService } from "../services/notebookEditorService.js";
const SELECT_KERNEL_ID = "_notebook.selectKernel";
const NOTEBOOK_ACTIONS_CATEGORY = localize2(
  "notebookActions.category",
  "Notebook"
);
const CELL_TITLE_CELL_GROUP_ID = "inline/cell";
const CELL_TITLE_OUTPUT_GROUP_ID = "inline/output";
const NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = KeybindingWeight.EditorContrib;
const NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT = KeybindingWeight.WorkbenchContrib + 1;
var CellToolbarOrder = /* @__PURE__ */ ((CellToolbarOrder2) => {
  CellToolbarOrder2[CellToolbarOrder2["EditCell"] = 0] = "EditCell";
  CellToolbarOrder2[CellToolbarOrder2["ExecuteAboveCells"] = 1] = "ExecuteAboveCells";
  CellToolbarOrder2[CellToolbarOrder2["ExecuteCellAndBelow"] = 2] = "ExecuteCellAndBelow";
  CellToolbarOrder2[CellToolbarOrder2["SaveCell"] = 3] = "SaveCell";
  CellToolbarOrder2[CellToolbarOrder2["SplitCell"] = 4] = "SplitCell";
  CellToolbarOrder2[CellToolbarOrder2["ClearCellOutput"] = 5] = "ClearCellOutput";
  return CellToolbarOrder2;
})(CellToolbarOrder || {});
var CellOverflowToolbarGroups = /* @__PURE__ */ ((CellOverflowToolbarGroups2) => {
  CellOverflowToolbarGroups2["Copy"] = "1_copy";
  CellOverflowToolbarGroups2["Insert"] = "2_insert";
  CellOverflowToolbarGroups2["Edit"] = "3_edit";
  CellOverflowToolbarGroups2["Share"] = "4_share";
  return CellOverflowToolbarGroups2;
})(CellOverflowToolbarGroups || {});
function getContextFromActiveEditor(editorService) {
  const editor = getNotebookEditorFromEditorPane(
    editorService.activeEditorPane
  );
  if (!editor || !editor.hasModel()) {
    return;
  }
  const activeCell = editor.getActiveCell();
  const selectedCells = editor.getSelectionViewModels();
  return {
    cell: activeCell,
    selectedCells,
    notebookEditor: editor
  };
}
__name(getContextFromActiveEditor, "getContextFromActiveEditor");
function getWidgetFromUri(accessor, uri) {
  const notebookEditorService = accessor.get(INotebookEditorService);
  const widget = notebookEditorService.listNotebookEditors().find(
    (widget2) => widget2.hasModel() && widget2.textModel.uri.toString() === uri.toString()
  );
  if (widget && widget.hasModel()) {
    return widget;
  }
  return void 0;
}
__name(getWidgetFromUri, "getWidgetFromUri");
function getContextFromUri(accessor, context) {
  const uri = URI.revive(context);
  if (uri) {
    const widget = getWidgetFromUri(accessor, uri);
    if (widget) {
      return {
        notebookEditor: widget
      };
    }
  }
  return void 0;
}
__name(getContextFromUri, "getContextFromUri");
function findTargetCellEditor(context, targetCell) {
  let foundEditor;
  for (const [, codeEditor] of context.notebookEditor.codeEditors) {
    if (isEqual(codeEditor.getModel()?.uri, targetCell.uri)) {
      foundEditor = codeEditor;
      break;
    }
  }
  return foundEditor;
}
__name(findTargetCellEditor, "findTargetCellEditor");
class NotebookAction extends Action2 {
  static {
    __name(this, "NotebookAction");
  }
  constructor(desc) {
    if (desc.f1 !== false) {
      desc.f1 = false;
      const f1Menu = {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.or(
          NOTEBOOK_IS_ACTIVE_EDITOR,
          INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR
        )
      };
      if (!desc.menu) {
        desc.menu = [];
      } else if (!Array.isArray(desc.menu)) {
        desc.menu = [desc.menu];
      }
      desc.menu = [...desc.menu, f1Menu];
    }
    desc.category = NOTEBOOK_ACTIONS_CATEGORY;
    super(desc);
  }
  async run(accessor, context, ...additionalArgs) {
    const isFromUI = !!context;
    const from = isFromUI ? this.isNotebookActionContext(context) ? "notebookToolbar" : "editorToolbar" : void 0;
    if (!this.isNotebookActionContext(context)) {
      context = this.getEditorContextFromArgsOrActive(
        accessor,
        context,
        ...additionalArgs
      );
      if (!context) {
        return;
      }
    }
    if (from !== void 0) {
      const telemetryService = accessor.get(ITelemetryService);
      telemetryService.publicLog2("workbenchActionExecuted", { id: this.desc.id, from });
    }
    return this.runWithContext(accessor, context);
  }
  isNotebookActionContext(context) {
    return !!context && !!context.notebookEditor;
  }
  getEditorContextFromArgsOrActive(accessor, context, ...additionalArgs) {
    return getContextFromActiveEditor(accessor.get(IEditorService));
  }
}
class NotebookMultiCellAction extends Action2 {
  static {
    __name(this, "NotebookMultiCellAction");
  }
  constructor(desc) {
    if (desc.f1 !== false) {
      desc.f1 = false;
      const f1Menu = {
        id: MenuId.CommandPalette,
        when: NOTEBOOK_IS_ACTIVE_EDITOR
      };
      if (!desc.menu) {
        desc.menu = [];
      } else if (!Array.isArray(desc.menu)) {
        desc.menu = [desc.menu];
      }
      desc.menu = [...desc.menu, f1Menu];
    }
    desc.category = NOTEBOOK_ACTIONS_CATEGORY;
    super(desc);
  }
  parseArgs(accessor, ...args) {
    return void 0;
  }
  isCellToolbarContext(context) {
    return !!context && !!context.notebookEditor && context.$mid === MarshalledId.NotebookCellActionContext;
  }
  /**
   * The action/command args are resolved in following order
   * `run(accessor, cellToolbarContext)` from cell toolbar
   * `run(accessor, ...args)` from command service with arguments
   * `run(accessor, undefined)` from keyboard shortcuts, command palatte, etc
   */
  async run(accessor, ...additionalArgs) {
    const context = additionalArgs[0];
    const isFromCellToolbar = this.isCellToolbarContext(context);
    const isFromEditorToolbar = isEditorCommandsContext(context);
    const from = isFromCellToolbar ? "cellToolbar" : isFromEditorToolbar ? "editorToolbar" : "other";
    const telemetryService = accessor.get(ITelemetryService);
    if (isFromCellToolbar) {
      telemetryService.publicLog2("workbenchActionExecuted", { id: this.desc.id, from });
      return this.runWithContext(accessor, context);
    }
    const parsedArgs = this.parseArgs(accessor, ...additionalArgs);
    if (parsedArgs) {
      telemetryService.publicLog2("workbenchActionExecuted", { id: this.desc.id, from });
      return this.runWithContext(accessor, parsedArgs);
    }
    const editor = getEditorFromArgsOrActivePane(accessor);
    if (editor) {
      const selectedCellRange = editor.getSelections().length === 0 ? [editor.getFocus()] : editor.getSelections();
      telemetryService.publicLog2("workbenchActionExecuted", { id: this.desc.id, from });
      return this.runWithContext(accessor, {
        ui: false,
        notebookEditor: editor,
        selectedCells: cellRangeToViewCells(editor, selectedCellRange)
      });
    }
  }
}
class NotebookCellAction extends NotebookAction {
  static {
    __name(this, "NotebookCellAction");
  }
  isCellActionContext(context) {
    return !!context && !!context.notebookEditor && !!context.cell;
  }
  getCellContextFromArgs(accessor, context, ...additionalArgs) {
    return void 0;
  }
  async run(accessor, context, ...additionalArgs) {
    if (this.isCellActionContext(context)) {
      const telemetryService = accessor.get(ITelemetryService);
      telemetryService.publicLog2("workbenchActionExecuted", {
        id: this.desc.id,
        from: "cellToolbar"
      });
      return this.runWithContext(accessor, context);
    }
    const contextFromArgs = this.getCellContextFromArgs(
      accessor,
      context,
      ...additionalArgs
    );
    if (contextFromArgs) {
      return this.runWithContext(accessor, contextFromArgs);
    }
    const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
    if (this.isCellActionContext(activeEditorContext)) {
      return this.runWithContext(accessor, activeEditorContext);
    }
  }
}
const executeNotebookCondition = ContextKeyExpr.or(
  ContextKeyExpr.greater(NOTEBOOK_KERNEL_COUNT.key, 0),
  ContextKeyExpr.greater(NOTEBOOK_KERNEL_SOURCE_COUNT.key, 0)
);
function isMultiCellArgs(arg) {
  if (arg === void 0) {
    return false;
  }
  const ranges = arg.ranges;
  if (!ranges) {
    return false;
  }
  if (!Array.isArray(ranges) || ranges.some((range) => !isICellRange(range))) {
    return false;
  }
  if (arg.document) {
    const uri = URI.revive(arg.document);
    if (!uri) {
      return false;
    }
  }
  return true;
}
__name(isMultiCellArgs, "isMultiCellArgs");
function getEditorFromArgsOrActivePane(accessor, context) {
  const editorFromUri = getContextFromUri(accessor, context)?.notebookEditor;
  if (editorFromUri) {
    return editorFromUri;
  }
  const editor = getNotebookEditorFromEditorPane(
    accessor.get(IEditorService).activeEditorPane
  );
  if (!editor || !editor.hasModel()) {
    return;
  }
  return editor;
}
__name(getEditorFromArgsOrActivePane, "getEditorFromArgsOrActivePane");
function parseMultiCellExecutionArgs(accessor, ...args) {
  const firstArg = args[0];
  if (isMultiCellArgs(firstArg)) {
    const editor = getEditorFromArgsOrActivePane(
      accessor,
      firstArg.document
    );
    if (!editor) {
      return;
    }
    const ranges = firstArg.ranges;
    const selectedCells = ranges.flatMap(
      (range) => editor.getCellsInRange(range).slice(0)
    );
    const autoReveal = firstArg.autoReveal;
    return {
      ui: false,
      notebookEditor: editor,
      selectedCells,
      autoReveal
    };
  }
  if (isICellRange(firstArg)) {
    const secondArg = args[1];
    const editor = getEditorFromArgsOrActivePane(accessor, secondArg);
    if (!editor) {
      return;
    }
    return {
      ui: false,
      notebookEditor: editor,
      selectedCells: editor.getCellsInRange(firstArg)
    };
  }
  const context = getContextFromActiveEditor(accessor.get(IEditorService));
  return context ? {
    ui: false,
    notebookEditor: context.notebookEditor,
    selectedCells: context.selectedCells ?? [],
    cell: context.cell
  } : void 0;
}
__name(parseMultiCellExecutionArgs, "parseMultiCellExecutionArgs");
const cellExecutionArgs = [
  {
    isOptional: true,
    name: "options",
    description: "The cell range options",
    schema: {
      type: "object",
      required: ["ranges"],
      properties: {
        ranges: {
          type: "array",
          items: [
            {
              type: "object",
              required: ["start", "end"],
              properties: {
                start: {
                  type: "number"
                },
                end: {
                  type: "number"
                }
              }
            }
          ]
        },
        document: {
          type: "object",
          description: "The document uri"
        },
        autoReveal: {
          type: "boolean",
          description: "Whether the cell should be revealed into view automatically"
        }
      }
    }
  }
];
MenuRegistry.appendMenuItem(MenuId.NotebookCellTitle, {
  submenu: MenuId.NotebookCellInsert,
  title: localize("notebookMenu.insertCell", "Insert Cell"),
  group: "2_insert" /* Insert */,
  when: NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
});
MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  submenu: MenuId.NotebookCellTitle,
  title: localize("notebookMenu.cellTitle", "Notebook Cell"),
  group: "2_insert" /* Insert */,
  when: NOTEBOOK_EDITOR_FOCUSED
});
MenuRegistry.appendMenuItem(MenuId.NotebookCellTitle, {
  title: localize("miShare", "Share"),
  submenu: MenuId.EditorContextShare,
  group: "4_share" /* Share */
});
export {
  CELL_TITLE_CELL_GROUP_ID,
  CELL_TITLE_OUTPUT_GROUP_ID,
  CellOverflowToolbarGroups,
  CellToolbarOrder,
  NOTEBOOK_ACTIONS_CATEGORY,
  NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT,
  NOTEBOOK_OUTPUT_WEBVIEW_ACTION_WEIGHT,
  NotebookAction,
  NotebookCellAction,
  NotebookMultiCellAction,
  SELECT_KERNEL_ID,
  cellExecutionArgs,
  executeNotebookCondition,
  findTargetCellEditor,
  getContextFromActiveEditor,
  getContextFromUri,
  getEditorFromArgsOrActivePane,
  parseMultiCellExecutionArgs
};
//# sourceMappingURL=coreActions.js.map
