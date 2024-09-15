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
import { registerSingleton, InstantiationType } from "../../../../platform/instantiation/common/extensions.js";
import { ITextMateTokenizationService } from "./textMateTokenizationFeature.js";
import { TextMateTokenizationFeature } from "./textMateTokenizationFeatureImpl.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
let TextMateTokenizationInstantiator = class {
  static {
    __name(this, "TextMateTokenizationInstantiator");
  }
  static ID = "workbench.contrib.textMateTokenizationInstantiator";
  constructor(_textMateTokenizationService) {
  }
};
TextMateTokenizationInstantiator = __decorateClass([
  __decorateParam(0, ITextMateTokenizationService)
], TextMateTokenizationInstantiator);
registerSingleton(ITextMateTokenizationService, TextMateTokenizationFeature, InstantiationType.Eager);
registerWorkbenchContribution2(TextMateTokenizationInstantiator.ID, TextMateTokenizationInstantiator, WorkbenchPhase.BlockRestore);
//# sourceMappingURL=textMateTokenizationFeature.contribution.js.map
