var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../../nls.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { IBulkEditService, ResourceTextEdit } from "../../../../../editor/browser/services/bulkEditService.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { INotebookEditorService } from "../services/notebookEditorService.js";
import { NotebookSetting } from "../../common/notebookCommon.js";
import { isNotebookEditorInput } from "../../common/notebookEditorInput.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
class NotebookIndentUsingTabs extends Action2 {
  static {
    __name(this, "NotebookIndentUsingTabs");
  }
  static ID = "notebook.action.indentUsingTabs";
  constructor() {
    super({
      id: NotebookIndentUsingTabs.ID,
      title: nls.localize("indentUsingTabs", "Indent Using Tabs"),
      precondition: void 0
    });
  }
  run(accessor, ...args) {
    changeNotebookIndentation(accessor, false, false);
  }
}
class NotebookIndentUsingSpaces extends Action2 {
  static {
    __name(this, "NotebookIndentUsingSpaces");
  }
  static ID = "notebook.action.indentUsingSpaces";
  constructor() {
    super({
      id: NotebookIndentUsingSpaces.ID,
      title: nls.localize("indentUsingSpaces", "Indent Using Spaces"),
      precondition: void 0
    });
  }
  run(accessor, ...args) {
    changeNotebookIndentation(accessor, true, false);
  }
}
class NotebookChangeTabDisplaySize extends Action2 {
  static {
    __name(this, "NotebookChangeTabDisplaySize");
  }
  static ID = "notebook.action.changeTabDisplaySize";
  constructor() {
    super({
      id: NotebookChangeTabDisplaySize.ID,
      title: nls.localize("changeTabDisplaySize", "Change Tab Display Size"),
      precondition: void 0
    });
  }
  run(accessor, ...args) {
    changeNotebookIndentation(accessor, true, true);
  }
}
class NotebookIndentationToSpacesAction extends Action2 {
  static {
    __name(this, "NotebookIndentationToSpacesAction");
  }
  static ID = "notebook.action.convertIndentationToSpaces";
  constructor() {
    super({
      id: NotebookIndentationToSpacesAction.ID,
      title: nls.localize("convertIndentationToSpaces", "Convert Indentation to Spaces"),
      precondition: void 0
    });
  }
  run(accessor, ...args) {
    convertNotebookIndentation(accessor, true);
  }
}
class NotebookIndentationToTabsAction extends Action2 {
  static {
    __name(this, "NotebookIndentationToTabsAction");
  }
  static ID = "notebook.action.convertIndentationToTabs";
  constructor() {
    super({
      id: NotebookIndentationToTabsAction.ID,
      title: nls.localize("convertIndentationToTabs", "Convert Indentation to Tabs"),
      precondition: void 0
    });
  }
  run(accessor, ...args) {
    convertNotebookIndentation(accessor, false);
  }
}
function changeNotebookIndentation(accessor, insertSpaces, displaySizeOnly) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const notebookEditorService = accessor.get(INotebookEditorService);
  const quickInputService = accessor.get(IQuickInputService);
  const activeInput = editorService.activeEditorPane?.input;
  const isNotebook = isNotebookEditorInput(activeInput);
  if (!isNotebook) {
    return;
  }
  const notebookEditor = notebookEditorService.retrieveExistingWidgetFromURI(activeInput.resource)?.value;
  if (!notebookEditor) {
    return;
  }
  const picks = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
    id: n.toString(),
    label: n.toString()
  }));
  const initialConfig = configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations);
  const initialInsertSpaces = initialConfig["editor.insertSpaces"];
  delete initialConfig["editor.indentSize"];
  delete initialConfig["editor.tabSize"];
  delete initialConfig["editor.insertSpaces"];
  setTimeout(
    () => {
      quickInputService.pick(picks, { placeHolder: nls.localize({ key: "selectTabWidth", comment: ["Tab corresponds to the tab key"] }, "Select Tab Size for Current File") }).then((pick) => {
        if (pick) {
          const pickedVal = parseInt(pick.label, 10);
          if (displaySizeOnly) {
            configurationService.updateValue(NotebookSetting.cellEditorOptionsCustomizations, {
              ...initialConfig,
              "editor.tabSize": pickedVal,
              "editor.indentSize": pickedVal,
              "editor.insertSpaces": initialInsertSpaces
            });
          } else {
            configurationService.updateValue(NotebookSetting.cellEditorOptionsCustomizations, {
              ...initialConfig,
              "editor.tabSize": pickedVal,
              "editor.indentSize": pickedVal,
              "editor.insertSpaces": insertSpaces
            });
          }
        }
      });
    },
    50
    /* quick input is sensitive to being opened so soon after another */
  );
}
__name(changeNotebookIndentation, "changeNotebookIndentation");
function convertNotebookIndentation(accessor, tabsToSpaces) {
  const editorService = accessor.get(IEditorService);
  const configurationService = accessor.get(IConfigurationService);
  const logService = accessor.get(ILogService);
  const textModelService = accessor.get(ITextModelService);
  const notebookEditorService = accessor.get(INotebookEditorService);
  const bulkEditService = accessor.get(IBulkEditService);
  const activeInput = editorService.activeEditorPane?.input;
  const isNotebook = isNotebookEditorInput(activeInput);
  if (!isNotebook) {
    return;
  }
  const notebookTextModel = notebookEditorService.retrieveExistingWidgetFromURI(activeInput.resource)?.value?.textModel;
  if (!notebookTextModel) {
    return;
  }
  const disposable = new DisposableStore();
  try {
    Promise.all(notebookTextModel.cells.map(async (cell) => {
      const ref = await textModelService.createModelReference(cell.uri);
      disposable.add(ref);
      const textEditorModel = ref.object.textEditorModel;
      const modelOpts = cell.textModel?.getOptions();
      if (!modelOpts) {
        return;
      }
      const edits = getIndentationEditOperations(textEditorModel, modelOpts.tabSize, tabsToSpaces);
      bulkEditService.apply(edits, { label: nls.localize("convertIndentation", "Convert Indentation"), code: "undoredo.convertIndentation" });
    })).then(() => {
      const initialConfig = configurationService.getValue(NotebookSetting.cellEditorOptionsCustomizations);
      const initialIndentSize = initialConfig["editor.indentSize"];
      const initialTabSize = initialConfig["editor.tabSize"];
      delete initialConfig["editor.indentSize"];
      delete initialConfig["editor.tabSize"];
      delete initialConfig["editor.insertSpaces"];
      configurationService.updateValue(NotebookSetting.cellEditorOptionsCustomizations, {
        ...initialConfig,
        "editor.tabSize": initialTabSize,
        "editor.indentSize": initialIndentSize,
        "editor.insertSpaces": tabsToSpaces
      });
      disposable.dispose();
    });
  } catch {
    logService.error("Failed to convert indentation to spaces for notebook cells.");
  }
}
__name(convertNotebookIndentation, "convertNotebookIndentation");
function getIndentationEditOperations(model, tabSize, tabsToSpaces) {
  if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
    return [];
  }
  let spaces = "";
  for (let i = 0; i < tabSize; i++) {
    spaces += " ";
  }
  const spacesRegExp = new RegExp(spaces, "gi");
  const edits = [];
  for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
    let lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
    if (lastIndentationColumn === 0) {
      lastIndentationColumn = model.getLineMaxColumn(lineNumber);
    }
    if (lastIndentationColumn === 1) {
      continue;
    }
    const originalIndentationRange = new Range(lineNumber, 1, lineNumber, lastIndentationColumn);
    const originalIndentation = model.getValueInRange(originalIndentationRange);
    const newIndentation = tabsToSpaces ? originalIndentation.replace(/\t/ig, spaces) : originalIndentation.replace(spacesRegExp, "	");
    edits.push(new ResourceTextEdit(model.uri, { range: originalIndentationRange, text: newIndentation }));
  }
  return edits;
}
__name(getIndentationEditOperations, "getIndentationEditOperations");
registerAction2(NotebookIndentUsingSpaces);
registerAction2(NotebookIndentUsingTabs);
registerAction2(NotebookChangeTabDisplaySize);
registerAction2(NotebookIndentationToSpacesAction);
registerAction2(NotebookIndentationToTabsAction);
export {
  NotebookChangeTabDisplaySize,
  NotebookIndentUsingSpaces,
  NotebookIndentUsingTabs,
  NotebookIndentationToSpacesAction,
  NotebookIndentationToTabsAction
};
//# sourceMappingURL=notebookIndentationActions.js.map
