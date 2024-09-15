var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { CountTokensCallback, ILanguageModelToolsService, IToolData, IToolImpl, IToolInvocation, IToolResult } from "../../common/languageModelToolsService.js";
class MockLanguageModelToolsService {
  static {
    __name(this, "MockLanguageModelToolsService");
  }
  _serviceBrand;
  constructor() {
  }
  onDidChangeTools = Event.None;
  registerToolData(toolData) {
    return Disposable.None;
  }
  registerToolImplementation(name, tool) {
    return Disposable.None;
  }
  getTools() {
    return [];
  }
  getTool(id) {
    return void 0;
  }
  getToolByName(name) {
    return void 0;
  }
  async invokeTool(dto, countTokens, token) {
    return {
      string: ""
    };
  }
}
export {
  MockLanguageModelToolsService
};
//# sourceMappingURL=mockLanguageModelToolsService.js.map
