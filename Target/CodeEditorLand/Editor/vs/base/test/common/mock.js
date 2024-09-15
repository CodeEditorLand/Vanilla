var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SinonStub, stub } from "sinon";
function mock() {
  return function() {
  };
}
__name(mock, "mock");
const mockObject = /* @__PURE__ */ __name(() => (properties) => {
  return new Proxy({ ...properties }, {
    get(target, key) {
      if (!target.hasOwnProperty(key)) {
        target[key] = stub();
      }
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });
}, "mockObject");
export {
  mock,
  mockObject
};
//# sourceMappingURL=mock.js.map
