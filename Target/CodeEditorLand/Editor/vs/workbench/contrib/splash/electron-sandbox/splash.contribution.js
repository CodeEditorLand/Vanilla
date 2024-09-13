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
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import { PartsSplash } from "../browser/partsSplash.js";
import { ISplashStorageService } from "../browser/splash.js";
let SplashStorageService = class {
  static {
    __name(this, "SplashStorageService");
  }
  _serviceBrand;
  saveWindowSplash;
  constructor(nativeHostService) {
    this.saveWindowSplash = nativeHostService.saveWindowSplash.bind(nativeHostService);
  }
};
SplashStorageService = __decorateClass([
  __decorateParam(0, INativeHostService)
], SplashStorageService);
registerSingleton(
  ISplashStorageService,
  SplashStorageService,
  InstantiationType.Delayed
);
registerWorkbenchContribution2(
  PartsSplash.ID,
  PartsSplash,
  WorkbenchPhase.BlockStartup
);
//# sourceMappingURL=splash.contribution.js.map
