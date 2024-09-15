var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isLinux, isWindows } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { toWorkspaceFolder, Workspace as BaseWorkspace, WorkspaceFolder } from "../../common/workspace.js";
class Workspace extends BaseWorkspace {
  static {
    __name(this, "Workspace");
  }
  constructor(id, folders = [], configuration = null, ignorePathCasing = () => !isLinux) {
    super(id, folders, false, configuration, ignorePathCasing);
  }
}
const wsUri = URI.file(isWindows ? "C:\\testWorkspace" : "/testWorkspace");
const TestWorkspace = testWorkspace(wsUri);
function testWorkspace(resource) {
  return new Workspace(resource.toString(), [toWorkspaceFolder(resource)]);
}
__name(testWorkspace, "testWorkspace");
export {
  TestWorkspace,
  Workspace,
  testWorkspace
};
//# sourceMappingURL=testWorkspace.js.map
