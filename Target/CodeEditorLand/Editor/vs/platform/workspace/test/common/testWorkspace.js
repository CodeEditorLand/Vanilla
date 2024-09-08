import { isLinux, isWindows } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import {
  Workspace as BaseWorkspace,
  toWorkspaceFolder
} from "../../common/workspace.js";
class Workspace extends BaseWorkspace {
  constructor(id, folders = [], configuration = null, ignorePathCasing = () => !isLinux) {
    super(id, folders, false, configuration, ignorePathCasing);
  }
}
const wsUri = URI.file(isWindows ? "C:\\testWorkspace" : "/testWorkspace");
const TestWorkspace = testWorkspace(wsUri);
function testWorkspace(resource) {
  return new Workspace(resource.toString(), [toWorkspaceFolder(resource)]);
}
export {
  TestWorkspace,
  Workspace,
  testWorkspace
};
