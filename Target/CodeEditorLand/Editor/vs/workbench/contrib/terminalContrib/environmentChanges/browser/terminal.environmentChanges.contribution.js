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
import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { IModelService } from "../../../../../editor/common/services/model.js";
import {
  ITextModelService
} from "../../../../../editor/common/services/resolverService.js";
import { localize, localize2 } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import {
  EnvironmentVariableMutatorType
} from "../../../../../platform/terminal/common/environmentVariable.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { registerActiveInstanceAction } from "../../../terminal/browser/terminalActions.js";
import { TerminalCommandId } from "../../../terminal/common/terminal.js";
registerActiveInstanceAction({
  id: TerminalCommandId.ShowEnvironmentContributions,
  title: localize2(
    "workbench.action.terminal.showEnvironmentContributions",
    "Show Environment Contributions"
  ),
  run: /* @__PURE__ */ __name(async (activeInstance, c, accessor, arg) => {
    const collection = activeInstance.extEnvironmentVariableCollection;
    if (collection) {
      const scope = arg;
      const instantiationService = accessor.get(IInstantiationService);
      const outputProvider = instantiationService.createInstance(
        EnvironmentCollectionProvider
      );
      const editorService = accessor.get(IEditorService);
      const timestamp = (/* @__PURE__ */ new Date()).getTime();
      const scopeDesc = scope?.workspaceFolder ? ` - ${scope.workspaceFolder.name}` : "";
      const textContent = await outputProvider.provideTextContent(
        URI.from({
          scheme: EnvironmentCollectionProvider.scheme,
          path: `Environment changes${scopeDesc}`,
          fragment: describeEnvironmentChanges(collection, scope),
          query: `environment-collection-${timestamp}`
        })
      );
      if (textContent) {
        await editorService.openEditor({
          resource: textContent.uri
        });
      }
    }
  }, "run")
});
function describeEnvironmentChanges(collection, scope) {
  let content = `# ${localize("envChanges", "Terminal Environment Changes")}`;
  const globalDescriptions = collection.getDescriptionMap(void 0);
  const workspaceDescriptions = collection.getDescriptionMap(scope);
  for (const [ext, coll] of collection.collections) {
    content += `

## ${localize("extension", "Extension: {0}", ext)}`;
    content += "\n";
    const globalDescription = globalDescriptions.get(ext);
    if (globalDescription) {
      content += `
${globalDescription}
`;
    }
    const workspaceDescription = workspaceDescriptions.get(ext);
    if (workspaceDescription) {
      const workspaceSuffix = globalDescription ? ` (${localize("ScopedEnvironmentContributionInfo", "workspace")})` : "";
      content += `
${workspaceDescription}${workspaceSuffix}
`;
    }
    for (const mutator of coll.map.values()) {
      if (filterScope(mutator, scope) === false) {
        continue;
      }
      content += `
- \`${mutatorTypeLabel(mutator.type, mutator.value, mutator.variable)}\``;
    }
  }
  return content;
}
__name(describeEnvironmentChanges, "describeEnvironmentChanges");
function filterScope(mutator, scope) {
  if (!mutator.scope) {
    return true;
  }
  if (mutator.scope.workspaceFolder && scope?.workspaceFolder && mutator.scope.workspaceFolder.index === scope.workspaceFolder.index) {
    return true;
  }
  return false;
}
__name(filterScope, "filterScope");
function mutatorTypeLabel(type, value, variable) {
  switch (type) {
    case EnvironmentVariableMutatorType.Prepend:
      return `${variable}=${value}\${env:${variable}}`;
    case EnvironmentVariableMutatorType.Append:
      return `${variable}=\${env:${variable}}${value}`;
    default:
      return `${variable}=${value}`;
  }
}
__name(mutatorTypeLabel, "mutatorTypeLabel");
let EnvironmentCollectionProvider = class {
  constructor(textModelResolverService, _modelService) {
    this._modelService = _modelService;
    textModelResolverService.registerTextModelContentProvider(
      EnvironmentCollectionProvider.scheme,
      this
    );
  }
  static {
    __name(this, "EnvironmentCollectionProvider");
  }
  static scheme = "ENVIRONMENT_CHANGES_COLLECTION";
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing && !existing.isDisposed()) {
      return existing;
    }
    return this._modelService.createModel(
      resource.fragment,
      { languageId: "markdown", onDidChange: Event.None },
      resource,
      false
    );
  }
};
EnvironmentCollectionProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService)
], EnvironmentCollectionProvider);
//# sourceMappingURL=terminal.environmentChanges.contribution.js.map
