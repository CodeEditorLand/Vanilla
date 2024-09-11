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
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, DisposableMap, DisposableStore, IDisposable, isDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { isString } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ISecretStorageService } from "../../../../platform/secrets/common/secrets.js";
import { IAuthenticationAccessService } from "./authenticationAccessService.js";
import { AuthenticationProviderInformation, AuthenticationSession, AuthenticationSessionAccount, AuthenticationSessionsChangeEvent, IAuthenticationCreateSessionOptions, IAuthenticationProvider, IAuthenticationService } from "../common/authentication.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { ActivationKind, IExtensionService } from "../../extensions/common/extensions.js";
function getAuthenticationProviderActivationEvent(id) {
  return `onAuthenticationRequest:${id}`;
}
__name(getAuthenticationProviderActivationEvent, "getAuthenticationProviderActivationEvent");
async function getCurrentAuthenticationSessionInfo(secretStorageService, productService) {
  const authenticationSessionValue = await secretStorageService.get(`${productService.urlProtocol}.loginAccount`);
  if (authenticationSessionValue) {
    try {
      const authenticationSessionInfo = JSON.parse(authenticationSessionValue);
      if (authenticationSessionInfo && isString(authenticationSessionInfo.id) && isString(authenticationSessionInfo.accessToken) && isString(authenticationSessionInfo.providerId)) {
        return authenticationSessionInfo;
      }
    } catch (e) {
      console.error(`Failed parsing current auth session value: ${e}`);
    }
  }
  return void 0;
}
__name(getCurrentAuthenticationSessionInfo, "getCurrentAuthenticationSessionInfo");
let AuthenticationService = class extends Disposable {
  constructor(_extensionService, authenticationAccessService, _environmentService) {
    super();
    this._extensionService = _extensionService;
    this._environmentService = _environmentService;
    this._register(authenticationAccessService.onDidChangeExtensionSessionAccess((e) => {
      this._onDidChangeSessions.fire({
        providerId: e.providerId,
        label: e.accountName,
        event: {
          added: [],
          changed: [],
          removed: []
        }
      });
    }));
    this._registerEnvContributedAuthenticationProviders();
  }
  static {
    __name(this, "AuthenticationService");
  }
  _onDidRegisterAuthenticationProvider = this._register(new Emitter());
  onDidRegisterAuthenticationProvider = this._onDidRegisterAuthenticationProvider.event;
  _onDidUnregisterAuthenticationProvider = this._register(new Emitter());
  onDidUnregisterAuthenticationProvider = this._onDidUnregisterAuthenticationProvider.event;
  _onDidChangeSessions = this._register(new Emitter());
  onDidChangeSessions = this._onDidChangeSessions.event;
  _onDidChangeDeclaredProviders = this._register(new Emitter());
  onDidChangeDeclaredProviders = this._onDidChangeDeclaredProviders.event;
  _authenticationProviders = /* @__PURE__ */ new Map();
  _authenticationProviderDisposables = this._register(new DisposableMap());
  _declaredProviders = [];
  get declaredProviders() {
    return this._declaredProviders;
  }
  _registerEnvContributedAuthenticationProviders() {
    if (!this._environmentService.options?.authenticationProviders?.length) {
      return;
    }
    for (const provider of this._environmentService.options.authenticationProviders) {
      this.registerAuthenticationProvider(provider.id, provider);
    }
  }
  registerDeclaredAuthenticationProvider(provider) {
    if (isFalsyOrWhitespace(provider.id)) {
      throw new Error(localize("authentication.missingId", "An authentication contribution must specify an id."));
    }
    if (isFalsyOrWhitespace(provider.label)) {
      throw new Error(localize("authentication.missingLabel", "An authentication contribution must specify a label."));
    }
    if (this.declaredProviders.some((p) => p.id === provider.id)) {
      throw new Error(localize("authentication.idConflict", "This authentication id '{0}' has already been registered", provider.id));
    }
    this._declaredProviders.push(provider);
    this._onDidChangeDeclaredProviders.fire();
  }
  unregisterDeclaredAuthenticationProvider(id) {
    const index = this.declaredProviders.findIndex((provider) => provider.id === id);
    if (index > -1) {
      this.declaredProviders.splice(index, 1);
    }
    this._onDidChangeDeclaredProviders.fire();
  }
  isAuthenticationProviderRegistered(id) {
    return this._authenticationProviders.has(id);
  }
  registerAuthenticationProvider(id, authenticationProvider) {
    this._authenticationProviders.set(id, authenticationProvider);
    const disposableStore = new DisposableStore();
    disposableStore.add(authenticationProvider.onDidChangeSessions((e) => this._onDidChangeSessions.fire({
      providerId: id,
      label: authenticationProvider.label,
      event: e
    })));
    if (isDisposable(authenticationProvider)) {
      disposableStore.add(authenticationProvider);
    }
    this._authenticationProviderDisposables.set(id, disposableStore);
    this._onDidRegisterAuthenticationProvider.fire({ id, label: authenticationProvider.label });
  }
  unregisterAuthenticationProvider(id) {
    const provider = this._authenticationProviders.get(id);
    if (provider) {
      this._authenticationProviders.delete(id);
      this._onDidUnregisterAuthenticationProvider.fire({ id, label: provider.label });
    }
    this._authenticationProviderDisposables.deleteAndDispose(id);
  }
  getProviderIds() {
    const providerIds = [];
    this._authenticationProviders.forEach((provider) => {
      providerIds.push(provider.id);
    });
    return providerIds;
  }
  getProvider(id) {
    if (this._authenticationProviders.has(id)) {
      return this._authenticationProviders.get(id);
    }
    throw new Error(`No authentication provider '${id}' is currently registered.`);
  }
  async getAccounts(id) {
    const sessions = await this.getSessions(id);
    const accounts = new Array();
    const seenAccounts = /* @__PURE__ */ new Set();
    for (const session of sessions) {
      if (!seenAccounts.has(session.account.label)) {
        seenAccounts.add(session.account.label);
        accounts.push(session.account);
      }
    }
    return accounts;
  }
  async getSessions(id, scopes, account, activateImmediate = false) {
    const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, activateImmediate);
    if (authProvider) {
      return await authProvider.getSessions(scopes, { account });
    } else {
      throw new Error(`No authentication provider '${id}' is currently registered.`);
    }
  }
  async createSession(id, scopes, options) {
    const authProvider = this._authenticationProviders.get(id) || await this.tryActivateProvider(id, !!options?.activateImmediate);
    if (authProvider) {
      return await authProvider.createSession(scopes, {
        account: options?.account
      });
    } else {
      throw new Error(`No authentication provider '${id}' is currently registered.`);
    }
  }
  async removeSession(id, sessionId) {
    const authProvider = this._authenticationProviders.get(id);
    if (authProvider) {
      return authProvider.removeSession(sessionId);
    } else {
      throw new Error(`No authentication provider '${id}' is currently registered.`);
    }
  }
  async tryActivateProvider(providerId, activateImmediate) {
    await this._extensionService.activateByEvent(getAuthenticationProviderActivationEvent(providerId), activateImmediate ? ActivationKind.Immediate : ActivationKind.Normal);
    let provider = this._authenticationProviders.get(providerId);
    if (provider) {
      return provider;
    }
    const store = new DisposableStore();
    const didRegister = new Promise((resolve, _) => {
      store.add(Event.once(this.onDidRegisterAuthenticationProvider)((e) => {
        if (e.id === providerId) {
          provider = this._authenticationProviders.get(providerId);
          if (provider) {
            resolve(provider);
          } else {
            throw new Error(`No authentication provider '${providerId}' is currently registered.`);
          }
        }
      }));
    });
    const didTimeout = new Promise((_, reject) => {
      const handle = setTimeout(() => {
        reject("Timed out waiting for authentication provider to register");
      }, 5e3);
      store.add(toDisposable(() => clearTimeout(handle)));
    });
    return Promise.race([didRegister, didTimeout]).finally(() => store.dispose());
  }
};
AuthenticationService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IAuthenticationAccessService),
  __decorateParam(2, IBrowserWorkbenchEnvironmentService)
], AuthenticationService);
registerSingleton(IAuthenticationService, AuthenticationService, InstantiationType.Delayed);
export {
  AuthenticationService,
  getAuthenticationProviderActivationEvent,
  getCurrentAuthenticationSessionInfo
};
//# sourceMappingURL=authenticationService.js.map
