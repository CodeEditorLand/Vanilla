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
import { dirname } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IRemoteAgentService } from "../../remote/common/remoteAgentService.js";
import { AbstractPathService, IPathService } from "../common/pathService.js";
let BrowserPathService = class extends AbstractPathService {
  static {
    __name(this, "BrowserPathService");
  }
  constructor(remoteAgentService, environmentService, contextService) {
    super(
      guessLocalUserHome(environmentService, contextService),
      remoteAgentService,
      environmentService,
      contextService
    );
  }
};
BrowserPathService = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IWorkspaceContextService)
], BrowserPathService);
function guessLocalUserHome(environmentService, contextService) {
  const workspace = contextService.getWorkspace();
  const firstFolder = workspace.folders.at(0);
  if (firstFolder) {
    return firstFolder.uri;
  }
  if (workspace.configuration) {
    return dirname(workspace.configuration);
  }
  return URI.from({
    scheme: AbstractPathService.findDefaultUriScheme(
      environmentService,
      contextService
    ),
    authority: environmentService.remoteAuthority,
    path: "/"
  });
}
__name(guessLocalUserHome, "guessLocalUserHome");
registerSingleton(IPathService, BrowserPathService, InstantiationType.Delayed);
export {
  BrowserPathService
};
//# sourceMappingURL=pathService.js.map
