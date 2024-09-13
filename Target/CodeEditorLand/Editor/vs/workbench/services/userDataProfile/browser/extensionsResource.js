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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { GlobalExtensionEnablementService } from "../../../../platform/extensionManagement/common/extensionEnablementService.js";
import { EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, IExtensionGalleryService, IExtensionIdentifier, IExtensionManagementService, IGlobalExtensionEnablementService, ILocalExtension, InstallExtensionInfo } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { areSameExtensions } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { ExtensionType } from "../../../../platform/extensions/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUserDataProfile, ProfileResourceType } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUserDataProfileStorageService } from "../../../../platform/userDataProfile/common/userDataProfileStorageService.js";
import { ITreeItemCheckboxState, TreeItemCollapsibleState } from "../../../common/views.js";
import { IProfileResource, IProfileResourceChildTreeItem, IProfileResourceInitializer, IProfileResourceTreeItem, IUserDataProfileService } from "../common/userDataProfile.js";
let ExtensionsResourceInitializer = class {
  constructor(userDataProfileService, extensionManagementService, extensionGalleryService, extensionEnablementService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.extensionEnablementService = extensionEnablementService;
    this.logService = logService;
  }
  static {
    __name(this, "ExtensionsResourceInitializer");
  }
  async initialize(content) {
    const profileExtensions = JSON.parse(content);
    const installedExtensions = await this.extensionManagementService.getInstalled(void 0, this.userDataProfileService.currentProfile.extensionsResource);
    const extensionsToEnableOrDisable = [];
    const extensionsToInstall = [];
    for (const e of profileExtensions) {
      const isDisabled = this.extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e.identifier));
      const installedExtension = installedExtensions.find((installed) => areSameExtensions(installed.identifier, e.identifier));
      if (!installedExtension || !installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease) {
        extensionsToInstall.push(e);
      }
      if (isDisabled !== !!e.disabled) {
        extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
      }
    }
    const extensionsToUninstall = installedExtensions.filter((extension) => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => areSameExtensions(identifier, extension.identifier)));
    for (const { extension, enable } of extensionsToEnableOrDisable) {
      if (enable) {
        this.logService.trace(`Initializing Profile: Enabling extension...`, extension.id);
        await this.extensionEnablementService.enableExtension(extension);
        this.logService.info(`Initializing Profile: Enabled extension...`, extension.id);
      } else {
        this.logService.trace(`Initializing Profile: Disabling extension...`, extension.id);
        await this.extensionEnablementService.disableExtension(extension);
        this.logService.info(`Initializing Profile: Disabled extension...`, extension.id);
      }
    }
    if (extensionsToInstall.length) {
      const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map((e) => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? void 0 : e.preRelease })), CancellationToken.None);
      await Promise.all(extensionsToInstall.map(async (e) => {
        const extension = galleryExtensions.find((galleryExtension) => areSameExtensions(galleryExtension.identifier, e.identifier));
        if (!extension) {
          return;
        }
        if (await this.extensionManagementService.canInstall(extension)) {
          this.logService.trace(`Initializing Profile: Installing extension...`, extension.identifier.id, extension.version);
          await this.extensionManagementService.installFromGallery(extension, {
            isMachineScoped: false,
            /* set isMachineScoped value to prevent install and sync dialog in web */
            donotIncludePackAndDependencies: true,
            installGivenVersion: !!e.version,
            installPreReleaseVersion: e.preRelease,
            profileLocation: this.userDataProfileService.currentProfile.extensionsResource,
            context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
          });
          this.logService.info(`Initializing Profile: Installed extension...`, extension.identifier.id, extension.version);
        } else {
          this.logService.info(`Initializing Profile: Skipped installing extension because it cannot be installed.`, extension.identifier.id);
        }
      }));
    }
    if (extensionsToUninstall.length) {
      await Promise.all(extensionsToUninstall.map((e) => this.extensionManagementService.uninstall(e)));
    }
  }
};
ExtensionsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IExtensionManagementService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, IGlobalExtensionEnablementService),
  __decorateParam(4, ILogService)
], ExtensionsResourceInitializer);
let ExtensionsResource = class {
  constructor(extensionManagementService, extensionGalleryService, userDataProfileStorageService, instantiationService, logService) {
    this.extensionManagementService = extensionManagementService;
    this.extensionGalleryService = extensionGalleryService;
    this.userDataProfileStorageService = userDataProfileStorageService;
    this.instantiationService = instantiationService;
    this.logService = logService;
  }
  static {
    __name(this, "ExtensionsResource");
  }
  async getContent(profile, exclude) {
    const extensions = await this.getLocalExtensions(profile);
    return this.toContent(extensions, exclude);
  }
  toContent(extensions, exclude) {
    return JSON.stringify(exclude?.length ? extensions.filter((e) => !exclude.includes(e.identifier.id.toLowerCase())) : extensions);
  }
  async apply(content, profile, progress, token) {
    return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
      const profileExtensions = await this.getProfileExtensions(content);
      const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
      const extensionsToEnableOrDisable = [];
      const extensionsToInstall = [];
      for (const e of profileExtensions) {
        const isDisabled = extensionEnablementService.getDisabledExtensions().some((disabledExtension) => areSameExtensions(disabledExtension, e.identifier));
        const installedExtension = installedExtensions.find((installed) => areSameExtensions(installed.identifier, e.identifier));
        if (!installedExtension || !installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease) {
          extensionsToInstall.push(e);
        }
        if (isDisabled !== !!e.disabled) {
          extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
        }
      }
      const extensionsToUninstall = installedExtensions.filter((extension) => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => areSameExtensions(identifier, extension.identifier)) && !extension.isApplicationScoped);
      for (const { extension, enable } of extensionsToEnableOrDisable) {
        if (enable) {
          this.logService.trace(`Importing Profile (${profile.name}): Enabling extension...`, extension.id);
          await extensionEnablementService.enableExtension(extension);
          this.logService.info(`Importing Profile (${profile.name}): Enabled extension...`, extension.id);
        } else {
          this.logService.trace(`Importing Profile (${profile.name}): Disabling extension...`, extension.id);
          await extensionEnablementService.disableExtension(extension);
          this.logService.info(`Importing Profile (${profile.name}): Disabled extension...`, extension.id);
        }
      }
      if (extensionsToInstall.length) {
        this.logService.info(`Importing Profile (${profile.name}): Started installing extensions.`);
        const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map((e) => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? void 0 : e.preRelease })), CancellationToken.None);
        const installExtensionInfos = [];
        await Promise.all(extensionsToInstall.map(async (e) => {
          const extension = galleryExtensions.find((galleryExtension) => areSameExtensions(galleryExtension.identifier, e.identifier));
          if (!extension) {
            return;
          }
          if (await this.extensionManagementService.canInstall(extension)) {
            installExtensionInfos.push({
              extension,
              options: {
                isMachineScoped: false,
                /* set isMachineScoped value to prevent install and sync dialog in web */
                donotIncludePackAndDependencies: true,
                installGivenVersion: !!e.version,
                installPreReleaseVersion: e.preRelease,
                profileLocation: profile.extensionsResource,
                context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
              }
            });
          } else {
            this.logService.info(`Importing Profile (${profile.name}): Skipped installing extension because it cannot be installed.`, extension.identifier.id);
          }
        }));
        if (installExtensionInfos.length) {
          if (token) {
            for (const installExtensionInfo of installExtensionInfos) {
              if (token.isCancellationRequested) {
                return;
              }
              progress?.(localize("installingExtension", "Installing extension {0}...", installExtensionInfo.extension.displayName ?? installExtensionInfo.extension.identifier.id));
              await this.extensionManagementService.installFromGallery(installExtensionInfo.extension, installExtensionInfo.options);
            }
          } else {
            await this.extensionManagementService.installGalleryExtensions(installExtensionInfos);
          }
        }
        this.logService.info(`Importing Profile (${profile.name}): Finished installing extensions.`);
      }
      if (extensionsToUninstall.length) {
        await Promise.all(extensionsToUninstall.map((e) => this.extensionManagementService.uninstall(e)));
      }
    });
  }
  async copy(from, to, disableExtensions) {
    await this.extensionManagementService.copyExtensions(from.extensionsResource, to.extensionsResource);
    const extensionsToDisable = await this.withProfileScopedServices(from, async (extensionEnablementService) => extensionEnablementService.getDisabledExtensions());
    if (disableExtensions) {
      const extensions = await this.extensionManagementService.getInstalled(ExtensionType.User, to.extensionsResource);
      for (const extension of extensions) {
        extensionsToDisable.push(extension.identifier);
      }
    }
    await this.withProfileScopedServices(to, async (extensionEnablementService) => Promise.all(extensionsToDisable.map((extension) => extensionEnablementService.disableExtension(extension))));
  }
  async getLocalExtensions(profile) {
    return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
      const result = /* @__PURE__ */ new Map();
      const installedExtensions = await this.extensionManagementService.getInstalled(void 0, profile.extensionsResource);
      const disabledExtensions = extensionEnablementService.getDisabledExtensions();
      for (const extension of installedExtensions) {
        const { identifier, preRelease } = extension;
        const disabled = disabledExtensions.some((disabledExtension) => areSameExtensions(disabledExtension, identifier));
        if (extension.isBuiltin && !disabled) {
          continue;
        }
        if (!extension.isBuiltin) {
          if (!extension.identifier.uuid) {
            continue;
          }
        }
        const existing = result.get(identifier.id.toLowerCase());
        if (existing?.disabled) {
          result.delete(identifier.id.toLowerCase());
        }
        const profileExtension = { identifier, displayName: extension.manifest.displayName };
        if (disabled) {
          profileExtension.disabled = true;
        }
        if (!extension.isBuiltin && extension.pinned) {
          profileExtension.version = extension.manifest.version;
        }
        if (!profileExtension.version && preRelease) {
          profileExtension.preRelease = true;
        }
        result.set(profileExtension.identifier.id.toLowerCase(), profileExtension);
      }
      return [...result.values()];
    });
  }
  async getProfileExtensions(content) {
    return JSON.parse(content);
  }
  async withProfileScopedServices(profile, fn) {
    return this.userDataProfileStorageService.withProfileScopedStorageService(
      profile,
      async (storageService) => {
        const disposables = new DisposableStore();
        const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])));
        const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
        try {
          return await fn(extensionEnablementService);
        } finally {
          disposables.dispose();
        }
      }
    );
  }
};
ExtensionsResource = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IUserDataProfileStorageService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService)
], ExtensionsResource);
class ExtensionsResourceTreeItem {
  static {
    __name(this, "ExtensionsResourceTreeItem");
  }
  type = ProfileResourceType.Extensions;
  handle = ProfileResourceType.Extensions;
  label = { label: localize("extensions", "Extensions") };
  collapsibleState = TreeItemCollapsibleState.Expanded;
  contextValue = ProfileResourceType.Extensions;
  checkbox;
  excludedExtensions = /* @__PURE__ */ new Set();
  async getChildren() {
    const extensions = (await this.getExtensions()).sort((a, b) => (a.displayName ?? a.identifier.id).localeCompare(b.displayName ?? b.identifier.id));
    const that = this;
    return extensions.map((e) => ({
      handle: e.identifier.id.toLowerCase(),
      parent: this,
      label: { label: e.displayName || e.identifier.id },
      description: e.disabled ? localize("disabled", "Disabled") : void 0,
      collapsibleState: TreeItemCollapsibleState.None,
      checkbox: that.checkbox ? {
        get isChecked() {
          return !that.excludedExtensions.has(e.identifier.id.toLowerCase());
        },
        set isChecked(value) {
          if (value) {
            that.excludedExtensions.delete(e.identifier.id.toLowerCase());
          } else {
            that.excludedExtensions.add(e.identifier.id.toLowerCase());
          }
        },
        tooltip: localize("exclude", "Select {0} Extension", e.displayName || e.identifier.id),
        accessibilityInformation: {
          label: localize("exclude", "Select {0} Extension", e.displayName || e.identifier.id)
        }
      } : void 0,
      themeIcon: Codicon.extensions,
      command: {
        id: "extension.open",
        title: "",
        arguments: [e.identifier.id, void 0, true]
      }
    }));
  }
  async hasContent() {
    const extensions = await this.getExtensions();
    return extensions.length > 0;
  }
}
let ExtensionsResourceExportTreeItem = class extends ExtensionsResourceTreeItem {
  constructor(profile, instantiationService) {
    super();
    this.profile = profile;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ExtensionsResourceExportTreeItem");
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.extensions;
  }
  getExtensions() {
    return this.instantiationService.createInstance(ExtensionsResource).getLocalExtensions(this.profile);
  }
  async getContent() {
    return this.instantiationService.createInstance(ExtensionsResource).getContent(this.profile, [...this.excludedExtensions.values()]);
  }
};
ExtensionsResourceExportTreeItem = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ExtensionsResourceExportTreeItem);
let ExtensionsResourceImportTreeItem = class extends ExtensionsResourceTreeItem {
  constructor(content, instantiationService) {
    super();
    this.content = content;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ExtensionsResourceImportTreeItem");
  }
  isFromDefaultProfile() {
    return false;
  }
  getExtensions() {
    return this.instantiationService.createInstance(ExtensionsResource).getProfileExtensions(this.content);
  }
  async getContent() {
    const extensionsResource = this.instantiationService.createInstance(ExtensionsResource);
    const extensions = await extensionsResource.getProfileExtensions(this.content);
    return extensionsResource.toContent(extensions, [...this.excludedExtensions.values()]);
  }
};
ExtensionsResourceImportTreeItem = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ExtensionsResourceImportTreeItem);
export {
  ExtensionsResource,
  ExtensionsResourceExportTreeItem,
  ExtensionsResourceImportTreeItem,
  ExtensionsResourceInitializer,
  ExtensionsResourceTreeItem
};
//# sourceMappingURL=extensionsResource.js.map
