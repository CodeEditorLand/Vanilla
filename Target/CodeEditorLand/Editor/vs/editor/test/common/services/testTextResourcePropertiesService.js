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
import * as platform from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextResourcePropertiesService } from "../../../common/services/textResourceConfiguration.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
let TestTextResourcePropertiesService = class {
  constructor(configurationService) {
    this.configurationService = configurationService;
  }
  static {
    __name(this, "TestTextResourcePropertiesService");
  }
  getEOL(resource, language) {
    const eol = this.configurationService.getValue("files.eol", { overrideIdentifier: language, resource });
    if (eol && typeof eol === "string" && eol !== "auto") {
      return eol;
    }
    return platform.isLinux || platform.isMacintosh ? "\n" : "\r\n";
  }
};
TestTextResourcePropertiesService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], TestTextResourcePropertiesService);
export {
  TestTextResourcePropertiesService
};
//# sourceMappingURL=testTextResourcePropertiesService.js.map
