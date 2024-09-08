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
export {
  createSingleCallFunction
};
