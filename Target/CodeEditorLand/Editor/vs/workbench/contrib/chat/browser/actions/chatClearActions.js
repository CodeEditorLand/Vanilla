var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../nls.js";
import { AccessibilitySignal, IAccessibilitySignalService } from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { CHAT_CATEGORY, isChatViewTitleActionContext } from "./chatActions.js";
import { clearChatEditor } from "./chatClear.js";
import { CHAT_VIEW_ID, IChatWidgetService } from "../chat.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { ChatViewPane } from "../chatViewPane.js";
import { CONTEXT_IN_CHAT_SESSION, CONTEXT_CHAT_ENABLED } from "../../common/chatContextKeys.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
const ACTION_ID_NEW_CHAT = `workbench.action.chat.newChat`;
function registerNewChatActions() {
  registerAction2(class NewChatEditorAction extends Action2 {
    static {
      __name(this, "NewChatEditorAction");
    }
    constructor() {
      super({
        id: "workbench.action.chatEditor.newChat",
        title: localize2("chat.newChat.label", "New Chat"),
        icon: Codicon.plus,
        f1: false,
        precondition: CONTEXT_CHAT_ENABLED,
        menu: [{
          id: MenuId.EditorTitle,
          group: "navigation",
          order: 0,
          when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID)
        }]
      });
    }
    async run(accessor, ...args) {
      announceChatCleared(accessor.get(IAccessibilitySignalService));
      await clearChatEditor(accessor);
    }
  });
  registerAction2(class GlobalClearChatAction extends Action2 {
    static {
      __name(this, "GlobalClearChatAction");
    }
    constructor() {
      super({
        id: ACTION_ID_NEW_CHAT,
        title: localize2("chat.newChat.label", "New Chat"),
        category: CHAT_CATEGORY,
        icon: Codicon.plus,
        precondition: CONTEXT_CHAT_ENABLED,
        f1: true,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyMod.CtrlCmd | KeyCode.KeyL,
          mac: {
            primary: KeyMod.WinCtrl | KeyCode.KeyL
          },
          when: CONTEXT_IN_CHAT_SESSION
        },
        menu: [
          {
            id: MenuId.ChatContext,
            group: "z_clear"
          },
          {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", CHAT_VIEW_ID),
            group: "navigation",
            order: -1
          }
        ]
      });
    }
    async run(accessor, ...args) {
      const context = args[0];
      const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
      if (isChatViewTitleActionContext(context)) {
        announceChatCleared(accessibilitySignalService);
        context.chatView.widget.clear();
        context.chatView.widget.focusInput();
      } else {
        const widgetService = accessor.get(IChatWidgetService);
        const viewsService = accessor.get(IViewsService);
        let widget = widgetService.lastFocusedWidget;
        if (!widget) {
          const chatView = await viewsService.openView(CHAT_VIEW_ID);
          widget = chatView.widget;
        }
        announceChatCleared(accessibilitySignalService);
        widget.clear();
        widget.focusInput();
      }
    }
  });
}
__name(registerNewChatActions, "registerNewChatActions");
function announceChatCleared(accessibilitySignalService) {
  accessibilitySignalService.playSignal(AccessibilitySignal.clear);
}
__name(announceChatCleared, "announceChatCleared");
export {
  ACTION_ID_NEW_CHAT,
  registerNewChatActions
};
//# sourceMappingURL=chatClearActions.js.map
