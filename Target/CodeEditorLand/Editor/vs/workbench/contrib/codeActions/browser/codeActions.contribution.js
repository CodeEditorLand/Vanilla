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
import { Extensions, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from "../../../common/contributions.js";
import { CodeActionsExtensionPoint, codeActionsExtensionPointDescriptor } from "../common/codeActionsExtensionPoint.js";
import { DocumentationExtensionPoint, documentationExtensionPointDescriptor } from "../common/documentationExtensionPoint.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { CodeActionsContribution, editorConfiguration, notebookEditorConfiguration } from "./codeActionsContribution.js";
import { CodeActionDocumentationContribution } from "./documentationContribution.js";
const codeActionsExtensionPoint = ExtensionsRegistry.registerExtensionPoint(codeActionsExtensionPointDescriptor);
const documentationExtensionPoint = ExtensionsRegistry.registerExtensionPoint(documentationExtensionPointDescriptor);
Registry.as(Extensions.Configuration).registerConfiguration(editorConfiguration);
Registry.as(Extensions.Configuration).registerConfiguration(notebookEditorConfiguration);
let WorkbenchConfigurationContribution = class {
  static {
    __name(this, "WorkbenchConfigurationContribution");
  }
  constructor(instantiationService) {
    instantiationService.createInstance(CodeActionsContribution, codeActionsExtensionPoint);
    instantiationService.createInstance(CodeActionDocumentationContribution, documentationExtensionPoint);
  }
};
WorkbenchConfigurationContribution = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WorkbenchConfigurationContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkbenchConfigurationContribution, LifecyclePhase.Eventually);
//# sourceMappingURL=codeActions.contribution.js.map
