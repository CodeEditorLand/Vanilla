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
import { createDecorator, IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILifecycleMainService, LifecycleMainPhase } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { ICommonMenubarService, IMenubarData } from "../common/menubar.js";
import { Menubar } from "./menubar.js";
import { Disposable } from "../../../base/common/lifecycle.js";
const IMenubarMainService = createDecorator("menubarMainService");
let MenubarMainService = class extends Disposable {
  constructor(instantiationService, lifecycleMainService, logService) {
    super();
    this.instantiationService = instantiationService;
    this.lifecycleMainService = lifecycleMainService;
    this.logService = logService;
  }
  static {
    __name(this, "MenubarMainService");
  }
  menubar = this.installMenuBarAfterWindowOpen();
  async installMenuBarAfterWindowOpen() {
    await this.lifecycleMainService.when(LifecycleMainPhase.AfterWindowOpen);
    return this._register(this.instantiationService.createInstance(Menubar));
  }
  async updateMenubar(windowId, menus) {
    this.logService.trace("menubarService#updateMenubar", windowId);
    const menubar = await this.menubar;
    menubar.updateMenu(menus, windowId);
  }
};
MenubarMainService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILifecycleMainService),
  __decorateParam(2, ILogService)
], MenubarMainService);
export {
  IMenubarMainService,
  MenubarMainService
};
//# sourceMappingURL=menubarMainService.js.map
