import "./media/sidebarpart.css";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ViewContainerLocation } from "../../../common/views.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
class FocusSideBarAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.focusSideBar",
      title: localize2("focusSideBar", "Focus into Primary Side Bar"),
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: null,
        primary: KeyMod.CtrlCmd | KeyCode.Digit0
      }
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    if (!layoutService.isVisible(Parts.SIDEBAR_PART)) {
      layoutService.setPartHidden(false, Parts.SIDEBAR_PART);
    }
    const viewlet = paneCompositeService.getActivePaneComposite(
      ViewContainerLocation.Sidebar
    );
    viewlet?.focus();
  }
}
registerAction2(FocusSideBarAction);
export {
  FocusSideBarAction
};
