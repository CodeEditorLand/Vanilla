var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { mainWindow } from "../../../base/browser/window.js";
import { Codicon } from "../../../base/common/codicons.js";
import { KeyChord, KeyCode, KeyMod } from "../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import {
  isLinux,
  isMacintosh,
  isNative,
  isWeb,
  isWindows
} from "../../../base/common/platform.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { localize, localize2 } from "../../../nls.js";
import { Categories } from "../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../platform/contextkey/common/contextkey.js";
import { IsMacNativeContext } from "../../../platform/contextkey/common/contextkeys.js";
import { IDialogService } from "../../../platform/dialogs/common/dialogs.js";
import {
  IInstantiationService
} from "../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  IQuickInputService
} from "../../../platform/quickinput/common/quickInput.js";
import { registerIcon } from "../../../platform/theme/common/iconRegistry.js";
import { TitlebarStyle } from "../../../platform/window/common/window.js";
import {
  AuxiliaryBarVisibleContext,
  FocusedViewContext,
  InEditorZenModeContext,
  IsAuxiliaryWindowFocusedContext,
  IsMainEditorCenteredLayoutContext,
  IsMainWindowFullscreenContext,
  MainEditorAreaVisibleContext,
  PanelAlignmentContext,
  PanelPositionContext,
  PanelVisibleContext,
  SideBarVisibleContext,
  TitleBarStyleContext
} from "../../common/contextkeys.js";
import {
  IViewDescriptorService,
  ViewContainerLocation,
  ViewContainerLocationToString
} from "../../common/views.js";
import {
  EditorActionsLocation,
  EditorTabsMode,
  IWorkbenchLayoutService,
  LayoutSettings,
  Parts,
  Position,
  ZenModeSettings,
  positionToString
} from "../../services/layout/browser/layoutService.js";
import { IPaneCompositePartService } from "../../services/panecomposite/browser/panecomposite.js";
import { IPreferencesService } from "../../services/preferences/common/preferences.js";
import { IViewsService } from "../../services/views/common/viewsService.js";
import { ToggleAuxiliaryBarAction } from "../parts/auxiliarybar/auxiliaryBarActions.js";
import { TogglePanelAction } from "../parts/panel/panelActions.js";
const menubarIcon = registerIcon(
  "menuBar",
  Codicon.layoutMenubar,
  localize("menuBarIcon", "Represents the menu bar")
);
const activityBarLeftIcon = registerIcon(
  "activity-bar-left",
  Codicon.layoutActivitybarLeft,
  localize(
    "activityBarLeft",
    "Represents the activity bar in the left position"
  )
);
const activityBarRightIcon = registerIcon(
  "activity-bar-right",
  Codicon.layoutActivitybarRight,
  localize(
    "activityBarRight",
    "Represents the activity bar in the right position"
  )
);
const panelLeftIcon = registerIcon(
  "panel-left",
  Codicon.layoutSidebarLeft,
  localize("panelLeft", "Represents a side bar in the left position")
);
const panelLeftOffIcon = registerIcon(
  "panel-left-off",
  Codicon.layoutSidebarLeftOff,
  localize(
    "panelLeftOff",
    "Represents a side bar in the left position toggled off"
  )
);
const panelRightIcon = registerIcon(
  "panel-right",
  Codicon.layoutSidebarRight,
  localize("panelRight", "Represents side bar in the right position")
);
const panelRightOffIcon = registerIcon(
  "panel-right-off",
  Codicon.layoutSidebarRightOff,
  localize(
    "panelRightOff",
    "Represents side bar in the right position toggled off"
  )
);
const panelIcon = registerIcon(
  "panel-bottom",
  Codicon.layoutPanel,
  localize("panelBottom", "Represents the bottom panel")
);
const statusBarIcon = registerIcon(
  "statusBar",
  Codicon.layoutStatusbar,
  localize("statusBarIcon", "Represents the status bar")
);
const panelAlignmentLeftIcon = registerIcon(
  "panel-align-left",
  Codicon.layoutPanelLeft,
  localize(
    "panelBottomLeft",
    "Represents the bottom panel alignment set to the left"
  )
);
const panelAlignmentRightIcon = registerIcon(
  "panel-align-right",
  Codicon.layoutPanelRight,
  localize(
    "panelBottomRight",
    "Represents the bottom panel alignment set to the right"
  )
);
const panelAlignmentCenterIcon = registerIcon(
  "panel-align-center",
  Codicon.layoutPanelCenter,
  localize(
    "panelBottomCenter",
    "Represents the bottom panel alignment set to the center"
  )
);
const panelAlignmentJustifyIcon = registerIcon(
  "panel-align-justify",
  Codicon.layoutPanelJustify,
  localize(
    "panelBottomJustify",
    "Represents the bottom panel alignment set to justified"
  )
);
const fullscreenIcon = registerIcon(
  "fullscreen",
  Codicon.screenFull,
  localize("fullScreenIcon", "Represents full screen")
);
const centerLayoutIcon = registerIcon(
  "centerLayoutIcon",
  Codicon.layoutCentered,
  localize("centerLayoutIcon", "Represents centered layout mode")
);
const zenModeIcon = registerIcon(
  "zenMode",
  Codicon.target,
  localize("zenModeIcon", "Represents zen mode")
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.closeSidebar",
        title: localize2("closeSidebar", "Close Primary Side Bar"),
        category: Categories.View,
        f1: true
      });
    }
    run(accessor) {
      accessor.get(IWorkbenchLayoutService).setPartHidden(true, Parts.SIDEBAR_PART);
    }
  }
);
const ToggleActivityBarVisibilityActionId = "workbench.action.toggleActivityBarVisibility";
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.toggleCenteredLayout",
        title: {
          ...localize2(
            "toggleCenteredLayout",
            "Toggle Centered Layout"
          ),
          mnemonicTitle: localize(
            {
              key: "miToggleCenteredLayout",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Centered Layout"
          )
        },
        precondition: IsAuxiliaryWindowFocusedContext.toNegated(),
        category: Categories.View,
        f1: true,
        toggled: IsMainEditorCenteredLayoutContext,
        menu: [
          {
            id: MenuId.MenubarAppearanceMenu,
            group: "1_toggle_view",
            order: 3
          }
        ]
      });
    }
    run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      layoutService.centerMainEditorLayout(
        !layoutService.isMainEditorLayoutCentered()
      );
    }
  }
);
const sidebarPositionConfigurationKey = "workbench.sideBar.location";
class MoveSidebarPositionAction extends Action2 {
  constructor(id, title, position) {
    super({
      id,
      title,
      f1: false
    });
    this.position = position;
  }
  static {
    __name(this, "MoveSidebarPositionAction");
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const position = layoutService.getSideBarPosition();
    if (position !== this.position) {
      return configurationService.updateValue(
        sidebarPositionConfigurationKey,
        positionToString(this.position)
      );
    }
  }
}
class MoveSidebarRightAction extends MoveSidebarPositionAction {
  static {
    __name(this, "MoveSidebarRightAction");
  }
  static ID = "workbench.action.moveSideBarRight";
  constructor() {
    super(
      MoveSidebarRightAction.ID,
      localize2("moveSidebarRight", "Move Primary Side Bar Right"),
      Position.RIGHT
    );
  }
}
class MoveSidebarLeftAction extends MoveSidebarPositionAction {
  static {
    __name(this, "MoveSidebarLeftAction");
  }
  static ID = "workbench.action.moveSideBarLeft";
  constructor() {
    super(
      MoveSidebarLeftAction.ID,
      localize2("moveSidebarLeft", "Move Primary Side Bar Left"),
      Position.LEFT
    );
  }
}
registerAction2(MoveSidebarRightAction);
registerAction2(MoveSidebarLeftAction);
class ToggleSidebarPositionAction extends Action2 {
  static {
    __name(this, "ToggleSidebarPositionAction");
  }
  static ID = "workbench.action.toggleSidebarPosition";
  static LABEL = localize(
    "toggleSidebarPosition",
    "Toggle Primary Side Bar Position"
  );
  static getLabel(layoutService) {
    return layoutService.getSideBarPosition() === Position.LEFT ? localize("moveSidebarRight", "Move Primary Side Bar Right") : localize("moveSidebarLeft", "Move Primary Side Bar Left");
  }
  constructor() {
    super({
      id: ToggleSidebarPositionAction.ID,
      title: localize2(
        "toggleSidebarPosition",
        "Toggle Primary Side Bar Position"
      ),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const position = layoutService.getSideBarPosition();
    const newPositionValue = position === Position.LEFT ? "right" : "left";
    return configurationService.updateValue(
      sidebarPositionConfigurationKey,
      newPositionValue
    );
  }
}
registerAction2(ToggleSidebarPositionAction);
const configureLayoutIcon = registerIcon(
  "configure-layout-icon",
  Codicon.layout,
  localize(
    "cofigureLayoutIcon",
    "Icon represents workbench layout configuration."
  )
);
MenuRegistry.appendMenuItem(MenuId.LayoutControlMenu, {
  submenu: MenuId.LayoutControlMenuSubmenu,
  title: localize("configureLayout", "Configure Layout"),
  icon: configureLayoutIcon,
  group: "1_workbench_layout",
  when: ContextKeyExpr.equals("config.workbench.layoutControl.type", "menu")
});
MenuRegistry.appendMenuItems([
  {
    id: MenuId.ViewContainerTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarPositionAction.ID,
        title: localize(
          "move side bar right",
          "Move Primary Side Bar Right"
        )
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.notEquals(
          "config.workbench.sideBar.location",
          "right"
        ),
        ContextKeyExpr.equals(
          "viewContainerLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.Sidebar
          )
        )
      ),
      order: 1
    }
  },
  {
    id: MenuId.ViewTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarPositionAction.ID,
        title: localize(
          "move sidebar right",
          "Move Primary Side Bar Right"
        )
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.notEquals(
          "config.workbench.sideBar.location",
          "right"
        ),
        ContextKeyExpr.equals(
          "viewLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.Sidebar
          )
        )
      ),
      order: 1
    }
  },
  {
    id: MenuId.ViewContainerTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarPositionAction.ID,
        title: localize(
          "move sidebar left",
          "Move Primary Side Bar Left"
        )
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "right"
        ),
        ContextKeyExpr.equals(
          "viewContainerLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.Sidebar
          )
        )
      ),
      order: 1
    }
  },
  {
    id: MenuId.ViewTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarPositionAction.ID,
        title: localize(
          "move sidebar left",
          "Move Primary Side Bar Left"
        )
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "right"
        ),
        ContextKeyExpr.equals(
          "viewLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.Sidebar
          )
        )
      ),
      order: 1
    }
  },
  {
    id: MenuId.ViewTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarPositionAction.ID,
        title: localize(
          "move second sidebar left",
          "Move Secondary Side Bar Left"
        )
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.notEquals(
          "config.workbench.sideBar.location",
          "right"
        ),
        ContextKeyExpr.equals(
          "viewLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.AuxiliaryBar
          )
        )
      ),
      order: 1
    }
  },
  {
    id: MenuId.ViewTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarPositionAction.ID,
        title: localize(
          "move second sidebar right",
          "Move Secondary Side Bar Right"
        )
      },
      when: ContextKeyExpr.and(
        ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "right"
        ),
        ContextKeyExpr.equals(
          "viewLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.AuxiliaryBar
          )
        )
      ),
      order: 1
    }
  }
]);
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  group: "3_workbench_layout_move",
  command: {
    id: ToggleSidebarPositionAction.ID,
    title: localize(
      { key: "miMoveSidebarRight", comment: ["&& denotes a mnemonic"] },
      "&&Move Primary Side Bar Right"
    )
  },
  when: ContextKeyExpr.notEquals(
    "config.workbench.sideBar.location",
    "right"
  ),
  order: 2
});
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  group: "3_workbench_layout_move",
  command: {
    id: ToggleSidebarPositionAction.ID,
    title: localize(
      { key: "miMoveSidebarLeft", comment: ["&& denotes a mnemonic"] },
      "&&Move Primary Side Bar Left"
    )
  },
  when: ContextKeyExpr.equals("config.workbench.sideBar.location", "right"),
  order: 2
});
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.toggleEditorVisibility",
        title: {
          ...localize2(
            "toggleEditor",
            "Toggle Editor Area Visibility"
          ),
          mnemonicTitle: localize(
            {
              key: "miShowEditorArea",
              comment: ["&& denotes a mnemonic"]
            },
            "Show &&Editor Area"
          )
        },
        category: Categories.View,
        f1: true,
        toggled: MainEditorAreaVisibleContext,
        // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
        precondition: ContextKeyExpr.and(
          IsAuxiliaryWindowFocusedContext.toNegated(),
          ContextKeyExpr.or(
            PanelAlignmentContext.isEqualTo("center"),
            PanelPositionContext.notEqualsTo("bottom")
          )
        )
      });
    }
    run(accessor) {
      accessor.get(IWorkbenchLayoutService).toggleMaximizedPanel();
    }
  }
);
MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  group: "2_appearance",
  title: localize(
    { key: "miAppearance", comment: ["&& denotes a mnemonic"] },
    "&&Appearance"
  ),
  submenu: MenuId.MenubarAppearanceMenu,
  order: 1
});
class ToggleSidebarVisibilityAction extends Action2 {
  static {
    __name(this, "ToggleSidebarVisibilityAction");
  }
  static ID = "workbench.action.toggleSidebarVisibility";
  constructor() {
    super({
      id: ToggleSidebarVisibilityAction.ID,
      title: localize2(
        "toggleSidebar",
        "Toggle Primary Side Bar Visibility"
      ),
      toggled: {
        condition: SideBarVisibleContext,
        title: localize("primary sidebar", "Primary Side Bar"),
        mnemonicTitle: localize(
          {
            key: "primary sidebar mnemonic",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Primary Side Bar"
        )
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.KeyB
      },
      menu: [
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "0_workbench_layout",
          order: 0
        },
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 1
        }
      ]
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setPartHidden(
      layoutService.isVisible(Parts.SIDEBAR_PART),
      Parts.SIDEBAR_PART
    );
  }
}
registerAction2(ToggleSidebarVisibilityAction);
MenuRegistry.appendMenuItems([
  {
    id: MenuId.ViewContainerTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarVisibilityAction.ID,
        title: localize(
          "compositePart.hideSideBarLabel",
          "Hide Primary Side Bar"
        )
      },
      when: ContextKeyExpr.and(
        SideBarVisibleContext,
        ContextKeyExpr.equals(
          "viewContainerLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.Sidebar
          )
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
        id: ToggleSidebarVisibilityAction.ID,
        title: localize(
          "compositePart.hideSideBarLabel",
          "Hide Primary Side Bar"
        )
      },
      when: ContextKeyExpr.and(
        SideBarVisibleContext,
        ContextKeyExpr.equals(
          "viewLocation",
          ViewContainerLocationToString(
            ViewContainerLocation.Sidebar
          )
        )
      ),
      order: 2
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "0_workbench_toggles",
      command: {
        id: ToggleSidebarVisibilityAction.ID,
        title: localize("toggleSideBar", "Toggle Primary Side Bar"),
        icon: panelLeftOffIcon,
        toggled: {
          condition: SideBarVisibleContext,
          icon: panelLeftIcon
        }
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
      order: 0
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "0_workbench_toggles",
      command: {
        id: ToggleSidebarVisibilityAction.ID,
        title: localize("toggleSideBar", "Toggle Primary Side Bar"),
        icon: panelRightOffIcon,
        toggled: {
          condition: SideBarVisibleContext,
          icon: panelRightIcon
        }
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
      order: 2
    }
  }
]);
class ToggleStatusbarVisibilityAction extends Action2 {
  static {
    __name(this, "ToggleStatusbarVisibilityAction");
  }
  static ID = "workbench.action.toggleStatusbarVisibility";
  static statusbarVisibleKey = "workbench.statusBar.visible";
  constructor() {
    super({
      id: ToggleStatusbarVisibilityAction.ID,
      title: {
        ...localize2("toggleStatusbar", "Toggle Status Bar Visibility"),
        mnemonicTitle: localize(
          { key: "miStatusbar", comment: ["&& denotes a mnemonic"] },
          "S&&tatus Bar"
        )
      },
      category: Categories.View,
      f1: true,
      toggled: ContextKeyExpr.equals(
        "config.workbench.statusBar.visible",
        true
      ),
      menu: [
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 3
        }
      ]
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const visibility = layoutService.isVisible(
      Parts.STATUSBAR_PART,
      mainWindow
    );
    const newVisibilityValue = !visibility;
    return configurationService.updateValue(
      ToggleStatusbarVisibilityAction.statusbarVisibleKey,
      newVisibilityValue
    );
  }
}
registerAction2(ToggleStatusbarVisibilityAction);
class AbstractSetShowTabsAction extends Action2 {
  constructor(settingName, value, title, id, precondition, description) {
    super({
      id,
      title,
      category: Categories.View,
      precondition,
      metadata: description ? { description } : void 0,
      f1: true
    });
    this.settingName = settingName;
    this.value = value;
  }
  static {
    __name(this, "AbstractSetShowTabsAction");
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue(this.settingName, this.value);
  }
}
class HideEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    __name(this, "HideEditorTabsAction");
  }
  static ID = "workbench.action.hideEditorTabs";
  constructor() {
    const precondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(
        `config.${LayoutSettings.EDITOR_TABS_MODE}`,
        EditorTabsMode.NONE
      ).negate(),
      InEditorZenModeContext.negate()
    );
    const title = localize2("hideEditorTabs", "Hide Editor Tabs");
    super(
      LayoutSettings.EDITOR_TABS_MODE,
      EditorTabsMode.NONE,
      title,
      HideEditorTabsAction.ID,
      precondition,
      localize2("hideEditorTabsDescription", "Hide Tab Bar")
    );
  }
}
class ZenHideEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    __name(this, "ZenHideEditorTabsAction");
  }
  static ID = "workbench.action.zenHideEditorTabs";
  constructor() {
    const precondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(
        `config.${ZenModeSettings.SHOW_TABS}`,
        EditorTabsMode.NONE
      ).negate(),
      InEditorZenModeContext
    );
    const title = localize2(
      "hideEditorTabsZenMode",
      "Hide Editor Tabs in Zen Mode"
    );
    super(
      ZenModeSettings.SHOW_TABS,
      EditorTabsMode.NONE,
      title,
      ZenHideEditorTabsAction.ID,
      precondition,
      localize2(
        "hideEditorTabsZenModeDescription",
        "Hide Tab Bar in Zen Mode"
      )
    );
  }
}
class ShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    __name(this, "ShowMultipleEditorTabsAction");
  }
  static ID = "workbench.action.showMultipleEditorTabs";
  constructor() {
    const precondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(
        `config.${LayoutSettings.EDITOR_TABS_MODE}`,
        EditorTabsMode.MULTIPLE
      ).negate(),
      InEditorZenModeContext.negate()
    );
    const title = localize2(
      "showMultipleEditorTabs",
      "Show Multiple Editor Tabs"
    );
    super(
      LayoutSettings.EDITOR_TABS_MODE,
      EditorTabsMode.MULTIPLE,
      title,
      ShowMultipleEditorTabsAction.ID,
      precondition,
      localize2(
        "showMultipleEditorTabsDescription",
        "Show Tab Bar with multiple tabs"
      )
    );
  }
}
class ZenShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    __name(this, "ZenShowMultipleEditorTabsAction");
  }
  static ID = "workbench.action.zenShowMultipleEditorTabs";
  constructor() {
    const precondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(
        `config.${ZenModeSettings.SHOW_TABS}`,
        EditorTabsMode.MULTIPLE
      ).negate(),
      InEditorZenModeContext
    );
    const title = localize2(
      "showMultipleEditorTabsZenMode",
      "Show Multiple Editor Tabs in Zen Mode"
    );
    super(
      ZenModeSettings.SHOW_TABS,
      EditorTabsMode.MULTIPLE,
      title,
      ZenShowMultipleEditorTabsAction.ID,
      precondition,
      localize2(
        "showMultipleEditorTabsZenModeDescription",
        "Show Tab Bar in Zen Mode"
      )
    );
  }
}
class ShowSingleEditorTabAction extends AbstractSetShowTabsAction {
  static {
    __name(this, "ShowSingleEditorTabAction");
  }
  static ID = "workbench.action.showEditorTab";
  constructor() {
    const precondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(
        `config.${LayoutSettings.EDITOR_TABS_MODE}`,
        EditorTabsMode.SINGLE
      ).negate(),
      InEditorZenModeContext.negate()
    );
    const title = localize2(
      "showSingleEditorTab",
      "Show Single Editor Tab"
    );
    super(
      LayoutSettings.EDITOR_TABS_MODE,
      EditorTabsMode.SINGLE,
      title,
      ShowSingleEditorTabAction.ID,
      precondition,
      localize2(
        "showSingleEditorTabDescription",
        "Show Tab Bar with one Tab"
      )
    );
  }
}
class ZenShowSingleEditorTabAction extends AbstractSetShowTabsAction {
  static {
    __name(this, "ZenShowSingleEditorTabAction");
  }
  static ID = "workbench.action.zenShowEditorTab";
  constructor() {
    const precondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(
        `config.${ZenModeSettings.SHOW_TABS}`,
        EditorTabsMode.SINGLE
      ).negate(),
      InEditorZenModeContext
    );
    const title = localize2(
      "showSingleEditorTabZenMode",
      "Show Single Editor Tab in Zen Mode"
    );
    super(
      ZenModeSettings.SHOW_TABS,
      EditorTabsMode.SINGLE,
      title,
      ZenShowSingleEditorTabAction.ID,
      precondition,
      localize2(
        "showSingleEditorTabZenModeDescription",
        "Show Tab Bar in Zen Mode with one Tab"
      )
    );
  }
}
registerAction2(HideEditorTabsAction);
registerAction2(ZenHideEditorTabsAction);
registerAction2(ShowMultipleEditorTabsAction);
registerAction2(ZenShowMultipleEditorTabsAction);
registerAction2(ShowSingleEditorTabAction);
registerAction2(ZenShowSingleEditorTabAction);
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorTabsBarShowTabsSubmenu,
  title: localize("tabBar", "Tab Bar"),
  group: "3_workbench_layout_move",
  order: 10,
  when: InEditorZenModeContext.negate()
});
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorTabsBarShowTabsZenModeSubmenu,
  title: localize("tabBar", "Tab Bar"),
  group: "3_workbench_layout_move",
  order: 10,
  when: InEditorZenModeContext
});
class EditorActionsTitleBarAction extends Action2 {
  static {
    __name(this, "EditorActionsTitleBarAction");
  }
  static ID = "workbench.action.editorActionsTitleBar";
  constructor() {
    super({
      id: EditorActionsTitleBarAction.ID,
      title: localize2(
        "moveEditorActionsToTitleBar",
        "Move Editor Actions to Title Bar"
      ),
      category: Categories.View,
      precondition: ContextKeyExpr.equals(
        `config.${LayoutSettings.EDITOR_ACTIONS_LOCATION}`,
        EditorActionsLocation.TITLEBAR
      ).negate(),
      metadata: {
        description: localize2(
          "moveEditorActionsToTitleBarDescription",
          "Move Editor Actions from the tab bar to the title bar"
        )
      },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue(
      LayoutSettings.EDITOR_ACTIONS_LOCATION,
      EditorActionsLocation.TITLEBAR
    );
  }
}
registerAction2(EditorActionsTitleBarAction);
class EditorActionsDefaultAction extends Action2 {
  static {
    __name(this, "EditorActionsDefaultAction");
  }
  static ID = "workbench.action.editorActionsDefault";
  constructor() {
    super({
      id: EditorActionsDefaultAction.ID,
      title: localize2(
        "moveEditorActionsToTabBar",
        "Move Editor Actions to Tab Bar"
      ),
      category: Categories.View,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals(
          `config.${LayoutSettings.EDITOR_ACTIONS_LOCATION}`,
          EditorActionsLocation.DEFAULT
        ).negate(),
        ContextKeyExpr.equals(
          `config.${LayoutSettings.EDITOR_TABS_MODE}`,
          EditorTabsMode.NONE
        ).negate()
      ),
      metadata: {
        description: localize2(
          "moveEditorActionsToTabBarDescription",
          "Move Editor Actions from the title bar to the tab bar"
        )
      },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue(
      LayoutSettings.EDITOR_ACTIONS_LOCATION,
      EditorActionsLocation.DEFAULT
    );
  }
}
registerAction2(EditorActionsDefaultAction);
class HideEditorActionsAction extends Action2 {
  static {
    __name(this, "HideEditorActionsAction");
  }
  static ID = "workbench.action.hideEditorActions";
  constructor() {
    super({
      id: HideEditorActionsAction.ID,
      title: localize2("hideEditorActons", "Hide Editor Actions"),
      category: Categories.View,
      precondition: ContextKeyExpr.equals(
        `config.${LayoutSettings.EDITOR_ACTIONS_LOCATION}`,
        EditorActionsLocation.HIDDEN
      ).negate(),
      metadata: {
        description: localize2(
          "hideEditorActonsDescription",
          "Hide Editor Actions in the tab and title bar"
        )
      },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue(
      LayoutSettings.EDITOR_ACTIONS_LOCATION,
      EditorActionsLocation.HIDDEN
    );
  }
}
registerAction2(HideEditorActionsAction);
class ShowEditorActionsAction extends Action2 {
  static {
    __name(this, "ShowEditorActionsAction");
  }
  static ID = "workbench.action.showEditorActions";
  constructor() {
    super({
      id: ShowEditorActionsAction.ID,
      title: localize2("showEditorActons", "Show Editor Actions"),
      category: Categories.View,
      precondition: ContextKeyExpr.equals(
        `config.${LayoutSettings.EDITOR_ACTIONS_LOCATION}`,
        EditorActionsLocation.HIDDEN
      ),
      metadata: {
        description: localize2(
          "showEditorActonsDescription",
          "Make Editor Actions visible."
        )
      },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue(
      LayoutSettings.EDITOR_ACTIONS_LOCATION,
      EditorActionsLocation.DEFAULT
    );
  }
}
registerAction2(ShowEditorActionsAction);
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorActionsPositionSubmenu,
  title: localize("editorActionsPosition", "Editor Actions Position"),
  group: "3_workbench_layout_move",
  order: 11
});
class ConfigureEditorTabsAction extends Action2 {
  static {
    __name(this, "ConfigureEditorTabsAction");
  }
  static ID = "workbench.action.configureEditorTabs";
  constructor() {
    super({
      id: ConfigureEditorTabsAction.ID,
      title: localize2("configureTabs", "Configure Tabs"),
      category: Categories.View
    });
  }
  run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    preferencesService.openSettings({
      jsonEditor: false,
      query: "workbench.editor tab"
    });
  }
}
registerAction2(ConfigureEditorTabsAction);
class ConfigureEditorAction extends Action2 {
  static {
    __name(this, "ConfigureEditorAction");
  }
  static ID = "workbench.action.configureEditor";
  constructor() {
    super({
      id: ConfigureEditorAction.ID,
      title: localize2("configureEditors", "Configure Editors"),
      category: Categories.View
    });
  }
  run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    preferencesService.openSettings({
      jsonEditor: false,
      query: "workbench.editor"
    });
  }
}
registerAction2(ConfigureEditorAction);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.toggleSeparatePinnedEditorTabs",
        title: localize2(
          "toggleSeparatePinnedEditorTabs",
          "Separate Pinned Editor Tabs"
        ),
        category: Categories.View,
        precondition: ContextKeyExpr.equals(
          `config.${LayoutSettings.EDITOR_TABS_MODE}`,
          EditorTabsMode.MULTIPLE
        ),
        metadata: {
          description: localize2(
            "toggleSeparatePinnedEditorTabsDescription",
            "Toggle whether pinned editor tabs are shown on a separate row above unpinned tabs."
          )
        },
        f1: true
      });
    }
    run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      const oldettingValue = configurationService.getValue(
        "workbench.editor.pinnedTabsOnSeparateRow"
      );
      const newSettingValue = !oldettingValue;
      return configurationService.updateValue(
        "workbench.editor.pinnedTabsOnSeparateRow",
        newSettingValue
      );
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.toggleZenMode",
        title: {
          ...localize2("toggleZenMode", "Toggle Zen Mode"),
          mnemonicTitle: localize(
            {
              key: "miToggleZenMode",
              comment: ["&& denotes a mnemonic"]
            },
            "Zen Mode"
          )
        },
        precondition: IsAuxiliaryWindowFocusedContext.toNegated(),
        category: Categories.View,
        f1: true,
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: KeyChord(
            KeyMod.CtrlCmd | KeyCode.KeyK,
            KeyCode.KeyZ
          )
        },
        toggled: InEditorZenModeContext,
        menu: [
          {
            id: MenuId.MenubarAppearanceMenu,
            group: "1_toggle_view",
            order: 2
          }
        ]
      });
    }
    run(accessor) {
      return accessor.get(IWorkbenchLayoutService).toggleZenMode();
    }
  }
);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.exitZenMode",
  weight: KeybindingWeight.EditorContrib - 1e3,
  handler(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const contextKeyService = accessor.get(IContextKeyService);
    if (InEditorZenModeContext.getValue(contextKeyService)) {
      layoutService.toggleZenMode();
    }
  },
  when: InEditorZenModeContext,
  primary: KeyChord(KeyCode.Escape, KeyCode.Escape)
});
if (isWindows || isLinux || isWeb) {
  registerAction2(
    class ToggleMenubarAction extends Action2 {
      static {
        __name(this, "ToggleMenubarAction");
      }
      constructor() {
        super({
          id: "workbench.action.toggleMenuBar",
          title: {
            ...localize2("toggleMenuBar", "Toggle Menu Bar"),
            mnemonicTitle: localize(
              {
                key: "miMenuBar",
                comment: ["&& denotes a mnemonic"]
              },
              "Menu &&Bar"
            )
          },
          category: Categories.View,
          f1: true,
          toggled: ContextKeyExpr.and(
            IsMacNativeContext.toNegated(),
            ContextKeyExpr.notEquals(
              "config.window.menuBarVisibility",
              "hidden"
            ),
            ContextKeyExpr.notEquals(
              "config.window.menuBarVisibility",
              "toggle"
            ),
            ContextKeyExpr.notEquals(
              "config.window.menuBarVisibility",
              "compact"
            )
          ),
          menu: [
            {
              id: MenuId.MenubarAppearanceMenu,
              group: "2_workbench_layout",
              order: 0
            }
          ]
        });
      }
      run(accessor) {
        return accessor.get(IWorkbenchLayoutService).toggleMenuBar();
      }
    }
  );
  for (const menuId of [
    MenuId.TitleBarContext,
    MenuId.TitleBarTitleContext
  ]) {
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.toggleMenuBar",
        title: localize("miMenuBarNoMnemonic", "Menu Bar"),
        toggled: ContextKeyExpr.and(
          IsMacNativeContext.toNegated(),
          ContextKeyExpr.notEquals(
            "config.window.menuBarVisibility",
            "hidden"
          ),
          ContextKeyExpr.notEquals(
            "config.window.menuBarVisibility",
            "toggle"
          ),
          ContextKeyExpr.notEquals(
            "config.window.menuBarVisibility",
            "compact"
          )
        )
      },
      when: ContextKeyExpr.and(
        IsAuxiliaryWindowFocusedContext.toNegated(),
        ContextKeyExpr.notEquals(
          TitleBarStyleContext.key,
          TitlebarStyle.NATIVE
        ),
        IsMainWindowFullscreenContext.negate()
      ),
      group: "2_config",
      order: 0
    });
  }
}
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.resetViewLocations",
        title: localize2("resetViewLocations", "Reset View Locations"),
        category: Categories.View,
        f1: true
      });
    }
    run(accessor) {
      return accessor.get(IViewDescriptorService).reset();
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.moveView",
        title: localize2("moveView", "Move View"),
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor) {
      const viewDescriptorService = accessor.get(IViewDescriptorService);
      const instantiationService = accessor.get(IInstantiationService);
      const quickInputService = accessor.get(IQuickInputService);
      const contextKeyService = accessor.get(IContextKeyService);
      const paneCompositePartService = accessor.get(
        IPaneCompositePartService
      );
      const focusedViewId = FocusedViewContext.getValue(contextKeyService);
      let viewId;
      if (focusedViewId && viewDescriptorService.getViewDescriptorById(focusedViewId)?.canMoveView) {
        viewId = focusedViewId;
      }
      try {
        viewId = await this.getView(
          quickInputService,
          viewDescriptorService,
          paneCompositePartService,
          viewId
        );
        if (!viewId) {
          return;
        }
        const moveFocusedViewAction = new MoveFocusedViewAction();
        instantiationService.invokeFunction(
          (accessor2) => moveFocusedViewAction.run(accessor2, viewId)
        );
      } catch {
      }
    }
    getViewItems(viewDescriptorService, paneCompositePartService) {
      const results = [];
      const viewlets = paneCompositePartService.getVisiblePaneCompositeIds(
        ViewContainerLocation.Sidebar
      );
      viewlets.forEach((viewletId) => {
        const container = viewDescriptorService.getViewContainerById(viewletId);
        const containerModel = viewDescriptorService.getViewContainerModel(container);
        let hasAddedView = false;
        containerModel.visibleViewDescriptors.forEach(
          (viewDescriptor) => {
            if (viewDescriptor.canMoveView) {
              if (!hasAddedView) {
                results.push({
                  type: "separator",
                  label: localize(
                    "sidebarContainer",
                    "Side Bar / {0}",
                    containerModel.title
                  )
                });
                hasAddedView = true;
              }
              results.push({
                id: viewDescriptor.id,
                label: viewDescriptor.name.value
              });
            }
          }
        );
      });
      const panels = paneCompositePartService.getPinnedPaneCompositeIds(
        ViewContainerLocation.Panel
      );
      panels.forEach((panel) => {
        const container = viewDescriptorService.getViewContainerById(panel);
        const containerModel = viewDescriptorService.getViewContainerModel(container);
        let hasAddedView = false;
        containerModel.visibleViewDescriptors.forEach(
          (viewDescriptor) => {
            if (viewDescriptor.canMoveView) {
              if (!hasAddedView) {
                results.push({
                  type: "separator",
                  label: localize(
                    "panelContainer",
                    "Panel / {0}",
                    containerModel.title
                  )
                });
                hasAddedView = true;
              }
              results.push({
                id: viewDescriptor.id,
                label: viewDescriptor.name.value
              });
            }
          }
        );
      });
      const sidePanels = paneCompositePartService.getPinnedPaneCompositeIds(
        ViewContainerLocation.AuxiliaryBar
      );
      sidePanels.forEach((panel) => {
        const container = viewDescriptorService.getViewContainerById(panel);
        const containerModel = viewDescriptorService.getViewContainerModel(container);
        let hasAddedView = false;
        containerModel.visibleViewDescriptors.forEach(
          (viewDescriptor) => {
            if (viewDescriptor.canMoveView) {
              if (!hasAddedView) {
                results.push({
                  type: "separator",
                  label: localize(
                    "secondarySideBarContainer",
                    "Secondary Side Bar / {0}",
                    containerModel.title
                  )
                });
                hasAddedView = true;
              }
              results.push({
                id: viewDescriptor.id,
                label: viewDescriptor.name.value
              });
            }
          }
        );
      });
      return results;
    }
    async getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId) {
      const disposables = new DisposableStore();
      const quickPick = disposables.add(
        quickInputService.createQuickPick({ useSeparators: true })
      );
      quickPick.placeholder = localize(
        "moveFocusedView.selectView",
        "Select a View to Move"
      );
      quickPick.items = this.getViewItems(
        viewDescriptorService,
        paneCompositePartService
      );
      quickPick.selectedItems = quickPick.items.filter(
        (item) => item.id === viewId
      );
      return new Promise((resolve, reject) => {
        disposables.add(
          quickPick.onDidAccept(() => {
            const viewId2 = quickPick.selectedItems[0];
            if (viewId2.id) {
              resolve(viewId2.id);
            } else {
              reject();
            }
            quickPick.hide();
          })
        );
        disposables.add(
          quickPick.onDidHide(() => {
            disposables.dispose();
            reject();
          })
        );
        quickPick.show();
      });
    }
  }
);
class MoveFocusedViewAction extends Action2 {
  static {
    __name(this, "MoveFocusedViewAction");
  }
  constructor() {
    super({
      id: "workbench.action.moveFocusedView",
      title: localize2("moveFocusedView", "Move Focused View"),
      category: Categories.View,
      precondition: FocusedViewContext.notEqualsTo(""),
      f1: true
    });
  }
  run(accessor, viewId) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const viewsService = accessor.get(IViewsService);
    const quickInputService = accessor.get(IQuickInputService);
    const contextKeyService = accessor.get(IContextKeyService);
    const dialogService = accessor.get(IDialogService);
    const paneCompositePartService = accessor.get(
      IPaneCompositePartService
    );
    const focusedViewId = viewId || FocusedViewContext.getValue(contextKeyService);
    if (focusedViewId === void 0 || focusedViewId.trim() === "") {
      dialogService.error(
        localize(
          "moveFocusedView.error.noFocusedView",
          "There is no view currently focused."
        )
      );
      return;
    }
    const viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
    if (!viewDescriptor || !viewDescriptor.canMoveView) {
      dialogService.error(
        localize(
          "moveFocusedView.error.nonMovableView",
          "The currently focused view is not movable."
        )
      );
      return;
    }
    const disposables = new DisposableStore();
    const quickPick = disposables.add(
      quickInputService.createQuickPick({ useSeparators: true })
    );
    quickPick.placeholder = localize(
      "moveFocusedView.selectDestination",
      "Select a Destination for the View"
    );
    quickPick.title = localize(
      {
        key: "moveFocusedView.title",
        comment: [
          "{0} indicates the title of the view the user has selected to move."
        ]
      },
      "View: Move {0}",
      viewDescriptor.name.value
    );
    const items = [];
    const currentContainer = viewDescriptorService.getViewContainerByViewId(focusedViewId);
    const currentLocation = viewDescriptorService.getViewLocationById(focusedViewId);
    const isViewSolo = viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors.length === 1;
    if (!(isViewSolo && currentLocation === ViewContainerLocation.Panel)) {
      items.push({
        id: "_.panel.newcontainer",
        label: localize(
          {
            key: "moveFocusedView.newContainerInPanel",
            comment: ["Creates a new top-level tab in the panel."]
          },
          "New Panel Entry"
        )
      });
    }
    if (!(isViewSolo && currentLocation === ViewContainerLocation.Sidebar)) {
      items.push({
        id: "_.sidebar.newcontainer",
        label: localize(
          "moveFocusedView.newContainerInSidebar",
          "New Side Bar Entry"
        )
      });
    }
    if (!(isViewSolo && currentLocation === ViewContainerLocation.AuxiliaryBar)) {
      items.push({
        id: "_.auxiliarybar.newcontainer",
        label: localize(
          "moveFocusedView.newContainerInSidePanel",
          "New Secondary Side Bar Entry"
        )
      });
    }
    items.push({
      type: "separator",
      label: localize("sidebar", "Side Bar")
    });
    const pinnedViewlets = paneCompositePartService.getVisiblePaneCompositeIds(
      ViewContainerLocation.Sidebar
    );
    items.push(
      ...pinnedViewlets.filter((viewletId) => {
        if (viewletId === viewDescriptorService.getViewContainerByViewId(
          focusedViewId
        ).id) {
          return false;
        }
        return !viewDescriptorService.getViewContainerById(
          viewletId
        ).rejectAddedViews;
      }).map((viewletId) => {
        return {
          id: viewletId,
          label: viewDescriptorService.getViewContainerModel(
            viewDescriptorService.getViewContainerById(
              viewletId
            )
          ).title
        };
      })
    );
    items.push({
      type: "separator",
      label: localize("panel", "Panel")
    });
    const pinnedPanels = paneCompositePartService.getPinnedPaneCompositeIds(
      ViewContainerLocation.Panel
    );
    items.push(
      ...pinnedPanels.filter((panel) => {
        if (panel === viewDescriptorService.getViewContainerByViewId(
          focusedViewId
        ).id) {
          return false;
        }
        return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
      }).map((panel) => {
        return {
          id: panel,
          label: viewDescriptorService.getViewContainerModel(
            viewDescriptorService.getViewContainerById(panel)
          ).title
        };
      })
    );
    items.push({
      type: "separator",
      label: localize("secondarySideBar", "Secondary Side Bar")
    });
    const pinnedAuxPanels = paneCompositePartService.getPinnedPaneCompositeIds(
      ViewContainerLocation.AuxiliaryBar
    );
    items.push(
      ...pinnedAuxPanels.filter((panel) => {
        if (panel === viewDescriptorService.getViewContainerByViewId(
          focusedViewId
        ).id) {
          return false;
        }
        return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
      }).map((panel) => {
        return {
          id: panel,
          label: viewDescriptorService.getViewContainerModel(
            viewDescriptorService.getViewContainerById(panel)
          ).title
        };
      })
    );
    quickPick.items = items;
    disposables.add(
      quickPick.onDidAccept(() => {
        const destination = quickPick.selectedItems[0];
        if (destination.id === "_.panel.newcontainer") {
          viewDescriptorService.moveViewToLocation(
            viewDescriptor,
            ViewContainerLocation.Panel,
            this.desc.id
          );
          viewsService.openView(focusedViewId, true);
        } else if (destination.id === "_.sidebar.newcontainer") {
          viewDescriptorService.moveViewToLocation(
            viewDescriptor,
            ViewContainerLocation.Sidebar,
            this.desc.id
          );
          viewsService.openView(focusedViewId, true);
        } else if (destination.id === "_.auxiliarybar.newcontainer") {
          viewDescriptorService.moveViewToLocation(
            viewDescriptor,
            ViewContainerLocation.AuxiliaryBar,
            this.desc.id
          );
          viewsService.openView(focusedViewId, true);
        } else if (destination.id) {
          viewDescriptorService.moveViewsToContainer(
            [viewDescriptor],
            viewDescriptorService.getViewContainerById(
              destination.id
            ),
            void 0,
            this.desc.id
          );
          viewsService.openView(focusedViewId, true);
        }
        quickPick.hide();
      })
    );
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
}
registerAction2(MoveFocusedViewAction);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.resetFocusedViewLocation",
        title: localize2(
          "resetFocusedViewLocation",
          "Reset Focused View Location"
        ),
        category: Categories.View,
        f1: true,
        precondition: FocusedViewContext.notEqualsTo("")
      });
    }
    run(accessor) {
      const viewDescriptorService = accessor.get(IViewDescriptorService);
      const contextKeyService = accessor.get(IContextKeyService);
      const dialogService = accessor.get(IDialogService);
      const viewsService = accessor.get(IViewsService);
      const focusedViewId = FocusedViewContext.getValue(contextKeyService);
      let viewDescriptor = null;
      if (focusedViewId !== void 0 && focusedViewId.trim() !== "") {
        viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
      }
      if (!viewDescriptor) {
        dialogService.error(
          localize(
            "resetFocusedView.error.noFocusedView",
            "There is no view currently focused."
          )
        );
        return;
      }
      const defaultContainer = viewDescriptorService.getDefaultContainerById(
        viewDescriptor.id
      );
      if (!defaultContainer || defaultContainer === viewDescriptorService.getViewContainerByViewId(
        viewDescriptor.id
      )) {
        return;
      }
      viewDescriptorService.moveViewsToContainer(
        [viewDescriptor],
        defaultContainer,
        void 0,
        this.desc.id
      );
      viewsService.openView(viewDescriptor.id, true);
    }
  }
);
class BaseResizeViewAction extends Action2 {
  static {
    __name(this, "BaseResizeViewAction");
  }
  static RESIZE_INCREMENT = 60;
  // This is a css pixel size
  resizePart(widthChange, heightChange, layoutService, partToResize) {
    let part;
    if (partToResize === void 0) {
      const isEditorFocus = layoutService.hasFocus(Parts.EDITOR_PART);
      const isSidebarFocus = layoutService.hasFocus(Parts.SIDEBAR_PART);
      const isPanelFocus = layoutService.hasFocus(Parts.PANEL_PART);
      const isAuxiliaryBarFocus = layoutService.hasFocus(
        Parts.AUXILIARYBAR_PART
      );
      if (isSidebarFocus) {
        part = Parts.SIDEBAR_PART;
      } else if (isPanelFocus) {
        part = Parts.PANEL_PART;
      } else if (isEditorFocus) {
        part = Parts.EDITOR_PART;
      } else if (isAuxiliaryBarFocus) {
        part = Parts.AUXILIARYBAR_PART;
      }
    } else {
      part = partToResize;
    }
    if (part) {
      layoutService.resizePart(part, widthChange, heightChange);
    }
  }
}
class IncreaseViewSizeAction extends BaseResizeViewAction {
  static {
    __name(this, "IncreaseViewSizeAction");
  }
  constructor() {
    super({
      id: "workbench.action.increaseViewSize",
      title: localize2("increaseViewSize", "Increase Current View Size"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(
      BaseResizeViewAction.RESIZE_INCREMENT,
      BaseResizeViewAction.RESIZE_INCREMENT,
      accessor.get(IWorkbenchLayoutService)
    );
  }
}
class IncreaseViewWidthAction extends BaseResizeViewAction {
  static {
    __name(this, "IncreaseViewWidthAction");
  }
  constructor() {
    super({
      id: "workbench.action.increaseViewWidth",
      title: localize2("increaseEditorWidth", "Increase Editor Width"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(
      BaseResizeViewAction.RESIZE_INCREMENT,
      0,
      accessor.get(IWorkbenchLayoutService),
      Parts.EDITOR_PART
    );
  }
}
class IncreaseViewHeightAction extends BaseResizeViewAction {
  static {
    __name(this, "IncreaseViewHeightAction");
  }
  constructor() {
    super({
      id: "workbench.action.increaseViewHeight",
      title: localize2("increaseEditorHeight", "Increase Editor Height"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(
      0,
      BaseResizeViewAction.RESIZE_INCREMENT,
      accessor.get(IWorkbenchLayoutService),
      Parts.EDITOR_PART
    );
  }
}
class DecreaseViewSizeAction extends BaseResizeViewAction {
  static {
    __name(this, "DecreaseViewSizeAction");
  }
  constructor() {
    super({
      id: "workbench.action.decreaseViewSize",
      title: localize2("decreaseViewSize", "Decrease Current View Size"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(
      -BaseResizeViewAction.RESIZE_INCREMENT,
      -BaseResizeViewAction.RESIZE_INCREMENT,
      accessor.get(IWorkbenchLayoutService)
    );
  }
}
class DecreaseViewWidthAction extends BaseResizeViewAction {
  static {
    __name(this, "DecreaseViewWidthAction");
  }
  constructor() {
    super({
      id: "workbench.action.decreaseViewWidth",
      title: localize2("decreaseEditorWidth", "Decrease Editor Width"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(
      -BaseResizeViewAction.RESIZE_INCREMENT,
      0,
      accessor.get(IWorkbenchLayoutService),
      Parts.EDITOR_PART
    );
  }
}
class DecreaseViewHeightAction extends BaseResizeViewAction {
  static {
    __name(this, "DecreaseViewHeightAction");
  }
  constructor() {
    super({
      id: "workbench.action.decreaseViewHeight",
      title: localize2("decreaseEditorHeight", "Decrease Editor Height"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(
      0,
      -BaseResizeViewAction.RESIZE_INCREMENT,
      accessor.get(IWorkbenchLayoutService),
      Parts.EDITOR_PART
    );
  }
}
registerAction2(IncreaseViewSizeAction);
registerAction2(IncreaseViewWidthAction);
registerAction2(IncreaseViewHeightAction);
registerAction2(DecreaseViewSizeAction);
registerAction2(DecreaseViewWidthAction);
registerAction2(DecreaseViewHeightAction);
function isContextualLayoutVisualIcon(icon) {
  return icon.iconA !== void 0;
}
__name(isContextualLayoutVisualIcon, "isContextualLayoutVisualIcon");
const CreateToggleLayoutItem = /* @__PURE__ */ __name((id, active, label, visualIcon) => {
  return {
    id,
    active,
    label,
    visualIcon,
    activeIcon: Codicon.eye,
    inactiveIcon: Codicon.eyeClosed,
    activeAriaLabel: localize("selectToHide", "Select to Hide"),
    inactiveAriaLabel: localize("selectToShow", "Select to Show"),
    useButtons: true
  };
}, "CreateToggleLayoutItem");
const CreateOptionLayoutItem = /* @__PURE__ */ __name((id, active, label, visualIcon) => {
  return {
    id,
    active,
    label,
    visualIcon,
    activeIcon: Codicon.check,
    activeAriaLabel: localize("active", "Active"),
    useButtons: false
  };
}, "CreateOptionLayoutItem");
const MenuBarToggledContext = ContextKeyExpr.and(
  IsMacNativeContext.toNegated(),
  ContextKeyExpr.notEquals("config.window.menuBarVisibility", "hidden"),
  ContextKeyExpr.notEquals("config.window.menuBarVisibility", "toggle"),
  ContextKeyExpr.notEquals("config.window.menuBarVisibility", "compact")
);
const ToggleVisibilityActions = [];
if (!isMacintosh || !isNative) {
  ToggleVisibilityActions.push(
    CreateToggleLayoutItem(
      "workbench.action.toggleMenuBar",
      MenuBarToggledContext,
      localize("menuBar", "Menu Bar"),
      menubarIcon
    )
  );
}
ToggleVisibilityActions.push(
  ...[
    CreateToggleLayoutItem(
      ToggleActivityBarVisibilityActionId,
      ContextKeyExpr.notEquals(
        "config.workbench.activityBar.location",
        "hidden"
      ),
      localize("activityBar", "Activity Bar"),
      {
        whenA: ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "left"
        ),
        iconA: activityBarLeftIcon,
        iconB: activityBarRightIcon
      }
    ),
    CreateToggleLayoutItem(
      ToggleSidebarVisibilityAction.ID,
      SideBarVisibleContext,
      localize("sideBar", "Primary Side Bar"),
      {
        whenA: ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "left"
        ),
        iconA: panelLeftIcon,
        iconB: panelRightIcon
      }
    ),
    CreateToggleLayoutItem(
      ToggleAuxiliaryBarAction.ID,
      AuxiliaryBarVisibleContext,
      localize("secondarySideBar", "Secondary Side Bar"),
      {
        whenA: ContextKeyExpr.equals(
          "config.workbench.sideBar.location",
          "left"
        ),
        iconA: panelRightIcon,
        iconB: panelLeftIcon
      }
    ),
    CreateToggleLayoutItem(
      TogglePanelAction.ID,
      PanelVisibleContext,
      localize("panel", "Panel"),
      panelIcon
    ),
    CreateToggleLayoutItem(
      ToggleStatusbarVisibilityAction.ID,
      ContextKeyExpr.equals("config.workbench.statusBar.visible", true),
      localize("statusBar", "Status Bar"),
      statusBarIcon
    )
  ]
);
const MoveSideBarActions = [
  CreateOptionLayoutItem(
    MoveSidebarLeftAction.ID,
    ContextKeyExpr.equals("config.workbench.sideBar.location", "left"),
    localize("leftSideBar", "Left"),
    panelLeftIcon
  ),
  CreateOptionLayoutItem(
    MoveSidebarRightAction.ID,
    ContextKeyExpr.equals("config.workbench.sideBar.location", "right"),
    localize("rightSideBar", "Right"),
    panelRightIcon
  )
];
const AlignPanelActions = [
  CreateOptionLayoutItem(
    "workbench.action.alignPanelLeft",
    PanelAlignmentContext.isEqualTo("left"),
    localize("leftPanel", "Left"),
    panelAlignmentLeftIcon
  ),
  CreateOptionLayoutItem(
    "workbench.action.alignPanelRight",
    PanelAlignmentContext.isEqualTo("right"),
    localize("rightPanel", "Right"),
    panelAlignmentRightIcon
  ),
  CreateOptionLayoutItem(
    "workbench.action.alignPanelCenter",
    PanelAlignmentContext.isEqualTo("center"),
    localize("centerPanel", "Center"),
    panelAlignmentCenterIcon
  ),
  CreateOptionLayoutItem(
    "workbench.action.alignPanelJustify",
    PanelAlignmentContext.isEqualTo("justify"),
    localize("justifyPanel", "Justify"),
    panelAlignmentJustifyIcon
  )
];
const MiscLayoutOptions = [
  CreateOptionLayoutItem(
    "workbench.action.toggleFullScreen",
    IsMainWindowFullscreenContext,
    localize("fullscreen", "Full Screen"),
    fullscreenIcon
  ),
  CreateOptionLayoutItem(
    "workbench.action.toggleZenMode",
    InEditorZenModeContext,
    localize("zenMode", "Zen Mode"),
    zenModeIcon
  ),
  CreateOptionLayoutItem(
    "workbench.action.toggleCenteredLayout",
    IsMainEditorCenteredLayoutContext,
    localize("centeredLayout", "Centered Layout"),
    centerLayoutIcon
  )
];
const LayoutContextKeySet = /* @__PURE__ */ new Set();
for (const { active } of [
  ...ToggleVisibilityActions,
  ...MoveSideBarActions,
  ...AlignPanelActions,
  ...MiscLayoutOptions
]) {
  for (const key of active.keys()) {
    LayoutContextKeySet.add(key);
  }
}
registerAction2(
  class CustomizeLayoutAction extends Action2 {
    static {
      __name(this, "CustomizeLayoutAction");
    }
    _currentQuickPick;
    constructor() {
      super({
        id: "workbench.action.customizeLayout",
        title: localize2("customizeLayout", "Customize Layout..."),
        f1: true,
        icon: configureLayoutIcon,
        menu: [
          {
            id: MenuId.LayoutControlMenuSubmenu,
            group: "z_end"
          },
          {
            id: MenuId.LayoutControlMenu,
            when: ContextKeyExpr.equals(
              "config.workbench.layoutControl.type",
              "both"
            ),
            group: "z_end"
          }
        ]
      });
    }
    getItems(contextKeyService, keybindingService) {
      const toQuickPickItem = /* @__PURE__ */ __name((item) => {
        const toggled = item.active.evaluate(
          contextKeyService.getContext(null)
        );
        let label = item.useButtons ? item.label : item.label + (toggled && item.activeIcon ? ` $(${item.activeIcon.id})` : !toggled && item.inactiveIcon ? ` $(${item.inactiveIcon.id})` : "");
        const ariaLabel = item.label + (toggled && item.activeAriaLabel ? ` (${item.activeAriaLabel})` : !toggled && item.inactiveAriaLabel ? ` (${item.inactiveAriaLabel})` : "");
        if (item.visualIcon) {
          let icon2 = item.visualIcon;
          if (isContextualLayoutVisualIcon(icon2)) {
            const useIconA = icon2.whenA.evaluate(
              contextKeyService.getContext(null)
            );
            icon2 = useIconA ? icon2.iconA : icon2.iconB;
          }
          label = `$(${icon2.id}) ${label}`;
        }
        const icon = toggled ? item.activeIcon : item.inactiveIcon;
        return {
          type: "item",
          id: item.id,
          label,
          ariaLabel,
          keybinding: keybindingService.lookupKeybinding(
            item.id,
            contextKeyService
          ),
          buttons: item.useButtons ? [
            {
              alwaysVisible: false,
              tooltip: ariaLabel,
              iconClass: icon ? ThemeIcon.asClassName(icon) : void 0
            }
          ] : void 0
        };
      }, "toQuickPickItem");
      return [
        {
          type: "separator",
          label: localize("toggleVisibility", "Visibility")
        },
        ...ToggleVisibilityActions.map(toQuickPickItem),
        {
          type: "separator",
          label: localize(
            "sideBarPosition",
            "Primary Side Bar Position"
          )
        },
        ...MoveSideBarActions.map(toQuickPickItem),
        {
          type: "separator",
          label: localize("panelAlignment", "Panel Alignment")
        },
        ...AlignPanelActions.map(toQuickPickItem),
        {
          type: "separator",
          label: localize("layoutModes", "Modes")
        },
        ...MiscLayoutOptions.map(toQuickPickItem)
      ];
    }
    run(accessor) {
      if (this._currentQuickPick) {
        this._currentQuickPick.hide();
        return;
      }
      const configurationService = accessor.get(IConfigurationService);
      const contextKeyService = accessor.get(IContextKeyService);
      const commandService = accessor.get(ICommandService);
      const quickInputService = accessor.get(IQuickInputService);
      const keybindingService = accessor.get(IKeybindingService);
      const disposables = new DisposableStore();
      const quickPick = disposables.add(
        quickInputService.createQuickPick({ useSeparators: true })
      );
      this._currentQuickPick = quickPick;
      quickPick.items = this.getItems(
        contextKeyService,
        keybindingService
      );
      quickPick.ignoreFocusOut = true;
      quickPick.hideInput = true;
      quickPick.title = localize(
        "customizeLayoutQuickPickTitle",
        "Customize Layout"
      );
      const closeButton = {
        alwaysVisible: true,
        iconClass: ThemeIcon.asClassName(Codicon.close),
        tooltip: localize("close", "Close")
      };
      const resetButton = {
        alwaysVisible: true,
        iconClass: ThemeIcon.asClassName(Codicon.discard),
        tooltip: localize("restore defaults", "Restore Defaults")
      };
      quickPick.buttons = [resetButton, closeButton];
      let selectedItem;
      disposables.add(
        contextKeyService.onDidChangeContext((changeEvent) => {
          if (changeEvent.affectsSome(LayoutContextKeySet)) {
            quickPick.items = this.getItems(
              contextKeyService,
              keybindingService
            );
            if (selectedItem) {
              quickPick.activeItems = quickPick.items.filter(
                (item) => item.id === selectedItem?.id
              );
            }
            setTimeout(() => quickInputService.focus(), 0);
          }
        })
      );
      disposables.add(
        quickPick.onDidAccept((event) => {
          if (quickPick.selectedItems.length) {
            selectedItem = quickPick.selectedItems[0];
            commandService.executeCommand(selectedItem.id);
          }
        })
      );
      disposables.add(
        quickPick.onDidTriggerItemButton((event) => {
          if (event.item) {
            selectedItem = event.item;
            commandService.executeCommand(selectedItem.id);
          }
        })
      );
      disposables.add(
        quickPick.onDidTriggerButton((button) => {
          if (button === closeButton) {
            quickPick.hide();
          } else if (button === resetButton) {
            const resetSetting = /* @__PURE__ */ __name((id) => {
              const config = configurationService.inspect(id);
              configurationService.updateValue(
                id,
                config.defaultValue
              );
            }, "resetSetting");
            resetSetting("workbench.activityBar.location");
            resetSetting("workbench.sideBar.location");
            resetSetting("workbench.statusBar.visible");
            resetSetting("workbench.panel.defaultLocation");
            if (!isMacintosh || !isNative) {
              resetSetting("window.menuBarVisibility");
            }
            commandService.executeCommand(
              "workbench.action.alignPanelCenter"
            );
          }
        })
      );
      disposables.add(
        quickPick.onDidHide(() => {
          quickPick.dispose();
        })
      );
      disposables.add(
        quickPick.onDispose(() => {
          this._currentQuickPick = void 0;
          disposables.dispose();
        })
      );
      quickPick.show();
    }
  }
);
export {
  ConfigureEditorAction,
  ConfigureEditorTabsAction,
  EditorActionsDefaultAction,
  EditorActionsTitleBarAction,
  HideEditorActionsAction,
  HideEditorTabsAction,
  ShowEditorActionsAction,
  ShowMultipleEditorTabsAction,
  ShowSingleEditorTabAction,
  ToggleActivityBarVisibilityActionId,
  ToggleSidebarPositionAction,
  ToggleStatusbarVisibilityAction,
  ZenHideEditorTabsAction,
  ZenShowMultipleEditorTabsAction,
  ZenShowSingleEditorTabAction
};
//# sourceMappingURL=layoutActions.js.map
