var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../base/common/uri.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import {
  MainContext
} from "./extHost.protocol.js";
class ExtHostDialogs {
  static {
    __name(this, "ExtHostDialogs");
  }
  _proxy;
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadDialogs);
  }
  showOpenDialog(extension, options) {
    if (options?.allowUIResources) {
      checkProposedApiEnabled(extension, "showLocal");
    }
    return this._proxy.$showOpenDialog(options).then((filepaths) => {
      return filepaths ? filepaths.map((p) => URI.revive(p)) : void 0;
    });
  }
  showSaveDialog(options) {
    return this._proxy.$showSaveDialog(options).then((filepath) => {
      return filepath ? URI.revive(filepath) : void 0;
    });
  }
}
export {
  ExtHostDialogs
};
//# sourceMappingURL=extHostDialogs.js.map
