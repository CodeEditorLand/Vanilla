import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { ICodeEditorService } from "../../../../../editor/browser/services/codeEditorService.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { localize, localize2 } from "../../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { InlineChatController } from "../../../inlineChat/browser/inlineChatController.js";
import { CONTEXT_CHAT_ENABLED } from "../../common/chatContextKeys.js";
import { IQuickChatService } from "../chat.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const ASK_QUICK_QUESTION_ACTION_ID = "workbench.action.quickchat.toggle";
function registerQuickChatActions() {
  registerAction2(QuickChatGlobalAction);
  registerAction2(AskQuickChatAction);
  registerAction2(
    class OpenInChatViewAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.quickchat.openInChatView",
          title: localize2(
            "chat.openInChatView.label",
            "Open in Chat View"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.commentDiscussion,
          menu: {
            id: MenuId.ChatInputSide,
            group: "navigation",
            order: 10
          }
        });
      }
      run(accessor) {
        const quickChatService = accessor.get(IQuickChatService);
        quickChatService.openInChatView();
      }
    }
  );
  registerAction2(
    class CloseQuickChatAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.quickchat.close",
          title: localize2(
            "chat.closeQuickChat.label",
            "Close Quick Chat"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.close,
          menu: {
            id: MenuId.ChatInputSide,
            group: "navigation",
            order: 20
          }
        });
      }
      run(accessor) {
        const quickChatService = accessor.get(IQuickChatService);
        quickChatService.close();
      }
    }
  );
  registerAction2(
    class LaunchInlineChatFromQuickChatAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.quickchat.launchInlineChat",
          title: localize2(
            "chat.launchInlineChat.label",
            "Launch Inline Chat"
          ),
          f1: false,
          category: CHAT_CATEGORY
        });
      }
      async run(accessor) {
        const quickChatService = accessor.get(IQuickChatService);
        const codeEditorService = accessor.get(ICodeEditorService);
        if (quickChatService.focused) {
          quickChatService.close();
        }
        const codeEditor = codeEditorService.getActiveCodeEditor();
        if (!codeEditor) {
          return;
        }
        const controller = InlineChatController.get(codeEditor);
        if (!controller) {
          return;
        }
        await controller.run();
        controller.focus();
      }
    }
  );
}
class QuickChatGlobalAction extends Action2 {
  constructor() {
    super({
      id: ASK_QUICK_QUESTION_ACTION_ID,
      title: localize2("quickChat", "Quick Chat"),
      precondition: CONTEXT_CHAT_ENABLED,
      icon: Codicon.commentDiscussion,
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyI,
        linux: {
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyMod.Alt | KeyCode.KeyI
        }
      },
      metadata: {
        description: localize("toggle.desc", "Toggle the quick chat"),
        args: [
          {
            name: "args",
            schema: {
              anyOf: [
                {
                  type: "object",
                  required: ["query"],
                  properties: {
                    query: {
                      description: localize(
                        "toggle.query",
                        "The query to open the quick chat with"
                      ),
                      type: "string"
                    },
                    isPartialQuery: {
                      description: localize(
                        "toggle.isPartialQuery",
                        "Whether the query is partial; it will wait for more user input"
                      ),
                      type: "boolean"
                    }
                  }
                },
                {
                  type: "string",
                  description: localize(
                    "toggle.query",
                    "The query to open the quick chat with"
                  )
                }
              ]
            }
          }
        ]
      }
    });
  }
  run(accessor, query) {
    const quickChatService = accessor.get(IQuickChatService);
    let options;
    switch (typeof query) {
      case "string":
        options = { query };
        break;
      case "object":
        options = query;
        break;
    }
    if (options?.query) {
      options.selection = new Selection(
        1,
        options.query.length + 1,
        1,
        options.query.length + 1
      );
    }
    quickChatService.toggle(options);
  }
}
class AskQuickChatAction extends Action2 {
  constructor() {
    super({
      id: `workbench.action.openQuickChat`,
      category: CHAT_CATEGORY,
      title: localize2("interactiveSession.open", "Open Quick Chat"),
      f1: true
    });
  }
  run(accessor, query) {
    const quickChatService = accessor.get(IQuickChatService);
    quickChatService.toggle(
      query ? {
        query,
        selection: new Selection(
          1,
          query.length + 1,
          1,
          query.length + 1
        )
      } : void 0
    );
  }
}
export {
  ASK_QUICK_QUESTION_ACTION_ID,
  registerQuickChatActions
};
