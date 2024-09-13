var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isWeb } from "../../../base/common/platform.js";
import { format2 } from "../../../base/common/strings.js";
import { URI } from "../../../base/common/uri.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IProductService } from "../../product/common/productService.js";
import { getServiceMachineId } from "../../externalServices/common/serviceMachineId.js";
import { IStorageService } from "../../storage/common/storage.js";
import { TelemetryLevel } from "../../telemetry/common/telemetry.js";
import { getTelemetryLevel, supportsTelemetry } from "../../telemetry/common/telemetryUtils.js";
import { RemoteAuthorities } from "../../../base/common/network.js";
import { TargetPlatform } from "../../extensions/common/extensions.js";
const WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT = "/web-extension-resource/";
const IExtensionResourceLoaderService = createDecorator("extensionResourceLoaderService");
function migratePlatformSpecificExtensionGalleryResourceURL(resource, targetPlatform) {
  if (resource.query !== `target=${targetPlatform}`) {
    return void 0;
  }
  const paths = resource.path.split("/");
  if (!paths[3]) {
    return void 0;
  }
  paths[3] = `${paths[3]}+${targetPlatform}`;
  return resource.with({ query: null, path: paths.join("/") });
}
__name(migratePlatformSpecificExtensionGalleryResourceURL, "migratePlatformSpecificExtensionGalleryResourceURL");
class AbstractExtensionResourceLoaderService {
  constructor(_fileService, _storageService, _productService, _environmentService, _configurationService) {
    this._fileService = _fileService;
    this._storageService = _storageService;
    this._productService = _productService;
    this._environmentService = _environmentService;
    this._configurationService = _configurationService;
    if (_productService.extensionsGallery) {
      this._extensionGalleryResourceUrlTemplate = _productService.extensionsGallery.resourceUrlTemplate;
      this._extensionGalleryAuthority = this._extensionGalleryResourceUrlTemplate ? this._getExtensionGalleryAuthority(URI.parse(this._extensionGalleryResourceUrlTemplate)) : void 0;
    }
  }
  static {
    __name(this, "AbstractExtensionResourceLoaderService");
  }
  _serviceBrand;
  _extensionGalleryResourceUrlTemplate;
  _extensionGalleryAuthority;
  get supportsExtensionGalleryResources() {
    return this._extensionGalleryResourceUrlTemplate !== void 0;
  }
  getExtensionGalleryResourceURL({ publisher, name, version, targetPlatform }, path) {
    if (this._extensionGalleryResourceUrlTemplate) {
      const uri = URI.parse(format2(this._extensionGalleryResourceUrlTemplate, {
        publisher,
        name,
        version: targetPlatform !== void 0 && targetPlatform !== TargetPlatform.UNDEFINED && targetPlatform !== TargetPlatform.UNKNOWN && targetPlatform !== TargetPlatform.UNIVERSAL ? `${version}+${targetPlatform}` : version,
        path: "extension"
      }));
      return this._isWebExtensionResourceEndPoint(uri) ? uri.with({ scheme: RemoteAuthorities.getPreferredWebSchema() }) : uri;
    }
    return void 0;
  }
  isExtensionGalleryResource(uri) {
    return !!this._extensionGalleryAuthority && this._extensionGalleryAuthority === this._getExtensionGalleryAuthority(uri);
  }
  async getExtensionGalleryRequestHeaders() {
    const headers = {
      "X-Client-Name": `${this._productService.applicationName}${isWeb ? "-web" : ""}`,
      "X-Client-Version": this._productService.version
    };
    if (supportsTelemetry(this._productService, this._environmentService) && getTelemetryLevel(this._configurationService) === TelemetryLevel.USAGE) {
      headers["X-Machine-Id"] = await this._getServiceMachineId();
    }
    if (this._productService.commit) {
      headers["X-Client-Commit"] = this._productService.commit;
    }
    return headers;
  }
  _serviceMachineIdPromise;
  _getServiceMachineId() {
    if (!this._serviceMachineIdPromise) {
      this._serviceMachineIdPromise = getServiceMachineId(this._environmentService, this._fileService, this._storageService);
    }
    return this._serviceMachineIdPromise;
  }
  _getExtensionGalleryAuthority(uri) {
    if (this._isWebExtensionResourceEndPoint(uri)) {
      return uri.authority;
    }
    const index = uri.authority.indexOf(".");
    return index !== -1 ? uri.authority.substring(index + 1) : void 0;
  }
  _isWebExtensionResourceEndPoint(uri) {
    const uriPath = uri.path, serverRootPath = RemoteAuthorities.getServerRootPath();
    return uriPath.startsWith(serverRootPath) && uriPath.startsWith(WEB_EXTENSION_RESOURCE_END_POINT_SEGMENT, serverRootPath.length);
  }
}
export {
  AbstractExtensionResourceLoaderService,
  IExtensionResourceLoaderService,
  migratePlatformSpecificExtensionGalleryResourceURL
};
//# sourceMappingURL=extensionResourceLoader.js.map
