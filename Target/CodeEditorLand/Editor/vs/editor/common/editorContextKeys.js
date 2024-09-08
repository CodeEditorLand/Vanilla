import * as nls from "../../nls.js";
import { RawContextKey } from "../../platform/contextkey/common/contextkey.js";
var EditorContextKeys;
((EditorContextKeys2) => {
  EditorContextKeys2.editorSimpleInput = new RawContextKey(
    "editorSimpleInput",
    false,
    true
  );
  EditorContextKeys2.editorTextFocus = new RawContextKey(
    "editorTextFocus",
    false,
    nls.localize(
      "editorTextFocus",
      "Whether the editor text has focus (cursor is blinking)"
    )
  );
  EditorContextKeys2.focus = new RawContextKey(
    "editorFocus",
    false,
    nls.localize(
      "editorFocus",
      "Whether the editor or an editor widget has focus (e.g. focus is in the find widget)"
    )
  );
  EditorContextKeys2.textInputFocus = new RawContextKey(
    "textInputFocus",
    false,
    nls.localize(
      "textInputFocus",
      "Whether an editor or a rich text input has focus (cursor is blinking)"
    )
  );
  EditorContextKeys2.readOnly = new RawContextKey(
    "editorReadonly",
    false,
    nls.localize("editorReadonly", "Whether the editor is read-only")
  );
  EditorContextKeys2.inDiffEditor = new RawContextKey(
    "inDiffEditor",
    false,
    nls.localize("inDiffEditor", "Whether the context is a diff editor")
  );
  EditorContextKeys2.isEmbeddedDiffEditor = new RawContextKey(
    "isEmbeddedDiffEditor",
    false,
    nls.localize(
      "isEmbeddedDiffEditor",
      "Whether the context is an embedded diff editor"
    )
  );
  EditorContextKeys2.multiDiffEditorAllCollapsed = new RawContextKey(
    "multiDiffEditorAllCollapsed",
    void 0,
    nls.localize(
      "multiDiffEditorAllCollapsed",
      "Whether all files in multi diff editor are collapsed"
    )
  );
  EditorContextKeys2.hasChanges = new RawContextKey(
    "diffEditorHasChanges",
    false,
    nls.localize(
      "diffEditorHasChanges",
      "Whether the diff editor has changes"
    )
  );
  EditorContextKeys2.comparingMovedCode = new RawContextKey(
    "comparingMovedCode",
    false,
    nls.localize(
      "comparingMovedCode",
      "Whether a moved code block is selected for comparison"
    )
  );
  EditorContextKeys2.accessibleDiffViewerVisible = new RawContextKey(
    "accessibleDiffViewerVisible",
    false,
    nls.localize(
      "accessibleDiffViewerVisible",
      "Whether the accessible diff viewer is visible"
    )
  );
  EditorContextKeys2.diffEditorRenderSideBySideInlineBreakpointReached = new RawContextKey(
    "diffEditorRenderSideBySideInlineBreakpointReached",
    false,
    nls.localize(
      "diffEditorRenderSideBySideInlineBreakpointReached",
      "Whether the diff editor render side by side inline breakpoint is reached"
    )
  );
  EditorContextKeys2.diffEditorInlineMode = new RawContextKey(
    "diffEditorInlineMode",
    false,
    nls.localize("diffEditorInlineMode", "Whether inline mode is active")
  );
  EditorContextKeys2.diffEditorOriginalWritable = new RawContextKey(
    "diffEditorOriginalWritable",
    false,
    nls.localize(
      "diffEditorOriginalWritable",
      "Whether modified is writable in the diff editor"
    )
  );
  EditorContextKeys2.diffEditorModifiedWritable = new RawContextKey(
    "diffEditorModifiedWritable",
    false,
    nls.localize(
      "diffEditorModifiedWritable",
      "Whether modified is writable in the diff editor"
    )
  );
  EditorContextKeys2.diffEditorOriginalUri = new RawContextKey(
    "diffEditorOriginalUri",
    "",
    nls.localize(
      "diffEditorOriginalUri",
      "The uri of the original document"
    )
  );
  EditorContextKeys2.diffEditorModifiedUri = new RawContextKey(
    "diffEditorModifiedUri",
    "",
    nls.localize(
      "diffEditorModifiedUri",
      "The uri of the modified document"
    )
  );
  EditorContextKeys2.columnSelection = new RawContextKey(
    "editorColumnSelection",
    false,
    nls.localize(
      "editorColumnSelection",
      "Whether `editor.columnSelection` is enabled"
    )
  );
  EditorContextKeys2.writable = EditorContextKeys2.readOnly.toNegated();
  EditorContextKeys2.hasNonEmptySelection = new RawContextKey(
    "editorHasSelection",
    false,
    nls.localize(
      "editorHasSelection",
      "Whether the editor has text selected"
    )
  );
  EditorContextKeys2.hasOnlyEmptySelection = EditorContextKeys2.hasNonEmptySelection.toNegated();
  EditorContextKeys2.hasMultipleSelections = new RawContextKey(
    "editorHasMultipleSelections",
    false,
    nls.localize(
      "editorHasMultipleSelections",
      "Whether the editor has multiple selections"
    )
  );
  EditorContextKeys2.hasSingleSelection = EditorContextKeys2.hasMultipleSelections.toNegated();
  EditorContextKeys2.tabMovesFocus = new RawContextKey(
    "editorTabMovesFocus",
    false,
    nls.localize(
      "editorTabMovesFocus",
      "Whether `Tab` will move focus out of the editor"
    )
  );
  EditorContextKeys2.tabDoesNotMoveFocus = EditorContextKeys2.tabMovesFocus.toNegated();
  EditorContextKeys2.isInEmbeddedEditor = new RawContextKey(
    "isInEmbeddedEditor",
    false,
    true
  );
  EditorContextKeys2.canUndo = new RawContextKey("canUndo", false, true);
  EditorContextKeys2.canRedo = new RawContextKey("canRedo", false, true);
  EditorContextKeys2.hoverVisible = new RawContextKey(
    "editorHoverVisible",
    false,
    nls.localize(
      "editorHoverVisible",
      "Whether the editor hover is visible"
    )
  );
  EditorContextKeys2.hoverFocused = new RawContextKey(
    "editorHoverFocused",
    false,
    nls.localize(
      "editorHoverFocused",
      "Whether the editor hover is focused"
    )
  );
  EditorContextKeys2.stickyScrollFocused = new RawContextKey(
    "stickyScrollFocused",
    false,
    nls.localize(
      "stickyScrollFocused",
      "Whether the sticky scroll is focused"
    )
  );
  EditorContextKeys2.stickyScrollVisible = new RawContextKey(
    "stickyScrollVisible",
    false,
    nls.localize(
      "stickyScrollVisible",
      "Whether the sticky scroll is visible"
    )
  );
  EditorContextKeys2.standaloneColorPickerVisible = new RawContextKey(
    "standaloneColorPickerVisible",
    false,
    nls.localize(
      "standaloneColorPickerVisible",
      "Whether the standalone color picker is visible"
    )
  );
  EditorContextKeys2.standaloneColorPickerFocused = new RawContextKey(
    "standaloneColorPickerFocused",
    false,
    nls.localize(
      "standaloneColorPickerFocused",
      "Whether the standalone color picker is focused"
    )
  );
  EditorContextKeys2.inCompositeEditor = new RawContextKey(
    "inCompositeEditor",
    void 0,
    nls.localize(
      "inCompositeEditor",
      "Whether the editor is part of a larger editor (e.g. notebooks)"
    )
  );
  EditorContextKeys2.notInCompositeEditor = EditorContextKeys2.inCompositeEditor.toNegated();
  EditorContextKeys2.languageId = new RawContextKey(
    "editorLangId",
    "",
    nls.localize("editorLangId", "The language identifier of the editor")
  );
  EditorContextKeys2.hasCompletionItemProvider = new RawContextKey(
    "editorHasCompletionItemProvider",
    false,
    nls.localize(
      "editorHasCompletionItemProvider",
      "Whether the editor has a completion item provider"
    )
  );
  EditorContextKeys2.hasCodeActionsProvider = new RawContextKey(
    "editorHasCodeActionsProvider",
    false,
    nls.localize(
      "editorHasCodeActionsProvider",
      "Whether the editor has a code actions provider"
    )
  );
  EditorContextKeys2.hasCodeLensProvider = new RawContextKey(
    "editorHasCodeLensProvider",
    false,
    nls.localize(
      "editorHasCodeLensProvider",
      "Whether the editor has a code lens provider"
    )
  );
  EditorContextKeys2.hasDefinitionProvider = new RawContextKey(
    "editorHasDefinitionProvider",
    false,
    nls.localize(
      "editorHasDefinitionProvider",
      "Whether the editor has a definition provider"
    )
  );
  EditorContextKeys2.hasDeclarationProvider = new RawContextKey(
    "editorHasDeclarationProvider",
    false,
    nls.localize(
      "editorHasDeclarationProvider",
      "Whether the editor has a declaration provider"
    )
  );
  EditorContextKeys2.hasImplementationProvider = new RawContextKey(
    "editorHasImplementationProvider",
    false,
    nls.localize(
      "editorHasImplementationProvider",
      "Whether the editor has an implementation provider"
    )
  );
  EditorContextKeys2.hasTypeDefinitionProvider = new RawContextKey(
    "editorHasTypeDefinitionProvider",
    false,
    nls.localize(
      "editorHasTypeDefinitionProvider",
      "Whether the editor has a type definition provider"
    )
  );
  EditorContextKeys2.hasHoverProvider = new RawContextKey(
    "editorHasHoverProvider",
    false,
    nls.localize(
      "editorHasHoverProvider",
      "Whether the editor has a hover provider"
    )
  );
  EditorContextKeys2.hasDocumentHighlightProvider = new RawContextKey(
    "editorHasDocumentHighlightProvider",
    false,
    nls.localize(
      "editorHasDocumentHighlightProvider",
      "Whether the editor has a document highlight provider"
    )
  );
  EditorContextKeys2.hasDocumentSymbolProvider = new RawContextKey(
    "editorHasDocumentSymbolProvider",
    false,
    nls.localize(
      "editorHasDocumentSymbolProvider",
      "Whether the editor has a document symbol provider"
    )
  );
  EditorContextKeys2.hasReferenceProvider = new RawContextKey(
    "editorHasReferenceProvider",
    false,
    nls.localize(
      "editorHasReferenceProvider",
      "Whether the editor has a reference provider"
    )
  );
  EditorContextKeys2.hasRenameProvider = new RawContextKey(
    "editorHasRenameProvider",
    false,
    nls.localize(
      "editorHasRenameProvider",
      "Whether the editor has a rename provider"
    )
  );
  EditorContextKeys2.hasSignatureHelpProvider = new RawContextKey(
    "editorHasSignatureHelpProvider",
    false,
    nls.localize(
      "editorHasSignatureHelpProvider",
      "Whether the editor has a signature help provider"
    )
  );
  EditorContextKeys2.hasInlayHintsProvider = new RawContextKey(
    "editorHasInlayHintsProvider",
    false,
    nls.localize(
      "editorHasInlayHintsProvider",
      "Whether the editor has an inline hints provider"
    )
  );
  EditorContextKeys2.hasDocumentFormattingProvider = new RawContextKey(
    "editorHasDocumentFormattingProvider",
    false,
    nls.localize(
      "editorHasDocumentFormattingProvider",
      "Whether the editor has a document formatting provider"
    )
  );
  EditorContextKeys2.hasDocumentSelectionFormattingProvider = new RawContextKey(
    "editorHasDocumentSelectionFormattingProvider",
    false,
    nls.localize(
      "editorHasDocumentSelectionFormattingProvider",
      "Whether the editor has a document selection formatting provider"
    )
  );
  EditorContextKeys2.hasMultipleDocumentFormattingProvider = new RawContextKey(
    "editorHasMultipleDocumentFormattingProvider",
    false,
    nls.localize(
      "editorHasMultipleDocumentFormattingProvider",
      "Whether the editor has multiple document formatting providers"
    )
  );
  EditorContextKeys2.hasMultipleDocumentSelectionFormattingProvider = new RawContextKey(
    "editorHasMultipleDocumentSelectionFormattingProvider",
    false,
    nls.localize(
      "editorHasMultipleDocumentSelectionFormattingProvider",
      "Whether the editor has multiple document selection formatting providers"
    )
  );
})(EditorContextKeys || (EditorContextKeys = {}));
export {
  EditorContextKeys
};
