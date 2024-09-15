var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { showWindowLogActionId } from "../../../services/log/common/logConstants.js";
class ToggleKeybindingsLogAction extends Action2 {
  static {
    __name(this, "ToggleKeybindingsLogAction");
  }
  constructor() {
    super({
      id: "workbench.action.toggleKeybindingsLog",
      title: nls.localize2("toggleKeybindingsLog", "Toggle Keyboard Shortcuts Troubleshooting"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const logging = accessor.get(IKeybindingService).toggleLogging();
    if (logging) {
      const commandService = accessor.get(ICommandService);
      commandService.executeCommand(showWindowLogActionId);
    }
  }
}
registerAction2(ToggleKeybindingsLogAction);
//# sourceMappingURL=keybindings.contribution.js.map
