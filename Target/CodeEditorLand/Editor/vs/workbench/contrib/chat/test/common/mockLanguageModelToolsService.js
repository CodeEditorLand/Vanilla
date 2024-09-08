import { Event } from "../../../../../base/common/event.js";
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
class MockLanguageModelToolsService {
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
