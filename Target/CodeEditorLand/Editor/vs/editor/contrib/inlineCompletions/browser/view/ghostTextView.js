var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { createTrustedTypesPolicy } from "../../../../../base/browser/trustedTypes.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, autorun, derived, observableSignalFromEvent, observableValue } from "../../../../../base/common/observable.js";
import * as strings from "../../../../../base/common/strings.js";
import "./ghostTextView.css";
import { applyFontInfo } from "../../../../browser/config/domFontInfo.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorFontLigatures, EditorOption, IComputedEditorOptions } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { StringBuilder } from "../../../../common/core/stringBuilder.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { IModelDeltaDecoration, ITextModel, InjectedTextCursorStops, PositionAffinity } from "../../../../common/model.js";
import { LineTokens } from "../../../../common/tokens/lineTokens.js";
import { LineDecoration } from "../../../../common/viewLayout/lineDecorations.js";
import { RenderLineInput, renderViewLine } from "../../../../common/viewLayout/viewLineRenderer.js";
import { InlineDecorationType } from "../../../../common/viewModel.js";
import { GhostText, GhostTextReplacement } from "../model/ghostText.js";
import { ColumnRange } from "../utils.js";
import { observableCodeEditor } from "../../../../browser/observableCodeEditor.js";
import { OffsetEdit, SingleOffsetEdit } from "../../../../common/core/offsetEdit.js";
import { LineEditWithAdditionalLines } from "../../../../common/tokenizationTextModelPart.js";
let GhostTextView = class extends Disposable {
  constructor(_editor, _model, _languageService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._languageService = _languageService;
    this._register(toDisposable(() => {
      this._isDisposed.set(true, void 0);
    }));
    this._register(this._editorObs.setDecorations(this.decorations));
  }
  static {
    __name(this, "GhostTextView");
  }
  _isDisposed = observableValue(this, false);
  _editorObs = observableCodeEditor(this._editor);
  _useSyntaxHighlighting = this._editorObs.getOption(EditorOption.inlineSuggest).map((v) => v.syntaxHighlightingEnabled);
  uiState = derived(this, (reader) => {
    if (this._isDisposed.read(reader)) {
      return void 0;
    }
    const textModel = this._editorObs.model.read(reader);
    if (textModel !== this._model.targetTextModel.read(reader)) {
      return void 0;
    }
    const ghostText = this._model.ghostText.read(reader);
    if (!ghostText) {
      return void 0;
    }
    const replacedRange = ghostText instanceof GhostTextReplacement ? ghostText.columnRange : void 0;
    const syntaxHighlightingEnabled = this._useSyntaxHighlighting.read(reader);
    const extraClassName = syntaxHighlightingEnabled ? " syntax-highlighted" : "";
    const { inlineTexts, additionalLines, hiddenRange } = computeGhostTextViewData(ghostText, textModel, "ghost-text" + extraClassName);
    const edit = new OffsetEdit(inlineTexts.map((t) => SingleOffsetEdit.insert(t.column - 1, t.text)));
    const tokens = syntaxHighlightingEnabled ? textModel.tokenization.tokenizeLineWithEdit(ghostText.lineNumber, new LineEditWithAdditionalLines(
      edit,
      additionalLines.map((l) => l.content)
    )) : void 0;
    const newRanges = edit.getNewTextRanges();
    const inlineTextsWithTokens = inlineTexts.map((t, idx) => ({ ...t, tokens: tokens?.mainLineTokens?.getTokensInRange(newRanges[idx]) }));
    const tokenizedAdditionalLines = additionalLines.map((l, idx) => ({
      content: tokens?.additionalLines?.[idx] ?? LineTokens.createEmpty(l.content, this._languageService.languageIdCodec),
      decorations: l.decorations
    }));
    return {
      replacedRange,
      inlineTexts: inlineTextsWithTokens,
      additionalLines: tokenizedAdditionalLines,
      hiddenRange,
      lineNumber: ghostText.lineNumber,
      additionalReservedLineCount: this._model.minReservedLineCount.read(reader),
      targetTextModel: textModel,
      syntaxHighlightingEnabled
    };
  });
  decorations = derived(this, (reader) => {
    const uiState = this.uiState.read(reader);
    if (!uiState) {
      return [];
    }
    const decorations = [];
    const extraClassName = uiState.syntaxHighlightingEnabled ? " syntax-highlighted" : "";
    if (uiState.replacedRange) {
      decorations.push({
        range: uiState.replacedRange.toRange(uiState.lineNumber),
        options: { inlineClassName: "inline-completion-text-to-replace" + extraClassName, description: "GhostTextReplacement" }
      });
    }
    if (uiState.hiddenRange) {
      decorations.push({
        range: uiState.hiddenRange.toRange(uiState.lineNumber),
        options: { inlineClassName: "ghost-text-hidden", description: "ghost-text-hidden" }
      });
    }
    for (const p of uiState.inlineTexts) {
      decorations.push({
        range: Range.fromPositions(new Position(uiState.lineNumber, p.column)),
        options: {
          description: "ghost-text-decoration",
          after: {
            content: p.text,
            tokens: p.tokens,
            inlineClassName: p.preview ? "ghost-text-decoration-preview" : "ghost-text-decoration" + extraClassName,
            cursorStops: InjectedTextCursorStops.Left
          },
          showIfCollapsed: true
        }
      });
    }
    return decorations;
  });
  additionalLinesWidget = this._register(
    new AdditionalLinesWidget(
      this._editor,
      derived((reader) => {
        const uiState = this.uiState.read(reader);
        return uiState ? {
          lineNumber: uiState.lineNumber,
          additionalLines: uiState.additionalLines,
          minReservedLineCount: uiState.additionalReservedLineCount,
          targetTextModel: uiState.targetTextModel
        } : void 0;
      })
    )
  );
  ownsViewZone(viewZoneId) {
    return this.additionalLinesWidget.viewZoneId === viewZoneId;
  }
};
GhostTextView = __decorateClass([
  __decorateParam(2, ILanguageService)
], GhostTextView);
function computeGhostTextViewData(ghostText, textModel, ghostTextClassName) {
  const inlineTexts = [];
  const additionalLines = [];
  function addToAdditionalLines(lines, className) {
    if (additionalLines.length > 0) {
      const lastLine = additionalLines[additionalLines.length - 1];
      if (className) {
        lastLine.decorations.push(new LineDecoration(
          lastLine.content.length + 1,
          lastLine.content.length + 1 + lines[0].length,
          className,
          InlineDecorationType.Regular
        ));
      }
      lastLine.content += lines[0];
      lines = lines.slice(1);
    }
    for (const line of lines) {
      additionalLines.push({
        content: line,
        decorations: className ? [new LineDecoration(
          1,
          line.length + 1,
          className,
          InlineDecorationType.Regular
        )] : []
      });
    }
  }
  __name(addToAdditionalLines, "addToAdditionalLines");
  const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
  let hiddenTextStartColumn = void 0;
  let lastIdx = 0;
  for (const part of ghostText.parts) {
    let lines = part.lines;
    if (hiddenTextStartColumn === void 0) {
      inlineTexts.push({ column: part.column, text: lines[0], preview: part.preview });
      lines = lines.slice(1);
    } else {
      addToAdditionalLines([textBufferLine.substring(lastIdx, part.column - 1)], void 0);
    }
    if (lines.length > 0) {
      addToAdditionalLines(lines, ghostTextClassName);
      if (hiddenTextStartColumn === void 0 && part.column <= textBufferLine.length) {
        hiddenTextStartColumn = part.column;
      }
    }
    lastIdx = part.column - 1;
  }
  if (hiddenTextStartColumn !== void 0) {
    addToAdditionalLines([textBufferLine.substring(lastIdx)], void 0);
  }
  const hiddenRange = hiddenTextStartColumn !== void 0 ? new ColumnRange(hiddenTextStartColumn, textBufferLine.length + 1) : void 0;
  return {
    inlineTexts,
    additionalLines,
    hiddenRange
  };
}
__name(computeGhostTextViewData, "computeGhostTextViewData");
class AdditionalLinesWidget extends Disposable {
  constructor(editor, lines) {
    super();
    this.editor = editor;
    this.lines = lines;
    this._register(autorun((reader) => {
      const lines2 = this.lines.read(reader);
      this.editorOptionsChanged.read(reader);
      if (lines2) {
        this.updateLines(lines2.lineNumber, lines2.additionalLines, lines2.minReservedLineCount);
      } else {
        this.clear();
      }
    }));
  }
  static {
    __name(this, "AdditionalLinesWidget");
  }
  _viewZoneId = void 0;
  get viewZoneId() {
    return this._viewZoneId;
  }
  editorOptionsChanged = observableSignalFromEvent("editorOptionChanged", Event.filter(
    this.editor.onDidChangeConfiguration,
    (e) => e.hasChanged(EditorOption.disableMonospaceOptimizations) || e.hasChanged(EditorOption.stopRenderingLineAfter) || e.hasChanged(EditorOption.renderWhitespace) || e.hasChanged(EditorOption.renderControlCharacters) || e.hasChanged(EditorOption.fontLigatures) || e.hasChanged(EditorOption.fontInfo) || e.hasChanged(EditorOption.lineHeight)
  ));
  dispose() {
    super.dispose();
    this.clear();
  }
  clear() {
    this.editor.changeViewZones((changeAccessor) => {
      if (this._viewZoneId) {
        changeAccessor.removeZone(this._viewZoneId);
        this._viewZoneId = void 0;
      }
    });
  }
  updateLines(lineNumber, additionalLines, minReservedLineCount) {
    const textModel = this.editor.getModel();
    if (!textModel) {
      return;
    }
    const { tabSize } = textModel.getOptions();
    this.editor.changeViewZones((changeAccessor) => {
      if (this._viewZoneId) {
        changeAccessor.removeZone(this._viewZoneId);
        this._viewZoneId = void 0;
      }
      const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
      if (heightInLines > 0) {
        const domNode = document.createElement("div");
        renderLines(domNode, tabSize, additionalLines, this.editor.getOptions());
        this._viewZoneId = changeAccessor.addZone({
          afterLineNumber: lineNumber,
          heightInLines,
          domNode,
          afterColumnAffinity: PositionAffinity.Right
        });
      }
    });
  }
}
function renderLines(domNode, tabSize, lines, opts) {
  const disableMonospaceOptimizations = opts.get(EditorOption.disableMonospaceOptimizations);
  const stopRenderingLineAfter = opts.get(EditorOption.stopRenderingLineAfter);
  const renderWhitespace = "none";
  const renderControlCharacters = opts.get(EditorOption.renderControlCharacters);
  const fontLigatures = opts.get(EditorOption.fontLigatures);
  const fontInfo = opts.get(EditorOption.fontInfo);
  const lineHeight = opts.get(EditorOption.lineHeight);
  const sb = new StringBuilder(1e4);
  sb.appendString('<div class="suggest-preview-text">');
  for (let i = 0, len = lines.length; i < len; i++) {
    const lineData = lines[i];
    const lineTokens = lineData.content;
    sb.appendString('<div class="view-line');
    sb.appendString('" style="top:');
    sb.appendString(String(i * lineHeight));
    sb.appendString('px;width:1000000px;">');
    const line = lineTokens.getLineContent();
    const isBasicASCII = strings.isBasicASCII(line);
    const containsRTL = strings.containsRTL(line);
    renderViewLine(new RenderLineInput(
      fontInfo.isMonospace && !disableMonospaceOptimizations,
      fontInfo.canUseHalfwidthRightwardsArrow,
      line,
      false,
      isBasicASCII,
      containsRTL,
      0,
      lineTokens,
      lineData.decorations,
      tabSize,
      0,
      fontInfo.spaceWidth,
      fontInfo.middotWidth,
      fontInfo.wsmiddotWidth,
      stopRenderingLineAfter,
      renderWhitespace,
      renderControlCharacters,
      fontLigatures !== EditorFontLigatures.OFF,
      null
    ), sb);
    sb.appendString("</div>");
  }
  sb.appendString("</div>");
  applyFontInfo(domNode, fontInfo);
  const html = sb.build();
  const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
  domNode.innerHTML = trustedhtml;
}
__name(renderLines, "renderLines");
const ttPolicy = createTrustedTypesPolicy("editorGhostText", { createHTML: /* @__PURE__ */ __name((value) => value, "createHTML") });
export {
  AdditionalLinesWidget,
  GhostTextView,
  ttPolicy
};
//# sourceMappingURL=ghostTextView.js.map
