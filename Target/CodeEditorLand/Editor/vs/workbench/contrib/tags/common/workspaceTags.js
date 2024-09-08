import { getRemotes } from "../../../../platform/extensionManagement/common/configRemotes.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IWorkspaceTagsService = createDecorator(
  "workspaceTagsService"
);
async function getHashedRemotesFromConfig(text, stripEndingDotGit = false, sha1Hex) {
  return Promise.all(
    getRemotes(text, stripEndingDotGit).map((remote) => sha1Hex(remote))
  );
}
export {
  IWorkspaceTagsService,
  getHashedRemotesFromConfig
};
