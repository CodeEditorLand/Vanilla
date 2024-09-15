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
import { Emitter } from "../../../base/common/event.js";
import {
  ExtensionIdentifier
} from "../../../platform/extensions/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { INTERNAL_AUTH_PROVIDER_PREFIX } from "../../services/authentication/common/authentication.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { Disposable } from "./extHostTypes.js";
const IExtHostAuthentication = createDecorator(
  "IExtHostAuthentication"
);
let ExtHostAuthentication = class {
  static {
    __name(this, "ExtHostAuthentication");
  }
  _proxy;
  _authenticationProviders = /* @__PURE__ */ new Map();
  _onDidChangeSessions = new Emitter();
  onDidChangeSessions = this._onDidChangeSessions.event;
  _getSessionTaskSingler = new TaskSingler();
  constructor(extHostRpc) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadAuthentication);
  }
  async getSession(requestingExtension, providerId, scopes, options = {}) {
    const extensionId = ExtensionIdentifier.toKey(
      requestingExtension.identifier
    );
    const sortedScopes = [...scopes].sort().join(" ");
    return await this._getSessionTaskSingler.getOrCreate(
      `${extensionId} ${providerId} ${sortedScopes}`,
      async () => {
        await this._proxy.$ensureProvider(providerId);
        const extensionName = requestingExtension.displayName || requestingExtension.name;
        return this._proxy.$getSession(
          providerId,
          scopes,
          extensionId,
          extensionName,
          options
        );
      }
    );
  }
  async getAccounts(providerId) {
    await this._proxy.$ensureProvider(providerId);
    return await this._proxy.$getAccounts(providerId);
  }
  async removeSession(providerId, sessionId) {
    const providerData = this._authenticationProviders.get(providerId);
    if (!providerData) {
      return this._proxy.$removeSession(providerId, sessionId);
    }
    return providerData.provider.removeSession(sessionId);
  }
  registerAuthenticationProvider(id, label, provider, options) {
    if (this._authenticationProviders.get(id)) {
      throw new Error(
        `An authentication provider with id '${id}' is already registered.`
      );
    }
    this._authenticationProviders.set(id, {
      label,
      provider,
      options: options ?? { supportsMultipleAccounts: false }
    });
    const listener = provider.onDidChangeSessions(
      (e) => this._proxy.$sendDidChangeSessions(id, e)
    );
    this._proxy.$registerAuthenticationProvider(
      id,
      label,
      options?.supportsMultipleAccounts ?? false
    );
    return new Disposable(() => {
      listener.dispose();
      this._authenticationProviders.delete(id);
      this._proxy.$unregisterAuthenticationProvider(id);
    });
  }
  async $createSession(providerId, scopes, options) {
    const providerData = this._authenticationProviders.get(providerId);
    if (providerData) {
      return await providerData.provider.createSession(scopes, options);
    }
    throw new Error(
      `Unable to find authentication provider with handle: ${providerId}`
    );
  }
  async $removeSession(providerId, sessionId) {
    const providerData = this._authenticationProviders.get(providerId);
    if (providerData) {
      return await providerData.provider.removeSession(sessionId);
    }
    throw new Error(
      `Unable to find authentication provider with handle: ${providerId}`
    );
  }
  async $getSessions(providerId, scopes, options) {
    const providerData = this._authenticationProviders.get(providerId);
    if (providerData) {
      return await providerData.provider.getSessions(scopes, options);
    }
    throw new Error(
      `Unable to find authentication provider with handle: ${providerId}`
    );
  }
  $onDidChangeAuthenticationSessions(id, label) {
    if (!id.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
      this._onDidChangeSessions.fire({ provider: { id, label } });
    }
    return Promise.resolve();
  }
};
ExtHostAuthentication = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostAuthentication);
class TaskSingler {
  static {
    __name(this, "TaskSingler");
  }
  _inFlightPromises = /* @__PURE__ */ new Map();
  getOrCreate(key, promiseFactory) {
    const inFlight = this._inFlightPromises.get(key);
    if (inFlight) {
      return inFlight;
    }
    const promise = promiseFactory().finally(
      () => this._inFlightPromises.delete(key)
    );
    this._inFlightPromises.set(key, promise);
    return promise;
  }
}
export {
  ExtHostAuthentication,
  IExtHostAuthentication
};
//# sourceMappingURL=extHostAuthentication.js.map
