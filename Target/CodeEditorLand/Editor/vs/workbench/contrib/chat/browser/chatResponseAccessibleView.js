var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { renderMarkdownAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { IMarkdownString, MarkdownString } from "../../../../base/common/htmlContent.js";
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { IChatWidgetService, IChatWidget, ChatTreeItem } from "./chat.js";
import { CONTEXT_IN_CHAT_SESSION } from "../common/chatContextKeys.js";
import { ChatWelcomeMessageModel } from "../common/chatModel.js";
import { isResponseVM } from "../common/chatViewModel.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
class ChatResponseAccessibleView {
  static {
    __name(this, "ChatResponseAccessibleView");
  }
  priority = 100;
  name = "panelChat";
  type = AccessibleViewType.View;
  when = CONTEXT_IN_CHAT_SESSION;
  getProvider(accessor) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const chatInputFocused = widget.hasInputFocus();
    if (chatInputFocused) {
      widget.focusLastMessage();
    }
    const verifiedWidget = widget;
    const focusedItem = verifiedWidget.getFocus();
    if (!focusedItem) {
      return;
    }
    return new ChatResponseAccessibleProvider(verifiedWidget, focusedItem, chatInputFocused);
  }
}
class ChatResponseAccessibleProvider extends Disposable {
  constructor(_widget, item, _chatInputFocused) {
    super();
    this._widget = _widget;
    this._chatInputFocused = _chatInputFocused;
    this._focusedItem = item;
  }
  static {
    __name(this, "ChatResponseAccessibleProvider");
  }
  _focusedItem;
  id = AccessibleViewProviderId.Chat;
  verbositySettingKey = AccessibilityVerbositySettingId.Chat;
  options = { type: AccessibleViewType.View };
  provideContent() {
    return this._getContent(this._focusedItem);
  }
  _getContent(item) {
    const isWelcome = item instanceof ChatWelcomeMessageModel;
    let responseContent = isResponseVM(item) ? item.response.toString() : "";
    if (isWelcome) {
      const welcomeReplyContents = [];
      for (const content of item.content) {
        if (Array.isArray(content)) {
          welcomeReplyContents.push(...content.map((m) => m.message));
        } else {
          welcomeReplyContents.push(content.value);
        }
      }
      responseContent = welcomeReplyContents.join("\n");
    }
    if (!responseContent && "errorDetails" in item && item.errorDetails) {
      responseContent = item.errorDetails.message;
    }
    return renderMarkdownAsPlaintext(new MarkdownString(responseContent), true);
  }
  onClose() {
    this._widget.reveal(this._focusedItem);
    if (this._chatInputFocused) {
      this._widget.focusInput();
    } else {
      this._widget.focus(this._focusedItem);
    }
  }
  provideNextContent() {
    const next = this._widget.getSibling(this._focusedItem, "next");
    if (next) {
      this._focusedItem = next;
      return this._getContent(next);
    }
    return;
  }
  providePreviousContent() {
    const previous = this._widget.getSibling(this._focusedItem, "previous");
    if (previous) {
      this._focusedItem = previous;
      return this._getContent(previous);
    }
    return;
  }
}
export {
  ChatResponseAccessibleView
};
//# sourceMappingURL=chatResponseAccessibleView.js.map
