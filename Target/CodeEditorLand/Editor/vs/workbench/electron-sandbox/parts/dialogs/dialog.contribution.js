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
import { Lazy } from "../../../../base/common/lazy.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { BrowserDialogHandler } from "../../../browser/parts/dialogs/dialogHandler.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import { NativeDialogHandler } from "./dialogHandler.js";
let DialogHandlerContribution = class extends Disposable {
  constructor(configurationService, dialogService, logService, layoutService, keybindingService, instantiationService, productService, clipboardService, nativeHostService) {
    super();
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.browserImpl = new Lazy(() => new BrowserDialogHandler(logService, layoutService, keybindingService, instantiationService, productService, clipboardService));
    this.nativeImpl = new Lazy(() => new NativeDialogHandler(logService, nativeHostService, productService, clipboardService));
    this.model = this.dialogService.model;
    this._register(this.model.onWillShowDialog(() => {
      if (!this.currentDialog) {
        this.processDialogs();
      }
    }));
    this.processDialogs();
  }
  static ID = "workbench.contrib.dialogHandler";
  nativeImpl;
  browserImpl;
  model;
  currentDialog;
  async processDialogs() {
    while (this.model.dialogs.length) {
      this.currentDialog = this.model.dialogs[0];
      let result;
      try {
        if (this.currentDialog.args.confirmArgs) {
          const args = this.currentDialog.args.confirmArgs;
          result = this.useCustomDialog || args?.confirmation.custom ? await this.browserImpl.value.confirm(
            args.confirmation
          ) : await this.nativeImpl.value.confirm(
            args.confirmation
          );
        } else if (this.currentDialog.args.inputArgs) {
          const args = this.currentDialog.args.inputArgs;
          result = await this.browserImpl.value.input(args.input);
        } else if (this.currentDialog.args.promptArgs) {
          const args = this.currentDialog.args.promptArgs;
          result = this.useCustomDialog || args?.prompt.custom ? await this.browserImpl.value.prompt(args.prompt) : await this.nativeImpl.value.prompt(args.prompt);
        } else if (this.useCustomDialog) {
          await this.browserImpl.value.about();
        } else {
          await this.nativeImpl.value.about();
        }
      } catch (error) {
        result = error;
      }
      this.currentDialog.close(result);
      this.currentDialog = void 0;
    }
  }
  get useCustomDialog() {
    return this.configurationService.getValue("window.dialogStyle") === "custom";
  }
};
DialogHandlerContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IClipboardService),
  __decorateParam(8, INativeHostService)
], DialogHandlerContribution);
registerWorkbenchContribution2(
  DialogHandlerContribution.ID,
  DialogHandlerContribution,
  WorkbenchPhase.BlockStartup
  // Block to allow for dialogs to show before restore finished
);
export {
  DialogHandlerContribution
};
