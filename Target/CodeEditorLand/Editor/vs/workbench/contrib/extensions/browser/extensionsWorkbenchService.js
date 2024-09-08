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
var __decorateParam = (index2, decorator) => (target, key) => decorator(target, key, index2);
import { mainWindow } from "../../../../base/browser/window.js";
import { index } from "../../../../base/common/arrays.js";
import {
  createCancelablePromise,
  Promises,
  ThrottledDelayer
} from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import {
  CancellationError,
  isCancellationError
} from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { FileAccess } from "../../../../base/common/network.js";
import {
  singlePagePager
} from "../../../../base/common/paging.js";
import { isWeb, language } from "../../../../base/common/platform.js";
import * as resources from "../../../../base/common/resources.js";
import * as semver from "../../../../base/common/semver/semver.js";
import {
  isBoolean,
  isDefined,
  isString,
  isUndefined
} from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import * as nls from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  Extensions as ConfigurationExtensions
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  IDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import {
  EXTENSION_IDENTIFIER_REGEX,
  IExtensionGalleryService,
  InstallOperation,
  isTargetPlatformCompatible,
  WEB_EXTENSION_TAG
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import {
  areSameExtensions,
  getGalleryExtensionId,
  getGalleryExtensionTelemetryData,
  getLocalExtensionTelemetryData,
  groupByExtension
} from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  ExtensionIdentifier,
  ExtensionType,
  isApplicationScopedExtension,
  TargetPlatform
} from "../../../../platform/extensions/common/extensions.js";
import { isEngineValid } from "../../../../platform/extensions/common/extensionValidator.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { getLocale } from "../../../../platform/languagePacks/common/languagePacks.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  INotificationService,
  NotificationPriority,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { TelemetryTrustedValue } from "../../../../platform/telemetry/common/telemetryUtils.js";
import {
  IUpdateService,
  StateType
} from "../../../../platform/update/common/update.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IURLService
} from "../../../../platform/url/common/url.js";
import { IIgnoredExtensionsManagementService } from "../../../../platform/userDataSync/common/ignoredExtensions.js";
import {
  IUserDataAutoSyncService,
  IUserDataSyncEnablementService,
  SyncResource
} from "../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import {
  ACTIVE_GROUP,
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import {
  DefaultIconPath,
  EnablementState,
  extensionsConfigurationNodeBase,
  IExtensionManagementServerService,
  IWorkbenchExtensionEnablementService,
  IWorkbenchExtensionManagementService
} from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionManifestPropertiesService } from "../../../services/extensions/common/extensionManifestPropertiesService.js";
import {
  IExtensionService,
  toExtension,
  toExtensionDescription
} from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import {
  ILifecycleService,
  LifecyclePhase
} from "../../../services/lifecycle/common/lifecycle.js";
import { ILocaleService } from "../../../services/localization/common/locale.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { ShowCurrentReleaseNotesActionId } from "../../update/common/update.js";
import {
  AutoCheckUpdatesConfigurationKey,
  AutoRestartConfigurationKey,
  AutoUpdateConfigurationKey,
  ExtensionRuntimeActionType,
  ExtensionState,
  HasOutdatedExtensionsContext
} from "../common/extensions.js";
import {
  ExtensionsInput
} from "../common/extensionsInput.js";
let Extension = class {
  constructor(stateProvider, runtimeStateProvider, server, local, _gallery, resourceExtensionInfo, galleryService, telemetryService, logService, fileService, productService) {
    this.stateProvider = stateProvider;
    this.runtimeStateProvider = runtimeStateProvider;
    this.server = server;
    this.local = local;
    this._gallery = _gallery;
    this.resourceExtensionInfo = resourceExtensionInfo;
    this.galleryService = galleryService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.fileService = fileService;
    this.productService = productService;
  }
  enablementState = EnablementState.EnabledGlobally;
  galleryResourcesCache = /* @__PURE__ */ new Map();
  get resourceExtension() {
    if (this.resourceExtensionInfo) {
      return this.resourceExtensionInfo.resourceExtension;
    }
    if (this.local?.isWorkspaceScoped) {
      return {
        type: "resource",
        identifier: this.local.identifier,
        location: this.local.location,
        manifest: this.local.manifest,
        changelogUri: this.local.changelogUrl,
        readmeUri: this.local.readmeUrl
      };
    }
    return void 0;
  }
  get gallery() {
    return this._gallery;
  }
  set gallery(gallery) {
    this._gallery = gallery;
    this.galleryResourcesCache.clear();
  }
  get type() {
    return this.local ? this.local.type : ExtensionType.User;
  }
  get isBuiltin() {
    return this.local ? this.local.isBuiltin : false;
  }
  get isWorkspaceScoped() {
    if (this.local) {
      return this.local.isWorkspaceScoped;
    }
    if (this.resourceExtensionInfo) {
      return this.resourceExtensionInfo.isWorkspaceScoped;
    }
    return false;
  }
  get name() {
    if (this.gallery) {
      return this.gallery.name;
    }
    return this.getManifestFromLocalOrResource()?.name ?? "";
  }
  get displayName() {
    if (this.gallery) {
      return this.gallery.displayName || this.gallery.name;
    }
    return this.getManifestFromLocalOrResource()?.displayName ?? this.name;
  }
  get identifier() {
    if (this.gallery) {
      return this.gallery.identifier;
    }
    if (this.resourceExtension) {
      return this.resourceExtension.identifier;
    }
    return this.local.identifier;
  }
  get uuid() {
    return this.gallery ? this.gallery.identifier.uuid : this.local?.identifier.uuid;
  }
  get publisher() {
    if (this.gallery) {
      return this.gallery.publisher;
    }
    return this.getManifestFromLocalOrResource()?.publisher ?? "";
  }
  get publisherDisplayName() {
    if (this.gallery) {
      return this.gallery.publisherDisplayName || this.gallery.publisher;
    }
    if (this.local?.publisherDisplayName) {
      return this.local.publisherDisplayName;
    }
    return this.publisher;
  }
  get publisherUrl() {
    if (!this.productService.extensionsGallery || !this.gallery) {
      return void 0;
    }
    return resources.joinPath(
      URI.parse(this.productService.extensionsGallery.publisherUrl),
      this.publisher
    );
  }
  get publisherDomain() {
    return this.gallery?.publisherDomain;
  }
  get publisherSponsorLink() {
    return this.gallery?.publisherSponsorLink ? URI.parse(this.gallery.publisherSponsorLink) : void 0;
  }
  get version() {
    return this.local ? this.local.manifest.version : this.latestVersion;
  }
  get pinned() {
    return !!this.local?.pinned;
  }
  get latestVersion() {
    return this.gallery ? this.gallery.version : this.getManifestFromLocalOrResource()?.version ?? "";
  }
  get description() {
    return this.gallery ? this.gallery.description : this.getManifestFromLocalOrResource()?.description ?? "";
  }
  get url() {
    if (!this.productService.extensionsGallery || !this.gallery) {
      return void 0;
    }
    return `${this.productService.extensionsGallery.itemUrl}?itemName=${this.publisher}.${this.name}`;
  }
  get iconUrl() {
    return this.galleryIconUrl || this.resourceExtensionIconUrl || this.localIconUrl || this.defaultIconUrl;
  }
  get iconUrlFallback() {
    return this.galleryIconUrlFallback || this.resourceExtensionIconUrl || this.localIconUrl || this.defaultIconUrl;
  }
  get localIconUrl() {
    if (this.local && this.local.manifest.icon) {
      return FileAccess.uriToBrowserUri(
        resources.joinPath(
          this.local.location,
          this.local.manifest.icon
        )
      ).toString(true);
    }
    return null;
  }
  get resourceExtensionIconUrl() {
    if (this.resourceExtension?.manifest.icon) {
      return FileAccess.uriToBrowserUri(
        resources.joinPath(
          this.resourceExtension.location,
          this.resourceExtension.manifest.icon
        )
      ).toString(true);
    }
    return null;
  }
  get galleryIconUrl() {
    return this.gallery?.assets.icon ? this.gallery.assets.icon.uri : null;
  }
  get galleryIconUrlFallback() {
    return this.gallery?.assets.icon ? this.gallery.assets.icon.fallbackUri : null;
  }
  get defaultIconUrl() {
    if (this.type === ExtensionType.System && this.local) {
      if (this.local.manifest && this.local.manifest.contributes) {
        if (Array.isArray(this.local.manifest.contributes.themes) && this.local.manifest.contributes.themes.length) {
          return FileAccess.asBrowserUri(
            "vs/workbench/contrib/extensions/browser/media/theme-icon.png"
          ).toString(true);
        }
        if (Array.isArray(this.local.manifest.contributes.grammars) && this.local.manifest.contributes.grammars.length) {
          return FileAccess.asBrowserUri(
            "vs/workbench/contrib/extensions/browser/media/language-icon.svg"
          ).toString(true);
        }
      }
    }
    return DefaultIconPath;
  }
  get repository() {
    return this.gallery && this.gallery.assets.repository ? this.gallery.assets.repository.uri : void 0;
  }
  get licenseUrl() {
    return this.gallery && this.gallery.assets.license ? this.gallery.assets.license.uri : void 0;
  }
  get supportUrl() {
    return this.gallery && this.gallery.supportLink ? this.gallery.supportLink : void 0;
  }
  get state() {
    return this.stateProvider(this);
  }
  isMalicious = false;
  deprecationInfo;
  get installCount() {
    return this.gallery ? this.gallery.installCount : void 0;
  }
  get rating() {
    return this.gallery ? this.gallery.rating : void 0;
  }
  get ratingCount() {
    return this.gallery ? this.gallery.ratingCount : void 0;
  }
  get outdated() {
    try {
      if (!this.gallery || !this.local) {
        return false;
      }
      if (this.type === ExtensionType.System && this.productService.quality === "stable") {
        return false;
      }
      if (!this.local.preRelease && this.gallery.properties.isPreReleaseVersion) {
        return false;
      }
      if (semver.gt(this.latestVersion, this.version)) {
        return true;
      }
      if (this.outdatedTargetPlatform) {
        return true;
      }
    } catch (error) {
    }
    return false;
  }
  get outdatedTargetPlatform() {
    return !!this.local && !!this.gallery && ![TargetPlatform.UNDEFINED, TargetPlatform.WEB].includes(
      this.local.targetPlatform
    ) && this.gallery.properties.targetPlatform !== TargetPlatform.WEB && this.local.targetPlatform !== this.gallery.properties.targetPlatform && semver.eq(this.latestVersion, this.version);
  }
  get runtimeState() {
    return this.runtimeStateProvider(this);
  }
  get telemetryData() {
    const { local, gallery } = this;
    if (gallery) {
      return getGalleryExtensionTelemetryData(gallery);
    } else if (local) {
      return getLocalExtensionTelemetryData(local);
    } else {
      return {};
    }
  }
  get preview() {
    return this.local?.manifest.preview ?? this.gallery?.preview ?? false;
  }
  get preRelease() {
    return !!this.local?.preRelease;
  }
  get isPreReleaseVersion() {
    if (this.local) {
      return this.local.isPreReleaseVersion;
    }
    return !!this.gallery?.properties.isPreReleaseVersion;
  }
  _extensionEnabledWithPreRelease;
  get hasPreReleaseVersion() {
    return !!this.gallery?.hasPreReleaseVersion || !!this.local?.hasPreReleaseVersion || !!this._extensionEnabledWithPreRelease;
  }
  get hasReleaseVersion() {
    return !!this.resourceExtension || !!this.gallery?.hasReleaseVersion;
  }
  getLocal() {
    return this.local && !this.outdated ? this.local : void 0;
  }
  async getManifest(token) {
    const local = this.getLocal();
    if (local) {
      return local.manifest;
    }
    if (this.gallery) {
      return this.getGalleryManifest(token);
    }
    if (this.resourceExtension) {
      return this.resourceExtension.manifest;
    }
    return null;
  }
  async getGalleryManifest(token = CancellationToken.None) {
    if (this.gallery) {
      let cache = this.galleryResourcesCache.get("manifest");
      if (!cache) {
        if (this.gallery.assets.manifest) {
          this.galleryResourcesCache.set(
            "manifest",
            cache = this.galleryService.getManifest(this.gallery, token).catch((e) => {
              this.galleryResourcesCache.delete("manifest");
              throw e;
            })
          );
        } else {
          this.logService.error(
            nls.localize(
              "Manifest is not found",
              "Manifest is not found"
            ),
            this.identifier.id
          );
        }
      }
      return cache;
    }
    return null;
  }
  hasReadme() {
    if (this.local && this.local.readmeUrl) {
      return true;
    }
    if (this.gallery && this.gallery.assets.readme) {
      return true;
    }
    if (this.resourceExtension?.readmeUri) {
      return true;
    }
    return this.type === ExtensionType.System;
  }
  async getReadme(token) {
    const local = this.getLocal();
    if (local?.readmeUrl) {
      const content = await this.fileService.readFile(local.readmeUrl);
      return content.value.toString();
    }
    if (this.gallery) {
      if (this.gallery.assets.readme) {
        return this.galleryService.getReadme(this.gallery, token);
      }
      this.telemetryService.publicLog(
        "extensions:NotFoundReadMe",
        this.telemetryData
      );
    }
    if (this.type === ExtensionType.System) {
      return Promise.resolve(`# ${this.displayName || this.name}
**Notice:** This extension is bundled with Visual Studio Code. It can be disabled but not uninstalled.
## Features
${this.description}
`);
    }
    if (this.resourceExtension?.readmeUri) {
      const content = await this.fileService.readFile(
        this.resourceExtension?.readmeUri
      );
      return content.value.toString();
    }
    return Promise.reject(new Error("not available"));
  }
  hasChangelog() {
    if (this.local && this.local.changelogUrl) {
      return true;
    }
    if (this.gallery && this.gallery.assets.changelog) {
      return true;
    }
    return this.type === ExtensionType.System;
  }
  async getChangelog(token) {
    const local = this.getLocal();
    if (local?.changelogUrl) {
      const content = await this.fileService.readFile(local.changelogUrl);
      return content.value.toString();
    }
    if (this.gallery?.assets.changelog) {
      return this.galleryService.getChangelog(this.gallery, token);
    }
    if (this.type === ExtensionType.System) {
      return Promise.resolve(
        `Please check the [VS Code Release Notes](command:${ShowCurrentReleaseNotesActionId}) for changes to the built-in extensions.`
      );
    }
    return Promise.reject(new Error("not available"));
  }
  get categories() {
    const { local, gallery, resourceExtension } = this;
    if (local && local.manifest.categories && !this.outdated) {
      return local.manifest.categories;
    }
    if (gallery) {
      return gallery.categories;
    }
    if (resourceExtension) {
      return resourceExtension.manifest.categories ?? [];
    }
    return [];
  }
  get tags() {
    const { gallery } = this;
    if (gallery) {
      return gallery.tags.filter((tag) => !tag.startsWith("_"));
    }
    return [];
  }
  get dependencies() {
    const { local, gallery, resourceExtension } = this;
    if (local && local.manifest.extensionDependencies && !this.outdated) {
      return local.manifest.extensionDependencies;
    }
    if (gallery) {
      return gallery.properties.dependencies || [];
    }
    if (resourceExtension) {
      return resourceExtension.manifest.extensionDependencies || [];
    }
    return [];
  }
  get extensionPack() {
    const { local, gallery, resourceExtension } = this;
    if (local && local.manifest.extensionPack && !this.outdated) {
      return local.manifest.extensionPack;
    }
    if (gallery) {
      return gallery.properties.extensionPack || [];
    }
    if (resourceExtension) {
      return resourceExtension.manifest.extensionPack || [];
    }
    return [];
  }
  setExtensionsControlManifest(extensionsControlManifest) {
    this.isMalicious = extensionsControlManifest.malicious.some(
      (identifier) => areSameExtensions(this.identifier, identifier)
    );
    this.deprecationInfo = extensionsControlManifest.deprecated ? extensionsControlManifest.deprecated[this.identifier.id.toLowerCase()] : void 0;
    this._extensionEnabledWithPreRelease = extensionsControlManifest?.extensionsEnabledWithPreRelease?.includes(
      this.identifier.id.toLowerCase()
    );
  }
  getManifestFromLocalOrResource() {
    if (this.local) {
      return this.local.manifest;
    }
    if (this.resourceExtension) {
      return this.resourceExtension.manifest;
    }
    return null;
  }
};
Extension = __decorateClass([
  __decorateParam(6, IExtensionGalleryService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IFileService),
  __decorateParam(10, IProductService)
], Extension);
const EXTENSIONS_AUTO_UPDATE_KEY = "extensions.autoUpdate";
const EXTENSIONS_DONOT_AUTO_UPDATE_KEY = "extensions.donotAutoUpdate";
let Extensions = class extends Disposable {
  constructor(server, stateProvider, runtimeStateProvider, isWorkspaceServer, galleryService, extensionEnablementService, workbenchExtensionManagementService, userDataProfileService, telemetryService, instantiationService) {
    super();
    this.server = server;
    this.stateProvider = stateProvider;
    this.runtimeStateProvider = runtimeStateProvider;
    this.isWorkspaceServer = isWorkspaceServer;
    this.galleryService = galleryService;
    this.extensionEnablementService = extensionEnablementService;
    this.workbenchExtensionManagementService = workbenchExtensionManagementService;
    this.userDataProfileService = userDataProfileService;
    this.telemetryService = telemetryService;
    this.instantiationService = instantiationService;
    this._register(
      server.extensionManagementService.onInstallExtension(
        (e) => this.onInstallExtension(e)
      )
    );
    this._register(
      server.extensionManagementService.onDidInstallExtensions(
        (e) => this.onDidInstallExtensions(e)
      )
    );
    this._register(
      server.extensionManagementService.onUninstallExtension(
        (e) => this.onUninstallExtension(e.identifier)
      )
    );
    this._register(
      server.extensionManagementService.onDidUninstallExtension(
        (e) => this.onDidUninstallExtension(e)
      )
    );
    this._register(
      server.extensionManagementService.onDidUpdateExtensionMetadata(
        (e) => this.onDidUpdateExtensionMetadata(e.local)
      )
    );
    this._register(
      server.extensionManagementService.onDidChangeProfile(
        () => this.reset()
      )
    );
    this._register(
      extensionEnablementService.onEnablementChanged(
        (e) => this.onEnablementChanged(e)
      )
    );
    this._register(
      Event.any(
        this.onChange,
        this.onReset
      )(() => this._local = void 0)
    );
    if (this.isWorkspaceServer) {
      this._register(
        this.workbenchExtensionManagementService.onInstallExtension(
          (e) => {
            if (e.workspaceScoped) {
              this.onInstallExtension(e);
            }
          }
        )
      );
      this._register(
        this.workbenchExtensionManagementService.onDidInstallExtensions(
          (e) => {
            const result = e.filter((e2) => e2.workspaceScoped);
            if (result.length) {
              this.onDidInstallExtensions(result);
            }
          }
        )
      );
      this._register(
        this.workbenchExtensionManagementService.onUninstallExtension(
          (e) => {
            if (e.workspaceScoped) {
              this.onUninstallExtension(e.identifier);
            }
          }
        )
      );
      this._register(
        this.workbenchExtensionManagementService.onDidUninstallExtension(
          (e) => {
            if (e.workspaceScoped) {
              this.onDidUninstallExtension(e);
            }
          }
        )
      );
    }
  }
  _onChange = this._register(
    new Emitter()
  );
  get onChange() {
    return this._onChange.event;
  }
  _onReset = this._register(new Emitter());
  get onReset() {
    return this._onReset.event;
  }
  installing = [];
  uninstalling = [];
  installed = [];
  _local;
  get local() {
    if (!this._local) {
      this._local = [];
      for (const extension of this.installed) {
        this._local.push(extension);
      }
      for (const extension of this.installing) {
        if (!this.installed.some(
          (installed) => areSameExtensions(
            installed.identifier,
            extension.identifier
          )
        )) {
          this._local.push(extension);
        }
      }
    }
    return this._local;
  }
  async queryInstalled(productVersion) {
    await this.fetchInstalledExtensions(productVersion);
    this._onChange.fire(void 0);
    return this.local;
  }
  async syncInstalledExtensionsWithGallery(galleryExtensions, productVersion) {
    const extensions = await this.mapInstalledExtensionWithCompatibleGalleryExtension(
      galleryExtensions,
      productVersion
    );
    for (const [extension, gallery] of extensions) {
      if (extension.local && !extension.local.identifier.uuid) {
        extension.local = await this.updateMetadata(
          extension.local,
          gallery
        );
      }
      if (!extension.gallery || extension.gallery.version !== gallery.version || extension.gallery.properties.targetPlatform !== gallery.properties.targetPlatform) {
        extension.gallery = gallery;
        this._onChange.fire({ extension });
      }
    }
  }
  async mapInstalledExtensionWithCompatibleGalleryExtension(galleryExtensions, productVersion) {
    const mappedExtensions = this.mapInstalledExtensionWithGalleryExtension(galleryExtensions);
    const targetPlatform = await this.server.extensionManagementService.getTargetPlatform();
    const compatibleGalleryExtensions = [];
    const compatibleGalleryExtensionsToFetch = [];
    await Promise.allSettled(
      mappedExtensions.map(async ([extension, gallery]) => {
        if (extension.local) {
          if (await this.galleryService.isExtensionCompatible(
            gallery,
            extension.local.preRelease,
            targetPlatform,
            productVersion
          )) {
            compatibleGalleryExtensions.push(gallery);
          } else {
            compatibleGalleryExtensionsToFetch.push({
              ...extension.local.identifier,
              preRelease: extension.local.preRelease
            });
          }
        }
      })
    );
    if (compatibleGalleryExtensionsToFetch.length) {
      const result = await this.galleryService.getExtensions(
        compatibleGalleryExtensionsToFetch,
        {
          targetPlatform,
          compatible: true,
          queryAllVersions: true,
          productVersion
        },
        CancellationToken.None
      );
      compatibleGalleryExtensions.push(...result);
    }
    return this.mapInstalledExtensionWithGalleryExtension(
      compatibleGalleryExtensions
    );
  }
  mapInstalledExtensionWithGalleryExtension(galleryExtensions) {
    const mappedExtensions = [];
    const byUUID = /* @__PURE__ */ new Map(), byID = /* @__PURE__ */ new Map();
    for (const gallery of galleryExtensions) {
      byUUID.set(gallery.identifier.uuid, gallery);
      byID.set(gallery.identifier.id.toLowerCase(), gallery);
    }
    for (const installed of this.installed) {
      if (installed.uuid) {
        const gallery = byUUID.get(installed.uuid);
        if (gallery) {
          mappedExtensions.push([installed, gallery]);
          continue;
        }
      }
      if (installed.local?.source !== "resource") {
        const gallery = byID.get(installed.identifier.id.toLowerCase());
        if (gallery) {
          mappedExtensions.push([installed, gallery]);
        }
      }
    }
    return mappedExtensions;
  }
  async updateMetadata(localExtension, gallery) {
    let isPreReleaseVersion = false;
    if (localExtension.manifest.version !== gallery.version) {
      this.telemetryService.publicLog2("galleryService:updateMetadata");
      const galleryWithLocalVersion = (await this.galleryService.getExtensions(
        [
          {
            ...localExtension.identifier,
            version: localExtension.manifest.version
          }
        ],
        CancellationToken.None
      ))[0];
      isPreReleaseVersion = !!galleryWithLocalVersion?.properties?.isPreReleaseVersion;
    }
    return this.server.extensionManagementService.updateMetadata(
      localExtension,
      {
        id: gallery.identifier.uuid,
        publisherDisplayName: gallery.publisherDisplayName,
        publisherId: gallery.publisherId,
        isPreReleaseVersion
      },
      this.userDataProfileService.currentProfile.extensionsResource
    );
  }
  canInstall(galleryExtension) {
    return this.server.extensionManagementService.canInstall(
      galleryExtension
    );
  }
  onInstallExtension(event) {
    const { source } = event;
    if (source && !URI.isUri(source)) {
      const extension = this.installed.find(
        (e) => areSameExtensions(e.identifier, source.identifier)
      ) ?? this.instantiationService.createInstance(
        Extension,
        this.stateProvider,
        this.runtimeStateProvider,
        this.server,
        void 0,
        source,
        void 0
      );
      this.installing.push(extension);
      this._onChange.fire({ extension });
    }
  }
  async fetchInstalledExtensions(productVersion) {
    const extensionsControlManifest = await this.server.extensionManagementService.getExtensionsControlManifest();
    const all = await this.server.extensionManagementService.getInstalled(
      void 0,
      void 0,
      productVersion
    );
    if (this.isWorkspaceServer) {
      all.push(
        ...await this.workbenchExtensionManagementService.getInstalledWorkspaceExtensions(
          true
        )
      );
    }
    const installed = groupByExtension(all, (r) => r.identifier).reduce(
      (result, extensions) => {
        if (extensions.length === 1) {
          result.push(extensions[0]);
        } else {
          let workspaceExtension, userExtension, systemExtension;
          for (const extension2 of extensions) {
            if (extension2.isWorkspaceScoped) {
              workspaceExtension = extension2;
            } else if (extension2.type === ExtensionType.User) {
              userExtension = extension2;
            } else {
              systemExtension = extension2;
            }
          }
          const extension = workspaceExtension ?? userExtension ?? systemExtension;
          if (extension) {
            result.push(extension);
          }
        }
        return result;
      },
      []
    );
    const byId = index(
      this.installed,
      (e) => e.local ? e.local.identifier.id : e.identifier.id
    );
    this.installed = installed.map((local) => {
      const extension = byId[local.identifier.id] || this.instantiationService.createInstance(
        Extension,
        this.stateProvider,
        this.runtimeStateProvider,
        this.server,
        local,
        void 0,
        void 0
      );
      extension.local = local;
      extension.enablementState = this.extensionEnablementService.getEnablementState(local);
      extension.setExtensionsControlManifest(extensionsControlManifest);
      return extension;
    });
  }
  async reset() {
    this.installed = [];
    this.installing = [];
    this.uninstalling = [];
    await this.fetchInstalledExtensions();
    this._onReset.fire();
  }
  async onDidInstallExtensions(results) {
    for (const event of results) {
      const { local, source } = event;
      const gallery = source && !URI.isUri(source) ? source : void 0;
      const location = source && URI.isUri(source) ? source : void 0;
      const installingExtension = gallery ? this.installing.filter(
        (e) => areSameExtensions(e.identifier, gallery.identifier)
      )[0] : null;
      this.installing = installingExtension ? this.installing.filter((e) => e !== installingExtension) : this.installing;
      let extension = installingExtension ? installingExtension : location || local ? this.instantiationService.createInstance(
        Extension,
        this.stateProvider,
        this.runtimeStateProvider,
        this.server,
        local,
        void 0,
        void 0
      ) : void 0;
      if (extension) {
        if (local) {
          const installed = this.installed.filter(
            (e) => areSameExtensions(e.identifier, extension.identifier)
          )[0];
          if (installed) {
            extension = installed;
          } else {
            this.installed.push(extension);
          }
          extension.local = local;
          if (!extension.gallery) {
            extension.gallery = gallery;
          }
          extension.setExtensionsControlManifest(
            await this.server.extensionManagementService.getExtensionsControlManifest()
          );
          extension.enablementState = this.extensionEnablementService.getEnablementState(
            local
          );
        }
      }
      this._onChange.fire(
        !local || !extension ? void 0 : { extension, operation: event.operation }
      );
      if (extension && extension.local && !extension.gallery && extension.local.source !== "resource") {
        await this.syncInstalledExtensionWithGallery(extension);
      }
    }
  }
  async onDidUpdateExtensionMetadata(local) {
    const extension = this.installed.find(
      (e) => areSameExtensions(e.identifier, local.identifier)
    );
    if (extension?.local) {
      const hasChanged = extension.local.pinned !== local.pinned || extension.local.preRelease !== local.preRelease;
      extension.local = local;
      if (hasChanged) {
        this._onChange.fire({ extension });
      }
    }
  }
  async syncInstalledExtensionWithGallery(extension) {
    if (!this.galleryService.isEnabled()) {
      return;
    }
    this.telemetryService.publicLog2("galleryService:matchInstalledExtension");
    const [compatible] = await this.galleryService.getExtensions(
      [
        {
          ...extension.identifier,
          preRelease: extension.local?.preRelease
        }
      ],
      {
        compatible: true,
        targetPlatform: await this.server.extensionManagementService.getTargetPlatform()
      },
      CancellationToken.None
    );
    if (compatible) {
      extension.gallery = compatible;
      this._onChange.fire({ extension });
    }
  }
  onUninstallExtension(identifier) {
    const extension = this.installed.filter(
      (e) => areSameExtensions(e.identifier, identifier)
    )[0];
    if (extension) {
      const uninstalling = this.uninstalling.filter(
        (e) => areSameExtensions(e.identifier, identifier)
      )[0] || extension;
      this.uninstalling = [
        uninstalling,
        ...this.uninstalling.filter(
          (e) => !areSameExtensions(e.identifier, identifier)
        )
      ];
      this._onChange.fire(
        uninstalling ? { extension: uninstalling } : void 0
      );
    }
  }
  onDidUninstallExtension({
    identifier,
    error
  }) {
    const uninstalled = this.uninstalling.find(
      (e) => areSameExtensions(e.identifier, identifier)
    ) || this.installed.find(
      (e) => areSameExtensions(e.identifier, identifier)
    );
    this.uninstalling = this.uninstalling.filter(
      (e) => !areSameExtensions(e.identifier, identifier)
    );
    if (!error) {
      this.installed = this.installed.filter(
        (e) => !areSameExtensions(e.identifier, identifier)
      );
    }
    if (uninstalled) {
      this._onChange.fire({ extension: uninstalled });
    }
  }
  onEnablementChanged(platformExtensions) {
    const extensions = this.local.filter(
      (e) => platformExtensions.some(
        (p) => areSameExtensions(e.identifier, p.identifier)
      )
    );
    for (const extension of extensions) {
      if (extension.local) {
        const enablementState = this.extensionEnablementService.getEnablementState(
          extension.local
        );
        if (enablementState !== extension.enablementState) {
          extension.enablementState = enablementState;
          this._onChange.fire({ extension });
        }
      }
    }
  }
  getExtensionState(extension) {
    if (extension.gallery && this.installing.some(
      (e) => !!e.gallery && areSameExtensions(
        e.gallery.identifier,
        extension.gallery.identifier
      )
    )) {
      return ExtensionState.Installing;
    }
    if (this.uninstalling.some(
      (e) => areSameExtensions(e.identifier, extension.identifier)
    )) {
      return ExtensionState.Uninstalling;
    }
    const local = this.installed.filter(
      (e) => e === extension || e.gallery && extension.gallery && areSameExtensions(
        e.gallery.identifier,
        extension.gallery.identifier
      )
    )[0];
    return local ? ExtensionState.Installed : ExtensionState.Uninstalled;
  }
};
Extensions = __decorateClass([
  __decorateParam(4, IExtensionGalleryService),
  __decorateParam(5, IWorkbenchExtensionEnablementService),
  __decorateParam(6, IWorkbenchExtensionManagementService),
  __decorateParam(7, IUserDataProfileService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IInstantiationService)
], Extensions);
let ExtensionsWorkbenchService = class extends Disposable {
  constructor(instantiationService, editorService, extensionManagementService, galleryService, configurationService, telemetryService, notificationService, urlService, extensionEnablementService, hostService, progressService, extensionManagementServerService, languageService, extensionsSyncManagementService, userDataAutoSyncService, productService, contextKeyService, extensionManifestPropertiesService, logService, extensionService, localeService, lifecycleService, fileService, userDataProfileService, storageService, dialogService, userDataSyncEnablementService, updateService, uriIdentityService, workspaceContextService) {
    super();
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.extensionManagementService = extensionManagementService;
    this.galleryService = galleryService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.extensionEnablementService = extensionEnablementService;
    this.hostService = hostService;
    this.progressService = progressService;
    this.extensionManagementServerService = extensionManagementServerService;
    this.languageService = languageService;
    this.extensionsSyncManagementService = extensionsSyncManagementService;
    this.userDataAutoSyncService = userDataAutoSyncService;
    this.productService = productService;
    this.extensionManifestPropertiesService = extensionManifestPropertiesService;
    this.logService = logService;
    this.extensionService = extensionService;
    this.localeService = localeService;
    this.lifecycleService = lifecycleService;
    this.fileService = fileService;
    this.userDataProfileService = userDataProfileService;
    this.storageService = storageService;
    this.dialogService = dialogService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.updateService = updateService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceContextService = workspaceContextService;
    const preferPreReleasesValue = configurationService.getValue(
      "_extensions.preferPreReleases"
    );
    if (!isUndefined(preferPreReleasesValue)) {
      this.preferPreReleases = !!preferPreReleasesValue;
    }
    this.hasOutdatedExtensionsContextKey = HasOutdatedExtensionsContext.bindTo(contextKeyService);
    if (extensionManagementServerService.localExtensionManagementServer) {
      this.localExtensions = this._register(
        instantiationService.createInstance(
          Extensions,
          extensionManagementServerService.localExtensionManagementServer,
          (ext) => this.getExtensionState(ext),
          (ext) => this.getRuntimeState(ext),
          !extensionManagementServerService.remoteExtensionManagementServer
        )
      );
      this._register(
        this.localExtensions.onChange(
          (e) => this.onDidChangeExtensions(e?.extension)
        )
      );
      this._register(this.localExtensions.onReset((e) => this.reset()));
      this.extensionsServers.push(this.localExtensions);
    }
    if (extensionManagementServerService.remoteExtensionManagementServer) {
      this.remoteExtensions = this._register(
        instantiationService.createInstance(
          Extensions,
          extensionManagementServerService.remoteExtensionManagementServer,
          (ext) => this.getExtensionState(ext),
          (ext) => this.getRuntimeState(ext),
          true
        )
      );
      this._register(
        this.remoteExtensions.onChange(
          (e) => this.onDidChangeExtensions(e?.extension)
        )
      );
      this._register(this.remoteExtensions.onReset((e) => this.reset()));
      this.extensionsServers.push(this.remoteExtensions);
    }
    if (extensionManagementServerService.webExtensionManagementServer) {
      this.webExtensions = this._register(
        instantiationService.createInstance(
          Extensions,
          extensionManagementServerService.webExtensionManagementServer,
          (ext) => this.getExtensionState(ext),
          (ext) => this.getRuntimeState(ext),
          !(extensionManagementServerService.remoteExtensionManagementServer || extensionManagementServerService.localExtensionManagementServer)
        )
      );
      this._register(
        this.webExtensions.onChange(
          (e) => this.onDidChangeExtensions(e?.extension)
        )
      );
      this._register(this.webExtensions.onReset((e) => this.reset()));
      this.extensionsServers.push(this.webExtensions);
    }
    this.updatesCheckDelayer = new ThrottledDelayer(
      ExtensionsWorkbenchService.UpdatesCheckInterval
    );
    this.autoUpdateDelayer = new ThrottledDelayer(1e3);
    this._register(
      toDisposable(() => {
        this.updatesCheckDelayer.cancel();
        this.autoUpdateDelayer.cancel();
      })
    );
    urlService.registerHandler(this);
    if (this.productService.quality !== "stable") {
      this.registerAutoRestartConfig();
    }
    this.whenInitialized = this.initialize();
  }
  static UpdatesCheckInterval = 1e3 * 60 * 60 * 12;
  hasOutdatedExtensionsContextKey;
  localExtensions = null;
  remoteExtensions = null;
  webExtensions = null;
  extensionsServers = [];
  updatesCheckDelayer;
  autoUpdateDelayer;
  _onChange = new Emitter();
  get onChange() {
    return this._onChange.event;
  }
  _onReset = new Emitter();
  get onReset() {
    return this._onReset.event;
  }
  preferPreReleases = this.productService.quality !== "stable";
  installing = [];
  tasksInProgress = [];
  whenInitialized;
  registerAutoRestartConfig() {
    Registry.as(
      ConfigurationExtensions.Configuration
    ).registerConfiguration({
      ...extensionsConfigurationNodeBase,
      properties: {
        [AutoRestartConfigurationKey]: {
          type: "boolean",
          description: nls.localize(
            "autoRestart",
            "If activated, extensions will automatically restart following an update if the window is not in focus. There can be a data loss if you have open Notebooks or Custom Editors."
          ),
          default: false
        }
      }
    });
  }
  async initialize() {
    await Promise.all([
      this.queryLocal(),
      this.extensionService.whenInstalledExtensionsRegistered()
    ]);
    if (this._store.isDisposed) {
      return;
    }
    this.onDidChangeRunningExtensions(this.extensionService.extensions, []);
    this._register(
      this.extensionService.onDidChangeExtensions(
        ({ added, removed }) => this.onDidChangeRunningExtensions(added, removed)
      )
    );
    await this.lifecycleService.when(LifecyclePhase.Eventually);
    if (this._store.isDisposed) {
      return;
    }
    this.initializeAutoUpdate();
    this.reportInstalledExtensionsTelemetry();
    this._register(
      Event.debounce(
        this.onChange,
        () => void 0,
        100
      )(() => this.reportProgressFromOtherSources())
    );
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.APPLICATION,
        EXTENSIONS_AUTO_UPDATE_KEY,
        this._store
      )((e) => this.onDidSelectedExtensionToAutoUpdateValueChange())
    );
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.APPLICATION,
        EXTENSIONS_DONOT_AUTO_UPDATE_KEY,
        this._store
      )((e) => this.onDidSelectedExtensionToAutoUpdateValueChange())
    );
  }
  initializeAutoUpdate() {
    let autoUpdateValue = this.getAutoUpdateValue();
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(AutoUpdateConfigurationKey)) {
          const wasAutoUpdateEnabled = autoUpdateValue !== false;
          autoUpdateValue = this.getAutoUpdateValue();
          const isAutoUpdateEnabled = this.isAutoUpdateEnabled();
          if (wasAutoUpdateEnabled !== isAutoUpdateEnabled) {
            this.setEnabledAutoUpdateExtensions([]);
            this.setDisabledAutoUpdateExtensions([]);
            this._onChange.fire(void 0);
            this.updateExtensionsPinnedState(!isAutoUpdateEnabled);
          }
          if (isAutoUpdateEnabled) {
            this.eventuallyAutoUpdateExtensions();
          }
        }
        if (e.affectsConfiguration(AutoCheckUpdatesConfigurationKey)) {
          if (this.isAutoCheckUpdatesEnabled()) {
            this.checkForUpdates();
          }
        }
      })
    );
    this._register(
      this.extensionEnablementService.onEnablementChanged(
        (platformExtensions) => {
          if (this.getAutoUpdateValue() === "onlyEnabledExtensions" && platformExtensions.some(
            (e) => this.extensionEnablementService.isEnabled(e)
          )) {
            this.checkForUpdates();
          }
        }
      )
    );
    this._register(
      Event.debounce(
        this.onChange,
        () => void 0,
        100
      )(
        () => this.hasOutdatedExtensionsContextKey.set(
          this.outdated.length > 0
        )
      )
    );
    this._register(
      this.updateService.onStateChange((e) => {
        if (e.type === StateType.CheckingForUpdates && e.explicit || e.type === StateType.AvailableForDownload || e.type === StateType.Downloaded) {
          this.telemetryService.publicLog2("extensions:updatecheckonproductupdate");
          if (this.isAutoCheckUpdatesEnabled()) {
            this.checkForUpdates();
          }
        }
      })
    );
    this.hasOutdatedExtensionsContextKey.set(this.outdated.length > 0);
    this.eventuallyCheckForUpdates(true);
    if (isWeb) {
      this.syncPinnedBuiltinExtensions();
      if (!this.isAutoUpdateEnabled()) {
        this.autoUpdateBuiltinExtensions();
      }
    }
    this.registerAutoRestartListener();
    this._register(
      this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(AutoRestartConfigurationKey)) {
          this.registerAutoRestartListener();
        }
      })
    );
  }
  isAutoUpdateEnabled() {
    return this.getAutoUpdateValue() !== false;
  }
  getAutoUpdateValue() {
    const autoUpdate = this.configurationService.getValue(
      AutoUpdateConfigurationKey
    );
    if (autoUpdate === "onlySelectedExtensions") {
      return false;
    }
    return isBoolean(autoUpdate) || autoUpdate === "onlyEnabledExtensions" ? autoUpdate : true;
  }
  async updateAutoUpdateValue(value) {
    const wasEnabled = this.isAutoUpdateEnabled();
    const isEnabled = value !== false;
    if (wasEnabled !== isEnabled) {
      const result = await this.dialogService.confirm({
        title: nls.localize(
          "confirmEnableDisableAutoUpdate",
          "Auto Update Extensions"
        ),
        message: isEnabled ? nls.localize(
          "confirmEnableAutoUpdate",
          "Do you want to enable auto update for all extensions?"
        ) : nls.localize(
          "confirmDisableAutoUpdate",
          "Do you want to disable auto update for all extensions?"
        ),
        detail: nls.localize(
          "confirmEnableDisableAutoUpdateDetail",
          "This will reset any auto update settings you have set for individual extensions."
        )
      });
      if (!result.confirmed) {
        return;
      }
    }
    await this.configurationService.updateValue(
      AutoUpdateConfigurationKey,
      value
    );
  }
  autoRestartListenerDisposable = this._register(
    new MutableDisposable()
  );
  registerAutoRestartListener() {
    this.autoRestartListenerDisposable.value = void 0;
    if (this.configurationService.getValue(AutoRestartConfigurationKey) === true) {
      this.autoRestartListenerDisposable.value = this.hostService.onDidChangeFocus((focus) => {
        if (!focus && this.configurationService.getValue(
          AutoRestartConfigurationKey
        ) === true) {
          this.updateRunningExtensions(true);
        }
      });
    }
  }
  reportInstalledExtensionsTelemetry() {
    const extensionIds = this.installed.filter(
      (extension) => !extension.isBuiltin && (extension.enablementState === EnablementState.EnabledWorkspace || extension.enablementState === EnablementState.EnabledGlobally)
    ).map(
      (extension) => ExtensionIdentifier.toKey(extension.identifier.id)
    );
    this.telemetryService.publicLog2("installedExtensions", {
      extensionIds: new TelemetryTrustedValue(extensionIds.join(";")),
      count: extensionIds.length
    });
  }
  async onDidChangeRunningExtensions(added, removed) {
    const changedExtensions = [];
    const extensionsToFetch = [];
    for (const desc of added) {
      const extension = this.installed.find(
        (e) => areSameExtensions(
          { id: desc.identifier.value, uuid: desc.uuid },
          e.identifier
        )
      );
      if (extension) {
        changedExtensions.push(extension);
      } else {
        extensionsToFetch.push(desc);
      }
    }
    const workspaceExtensions = [];
    for (const desc of removed) {
      if (this.workspaceContextService.isInsideWorkspace(
        desc.extensionLocation
      )) {
        workspaceExtensions.push(desc);
      } else {
        extensionsToFetch.push(desc);
      }
    }
    if (extensionsToFetch.length) {
      const extensions = await this.getExtensions(
        extensionsToFetch.map((e) => ({
          id: e.identifier.value,
          uuid: e.uuid
        })),
        CancellationToken.None
      );
      changedExtensions.push(...extensions);
    }
    if (workspaceExtensions.length) {
      const extensions = await this.getResourceExtensions(
        workspaceExtensions.map((e) => e.extensionLocation),
        true
      );
      changedExtensions.push(...extensions);
    }
    for (const changedExtension of changedExtensions) {
      this._onChange.fire(changedExtension);
    }
  }
  updateExtensionsPinnedState(pinned) {
    return this.progressService.withProgress(
      {
        location: ProgressLocation.Extensions,
        title: nls.localize(
          "updatingExtensions",
          "Updating Extensions Auto Update State"
        )
      },
      () => this.extensionManagementService.resetPinnedStateForAllUserExtensions(
        pinned
      )
    );
  }
  reset() {
    for (const task of this.tasksInProgress) {
      task.cancel();
    }
    this.tasksInProgress = [];
    this.installing = [];
    this.onDidChangeExtensions();
    this._onReset.fire();
  }
  onDidChangeExtensions(extension) {
    this._installed = void 0;
    this._local = void 0;
    this._onChange.fire(extension);
  }
  _local;
  get local() {
    if (!this._local) {
      if (this.extensionsServers.length === 1) {
        this._local = this.installed;
      } else {
        this._local = [];
        const byId = groupByExtension(
          this.installed,
          (r) => r.identifier
        );
        for (const extensions of byId) {
          this._local.push(this.getPrimaryExtension(extensions));
        }
      }
    }
    return this._local;
  }
  _installed;
  get installed() {
    if (!this._installed) {
      this._installed = [];
      for (const extensions of this.extensionsServers) {
        for (const extension of extensions.local) {
          this._installed.push(extension);
        }
      }
    }
    return this._installed;
  }
  get outdated() {
    return this.installed.filter(
      (e) => e.outdated && e.local && e.state === ExtensionState.Installed
    );
  }
  async queryLocal(server) {
    if (server) {
      if (this.localExtensions && this.extensionManagementServerService.localExtensionManagementServer === server) {
        return this.localExtensions.queryInstalled(
          this.getProductVersion()
        );
      }
      if (this.remoteExtensions && this.extensionManagementServerService.remoteExtensionManagementServer === server) {
        return this.remoteExtensions.queryInstalled(
          this.getProductVersion()
        );
      }
      if (this.webExtensions && this.extensionManagementServerService.webExtensionManagementServer === server) {
        return this.webExtensions.queryInstalled(
          this.getProductVersion()
        );
      }
    }
    if (this.localExtensions) {
      try {
        await this.localExtensions.queryInstalled(
          this.getProductVersion()
        );
      } catch (error) {
        this.logService.error(error);
      }
    }
    if (this.remoteExtensions) {
      try {
        await this.remoteExtensions.queryInstalled(
          this.getProductVersion()
        );
      } catch (error) {
        this.logService.error(error);
      }
    }
    if (this.webExtensions) {
      try {
        await this.webExtensions.queryInstalled(
          this.getProductVersion()
        );
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.local;
  }
  async queryGallery(arg1, arg2) {
    if (!this.galleryService.isEnabled()) {
      return singlePagePager([]);
    }
    const options = CancellationToken.isCancellationToken(
      arg1
    ) ? {} : arg1;
    const token = CancellationToken.isCancellationToken(
      arg1
    ) ? arg1 : arg2;
    options.text = options.text ? this.resolveQueryText(options.text) : options.text;
    options.includePreRelease = isUndefined(options.includePreRelease) ? this.preferPreReleases : options.includePreRelease;
    const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
    const pager = await this.galleryService.query(options, token);
    this.syncInstalledExtensionsWithGallery(pager.firstPage);
    return {
      firstPage: pager.firstPage.map(
        (gallery) => this.fromGallery(gallery, extensionsControlManifest)
      ),
      total: pager.total,
      pageSize: pager.pageSize,
      getPage: async (pageIndex, token2) => {
        const page = await pager.getPage(pageIndex, token2);
        this.syncInstalledExtensionsWithGallery(page);
        return page.map(
          (gallery) => this.fromGallery(gallery, extensionsControlManifest)
        );
      }
    };
  }
  async getExtensions(extensionInfos, arg1, arg2) {
    if (!this.galleryService.isEnabled()) {
      return [];
    }
    extensionInfos.forEach(
      (e) => e.preRelease = e.preRelease ?? this.preferPreReleases
    );
    const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
    const galleryExtensions = await this.galleryService.getExtensions(
      extensionInfos,
      arg1,
      arg2
    );
    this.syncInstalledExtensionsWithGallery(galleryExtensions);
    return galleryExtensions.map(
      (gallery) => this.fromGallery(gallery, extensionsControlManifest)
    );
  }
  async getResourceExtensions(locations, isWorkspaceScoped) {
    const resourceExtensions = await this.extensionManagementService.getExtensions(locations);
    return resourceExtensions.map(
      (resourceExtension) => this.getInstalledExtensionMatchingLocation(
        resourceExtension.location
      ) ?? this.instantiationService.createInstance(
        Extension,
        (ext) => this.getExtensionState(ext),
        (ext) => this.getRuntimeState(ext),
        void 0,
        void 0,
        void 0,
        { resourceExtension, isWorkspaceScoped }
      )
    );
  }
  resolveQueryText(text) {
    text = text.replace(/@web/g, `tag:"${WEB_EXTENSION_TAG}"`);
    const extensionRegex = /\bext:([^\s]+)\b/g;
    if (extensionRegex.test(text)) {
      text = text.replace(extensionRegex, (m, ext) => {
        const lookup = this.productService.extensionKeywords || {};
        const keywords = lookup[ext] || [];
        const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(
          URI.file(`.${ext}`)
        );
        const languageName = languageId && this.languageService.getLanguageName(languageId);
        const languageTag = languageName ? ` tag:"${languageName}"` : "";
        return `tag:"__ext_${ext}" tag:"__ext_.${ext}" ${keywords.map((tag) => `tag:"${tag}"`).join(" ")}${languageTag} tag:"${ext}"`;
      });
    }
    return text.substr(0, 350);
  }
  fromGallery(gallery, extensionsControlManifest) {
    let extension = this.getInstalledExtensionMatchingGallery(gallery);
    if (!extension) {
      extension = this.instantiationService.createInstance(
        Extension,
        (ext) => this.getExtensionState(ext),
        (ext) => this.getRuntimeState(ext),
        void 0,
        void 0,
        gallery,
        void 0
      );
      extension.setExtensionsControlManifest(
        extensionsControlManifest
      );
    }
    return extension;
  }
  getInstalledExtensionMatchingGallery(gallery) {
    for (const installed of this.local) {
      if (installed.identifier.uuid) {
        if (installed.identifier.uuid === gallery.identifier.uuid) {
          return installed;
        }
      } else if (installed.local?.source !== "resource") {
        if (areSameExtensions(installed.identifier, gallery.identifier)) {
          return installed;
        }
      }
    }
    return null;
  }
  getInstalledExtensionMatchingLocation(location) {
    return this.local.find(
      (e) => e.local && this.uriIdentityService.extUri.isEqualOrParent(
        location,
        e.local?.location
      )
    ) ?? null;
  }
  async open(extension, options) {
    if (typeof extension === "string") {
      const id = extension;
      extension = this.installed.find(
        (e) => areSameExtensions(e.identifier, { id })
      ) ?? (await this.getExtensions(
        [{ id: extension }],
        CancellationToken.None
      ))[0];
    }
    if (!extension) {
      throw new Error(`Extension not found. ${extension}`);
    }
    await this.editorService.openEditor(
      this.instantiationService.createInstance(
        ExtensionsInput,
        extension
      ),
      options,
      options?.sideByside ? SIDE_GROUP : ACTIVE_GROUP
    );
  }
  getExtensionStatus(extension) {
    const extensionsStatus = this.extensionService.getExtensionsStatus();
    for (const id of Object.keys(extensionsStatus)) {
      if (areSameExtensions({ id }, extension.identifier)) {
        return extensionsStatus[id];
      }
    }
    return void 0;
  }
  async updateRunningExtensions(auto = false) {
    const toAdd = [];
    const toRemove = [];
    const extensionsToCheck = [...this.local];
    for (const extension of extensionsToCheck) {
      const runtimeState = extension.runtimeState;
      if (!runtimeState || runtimeState.action !== ExtensionRuntimeActionType.RestartExtensions) {
        continue;
      }
      if (extension.state === ExtensionState.Uninstalled) {
        toRemove.push(extension.identifier.id);
        continue;
      }
      if (!extension.local) {
        continue;
      }
      const isEnabled = this.extensionEnablementService.isEnabled(
        extension.local
      );
      if (isEnabled) {
        const runningExtension = this.extensionService.extensions.find(
          (e) => areSameExtensions(
            { id: e.identifier.value, uuid: e.uuid },
            extension.identifier
          )
        );
        if (runningExtension) {
          toRemove.push(runningExtension.identifier.value);
        }
        toAdd.push(extension.local);
      } else {
        toRemove.push(extension.identifier.id);
      }
    }
    for (const extension of this.extensionService.extensions) {
      if (extension.isUnderDevelopment) {
        continue;
      }
      if (extensionsToCheck.some(
        (e) => areSameExtensions(
          {
            id: extension.identifier.value,
            uuid: extension.uuid
          },
          e.identifier
        )
      )) {
        continue;
      }
      toRemove.push(extension.identifier.value);
    }
    if (toAdd.length || toRemove.length) {
      if (await this.extensionService.stopExtensionHosts(
        nls.localize("restart", "Enable or Disable extensions"),
        auto
      )) {
        await this.extensionService.startExtensionHosts({
          toAdd,
          toRemove
        });
        if (auto) {
          this.notificationService.notify({
            severity: Severity.Info,
            message: nls.localize(
              "extensionsAutoRestart",
              "Extensions were auto restarted to enable updates."
            ),
            priority: NotificationPriority.SILENT
          });
        }
        this.telemetryService.publicLog2("extensions:autorestart", {
          count: toAdd.length + toRemove.length,
          auto
        });
      }
    }
  }
  getRuntimeState(extension) {
    const isUninstalled = extension.state === ExtensionState.Uninstalled;
    const runningExtension = this.extensionService.extensions.find(
      (e) => areSameExtensions({ id: e.identifier.value }, extension.identifier)
    );
    const reloadAction = this.extensionManagementServerService.remoteExtensionManagementServer ? ExtensionRuntimeActionType.ReloadWindow : ExtensionRuntimeActionType.RestartExtensions;
    const reloadActionLabel = reloadAction === ExtensionRuntimeActionType.ReloadWindow ? nls.localize("reload", "reload window") : nls.localize("restart extensions", "restart extensions");
    if (isUninstalled) {
      const canRemoveRunningExtension = runningExtension && this.extensionService.canRemoveExtension(runningExtension);
      const isSameExtensionRunning = runningExtension && (!extension.server || extension.server === this.extensionManagementServerService.getExtensionManagementServer(
        toExtension(runningExtension)
      )) && (!extension.resourceExtension || this.uriIdentityService.extUri.isEqual(
        extension.resourceExtension.location,
        runningExtension.extensionLocation
      ));
      if (!canRemoveRunningExtension && isSameExtensionRunning && !runningExtension.isUnderDevelopment) {
        return {
          action: reloadAction,
          reason: nls.localize(
            "postUninstallTooltip",
            "Please {0} to complete the uninstallation of this extension.",
            reloadActionLabel
          )
        };
      }
      return void 0;
    }
    if (extension.local) {
      const isSameExtensionRunning = runningExtension && extension.server === this.extensionManagementServerService.getExtensionManagementServer(
        toExtension(runningExtension)
      );
      const isEnabled = this.extensionEnablementService.isEnabled(
        extension.local
      );
      if (runningExtension) {
        if (isEnabled) {
          if (this.extensionService.canAddExtension(
            toExtensionDescription(extension.local)
          )) {
            return void 0;
          }
          const runningExtensionServer = this.extensionManagementServerService.getExtensionManagementServer(
            toExtension(runningExtension)
          );
          if (isSameExtensionRunning) {
            if (!runningExtension.isUnderDevelopment && (extension.version !== runningExtension.version || extension.local.targetPlatform !== runningExtension.targetPlatform)) {
              const productCurrentVersion = this.getProductCurrentVersion();
              const productUpdateVersion = this.getProductUpdateVersion();
              if (productUpdateVersion && !isEngineValid(
                extension.local.manifest.engines.vscode,
                productCurrentVersion.version,
                productCurrentVersion.date
              ) && isEngineValid(
                extension.local.manifest.engines.vscode,
                productUpdateVersion.version,
                productUpdateVersion.date
              )) {
                const state = this.updateService.state;
                if (state.type === StateType.AvailableForDownload) {
                  return {
                    action: ExtensionRuntimeActionType.DownloadUpdate,
                    reason: nls.localize(
                      "postUpdateDownloadTooltip",
                      "Please update {0} to enable the updated extension.",
                      this.productService.nameLong
                    )
                  };
                }
                if (state.type === StateType.Downloaded) {
                  return {
                    action: ExtensionRuntimeActionType.ApplyUpdate,
                    reason: nls.localize(
                      "postUpdateUpdateTooltip",
                      "Please update {0} to enable the updated extension.",
                      this.productService.nameLong
                    )
                  };
                }
                if (state.type === StateType.Ready) {
                  return {
                    action: ExtensionRuntimeActionType.QuitAndInstall,
                    reason: nls.localize(
                      "postUpdateRestartTooltip",
                      "Please restart {0} to enable the updated extension.",
                      this.productService.nameLong
                    )
                  };
                }
                return void 0;
              }
              return {
                action: reloadAction,
                reason: nls.localize(
                  "postUpdateTooltip",
                  "Please {0} to enable the updated extension.",
                  reloadActionLabel
                )
              };
            }
            if (this.extensionsServers.length > 1) {
              const extensionInOtherServer = this.installed.filter(
                (e) => areSameExtensions(
                  e.identifier,
                  extension.identifier
                ) && e.server !== extension.server
              )[0];
              if (extensionInOtherServer) {
                if (runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(
                  extension.local.manifest
                ) && extensionInOtherServer.server === this.extensionManagementServerService.localExtensionManagementServer) {
                  return {
                    action: reloadAction,
                    reason: nls.localize(
                      "enable locally",
                      "Please {0} to enable this extension locally.",
                      reloadActionLabel
                    )
                  };
                }
                if (runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(
                  extension.local.manifest
                ) && extensionInOtherServer.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                  return {
                    action: reloadAction,
                    reason: nls.localize(
                      "enable remote",
                      "Please {0} to enable this extension in {1}.",
                      reloadActionLabel,
                      this.extensionManagementServerService.remoteExtensionManagementServer?.label
                    )
                  };
                }
              }
            }
          } else {
            if (extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
              if (this.extensionManifestPropertiesService.prefersExecuteOnUI(
                extension.local.manifest
              )) {
                return {
                  action: reloadAction,
                  reason: nls.localize(
                    "postEnableTooltip",
                    "Please {0} to enable this extension.",
                    reloadActionLabel
                  )
                };
              }
            }
            if (extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
              if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(
                extension.local.manifest
              )) {
                return {
                  action: reloadAction,
                  reason: nls.localize(
                    "postEnableTooltip",
                    "Please {0} to enable this extension.",
                    reloadActionLabel
                  )
                };
              }
            }
          }
          return void 0;
        } else if (isSameExtensionRunning) {
          return {
            action: reloadAction,
            reason: nls.localize(
              "postDisableTooltip",
              "Please {0} to disable this extension.",
              reloadActionLabel
            )
          };
        }
        return void 0;
      } else {
        if (isEnabled && !this.extensionService.canAddExtension(
          toExtensionDescription(extension.local)
        )) {
          return {
            action: reloadAction,
            reason: nls.localize(
              "postEnableTooltip",
              "Please {0} to enable this extension.",
              reloadActionLabel
            )
          };
        }
        const otherServer = extension.server ? extension.server === this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.remoteExtensionManagementServer : this.extensionManagementServerService.localExtensionManagementServer : null;
        if (otherServer && extension.enablementState === EnablementState.DisabledByExtensionKind) {
          const extensionInOtherServer = this.local.filter(
            (e) => areSameExtensions(
              e.identifier,
              extension.identifier
            ) && e.server === otherServer
          )[0];
          if (extensionInOtherServer && extensionInOtherServer.local && this.extensionEnablementService.isEnabled(
            extensionInOtherServer.local
          )) {
            return {
              action: reloadAction,
              reason: nls.localize(
                "postEnableTooltip",
                "Please {0} to enable this extension.",
                reloadActionLabel
              )
            };
          }
        }
      }
    }
    return void 0;
  }
  getPrimaryExtension(extensions) {
    if (extensions.length === 1) {
      return extensions[0];
    }
    const enabledExtensions = extensions.filter(
      (e) => e.local && this.extensionEnablementService.isEnabled(e.local)
    );
    if (enabledExtensions.length === 1) {
      return enabledExtensions[0];
    }
    const extensionsToChoose = enabledExtensions.length ? enabledExtensions : extensions;
    const manifest = extensionsToChoose.find(
      (e) => e.local && e.local.manifest
    )?.local?.manifest;
    if (!manifest) {
      return extensionsToChoose[0];
    }
    const extensionKinds = this.extensionManifestPropertiesService.getExtensionKind(manifest);
    let extension = extensionsToChoose.find((extension2) => {
      for (const extensionKind of extensionKinds) {
        switch (extensionKind) {
          case "ui":
            if (extension2.server === this.extensionManagementServerService.localExtensionManagementServer) {
              return true;
            }
            return false;
          case "workspace":
            if (extension2.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
              return true;
            }
            return false;
          case "web":
            if (extension2.server === this.extensionManagementServerService.webExtensionManagementServer) {
              return true;
            }
            return false;
        }
      }
      return false;
    });
    if (!extension && this.extensionManagementServerService.localExtensionManagementServer) {
      extension = extensionsToChoose.find((extension2) => {
        for (const extensionKind of extensionKinds) {
          switch (extensionKind) {
            case "workspace":
              if (extension2.server === this.extensionManagementServerService.localExtensionManagementServer) {
                return true;
              }
              return false;
            case "web":
              if (extension2.server === this.extensionManagementServerService.localExtensionManagementServer) {
                return true;
              }
              return false;
          }
        }
        return false;
      });
    }
    if (!extension && this.extensionManagementServerService.webExtensionManagementServer) {
      extension = extensionsToChoose.find((extension2) => {
        for (const extensionKind of extensionKinds) {
          switch (extensionKind) {
            case "web":
              if (extension2.server === this.extensionManagementServerService.webExtensionManagementServer) {
                return true;
              }
              return false;
          }
        }
        return false;
      });
    }
    if (!extension && this.extensionManagementServerService.remoteExtensionManagementServer) {
      extension = extensionsToChoose.find((extension2) => {
        for (const extensionKind of extensionKinds) {
          switch (extensionKind) {
            case "web":
              if (extension2.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                return true;
              }
              return false;
          }
        }
        return false;
      });
    }
    return extension || extensions[0];
  }
  getExtensionState(extension) {
    if (this.installing.some(
      (i) => areSameExtensions(i.identifier, extension.identifier) && (!extension.server || i.server === extension.server)
    )) {
      return ExtensionState.Installing;
    }
    if (this.remoteExtensions) {
      const state = this.remoteExtensions.getExtensionState(extension);
      if (state !== ExtensionState.Uninstalled) {
        return state;
      }
    }
    if (this.webExtensions) {
      const state = this.webExtensions.getExtensionState(extension);
      if (state !== ExtensionState.Uninstalled) {
        return state;
      }
    }
    if (this.localExtensions) {
      return this.localExtensions.getExtensionState(extension);
    }
    return ExtensionState.Uninstalled;
  }
  async checkForUpdates(onlyBuiltin) {
    if (!this.galleryService.isEnabled()) {
      return;
    }
    const extensions = [];
    if (this.localExtensions) {
      extensions.push(this.localExtensions);
    }
    if (this.remoteExtensions) {
      extensions.push(this.remoteExtensions);
    }
    if (this.webExtensions) {
      extensions.push(this.webExtensions);
    }
    if (!extensions.length) {
      return;
    }
    const infos = [];
    for (const installed of this.local) {
      if (onlyBuiltin && !installed.isBuiltin) {
        continue;
      }
      if (installed.isBuiltin && !installed.local?.pinned && (installed.type === ExtensionType.System || !installed.local?.identifier.uuid)) {
        continue;
      }
      if (installed.local?.source === "resource") {
        continue;
      }
      infos.push({
        ...installed.identifier,
        preRelease: !!installed.local?.preRelease
      });
    }
    if (infos.length) {
      const targetPlatform = await extensions[0].server.extensionManagementService.getTargetPlatform();
      this.telemetryService.publicLog2("galleryService:checkingForUpdates", {
        count: infos.length
      });
      const galleryExtensions = await this.galleryService.getExtensions(
        infos,
        {
          targetPlatform,
          compatible: true,
          productVersion: this.getProductVersion()
        },
        CancellationToken.None
      );
      if (galleryExtensions.length) {
        await this.syncInstalledExtensionsWithGallery(
          galleryExtensions
        );
      }
    }
  }
  async updateAll() {
    const toUpdate = [];
    this.outdated.forEach((extension) => {
      if (extension.gallery) {
        toUpdate.push({
          extension: extension.gallery,
          options: {
            operation: InstallOperation.Update,
            installPreReleaseVersion: extension.local?.isPreReleaseVersion,
            profileLocation: this.userDataProfileService.currentProfile.extensionsResource,
            isApplicationScoped: extension.local?.isApplicationScoped
          }
        });
      }
    });
    return this.extensionManagementService.installGalleryExtensions(
      toUpdate
    );
  }
  async syncInstalledExtensionsWithGallery(gallery) {
    const extensions = [];
    if (this.localExtensions) {
      extensions.push(this.localExtensions);
    }
    if (this.remoteExtensions) {
      extensions.push(this.remoteExtensions);
    }
    if (this.webExtensions) {
      extensions.push(this.webExtensions);
    }
    if (!extensions.length) {
      return;
    }
    await Promise.allSettled(
      extensions.map(
        (extensions2) => extensions2.syncInstalledExtensionsWithGallery(
          gallery,
          this.getProductVersion()
        )
      )
    );
    if (this.outdated.length) {
      this.eventuallyAutoUpdateExtensions();
    }
  }
  isAutoCheckUpdatesEnabled() {
    return this.configurationService.getValue(
      AutoCheckUpdatesConfigurationKey
    );
  }
  eventuallyCheckForUpdates(immediate = false) {
    this.updatesCheckDelayer.cancel();
    this.updatesCheckDelayer.trigger(
      async () => {
        if (this.isAutoCheckUpdatesEnabled()) {
          await this.checkForUpdates();
        }
        this.eventuallyCheckForUpdates();
      },
      immediate ? 0 : this.getUpdatesCheckInterval()
    ).then(void 0, (err) => null);
  }
  getUpdatesCheckInterval() {
    if (this.productService.quality === "insider" && this.getProductUpdateVersion()) {
      return 1e3 * 60 * 60 * 1;
    }
    return ExtensionsWorkbenchService.UpdatesCheckInterval;
  }
  eventuallyAutoUpdateExtensions() {
    this.autoUpdateDelayer.trigger(() => this.autoUpdateExtensions()).then(void 0, (err) => null);
  }
  async autoUpdateBuiltinExtensions() {
    await this.checkForUpdates(true);
    const toUpdate = this.outdated.filter((e) => e.isBuiltin);
    await Promises.settled(
      toUpdate.map(
        (e) => this.install(
          e,
          e.local?.preRelease ? { installPreReleaseVersion: true } : void 0
        )
      )
    );
  }
  async syncPinnedBuiltinExtensions() {
    const infos = [];
    for (const installed of this.local) {
      if (installed.isBuiltin && installed.local?.pinned && installed.local?.identifier.uuid) {
        infos.push({
          ...installed.identifier,
          version: installed.version
        });
      }
    }
    if (infos.length) {
      const galleryExtensions = await this.galleryService.getExtensions(
        infos,
        CancellationToken.None
      );
      if (galleryExtensions.length) {
        await this.syncInstalledExtensionsWithGallery(
          galleryExtensions
        );
      }
    }
  }
  async autoUpdateExtensions() {
    const toUpdate = [];
    for (const extension of this.outdated) {
      if (!this.shouldAutoUpdateExtension(extension)) {
        continue;
      }
      if (await this.shouldRequireConsentToUpdate(extension)) {
        continue;
      }
      toUpdate.push(extension);
    }
    if (!toUpdate.length) {
      return;
    }
    const productVersion = this.getProductVersion();
    await Promises.settled(
      toUpdate.map(
        (e) => this.install(
          e,
          e.local?.preRelease ? { installPreReleaseVersion: true, productVersion } : { productVersion }
        )
      )
    );
  }
  getProductVersion() {
    return this.getProductUpdateVersion() ?? this.getProductCurrentVersion();
  }
  getProductCurrentVersion() {
    return {
      version: this.productService.version,
      date: this.productService.date
    };
  }
  getProductUpdateVersion() {
    switch (this.updateService.state.type) {
      case StateType.AvailableForDownload:
      case StateType.Downloaded:
      case StateType.Updating:
      case StateType.Ready: {
        const version = this.updateService.state.update.productVersion;
        if (version && semver.valid(version)) {
          return {
            version,
            date: this.updateService.state.update.timestamp ? new Date(
              this.updateService.state.update.timestamp
            ).toISOString() : void 0
          };
        }
      }
    }
    return void 0;
  }
  shouldAutoUpdateExtension(extension) {
    if (extension.deprecationInfo?.disallowInstall) {
      return false;
    }
    const autoUpdateValue = this.getAutoUpdateValue();
    if (autoUpdateValue === false) {
      const extensionsToAutoUpdate = this.getEnabledAutoUpdateExtensions();
      const extensionId = extension.identifier.id.toLowerCase();
      if (extensionsToAutoUpdate.includes(extensionId)) {
        return true;
      }
      if (this.isAutoUpdateEnabledForPublisher(extension.publisher) && !extensionsToAutoUpdate.includes(`-${extensionId}`)) {
        return true;
      }
      return false;
    }
    if (extension.pinned) {
      return false;
    }
    const disabledAutoUpdateExtensions = this.getDisabledAutoUpdateExtensions();
    if (disabledAutoUpdateExtensions.includes(
      extension.identifier.id.toLowerCase()
    )) {
      return false;
    }
    if (autoUpdateValue === true) {
      return true;
    }
    if (autoUpdateValue === "onlyEnabledExtensions") {
      return this.extensionEnablementService.isEnabledEnablementState(
        extension.enablementState
      );
    }
    return false;
  }
  async shouldRequireConsentToUpdate(extension) {
    if (!extension.outdated) {
      return;
    }
    if (extension.local?.manifest.main || extension.local?.manifest.browser) {
      return;
    }
    if (!extension.gallery) {
      return;
    }
    if (isDefined(extension.gallery.properties?.executesCode)) {
      if (!extension.gallery.properties.executesCode) {
        return;
      }
    } else {
      const manifest = extension instanceof Extension ? await extension.getGalleryManifest() : await this.galleryService.getManifest(
        extension.gallery,
        CancellationToken.None
      );
      if (!manifest?.main && !manifest?.browser) {
        return;
      }
    }
    return nls.localize(
      "consentRequiredToUpdate",
      "The update for {0} extension introduces executable code, which is not present in the currently installed version.",
      extension.displayName
    );
  }
  isAutoUpdateEnabledFor(extensionOrPublisher) {
    if (isString(extensionOrPublisher)) {
      if (EXTENSION_IDENTIFIER_REGEX.test(extensionOrPublisher)) {
        throw new Error(
          "Expected publisher string, found extension identifier"
        );
      }
      if (this.isAutoUpdateEnabled()) {
        return true;
      }
      return this.isAutoUpdateEnabledForPublisher(extensionOrPublisher);
    }
    return this.shouldAutoUpdateExtension(extensionOrPublisher);
  }
  isAutoUpdateEnabledForPublisher(publisher) {
    const publishersToAutoUpdate = this.getPublishersToAutoUpdate();
    return publishersToAutoUpdate.includes(publisher.toLowerCase());
  }
  async updateAutoUpdateEnablementFor(extensionOrPublisher, enable) {
    if (this.isAutoUpdateEnabled()) {
      if (isString(extensionOrPublisher)) {
        throw new Error("Expected extension, found publisher string");
      }
      const disabledAutoUpdateExtensions = this.getDisabledAutoUpdateExtensions();
      const extensionId = extensionOrPublisher.identifier.id.toLowerCase();
      const extensionIndex = disabledAutoUpdateExtensions.indexOf(extensionId);
      if (enable) {
        if (extensionIndex !== -1) {
          disabledAutoUpdateExtensions.splice(extensionIndex, 1);
        }
      } else if (extensionIndex === -1) {
        disabledAutoUpdateExtensions.push(extensionId);
      }
      this.setDisabledAutoUpdateExtensions(disabledAutoUpdateExtensions);
      if (enable && extensionOrPublisher.local && extensionOrPublisher.pinned) {
        await this.extensionManagementService.updateMetadata(
          extensionOrPublisher.local,
          { pinned: false }
        );
      }
      this._onChange.fire(extensionOrPublisher);
    } else {
      const enabledAutoUpdateExtensions = this.getEnabledAutoUpdateExtensions();
      if (isString(extensionOrPublisher)) {
        if (EXTENSION_IDENTIFIER_REGEX.test(extensionOrPublisher)) {
          throw new Error(
            "Expected publisher string, found extension identifier"
          );
        }
        extensionOrPublisher = extensionOrPublisher.toLowerCase();
        if (this.isAutoUpdateEnabledFor(extensionOrPublisher) !== enable) {
          if (enable) {
            enabledAutoUpdateExtensions.push(extensionOrPublisher);
          } else if (enabledAutoUpdateExtensions.includes(
            extensionOrPublisher
          )) {
            enabledAutoUpdateExtensions.splice(
              enabledAutoUpdateExtensions.indexOf(
                extensionOrPublisher
              ),
              1
            );
          }
        }
        this.setEnabledAutoUpdateExtensions(
          enabledAutoUpdateExtensions
        );
        for (const e of this.installed) {
          if (e.publisher.toLowerCase() === extensionOrPublisher) {
            this._onChange.fire(e);
          }
        }
      } else {
        const extensionId = extensionOrPublisher.identifier.id.toLowerCase();
        const enableAutoUpdatesForPublisher = this.isAutoUpdateEnabledFor(
          extensionOrPublisher.publisher.toLowerCase()
        );
        const enableAutoUpdatesForExtension = enabledAutoUpdateExtensions.includes(extensionId);
        const disableAutoUpdatesForExtension = enabledAutoUpdateExtensions.includes(`-${extensionId}`);
        if (enable) {
          if (disableAutoUpdatesForExtension) {
            enabledAutoUpdateExtensions.splice(
              enabledAutoUpdateExtensions.indexOf(
                `-${extensionId}`
              ),
              1
            );
          }
          if (enableAutoUpdatesForPublisher) {
            if (enableAutoUpdatesForExtension) {
              enabledAutoUpdateExtensions.splice(
                enabledAutoUpdateExtensions.indexOf(
                  extensionId
                ),
                1
              );
            }
          } else if (!enableAutoUpdatesForExtension) {
            enabledAutoUpdateExtensions.push(extensionId);
          }
        } else {
          if (enableAutoUpdatesForExtension) {
            enabledAutoUpdateExtensions.splice(
              enabledAutoUpdateExtensions.indexOf(extensionId),
              1
            );
          }
          if (enableAutoUpdatesForPublisher) {
            if (!disableAutoUpdatesForExtension) {
              enabledAutoUpdateExtensions.push(`-${extensionId}`);
            }
          } else if (disableAutoUpdatesForExtension) {
            enabledAutoUpdateExtensions.splice(
              enabledAutoUpdateExtensions.indexOf(
                `-${extensionId}`
              ),
              1
            );
          }
        }
        this.setEnabledAutoUpdateExtensions(
          enabledAutoUpdateExtensions
        );
        this._onChange.fire(extensionOrPublisher);
      }
    }
    if (enable) {
      this.autoUpdateExtensions();
    }
  }
  onDidSelectedExtensionToAutoUpdateValueChange() {
    if (this.enabledAuotUpdateExtensionsValue !== this.getEnabledAutoUpdateExtensionsValue() || this.disabledAutoUpdateExtensionsValue !== this.getDisabledAutoUpdateExtensionsValue()) {
      const userExtensions = this.installed.filter((e) => !e.isBuiltin);
      const groupBy = (extensions) => {
        const shouldAutoUpdate2 = [];
        const shouldNotAutoUpdate2 = [];
        for (const extension of extensions) {
          if (this.shouldAutoUpdateExtension(extension)) {
            shouldAutoUpdate2.push(extension);
          } else {
            shouldNotAutoUpdate2.push(extension);
          }
        }
        return [shouldAutoUpdate2, shouldNotAutoUpdate2];
      };
      const [wasShouldAutoUpdate, wasShouldNotAutoUpdate] = groupBy(userExtensions);
      this._enabledAutoUpdateExtensionsValue = void 0;
      this._disabledAutoUpdateExtensionsValue = void 0;
      const [shouldAutoUpdate, shouldNotAutoUpdate] = groupBy(userExtensions);
      for (const e of wasShouldAutoUpdate ?? []) {
        if (shouldNotAutoUpdate?.includes(e)) {
          this._onChange.fire(e);
        }
      }
      for (const e of wasShouldNotAutoUpdate ?? []) {
        if (shouldAutoUpdate?.includes(e)) {
          this._onChange.fire(e);
        }
      }
    }
  }
  async canInstall(extension) {
    if (!(extension instanceof Extension)) {
      return false;
    }
    if (extension.isMalicious) {
      return false;
    }
    if (extension.deprecationInfo?.disallowInstall) {
      return false;
    }
    if (extension.gallery) {
      if (this.localExtensions && await this.localExtensions.canInstall(extension.gallery)) {
        return true;
      }
      if (this.remoteExtensions && await this.remoteExtensions.canInstall(extension.gallery)) {
        return true;
      }
      if (this.webExtensions && await this.webExtensions.canInstall(extension.gallery)) {
        return true;
      }
      return false;
    }
    if (extension.resourceExtension && await this.extensionManagementService.canInstall(
      extension.resourceExtension
    )) {
      return true;
    }
    return false;
  }
  async install(arg, installOptions = {}, progressLocation) {
    let installable;
    let extension;
    if (arg instanceof URI) {
      installable = arg;
    } else {
      let installableInfo;
      let gallery;
      if (isString(arg)) {
        extension = this.local.find(
          (e) => areSameExtensions(e.identifier, { id: arg })
        );
        if (!extension?.isBuiltin) {
          installableInfo = {
            id: arg,
            version: installOptions.version,
            preRelease: installOptions.installPreReleaseVersion ?? this.preferPreReleases
          };
        }
      } else if (arg.gallery) {
        extension = arg;
        gallery = arg.gallery;
        if (installOptions.version && installOptions.version !== gallery?.version) {
          installableInfo = {
            id: extension.identifier.id,
            version: installOptions.version
          };
        }
      } else if (arg.resourceExtension) {
        extension = arg;
        installable = arg.resourceExtension;
      }
      if (installableInfo) {
        const targetPlatform = extension?.server ? await extension.server.extensionManagementService.getTargetPlatform() : void 0;
        gallery = (await this.galleryService.getExtensions(
          [installableInfo],
          { targetPlatform },
          CancellationToken.None
        )).at(0);
      }
      if (!extension && gallery) {
        extension = this.instantiationService.createInstance(
          Extension,
          (ext) => this.getExtensionState(ext),
          (ext) => this.getRuntimeState(ext),
          void 0,
          void 0,
          gallery,
          void 0
        );
        extension.setExtensionsControlManifest(
          await this.extensionManagementService.getExtensionsControlManifest()
        );
      }
      if (extension?.isMalicious) {
        throw new Error(
          nls.localize(
            "malicious",
            "This extension is reported to be problematic."
          )
        );
      }
      if (!(installOptions.enable && extension?.local)) {
        if (!installable) {
          if (!gallery) {
            const id = isString(arg) ? arg : arg.identifier.id;
            if (installOptions.version) {
              throw new Error(
                nls.localize(
                  "not found version",
                  "Unable to install extension '{0}' because the requested version '{1}' is not found.",
                  id,
                  installOptions.version
                )
              );
            } else {
              throw new Error(
                nls.localize(
                  "not found",
                  "Unable to install extension '{0}' because it is not found.",
                  id
                )
              );
            }
          }
          installable = gallery;
        }
        if (installOptions.version) {
          installOptions.installGivenVersion = true;
        }
        if (extension?.isWorkspaceScoped) {
          installOptions.isWorkspaceScoped = true;
        }
      }
    }
    if (installable) {
      if (installOptions.justification) {
        const syncCheck = isUndefined(installOptions.isMachineScoped) && this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled(
          SyncResource.Extensions
        );
        const buttons = [];
        buttons.push({
          label: isString(installOptions.justification) || !installOptions.justification.action ? nls.localize(
            {
              key: "installButtonLabel",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Install Extension"
          ) : nls.localize(
            {
              key: "installButtonLabelWithAction",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Install Extension and {0}",
            installOptions.justification.action
          ),
          run: () => true
        });
        if (!extension) {
          buttons.push({
            label: nls.localize("open", "Open Extension"),
            run: () => {
              this.open(extension);
              return false;
            }
          });
        }
        const result = await this.dialogService.prompt({
          title: nls.localize(
            "installExtensionTitle",
            "Install Extension"
          ),
          message: extension ? nls.localize(
            "installExtensionMessage",
            "Would you like to install '{0}' extension from '{1}'?",
            extension.displayName,
            extension.publisherDisplayName
          ) : nls.localize(
            "installVSIXMessage",
            "Would you like to install the extension?"
          ),
          detail: isString(installOptions.justification) ? installOptions.justification : installOptions.justification.reason,
          cancelButton: true,
          buttons,
          checkbox: syncCheck ? {
            label: nls.localize(
              "sync extension",
              "Sync this extension"
            ),
            checked: true
          } : void 0
        });
        if (!result.result) {
          throw new CancellationError();
        }
        if (syncCheck) {
          installOptions.isMachineScoped = !result.checkboxChecked;
        }
      }
      if (installable instanceof URI) {
        extension = await this.doInstall(
          void 0,
          () => this.installFromVSIX(installable, installOptions),
          progressLocation
        );
      } else if (extension) {
        if (extension.resourceExtension) {
          extension = await this.doInstall(
            extension,
            () => this.extensionManagementService.installResourceExtension(
              installable,
              installOptions
            ),
            progressLocation
          );
        } else {
          extension = await this.doInstall(
            extension,
            () => this.installFromGallery(
              extension,
              installable,
              installOptions
            ),
            progressLocation
          );
        }
      }
    }
    if (!extension) {
      throw new Error(
        nls.localize("unknown", "Unable to install extension")
      );
    }
    if (installOptions.enable) {
      if (extension.enablementState === EnablementState.DisabledWorkspace || extension.enablementState === EnablementState.DisabledGlobally) {
        if (installOptions.justification) {
          const result = await this.dialogService.confirm({
            title: nls.localize(
              "enableExtensionTitle",
              "Enable Extension"
            ),
            message: nls.localize(
              "enableExtensionMessage",
              "Would you like to enable '{0}' extension?",
              extension.displayName
            ),
            detail: isString(installOptions.justification) ? installOptions.justification : installOptions.justification.reason,
            primaryButton: isString(installOptions.justification) ? nls.localize(
              {
                key: "enableButtonLabel",
                comment: ["&& denotes a mnemonic"]
              },
              "&&Enable Extension"
            ) : nls.localize(
              {
                key: "enableButtonLabelWithAction",
                comment: ["&& denotes a mnemonic"]
              },
              "&&Enable Extension and {0}",
              installOptions.justification.action
            )
          });
          if (!result.confirmed) {
            throw new CancellationError();
          }
        }
        await this.setEnablement(
          extension,
          extension.enablementState === EnablementState.DisabledWorkspace ? EnablementState.EnabledWorkspace : EnablementState.EnabledGlobally
        );
      }
      await this.waitUntilExtensionIsEnabled(extension);
    }
    return extension;
  }
  async installInServer(extension, server) {
    await this.doInstall(extension, async () => {
      const local = extension.local;
      if (!local) {
        throw new Error("Extension not found");
      }
      if (!extension.gallery) {
        extension = (await this.getExtensions(
          [
            {
              ...extension.identifier,
              preRelease: local.preRelease
            }
          ],
          CancellationToken.None
        ))[0] ?? extension;
      }
      if (extension.gallery) {
        return server.extensionManagementService.installFromGallery(
          extension.gallery,
          { installPreReleaseVersion: local.preRelease }
        );
      }
      const targetPlatform = await server.extensionManagementService.getTargetPlatform();
      if (!isTargetPlatformCompatible(
        local.targetPlatform,
        [local.targetPlatform],
        targetPlatform
      )) {
        throw new Error(
          nls.localize(
            "incompatible",
            "Can't install '{0}' extension because it is not compatible.",
            extension.identifier.id
          )
        );
      }
      const vsix = await this.extensionManagementService.zip(local);
      try {
        return await server.extensionManagementService.install(vsix);
      } finally {
        try {
          await this.fileService.del(vsix);
        } catch (error) {
          this.logService.error(error);
        }
      }
    });
  }
  canSetLanguage(extension) {
    if (!isWeb) {
      return false;
    }
    if (!extension.gallery) {
      return false;
    }
    const locale = getLocale(extension.gallery);
    if (!locale) {
      return false;
    }
    return true;
  }
  async setLanguage(extension) {
    if (!this.canSetLanguage(extension)) {
      throw new Error("Can not set language");
    }
    const locale = getLocale(extension.gallery);
    if (locale === language) {
      return;
    }
    const localizedLanguageName = extension.gallery?.properties?.localizedLanguages?.[0];
    return this.localeService.setLocale({
      id: locale,
      galleryExtension: extension.gallery,
      extensionId: extension.identifier.id,
      label: localizedLanguageName ?? extension.displayName
    });
  }
  setEnablement(extensions, enablementState) {
    extensions = Array.isArray(extensions) ? extensions : [extensions];
    return this.promptAndSetEnablement(extensions, enablementState);
  }
  async uninstall(e) {
    const extension = e.local ? e : this.local.find(
      (local) => areSameExtensions(local.identifier, e.identifier)
    );
    if (!extension?.local) {
      throw new Error("Missing local");
    }
    const extensionsToUninstall = [
      { extension: extension.local }
    ];
    for (const packExtension of this.getAllPackExtensionsToUninstall(
      extension.local,
      this.local
    )) {
      if (!extensionsToUninstall.some(
        (e2) => areSameExtensions(
          e2.extension.identifier,
          packExtension.identifier
        )
      )) {
        extensionsToUninstall.push({ extension: packExtension });
      }
    }
    const dependents = [];
    for (const { extension: extension2 } of extensionsToUninstall) {
      for (const local of this.local) {
        if (!local.local) {
          continue;
        }
        if (areSameExtensions(local.identifier, extension2.identifier)) {
          continue;
        }
        if (local.dependencies.length === 0) {
          continue;
        }
        if (extension2.manifest.extensionPack?.some(
          (id) => areSameExtensions({ id }, local.identifier)
        )) {
          continue;
        }
        if (dependents.some(
          (d) => d.extensionPack.some(
            (id) => areSameExtensions({ id }, local.identifier)
          )
        )) {
          continue;
        }
        if (local.dependencies.some(
          (dep) => areSameExtensions(extension2.identifier, { id: dep })
        )) {
          dependents.push(local);
          extensionsToUninstall.push({ extension: local.local });
        }
      }
    }
    if (dependents.length) {
      const { result } = await this.dialogService.prompt({
        title: nls.localize(
          "uninstallDependents",
          "Uninstall Extension with Dependents"
        ),
        type: Severity.Warning,
        message: this.getErrorMessageForUninstallingAnExtensionWithDependents(
          extension,
          dependents
        ),
        buttons: [
          {
            label: nls.localize("uninstallAll", "Uninstall All"),
            run: () => true
          }
        ],
        cancelButton: {
          run: () => false
        }
      });
      if (!result) {
        throw new CancellationError();
      }
    }
    return this.withProgress(
      {
        location: ProgressLocation.Extensions,
        title: nls.localize(
          "uninstallingExtension",
          "Uninstalling extension...."
        ),
        source: `${extension.identifier.id}`
      },
      () => this.extensionManagementService.uninstallExtensions(extensionsToUninstall).then(() => void 0)
    );
  }
  getAllPackExtensionsToUninstall(extension, installed, checked = []) {
    if (checked.some(
      (e) => areSameExtensions(e.identifier, extension.identifier)
    )) {
      return [];
    }
    checked.push(extension);
    const extensionsPack = extension.manifest.extensionPack ?? [];
    if (extensionsPack.length) {
      const packedExtensions = [];
      for (const i of installed) {
        if (i.local && !i.isBuiltin && extensionsPack.some(
          (id) => areSameExtensions({ id }, i.identifier)
        )) {
          packedExtensions.push(i.local);
        }
      }
      const packOfPackedExtensions = [];
      for (const packedExtension of packedExtensions) {
        packOfPackedExtensions.push(
          ...this.getAllPackExtensionsToUninstall(
            packedExtension,
            installed,
            checked
          )
        );
      }
      return [...packedExtensions, ...packOfPackedExtensions];
    }
    return [];
  }
  getErrorMessageForUninstallingAnExtensionWithDependents(extension, dependents) {
    if (dependents.length === 1) {
      return nls.localize(
        "singleDependentUninstallError",
        "Cannot uninstall '{0}' extension alone. '{1}' extension depends on this. Do you want to uninstall all these extensions?",
        extension.displayName,
        dependents[0].displayName
      );
    }
    if (dependents.length === 2) {
      return nls.localize(
        "twoDependentsUninstallError",
        "Cannot uninstall '{0}' extension alone. '{1}' and '{2}' extensions depend on this. Do you want to uninstall all these extensions?",
        extension.displayName,
        dependents[0].displayName,
        dependents[1].displayName
      );
    }
    return nls.localize(
      "multipleDependentsUninstallError",
      "Cannot uninstall '{0}' extension alone. '{1}', '{2}' and other extensions depend on this. Do you want to uninstall all these extensions?",
      extension.displayName,
      dependents[0].displayName,
      dependents[1].displayName
    );
  }
  reinstall(extension) {
    return this.doInstall(extension, () => {
      const ext = extension.local ? extension : this.local.filter(
        (e) => areSameExtensions(e.identifier, extension.identifier)
      )[0];
      const toReinstall = ext && ext.local ? ext.local : null;
      if (!toReinstall) {
        throw new Error("Missing local");
      }
      return this.extensionManagementService.reinstallFromGallery(
        toReinstall
      );
    });
  }
  isExtensionIgnoredToSync(extension) {
    return extension.local ? !this.isInstalledExtensionSynced(extension.local) : this.extensionsSyncManagementService.hasToNeverSyncExtension(
      extension.identifier.id
    );
  }
  async togglePreRelease(extension) {
    if (!extension.local) {
      return;
    }
    if (extension.preRelease !== extension.isPreReleaseVersion) {
      await this.extensionManagementService.updateMetadata(
        extension.local,
        { preRelease: !extension.preRelease }
      );
      return;
    }
    await this.install(extension, {
      installPreReleaseVersion: !extension.preRelease,
      preRelease: !extension.preRelease
    });
  }
  async toggleExtensionIgnoredToSync(extension) {
    const isIgnored = this.isExtensionIgnoredToSync(extension);
    if (extension.local && isIgnored) {
      extension.local = await this.updateSynchronizingInstalledExtension(
        extension.local,
        true
      );
      this._onChange.fire(extension);
    } else {
      this.extensionsSyncManagementService.updateIgnoredExtensions(
        extension.identifier.id,
        !isIgnored
      );
    }
    await this.userDataAutoSyncService.triggerSync(
      ["IgnoredExtensionsUpdated"],
      false,
      false
    );
  }
  async toggleApplyExtensionToAllProfiles(extension) {
    if (!extension.local || isApplicationScopedExtension(extension.local.manifest) || extension.isBuiltin) {
      return;
    }
    const isApplicationScoped = extension.local.isApplicationScoped;
    await Promise.all(
      this.getAllExtensions().map(async (extensions) => {
        const local = extensions.local.find(
          (e) => areSameExtensions(e.identifier, extension.identifier)
        )?.local;
        if (local && local.isApplicationScoped === isApplicationScoped) {
          await this.extensionManagementService.toggleAppliationScope(
            local,
            this.userDataProfileService.currentProfile.extensionsResource
          );
        }
      })
    );
  }
  getAllExtensions() {
    const extensions = [];
    if (this.localExtensions) {
      extensions.push(this.localExtensions);
    }
    if (this.remoteExtensions) {
      extensions.push(this.remoteExtensions);
    }
    if (this.webExtensions) {
      extensions.push(this.webExtensions);
    }
    return extensions;
  }
  isInstalledExtensionSynced(extension) {
    if (extension.isMachineScoped) {
      return false;
    }
    if (this.extensionsSyncManagementService.hasToAlwaysSyncExtension(
      extension.identifier.id
    )) {
      return true;
    }
    return !this.extensionsSyncManagementService.hasToNeverSyncExtension(
      extension.identifier.id
    );
  }
  async updateSynchronizingInstalledExtension(extension, sync) {
    const isMachineScoped = !sync;
    if (extension.isMachineScoped !== isMachineScoped) {
      extension = await this.extensionManagementService.updateMetadata(
        extension,
        { isMachineScoped }
      );
    }
    if (sync) {
      this.extensionsSyncManagementService.updateIgnoredExtensions(
        extension.identifier.id,
        false
      );
    }
    return extension;
  }
  doInstall(extension, installTask, progressLocation) {
    const title = extension ? nls.localize(
      "installing named extension",
      "Installing '{0}' extension....",
      extension.displayName
    ) : nls.localize("installing extension", "Installing extension....");
    return this.withProgress(
      {
        location: progressLocation ?? ProgressLocation.Extensions,
        title
      },
      async () => {
        try {
          if (extension) {
            this.installing.push(extension);
            this._onChange.fire(extension);
          }
          const local = await installTask();
          return await this.waitAndGetInstalledExtension(
            local.identifier
          );
        } finally {
          if (extension) {
            this.installing = this.installing.filter(
              (e) => e !== extension
            );
            this._onChange.fire(void 0);
          }
        }
      }
    );
  }
  async installFromVSIX(vsix, installOptions) {
    const manifest = await this.extensionManagementService.getManifest(vsix);
    const existingExtension = this.local.find(
      (local) => areSameExtensions(local.identifier, {
        id: getGalleryExtensionId(manifest.publisher, manifest.name)
      })
    );
    if (existingExtension) {
      installOptions = installOptions || {};
      if (existingExtension.latestVersion === manifest.version) {
        installOptions.pinned = existingExtension.local?.pinned || !this.shouldAutoUpdateExtension(existingExtension);
      } else {
        installOptions.installGivenVersion = true;
      }
    }
    return this.extensionManagementService.installVSIX(
      vsix,
      manifest,
      installOptions
    );
  }
  installFromGallery(extension, gallery, installOptions) {
    installOptions = installOptions ?? {};
    installOptions.pinned = extension.local?.pinned || !this.shouldAutoUpdateExtension(extension);
    if (extension.local) {
      installOptions.productVersion = this.getProductVersion();
      return this.extensionManagementService.updateFromGallery(
        gallery,
        extension.local,
        installOptions
      );
    } else {
      return this.extensionManagementService.installFromGallery(
        gallery,
        installOptions
      );
    }
  }
  async waitAndGetInstalledExtension(identifier) {
    let installedExtension = this.local.find(
      (local) => areSameExtensions(local.identifier, identifier)
    );
    if (!installedExtension) {
      await Event.toPromise(
        Event.filter(
          this.onChange,
          (e) => !!e && this.local.some(
            (local) => areSameExtensions(local.identifier, identifier)
          )
        )
      );
    }
    installedExtension = this.local.find(
      (local) => areSameExtensions(local.identifier, identifier)
    );
    if (!installedExtension) {
      throw new Error("Extension should have been installed");
    }
    return installedExtension;
  }
  async waitUntilExtensionIsEnabled(extension) {
    if (this.extensionService.extensions.find(
      (e) => ExtensionIdentifier.equals(
        e.identifier,
        extension.identifier.id
      )
    )) {
      return;
    }
    if (!extension.local || !this.extensionService.canAddExtension(
      toExtensionDescription(extension.local)
    )) {
      return;
    }
    await new Promise((c, e) => {
      const disposable = this.extensionService.onDidChangeExtensions(
        () => {
          try {
            if (this.extensionService.extensions.find(
              (e2) => ExtensionIdentifier.equals(
                e2.identifier,
                extension.identifier.id
              )
            )) {
              disposable.dispose();
              c();
            }
          } catch (error) {
            e(error);
          }
        }
      );
    });
  }
  promptAndSetEnablement(extensions, enablementState) {
    const enable = enablementState === EnablementState.EnabledGlobally || enablementState === EnablementState.EnabledWorkspace;
    if (enable) {
      const allDependenciesAndPackedExtensions = this.getExtensionsRecursively(
        extensions,
        this.local,
        enablementState,
        { dependencies: true, pack: true }
      );
      return this.checkAndSetEnablement(
        extensions,
        allDependenciesAndPackedExtensions,
        enablementState
      );
    } else {
      const packedExtensions = this.getExtensionsRecursively(
        extensions,
        this.local,
        enablementState,
        { dependencies: false, pack: true }
      );
      if (packedExtensions.length) {
        return this.checkAndSetEnablement(
          extensions,
          packedExtensions,
          enablementState
        );
      }
      return this.checkAndSetEnablement(extensions, [], enablementState);
    }
  }
  async checkAndSetEnablement(extensions, otherExtensions, enablementState) {
    const allExtensions = [...extensions, ...otherExtensions];
    const enable = enablementState === EnablementState.EnabledGlobally || enablementState === EnablementState.EnabledWorkspace;
    if (!enable) {
      for (const extension of extensions) {
        const dependents = this.getDependentsAfterDisablement(
          extension,
          allExtensions,
          this.local
        );
        if (dependents.length) {
          const { result } = await this.dialogService.prompt({
            title: nls.localize(
              "disableDependents",
              "Disable Extension with Dependents"
            ),
            type: Severity.Warning,
            message: this.getDependentsErrorMessageForDisablement(
              extension,
              allExtensions,
              dependents
            ),
            buttons: [
              {
                label: nls.localize(
                  "disable all",
                  "Disable All"
                ),
                run: () => true
              }
            ],
            cancelButton: {
              run: () => false
            }
          });
          if (!result) {
            throw new CancellationError();
          }
          await this.checkAndSetEnablement(
            dependents,
            [extension],
            enablementState
          );
        }
      }
    }
    return this.doSetEnablement(allExtensions, enablementState);
  }
  getExtensionsRecursively(extensions, installed, enablementState, options, checked = []) {
    const toCheck = extensions.filter((e) => checked.indexOf(e) === -1);
    if (toCheck.length) {
      for (const extension of toCheck) {
        checked.push(extension);
      }
      const extensionsToEanbleOrDisable = installed.filter((i) => {
        if (checked.indexOf(i) !== -1) {
          return false;
        }
        const enable = enablementState === EnablementState.EnabledGlobally || enablementState === EnablementState.EnabledWorkspace;
        const isExtensionEnabled = i.enablementState === EnablementState.EnabledGlobally || i.enablementState === EnablementState.EnabledWorkspace;
        if (enable === isExtensionEnabled) {
          return false;
        }
        return (enable || !i.isBuiltin) && // Include all Extensions for enablement and only non builtin extensions for disablement
        (options.dependencies || options.pack) && extensions.some(
          (extension) => options.dependencies && extension.dependencies.some(
            (id) => areSameExtensions({ id }, i.identifier)
          ) || options.pack && extension.extensionPack.some(
            (id) => areSameExtensions({ id }, i.identifier)
          )
        );
      });
      if (extensionsToEanbleOrDisable.length) {
        extensionsToEanbleOrDisable.push(
          ...this.getExtensionsRecursively(
            extensionsToEanbleOrDisable,
            installed,
            enablementState,
            options,
            checked
          )
        );
      }
      return extensionsToEanbleOrDisable;
    }
    return [];
  }
  getDependentsAfterDisablement(extension, extensionsToDisable, installed) {
    return installed.filter((i) => {
      if (i.dependencies.length === 0) {
        return false;
      }
      if (i === extension) {
        return false;
      }
      if (!this.extensionEnablementService.isEnabledEnablementState(
        i.enablementState
      )) {
        return false;
      }
      if (extensionsToDisable.indexOf(i) !== -1) {
        return false;
      }
      return i.dependencies.some(
        (dep) => [extension, ...extensionsToDisable].some(
          (d) => areSameExtensions(d.identifier, { id: dep })
        )
      );
    });
  }
  getDependentsErrorMessageForDisablement(extension, allDisabledExtensions, dependents) {
    for (const e of [extension, ...allDisabledExtensions]) {
      const dependentsOfTheExtension = dependents.filter(
        (d) => d.dependencies.some(
          (id) => areSameExtensions({ id }, e.identifier)
        )
      );
      if (dependentsOfTheExtension.length) {
        return this.getErrorMessageForDisablingAnExtensionWithDependents(
          e,
          dependentsOfTheExtension
        );
      }
    }
    return "";
  }
  getErrorMessageForDisablingAnExtensionWithDependents(extension, dependents) {
    if (dependents.length === 1) {
      return nls.localize(
        "singleDependentError",
        "Cannot disable '{0}' extension alone. '{1}' extension depends on this. Do you want to disable all these extensions?",
        extension.displayName,
        dependents[0].displayName
      );
    }
    if (dependents.length === 2) {
      return nls.localize(
        "twoDependentsError",
        "Cannot disable '{0}' extension alone. '{1}' and '{2}' extensions depend on this. Do you want to disable all these extensions?",
        extension.displayName,
        dependents[0].displayName,
        dependents[1].displayName
      );
    }
    return nls.localize(
      "multipleDependentsError",
      "Cannot disable '{0}' extension alone. '{1}', '{2}' and other extensions depend on this. Do you want to disable all these extensions?",
      extension.displayName,
      dependents[0].displayName,
      dependents[1].displayName
    );
  }
  async doSetEnablement(extensions, enablementState) {
    const changed = await this.extensionEnablementService.setEnablement(
      extensions.map((e) => e.local),
      enablementState
    );
    for (let i = 0; i < changed.length; i++) {
      if (changed[i]) {
        this.telemetryService.publicLog(
          enablementState === EnablementState.EnabledGlobally || enablementState === EnablementState.EnabledWorkspace ? "extension:enable" : "extension:disable",
          extensions[i].telemetryData
        );
      }
    }
    return changed;
  }
  // Current service reports progress when installing/uninstalling extensions
  // This is to report progress for other sources of extension install/uninstall changes
  // Since we cannot differentiate between the two, we report progress for all extension install/uninstall changes
  _activityCallBack;
  reportProgressFromOtherSources() {
    if (this.installed.some(
      (e) => e.state === ExtensionState.Installing || e.state === ExtensionState.Uninstalling
    )) {
      if (!this._activityCallBack) {
        this.withProgress(
          { location: ProgressLocation.Extensions },
          () => new Promise(
            (resolve) => this._activityCallBack = resolve
          )
        );
      }
    } else {
      this._activityCallBack?.();
      this._activityCallBack = void 0;
    }
  }
  withProgress(options, task) {
    return this.progressService.withProgress(options, async () => {
      const cancelableTask = createCancelablePromise(() => task());
      this.tasksInProgress.push(cancelableTask);
      try {
        return await cancelableTask;
      } finally {
        const index2 = this.tasksInProgress.indexOf(cancelableTask);
        if (index2 !== -1) {
          this.tasksInProgress.splice(index2, 1);
        }
      }
    });
  }
  onError(err) {
    if (isCancellationError(err)) {
      return;
    }
    const message = err && err.message || "";
    if (/getaddrinfo ENOTFOUND|getaddrinfo ENOENT|connect EACCES|connect ECONNREFUSED/.test(
      message
    )) {
      return;
    }
    this.notificationService.error(err);
  }
  handleURL(uri, options) {
    if (!/^extension/.test(uri.path)) {
      return Promise.resolve(false);
    }
    this.onOpenExtensionUrl(uri);
    return Promise.resolve(true);
  }
  onOpenExtensionUrl(uri) {
    const match = /^extension\/([^/]+)$/.exec(uri.path);
    if (!match) {
      return;
    }
    const extensionId = match[1];
    this.queryLocal().then(async (local) => {
      let extension = local.find(
        (local2) => areSameExtensions(local2.identifier, { id: extensionId })
      );
      if (!extension) {
        [extension] = await this.getExtensions(
          [{ id: extensionId }],
          { source: "uri" },
          CancellationToken.None
        );
      }
      if (extension) {
        await this.hostService.focus(mainWindow);
        await this.open(extension);
      }
    }).then(void 0, (error) => this.onError(error));
  }
  getPublishersToAutoUpdate() {
    return this.getEnabledAutoUpdateExtensions().filter(
      (id) => !EXTENSION_IDENTIFIER_REGEX.test(id)
    );
  }
  getEnabledAutoUpdateExtensions() {
    try {
      const parsedValue = JSON.parse(
        this.enabledAuotUpdateExtensionsValue
      );
      if (Array.isArray(parsedValue)) {
        return parsedValue;
      }
    } catch (e) {
    }
    return [];
  }
  setEnabledAutoUpdateExtensions(enabledAutoUpdateExtensions) {
    this.enabledAuotUpdateExtensionsValue = JSON.stringify(
      enabledAutoUpdateExtensions
    );
  }
  _enabledAutoUpdateExtensionsValue;
  get enabledAuotUpdateExtensionsValue() {
    if (!this._enabledAutoUpdateExtensionsValue) {
      this._enabledAutoUpdateExtensionsValue = this.getEnabledAutoUpdateExtensionsValue();
    }
    return this._enabledAutoUpdateExtensionsValue;
  }
  set enabledAuotUpdateExtensionsValue(enabledAuotUpdateExtensionsValue) {
    if (this.enabledAuotUpdateExtensionsValue !== enabledAuotUpdateExtensionsValue) {
      this._enabledAutoUpdateExtensionsValue = enabledAuotUpdateExtensionsValue;
      this.setEnabledAutoUpdateExtensionsValue(
        enabledAuotUpdateExtensionsValue
      );
    }
  }
  getEnabledAutoUpdateExtensionsValue() {
    return this.storageService.get(
      EXTENSIONS_AUTO_UPDATE_KEY,
      StorageScope.APPLICATION,
      "[]"
    );
  }
  setEnabledAutoUpdateExtensionsValue(value) {
    this.storageService.store(
      EXTENSIONS_AUTO_UPDATE_KEY,
      value,
      StorageScope.APPLICATION,
      StorageTarget.USER
    );
  }
  getDisabledAutoUpdateExtensions() {
    try {
      const parsedValue = JSON.parse(
        this.disabledAutoUpdateExtensionsValue
      );
      if (Array.isArray(parsedValue)) {
        return parsedValue;
      }
    } catch (e) {
    }
    return [];
  }
  setDisabledAutoUpdateExtensions(disabledAutoUpdateExtensions) {
    this.disabledAutoUpdateExtensionsValue = JSON.stringify(
      disabledAutoUpdateExtensions
    );
  }
  _disabledAutoUpdateExtensionsValue;
  get disabledAutoUpdateExtensionsValue() {
    if (!this._disabledAutoUpdateExtensionsValue) {
      this._disabledAutoUpdateExtensionsValue = this.getDisabledAutoUpdateExtensionsValue();
    }
    return this._disabledAutoUpdateExtensionsValue;
  }
  set disabledAutoUpdateExtensionsValue(disabledAutoUpdateExtensionsValue) {
    if (this.disabledAutoUpdateExtensionsValue !== disabledAutoUpdateExtensionsValue) {
      this._disabledAutoUpdateExtensionsValue = disabledAutoUpdateExtensionsValue;
      this.setDisabledAutoUpdateExtensionsValue(
        disabledAutoUpdateExtensionsValue
      );
    }
  }
  getDisabledAutoUpdateExtensionsValue() {
    return this.storageService.get(
      EXTENSIONS_DONOT_AUTO_UPDATE_KEY,
      StorageScope.APPLICATION,
      "[]"
    );
  }
  setDisabledAutoUpdateExtensionsValue(value) {
    this.storageService.store(
      EXTENSIONS_DONOT_AUTO_UPDATE_KEY,
      value,
      StorageScope.APPLICATION,
      StorageTarget.USER
    );
  }
};
ExtensionsWorkbenchService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IWorkbenchExtensionManagementService),
  __decorateParam(3, IExtensionGalleryService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IURLService),
  __decorateParam(8, IWorkbenchExtensionEnablementService),
  __decorateParam(9, IHostService),
  __decorateParam(10, IProgressService),
  __decorateParam(11, IExtensionManagementServerService),
  __decorateParam(12, ILanguageService),
  __decorateParam(13, IIgnoredExtensionsManagementService),
  __decorateParam(14, IUserDataAutoSyncService),
  __decorateParam(15, IProductService),
  __decorateParam(16, IContextKeyService),
  __decorateParam(17, IExtensionManifestPropertiesService),
  __decorateParam(18, ILogService),
  __decorateParam(19, IExtensionService),
  __decorateParam(20, ILocaleService),
  __decorateParam(21, ILifecycleService),
  __decorateParam(22, IFileService),
  __decorateParam(23, IUserDataProfileService),
  __decorateParam(24, IStorageService),
  __decorateParam(25, IDialogService),
  __decorateParam(26, IUserDataSyncEnablementService),
  __decorateParam(27, IUpdateService),
  __decorateParam(28, IUriIdentityService),
  __decorateParam(29, IWorkspaceContextService)
], ExtensionsWorkbenchService);
export {
  Extension,
  ExtensionsWorkbenchService
};
