var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ILocalizedString, localize, localize2 } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { LayoutSettings } from "../../../services/layout/browser/layoutService.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "../../../common/activity.js";
import { IAction } from "../../../../base/common/actions.js";
import { IsAuxiliaryWindowFocusedContext, IsMainWindowFullscreenContext, TitleBarStyleContext, TitleBarVisibleContext } from "../../../common/contextkeys.js";
import { CustomTitleBarVisibility, TitleBarSetting, TitlebarStyle } from "../../../../platform/window/common/window.js";
class ToggleConfigAction extends Action2 {
  constructor(section, title, description, order, mainWindowOnly) {
    const when = mainWindowOnly ? IsAuxiliaryWindowFocusedContext.toNegated() : ContextKeyExpr.true();
    super({
      id: `toggle.${section}`,
      title,
      metadata: description ? { description } : void 0,
      toggled: ContextKeyExpr.equals(`config.${section}`, true),
      menu: [
        {
          id: MenuId.TitleBarContext,
          when,
          order,
          group: "2_config"
        },
        {
          id: MenuId.TitleBarTitleContext,
          when,
          order,
          group: "2_config"
        }
      ]
    });
    this.section = section;
  }
  static {
    __name(this, "ToggleConfigAction");
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    const value = configService.getValue(this.section);
    configService.updateValue(this.section, !value);
  }
}
registerAction2(class ToggleCommandCenter extends ToggleConfigAction {
  static {
    __name(this, "ToggleCommandCenter");
  }
  constructor() {
    super(LayoutSettings.COMMAND_CENTER, localize("toggle.commandCenter", "Command Center"), localize("toggle.commandCenterDescription", "Toggle visibility of the Command Center in title bar"), 1, false);
  }
});
registerAction2(class ToggleLayoutControl extends ToggleConfigAction {
  static {
    __name(this, "ToggleLayoutControl");
  }
  constructor() {
    super("workbench.layoutControl.enabled", localize("toggle.layout", "Layout Controls"), localize("toggle.layoutDescription", "Toggle visibility of the Layout Controls in title bar"), 2, true);
  }
});
registerAction2(class ToggleCustomTitleBar extends Action2 {
  static {
    __name(this, "ToggleCustomTitleBar");
  }
  constructor() {
    super({
      id: `toggle.${TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY}`,
      title: localize("toggle.hideCustomTitleBar", "Hide Custom Title Bar"),
      menu: [
        { id: MenuId.TitleBarContext, order: 0, when: ContextKeyExpr.equals(TitleBarStyleContext.key, TitlebarStyle.NATIVE), group: "3_toggle" },
        { id: MenuId.TitleBarTitleContext, order: 0, when: ContextKeyExpr.equals(TitleBarStyleContext.key, TitlebarStyle.NATIVE), group: "3_toggle" }
      ]
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.NEVER);
  }
});
registerAction2(class ToggleCustomTitleBarWindowed extends Action2 {
  static {
    __name(this, "ToggleCustomTitleBarWindowed");
  }
  constructor() {
    super({
      id: `toggle.${TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY}.windowed`,
      title: localize("toggle.hideCustomTitleBarInFullScreen", "Hide Custom Title Bar In Full Screen"),
      menu: [
        { id: MenuId.TitleBarContext, order: 1, when: IsMainWindowFullscreenContext, group: "3_toggle" },
        { id: MenuId.TitleBarTitleContext, order: 1, when: IsMainWindowFullscreenContext, group: "3_toggle" }
      ]
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.WINDOWED);
  }
});
class ToggleCustomTitleBar2 extends Action2 {
  static {
    __name(this, "ToggleCustomTitleBar");
  }
  constructor() {
    super({
      id: `toggle.toggleCustomTitleBar`,
      title: localize("toggle.customTitleBar", "Custom Title Bar"),
      toggled: TitleBarVisibleContext,
      menu: [
        {
          id: MenuId.MenubarAppearanceMenu,
          order: 6,
          when: ContextKeyExpr.or(
            ContextKeyExpr.and(
              ContextKeyExpr.equals(TitleBarStyleContext.key, TitlebarStyle.NATIVE),
              ContextKeyExpr.and(
                ContextKeyExpr.equals("config.workbench.layoutControl.enabled", false),
                ContextKeyExpr.equals("config.window.commandCenter", false),
                ContextKeyExpr.notEquals("config.workbench.editor.editorActionsLocation", "titleBar"),
                ContextKeyExpr.notEquals("config.workbench.activityBar.location", "top"),
                ContextKeyExpr.notEquals("config.workbench.activityBar.location", "bottom")
              )?.negate()
            ),
            IsMainWindowFullscreenContext
          ),
          group: "2_workbench_layout"
        }
      ]
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    const contextKeyService = accessor.get(IContextKeyService);
    const titleBarVisibility = configService.getValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY);
    switch (titleBarVisibility) {
      case CustomTitleBarVisibility.NEVER:
        configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.AUTO);
        break;
      case CustomTitleBarVisibility.WINDOWED: {
        const isFullScreen = IsMainWindowFullscreenContext.evaluate(contextKeyService.getContext(null));
        if (isFullScreen) {
          configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.AUTO);
        } else {
          configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.NEVER);
        }
        break;
      }
      case CustomTitleBarVisibility.AUTO:
      default:
        configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.NEVER);
        break;
    }
  }
}
registerAction2(ToggleCustomTitleBar2);
registerAction2(class ShowCustomTitleBar extends Action2 {
  static {
    __name(this, "ShowCustomTitleBar");
  }
  constructor() {
    super({
      id: `showCustomTitleBar`,
      title: localize2("showCustomTitleBar", "Show Custom Title Bar"),
      precondition: TitleBarVisibleContext.negate(),
      f1: true
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.AUTO);
  }
});
registerAction2(class HideCustomTitleBar extends Action2 {
  static {
    __name(this, "HideCustomTitleBar");
  }
  constructor() {
    super({
      id: `hideCustomTitleBar`,
      title: localize2("hideCustomTitleBar", "Hide Custom Title Bar"),
      precondition: TitleBarVisibleContext,
      f1: true
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.NEVER);
  }
});
registerAction2(class HideCustomTitleBar2 extends Action2 {
  static {
    __name(this, "HideCustomTitleBar");
  }
  constructor() {
    super({
      id: `hideCustomTitleBarInFullScreen`,
      title: localize2("hideCustomTitleBarInFullScreen", "Hide Custom Title Bar In Full Screen"),
      precondition: ContextKeyExpr.and(TitleBarVisibleContext, IsMainWindowFullscreenContext),
      f1: true
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    configService.updateValue(TitleBarSetting.CUSTOM_TITLE_BAR_VISIBILITY, CustomTitleBarVisibility.WINDOWED);
  }
});
registerAction2(class ToggleEditorActions extends Action2 {
  static {
    __name(this, "ToggleEditorActions");
  }
  static settingsID = `workbench.editor.editorActionsLocation`;
  constructor() {
    const titleBarContextCondition = ContextKeyExpr.and(
      ContextKeyExpr.equals(`config.workbench.editor.showTabs`, "none").negate(),
      ContextKeyExpr.equals(`config.${ToggleEditorActions.settingsID}`, "default")
    )?.negate();
    super({
      id: `toggle.${ToggleEditorActions.settingsID}`,
      title: localize("toggle.editorActions", "Editor Actions"),
      toggled: ContextKeyExpr.equals(`config.${ToggleEditorActions.settingsID}`, "hidden").negate(),
      menu: [
        { id: MenuId.TitleBarContext, order: 3, when: titleBarContextCondition, group: "2_config" },
        { id: MenuId.TitleBarTitleContext, order: 3, when: titleBarContextCondition, group: "2_config" }
      ]
    });
  }
  run(accessor, ...args) {
    const configService = accessor.get(IConfigurationService);
    const storageService = accessor.get(IStorageService);
    const location = configService.getValue(ToggleEditorActions.settingsID);
    if (location === "hidden") {
      const showTabs = configService.getValue(LayoutSettings.EDITOR_TABS_MODE);
      if (showTabs !== "none") {
        configService.updateValue(ToggleEditorActions.settingsID, "titleBar");
      } else {
        const storedValue = storageService.get(ToggleEditorActions.settingsID, StorageScope.PROFILE);
        configService.updateValue(ToggleEditorActions.settingsID, storedValue ?? "default");
      }
      storageService.remove(ToggleEditorActions.settingsID, StorageScope.PROFILE);
    } else {
      configService.updateValue(ToggleEditorActions.settingsID, "hidden");
      storageService.store(ToggleEditorActions.settingsID, location, StorageScope.PROFILE, StorageTarget.USER);
    }
  }
});
const ACCOUNTS_ACTIVITY_TILE_ACTION = {
  id: ACCOUNTS_ACTIVITY_ID,
  label: localize("accounts", "Accounts"),
  tooltip: localize("accounts", "Accounts"),
  class: void 0,
  enabled: true,
  run: /* @__PURE__ */ __name(function() {
  }, "run")
};
const GLOBAL_ACTIVITY_TITLE_ACTION = {
  id: GLOBAL_ACTIVITY_ID,
  label: localize("manage", "Manage"),
  tooltip: localize("manage", "Manage"),
  class: void 0,
  enabled: true,
  run: /* @__PURE__ */ __name(function() {
  }, "run")
};
export {
  ACCOUNTS_ACTIVITY_TILE_ACTION,
  GLOBAL_ACTIVITY_TITLE_ACTION
};
//# sourceMappingURL=titlebarActions.js.map
