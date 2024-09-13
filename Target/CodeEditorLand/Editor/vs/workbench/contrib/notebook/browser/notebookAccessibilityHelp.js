var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { NOTEBOOK_EDITOR_FOCUSED } from "../common/notebookContextKeys.js";
import { localize } from "../../../../nls.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { AccessibleViewProviderId, AccessibleViewType, AccessibleContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IVisibleEditorPane } from "../../../common/editor.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
class NotebookAccessibilityHelp {
  static {
    __name(this, "NotebookAccessibilityHelp");
  }
  priority = 105;
  name = "notebook";
  when = NOTEBOOK_EDITOR_FOCUSED;
  type = AccessibleViewType.Help;
  getProvider(accessor) {
    const activeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor() || accessor.get(ICodeEditorService).getFocusedCodeEditor() || accessor.get(IEditorService).activeEditorPane;
    if (!activeEditor) {
      return;
    }
    return getAccessibilityHelpProvider(accessor, activeEditor);
  }
}
function getAccessibilityHelpText() {
  return [
    localize("notebook.overview", "The notebook view is a collection of code and markdown cells. Code cells can be executed and will produce output directly below the cell."),
    localize("notebook.cell.edit", "The Edit Cell command{0} will focus on the cell input.", "<keybinding:notebook.cell.edit>"),
    localize("notebook.cell.quitEdit", "The Quit Edit command{0} will set focus on the cell container. The default (Escape) key may need to be pressed twice first exit the virtual cursor if active.", "<keybinding:notebook.cell.quitEdit>"),
    localize("notebook.cell.focusInOutput", "The Focus Output command{0} will set focus in the cell's output.", "<keybinding:notebook.cell.focusInOutput>"),
    localize("notebook.focusNextEditor", "The Focus Next Cell Editor command{0} will set focus in the next cell's editor.", "<keybinding:notebook.focusNextEditor>"),
    localize("notebook.focusPreviousEditor", "The Focus Previous Cell Editor command{0} will set focus in the previous cell's editor.", "<keybinding:notebook.focusPreviousEditor>"),
    localize("notebook.cellNavigation", "The up and down arrows will also move focus between cells while focused on the outer cell container."),
    localize("notebook.cell.executeAndFocusContainer", "The Execute Cell command{0} executes the cell that currently has focus.", "<keybinding:notebook.cell.executeAndFocusContainer>"),
    localize("notebook.cell.insertCodeCellBelowAndFocusContainer", "The Insert Cell Above{0} and Below{1} commands will create new empty code cells.", "<keybinding:notebook.cell.insertCodeCellAbove>", "<keybinding:notebook.cell.insertCodeCellBelow>"),
    localize("notebook.changeCellType", "The Change Cell to Code/Markdown commands are used to switch between cell types.")
  ].join("\n");
}
__name(getAccessibilityHelpText, "getAccessibilityHelpText");
function getAccessibilityHelpProvider(accessor, editor) {
  const helpText = getAccessibilityHelpText();
  return new AccessibleContentProvider(
    AccessibleViewProviderId.Notebook,
    { type: AccessibleViewType.Help },
    () => helpText,
    () => editor.focus(),
    AccessibilityVerbositySettingId.Notebook
  );
}
__name(getAccessibilityHelpProvider, "getAccessibilityHelpProvider");
export {
  NotebookAccessibilityHelp,
  getAccessibilityHelpProvider,
  getAccessibilityHelpText
};
//# sourceMappingURL=notebookAccessibilityHelp.js.map
