var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Promises } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../base/common/map.js";
import { basename, joinPath } from "../../../base/common/resources.js";
import { escapeRegExpCharacters } from "../../../base/common/strings.js";
import { isString } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { localize } from "../../../nls.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import {
  FileOperationResult,
  IFileService,
  toFileOperationResult
} from "../../files/common/files.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import {
  isSingleFolderWorkspaceIdentifier,
  isWorkspaceIdentifier
} from "../../workspace/common/workspace.js";
var ProfileResourceType = /* @__PURE__ */ ((ProfileResourceType2) => {
  ProfileResourceType2["Settings"] = "settings";
  ProfileResourceType2["Keybindings"] = "keybindings";
  ProfileResourceType2["Snippets"] = "snippets";
  ProfileResourceType2["Tasks"] = "tasks";
  ProfileResourceType2["Extensions"] = "extensions";
  ProfileResourceType2["GlobalState"] = "globalState";
  return ProfileResourceType2;
})(ProfileResourceType || {});
function isUserDataProfile(thing) {
  const candidate = thing;
  return !!(candidate && typeof candidate === "object" && typeof candidate.id === "string" && typeof candidate.isDefault === "boolean" && typeof candidate.name === "string" && URI.isUri(candidate.location) && URI.isUri(candidate.globalStorageHome) && URI.isUri(candidate.settingsResource) && URI.isUri(candidate.keybindingsResource) && URI.isUri(candidate.tasksResource) && URI.isUri(candidate.snippetsHome) && URI.isUri(candidate.extensionsResource));
}
const IUserDataProfilesService = createDecorator("IUserDataProfilesService");
function reviveProfile(profile, scheme) {
  return {
    id: profile.id,
    isDefault: profile.isDefault,
    name: profile.name,
    shortName: profile.shortName,
    icon: profile.icon,
    location: URI.revive(profile.location).with({ scheme }),
    globalStorageHome: URI.revive(profile.globalStorageHome).with({
      scheme
    }),
    settingsResource: URI.revive(profile.settingsResource).with({ scheme }),
    keybindingsResource: URI.revive(profile.keybindingsResource).with({
      scheme
    }),
    tasksResource: URI.revive(profile.tasksResource).with({ scheme }),
    snippetsHome: URI.revive(profile.snippetsHome).with({ scheme }),
    extensionsResource: URI.revive(profile.extensionsResource).with({
      scheme
    }),
    cacheHome: URI.revive(profile.cacheHome).with({ scheme }),
    useDefaultFlags: profile.useDefaultFlags,
    isTransient: profile.isTransient
  };
}
function toUserDataProfile(id, name, location, profilesCacheHome, options, defaultProfile) {
  return {
    id,
    name,
    location,
    isDefault: false,
    shortName: options?.shortName,
    icon: options?.icon,
    globalStorageHome: defaultProfile && options?.useDefaultFlags?.globalState ? defaultProfile.globalStorageHome : joinPath(location, "globalStorage"),
    settingsResource: defaultProfile && options?.useDefaultFlags?.settings ? defaultProfile.settingsResource : joinPath(location, "settings.json"),
    keybindingsResource: defaultProfile && options?.useDefaultFlags?.keybindings ? defaultProfile.keybindingsResource : joinPath(location, "keybindings.json"),
    tasksResource: defaultProfile && options?.useDefaultFlags?.tasks ? defaultProfile.tasksResource : joinPath(location, "tasks.json"),
    snippetsHome: defaultProfile && options?.useDefaultFlags?.snippets ? defaultProfile.snippetsHome : joinPath(location, "snippets"),
    extensionsResource: defaultProfile && options?.useDefaultFlags?.extensions ? defaultProfile.extensionsResource : joinPath(location, "extensions.json"),
    cacheHome: joinPath(profilesCacheHome, id),
    useDefaultFlags: options?.useDefaultFlags,
    isTransient: options?.transient
  };
}
let UserDataProfilesService = class extends Disposable {
  constructor(environmentService, fileService, uriIdentityService, logService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this.profilesHome = joinPath(this.environmentService.userRoamingDataHome, "profiles");
    this.profilesCacheHome = joinPath(this.environmentService.cacheHome, "CachedProfilesData");
  }
  static PROFILES_KEY = "userDataProfiles";
  static PROFILE_ASSOCIATIONS_KEY = "profileAssociations";
  _serviceBrand;
  enabled = true;
  profilesHome;
  profilesCacheHome;
  get defaultProfile() {
    return this.profiles[0];
  }
  get profiles() {
    return [
      ...this.profilesObject.profiles,
      ...this.transientProfilesObject.profiles
    ];
  }
  _onDidChangeProfiles = this._register(
    new Emitter()
  );
  onDidChangeProfiles = this._onDidChangeProfiles.event;
  _onWillCreateProfile = this._register(
    new Emitter()
  );
  onWillCreateProfile = this._onWillCreateProfile.event;
  _onWillRemoveProfile = this._register(
    new Emitter()
  );
  onWillRemoveProfile = this._onWillRemoveProfile.event;
  _onDidResetWorkspaces = this._register(
    new Emitter()
  );
  onDidResetWorkspaces = this._onDidResetWorkspaces.event;
  profileCreationPromises = /* @__PURE__ */ new Map();
  transientProfilesObject = {
    profiles: [],
    folders: new ResourceMap(),
    workspaces: new ResourceMap(),
    emptyWindows: /* @__PURE__ */ new Map()
  };
  init() {
    this._profilesObject = void 0;
  }
  setEnablement(enabled) {
    if (this.enabled !== enabled) {
      this._profilesObject = void 0;
      this.enabled = enabled;
    }
  }
  isEnabled() {
    return this.enabled;
  }
  _profilesObject;
  get profilesObject() {
    if (!this._profilesObject) {
      const defaultProfile = this.createDefaultProfile();
      const profiles = [defaultProfile];
      if (this.enabled) {
        try {
          for (const storedProfile of this.getStoredProfiles()) {
            if (!storedProfile.name || !isString(storedProfile.name) || !storedProfile.location) {
              this.logService.warn(
                "Skipping the invalid stored profile",
                storedProfile.location || storedProfile.name
              );
              continue;
            }
            profiles.push(
              toUserDataProfile(
                basename(storedProfile.location),
                storedProfile.name,
                storedProfile.location,
                this.profilesCacheHome,
                {
                  shortName: storedProfile.shortName,
                  icon: storedProfile.icon,
                  useDefaultFlags: storedProfile.useDefaultFlags
                },
                defaultProfile
              )
            );
          }
        } catch (error) {
          this.logService.error(error);
        }
      }
      const workspaces = new ResourceMap();
      const emptyWindows = /* @__PURE__ */ new Map();
      if (profiles.length) {
        try {
          const profileAssociaitions = this.getStoredProfileAssociations();
          if (profileAssociaitions.workspaces) {
            for (const [workspacePath, profileId] of Object.entries(
              profileAssociaitions.workspaces
            )) {
              const workspace = URI.parse(workspacePath);
              const profile = profiles.find(
                (p) => p.id === profileId
              );
              if (profile) {
                workspaces.set(workspace, profile);
              }
            }
          }
          if (profileAssociaitions.emptyWindows) {
            for (const [windowId, profileId] of Object.entries(
              profileAssociaitions.emptyWindows
            )) {
              const profile = profiles.find(
                (p) => p.id === profileId
              );
              if (profile) {
                emptyWindows.set(windowId, profile);
              }
            }
          }
        } catch (error) {
          this.logService.error(error);
        }
      }
      this._profilesObject = { profiles, workspaces, emptyWindows };
    }
    return this._profilesObject;
  }
  createDefaultProfile() {
    const defaultProfile = toUserDataProfile(
      "__default__profile__",
      localize("defaultProfile", "Default"),
      this.environmentService.userRoamingDataHome,
      this.profilesCacheHome
    );
    return {
      ...defaultProfile,
      extensionsResource: this.getDefaultProfileExtensionsLocation() ?? defaultProfile.extensionsResource,
      isDefault: true
    };
  }
  async createTransientProfile(workspaceIdentifier) {
    const namePrefix = `Temp`;
    const nameRegEx = new RegExp(
      `${escapeRegExpCharacters(namePrefix)}\\s(\\d+)`
    );
    let nameIndex = 0;
    for (const profile of this.profiles) {
      const matches = nameRegEx.exec(profile.name);
      const index = matches ? Number.parseInt(matches[1]) : 0;
      nameIndex = index > nameIndex ? index : nameIndex;
    }
    const name = `${namePrefix} ${nameIndex + 1}`;
    return this.createProfile(
      hash(generateUuid()).toString(16),
      name,
      { transient: true },
      workspaceIdentifier
    );
  }
  async createNamedProfile(name, options, workspaceIdentifier) {
    return this.createProfile(
      hash(generateUuid()).toString(16),
      name,
      options,
      workspaceIdentifier
    );
  }
  async createProfile(id, name, options, workspaceIdentifier) {
    if (!this.enabled) {
      throw new Error(
        `Profiles are disabled in the current environment.`
      );
    }
    const profile = await this.doCreateProfile(id, name, options);
    if (workspaceIdentifier) {
      await this.setProfileForWorkspace(workspaceIdentifier, profile);
    }
    return profile;
  }
  async doCreateProfile(id, name, options) {
    if (!isString(name) || !name) {
      throw new Error(
        "Name of the profile is mandatory and must be of type `string`"
      );
    }
    let profileCreationPromise = this.profileCreationPromises.get(name);
    if (!profileCreationPromise) {
      profileCreationPromise = (async () => {
        try {
          const existing = this.profiles.find(
            (p) => p.name === name || p.id === id
          );
          if (existing) {
            throw new Error(
              `Profile with ${name} name already exists`
            );
          }
          const profile = toUserDataProfile(
            id,
            name,
            joinPath(this.profilesHome, id),
            this.profilesCacheHome,
            options,
            this.defaultProfile
          );
          await this.fileService.createFolder(profile.location);
          const joiners = [];
          this._onWillCreateProfile.fire({
            profile,
            join(promise) {
              joiners.push(promise);
            }
          });
          await Promises.settled(joiners);
          this.updateProfiles([profile], [], []);
          return profile;
        } finally {
          this.profileCreationPromises.delete(name);
        }
      })();
      this.profileCreationPromises.set(name, profileCreationPromise);
    }
    return profileCreationPromise;
  }
  async updateProfile(profileToUpdate, options) {
    if (!this.enabled) {
      throw new Error(
        `Profiles are disabled in the current environment.`
      );
    }
    let profile = this.profiles.find((p) => p.id === profileToUpdate.id);
    if (!profile) {
      throw new Error(`Profile '${profileToUpdate.name}' does not exist`);
    }
    profile = toUserDataProfile(
      profile.id,
      options.name ?? profile.name,
      profile.location,
      this.profilesCacheHome,
      {
        shortName: options.shortName ?? profile.shortName,
        icon: options.icon === null ? void 0 : options.icon ?? profile.icon,
        transient: options.transient ?? profile.isTransient,
        useDefaultFlags: options.useDefaultFlags ?? profile.useDefaultFlags
      },
      this.defaultProfile
    );
    this.updateProfiles([], [], [profile]);
    return profile;
  }
  async removeProfile(profileToRemove) {
    if (!this.enabled) {
      throw new Error(
        `Profiles are disabled in the current environment.`
      );
    }
    if (profileToRemove.isDefault) {
      throw new Error("Cannot remove default profile");
    }
    const profile = this.profiles.find((p) => p.id === profileToRemove.id);
    if (!profile) {
      throw new Error(`Profile '${profileToRemove.name}' does not exist`);
    }
    const joiners = [];
    this._onWillRemoveProfile.fire({
      profile,
      join(promise) {
        joiners.push(promise);
      }
    });
    try {
      await Promise.allSettled(joiners);
    } catch (error) {
      this.logService.error(error);
    }
    for (const windowId of [...this.profilesObject.emptyWindows.keys()]) {
      if (profile.id === this.profilesObject.emptyWindows.get(windowId)?.id) {
        this.profilesObject.emptyWindows.delete(windowId);
      }
    }
    for (const workspace of [...this.profilesObject.workspaces.keys()]) {
      if (profile.id === this.profilesObject.workspaces.get(workspace)?.id) {
        this.profilesObject.workspaces.delete(workspace);
      }
    }
    this.updateStoredProfileAssociations();
    this.updateProfiles([], [profile], []);
    try {
      await this.fileService.del(profile.cacheHome, { recursive: true });
    } catch (error) {
      if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
        this.logService.error(error);
      }
    }
  }
  async setProfileForWorkspace(workspaceIdentifier, profileToSet) {
    if (!this.enabled) {
      throw new Error(
        `Profiles are disabled in the current environment.`
      );
    }
    const profile = this.profiles.find((p) => p.id === profileToSet.id);
    if (!profile) {
      throw new Error(`Profile '${profileToSet.name}' does not exist`);
    }
    this.updateWorkspaceAssociation(workspaceIdentifier, profile);
  }
  unsetWorkspace(workspaceIdentifier, transient) {
    if (!this.enabled) {
      throw new Error(
        `Profiles are disabled in the current environment.`
      );
    }
    this.updateWorkspaceAssociation(
      workspaceIdentifier,
      void 0,
      transient
    );
  }
  async resetWorkspaces() {
    this.transientProfilesObject.folders.clear();
    this.transientProfilesObject.workspaces.clear();
    this.transientProfilesObject.emptyWindows.clear();
    this.profilesObject.workspaces.clear();
    this.profilesObject.emptyWindows.clear();
    this.updateStoredProfileAssociations();
    this._onDidResetWorkspaces.fire();
  }
  async cleanUp() {
    if (!this.enabled) {
      return;
    }
    if (await this.fileService.exists(this.profilesHome)) {
      const stat = await this.fileService.resolve(this.profilesHome);
      await Promise.all(
        (stat.children || []).filter(
          (child) => child.isDirectory && this.profiles.every(
            (p) => !this.uriIdentityService.extUri.isEqual(
              p.location,
              child.resource
            )
          )
        ).map(
          (child) => this.fileService.del(child.resource, {
            recursive: true
          })
        )
      );
    }
  }
  async cleanUpTransientProfiles() {
    if (!this.enabled) {
      return;
    }
    const unAssociatedTransientProfiles = this.transientProfilesObject.profiles.filter(
      (p) => !this.isProfileAssociatedToWorkspace(p)
    );
    await Promise.allSettled(
      unAssociatedTransientProfiles.map((p) => this.removeProfile(p))
    );
  }
  getProfileForWorkspace(workspaceIdentifier) {
    const workspace = this.getWorkspace(workspaceIdentifier);
    const profile = URI.isUri(workspace) ? this.profilesObject.workspaces.get(workspace) : this.profilesObject.emptyWindows.get(workspace);
    if (profile) {
      return profile;
    }
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return this.transientProfilesObject.folders.get(
        workspaceIdentifier.uri
      );
    }
    if (isWorkspaceIdentifier(workspaceIdentifier)) {
      return this.transientProfilesObject.workspaces.get(
        workspaceIdentifier.configPath
      );
    }
    return this.transientProfilesObject.emptyWindows.get(
      workspaceIdentifier.id
    );
  }
  getWorkspace(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return workspaceIdentifier.uri;
    }
    if (isWorkspaceIdentifier(workspaceIdentifier)) {
      return workspaceIdentifier.configPath;
    }
    return workspaceIdentifier.id;
  }
  isProfileAssociatedToWorkspace(profile) {
    if ([...this.profilesObject.emptyWindows.values()].some(
      (windowProfile) => this.uriIdentityService.extUri.isEqual(
        windowProfile.location,
        profile.location
      )
    )) {
      return true;
    }
    if ([...this.profilesObject.workspaces.values()].some(
      (workspaceProfile) => this.uriIdentityService.extUri.isEqual(
        workspaceProfile.location,
        profile.location
      )
    )) {
      return true;
    }
    if ([...this.transientProfilesObject.emptyWindows.values()].some(
      (windowProfile) => this.uriIdentityService.extUri.isEqual(
        windowProfile.location,
        profile.location
      )
    )) {
      return true;
    }
    if ([...this.transientProfilesObject.workspaces.values()].some(
      (workspaceProfile) => this.uriIdentityService.extUri.isEqual(
        workspaceProfile.location,
        profile.location
      )
    )) {
      return true;
    }
    if ([...this.transientProfilesObject.folders.values()].some(
      (workspaceProfile) => this.uriIdentityService.extUri.isEqual(
        workspaceProfile.location,
        profile.location
      )
    )) {
      return true;
    }
    return false;
  }
  updateProfiles(added, removed, updated) {
    const allProfiles = [...this.profiles, ...added];
    const storedProfiles = [];
    const transientProfiles = this.transientProfilesObject.profiles;
    this.transientProfilesObject.profiles = [];
    for (let profile of allProfiles) {
      if (profile.isDefault) {
        continue;
      }
      if (removed.some((p) => profile.id === p.id)) {
        continue;
      }
      profile = updated.find((p) => profile.id === p.id) ?? profile;
      const transientProfile = transientProfiles.find(
        (p) => profile.id === p.id
      );
      if (profile.isTransient) {
        this.transientProfilesObject.profiles.push(profile);
      } else {
        if (transientProfile) {
          for (const [
            windowId,
            p
          ] of this.transientProfilesObject.emptyWindows.entries()) {
            if (profile.id === p.id) {
              this.updateWorkspaceAssociation(
                { id: windowId },
                profile
              );
              break;
            }
          }
          for (const [
            workspace,
            p
          ] of this.transientProfilesObject.workspaces.entries()) {
            if (profile.id === p.id) {
              this.updateWorkspaceAssociation(
                { id: "", configPath: workspace },
                profile
              );
              break;
            }
          }
          for (const [
            folder,
            p
          ] of this.transientProfilesObject.folders.entries()) {
            if (profile.id === p.id) {
              this.updateWorkspaceAssociation(
                { id: "", uri: folder },
                profile
              );
              break;
            }
          }
        }
        storedProfiles.push({
          location: profile.location,
          name: profile.name,
          shortName: profile.shortName,
          icon: profile.icon,
          useDefaultFlags: profile.useDefaultFlags
        });
      }
    }
    this.saveStoredProfiles(storedProfiles);
    this._profilesObject = void 0;
    this.triggerProfilesChanges(added, removed, updated);
  }
  triggerProfilesChanges(added, removed, updated) {
    this._onDidChangeProfiles.fire({
      added,
      removed,
      updated,
      all: this.profiles
    });
  }
  updateWorkspaceAssociation(workspaceIdentifier, newProfile, transient) {
    transient = newProfile?.isTransient ? true : transient;
    if (transient) {
      if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
        this.transientProfilesObject.folders.delete(
          workspaceIdentifier.uri
        );
        if (newProfile) {
          this.transientProfilesObject.folders.set(
            workspaceIdentifier.uri,
            newProfile
          );
        }
      } else if (isWorkspaceIdentifier(workspaceIdentifier)) {
        this.transientProfilesObject.workspaces.delete(
          workspaceIdentifier.configPath
        );
        if (newProfile) {
          this.transientProfilesObject.workspaces.set(
            workspaceIdentifier.configPath,
            newProfile
          );
        }
      } else {
        this.transientProfilesObject.emptyWindows.delete(
          workspaceIdentifier.id
        );
        if (newProfile) {
          this.transientProfilesObject.emptyWindows.set(
            workspaceIdentifier.id,
            newProfile
          );
        }
      }
    } else {
      this.updateWorkspaceAssociation(
        workspaceIdentifier,
        void 0,
        true
      );
      const workspace = this.getWorkspace(workspaceIdentifier);
      if (URI.isUri(workspace)) {
        this.profilesObject.workspaces.delete(workspace);
        if (newProfile) {
          this.profilesObject.workspaces.set(workspace, newProfile);
        }
      } else {
        this.profilesObject.emptyWindows.delete(workspace);
        if (newProfile) {
          this.profilesObject.emptyWindows.set(workspace, newProfile);
        }
      }
      this.updateStoredProfileAssociations();
    }
  }
  updateStoredProfileAssociations() {
    const workspaces = {};
    for (const [
      workspace,
      profile
    ] of this.profilesObject.workspaces.entries()) {
      workspaces[workspace.toString()] = profile.id;
    }
    const emptyWindows = {};
    for (const [
      windowId,
      profile
    ] of this.profilesObject.emptyWindows.entries()) {
      emptyWindows[windowId.toString()] = profile.id;
    }
    this.saveStoredProfileAssociations({ workspaces, emptyWindows });
    this._profilesObject = void 0;
  }
  // TODO: @sandy081 Remove migration after couple of releases
  migrateStoredProfileAssociations(storedProfileAssociations) {
    const workspaces = {};
    const defaultProfile = this.createDefaultProfile();
    if (storedProfileAssociations.workspaces) {
      for (const [workspace, location] of Object.entries(
        storedProfileAssociations.workspaces
      )) {
        const uri = URI.parse(location);
        workspaces[workspace] = this.uriIdentityService.extUri.isEqual(
          uri,
          defaultProfile.location
        ) ? defaultProfile.id : this.uriIdentityService.extUri.basename(uri);
      }
    }
    const emptyWindows = {};
    if (storedProfileAssociations.emptyWindows) {
      for (const [workspace, location] of Object.entries(
        storedProfileAssociations.emptyWindows
      )) {
        const uri = URI.parse(location);
        emptyWindows[workspace] = this.uriIdentityService.extUri.isEqual(
          uri,
          defaultProfile.location
        ) ? defaultProfile.id : this.uriIdentityService.extUri.basename(uri);
      }
    }
    return { workspaces, emptyWindows };
  }
  getStoredProfiles() {
    return [];
  }
  saveStoredProfiles(storedProfiles) {
    throw new Error("not implemented");
  }
  getStoredProfileAssociations() {
    return {};
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    throw new Error("not implemented");
  }
  getDefaultProfileExtensionsLocation() {
    return void 0;
  }
};
UserDataProfilesService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], UserDataProfilesService);
class InMemoryUserDataProfilesService extends UserDataProfilesService {
  storedProfiles = [];
  getStoredProfiles() {
    return this.storedProfiles;
  }
  saveStoredProfiles(storedProfiles) {
    this.storedProfiles = storedProfiles;
  }
  storedProfileAssociations = {};
  getStoredProfileAssociations() {
    return this.storedProfileAssociations;
  }
  saveStoredProfileAssociations(storedProfileAssociations) {
    this.storedProfileAssociations = storedProfileAssociations;
  }
}
export {
  IUserDataProfilesService,
  InMemoryUserDataProfilesService,
  ProfileResourceType,
  UserDataProfilesService,
  isUserDataProfile,
  reviveProfile,
  toUserDataProfile
};
