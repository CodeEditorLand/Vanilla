import { stub } from "sinon";
function mock() {
  return () => {
  };
}
const mockObject = () => (properties) => {
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
};
export {
  mock,
  mockObject
};
