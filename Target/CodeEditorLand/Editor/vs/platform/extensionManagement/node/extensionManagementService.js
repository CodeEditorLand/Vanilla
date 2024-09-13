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
import * as fs from "fs";
import { Promises, Queue } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import {
  CancellationError,
  getErrorMessage
} from "../../../base/common/errors.js";
import { Emitter } from "../../../base/common/event.js";
import { hash } from "../../../base/common/hash.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ResourceMap, ResourceSet } from "../../../base/common/map.js";
import { Schemas } from "../../../base/common/network.js";
import * as path from "../../../base/common/path.js";
import { isLinux } from "../../../base/common/platform.js";
import { joinPath } from "../../../base/common/resources.js";
import * as semver from "../../../base/common/semver/semver.js";
import { isBoolean } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import * as pfs from "../../../base/node/pfs.js";
import { extract, zip } from "../../../base/node/zip.js";
import * as nls from "../../../nls.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IDownloadService } from "../../download/common/download.js";
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { isEngineValid } from "../../extensions/common/extensionValidator.js";
import {
  ExtensionType
} from "../../extensions/common/extensions.js";
import {
  FileChangeType,
  FileOperationResult,
  IFileService,
  toFileOperationResult
} from "../../files/common/files.js";
import {
  IInstantiationService,
  refineServiceDecorator
} from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IProductService } from "../../product/common/productService.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.js";
import {
  AbstractExtensionManagementService,
  AbstractExtensionTask,
  toExtensionManagementError
} from "../common/abstractExtensionManagementService.js";
import {
  EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT,
  ExtensionManagementError,
  ExtensionManagementErrorCode,
  IExtensionGalleryService,
  IExtensionManagementService,
  InstallOperation
} from "../common/extensionManagement.js";
import {
  ExtensionKey,
  areSameExtensions,
  computeTargetPlatform,
  getGalleryExtensionId,
  groupByExtension
} from "../common/extensionManagementUtil.js";
import {
  IExtensionsProfileScannerService
} from "../common/extensionsProfileScannerService.js";
import {
  IExtensionsScannerService
} from "../common/extensionsScannerService.js";
import { ExtensionsDownloader } from "./extensionDownloader.js";
import { ExtensionsLifecycle } from "./extensionLifecycle.js";
import { fromExtractError, getManifest } from "./extensionManagementUtil.js";
import { ExtensionsManifestCache } from "./extensionsManifestCache.js";
import {
  ExtensionsWatcher
} from "./extensionsWatcher.js";
const INativeServerExtensionManagementService = refineServiceDecorator(IExtensionManagementService);
const DELETED_FOLDER_POSTFIX = ".vsctmp";
let ExtensionManagementService = class extends AbstractExtensionManagementService {
  constructor(galleryService, telemetryService, logService, environmentService, extensionsScannerService, extensionsProfileScannerService, downloadService, instantiationService, fileService, configurationService, productService, uriIdentityService, userDataProfilesService) {
    super(galleryService, telemetryService, uriIdentityService, logService, productService, userDataProfilesService);
    this.environmentService = environmentService;
    this.extensionsScannerService = extensionsScannerService;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.downloadService = downloadService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    const extensionLifecycle = this._register(instantiationService.createInstance(ExtensionsLifecycle));
    this.extensionsScanner = this._register(instantiationService.createInstance(ExtensionsScanner, (extension) => extensionLifecycle.postUninstall(extension)));
    this.manifestCache = this._register(new ExtensionsManifestCache(userDataProfilesService, fileService, uriIdentityService, this, this.logService));
    this.extensionsDownloader = this._register(instantiationService.createInstance(ExtensionsDownloader));
    const extensionsWatcher = this._register(new ExtensionsWatcher(this, this.extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService));
    this._register(extensionsWatcher.onDidChangeExtensionsByAnotherSource((e) => this.onDidChangeExtensionsFromAnotherSource(e)));
    this.watchForExtensionsNotInstalledBySystem();
  }
  static {
    __name(this, "ExtensionManagementService");
  }
  extensionsScanner;
  manifestCache;
  extensionsDownloader;
  extractingGalleryExtensions = /* @__PURE__ */ new Map();
  _targetPlatformPromise;
  getTargetPlatform() {
    if (!this._targetPlatformPromise) {
      this._targetPlatformPromise = computeTargetPlatform(
        this.fileService,
        this.logService
      );
    }
    return this._targetPlatformPromise;
  }
  async zip(extension) {
    this.logService.trace(
      "ExtensionManagementService#zip",
      extension.identifier.id
    );
    const files = await this.collectFiles(extension);
    const location = await zip(
      joinPath(
        this.extensionsDownloader.extensionsDownloadDir,
        generateUuid()
      ).fsPath,
      files
    );
    return URI.file(location);
  }
  async getManifest(vsix) {
    const { location, cleanup } = await this.downloadVsix(vsix);
    const zipPath = path.resolve(location.fsPath);
    try {
      return await getManifest(zipPath);
    } finally {
      await cleanup();
    }
  }
  getInstalled(type, profileLocation = this.userDataProfilesService.defaultProfile.extensionsResource, productVersion = {
    version: this.productService.version,
    date: this.productService.date
  }) {
    return this.extensionsScanner.scanExtensions(
      type ?? null,
      profileLocation,
      productVersion
    );
  }
  scanAllUserInstalledExtensions() {
    return this.extensionsScanner.scanAllUserExtensions(false);
  }
  scanInstalledExtensionAtLocation(location) {
    return this.extensionsScanner.scanUserExtensionAtLocation(location);
  }
  async install(vsix, options = {}) {
    this.logService.trace(
      "ExtensionManagementService#install",
      vsix.toString()
    );
    const { location, cleanup } = await this.downloadVsix(vsix);
    try {
      const manifest = await getManifest(path.resolve(location.fsPath));
      const extensionId = getGalleryExtensionId(
        manifest.publisher,
        manifest.name
      );
      if (manifest.engines && manifest.engines.vscode && !isEngineValid(
        manifest.engines.vscode,
        this.productService.version,
        this.productService.date
      )) {
        throw new Error(
          nls.localize(
            "incompatible",
            "Unable to install extension '{0}' as it is not compatible with VS Code '{1}'.",
            extensionId,
            this.productService.version
          )
        );
      }
      const results = await this.installExtensions([
        { manifest, extension: location, options }
      ]);
      const result = results.find(
        ({ identifier }) => areSameExtensions(identifier, { id: extensionId })
      );
      if (result?.local) {
        return result.local;
      }
      if (result?.error) {
        throw result.error;
      }
      throw toExtensionManagementError(
        new Error(
          `Unknown error while installing extension ${extensionId}`
        )
      );
    } finally {
      await cleanup();
    }
  }
  async installFromLocation(location, profileLocation) {
    this.logService.trace(
      "ExtensionManagementService#installFromLocation",
      location.toString()
    );
    const local = await this.extensionsScanner.scanUserExtensionAtLocation(location);
    if (!local || !local.manifest.name || !local.manifest.version) {
      throw new Error(
        `Cannot find a valid extension from the location ${location.toString()}`
      );
    }
    await this.addExtensionsToProfile(
      [[local, { source: "resource" }]],
      profileLocation
    );
    this.logService.info(
      "Successfully installed extension",
      local.identifier.id,
      profileLocation.toString()
    );
    return local;
  }
  async installExtensionsFromProfile(extensions, fromProfileLocation, toProfileLocation) {
    this.logService.trace(
      "ExtensionManagementService#installExtensionsFromProfile",
      extensions,
      fromProfileLocation.toString(),
      toProfileLocation.toString()
    );
    const extensionsToInstall = (await this.getInstalled(ExtensionType.User, fromProfileLocation)).filter(
      (e) => extensions.some((id) => areSameExtensions(id, e.identifier))
    );
    if (extensionsToInstall.length) {
      const metadata = await Promise.all(
        extensionsToInstall.map(
          (e) => this.extensionsScanner.scanMetadata(e, fromProfileLocation)
        )
      );
      await this.addExtensionsToProfile(
        extensionsToInstall.map((e, index) => [e, metadata[index]]),
        toProfileLocation
      );
      this.logService.info(
        "Successfully installed extensions",
        extensionsToInstall.map((e) => e.identifier.id),
        toProfileLocation.toString()
      );
    }
    return extensionsToInstall;
  }
  async updateMetadata(local, metadata, profileLocation) {
    this.logService.trace(
      "ExtensionManagementService#updateMetadata",
      local.identifier.id
    );
    if (metadata.isPreReleaseVersion) {
      metadata.preRelease = true;
      metadata.hasPreReleaseVersion = true;
    }
    if (metadata.isMachineScoped === false) {
      metadata.isMachineScoped = void 0;
    }
    if (metadata.isBuiltin === false) {
      metadata.isBuiltin = void 0;
    }
    if (metadata.pinned === false) {
      metadata.pinned = void 0;
    }
    local = await this.extensionsScanner.updateMetadata(
      local,
      metadata,
      profileLocation
    );
    this.manifestCache.invalidate(profileLocation);
    this._onDidUpdateExtensionMetadata.fire({ local, profileLocation });
    return local;
  }
  async reinstallFromGallery(extension) {
    this.logService.trace(
      "ExtensionManagementService#reinstallFromGallery",
      extension.identifier.id
    );
    if (!this.galleryService.isEnabled()) {
      throw new Error(
        nls.localize(
          "MarketPlaceDisabled",
          "Marketplace is not enabled"
        )
      );
    }
    const targetPlatform = await this.getTargetPlatform();
    const [galleryExtension] = await this.galleryService.getExtensions(
      [{ ...extension.identifier, preRelease: extension.preRelease }],
      { targetPlatform, compatible: true },
      CancellationToken.None
    );
    if (!galleryExtension) {
      throw new Error(
        nls.localize(
          "Not a Marketplace extension",
          "Only Marketplace Extensions can be reinstalled"
        )
      );
    }
    await this.extensionsScanner.setUninstalled(extension);
    try {
      await this.extensionsScanner.removeUninstalledExtension(extension);
    } catch (e) {
      throw new Error(
        nls.localize(
          "removeError",
          "Error while removing the extension: {0}. Please Quit and Start VS Code before trying again.",
          toErrorMessage(e)
        )
      );
    }
    return this.installFromGallery(galleryExtension);
  }
  copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
    return this.extensionsScanner.copyExtension(
      extension,
      fromProfileLocation,
      toProfileLocation,
      metadata
    );
  }
  copyExtensions(fromProfileLocation, toProfileLocation) {
    return this.extensionsScanner.copyExtensions(
      fromProfileLocation,
      toProfileLocation,
      {
        version: this.productService.version,
        date: this.productService.date
      }
    );
  }
  markAsUninstalled(...extensions) {
    return this.extensionsScanner.setUninstalled(...extensions);
  }
  async cleanUp() {
    this.logService.trace("ExtensionManagementService#cleanUp");
    try {
      await this.extensionsScanner.cleanUp();
    } catch (error) {
      this.logService.error(error);
    }
  }
  async download(extension, operation, donotVerifySignature) {
    const { location } = await this.downloadExtension(
      extension,
      operation,
      !donotVerifySignature
    );
    return location;
  }
  async downloadVsix(vsix) {
    if (vsix.scheme === Schemas.file) {
      return { location: vsix, async cleanup() {
      } };
    }
    this.logService.trace("Downloading extension from", vsix.toString());
    const location = joinPath(
      this.extensionsDownloader.extensionsDownloadDir,
      generateUuid()
    );
    await this.downloadService.download(vsix, location);
    this.logService.info("Downloaded extension to", location.toString());
    const cleanup = /* @__PURE__ */ __name(async () => {
      try {
        await this.fileService.del(location);
      } catch (error) {
        this.logService.error(error);
      }
    }, "cleanup");
    return { location, cleanup };
  }
  getCurrentExtensionsManifestLocation() {
    return this.userDataProfilesService.defaultProfile.extensionsResource;
  }
  createInstallExtensionTask(manifest, extension, options) {
    const extensionKey = extension instanceof URI ? new ExtensionKey(
      {
        id: getGalleryExtensionId(
          manifest.publisher,
          manifest.name
        )
      },
      manifest.version
    ) : ExtensionKey.create(extension);
    return this.instantiationService.createInstance(
      InstallExtensionInProfileTask,
      extensionKey,
      manifest,
      extension,
      options,
      (operation, token) => {
        if (extension instanceof URI) {
          return this.extractVSIX(
            extensionKey,
            extension,
            options,
            token
          );
        }
        let promise = this.extractingGalleryExtensions.get(
          extensionKey.toString()
        );
        if (!promise) {
          this.extractingGalleryExtensions.set(
            extensionKey.toString(),
            promise = this.downloadAndExtractGalleryExtension(
              extensionKey,
              extension,
              operation,
              options,
              token
            )
          );
          promise.finally(
            () => this.extractingGalleryExtensions.delete(
              extensionKey.toString()
            )
          );
        }
        return promise;
      },
      this.extensionsScanner
    );
  }
  createUninstallExtensionTask(extension, options) {
    return new UninstallExtensionInProfileTask(
      extension,
      options,
      this.extensionsProfileScannerService
    );
  }
  async downloadAndExtractGalleryExtension(extensionKey, gallery, operation, options, token) {
    const { verificationStatus, location } = await this.downloadExtension(
      gallery,
      operation,
      !options.donotVerifySignature,
      options.context?.[EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT]
    );
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const manifest = await getManifest(location.fsPath);
      if (!new ExtensionKey(gallery.identifier, gallery.version).equals(
        new ExtensionKey(
          {
            id: getGalleryExtensionId(
              manifest.publisher,
              manifest.name
            )
          },
          manifest.version
        )
      )) {
        throw new ExtensionManagementError(
          nls.localize(
            "invalidManifest",
            "Cannot install '{0}' extension because of manifest mismatch with Marketplace",
            gallery.identifier.id
          ),
          ExtensionManagementErrorCode.Invalid
        );
      }
      const local = await this.extensionsScanner.extractUserExtension(
        extensionKey,
        location.fsPath,
        {
          id: gallery.identifier.uuid,
          publisherId: gallery.publisherId,
          publisherDisplayName: gallery.publisherDisplayName,
          targetPlatform: gallery.properties.targetPlatform,
          isApplicationScoped: options.isApplicationScoped,
          isMachineScoped: options.isMachineScoped,
          isBuiltin: options.isBuiltin,
          isPreReleaseVersion: gallery.properties.isPreReleaseVersion,
          hasPreReleaseVersion: gallery.properties.isPreReleaseVersion,
          installedTimestamp: Date.now(),
          pinned: options.installGivenVersion ? true : !!options.pinned,
          preRelease: isBoolean(options.preRelease) ? options.preRelease : options.installPreReleaseVersion || gallery.properties.isPreReleaseVersion,
          source: "gallery"
        },
        false,
        token
      );
      return { local, verificationStatus };
    } catch (error) {
      try {
        await this.extensionsDownloader.delete(location);
      } catch (e) {
        this.logService.warn(
          `Error while deleting the downloaded file`,
          location.toString(),
          getErrorMessage(e)
        );
      }
      throw toExtensionManagementError(error);
    }
  }
  async downloadExtension(extension, operation, verifySignature, clientTargetPlatform) {
    if (verifySignature) {
      const value = this.configurationService.getValue(
        "extensions.verifySignature"
      );
      verifySignature = isBoolean(value) ? value : true;
    }
    const { location, verificationStatus } = await this.extensionsDownloader.download(
      extension,
      operation,
      verifySignature,
      clientTargetPlatform
    );
    if (verificationStatus !== true && verifySignature && this.environmentService.isBuilt && !isLinux) {
      throw new ExtensionManagementError(
        nls.localize(
          "download failed",
          "Signature verification failed with '{0}' error.",
          verificationStatus === false ? "NotExecuted" : verificationStatus
        ),
        ExtensionManagementErrorCode.Signature
      );
    }
    return { location, verificationStatus };
  }
  async extractVSIX(extensionKey, location, options, token) {
    const local = await this.extensionsScanner.extractUserExtension(
      extensionKey,
      path.resolve(location.fsPath),
      {
        isApplicationScoped: options.isApplicationScoped,
        isMachineScoped: options.isMachineScoped,
        isBuiltin: options.isBuiltin,
        installedTimestamp: Date.now(),
        pinned: options.installGivenVersion ? true : !!options.pinned,
        source: "vsix"
      },
      options.keepExisting ?? true,
      token
    );
    return { local };
  }
  async collectFiles(extension) {
    const collectFilesFromDirectory = /* @__PURE__ */ __name(async (dir) => {
      let entries = await pfs.Promises.readdir(dir);
      entries = entries.map((e) => path.join(dir, e));
      const stats = await Promise.all(
        entries.map((e) => fs.promises.stat(e))
      );
      let promise = Promise.resolve([]);
      stats.forEach((stat, index) => {
        const entry = entries[index];
        if (stat.isFile()) {
          promise = promise.then((result) => [...result, entry]);
        }
        if (stat.isDirectory()) {
          promise = promise.then(
            (result) => collectFilesFromDirectory(entry).then((files2) => [
              ...result,
              ...files2
            ])
          );
        }
      });
      return promise;
    }, "collectFilesFromDirectory");
    const files = await collectFilesFromDirectory(
      extension.location.fsPath
    );
    return files.map((f) => ({
      path: `extension/${path.relative(extension.location.fsPath, f)}`,
      localPath: f
    }));
  }
  async onDidChangeExtensionsFromAnotherSource({
    added,
    removed
  }) {
    if (removed) {
      const removedExtensions = added && this.uriIdentityService.extUri.isEqual(
        removed.profileLocation,
        added.profileLocation
      ) ? removed.extensions.filter(
        (e) => added.extensions.every(
          (identifier) => !areSameExtensions(identifier, e)
        )
      ) : removed.extensions;
      for (const identifier of removedExtensions) {
        this.logService.info(
          "Extensions removed from another source",
          identifier.id,
          removed.profileLocation.toString()
        );
        this._onDidUninstallExtension.fire({
          identifier,
          profileLocation: removed.profileLocation
        });
      }
    }
    if (added) {
      const extensions = await this.getInstalled(
        ExtensionType.User,
        added.profileLocation
      );
      const addedExtensions = extensions.filter(
        (e) => added.extensions.some(
          (identifier) => areSameExtensions(identifier, e.identifier)
        )
      );
      this._onDidInstallExtensions.fire(
        addedExtensions.map((local) => {
          this.logService.info(
            "Extensions added from another source",
            local.identifier.id,
            added.profileLocation.toString()
          );
          return {
            identifier: local.identifier,
            local,
            profileLocation: added.profileLocation,
            operation: InstallOperation.None
          };
        })
      );
    }
  }
  knownDirectories = new ResourceSet();
  async watchForExtensionsNotInstalledBySystem() {
    this._register(
      this.extensionsScanner.onExtract(
        (resource) => this.knownDirectories.add(resource)
      )
    );
    const stat = await this.fileService.resolve(
      this.extensionsScannerService.userExtensionsLocation
    );
    for (const childStat of stat.children ?? []) {
      if (childStat.isDirectory) {
        this.knownDirectories.add(childStat.resource);
      }
    }
    this._register(
      this.fileService.watch(
        this.extensionsScannerService.userExtensionsLocation
      )
    );
    this._register(
      this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e))
    );
  }
  async onDidFilesChange(e) {
    if (!e.affects(
      this.extensionsScannerService.userExtensionsLocation,
      FileChangeType.ADDED
    )) {
      return;
    }
    const added = [];
    for (const resource of e.rawAdded) {
      if (this.knownDirectories.has(resource)) {
        continue;
      }
      if (!this.uriIdentityService.extUri.isEqual(
        this.uriIdentityService.extUri.dirname(resource),
        this.extensionsScannerService.userExtensionsLocation
      )) {
        continue;
      }
      if (this.uriIdentityService.extUri.isEqual(
        resource,
        this.uriIdentityService.extUri.joinPath(
          this.extensionsScannerService.userExtensionsLocation,
          ".obsolete"
        )
      )) {
        continue;
      }
      if (this.uriIdentityService.extUri.basename(resource).startsWith(".")) {
        continue;
      }
      if (!(await this.fileService.stat(resource)).isDirectory) {
        continue;
      }
      const extension = await this.extensionsScanner.scanUserExtensionAtLocation(
        resource
      );
      if (extension && extension.installedTimestamp === void 0) {
        this.knownDirectories.add(resource);
        added.push(extension);
      }
    }
    if (added.length) {
      await this.addExtensionsToProfile(
        added.map((e2) => [e2, void 0]),
        this.userDataProfilesService.defaultProfile.extensionsResource
      );
      this.logService.info(
        "Added extensions to default profile from external source",
        added.map((e2) => e2.identifier.id)
      );
    }
  }
  async addExtensionsToProfile(extensions, profileLocation) {
    const localExtensions = extensions.map((e) => e[0]);
    await this.setInstalled(localExtensions);
    await this.extensionsProfileScannerService.addExtensionsToProfile(
      extensions,
      profileLocation
    );
    this._onDidInstallExtensions.fire(
      localExtensions.map((local) => ({
        local,
        identifier: local.identifier,
        operation: InstallOperation.None,
        profileLocation
      }))
    );
  }
  async setInstalled(extensions) {
    const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
    for (const extension of extensions) {
      const extensionKey = ExtensionKey.create(extension);
      if (!uninstalled[extensionKey.toString()]) {
        continue;
      }
      this.logService.trace(
        "Removing the extension from uninstalled list:",
        extensionKey.id
      );
      await this.extensionsScanner.setInstalled(extensionKey);
      this.logService.info(
        "Removed the extension from uninstalled list:",
        extensionKey.id
      );
    }
  }
};
ExtensionManagementService = __decorateClass([
  __decorateParam(0, IExtensionGalleryService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INativeEnvironmentService),
  __decorateParam(4, IExtensionsScannerService),
  __decorateParam(5, IExtensionsProfileScannerService),
  __decorateParam(6, IDownloadService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IUriIdentityService),
  __decorateParam(12, IUserDataProfilesService)
], ExtensionManagementService);
let ExtensionsScanner = class extends Disposable {
  constructor(beforeRemovingExtension, fileService, extensionsScannerService, extensionsProfileScannerService, uriIdentityService, telemetryService, logService) {
    super();
    this.beforeRemovingExtension = beforeRemovingExtension;
    this.fileService = fileService;
    this.extensionsScannerService = extensionsScannerService;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.uriIdentityService = uriIdentityService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.uninstalledResource = joinPath(this.extensionsScannerService.userExtensionsLocation, ".obsolete");
    this.uninstalledFileLimiter = new Queue();
  }
  static {
    __name(this, "ExtensionsScanner");
  }
  uninstalledResource;
  uninstalledFileLimiter;
  _onExtract = this._register(new Emitter());
  onExtract = this._onExtract.event;
  scanAllExtensionPromise = new ResourceMap();
  scanUserExtensionsPromise = new ResourceMap();
  async cleanUp() {
    await this.removeTemporarilyDeletedFolders();
    await this.removeUninstalledExtensions();
  }
  async scanExtensions(type, profileLocation, productVersion) {
    try {
      const userScanOptions = {
        includeInvalid: true,
        profileLocation,
        productVersion
      };
      let scannedExtensions = [];
      if (type === null || type === ExtensionType.System) {
        let scanAllExtensionsPromise = this.scanAllExtensionPromise.get(profileLocation);
        if (!scanAllExtensionsPromise) {
          scanAllExtensionsPromise = this.extensionsScannerService.scanAllExtensions(
            { includeInvalid: true, useCache: true },
            userScanOptions,
            false
          ).finally(
            () => this.scanAllExtensionPromise.delete(
              profileLocation
            )
          );
          this.scanAllExtensionPromise.set(
            profileLocation,
            scanAllExtensionsPromise
          );
        }
        scannedExtensions.push(...await scanAllExtensionsPromise);
      } else if (type === ExtensionType.User) {
        let scanUserExtensionsPromise = this.scanUserExtensionsPromise.get(profileLocation);
        if (!scanUserExtensionsPromise) {
          scanUserExtensionsPromise = this.extensionsScannerService.scanUserExtensions(userScanOptions).finally(
            () => this.scanUserExtensionsPromise.delete(
              profileLocation
            )
          );
          this.scanUserExtensionsPromise.set(
            profileLocation,
            scanUserExtensionsPromise
          );
        }
        scannedExtensions.push(...await scanUserExtensionsPromise);
      }
      scannedExtensions = type !== null ? scannedExtensions.filter((r) => r.type === type) : scannedExtensions;
      return await Promise.all(
        scannedExtensions.map(
          (extension) => this.toLocalExtension(extension)
        )
      );
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.Scanning
      );
    }
  }
  async scanAllUserExtensions(excludeOutdated) {
    try {
      const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({
        includeAllVersions: !excludeOutdated,
        includeInvalid: true
      });
      return await Promise.all(
        scannedExtensions.map(
          (extension) => this.toLocalExtension(extension)
        )
      );
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.Scanning
      );
    }
  }
  async scanUserExtensionAtLocation(location) {
    try {
      const scannedExtension = await this.extensionsScannerService.scanExistingExtension(
        location,
        ExtensionType.User,
        { includeInvalid: true }
      );
      if (scannedExtension) {
        return await this.toLocalExtension(scannedExtension);
      }
    } catch (error) {
      this.logService.error(error);
    }
    return null;
  }
  async extractUserExtension(extensionKey, zipPath, metadata, removeIfExists, token) {
    const folderName = extensionKey.toString();
    const tempLocation = URI.file(
      path.join(
        this.extensionsScannerService.userExtensionsLocation.fsPath,
        `.${generateUuid()}`
      )
    );
    const extensionLocation = URI.file(
      path.join(
        this.extensionsScannerService.userExtensionsLocation.fsPath,
        folderName
      )
    );
    if (await this.fileService.exists(extensionLocation)) {
      if (!removeIfExists) {
        try {
          return await this.scanLocalExtension(
            extensionLocation,
            ExtensionType.User
          );
        } catch (error) {
          this.logService.warn(
            `Error while scanning the existing extension at ${extensionLocation.path}. Deleting the existing extension and extracting it.`,
            getErrorMessage(error)
          );
        }
      }
      try {
        await this.deleteExtensionFromLocation(
          extensionKey.id,
          extensionLocation,
          "removeExisting"
        );
      } catch (error) {
        throw new ExtensionManagementError(
          nls.localize(
            "errorDeleting",
            "Unable to delete the existing folder '{0}' while installing the extension '{1}'. Please delete the folder manually and try again",
            extensionLocation.fsPath,
            extensionKey.id
          ),
          ExtensionManagementErrorCode.Delete
        );
      }
    }
    try {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      try {
        this.logService.trace(
          `Started extracting the extension from ${zipPath} to ${extensionLocation.fsPath}`
        );
        await extract(
          zipPath,
          tempLocation.fsPath,
          { sourcePath: "extension", overwrite: true },
          token
        );
        this.logService.info(
          `Extracted extension to ${extensionLocation}:`,
          extensionKey.id
        );
      } catch (e) {
        throw fromExtractError(e);
      }
      try {
        await this.extensionsScannerService.updateMetadata(
          tempLocation,
          metadata
        );
      } catch (error) {
        this.telemetryService.publicLog2("extension:extract", {
          extensionId: extensionKey.id,
          code: `${toFileOperationResult(error)}`
        });
        throw toExtensionManagementError(
          error,
          ExtensionManagementErrorCode.UpdateMetadata
        );
      }
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      try {
        this.logService.trace(
          `Started renaming the extension from ${tempLocation.fsPath} to ${extensionLocation.fsPath}`
        );
        await this.rename(
          tempLocation.fsPath,
          extensionLocation.fsPath
        );
        this.logService.info("Renamed to", extensionLocation.fsPath);
      } catch (error) {
        if (error.code === "ENOTEMPTY") {
          this.logService.info(
            `Rename failed because extension was installed by another source. So ignoring renaming.`,
            extensionKey.id
          );
          try {
            await this.fileService.del(tempLocation, {
              recursive: true
            });
          } catch (e) {
          }
        } else {
          this.logService.info(
            `Rename failed because of ${getErrorMessage(error)}. Deleted from extracted location`,
            tempLocation
          );
          throw error;
        }
      }
      this._onExtract.fire(extensionLocation);
    } catch (error) {
      try {
        await this.fileService.del(tempLocation, { recursive: true });
      } catch (e) {
      }
      throw error;
    }
    return this.scanLocalExtension(extensionLocation, ExtensionType.User);
  }
  async scanMetadata(local, profileLocation) {
    if (profileLocation) {
      const extension = await this.getScannedExtension(
        local,
        profileLocation
      );
      return extension?.metadata;
    } else {
      return this.extensionsScannerService.scanMetadata(local.location);
    }
  }
  async getScannedExtension(local, profileLocation) {
    const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(
      profileLocation
    );
    return extensions.find(
      (e) => areSameExtensions(e.identifier, local.identifier)
    );
  }
  async updateMetadata(local, metadata, profileLocation) {
    try {
      if (profileLocation) {
        await this.extensionsProfileScannerService.updateMetadata(
          [[local, metadata]],
          profileLocation
        );
      } else {
        await this.extensionsScannerService.updateMetadata(
          local.location,
          metadata
        );
      }
    } catch (error) {
      this.telemetryService.publicLog2("extension:extract", {
        extensionId: local.identifier.id,
        code: `${toFileOperationResult(error)}`,
        isProfile: !!profileLocation
      });
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.UpdateMetadata
      );
    }
    return this.scanLocalExtension(
      local.location,
      local.type,
      profileLocation
    );
  }
  async getUninstalledExtensions() {
    try {
      return await this.withUninstalledExtensions();
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.ReadUninstalled
      );
    }
  }
  async setUninstalled(...extensions) {
    const extensionKeys = extensions.map(
      (e) => ExtensionKey.create(e)
    );
    await this.withUninstalledExtensions(
      (uninstalled) => extensionKeys.forEach((extensionKey) => {
        uninstalled[extensionKey.toString()] = true;
        this.logService.info(
          "Marked extension as uninstalled",
          extensionKey.toString()
        );
      })
    );
  }
  async setInstalled(extensionKey) {
    try {
      await this.withUninstalledExtensions(
        (uninstalled) => delete uninstalled[extensionKey.toString()]
      );
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.UnsetUninstalled
      );
    }
  }
  async removeExtension(extension, type) {
    if (this.uriIdentityService.extUri.isEqualOrParent(
      extension.location,
      this.extensionsScannerService.userExtensionsLocation
    )) {
      return this.deleteExtensionFromLocation(
        extension.identifier.id,
        extension.location,
        type
      );
    }
  }
  async removeUninstalledExtension(extension) {
    await this.removeExtension(extension, "uninstalled");
    await this.withUninstalledExtensions(
      (uninstalled) => delete uninstalled[ExtensionKey.create(extension).toString()]
    );
  }
  async copyExtension(extension, fromProfileLocation, toProfileLocation, metadata) {
    const source = await this.getScannedExtension(
      extension,
      fromProfileLocation
    );
    const target = await this.getScannedExtension(
      extension,
      toProfileLocation
    );
    metadata = { ...source?.metadata, ...metadata };
    if (target) {
      if (this.uriIdentityService.extUri.isEqual(
        target.location,
        extension.location
      )) {
        await this.extensionsProfileScannerService.updateMetadata(
          [[extension, { ...target.metadata, ...metadata }]],
          toProfileLocation
        );
      } else {
        const targetExtension = await this.scanLocalExtension(
          target.location,
          extension.type,
          toProfileLocation
        );
        await this.extensionsProfileScannerService.removeExtensionFromProfile(
          targetExtension,
          toProfileLocation
        );
        await this.extensionsProfileScannerService.addExtensionsToProfile(
          [[extension, { ...target.metadata, ...metadata }]],
          toProfileLocation
        );
      }
    } else {
      await this.extensionsProfileScannerService.addExtensionsToProfile(
        [[extension, metadata]],
        toProfileLocation
      );
    }
    return this.scanLocalExtension(
      extension.location,
      extension.type,
      toProfileLocation
    );
  }
  async copyExtensions(fromProfileLocation, toProfileLocation, productVersion) {
    const fromExtensions = await this.scanExtensions(
      ExtensionType.User,
      fromProfileLocation,
      productVersion
    );
    const extensions = await Promise.all(
      fromExtensions.filter(
        (e) => !e.isApplicationScoped
      ).map(async (e) => [
        e,
        await this.scanMetadata(e, fromProfileLocation)
      ])
    );
    await this.extensionsProfileScannerService.addExtensionsToProfile(
      extensions,
      toProfileLocation
    );
  }
  async deleteExtensionFromLocation(id, location, type) {
    this.logService.trace(
      `Deleting ${type} extension from disk`,
      id,
      location.fsPath
    );
    const renamedLocation = this.uriIdentityService.extUri.joinPath(
      this.uriIdentityService.extUri.dirname(location),
      `${this.uriIdentityService.extUri.basename(location)}.${hash(generateUuid()).toString(16)}${DELETED_FOLDER_POSTFIX}`
    );
    await this.rename(location.fsPath, renamedLocation.fsPath);
    await this.fileService.del(renamedLocation, { recursive: true });
    this.logService.info(
      `Deleted ${type} extension from disk`,
      id,
      location.fsPath
    );
  }
  withUninstalledExtensions(updateFn) {
    return this.uninstalledFileLimiter.queue(async () => {
      let raw;
      try {
        const content = await this.fileService.readFile(
          this.uninstalledResource,
          "utf8"
        );
        raw = content.value.toString();
      } catch (error) {
        if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
          throw error;
        }
      }
      let uninstalled = {};
      if (raw) {
        try {
          uninstalled = JSON.parse(raw);
        } catch (e) {
        }
      }
      if (updateFn) {
        updateFn(uninstalled);
        if (Object.keys(uninstalled).length) {
          await this.fileService.writeFile(
            this.uninstalledResource,
            VSBuffer.fromString(JSON.stringify(uninstalled))
          );
        } else {
          await this.fileService.del(this.uninstalledResource);
        }
      }
      return uninstalled;
    });
  }
  async rename(extractPath, renamePath) {
    try {
      await pfs.Promises.rename(
        extractPath,
        renamePath,
        2 * 60 * 1e3
      );
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.Rename
      );
    }
  }
  async scanLocalExtension(location, type, profileLocation) {
    try {
      if (profileLocation) {
        const scannedExtensions = await this.extensionsScannerService.scanUserExtensions({
          profileLocation
        });
        const scannedExtension = scannedExtensions.find(
          (e) => this.uriIdentityService.extUri.isEqual(
            e.location,
            location
          )
        );
        if (scannedExtension) {
          return await this.toLocalExtension(scannedExtension);
        }
      } else {
        const scannedExtension = await this.extensionsScannerService.scanExistingExtension(
          location,
          type,
          { includeInvalid: true }
        );
        if (scannedExtension) {
          return await this.toLocalExtension(scannedExtension);
        }
      }
      throw new ExtensionManagementError(
        nls.localize(
          "cannot read",
          "Cannot read the extension from {0}",
          location.path
        ),
        ExtensionManagementErrorCode.ScanningExtension
      );
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.ScanningExtension
      );
    }
  }
  async toLocalExtension(extension) {
    const stat = await this.fileService.resolve(extension.location);
    let readmeUrl;
    let changelogUrl;
    if (stat.children) {
      readmeUrl = stat.children.find(
        ({ name }) => /^readme(\.txt|\.md|)$/i.test(name)
      )?.resource;
      changelogUrl = stat.children.find(
        ({ name }) => /^changelog(\.txt|\.md|)$/i.test(name)
      )?.resource;
    }
    return {
      identifier: extension.identifier,
      type: extension.type,
      isBuiltin: extension.isBuiltin || !!extension.metadata?.isBuiltin,
      location: extension.location,
      manifest: extension.manifest,
      targetPlatform: extension.targetPlatform,
      validations: extension.validations,
      isValid: extension.isValid,
      readmeUrl,
      changelogUrl,
      publisherDisplayName: extension.metadata?.publisherDisplayName,
      publisherId: extension.metadata?.publisherId || null,
      isApplicationScoped: !!extension.metadata?.isApplicationScoped,
      isMachineScoped: !!extension.metadata?.isMachineScoped,
      isPreReleaseVersion: !!extension.metadata?.isPreReleaseVersion,
      hasPreReleaseVersion: !!extension.metadata?.hasPreReleaseVersion,
      preRelease: !!extension.metadata?.preRelease,
      installedTimestamp: extension.metadata?.installedTimestamp,
      updated: !!extension.metadata?.updated,
      pinned: !!extension.metadata?.pinned,
      isWorkspaceScoped: false,
      source: extension.metadata?.source ?? (extension.identifier.uuid ? "gallery" : "vsix")
    };
  }
  async removeUninstalledExtensions() {
    const uninstalled = await this.getUninstalledExtensions();
    if (Object.keys(uninstalled).length === 0) {
      this.logService.debug(`No uninstalled extensions found.`);
      return;
    }
    this.logService.debug(
      `Removing uninstalled extensions:`,
      Object.keys(uninstalled)
    );
    const extensions = await this.extensionsScannerService.scanUserExtensions({
      includeAllVersions: true,
      includeUninstalled: true,
      includeInvalid: true
    });
    const installed = /* @__PURE__ */ new Set();
    for (const e of extensions) {
      if (!uninstalled[ExtensionKey.create(e).toString()]) {
        installed.add(e.identifier.id.toLowerCase());
      }
    }
    try {
      const byExtension = groupByExtension(
        extensions,
        (e) => e.identifier
      );
      await Promises.settled(
        byExtension.map(async (e) => {
          const latest = e.sort(
            (a, b) => semver.rcompare(a.manifest.version, b.manifest.version)
          )[0];
          if (!installed.has(latest.identifier.id.toLowerCase())) {
            await this.beforeRemovingExtension(
              await this.toLocalExtension(latest)
            );
          }
        })
      );
    } catch (error) {
      this.logService.error(error);
    }
    const toRemove = extensions.filter(
      (e) => e.metadata && uninstalled[ExtensionKey.create(e).toString()]
    );
    await Promise.allSettled(
      toRemove.map((e) => this.removeUninstalledExtension(e))
    );
  }
  async removeTemporarilyDeletedFolders() {
    this.logService.trace(
      "ExtensionManagementService#removeTempDeleteFolders"
    );
    let stat;
    try {
      stat = await this.fileService.resolve(
        this.extensionsScannerService.userExtensionsLocation
      );
    } catch (error) {
      if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
        this.logService.error(error);
      }
      return;
    }
    if (!stat?.children) {
      return;
    }
    try {
      await Promise.allSettled(
        stat.children.map(async (child) => {
          if (!child.isDirectory || !child.name.endsWith(DELETED_FOLDER_POSTFIX)) {
            return;
          }
          this.logService.trace(
            "Deleting the temporarily deleted folder",
            child.resource.toString()
          );
          try {
            await this.fileService.del(child.resource, {
              recursive: true
            });
            this.logService.trace(
              "Deleted the temporarily deleted folder",
              child.resource.toString()
            );
          } catch (error) {
            if (toFileOperationResult(error) !== FileOperationResult.FILE_NOT_FOUND) {
              this.logService.error(error);
            }
          }
        })
      );
    } catch (error) {
    }
  }
};
ExtensionsScanner = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IExtensionsScannerService),
  __decorateParam(3, IExtensionsProfileScannerService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService)
], ExtensionsScanner);
let InstallExtensionInProfileTask = class extends AbstractExtensionTask {
  constructor(extensionKey, manifest, source, options, extractExtensionFn, extensionsScanner, uriIdentityService, galleryService, userDataProfilesService, extensionsScannerService, extensionsProfileScannerService, logService) {
    super();
    this.extensionKey = extensionKey;
    this.manifest = manifest;
    this.source = source;
    this.options = options;
    this.extractExtensionFn = extractExtensionFn;
    this.extensionsScanner = extensionsScanner;
    this.uriIdentityService = uriIdentityService;
    this.galleryService = galleryService;
    this.userDataProfilesService = userDataProfilesService;
    this.extensionsScannerService = extensionsScannerService;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
    this.logService = logService;
    this.identifier = this.extensionKey.identifier;
  }
  static {
    __name(this, "InstallExtensionInProfileTask");
  }
  _operation = InstallOperation.Install;
  get operation() {
    return this.options.operation ?? this._operation;
  }
  _verificationStatus;
  get verificationStatus() {
    return this._verificationStatus;
  }
  identifier;
  async doRun(token) {
    const installed = await this.extensionsScanner.scanExtensions(
      ExtensionType.User,
      this.options.profileLocation,
      this.options.productVersion
    );
    const existingExtension = installed.find(
      (i) => areSameExtensions(i.identifier, this.identifier)
    );
    if (existingExtension) {
      this._operation = InstallOperation.Update;
    }
    const metadata = {
      isApplicationScoped: this.options.isApplicationScoped || existingExtension?.isApplicationScoped,
      isMachineScoped: this.options.isMachineScoped || existingExtension?.isMachineScoped,
      isBuiltin: this.options.isBuiltin || existingExtension?.isBuiltin,
      isSystem: existingExtension?.type === ExtensionType.System ? true : void 0,
      installedTimestamp: Date.now(),
      pinned: this.options.installGivenVersion ? true : this.options.pinned ?? existingExtension?.pinned,
      source: this.source instanceof URI ? "vsix" : "gallery"
    };
    let local;
    if (this.source instanceof URI) {
      if (existingExtension) {
        if (this.extensionKey.equals(
          new ExtensionKey(
            existingExtension.identifier,
            existingExtension.manifest.version
          )
        )) {
          try {
            await this.extensionsScanner.removeExtension(
              existingExtension,
              "existing"
            );
          } catch (e) {
            throw new Error(
              nls.localize(
                "restartCode",
                "Please restart VS Code before reinstalling {0}.",
                this.manifest.displayName || this.manifest.name
              )
            );
          }
        }
      }
      const existingWithSameVersion = await this.unsetIfUninstalled(
        this.extensionKey
      );
      if (existingWithSameVersion) {
        try {
          await this.extensionsScanner.removeExtension(
            existingWithSameVersion,
            "existing"
          );
        } catch (e) {
          throw new Error(
            nls.localize(
              "restartCode",
              "Please restart VS Code before reinstalling {0}.",
              this.manifest.displayName || this.manifest.name
            )
          );
        }
      }
    } else {
      metadata.id = this.source.identifier.uuid;
      metadata.publisherId = this.source.publisherId;
      metadata.publisherDisplayName = this.source.publisherDisplayName;
      metadata.targetPlatform = this.source.properties.targetPlatform;
      metadata.updated = !!existingExtension;
      metadata.isPreReleaseVersion = this.source.properties.isPreReleaseVersion;
      metadata.hasPreReleaseVersion = existingExtension?.hasPreReleaseVersion || this.source.properties.isPreReleaseVersion;
      metadata.preRelease = isBoolean(this.options.preRelease) ? this.options.preRelease : this.options.installPreReleaseVersion || this.source.properties.isPreReleaseVersion || existingExtension?.preRelease;
      if (existingExtension && existingExtension.type !== ExtensionType.System && existingExtension.manifest.version === this.source.version) {
        return this.extensionsScanner.updateMetadata(
          existingExtension,
          metadata,
          this.options.profileLocation
        );
      }
      local = await this.unsetIfUninstalled(this.extensionKey);
    }
    if (token.isCancellationRequested) {
      throw toExtensionManagementError(new CancellationError());
    }
    if (!local) {
      const result2 = await this.extractExtensionFn(this.operation, token);
      local = result2.local;
      this._verificationStatus = result2.verificationStatus;
    }
    if (this.uriIdentityService.extUri.isEqual(
      this.userDataProfilesService.defaultProfile.extensionsResource,
      this.options.profileLocation
    )) {
      try {
        await this.extensionsScannerService.initializeDefaultProfileExtensions();
      } catch (error) {
        throw toExtensionManagementError(
          error,
          ExtensionManagementErrorCode.IntializeDefaultProfile
        );
      }
    }
    if (token.isCancellationRequested) {
      throw toExtensionManagementError(new CancellationError());
    }
    try {
      await this.extensionsProfileScannerService.addExtensionsToProfile(
        [[local, metadata]],
        this.options.profileLocation,
        !local.isValid
      );
    } catch (error) {
      throw toExtensionManagementError(
        error,
        ExtensionManagementErrorCode.AddToProfile
      );
    }
    const result = await this.extensionsScanner.scanLocalExtension(
      local.location,
      ExtensionType.User,
      this.options.profileLocation
    );
    if (!result) {
      throw new ExtensionManagementError(
        "Cannot find the installed extension",
        ExtensionManagementErrorCode.InstalledExtensionNotFound
      );
    }
    if (this.source instanceof URI) {
      this.updateMetadata(local, token);
    }
    return result;
  }
  async unsetIfUninstalled(extensionKey) {
    const uninstalled = await this.extensionsScanner.getUninstalledExtensions();
    if (!uninstalled[extensionKey.toString()]) {
      return void 0;
    }
    this.logService.trace(
      "Removing the extension from uninstalled list:",
      extensionKey.id
    );
    await this.extensionsScanner.setInstalled(extensionKey);
    this.logService.info(
      "Removed the extension from uninstalled list:",
      extensionKey.id
    );
    const userExtensions = await this.extensionsScanner.scanAllUserExtensions(true);
    return userExtensions.find(
      (i) => ExtensionKey.create(i).equals(extensionKey)
    );
  }
  async updateMetadata(extension, token) {
    try {
      let [galleryExtension] = await this.galleryService.getExtensions(
        [
          {
            id: extension.identifier.id,
            version: extension.manifest.version
          }
        ],
        token
      );
      if (!galleryExtension) {
        [galleryExtension] = await this.galleryService.getExtensions(
          [{ id: extension.identifier.id }],
          token
        );
      }
      if (galleryExtension) {
        const metadata = {
          id: galleryExtension.identifier.uuid,
          publisherDisplayName: galleryExtension.publisherDisplayName,
          publisherId: galleryExtension.publisherId,
          isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion,
          hasPreReleaseVersion: extension.hasPreReleaseVersion || galleryExtension.properties.isPreReleaseVersion,
          preRelease: galleryExtension.properties.isPreReleaseVersion || this.options.installPreReleaseVersion
        };
        await this.extensionsScanner.updateMetadata(
          extension,
          metadata,
          this.options.profileLocation
        );
      }
    } catch (error) {
    }
  }
};
InstallExtensionInProfileTask = __decorateClass([
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IExtensionGalleryService),
  __decorateParam(8, IUserDataProfilesService),
  __decorateParam(9, IExtensionsScannerService),
  __decorateParam(10, IExtensionsProfileScannerService),
  __decorateParam(11, ILogService)
], InstallExtensionInProfileTask);
class UninstallExtensionInProfileTask extends AbstractExtensionTask {
  constructor(extension, options, extensionsProfileScannerService) {
    super();
    this.extension = extension;
    this.options = options;
    this.extensionsProfileScannerService = extensionsProfileScannerService;
  }
  static {
    __name(this, "UninstallExtensionInProfileTask");
  }
  async doRun(token) {
    await this.extensionsProfileScannerService.removeExtensionFromProfile(
      this.extension,
      this.options.profileLocation
    );
  }
}
export {
  ExtensionManagementService,
  ExtensionsScanner,
  INativeServerExtensionManagementService
};
//# sourceMappingURL=extensionManagementService.js.map
