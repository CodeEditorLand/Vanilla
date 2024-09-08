import { Disposable } from "../../../../base/common/lifecycle.js";
const NullOpenerService = Object.freeze({
  _serviceBrand: void 0,
  registerOpener() {
    return Disposable.None;
  },
  registerValidator() {
    return Disposable.None;
  },
  registerExternalUriResolver() {
    return Disposable.None;
  },
  setDefaultExternalOpener() {
  },
  registerExternalOpener() {
    return Disposable.None;
  },
  async open() {
    return false;
  },
  async resolveExternalUri(uri) {
    return { resolved: uri, dispose() {
    } };
  }
});
export {
  NullOpenerService
};
