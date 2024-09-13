var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IIntegrityService
} from "../common/integrity.js";
class IntegrityService {
  static {
    __name(this, "IntegrityService");
  }
  async isPure() {
    return { isPure: true, proof: [] };
  }
}
registerSingleton(
  IIntegrityService,
  IntegrityService,
  InstantiationType.Delayed
);
export {
  IntegrityService
};
//# sourceMappingURL=integrityService.js.map
