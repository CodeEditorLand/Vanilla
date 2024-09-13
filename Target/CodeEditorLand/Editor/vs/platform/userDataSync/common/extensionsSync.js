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
import { Promises } from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { getErrorMessage } from "../../../base/common/errors.js";
import { Event } from "../../../base/common/event.js";
import { toFormattedString } from "../../../base/common/jsonFormatter.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { compare } from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { GlobalExtensionEnablementService } from "../../extensionManagement/common/extensionEnablementService.js";
import { IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService, ILocalExtension, ExtensionManagementError, ExtensionManagementErrorCode, IGalleryExtension, DISABLED_EXTENSIONS_STORAGE_PATH, EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, EXTENSION_INSTALL_SOURCE_CONTEXT, InstallExtensionInfo, ExtensionInstallSource } from "../../extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../extensionManagement/common/extensionManagementUtil.js";
import { ExtensionStorageService, IExtensionStorageService } from "../../extensionManagement/common/extensionStorage.js";
import { ExtensionType, IExtensionIdentifier, isApplicationScopedExtension } from "../../extensions/common/extensions.js";
import { IFileService } from "../../files/common/files.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ServiceCollection } from "../../instantiation/common/serviceCollection.js";
import { ILogService } from "../../log/common/log.js";
import { IStorageService } from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfile, IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import { AbstractInitializer, AbstractSynchroniser, getSyncResourceLogLabel, IAcceptResult, IMergeResult, IResourcePreview } from "./abstractSynchronizer.js";
import { IMergeResult as IExtensionMergeResult, merge } from "./extensionsMerge.js";
import { IIgnoredExtensionsManagementService } from "./ignoredExtensions.js";
import { Change, IRemoteUserData, ISyncData, ISyncExtension, IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, SyncResource, USER_DATA_SYNC_SCHEME, ILocalSyncExtension } from "./userDataSync.js";
import { IUserDataProfileStorageService } from "../../userDataProfile/common/userDataProfileStorageService.js";
async function parseAndMigrateExtensions(syncData, extensionManagementService) {
  const extensions = JSON.parse(syncData.content);
  if (syncData.version === 1 || syncData.version === 2) {
    const builtinExtensions = (await extensionManagementService.getInstalled(ExtensionType.System)).filter((e) => e.isBuiltin);
    for (const extension of extensions) {
      if (syncData.version === 1) {
        if (extension.enabled === false) {
          extension.disabled = true;
        }
        delete extension.enabled;
      }
      if (syncData.version === 2) {
        if (builtinExtensions.every((installed) => !areSameExtensions(installed.identifier, extension.identifier))) {
          extension.installed = true;
        }
      }
    }
  }
  return extensions;
}
__name(parseAndMigrateExtensions, "parseAndMigrateExtensions");
function parseExtensions(syncData) {
  return JSON.parse(syncData.content);
}
__name(parseExtensions, "parseExtensions");
function stringify(extensions, format) {
  extensions.sort((e1, e2) => {
    if (!e1.identifier.uuid && e2.identifier.uuid) {
      return -1;
    }
    if (e1.identifier.uuid && !e2.identifier.uuid) {
      return 1;
    }
    return compare(e1.identifier.id, e2.identifier.id);
  });
  return format ? toFormattedString(extensions, {}) : JSON.stringify(extensions);
}
__name(stringify, "stringify");
let ExtensionsSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, extensionManagementService, ignoredExtensionsManagementService, logService, configurationService, userDataSyncEnablementService, telemetryService, extensionStorageService, uriIdentityService, userDataProfileStorageService, instantiationService) {
    super({ syncResource: SyncResource.Extensions, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.extensionManagementService = extensionManagementService;
    this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
    this.instantiationService = instantiationService;
    this.localExtensionsProvider = this.instantiationService.createInstance(LocalExtensionsProvider);
    this._register(
      Event.any(
        Event.filter(this.extensionManagementService.onDidInstallExtensions, (e) => e.some(({ local }) => !!local)),
        Event.filter(this.extensionManagementService.onDidUninstallExtension, (e) => !e.error),
        Event.filter(userDataProfileStorageService.onDidChange, (e) => e.valueChanges.some(({ profile: profile2, changes }) => this.syncResource.profile.id === profile2.id && changes.some((change) => change.key === DISABLED_EXTENSIONS_STORAGE_PATH))),
        extensionStorageService.onDidChangeExtensionStorageToSync
      )(() => this.triggerLocalChange())
    );
  }
  static {
    __name(this, "ExtensionsSynchroniser");
  }
  /*
  	Version 3 - Introduce installed property to skip installing built in extensions
  	protected readonly version: number = 3;
  */
  /* Version 4: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
  /* Version 5: Introduce extension state */
  /* Version 6: Added isApplicationScoped property */
  version = 6;
  previewResource = this.extUri.joinPath(this.syncPreviewFolder, "extensions.json");
  baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "base" });
  localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "local" });
  remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "remote" });
  acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: "accepted" });
  localExtensionsProvider;
  async generateSyncPreview(remoteUserData, lastSyncUserData) {
    const remoteExtensions = remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
    const skippedExtensions = lastSyncUserData?.skippedExtensions ?? [];
    const builtinExtensions = lastSyncUserData?.builtinExtensions ?? null;
    const lastSyncExtensions = lastSyncUserData?.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
    const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
    if (remoteExtensions) {
      this.logService.trace(`${this.syncResourceLogLabel}: Merging remote extensions with local extensions...`);
    } else {
      this.logService.trace(`${this.syncResourceLogLabel}: Remote extensions does not exist. Synchronizing extensions for the first time.`);
    }
    const { local, remote } = merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, builtinExtensions);
    const previewResult = {
      local,
      remote,
      content: this.getPreviewContent(localExtensions, local.added, local.updated, local.removed),
      localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? Change.Modified : Change.None,
      remoteChange: remote !== null ? Change.Modified : Change.None
    };
    const localContent = this.stringify(localExtensions, false);
    return [{
      skippedExtensions,
      builtinExtensions,
      baseResource: this.baseResource,
      baseContent: lastSyncExtensions ? this.stringify(lastSyncExtensions, false) : localContent,
      localResource: this.localResource,
      localContent,
      localExtensions,
      remoteResource: this.remoteResource,
      remoteExtensions,
      remoteContent: remoteExtensions ? this.stringify(remoteExtensions, false) : null,
      previewResource: this.previewResource,
      previewResult,
      localChange: previewResult.localChange,
      remoteChange: previewResult.remoteChange,
      acceptedResource: this.acceptedResource
    }];
  }
  async hasRemoteChanged(lastSyncUserData) {
    const lastSyncExtensions = lastSyncUserData.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
    const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
    const { remote } = merge(localExtensions, lastSyncExtensions, lastSyncExtensions, lastSyncUserData.skippedExtensions || [], ignoredExtensions, lastSyncUserData.builtinExtensions || []);
    return remote !== null;
  }
  getPreviewContent(localExtensions, added, updated, removed) {
    const preview = [...added, ...updated];
    const idsOrUUIDs = /* @__PURE__ */ new Set();
    const addIdentifier = /* @__PURE__ */ __name((identifier) => {
      idsOrUUIDs.add(identifier.id.toLowerCase());
      if (identifier.uuid) {
        idsOrUUIDs.add(identifier.uuid);
      }
    }, "addIdentifier");
    preview.forEach(({ identifier }) => addIdentifier(identifier));
    removed.forEach(addIdentifier);
    for (const localExtension of localExtensions) {
      if (idsOrUUIDs.has(localExtension.identifier.id.toLowerCase()) || localExtension.identifier.uuid && idsOrUUIDs.has(localExtension.identifier.uuid)) {
        continue;
      }
      preview.push(localExtension);
    }
    return this.stringify(preview, false);
  }
  async getMergeResult(resourcePreview, token) {
    return { ...resourcePreview.previewResult, hasConflicts: false };
  }
  async getAcceptResult(resourcePreview, resource, content, token) {
    if (this.extUri.isEqual(resource, this.localResource)) {
      return this.acceptLocal(resourcePreview);
    }
    if (this.extUri.isEqual(resource, this.remoteResource)) {
      return this.acceptRemote(resourcePreview);
    }
    if (this.extUri.isEqual(resource, this.previewResource)) {
      return resourcePreview.previewResult;
    }
    throw new Error(`Invalid Resource: ${resource.toString()}`);
  }
  async acceptLocal(resourcePreview) {
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, this.syncResource.profile.extensionsResource);
    const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
    const mergeResult = merge(resourcePreview.localExtensions, null, null, resourcePreview.skippedExtensions, ignoredExtensions, resourcePreview.builtinExtensions);
    const { local, remote } = mergeResult;
    return {
      content: resourcePreview.localContent,
      local,
      remote,
      localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? Change.Modified : Change.None,
      remoteChange: remote !== null ? Change.Modified : Change.None
    };
  }
  async acceptRemote(resourcePreview) {
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, this.syncResource.profile.extensionsResource);
    const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
    const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
    if (remoteExtensions !== null) {
      const mergeResult = merge(resourcePreview.localExtensions, remoteExtensions, resourcePreview.localExtensions, [], ignoredExtensions, resourcePreview.builtinExtensions);
      const { local, remote } = mergeResult;
      return {
        content: resourcePreview.remoteContent,
        local,
        remote,
        localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? Change.Modified : Change.None,
        remoteChange: remote !== null ? Change.Modified : Change.None
      };
    } else {
      return {
        content: resourcePreview.remoteContent,
        local: { added: [], removed: [], updated: [] },
        remote: null,
        localChange: Change.None,
        remoteChange: Change.None
      };
    }
  }
  async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
    let { skippedExtensions, builtinExtensions, localExtensions } = resourcePreviews[0][0];
    const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
    if (localChange === Change.None && remoteChange === Change.None) {
      this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing extensions.`);
    }
    if (localChange !== Change.None) {
      await this.backupLocal(JSON.stringify(localExtensions));
      skippedExtensions = await this.localExtensionsProvider.updateLocalExtensions(local.added, local.removed, local.updated, skippedExtensions, this.syncResource.profile);
    }
    if (remote) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating remote extensions...`);
      const content = JSON.stringify(remote.all);
      remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
      this.logService.info(`${this.syncResourceLogLabel}: Updated remote extensions.${remote.added.length ? ` Added: ${JSON.stringify(remote.added.map((e) => e.identifier.id))}.` : ""}${remote.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map((e) => e.identifier.id))}.` : ""}${remote.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map((e) => e.identifier.id))}.` : ""}`);
    }
    if (lastSyncUserData?.ref !== remoteUserData.ref) {
      this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized extensions...`);
      builtinExtensions = this.computeBuiltinExtensions(localExtensions, builtinExtensions);
      await this.updateLastSyncUserData(remoteUserData, { skippedExtensions, builtinExtensions });
      this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized extensions.${skippedExtensions.length ? ` Skipped: ${JSON.stringify(skippedExtensions.map((e) => e.identifier.id))}.` : ""}`);
    }
  }
  computeBuiltinExtensions(localExtensions, previousBuiltinExtensions) {
    const localExtensionsSet = /* @__PURE__ */ new Set();
    const builtinExtensions = [];
    for (const localExtension of localExtensions) {
      localExtensionsSet.add(localExtension.identifier.id.toLowerCase());
      if (!localExtension.installed) {
        builtinExtensions.push(localExtension.identifier);
      }
    }
    if (previousBuiltinExtensions) {
      for (const builtinExtension of previousBuiltinExtensions) {
        if (!localExtensionsSet.has(builtinExtension.id.toLowerCase())) {
          builtinExtensions.push(builtinExtension);
        }
      }
    }
    return builtinExtensions;
  }
  async resolveContent(uri) {
    if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.baseResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
      const content = await this.resolvePreviewContent(uri);
      return content ? this.stringify(JSON.parse(content), true) : content;
    }
    return null;
  }
  stringify(extensions, format) {
    return stringify(extensions, format);
  }
  async hasLocalData() {
    try {
      const { localExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
      if (localExtensions.some((e) => e.installed || e.disabled)) {
        return true;
      }
    } catch (error) {
    }
    return false;
  }
};
ExtensionsSynchroniser = __decorateClass([
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUserDataSyncStoreService),
  __decorateParam(6, IUserDataSyncLocalStoreService),
  __decorateParam(7, IExtensionManagementService),
  __decorateParam(8, IIgnoredExtensionsManagementService),
  __decorateParam(9, IUserDataSyncLogService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IUserDataSyncEnablementService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IExtensionStorageService),
  __decorateParam(14, IUriIdentityService),
  __decorateParam(15, IUserDataProfileStorageService),
  __decorateParam(16, IInstantiationService)
], ExtensionsSynchroniser);
let LocalExtensionsProvider = class {
  constructor(extensionManagementService, userDataProfileStorageService, extensionGalleryService, ignoredExtensionsManagementService, instantiationService, logService) {
    this.extensionManagementService = extensionManagementService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.extensionGalleryService = extensionGalleryService;
    this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
    this.instantiationService = instantiationService;
    this.logService = logService;
  }
  static {
    __name(this, "LocalExtensionsProvider");
  }
  async getLocalExtensions(profile) {
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
    const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
    const localExtensions = await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
      const disabledExtensions = extensionEnablementService.getDisabledExtensions();
      return installedExtensions.map((extension) => {
        const { identifier, isBuiltin, manifest, preRelease, pinned, isApplicationScoped } = extension;
        const syncExntesion = { identifier, preRelease, version: manifest.version, pinned: !!pinned };
        if (isApplicationScoped && !isApplicationScopedExtension(manifest)) {
          syncExntesion.isApplicationScoped = isApplicationScoped;
        }
        if (disabledExtensions.some((disabledExtension) => areSameExtensions(disabledExtension, identifier))) {
          syncExntesion.disabled = true;
        }
        if (!isBuiltin) {
          syncExntesion.installed = true;
        }
        try {
          const keys = extensionStorageService.getKeysForSync({ id: identifier.id, version: manifest.version });
          if (keys) {
            const extensionStorageState = extensionStorageService.getExtensionState(extension, true) || {};
            syncExntesion.state = Object.keys(extensionStorageState).reduce((state, key) => {
              if (keys.includes(key)) {
                state[key] = extensionStorageState[key];
              }
              return state;
            }, {});
          }
        } catch (error) {
          this.logService.info(`${getSyncResourceLogLabel(SyncResource.Extensions, profile)}: Error while parsing extension state`, getErrorMessage(error));
        }
        return syncExntesion;
      });
    });
    return { localExtensions, ignoredExtensions };
  }
  async updateLocalExtensions(added, removed, updated, skippedExtensions, profile) {
    const syncResourceLogLabel = getSyncResourceLogLabel(SyncResource.Extensions, profile);
    const extensionsToInstall = [];
    const syncExtensionsToInstall = /* @__PURE__ */ new Map();
    const removeFromSkipped = [];
    const addToSkipped = [];
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
    if (added.length || updated.length) {
      await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
        await Promises.settled([...added, ...updated].map(async (e) => {
          const installedExtension = installedExtensions.find((installed) => areSameExtensions(installed.identifier, e.identifier));
          if (installedExtension && installedExtension.isBuiltin) {
            if (e.state && installedExtension.manifest.version === e.version) {
              this.updateExtensionState(e.state, installedExtension, installedExtension.manifest.version, extensionStorageService);
            }
            const isDisabled = extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e.identifier));
            if (isDisabled !== !!e.disabled) {
              if (e.disabled) {
                this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id);
                await extensionEnablementService.disableExtension(e.identifier);
                this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id);
              } else {
                this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id);
                await extensionEnablementService.enableExtension(e.identifier);
                this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id);
              }
            }
            removeFromSkipped.push(e.identifier);
            return;
          }
          const version = e.pinned ? e.version : void 0;
          const extension = (await this.extensionGalleryService.getExtensions([{ ...e.identifier, version, preRelease: version ? void 0 : e.preRelease }], CancellationToken.None))[0];
          if (e.state && (installedExtension ? installedExtension.manifest.version === e.version : !!extension)) {
            this.updateExtensionState(e.state, installedExtension || extension, installedExtension?.manifest.version, extensionStorageService);
          }
          if (extension) {
            try {
              const isDisabled = extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e.identifier));
              if (isDisabled !== !!e.disabled) {
                if (e.disabled) {
                  this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id, extension.version);
                  await extensionEnablementService.disableExtension(extension.identifier);
                  this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id, extension.version);
                } else {
                  this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id, extension.version);
                  await extensionEnablementService.enableExtension(extension.identifier);
                  this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id, extension.version);
                }
              }
              if (!installedExtension || installedExtension.preRelease !== e.preRelease || installedExtension.pinned !== e.pinned || version && installedExtension.manifest.version !== version) {
                if (await this.extensionManagementService.canInstall(extension)) {
                  extensionsToInstall.push({
                    extension,
                    options: {
                      isMachineScoped: false,
                      donotIncludePackAndDependencies: true,
                      installGivenVersion: e.pinned && !!e.version,
                      pinned: e.pinned,
                      installPreReleaseVersion: e.preRelease,
                      profileLocation: profile.extensionsResource,
                      isApplicationScoped: e.isApplicationScoped,
                      context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true, [EXTENSION_INSTALL_SOURCE_CONTEXT]: ExtensionInstallSource.SETTINGS_SYNC }
                    }
                  });
                  syncExtensionsToInstall.set(extension.identifier.id.toLowerCase(), e);
                } else {
                  this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                  addToSkipped.push(e);
                }
              }
            } catch (error) {
              addToSkipped.push(e);
              this.logService.error(error);
              this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, extension.displayName || extension.identifier.id);
            }
          } else {
            addToSkipped.push(e);
            this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the extension is not found.`, e.identifier.id);
          }
        }));
      });
    }
    if (removed.length) {
      const extensionsToRemove = installedExtensions.filter(({ identifier, isBuiltin }) => !isBuiltin && removed.some((r) => areSameExtensions(identifier, r)));
      await Promises.settled(extensionsToRemove.map(async (extensionToRemove) => {
        this.logService.trace(`${syncResourceLogLabel}: Uninstalling local extension...`, extensionToRemove.identifier.id);
        await this.extensionManagementService.uninstall(extensionToRemove, { donotIncludePack: true, donotCheckDependents: true, profileLocation: profile.extensionsResource });
        this.logService.info(`${syncResourceLogLabel}: Uninstalled local extension.`, extensionToRemove.identifier.id);
        removeFromSkipped.push(extensionToRemove.identifier);
      }));
    }
    const results = await this.extensionManagementService.installGalleryExtensions(extensionsToInstall);
    for (const { identifier, local, error, source } of results) {
      const gallery = source;
      if (local) {
        this.logService.info(`${syncResourceLogLabel}: Installed extension.`, identifier.id, gallery.version);
        removeFromSkipped.push(identifier);
      } else {
        const e = syncExtensionsToInstall.get(identifier.id.toLowerCase());
        if (e) {
          addToSkipped.push(e);
          this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, gallery.displayName || gallery.identifier.id);
        }
        if (error instanceof ExtensionManagementError && [ExtensionManagementErrorCode.Incompatible, ExtensionManagementErrorCode.IncompatibleApi, ExtensionManagementErrorCode.IncompatibleTargetPlatform].includes(error.code)) {
          this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the compatible extension is not found.`, gallery.displayName || gallery.identifier.id);
        } else if (error) {
          this.logService.error(error);
        }
      }
    }
    const newSkippedExtensions = [];
    for (const skippedExtension of skippedExtensions) {
      if (!removeFromSkipped.some((e) => areSameExtensions(e, skippedExtension.identifier))) {
        newSkippedExtensions.push(skippedExtension);
      }
    }
    for (const skippedExtension of addToSkipped) {
      if (!newSkippedExtensions.some((e) => areSameExtensions(e.identifier, skippedExtension.identifier))) {
        newSkippedExtensions.push(skippedExtension);
      }
    }
    return newSkippedExtensions;
  }
  updateExtensionState(state, extension, version, extensionStorageService) {
    const extensionState = extensionStorageService.getExtensionState(extension, true) || {};
    const keys = version ? extensionStorageService.getKeysForSync({ id: extension.identifier.id, version }) : void 0;
    if (keys) {
      keys.forEach((key) => {
        extensionState[key] = state[key];
      });
    } else {
      Object.keys(state).forEach((key) => extensionState[key] = state[key]);
    }
    extensionStorageService.setExtensionState(extension, extensionState, true);
  }
  async withProfileScopedServices(profile, fn) {
    return this.userDataProfileStorageService.withProfileScopedStorageService(
      profile,
      async (storageService) => {
        const disposables = new DisposableStore();
        const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])));
        const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
        const extensionStorageService = disposables.add(instantiationService.createInstance(ExtensionStorageService));
        try {
          return await fn(extensionEnablementService, extensionStorageService);
        } finally {
          disposables.dispose();
        }
      }
    );
  }
};
LocalExtensionsProvider = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IUserDataProfileStorageService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IIgnoredExtensionsManagementService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IUserDataSyncLogService)
], LocalExtensionsProvider);
let AbstractExtensionsInitializer = class extends AbstractInitializer {
  constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super(SyncResource.Extensions, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    this.extensionManagementService = extensionManagementService;
    this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
  }
  static {
    __name(this, "AbstractExtensionsInitializer");
  }
  async parseExtensions(remoteUserData) {
    return remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
  }
  generatePreview(remoteExtensions, localExtensions) {
    const installedExtensions = [];
    const newExtensions = [];
    const disabledExtensions = [];
    for (const extension of remoteExtensions) {
      if (this.ignoredExtensionsManagementService.hasToNeverSyncExtension(extension.identifier.id)) {
        continue;
      }
      const installedExtension = localExtensions.find((i) => areSameExtensions(i.identifier, extension.identifier));
      if (installedExtension) {
        installedExtensions.push(installedExtension);
        if (extension.disabled) {
          disabledExtensions.push(extension.identifier);
        }
      } else if (extension.installed) {
        newExtensions.push({ ...extension.identifier, preRelease: !!extension.preRelease });
        if (extension.disabled) {
          disabledExtensions.push(extension.identifier);
        }
      }
    }
    return { installedExtensions, newExtensions, disabledExtensions, remoteExtensions };
  }
};
AbstractExtensionsInitializer = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IIgnoredExtensionsManagementService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUserDataProfilesService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IUriIdentityService)
], AbstractExtensionsInitializer);
export {
  AbstractExtensionsInitializer,
  ExtensionsSynchroniser,
  LocalExtensionsProvider,
  parseExtensions,
  stringify
};
//# sourceMappingURL=extensionsSync.js.map
