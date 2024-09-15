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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { MarkdownString } from "../../../base/common/htmlContent.js";
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { ChatModel } from "../../contrib/chat/common/chatModel.js";
import { IChatService, IChatTask } from "../../contrib/chat/common/chatService.js";
import { CountTokensCallback, ILanguageModelToolsService, IToolData, IToolInvocation, IToolResult } from "../../contrib/chat/common/languageModelToolsService.js";
import { IExtHostContext, extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, ExtHostLanguageModelToolsShape, MainContext, MainThreadLanguageModelToolsShape } from "../common/extHost.protocol.js";
import { MainThreadChatTask } from "./mainThreadChatAgents2.js";
let MainThreadLanguageModelTools = class extends Disposable {
  constructor(extHostContext, _languageModelToolsService, _chatService) {
    super();
    this._languageModelToolsService = _languageModelToolsService;
    this._chatService = _chatService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostLanguageModelTools);
    this._register(this._languageModelToolsService.onDidChangeTools((e) => this._proxy.$onDidChangeTools([...this._languageModelToolsService.getTools()])));
  }
  _proxy;
  _tools = this._register(new DisposableMap());
  _countTokenCallbacks = /* @__PURE__ */ new Map();
  async $getTools() {
    return Array.from(this._languageModelToolsService.getTools());
  }
  async $invokeTool(dto, token) {
    let task;
    if (dto.context) {
      const model = this._chatService.getSession(dto.context?.sessionId);
      const request = model.getRequests().at(-1);
      const tool = this._languageModelToolsService.getTool(dto.toolId);
      task = new MainThreadChatTask(new MarkdownString(`Using ${tool?.displayName ?? dto.toolId}`));
      model.acceptResponseProgress(request, task);
    }
    try {
      return await this._languageModelToolsService.invokeTool(
        dto,
        (input, token2) => this._proxy.$countTokensForInvocation(dto.callId, input, token2),
        token
      );
    } finally {
      task?.complete();
    }
  }
  $countTokensForInvocation(callId, input, token) {
    const fn = this._countTokenCallbacks.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return fn(input, token);
  }
  $registerTool(name) {
    const disposable = this._languageModelToolsService.registerToolImplementation(
      name,
      {
        invoke: /* @__PURE__ */ __name(async (dto, countTokens, token) => {
          try {
            this._countTokenCallbacks.set(dto.callId, countTokens);
            return await this._proxy.$invokeTool(dto, token);
          } finally {
            this._countTokenCallbacks.delete(dto.callId);
          }
        }, "invoke")
      }
    );
    this._tools.set(name, disposable);
  }
  $unregisterTool(name) {
    this._tools.deleteAndDispose(name);
  }
};
__name(MainThreadLanguageModelTools, "MainThreadLanguageModelTools");
MainThreadLanguageModelTools = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguageModelTools),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, IChatService)
], MainThreadLanguageModelTools);
export {
  MainThreadLanguageModelTools
};
//# sourceMappingURL=mainThreadLanguageModelTools.js.map
