var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getActiveWindow } from "../../../base/browser/dom.js";
import { KeyCode, KeyMod } from "../../../base/common/keyCodes.js";
import { URI } from "../../../base/common/uri.js";
import { localize2 } from "../../../nls.js";
import { Categories } from "../../../platform/action/common/actionCommonCategories.js";
import { Action2, MenuId } from "../../../platform/actions/common/actions.js";
import { IsDevelopmentContext } from "../../../platform/contextkey/common/contextkeys.js";
import { IFileService } from "../../../platform/files/common/files.js";
import { KeybindingWeight } from "../../../platform/keybinding/common/keybindingsRegistry.js";
import { INativeHostService } from "../../../platform/native/common/native.js";
import { IEditorService } from "../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../services/environment/common/environmentService.js";
import { INativeWorkbenchEnvironmentService } from "../../services/environment/electron-sandbox/environmentService.js";
class ToggleDevToolsAction extends Action2 {
  static {
    __name(this, "ToggleDevToolsAction");
  }
  constructor() {
    super({
      id: "workbench.action.toggleDevTools",
      title: localize2("toggleDevTools", "Toggle Developer Tools"),
      category: Categories.Developer,
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib + 50,
        when: IsDevelopmentContext,
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyI,
        mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyI }
      },
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "5_tools",
        order: 1
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    return nativeHostService.toggleDevTools({
      targetWindowId: getActiveWindow().vscodeWindowId
    });
  }
}
class ConfigureRuntimeArgumentsAction extends Action2 {
  static {
    __name(this, "ConfigureRuntimeArgumentsAction");
  }
  constructor() {
    super({
      id: "workbench.action.configureRuntimeArguments",
      title: localize2(
        "configureRuntimeArguments",
        "Configure Runtime Arguments"
      ),
      category: Categories.Preferences,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    await editorService.openEditor({
      resource: environmentService.argvResource,
      options: { pinned: true }
    });
  }
}
class ReloadWindowWithExtensionsDisabledAction extends Action2 {
  static {
    __name(this, "ReloadWindowWithExtensionsDisabledAction");
  }
  constructor() {
    super({
      id: "workbench.action.reloadWindowWithExtensionsDisabled",
      title: localize2(
        "reloadWindowWithExtensionsDisabled",
        "Reload With Extensions Disabled"
      ),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    return accessor.get(INativeHostService).reload({ disableExtensions: true });
  }
}
class OpenUserDataFolderAction extends Action2 {
  static {
    __name(this, "OpenUserDataFolderAction");
  }
  constructor() {
    super({
      id: "workbench.action.openUserDataFolder",
      title: localize2("openUserDataFolder", "Open User Data Folder"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const fileService = accessor.get(IFileService);
    const environmentService = accessor.get(
      INativeWorkbenchEnvironmentService
    );
    const userDataHome = URI.file(environmentService.userDataPath);
    const file = await fileService.resolve(userDataHome);
    let itemToShow;
    if (file.children && file.children.length > 0) {
      itemToShow = file.children[0].resource;
    } else {
      itemToShow = userDataHome;
    }
    return nativeHostService.showItemInFolder(itemToShow.fsPath);
  }
}
export {
  ConfigureRuntimeArgumentsAction,
  OpenUserDataFolderAction,
  ReloadWindowWithExtensionsDisabledAction,
  ToggleDevToolsAction
};
//# sourceMappingURL=developerActions.js.map
