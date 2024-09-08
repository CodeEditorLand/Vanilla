import { createTrustedTypesPolicy } from "../../../../../../base/browser/trustedTypes.js";
import {
  EditorFontLigatures,
  EditorOption
} from "../../../../../common/config/editorOptions.js";
import { StringBuilder } from "../../../../../common/core/stringBuilder.js";
import { LineDecoration } from "../../../../../common/viewLayout/lineDecorations.js";
import {
  RenderLineInput,
  renderViewLine
} from "../../../../../common/viewLayout/viewLineRenderer.js";
import {
  ViewLineRenderingData
} from "../../../../../common/viewModel.js";
import { applyFontInfo } from "../../../../config/domFontInfo.js";
const ttPolicy = createTrustedTypesPolicy("diffEditorWidget", {
  createHTML: (value) => value
});
function renderLines(source, options, decorations, domNode) {
  applyFontInfo(domNode, options.fontInfo);
  const hasCharChanges = decorations.length > 0;
  const sb = new StringBuilder(1e4);
  let maxCharsPerLine = 0;
  let renderedLineCount = 0;
  const viewLineCounts = [];
  for (let lineIndex = 0; lineIndex < source.lineTokens.length; lineIndex++) {
    const lineNumber = lineIndex + 1;
    const lineTokens = source.lineTokens[lineIndex];
    const lineBreakData = source.lineBreakData[lineIndex];
    const actualDecorations = LineDecoration.filter(
      decorations,
      lineNumber,
      1,
      Number.MAX_SAFE_INTEGER
    );
    if (lineBreakData) {
      let lastBreakOffset = 0;
      for (const breakOffset of lineBreakData.breakOffsets) {
        const viewLineTokens = lineTokens.sliceAndInflate(
          lastBreakOffset,
          breakOffset,
          0
        );
        maxCharsPerLine = Math.max(
          maxCharsPerLine,
          renderOriginalLine(
            renderedLineCount,
            viewLineTokens,
            LineDecoration.extractWrapped(
              actualDecorations,
              lastBreakOffset,
              breakOffset
            ),
            hasCharChanges,
            source.mightContainNonBasicASCII,
            source.mightContainRTL,
            options,
            sb
          )
        );
        renderedLineCount++;
        lastBreakOffset = breakOffset;
      }
      viewLineCounts.push(lineBreakData.breakOffsets.length);
    } else {
      viewLineCounts.push(1);
      maxCharsPerLine = Math.max(
        maxCharsPerLine,
        renderOriginalLine(
          renderedLineCount,
          lineTokens,
          actualDecorations,
          hasCharChanges,
          source.mightContainNonBasicASCII,
          source.mightContainRTL,
          options,
          sb
        )
      );
      renderedLineCount++;
    }
  }
  maxCharsPerLine += options.scrollBeyondLastColumn;
  const html = sb.build();
  const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
  domNode.innerHTML = trustedhtml;
  const minWidthInPx = maxCharsPerLine * options.typicalHalfwidthCharacterWidth;
  return {
    heightInLines: renderedLineCount,
    minWidthInPx,
    viewLineCounts
  };
}
class LineSource {
  constructor(lineTokens, lineBreakData, mightContainNonBasicASCII, mightContainRTL) {
    this.lineTokens = lineTokens;
    this.lineBreakData = lineBreakData;
    this.mightContainNonBasicASCII = mightContainNonBasicASCII;
    this.mightContainRTL = mightContainRTL;
  }
}
class RenderOptions {
  constructor(tabSize, fontInfo, disableMonospaceOptimizations, typicalHalfwidthCharacterWidth, scrollBeyondLastColumn, lineHeight, lineDecorationsWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures) {
    this.tabSize = tabSize;
    this.fontInfo = fontInfo;
    this.disableMonospaceOptimizations = disableMonospaceOptimizations;
    this.typicalHalfwidthCharacterWidth = typicalHalfwidthCharacterWidth;
    this.scrollBeyondLastColumn = scrollBeyondLastColumn;
    this.lineHeight = lineHeight;
    this.lineDecorationsWidth = lineDecorationsWidth;
    this.stopRenderingLineAfter = stopRenderingLineAfter;
    this.renderWhitespace = renderWhitespace;
    this.renderControlCharacters = renderControlCharacters;
    this.fontLigatures = fontLigatures;
  }
  static fromEditor(editor) {
    const modifiedEditorOptions = editor.getOptions();
    const fontInfo = modifiedEditorOptions.get(EditorOption.fontInfo);
    const layoutInfo = modifiedEditorOptions.get(EditorOption.layoutInfo);
    return new RenderOptions(
      editor.getModel()?.getOptions().tabSize || 0,
      fontInfo,
      modifiedEditorOptions.get(
        EditorOption.disableMonospaceOptimizations
      ),
      fontInfo.typicalHalfwidthCharacterWidth,
      modifiedEditorOptions.get(EditorOption.scrollBeyondLastColumn),
      modifiedEditorOptions.get(EditorOption.lineHeight),
      layoutInfo.decorationsWidth,
      modifiedEditorOptions.get(EditorOption.stopRenderingLineAfter),
      modifiedEditorOptions.get(EditorOption.renderWhitespace),
      modifiedEditorOptions.get(EditorOption.renderControlCharacters),
      modifiedEditorOptions.get(EditorOption.fontLigatures)
    );
  }
}
function renderOriginalLine(viewLineIdx, lineTokens, decorations, hasCharChanges, mightContainNonBasicASCII, mightContainRTL, options, sb) {
  sb.appendString('<div class="view-line');
  if (!hasCharChanges) {
    sb.appendString(" char-delete");
  }
  sb.appendString('" style="top:');
  sb.appendString(String(viewLineIdx * options.lineHeight));
  sb.appendString('px;width:1000000px;">');
  const lineContent = lineTokens.getLineContent();
  const isBasicASCII = ViewLineRenderingData.isBasicASCII(
    lineContent,
    mightContainNonBasicASCII
  );
  const containsRTL = ViewLineRenderingData.containsRTL(
    lineContent,
    isBasicASCII,
    mightContainRTL
  );
  const output = renderViewLine(
    new RenderLineInput(
      options.fontInfo.isMonospace && !options.disableMonospaceOptimizations,
      options.fontInfo.canUseHalfwidthRightwardsArrow,
      lineContent,
      false,
      isBasicASCII,
      containsRTL,
      0,
      lineTokens,
      decorations,
      options.tabSize,
      0,
      options.fontInfo.spaceWidth,
      options.fontInfo.middotWidth,
      options.fontInfo.wsmiddotWidth,
      options.stopRenderingLineAfter,
      options.renderWhitespace,
      options.renderControlCharacters,
      options.fontLigatures !== EditorFontLigatures.OFF,
      null
      // Send no selections, original line cannot be selected
    ),
    sb
  );
  sb.appendString("</div>");
  return output.characterMapping.getHorizontalOffset(
    output.characterMapping.length
  );
}
export {
  LineSource,
  RenderOptions,
  renderLines
};
