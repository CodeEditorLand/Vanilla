var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ChatAgentLocation } from "../../common/chatAgents.js";
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "../../common/chatModel.js";
import { IParsedChatRequest } from "../../common/chatParserTypes.js";
import { IChatRequestVariableValue, IChatVariableData, IChatVariableResolver, IChatVariableResolverProgress, IChatVariablesService, IDynamicVariable } from "../../common/chatVariables.js";
class MockChatVariablesService {
  static {
    __name(this, "MockChatVariablesService");
  }
  _serviceBrand;
  registerVariable(data, resolver) {
    throw new Error("Method not implemented.");
  }
  getVariable(name) {
    throw new Error("Method not implemented.");
  }
  hasVariable(name) {
    throw new Error("Method not implemented.");
  }
  getVariables() {
    throw new Error("Method not implemented.");
  }
  getDynamicVariables(sessionId) {
    return [];
  }
  async resolveVariables(prompt, attachedContextVariables, model, progress, token) {
    return {
      variables: []
    };
  }
  attachContext(name, value, location) {
    throw new Error("Method not implemented.");
  }
  resolveVariable(variableName, promptText, model, progress, token) {
    throw new Error("Method not implemented.");
  }
}
export {
  MockChatVariablesService
};
//# sourceMappingURL=mockChatVariables.js.map
