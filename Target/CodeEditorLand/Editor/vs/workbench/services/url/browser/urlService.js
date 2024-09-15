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
import { matchesScheme } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IOpenerService
} from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IURLService } from "../../../../platform/url/common/url.js";
import { AbstractURLService } from "../../../../platform/url/common/urlService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
class BrowserURLOpener {
  constructor(urlService, productService) {
    this.urlService = urlService;
    this.productService = productService;
  }
  static {
    __name(this, "BrowserURLOpener");
  }
  async open(resource, options) {
    if (options?.openExternal) {
      return false;
    }
    if (!matchesScheme(resource, this.productService.urlProtocol)) {
      return false;
    }
    if (typeof resource === "string") {
      resource = URI.parse(resource);
    }
    return this.urlService.open(resource, { trusted: true });
  }
}
let BrowserURLService = class extends AbstractURLService {
  static {
    __name(this, "BrowserURLService");
  }
  provider;
  constructor(environmentService, openerService, productService) {
    super();
    this.provider = environmentService.options?.urlCallbackProvider;
    if (this.provider) {
      this._register(
        this.provider.onCallback(
          (uri) => this.open(uri, { trusted: true })
        )
      );
    }
    this._register(
      openerService.registerOpener(
        new BrowserURLOpener(this, productService)
      )
    );
  }
  create(options) {
    if (this.provider) {
      return this.provider.create(options);
    }
    return URI.parse("unsupported://");
  }
};
BrowserURLService = __decorateClass([
  __decorateParam(0, IBrowserWorkbenchEnvironmentService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IProductService)
], BrowserURLService);
registerSingleton(IURLService, BrowserURLService, InstantiationType.Delayed);
export {
  BrowserURLService
};
//# sourceMappingURL=urlService.js.map
