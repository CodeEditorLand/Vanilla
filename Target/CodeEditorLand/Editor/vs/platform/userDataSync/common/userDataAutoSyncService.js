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
  ThrottledDelayer,
  createCancelablePromise,
  disposableTimeout,
  timeout
} from "../../../base/common/async.js";
import { toLocalISOString } from "../../../base/common/date.js";
import { toErrorMessage } from "../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../base/common/errors.js";
import { Emitter, Event } from "../../../base/common/event.js";
import {
  Disposable,
  MutableDisposable,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { isWeb } from "../../../base/common/platform.js";
import { isEqual } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { IProductService } from "../../product/common/productService.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../storage/common/storage.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
import {
  IUserDataSyncEnablementService,
  IUserDataSyncLogService,
  IUserDataSyncService,
  IUserDataSyncStoreManagementService,
  IUserDataSyncStoreService,
  UserDataAutoSyncError,
  UserDataSyncError,
  UserDataSyncErrorCode
} from "./userDataSync.js";
import { IUserDataSyncAccountService } from "./userDataSyncAccount.js";
import { IUserDataSyncMachinesService } from "./userDataSyncMachines.js";
const disableMachineEventuallyKey = "sync.disableMachineEventually";
const sessionIdKey = "sync.sessionId";
const storeUrlKey = "sync.storeUrl";
const productQualityKey = "sync.productQuality";
let UserDataAutoSyncService = class extends Disposable {
  constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, userDataSyncAccountService, telemetryService, userDataSyncMachinesService, storageService) {
    super();
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncService = userDataSyncService;
    this.logService = logService;
    this.userDataSyncAccountService = userDataSyncAccountService;
    this.telemetryService = telemetryService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.storageService = storageService;
    this.syncTriggerDelayer = this._register(
      new ThrottledDelayer(this.getSyncTriggerDelayTime())
    );
    this.lastSyncUrl = this.syncUrl;
    this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
    this.previousProductQuality = this.productQuality;
    this.productQuality = productService.quality;
    if (this.syncUrl) {
      this.logService.info(
        "Using settings sync service",
        this.syncUrl.toString()
      );
      this._register(
        userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(
          () => {
            if (!isEqual(
              this.syncUrl,
              userDataSyncStoreManagementService.userDataSyncStore?.url
            )) {
              this.lastSyncUrl = this.syncUrl;
              this.syncUrl = userDataSyncStoreManagementService.userDataSyncStore?.url;
              if (this.syncUrl) {
                this.logService.info(
                  "Using settings sync service",
                  this.syncUrl.toString()
                );
              }
            }
          }
        )
      );
      if (this.userDataSyncEnablementService.isEnabled()) {
        this.logService.info("Auto Sync is enabled.");
      } else {
        this.logService.info("Auto Sync is disabled.");
      }
      this.updateAutoSync();
      if (this.hasToDisableMachineEventually()) {
        this.disableMachineEventually();
      }
      this._register(
        userDataSyncAccountService.onDidChangeAccount(
          () => this.updateAutoSync()
        )
      );
      this._register(
        userDataSyncStoreService.onDidChangeDonotMakeRequestsUntil(
          () => this.updateAutoSync()
        )
      );
      this._register(
        userDataSyncService.onDidChangeLocal(
          (source) => this.triggerSync([source], false, false)
        )
      );
      this._register(
        Event.filter(
          this.userDataSyncEnablementService.onDidChangeResourceEnablement,
          ([, enabled]) => enabled
        )(() => this.triggerSync(["resourceEnablement"], false, false))
      );
      this._register(
        this.userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(
          () => this.triggerSync(
            ["userDataSyncStoreChanged"],
            false,
            false
          )
        )
      );
    }
  }
  static {
    __name(this, "UserDataAutoSyncService");
  }
  _serviceBrand;
  autoSync = this._register(
    new MutableDisposable()
  );
  successiveFailures = 0;
  lastSyncTriggerTime = void 0;
  syncTriggerDelayer;
  suspendUntilRestart = false;
  _onError = this._register(
    new Emitter()
  );
  onError = this._onError.event;
  lastSyncUrl;
  get syncUrl() {
    const value = this.storageService.get(
      storeUrlKey,
      StorageScope.APPLICATION
    );
    return value ? URI.parse(value) : void 0;
  }
  set syncUrl(syncUrl) {
    if (syncUrl) {
      this.storageService.store(
        storeUrlKey,
        syncUrl.toString(),
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(storeUrlKey, StorageScope.APPLICATION);
    }
  }
  previousProductQuality;
  get productQuality() {
    return this.storageService.get(
      productQualityKey,
      StorageScope.APPLICATION
    );
  }
  set productQuality(productQuality) {
    if (productQuality) {
      this.storageService.store(
        productQualityKey,
        productQuality,
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    } else {
      this.storageService.remove(
        productQualityKey,
        StorageScope.APPLICATION
      );
    }
  }
  updateAutoSync() {
    const { enabled, message } = this.isAutoSyncEnabled();
    if (enabled) {
      if (this.autoSync.value === void 0) {
        this.autoSync.value = new AutoSync(
          this.lastSyncUrl,
          1e3 * 60 * 5,
          this.userDataSyncStoreManagementService,
          this.userDataSyncStoreService,
          this.userDataSyncService,
          this.userDataSyncMachinesService,
          this.logService,
          this.telemetryService,
          this.storageService
        );
        this.autoSync.value.register(
          this.autoSync.value.onDidStartSync(
            () => this.lastSyncTriggerTime = (/* @__PURE__ */ new Date()).getTime()
          )
        );
        this.autoSync.value.register(
          this.autoSync.value.onDidFinishSync(
            (e) => this.onDidFinishSync(e)
          )
        );
        if (this.startAutoSync()) {
          this.autoSync.value.start();
        }
      }
    } else {
      this.syncTriggerDelayer.cancel();
      if (this.autoSync.value !== void 0) {
        if (message) {
          this.logService.info(message);
        }
        this.autoSync.clear();
      } else if (
        /* log message when auto sync is not disabled by user */
        message && this.userDataSyncEnablementService.isEnabled()
      ) {
        this.logService.info(message);
      }
    }
  }
  // For tests purpose only
  startAutoSync() {
    return true;
  }
  isAutoSyncEnabled() {
    if (!this.userDataSyncEnablementService.isEnabled()) {
      return { enabled: false, message: "Auto Sync: Disabled." };
    }
    if (!this.userDataSyncAccountService.account) {
      return {
        enabled: false,
        message: "Auto Sync: Suspended until auth token is available."
      };
    }
    if (this.userDataSyncStoreService.donotMakeRequestsUntil) {
      return {
        enabled: false,
        message: `Auto Sync: Suspended until ${toLocalISOString(this.userDataSyncStoreService.donotMakeRequestsUntil)} because server is not accepting requests until then.`
      };
    }
    if (this.suspendUntilRestart) {
      return {
        enabled: false,
        message: "Auto Sync: Suspended until restart."
      };
    }
    return { enabled: true };
  }
  async turnOn() {
    this.stopDisableMachineEventually();
    this.lastSyncUrl = this.syncUrl;
    this.updateEnablement(true);
  }
  async turnOff(everywhere, softTurnOffOnError, donotRemoveMachine) {
    try {
      if (this.userDataSyncAccountService.account && !donotRemoveMachine) {
        await this.userDataSyncMachinesService.removeCurrentMachine();
      }
      this.updateEnablement(false);
      this.storageService.remove(sessionIdKey, StorageScope.APPLICATION);
      if (everywhere) {
        this.telemetryService.publicLog2("sync/turnOffEveryWhere");
        await this.userDataSyncService.reset();
      } else {
        await this.userDataSyncService.resetLocal();
      }
    } catch (error) {
      this.logService.error(error);
      if (softTurnOffOnError) {
        this.updateEnablement(false);
      } else {
        throw error;
      }
    }
  }
  updateEnablement(enabled) {
    if (this.userDataSyncEnablementService.isEnabled() !== enabled) {
      this.userDataSyncEnablementService.setEnablement(enabled);
      this.updateAutoSync();
    }
  }
  hasProductQualityChanged() {
    return !!this.previousProductQuality && !!this.productQuality && this.previousProductQuality !== this.productQuality;
  }
  async onDidFinishSync(error) {
    if (!error) {
      this.successiveFailures = 0;
      return;
    }
    const userDataSyncError = UserDataSyncError.toUserDataSyncError(error);
    if (userDataSyncError instanceof UserDataAutoSyncError) {
      this.telemetryService.publicLog2(`autosync/error`, {
        code: userDataSyncError.code,
        service: this.userDataSyncStoreManagementService.userDataSyncStore.url.toString()
      });
    }
    if (userDataSyncError.code === UserDataSyncErrorCode.SessionExpired) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(
        "Auto Sync: Turned off sync because current session is expired"
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.TurnedOff) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(
        "Auto Sync: Turned off sync because sync is turned off in the cloud"
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.LocalTooManyRequests) {
      this.suspendUntilRestart = true;
      this.logService.info(
        "Auto Sync: Suspended sync because of making too many requests to server"
      );
      this.updateAutoSync();
    } else if (userDataSyncError.code === UserDataSyncErrorCode.TooManyRequests) {
      await this.turnOff(
        false,
        true,
        true
      );
      this.disableMachineEventually();
      this.logService.info(
        "Auto Sync: Turned off sync because of making too many requests to server"
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.MethodNotFound) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(
        "Auto Sync: Turned off sync because current client is making requests to server that are not supported"
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.UpgradeRequired || userDataSyncError.code === UserDataSyncErrorCode.Gone) {
      await this.turnOff(
        false,
        true,
        true
      );
      this.disableMachineEventually();
      this.logService.info(
        "Auto Sync: Turned off sync because current client is not compatible with server. Requires client upgrade."
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.IncompatibleLocalContent) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(
        `Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with newer version than of client. Requires client upgrade.`
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.IncompatibleRemoteContent) {
      await this.turnOff(
        false,
        true
        /* force soft turnoff on error */
      );
      this.logService.info(
        `Auto Sync: Turned off sync because server has ${userDataSyncError.resource} content with older version than of client. Requires server reset.`
      );
    } else if (userDataSyncError.code === UserDataSyncErrorCode.ServiceChanged || userDataSyncError.code === UserDataSyncErrorCode.DefaultServiceChanged) {
      if (isWeb && userDataSyncError.code === UserDataSyncErrorCode.DefaultServiceChanged && !this.hasProductQualityChanged()) {
        await this.turnOff(
          false,
          true
        );
        this.logService.info(
          "Auto Sync: Turned off sync because default sync service is changed."
        );
      } else {
        await this.turnOff(
          false,
          true,
          true
        );
        await this.turnOn();
        this.logService.info(
          "Auto Sync: Sync Service changed. Turned off auto sync, reset local state and turned on auto sync."
        );
      }
    } else {
      this.logService.error(userDataSyncError);
      this.successiveFailures++;
    }
    this._onError.fire(userDataSyncError);
  }
  async disableMachineEventually() {
    this.storageService.store(
      disableMachineEventuallyKey,
      true,
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
    await timeout(1e3 * 60 * 10);
    if (!this.hasToDisableMachineEventually()) {
      return;
    }
    this.stopDisableMachineEventually();
    if (!this.userDataSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account) {
      await this.userDataSyncMachinesService.removeCurrentMachine();
    }
  }
  hasToDisableMachineEventually() {
    return this.storageService.getBoolean(
      disableMachineEventuallyKey,
      StorageScope.APPLICATION,
      false
    );
  }
  stopDisableMachineEventually() {
    this.storageService.remove(
      disableMachineEventuallyKey,
      StorageScope.APPLICATION
    );
  }
  sources = [];
  async triggerSync(sources, skipIfSyncedRecently, disableCache) {
    if (this.autoSync.value === void 0) {
      return this.syncTriggerDelayer.cancel();
    }
    if (skipIfSyncedRecently && this.lastSyncTriggerTime && Math.round(
      ((/* @__PURE__ */ new Date()).getTime() - this.lastSyncTriggerTime) / 1e3
    ) < 10) {
      this.logService.debug(
        "Auto Sync: Skipped. Limited to once per 10 seconds."
      );
      return;
    }
    this.sources.push(...sources);
    return this.syncTriggerDelayer.trigger(
      async () => {
        this.logService.trace("activity sources", ...this.sources);
        const providerId = this.userDataSyncAccountService.account?.authenticationProviderId || "";
        this.telemetryService.publicLog2("sync/triggered", { sources: this.sources, providerId });
        this.sources = [];
        if (this.autoSync.value) {
          await this.autoSync.value.sync("Activity", disableCache);
        }
      },
      this.successiveFailures ? this.getSyncTriggerDelayTime() * 1 * Math.min(
        Math.pow(2, this.successiveFailures),
        60
      ) : this.getSyncTriggerDelayTime()
    );
  }
  getSyncTriggerDelayTime() {
    return 2e3;
  }
};
UserDataAutoSyncService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IUserDataSyncStoreManagementService),
  __decorateParam(2, IUserDataSyncStoreService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, IUserDataSyncService),
  __decorateParam(5, IUserDataSyncLogService),
  __decorateParam(6, IUserDataSyncAccountService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IUserDataSyncMachinesService),
  __decorateParam(9, IStorageService)
], UserDataAutoSyncService);
class AutoSync extends Disposable {
  constructor(lastSyncUrl, interval, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncService, userDataSyncMachinesService, logService, telemetryService, storageService) {
    super();
    this.lastSyncUrl = lastSyncUrl;
    this.interval = interval;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.storageService = storageService;
  }
  static {
    __name(this, "AutoSync");
  }
  static INTERVAL_SYNCING = "Interval";
  intervalHandler = this._register(
    new MutableDisposable()
  );
  _onDidStartSync = this._register(new Emitter());
  onDidStartSync = this._onDidStartSync.event;
  _onDidFinishSync = this._register(
    new Emitter()
  );
  onDidFinishSync = this._onDidFinishSync.event;
  manifest = null;
  syncTask;
  syncPromise;
  start() {
    this._register(
      this.onDidFinishSync(() => this.waitUntilNextIntervalAndSync())
    );
    this._register(
      toDisposable(() => {
        if (this.syncPromise) {
          this.syncPromise.cancel();
          this.logService.info(
            "Auto sync: Cancelled sync that is in progress"
          );
          this.syncPromise = void 0;
        }
        this.syncTask?.stop();
        this.logService.info("Auto Sync: Stopped");
      })
    );
    this.sync(AutoSync.INTERVAL_SYNCING, false);
  }
  waitUntilNextIntervalAndSync() {
    this.intervalHandler.value = disposableTimeout(() => {
      this.sync(AutoSync.INTERVAL_SYNCING, false);
      this.intervalHandler.value = void 0;
    }, this.interval);
  }
  sync(reason, disableCache) {
    const syncPromise = createCancelablePromise(async (token) => {
      if (this.syncPromise) {
        try {
          this.logService.debug(
            "Auto Sync: Waiting until sync is finished."
          );
          await this.syncPromise;
        } catch (error) {
          if (isCancellationError(error)) {
            return;
          }
        }
      }
      return this.doSync(reason, disableCache, token);
    });
    this.syncPromise = syncPromise;
    this.syncPromise.finally(() => this.syncPromise = void 0);
    return this.syncPromise;
  }
  hasSyncServiceChanged() {
    return this.lastSyncUrl !== void 0 && !isEqual(
      this.lastSyncUrl,
      this.userDataSyncStoreManagementService.userDataSyncStore?.url
    );
  }
  async hasDefaultServiceChanged() {
    const previous = await this.userDataSyncStoreManagementService.getPreviousUserDataSyncStore();
    const current = this.userDataSyncStoreManagementService.userDataSyncStore;
    return !!current && !!previous && (!isEqual(current.defaultUrl, previous.defaultUrl) || !isEqual(current.insidersUrl, previous.insidersUrl) || !isEqual(current.stableUrl, previous.stableUrl));
  }
  async doSync(reason, disableCache, token) {
    this.logService.info(`Auto Sync: Triggered by ${reason}`);
    this._onDidStartSync.fire();
    let error;
    try {
      await this.createAndRunSyncTask(disableCache, token);
    } catch (e) {
      this.logService.error(e);
      error = e;
      if (UserDataSyncError.toUserDataSyncError(e).code === UserDataSyncErrorCode.MethodNotFound) {
        try {
          this.logService.info(
            "Auto Sync: Client is making invalid requests. Cleaning up data..."
          );
          await this.userDataSyncService.cleanUpRemoteData();
          this.logService.info("Auto Sync: Retrying sync...");
          await this.createAndRunSyncTask(disableCache, token);
          error = void 0;
        } catch (e1) {
          this.logService.error(e1);
          error = e1;
        }
      }
    }
    this._onDidFinishSync.fire(error);
  }
  async createAndRunSyncTask(disableCache, token) {
    this.syncTask = await this.userDataSyncService.createSyncTask(
      this.manifest,
      disableCache
    );
    if (token.isCancellationRequested) {
      return;
    }
    this.manifest = this.syncTask.manifest;
    if (this.manifest === null && await this.userDataSyncService.hasPreviouslySynced()) {
      if (this.hasSyncServiceChanged()) {
        if (await this.hasDefaultServiceChanged()) {
          throw new UserDataAutoSyncError(
            localize(
              "default service changed",
              "Cannot sync because default service has changed"
            ),
            UserDataSyncErrorCode.DefaultServiceChanged
          );
        } else {
          throw new UserDataAutoSyncError(
            localize(
              "service changed",
              "Cannot sync because sync service has changed"
            ),
            UserDataSyncErrorCode.ServiceChanged
          );
        }
      } else {
        throw new UserDataAutoSyncError(
          localize(
            "turned off",
            "Cannot sync because syncing is turned off in the cloud"
          ),
          UserDataSyncErrorCode.TurnedOff
        );
      }
    }
    const sessionId = this.storageService.get(
      sessionIdKey,
      StorageScope.APPLICATION
    );
    if (sessionId && this.manifest && sessionId !== this.manifest.session) {
      if (this.hasSyncServiceChanged()) {
        if (await this.hasDefaultServiceChanged()) {
          throw new UserDataAutoSyncError(
            localize(
              "default service changed",
              "Cannot sync because default service has changed"
            ),
            UserDataSyncErrorCode.DefaultServiceChanged
          );
        } else {
          throw new UserDataAutoSyncError(
            localize(
              "service changed",
              "Cannot sync because sync service has changed"
            ),
            UserDataSyncErrorCode.ServiceChanged
          );
        }
      } else {
        throw new UserDataAutoSyncError(
          localize(
            "session expired",
            "Cannot sync because current session is expired"
          ),
          UserDataSyncErrorCode.SessionExpired
        );
      }
    }
    const machines = await this.userDataSyncMachinesService.getMachines(
      this.manifest || void 0
    );
    if (token.isCancellationRequested) {
      return;
    }
    const currentMachine = machines.find((machine) => machine.isCurrent);
    if (currentMachine?.disabled) {
      throw new UserDataAutoSyncError(
        localize(
          "turned off machine",
          "Cannot sync because syncing is turned off on this machine from another machine."
        ),
        UserDataSyncErrorCode.TurnedOff
      );
    }
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    await this.syncTask.run();
    this.telemetryService.publicLog2("settingsSync:sync", { duration: (/* @__PURE__ */ new Date()).getTime() - startTime });
    if (this.manifest === null) {
      try {
        this.manifest = await this.userDataSyncStoreService.manifest(null);
      } catch (error) {
        throw new UserDataAutoSyncError(
          toErrorMessage(error),
          error instanceof UserDataSyncError ? error.code : UserDataSyncErrorCode.Unknown
        );
      }
    }
    if (this.manifest && this.manifest.session !== sessionId) {
      this.storageService.store(
        sessionIdKey,
        this.manifest.session,
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (!currentMachine) {
      await this.userDataSyncMachinesService.addCurrentMachine(
        this.manifest || void 0
      );
    }
  }
  register(t) {
    return super._register(t);
  }
}
export {
  UserDataAutoSyncService
};
//# sourceMappingURL=userDataAutoSyncService.js.map
