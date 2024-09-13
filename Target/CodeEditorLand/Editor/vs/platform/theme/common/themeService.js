var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../base/common/codicons.js";
import { Emitter } from "../../../base/common/event.js";
import {
  Disposable,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import * as platform from "../../registry/common/platform.js";
import { ColorScheme } from "./theme.js";
const IThemeService = createDecorator("themeService");
function themeColorFromId(id) {
  return { id };
}
__name(themeColorFromId, "themeColorFromId");
const FileThemeIcon = Codicon.file;
const FolderThemeIcon = Codicon.folder;
function getThemeTypeSelector(type) {
  switch (type) {
    case ColorScheme.DARK:
      return "vs-dark";
    case ColorScheme.HIGH_CONTRAST_DARK:
      return "hc-black";
    case ColorScheme.HIGH_CONTRAST_LIGHT:
      return "hc-light";
    default:
      return "vs";
  }
}
__name(getThemeTypeSelector, "getThemeTypeSelector");
const Extensions = {
  ThemingContribution: "base.contributions.theming"
};
class ThemingRegistry {
  static {
    __name(this, "ThemingRegistry");
  }
  themingParticipants = [];
  onThemingParticipantAddedEmitter;
  constructor() {
    this.themingParticipants = [];
    this.onThemingParticipantAddedEmitter = new Emitter();
  }
  onColorThemeChange(participant) {
    this.themingParticipants.push(participant);
    this.onThemingParticipantAddedEmitter.fire(participant);
    return toDisposable(() => {
      const idx = this.themingParticipants.indexOf(participant);
      this.themingParticipants.splice(idx, 1);
    });
  }
  get onThemingParticipantAdded() {
    return this.onThemingParticipantAddedEmitter.event;
  }
  getThemingParticipants() {
    return this.themingParticipants;
  }
}
const themingRegistry = new ThemingRegistry();
platform.Registry.add(Extensions.ThemingContribution, themingRegistry);
function registerThemingParticipant(participant) {
  return themingRegistry.onColorThemeChange(participant);
}
__name(registerThemingParticipant, "registerThemingParticipant");
class Themable extends Disposable {
  constructor(themeService) {
    super();
    this.themeService = themeService;
    this.theme = themeService.getColorTheme();
    this._register(
      this.themeService.onDidColorThemeChange(
        (theme) => this.onThemeChange(theme)
      )
    );
  }
  static {
    __name(this, "Themable");
  }
  theme;
  onThemeChange(theme) {
    this.theme = theme;
    this.updateStyles();
  }
  updateStyles() {
  }
  getColor(id, modify) {
    let color = this.theme.getColor(id);
    if (color && modify) {
      color = modify(color, this.theme);
    }
    return color ? color.toString() : null;
  }
}
export {
  Extensions,
  FileThemeIcon,
  FolderThemeIcon,
  IThemeService,
  Themable,
  getThemeTypeSelector,
  registerThemingParticipant,
  themeColorFromId
};
//# sourceMappingURL=themeService.js.map
