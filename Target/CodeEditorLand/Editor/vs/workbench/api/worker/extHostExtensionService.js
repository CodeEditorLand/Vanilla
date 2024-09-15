var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { timeout } from "../../../base/common/async.js";
import { URI } from "../../../base/common/uri.js";
import { createApiFactoryAndRegisterActors } from "../common/extHost.api.impl.js";
import { AbstractExtHostExtensionService } from "../common/extHostExtensionService.js";
import { RequireInterceptor } from "../common/extHostRequireInterceptor.js";
import { ExtensionRuntime } from "../common/extHostTypes.js";
import { ExtHostConsoleForwarder } from "./extHostConsoleForwarder.js";
class WorkerRequireInterceptor extends RequireInterceptor {
  static {
    __name(this, "WorkerRequireInterceptor");
  }
  _installInterceptor() {
  }
  getModule(request, parent) {
    for (const alternativeModuleName of this._alternatives) {
      const alternative = alternativeModuleName(request);
      if (alternative) {
        request = alternative;
        break;
      }
    }
    if (this._factories.has(request)) {
      return this._factories.get(request).load(request, parent, () => {
        throw new Error("CANNOT LOAD MODULE from here.");
      });
    }
    return void 0;
  }
}
class ExtHostExtensionService extends AbstractExtHostExtensionService {
  static {
    __name(this, "ExtHostExtensionService");
  }
  extensionRuntime = ExtensionRuntime.Webworker;
  _fakeModules;
  async _beforeAlmostReadyToRunExtensions() {
    this._instaService.createInstance(ExtHostConsoleForwarder);
    const apiFactory = this._instaService.invokeFunction(
      createApiFactoryAndRegisterActors
    );
    this._fakeModules = this._instaService.createInstance(
      WorkerRequireInterceptor,
      apiFactory,
      { mine: this._myRegistry, all: this._globalRegistry }
    );
    await this._fakeModules.install();
    performance.mark("code/extHost/didInitAPI");
    await this._waitForDebuggerAttachment();
  }
  _getEntryPoint(extensionDescription) {
    return extensionDescription.browser;
  }
  async _loadCommonJSModule(extension, module, activationTimesBuilder) {
    module = module.with({ path: ensureSuffix(module.path, ".js") });
    const extensionId = extension?.identifier.value;
    if (extensionId) {
      performance.mark(
        `code/extHost/willFetchExtensionCode/${extensionId}`
      );
    }
    const browserUri = URI.revive(
      await this._mainThreadExtensionsProxy.$asBrowserUri(module)
    );
    const response = await fetch(browserUri.toString(true));
    if (extensionId) {
      performance.mark(
        `code/extHost/didFetchExtensionCode/${extensionId}`
      );
    }
    if (response.status !== 200) {
      throw new Error(response.statusText);
    }
    const source = await response.text();
    const sourceURL = `${module.toString(true)}#vscode-extension`;
    const fullSource = `${source}
//# sourceURL=${sourceURL}`;
    let initFn;
    try {
      initFn = new Function("module", "exports", "require", fullSource);
    } catch (err) {
      if (extensionId) {
        console.error(
          `Loading code for extension ${extensionId} failed: ${err.message}`
        );
      } else {
        console.error(`Loading code failed: ${err.message}`);
      }
      console.error(
        `${module.toString(true)}${typeof err.line === "number" ? ` line ${err.line}` : ""}${typeof err.column === "number" ? ` column ${err.column}` : ""}`
      );
      console.error(err);
      throw err;
    }
    if (extension) {
      await this._extHostLocalizationService.initializeLocalizedMessages(
        extension
      );
    }
    const _exports = {};
    const _module = { exports: _exports };
    const _require = /* @__PURE__ */ __name((request) => {
      const result = this._fakeModules.getModule(request, module);
      if (result === void 0) {
        throw new Error(`Cannot load module '${request}'`);
      }
      return result;
    }, "_require");
    try {
      activationTimesBuilder.codeLoadingStart();
      if (extensionId) {
        performance.mark(
          `code/extHost/willLoadExtensionCode/${extensionId}`
        );
      }
      initFn(_module, _exports, _require);
      return _module.exports !== _exports ? _module.exports : _exports;
    } finally {
      if (extensionId) {
        performance.mark(
          `code/extHost/didLoadExtensionCode/${extensionId}`
        );
      }
      activationTimesBuilder.codeLoadingStop();
    }
  }
  async $setRemoteEnvironment(_env) {
    return;
  }
  async _waitForDebuggerAttachment(waitTimeout = 5e3) {
    if (!this._initData.environment.isExtensionDevelopmentDebug) {
      return;
    }
    const deadline = Date.now() + waitTimeout;
    while (Date.now() < deadline && !("__jsDebugIsReady" in globalThis)) {
      await timeout(10);
    }
  }
}
function ensureSuffix(path, suffix) {
  return path.endsWith(suffix) ? path : path + suffix;
}
__name(ensureSuffix, "ensureSuffix");
export {
  ExtHostExtensionService
};
//# sourceMappingURL=extHostExtensionService.js.map
