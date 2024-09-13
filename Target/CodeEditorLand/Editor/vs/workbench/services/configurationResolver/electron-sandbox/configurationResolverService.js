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
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IShellEnvironmentService } from "../../environment/electron-sandbox/shellEnvironmentService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { IPathService } from "../../path/common/pathService.js";
import { BaseConfigurationResolverService } from "../browser/baseConfigurationResolverService.js";
import { IConfigurationResolverService } from "../common/configurationResolver.js";
let ConfigurationResolverService = class extends BaseConfigurationResolverService {
  static {
    __name(this, "ConfigurationResolverService");
  }
  constructor(editorService, environmentService, configurationService, commandService, workspaceContextService, quickInputService, labelService, shellEnvironmentService, pathService, extensionService, storageService) {
    super(
      {
        getAppRoot: /* @__PURE__ */ __name(() => {
          return environmentService.appRoot;
        }, "getAppRoot"),
        getExecPath: /* @__PURE__ */ __name(() => {
          return environmentService.execPath;
        }, "getExecPath")
      },
      shellEnvironmentService.getShellEnv(),
      editorService,
      configurationService,
      commandService,
      workspaceContextService,
      quickInputService,
      labelService,
      pathService,
      extensionService,
      storageService
    );
  }
};
ConfigurationResolverService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IShellEnvironmentService),
  __decorateParam(8, IPathService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IStorageService)
], ConfigurationResolverService);
registerSingleton(
  IConfigurationResolverService,
  ConfigurationResolverService,
  InstantiationType.Delayed
);
export {
  ConfigurationResolverService
};
//# sourceMappingURL=configurationResolverService.js.map
