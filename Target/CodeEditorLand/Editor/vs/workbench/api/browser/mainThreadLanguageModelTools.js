var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import {
  ILanguageModelToolsService
} from "../../contrib/chat/common/languageModelToolsService.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadLanguageModelTools = class extends Disposable {
  constructor(extHostContext, _languageModelToolsService) {
    super();
    this._languageModelToolsService = _languageModelToolsService;
    this._proxy = extHostContext.getProxy(
      ExtHostContext.ExtHostLanguageModelTools
    );
    this._register(
      this._languageModelToolsService.onDidChangeTools(
        (e) => this._proxy.$onDidChangeTools([
          ...this._languageModelToolsService.getTools()
        ])
      )
    );
  }
  _proxy;
  _tools = this._register(new DisposableMap());
  _countTokenCallbacks = /* @__PURE__ */ new Map();
  async $getTools() {
    return Array.from(this._languageModelToolsService.getTools());
  }
  $invokeTool(dto, token) {
    return this._languageModelToolsService.invokeTool(
      dto,
      (input, token2) => this._proxy.$countTokensForInvocation(dto.callId, input, token2),
      token
    );
  }
  $countTokensForInvocation(callId, input, token) {
    const fn = this._countTokenCallbacks.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return fn(input, token);
  }
  $registerTool(name) {
    const disposable = this._languageModelToolsService.registerToolImplementation(name, {
      invoke: async (dto, countTokens, token) => {
        try {
          this._countTokenCallbacks.set(dto.callId, countTokens);
          return await this._proxy.$invokeTool(dto, token);
        } finally {
          this._countTokenCallbacks.delete(dto.callId);
        }
      }
    });
    this._tools.set(name, disposable);
  }
  $unregisterTool(name) {
    this._tools.deleteAndDispose(name);
  }
};
MainThreadLanguageModelTools = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLanguageModelTools),
  __decorateParam(1, ILanguageModelToolsService)
], MainThreadLanguageModelTools);
export {
  MainThreadLanguageModelTools
};
