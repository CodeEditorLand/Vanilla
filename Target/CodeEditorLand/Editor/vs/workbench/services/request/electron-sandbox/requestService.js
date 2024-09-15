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
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { AbstractRequestService, AuthInfo, Credentials, IRequestService } from "../../../../platform/request/common/request.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IRequestContext, IRequestOptions } from "../../../../base/parts/request/common/request.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { request } from "../../../../base/parts/request/browser/request.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let NativeRequestService = class extends AbstractRequestService {
  constructor(nativeHostService, configurationService, logService) {
    super(logService);
    this.nativeHostService = nativeHostService;
    this.configurationService = configurationService;
  }
  static {
    __name(this, "NativeRequestService");
  }
  async request(options, token) {
    if (!options.proxyAuthorization) {
      options.proxyAuthorization = this.configurationService.getValue("http.proxyAuthorization");
    }
    return this.logAndRequest(options, () => request(options, token));
  }
  async resolveProxy(url) {
    return this.nativeHostService.resolveProxy(url);
  }
  async lookupAuthorization(authInfo) {
    return this.nativeHostService.lookupAuthorization(authInfo);
  }
  async lookupKerberosAuthorization(url) {
    return this.nativeHostService.lookupKerberosAuthorization(url);
  }
  async loadCertificates() {
    return this.nativeHostService.loadCertificates();
  }
};
NativeRequestService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILogService)
], NativeRequestService);
registerSingleton(IRequestService, NativeRequestService, InstantiationType.Delayed);
export {
  NativeRequestService
};
//# sourceMappingURL=requestService.js.map
