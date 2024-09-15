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
import { mainWindow } from "../../../../base/browser/window.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { BrowserWindowDriver } from "../browser/driver.js";
import { ILifecycleService } from "../../lifecycle/common/lifecycle.js";
let NativeWindowDriver = class extends BrowserWindowDriver {
  constructor(helper, fileService, environmentService, lifecycleService, logService) {
    super(fileService, environmentService, lifecycleService, logService);
    this.helper = helper;
  }
  static {
    __name(this, "NativeWindowDriver");
  }
  exitApplication() {
    return this.helper.exitApplication();
  }
};
NativeWindowDriver = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, ILogService)
], NativeWindowDriver);
function registerWindowDriver(instantiationService, helper) {
  Object.assign(mainWindow, { driver: instantiationService.createInstance(NativeWindowDriver, helper) });
}
__name(registerWindowDriver, "registerWindowDriver");
export {
  registerWindowDriver
};
//# sourceMappingURL=driver.js.map
