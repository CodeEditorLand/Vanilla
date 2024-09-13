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
import { distinct } from "../../../../base/common/arrays.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { equals } from "../../../../base/common/objects.js";
import { isBoolean } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import {
  Extensions,
  IExtensionFeaturesManagementService
} from "./extensionFeatures.js";
const FEATURES_STATE_KEY = "extension.features.state";
let ExtensionFeaturesManagementService = class extends Disposable {
  constructor(storageService, dialogService, extensionService) {
    super();
    this.storageService = storageService;
    this.dialogService = dialogService;
    this.extensionService = extensionService;
    this.registry = Registry.as(Extensions.ExtensionFeaturesRegistry);
    this.extensionFeaturesState = this.loadState();
    this._register(storageService.onDidChangeValue(StorageScope.PROFILE, FEATURES_STATE_KEY, this._store)((e) => this.onDidStorageChange(e)));
  }
  static {
    __name(this, "ExtensionFeaturesManagementService");
  }
  _onDidChangeEnablement = this._register(
    new Emitter()
  );
  onDidChangeEnablement = this._onDidChangeEnablement.event;
  _onDidChangeAccessData = this._register(
    new Emitter()
  );
  onDidChangeAccessData = this._onDidChangeAccessData.event;
  registry;
  extensionFeaturesState = /* @__PURE__ */ new Map();
  isEnabled(extension, featureId) {
    const feature = this.registry.getExtensionFeature(featureId);
    if (!feature) {
      return false;
    }
    const isDisabled = this.getExtensionFeatureState(
      extension,
      featureId
    )?.disabled;
    if (isBoolean(isDisabled)) {
      return !isDisabled;
    }
    const defaultExtensionAccess = feature.access.extensionsList?.[extension.value];
    if (isBoolean(defaultExtensionAccess)) {
      return defaultExtensionAccess;
    }
    return !feature.access.requireUserConsent;
  }
  setEnablement(extension, featureId, enabled) {
    const feature = this.registry.getExtensionFeature(featureId);
    if (!feature) {
      throw new Error(`No feature with id '${featureId}'`);
    }
    const featureState = this.getAndSetIfNotExistsExtensionFeatureState(
      extension,
      featureId
    );
    if (featureState.disabled !== !enabled) {
      featureState.disabled = !enabled;
      this._onDidChangeEnablement.fire({ extension, featureId, enabled });
      this.saveState();
    }
  }
  getEnablementData(featureId) {
    const result = [];
    const feature = this.registry.getExtensionFeature(featureId);
    if (feature) {
      for (const [extension, featuresStateMap] of this.extensionFeaturesState) {
        const featureState = featuresStateMap.get(featureId);
        if (featureState?.disabled !== void 0) {
          result.push({
            extension: new ExtensionIdentifier(extension),
            enabled: !featureState.disabled
          });
        }
      }
    }
    return result;
  }
  async getAccess(extension, featureId, justification) {
    const feature = this.registry.getExtensionFeature(featureId);
    if (!feature) {
      return false;
    }
    const featureState = this.getAndSetIfNotExistsExtensionFeatureState(
      extension,
      featureId
    );
    if (featureState.disabled) {
      return false;
    }
    if (featureState.disabled === void 0) {
      let enabled = true;
      if (feature.access.requireUserConsent) {
        const extensionDescription = this.extensionService.extensions.find(
          (e) => ExtensionIdentifier.equals(e.identifier, extension)
        );
        const confirmationResult = await this.dialogService.confirm({
          title: localize(
            "accessExtensionFeature",
            "Access '{0}' Feature",
            feature.label
          ),
          message: localize(
            "accessExtensionFeatureMessage",
            "'{0}' extension would like to access the '{1}' feature.",
            extensionDescription?.displayName ?? extension.value,
            feature.label
          ),
          detail: justification ?? feature.description,
          custom: true,
          primaryButton: localize("allow", "Allow"),
          cancelButton: localize("disallow", "Don't Allow")
        });
        enabled = confirmationResult.confirmed;
      }
      this.setEnablement(extension, featureId, enabled);
      if (!enabled) {
        return false;
      }
    }
    featureState.accessData.current = {
      count: featureState.accessData.current?.count ? featureState.accessData.current?.count + 1 : 1,
      lastAccessed: Date.now(),
      status: featureState.accessData.current?.status
    };
    featureState.accessData.totalCount = featureState.accessData.totalCount + 1;
    this.saveState();
    this._onDidChangeAccessData.fire({
      extension,
      featureId,
      accessData: featureState.accessData
    });
    return true;
  }
  getAccessData(extension, featureId) {
    const feature = this.registry.getExtensionFeature(featureId);
    if (!feature) {
      return;
    }
    return this.getExtensionFeatureState(extension, featureId)?.accessData;
  }
  setStatus(extension, featureId, status) {
    const feature = this.registry.getExtensionFeature(featureId);
    if (!feature) {
      throw new Error(`No feature with id '${featureId}'`);
    }
    const featureState = this.getAndSetIfNotExistsExtensionFeatureState(
      extension,
      featureId
    );
    featureState.accessData.current = {
      count: featureState.accessData.current?.count ?? 0,
      lastAccessed: featureState.accessData.current?.lastAccessed ?? 0,
      status
    };
    this._onDidChangeAccessData.fire({
      extension,
      featureId,
      accessData: this.getAccessData(extension, featureId)
    });
  }
  getExtensionFeatureState(extension, featureId) {
    return this.extensionFeaturesState.get(extension.value)?.get(featureId);
  }
  getAndSetIfNotExistsExtensionFeatureState(extension, featureId) {
    let extensionState = this.extensionFeaturesState.get(extension.value);
    if (!extensionState) {
      extensionState = /* @__PURE__ */ new Map();
      this.extensionFeaturesState.set(extension.value, extensionState);
    }
    let featureState = extensionState.get(featureId);
    if (!featureState) {
      featureState = { accessData: { totalCount: 0 } };
      extensionState.set(featureId, featureState);
    }
    return featureState;
  }
  onDidStorageChange(e) {
    if (e.external) {
      const oldState = this.extensionFeaturesState;
      this.extensionFeaturesState = this.loadState();
      for (const extensionId of distinct([
        ...oldState.keys(),
        ...this.extensionFeaturesState.keys()
      ])) {
        const extension = new ExtensionIdentifier(extensionId);
        const oldExtensionFeaturesState = oldState.get(extensionId);
        const newExtensionFeaturesState = this.extensionFeaturesState.get(extensionId);
        for (const featureId of distinct([
          ...oldExtensionFeaturesState?.keys() ?? [],
          ...newExtensionFeaturesState?.keys() ?? []
        ])) {
          const isEnabled = this.isEnabled(extension, featureId);
          const wasEnabled = !oldExtensionFeaturesState?.get(featureId)?.disabled;
          if (isEnabled !== wasEnabled) {
            this._onDidChangeEnablement.fire({
              extension,
              featureId,
              enabled: isEnabled
            });
          }
          const newAccessData = this.getAccessData(
            extension,
            featureId
          );
          const oldAccessData = oldExtensionFeaturesState?.get(featureId)?.accessData;
          if (!equals(newAccessData, oldAccessData)) {
            this._onDidChangeAccessData.fire({
              extension,
              featureId,
              accessData: newAccessData ?? { totalCount: 0 }
            });
          }
        }
      }
    }
  }
  loadState() {
    let data = {};
    const raw = this.storageService.get(
      FEATURES_STATE_KEY,
      StorageScope.PROFILE,
      "{}"
    );
    try {
      data = JSON.parse(raw);
    } catch (e) {
    }
    const result = /* @__PURE__ */ new Map();
    for (const extensionId in data) {
      const extensionFeatureState = /* @__PURE__ */ new Map();
      const extensionFeatures = data[extensionId];
      for (const featureId in extensionFeatures) {
        const extensionFeature = extensionFeatures[featureId];
        extensionFeatureState.set(featureId, {
          disabled: extensionFeature.disabled,
          accessData: {
            totalCount: extensionFeature.accessCount
          }
        });
      }
      result.set(extensionId, extensionFeatureState);
    }
    return result;
  }
  saveState() {
    const data = {};
    this.extensionFeaturesState.forEach((extensionState, extensionId) => {
      const extensionFeatures = {};
      extensionState.forEach((featureState, featureId) => {
        extensionFeatures[featureId] = {
          disabled: featureState.disabled,
          accessCount: featureState.accessData.totalCount
        };
      });
      data[extensionId] = extensionFeatures;
    });
    this.storageService.store(
      FEATURES_STATE_KEY,
      JSON.stringify(data),
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
};
ExtensionFeaturesManagementService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IExtensionService)
], ExtensionFeaturesManagementService);
registerSingleton(
  IExtensionFeaturesManagementService,
  ExtensionFeaturesManagementService,
  InstantiationType.Delayed
);
//# sourceMappingURL=extensionFeaturesManagemetService.js.map
