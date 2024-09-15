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
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const VIEWLET_ID = "workbench.view.extensions";
var ExtensionState = /* @__PURE__ */ ((ExtensionState2) => {
  ExtensionState2[ExtensionState2["Installing"] = 0] = "Installing";
  ExtensionState2[ExtensionState2["Installed"] = 1] = "Installed";
  ExtensionState2[ExtensionState2["Uninstalling"] = 2] = "Uninstalling";
  ExtensionState2[ExtensionState2["Uninstalled"] = 3] = "Uninstalled";
  return ExtensionState2;
})(ExtensionState || {});
var ExtensionRuntimeActionType = /* @__PURE__ */ ((ExtensionRuntimeActionType2) => {
  ExtensionRuntimeActionType2["ReloadWindow"] = "reloadWindow";
  ExtensionRuntimeActionType2["RestartExtensions"] = "restartExtensions";
  ExtensionRuntimeActionType2["DownloadUpdate"] = "downloadUpdate";
  ExtensionRuntimeActionType2["ApplyUpdate"] = "applyUpdate";
  ExtensionRuntimeActionType2["QuitAndInstall"] = "quitAndInstall";
  return ExtensionRuntimeActionType2;
})(ExtensionRuntimeActionType || {});
const IExtensionsWorkbenchService = createDecorator("extensionsWorkbenchService");
var ExtensionEditorTab = /* @__PURE__ */ ((ExtensionEditorTab2) => {
  ExtensionEditorTab2["Readme"] = "readme";
  ExtensionEditorTab2["Features"] = "features";
  ExtensionEditorTab2["Changelog"] = "changelog";
  ExtensionEditorTab2["Dependencies"] = "dependencies";
  ExtensionEditorTab2["ExtensionPack"] = "extensionPack";
  return ExtensionEditorTab2;
})(ExtensionEditorTab || {});
const ConfigurationKey = "extensions";
const AutoUpdateConfigurationKey = "extensions.autoUpdate";
const AutoCheckUpdatesConfigurationKey = "extensions.autoCheckUpdates";
const CloseExtensionDetailsOnViewChangeKey = "extensions.closeExtensionDetailsOnViewChange";
const AutoRestartConfigurationKey = "extensions.autoRestart";
let ExtensionContainers = class extends Disposable {
  constructor(containers, extensionsWorkbenchService) {
    super();
    this.containers = containers;
    this._register(extensionsWorkbenchService.onChange(this.update, this));
  }
  static {
    __name(this, "ExtensionContainers");
  }
  set extension(extension) {
    this.containers.forEach((c) => c.extension = extension);
  }
  update(extension) {
    for (const container of this.containers) {
      if (extension && container.extension) {
        if (areSameExtensions(
          container.extension.identifier,
          extension.identifier
        )) {
          if (container.extension.server && extension.server && container.extension.server !== extension.server) {
            if (container.updateWhenCounterExtensionChanges) {
              container.update();
            }
          } else {
            container.extension = extension;
          }
        }
      } else {
        container.update();
      }
    }
  }
};
ExtensionContainers = __decorateClass([
  __decorateParam(1, IExtensionsWorkbenchService)
], ExtensionContainers);
const WORKSPACE_RECOMMENDATIONS_VIEW_ID = "workbench.views.extensions.workspaceRecommendations";
const OUTDATED_EXTENSIONS_VIEW_ID = "workbench.views.extensions.searchOutdated";
const TOGGLE_IGNORE_EXTENSION_ACTION_ID = "workbench.extensions.action.toggleIgnoreExtension";
const SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = "workbench.extensions.action.installVSIX";
const INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = "workbench.extensions.command.installFromVSIX";
const LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = "workbench.extensions.action.listWorkspaceUnsupportedExtensions";
const HasOutdatedExtensionsContext = new RawContextKey(
  "hasOutdatedExtensions",
  false
);
const CONTEXT_HAS_GALLERY = new RawContextKey(
  "hasGallery",
  false
);
const THEME_ACTIONS_GROUP = "_theme_";
const INSTALL_ACTIONS_GROUP = "0_install";
const UPDATE_ACTIONS_GROUP = "0_update";
const extensionsSearchActionsMenu = new MenuId(
  "extensionsSearchActionsMenu"
);
export {
  AutoCheckUpdatesConfigurationKey,
  AutoRestartConfigurationKey,
  AutoUpdateConfigurationKey,
  CONTEXT_HAS_GALLERY,
  CloseExtensionDetailsOnViewChangeKey,
  ConfigurationKey,
  ExtensionContainers,
  ExtensionEditorTab,
  ExtensionRuntimeActionType,
  ExtensionState,
  HasOutdatedExtensionsContext,
  IExtensionsWorkbenchService,
  INSTALL_ACTIONS_GROUP,
  INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
  LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
  OUTDATED_EXTENSIONS_VIEW_ID,
  SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
  THEME_ACTIONS_GROUP,
  TOGGLE_IGNORE_EXTENSION_ACTION_ID,
  UPDATE_ACTIONS_GROUP,
  VIEWLET_ID,
  WORKSPACE_RECOMMENDATIONS_VIEW_ID,
  extensionsSearchActionsMenu
};
//# sourceMappingURL=extensions.js.map
