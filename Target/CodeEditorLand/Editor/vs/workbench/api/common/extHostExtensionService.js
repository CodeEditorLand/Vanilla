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
  Barrier,
  IntervalTimer,
  asPromise,
  timeout
} from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import * as errors from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  dispose,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import * as path from "../../../base/common/path.js";
import * as performance from "../../../base/common/performance.js";
import { isCI, setTimeout0 } from "../../../base/common/platform.js";
import {
  extUriBiasedIgnorePathCase,
  joinPath,
  originalFSPath
} from "../../../base/common/resources.js";
import { StopWatch } from "../../../base/common/stopwatch.js";
import { TernarySearchTree } from "../../../base/common/ternarySearchTree.js";
import { URI } from "../../../base/common/uri.js";
import * as nls from "../../../nls.js";
import {
  ExtensionIdentifier,
  ExtensionIdentifierMap,
  ExtensionIdentifierSet
} from "../../../platform/extensions/common/extensions.js";
import {
  IInstantiationService,
  createDecorator
} from "../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../platform/instantiation/common/serviceCollection.js";
import { ILogService } from "../../../platform/log/common/log.js";
import {
  ManagedRemoteConnection,
  RemoteAuthorityResolverErrorCode,
  WebSocketRemoteConnection,
  getRemoteAuthorityPrefix
} from "../../../platform/remote/common/remoteAuthorityResolver.js";
import {
  ExtensionDescriptionRegistry
} from "../../services/extensions/common/extensionDescriptionRegistry.js";
import {
  ActivationKind,
  checkProposedApiEnabled,
  isProposedApiEnabled
} from "../../services/extensions/common/extensions.js";
import {
  checkActivateWorkspaceContainsExtension
} from "../../services/extensions/common/workspaceContains.js";
import {
  MainContext
} from "./extHost.protocol.js";
import {
  IExtHostConfiguration
} from "./extHostConfiguration.js";
import {
  ActivatedExtension,
  EmptyExtension,
  ExtensionActivationTimes,
  ExtensionActivationTimesBuilder,
  ExtensionsActivator,
  HostExtension
} from "./extHostExtensionActivator.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
import { IExtHostLanguageModels } from "./extHostLanguageModels.js";
import { IExtHostLocalizationService } from "./extHostLocalizationService.js";
import { IExtHostManagedSockets } from "./extHostManagedSockets.js";
import { ExtensionGlobalMemento, ExtensionMemento } from "./extHostMemento.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import {
  ExtHostSecretState,
  IExtHostSecretState
} from "./extHostSecretState.js";
import { ExtensionSecrets } from "./extHostSecrets.js";
import { ExtHostStorage, IExtHostStorage } from "./extHostStorage.js";
import { IExtensionStoragePaths } from "./extHostStoragePaths.js";
import { IExtHostTerminalService } from "./extHostTerminalService.js";
import { IExtHostTunnelService } from "./extHostTunnelService.js";
import {
  ManagedResolvedAuthority as ExtHostManagedResolvedAuthority,
  ExtensionKind,
  ExtensionMode,
  RemoteAuthorityResolverError
} from "./extHostTypes.js";
import {
  IExtHostWorkspace
} from "./extHostWorkspace.js";
const IHostUtils = createDecorator("IHostUtils");
let AbstractExtHostExtensionService = class extends Disposable {
  constructor(instaService, hostUtils, extHostContext, extHostWorkspace, extHostConfiguration, logService, initData, storagePath, extHostTunnelService, extHostTerminalService, extHostLocalizationService, _extHostManagedSockets, _extHostLanguageModels) {
    super();
    this._extHostManagedSockets = _extHostManagedSockets;
    this._extHostLanguageModels = _extHostLanguageModels;
    this._hostUtils = hostUtils;
    this._extHostContext = extHostContext;
    this._initData = initData;
    this._extHostWorkspace = extHostWorkspace;
    this._extHostConfiguration = extHostConfiguration;
    this._logService = logService;
    this._extHostTunnelService = extHostTunnelService;
    this._extHostTerminalService = extHostTerminalService;
    this._extHostLocalizationService = extHostLocalizationService;
    this._mainThreadWorkspaceProxy = this._extHostContext.getProxy(MainContext.MainThreadWorkspace);
    this._mainThreadTelemetryProxy = this._extHostContext.getProxy(MainContext.MainThreadTelemetry);
    this._mainThreadExtensionsProxy = this._extHostContext.getProxy(MainContext.MainThreadExtensionService);
    this._almostReadyToRunExtensions = new Barrier();
    this._readyToStartExtensionHost = new Barrier();
    this._readyToRunExtensions = new Barrier();
    this._eagerExtensionsActivated = new Barrier();
    this._activationEventsReader = new SyncedActivationEventsReader(this._initData.extensions.activationEvents);
    this._globalRegistry = new ExtensionDescriptionRegistry(this._activationEventsReader, this._initData.extensions.allExtensions);
    const myExtensionsSet = new ExtensionIdentifierSet(this._initData.extensions.myExtensions);
    this._myRegistry = new ExtensionDescriptionRegistry(
      this._activationEventsReader,
      filterExtensions(this._globalRegistry, myExtensionsSet)
    );
    if (isCI) {
      this._logService.info(`Creating extension host with the following global extensions: ${printExtIds(this._globalRegistry)}`);
      this._logService.info(`Creating extension host with the following local extensions: ${printExtIds(this._myRegistry)}`);
    }
    this._storage = new ExtHostStorage(this._extHostContext, this._logService);
    this._secretState = new ExtHostSecretState(this._extHostContext);
    this._storagePath = storagePath;
    this._instaService = this._store.add(instaService.createChild(new ServiceCollection(
      [IExtHostStorage, this._storage],
      [IExtHostSecretState, this._secretState]
    )));
    this._activator = this._register(new ExtensionsActivator(
      this._myRegistry,
      this._globalRegistry,
      {
        onExtensionActivationError: /* @__PURE__ */ __name((extensionId, error, missingExtensionDependency) => {
          this._mainThreadExtensionsProxy.$onExtensionActivationError(extensionId, errors.transformErrorForSerialization(error), missingExtensionDependency);
        }, "onExtensionActivationError"),
        actualActivateExtension: /* @__PURE__ */ __name(async (extensionId, reason) => {
          if (ExtensionDescriptionRegistry.isHostExtension(extensionId, this._myRegistry, this._globalRegistry)) {
            await this._mainThreadExtensionsProxy.$activateExtension(extensionId, reason);
            return new HostExtension();
          }
          const extensionDescription = this._myRegistry.getExtensionDescription(extensionId);
          return this._activateExtension(extensionDescription, reason);
        }, "actualActivateExtension")
      },
      this._logService
    ));
    this._extensionPathIndex = null;
    this._resolvers = /* @__PURE__ */ Object.create(null);
    this._started = false;
    this._remoteConnectionData = this._initData.remote.connectionData;
  }
  static {
    __name(this, "AbstractExtHostExtensionService");
  }
  _serviceBrand;
  _onDidChangeRemoteConnectionData = this._register(
    new Emitter()
  );
  onDidChangeRemoteConnectionData = this._onDidChangeRemoteConnectionData.event;
  _hostUtils;
  _initData;
  _extHostContext;
  _instaService;
  _extHostWorkspace;
  _extHostConfiguration;
  _logService;
  _extHostTunnelService;
  _extHostTerminalService;
  _extHostLocalizationService;
  _mainThreadWorkspaceProxy;
  _mainThreadTelemetryProxy;
  _mainThreadExtensionsProxy;
  _almostReadyToRunExtensions;
  _readyToStartExtensionHost;
  _readyToRunExtensions;
  _eagerExtensionsActivated;
  _activationEventsReader;
  _myRegistry;
  _globalRegistry;
  _storage;
  _secretState;
  _storagePath;
  _activator;
  _extensionPathIndex;
  _realPathCache = /* @__PURE__ */ new Map();
  _resolvers;
  _started;
  _isTerminating = false;
  _remoteConnectionData;
  getRemoteConnectionData() {
    return this._remoteConnectionData;
  }
  async initialize() {
    try {
      await this._beforeAlmostReadyToRunExtensions();
      this._almostReadyToRunExtensions.open();
      await this._extHostWorkspace.waitForInitializeCall();
      performance.mark("code/extHost/ready");
      this._readyToStartExtensionHost.open();
      if (this._initData.autoStart) {
        this._startExtensionHost();
      }
    } catch (err) {
      errors.onUnexpectedError(err);
    }
  }
  async _deactivateAll() {
    this._storagePath.onWillDeactivateAll();
    let allPromises = [];
    try {
      const allExtensions = this._myRegistry.getAllExtensionDescriptions();
      const allExtensionsIds = allExtensions.map((ext) => ext.identifier);
      const activatedExtensions = allExtensionsIds.filter(
        (id) => this.isActivated(id)
      );
      allPromises = activatedExtensions.map((extensionId) => {
        return this._deactivate(extensionId);
      });
    } catch (err) {
    }
    await Promise.all(allPromises);
  }
  terminate(reason, code = 0) {
    if (this._isTerminating) {
      return;
    }
    this._isTerminating = true;
    this._logService.info(`Extension host terminating: ${reason}`);
    this._logService.flush();
    this._extHostTerminalService.dispose();
    this._activator.dispose();
    errors.setUnexpectedErrorHandler((err) => {
      this._logService.error(err);
    });
    this._extHostContext.dispose();
    const extensionsDeactivated = this._deactivateAll();
    Promise.race([timeout(5e3), extensionsDeactivated]).finally(() => {
      if (this._hostUtils.pid) {
        this._logService.info(
          `Extension host with pid ${this._hostUtils.pid} exiting with code ${code}`
        );
      } else {
        this._logService.info(
          `Extension host exiting with code ${code}`
        );
      }
      this._logService.flush();
      this._logService.dispose();
      this._hostUtils.exit(code);
    });
  }
  isActivated(extensionId) {
    if (this._readyToRunExtensions.isOpen()) {
      return this._activator.isActivated(extensionId);
    }
    return false;
  }
  async getExtension(extensionId) {
    const ext = await this._mainThreadExtensionsProxy.$getExtension(extensionId);
    return ext && {
      ...ext,
      identifier: new ExtensionIdentifier(ext.identifier.value),
      extensionLocation: URI.revive(ext.extensionLocation)
    };
  }
  _activateByEvent(activationEvent, startup) {
    return this._activator.activateByEvent(activationEvent, startup);
  }
  _activateById(extensionId, reason) {
    return this._activator.activateById(extensionId, reason);
  }
  activateByIdWithErrors(extensionId, reason) {
    return this._activateById(extensionId, reason).then(() => {
      const extension = this._activator.getActivatedExtension(extensionId);
      if (extension.activationFailed) {
        return Promise.reject(extension.activationFailedError);
      }
      return void 0;
    });
  }
  getExtensionRegistry() {
    return this._readyToRunExtensions.wait().then((_) => this._myRegistry);
  }
  getExtensionExports(extensionId) {
    if (this._readyToRunExtensions.isOpen()) {
      return this._activator.getActivatedExtension(extensionId).exports;
    } else {
      try {
        return this._activator.getActivatedExtension(extensionId).exports;
      } catch (err) {
        return null;
      }
    }
  }
  /**
   * Applies realpath to file-uris and returns all others uris unmodified.
   * The real path is cached for the lifetime of the extension host.
   */
  async _realPathExtensionUri(uri) {
    if (uri.scheme === Schemas.file && this._hostUtils.fsRealpath) {
      const fsPath = uri.fsPath;
      if (!this._realPathCache.has(fsPath)) {
        this._realPathCache.set(
          fsPath,
          this._hostUtils.fsRealpath(fsPath)
        );
      }
      const realpathValue = await this._realPathCache.get(fsPath);
      return URI.file(realpathValue);
    }
    return uri;
  }
  // create trie to enable fast 'filename -> extension id' look up
  async getExtensionPathIndex() {
    if (!this._extensionPathIndex) {
      this._extensionPathIndex = this._createExtensionPathIndex(
        this._myRegistry.getAllExtensionDescriptions()
      ).then((searchTree) => {
        return new ExtensionPaths(searchTree);
      });
    }
    return this._extensionPathIndex;
  }
  /**
   * create trie to enable fast 'filename -> extension id' look up
   */
  async _createExtensionPathIndex(extensions) {
    const tst = TernarySearchTree.forUris((key) => {
      return extUriBiasedIgnorePathCase.ignorePathCasing(key);
    });
    await Promise.all(
      extensions.map(async (ext) => {
        if (this._getEntryPoint(ext)) {
          const uri = await this._realPathExtensionUri(
            ext.extensionLocation
          );
          tst.set(uri, ext);
        }
      })
    );
    return tst;
  }
  _deactivate(extensionId) {
    let result = Promise.resolve(void 0);
    if (!this._readyToRunExtensions.isOpen()) {
      return result;
    }
    if (!this._activator.isActivated(extensionId)) {
      return result;
    }
    const extension = this._activator.getActivatedExtension(extensionId);
    if (!extension) {
      return result;
    }
    try {
      if (typeof extension.module.deactivate === "function") {
        result = Promise.resolve(extension.module.deactivate()).then(
          void 0,
          (err) => {
            this._logService.error(err);
            return Promise.resolve(void 0);
          }
        );
      }
    } catch (err) {
      this._logService.error(
        `An error occurred when deactivating the extension '${extensionId.value}':`
      );
      this._logService.error(err);
    }
    try {
      extension.disposable.dispose();
    } catch (err) {
      this._logService.error(
        `An error occurred when disposing the subscriptions for extension '${extensionId.value}':`
      );
      this._logService.error(err);
    }
    return result;
  }
  // --- impl
  async _activateExtension(extensionDescription, reason) {
    if (this._initData.remote.isRemote) {
      this._mainThreadExtensionsProxy.$onWillActivateExtension(
        extensionDescription.identifier
      );
    } else {
      await this._mainThreadExtensionsProxy.$onWillActivateExtension(
        extensionDescription.identifier
      );
    }
    return this._doActivateExtension(extensionDescription, reason).then(
      (activatedExtension) => {
        const activationTimes = activatedExtension.activationTimes;
        this._mainThreadExtensionsProxy.$onDidActivateExtension(
          extensionDescription.identifier,
          activationTimes.codeLoadingTime,
          activationTimes.activateCallTime,
          activationTimes.activateResolvedTime,
          reason
        );
        this._logExtensionActivationTimes(
          extensionDescription,
          reason,
          "success",
          activationTimes
        );
        return activatedExtension;
      },
      (err) => {
        this._logExtensionActivationTimes(
          extensionDescription,
          reason,
          "failure"
        );
        throw err;
      }
    );
  }
  _logExtensionActivationTimes(extensionDescription, reason, outcome, activationTimes) {
    const event = getTelemetryActivationEvent(extensionDescription, reason);
    this._mainThreadTelemetryProxy.$publicLog2("extensionActivationTimes", {
      ...event,
      ...activationTimes || {},
      outcome
    });
  }
  _doActivateExtension(extensionDescription, reason) {
    const event = getTelemetryActivationEvent(extensionDescription, reason);
    this._mainThreadTelemetryProxy.$publicLog2("activatePlugin", event);
    const entryPoint = this._getEntryPoint(extensionDescription);
    if (!entryPoint) {
      return Promise.resolve(
        new EmptyExtension(ExtensionActivationTimes.NONE)
      );
    }
    this._logService.info(
      `ExtensionService#_doActivateExtension ${extensionDescription.identifier.value}, startup: ${reason.startup}, activationEvent: '${reason.activationEvent}'${extensionDescription.identifier.value !== reason.extensionId.value ? `, root cause: ${reason.extensionId.value}` : ``}`
    );
    this._logService.flush();
    const extensionInternalStore = new DisposableStore();
    const activationTimesBuilder = new ExtensionActivationTimesBuilder(
      reason.startup
    );
    return Promise.all([
      this._loadCommonJSModule(
        extensionDescription,
        joinPath(extensionDescription.extensionLocation, entryPoint),
        activationTimesBuilder
      ),
      this._loadExtensionContext(
        extensionDescription,
        extensionInternalStore
      )
    ]).then((values) => {
      performance.mark(
        `code/extHost/willActivateExtension/${extensionDescription.identifier.value}`
      );
      return AbstractExtHostExtensionService._callActivate(
        this._logService,
        extensionDescription.identifier,
        values[0],
        values[1],
        extensionInternalStore,
        activationTimesBuilder
      );
    }).then((activatedExtension) => {
      performance.mark(
        `code/extHost/didActivateExtension/${extensionDescription.identifier.value}`
      );
      return activatedExtension;
    });
  }
  _loadExtensionContext(extensionDescription, extensionInternalStore) {
    const languageModelAccessInformation = this._extHostLanguageModels.createLanguageModelAccessInformation(
      extensionDescription
    );
    const globalState = extensionInternalStore.add(
      new ExtensionGlobalMemento(extensionDescription, this._storage)
    );
    const workspaceState = extensionInternalStore.add(
      new ExtensionMemento(
        extensionDescription.identifier.value,
        false,
        this._storage
      )
    );
    const secrets = extensionInternalStore.add(
      new ExtensionSecrets(extensionDescription, this._secretState)
    );
    const extensionMode = extensionDescription.isUnderDevelopment ? this._initData.environment.extensionTestsLocationURI ? ExtensionMode.Test : ExtensionMode.Development : ExtensionMode.Production;
    const extensionKind = this._initData.remote.isRemote ? ExtensionKind.Workspace : ExtensionKind.UI;
    this._logService.trace(
      `ExtensionService#loadExtensionContext ${extensionDescription.identifier.value}`
    );
    return Promise.all([
      globalState.whenReady,
      workspaceState.whenReady,
      this._storagePath.whenReady
    ]).then(() => {
      const that = this;
      let extension;
      let messagePassingProtocol;
      const messagePort = isProposedApiEnabled(
        extensionDescription,
        "ipc"
      ) ? this._initData.messagePorts?.get(
        ExtensionIdentifier.toKey(
          extensionDescription.identifier
        )
      ) : void 0;
      return Object.freeze({
        globalState,
        workspaceState,
        secrets,
        subscriptions: [],
        get languageModelAccessInformation() {
          return languageModelAccessInformation;
        },
        get extensionUri() {
          return extensionDescription.extensionLocation;
        },
        get extensionPath() {
          return extensionDescription.extensionLocation.fsPath;
        },
        asAbsolutePath(relativePath) {
          return path.join(
            extensionDescription.extensionLocation.fsPath,
            relativePath
          );
        },
        get storagePath() {
          return that._storagePath.workspaceValue(
            extensionDescription
          )?.fsPath;
        },
        get globalStoragePath() {
          return that._storagePath.globalValue(extensionDescription).fsPath;
        },
        get logPath() {
          return path.join(
            that._initData.logsLocation.fsPath,
            extensionDescription.identifier.value
          );
        },
        get logUri() {
          return URI.joinPath(
            that._initData.logsLocation,
            extensionDescription.identifier.value
          );
        },
        get storageUri() {
          return that._storagePath.workspaceValue(
            extensionDescription
          );
        },
        get globalStorageUri() {
          return that._storagePath.globalValue(extensionDescription);
        },
        get extensionMode() {
          return extensionMode;
        },
        get extension() {
          if (extension === void 0) {
            extension = new Extension(
              that,
              extensionDescription.identifier,
              extensionDescription,
              extensionKind,
              false
            );
          }
          return extension;
        },
        get extensionRuntime() {
          checkProposedApiEnabled(
            extensionDescription,
            "extensionRuntime"
          );
          return that.extensionRuntime;
        },
        get environmentVariableCollection() {
          return that._extHostTerminalService.getEnvironmentVariableCollection(
            extensionDescription
          );
        },
        get messagePassingProtocol() {
          if (!messagePassingProtocol) {
            if (!messagePort) {
              return void 0;
            }
            const onDidReceiveMessage = Event.buffer(
              Event.fromDOMEventEmitter(
                messagePort,
                "message",
                (e) => e.data
              )
            );
            messagePort.start();
            messagePassingProtocol = {
              onDidReceiveMessage,
              postMessage: messagePort.postMessage.bind(
                messagePort
              )
            };
          }
          return messagePassingProtocol;
        }
      });
    });
  }
  static _callActivate(logService, extensionId, extensionModule, context, extensionInternalStore, activationTimesBuilder) {
    extensionModule = extensionModule || {
      activate: void 0,
      deactivate: void 0
    };
    return this._callActivateOptional(
      logService,
      extensionId,
      extensionModule,
      context,
      activationTimesBuilder
    ).then((extensionExports) => {
      return new ActivatedExtension(
        false,
        null,
        activationTimesBuilder.build(),
        extensionModule,
        extensionExports,
        toDisposable(() => {
          extensionInternalStore.dispose();
          dispose(context.subscriptions);
        })
      );
    });
  }
  static _callActivateOptional(logService, extensionId, extensionModule, context, activationTimesBuilder) {
    if (typeof extensionModule.activate === "function") {
      try {
        activationTimesBuilder.activateCallStart();
        logService.trace(
          `ExtensionService#_callActivateOptional ${extensionId.value}`
        );
        const scope = typeof global === "object" ? global : self;
        const activateResult = extensionModule.activate.apply(scope, [context]);
        activationTimesBuilder.activateCallStop();
        activationTimesBuilder.activateResolveStart();
        return Promise.resolve(activateResult).then((value) => {
          activationTimesBuilder.activateResolveStop();
          return value;
        });
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      return Promise.resolve(extensionModule);
    }
  }
  // -- eager activation
  _activateOneStartupFinished(desc, activationEvent) {
    this._activateById(desc.identifier, {
      startup: false,
      extensionId: desc.identifier,
      activationEvent
    }).then(void 0, (err) => {
      this._logService.error(err);
    });
  }
  _activateAllStartupFinishedDeferred(extensions, start = 0) {
    const timeBudget = 50;
    const startTime = Date.now();
    setTimeout0(() => {
      for (let i = start; i < extensions.length; i += 1) {
        const desc = extensions[i];
        for (const activationEvent of desc.activationEvents ?? []) {
          if (activationEvent === "onStartupFinished") {
            if (Date.now() - startTime > timeBudget) {
              this._activateAllStartupFinishedDeferred(
                extensions,
                i
              );
              break;
            } else {
              this._activateOneStartupFinished(
                desc,
                activationEvent
              );
            }
          }
        }
      }
    });
  }
  _activateAllStartupFinished() {
    this._mainThreadExtensionsProxy.$setPerformanceMarks(
      performance.getMarks()
    );
    this._extHostConfiguration.getConfigProvider().then((configProvider) => {
      const shouldDeferActivation = configProvider.getConfiguration("extensions.experimental").get("deferredStartupFinishedActivation");
      const allExtensionDescriptions = this._myRegistry.getAllExtensionDescriptions();
      if (shouldDeferActivation) {
        this._activateAllStartupFinishedDeferred(
          allExtensionDescriptions
        );
      } else {
        for (const desc of allExtensionDescriptions) {
          if (desc.activationEvents) {
            for (const activationEvent of desc.activationEvents) {
              if (activationEvent === "onStartupFinished") {
                this._activateOneStartupFinished(
                  desc,
                  activationEvent
                );
              }
            }
          }
        }
      }
    });
  }
  // Handle "eager" activation extensions
  _handleEagerExtensions() {
    const starActivation = this._activateByEvent("*", true).then(
      void 0,
      (err) => {
        this._logService.error(err);
      }
    );
    this._register(
      this._extHostWorkspace.onDidChangeWorkspace(
        (e) => this._handleWorkspaceContainsEagerExtensions(e.added)
      )
    );
    const folders = this._extHostWorkspace.workspace ? this._extHostWorkspace.workspace.folders : [];
    const workspaceContainsActivation = this._handleWorkspaceContainsEagerExtensions(folders);
    const remoteResolverActivation = this._handleRemoteResolverEagerExtensions();
    const eagerExtensionsActivation = Promise.all([
      remoteResolverActivation,
      starActivation,
      workspaceContainsActivation
    ]).then(() => {
    });
    Promise.race([eagerExtensionsActivation, timeout(1e4)]).then(() => {
      this._activateAllStartupFinished();
    });
    return eagerExtensionsActivation;
  }
  _handleWorkspaceContainsEagerExtensions(folders) {
    if (folders.length === 0) {
      return Promise.resolve(void 0);
    }
    return Promise.all(
      this._myRegistry.getAllExtensionDescriptions().map((desc) => {
        return this._handleWorkspaceContainsEagerExtension(
          folders,
          desc
        );
      })
    ).then(() => {
    });
  }
  async _handleWorkspaceContainsEagerExtension(folders, desc) {
    if (this.isActivated(desc.identifier)) {
      return;
    }
    const localWithRemote = !this._initData.remote.isRemote && !!this._initData.remote.authority;
    const host = {
      logService: this._logService,
      folders: folders.map((folder) => folder.uri),
      forceUsingSearch: localWithRemote || !this._hostUtils.fsExists,
      exists: /* @__PURE__ */ __name((uri) => this._hostUtils.fsExists(uri.fsPath), "exists"),
      checkExists: /* @__PURE__ */ __name((folders2, includes, token) => this._mainThreadWorkspaceProxy.$checkExists(
        folders2,
        includes,
        token
      ), "checkExists")
    };
    const result = await checkActivateWorkspaceContainsExtension(
      host,
      desc
    );
    if (!result) {
      return;
    }
    return this._activateById(desc.identifier, {
      startup: true,
      extensionId: desc.identifier,
      activationEvent: result.activationEvent
    }).then(void 0, (err) => this._logService.error(err));
  }
  async _handleRemoteResolverEagerExtensions() {
    if (this._initData.remote.authority) {
      return this._activateByEvent(
        `onResolveRemoteAuthority:${this._initData.remote.authority}`,
        false
      );
    }
  }
  async $extensionTestsExecute() {
    await this._eagerExtensionsActivated.wait();
    try {
      return await this._doHandleExtensionTests();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async _doHandleExtensionTests() {
    const { extensionDevelopmentLocationURI, extensionTestsLocationURI } = this._initData.environment;
    if (!extensionDevelopmentLocationURI || !extensionTestsLocationURI) {
      throw new Error(
        nls.localize("extensionTestError1", "Cannot load test runner.")
      );
    }
    const testRunner = await this._loadCommonJSModule(
      null,
      extensionTestsLocationURI,
      new ExtensionActivationTimesBuilder(false)
    );
    if (!testRunner || typeof testRunner.run !== "function") {
      throw new Error(
        nls.localize(
          "extensionTestError",
          "Path {0} does not point to a valid extension test runner.",
          extensionTestsLocationURI.toString()
        )
      );
    }
    return new Promise((resolve, reject) => {
      const oldTestRunnerCallback = /* @__PURE__ */ __name((error, failures) => {
        if (error) {
          if (isCI) {
            this._logService.error(
              `Test runner called back with error`,
              error
            );
          }
          reject(error);
        } else {
          if (isCI) {
            if (failures) {
              this._logService.info(
                `Test runner called back with ${failures} failures.`
              );
            } else {
              this._logService.info(
                `Test runner called back with successful outcome.`
              );
            }
          }
          resolve(
            typeof failures === "number" && failures > 0 ? 1 : 0
          );
        }
      }, "oldTestRunnerCallback");
      const extensionTestsPath = originalFSPath(
        extensionTestsLocationURI
      );
      const runResult = testRunner.run(
        extensionTestsPath,
        oldTestRunnerCallback
      );
      if (runResult && runResult.then) {
        runResult.then(() => {
          if (isCI) {
            this._logService.info(
              `Test runner finished successfully.`
            );
          }
          resolve(0);
        }).catch((err) => {
          if (isCI) {
            this._logService.error(
              `Test runner finished with error`,
              err
            );
          }
          reject(
            err instanceof Error && err.stack ? err.stack : String(err)
          );
        });
      }
    });
  }
  _startExtensionHost() {
    if (this._started) {
      throw new Error(`Extension host is already started!`);
    }
    this._started = true;
    return this._readyToStartExtensionHost.wait().then(() => this._readyToRunExtensions.open()).then(() => {
      return Promise.race([
        this._activator.waitForActivatingExtensions(),
        timeout(1e3)
      ]);
    }).then(() => this._handleEagerExtensions()).then(() => {
      this._eagerExtensionsActivated.open();
      this._logService.info(`Eager extensions activated`);
    });
  }
  // -- called by extensions
  registerRemoteAuthorityResolver(authorityPrefix, resolver) {
    this._resolvers[authorityPrefix] = resolver;
    return toDisposable(() => {
      delete this._resolvers[authorityPrefix];
    });
  }
  async getRemoteExecServer(remoteAuthority) {
    const { resolver } = await this._activateAndGetResolver(remoteAuthority);
    return resolver?.resolveExecServer?.(remoteAuthority, {
      resolveAttempt: 0
    });
  }
  // -- called by main thread
  async _activateAndGetResolver(remoteAuthority) {
    const authorityPlusIndex = remoteAuthority.indexOf("+");
    if (authorityPlusIndex === -1) {
      throw new RemoteAuthorityResolverError(
        `Not an authority that can be resolved!`,
        RemoteAuthorityResolverErrorCode.InvalidAuthority
      );
    }
    const authorityPrefix = remoteAuthority.substr(0, authorityPlusIndex);
    await this._almostReadyToRunExtensions.wait();
    await this._activateByEvent(
      `onResolveRemoteAuthority:${authorityPrefix}`,
      false
    );
    return { authorityPrefix, resolver: this._resolvers[authorityPrefix] };
  }
  async $resolveAuthority(remoteAuthorityChain, resolveAttempt) {
    const sw = StopWatch.create(false);
    const prefix = /* @__PURE__ */ __name(() => `[resolveAuthority(${getRemoteAuthorityPrefix(remoteAuthorityChain)},${resolveAttempt})][${sw.elapsed()}ms] `, "prefix");
    const logInfo = /* @__PURE__ */ __name((msg) => this._logService.info(`${prefix()}${msg}`), "logInfo");
    const logWarning = /* @__PURE__ */ __name((msg) => this._logService.warn(`${prefix()}${msg}`), "logWarning");
    const logError = /* @__PURE__ */ __name((msg, err = void 0) => this._logService.error(`${prefix()}${msg}`, err), "logError");
    const normalizeError = /* @__PURE__ */ __name((err) => {
      if (err instanceof RemoteAuthorityResolverError) {
        return {
          type: "error",
          error: {
            code: err._code,
            message: err._message,
            detail: err._detail
          }
        };
      }
      throw err;
    }, "normalizeError");
    const getResolver = /* @__PURE__ */ __name(async (remoteAuthority) => {
      logInfo(`activating resolver for ${remoteAuthority}...`);
      const { resolver, authorityPrefix } = await this._activateAndGetResolver(remoteAuthority);
      if (!resolver) {
        logError(`no resolver for ${authorityPrefix}`);
        throw new RemoteAuthorityResolverError(
          `No remote extension installed to resolve ${authorityPrefix}.`,
          RemoteAuthorityResolverErrorCode.NoResolverFound
        );
      }
      return { resolver, authorityPrefix, remoteAuthority };
    }, "getResolver");
    const chain = remoteAuthorityChain.split(/@|%40/g).reverse();
    logInfo(`activating remote resolvers ${chain.join(" -> ")}`);
    let resolvers;
    try {
      resolvers = await Promise.all(chain.map(getResolver)).catch(
        async (e) => {
          if (!(e instanceof RemoteAuthorityResolverError) || e._code !== RemoteAuthorityResolverErrorCode.InvalidAuthority) {
            throw e;
          }
          logWarning(
            `resolving nested authorities failed: ${e.message}`
          );
          return [await getResolver(remoteAuthorityChain)];
        }
      );
    } catch (e) {
      return normalizeError(e);
    }
    const intervalLogger = new IntervalTimer();
    intervalLogger.cancelAndSet(() => logInfo("waiting..."), 1e3);
    let result;
    let execServer;
    for (const [
      i,
      { authorityPrefix, resolver, remoteAuthority }
    ] of resolvers.entries()) {
      try {
        if (i === resolvers.length - 1) {
          logInfo(`invoking final resolve()...`);
          performance.mark(
            `code/extHost/willResolveAuthority/${authorityPrefix}`
          );
          result = await resolver.resolve(remoteAuthority, {
            resolveAttempt,
            execServer
          });
          performance.mark(
            `code/extHost/didResolveAuthorityOK/${authorityPrefix}`
          );
          logInfo(`setting tunnel factory...`);
          this._register(
            await this._extHostTunnelService.setTunnelFactory(
              resolver,
              ExtHostManagedResolvedAuthority.isManagedResolvedAuthority(
                result
              ) ? result : void 0
            )
          );
        } else {
          logInfo(
            `invoking resolveExecServer() for ${remoteAuthority}`
          );
          performance.mark(
            `code/extHost/willResolveExecServer/${authorityPrefix}`
          );
          execServer = await resolver.resolveExecServer?.(
            remoteAuthority,
            { resolveAttempt, execServer }
          );
          if (!execServer) {
            throw new RemoteAuthorityResolverError(
              `Exec server was not available for ${remoteAuthority}`,
              RemoteAuthorityResolverErrorCode.NoResolverFound
            );
          }
          performance.mark(
            `code/extHost/didResolveExecServerOK/${authorityPrefix}`
          );
        }
      } catch (e) {
        performance.mark(
          `code/extHost/didResolveAuthorityError/${authorityPrefix}`
        );
        logError(`returned an error`, e);
        intervalLogger.dispose();
        return normalizeError(e);
      }
    }
    intervalLogger.dispose();
    const tunnelInformation = {
      environmentTunnels: result.environmentTunnels,
      features: result.tunnelFeatures ? {
        elevation: result.tunnelFeatures.elevation,
        privacyOptions: result.tunnelFeatures.privacyOptions,
        protocol: result.tunnelFeatures.protocol === void 0 ? true : result.tunnelFeatures.protocol
      } : void 0
    };
    const options = {
      extensionHostEnv: result.extensionHostEnv,
      isTrusted: result.isTrusted,
      authenticationSession: result.authenticationSessionForInitializingExtensions ? {
        id: result.authenticationSessionForInitializingExtensions.id,
        providerId: result.authenticationSessionForInitializingExtensions.providerId
      } : void 0
    };
    logInfo(
      `returned ${ExtHostManagedResolvedAuthority.isManagedResolvedAuthority(result) ? "managed authority" : `${result.host}:${result.port}`}`
    );
    let authority;
    if (ExtHostManagedResolvedAuthority.isManagedResolvedAuthority(result)) {
      const socketFactoryId = resolveAttempt;
      this._extHostManagedSockets.setFactory(
        socketFactoryId,
        result.makeConnection
      );
      authority = {
        authority: remoteAuthorityChain,
        connectTo: new ManagedRemoteConnection(socketFactoryId),
        connectionToken: result.connectionToken
      };
    } else {
      authority = {
        authority: remoteAuthorityChain,
        connectTo: new WebSocketRemoteConnection(
          result.host,
          result.port
        ),
        connectionToken: result.connectionToken
      };
    }
    return {
      type: "ok",
      value: {
        authority,
        options,
        tunnelInformation
      }
    };
  }
  async $getCanonicalURI(remoteAuthority, uriComponents) {
    this._logService.info(
      `$getCanonicalURI invoked for authority (${getRemoteAuthorityPrefix(remoteAuthority)})`
    );
    const { resolver } = await this._activateAndGetResolver(remoteAuthority);
    if (!resolver) {
      return null;
    }
    const uri = URI.revive(uriComponents);
    if (typeof resolver.getCanonicalURI === "undefined") {
      return uri;
    }
    const result = await asPromise(() => resolver.getCanonicalURI(uri));
    if (!result) {
      return uri;
    }
    return result;
  }
  async $startExtensionHost(extensionsDelta) {
    extensionsDelta.toAdd.forEach(
      (extension) => extension.extensionLocation = URI.revive(
        extension.extensionLocation
      )
    );
    const { globalRegistry, myExtensions } = applyExtensionsDelta(
      this._activationEventsReader,
      this._globalRegistry,
      this._myRegistry,
      extensionsDelta
    );
    const newSearchTree = await this._createExtensionPathIndex(myExtensions);
    const extensionsPaths = await this.getExtensionPathIndex();
    extensionsPaths.setSearchTree(newSearchTree);
    this._globalRegistry.set(globalRegistry.getAllExtensionDescriptions());
    this._myRegistry.set(myExtensions);
    if (isCI) {
      this._logService.info(
        `$startExtensionHost: global extensions: ${printExtIds(this._globalRegistry)}`
      );
      this._logService.info(
        `$startExtensionHost: local extensions: ${printExtIds(this._myRegistry)}`
      );
    }
    return this._startExtensionHost();
  }
  $activateByEvent(activationEvent, activationKind) {
    if (activationKind === ActivationKind.Immediate) {
      return this._almostReadyToRunExtensions.wait().then((_) => this._activateByEvent(activationEvent, false));
    }
    return this._readyToRunExtensions.wait().then((_) => this._activateByEvent(activationEvent, false));
  }
  async $activate(extensionId, reason) {
    await this._readyToRunExtensions.wait();
    if (!this._myRegistry.getExtensionDescription(extensionId)) {
      return false;
    }
    await this._activateById(extensionId, reason);
    return true;
  }
  async $deltaExtensions(extensionsDelta) {
    extensionsDelta.toAdd.forEach(
      (extension) => extension.extensionLocation = URI.revive(
        extension.extensionLocation
      )
    );
    const { globalRegistry, myExtensions } = applyExtensionsDelta(
      this._activationEventsReader,
      this._globalRegistry,
      this._myRegistry,
      extensionsDelta
    );
    const newSearchTree = await this._createExtensionPathIndex(myExtensions);
    const extensionsPaths = await this.getExtensionPathIndex();
    extensionsPaths.setSearchTree(newSearchTree);
    this._globalRegistry.set(globalRegistry.getAllExtensionDescriptions());
    this._myRegistry.set(myExtensions);
    if (isCI) {
      this._logService.info(
        `$deltaExtensions: global extensions: ${printExtIds(this._globalRegistry)}`
      );
      this._logService.info(
        `$deltaExtensions: local extensions: ${printExtIds(this._myRegistry)}`
      );
    }
    return Promise.resolve(void 0);
  }
  async $test_latency(n) {
    return n;
  }
  async $test_up(b) {
    return b.byteLength;
  }
  async $test_down(size) {
    const buff = VSBuffer.alloc(size);
    const value = Math.random() % 256;
    for (let i = 0; i < size; i++) {
      buff.writeUInt8(value, i);
    }
    return buff;
  }
  async $updateRemoteConnectionData(connectionData) {
    this._remoteConnectionData = connectionData;
    this._onDidChangeRemoteConnectionData.fire();
  }
};
AbstractExtHostExtensionService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IHostUtils),
  __decorateParam(2, IExtHostRpcService),
  __decorateParam(3, IExtHostWorkspace),
  __decorateParam(4, IExtHostConfiguration),
  __decorateParam(5, ILogService),
  __decorateParam(6, IExtHostInitDataService),
  __decorateParam(7, IExtensionStoragePaths),
  __decorateParam(8, IExtHostTunnelService),
  __decorateParam(9, IExtHostTerminalService),
  __decorateParam(10, IExtHostLocalizationService),
  __decorateParam(11, IExtHostManagedSockets),
  __decorateParam(12, IExtHostLanguageModels)
], AbstractExtHostExtensionService);
function applyExtensionsDelta(activationEventsReader, oldGlobalRegistry, oldMyRegistry, extensionsDelta) {
  activationEventsReader.addActivationEvents(
    extensionsDelta.addActivationEvents
  );
  const globalRegistry = new ExtensionDescriptionRegistry(
    activationEventsReader,
    oldGlobalRegistry.getAllExtensionDescriptions()
  );
  globalRegistry.deltaExtensions(
    extensionsDelta.toAdd,
    extensionsDelta.toRemove
  );
  const myExtensionsSet = new ExtensionIdentifierSet(
    oldMyRegistry.getAllExtensionDescriptions().map((extension) => extension.identifier)
  );
  for (const extensionId of extensionsDelta.myToRemove) {
    myExtensionsSet.delete(extensionId);
  }
  for (const extensionId of extensionsDelta.myToAdd) {
    myExtensionsSet.add(extensionId);
  }
  const myExtensions = filterExtensions(globalRegistry, myExtensionsSet);
  return { globalRegistry, myExtensions };
}
__name(applyExtensionsDelta, "applyExtensionsDelta");
function getTelemetryActivationEvent(extensionDescription, reason) {
  const event = {
    id: extensionDescription.identifier.value,
    name: extensionDescription.name,
    extensionVersion: extensionDescription.version,
    publisherDisplayName: extensionDescription.publisher,
    activationEvents: extensionDescription.activationEvents ? extensionDescription.activationEvents.join(",") : null,
    isBuiltin: extensionDescription.isBuiltin,
    reason: reason.activationEvent,
    reasonId: reason.extensionId.value
  };
  return event;
}
__name(getTelemetryActivationEvent, "getTelemetryActivationEvent");
function printExtIds(registry) {
  return registry.getAllExtensionDescriptions().map((ext) => ext.identifier.value).join(",");
}
__name(printExtIds, "printExtIds");
const IExtHostExtensionService = createDecorator("IExtHostExtensionService");
class Extension {
  static {
    __name(this, "Extension");
  }
  #extensionService;
  #originExtensionId;
  #identifier;
  id;
  extensionUri;
  extensionPath;
  packageJSON;
  extensionKind;
  isFromDifferentExtensionHost;
  constructor(extensionService, originExtensionId, description, kind, isFromDifferentExtensionHost) {
    this.#extensionService = extensionService;
    this.#originExtensionId = originExtensionId;
    this.#identifier = description.identifier;
    this.id = description.identifier.value;
    this.extensionUri = description.extensionLocation;
    this.extensionPath = path.normalize(
      originalFSPath(description.extensionLocation)
    );
    this.packageJSON = description;
    this.extensionKind = kind;
    this.isFromDifferentExtensionHost = isFromDifferentExtensionHost;
  }
  get isActive() {
    return this.#extensionService.isActivated(this.#identifier);
  }
  get exports() {
    if (this.packageJSON.api === "none" || this.isFromDifferentExtensionHost) {
      return void 0;
    }
    return this.#extensionService.getExtensionExports(this.#identifier);
  }
  async activate() {
    if (this.isFromDifferentExtensionHost) {
      throw new Error("Cannot activate foreign extension");
    }
    await this.#extensionService.activateByIdWithErrors(this.#identifier, {
      startup: false,
      extensionId: this.#originExtensionId,
      activationEvent: "api"
    });
    return this.exports;
  }
}
function filterExtensions(globalRegistry, desiredExtensions) {
  return globalRegistry.getAllExtensionDescriptions().filter((extension) => desiredExtensions.has(extension.identifier));
}
__name(filterExtensions, "filterExtensions");
class ExtensionPaths {
  constructor(_searchTree) {
    this._searchTree = _searchTree;
  }
  static {
    __name(this, "ExtensionPaths");
  }
  setSearchTree(searchTree) {
    this._searchTree = searchTree;
  }
  findSubstr(key) {
    return this._searchTree.findSubstr(key);
  }
  forEach(callback) {
    return this._searchTree.forEach(callback);
  }
}
class SyncedActivationEventsReader {
  static {
    __name(this, "SyncedActivationEventsReader");
  }
  _map = new ExtensionIdentifierMap();
  constructor(activationEvents) {
    this.addActivationEvents(activationEvents);
  }
  readActivationEvents(extensionDescription) {
    return this._map.get(extensionDescription.identifier) ?? [];
  }
  addActivationEvents(activationEvents) {
    for (const extensionId of Object.keys(activationEvents)) {
      this._map.set(extensionId, activationEvents[extensionId]);
    }
  }
}
export {
  AbstractExtHostExtensionService,
  Extension,
  ExtensionPaths,
  IExtHostExtensionService,
  IHostUtils
};
//# sourceMappingURL=extHostExtensionService.js.map
