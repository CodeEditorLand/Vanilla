import { Emitter } from "../../../base/common/event.js";
import {
  CommandsRegistry
} from "../../../platform/commands/common/commands.js";
import {
  AbstractCodeEditorService,
  GlobalStyleSheet
} from "../../browser/services/abstractCodeEditorService.js";
class TestCodeEditorService extends AbstractCodeEditorService {
  globalStyleSheet = new TestGlobalStyleSheet();
  _createGlobalStyleSheet() {
    return this.globalStyleSheet;
  }
  getActiveCodeEditor() {
    return null;
  }
  lastInput;
  openCodeEditor(input, source, sideBySide) {
    this.lastInput = input;
    return Promise.resolve(null);
  }
}
class TestGlobalStyleSheet extends GlobalStyleSheet {
  rules = [];
  constructor() {
    super(null);
  }
  insertRule(selector, rule) {
    this.rules.unshift(`${selector} {${rule}}`);
  }
  removeRulesContainingSelector(ruleName) {
    for (let i = 0; i < this.rules.length; i++) {
      if (this.rules[i].indexOf(ruleName) >= 0) {
        this.rules.splice(i, 1);
        i--;
      }
    }
  }
  read() {
    return this.rules.join("\n");
  }
}
class TestCommandService {
  _instantiationService;
  _onWillExecuteCommand = new Emitter();
  onWillExecuteCommand = this._onWillExecuteCommand.event;
  _onDidExecuteCommand = new Emitter();
  onDidExecuteCommand = this._onDidExecuteCommand.event;
  constructor(instantiationService) {
    this._instantiationService = instantiationService;
  }
  executeCommand(id, ...args) {
    const command = CommandsRegistry.getCommand(id);
    if (!command) {
      return Promise.reject(new Error(`command '${id}' not found`));
    }
    try {
      this._onWillExecuteCommand.fire({ commandId: id, args });
      const result = this._instantiationService.invokeFunction.apply(
        this._instantiationService,
        [command.handler, ...args]
      );
      this._onDidExecuteCommand.fire({ commandId: id, args });
      return Promise.resolve(result);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
export {
  TestCodeEditorService,
  TestCommandService,
  TestGlobalStyleSheet
};
