import {
  toDisposable
} from "../../../base/common/lifecycle.js";
import {
  MainContext
} from "./extHost.protocol.js";
class ExtHostLabelService {
  _proxy;
  _handlePool = 0;
  constructor(mainContext) {
    this._proxy = mainContext.getProxy(MainContext.MainThreadLabelService);
  }
  $registerResourceLabelFormatter(formatter) {
    const handle = this._handlePool++;
    this._proxy.$registerResourceLabelFormatter(handle, formatter);
    return toDisposable(() => {
      this._proxy.$unregisterResourceLabelFormatter(handle);
    });
  }
}
export {
  ExtHostLabelService
};
