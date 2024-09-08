var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { raceCancellationError } from "../../../../base/common/async.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { isWeb } from "../../../../base/common/platform.js";
import { escapeRegExpCharacters } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import {
  IDialogService,
  IFileDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IProgressService,
  ProgressLocation
} from "../../../../platform/progress/common/progress.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { ISecretStorageService } from "../../../../platform/secrets/common/secrets.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { UserDataSyncStoreTypeSynchronizer } from "../../../../platform/userDataSync/common/globalStateSync.js";
import {
  isAuthenticationProvider,
  IUserDataAutoSyncService,
  IUserDataSyncEnablementService,
  IUserDataSyncService,
  IUserDataSyncStoreManagementService,
  SyncStatus,
  USER_DATA_SYNC_LOG_ID,
  USER_DATA_SYNC_SCHEME
} from "../../../../platform/userDataSync/common/userDataSync.js";
import { IUserDataSyncAccountService } from "../../../../platform/userDataSync/common/userDataSyncAccount.js";
import { IUserDataSyncMachinesService } from "../../../../platform/userDataSync/common/userDataSyncMachines.js";
import { UserDataSyncStoreClient } from "../../../../platform/userDataSync/common/userDataSyncStoreService.js";
import { isDiffEditorInput } from "../../../common/editor.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { getCurrentAuthenticationSessionInfo } from "../../authentication/browser/authenticationService.js";
import {
  IAuthenticationService
} from "../../authentication/common/authentication.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../environment/browser/environmentService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { ILifecycleService } from "../../lifecycle/common/lifecycle.js";
import { IUserDataInitializationService } from "../../userData/browser/userDataInit.js";
import { IViewsService } from "../../views/common/viewsService.js";
import {
  AccountStatus,
  CONTEXT_ACCOUNT_STATE,
  CONTEXT_ENABLE_ACTIVITY_VIEWS,
  CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW,
  CONTEXT_HAS_CONFLICTS,
  CONTEXT_SYNC_ENABLEMENT,
  CONTEXT_SYNC_STATE,
  IUserDataSyncWorkbenchService,
  SHOW_SYNC_LOG_COMMAND_ID,
  SYNC_CONFLICTS_VIEW_ID,
  SYNC_TITLE,
  SYNC_VIEW_CONTAINER_ID
} from "../common/userDataSync.js";
class UserDataSyncAccount {
  constructor(authenticationProviderId, session) {
    this.authenticationProviderId = authenticationProviderId;
    this.session = session;
  }
  get sessionId() {
    return this.session.id;
  }
  get accountName() {
    return this.session.account.label;
  }
  get accountId() {
    return this.session.account.id;
  }
  get token() {
    return this.session.idToken || this.session.accessToken;
  }
}
function isMergeEditorInput(editor) {
  const candidate = editor;
  return URI.isUri(candidate?.base) && URI.isUri(candidate?.input1?.uri) && URI.isUri(candidate?.input2?.uri) && URI.isUri(candidate?.result);
}
let UserDataSyncWorkbenchService = class extends Disposable {
  constructor(userDataSyncService, uriIdentityService, authenticationService, userDataSyncAccountService, quickInputService, storageService, userDataSyncEnablementService, userDataAutoSyncService, telemetryService, logService, productService, extensionService, environmentService, secretStorageService, notificationService, progressService, dialogService, contextKeyService, viewsService, viewDescriptorService, userDataSyncStoreManagementService, lifecycleService, instantiationService, editorService, userDataInitializationService, fileService, fileDialogService, userDataSyncMachinesService) {
    super();
    this.userDataSyncService = userDataSyncService;
    this.uriIdentityService = uriIdentityService;
    this.authenticationService = authenticationService;
    this.userDataSyncAccountService = userDataSyncAccountService;
    this.quickInputService = quickInputService;
    this.storageService = storageService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataAutoSyncService = userDataAutoSyncService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.productService = productService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.secretStorageService = secretStorageService;
    this.notificationService = notificationService;
    this.progressService = progressService;
    this.dialogService = dialogService;
    this.viewsService = viewsService;
    this.viewDescriptorService = viewDescriptorService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.userDataInitializationService = userDataInitializationService;
    this.fileService = fileService;
    this.fileDialogService = fileDialogService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.syncEnablementContext = CONTEXT_SYNC_ENABLEMENT.bindTo(contextKeyService);
    this.syncStatusContext = CONTEXT_SYNC_STATE.bindTo(contextKeyService);
    this.accountStatusContext = CONTEXT_ACCOUNT_STATE.bindTo(contextKeyService);
    this.activityViewsEnablementContext = CONTEXT_ENABLE_ACTIVITY_VIEWS.bindTo(contextKeyService);
    this.hasConflicts = CONTEXT_HAS_CONFLICTS.bindTo(contextKeyService);
    this.enableConflictsViewContext = CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW.bindTo(contextKeyService);
    if (this.userDataSyncStoreManagementService.userDataSyncStore) {
      this.syncStatusContext.set(this.userDataSyncService.status);
      this._register(
        userDataSyncService.onDidChangeStatus(
          (status) => this.syncStatusContext.set(status)
        )
      );
      this.syncEnablementContext.set(
        userDataSyncEnablementService.isEnabled()
      );
      this._register(
        userDataSyncEnablementService.onDidChangeEnablement(
          (enabled) => this.syncEnablementContext.set(enabled)
        )
      );
      this.waitAndInitialize();
    }
  }
  _serviceBrand;
  static DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY = "userDataSyncAccount.donotUseWorkbenchSession";
  static CACHED_AUTHENTICATION_PROVIDER_KEY = "userDataSyncAccountProvider";
  static CACHED_SESSION_STORAGE_KEY = "userDataSyncAccountPreference";
  get enabled() {
    return !!this.userDataSyncStoreManagementService.userDataSyncStore;
  }
  _authenticationProviders = [];
  get authenticationProviders() {
    return this._authenticationProviders;
  }
  _accountStatus = AccountStatus.Unavailable;
  get accountStatus() {
    return this._accountStatus;
  }
  _onDidChangeAccountStatus = this._register(
    new Emitter()
  );
  onDidChangeAccountStatus = this._onDidChangeAccountStatus.event;
  _current;
  get current() {
    return this._current;
  }
  syncEnablementContext;
  syncStatusContext;
  accountStatusContext;
  enableConflictsViewContext;
  hasConflicts;
  activityViewsEnablementContext;
  turnOnSyncCancellationToken = void 0;
  updateAuthenticationProviders() {
    this._authenticationProviders = (this.userDataSyncStoreManagementService.userDataSyncStore?.authenticationProviders || []).filter(
      ({ id }) => this.authenticationService.declaredProviders.some(
        (provider) => provider.id === id
      )
    );
  }
  isSupportedAuthenticationProviderId(authenticationProviderId) {
    return this.authenticationProviders.some(
      ({ id }) => id === authenticationProviderId
    );
  }
  async waitAndInitialize() {
    await Promise.all([
      this.extensionService.whenInstalledExtensionsRegistered(),
      this.userDataInitializationService.whenInitializationFinished()
    ]);
    try {
      await this.initialize();
    } catch (error) {
      if (!this.environmentService.extensionTestsLocationURI) {
        this.logService.error(error);
      }
    }
  }
  async initialize() {
    if (isWeb) {
      const authenticationSession = await getCurrentAuthenticationSessionInfo(
        this.secretStorageService,
        this.productService
      );
      if (this.currentSessionId === void 0 && authenticationSession?.id) {
        if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider && this.environmentService.options.settingsSyncOptions.enabled) {
          this.currentSessionId = authenticationSession.id;
        } else if (this.useWorkbenchSessionId) {
          this.currentSessionId = authenticationSession.id;
        }
        this.useWorkbenchSessionId = false;
      }
    }
    await this.update();
    this._register(
      this.authenticationService.onDidChangeDeclaredProviders(
        () => this.updateAuthenticationProviders()
      )
    );
    this._register(
      Event.filter(
        Event.any(
          this.authenticationService.onDidRegisterAuthenticationProvider,
          this.authenticationService.onDidUnregisterAuthenticationProvider
        ),
        (info) => this.isSupportedAuthenticationProviderId(info.id)
      )(() => this.update())
    );
    this._register(
      Event.filter(
        this.userDataSyncAccountService.onTokenFailed,
        (isSuccessive) => !isSuccessive
      )(() => this.update("token failure"))
    );
    this._register(
      Event.filter(
        this.authenticationService.onDidChangeSessions,
        (e) => this.isSupportedAuthenticationProviderId(e.providerId)
      )(({ event }) => this.onDidChangeSessions(event))
    );
    this._register(
      this.storageService.onDidChangeValue(
        StorageScope.APPLICATION,
        UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY,
        this._register(new DisposableStore())
      )(() => this.onDidChangeStorage())
    );
    this._register(
      Event.filter(
        this.userDataSyncAccountService.onTokenFailed,
        (bailout) => bailout
      )(() => this.onDidAuthFailure())
    );
    this.hasConflicts.set(this.userDataSyncService.conflicts.length > 0);
    this._register(
      this.userDataSyncService.onDidChangeConflicts((conflicts) => {
        this.hasConflicts.set(conflicts.length > 0);
        if (!conflicts.length) {
          this.enableConflictsViewContext.reset();
        }
        this.editorService.editors.filter((input) => {
          const remoteResource = isDiffEditorInput(input) ? input.original.resource : isMergeEditorInput(input) ? input.input1.uri : void 0;
          if (remoteResource?.scheme !== USER_DATA_SYNC_SCHEME) {
            return false;
          }
          return !this.userDataSyncService.conflicts.some(
            ({ conflicts: conflicts2 }) => conflicts2.some(
              ({ previewResource }) => this.uriIdentityService.extUri.isEqual(
                previewResource,
                input.resource
              )
            )
          );
        }).forEach((input) => input.dispose());
      })
    );
  }
  async update(reason) {
    if (reason) {
      this.logService.info(`Settings Sync: Updating due to ${reason}`);
    }
    this.updateAuthenticationProviders();
    await this.updateCurrentAccount();
    if (this._current) {
      this.currentAuthenticationProviderId = this._current.authenticationProviderId;
    }
    await this.updateToken(this._current);
    this.updateAccountStatus(
      this._current ? AccountStatus.Available : AccountStatus.Unavailable
    );
  }
  async updateCurrentAccount() {
    const currentSessionId = this.currentSessionId;
    const currentAuthenticationProviderId = this.currentAuthenticationProviderId;
    if (currentSessionId) {
      const authenticationProviders = currentAuthenticationProviderId ? this.authenticationProviders.filter(
        ({ id }) => id === currentAuthenticationProviderId
      ) : this.authenticationProviders;
      for (const { id, scopes } of authenticationProviders) {
        const sessions = await this.authenticationService.getSessions(
          id,
          scopes
        ) || [];
        for (const session of sessions) {
          if (session.id === currentSessionId) {
            this._current = new UserDataSyncAccount(id, session);
            return;
          }
        }
      }
    }
    this._current = void 0;
  }
  async updateToken(current) {
    let value;
    if (current) {
      try {
        this.logService.trace(
          "Settings Sync: Updating the token for the account",
          current.accountName
        );
        const token = current.token;
        this.logService.trace(
          "Settings Sync: Token updated for the account",
          current.accountName
        );
        value = {
          token,
          authenticationProviderId: current.authenticationProviderId
        };
      } catch (e) {
        this.logService.error(e);
      }
    }
    await this.userDataSyncAccountService.updateAccount(value);
  }
  updateAccountStatus(accountStatus) {
    if (this._accountStatus !== accountStatus) {
      const previous = this._accountStatus;
      this.logService.trace(
        `Settings Sync: Account status changed from ${previous} to ${accountStatus}`
      );
      this._accountStatus = accountStatus;
      this.accountStatusContext.set(accountStatus);
      this._onDidChangeAccountStatus.fire(accountStatus);
    }
  }
  async turnOn() {
    if (!this.authenticationProviders.length) {
      throw new Error(
        localize(
          "no authentication providers",
          "Settings sync cannot be turned on because there are no authentication providers available."
        )
      );
    }
    if (this.userDataSyncEnablementService.isEnabled()) {
      return;
    }
    if (this.userDataSyncService.status !== SyncStatus.Idle) {
      throw new Error("Cannot turn on sync while syncing");
    }
    const picked = await this.pick();
    if (!picked) {
      throw new CancellationError();
    }
    if (this.accountStatus !== AccountStatus.Available) {
      throw new Error(localize("no account", "No account available"));
    }
    const turnOnSyncCancellationToken = this.turnOnSyncCancellationToken = new CancellationTokenSource();
    const disposable = isWeb ? Disposable.None : this.lifecycleService.onBeforeShutdown(
      (e) => e.veto(
        (async () => {
          const { confirmed } = await this.dialogService.confirm({
            type: "warning",
            message: localize(
              "sync in progress",
              "Settings Sync is being turned on. Would you like to cancel it?"
            ),
            title: localize(
              "settings sync",
              "Settings Sync"
            ),
            primaryButton: localize(
              {
                key: "yes",
                comment: ["&& denotes a mnemonic"]
              },
              "&&Yes"
            ),
            cancelButton: localize("no", "No")
          });
          if (confirmed) {
            turnOnSyncCancellationToken.cancel();
          }
          return !confirmed;
        })(),
        "veto.settingsSync"
      )
    );
    try {
      await this.doTurnOnSync(turnOnSyncCancellationToken.token);
    } finally {
      disposable.dispose();
      this.turnOnSyncCancellationToken = void 0;
    }
    await this.userDataAutoSyncService.turnOn();
    if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
      await this.synchroniseUserDataSyncStoreType();
    }
    this.currentAuthenticationProviderId = this.current?.authenticationProviderId;
    if (this.environmentService.options?.settingsSyncOptions?.enablementHandler && this.currentAuthenticationProviderId) {
      this.environmentService.options.settingsSyncOptions.enablementHandler(
        true,
        this.currentAuthenticationProviderId
      );
    }
    this.notificationService.info(
      localize("sync turned on", "{0} is turned on", SYNC_TITLE.value)
    );
  }
  async turnoff(everywhere) {
    if (this.userDataSyncEnablementService.isEnabled()) {
      await this.userDataAutoSyncService.turnOff(everywhere);
      if (this.environmentService.options?.settingsSyncOptions?.enablementHandler && this.currentAuthenticationProviderId) {
        this.environmentService.options.settingsSyncOptions.enablementHandler(
          false,
          this.currentAuthenticationProviderId
        );
      }
    }
    if (this.turnOnSyncCancellationToken) {
      this.turnOnSyncCancellationToken.cancel();
    }
  }
  async synchroniseUserDataSyncStoreType() {
    if (!this.userDataSyncAccountService.account) {
      throw new Error(
        "Cannot update because you are signed out from settings sync. Please sign in and try again."
      );
    }
    if (!isWeb || !this.userDataSyncStoreManagementService.userDataSyncStore) {
      return;
    }
    const userDataSyncStoreUrl = this.userDataSyncStoreManagementService.userDataSyncStore.type === "insiders" ? this.userDataSyncStoreManagementService.userDataSyncStore.stableUrl : this.userDataSyncStoreManagementService.userDataSyncStore.insidersUrl;
    const userDataSyncStoreClient = this.instantiationService.createInstance(
      UserDataSyncStoreClient,
      userDataSyncStoreUrl
    );
    userDataSyncStoreClient.setAuthToken(
      this.userDataSyncAccountService.account.token,
      this.userDataSyncAccountService.account.authenticationProviderId
    );
    await this.instantiationService.createInstance(
      UserDataSyncStoreTypeSynchronizer,
      userDataSyncStoreClient
    ).sync(
      this.userDataSyncStoreManagementService.userDataSyncStore.type
    );
  }
  syncNow() {
    return this.userDataAutoSyncService.triggerSync(
      ["Sync Now"],
      false,
      true
    );
  }
  async doTurnOnSync(token) {
    const disposables = new DisposableStore();
    const manualSyncTask = await this.userDataSyncService.createManualSyncTask();
    try {
      await this.progressService.withProgress(
        {
          location: ProgressLocation.Window,
          title: SYNC_TITLE.value,
          command: SHOW_SYNC_LOG_COMMAND_ID,
          delay: 500
        },
        async (progress) => {
          progress.report({
            message: localize("turning on", "Turning on...")
          });
          disposables.add(
            this.userDataSyncService.onDidChangeStatus((status) => {
              if (status === SyncStatus.HasConflicts) {
                progress.report({
                  message: localize(
                    "resolving conflicts",
                    "Resolving conflicts..."
                  )
                });
              } else {
                progress.report({
                  message: localize(
                    "syncing...",
                    "Turning on..."
                  )
                });
              }
            })
          );
          await manualSyncTask.merge();
          if (this.userDataSyncService.status === SyncStatus.HasConflicts) {
            await this.handleConflictsWhileTurningOn(token);
          }
          await manualSyncTask.apply();
        }
      );
    } catch (error) {
      await manualSyncTask.stop();
      throw error;
    } finally {
      disposables.dispose();
    }
  }
  async handleConflictsWhileTurningOn(token) {
    await this.dialogService.prompt({
      type: Severity.Warning,
      message: localize("conflicts detected", "Conflicts Detected"),
      detail: localize(
        "resolve",
        "Please resolve conflicts to turn on..."
      ),
      buttons: [
        {
          label: localize(
            {
              key: "show conflicts",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Show Conflicts"
          ),
          run: async () => {
            const waitUntilConflictsAreResolvedPromise = raceCancellationError(
              Event.toPromise(
                Event.filter(
                  this.userDataSyncService.onDidChangeConflicts,
                  (conficts) => conficts.length === 0
                )
              ),
              token
            );
            await this.showConflicts(
              this.userDataSyncService.conflicts[0]?.conflicts[0]
            );
            await waitUntilConflictsAreResolvedPromise;
          }
        },
        {
          label: localize(
            {
              key: "replace local",
              comment: ["&& denotes a mnemonic"]
            },
            "Replace &&Local"
          ),
          run: async () => this.replace(true)
        },
        {
          label: localize(
            {
              key: "replace remote",
              comment: ["&& denotes a mnemonic"]
            },
            "Replace &&Remote"
          ),
          run: () => this.replace(false)
        }
      ],
      cancelButton: {
        run: () => {
          throw new CancellationError();
        }
      }
    });
  }
  async replace(local) {
    for (const conflict of this.userDataSyncService.conflicts) {
      for (const preview of conflict.conflicts) {
        await this.accept(
          {
            syncResource: conflict.syncResource,
            profile: conflict.profile
          },
          local ? preview.remoteResource : preview.localResource,
          void 0,
          { force: true }
        );
      }
    }
  }
  async accept(resource, conflictResource, content, apply) {
    return this.userDataSyncService.accept(
      resource,
      conflictResource,
      content,
      apply
    );
  }
  async showConflicts(conflictToOpen) {
    if (!this.userDataSyncService.conflicts.length) {
      return;
    }
    this.enableConflictsViewContext.set(true);
    const view = await this.viewsService.openView(
      SYNC_CONFLICTS_VIEW_ID
    );
    if (view && conflictToOpen) {
      await view.open(conflictToOpen);
    }
  }
  async resetSyncedData() {
    const { confirmed } = await this.dialogService.confirm({
      type: "info",
      message: localize(
        "reset",
        "This will clear your data in the cloud and stop sync on all your devices."
      ),
      title: localize("reset title", "Clear"),
      primaryButton: localize(
        { key: "resetButton", comment: ["&& denotes a mnemonic"] },
        "&&Reset"
      )
    });
    if (confirmed) {
      await this.userDataSyncService.resetRemote();
    }
  }
  async getAllLogResources() {
    const logsFolders = [];
    const stat = await this.fileService.resolve(
      this.uriIdentityService.extUri.dirname(
        this.environmentService.logsHome
      )
    );
    if (stat.children) {
      logsFolders.push(
        ...stat.children.filter(
          (stat2) => stat2.isDirectory && /^\d{8}T\d{6}$/.test(stat2.name)
        ).sort().reverse().map((d) => d.resource)
      );
    }
    const result = [];
    for (const logFolder of logsFolders) {
      const folderStat = await this.fileService.resolve(logFolder);
      const childStat = folderStat.children?.find(
        (stat2) => this.uriIdentityService.extUri.basename(stat2.resource).startsWith(`${USER_DATA_SYNC_LOG_ID}.`)
      );
      if (childStat) {
        result.push(childStat.resource);
      }
    }
    return result;
  }
  async showSyncActivity() {
    this.activityViewsEnablementContext.set(true);
    await this.waitForActiveSyncViews();
    await this.viewsService.openViewContainer(SYNC_VIEW_CONTAINER_ID);
  }
  async downloadSyncActivity() {
    const result = await this.fileDialogService.showOpenDialog({
      title: localize(
        "download sync activity dialog title",
        "Select folder to download Settings Sync activity"
      ),
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: localize(
        "download sync activity dialog open label",
        "Save"
      )
    });
    if (!result?.[0]) {
      return;
    }
    return this.progressService.withProgress(
      { location: ProgressLocation.Window },
      async () => {
        const machines = await this.userDataSyncMachinesService.getMachines();
        const currentMachine = machines.find((m) => m.isCurrent);
        const name = (currentMachine ? currentMachine.name + " - " : "") + "Settings Sync Activity";
        const stat = await this.fileService.resolve(result[0]);
        const nameRegEx = new RegExp(
          `${escapeRegExpCharacters(name)}\\s(\\d+)`
        );
        const indexes = [];
        for (const child of stat.children ?? []) {
          if (child.name === name) {
            indexes.push(0);
          } else {
            const matches = nameRegEx.exec(child.name);
            if (matches) {
              indexes.push(Number.parseInt(matches[1]));
            }
          }
        }
        indexes.sort((a, b) => a - b);
        const folder = this.uriIdentityService.extUri.joinPath(
          result[0],
          indexes[0] !== 0 ? name : `${name} ${indexes[indexes.length - 1] + 1}`
        );
        await Promise.all([
          this.userDataSyncService.saveRemoteActivityData(
            this.uriIdentityService.extUri.joinPath(
              folder,
              "remoteActivity.json"
            )
          ),
          (async () => {
            const logResources = await this.getAllLogResources();
            await Promise.all(
              logResources.map(
                async (logResource) => this.fileService.copy(
                  logResource,
                  this.uriIdentityService.extUri.joinPath(
                    folder,
                    "logs",
                    `${this.uriIdentityService.extUri.basename(this.uriIdentityService.extUri.dirname(logResource))}.log`
                  )
                )
              )
            );
          })(),
          this.fileService.copy(
            this.environmentService.userDataSyncHome,
            this.uriIdentityService.extUri.joinPath(
              folder,
              "localActivity"
            )
          )
        ]);
        return folder;
      }
    );
  }
  async waitForActiveSyncViews() {
    const viewContainer = this.viewDescriptorService.getViewContainerById(
      SYNC_VIEW_CONTAINER_ID
    );
    if (viewContainer) {
      const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
      if (!model.activeViewDescriptors.length) {
        await Event.toPromise(
          Event.filter(
            model.onDidChangeActiveViewDescriptors,
            (e) => model.activeViewDescriptors.length > 0
          )
        );
      }
    }
  }
  async signIn() {
    const currentAuthenticationProviderId = this.currentAuthenticationProviderId;
    const authenticationProvider = currentAuthenticationProviderId ? this.authenticationProviders.find(
      (p) => p.id === currentAuthenticationProviderId
    ) : void 0;
    if (authenticationProvider) {
      await this.doSignIn(authenticationProvider);
    } else {
      await this.pick();
    }
  }
  async pick() {
    const result = await this.doPick();
    if (!result) {
      return false;
    }
    await this.doSignIn(result);
    return true;
  }
  async doPick() {
    if (this.authenticationProviders.length === 0) {
      return void 0;
    }
    const authenticationProviders = [...this.authenticationProviders].sort(
      ({ id }) => id === this.currentAuthenticationProviderId ? -1 : 1
    );
    const allAccounts = /* @__PURE__ */ new Map();
    if (authenticationProviders.length === 1) {
      const accounts = await this.getAccounts(
        authenticationProviders[0].id,
        authenticationProviders[0].scopes
      );
      if (accounts.length) {
        allAccounts.set(authenticationProviders[0].id, accounts);
      } else {
        return authenticationProviders[0];
      }
    }
    let result;
    const disposables = new DisposableStore();
    const quickPick = disposables.add(
      this.quickInputService.createQuickPick({
        useSeparators: true
      })
    );
    const promise = new Promise((c) => {
      disposables.add(
        quickPick.onDidHide(() => {
          disposables.dispose();
          c(result);
        })
      );
    });
    quickPick.title = SYNC_TITLE.value;
    quickPick.ok = false;
    quickPick.ignoreFocusOut = true;
    quickPick.placeholder = localize(
      "choose account placeholder",
      "Select an account to sign in"
    );
    quickPick.show();
    if (authenticationProviders.length > 1) {
      quickPick.busy = true;
      for (const { id, scopes } of authenticationProviders) {
        const accounts = await this.getAccounts(id, scopes);
        if (accounts.length) {
          allAccounts.set(id, accounts);
        }
      }
      quickPick.busy = false;
    }
    quickPick.items = this.createQuickpickItems(
      authenticationProviders,
      allAccounts
    );
    disposables.add(
      quickPick.onDidAccept(() => {
        result = quickPick.selectedItems[0]?.account ? quickPick.selectedItems[0]?.account : quickPick.selectedItems[0]?.authenticationProvider;
        quickPick.hide();
      })
    );
    return promise;
  }
  async getAccounts(authenticationProviderId, scopes) {
    const accounts = /* @__PURE__ */ new Map();
    let currentAccount = null;
    const sessions = await this.authenticationService.getSessions(
      authenticationProviderId,
      scopes
    ) || [];
    for (const session of sessions) {
      const account = new UserDataSyncAccount(
        authenticationProviderId,
        session
      );
      accounts.set(account.accountId, account);
      if (account.sessionId === this.currentSessionId) {
        currentAccount = account;
      }
    }
    if (currentAccount) {
      accounts.set(currentAccount.accountId, currentAccount);
    }
    return currentAccount ? [...accounts.values()] : [...accounts.values()].sort(
      ({ sessionId }) => sessionId === this.currentSessionId ? -1 : 1
    );
  }
  createQuickpickItems(authenticationProviders, allAccounts) {
    const quickPickItems = [];
    if (allAccounts.size) {
      quickPickItems.push({
        type: "separator",
        label: localize("signed in", "Signed in")
      });
      for (const authenticationProvider of authenticationProviders) {
        const accounts = (allAccounts.get(authenticationProvider.id) || []).sort(
          ({ sessionId }) => sessionId === this.currentSessionId ? -1 : 1
        );
        const providerName = this.authenticationService.getProvider(
          authenticationProvider.id
        ).label;
        for (const account of accounts) {
          quickPickItems.push({
            label: `${account.accountName} (${providerName})`,
            description: account.sessionId === this.current?.sessionId ? localize("last used", "Last Used with Sync") : void 0,
            account,
            authenticationProvider
          });
        }
      }
      quickPickItems.push({
        type: "separator",
        label: localize("others", "Others")
      });
    }
    for (const authenticationProvider of authenticationProviders) {
      const provider = this.authenticationService.getProvider(
        authenticationProvider.id
      );
      if (!allAccounts.has(authenticationProvider.id) || provider.supportsMultipleAccounts) {
        const providerName = provider.label;
        quickPickItems.push({
          label: localize(
            "sign in using account",
            "Sign in with {0}",
            providerName
          ),
          authenticationProvider
        });
      }
    }
    return quickPickItems;
  }
  async doSignIn(accountOrAuthProvider) {
    let sessionId;
    if (isAuthenticationProvider(accountOrAuthProvider)) {
      if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.id) {
        sessionId = await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn();
      } else {
        sessionId = (await this.authenticationService.createSession(
          accountOrAuthProvider.id,
          accountOrAuthProvider.scopes
        )).id;
      }
      this.currentAuthenticationProviderId = accountOrAuthProvider.id;
    } else {
      if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.authenticationProviderId) {
        sessionId = await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn();
      } else {
        sessionId = accountOrAuthProvider.sessionId;
      }
      this.currentAuthenticationProviderId = accountOrAuthProvider.authenticationProviderId;
    }
    this.currentSessionId = sessionId;
    await this.update();
  }
  async onDidAuthFailure() {
    this.telemetryService.publicLog2("sync/successiveAuthFailures");
    this.currentSessionId = void 0;
    await this.update("auth failure");
  }
  onDidChangeSessions(e) {
    if (this.currentSessionId && e.removed?.find((session) => session.id === this.currentSessionId)) {
      this.currentSessionId = void 0;
    }
    this.update("change in sessions");
  }
  onDidChangeStorage() {
    if (this.currentSessionId !== this.getStoredCachedSessionId()) {
      this._cachedCurrentSessionId = null;
      this.update("change in storage");
    }
  }
  _cachedCurrentAuthenticationProviderId = null;
  get currentAuthenticationProviderId() {
    if (this._cachedCurrentAuthenticationProviderId === null) {
      this._cachedCurrentAuthenticationProviderId = this.storageService.get(
        UserDataSyncWorkbenchService.CACHED_AUTHENTICATION_PROVIDER_KEY,
        StorageScope.APPLICATION
      );
    }
    return this._cachedCurrentAuthenticationProviderId;
  }
  set currentAuthenticationProviderId(currentAuthenticationProviderId) {
    if (this._cachedCurrentAuthenticationProviderId !== currentAuthenticationProviderId) {
      this._cachedCurrentAuthenticationProviderId = currentAuthenticationProviderId;
      if (currentAuthenticationProviderId === void 0) {
        this.storageService.remove(
          UserDataSyncWorkbenchService.CACHED_AUTHENTICATION_PROVIDER_KEY,
          StorageScope.APPLICATION
        );
      } else {
        this.storageService.store(
          UserDataSyncWorkbenchService.CACHED_AUTHENTICATION_PROVIDER_KEY,
          currentAuthenticationProviderId,
          StorageScope.APPLICATION,
          StorageTarget.MACHINE
        );
      }
    }
  }
  _cachedCurrentSessionId = null;
  get currentSessionId() {
    if (this._cachedCurrentSessionId === null) {
      this._cachedCurrentSessionId = this.getStoredCachedSessionId();
    }
    return this._cachedCurrentSessionId;
  }
  set currentSessionId(cachedSessionId) {
    if (this._cachedCurrentSessionId !== cachedSessionId) {
      this._cachedCurrentSessionId = cachedSessionId;
      if (cachedSessionId === void 0) {
        this.logService.info("Settings Sync: Reset current session");
        this.storageService.remove(
          UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY,
          StorageScope.APPLICATION
        );
      } else {
        this.logService.info(
          "Settings Sync: Updated current session",
          cachedSessionId
        );
        this.storageService.store(
          UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY,
          cachedSessionId,
          StorageScope.APPLICATION,
          StorageTarget.MACHINE
        );
      }
    }
  }
  getStoredCachedSessionId() {
    return this.storageService.get(
      UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY,
      StorageScope.APPLICATION
    );
  }
  get useWorkbenchSessionId() {
    return !this.storageService.getBoolean(
      UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY,
      StorageScope.APPLICATION,
      false
    );
  }
  set useWorkbenchSessionId(useWorkbenchSession) {
    this.storageService.store(
      UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY,
      !useWorkbenchSession,
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
  }
};
UserDataSyncWorkbenchService = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IAuthenticationService),
  __decorateParam(3, IUserDataSyncAccountService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IUserDataSyncEnablementService),
  __decorateParam(7, IUserDataAutoSyncService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, ILogService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IBrowserWorkbenchEnvironmentService),
  __decorateParam(13, ISecretStorageService),
  __decorateParam(14, INotificationService),
  __decorateParam(15, IProgressService),
  __decorateParam(16, IDialogService),
  __decorateParam(17, IContextKeyService),
  __decorateParam(18, IViewsService),
  __decorateParam(19, IViewDescriptorService),
  __decorateParam(20, IUserDataSyncStoreManagementService),
  __decorateParam(21, ILifecycleService),
  __decorateParam(22, IInstantiationService),
  __decorateParam(23, IEditorService),
  __decorateParam(24, IUserDataInitializationService),
  __decorateParam(25, IFileService),
  __decorateParam(26, IFileDialogService),
  __decorateParam(27, IUserDataSyncMachinesService)
], UserDataSyncWorkbenchService);
registerSingleton(
  IUserDataSyncWorkbenchService,
  UserDataSyncWorkbenchService,
  InstantiationType.Eager
);
export {
  UserDataSyncWorkbenchService,
  isMergeEditorInput
};
