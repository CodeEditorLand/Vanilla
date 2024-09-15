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
import { Dimension, getActiveWindow, IFocusTracker, trackFocus } from "../../../../../base/browser/dom.js";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, toDisposable } from "../../../../../base/common/lifecycle.js";
import { MicrotaskDelay } from "../../../../../base/common/symbols.js";
import "./media/terminalChatWidget.css";
import { localize } from "../../../../../nls.js";
import { IContextKey, IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ChatAgentLocation } from "../../../chat/common/chatAgents.js";
import { InlineChatWidget } from "../../../inlineChat/browser/inlineChatWidget.js";
import { ITerminalInstance } from "../../../terminal/browser/terminal.js";
import { MENU_TERMINAL_CHAT_INPUT, MENU_TERMINAL_CHAT_WIDGET, MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatCommandId, TerminalChatContextKeys } from "./terminalChat.js";
import { TerminalStickyScrollContribution } from "../../stickyScroll/browser/terminalStickyScrollContribution.js";
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["HorizontalMargin"] = 10] = "HorizontalMargin";
  Constants2[Constants2["VerticalMargin"] = 30] = "VerticalMargin";
  return Constants2;
})(Constants || {});
let TerminalChatWidget = class extends Disposable {
  constructor(_terminalElement, _instance, _xterm, _instantiationService, _contextKeyService) {
    super();
    this._terminalElement = _terminalElement;
    this._instance = _instance;
    this._xterm = _xterm;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._focusedContextKey = TerminalChatContextKeys.focused.bindTo(this._contextKeyService);
    this._visibleContextKey = TerminalChatContextKeys.visible.bindTo(this._contextKeyService);
    this._container = document.createElement("div");
    this._container.classList.add("terminal-inline-chat");
    _terminalElement.appendChild(this._container);
    this._inlineChatWidget = this._instantiationService.createInstance(
      InlineChatWidget,
      {
        location: ChatAgentLocation.Terminal,
        resolveData: /* @__PURE__ */ __name(() => {
          return void 0;
        }, "resolveData")
      },
      {
        statusMenuId: {
          menu: MENU_TERMINAL_CHAT_WIDGET_STATUS,
          options: {
            buttonConfigProvider: /* @__PURE__ */ __name((action) => {
              if (action.id === TerminalChatCommandId.ViewInChat || action.id === TerminalChatCommandId.RunCommand || action.id === TerminalChatCommandId.RunFirstCommand) {
                return { isSecondary: false };
              } else {
                return { isSecondary: true };
              }
            }, "buttonConfigProvider")
          }
        },
        chatWidgetViewOptions: {
          rendererOptions: { editableCodeBlock: true },
          menus: {
            telemetrySource: "terminal-inline-chat",
            executeToolbar: MENU_TERMINAL_CHAT_INPUT,
            inputSideToolbar: MENU_TERMINAL_CHAT_WIDGET
          }
        }
      }
    );
    this._register(Event.any(
      this._inlineChatWidget.onDidChangeHeight,
      this._instance.onDimensionsChanged,
      this._inlineChatWidget.chatWidget.onDidChangeContentHeight,
      Event.debounce(this._xterm.raw.onCursorMove, () => void 0, MicrotaskDelay)
    )(() => this._relayout()));
    const observer = new ResizeObserver(() => this._relayout());
    observer.observe(this._terminalElement);
    this._register(toDisposable(() => observer.disconnect()));
    this._reset();
    this._container.appendChild(this._inlineChatWidget.domNode);
    this._focusTracker = this._register(trackFocus(this._container));
    this._register(this._focusTracker.onDidFocus(() => this._focusedContextKey.set(true)));
    this._register(this._focusTracker.onDidBlur(() => {
      this._focusedContextKey.set(false);
      if (!this.inlineChatWidget.responseContent) {
        this.hide();
      }
    }));
    this.hide();
  }
  static {
    __name(this, "TerminalChatWidget");
  }
  _container;
  _onDidHide = this._register(new Emitter());
  onDidHide = this._onDidHide.event;
  _inlineChatWidget;
  get inlineChatWidget() {
    return this._inlineChatWidget;
  }
  _focusTracker;
  _focusedContextKey;
  _visibleContextKey;
  _dimension;
  _relayout() {
    if (this._dimension) {
      this._doLayout(this._inlineChatWidget.contentHeight);
    }
  }
  _doLayout(heightInPixel) {
    const xtermElement = this._xterm.raw.element;
    if (!xtermElement) {
      return;
    }
    const style = getActiveWindow().getComputedStyle(xtermElement);
    const xtermPadding = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
    const width = Math.min(640, xtermElement.clientWidth - 12 - 2 - 10 /* HorizontalMargin */ - xtermPadding);
    const terminalWrapperHeight = this._getTerminalWrapperHeight() ?? Number.MAX_SAFE_INTEGER;
    let height = Math.min(480, heightInPixel, terminalWrapperHeight);
    const top = this._getTop() ?? 0;
    if (width === 0 || height === 0) {
      return;
    }
    let adjustedHeight = void 0;
    if (height < this._inlineChatWidget.contentHeight) {
      if (height - top > 0) {
        height = height - top - 30 /* VerticalMargin */;
      } else {
        height = height - 30 /* VerticalMargin */;
        adjustedHeight = height;
      }
    }
    this._container.style.paddingLeft = style.paddingLeft;
    this._dimension = new Dimension(width, height);
    this._inlineChatWidget.layout(this._dimension);
    this._updateVerticalPosition(adjustedHeight);
  }
  _reset() {
    this._inlineChatWidget.placeholder = localize("default.placeholder", "Ask how to do something in the terminal");
    this._inlineChatWidget.updateInfo(localize("welcome.1", "AI-generated commands may be incorrect"));
  }
  reveal() {
    this._doLayout(this._inlineChatWidget.contentHeight);
    this._container.classList.remove("hide");
    this._visibleContextKey.set(true);
    this._inlineChatWidget.focus();
    this._instance.scrollToBottom();
  }
  _getTop() {
    const font = this._instance.xterm?.getFont();
    if (!font?.charHeight) {
      return;
    }
    const terminalWrapperHeight = this._getTerminalWrapperHeight() ?? 0;
    const cellHeight = font.charHeight * font.lineHeight;
    const topPadding = terminalWrapperHeight - this._instance.rows * cellHeight;
    const cursorY = (this._instance.xterm?.raw.buffer.active.cursorY ?? 0) + 1;
    return topPadding + cursorY * cellHeight;
  }
  _updateVerticalPosition(adjustedHeight) {
    const top = this._getTop();
    if (!top) {
      return;
    }
    this._container.style.top = `${top}px`;
    const widgetHeight = this._inlineChatWidget.contentHeight;
    const terminalWrapperHeight = this._getTerminalWrapperHeight();
    if (!terminalWrapperHeight) {
      return;
    }
    if (top > terminalWrapperHeight - widgetHeight && terminalWrapperHeight - widgetHeight > 0) {
      this._setTerminalOffset(top - (terminalWrapperHeight - widgetHeight));
    } else if (adjustedHeight) {
      this._setTerminalOffset(adjustedHeight);
    } else {
      this._setTerminalOffset(void 0);
    }
  }
  _getTerminalWrapperHeight() {
    return this._terminalElement.clientHeight;
  }
  hide() {
    this._container.classList.add("hide");
    this._inlineChatWidget.reset();
    this._reset();
    this._inlineChatWidget.updateToolbar(false);
    this._visibleContextKey.set(false);
    this._inlineChatWidget.value = "";
    this._instance.focus();
    this._setTerminalOffset(void 0);
    this._onDidHide.fire();
  }
  _setTerminalOffset(offset) {
    if (offset === void 0 || this._container.classList.contains("hide")) {
      this._terminalElement.style.position = "";
      this._terminalElement.style.bottom = "";
      TerminalStickyScrollContribution.get(this._instance)?.hideUnlock();
    } else {
      this._terminalElement.style.position = "relative";
      this._terminalElement.style.bottom = `${offset}px`;
      TerminalStickyScrollContribution.get(this._instance)?.hideLock();
    }
  }
  focus() {
    this._inlineChatWidget.focus();
  }
  hasFocus() {
    return this._inlineChatWidget.hasFocus();
  }
  input() {
    return this._inlineChatWidget.value;
  }
  setValue(value) {
    this._inlineChatWidget.value = value ?? "";
  }
  acceptCommand(code, shouldExecute) {
    this._instance.runCommand(code, shouldExecute);
    this.hide();
  }
  get focusTracker() {
    return this._focusTracker;
  }
};
TerminalChatWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IContextKeyService)
], TerminalChatWidget);
export {
  TerminalChatWidget
};
//# sourceMappingURL=terminalChatWidget.js.map
