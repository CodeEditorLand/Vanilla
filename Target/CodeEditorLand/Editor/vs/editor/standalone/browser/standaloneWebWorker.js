var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { getAllMethodNames } from "../../../base/common/objects.js";
import { URI } from "../../../base/common/uri.js";
import { IWorkerDescriptor } from "../../../base/common/worker/simpleWorker.js";
import { EditorWorkerClient } from "../../browser/services/editorWorkerService.js";
import { IModelService } from "../../common/services/model.js";
import { standaloneEditorWorkerDescriptor } from "./standaloneServices.js";
function createWebWorker(modelService, opts) {
  return new MonacoWebWorkerImpl(modelService, opts);
}
__name(createWebWorker, "createWebWorker");
class MonacoWebWorkerImpl extends EditorWorkerClient {
  static {
    __name(this, "MonacoWebWorkerImpl");
  }
  _foreignModuleId;
  _foreignModuleHost;
  _foreignModuleCreateData;
  _foreignProxy;
  constructor(modelService, opts) {
    const workerDescriptor = {
      amdModuleId: standaloneEditorWorkerDescriptor.amdModuleId,
      esmModuleLocation: standaloneEditorWorkerDescriptor.esmModuleLocation,
      label: opts.label
    };
    super(workerDescriptor, opts.keepIdleModels || false, modelService);
    this._foreignModuleId = opts.moduleId;
    this._foreignModuleCreateData = opts.createData || null;
    this._foreignModuleHost = opts.host || null;
    this._foreignProxy = null;
  }
  // foreign host request
  fhr(method, args) {
    if (!this._foreignModuleHost || typeof this._foreignModuleHost[method] !== "function") {
      return Promise.reject(new Error("Missing method " + method + " or missing main thread foreign host."));
    }
    try {
      return Promise.resolve(this._foreignModuleHost[method].apply(this._foreignModuleHost, args));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  _getForeignProxy() {
    if (!this._foreignProxy) {
      this._foreignProxy = this._getProxy().then((proxy) => {
        const foreignHostMethods = this._foreignModuleHost ? getAllMethodNames(this._foreignModuleHost) : [];
        return proxy.$loadForeignModule(this._foreignModuleId, this._foreignModuleCreateData, foreignHostMethods).then((foreignMethods) => {
          this._foreignModuleCreateData = null;
          const proxyMethodRequest = /* @__PURE__ */ __name((method, args) => {
            return proxy.$fmr(method, args);
          }, "proxyMethodRequest");
          const createProxyMethod = /* @__PURE__ */ __name((method, proxyMethodRequest2) => {
            return function() {
              const args = Array.prototype.slice.call(arguments, 0);
              return proxyMethodRequest2(method, args);
            };
          }, "createProxyMethod");
          const foreignProxy = {};
          for (const foreignMethod of foreignMethods) {
            foreignProxy[foreignMethod] = createProxyMethod(foreignMethod, proxyMethodRequest);
          }
          return foreignProxy;
        });
      });
    }
    return this._foreignProxy;
  }
  getProxy() {
    return this._getForeignProxy();
  }
  withSyncedResources(resources) {
    return this.workerWithSyncedResources(resources).then((_) => this.getProxy());
  }
}
export {
  createWebWorker
};
//# sourceMappingURL=standaloneWebWorker.js.map
