import { Schemas } from "../../../base/common/network.js";
import { ExtUri } from "../../../base/common/resources.js";
import { FileSystemProviderCapabilities } from "../../../platform/files/common/files.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
class ExtHostFileSystemInfo {
  _systemSchemes = new Set(Object.keys(Schemas));
  _providerInfo = /* @__PURE__ */ new Map();
  extUri;
  constructor() {
    this.extUri = new ExtUri((uri) => {
      const capabilities = this._providerInfo.get(uri.scheme);
      if (capabilities === void 0) {
        return false;
      }
      if (capabilities & FileSystemProviderCapabilities.PathCaseSensitive) {
        return false;
      }
      return true;
    });
  }
  $acceptProviderInfos(uri, capabilities) {
    if (capabilities === null) {
      this._providerInfo.delete(uri.scheme);
    } else {
      this._providerInfo.set(uri.scheme, capabilities);
    }
  }
  isFreeScheme(scheme) {
    return !this._providerInfo.has(scheme) && !this._systemSchemes.has(scheme);
  }
  getCapabilities(scheme) {
    return this._providerInfo.get(scheme);
  }
}
const IExtHostFileSystemInfo = createDecorator(
  "IExtHostFileSystemInfo"
);
export {
  ExtHostFileSystemInfo,
  IExtHostFileSystemInfo
};
