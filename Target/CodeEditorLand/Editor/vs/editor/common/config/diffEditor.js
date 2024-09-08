const diffEditorDefaultOptions = {
  enableSplitViewResizing: true,
  splitViewDefaultRatio: 0.5,
  renderSideBySide: true,
  renderMarginRevertIcon: true,
  renderGutterMenu: true,
  maxComputationTime: 5e3,
  maxFileSize: 50,
  ignoreTrimWhitespace: true,
  renderIndicators: true,
  originalEditable: false,
  diffCodeLens: false,
  renderOverviewRuler: true,
  diffWordWrap: "inherit",
  diffAlgorithm: "advanced",
  accessibilityVerbose: false,
  experimental: {
    showMoves: false,
    showEmptyDecorations: true,
    useTrueInlineView: false
  },
  hideUnchangedRegions: {
    enabled: false,
    contextLineCount: 3,
    minimumLineCount: 3,
    revealLineCount: 20
  },
  isInEmbeddedEditor: false,
  onlyShowAccessibleDiffViewer: false,
  renderSideBySideInlineBreakpoint: 900,
  useInlineViewWhenSpaceIsLimited: true,
  compactMode: false
};
export {
  diffEditorDefaultOptions
};
