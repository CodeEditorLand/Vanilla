var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  AccessibleContentProvider,
  AccessibleViewProviderId,
  AccessibleViewType
} from "../../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibilityVerbositySettingId } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { TerminalChatContextKeys } from "../../../terminal/terminalContribExports.js";
import { TerminalChatController } from "./terminalChatController.js";
class TerminalInlineChatAccessibleView {
  static {
    __name(this, "TerminalInlineChatAccessibleView");
  }
  priority = 105;
  name = "terminalInlineChat";
  type = AccessibleViewType.View;
  when = TerminalChatContextKeys.focused;
  getProvider(accessor) {
    const terminalService = accessor.get(ITerminalService);
    const controller = terminalService.activeInstance?.getContribution(
      TerminalChatController.ID
    ) ?? void 0;
    if (!controller?.lastResponseContent) {
      return;
    }
    const responseContent = controller.lastResponseContent;
    return new AccessibleContentProvider(
      AccessibleViewProviderId.TerminalChat,
      { type: AccessibleViewType.View },
      () => {
        return responseContent;
      },
      () => {
        controller.focus();
      },
      AccessibilityVerbositySettingId.InlineChat
    );
  }
}
export {
  TerminalInlineChatAccessibleView
};
//# sourceMappingURL=terminalChatAccessibleView.js.map
