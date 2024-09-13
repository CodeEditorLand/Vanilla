var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../base/common/event.js";
import { addMatchMediaChangeListener } from "../../../../base/browser/browser.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IHostColorSchemeService } from "../common/hostColorSchemeService.js";
import { mainWindow } from "../../../../base/browser/window.js";
class BrowserHostColorSchemeService extends Disposable {
  static {
    __name(this, "BrowserHostColorSchemeService");
  }
  _onDidSchemeChangeEvent = this._register(new Emitter());
  constructor() {
    super();
    this.registerListeners();
  }
  registerListeners() {
    addMatchMediaChangeListener(mainWindow, "(prefers-color-scheme: dark)", () => {
      this._onDidSchemeChangeEvent.fire();
    });
    addMatchMediaChangeListener(mainWindow, "(forced-colors: active)", () => {
      this._onDidSchemeChangeEvent.fire();
    });
  }
  get onDidChangeColorScheme() {
    return this._onDidSchemeChangeEvent.event;
  }
  get dark() {
    if (mainWindow.matchMedia(`(prefers-color-scheme: light)`).matches) {
      return false;
    } else if (mainWindow.matchMedia(`(prefers-color-scheme: dark)`).matches) {
      return true;
    }
    return false;
  }
  get highContrast() {
    if (mainWindow.matchMedia(`(forced-colors: active)`).matches) {
      return true;
    }
    return false;
  }
}
registerSingleton(IHostColorSchemeService, BrowserHostColorSchemeService, InstantiationType.Delayed);
export {
  BrowserHostColorSchemeService
};
//# sourceMappingURL=browserHostColorSchemeService.js.map
