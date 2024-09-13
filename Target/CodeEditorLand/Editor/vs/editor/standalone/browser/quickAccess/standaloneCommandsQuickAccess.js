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
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  Extensions
} from "../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  EditorAction,
  registerEditorAction
} from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { QuickCommandNLS } from "../../../common/standaloneStrings.js";
import { AbstractEditorCommandsQuickAccessProvider } from "../../../contrib/quickAccess/browser/commandsQuickAccess.js";
let StandaloneCommandsQuickAccessProvider = class extends AbstractEditorCommandsQuickAccessProvider {
  constructor(instantiationService, codeEditorService, keybindingService, commandService, telemetryService, dialogService) {
    super({ showAlias: false }, instantiationService, keybindingService, commandService, telemetryService, dialogService);
    this.codeEditorService = codeEditorService;
  }
  static {
    __name(this, "StandaloneCommandsQuickAccessProvider");
  }
  get activeTextEditorControl() {
    return this.codeEditorService.getFocusedCodeEditor() ?? void 0;
  }
  async getCommandPicks() {
    return this.getCodeEditorCommandPicks();
  }
  hasAdditionalCommandPicks() {
    return false;
  }
  async getAdditionalCommandPicks() {
    return [];
  }
};
StandaloneCommandsQuickAccessProvider = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IDialogService)
], StandaloneCommandsQuickAccessProvider);
class GotoLineAction extends EditorAction {
  static {
    __name(this, "GotoLineAction");
  }
  static ID = "editor.action.quickCommand";
  constructor() {
    super({
      id: GotoLineAction.ID,
      label: QuickCommandNLS.quickCommandActionLabel,
      alias: "Command Palette",
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: KeyCode.F1,
        weight: KeybindingWeight.EditorContrib
      },
      contextMenuOpts: {
        group: "z_commands",
        order: 1
      }
    });
  }
  run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(StandaloneCommandsQuickAccessProvider.PREFIX);
  }
}
registerEditorAction(GotoLineAction);
Registry.as(
  Extensions.Quickaccess
).registerQuickAccessProvider({
  ctor: StandaloneCommandsQuickAccessProvider,
  prefix: StandaloneCommandsQuickAccessProvider.PREFIX,
  helpEntries: [
    {
      description: QuickCommandNLS.quickCommandHelp,
      commandId: GotoLineAction.ID
    }
  ]
});
export {
  GotoLineAction,
  StandaloneCommandsQuickAccessProvider
};
//# sourceMappingURL=standaloneCommandsQuickAccess.js.map
