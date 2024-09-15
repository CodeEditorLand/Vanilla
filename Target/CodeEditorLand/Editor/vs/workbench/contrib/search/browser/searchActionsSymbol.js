var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as nls from "../../../../nls.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import * as Constants from "../common/constants.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
registerAction2(class ShowAllSymbolsAction extends Action2 {
  static {
    __name(this, "ShowAllSymbolsAction");
  }
  static ID = "workbench.action.showAllSymbols";
  static LABEL = nls.localize("showTriggerActions", "Go to Symbol in Workspace...");
  static ALL_SYMBOLS_PREFIX = "#";
  constructor() {
    super({
      id: Constants.SearchCommandIds.ShowAllSymbolsActionId,
      title: {
        ...nls.localize2("showTriggerActions", "Go to Symbol in Workspace..."),
        mnemonicTitle: nls.localize({ key: "miGotoSymbolInWorkspace", comment: ["&& denotes a mnemonic"] }, "Go to Symbol in &&Workspace...")
      },
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.KeyT
      },
      menu: {
        id: MenuId.MenubarGoMenu,
        group: "3_global_nav",
        order: 2
      }
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
  }
});
//# sourceMappingURL=searchActionsSymbol.js.map
