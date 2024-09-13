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
import { VSBuffer } from "../../../../base/common/buffer.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import {
  FileOperationResult,
  IFileService
} from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IWorkspaceContextService,
  WORKSPACE_EXTENSION,
  WorkbenchState,
  isTemporaryWorkspace
} from "../../../../platform/workspace/common/workspace.js";
import {
  IWorkspacesService,
  getStoredWorkspaceFolder,
  isRecentFile,
  isRecentFolder,
  isRecentWorkspace,
  restoreRecentlyOpened,
  toStoreData
} from "../../../../platform/workspaces/common/workspaces.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { getWorkspaceIdentifier } from "./workspaces.js";
let BrowserWorkspacesService = class extends Disposable {
  constructor(storageService, contextService, logService, fileService, environmentService, uriIdentityService) {
    super();
    this.storageService = storageService;
    this.contextService = contextService;
    this.logService = logService;
    this.fileService = fileService;
    this.environmentService = environmentService;
    this.uriIdentityService = uriIdentityService;
    this.addWorkspaceToRecentlyOpened();
    this.registerListeners();
  }
  static {
    __name(this, "BrowserWorkspacesService");
  }
  static RECENTLY_OPENED_KEY = "recently.opened";
  _onRecentlyOpenedChange = this._register(
    new Emitter()
  );
  onDidChangeRecentlyOpened = this._onRecentlyOpenedChange.event;
  registerListeners() {
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.APPLICATION,
        BrowserWorkspacesService.RECENTLY_OPENED_KEY,
        this._register(new DisposableStore())
      )(() => this._onRecentlyOpenedChange.fire())
    );
    this._register(
      this.contextService.onDidChangeWorkspaceFolders(
        (e) => this.onDidChangeWorkspaceFolders(e)
      )
    );
  }
  onDidChangeWorkspaceFolders(e) {
    if (!isTemporaryWorkspace(this.contextService.getWorkspace())) {
      return;
    }
    for (const folder of e.added) {
      this.addRecentlyOpened([{ folderUri: folder.uri }]);
    }
  }
  addWorkspaceToRecentlyOpened() {
    const workspace = this.contextService.getWorkspace();
    const remoteAuthority = this.environmentService.remoteAuthority;
    switch (this.contextService.getWorkbenchState()) {
      case WorkbenchState.FOLDER:
        this.addRecentlyOpened([
          { folderUri: workspace.folders[0].uri, remoteAuthority }
        ]);
        break;
      case WorkbenchState.WORKSPACE:
        this.addRecentlyOpened([
          {
            workspace: {
              id: workspace.id,
              configPath: workspace.configuration
            },
            remoteAuthority
          }
        ]);
        break;
    }
  }
  //#region Workspaces History
  async getRecentlyOpened() {
    const recentlyOpenedRaw = this.storageService.get(
      BrowserWorkspacesService.RECENTLY_OPENED_KEY,
      StorageScope.APPLICATION
    );
    if (recentlyOpenedRaw) {
      const recentlyOpened = restoreRecentlyOpened(
        JSON.parse(recentlyOpenedRaw),
        this.logService
      );
      recentlyOpened.workspaces = recentlyOpened.workspaces.filter(
        (recent) => {
          if (isRecentFolder(recent) && recent.folderUri.scheme === Schemas.file && !isTemporaryWorkspace(
            this.contextService.getWorkspace()
          )) {
            return false;
          }
          if (isRecentWorkspace(recent) && isTemporaryWorkspace(recent.workspace.configPath)) {
            return false;
          }
          return true;
        }
      );
      return recentlyOpened;
    }
    return { workspaces: [], files: [] };
  }
  async addRecentlyOpened(recents) {
    const recentlyOpened = await this.getRecentlyOpened();
    for (const recent of recents) {
      if (isRecentFile(recent)) {
        this.doRemoveRecentlyOpened(recentlyOpened, [recent.fileUri]);
        recentlyOpened.files.unshift(recent);
      } else if (isRecentFolder(recent)) {
        this.doRemoveRecentlyOpened(recentlyOpened, [recent.folderUri]);
        recentlyOpened.workspaces.unshift(recent);
      } else {
        this.doRemoveRecentlyOpened(recentlyOpened, [
          recent.workspace.configPath
        ]);
        recentlyOpened.workspaces.unshift(recent);
      }
    }
    return this.saveRecentlyOpened(recentlyOpened);
  }
  async removeRecentlyOpened(paths) {
    const recentlyOpened = await this.getRecentlyOpened();
    this.doRemoveRecentlyOpened(recentlyOpened, paths);
    return this.saveRecentlyOpened(recentlyOpened);
  }
  doRemoveRecentlyOpened(recentlyOpened, paths) {
    recentlyOpened.files = recentlyOpened.files.filter((file) => {
      return !paths.some(
        (path) => path.toString() === file.fileUri.toString()
      );
    });
    recentlyOpened.workspaces = recentlyOpened.workspaces.filter(
      (workspace) => {
        return !paths.some(
          (path) => path.toString() === (isRecentFolder(workspace) ? workspace.folderUri.toString() : workspace.workspace.configPath.toString())
        );
      }
    );
  }
  async saveRecentlyOpened(data) {
    return this.storageService.store(
      BrowserWorkspacesService.RECENTLY_OPENED_KEY,
      JSON.stringify(toStoreData(data)),
      StorageScope.APPLICATION,
      StorageTarget.USER
    );
  }
  async clearRecentlyOpened() {
    this.storageService.remove(
      BrowserWorkspacesService.RECENTLY_OPENED_KEY,
      StorageScope.APPLICATION
    );
  }
  //#endregion
  //#region Workspace Management
  async enterWorkspace(workspaceUri) {
    return { workspace: await this.getWorkspaceIdentifier(workspaceUri) };
  }
  async createUntitledWorkspace(folders, remoteAuthority) {
    const randomId = (Date.now() + Math.round(Math.random() * 1e3)).toString();
    const newUntitledWorkspacePath = joinPath(
      this.environmentService.untitledWorkspacesHome,
      `Untitled-${randomId}.${WORKSPACE_EXTENSION}`
    );
    const storedWorkspaceFolder = [];
    if (folders) {
      for (const folder of folders) {
        storedWorkspaceFolder.push(
          getStoredWorkspaceFolder(
            folder.uri,
            true,
            folder.name,
            this.environmentService.untitledWorkspacesHome,
            this.uriIdentityService.extUri
          )
        );
      }
    }
    const storedWorkspace = {
      folders: storedWorkspaceFolder,
      remoteAuthority
    };
    await this.fileService.writeFile(
      newUntitledWorkspacePath,
      VSBuffer.fromString(JSON.stringify(storedWorkspace, null, "	"))
    );
    return this.getWorkspaceIdentifier(newUntitledWorkspacePath);
  }
  async deleteUntitledWorkspace(workspace) {
    try {
      await this.fileService.del(workspace.configPath);
    } catch (error) {
      if (error.fileOperationResult !== FileOperationResult.FILE_NOT_FOUND) {
        throw error;
      }
    }
  }
  async getWorkspaceIdentifier(workspaceUri) {
    return getWorkspaceIdentifier(workspaceUri);
  }
  //#endregion
  //#region Dirty Workspaces
  async getDirtyWorkspaces() {
    return [];
  }
  //#endregion
};
BrowserWorkspacesService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IUriIdentityService)
], BrowserWorkspacesService);
registerSingleton(
  IWorkspacesService,
  BrowserWorkspacesService,
  InstantiationType.Delayed
);
export {
  BrowserWorkspacesService
};
//# sourceMappingURL=workspacesService.js.map
