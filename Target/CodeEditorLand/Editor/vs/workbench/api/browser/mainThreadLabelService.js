var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { ILabelService, ResourceLabelFormatter } from "../../../platform/label/common/label.js";
import { MainContext, MainThreadLabelServiceShape } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
let MainThreadLabelService = class extends Disposable {
  constructor(_, _labelService) {
    super();
    this._labelService = _labelService;
  }
  _resourceLabelFormatters = this._register(new DisposableMap());
  $registerResourceLabelFormatter(handle, formatter) {
    formatter.priority = true;
    const disposable = this._labelService.registerCachedFormatter(formatter);
    this._resourceLabelFormatters.set(handle, disposable);
  }
  $unregisterResourceLabelFormatter(handle) {
    this._resourceLabelFormatters.deleteAndDispose(handle);
  }
};
__name(MainThreadLabelService, "MainThreadLabelService");
MainThreadLabelService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLabelService),
  __decorateParam(1, ILabelService)
], MainThreadLabelService);
export {
  MainThreadLabelService
};
//# sourceMappingURL=mainThreadLabelService.js.map
