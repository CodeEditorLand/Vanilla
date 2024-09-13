var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const fixedEditorPaddingSingleLineCells = {
  top: 24,
  bottom: 24
};
const fixedEditorPadding = {
  top: 12,
  bottom: 12
};
function getEditorPadding(lineCount) {
  return lineCount === 1 ? fixedEditorPaddingSingleLineCells : fixedEditorPadding;
}
__name(getEditorPadding, "getEditorPadding");
const fixedEditorOptions = {
  padding: fixedEditorPadding,
  scrollBeyondLastLine: false,
  scrollbar: {
    verticalScrollbarSize: 14,
    horizontal: "auto",
    vertical: "auto",
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    alwaysConsumeMouseWheel: false
  },
  renderLineHighlightOnlyWhenFocus: true,
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  selectOnLineNumbers: false,
  wordWrap: "off",
  lineNumbers: "off",
  glyphMargin: true,
  fixedOverflowWidgets: true,
  minimap: { enabled: false },
  renderValidationDecorations: "on",
  renderLineHighlight: "none",
  readOnly: true
};
const fixedDiffEditorOptions = {
  ...fixedEditorOptions,
  glyphMargin: true,
  enableSplitViewResizing: false,
  renderIndicators: true,
  renderMarginRevertIcon: false,
  readOnly: false,
  isInEmbeddedEditor: true,
  renderOverviewRuler: false,
  wordWrap: "off",
  diffWordWrap: "off",
  diffAlgorithm: "advanced",
  renderSideBySide: true,
  useInlineViewWhenSpaceIsLimited: false
};
export {
  fixedDiffEditorOptions,
  fixedEditorOptions,
  getEditorPadding
};
//# sourceMappingURL=diffCellEditorOptions.js.map
