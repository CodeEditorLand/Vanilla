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
import { IWorkbenchContribution, IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { DefaultConfigurationExportHelper } from "./configurationExportHelper.js";
let ExtensionPoints = class {
  static {
    __name(this, "ExtensionPoints");
  }
  constructor(instantiationService, environmentService) {
    if (environmentService.args["export-default-configuration"]) {
      instantiationService.createInstance(DefaultConfigurationExportHelper);
    }
  }
};
ExtensionPoints = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INativeWorkbenchEnvironmentService)
], ExtensionPoints);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExtensionPoints, LifecyclePhase.Restored);
export {
  ExtensionPoints
};
//# sourceMappingURL=configurationExportHelper.contribution.js.map
