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
import {
  Dimension,
  addDisposableListener
} from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import {
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { assertType } from "../../../../base/common/types.js";
import { StableEditorBottomScrollState } from "../../../../editor/browser/stableEditorScroll.js";
import {
  EditorOption
} from "../../../../editor/common/config/editorOptions.js";
import { ScrollType } from "../../../../editor/common/editorCommon.js";
import { ZoneWidget } from "../../../../editor/contrib/zoneWidget/browser/zoneWidget.js";
import { localize } from "../../../../nls.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { isResponseVM } from "../../chat/common/chatViewModel.js";
import {
  ACTION_REGENERATE_RESPONSE,
  ACTION_REPORT_ISSUE,
  ACTION_TOGGLE_DIFF,
  CTX_INLINE_CHAT_OUTER_CURSOR_POSITION,
  EditMode,
  InlineChatConfigKeys,
  MENU_INLINE_CHAT_WIDGET_SECONDARY,
  MENU_INLINE_CHAT_WIDGET_STATUS
} from "../common/inlineChat.js";
import { EditorBasedInlineChatWidget } from "./inlineChatWidget.js";
let InlineChatZoneWidget = class extends ZoneWidget {
  constructor(location, editor, _instaService, _logService, contextKeyService, configurationService) {
    super(editor, { showFrame: false, showArrow: false, isAccessible: true, className: "inline-chat-widget", keepEditorSelection: true, showInHiddenAreas: true, ordinal: 5e4 });
    this._instaService = _instaService;
    this._logService = _logService;
    this._ctxCursorPosition = CTX_INLINE_CHAT_OUTER_CURSOR_POSITION.bindTo(contextKeyService);
    this._disposables.add(toDisposable(() => {
      this._ctxCursorPosition.reset();
    }));
    this.widget = this._instaService.createInstance(EditorBasedInlineChatWidget, location, this.editor, {
      statusMenuId: {
        menu: MENU_INLINE_CHAT_WIDGET_STATUS,
        options: {
          buttonConfigProvider: /* @__PURE__ */ __name((action, index) => {
            const isSecondary = index > 0;
            if ((/* @__PURE__ */ new Set([ACTION_REGENERATE_RESPONSE, ACTION_TOGGLE_DIFF, ACTION_REPORT_ISSUE])).has(action.id)) {
              return { isSecondary, showIcon: true, showLabel: false };
            } else {
              return { isSecondary };
            }
          }, "buttonConfigProvider")
        }
      },
      secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
      chatWidgetViewOptions: {
        menus: {
          executeToolbar: MenuId.ChatExecute,
          telemetrySource: "interactiveEditorWidget-toolbar"
        },
        rendererOptions: {
          renderTextEditsAsSummary: /* @__PURE__ */ __name((uri) => {
            return isEqual(uri, editor.getModel()?.uri) && configurationService.getValue(InlineChatConfigKeys.Mode) === EditMode.Live;
          }, "renderTextEditsAsSummary")
        }
      }
    });
    this._disposables.add(this.widget);
    let revealFn;
    this._disposables.add(this.widget.chatWidget.onWillMaybeChangeHeight(() => {
      if (this.position) {
        revealFn = this._createZoneAndScrollRestoreFn(this.position);
      }
    }));
    this._disposables.add(this.widget.onDidChangeHeight(() => {
      if (this.position) {
        revealFn ??= this._createZoneAndScrollRestoreFn(this.position);
        const height = this._computeHeight();
        this._relayout(height.linesValue);
        revealFn();
        revealFn = void 0;
      }
    }));
    this.create();
    this._disposables.add(addDisposableListener(this.domNode, "click", (e) => {
      if (!this.editor.hasWidgetFocus() && !this.widget.hasFocus()) {
        this.editor.focus();
      }
    }, true));
    const updateCursorIsAboveContextKey = /* @__PURE__ */ __name(() => {
      if (!this.position || !this.editor.hasModel()) {
        this._ctxCursorPosition.reset();
      } else if (this.position.lineNumber === this.editor.getPosition().lineNumber) {
        this._ctxCursorPosition.set("above");
      } else if (this.position.lineNumber + 1 === this.editor.getPosition().lineNumber) {
        this._ctxCursorPosition.set("below");
      } else {
        this._ctxCursorPosition.reset();
      }
    }, "updateCursorIsAboveContextKey");
    this._disposables.add(this.editor.onDidChangeCursorPosition((e) => updateCursorIsAboveContextKey()));
    this._disposables.add(this.editor.onDidFocusEditorText((e) => updateCursorIsAboveContextKey()));
    updateCursorIsAboveContextKey();
  }
  static {
    __name(this, "InlineChatZoneWidget");
  }
  widget;
  _scrollUp = this._disposables.add(
    new ScrollUpState(this.editor)
  );
  _ctxCursorPosition;
  _dimension;
  _fillContainer(container) {
    container.appendChild(this.widget.domNode);
  }
  _doLayout(heightInPixel) {
    const info = this.editor.getLayoutInfo();
    let width = info.contentWidth - (info.glyphMarginWidth + info.decorationsWidth);
    width = Math.min(640, width);
    this._dimension = new Dimension(width, heightInPixel);
    this.widget.layout(this._dimension);
  }
  _computeHeight() {
    const chatContentHeight = this.widget.contentHeight;
    const editorHeight = this.editor.getLayoutInfo().height;
    const contentHeight = Math.min(
      chatContentHeight,
      Math.max(this.widget.minHeight, editorHeight * 0.42)
    );
    const heightInLines = contentHeight / this.editor.getOption(EditorOption.lineHeight);
    return { linesValue: heightInLines, pixelsValue: contentHeight };
  }
  _onWidth(_widthInPixel) {
    if (this._dimension) {
      this._doLayout(this._dimension.height);
    }
  }
  show(position) {
    assertType(this.container);
    const info = this.editor.getLayoutInfo();
    const marginWithoutIndentation = info.glyphMarginWidth + info.decorationsWidth + info.lineNumbersWidth;
    this.container.style.marginLeft = `${marginWithoutIndentation}px`;
    const revealZone = this._createZoneAndScrollRestoreFn(position);
    super.show(position, this._computeHeight().linesValue);
    this.widget.chatWidget.setVisible(true);
    this.widget.focus();
    revealZone();
    this._scrollUp.enable();
  }
  updatePositionAndHeight(position) {
    const revealZone = this._createZoneAndScrollRestoreFn(position);
    super.updatePositionAndHeight(
      position,
      this._computeHeight().linesValue
    );
    revealZone();
  }
  _createZoneAndScrollRestoreFn(position) {
    const scrollState = StableEditorBottomScrollState.capture(this.editor);
    const lineNumber = position.lineNumber <= 1 ? 1 : 1 + position.lineNumber;
    const scrollTop = this.editor.getScrollTop();
    const lineTop = this.editor.getTopForLineNumber(lineNumber);
    const zoneTop = lineTop - this._computeHeight().pixelsValue;
    const hasResponse = this.widget.chatWidget.viewModel?.getItems().find((candidate) => {
      return isResponseVM(candidate) && candidate.response.value.length > 0;
    });
    if (hasResponse && zoneTop < scrollTop || this._scrollUp.didScrollUpOrDown) {
      return this._scrollUp.runIgnored(() => {
        scrollState.restore(this.editor);
      });
    }
    return this._scrollUp.runIgnored(() => {
      scrollState.restore(this.editor);
      const scrollTop2 = this.editor.getScrollTop();
      const lineTop2 = this.editor.getTopForLineNumber(lineNumber);
      const zoneTop2 = lineTop2 - this._computeHeight().pixelsValue;
      const editorHeight = this.editor.getLayoutInfo().height;
      const lineBottom = this.editor.getBottomForLineNumber(lineNumber);
      let newScrollTop = zoneTop2;
      let forceScrollTop = false;
      if (lineBottom >= scrollTop2 + editorHeight) {
        newScrollTop = lineBottom - editorHeight;
        forceScrollTop = true;
      }
      if (newScrollTop < scrollTop2 || forceScrollTop) {
        this._logService.trace("[IE] REVEAL zone", {
          zoneTop: zoneTop2,
          lineTop: lineTop2,
          lineBottom,
          scrollTop: scrollTop2,
          newScrollTop,
          forceScrollTop
        });
        this.editor.setScrollTop(newScrollTop, ScrollType.Immediate);
      }
    });
  }
  revealRange(range, isLastLine) {
  }
  _getWidth(info) {
    return info.width - info.minimap.minimapWidth;
  }
  hide() {
    const scrollState = StableEditorBottomScrollState.capture(this.editor);
    this._scrollUp.disable();
    this._ctxCursorPosition.reset();
    this.widget.reset();
    this.widget.chatWidget.setVisible(false);
    super.hide();
    aria.status(localize("inlineChatClosed", "Closed inline chat widget"));
    scrollState.restore(this.editor);
  }
};
InlineChatZoneWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IConfigurationService)
], InlineChatZoneWidget);
class ScrollUpState {
  constructor(_editor) {
    this._editor = _editor;
  }
  static {
    __name(this, "ScrollUpState");
  }
  _didScrollUpOrDown;
  _ignoreEvents = false;
  _listener = new MutableDisposable();
  dispose() {
    this._listener.dispose();
  }
  enable() {
    this._didScrollUpOrDown = void 0;
    this._listener.value = this._editor.onDidScrollChange((e) => {
      if (!e.scrollTopChanged || this._ignoreEvents) {
        return;
      }
      this._listener.clear();
      this._didScrollUpOrDown = true;
    });
  }
  disable() {
    this._listener.clear();
    this._didScrollUpOrDown = void 0;
  }
  runIgnored(callback) {
    return () => {
      this._ignoreEvents = true;
      try {
        return callback();
      } finally {
        this._ignoreEvents = false;
      }
    };
  }
  get didScrollUpOrDown() {
    return this._didScrollUpOrDown;
  }
}
export {
  InlineChatZoneWidget
};
//# sourceMappingURL=inlineChatZoneWidget.js.map
