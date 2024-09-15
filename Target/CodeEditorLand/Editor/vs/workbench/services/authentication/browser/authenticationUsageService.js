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
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
const IAuthenticationUsageService = createDecorator("IAuthenticationUsageService");
let AuthenticationUsageService = class {
  constructor(_storageService) {
    this._storageService = _storageService;
  }
  static {
    __name(this, "AuthenticationUsageService");
  }
  _serviceBrand;
  readAccountUsages(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const storedUsages = this._storageService.get(accountKey, StorageScope.APPLICATION);
    let usages = [];
    if (storedUsages) {
      try {
        usages = JSON.parse(storedUsages);
      } catch (e) {
      }
    }
    return usages;
  }
  removeAccountUsage(providerId, accountName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    this._storageService.remove(accountKey, StorageScope.APPLICATION);
  }
  addAccountUsage(providerId, accountName, extensionId, extensionName) {
    const accountKey = `${providerId}-${accountName}-usages`;
    const usages = this.readAccountUsages(providerId, accountName);
    const existingUsageIndex = usages.findIndex((usage) => usage.extensionId === extensionId);
    if (existingUsageIndex > -1) {
      usages.splice(existingUsageIndex, 1, {
        extensionId,
        extensionName,
        lastUsed: Date.now()
      });
    } else {
      usages.push({
        extensionId,
        extensionName,
        lastUsed: Date.now()
      });
    }
    this._storageService.store(accountKey, JSON.stringify(usages), StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
};
AuthenticationUsageService = __decorateClass([
  __decorateParam(0, IStorageService)
], AuthenticationUsageService);
registerSingleton(IAuthenticationUsageService, AuthenticationUsageService, InstantiationType.Delayed);
export {
  AuthenticationUsageService,
  IAuthenticationUsageService
};
//# sourceMappingURL=authenticationUsageService.js.map
