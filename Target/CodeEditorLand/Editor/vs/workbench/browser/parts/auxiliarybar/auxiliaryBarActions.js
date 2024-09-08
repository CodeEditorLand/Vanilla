import { Codicon } from "../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { registerIcon } from "../../../../platform/theme/common/iconRegistry.js";
import { AuxiliaryBarVisibleContext } from "../../../common/contextkeys.js";
import {
  ViewContainerLocation,
  ViewContainerLocationToString
} from "../../../common/views.js";
import {
  IWorkbenchLayoutService,
  Parts
} from "../../../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
const auxiliaryBarRightIcon = registerIcon(
  "auxiliarybar-right-layout-icon",
  Codicon.layoutSidebarRight,
  localize(
    "toggleAuxiliaryIconRight",
    "Icon to toggle the auxiliary bar off in its right position."
  )
);
const auxiliaryBarRightOffIcon = registerIcon(
  "auxiliarybar-right-off-layout-icon",
  Codicon.layoutSidebarRightOff,
  localize(
    "toggleAuxiliaryIconRightOn",
    "Icon to toggle the auxiliary bar on in its right position."
  )
);
const auxiliaryBarLeftIcon = registerIcon(
  "auxiliarybar-left-layout-icon",
  Codicon.layoutSidebarLeft,
  localize(
    "toggleAuxiliaryIconLeft",
    "Icon to toggle the auxiliary bar in its left position."
  )
);
const auxiliaryBarLeftOffIcon = registerIcon(
  "auxiliarybar-left-off-layout-icon",
  Codicon.layoutSidebarLeftOff,
  localize(
    "toggleAuxiliaryIconLeftOn",
    "Icon to toggle the auxiliary bar on in its left position."
  )
);
class ToggleAuxiliaryBarAction extends Action2 {
  static ID = "workbench.action.toggleAuxiliaryBar";
  static LABEL = localize2(
    "toggleAuxiliaryBar",
    "Toggle Secondary Side Bar Visibility"
  );
  constructor() {
    super({
      id: ToggleAuxiliaryBarAction.ID,
      title: ToggleAuxiliaryBarAction.LABEL,
      toggled: {
        condition: AuxiliaryBarVisibleContext,
        title: localize("secondary sidebar", "Secondary Side Bar"),
        mnemonicTitle: localize(
          {
            key: "secondary sidebar mnemonic",
            comment: ["&& denotes a mnemonic"]
          },
          "Secondary Si&&de Bar"
        )
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyB
      },
      menu: [
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "0_workbench_layout",
          order: 1
        },
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 2
        }
      ]
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setPartHidden(
      layoutService.isVisible(Parts.AUXILIARYBAR_PART),
      Parts.AUXILIARYBAR_PART
    );
  }
}
registerAction2(ToggleAuxiliaryBarAction);
registerAction2(
  class FocusAuxiliaryBarAction extends Action2 {
    static ID = "workbench.action.focusAuxiliaryBar";
    static LABEL = localize2(
      "focusAuxiliaryBar",
      "Focus into Secondary Side Bar"
    );
    constructor() {
      super({
        id: FocusAuxiliaryBarAction.ID,
        title: FocusAuxiliaryBarAction.LABEL,
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor) {
      const paneCompositeService = accessor.get(
        IPaneCompositePartService
      );
      const layoutService = accessor.get(IWorkbenchLayoutService);
      if (!layoutService.isVisible(Parts.AUXILIARYBAR_PART)) {
        layoutService.setPartHidden(false, Parts.AUXILIARYBAR_PART);
      }
      const composite = paneCompositeService.getActivePaneComposite(
        ViewContainerLocation.AuxiliaryBar
      );
      composite?.focus();
    }
  }
);
MenuRegistry.appendMenuItems([
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "0_workbench_toggles",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize(
          "toggleSecondarySideBar",
          "Toggle Secondary Side Bar"
        ),
        toggled: {
          condition: AuxiliaryBarVisibleContext,
          icon: auxiliaryBarLeftIcon
        },
        icon: auxiliaryBarLeftOffIcon
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.or(
          ContextKeyExpr.equals(
            "config.workbench.layoutControl.type",
            "toggles"
          ),
          ContextKeyExpr.equals(
            "config.workbench.layoutControl.type",
            "both"
          )
        ),
        ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "right"
        )
      ),
      order: 0
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "0_workbench_toggles",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize(
          "toggleSecondarySideBar",
          "Toggle Secondary Side Bar"
        ),
        toggled: {
          condition: AuxiliaryBarVisibleContext,
          icon: auxiliaryBarRightIcon
        },
        icon: auxiliaryBarRightOffIcon
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.or(
          ContextKeyExpr.equals(
            "config.workbench.layoutControl.type",
            "toggles"
          ),
          ContextKeyExpr.equals(
            "config.workbench.layoutControl.type",
            "both"
          )
        ),
        ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "left"
        )
      ),
      order: 2
    }
  },
  {
    id: MenuId.ViewTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize2("hideAuxiliaryBar", "Hide Secondary Side Bar")
      },
      when: ContextKeyExpr.and(
        AuxiliaryBarVisibleContext,
        ContextKeyExpr.equals(
          "viewLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.AuxiliaryBar
          )
        )
      ),
      order: 2
    }
  }
]);
export {
  ToggleAuxiliaryBarAction
};
