var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../base/common/color.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IconContribution } from "../../common/iconRegistry.js";
import { ColorScheme } from "../../common/theme.js";
import { IColorTheme, IFileIconTheme, IProductIconTheme, IThemeService, ITokenStyle } from "../../common/themeService.js";
class TestColorTheme {
  constructor(colors = {}, type = ColorScheme.DARK, semanticHighlighting = false) {
    this.colors = colors;
    this.type = type;
    this.semanticHighlighting = semanticHighlighting;
  }
  static {
    __name(this, "TestColorTheme");
  }
  label = "test";
  getColor(color, useDefault) {
    const value = this.colors[color];
    if (value) {
      return Color.fromHex(value);
    }
    return void 0;
  }
  defines(color) {
    throw new Error("Method not implemented.");
  }
  getTokenStyleMetadata(type, modifiers, modelLanguage) {
    return void 0;
  }
  get tokenColorMap() {
    return [];
  }
}
class TestFileIconTheme {
  static {
    __name(this, "TestFileIconTheme");
  }
  hasFileIcons = false;
  hasFolderIcons = false;
  hidesExplorerArrows = false;
}
class UnthemedProductIconTheme {
  static {
    __name(this, "UnthemedProductIconTheme");
  }
  getIcon(contribution) {
    return void 0;
  }
}
class TestThemeService {
  static {
    __name(this, "TestThemeService");
  }
  _colorTheme;
  _fileIconTheme;
  _productIconTheme;
  _onThemeChange = new Emitter();
  _onFileIconThemeChange = new Emitter();
  _onProductIconThemeChange = new Emitter();
  constructor(theme = new TestColorTheme(), fileIconTheme = new TestFileIconTheme(), productIconTheme = new UnthemedProductIconTheme()) {
    this._colorTheme = theme;
    this._fileIconTheme = fileIconTheme;
    this._productIconTheme = productIconTheme;
  }
  getColorTheme() {
    return this._colorTheme;
  }
  setTheme(theme) {
    this._colorTheme = theme;
    this.fireThemeChange();
  }
  fireThemeChange() {
    this._onThemeChange.fire(this._colorTheme);
  }
  get onDidColorThemeChange() {
    return this._onThemeChange.event;
  }
  getFileIconTheme() {
    return this._fileIconTheme;
  }
  get onDidFileIconThemeChange() {
    return this._onFileIconThemeChange.event;
  }
  getProductIconTheme() {
    return this._productIconTheme;
  }
  get onDidProductIconThemeChange() {
    return this._onProductIconThemeChange.event;
  }
}
export {
  TestColorTheme,
  TestThemeService
};
//# sourceMappingURL=testThemeService.js.map
