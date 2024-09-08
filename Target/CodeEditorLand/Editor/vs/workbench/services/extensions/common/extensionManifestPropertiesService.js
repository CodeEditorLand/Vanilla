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
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { isBoolean } from "../../../../base/common/types.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { getGalleryExtensionId } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  ALL_EXTENSION_KINDS,
  ExtensionIdentifierMap
} from "../../../../platform/extensions/common/extensions.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IWorkspaceTrustEnablementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { WORKSPACE_TRUST_EXTENSION_SUPPORT } from "../../workspaces/common/workspaceTrust.js";
import { ExtensionsRegistry } from "./extensionsRegistry.js";
const IExtensionManifestPropertiesService = createDecorator(
  "extensionManifestPropertiesService"
);
let ExtensionManifestPropertiesService = class extends Disposable {
  constructor(productService, configurationService, workspaceTrustEnablementService, logService) {
    super();
    this.productService = productService;
    this.configurationService = configurationService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.logService = logService;
    this._configuredExtensionWorkspaceTrustRequestMap = new ExtensionIdentifierMap();
    const configuredExtensionWorkspaceTrustRequests = configurationService.inspect(WORKSPACE_TRUST_EXTENSION_SUPPORT).userValue || {};
    for (const id of Object.keys(configuredExtensionWorkspaceTrustRequests)) {
      this._configuredExtensionWorkspaceTrustRequestMap.set(id, configuredExtensionWorkspaceTrustRequests[id]);
    }
    this._productExtensionWorkspaceTrustRequestMap = /* @__PURE__ */ new Map();
    if (productService.extensionUntrustedWorkspaceSupport) {
      for (const id of Object.keys(productService.extensionUntrustedWorkspaceSupport)) {
        this._productExtensionWorkspaceTrustRequestMap.set(id, productService.extensionUntrustedWorkspaceSupport[id]);
      }
    }
  }
  _serviceBrand;
  _extensionPointExtensionKindsMap = null;
  _productExtensionKindsMap = null;
  _configuredExtensionKindsMap = null;
  _productVirtualWorkspaceSupportMap = null;
  _configuredVirtualWorkspaceSupportMap = null;
  _configuredExtensionWorkspaceTrustRequestMap;
  _productExtensionWorkspaceTrustRequestMap;
  prefersExecuteOnUI(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.length > 0 && extensionKind[0] === "ui";
  }
  prefersExecuteOnWorkspace(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.length > 0 && extensionKind[0] === "workspace";
  }
  prefersExecuteOnWeb(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.length > 0 && extensionKind[0] === "web";
  }
  canExecuteOnUI(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.some((kind) => kind === "ui");
  }
  canExecuteOnWorkspace(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.some((kind) => kind === "workspace");
  }
  canExecuteOnWeb(manifest) {
    const extensionKind = this.getExtensionKind(manifest);
    return extensionKind.some((kind) => kind === "web");
  }
  getExtensionKind(manifest) {
    const deducedExtensionKind = this.deduceExtensionKind(manifest);
    const configuredExtensionKind = this.getConfiguredExtensionKind(manifest);
    if (configuredExtensionKind && configuredExtensionKind.length > 0) {
      const result = [];
      for (const extensionKind of configuredExtensionKind) {
        if (extensionKind !== "-web") {
          result.push(extensionKind);
        }
      }
      if (configuredExtensionKind.includes("-web") && !result.length) {
        result.push("ui");
        result.push("workspace");
      }
      if (isWeb && !configuredExtensionKind.includes("-web") && !configuredExtensionKind.includes("web") && deducedExtensionKind.includes("web")) {
        result.push("web");
      }
      return result;
    }
    return deducedExtensionKind;
  }
  getUserConfiguredExtensionKind(extensionIdentifier) {
    if (this._configuredExtensionKindsMap === null) {
      const configuredExtensionKindsMap = new ExtensionIdentifierMap();
      const configuredExtensionKinds = this.configurationService.getValue("remote.extensionKind") || {};
      for (const id of Object.keys(configuredExtensionKinds)) {
        configuredExtensionKindsMap.set(
          id,
          configuredExtensionKinds[id]
        );
      }
      this._configuredExtensionKindsMap = configuredExtensionKindsMap;
    }
    const userConfiguredExtensionKind = this._configuredExtensionKindsMap.get(extensionIdentifier.id);
    return userConfiguredExtensionKind ? this.toArray(userConfiguredExtensionKind) : void 0;
  }
  getExtensionUntrustedWorkspaceSupportType(manifest) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() || !manifest.main) {
      return true;
    }
    const configuredWorkspaceTrustRequest = this.getConfiguredExtensionWorkspaceTrustRequest(manifest);
    const productWorkspaceTrustRequest = this.getProductExtensionWorkspaceTrustRequest(manifest);
    if (configuredWorkspaceTrustRequest !== void 0) {
      return configuredWorkspaceTrustRequest;
    }
    if (productWorkspaceTrustRequest?.override !== void 0) {
      return productWorkspaceTrustRequest.override;
    }
    if (manifest.capabilities?.untrustedWorkspaces?.supported !== void 0) {
      return manifest.capabilities.untrustedWorkspaces.supported;
    }
    if (productWorkspaceTrustRequest?.default !== void 0) {
      return productWorkspaceTrustRequest.default;
    }
    return false;
  }
  getExtensionVirtualWorkspaceSupportType(manifest) {
    const userConfiguredVirtualWorkspaceSupport = this.getConfiguredVirtualWorkspaceSupport(manifest);
    if (userConfiguredVirtualWorkspaceSupport !== void 0) {
      return userConfiguredVirtualWorkspaceSupport;
    }
    const productConfiguredWorkspaceSchemes = this.getProductVirtualWorkspaceSupport(manifest);
    if (productConfiguredWorkspaceSchemes?.override !== void 0) {
      return productConfiguredWorkspaceSchemes.override;
    }
    const virtualWorkspaces = manifest.capabilities?.virtualWorkspaces;
    if (isBoolean(virtualWorkspaces)) {
      return virtualWorkspaces;
    } else if (virtualWorkspaces) {
      const supported = virtualWorkspaces.supported;
      if (isBoolean(supported) || supported === "limited") {
        return supported;
      }
    }
    if (productConfiguredWorkspaceSchemes?.default !== void 0) {
      return productConfiguredWorkspaceSchemes.default;
    }
    return true;
  }
  deduceExtensionKind(manifest) {
    if (manifest.main) {
      if (manifest.browser) {
        return isWeb ? ["workspace", "web"] : ["workspace"];
      }
      return ["workspace"];
    }
    if (manifest.browser) {
      return ["web"];
    }
    let result = [...ALL_EXTENSION_KINDS];
    if (isNonEmptyArray(manifest.extensionPack) || isNonEmptyArray(manifest.extensionDependencies)) {
      result = isWeb ? ["workspace", "web"] : ["workspace"];
    }
    if (manifest.contributes) {
      for (const contribution of Object.keys(manifest.contributes)) {
        const supportedExtensionKinds = this.getSupportedExtensionKindsForExtensionPoint(
          contribution
        );
        if (supportedExtensionKinds.length) {
          result = result.filter(
            (extensionKind) => supportedExtensionKinds.includes(extensionKind)
          );
        }
      }
    }
    if (!result.length) {
      this.logService.warn(
        "Cannot deduce extensionKind for extension",
        getGalleryExtensionId(manifest.publisher, manifest.name)
      );
    }
    return result;
  }
  getSupportedExtensionKindsForExtensionPoint(extensionPoint) {
    if (this._extensionPointExtensionKindsMap === null) {
      const extensionPointExtensionKindsMap = /* @__PURE__ */ new Map();
      ExtensionsRegistry.getExtensionPoints().forEach(
        (e) => extensionPointExtensionKindsMap.set(
          e.name,
          e.defaultExtensionKind || []
        )
      );
      this._extensionPointExtensionKindsMap = extensionPointExtensionKindsMap;
    }
    let extensionPointExtensionKind = this._extensionPointExtensionKindsMap.get(extensionPoint);
    if (extensionPointExtensionKind) {
      return extensionPointExtensionKind;
    }
    extensionPointExtensionKind = this.productService.extensionPointExtensionKind ? this.productService.extensionPointExtensionKind[extensionPoint] : void 0;
    if (extensionPointExtensionKind) {
      return extensionPointExtensionKind;
    }
    return isWeb ? ["workspace", "web"] : ["workspace"];
  }
  getConfiguredExtensionKind(manifest) {
    const extensionIdentifier = {
      id: getGalleryExtensionId(manifest.publisher, manifest.name)
    };
    let result = this.getUserConfiguredExtensionKind(extensionIdentifier);
    if (typeof result !== "undefined") {
      return this.toArray(result);
    }
    result = this.getProductExtensionKind(manifest);
    if (typeof result !== "undefined") {
      return result;
    }
    result = manifest.extensionKind;
    if (typeof result !== "undefined") {
      result = this.toArray(result);
      return result.filter((r) => ["ui", "workspace"].includes(r));
    }
    return null;
  }
  getProductExtensionKind(manifest) {
    if (this._productExtensionKindsMap === null) {
      const productExtensionKindsMap = new ExtensionIdentifierMap();
      if (this.productService.extensionKind) {
        for (const id of Object.keys(
          this.productService.extensionKind
        )) {
          productExtensionKindsMap.set(
            id,
            this.productService.extensionKind[id]
          );
        }
      }
      this._productExtensionKindsMap = productExtensionKindsMap;
    }
    const extensionId = getGalleryExtensionId(
      manifest.publisher,
      manifest.name
    );
    return this._productExtensionKindsMap.get(extensionId);
  }
  getProductVirtualWorkspaceSupport(manifest) {
    if (this._productVirtualWorkspaceSupportMap === null) {
      const productWorkspaceSchemesMap = new ExtensionIdentifierMap();
      if (this.productService.extensionVirtualWorkspacesSupport) {
        for (const id of Object.keys(
          this.productService.extensionVirtualWorkspacesSupport
        )) {
          productWorkspaceSchemesMap.set(
            id,
            this.productService.extensionVirtualWorkspacesSupport[id]
          );
        }
      }
      this._productVirtualWorkspaceSupportMap = productWorkspaceSchemesMap;
    }
    const extensionId = getGalleryExtensionId(
      manifest.publisher,
      manifest.name
    );
    return this._productVirtualWorkspaceSupportMap.get(extensionId);
  }
  getConfiguredVirtualWorkspaceSupport(manifest) {
    if (this._configuredVirtualWorkspaceSupportMap === null) {
      const configuredWorkspaceSchemesMap = new ExtensionIdentifierMap();
      const configuredWorkspaceSchemes = this.configurationService.getValue(
        "extensions.supportVirtualWorkspaces"
      ) || {};
      for (const id of Object.keys(configuredWorkspaceSchemes)) {
        if (configuredWorkspaceSchemes[id] !== void 0) {
          configuredWorkspaceSchemesMap.set(
            id,
            configuredWorkspaceSchemes[id]
          );
        }
      }
      this._configuredVirtualWorkspaceSupportMap = configuredWorkspaceSchemesMap;
    }
    const extensionId = getGalleryExtensionId(
      manifest.publisher,
      manifest.name
    );
    return this._configuredVirtualWorkspaceSupportMap.get(extensionId);
  }
  getConfiguredExtensionWorkspaceTrustRequest(manifest) {
    const extensionId = getGalleryExtensionId(
      manifest.publisher,
      manifest.name
    );
    const extensionWorkspaceTrustRequest = this._configuredExtensionWorkspaceTrustRequestMap.get(extensionId);
    if (extensionWorkspaceTrustRequest && (extensionWorkspaceTrustRequest.version === void 0 || extensionWorkspaceTrustRequest.version === manifest.version)) {
      return extensionWorkspaceTrustRequest.supported;
    }
    return void 0;
  }
  getProductExtensionWorkspaceTrustRequest(manifest) {
    const extensionId = getGalleryExtensionId(
      manifest.publisher,
      manifest.name
    );
    return this._productExtensionWorkspaceTrustRequestMap.get(extensionId);
  }
  toArray(extensionKind) {
    if (Array.isArray(extensionKind)) {
      return extensionKind;
    }
    return extensionKind === "ui" ? ["ui", "workspace"] : [extensionKind];
  }
};
ExtensionManifestPropertiesService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceTrustEnablementService),
  __decorateParam(3, ILogService)
], ExtensionManifestPropertiesService);
registerSingleton(
  IExtensionManifestPropertiesService,
  ExtensionManifestPropertiesService,
  InstantiationType.Delayed
);
export {
  ExtensionManifestPropertiesService,
  IExtensionManifestPropertiesService
};
