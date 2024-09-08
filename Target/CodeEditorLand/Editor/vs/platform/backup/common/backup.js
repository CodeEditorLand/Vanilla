function isFolderBackupInfo(curr) {
  return curr && curr.hasOwnProperty("folderUri");
}
function isWorkspaceBackupInfo(curr) {
  return curr && curr.hasOwnProperty("workspace");
}
export {
  isFolderBackupInfo,
  isWorkspaceBackupInfo
};
