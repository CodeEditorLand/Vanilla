var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./whitespace.css";
import { DynamicViewOverlay } from "../../view/dynamicViewOverlay.js";
import { Selection } from "../../../common/core/selection.js";
import { RenderingContext } from "../../view/renderingContext.js";
import { ViewContext } from "../../../common/viewModel/viewContext.js";
import * as viewEvents from "../../../common/viewEvents.js";
import { ViewLineData } from "../../../common/viewModel.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { IEditorConfiguration } from "../../../common/config/editorConfiguration.js";
import * as strings from "../../../../base/common/strings.js";
import { CharCode } from "../../../../base/common/charCode.js";
import { LineRange } from "../../../common/viewLayout/viewLineRenderer.js";
import { Position } from "../../../common/core/position.js";
import { editorWhitespaces } from "../../../common/core/editorColorRegistry.js";
class WhitespaceOverlay extends DynamicViewOverlay {
  static {
    __name(this, "WhitespaceOverlay");
  }
  _context;
  _options;
  _selection;
  _renderResult;
  constructor(context) {
    super();
    this._context = context;
    this._options = new WhitespaceOptions(this._context.configuration);
    this._selection = [];
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const newOptions = new WhitespaceOptions(this._context.configuration);
    if (this._options.equals(newOptions)) {
      return e.hasChanged(EditorOption.layoutInfo);
    }
    this._options = newOptions;
    return true;
  }
  onCursorStateChanged(e) {
    this._selection = e.selections;
    if (this._options.renderWhitespace === "selection") {
      return true;
    }
    return false;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
    if (this._options.renderWhitespace === "none") {
      this._renderResult = null;
      return;
    }
    const startLineNumber = ctx.visibleRange.startLineNumber;
    const endLineNumber = ctx.visibleRange.endLineNumber;
    const lineCount = endLineNumber - startLineNumber + 1;
    const needed = new Array(lineCount);
    for (let i = 0; i < lineCount; i++) {
      needed[i] = true;
    }
    const viewportData = this._context.viewModel.getMinimapLinesRenderingData(ctx.viewportData.startLineNumber, ctx.viewportData.endLineNumber, needed);
    this._renderResult = [];
    for (let lineNumber = ctx.viewportData.startLineNumber; lineNumber <= ctx.viewportData.endLineNumber; lineNumber++) {
      const lineIndex = lineNumber - ctx.viewportData.startLineNumber;
      const lineData = viewportData.data[lineIndex];
      let selectionsOnLine = null;
      if (this._options.renderWhitespace === "selection") {
        const selections = this._selection;
        for (const selection of selections) {
          if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
            continue;
          }
          const startColumn = selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn;
          const endColumn = selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn;
          if (startColumn < endColumn) {
            if (!selectionsOnLine) {
              selectionsOnLine = [];
            }
            selectionsOnLine.push(new LineRange(startColumn - 1, endColumn - 1));
          }
        }
      }
      this._renderResult[lineIndex] = this._applyRenderWhitespace(ctx, lineNumber, selectionsOnLine, lineData);
    }
  }
  _applyRenderWhitespace(ctx, lineNumber, selections, lineData) {
    if (this._options.renderWhitespace === "selection" && !selections) {
      return "";
    }
    if (this._options.renderWhitespace === "trailing" && lineData.continuesWithWrappedLine) {
      return "";
    }
    const color = this._context.theme.getColor(editorWhitespaces);
    const USE_SVG = this._options.renderWithSVG;
    const lineContent = lineData.content;
    const len = this._options.stopRenderingLineAfter === -1 ? lineContent.length : Math.min(this._options.stopRenderingLineAfter, lineContent.length);
    const continuesWithWrappedLine = lineData.continuesWithWrappedLine;
    const fauxIndentLength = lineData.minColumn - 1;
    const onlyBoundary = this._options.renderWhitespace === "boundary";
    const onlyTrailing = this._options.renderWhitespace === "trailing";
    const lineHeight = this._options.lineHeight;
    const middotWidth = this._options.middotWidth;
    const wsmiddotWidth = this._options.wsmiddotWidth;
    const spaceWidth = this._options.spaceWidth;
    const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
    const middotDiff = Math.abs(middotWidth - spaceWidth);
    const renderSpaceCharCode = wsmiddotDiff < middotDiff ? 11825 : 183;
    const canUseHalfwidthRightwardsArrow = this._options.canUseHalfwidthRightwardsArrow;
    let result = "";
    let lineIsEmptyOrWhitespace = false;
    let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
    let lastNonWhitespaceIndex;
    if (firstNonWhitespaceIndex === -1) {
      lineIsEmptyOrWhitespace = true;
      firstNonWhitespaceIndex = len;
      lastNonWhitespaceIndex = len;
    } else {
      lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
    }
    let currentSelectionIndex = 0;
    let currentSelection = selections && selections[currentSelectionIndex];
    let maxLeft = 0;
    for (let charIndex = fauxIndentLength; charIndex < len; charIndex++) {
      const chCode = lineContent.charCodeAt(charIndex);
      if (currentSelection && charIndex >= currentSelection.endOffset) {
        currentSelectionIndex++;
        currentSelection = selections && selections[currentSelectionIndex];
      }
      if (chCode !== CharCode.Tab && chCode !== CharCode.Space) {
        continue;
      }
      if (onlyTrailing && !lineIsEmptyOrWhitespace && charIndex <= lastNonWhitespaceIndex) {
        continue;
      }
      if (onlyBoundary && charIndex >= firstNonWhitespaceIndex && charIndex <= lastNonWhitespaceIndex && chCode === CharCode.Space) {
        const prevChCode = charIndex - 1 >= 0 ? lineContent.charCodeAt(charIndex - 1) : CharCode.Null;
        const nextChCode = charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : CharCode.Null;
        if (prevChCode !== CharCode.Space && nextChCode !== CharCode.Space) {
          continue;
        }
      }
      if (onlyBoundary && continuesWithWrappedLine && charIndex === len - 1) {
        const prevCharCode = charIndex - 1 >= 0 ? lineContent.charCodeAt(charIndex - 1) : CharCode.Null;
        const isSingleTrailingSpace = chCode === CharCode.Space && (prevCharCode !== CharCode.Space && prevCharCode !== CharCode.Tab);
        if (isSingleTrailingSpace) {
          continue;
        }
      }
      if (selections && (!currentSelection || currentSelection.startOffset > charIndex || currentSelection.endOffset <= charIndex)) {
        continue;
      }
      const visibleRange = ctx.visibleRangeForPosition(new Position(lineNumber, charIndex + 1));
      if (!visibleRange) {
        continue;
      }
      if (USE_SVG) {
        maxLeft = Math.max(maxLeft, visibleRange.left);
        if (chCode === CharCode.Tab) {
          result += this._renderArrow(lineHeight, spaceWidth, visibleRange.left);
        } else {
          result += `<circle cx="${(visibleRange.left + spaceWidth / 2).toFixed(2)}" cy="${(lineHeight / 2).toFixed(2)}" r="${(spaceWidth / 7).toFixed(2)}" />`;
        }
      } else {
        if (chCode === CharCode.Tab) {
          result += `<div class="mwh" style="left:${visibleRange.left}px;height:${lineHeight}px;">${canUseHalfwidthRightwardsArrow ? String.fromCharCode(65515) : String.fromCharCode(8594)}</div>`;
        } else {
          result += `<div class="mwh" style="left:${visibleRange.left}px;height:${lineHeight}px;">${String.fromCharCode(renderSpaceCharCode)}</div>`;
        }
      }
    }
    if (USE_SVG) {
      maxLeft = Math.round(maxLeft + spaceWidth);
      return `<svg style="bottom:0;position:absolute;width:${maxLeft}px;height:${lineHeight}px" viewBox="0 0 ${maxLeft} ${lineHeight}" xmlns="http://www.w3.org/2000/svg" fill="${color}">` + result + `</svg>`;
    }
    return result;
  }
  _renderArrow(lineHeight, spaceWidth, left) {
    const strokeWidth = spaceWidth / 7;
    const width = spaceWidth;
    const dy = lineHeight / 2;
    const dx = left;
    const p1 = { x: 0, y: strokeWidth / 2 };
    const p2 = { x: 100 / 125 * width, y: p1.y };
    const p3 = { x: p2.x - 0.2 * p2.x, y: p2.y + 0.2 * p2.x };
    const p4 = { x: p3.x + 0.1 * p2.x, y: p3.y + 0.1 * p2.x };
    const p5 = { x: p4.x + 0.35 * p2.x, y: p4.y - 0.35 * p2.x };
    const p6 = { x: p5.x, y: -p5.y };
    const p7 = { x: p4.x, y: -p4.y };
    const p8 = { x: p3.x, y: -p3.y };
    const p9 = { x: p2.x, y: -p2.y };
    const p10 = { x: p1.x, y: -p1.y };
    const p = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
    const parts = p.map((p11) => `${(dx + p11.x).toFixed(2)} ${(dy + p11.y).toFixed(2)}`).join(" L ");
    return `<path d="M ${parts}" />`;
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderResult) {
      return "";
    }
    const lineIndex = lineNumber - startLineNumber;
    if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
      return "";
    }
    return this._renderResult[lineIndex];
  }
}
class WhitespaceOptions {
  static {
    __name(this, "WhitespaceOptions");
  }
  renderWhitespace;
  renderWithSVG;
  spaceWidth;
  middotWidth;
  wsmiddotWidth;
  canUseHalfwidthRightwardsArrow;
  lineHeight;
  stopRenderingLineAfter;
  constructor(config) {
    const options = config.options;
    const fontInfo = options.get(EditorOption.fontInfo);
    const experimentalWhitespaceRendering = options.get(EditorOption.experimentalWhitespaceRendering);
    if (experimentalWhitespaceRendering === "off") {
      this.renderWhitespace = "none";
      this.renderWithSVG = false;
    } else if (experimentalWhitespaceRendering === "svg") {
      this.renderWhitespace = options.get(EditorOption.renderWhitespace);
      this.renderWithSVG = true;
    } else {
      this.renderWhitespace = options.get(EditorOption.renderWhitespace);
      this.renderWithSVG = false;
    }
    this.spaceWidth = fontInfo.spaceWidth;
    this.middotWidth = fontInfo.middotWidth;
    this.wsmiddotWidth = fontInfo.wsmiddotWidth;
    this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
    this.lineHeight = options.get(EditorOption.lineHeight);
    this.stopRenderingLineAfter = options.get(EditorOption.stopRenderingLineAfter);
  }
  equals(other) {
    return this.renderWhitespace === other.renderWhitespace && this.renderWithSVG === other.renderWithSVG && this.spaceWidth === other.spaceWidth && this.middotWidth === other.middotWidth && this.wsmiddotWidth === other.wsmiddotWidth && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.lineHeight === other.lineHeight && this.stopRenderingLineAfter === other.stopRenderingLineAfter;
  }
}
export {
  WhitespaceOverlay
};
//# sourceMappingURL=whitespace.js.map
