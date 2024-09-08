var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { CancellationToken } from "../../../base/common/cancellation.js";
import {
  DisposableMap
} from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import {
  IQuickDiffService
} from "../../contrib/scm/common/quickDiff.js";
import {
  extHostNamedCustomer
} from "../../services/extensions/common/extHostCustomers.js";
import {
  ExtHostContext,
  MainContext
} from "../common/extHost.protocol.js";
let MainThreadQuickDiff = class {
  constructor(extHostContext, quickDiffService) {
    this.quickDiffService = quickDiffService;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostQuickDiff);
  }
  proxy;
  providerDisposables = new DisposableMap();
  async $registerQuickDiffProvider(handle, selector, label, rootUri) {
    const provider = {
      label,
      rootUri: URI.revive(rootUri),
      selector,
      isSCM: false,
      getOriginalResource: async (uri) => {
        return URI.revive(
          await this.proxy.$provideOriginalResource(
            handle,
            uri,
            CancellationToken.None
          )
        );
      }
    };
    const disposable = this.quickDiffService.addQuickDiffProvider(provider);
    this.providerDisposables.set(handle, disposable);
  }
  async $unregisterQuickDiffProvider(handle) {
    if (this.providerDisposables.has(handle)) {
      this.providerDisposables.deleteAndDispose(handle);
    }
  }
  dispose() {
    this.providerDisposables.dispose();
  }
};
MainThreadQuickDiff = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadQuickDiff),
  __decorateParam(1, IQuickDiffService)
], MainThreadQuickDiff);
export {
  MainThreadQuickDiff
};
