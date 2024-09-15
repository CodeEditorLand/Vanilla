var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import * as nls from "../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { TabFocus } from "../../../browser/config/tabFocus.js";
class ToggleTabFocusModeAction extends Action2 {
  static {
    __name(this, "ToggleTabFocusModeAction");
  }
  static ID = "editor.action.toggleTabFocusMode";
  constructor() {
    super({
      id: ToggleTabFocusModeAction.ID,
      title: nls.localize2(
        {
          key: "toggle.tabMovesFocus",
          comment: [
            "Turn on/off use of tab key for moving focus around VS Code"
          ]
        },
        "Toggle Tab Key Moves Focus"
      ),
      precondition: void 0,
      keybinding: {
        primary: KeyMod.CtrlCmd | KeyCode.KeyM,
        mac: { primary: KeyMod.WinCtrl | KeyMod.Shift | KeyCode.KeyM },
        weight: KeybindingWeight.EditorContrib
      },
      metadata: {
        description: nls.localize2(
          "tabMovesFocusDescriptions",
          "Determines whether the tab key moves focus around the workbench or inserts the tab character in the current editor. This is also called tab trapping, tab navigation, or tab focus mode."
        )
      },
      f1: true
    });
  }
  run() {
    const oldValue = TabFocus.getTabFocusMode();
    const newValue = !oldValue;
    TabFocus.setTabFocusMode(newValue);
    if (newValue) {
      alert(
        nls.localize(
          "toggle.tabMovesFocus.on",
          "Pressing Tab will now move focus to the next focusable element"
        )
      );
    } else {
      alert(
        nls.localize(
          "toggle.tabMovesFocus.off",
          "Pressing Tab will now insert the tab character"
        )
      );
    }
  }
}
registerAction2(ToggleTabFocusModeAction);
export {
  ToggleTabFocusModeAction
};
//# sourceMappingURL=toggleTabFocusMode.js.map
