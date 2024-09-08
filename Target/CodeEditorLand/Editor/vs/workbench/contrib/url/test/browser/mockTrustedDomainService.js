import {
  isURLDomainTrusted
} from "../../browser/trustedDomainService.js";
class MockTrustedDomainService {
  constructor(_trustedDomains = []) {
    this._trustedDomains = _trustedDomains;
  }
  _serviceBrand;
  isValid(resource) {
    return isURLDomainTrusted(resource, this._trustedDomains);
  }
}
export {
  MockTrustedDomainService
};
