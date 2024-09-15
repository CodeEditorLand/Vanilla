var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { renderMarkdownAsPlaintext } from "../../../../base/browser/markdownRenderer.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import {
  AccessibleContentProvider,
  AccessibleViewProviderId,
  AccessibleViewType
} from "../../../../platform/accessibility/browser/accessibleView.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import {
  CTX_INLINE_CHAT_FOCUSED,
  CTX_INLINE_CHAT_RESPONSE_FOCUSED
} from "../common/inlineChat.js";
import { InlineChatController } from "./inlineChatController.js";
class InlineChatAccessibleView {
  static {
    __name(this, "InlineChatAccessibleView");
  }
  priority = 100;
  name = "inlineChat";
  when = ContextKeyExpr.or(
    CTX_INLINE_CHAT_FOCUSED,
    CTX_INLINE_CHAT_RESPONSE_FOCUSED
  );
  type = AccessibleViewType.View;
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    const controller = InlineChatController.get(editor);
    if (!controller) {
      return;
    }
    const responseContent = controller?.getMessage();
    if (!responseContent) {
      return;
    }
    return new AccessibleContentProvider(
      AccessibleViewProviderId.InlineChat,
      { type: AccessibleViewType.View },
      () => renderMarkdownAsPlaintext(
        new MarkdownString(responseContent),
        true
      ),
      () => controller.focus(),
      AccessibilityVerbositySettingId.InlineChat
    );
  }
}
export {
  InlineChatAccessibleView
};
//# sourceMappingURL=inlineChatAccessibleView.js.map
