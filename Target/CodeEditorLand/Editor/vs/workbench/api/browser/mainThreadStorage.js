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
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { isWeb } from "../../../base/common/platform.js";
import {
  IExtensionStorageService
} from "../../../platform/extensionManagement/common/extensionStorage.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import {
  IStorageService,
  StorageScope
} from "../../../platform/storage/common/storage.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import { migrateExtensionStorage } from "../../services/extensions/common/extensionStorageMigration.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadStorage = class {
  constructor(extHostContext, _extensionStorageService, _storageService, _instantiationService, _logService) {
    this._extensionStorageService = _extensionStorageService;
    this._storageService = _storageService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostStorage);
    this._storageListener.add(
      this._storageService.onDidChangeValue(
        StorageScope.PROFILE,
        void 0,
        this._storageListener
      )((e) => {
        if (this._sharedStorageKeysToWatch.has(e.key)) {
          const rawState = this._extensionStorageService.getExtensionStateRaw(
            e.key,
            true
          );
          if (typeof rawState === "string") {
            this._proxy.$acceptValue(true, e.key, rawState);
          }
        }
      })
    );
  }
  _proxy;
  _storageListener = new DisposableStore();
  _sharedStorageKeysToWatch = /* @__PURE__ */ new Map();
  dispose() {
    this._storageListener.dispose();
  }
  async $initializeExtensionStorage(shared, extensionId) {
    await this.checkAndMigrateExtensionStorage(extensionId, shared);
    if (shared) {
      this._sharedStorageKeysToWatch.set(extensionId, true);
    }
    return this._extensionStorageService.getExtensionStateRaw(
      extensionId,
      shared
    );
  }
  async $setValue(shared, key, value) {
    this._extensionStorageService.setExtensionState(key, value, shared);
  }
  $registerExtensionStorageKeysToSync(extension, keys) {
    this._extensionStorageService.setKeysForSync(extension, keys);
  }
  async checkAndMigrateExtensionStorage(extensionId, shared) {
    try {
      let sourceExtensionId = this._extensionStorageService.getSourceExtensionToMigrate(
        extensionId
      );
      if (!sourceExtensionId && isWeb && extensionId !== extensionId.toLowerCase()) {
        sourceExtensionId = extensionId.toLowerCase();
      }
      if (sourceExtensionId) {
        if (isWeb && sourceExtensionId !== sourceExtensionId.toLowerCase() && this._extensionStorageService.getExtensionState(
          sourceExtensionId.toLowerCase(),
          shared
        ) && !this._extensionStorageService.getExtensionState(
          sourceExtensionId,
          shared
        )) {
          sourceExtensionId = sourceExtensionId.toLowerCase();
        }
        await migrateExtensionStorage(
          sourceExtensionId,
          extensionId,
          shared,
          this._instantiationService
        );
      }
    } catch (error) {
      this._logService.error(error);
    }
  }
};
__name(MainThreadStorage, "MainThreadStorage");
MainThreadStorage = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadStorage),
  __decorateParam(1, IExtensionStorageService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService)
], MainThreadStorage);
export {
  MainThreadStorage
};
//# sourceMappingURL=mainThreadStorage.js.map
