export declare namespace EditorContextKeys {
    const editorSimpleInput: any;
    /**
     * A context key that is set when the editor's text has focus (cursor is blinking).
     * Is false when focus is in simple editor widgets (repl input, scm commit input).
     */
    const editorTextFocus: any;
    /**
     * A context key that is set when the editor's text or an editor's widget has focus.
     */
    const focus: any;
    /**
     * A context key that is set when any editor input has focus (regular editor, repl input...).
     */
    const textInputFocus: any;
    const readOnly: any;
    const inDiffEditor: any;
    const isEmbeddedDiffEditor: any;
    const inMultiDiffEditor: any;
    const multiDiffEditorAllCollapsed: any;
    const hasChanges: any;
    const comparingMovedCode: any;
    const accessibleDiffViewerVisible: any;
    const diffEditorRenderSideBySideInlineBreakpointReached: any;
    const diffEditorInlineMode: any;
    const diffEditorOriginalWritable: any;
    const diffEditorModifiedWritable: any;
    const diffEditorOriginalUri: any;
    const diffEditorModifiedUri: any;
    const columnSelection: any;
    const writable: any;
    const hasNonEmptySelection: any;
    const hasOnlyEmptySelection: any;
    const hasMultipleSelections: any;
    const hasSingleSelection: any;
    const tabMovesFocus: any;
    const tabDoesNotMoveFocus: any;
    const isInEmbeddedEditor: any;
    const canUndo: any;
    const canRedo: any;
    const hoverVisible: any;
    const hoverFocused: any;
    const stickyScrollFocused: any;
    const stickyScrollVisible: any;
    const standaloneColorPickerVisible: any;
    const standaloneColorPickerFocused: any;
    /**
     * A context key that is set when an editor is part of a larger editor, like notebooks or
     * (future) a diff editor
     */
    const inCompositeEditor: any;
    const notInCompositeEditor: any;
    const languageId: any;
    const hasCompletionItemProvider: any;
    const hasCodeActionsProvider: any;
    const hasCodeLensProvider: any;
    const hasDefinitionProvider: any;
    const hasDeclarationProvider: any;
    const hasImplementationProvider: any;
    const hasTypeDefinitionProvider: any;
    const hasHoverProvider: any;
    const hasDocumentHighlightProvider: any;
    const hasDocumentSymbolProvider: any;
    const hasReferenceProvider: any;
    const hasRenameProvider: any;
    const hasSignatureHelpProvider: any;
    const hasInlayHintsProvider: any;
    const hasDocumentFormattingProvider: any;
    const hasDocumentSelectionFormattingProvider: any;
    const hasMultipleDocumentFormattingProvider: any;
    const hasMultipleDocumentSelectionFormattingProvider: any;
}
