var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize2 } from "../../../../../nls.js";
import { Action2, MenuId, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { ActiveEditorContext } from "../../../../common/contextkeys.js";
import { CHAT_CATEGORY, isChatViewTitleActionContext } from "./chatActions.js";
import { CHAT_VIEW_ID, IChatWidgetService } from "../chat.js";
import { IChatEditorOptions } from "../chatEditor.js";
import { ChatEditorInput } from "../chatEditorInput.js";
import { ChatViewPane } from "../chatViewPane.js";
import { CONTEXT_CHAT_ENABLED } from "../../common/chatContextKeys.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, IEditorService } from "../../../../services/editor/common/editorService.js";
import { IViewsService } from "../../../../services/views/common/viewsService.js";
var MoveToNewLocation = /* @__PURE__ */ ((MoveToNewLocation2) => {
  MoveToNewLocation2["Editor"] = "Editor";
  MoveToNewLocation2["Window"] = "Window";
  return MoveToNewLocation2;
})(MoveToNewLocation || {});
function registerMoveActions() {
  registerAction2(class GlobalMoveToEditorAction extends Action2 {
    static {
      __name(this, "GlobalMoveToEditorAction");
    }
    constructor() {
      super({
        id: `workbench.action.chat.openInEditor`,
        title: localize2("chat.openInEditor.label", "Open Chat in Editor"),
        category: CHAT_CATEGORY,
        precondition: CONTEXT_CHAT_ENABLED,
        f1: true,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", CHAT_VIEW_ID),
          order: 0
        }
      });
    }
    async run(accessor, ...args) {
      const context = args[0];
      executeMoveToAction(accessor, "Editor" /* Editor */, isChatViewTitleActionContext(context) ? context.chatView : void 0);
    }
  });
  registerAction2(class GlobalMoveToNewWindowAction extends Action2 {
    static {
      __name(this, "GlobalMoveToNewWindowAction");
    }
    constructor() {
      super({
        id: `workbench.action.chat.openInNewWindow`,
        title: localize2("chat.openInNewWindow.label", "Open Chat in New Window"),
        category: CHAT_CATEGORY,
        precondition: CONTEXT_CHAT_ENABLED,
        f1: true,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", CHAT_VIEW_ID),
          order: 0
        }
      });
    }
    async run(accessor, ...args) {
      const context = args[0];
      executeMoveToAction(accessor, "Window" /* Window */, isChatViewTitleActionContext(context) ? context.chatView : void 0);
    }
  });
  registerAction2(class GlobalMoveToSidebarAction extends Action2 {
    static {
      __name(this, "GlobalMoveToSidebarAction");
    }
    constructor() {
      super({
        id: `workbench.action.chat.openInSidebar`,
        title: localize2("interactiveSession.openInSidebar.label", "Open Chat in Side Bar"),
        category: CHAT_CATEGORY,
        precondition: CONTEXT_CHAT_ENABLED,
        f1: true,
        menu: [{
          id: MenuId.EditorTitle,
          order: 0,
          when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID)
        }]
      });
    }
    async run(accessor, ...args) {
      return moveToSidebar(accessor);
    }
  });
}
__name(registerMoveActions, "registerMoveActions");
async function executeMoveToAction(accessor, moveTo, chatView) {
  const widgetService = accessor.get(IChatWidgetService);
  const editorService = accessor.get(IEditorService);
  const widget = chatView?.widget ?? widgetService.lastFocusedWidget;
  if (!widget || !("viewId" in widget.viewContext)) {
    await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true } }, moveTo === "Window" /* Window */ ? AUX_WINDOW_GROUP : ACTIVE_GROUP);
    return;
  }
  const viewModel = widget.viewModel;
  if (!viewModel) {
    return;
  }
  const sessionId = viewModel.sessionId;
  const viewState = widget.getViewState();
  widget.clear();
  const options = { target: { sessionId }, pinned: true, viewState };
  await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options }, moveTo === "Window" /* Window */ ? AUX_WINDOW_GROUP : ACTIVE_GROUP);
}
__name(executeMoveToAction, "executeMoveToAction");
async function moveToSidebar(accessor) {
  const viewsService = accessor.get(IViewsService);
  const editorService = accessor.get(IEditorService);
  const editorGroupService = accessor.get(IEditorGroupsService);
  const chatEditorInput = editorService.activeEditor;
  let view;
  if (chatEditorInput instanceof ChatEditorInput && chatEditorInput.sessionId) {
    await editorService.closeEditor({ editor: chatEditorInput, groupId: editorGroupService.activeGroup.id });
    view = await viewsService.openView(CHAT_VIEW_ID);
    view.loadSession(chatEditorInput.sessionId);
  } else {
    view = await viewsService.openView(CHAT_VIEW_ID);
  }
  view.focus();
}
__name(moveToSidebar, "moveToSidebar");
export {
  registerMoveActions
};
//# sourceMappingURL=chatMoveActions.js.map
