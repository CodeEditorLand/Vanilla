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
import { Emitter, Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import {
  ILifecycleMainService,
  LifecycleMainPhase,
  ShutdownReason
} from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import {
  IUserDataProfilesService
} from "../../userDataProfile/common/userDataProfile.js";
import { IUserDataProfilesMainService } from "../../userDataProfile/electron-main/userDataProfile.js";
import {
  AbstractStorageService,
  StorageScope,
  isProfileUsingDefaultStorage
} from "../common/storage.js";
import {
  ApplicationStorageMain,
  InMemoryStorageMain,
  ProfileStorageMain,
  WorkspaceStorageMain
} from "./storageMain.js";
const IStorageMainService = createDecorator("storageMainService");
let StorageMainService = class extends Disposable {
  constructor(logService, environmentService, userDataProfilesService, lifecycleMainService, fileService, uriIdentityService) {
    super();
    this.logService = logService;
    this.environmentService = environmentService;
    this.userDataProfilesService = userDataProfilesService;
    this.lifecycleMainService = lifecycleMainService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.registerListeners();
  }
  static {
    __name(this, "StorageMainService");
  }
  shutdownReason = void 0;
  _onDidChangeProfileStorage = this._register(
    new Emitter()
  );
  onDidChangeProfileStorage = this._onDidChangeProfileStorage.event;
  getStorageOptions() {
    return {
      useInMemoryStorage: !!this.environmentService.extensionTestsLocationURI
      // no storage during extension tests!
    };
  }
  registerListeners() {
    (async () => {
      await this.lifecycleMainService.when(
        LifecycleMainPhase.AfterWindowOpen
      );
      this.applicationStorage.init();
    })();
    this._register(
      this.lifecycleMainService.onWillLoadWindow((e) => {
        if (e.window.profile) {
          this.profileStorage(e.window.profile).init();
        }
        if (e.workspace) {
          this.workspaceStorage(e.workspace).init();
        }
      })
    );
    this._register(
      this.lifecycleMainService.onWillShutdown((e) => {
        this.logService.trace("storageMainService#onWillShutdown()");
        this.shutdownReason = e.reason;
        e.join("applicationStorage", this.applicationStorage.close());
        for (const [, profileStorage] of this.mapProfileToStorage) {
          e.join("profileStorage", profileStorage.close());
        }
        for (const [, workspaceStorage] of this.mapWorkspaceToStorage) {
          e.join("workspaceStorage", workspaceStorage.close());
        }
      })
    );
    this._register(
      this.userDataProfilesService.onWillCreateProfile((e) => {
        e.join(
          (async () => {
            if (!await this.fileService.exists(
              e.profile.globalStorageHome
            )) {
              await this.fileService.createFolder(
                e.profile.globalStorageHome
              );
            }
          })()
        );
      })
    );
    this._register(
      this.userDataProfilesService.onWillRemoveProfile((e) => {
        const storage = this.mapProfileToStorage.get(e.profile.id);
        if (storage) {
          e.join(storage.close());
        }
      })
    );
  }
  //#region Application Storage
  applicationStorage = this._register(
    this.createApplicationStorage()
  );
  createApplicationStorage() {
    this.logService.trace(
      `StorageMainService: creating application storage`
    );
    const applicationStorage = new ApplicationStorageMain(
      this.getStorageOptions(),
      this.userDataProfilesService,
      this.logService,
      this.fileService
    );
    this._register(
      Event.once(applicationStorage.onDidCloseStorage)(() => {
        this.logService.trace(
          `StorageMainService: closed application storage`
        );
      })
    );
    return applicationStorage;
  }
  //#endregion
  //#region Profile Storage
  mapProfileToStorage = /* @__PURE__ */ new Map();
  profileStorage(profile) {
    if (isProfileUsingDefaultStorage(profile)) {
      return this.applicationStorage;
    }
    let profileStorage = this.mapProfileToStorage.get(profile.id);
    if (!profileStorage) {
      this.logService.trace(
        `StorageMainService: creating profile storage (${profile.name})`
      );
      profileStorage = this._register(this.createProfileStorage(profile));
      this.mapProfileToStorage.set(profile.id, profileStorage);
      const listener = this._register(
        profileStorage.onDidChangeStorage(
          (e) => this._onDidChangeProfileStorage.fire({
            ...e,
            storage: profileStorage,
            profile
          })
        )
      );
      this._register(
        Event.once(profileStorage.onDidCloseStorage)(() => {
          this.logService.trace(
            `StorageMainService: closed profile storage (${profile.name})`
          );
          this.mapProfileToStorage.delete(profile.id);
          listener.dispose();
        })
      );
    }
    return profileStorage;
  }
  createProfileStorage(profile) {
    if (this.shutdownReason === ShutdownReason.KILL) {
      return new InMemoryStorageMain(this.logService, this.fileService);
    }
    return new ProfileStorageMain(
      profile,
      this.getStorageOptions(),
      this.logService,
      this.fileService
    );
  }
  //#endregion
  //#region Workspace Storage
  mapWorkspaceToStorage = /* @__PURE__ */ new Map();
  workspaceStorage(workspace) {
    let workspaceStorage = this.mapWorkspaceToStorage.get(workspace.id);
    if (!workspaceStorage) {
      this.logService.trace(
        `StorageMainService: creating workspace storage (${workspace.id})`
      );
      workspaceStorage = this._register(
        this.createWorkspaceStorage(workspace)
      );
      this.mapWorkspaceToStorage.set(workspace.id, workspaceStorage);
      this._register(
        Event.once(workspaceStorage.onDidCloseStorage)(() => {
          this.logService.trace(
            `StorageMainService: closed workspace storage (${workspace.id})`
          );
          this.mapWorkspaceToStorage.delete(workspace.id);
        })
      );
    }
    return workspaceStorage;
  }
  createWorkspaceStorage(workspace) {
    if (this.shutdownReason === ShutdownReason.KILL) {
      return new InMemoryStorageMain(this.logService, this.fileService);
    }
    return new WorkspaceStorageMain(
      workspace,
      this.getStorageOptions(),
      this.logService,
      this.environmentService,
      this.fileService
    );
  }
  //#endregion
  isUsed(path) {
    const pathUri = URI.file(path);
    for (const storage of [
      this.applicationStorage,
      ...this.mapProfileToStorage.values(),
      ...this.mapWorkspaceToStorage.values()
    ]) {
      if (!storage.path) {
        continue;
      }
      if (this.uriIdentityService.extUri.isEqualOrParent(
        URI.file(storage.path),
        pathUri
      )) {
        return true;
      }
    }
    return false;
  }
};
StorageMainService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IUserDataProfilesMainService),
  __decorateParam(3, ILifecycleMainService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IUriIdentityService)
], StorageMainService);
const IApplicationStorageMainService = createDecorator("applicationStorageMainService");
let ApplicationStorageMainService = class extends AbstractStorageService {
  constructor(userDataProfilesService, storageMainService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.storageMainService = storageMainService;
  }
  static {
    __name(this, "ApplicationStorageMainService");
  }
  whenReady = this.storageMainService.applicationStorage.whenInit;
  doInitialize() {
    return this.storageMainService.applicationStorage.whenInit;
  }
  getStorage(scope) {
    if (scope === StorageScope.APPLICATION) {
      return this.storageMainService.applicationStorage.storage;
    }
    return void 0;
  }
  getLogDetails(scope) {
    if (scope === StorageScope.APPLICATION) {
      return this.userDataProfilesService.defaultProfile.globalStorageHome.with(
        { scheme: Schemas.file }
      ).fsPath;
    }
    return void 0;
  }
  shouldFlushWhenIdle() {
    return false;
  }
  switch() {
    throw new Error("Migrating storage is unsupported from main process");
  }
  switchToProfile() {
    throw new Error(
      "Switching storage profile is unsupported from main process"
    );
  }
  switchToWorkspace() {
    throw new Error(
      "Switching storage workspace is unsupported from main process"
    );
  }
  hasScope() {
    throw new Error("Main process is never profile or workspace scoped");
  }
};
ApplicationStorageMainService = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IStorageMainService)
], ApplicationStorageMainService);
export {
  ApplicationStorageMainService,
  IApplicationStorageMainService,
  IStorageMainService,
  StorageMainService
};
//# sourceMappingURL=storageMainService.js.map
