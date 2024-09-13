var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { AccessibleViewProviderId, AccessibleViewType, AccessibleContentProvider } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibilityVerbositySettingId } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
import { TerminalChatController } from "./terminalChatController.js";
import { IAccessibleViewImplentation } from "../../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { TerminalChatContextKeys } from "../../../terminal/terminalContribExports.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
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
    const controller = terminalService.activeInstance?.getContribution(TerminalChatController.ID) ?? void 0;
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
