var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { isUNC, toSlashes } from "../../../base/common/extpath.js";
import * as json from "../../../base/common/json.js";
import * as jsonEdit from "../../../base/common/jsonEdit.js";
import { FormattingOptions } from "../../../base/common/jsonFormatter.js";
import { normalizeDriveLetter } from "../../../base/common/labels.js";
import { Schemas } from "../../../base/common/network.js";
import { isAbsolute, posix } from "../../../base/common/path.js";
import { isLinux, isMacintosh, isWindows } from "../../../base/common/platform.js";
import { IExtUri, isEqualAuthority } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { IWorkspaceBackupInfo, IFolderBackupInfo } from "../../backup/common/backup.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { getRemoteAuthority } from "../../remote/common/remoteHosts.js";
import { IBaseWorkspace, IRawFileWorkspaceFolder, IRawUriWorkspaceFolder, IWorkspaceIdentifier, WorkspaceFolder } from "../../workspace/common/workspace.js";
const IWorkspacesService = createDecorator("workspacesService");
function isRecentWorkspace(curr) {
  return curr.hasOwnProperty("workspace");
}
__name(isRecentWorkspace, "isRecentWorkspace");
function isRecentFolder(curr) {
  return curr.hasOwnProperty("folderUri");
}
__name(isRecentFolder, "isRecentFolder");
function isRecentFile(curr) {
  return curr.hasOwnProperty("fileUri");
}
__name(isRecentFile, "isRecentFile");
function isStoredWorkspaceFolder(obj) {
  return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
}
__name(isStoredWorkspaceFolder, "isStoredWorkspaceFolder");
function isRawFileWorkspaceFolder(obj) {
  const candidate = obj;
  return typeof candidate?.path === "string" && (!candidate.name || typeof candidate.name === "string");
}
__name(isRawFileWorkspaceFolder, "isRawFileWorkspaceFolder");
function isRawUriWorkspaceFolder(obj) {
  const candidate = obj;
  return typeof candidate?.uri === "string" && (!candidate.name || typeof candidate.name === "string");
}
__name(isRawUriWorkspaceFolder, "isRawUriWorkspaceFolder");
function getStoredWorkspaceFolder(folderURI, forceAbsolute, folderName, targetConfigFolderURI, extUri) {
  if (folderURI.scheme !== targetConfigFolderURI.scheme) {
    return { name: folderName, uri: folderURI.toString(true) };
  }
  let folderPath = !forceAbsolute ? extUri.relativePath(targetConfigFolderURI, folderURI) : void 0;
  if (folderPath !== void 0) {
    if (folderPath.length === 0) {
      folderPath = ".";
    } else {
      if (isWindows) {
        folderPath = massagePathForWindows(folderPath);
      }
    }
  } else {
    if (folderURI.scheme === Schemas.file) {
      folderPath = folderURI.fsPath;
      if (isWindows) {
        folderPath = massagePathForWindows(folderPath);
      }
    } else if (!extUri.isEqualAuthority(folderURI.authority, targetConfigFolderURI.authority)) {
      return { name: folderName, uri: folderURI.toString(true) };
    } else {
      folderPath = folderURI.path;
    }
  }
  return { name: folderName, path: folderPath };
}
__name(getStoredWorkspaceFolder, "getStoredWorkspaceFolder");
function massagePathForWindows(folderPath) {
  folderPath = normalizeDriveLetter(folderPath);
  if (!isUNC(folderPath)) {
    folderPath = toSlashes(folderPath);
  }
  return folderPath;
}
__name(massagePathForWindows, "massagePathForWindows");
function toWorkspaceFolders(configuredFolders, workspaceConfigFile, extUri) {
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  const relativeTo = extUri.dirname(workspaceConfigFile);
  for (const configuredFolder of configuredFolders) {
    let uri = void 0;
    if (isRawFileWorkspaceFolder(configuredFolder)) {
      if (configuredFolder.path) {
        uri = extUri.resolvePath(relativeTo, configuredFolder.path);
      }
    } else if (isRawUriWorkspaceFolder(configuredFolder)) {
      try {
        uri = URI.parse(configuredFolder.uri);
        if (uri.path[0] !== posix.sep) {
          uri = uri.with({ path: posix.sep + uri.path });
        }
      } catch (e) {
        console.warn(e);
      }
    }
    if (uri) {
      const comparisonKey = extUri.getComparisonKey(uri);
      if (!seen.has(comparisonKey)) {
        seen.add(comparisonKey);
        const name = configuredFolder.name || extUri.basenameOrAuthority(uri);
        result.push(new WorkspaceFolder({ uri, name, index: result.length }, configuredFolder));
      }
    }
  }
  return result;
}
__name(toWorkspaceFolders, "toWorkspaceFolders");
function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents, configPathURI, isFromUntitledWorkspace, targetConfigPathURI, extUri) {
  const storedWorkspace = doParseStoredWorkspace(configPathURI, rawWorkspaceContents);
  const sourceConfigFolder = extUri.dirname(configPathURI);
  const targetConfigFolder = extUri.dirname(targetConfigPathURI);
  const rewrittenFolders = [];
  for (const folder of storedWorkspace.folders) {
    const folderURI = isRawFileWorkspaceFolder(folder) ? extUri.resolvePath(sourceConfigFolder, folder.path) : URI.parse(folder.uri);
    let absolute;
    if (isFromUntitledWorkspace) {
      absolute = false;
    } else {
      absolute = !isRawFileWorkspaceFolder(folder) || isAbsolute(folder.path);
    }
    rewrittenFolders.push(getStoredWorkspaceFolder(folderURI, absolute, folder.name, targetConfigFolder, extUri));
  }
  const formattingOptions = { insertSpaces: false, tabSize: 4, eol: isLinux || isMacintosh ? "\n" : "\r\n" };
  const edits = jsonEdit.setProperty(rawWorkspaceContents, ["folders"], rewrittenFolders, formattingOptions);
  let newContent = jsonEdit.applyEdits(rawWorkspaceContents, edits);
  if (isEqualAuthority(storedWorkspace.remoteAuthority, getRemoteAuthority(targetConfigPathURI))) {
    newContent = jsonEdit.applyEdits(newContent, jsonEdit.removeProperty(newContent, ["remoteAuthority"], formattingOptions));
  }
  return newContent;
}
__name(rewriteWorkspaceFileForNewLocation, "rewriteWorkspaceFileForNewLocation");
function doParseStoredWorkspace(path, contents) {
  const storedWorkspace = json.parse(contents);
  if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
    storedWorkspace.folders = storedWorkspace.folders.filter((folder) => isStoredWorkspaceFolder(folder));
  } else {
    throw new Error(`${path} looks like an invalid workspace file.`);
  }
  return storedWorkspace;
}
__name(doParseStoredWorkspace, "doParseStoredWorkspace");
function isSerializedRecentWorkspace(data) {
  return data.workspace && typeof data.workspace === "object" && typeof data.workspace.id === "string" && typeof data.workspace.configPath === "string";
}
__name(isSerializedRecentWorkspace, "isSerializedRecentWorkspace");
function isSerializedRecentFolder(data) {
  return typeof data.folderUri === "string";
}
__name(isSerializedRecentFolder, "isSerializedRecentFolder");
function isSerializedRecentFile(data) {
  return typeof data.fileUri === "string";
}
__name(isSerializedRecentFile, "isSerializedRecentFile");
function restoreRecentlyOpened(data, logService) {
  const result = { workspaces: [], files: [] };
  if (data) {
    const restoreGracefully = /* @__PURE__ */ __name(function(entries, onEntry) {
      for (let i = 0; i < entries.length; i++) {
        try {
          onEntry(entries[i], i);
        } catch (e) {
          logService.warn(`Error restoring recent entry ${JSON.stringify(entries[i])}: ${e.toString()}. Skip entry.`);
        }
      }
    }, "restoreGracefully");
    const storedRecents = data;
    if (Array.isArray(storedRecents.entries)) {
      restoreGracefully(storedRecents.entries, (entry) => {
        const label = entry.label;
        const remoteAuthority = entry.remoteAuthority;
        if (isSerializedRecentWorkspace(entry)) {
          result.workspaces.push({ label, remoteAuthority, workspace: { id: entry.workspace.id, configPath: URI.parse(entry.workspace.configPath) } });
        } else if (isSerializedRecentFolder(entry)) {
          result.workspaces.push({ label, remoteAuthority, folderUri: URI.parse(entry.folderUri) });
        } else if (isSerializedRecentFile(entry)) {
          result.files.push({ label, remoteAuthority, fileUri: URI.parse(entry.fileUri) });
        }
      });
    }
  }
  return result;
}
__name(restoreRecentlyOpened, "restoreRecentlyOpened");
function toStoreData(recents) {
  const serialized = { entries: [] };
  for (const recent of recents.workspaces) {
    if (isRecentFolder(recent)) {
      serialized.entries.push({ folderUri: recent.folderUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
    } else {
      serialized.entries.push({ workspace: { id: recent.workspace.id, configPath: recent.workspace.configPath.toString() }, label: recent.label, remoteAuthority: recent.remoteAuthority });
    }
  }
  for (const recent of recents.files) {
    serialized.entries.push({ fileUri: recent.fileUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
  }
  return serialized;
}
__name(toStoreData, "toStoreData");
export {
  IWorkspacesService,
  getStoredWorkspaceFolder,
  isRecentFile,
  isRecentFolder,
  isRecentWorkspace,
  isStoredWorkspaceFolder,
  restoreRecentlyOpened,
  rewriteWorkspaceFileForNewLocation,
  toStoreData,
  toWorkspaceFolders
};
//# sourceMappingURL=workspaces.js.map
