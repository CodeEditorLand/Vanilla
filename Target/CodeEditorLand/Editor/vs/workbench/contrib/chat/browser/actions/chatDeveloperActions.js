var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { ServicesAccessor } from "../../../../../editor/browser/editorExtensions.js";
import { localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { Action2, registerAction2 } from "../../../../../platform/actions/common/actions.js";
import { IChatWidgetService } from "../chat.js";
function registerChatDeveloperActions() {
  registerAction2(LogChatInputHistoryAction);
}
__name(registerChatDeveloperActions, "registerChatDeveloperActions");
class LogChatInputHistoryAction extends Action2 {
  static {
    __name(this, "LogChatInputHistoryAction");
  }
  static ID = "workbench.action.chat.logInputHistory";
  constructor() {
    super({
      id: LogChatInputHistoryAction.ID,
      title: localize2("workbench.action.chat.logInputHistory.label", "Log Chat Input History"),
      icon: Codicon.attach,
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor, ...args) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    chatWidgetService.lastFocusedWidget?.logInputHistory();
  }
}
export {
  registerChatDeveloperActions
};
//# sourceMappingURL=chatDeveloperActions.js.map
