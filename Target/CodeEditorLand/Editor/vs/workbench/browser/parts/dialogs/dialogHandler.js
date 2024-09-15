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
import { localize } from "../../../../nls.js";
import { IConfirmation, IConfirmationResult, IInputResult, ICheckbox, IInputElement, ICustomDialogOptions, IInput, AbstractDialogHandler, DialogType, IPrompt, IAsyncPromptResult } from "../../../../platform/dialogs/common/dialogs.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import Severity from "../../../../base/common/severity.js";
import { Dialog, IDialogResult } from "../../../../base/browser/ui/dialog/dialog.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { EventHelper } from "../../../../base/browser/dom.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { fromNow } from "../../../../base/common/date.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { MarkdownRenderer } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { defaultButtonStyles, defaultCheckboxStyles, defaultDialogStyles, defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { ResultKind } from "../../../../platform/keybinding/common/keybindingResolver.js";
let BrowserDialogHandler = class extends AbstractDialogHandler {
  constructor(logService, layoutService, keybindingService, instantiationService, productService, clipboardService) {
    super();
    this.logService = logService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.instantiationService = instantiationService;
    this.productService = productService;
    this.clipboardService = clipboardService;
  }
  static {
    __name(this, "BrowserDialogHandler");
  }
  static ALLOWABLE_COMMANDS = [
    "copy",
    "cut",
    "editor.action.selectAll",
    "editor.action.clipboardCopyAction",
    "editor.action.clipboardCutAction",
    "editor.action.clipboardPasteAction"
  ];
  markdownRenderer = this.instantiationService.createInstance(MarkdownRenderer, {});
  async prompt(prompt) {
    this.logService.trace("DialogService#prompt", prompt.message);
    const buttons = this.getPromptButtons(prompt);
    const { button, checkboxChecked } = await this.doShow(prompt.type, prompt.message, buttons, prompt.detail, prompt.cancelButton ? buttons.length - 1 : -1, prompt.checkbox, void 0, typeof prompt?.custom === "object" ? prompt.custom : void 0);
    return this.getPromptResult(prompt, button, checkboxChecked);
  }
  async confirm(confirmation) {
    this.logService.trace("DialogService#confirm", confirmation.message);
    const buttons = this.getConfirmationButtons(confirmation);
    const { button, checkboxChecked } = await this.doShow(confirmation.type ?? "question", confirmation.message, buttons, confirmation.detail, buttons.length - 1, confirmation.checkbox, void 0, typeof confirmation?.custom === "object" ? confirmation.custom : void 0);
    return { confirmed: button === 0, checkboxChecked };
  }
  async input(input) {
    this.logService.trace("DialogService#input", input.message);
    const buttons = this.getInputButtons(input);
    const { button, checkboxChecked, values } = await this.doShow(input.type ?? "question", input.message, buttons, input.detail, buttons.length - 1, input?.checkbox, input.inputs, typeof input.custom === "object" ? input.custom : void 0);
    return { confirmed: button === 0, checkboxChecked, values };
  }
  async about() {
    const detailString = /* @__PURE__ */ __name((useAgo) => {
      return localize(
        "aboutDetail",
        "Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}",
        this.productService.version || "Unknown",
        this.productService.commit || "Unknown",
        this.productService.date ? `${this.productService.date}${useAgo ? " (" + fromNow(new Date(this.productService.date), true) + ")" : ""}` : "Unknown",
        navigator.userAgent
      );
    }, "detailString");
    const detail = detailString(true);
    const detailToCopy = detailString(false);
    const { button } = await this.doShow(
      Severity.Info,
      this.productService.nameLong,
      [
        localize({ key: "copy", comment: ["&& denotes a mnemonic"] }, "&&Copy"),
        localize("ok", "OK")
      ],
      detail,
      1
    );
    if (button === 0) {
      this.clipboardService.writeText(detailToCopy);
    }
  }
  async doShow(type, message, buttons, detail, cancelId, checkbox, inputs, customOptions) {
    const dialogDisposables = new DisposableStore();
    const renderBody = customOptions ? (parent) => {
      parent.classList.add(...customOptions.classes || []);
      customOptions.markdownDetails?.forEach((markdownDetail) => {
        const result2 = this.markdownRenderer.render(markdownDetail.markdown);
        parent.appendChild(result2.element);
        result2.element.classList.add(...markdownDetail.classes || []);
        dialogDisposables.add(result2);
      });
    } : void 0;
    const dialog = new Dialog(
      this.layoutService.activeContainer,
      message,
      buttons,
      {
        detail,
        cancelId,
        type: this.getDialogType(type),
        keyEventProcessor: /* @__PURE__ */ __name((event) => {
          const resolved = this.keybindingService.softDispatch(event, this.layoutService.activeContainer);
          if (resolved.kind === ResultKind.KbFound && resolved.commandId) {
            if (BrowserDialogHandler.ALLOWABLE_COMMANDS.indexOf(resolved.commandId) === -1) {
              EventHelper.stop(event, true);
            }
          }
        }, "keyEventProcessor"),
        renderBody,
        icon: customOptions?.icon,
        disableCloseAction: customOptions?.disableCloseAction,
        buttonDetails: customOptions?.buttonDetails,
        checkboxLabel: checkbox?.label,
        checkboxChecked: checkbox?.checked,
        inputs,
        buttonStyles: defaultButtonStyles,
        checkboxStyles: defaultCheckboxStyles,
        inputBoxStyles: defaultInputBoxStyles,
        dialogStyles: defaultDialogStyles
      }
    );
    dialogDisposables.add(dialog);
    const result = await dialog.show();
    dialogDisposables.dispose();
    return result;
  }
};
BrowserDialogHandler = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ILayoutService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IClipboardService)
], BrowserDialogHandler);
export {
  BrowserDialogHandler
};
//# sourceMappingURL=dialogHandler.js.map
