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
import { AriaRole } from "../../../../base/browser/ui/aria/aria.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { marked } from "../../../../base/common/marked/marked.js";
import { localize } from "../../../../nls.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { IAccessibleViewService } from "../../../../platform/accessibility/browser/accessibleView.js";
import { ChatTreeItem } from "./chat.js";
import { isRequestVM, isResponseVM, isWelcomeVM, IChatResponseViewModel } from "../common/chatViewModel.js";
let ChatAccessibilityProvider = class {
  constructor(_accessibleViewService) {
    this._accessibleViewService = _accessibleViewService;
  }
  static {
    __name(this, "ChatAccessibilityProvider");
  }
  getWidgetRole() {
    return "list";
  }
  getRole(element) {
    return "listitem";
  }
  getWidgetAriaLabel() {
    return localize("chat", "Chat");
  }
  getAriaLabel(element) {
    if (isRequestVM(element)) {
      return element.messageText;
    }
    if (isResponseVM(element)) {
      return this._getLabelWithCodeBlockCount(element);
    }
    if (isWelcomeVM(element)) {
      return element.content.map((c) => "value" in c ? c.value : c.map((followup) => followup.message).join("\n")).join("\n");
    }
    return "";
  }
  _getLabelWithCodeBlockCount(element) {
    const accessibleViewHint = this._accessibleViewService.getOpenAriaHint(AccessibilityVerbositySettingId.Chat);
    let label = "";
    const fileTreeCount = element.response.value.filter((v) => !("value" in v))?.length ?? 0;
    let fileTreeCountHint = "";
    switch (fileTreeCount) {
      case 0:
        break;
      case 1:
        fileTreeCountHint = localize("singleFileTreeHint", "1 file tree");
        break;
      default:
        fileTreeCountHint = localize("multiFileTreeHint", "{0} file trees", fileTreeCount);
        break;
    }
    const codeBlockCount = marked.lexer(element.response.toString()).filter((token) => token.type === "code")?.length ?? 0;
    switch (codeBlockCount) {
      case 0:
        label = accessibleViewHint ? localize("noCodeBlocksHint", "{0} {1} {2}", fileTreeCountHint, element.response.toString(), accessibleViewHint) : localize("noCodeBlocks", "{0} {1}", fileTreeCountHint, element.response.toString());
        break;
      case 1:
        label = accessibleViewHint ? localize("singleCodeBlockHint", "{0} 1 code block: {1} {2}", fileTreeCountHint, element.response.toString(), accessibleViewHint) : localize("singleCodeBlock", "{0} 1 code block: {1}", fileTreeCountHint, element.response.toString());
        break;
      default:
        label = accessibleViewHint ? localize("multiCodeBlockHint", "{0} {1} code blocks: {2}", fileTreeCountHint, codeBlockCount, element.response.toString(), accessibleViewHint) : localize("multiCodeBlock", "{0} {1} code blocks", fileTreeCountHint, codeBlockCount, element.response.toString());
        break;
    }
    return label;
  }
};
ChatAccessibilityProvider = __decorateClass([
  __decorateParam(0, IAccessibleViewService)
], ChatAccessibilityProvider);
export {
  ChatAccessibilityProvider
};
//# sourceMappingURL=chatAccessibilityProvider.js.map
