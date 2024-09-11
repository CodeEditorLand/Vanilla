var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../nls.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import { CHAT_CATEGORY } from "./chatActions.js";
import { IChatWidgetService } from "../chat.js";
import { CONTEXT_IN_CHAT_SESSION, CONTEXT_CHAT_ENABLED } from "../../common/chatContextKeys.js";
import { IChatResponseViewModel, isResponseVM } from "../../common/chatViewModel.js";
function registerChatFileTreeActions() {
  registerAction2(class NextFileTreeAction extends Action2 {
    static {
      __name(this, "NextFileTreeAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.nextFileTree",
        title: localize2("interactive.nextFileTree.label", "Next File Tree"),
        keybinding: {
          primary: KeyMod.CtrlCmd | KeyCode.F9,
          weight: KeybindingWeight.WorkbenchContrib,
          when: CONTEXT_IN_CHAT_SESSION
        },
        precondition: CONTEXT_CHAT_ENABLED,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args) {
      navigateTrees(accessor, false);
    }
  });
  registerAction2(class PreviousFileTreeAction extends Action2 {
    static {
      __name(this, "PreviousFileTreeAction");
    }
    constructor() {
      super({
        id: "workbench.action.chat.previousFileTree",
        title: localize2("interactive.previousFileTree.label", "Previous File Tree"),
        keybinding: {
          primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.F9,
          weight: KeybindingWeight.WorkbenchContrib,
          when: CONTEXT_IN_CHAT_SESSION
        },
        precondition: CONTEXT_CHAT_ENABLED,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args) {
      navigateTrees(accessor, true);
    }
  });
}
__name(registerChatFileTreeActions, "registerChatFileTreeActions");
function navigateTrees(accessor, reverse) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = chatWidgetService.lastFocusedWidget;
  if (!widget) {
    return;
  }
  const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
  const focusedResponse = isResponseVM(focused) ? focused : void 0;
  const currentResponse = focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => isResponseVM(item));
  if (!currentResponse) {
    return;
  }
  widget.reveal(currentResponse);
  const responseFileTrees = widget.getFileTreeInfosForResponse(currentResponse);
  const lastFocusedFileTree = widget.getLastFocusedFileTreeForResponse(currentResponse);
  const focusIdx = lastFocusedFileTree ? (lastFocusedFileTree.treeIndex + (reverse ? -1 : 1) + responseFileTrees.length) % responseFileTrees.length : reverse ? responseFileTrees.length - 1 : 0;
  responseFileTrees[focusIdx]?.focus();
}
__name(navigateTrees, "navigateTrees");
export {
  registerChatFileTreeActions
};
//# sourceMappingURL=chatFileTreeActions.js.map
