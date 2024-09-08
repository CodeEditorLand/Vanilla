import * as dom from "../../../../base/browser/dom.js";
import {
  createFastDomNode
} from "../../../../base/browser/fastDomNode.js";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "../../../../base/browser/ui/mouseCursor/mouseCursor.js";
import * as strings from "../../../../base/common/strings.js";
import {
  EditorOption,
  TextEditorCursorStyle
} from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { applyFontInfo } from "../../config/domFontInfo.js";
class ViewCursorRenderData {
  constructor(top, left, paddingLeft, width, height, textContent, textContentClassName) {
    this.top = top;
    this.left = left;
    this.paddingLeft = paddingLeft;
    this.width = width;
    this.height = height;
    this.textContent = textContent;
    this.textContentClassName = textContentClassName;
  }
}
var CursorPlurality = /* @__PURE__ */ ((CursorPlurality2) => {
  CursorPlurality2[CursorPlurality2["Single"] = 0] = "Single";
  CursorPlurality2[CursorPlurality2["MultiPrimary"] = 1] = "MultiPrimary";
  CursorPlurality2[CursorPlurality2["MultiSecondary"] = 2] = "MultiSecondary";
  return CursorPlurality2;
})(CursorPlurality || {});
class ViewCursor {
  _context;
  _domNode;
  _cursorStyle;
  _lineCursorWidth;
  _lineHeight;
  _typicalHalfwidthCharacterWidth;
  _isVisible;
  _position;
  _pluralityClass;
  _lastRenderedContent;
  _renderData;
  constructor(context, plurality) {
    this._context = context;
    const options = this._context.configuration.options;
    const fontInfo = options.get(EditorOption.fontInfo);
    this._cursorStyle = options.get(EditorOption.cursorStyle);
    this._lineHeight = options.get(EditorOption.lineHeight);
    this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
    this._lineCursorWidth = Math.min(
      options.get(EditorOption.cursorWidth),
      this._typicalHalfwidthCharacterWidth
    );
    this._isVisible = true;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setClassName(
      `cursor ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`
    );
    this._domNode.setHeight(this._lineHeight);
    this._domNode.setTop(0);
    this._domNode.setLeft(0);
    applyFontInfo(this._domNode, fontInfo);
    this._domNode.setDisplay("none");
    this._position = new Position(1, 1);
    this._pluralityClass = "";
    this.setPlurality(plurality);
    this._lastRenderedContent = "";
    this._renderData = null;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  setPlurality(plurality) {
    switch (plurality) {
      default:
      case 0 /* Single */:
        this._pluralityClass = "";
        break;
      case 1 /* MultiPrimary */:
        this._pluralityClass = "cursor-primary";
        break;
      case 2 /* MultiSecondary */:
        this._pluralityClass = "cursor-secondary";
        break;
    }
  }
  show() {
    if (!this._isVisible) {
      this._domNode.setVisibility("inherit");
      this._isVisible = true;
    }
  }
  hide() {
    if (this._isVisible) {
      this._domNode.setVisibility("hidden");
      this._isVisible = false;
    }
  }
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    const fontInfo = options.get(EditorOption.fontInfo);
    this._cursorStyle = options.get(EditorOption.cursorStyle);
    this._lineHeight = options.get(EditorOption.lineHeight);
    this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
    this._lineCursorWidth = Math.min(
      options.get(EditorOption.cursorWidth),
      this._typicalHalfwidthCharacterWidth
    );
    applyFontInfo(this._domNode, fontInfo);
    return true;
  }
  onCursorPositionChanged(position, pauseAnimation) {
    if (pauseAnimation) {
      this._domNode.domNode.style.transitionProperty = "none";
    } else {
      this._domNode.domNode.style.transitionProperty = "";
    }
    this._position = position;
    return true;
  }
  /**
   * If `this._position` is inside a grapheme, returns the position where the grapheme starts.
   * Also returns the next grapheme.
   */
  _getGraphemeAwarePosition() {
    const { lineNumber, column } = this._position;
    const lineContent = this._context.viewModel.getLineContent(lineNumber);
    const [startOffset, endOffset] = strings.getCharContainingOffset(
      lineContent,
      column - 1
    );
    return [
      new Position(lineNumber, startOffset + 1),
      lineContent.substring(startOffset, endOffset)
    ];
  }
  _prepareRender(ctx) {
    let textContent = "";
    let textContentClassName = "";
    const [position, nextGrapheme] = this._getGraphemeAwarePosition();
    if (this._cursorStyle === TextEditorCursorStyle.Line || this._cursorStyle === TextEditorCursorStyle.LineThin) {
      const visibleRange = ctx.visibleRangeForPosition(position);
      if (!visibleRange || visibleRange.outsideRenderedLine) {
        return null;
      }
      const window = dom.getWindow(this._domNode.domNode);
      let width2;
      if (this._cursorStyle === TextEditorCursorStyle.Line) {
        width2 = dom.computeScreenAwareSize(
          window,
          this._lineCursorWidth > 0 ? this._lineCursorWidth : 2
        );
        if (width2 > 2) {
          textContent = nextGrapheme;
          textContentClassName = this._getTokenClassName(position);
        }
      } else {
        width2 = dom.computeScreenAwareSize(window, 1);
      }
      let left = visibleRange.left;
      let paddingLeft = 0;
      if (width2 >= 2 && left >= 1) {
        paddingLeft = 1;
        left -= paddingLeft;
      }
      const top2 = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.bigNumbersDelta;
      return new ViewCursorRenderData(
        top2,
        left,
        paddingLeft,
        width2,
        this._lineHeight,
        textContent,
        textContentClassName
      );
    }
    const visibleRangeForCharacter = ctx.linesVisibleRangesForRange(
      new Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column + nextGrapheme.length
      ),
      false
    );
    if (!visibleRangeForCharacter || visibleRangeForCharacter.length === 0) {
      return null;
    }
    const firstVisibleRangeForCharacter = visibleRangeForCharacter[0];
    if (firstVisibleRangeForCharacter.outsideRenderedLine || firstVisibleRangeForCharacter.ranges.length === 0) {
      return null;
    }
    const range = firstVisibleRangeForCharacter.ranges[0];
    const width = nextGrapheme === "	" ? this._typicalHalfwidthCharacterWidth : range.width < 1 ? this._typicalHalfwidthCharacterWidth : range.width;
    if (this._cursorStyle === TextEditorCursorStyle.Block) {
      textContent = nextGrapheme;
      textContentClassName = this._getTokenClassName(position);
    }
    let top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.bigNumbersDelta;
    let height = this._lineHeight;
    if (this._cursorStyle === TextEditorCursorStyle.Underline || this._cursorStyle === TextEditorCursorStyle.UnderlineThin) {
      top += this._lineHeight - 2;
      height = 2;
    }
    return new ViewCursorRenderData(
      top,
      range.left,
      0,
      width,
      height,
      textContent,
      textContentClassName
    );
  }
  _getTokenClassName(position) {
    const lineData = this._context.viewModel.getViewLineData(
      position.lineNumber
    );
    const tokenIndex = lineData.tokens.findTokenIndexAtOffset(
      position.column - 1
    );
    return lineData.tokens.getClassName(tokenIndex);
  }
  prepareRender(ctx) {
    this._renderData = this._prepareRender(ctx);
  }
  render(ctx) {
    if (!this._renderData) {
      this._domNode.setDisplay("none");
      return null;
    }
    if (this._lastRenderedContent !== this._renderData.textContent) {
      this._lastRenderedContent = this._renderData.textContent;
      this._domNode.domNode.textContent = this._lastRenderedContent;
    }
    this._domNode.setClassName(
      `cursor ${this._pluralityClass} ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME} ${this._renderData.textContentClassName}`
    );
    this._domNode.setDisplay("block");
    this._domNode.setTop(this._renderData.top);
    this._domNode.setLeft(this._renderData.left);
    this._domNode.setPaddingLeft(this._renderData.paddingLeft);
    this._domNode.setWidth(this._renderData.width);
    this._domNode.setLineHeight(this._renderData.height);
    this._domNode.setHeight(this._renderData.height);
    return {
      domNode: this._domNode.domNode,
      position: this._position,
      contentLeft: this._renderData.left,
      height: this._renderData.height,
      width: 2
    };
  }
}
export {
  CursorPlurality,
  ViewCursor
};
