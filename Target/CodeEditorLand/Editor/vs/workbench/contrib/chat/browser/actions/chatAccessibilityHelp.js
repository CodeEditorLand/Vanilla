var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../nls.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { IChatWidgetService } from "../chat.js";
import { AccessibleViewProviderId, AccessibleViewType, AccessibleContentProvider } from "../../../../../platform/accessibility/browser/accessibleView.js";
import { AccessibilityVerbositySettingId } from "../../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibleDiffViewerNext } from "../../../../../editor/browser/widget/diffEditor/commands.js";
import { INLINE_CHAT_ID } from "../../../inlineChat/common/inlineChat.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { CONTEXT_IN_CHAT_SESSION, CONTEXT_RESPONSE, CONTEXT_REQUEST, CONTEXT_CHAT_LOCATION } from "../../common/chatContextKeys.js";
import { IAccessibleViewImplentation } from "../../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { ChatAgentLocation } from "../../common/chatAgents.js";
class ChatAccessibilityHelp {
  static {
    __name(this, "ChatAccessibilityHelp");
  }
  priority = 107;
  name = "panelChat";
  type = AccessibleViewType.Help;
  when = ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel), ContextKeyExpr.or(CONTEXT_IN_CHAT_SESSION, CONTEXT_RESPONSE, CONTEXT_REQUEST));
  getProvider(accessor) {
    const codeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor() || accessor.get(ICodeEditorService).getFocusedCodeEditor();
    return getChatAccessibilityHelpProvider(accessor, codeEditor ?? void 0, "panelChat");
  }
}
function getAccessibilityHelpText(type) {
  const content = [];
  if (type === "panelChat") {
    content.push(localize("chat.overview", "The chat view is comprised of an input box and a request/response list. The input box is used to make requests and the list is used to display responses."));
    content.push(localize("chat.requestHistory", "In the input box, use up and down arrows to navigate your request history. Edit input and use enter or the submit button to run a new request."));
    content.push(localize("chat.inspectResponse", "In the input box, inspect the last response in the accessible view{0}.", "<keybinding:editor.action.accessibleView>"));
    content.push(localize("chat.followUp", "In the input box, navigate to the suggested follow up question (Shift+Tab) and press Enter to run it."));
    content.push(localize("chat.announcement", "Chat responses will be announced as they come in. A response will indicate the number of code blocks, if any, and then the rest of the response."));
    content.push(localize("workbench.action.chat.focus", "To focus the chat request/response list, which can be navigated with up and down arrows, invoke the Focus Chat command{0}.", "<keybinding:chat.action.focus>"));
    content.push(localize("workbench.action.chat.focusInput", "To focus the input box for chat requests, invoke the Focus Chat Input command{0}.", "<keybinding:workbench.action.chat.focusInput>"));
    content.push(localize("workbench.action.chat.nextCodeBlock", "To focus the next code block within a response, invoke the Chat: Next Code Block command{0}.", "<keybinding:workbench.action.chat.nextCodeBlock>"));
    content.push(localize("workbench.action.chat.nextFileTree", "To focus the next file tree within a response, invoke the Chat: Next File Tree command{0}.", "<keybinding:workbench.action.chat.nextFileTree>"));
    content.push(localize("workbench.action.chat.newChat", "To create a new chat session, invoke the New Chat command{0}.", "<keybinding:workbench.action.chat.new>"));
  } else {
    content.push(localize("inlineChat.overview", "Inline chat occurs within a code editor and takes into account the current selection. It is useful for making changes to the current editor. For example, fixing diagnostics, documenting or refactoring code. Keep in mind that AI generated code may be incorrect."));
    content.push(localize("inlineChat.access", "It can be activated via code actions or directly using the command: Inline Chat: Start Inline Chat{0}.", "<keybinding:inlineChat.start>"));
    content.push(localize("inlineChat.requestHistory", "In the input box, use Show Previous{0} and Show Next{1} to navigate your request history. Edit input and use enter or the submit button to run a new request.", "<keybinding:history.showPrevious>", "<keybinding:history.showNext>"));
    content.push(localize("inlineChat.inspectResponse", "In the input box, inspect the response in the accessible view{0}.", "<keybinding:editor.action.accessibleView>"));
    content.push(localize("inlineChat.contextActions", "Context menu actions may run a request prefixed with a /. Type / to discover such ready-made commands."));
    content.push(localize("inlineChat.fix", "If a fix action is invoked, a response will indicate the problem with the current code. A diff editor will be rendered and can be reached by tabbing."));
    content.push(localize("inlineChat.diff", "Once in the diff editor, enter review mode with{0}. Use up and down arrows to navigate lines with the proposed changes.", AccessibleDiffViewerNext.id));
    content.push(localize("inlineChat.toolbar", "Use tab to reach conditional parts like commands, status, message responses and more."));
  }
  content.push(localize("chat.signals", "Accessibility Signals can be changed via settings with a prefix of signals.chat. By default, if a request takes more than 4 seconds, you will hear a sound indicating that progress is still occurring."));
  return content.join("\n");
}
__name(getAccessibilityHelpText, "getAccessibilityHelpText");
function getChatAccessibilityHelpProvider(accessor, editor, type) {
  const widgetService = accessor.get(IChatWidgetService);
  const inputEditor = type === "panelChat" ? widgetService.lastFocusedWidget?.inputEditor : editor;
  if (!inputEditor) {
    return;
  }
  const domNode = inputEditor.getDomNode() ?? void 0;
  if (!domNode) {
    return;
  }
  const cachedPosition = inputEditor.getPosition();
  inputEditor.getSupportedActions();
  const helpText = getAccessibilityHelpText(type);
  return new AccessibleContentProvider(
    type === "panelChat" ? AccessibleViewProviderId.Chat : AccessibleViewProviderId.InlineChat,
    { type: AccessibleViewType.Help },
    () => helpText,
    () => {
      if (type === "panelChat" && cachedPosition) {
        inputEditor.setPosition(cachedPosition);
        inputEditor.focus();
      } else if (type === "inlineChat") {
        const ctrl = editor?.getContribution(INLINE_CHAT_ID);
        ctrl?.focus();
      }
    },
    type === "panelChat" ? AccessibilityVerbositySettingId.Chat : AccessibilityVerbositySettingId.InlineChat
  );
}
__name(getChatAccessibilityHelpProvider, "getChatAccessibilityHelpProvider");
export {
  ChatAccessibilityHelp,
  getAccessibilityHelpText,
  getChatAccessibilityHelpProvider
};
//# sourceMappingURL=chatAccessibilityHelp.js.map
