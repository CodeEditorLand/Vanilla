import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  ICanonicalUriService
} from "../../../../platform/workspace/common/canonicalUri.js";
class CanonicalUriService {
  _providers = /* @__PURE__ */ new Map();
  registerCanonicalUriProvider(provider) {
    this._providers.set(provider.scheme, provider);
    return {
      dispose: () => this._providers.delete(provider.scheme)
    };
  }
  async provideCanonicalUri(uri, targetScheme, token) {
    const provider = this._providers.get(uri.scheme);
    if (provider) {
      return provider.provideCanonicalUri(uri, targetScheme, token);
    }
    return void 0;
  }
}
registerSingleton(
  ICanonicalUriService,
  CanonicalUriService,
  InstantiationType.Delayed
);
export {
  CanonicalUriService
};
