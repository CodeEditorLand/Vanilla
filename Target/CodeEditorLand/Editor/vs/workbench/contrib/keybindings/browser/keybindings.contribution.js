import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { showWindowLogActionId } from "../../../services/log/common/logConstants.js";
class ToggleKeybindingsLogAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleKeybindingsLog",
      title: nls.localize2(
        "toggleKeybindingsLog",
        "Toggle Keyboard Shortcuts Troubleshooting"
      ),
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
