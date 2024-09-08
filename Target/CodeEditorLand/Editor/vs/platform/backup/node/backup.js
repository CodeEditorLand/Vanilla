import { URI } from "../../../base/common/uri.js";
function isEmptyWindowBackupInfo(obj) {
  const candidate = obj;
  return typeof candidate?.backupFolder === "string";
}
function deserializeWorkspaceInfos(serializedBackupWorkspaces) {
  let workspaceBackupInfos = [];
  try {
    if (Array.isArray(serializedBackupWorkspaces.workspaces)) {
      workspaceBackupInfos = serializedBackupWorkspaces.workspaces.map(
        (workspace) => ({
          workspace: {
            id: workspace.id,
            configPath: URI.parse(workspace.configURIPath)
          },
          remoteAuthority: workspace.remoteAuthority
        })
      );
    }
  } catch (e) {
  }
  return workspaceBackupInfos;
}
function deserializeFolderInfos(serializedBackupWorkspaces) {
  let folderBackupInfos = [];
  try {
    if (Array.isArray(serializedBackupWorkspaces.folders)) {
      folderBackupInfos = serializedBackupWorkspaces.folders.map(
        (folder) => ({
          folderUri: URI.parse(folder.folderUri),
          remoteAuthority: folder.remoteAuthority
        })
      );
    }
  } catch (e) {
  }
  return folderBackupInfos;
}
export {
  deserializeFolderInfos,
  deserializeWorkspaceInfos,
  isEmptyWindowBackupInfo
};
