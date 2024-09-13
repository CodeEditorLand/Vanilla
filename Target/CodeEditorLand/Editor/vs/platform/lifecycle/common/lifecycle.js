var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isThenable, Promises } from "../../../base/common/async.js";
function handleVetos(vetos, onError) {
  if (vetos.length === 0) {
    return Promise.resolve(false);
  }
  const promises = [];
  let lazyValue = false;
  for (const valueOrPromise of vetos) {
    if (valueOrPromise === true) {
      return Promise.resolve(true);
    }
    if (isThenable(valueOrPromise)) {
      promises.push(valueOrPromise.then((value) => {
        if (value) {
          lazyValue = true;
        }
      }, (err) => {
        onError(err);
        lazyValue = true;
      }));
    }
  }
  return Promises.settled(promises).then(() => lazyValue);
}
__name(handleVetos, "handleVetos");
export {
  handleVetos
};
//# sourceMappingURL=lifecycle.js.map
