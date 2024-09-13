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
import electron from "electron";
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import {
  isLinux,
  isMacintosh,
  isWindows
} from "../../../base/common/platform.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IStateService } from "../../state/node/state.js";
const DEFAULT_BG_LIGHT = "#FFFFFF";
const DEFAULT_BG_DARK = "#1F1F1F";
const DEFAULT_BG_HC_BLACK = "#000000";
const DEFAULT_BG_HC_LIGHT = "#FFFFFF";
const THEME_STORAGE_KEY = "theme";
const THEME_BG_STORAGE_KEY = "themeBackground";
const THEME_WINDOW_SPLASH = "windowSplash";
var ThemeSettings;
((ThemeSettings2) => {
  ThemeSettings2.DETECT_COLOR_SCHEME = "window.autoDetectColorScheme";
  ThemeSettings2.SYSTEM_COLOR_THEME = "window.systemColorTheme";
})(ThemeSettings || (ThemeSettings = {}));
const IThemeMainService = createDecorator("themeMainService");
let ThemeMainService = class extends Disposable {
  constructor(stateService, configurationService) {
    super();
    this.stateService = stateService;
    this.configurationService = configurationService;
    if (!isLinux) {
      this._register(this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(ThemeSettings.SYSTEM_COLOR_THEME) || e.affectsConfiguration(ThemeSettings.DETECT_COLOR_SCHEME)) {
          this.updateSystemColorTheme();
        }
      }));
    }
    this.updateSystemColorTheme();
    this._register(Event.fromNodeEventEmitter(electron.nativeTheme, "updated")(() => this._onDidChangeColorScheme.fire(this.getColorScheme())));
  }
  static {
    __name(this, "ThemeMainService");
  }
  _onDidChangeColorScheme = this._register(
    new Emitter()
  );
  onDidChangeColorScheme = this._onDidChangeColorScheme.event;
  updateSystemColorTheme() {
    if (isLinux || this.configurationService.getValue(
      ThemeSettings.DETECT_COLOR_SCHEME
    )) {
      electron.nativeTheme.themeSource = "system";
    } else {
      switch (this.configurationService.getValue(ThemeSettings.SYSTEM_COLOR_THEME)) {
        case "dark":
          electron.nativeTheme.themeSource = "dark";
          break;
        case "light":
          electron.nativeTheme.themeSource = "light";
          break;
        case "auto":
          switch (this.getBaseTheme()) {
            case "vs":
              electron.nativeTheme.themeSource = "light";
              break;
            case "vs-dark":
              electron.nativeTheme.themeSource = "dark";
              break;
            default:
              electron.nativeTheme.themeSource = "system";
          }
          break;
        default:
          electron.nativeTheme.themeSource = "system";
          break;
      }
    }
  }
  getColorScheme() {
    if (isWindows) {
      if (electron.nativeTheme.shouldUseHighContrastColors) {
        return {
          dark: electron.nativeTheme.shouldUseInvertedColorScheme,
          highContrast: true
        };
      }
    } else if (isMacintosh) {
      if (electron.nativeTheme.shouldUseInvertedColorScheme || electron.nativeTheme.shouldUseHighContrastColors) {
        return {
          dark: electron.nativeTheme.shouldUseDarkColors,
          highContrast: true
        };
      }
    } else if (isLinux) {
      if (electron.nativeTheme.shouldUseHighContrastColors) {
        return { dark: true, highContrast: true };
      }
    }
    return {
      dark: electron.nativeTheme.shouldUseDarkColors,
      highContrast: false
    };
  }
  getBackgroundColor() {
    const colorScheme = this.getColorScheme();
    if (colorScheme.highContrast && this.configurationService.getValue("window.autoDetectHighContrast")) {
      return colorScheme.dark ? DEFAULT_BG_HC_BLACK : DEFAULT_BG_HC_LIGHT;
    }
    let background = this.stateService.getItem(
      THEME_BG_STORAGE_KEY,
      null
    );
    if (!background) {
      switch (this.getBaseTheme()) {
        case "vs":
          background = DEFAULT_BG_LIGHT;
          break;
        case "hc-black":
          background = DEFAULT_BG_HC_BLACK;
          break;
        case "hc-light":
          background = DEFAULT_BG_HC_LIGHT;
          break;
        default:
          background = DEFAULT_BG_DARK;
      }
    }
    return background;
  }
  getBaseTheme() {
    const baseTheme = this.stateService.getItem(THEME_STORAGE_KEY, "vs-dark").split(" ")[0];
    switch (baseTheme) {
      case "vs":
        return "vs";
      case "hc-black":
        return "hc-black";
      case "hc-light":
        return "hc-light";
      default:
        return "vs-dark";
    }
  }
  saveWindowSplash(windowId, splash) {
    this.stateService.setItems([
      { key: THEME_STORAGE_KEY, data: splash.baseTheme },
      { key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
      { key: THEME_WINDOW_SPLASH, data: splash }
    ]);
    if (typeof windowId === "number") {
      this.updateBackgroundColor(windowId, splash);
    }
    this.updateSystemColorTheme();
  }
  updateBackgroundColor(windowId, splash) {
    for (const window of electron.BrowserWindow.getAllWindows()) {
      if (window.id === windowId) {
        window.setBackgroundColor(splash.colorInfo.background);
        break;
      }
    }
  }
  getWindowSplash() {
    return this.stateService.getItem(THEME_WINDOW_SPLASH);
  }
};
ThemeMainService = __decorateClass([
  __decorateParam(0, IStateService),
  __decorateParam(1, IConfigurationService)
], ThemeMainService);
export {
  IThemeMainService,
  ThemeMainService
};
//# sourceMappingURL=themeMainService.js.map
