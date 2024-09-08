import {
  AccessibleContentProvider,
  AccessibleViewProviderId,
  AccessibleViewType
} from "../../../../platform/accessibility/browser/accessibleView.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { NOTEBOOK_OUTPUT_FOCUSED } from "../common/notebookContextKeys.js";
import { getNotebookEditorFromEditorPane } from "./notebookBrowser.js";
class NotebookAccessibleView {
  priority = 100;
  name = "notebook";
  type = AccessibleViewType.View;
  when = ContextKeyExpr.and(
    NOTEBOOK_OUTPUT_FOCUSED,
    ContextKeyExpr.equals("resourceExtname", ".ipynb")
  );
  getProvider(accessor) {
    const editorService = accessor.get(IEditorService);
    return getAccessibleOutputProvider(editorService);
  }
}
function getAccessibleOutputProvider(editorService) {
  const activePane = editorService.activeEditorPane;
  const notebookEditor = getNotebookEditorFromEditorPane(activePane);
  const notebookViewModel = notebookEditor?.getViewModel();
  const selections = notebookViewModel?.getSelections();
  const notebookDocument = notebookViewModel?.notebookDocument;
  if (!selections || !notebookDocument || !notebookEditor?.textModel) {
    return;
  }
  const viewCell = notebookViewModel.viewCells[selections[0].start];
  let outputContent = "";
  const decoder = new TextDecoder();
  for (let i = 0; i < viewCell.outputsViewModels.length; i++) {
    const outputViewModel = viewCell.outputsViewModels[i];
    const outputTextModel = viewCell.model.outputs[i];
    const [mimeTypes, pick] = outputViewModel.resolveMimeTypes(
      notebookEditor.textModel,
      void 0
    );
    const mimeType = mimeTypes[pick].mimeType;
    let buffer = outputTextModel.outputs.find(
      (output) => output.mime === mimeType
    );
    if (!buffer || mimeType.startsWith("image")) {
      buffer = outputTextModel.outputs.find(
        (output) => !output.mime.startsWith("image")
      );
    }
    let text = `${mimeType}`;
    if (buffer) {
      const charLimit = 1e5;
      text = decoder.decode(buffer.data.slice(0, charLimit).buffer);
      if (buffer.data.byteLength > charLimit) {
        text = text + "...(truncated)";
      }
      if (mimeType.endsWith("error")) {
        text = text.replace(/\\u001b\[[0-9;]*m/gi, "").replaceAll("\\n", "\n");
      }
    }
    const index = viewCell.outputsViewModels.length > 1 ? `Cell output ${i + 1} of ${viewCell.outputsViewModels.length}
` : "";
    outputContent = outputContent.concat(`${index}${text}
`);
  }
  if (!outputContent) {
    return;
  }
  return new AccessibleContentProvider(
    AccessibleViewProviderId.Notebook,
    { type: AccessibleViewType.View },
    () => {
      return outputContent;
    },
    () => {
      notebookEditor?.setFocus(selections[0]);
      activePane?.focus();
    },
    AccessibilityVerbositySettingId.Notebook
  );
}
export {
  NotebookAccessibleView,
  getAccessibleOutputProvider
};
