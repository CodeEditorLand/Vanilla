var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../../base/common/event.js";
import Severity from "../../../../base/common/severity.js";
import { IConfirmation, IConfirmationResult, IDialogService, IInputResult, IPrompt, IPromptBaseButton, IPromptResult, IPromptResultWithCancel, IPromptWithCustomCancel, IPromptWithDefaultCancel } from "../../common/dialogs.js";
class TestDialogService {
  constructor(defaultConfirmResult = void 0, defaultPromptResult = void 0) {
    this.defaultConfirmResult = defaultConfirmResult;
    this.defaultPromptResult = defaultPromptResult;
  }
  static {
    __name(this, "TestDialogService");
  }
  onWillShowDialog = Event.None;
  onDidShowDialog = Event.None;
  confirmResult = void 0;
  setConfirmResult(result) {
    this.confirmResult = result;
  }
  async confirm(confirmation) {
    if (this.confirmResult) {
      const confirmResult = this.confirmResult;
      this.confirmResult = void 0;
      return confirmResult;
    }
    return this.defaultConfirmResult ?? { confirmed: false };
  }
  async prompt(prompt) {
    if (this.defaultPromptResult) {
      return this.defaultPromptResult;
    }
    const promptButtons = [...prompt.buttons ?? []];
    if (prompt.cancelButton && typeof prompt.cancelButton !== "string" && typeof prompt.cancelButton !== "boolean") {
      promptButtons.push(prompt.cancelButton);
    }
    return { result: await promptButtons[0]?.run({ checkboxChecked: false }) };
  }
  async info(message, detail) {
    await this.prompt({ type: Severity.Info, message, detail });
  }
  async warn(message, detail) {
    await this.prompt({ type: Severity.Warning, message, detail });
  }
  async error(message, detail) {
    await this.prompt({ type: Severity.Error, message, detail });
  }
  async input() {
    {
      return { confirmed: true, values: [] };
    }
  }
  async about() {
  }
}
export {
  TestDialogService
};
//# sourceMappingURL=testDialogService.js.map
