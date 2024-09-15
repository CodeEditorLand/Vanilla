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
import { IChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from "../common/extensionManagement.js";
import { URI } from "../../../../base/common/uri.js";
import { ILocalExtension, InstallOptions } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { joinPath } from "../../../../base/common/resources.js";
import { Schemas } from "../../../../base/common/network.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IDownloadService } from "../../../../platform/download/common/download.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { ProfileAwareExtensionManagementChannelClient } from "../common/extensionManagementChannelClient.js";
import { ExtensionIdentifier, ExtensionType, isResolverExtension } from "../../../../platform/extensions/common/extensions.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
let NativeExtensionManagementService = class extends ProfileAwareExtensionManagementChannelClient {
  constructor(channel, userDataProfileService, uriIdentityService, fileService, downloadService, nativeEnvironmentService, logService) {
    super(channel, userDataProfileService, uriIdentityService);
    this.fileService = fileService;
    this.downloadService = downloadService;
    this.nativeEnvironmentService = nativeEnvironmentService;
    this.logService = logService;
  }
  static {
    __name(this, "NativeExtensionManagementService");
  }
  filterEvent(profileLocation, isApplicationScoped) {
    return isApplicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
  }
  async install(vsix, options) {
    const { location, cleanup } = await this.downloadVsix(vsix);
    try {
      return await super.install(location, options);
    } finally {
      await cleanup();
    }
  }
  async downloadVsix(vsix) {
    if (vsix.scheme === Schemas.file) {
      return { location: vsix, async cleanup() {
      } };
    }
    this.logService.trace("Downloading extension from", vsix.toString());
    const location = joinPath(this.nativeEnvironmentService.extensionsDownloadLocation, generateUuid());
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
  async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
    if (this.nativeEnvironmentService.remoteAuthority) {
      const previousInstalledExtensions = await this.getInstalled(ExtensionType.User, previousProfileLocation);
      const resolverExtension = previousInstalledExtensions.find((e) => isResolverExtension(e.manifest, this.nativeEnvironmentService.remoteAuthority));
      if (resolverExtension) {
        if (!preserveExtensions) {
          preserveExtensions = [];
        }
        preserveExtensions.push(new ExtensionIdentifier(resolverExtension.identifier.id));
      }
    }
    return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
  }
};
NativeExtensionManagementService = __decorateClass([
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IDownloadService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, ILogService)
], NativeExtensionManagementService);
export {
  NativeExtensionManagementService
};
//# sourceMappingURL=nativeExtensionManagementService.js.map
