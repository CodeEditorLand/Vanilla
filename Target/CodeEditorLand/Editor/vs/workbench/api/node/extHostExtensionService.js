import { createRequire } from "node:module";
import { Schemas } from "../../../base/common/network.js";
import * as performance from "../../../base/common/performance.js";
import { URI } from "../../../base/common/uri.js";
import { realpathSync } from "../../../base/node/extpath.js";
import { createApiFactoryAndRegisterActors } from "../common/extHost.api.impl.js";
import { AbstractExtHostExtensionService } from "../common/extHostExtensionService.js";
import { RequireInterceptor } from "../common/extHostRequireInterceptor.js";
import { ExtensionRuntime } from "../common/extHostTypes.js";
import { CLIServer } from "./extHostCLIServer.js";
import { ExtHostConsoleForwarder } from "./extHostConsoleForwarder.js";
import { ExtHostDiskFileSystemProvider } from "./extHostDiskFileSystemProvider.js";
import { ExtHostDownloadService } from "./extHostDownloadService.js";
import { connectProxyResolver } from "./proxyResolver.js";
const require2 = createRequire(import.meta.url);
class NodeModuleRequireInterceptor extends RequireInterceptor {
  _installInterceptor() {
    const that = this;
    const node_module = require2("module");
    const originalLoad = node_module._load;
    node_module._load = function load(request, parent, isMain) {
      request = applyAlternatives(request);
      if (!that._factories.has(request)) {
        return originalLoad.apply(this, arguments);
      }
      return that._factories.get(request).load(
        request,
        URI.file(realpathSync(parent.filename)),
        (request2) => originalLoad.apply(this, [request2, parent, isMain])
      );
    };
    const originalLookup = node_module._resolveLookupPaths;
    node_module._resolveLookupPaths = (request, parent) => {
      return originalLookup.call(
        this,
        applyAlternatives(request),
        parent
      );
    };
    const applyAlternatives = (request) => {
      for (const alternativeModuleName of that._alternatives) {
        const alternative = alternativeModuleName(request);
        if (alternative) {
          request = alternative;
          break;
        }
      }
      return request;
    };
  }
}
class ExtHostExtensionService extends AbstractExtHostExtensionService {
  extensionRuntime = ExtensionRuntime.Node;
  async _beforeAlmostReadyToRunExtensions() {
    this._instaService.createInstance(ExtHostConsoleForwarder);
    const extensionApiFactory = this._instaService.invokeFunction(
      createApiFactoryAndRegisterActors
    );
    this._instaService.createInstance(ExtHostDownloadService);
    if (this._initData.remote.isRemote && this._initData.remote.authority) {
      const cliServer = this._instaService.createInstance(CLIServer);
      process.env["VSCODE_IPC_HOOK_CLI"] = cliServer.ipcHandlePath;
    }
    this._instaService.createInstance(ExtHostDiskFileSystemProvider);
    const interceptor = this._instaService.createInstance(
      NodeModuleRequireInterceptor,
      extensionApiFactory,
      { mine: this._myRegistry, all: this._globalRegistry }
    );
    await interceptor.install();
    performance.mark("code/extHost/didInitAPI");
    const configProvider = await this._extHostConfiguration.getConfigProvider();
    await connectProxyResolver(
      this._extHostWorkspace,
      configProvider,
      this,
      this._logService,
      this._mainThreadTelemetryProxy,
      this._initData
    );
    performance.mark("code/extHost/didInitProxyResolver");
  }
  _getEntryPoint(extensionDescription) {
    return extensionDescription.main;
  }
  async _loadCommonJSModule(extension, module, activationTimesBuilder) {
    if (module.scheme !== Schemas.file) {
      throw new Error(
        `Cannot load URI: '${module}', must be of file-scheme`
      );
    }
    let r = null;
    activationTimesBuilder.codeLoadingStart();
    this._logService.trace(
      `ExtensionService#loadCommonJSModule ${module.toString(true)}`
    );
    this._logService.flush();
    const extensionId = extension?.identifier.value;
    if (extension) {
      await this._extHostLocalizationService.initializeLocalizedMessages(
        extension
      );
    }
    try {
      if (extensionId) {
        performance.mark(
          `code/extHost/willLoadExtensionCode/${extensionId}`
        );
      }
      r = (require2.__$__nodeRequire ?? require2)(
        /* TODO@esm drop the first */
        module.fsPath
      );
    } finally {
      if (extensionId) {
        performance.mark(
          `code/extHost/didLoadExtensionCode/${extensionId}`
        );
      }
      activationTimesBuilder.codeLoadingStop();
    }
    return r;
  }
  async $setRemoteEnvironment(env) {
    if (!this._initData.remote.isRemote) {
      return;
    }
    for (const key in env) {
      const value = env[key];
      if (value === null) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}
export {
  ExtHostExtensionService
};
