var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { ICodeEditorWidgetOptions } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { ContextMenuController } from "../../../../editor/contrib/contextmenu/browser/contextmenu.js";
import { SnippetController2 } from "../../../../editor/contrib/snippet/browser/snippetController2.js";
import { SuggestController } from "../../../../editor/contrib/suggest/browser/suggestController.js";
import { MenuPreventer } from "./menuPreventer.js";
import { SelectionClipboardContributionID } from "./selectionClipboard.js";
import { TabCompletionController } from "../../snippets/browser/tabCompletion.js";
import { EditorExtensionsRegistry } from "../../../../editor/browser/editorExtensions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { selectionBackground, inputBackground, inputForeground, editorSelectionBackground } from "../../../../platform/theme/common/colorRegistry.js";
function getSimpleEditorOptions(configurationService) {
  return {
    wordWrap: "on",
    overviewRulerLanes: 0,
    glyphMargin: false,
    lineNumbers: "off",
    folding: false,
    selectOnLineNumbers: false,
    hideCursorInOverviewRuler: true,
    selectionHighlight: false,
    scrollbar: {
      horizontal: "hidden",
      alwaysConsumeMouseWheel: false
    },
    lineDecorationsWidth: 0,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    renderLineHighlight: "none",
    fixedOverflowWidgets: true,
    acceptSuggestionOnEnter: "smart",
    dragAndDrop: false,
    revealHorizontalRightPadding: 5,
    minimap: {
      enabled: false
    },
    guides: {
      indentation: false
    },
    accessibilitySupport: configurationService.getValue("editor.accessibilitySupport"),
    cursorBlinking: configurationService.getValue("editor.cursorBlinking"),
    experimentalEditContextEnabled: configurationService.getValue("editor.experimentalEditContextEnabled")
  };
}
__name(getSimpleEditorOptions, "getSimpleEditorOptions");
function getSimpleCodeEditorWidgetOptions() {
  return {
    isSimpleWidget: true,
    contributions: EditorExtensionsRegistry.getSomeEditorContributions([
      MenuPreventer.ID,
      SelectionClipboardContributionID,
      ContextMenuController.ID,
      SuggestController.ID,
      SnippetController2.ID,
      TabCompletionController.ID
    ])
  };
}
__name(getSimpleCodeEditorWidgetOptions, "getSimpleCodeEditorWidgetOptions");
function setupSimpleEditorSelectionStyling(editorContainerSelector) {
  return registerThemingParticipant((theme, collector) => {
    const selectionBackgroundColor = theme.getColor(selectionBackground);
    if (selectionBackgroundColor) {
      const inputBackgroundColor = theme.getColor(inputBackground);
      if (inputBackgroundColor) {
        collector.addRule(`${editorContainerSelector} .monaco-editor-background { background-color: ${inputBackgroundColor}; } `);
        collector.addRule(`${editorContainerSelector} .monaco-editor .selected-text { background-color: ${inputBackgroundColor.transparent(0.4)}; }`);
      }
      const inputForegroundColor = theme.getColor(inputForeground);
      if (inputForegroundColor) {
        collector.addRule(`${editorContainerSelector} .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`);
      }
      collector.addRule(`${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`);
    } else {
      collector.addRule(`${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${theme.getColor(editorSelectionBackground)}; }`);
    }
  });
}
__name(setupSimpleEditorSelectionStyling, "setupSimpleEditorSelectionStyling");
export {
  getSimpleCodeEditorWidgetOptions,
  getSimpleEditorOptions,
  setupSimpleEditorSelectionStyling
};
//# sourceMappingURL=simpleEditorOptions.js.map
