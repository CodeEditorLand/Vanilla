var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { raceCancellation } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { CancellationError } from "../../../base/common/errors.js";
import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import { revive } from "../../../base/common/marshalling.js";
import { generateUuid } from "../../../base/common/uuid.js";
import {
  MainContext
} from "./extHost.protocol.js";
import * as typeConvert from "./extHostTypeConverters.js";
class ExtHostLanguageModelTools {
  static {
    __name(this, "ExtHostLanguageModelTools");
  }
  /** A map of tools that were registered in this EH */
  _registeredTools = /* @__PURE__ */ new Map();
  _proxy;
  _tokenCountFuncs = /* @__PURE__ */ new Map();
  /** A map of all known tools, from other EHs or registered in vscode core */
  _allTools = /* @__PURE__ */ new Map();
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(
      MainContext.MainThreadLanguageModelTools
    );
    this._proxy.$getTools().then((tools) => {
      for (const tool of tools) {
        this._allTools.set(tool.id, revive(tool));
      }
    });
  }
  async $countTokensForInvocation(callId, input, token) {
    const fn = this._tokenCountFuncs.get(callId);
    if (!fn) {
      throw new Error(`Tool invocation call ${callId} not found`);
    }
    return await fn(input, token);
  }
  async invokeTool(toolId, options, token) {
    const callId = generateUuid();
    if (options.tokenOptions) {
      this._tokenCountFuncs.set(callId, options.tokenOptions.countTokens);
    }
    try {
      const result = await this._proxy.$invokeTool(
        {
          toolId,
          callId,
          parameters: options.parameters,
          tokenBudget: options.tokenOptions?.tokenBudget,
          context: options.toolInvocationToken
        },
        token
      );
      return typeConvert.LanguageModelToolResult.to(result);
    } finally {
      this._tokenCountFuncs.delete(callId);
    }
  }
  $onDidChangeTools(tools) {
    this._allTools.clear();
    for (const tool of tools) {
      this._allTools.set(tool.id, tool);
    }
  }
  get tools() {
    return Array.from(this._allTools.values()).map(
      (tool) => typeConvert.LanguageModelToolDescription.to(tool)
    );
  }
  async $invokeTool(dto, token) {
    const item = this._registeredTools.get(dto.toolId);
    if (!item) {
      throw new Error(`Unknown tool ${dto.toolId}`);
    }
    const options = {
      parameters: dto.parameters,
      toolInvocationToken: dto.context
    };
    if (dto.tokenBudget !== void 0) {
      options.tokenOptions = {
        tokenBudget: dto.tokenBudget,
        countTokens: this._tokenCountFuncs.get(dto.callId) || ((value, token2 = CancellationToken.None) => this._proxy.$countTokensForInvocation(
          dto.callId,
          value,
          token2
        ))
      };
    }
    const extensionResult = await raceCancellation(
      Promise.resolve(item.tool.invoke(options, token)),
      token
    );
    if (!extensionResult) {
      throw new CancellationError();
    }
    for (const key of Object.keys(extensionResult)) {
      const value = extensionResult[key];
      if (value instanceof Promise) {
        throw new Error(`Tool result for '${key}' cannot be a Promise`);
      }
    }
    return typeConvert.LanguageModelToolResult.from(extensionResult);
  }
  registerTool(extension, name, tool) {
    this._registeredTools.set(name, { extension, tool });
    this._proxy.$registerTool(name);
    return toDisposable(() => {
      this._registeredTools.delete(name);
      this._proxy.$unregisterTool(name);
    });
  }
}
export {
  ExtHostLanguageModelTools
};
//# sourceMappingURL=extHostLanguageModelTools.js.map
