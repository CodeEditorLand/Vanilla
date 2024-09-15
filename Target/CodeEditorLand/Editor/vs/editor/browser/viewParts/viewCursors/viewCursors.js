var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./viewCursors.css";
import {
  WindowIntervalTimer,
  getWindow
} from "../../../../base/browser/dom.js";
import {
  createFastDomNode
} from "../../../../base/browser/fastDomNode.js";
import {
  TimeoutTimer
} from "../../../../base/common/async.js";
import { isHighContrast } from "../../../../platform/theme/common/theme.js";
import { registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import {
  EditorOption,
  TextEditorCursorBlinkingStyle,
  TextEditorCursorStyle
} from "../../../common/config/editorOptions.js";
import {
  editorCursorBackground,
  editorCursorForeground,
  editorMultiCursorPrimaryBackground,
  editorMultiCursorPrimaryForeground,
  editorMultiCursorSecondaryBackground,
  editorMultiCursorSecondaryForeground
} from "../../../common/core/editorColorRegistry.js";
import { CursorChangeReason } from "../../../common/cursorEvents.js";
import { ViewPart } from "../../view/viewPart.js";
import {
  CursorPlurality,
  ViewCursor
} from "./viewCursor.js";
class ViewCursors extends ViewPart {
  static {
    __name(this, "ViewCursors");
  }
  static BLINK_INTERVAL = 500;
  _readOnly;
  _cursorBlinking;
  _cursorStyle;
  _cursorSmoothCaretAnimation;
  _selectionIsEmpty;
  _isComposingInput;
  _isVisible;
  _domNode;
  _startCursorBlinkAnimation;
  _cursorFlatBlinkInterval;
  _blinkingEnabled;
  _editorHasFocus;
  _primaryCursor;
  _secondaryCursors;
  _renderData;
  constructor(context) {
    super(context);
    const options = this._context.configuration.options;
    this._readOnly = options.get(EditorOption.readOnly);
    this._cursorBlinking = options.get(EditorOption.cursorBlinking);
    this._cursorStyle = options.get(EditorOption.cursorStyle);
    this._cursorSmoothCaretAnimation = options.get(
      EditorOption.cursorSmoothCaretAnimation
    );
    this._selectionIsEmpty = true;
    this._isComposingInput = false;
    this._isVisible = false;
    this._primaryCursor = new ViewCursor(
      this._context,
      CursorPlurality.Single
    );
    this._secondaryCursors = [];
    this._renderData = [];
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setAttribute("role", "presentation");
    this._domNode.setAttribute("aria-hidden", "true");
    this._updateDomClassName();
    this._domNode.appendChild(this._primaryCursor.getDomNode());
    this._startCursorBlinkAnimation = new TimeoutTimer();
    this._cursorFlatBlinkInterval = new WindowIntervalTimer();
    this._blinkingEnabled = false;
    this._editorHasFocus = false;
    this._updateBlinking();
  }
  dispose() {
    super.dispose();
    this._startCursorBlinkAnimation.dispose();
    this._cursorFlatBlinkInterval.dispose();
  }
  getDomNode() {
    return this._domNode;
  }
  // --- begin event handlers
  onCompositionStart(e) {
    this._isComposingInput = true;
    this._updateBlinking();
    return true;
  }
  onCompositionEnd(e) {
    this._isComposingInput = false;
    this._updateBlinking();
    return true;
  }
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    this._readOnly = options.get(EditorOption.readOnly);
    this._cursorBlinking = options.get(EditorOption.cursorBlinking);
    this._cursorStyle = options.get(EditorOption.cursorStyle);
    this._cursorSmoothCaretAnimation = options.get(
      EditorOption.cursorSmoothCaretAnimation
    );
    this._updateBlinking();
    this._updateDomClassName();
    this._primaryCursor.onConfigurationChanged(e);
    for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
      this._secondaryCursors[i].onConfigurationChanged(e);
    }
    return true;
  }
  _onCursorPositionChanged(position, secondaryPositions, reason) {
    const pauseAnimation = this._secondaryCursors.length !== secondaryPositions.length || this._cursorSmoothCaretAnimation === "explicit" && reason !== CursorChangeReason.Explicit;
    this._primaryCursor.setPlurality(
      secondaryPositions.length ? CursorPlurality.MultiPrimary : CursorPlurality.Single
    );
    this._primaryCursor.onCursorPositionChanged(position, pauseAnimation);
    this._updateBlinking();
    if (this._secondaryCursors.length < secondaryPositions.length) {
      const addCnt = secondaryPositions.length - this._secondaryCursors.length;
      for (let i = 0; i < addCnt; i++) {
        const newCursor = new ViewCursor(
          this._context,
          CursorPlurality.MultiSecondary
        );
        this._domNode.domNode.insertBefore(
          newCursor.getDomNode().domNode,
          this._primaryCursor.getDomNode().domNode.nextSibling
        );
        this._secondaryCursors.push(newCursor);
      }
    } else if (this._secondaryCursors.length > secondaryPositions.length) {
      const removeCnt = this._secondaryCursors.length - secondaryPositions.length;
      for (let i = 0; i < removeCnt; i++) {
        this._domNode.removeChild(
          this._secondaryCursors[0].getDomNode()
        );
        this._secondaryCursors.splice(0, 1);
      }
    }
    for (let i = 0; i < secondaryPositions.length; i++) {
      this._secondaryCursors[i].onCursorPositionChanged(
        secondaryPositions[i],
        pauseAnimation
      );
    }
  }
  onCursorStateChanged(e) {
    const positions = [];
    for (let i = 0, len = e.selections.length; i < len; i++) {
      positions[i] = e.selections[i].getPosition();
    }
    this._onCursorPositionChanged(
      positions[0],
      positions.slice(1),
      e.reason
    );
    const selectionIsEmpty = e.selections[0].isEmpty();
    if (this._selectionIsEmpty !== selectionIsEmpty) {
      this._selectionIsEmpty = selectionIsEmpty;
      this._updateDomClassName();
    }
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onFocusChanged(e) {
    this._editorHasFocus = e.isFocused;
    this._updateBlinking();
    return false;
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
    return true;
  }
  onTokensChanged(e) {
    const shouldRender = /* @__PURE__ */ __name((position) => {
      for (let i = 0, len = e.ranges.length; i < len; i++) {
        if (e.ranges[i].fromLineNumber <= position.lineNumber && position.lineNumber <= e.ranges[i].toLineNumber) {
          return true;
        }
      }
      return false;
    }, "shouldRender");
    if (shouldRender(this._primaryCursor.getPosition())) {
      return true;
    }
    for (const secondaryCursor of this._secondaryCursors) {
      if (shouldRender(secondaryCursor.getPosition())) {
        return true;
      }
    }
    return false;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  // ---- blinking logic
  _getCursorBlinking() {
    if (this._isComposingInput) {
      return TextEditorCursorBlinkingStyle.Hidden;
    }
    if (!this._editorHasFocus) {
      return TextEditorCursorBlinkingStyle.Hidden;
    }
    if (this._readOnly) {
      return TextEditorCursorBlinkingStyle.Solid;
    }
    return this._cursorBlinking;
  }
  _updateBlinking() {
    this._startCursorBlinkAnimation.cancel();
    this._cursorFlatBlinkInterval.cancel();
    const blinkingStyle = this._getCursorBlinking();
    const isHidden = blinkingStyle === TextEditorCursorBlinkingStyle.Hidden;
    const isSolid = blinkingStyle === TextEditorCursorBlinkingStyle.Solid;
    if (isHidden) {
      this._hide();
    } else {
      this._show();
    }
    this._blinkingEnabled = false;
    this._updateDomClassName();
    if (!isHidden && !isSolid) {
      if (blinkingStyle === TextEditorCursorBlinkingStyle.Blink) {
        this._cursorFlatBlinkInterval.cancelAndSet(
          () => {
            if (this._isVisible) {
              this._hide();
            } else {
              this._show();
            }
          },
          ViewCursors.BLINK_INTERVAL,
          getWindow(this._domNode.domNode)
        );
      } else {
        this._startCursorBlinkAnimation.setIfNotSet(() => {
          this._blinkingEnabled = true;
          this._updateDomClassName();
        }, ViewCursors.BLINK_INTERVAL);
      }
    }
  }
  // --- end blinking logic
  _updateDomClassName() {
    this._domNode.setClassName(this._getClassName());
  }
  _getClassName() {
    let result = "cursors-layer";
    if (!this._selectionIsEmpty) {
      result += " has-selection";
    }
    switch (this._cursorStyle) {
      case TextEditorCursorStyle.Line:
        result += " cursor-line-style";
        break;
      case TextEditorCursorStyle.Block:
        result += " cursor-block-style";
        break;
      case TextEditorCursorStyle.Underline:
        result += " cursor-underline-style";
        break;
      case TextEditorCursorStyle.LineThin:
        result += " cursor-line-thin-style";
        break;
      case TextEditorCursorStyle.BlockOutline:
        result += " cursor-block-outline-style";
        break;
      case TextEditorCursorStyle.UnderlineThin:
        result += " cursor-underline-thin-style";
        break;
      default:
        result += " cursor-line-style";
    }
    if (this._blinkingEnabled) {
      switch (this._getCursorBlinking()) {
        case TextEditorCursorBlinkingStyle.Blink:
          result += " cursor-blink";
          break;
        case TextEditorCursorBlinkingStyle.Smooth:
          result += " cursor-smooth";
          break;
        case TextEditorCursorBlinkingStyle.Phase:
          result += " cursor-phase";
          break;
        case TextEditorCursorBlinkingStyle.Expand:
          result += " cursor-expand";
          break;
        case TextEditorCursorBlinkingStyle.Solid:
          result += " cursor-solid";
          break;
        default:
          result += " cursor-solid";
      }
    } else {
      result += " cursor-solid";
    }
    if (this._cursorSmoothCaretAnimation === "on" || this._cursorSmoothCaretAnimation === "explicit") {
      result += " cursor-smooth-caret-animation";
    }
    return result;
  }
  _show() {
    this._primaryCursor.show();
    for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
      this._secondaryCursors[i].show();
    }
    this._isVisible = true;
  }
  _hide() {
    this._primaryCursor.hide();
    for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
      this._secondaryCursors[i].hide();
    }
    this._isVisible = false;
  }
  // ---- IViewPart implementation
  prepareRender(ctx) {
    this._primaryCursor.prepareRender(ctx);
    for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
      this._secondaryCursors[i].prepareRender(ctx);
    }
  }
  render(ctx) {
    const renderData = [];
    let renderDataLen = 0;
    const primaryRenderData = this._primaryCursor.render(ctx);
    if (primaryRenderData) {
      renderData[renderDataLen++] = primaryRenderData;
    }
    for (let i = 0, len = this._secondaryCursors.length; i < len; i++) {
      const secondaryRenderData = this._secondaryCursors[i].render(ctx);
      if (secondaryRenderData) {
        renderData[renderDataLen++] = secondaryRenderData;
      }
    }
    this._renderData = renderData;
  }
  getLastRenderData() {
    return this._renderData;
  }
}
registerThemingParticipant((theme, collector) => {
  const cursorThemes = [
    {
      class: ".cursor",
      foreground: editorCursorForeground,
      background: editorCursorBackground
    },
    {
      class: ".cursor-primary",
      foreground: editorMultiCursorPrimaryForeground,
      background: editorMultiCursorPrimaryBackground
    },
    {
      class: ".cursor-secondary",
      foreground: editorMultiCursorSecondaryForeground,
      background: editorMultiCursorSecondaryBackground
    }
  ];
  for (const cursorTheme of cursorThemes) {
    const caret = theme.getColor(cursorTheme.foreground);
    if (caret) {
      let caretBackground = theme.getColor(cursorTheme.background);
      if (!caretBackground) {
        caretBackground = caret.opposite();
      }
      collector.addRule(
        `.monaco-editor .cursors-layer ${cursorTheme.class} { background-color: ${caret}; border-color: ${caret}; color: ${caretBackground}; }`
      );
      if (isHighContrast(theme.type)) {
        collector.addRule(
          `.monaco-editor .cursors-layer.has-selection ${cursorTheme.class} { border-left: 1px solid ${caretBackground}; border-right: 1px solid ${caretBackground}; }`
        );
      }
    }
  }
});
export {
  ViewCursors
};
//# sourceMappingURL=viewCursors.js.map
