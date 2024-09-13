var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  isLinux,
  isMacintosh,
  isNative,
  isWeb
} from "../../../base/common/platform.js";
const WindowMinimumSize = {
  WIDTH: 400,
  WIDTH_WITH_VERTICAL_PANEL: 600,
  HEIGHT: 270
};
function isOpenedAuxiliaryWindow(candidate) {
  return typeof candidate.parentId === "number";
}
__name(isOpenedAuxiliaryWindow, "isOpenedAuxiliaryWindow");
function isWorkspaceToOpen(uriToOpen) {
  return !!uriToOpen.workspaceUri;
}
__name(isWorkspaceToOpen, "isWorkspaceToOpen");
function isFolderToOpen(uriToOpen) {
  return !!uriToOpen.folderUri;
}
__name(isFolderToOpen, "isFolderToOpen");
function isFileToOpen(uriToOpen) {
  return !!uriToOpen.fileUri;
}
__name(isFileToOpen, "isFileToOpen");
function getMenuBarVisibility(configurationService) {
  const nativeTitleBarEnabled = hasNativeTitlebar(configurationService);
  const menuBarVisibility = configurationService.getValue("window.menuBarVisibility");
  if (menuBarVisibility === "default" || nativeTitleBarEnabled && menuBarVisibility === "compact" || isMacintosh && isNative) {
    return "classic";
  } else {
    return menuBarVisibility;
  }
}
__name(getMenuBarVisibility, "getMenuBarVisibility");
var TitleBarSetting = /* @__PURE__ */ ((TitleBarSetting2) => {
  TitleBarSetting2["TITLE_BAR_STYLE"] = "window.titleBarStyle";
  TitleBarSetting2["CUSTOM_TITLE_BAR_VISIBILITY"] = "window.customTitleBarVisibility";
  return TitleBarSetting2;
})(TitleBarSetting || {});
var TitlebarStyle = /* @__PURE__ */ ((TitlebarStyle2) => {
  TitlebarStyle2["NATIVE"] = "native";
  TitlebarStyle2["CUSTOM"] = "custom";
  return TitlebarStyle2;
})(TitlebarStyle || {});
var CustomTitleBarVisibility = /* @__PURE__ */ ((CustomTitleBarVisibility2) => {
  CustomTitleBarVisibility2["AUTO"] = "auto";
  CustomTitleBarVisibility2["WINDOWED"] = "windowed";
  CustomTitleBarVisibility2["NEVER"] = "never";
  return CustomTitleBarVisibility2;
})(CustomTitleBarVisibility || {});
function hasCustomTitlebar(configurationService, titleBarStyle) {
  return true;
}
__name(hasCustomTitlebar, "hasCustomTitlebar");
function hasNativeTitlebar(configurationService, titleBarStyle) {
  if (!titleBarStyle) {
    titleBarStyle = getTitleBarStyle(configurationService);
  }
  return titleBarStyle === "native" /* NATIVE */;
}
__name(hasNativeTitlebar, "hasNativeTitlebar");
function getTitleBarStyle(configurationService) {
  if (isWeb) {
    return "custom" /* CUSTOM */;
  }
  const configuration = configurationService.getValue("window");
  if (configuration) {
    const useNativeTabs = isMacintosh && configuration.nativeTabs === true;
    if (useNativeTabs) {
      return "native" /* NATIVE */;
    }
    const useSimpleFullScreen = isMacintosh && configuration.nativeFullScreen === false;
    if (useSimpleFullScreen) {
      return "native" /* NATIVE */;
    }
    const style = configuration.titleBarStyle;
    if (style === "native" /* NATIVE */ || style === "custom" /* CUSTOM */) {
      return style;
    }
  }
  return isLinux ? "native" /* NATIVE */ : "custom" /* CUSTOM */;
}
__name(getTitleBarStyle, "getTitleBarStyle");
const DEFAULT_CUSTOM_TITLEBAR_HEIGHT = 35;
function useWindowControlsOverlay(configurationService) {
  if (isMacintosh || isWeb) {
    return false;
  }
  if (hasNativeTitlebar(configurationService)) {
    return false;
  }
  if (isLinux) {
    const setting = configurationService.getValue(
      "window.experimentalControlOverlay"
    );
    if (typeof setting === "boolean") {
      return setting;
    }
  }
  return true;
}
__name(useWindowControlsOverlay, "useWindowControlsOverlay");
function useNativeFullScreen(configurationService) {
  const windowConfig = configurationService.getValue("window");
  if (!windowConfig || typeof windowConfig.nativeFullScreen !== "boolean") {
    return true;
  }
  if (windowConfig.nativeTabs) {
    return true;
  }
  return windowConfig.nativeFullScreen !== false;
}
__name(useNativeFullScreen, "useNativeFullScreen");
function zoomLevelToZoomFactor(zoomLevel = 0) {
  return Math.pow(1.2, zoomLevel);
}
__name(zoomLevelToZoomFactor, "zoomLevelToZoomFactor");
export {
  CustomTitleBarVisibility,
  DEFAULT_CUSTOM_TITLEBAR_HEIGHT,
  TitleBarSetting,
  TitlebarStyle,
  WindowMinimumSize,
  getMenuBarVisibility,
  getTitleBarStyle,
  hasCustomTitlebar,
  hasNativeTitlebar,
  isFileToOpen,
  isFolderToOpen,
  isOpenedAuxiliaryWindow,
  isWorkspaceToOpen,
  useNativeFullScreen,
  useWindowControlsOverlay,
  zoomLevelToZoomFactor
};
//# sourceMappingURL=window.js.map
