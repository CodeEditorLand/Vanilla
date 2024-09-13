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
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import {
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadClipboard = class {
  constructor(_context, _clipboardService) {
    this._clipboardService = _clipboardService;
  }
  dispose() {
  }
  $readText() {
    return this._clipboardService.readText();
  }
  $writeText(value) {
    return this._clipboardService.writeText(value);
  }
};
__name(MainThreadClipboard, "MainThreadClipboard");
MainThreadClipboard = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadClipboard),
  __decorateParam(1, IClipboardService)
], MainThreadClipboard);
export {
  MainThreadClipboard
};
//# sourceMappingURL=mainThreadClipboard.js.map
