var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { sequence } from "../../../../base/common/async.js";
import { Schemas } from "../../../../base/common/network.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
function revealResourcesInOS(resources, nativeHostService, workspaceContextService) {
  if (resources.length) {
    sequence(resources.map((r) => async () => {
      if (r.scheme === Schemas.file || r.scheme === Schemas.vscodeUserData) {
        nativeHostService.showItemInFolder(r.with({ scheme: Schemas.file }).fsPath);
      }
    }));
  } else if (workspaceContextService.getWorkspace().folders.length) {
    const uri = workspaceContextService.getWorkspace().folders[0].uri;
    if (uri.scheme === Schemas.file) {
      nativeHostService.showItemInFolder(uri.fsPath);
    }
  }
}
__name(revealResourcesInOS, "revealResourcesInOS");
export {
  revealResourcesInOS
};
//# sourceMappingURL=fileCommands.js.map
