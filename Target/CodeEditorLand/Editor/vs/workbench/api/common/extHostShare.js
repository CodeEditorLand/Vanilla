import { URI } from "../../../base/common/uri.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { DocumentSelector, Range } from "./extHostTypeConverters.js";
class ExtHostShare {
  constructor(mainContext, uriTransformer) {
    this.uriTransformer = uriTransformer;
    this.proxy = mainContext.getProxy(MainContext.MainThreadShare);
  }
  static handlePool = 0;
  proxy;
  providers = /* @__PURE__ */ new Map();
  async $provideShare(handle, shareableItem, token) {
    const provider = this.providers.get(handle);
    const result = await provider?.provideShare(
      {
        selection: Range.to(shareableItem.selection),
        resourceUri: URI.revive(shareableItem.resourceUri)
      },
      token
    );
    return result ?? void 0;
  }
  registerShareProvider(selector, provider) {
    const handle = ExtHostShare.handlePool++;
    this.providers.set(handle, provider);
    this.proxy.$registerShareProvider(
      handle,
      DocumentSelector.from(selector, this.uriTransformer),
      provider.id,
      provider.label,
      provider.priority
    );
    return {
      dispose: () => {
        this.proxy.$unregisterShareProvider(handle);
        this.providers.delete(handle);
      }
    };
  }
}
export {
  ExtHostShare
};
