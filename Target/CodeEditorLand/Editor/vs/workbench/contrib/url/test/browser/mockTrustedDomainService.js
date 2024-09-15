var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../../base/common/uri.js";
import { isURLDomainTrusted, ITrustedDomainService } from "../../browser/trustedDomainService.js";
class MockTrustedDomainService {
  constructor(_trustedDomains = []) {
    this._trustedDomains = _trustedDomains;
  }
  static {
    __name(this, "MockTrustedDomainService");
  }
  _serviceBrand;
  isValid(resource) {
    return isURLDomainTrusted(resource, this._trustedDomains);
  }
}
export {
  MockTrustedDomainService
};
//# sourceMappingURL=mockTrustedDomainService.js.map
