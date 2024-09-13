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
import { DisposableMap } from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import {
  IChatVariablesService
} from "../../contrib/chat/common/chatVariables.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadChatVariables = class {
  constructor(extHostContext, _chatVariablesService) {
    this._chatVariablesService = _chatVariablesService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatVariables);
  }
  _proxy;
  _variables = new DisposableMap();
  _pendingProgress = /* @__PURE__ */ new Map();
  dispose() {
    this._variables.clearAndDisposeAll();
  }
  $registerVariable(handle, data) {
    const registration = this._chatVariablesService.registerVariable(
      data,
      async (messageText, _arg, model, progress, token) => {
        const varRequestId = `${model.sessionId}-${handle}`;
        this._pendingProgress.set(varRequestId, progress);
        const result = revive(
          await this._proxy.$resolveVariable(
            handle,
            varRequestId,
            messageText,
            token
          )
        );
        this._pendingProgress.delete(varRequestId);
        return result;
      }
    );
    this._variables.set(handle, registration);
  }
  async $handleProgressChunk(requestId, progress) {
    const revivedProgress = revive(progress);
    this._pendingProgress.get(requestId)?.(
      revivedProgress
    );
  }
  $unregisterVariable(handle) {
    this._variables.deleteAndDispose(handle);
  }
};
__name(MainThreadChatVariables, "MainThreadChatVariables");
MainThreadChatVariables = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatVariables),
  __decorateParam(1, IChatVariablesService)
], MainThreadChatVariables);
export {
  MainThreadChatVariables
};
//# sourceMappingURL=mainThreadChatVariables.js.map
