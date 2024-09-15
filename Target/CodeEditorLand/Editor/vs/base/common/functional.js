var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function createSingleCallFunction(fn, fnDidRunCallback) {
  let didCall = false;
  let result;
  return () => {
    if (didCall) {
      return result;
    }
    didCall = true;
    if (fnDidRunCallback) {
      try {
        result = fn.apply(this, arguments);
      } finally {
        fnDidRunCallback();
      }
    } else {
      result = fn.apply(this, arguments);
    }
    return result;
  };
}
__name(createSingleCallFunction, "createSingleCallFunction");
export {
  createSingleCallFunction
};
//# sourceMappingURL=functional.js.map
