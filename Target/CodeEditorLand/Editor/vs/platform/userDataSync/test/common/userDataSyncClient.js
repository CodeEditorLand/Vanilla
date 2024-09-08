import { VSBuffer, bufferToStream } from "../../../../base/common/buffer.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { joinPath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IConfigurationService } from "../../../configuration/common/configuration.js";
import { ConfigurationService } from "../../../configuration/common/configurationService.js";
import { IEnvironmentService } from "../../../environment/common/environment.js";
import { GlobalExtensionEnablementService } from "../../../extensionManagement/common/extensionEnablementService.js";
import {
  IExtensionGalleryService,
  IExtensionManagementService,
  IGlobalExtensionEnablementService
} from "../../../extensionManagement/common/extensionManagement.js";
import {
  ExtensionStorageService,
  IExtensionStorageService
} from "../../../extensionManagement/common/extensionStorage.js";
import { FileService } from "../../../files/common/fileService.js";
import { IFileService } from "../../../files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../files/common/inMemoryFilesystemProvider.js";
import { TestInstantiationService } from "../../../instantiation/test/common/instantiationServiceMock.js";
import { ILogService, NullLogService } from "../../../log/common/log.js";
import { NullPolicyService } from "../../../policy/common/policy.js";
import product from "../../../product/common/product.js";
import { IProductService } from "../../../product/common/productService.js";
import {
  IRequestService
} from "../../../request/common/request.js";
import {
  IStorageService,
  InMemoryStorageService
} from "../../../storage/common/storage.js";
import { ITelemetryService } from "../../../telemetry/common/telemetry.js";
import { NullTelemetryService } from "../../../telemetry/common/telemetryUtils.js";
import { IUriIdentityService } from "../../../uriIdentity/common/uriIdentity.js";
import { UriIdentityService } from "../../../uriIdentity/common/uriIdentityService.js";
import {
  IUserDataProfilesService,
  InMemoryUserDataProfilesService
} from "../../../userDataProfile/common/userDataProfile.js";
import { IUserDataProfileStorageService } from "../../../userDataProfile/common/userDataProfileStorageService.js";
import { TestUserDataProfileStorageService } from "../../../userDataProfile/test/common/userDataProfileStorageService.test.js";
import {
  IIgnoredExtensionsManagementService,
  IgnoredExtensionsManagementService
} from "../../common/ignoredExtensions.js";
import {
  ALL_SYNC_RESOURCES,
  IUserDataSyncEnablementService,
  IUserDataSyncLocalStoreService,
  IUserDataSyncLogService,
  IUserDataSyncService,
  IUserDataSyncStoreManagementService,
  IUserDataSyncStoreService,
  IUserDataSyncUtilService,
  USER_DATA_SYNC_SCHEME,
  getDefaultIgnoredSettings,
  registerConfiguration
} from "../../common/userDataSync.js";
import {
  IUserDataSyncAccountService,
  UserDataSyncAccountService
} from "../../common/userDataSyncAccount.js";
import { UserDataSyncEnablementService } from "../../common/userDataSyncEnablementService.js";
import { UserDataSyncLocalStoreService } from "../../common/userDataSyncLocalStoreService.js";
import {
  IUserDataSyncMachinesService,
  UserDataSyncMachinesService
} from "../../common/userDataSyncMachines.js";
import { UserDataSyncService } from "../../common/userDataSyncService.js";
import {
  UserDataSyncStoreManagementService,
  UserDataSyncStoreService
} from "../../common/userDataSyncStoreService.js";
class UserDataSyncClient extends Disposable {
  constructor(testServer = new UserDataSyncTestServer()) {
    super();
    this.testServer = testServer;
    this.instantiationService = this._register(
      new TestInstantiationService()
    );
  }
  instantiationService;
  async setUp(empty = false) {
    this._register(registerConfiguration());
    const logService = this.instantiationService.stub(
      ILogService,
      new NullLogService()
    );
    const userRoamingDataHome = URI.file("userdata").with({
      scheme: Schemas.inMemory
    });
    const userDataSyncHome = joinPath(userRoamingDataHome, ".sync");
    const environmentService = this.instantiationService.stub(
      IEnvironmentService,
      {
        userDataSyncHome,
        userRoamingDataHome,
        cacheHome: joinPath(userRoamingDataHome, "cache"),
        argvResource: joinPath(userRoamingDataHome, "argv.json"),
        sync: "on"
      }
    );
    this.instantiationService.stub(IProductService, {
      _serviceBrand: void 0,
      ...product,
      ...{
        "configurationSync.store": {
          url: this.testServer.url,
          stableUrl: this.testServer.url,
          insidersUrl: this.testServer.url,
          canSwitch: false,
          authenticationProviders: { test: { scopes: [] } }
        }
      }
    });
    const fileService = this._register(new FileService(logService));
    this._register(
      fileService.registerProvider(
        Schemas.inMemory,
        this._register(new InMemoryFileSystemProvider())
      )
    );
    this._register(
      fileService.registerProvider(
        USER_DATA_SYNC_SCHEME,
        this._register(new InMemoryFileSystemProvider())
      )
    );
    this.instantiationService.stub(IFileService, fileService);
    const uriIdentityService = this._register(
      this.instantiationService.createInstance(UriIdentityService)
    );
    this.instantiationService.stub(IUriIdentityService, uriIdentityService);
    const userDataProfilesService = this._register(
      new InMemoryUserDataProfilesService(
        environmentService,
        fileService,
        uriIdentityService,
        logService
      )
    );
    this.instantiationService.stub(
      IUserDataProfilesService,
      userDataProfilesService
    );
    const storageService = this._register(
      new TestStorageService(userDataProfilesService.defaultProfile)
    );
    this.instantiationService.stub(
      IStorageService,
      this._register(storageService)
    );
    this.instantiationService.stub(
      IUserDataProfileStorageService,
      this._register(
        new TestUserDataProfileStorageService(false, storageService)
      )
    );
    const configurationService = this._register(
      new ConfigurationService(
        userDataProfilesService.defaultProfile.settingsResource,
        fileService,
        new NullPolicyService(),
        logService
      )
    );
    await configurationService.initialize();
    this.instantiationService.stub(
      IConfigurationService,
      configurationService
    );
    this.instantiationService.stub(IRequestService, this.testServer);
    this.instantiationService.stub(IUserDataSyncLogService, logService);
    this.instantiationService.stub(ITelemetryService, NullTelemetryService);
    this.instantiationService.stub(
      IUserDataSyncStoreManagementService,
      this._register(
        this.instantiationService.createInstance(
          UserDataSyncStoreManagementService
        )
      )
    );
    this.instantiationService.stub(
      IUserDataSyncStoreService,
      this._register(
        this.instantiationService.createInstance(
          UserDataSyncStoreService
        )
      )
    );
    const userDataSyncAccountService = this._register(
      this.instantiationService.createInstance(
        UserDataSyncAccountService
      )
    );
    await userDataSyncAccountService.updateAccount({
      authenticationProviderId: "authenticationProviderId",
      token: "token"
    });
    this.instantiationService.stub(
      IUserDataSyncAccountService,
      userDataSyncAccountService
    );
    this.instantiationService.stub(
      IUserDataSyncMachinesService,
      this._register(
        this.instantiationService.createInstance(
          UserDataSyncMachinesService
        )
      )
    );
    this.instantiationService.stub(
      IUserDataSyncLocalStoreService,
      this._register(
        this.instantiationService.createInstance(
          UserDataSyncLocalStoreService
        )
      )
    );
    this.instantiationService.stub(
      IUserDataSyncUtilService,
      new TestUserDataSyncUtilService()
    );
    this.instantiationService.stub(
      IUserDataSyncEnablementService,
      this._register(
        this.instantiationService.createInstance(
          UserDataSyncEnablementService
        )
      )
    );
    this.instantiationService.stub(IExtensionManagementService, {
      async getInstalled() {
        return [];
      },
      onDidInstallExtensions: new Emitter().event,
      onDidUninstallExtension: new Emitter().event
    });
    this.instantiationService.stub(
      IGlobalExtensionEnablementService,
      this._register(
        this.instantiationService.createInstance(
          GlobalExtensionEnablementService
        )
      )
    );
    this.instantiationService.stub(
      IExtensionStorageService,
      this._register(
        this.instantiationService.createInstance(
          ExtensionStorageService
        )
      )
    );
    this.instantiationService.stub(
      IIgnoredExtensionsManagementService,
      this.instantiationService.createInstance(
        IgnoredExtensionsManagementService
      )
    );
    this.instantiationService.stub(IExtensionGalleryService, {
      isEnabled() {
        return true;
      },
      async getCompatibleExtension() {
        return null;
      }
    });
    this.instantiationService.stub(
      IUserDataSyncService,
      this._register(
        this.instantiationService.createInstance(UserDataSyncService)
      )
    );
    if (!empty) {
      await fileService.writeFile(
        userDataProfilesService.defaultProfile.settingsResource,
        VSBuffer.fromString(JSON.stringify({}))
      );
      await fileService.writeFile(
        userDataProfilesService.defaultProfile.keybindingsResource,
        VSBuffer.fromString(JSON.stringify([]))
      );
      await fileService.writeFile(
        joinPath(
          userDataProfilesService.defaultProfile.snippetsHome,
          "c.json"
        ),
        VSBuffer.fromString(`{}`)
      );
      await fileService.writeFile(
        userDataProfilesService.defaultProfile.tasksResource,
        VSBuffer.fromString(`{}`)
      );
      await fileService.writeFile(
        environmentService.argvResource,
        VSBuffer.fromString(JSON.stringify({ locale: "en" }))
      );
    }
    await configurationService.reloadConfiguration();
  }
  async sync() {
    await (await this.instantiationService.get(IUserDataSyncService).createSyncTask(null)).run();
  }
  read(resource, collection) {
    return this.instantiationService.get(IUserDataSyncStoreService).readResource(resource, null, collection);
  }
  async getResourceManifest() {
    const manifest = await this.instantiationService.get(IUserDataSyncStoreService).manifest(null);
    return manifest?.latest ?? null;
  }
  getSynchronizer(source) {
    return this.instantiationService.get(
      IUserDataSyncService
    ).getOrCreateActiveProfileSynchronizer(
      this.instantiationService.get(IUserDataProfilesService).defaultProfile,
      void 0
    ).enabled.find((s) => s.resource === source);
  }
}
const ALL_SERVER_RESOURCES = [
  ...ALL_SYNC_RESOURCES,
  "machines"
];
class UserDataSyncTestServer {
  constructor(rateLimit = Number.MAX_SAFE_INTEGER, retryAfter) {
    this.rateLimit = rateLimit;
    this.retryAfter = retryAfter;
  }
  _serviceBrand;
  url = "http://host:3000";
  session = null;
  collections = /* @__PURE__ */ new Map();
  data = /* @__PURE__ */ new Map();
  _requests = [];
  get requests() {
    return this._requests;
  }
  _requestsWithAllHeaders = [];
  get requestsWithAllHeaders() {
    return this._requestsWithAllHeaders;
  }
  _responses = [];
  get responses() {
    return this._responses;
  }
  reset() {
    this._requests = [];
    this._responses = [];
    this._requestsWithAllHeaders = [];
  }
  manifestRef = 0;
  collectionCounter = 0;
  async resolveProxy(url) {
    return url;
  }
  async lookupAuthorization(authInfo) {
    return void 0;
  }
  async lookupKerberosAuthorization(url) {
    return void 0;
  }
  async loadCertificates() {
    return [];
  }
  async request(options, token) {
    if (this._requests.length === this.rateLimit) {
      return this.toResponse(
        429,
        this.retryAfter ? { "retry-after": `${this.retryAfter}` } : void 0
      );
    }
    const headers = {};
    if (options.headers) {
      if (options.headers["If-None-Match"]) {
        headers["If-None-Match"] = options.headers["If-None-Match"];
      }
      if (options.headers["If-Match"]) {
        headers["If-Match"] = options.headers["If-Match"];
      }
    }
    this._requests.push({
      url: options.url,
      type: options.type,
      headers
    });
    this._requestsWithAllHeaders.push({
      url: options.url,
      type: options.type,
      headers: options.headers
    });
    const requestContext = await this.doRequest(options);
    this._responses.push({ status: requestContext.res.statusCode });
    return requestContext;
  }
  async doRequest(options) {
    const versionUrl = `${this.url}/v1/`;
    const relativePath = options.url.indexOf(versionUrl) === 0 ? options.url.substring(versionUrl.length) : void 0;
    const segments = relativePath ? relativePath.split("/") : [];
    if (options.type === "GET" && segments.length === 1 && segments[0] === "manifest") {
      return this.getManifest(options.headers);
    }
    if (options.type === "GET" && segments.length === 3 && segments[0] === "resource") {
      return this.getResourceData(
        void 0,
        segments[1],
        segments[2] === "latest" ? void 0 : segments[2],
        options.headers
      );
    }
    if (options.type === "POST" && segments.length === 2 && segments[0] === "resource") {
      return this.writeData(
        void 0,
        segments[1],
        options.data,
        options.headers
      );
    }
    if (options.type === "GET" && segments.length === 5 && segments[0] === "collection" && segments[2] === "resource") {
      return this.getResourceData(
        segments[1],
        segments[3],
        segments[4] === "latest" ? void 0 : segments[4],
        options.headers
      );
    }
    if (options.type === "POST" && segments.length === 4 && segments[0] === "collection" && segments[2] === "resource") {
      return this.writeData(
        segments[1],
        segments[3],
        options.data,
        options.headers
      );
    }
    if (options.type === "DELETE" && segments.length === 2 && segments[0] === "resource") {
      return this.deleteResourceData(void 0, segments[1]);
    }
    if (options.type === "DELETE" && segments.length === 1 && segments[0] === "resource") {
      return this.clear(options.headers);
    }
    if (options.type === "DELETE" && segments[0] === "collection") {
      return this.toResponse(204);
    }
    if (options.type === "POST" && segments.length === 1 && segments[0] === "collection") {
      return this.createCollection();
    }
    return this.toResponse(501);
  }
  async getManifest(headers) {
    if (this.session) {
      const latest = /* @__PURE__ */ Object.create({});
      this.data.forEach((value, key) => latest[key] = value.ref);
      let collection;
      if (this.collectionCounter) {
        collection = {};
        for (let collectionId = 1; collectionId <= this.collectionCounter; collectionId++) {
          const collectionData = this.collections.get(
            `${collectionId}`
          );
          if (collectionData) {
            const latest2 = /* @__PURE__ */ Object.create({});
            collectionData.forEach(
              (value, key) => latest2[key] = value.ref
            );
            collection[`${collectionId}`] = { latest: latest2 };
          }
        }
      }
      const manifest = { session: this.session, latest, collection };
      return this.toResponse(
        200,
        {
          "Content-Type": "application/json",
          etag: `${this.manifestRef++}`
        },
        JSON.stringify(manifest)
      );
    }
    return this.toResponse(204, { etag: `${this.manifestRef++}` });
  }
  async getResourceData(collection, resource, ref, headers = {}) {
    const collectionData = collection ? this.collections.get(collection) : this.data;
    if (!collectionData) {
      return this.toResponse(501);
    }
    const resourceKey = ALL_SERVER_RESOURCES.find(
      (key) => key === resource
    );
    if (resourceKey) {
      const data = collectionData.get(resourceKey);
      if (ref && data?.ref !== ref) {
        return this.toResponse(404);
      }
      if (!data) {
        return this.toResponse(204, { etag: "0" });
      }
      if (headers["If-None-Match"] === data.ref) {
        return this.toResponse(304);
      }
      return this.toResponse(200, { etag: data.ref }, data.content || "");
    }
    return this.toResponse(204);
  }
  async writeData(collection, resource, content = "", headers = {}) {
    if (!this.session) {
      this.session = generateUuid();
    }
    const collectionData = collection ? this.collections.get(collection) : this.data;
    if (!collectionData) {
      return this.toResponse(501);
    }
    const resourceKey = ALL_SERVER_RESOURCES.find(
      (key) => key === resource
    );
    if (resourceKey) {
      const data = collectionData.get(resourceKey);
      if (headers["If-Match"] !== void 0 && headers["If-Match"] !== (data ? data.ref : "0")) {
        return this.toResponse(412);
      }
      const ref = `${Number.parseInt(data?.ref || "0") + 1}`;
      collectionData.set(resourceKey, { ref, content });
      return this.toResponse(200, { etag: ref });
    }
    return this.toResponse(204);
  }
  async deleteResourceData(collection, resource, headers = {}) {
    const collectionData = collection ? this.collections.get(collection) : this.data;
    if (!collectionData) {
      return this.toResponse(501);
    }
    const resourceKey = ALL_SERVER_RESOURCES.find(
      (key) => key === resource
    );
    if (resourceKey) {
      collectionData.delete(resourceKey);
      return this.toResponse(200);
    }
    return this.toResponse(404);
  }
  async createCollection() {
    const collectionId = `${++this.collectionCounter}`;
    this.collections.set(collectionId, /* @__PURE__ */ new Map());
    return this.toResponse(200, {}, collectionId);
  }
  async clear(headers) {
    this.collections.clear();
    this.data.clear();
    this.session = null;
    this.collectionCounter = 0;
    return this.toResponse(204);
  }
  toResponse(statusCode, headers, data) {
    return {
      res: {
        headers: headers || {},
        statusCode
      },
      stream: bufferToStream(VSBuffer.fromString(data || ""))
    };
  }
}
class TestUserDataSyncUtilService {
  _serviceBrand;
  async resolveDefaultCoreIgnoredSettings() {
    return getDefaultIgnoredSettings();
  }
  async resolveUserBindings(userbindings) {
    const keys = {};
    for (const keybinding of userbindings) {
      keys[keybinding] = keybinding;
    }
    return keys;
  }
  async resolveFormattingOptions(file) {
    return { eol: "\n", insertSpaces: false, tabSize: 4 };
  }
}
class TestStorageService extends InMemoryStorageService {
  constructor(profileStorageProfile) {
    super();
    this.profileStorageProfile = profileStorageProfile;
  }
  hasScope(profile) {
    return this.profileStorageProfile.id === profile.id;
  }
}
export {
  TestUserDataSyncUtilService,
  UserDataSyncClient,
  UserDataSyncTestServer
};
