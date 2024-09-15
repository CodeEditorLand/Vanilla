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
import {
  createCancelablePromise,
  timeout
} from "../../../base/common/async.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import {
  getErrorMessage,
  isCancellationError
} from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { Mimes } from "../../../base/common/mime.js";
import { isWeb } from "../../../base/common/platform.js";
import { joinPath, relativePath } from "../../../base/common/resources.js";
import { isObject, isString } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentService } from "../../environment/common/environment.js";
import { getServiceMachineId } from "../../externalServices/common/serviceMachineId.js";
import { IFileService } from "../../files/common/files.js";
import { IProductService } from "../../product/common/productService.js";
import {
  IRequestService,
  asJson,
  asText,
  asTextOrError,
  hasNoContent,
  isSuccess,
  isSuccess as isSuccessContext
} from "../../request/common/request.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../storage/common/storage.js";
import {
  HEADER_EXECUTION_ID,
  HEADER_OPERATION_ID,
  IUserDataSyncLogService,
  IUserDataSyncStoreManagementService,
  SYNC_SERVICE_URL_TYPE,
  UserDataSyncErrorCode,
  UserDataSyncStoreError
} from "./userDataSync.js";
const CONFIGURATION_SYNC_STORE_KEY = "configurationSync.store";
const SYNC_PREVIOUS_STORE = "sync.previous.store";
const DONOT_MAKE_REQUESTS_UNTIL_KEY = "sync.donot-make-requests-until";
const USER_SESSION_ID_KEY = "sync.user-session-id";
const MACHINE_SESSION_ID_KEY = "sync.machine-session-id";
const REQUEST_SESSION_LIMIT = 100;
const REQUEST_SESSION_INTERVAL = 1e3 * 60 * 5;
let AbstractUserDataSyncStoreManagementService = class extends Disposable {
  constructor(productService, configurationService, storageService) {
    super();
    this.productService = productService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.updateUserDataSyncStore();
    const disposable = this._register(new DisposableStore());
    this._register(
      Event.filter(
        storageService.onDidChangeValue(
          StorageScope.APPLICATION,
          SYNC_SERVICE_URL_TYPE,
          disposable
        ),
        () => this.userDataSyncStoreType !== this.userDataSyncStore?.type,
        disposable
      )(() => this.updateUserDataSyncStore())
    );
  }
  static {
    __name(this, "AbstractUserDataSyncStoreManagementService");
  }
  _serviceBrand;
  _onDidChangeUserDataSyncStore = this._register(
    new Emitter()
  );
  onDidChangeUserDataSyncStore = this._onDidChangeUserDataSyncStore.event;
  _userDataSyncStore;
  get userDataSyncStore() {
    return this._userDataSyncStore;
  }
  get userDataSyncStoreType() {
    return this.storageService.get(
      SYNC_SERVICE_URL_TYPE,
      StorageScope.APPLICATION
    );
  }
  set userDataSyncStoreType(type) {
    this.storageService.store(
      SYNC_SERVICE_URL_TYPE,
      type,
      StorageScope.APPLICATION,
      isWeb ? StorageTarget.USER : StorageTarget.MACHINE
    );
  }
  updateUserDataSyncStore() {
    this._userDataSyncStore = this.toUserDataSyncStore(
      this.productService[CONFIGURATION_SYNC_STORE_KEY]
    );
    this._onDidChangeUserDataSyncStore.fire();
  }
  toUserDataSyncStore(configurationSyncStore) {
    if (!configurationSyncStore) {
      return void 0;
    }
    configurationSyncStore = isWeb && configurationSyncStore.web ? { ...configurationSyncStore, ...configurationSyncStore.web } : configurationSyncStore;
    if (isString(configurationSyncStore.url) && isObject(configurationSyncStore.authenticationProviders) && Object.keys(configurationSyncStore.authenticationProviders).every(
      (authenticationProviderId) => Array.isArray(
        configurationSyncStore.authenticationProviders[authenticationProviderId].scopes
      )
    )) {
      const syncStore = configurationSyncStore;
      const canSwitch = !!syncStore.canSwitch;
      const defaultType = syncStore.url === syncStore.insidersUrl ? "insiders" : "stable";
      const type = (canSwitch ? this.userDataSyncStoreType : void 0) || defaultType;
      const url = type === "insiders" ? syncStore.insidersUrl : type === "stable" ? syncStore.stableUrl : syncStore.url;
      return {
        url: URI.parse(url),
        type,
        defaultType,
        defaultUrl: URI.parse(syncStore.url),
        stableUrl: URI.parse(syncStore.stableUrl),
        insidersUrl: URI.parse(syncStore.insidersUrl),
        canSwitch,
        authenticationProviders: Object.keys(
          syncStore.authenticationProviders
        ).reduce((result, id) => {
          result.push({
            id,
            scopes: syncStore.authenticationProviders[id].scopes
          });
          return result;
        }, [])
      };
    }
    return void 0;
  }
};
AbstractUserDataSyncStoreManagementService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], AbstractUserDataSyncStoreManagementService);
let UserDataSyncStoreManagementService = class extends AbstractUserDataSyncStoreManagementService {
  static {
    __name(this, "UserDataSyncStoreManagementService");
  }
  previousConfigurationSyncStore;
  constructor(productService, configurationService, storageService) {
    super(productService, configurationService, storageService);
    const previousConfigurationSyncStore = this.storageService.get(
      SYNC_PREVIOUS_STORE,
      StorageScope.APPLICATION
    );
    if (previousConfigurationSyncStore) {
      this.previousConfigurationSyncStore = JSON.parse(
        previousConfigurationSyncStore
      );
    }
    const syncStore = this.productService[CONFIGURATION_SYNC_STORE_KEY];
    if (syncStore) {
      this.storageService.store(
        SYNC_PREVIOUS_STORE,
        JSON.stringify(syncStore),
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(
        SYNC_PREVIOUS_STORE,
        StorageScope.APPLICATION
      );
    }
  }
  async switch(type) {
    if (type !== this.userDataSyncStoreType) {
      this.userDataSyncStoreType = type;
      this.updateUserDataSyncStore();
    }
  }
  async getPreviousUserDataSyncStore() {
    return this.toUserDataSyncStore(this.previousConfigurationSyncStore);
  }
};
UserDataSyncStoreManagementService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService)
], UserDataSyncStoreManagementService);
let UserDataSyncStoreClient = class extends Disposable {
  constructor(userDataSyncStoreUrl, productService, requestService, logService, environmentService, fileService, storageService) {
    super();
    this.requestService = requestService;
    this.logService = logService;
    this.storageService = storageService;
    this.updateUserDataSyncStoreUrl(userDataSyncStoreUrl);
    this.commonHeadersPromise = getServiceMachineId(
      environmentService,
      fileService,
      storageService
    ).then((uuid) => {
      const headers = {
        "X-Client-Name": `${productService.applicationName}${isWeb ? "-web" : ""}`,
        "X-Client-Version": productService.version
      };
      if (productService.commit) {
        headers["X-Client-Commit"] = productService.commit;
      }
      return headers;
    });
    this.session = new RequestsSession(
      REQUEST_SESSION_LIMIT,
      REQUEST_SESSION_INTERVAL,
      this.requestService,
      this.logService
    );
    this.initDonotMakeRequestsUntil();
    this._register(
      toDisposable(() => {
        if (this.resetDonotMakeRequestsUntilPromise) {
          this.resetDonotMakeRequestsUntilPromise.cancel();
          this.resetDonotMakeRequestsUntilPromise = void 0;
        }
      })
    );
  }
  static {
    __name(this, "UserDataSyncStoreClient");
  }
  userDataSyncStoreUrl;
  authToken;
  commonHeadersPromise;
  session;
  _onTokenFailed = this._register(
    new Emitter()
  );
  onTokenFailed = this._onTokenFailed.event;
  _onTokenSucceed = this._register(
    new Emitter()
  );
  onTokenSucceed = this._onTokenSucceed.event;
  _donotMakeRequestsUntil = void 0;
  get donotMakeRequestsUntil() {
    return this._donotMakeRequestsUntil;
  }
  _onDidChangeDonotMakeRequestsUntil = this._register(
    new Emitter()
  );
  onDidChangeDonotMakeRequestsUntil = this._onDidChangeDonotMakeRequestsUntil.event;
  setAuthToken(token, type) {
    this.authToken = { token, type };
  }
  updateUserDataSyncStoreUrl(userDataSyncStoreUrl) {
    this.userDataSyncStoreUrl = userDataSyncStoreUrl ? joinPath(userDataSyncStoreUrl, "v1") : void 0;
  }
  initDonotMakeRequestsUntil() {
    const donotMakeRequestsUntil = this.storageService.getNumber(
      DONOT_MAKE_REQUESTS_UNTIL_KEY,
      StorageScope.APPLICATION
    );
    if (donotMakeRequestsUntil && Date.now() < donotMakeRequestsUntil) {
      this.setDonotMakeRequestsUntil(new Date(donotMakeRequestsUntil));
    }
  }
  resetDonotMakeRequestsUntilPromise = void 0;
  setDonotMakeRequestsUntil(donotMakeRequestsUntil) {
    if (this._donotMakeRequestsUntil?.getTime() !== donotMakeRequestsUntil?.getTime()) {
      this._donotMakeRequestsUntil = donotMakeRequestsUntil;
      if (this.resetDonotMakeRequestsUntilPromise) {
        this.resetDonotMakeRequestsUntilPromise.cancel();
        this.resetDonotMakeRequestsUntilPromise = void 0;
      }
      if (this._donotMakeRequestsUntil) {
        this.storageService.store(
          DONOT_MAKE_REQUESTS_UNTIL_KEY,
          this._donotMakeRequestsUntil.getTime(),
          StorageScope.APPLICATION,
          StorageTarget.MACHINE
        );
        this.resetDonotMakeRequestsUntilPromise = createCancelablePromise(
          (token) => timeout(
            this._donotMakeRequestsUntil.getTime() - Date.now(),
            token
          ).then(() => this.setDonotMakeRequestsUntil(void 0))
        );
        this.resetDonotMakeRequestsUntilPromise.then(
          null,
          (e) => null
        );
      } else {
        this.storageService.remove(
          DONOT_MAKE_REQUESTS_UNTIL_KEY,
          StorageScope.APPLICATION
        );
      }
      this._onDidChangeDonotMakeRequestsUntil.fire();
    }
  }
  // #region Collection
  async getAllCollections(headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(
      this.userDataSyncStoreUrl,
      "collection"
    ).toString();
    headers = { ...headers };
    headers["Content-Type"] = "application/json";
    const context = await this.request(
      url,
      { type: "GET", headers },
      [],
      CancellationToken.None
    );
    return (await asJson(context))?.map(({ id }) => id) || [];
  }
  async createCollection(headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(
      this.userDataSyncStoreUrl,
      "collection"
    ).toString();
    headers = { ...headers };
    headers["Content-Type"] = Mimes.text;
    const context = await this.request(
      url,
      { type: "POST", headers },
      [],
      CancellationToken.None
    );
    const collectionId = await asTextOrError(context);
    if (!collectionId) {
      throw new UserDataSyncStoreError(
        "Server did not return the collection id",
        url,
        UserDataSyncErrorCode.NoCollection,
        context.res.statusCode,
        context.res.headers[HEADER_OPERATION_ID]
      );
    }
    return collectionId;
  }
  async deleteCollection(collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = collection ? joinPath(
      this.userDataSyncStoreUrl,
      "collection",
      collection
    ).toString() : joinPath(this.userDataSyncStoreUrl, "collection").toString();
    headers = { ...headers };
    await this.request(
      url,
      { type: "DELETE", headers },
      [],
      CancellationToken.None
    );
  }
  // #endregion
  // #region Resource
  async getAllResourceRefs(resource, collection) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const uri = this.getResourceUrl(
      this.userDataSyncStoreUrl,
      collection,
      resource
    );
    const headers = {};
    const context = await this.request(
      uri.toString(),
      { type: "GET", headers },
      [],
      CancellationToken.None
    );
    const result = await asJson(context) || [];
    return result.map(({ url, created }) => ({
      ref: relativePath(uri, uri.with({ path: url })),
      created: created * 1e3
    }));
  }
  async resolveResourceContent(resource, ref, collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(
      this.getResourceUrl(
        this.userDataSyncStoreUrl,
        collection,
        resource
      ),
      ref
    ).toString();
    headers = { ...headers };
    headers["Cache-Control"] = "no-cache";
    const context = await this.request(
      url,
      { type: "GET", headers },
      [],
      CancellationToken.None
    );
    const content = await asTextOrError(context);
    return content;
  }
  async deleteResource(resource, ref, collection) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = ref !== null ? joinPath(
      this.getResourceUrl(
        this.userDataSyncStoreUrl,
        collection,
        resource
      ),
      ref
    ).toString() : this.getResourceUrl(
      this.userDataSyncStoreUrl,
      collection,
      resource
    ).toString();
    const headers = {};
    await this.request(
      url,
      { type: "DELETE", headers },
      [],
      CancellationToken.None
    );
  }
  async deleteResources() {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "resource").toString();
    const headers = { "Content-Type": Mimes.text };
    await this.request(
      url,
      { type: "DELETE", headers },
      [],
      CancellationToken.None
    );
  }
  async readResource(resource, oldValue, collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(
      this.getResourceUrl(
        this.userDataSyncStoreUrl,
        collection,
        resource
      ),
      "latest"
    ).toString();
    headers = { ...headers };
    headers["Cache-Control"] = "no-cache";
    if (oldValue) {
      headers["If-None-Match"] = oldValue.ref;
    }
    const context = await this.request(
      url,
      { type: "GET", headers },
      [304],
      CancellationToken.None
    );
    let userData = null;
    if (context.res.statusCode === 304) {
      userData = oldValue;
    }
    if (userData === null) {
      const ref = context.res.headers["etag"];
      if (!ref) {
        throw new UserDataSyncStoreError(
          "Server did not return the ref",
          url,
          UserDataSyncErrorCode.NoRef,
          context.res.statusCode,
          context.res.headers[HEADER_OPERATION_ID]
        );
      }
      const content = await asTextOrError(context);
      if (!content && context.res.statusCode === 304) {
        throw new UserDataSyncStoreError(
          "Empty response",
          url,
          UserDataSyncErrorCode.EmptyResponse,
          context.res.statusCode,
          context.res.headers[HEADER_OPERATION_ID]
        );
      }
      userData = { ref, content };
    }
    return userData;
  }
  async writeResource(resource, data, ref, collection, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = this.getResourceUrl(
      this.userDataSyncStoreUrl,
      collection,
      resource
    ).toString();
    headers = { ...headers };
    headers["Content-Type"] = Mimes.text;
    if (ref) {
      headers["If-Match"] = ref;
    }
    const context = await this.request(
      url,
      { type: "POST", data, headers },
      [],
      CancellationToken.None
    );
    const newRef = context.res.headers["etag"];
    if (!newRef) {
      throw new UserDataSyncStoreError(
        "Server did not return the ref",
        url,
        UserDataSyncErrorCode.NoRef,
        context.res.statusCode,
        context.res.headers[HEADER_OPERATION_ID]
      );
    }
    return newRef;
  }
  // #endregion
  async manifest(oldValue, headers = {}) {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "manifest").toString();
    headers = { ...headers };
    headers["Content-Type"] = "application/json";
    if (oldValue) {
      headers["If-None-Match"] = oldValue.ref;
    }
    const context = await this.request(
      url,
      { type: "GET", headers },
      [304],
      CancellationToken.None
    );
    let manifest = null;
    if (context.res.statusCode === 304) {
      manifest = oldValue;
    }
    if (!manifest) {
      const ref = context.res.headers["etag"];
      if (!ref) {
        throw new UserDataSyncStoreError(
          "Server did not return the ref",
          url,
          UserDataSyncErrorCode.NoRef,
          context.res.statusCode,
          context.res.headers[HEADER_OPERATION_ID]
        );
      }
      const content = await asTextOrError(context);
      if (!content && context.res.statusCode === 304) {
        throw new UserDataSyncStoreError(
          "Empty response",
          url,
          UserDataSyncErrorCode.EmptyResponse,
          context.res.statusCode,
          context.res.headers[HEADER_OPERATION_ID]
        );
      }
      if (content) {
        manifest = { ...JSON.parse(content), ref };
      }
    }
    const currentSessionId = this.storageService.get(
      USER_SESSION_ID_KEY,
      StorageScope.APPLICATION
    );
    if (currentSessionId && manifest && currentSessionId !== manifest.session) {
      this.clearSession();
    }
    if (manifest === null && currentSessionId) {
      this.clearSession();
    }
    if (manifest) {
      this.storageService.store(
        USER_SESSION_ID_KEY,
        manifest.session,
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    }
    return manifest;
  }
  async clear() {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    await this.deleteCollection();
    await this.deleteResources();
    this.clearSession();
  }
  async getActivityData() {
    if (!this.userDataSyncStoreUrl) {
      throw new Error("No settings sync store url configured.");
    }
    const url = joinPath(this.userDataSyncStoreUrl, "download").toString();
    const headers = {};
    const context = await this.request(
      url,
      { type: "GET", headers },
      [],
      CancellationToken.None
    );
    if (!isSuccess(context)) {
      throw new UserDataSyncStoreError(
        "Server returned " + context.res.statusCode,
        url,
        UserDataSyncErrorCode.EmptyResponse,
        context.res.statusCode,
        context.res.headers[HEADER_OPERATION_ID]
      );
    }
    if (hasNoContent(context)) {
      throw new UserDataSyncStoreError(
        "Empty response",
        url,
        UserDataSyncErrorCode.EmptyResponse,
        context.res.statusCode,
        context.res.headers[HEADER_OPERATION_ID]
      );
    }
    return context.stream;
  }
  getResourceUrl(userDataSyncStoreUrl, collection, resource) {
    return collection ? joinPath(
      userDataSyncStoreUrl,
      "collection",
      collection,
      "resource",
      resource
    ) : joinPath(userDataSyncStoreUrl, "resource", resource);
  }
  clearSession() {
    this.storageService.remove(
      USER_SESSION_ID_KEY,
      StorageScope.APPLICATION
    );
    this.storageService.remove(
      MACHINE_SESSION_ID_KEY,
      StorageScope.APPLICATION
    );
  }
  async request(url, options, successCodes, token) {
    if (!this.authToken) {
      throw new UserDataSyncStoreError(
        "No Auth Token Available",
        url,
        UserDataSyncErrorCode.Unauthorized,
        void 0,
        void 0
      );
    }
    if (this._donotMakeRequestsUntil && Date.now() < this._donotMakeRequestsUntil.getTime()) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because of too many requests (429).`,
        url,
        UserDataSyncErrorCode.TooManyRequestsAndRetryAfter,
        void 0,
        void 0
      );
    }
    this.setDonotMakeRequestsUntil(void 0);
    const commonHeaders = await this.commonHeadersPromise;
    options.headers = {
      ...options.headers || {},
      ...commonHeaders,
      "X-Account-Type": this.authToken.type,
      authorization: `Bearer ${this.authToken.token}`
    };
    this.addSessionHeaders(options.headers);
    this.logService.trace("Sending request to server", {
      url,
      type: options.type,
      headers: { ...options.headers, ...{ authorization: void 0 } }
    });
    let context;
    try {
      context = await this.session.request(url, options, token);
    } catch (e) {
      if (!(e instanceof UserDataSyncStoreError)) {
        let code = UserDataSyncErrorCode.RequestFailed;
        const errorMessage = getErrorMessage(e).toLowerCase();
        if (errorMessage.includes("xhr timeout")) {
          code = UserDataSyncErrorCode.RequestTimeout;
        } else if (errorMessage.includes("protocol") && errorMessage.includes("not supported")) {
          code = UserDataSyncErrorCode.RequestProtocolNotSupported;
        } else if (errorMessage.includes(
          "request path contains unescaped characters"
        )) {
          code = UserDataSyncErrorCode.RequestPathNotEscaped;
        } else if (errorMessage.includes("headers must be an object")) {
          code = UserDataSyncErrorCode.RequestHeadersNotObject;
        } else if (isCancellationError(e)) {
          code = UserDataSyncErrorCode.RequestCanceled;
        }
        e = new UserDataSyncStoreError(
          `Connection refused for the request '${url}'.`,
          url,
          code,
          void 0,
          void 0
        );
      }
      this.logService.info("Request failed", url);
      throw e;
    }
    const operationId = context.res.headers[HEADER_OPERATION_ID];
    const requestInfo = {
      url,
      status: context.res.statusCode,
      "execution-id": options.headers[HEADER_EXECUTION_ID],
      "operation-id": operationId
    };
    const isSuccess2 = isSuccessContext(context) || context.res.statusCode && successCodes.includes(context.res.statusCode);
    let failureMessage = "";
    if (isSuccess2) {
      this.logService.trace("Request succeeded", requestInfo);
    } else {
      failureMessage = await asText(context) || "";
      this.logService.info("Request failed", requestInfo, failureMessage);
    }
    if (context.res.statusCode === 401 || context.res.statusCode === 403) {
      this.authToken = void 0;
      if (context.res.statusCode === 401) {
        this._onTokenFailed.fire(UserDataSyncErrorCode.Unauthorized);
        throw new UserDataSyncStoreError(
          `${options.type} request '${url}' failed because of Unauthorized (401).`,
          url,
          UserDataSyncErrorCode.Unauthorized,
          context.res.statusCode,
          operationId
        );
      }
      if (context.res.statusCode === 403) {
        this._onTokenFailed.fire(UserDataSyncErrorCode.Forbidden);
        throw new UserDataSyncStoreError(
          `${options.type} request '${url}' failed because the access is forbidden (403).`,
          url,
          UserDataSyncErrorCode.Forbidden,
          context.res.statusCode,
          operationId
        );
      }
    }
    this._onTokenSucceed.fire();
    if (context.res.statusCode === 404) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because the requested resource is not found (404).`,
        url,
        UserDataSyncErrorCode.NotFound,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 405) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because the requested endpoint is not found (405). ${failureMessage}`,
        url,
        UserDataSyncErrorCode.MethodNotFound,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 409) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because of Conflict (409). There is new data for this resource. Make the request again with latest data.`,
        url,
        UserDataSyncErrorCode.Conflict,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 410) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because the requested resource is not longer available (410).`,
        url,
        UserDataSyncErrorCode.Gone,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 412) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because of Precondition Failed (412). There is new data for this resource. Make the request again with latest data.`,
        url,
        UserDataSyncErrorCode.PreconditionFailed,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 413) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed because of too large payload (413).`,
        url,
        UserDataSyncErrorCode.TooLarge,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 426) {
      throw new UserDataSyncStoreError(
        `${options.type} request '${url}' failed with status Upgrade Required (426). Please upgrade the client and try again.`,
        url,
        UserDataSyncErrorCode.UpgradeRequired,
        context.res.statusCode,
        operationId
      );
    }
    if (context.res.statusCode === 429) {
      const retryAfter = context.res.headers["retry-after"];
      if (retryAfter) {
        this.setDonotMakeRequestsUntil(
          new Date(Date.now() + Number.parseInt(retryAfter) * 1e3)
        );
        throw new UserDataSyncStoreError(
          `${options.type} request '${url}' failed because of too many requests (429).`,
          url,
          UserDataSyncErrorCode.TooManyRequestsAndRetryAfter,
          context.res.statusCode,
          operationId
        );
      } else {
        throw new UserDataSyncStoreError(
          `${options.type} request '${url}' failed because of too many requests (429).`,
          url,
          UserDataSyncErrorCode.TooManyRequests,
          context.res.statusCode,
          operationId
        );
      }
    }
    if (!isSuccess2) {
      throw new UserDataSyncStoreError(
        "Server returned " + context.res.statusCode,
        url,
        UserDataSyncErrorCode.Unknown,
        context.res.statusCode,
        operationId
      );
    }
    return context;
  }
  addSessionHeaders(headers) {
    let machineSessionId = this.storageService.get(
      MACHINE_SESSION_ID_KEY,
      StorageScope.APPLICATION
    );
    if (machineSessionId === void 0) {
      machineSessionId = generateUuid();
      this.storageService.store(
        MACHINE_SESSION_ID_KEY,
        machineSessionId,
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    }
    headers["X-Machine-Session-Id"] = machineSessionId;
    const userSessionId = this.storageService.get(
      USER_SESSION_ID_KEY,
      StorageScope.APPLICATION
    );
    if (userSessionId !== void 0) {
      headers["X-User-Session-Id"] = userSessionId;
    }
  }
};
UserDataSyncStoreClient = __decorateClass([
  __decorateParam(1, IProductService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IStorageService)
], UserDataSyncStoreClient);
let UserDataSyncStoreService = class extends UserDataSyncStoreClient {
  static {
    __name(this, "UserDataSyncStoreService");
  }
  _serviceBrand;
  constructor(userDataSyncStoreManagementService, productService, requestService, logService, environmentService, fileService, storageService) {
    super(
      userDataSyncStoreManagementService.userDataSyncStore?.url,
      productService,
      requestService,
      logService,
      environmentService,
      fileService,
      storageService
    );
    this._register(
      userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(
        () => this.updateUserDataSyncStoreUrl(
          userDataSyncStoreManagementService.userDataSyncStore?.url
        )
      )
    );
  }
};
UserDataSyncStoreService = __decorateClass([
  __decorateParam(0, IUserDataSyncStoreManagementService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IStorageService)
], UserDataSyncStoreService);
class RequestsSession {
  constructor(limit, interval, requestService, logService) {
    this.limit = limit;
    this.interval = interval;
    this.requestService = requestService;
    this.logService = logService;
  }
  static {
    __name(this, "RequestsSession");
  }
  requests = [];
  startTime = void 0;
  request(url, options, token) {
    if (this.isExpired()) {
      this.reset();
    }
    options.url = url;
    if (this.requests.length >= this.limit) {
      this.logService.info("Too many requests", ...this.requests);
      throw new UserDataSyncStoreError(
        `Too many requests. Only ${this.limit} requests allowed in ${this.interval / (1e3 * 60)} minutes.`,
        url,
        UserDataSyncErrorCode.LocalTooManyRequests,
        void 0,
        void 0
      );
    }
    this.startTime = this.startTime || /* @__PURE__ */ new Date();
    this.requests.push(url);
    return this.requestService.request(options, token);
  }
  isExpired() {
    return this.startTime !== void 0 && (/* @__PURE__ */ new Date()).getTime() - this.startTime.getTime() > this.interval;
  }
  reset() {
    this.requests = [];
    this.startTime = void 0;
  }
}
export {
  AbstractUserDataSyncStoreManagementService,
  RequestsSession,
  UserDataSyncStoreClient,
  UserDataSyncStoreManagementService,
  UserDataSyncStoreService
};
//# sourceMappingURL=userDataSyncStoreService.js.map
