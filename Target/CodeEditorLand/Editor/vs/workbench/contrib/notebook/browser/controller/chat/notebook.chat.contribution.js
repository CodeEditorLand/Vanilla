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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IContextKey, IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from "../../../../../common/contributions.js";
import { ChatAgentLocation, IChatAgentService } from "../../../../chat/common/chatAgents.js";
import "./cellChatActions.js";
import { CTX_NOTEBOOK_CHAT_HAS_AGENT } from "./notebookChatContext.js";
let NotebookChatContribution = class extends Disposable {
  static {
    __name(this, "NotebookChatContribution");
  }
  static ID = "workbench.contrib.notebookChatContribution";
  _ctxHasProvider;
  constructor(contextKeyService, chatAgentService) {
    super();
    this._ctxHasProvider = CTX_NOTEBOOK_CHAT_HAS_AGENT.bindTo(contextKeyService);
    const updateNotebookAgentStatus = /* @__PURE__ */ __name(() => {
      const hasNotebookAgent = Boolean(chatAgentService.getDefaultAgent(ChatAgentLocation.Notebook));
      this._ctxHasProvider.set(hasNotebookAgent);
    }, "updateNotebookAgentStatus");
    updateNotebookAgentStatus();
    this._register(chatAgentService.onDidChangeAgents(updateNotebookAgentStatus));
  }
};
NotebookChatContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IChatAgentService)
], NotebookChatContribution);
registerWorkbenchContribution2(NotebookChatContribution.ID, NotebookChatContribution, WorkbenchPhase.BlockRestore);
//# sourceMappingURL=notebook.chat.contribution.js.map
