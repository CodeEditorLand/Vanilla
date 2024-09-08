var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { TreeSitterTextModelService } from "../../../../editor/browser/services/treeSitter/treeSitterParserService.js";
import { ITreeSitterParserService } from "../../../../editor/common/services/treeSitterParserService.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../common/contributions.js";
import { ITreeSitterTokenizationFeature } from "./treeSitterTokenizationFeature.js";
let TreeSitterTokenizationInstantiator = class {
  static ID = "workbench.contrib.treeSitterTokenizationInstantiator";
  constructor(_treeSitterTokenizationService, _treeSitterTokenizationFeature) {
  }
};
TreeSitterTokenizationInstantiator = __decorateClass([
  __decorateParam(0, ITreeSitterParserService),
  __decorateParam(1, ITreeSitterTokenizationFeature)
], TreeSitterTokenizationInstantiator);
registerSingleton(
  ITreeSitterParserService,
  TreeSitterTextModelService,
  InstantiationType.Eager
);
registerWorkbenchContribution2(
  TreeSitterTokenizationInstantiator.ID,
  TreeSitterTokenizationInstantiator,
  WorkbenchPhase.BlockRestore
);
