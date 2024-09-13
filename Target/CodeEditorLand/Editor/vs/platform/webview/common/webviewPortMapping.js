var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import {
  extractLocalHostUriMetaDataForPortMapping
} from "../../tunnel/common/tunnel.js";
class WebviewPortMappingManager {
  constructor(_getExtensionLocation, _getMappings, tunnelService) {
    this._getExtensionLocation = _getExtensionLocation;
    this._getMappings = _getMappings;
    this.tunnelService = tunnelService;
  }
  static {
    __name(this, "WebviewPortMappingManager");
  }
  _tunnels = /* @__PURE__ */ new Map();
  async getRedirect(resolveAuthority, url) {
    const uri = URI.parse(url);
    const requestLocalHostInfo = extractLocalHostUriMetaDataForPortMapping(uri);
    if (!requestLocalHostInfo) {
      return void 0;
    }
    for (const mapping of this._getMappings()) {
      if (mapping.webviewPort === requestLocalHostInfo.port) {
        const extensionLocation = this._getExtensionLocation();
        if (extensionLocation && extensionLocation.scheme === Schemas.vscodeRemote) {
          const tunnel = resolveAuthority && await this.getOrCreateTunnel(
            resolveAuthority,
            mapping.extensionHostPort
          );
          if (tunnel) {
            if (tunnel.tunnelLocalPort === mapping.webviewPort) {
              return void 0;
            }
            return encodeURI(
              uri.with({
                authority: `127.0.0.1:${tunnel.tunnelLocalPort}`
              }).toString(true)
            );
          }
        }
        if (mapping.webviewPort !== mapping.extensionHostPort) {
          return encodeURI(
            uri.with({
              authority: `${requestLocalHostInfo.address}:${mapping.extensionHostPort}`
            }).toString(true)
          );
        }
      }
    }
    return void 0;
  }
  async dispose() {
    for (const tunnel of this._tunnels.values()) {
      await tunnel.dispose();
    }
    this._tunnels.clear();
  }
  async getOrCreateTunnel(remoteAuthority, remotePort) {
    const existing = this._tunnels.get(remotePort);
    if (existing) {
      return existing;
    }
    const tunnelOrError = await this.tunnelService.openTunnel(
      { getAddress: /* @__PURE__ */ __name(async () => remoteAuthority, "getAddress") },
      void 0,
      remotePort
    );
    let tunnel;
    if (typeof tunnelOrError === "string") {
      tunnel = void 0;
    }
    if (tunnel) {
      this._tunnels.set(remotePort, tunnel);
    }
    return tunnel;
  }
}
export {
  WebviewPortMappingManager
};
//# sourceMappingURL=webviewPortMapping.js.map
