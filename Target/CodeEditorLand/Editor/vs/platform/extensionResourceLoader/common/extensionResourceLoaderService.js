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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../instantiation/common/extensions.js";
import { IProductService } from "../../product/common/productService.js";
import {
  IRequestService,
  asTextOrError
} from "../../request/common/request.js";
import { IStorageService } from "../../storage/common/storage.js";
import {
  AbstractExtensionResourceLoaderService,
  IExtensionResourceLoaderService
} from "./extensionResourceLoader.js";
let ExtensionResourceLoaderService = class extends AbstractExtensionResourceLoaderService {
  constructor(fileService, storageService, productService, environmentService, configurationService, _requestService) {
    super(fileService, storageService, productService, environmentService, configurationService);
    this._requestService = _requestService;
  }
  async readExtensionResource(uri) {
    if (this.isExtensionGalleryResource(uri)) {
      const headers = await this.getExtensionGalleryRequestHeaders();
      const requestContext = await this._requestService.request(
        { url: uri.toString(), headers },
        CancellationToken.None
      );
      return await asTextOrError(requestContext) || "";
    }
    const result = await this._fileService.readFile(uri);
    return result.value.toString();
  }
};
ExtensionResourceLoaderService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IRequestService)
], ExtensionResourceLoaderService);
registerSingleton(
  IExtensionResourceLoaderService,
  ExtensionResourceLoaderService,
  InstantiationType.Delayed
);
export {
  ExtensionResourceLoaderService
};
