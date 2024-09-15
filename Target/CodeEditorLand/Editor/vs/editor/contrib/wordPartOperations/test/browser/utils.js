var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ServiceIdentifier, ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
class StaticServiceAccessor {
  static {
    __name(this, "StaticServiceAccessor");
  }
  services = /* @__PURE__ */ new Map();
  withService(id, service) {
    this.services.set(id, service);
    return this;
  }
  get(id) {
    const value = this.services.get(id);
    if (!value) {
      throw new Error("Service does not exist");
    }
    return value;
  }
}
export {
  StaticServiceAccessor
};
//# sourceMappingURL=utils.js.map
