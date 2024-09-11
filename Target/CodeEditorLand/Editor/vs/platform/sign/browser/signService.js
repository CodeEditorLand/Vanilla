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
import { importAMDNodeModule, resolveAmdNodeModulePath } from "../../../amdX.js";
import { WindowIntervalTimer } from "../../../base/browser/dom.js";
import { mainWindow } from "../../../base/browser/window.js";
import { isESM } from "../../../base/common/amd.js";
import { memoize } from "../../../base/common/decorators.js";
import { FileAccess } from "../../../base/common/network.js";
import { IProductService } from "../../product/common/productService.js";
import { AbstractSignService, IVsdaValidator } from "../common/abstractSignService.js";
import { ISignService } from "../common/sign.js";
const KEY_SIZE = 32;
const IV_SIZE = 16;
const STEP_SIZE = KEY_SIZE + IV_SIZE;
let SignService = class extends AbstractSignService {
  constructor(productService) {
    super();
    this.productService = productService;
  }
  static {
    __name(this, "SignService");
  }
  getValidator() {
    return this.vsda().then((vsda) => {
      const v = new vsda.validator();
      return {
        createNewMessage: /* @__PURE__ */ __name((arg) => v.createNewMessage(arg), "createNewMessage"),
        validate: /* @__PURE__ */ __name((arg) => v.validate(arg), "validate"),
        dispose: /* @__PURE__ */ __name(() => v.free(), "dispose")
      };
    });
  }
  signValue(arg) {
    return this.vsda().then((vsda) => vsda.sign(arg));
  }
  async vsda() {
    const checkInterval = new WindowIntervalTimer();
    let [wasm] = await Promise.all([
      this.getWasmBytes(),
      new Promise((resolve, reject) => {
        importAMDNodeModule("vsda", "rust/web/vsda.js").then(() => resolve(), reject);
        checkInterval.cancelAndSet(() => {
          if (typeof vsda_web !== "undefined") {
            resolve();
          }
        }, 50, mainWindow);
      }).finally(() => checkInterval.dispose())
    ]);
    const keyBytes = new TextEncoder().encode(this.productService.serverLicense?.join("\n") || "");
    for (let i = 0; i + STEP_SIZE < keyBytes.length; i += STEP_SIZE) {
      const key = await crypto.subtle.importKey("raw", keyBytes.slice(i + IV_SIZE, i + IV_SIZE + KEY_SIZE), { name: "AES-CBC" }, false, ["decrypt"]);
      wasm = await crypto.subtle.decrypt({ name: "AES-CBC", iv: keyBytes.slice(i, i + IV_SIZE) }, key, wasm);
    }
    await vsda_web.default(wasm);
    return vsda_web;
  }
  async getWasmBytes() {
    const url = isESM ? resolveAmdNodeModulePath("vsda", "rust/web/vsda_bg.wasm") : FileAccess.asBrowserUri("vsda/../vsda_bg.wasm").toString(true);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("error loading vsda");
    }
    return response.arrayBuffer();
  }
};
__decorateClass([
  memoize
], SignService.prototype, "vsda", 1);
SignService = __decorateClass([
  __decorateParam(0, IProductService)
], SignService);
export {
  SignService
};
//# sourceMappingURL=signService.js.map
