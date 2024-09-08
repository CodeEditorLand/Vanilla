import { asPromise } from "../../../base/common/async.js";
import { URI } from "../../../base/common/uri.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { DocumentSelector } from "./extHostTypeConverters.js";
class ExtHostQuickDiff {
  constructor(mainContext, uriTransformer) {
    this.uriTransformer = uriTransformer;
    this.proxy = mainContext.getProxy(MainContext.MainThreadQuickDiff);
  }
  static handlePool = 0;
  proxy;
  providers = /* @__PURE__ */ new Map();
  $provideOriginalResource(handle, uriComponents, token) {
    const uri = URI.revive(uriComponents);
    const provider = this.providers.get(handle);
    if (!provider) {
      return Promise.resolve(null);
    }
    return asPromise(
      () => provider.provideOriginalResource(uri, token)
    ).then((r) => r || null);
  }
  registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
    const handle = ExtHostQuickDiff.handlePool++;
    this.providers.set(handle, quickDiffProvider);
    this.proxy.$registerQuickDiffProvider(
      handle,
      DocumentSelector.from(selector, this.uriTransformer),
      label,
      rootUri
    );
    return {
      dispose: () => {
        this.proxy.$unregisterQuickDiffProvider(handle);
        this.providers.delete(handle);
      }
    };
  }
}
export {
  ExtHostQuickDiff
};
