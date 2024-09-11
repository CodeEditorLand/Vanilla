var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { IChatWidget, IChatWidgetService } from "../chat.js";
import { IChatAgentService } from "../../common/chatAgents.js";
import { CONTEXT_CHAT_INPUT_HAS_AGENT, CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_CHAT_REQUEST_IN_PROGRESS, CONTEXT_IN_CHAT_INPUT } from "../../common/chatContextKeys.js";
import { chatAgentLeader, extractAgentAndCommand } from "../../common/chatParserTypes.js";
import { IChatService } from "../../common/chatService.js";
class SubmitAction extends Action2 {
  static {
    __name(this, "SubmitAction");
  }
  static ID = "workbench.action.chat.submit";
  constructor() {
    super({
      id: SubmitAction.ID,
      title: localize2("interactive.submit.label", "Send"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.send,
      precondition: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
      keybinding: {
        when: CONTEXT_IN_CHAT_INPUT,
        primary: KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      },
      menu: [
        {
          id: MenuId.ChatExecuteSecondary,
          group: "group_1"
        },
        {
          id: MenuId.ChatExecute,
          when: CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(),
          group: "navigation"
        }
      ]
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    widget?.acceptInput(context?.inputValue);
  }
}
class ChatSubmitSecondaryAgentAction extends Action2 {
  static {
    __name(this, "ChatSubmitSecondaryAgentAction");
  }
  static ID = "workbench.action.chat.submitSecondaryAgent";
  constructor() {
    super({
      id: ChatSubmitSecondaryAgentAction.ID,
      title: localize2({ key: "actions.chat.submitSecondaryAgent", comment: ["Send input from the chat input box to the secondary agent"] }, "Submit to Secondary Agent"),
      precondition: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_CHAT_INPUT_HAS_AGENT.negate(), CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
      keybinding: {
        when: CONTEXT_IN_CHAT_INPUT,
        primary: KeyMod.CtrlCmd | KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      },
      menu: {
        id: MenuId.ChatExecuteSecondary,
        group: "group_1"
      }
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const agentService = accessor.get(IChatAgentService);
    const secondaryAgent = agentService.getSecondaryAgent();
    if (!secondaryAgent) {
      return;
    }
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    if (extractAgentAndCommand(widget.parsedInput).agentPart) {
      widget.acceptInput();
    } else {
      widget.lastSelectedAgent = secondaryAgent;
      widget.acceptInputWithPrefix(`${chatAgentLeader}${secondaryAgent.name}`);
    }
  }
}
class SendToNewChatAction extends Action2 {
  static {
    __name(this, "SendToNewChatAction");
  }
  constructor() {
    super({
      id: "workbench.action.chat.sendToNewChat",
      title: localize2("chat.newChat.label", "Send to New Chat"),
      precondition: ContextKeyExpr.and(CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(), CONTEXT_CHAT_INPUT_HAS_TEXT),
      category: CHAT_CATEGORY,
      f1: false,
      menu: {
        id: MenuId.ChatExecuteSecondary,
        group: "group_2"
      },
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Enter,
        when: CONTEXT_IN_CHAT_INPUT
      }
    });
  }
  async run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    widget.clear();
    widget.acceptInput(context?.inputValue);
  }
}
class CancelAction extends Action2 {
  static {
    __name(this, "CancelAction");
  }
  static ID = "workbench.action.chat.cancel";
  constructor() {
    super({
      id: CancelAction.ID,
      title: localize2("interactive.cancel.label", "Cancel"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.debugStop,
      menu: {
        id: MenuId.ChatExecute,
        when: CONTEXT_CHAT_REQUEST_IN_PROGRESS,
        group: "navigation"
      },
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.Escape,
        win: { primary: KeyMod.Alt | KeyCode.Backspace }
      }
    });
  }
  run(accessor, ...args) {
    const context = args[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const chatService = accessor.get(IChatService);
    if (widget.viewModel) {
      chatService.cancelCurrentRequestForSession(widget.viewModel.sessionId);
    }
  }
}
function registerChatExecuteActions() {
  registerAction2(SubmitAction);
  registerAction2(CancelAction);
  registerAction2(SendToNewChatAction);
  registerAction2(ChatSubmitSecondaryAgentAction);
}
__name(registerChatExecuteActions, "registerChatExecuteActions");
export {
  CancelAction,
  ChatSubmitSecondaryAgentAction,
  SubmitAction,
  registerChatExecuteActions
};
//# sourceMappingURL=chatExecuteActions.js.map
