var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { marked } from "../../../../../base/common/marked/marked.js";
import { IBulkEditService } from "../../../../../editor/browser/services/bulkEditService.js";
import { localize2 } from "../../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ResourceNotebookCellEdit } from "../../../bulkEdit/browser/bulkCellEdits.js";
import { MENU_INLINE_CHAT_WIDGET_SECONDARY } from "../../../inlineChat/common/inlineChat.js";
import {
  CellEditType,
  CellKind,
  NOTEBOOK_EDITOR_ID
} from "../../../notebook/common/notebookCommon.js";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "../../../notebook/common/notebookContextKeys.js";
import {
  CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING,
  CONTEXT_IN_CHAT_INPUT,
  CONTEXT_IN_CHAT_SESSION,
  CONTEXT_REQUEST,
  CONTEXT_RESPONSE,
  CONTEXT_RESPONSE_ERROR,
  CONTEXT_RESPONSE_FILTERED,
  CONTEXT_RESPONSE_VOTE,
  CONTEXT_VOTE_UP_ENABLED
} from "../../common/chatContextKeys.js";
import {
  ChatAgentVoteDirection,
  IChatService
} from "../../common/chatService.js";
import { isRequestVM, isResponseVM } from "../../common/chatViewModel.js";
import { IChatWidgetService } from "../chat.js";
import { CHAT_CATEGORY } from "./chatActions.js";
const MarkUnhelpfulActionId = "workbench.action.chat.markUnhelpful";
function registerChatTitleActions() {
  registerAction2(
    class MarkHelpfulAction extends Action2 {
      static {
        __name(this, "MarkHelpfulAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.markHelpful",
          title: localize2("interactive.helpful.label", "Helpful"),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.thumbsup,
          toggled: CONTEXT_RESPONSE_VOTE.isEqualTo("up"),
          menu: [
            {
              id: MenuId.ChatMessageTitle,
              group: "navigation",
              order: 1,
              when: ContextKeyExpr.and(
                CONTEXT_RESPONSE,
                CONTEXT_VOTE_UP_ENABLED,
                CONTEXT_RESPONSE_ERROR.negate()
              )
            },
            {
              id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
              group: "navigation",
              order: 1,
              when: ContextKeyExpr.and(
                CONTEXT_RESPONSE,
                CONTEXT_VOTE_UP_ENABLED,
                CONTEXT_RESPONSE_ERROR.negate()
              )
            }
          ]
        });
      }
      run(accessor, ...args) {
        const item = args[0];
        if (!isResponseVM(item)) {
          return;
        }
        const chatService = accessor.get(IChatService);
        chatService.notifyUserAction({
          agentId: item.agent?.id,
          command: item.slashCommand?.name,
          sessionId: item.sessionId,
          requestId: item.requestId,
          result: item.result,
          action: {
            kind: "vote",
            direction: ChatAgentVoteDirection.Up,
            reason: void 0
          }
        });
        item.setVote(ChatAgentVoteDirection.Up);
        item.setVoteDownReason(void 0);
      }
    }
  );
  registerAction2(
    class MarkUnhelpfulAction extends Action2 {
      static {
        __name(this, "MarkUnhelpfulAction");
      }
      constructor() {
        super({
          id: MarkUnhelpfulActionId,
          title: localize2(
            "interactive.unhelpful.label",
            "Unhelpful"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.thumbsdown,
          toggled: CONTEXT_RESPONSE_VOTE.isEqualTo("down"),
          menu: [
            {
              id: MenuId.ChatMessageTitle,
              group: "navigation",
              order: 2,
              when: ContextKeyExpr.and(
                CONTEXT_RESPONSE,
                CONTEXT_RESPONSE_ERROR.negate()
              )
            },
            {
              id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
              group: "navigation",
              order: 2,
              when: ContextKeyExpr.and(
                CONTEXT_RESPONSE,
                CONTEXT_RESPONSE_ERROR.negate()
              )
            }
          ]
        });
      }
      run(accessor, ...args) {
        const item = args[0];
        if (!isResponseVM(item)) {
          return;
        }
        const reason = args[1];
        if (typeof reason !== "string") {
          return;
        }
        item.setVote(ChatAgentVoteDirection.Down);
        item.setVoteDownReason(reason);
        const chatService = accessor.get(IChatService);
        chatService.notifyUserAction({
          agentId: item.agent?.id,
          command: item.slashCommand?.name,
          sessionId: item.sessionId,
          requestId: item.requestId,
          result: item.result,
          action: {
            kind: "vote",
            direction: ChatAgentVoteDirection.Down,
            reason: item.voteDownReason
          }
        });
      }
    }
  );
  registerAction2(
    class ReportIssueForBugAction extends Action2 {
      static {
        __name(this, "ReportIssueForBugAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.reportIssueForBug",
          title: localize2(
            "interactive.reportIssueForBug.label",
            "Report Issue"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.report,
          menu: [
            {
              id: MenuId.ChatMessageTitle,
              group: "navigation",
              order: 3,
              when: ContextKeyExpr.and(
                CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING,
                CONTEXT_RESPONSE
              )
            },
            {
              id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
              group: "navigation",
              order: 3,
              when: ContextKeyExpr.and(
                CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING,
                CONTEXT_RESPONSE
              )
            }
          ]
        });
      }
      run(accessor, ...args) {
        const item = args[0];
        if (!isResponseVM(item)) {
          return;
        }
        const chatService = accessor.get(IChatService);
        chatService.notifyUserAction({
          agentId: item.agent?.id,
          command: item.slashCommand?.name,
          sessionId: item.sessionId,
          requestId: item.requestId,
          result: item.result,
          action: {
            kind: "bug"
          }
        });
      }
    }
  );
  registerAction2(
    class InsertToNotebookAction extends Action2 {
      static {
        __name(this, "InsertToNotebookAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.insertIntoNotebook",
          title: localize2(
            "interactive.insertIntoNotebook.label",
            "Insert into Notebook"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.insert,
          menu: {
            id: MenuId.ChatMessageTitle,
            group: "navigation",
            isHiddenByDefault: true,
            when: ContextKeyExpr.and(
              NOTEBOOK_IS_ACTIVE_EDITOR,
              CONTEXT_RESPONSE,
              CONTEXT_RESPONSE_FILTERED.negate()
            )
          }
        });
      }
      async run(accessor, ...args) {
        const item = args[0];
        if (!isResponseVM(item)) {
          return;
        }
        const editorService = accessor.get(IEditorService);
        if (editorService.activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
          const notebookEditor = editorService.activeEditorPane.getControl();
          if (!notebookEditor.hasModel()) {
            return;
          }
          if (notebookEditor.isReadOnly) {
            return;
          }
          const value = item.response.toString();
          const splitContents = splitMarkdownAndCodeBlocks(value);
          const focusRange = notebookEditor.getFocus();
          const index = Math.max(focusRange.end, 0);
          const bulkEditService = accessor.get(IBulkEditService);
          await bulkEditService.apply(
            [
              new ResourceNotebookCellEdit(
                notebookEditor.textModel.uri,
                {
                  editType: CellEditType.Replace,
                  index,
                  count: 0,
                  cells: splitContents.map((content) => {
                    const kind = content.type === "markdown" ? CellKind.Markup : CellKind.Code;
                    const language = content.type === "markdown" ? "markdown" : content.language;
                    const mime = content.type === "markdown" ? "text/markdown" : `text/x-${content.language}`;
                    return {
                      cellKind: kind,
                      language,
                      mime,
                      source: content.content,
                      outputs: [],
                      metadata: {}
                    };
                  })
                }
              )
            ],
            { quotableLabel: "Insert into Notebook" }
          );
        }
      }
    }
  );
  registerAction2(
    class RemoveAction extends Action2 {
      static {
        __name(this, "RemoveAction");
      }
      constructor() {
        super({
          id: "workbench.action.chat.remove",
          title: localize2(
            "chat.remove.label",
            "Remove Request and Response"
          ),
          f1: false,
          category: CHAT_CATEGORY,
          icon: Codicon.x,
          keybinding: {
            primary: KeyCode.Delete,
            mac: {
              primary: KeyMod.CtrlCmd | KeyCode.Backspace
            },
            when: ContextKeyExpr.and(
              CONTEXT_IN_CHAT_SESSION,
              CONTEXT_IN_CHAT_INPUT.negate()
            ),
            weight: KeybindingWeight.WorkbenchContrib
          },
          menu: {
            id: MenuId.ChatMessageTitle,
            group: "navigation",
            order: 2,
            when: CONTEXT_REQUEST
          }
        });
      }
      run(accessor, ...args) {
        let item = args[0];
        if (!isRequestVM(item)) {
          const chatWidgetService = accessor.get(IChatWidgetService);
          const widget = chatWidgetService.lastFocusedWidget;
          item = widget?.getFocus();
        }
        const requestId = isRequestVM(item) ? item.id : isResponseVM(item) ? item.requestId : void 0;
        if (requestId) {
          const chatService = accessor.get(IChatService);
          chatService.removeRequest(item.sessionId, requestId);
        }
      }
    }
  );
}
__name(registerChatTitleActions, "registerChatTitleActions");
function splitMarkdownAndCodeBlocks(markdown) {
  const lexer = new marked.Lexer();
  const tokens = lexer.lex(markdown);
  const splitContent = [];
  let markdownPart = "";
  tokens.forEach((token) => {
    if (token.type === "code") {
      if (markdownPart.trim()) {
        splitContent.push({ type: "markdown", content: markdownPart });
        markdownPart = "";
      }
      splitContent.push({
        type: "code",
        language: token.lang || "",
        content: token.text
      });
    } else {
      markdownPart += token.raw;
    }
  });
  if (markdownPart.trim()) {
    splitContent.push({ type: "markdown", content: markdownPart });
  }
  return splitContent;
}
__name(splitMarkdownAndCodeBlocks, "splitMarkdownAndCodeBlocks");
export {
  MarkUnhelpfulActionId,
  registerChatTitleActions
};
//# sourceMappingURL=chatTitleActions.js.map
