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
import { Action } from "../../../../base/common/actions.js";
import { getErrorMessage, isCancellationError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, DisposableStore, MutableDisposable, toDisposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextModelContentProvider, ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize, localize2 } from "../../../../nls.js";
import { MenuId, MenuRegistry, registerAction2, Action2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr, ContextKeyTrueExpr, IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { QuickPickItem, IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  IUserDataAutoSyncService,
  IUserDataSyncService,
  registerConfiguration,
  SyncResource,
  SyncStatus,
  UserDataSyncError,
  UserDataSyncErrorCode,
  USER_DATA_SYNC_SCHEME,
  IUserDataSyncEnablementService,
  IResourcePreview,
  IUserDataSyncStoreManagementService,
  UserDataSyncStoreType,
  IUserDataSyncStore,
  IUserDataSyncResourceConflicts,
  IUserDataSyncResource,
  IUserDataSyncResourceError,
  USER_DATA_SYNC_LOG_ID
} from "../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { EditorResourceAccessor, SideBySideEditor } from "../../../common/editor.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { IActivityService, IBadge, NumberBadge, ProgressBadge } from "../../../services/activity/common/activity.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { fromNow } from "../../../../base/common/date.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { ViewContainerLocation, IViewContainersRegistry, Extensions, ViewContainer } from "../../../common/views.js";
import { UserDataSyncDataViews } from "./userDataSyncViews.js";
import { IUserDataSyncWorkbenchService, getSyncAreaLabel, AccountStatus, CONTEXT_SYNC_STATE, CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE, CONFIGURE_SYNC_COMMAND_ID, SHOW_SYNC_LOG_COMMAND_ID, SYNC_VIEW_CONTAINER_ID, SYNC_TITLE, SYNC_VIEW_ICON, CONTEXT_HAS_CONFLICTS, DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR } from "../../../services/userDataSync/common/userDataSync.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ViewPaneContainer } from "../../../browser/parts/views/viewPaneContainer.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { ctxIsMergeResultEditor, ctxMergeBaseUri } from "../../mergeEditor/common/mergeEditor.js";
import { IWorkbenchIssueService } from "../../issue/common/issue.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { ILocalizedString } from "../../../../platform/action/common/action.js";
import { isWeb } from "../../../../base/common/platform.js";
const turnOffSyncCommand = { id: "workbench.userDataSync.actions.turnOff", title: localize2("stop sync", "Turn Off") };
const configureSyncCommand = { id: CONFIGURE_SYNC_COMMAND_ID, title: localize2("configure sync", "Configure...") };
const showConflictsCommandId = "workbench.userDataSync.actions.showConflicts";
const syncNowCommand = {
  id: "workbench.userDataSync.actions.syncNow",
  title: localize2("sync now", "Sync Now"),
  description(userDataSyncService) {
    if (userDataSyncService.status === SyncStatus.Syncing) {
      return localize("syncing", "syncing");
    }
    if (userDataSyncService.lastSyncTime) {
      return localize("synced with time", "synced {0}", fromNow(userDataSyncService.lastSyncTime, true));
    }
    return void 0;
  }
};
const showSyncSettingsCommand = { id: "workbench.userDataSync.actions.settings", title: localize2("sync settings", "Show Settings") };
const showSyncedDataCommand = { id: "workbench.userDataSync.actions.showSyncedData", title: localize2("show synced data", "Show Synced Data") };
const CONTEXT_TURNING_ON_STATE = new RawContextKey("userDataSyncTurningOn", false);
let UserDataSyncWorkbenchContribution = class extends Disposable {
  constructor(userDataSyncEnablementService, userDataSyncService, userDataSyncWorkbenchService, contextKeyService, activityService, notificationService, editorService, userDataProfilesService, userDataProfileService, dialogService, quickInputService, instantiationService, outputService, userDataAutoSyncService, textModelResolverService, preferencesService, telemetryService, productService, openerService, authenticationService, userDataSyncStoreManagementService, hostService, commandService, workbenchIssueService) {
    super();
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.activityService = activityService;
    this.notificationService = notificationService;
    this.editorService = editorService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileService = userDataProfileService;
    this.dialogService = dialogService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.outputService = outputService;
    this.preferencesService = preferencesService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.openerService = openerService;
    this.authenticationService = authenticationService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.hostService = hostService;
    this.commandService = commandService;
    this.workbenchIssueService = workbenchIssueService;
    this.turningOnSyncContext = CONTEXT_TURNING_ON_STATE.bindTo(contextKeyService);
    if (userDataSyncWorkbenchService.enabled) {
      registerConfiguration();
      this.updateAccountBadge();
      this.updateGlobalActivityBadge();
      this.onDidChangeConflicts(this.userDataSyncService.conflicts);
      this._register(Event.any(
        Event.debounce(userDataSyncService.onDidChangeStatus, () => void 0, 500),
        this.userDataSyncEnablementService.onDidChangeEnablement,
        this.userDataSyncWorkbenchService.onDidChangeAccountStatus
      )(() => {
        this.updateAccountBadge();
        this.updateGlobalActivityBadge();
      }));
      this._register(userDataSyncService.onDidChangeConflicts(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
      this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
      this._register(userDataSyncService.onSyncErrors((errors) => this.onSynchronizerErrors(errors)));
      this._register(userDataAutoSyncService.onError((error) => this.onAutoSyncError(error)));
      this.registerActions();
      this.registerViews();
      textModelResolverService.registerTextModelContentProvider(USER_DATA_SYNC_SCHEME, instantiationService.createInstance(UserDataRemoteContentProvider));
      this._register(Event.any(userDataSyncService.onDidChangeStatus, userDataSyncEnablementService.onDidChangeEnablement)(() => this.turningOnSync = !userDataSyncEnablementService.isEnabled() && userDataSyncService.status !== SyncStatus.Idle));
    }
  }
  static {
    __name(this, "UserDataSyncWorkbenchContribution");
  }
  turningOnSyncContext;
  globalActivityBadgeDisposable = this._register(new MutableDisposable());
  accountBadgeDisposable = this._register(new MutableDisposable());
  get turningOnSync() {
    return !!this.turningOnSyncContext.get();
  }
  set turningOnSync(turningOn) {
    this.turningOnSyncContext.set(turningOn);
    this.updateGlobalActivityBadge();
  }
  toKey({ syncResource: resource, profile }) {
    return `${profile.id}:${resource}`;
  }
  conflictsDisposables = /* @__PURE__ */ new Map();
  onDidChangeConflicts(conflicts) {
    this.updateGlobalActivityBadge();
    this.registerShowConflictsAction();
    if (!this.userDataSyncEnablementService.isEnabled()) {
      return;
    }
    if (conflicts.length) {
      for (const [key, disposable] of this.conflictsDisposables.entries()) {
        if (!conflicts.some((conflict) => this.toKey(conflict) === key)) {
          disposable.dispose();
          this.conflictsDisposables.delete(key);
        }
      }
      for (const conflict of this.userDataSyncService.conflicts) {
        const key = this.toKey(conflict);
        if (!this.conflictsDisposables.has(key)) {
          const conflictsArea = getSyncAreaLabel(conflict.syncResource);
          const handle = this.notificationService.prompt(
            Severity.Warning,
            localize("conflicts detected", "Unable to sync due to conflicts in {0}. Please resolve them to continue.", conflictsArea.toLowerCase()),
            [
              {
                label: localize("replace remote", "Replace Remote"),
                run: /* @__PURE__ */ __name(() => {
                  this.telemetryService.publicLog2("sync/handleConflicts", { source: conflict.syncResource, action: "acceptLocal" });
                  this.acceptLocal(conflict, conflict.conflicts[0]);
                }, "run")
              },
              {
                label: localize("replace local", "Replace Local"),
                run: /* @__PURE__ */ __name(() => {
                  this.telemetryService.publicLog2("sync/handleConflicts", { source: conflict.syncResource, action: "acceptRemote" });
                  this.acceptRemote(conflict, conflict.conflicts[0]);
                }, "run")
              },
              {
                label: localize("show conflicts", "Show Conflicts"),
                run: /* @__PURE__ */ __name(() => {
                  this.telemetryService.publicLog2("sync/showConflicts", { source: conflict.syncResource });
                  this.userDataSyncWorkbenchService.showConflicts(conflict.conflicts[0]);
                }, "run")
              }
            ],
            {
              sticky: true
            }
          );
          this.conflictsDisposables.set(key, toDisposable(() => {
            handle.close();
            this.conflictsDisposables.delete(key);
          }));
        }
      }
    } else {
      this.conflictsDisposables.forEach((disposable) => disposable.dispose());
      this.conflictsDisposables.clear();
    }
  }
  async acceptRemote(syncResource, conflict) {
    try {
      await this.userDataSyncService.accept(syncResource, conflict.remoteResource, void 0, this.userDataSyncEnablementService.isEnabled());
    } catch (e) {
      this.notificationService.error(localize("accept failed", "Error while accepting changes. Please check [logs]({0}) for more details.", `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
    }
  }
  async acceptLocal(syncResource, conflict) {
    try {
      await this.userDataSyncService.accept(syncResource, conflict.localResource, void 0, this.userDataSyncEnablementService.isEnabled());
    } catch (e) {
      this.notificationService.error(localize("accept failed", "Error while accepting changes. Please check [logs]({0}) for more details.", `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
    }
  }
  onAutoSyncError(error) {
    switch (error.code) {
      case UserDataSyncErrorCode.SessionExpired:
        this.notificationService.notify({
          severity: Severity.Info,
          message: localize("session expired", "Settings sync was turned off because current session is expired, please sign in again to turn on sync."),
          actions: {
            primary: [new Action("turn on sync", localize("turn on sync", "Turn on Settings Sync..."), void 0, true, () => this.turnOn())]
          }
        });
        break;
      case UserDataSyncErrorCode.TurnedOff:
        this.notificationService.notify({
          severity: Severity.Info,
          message: localize("turned off", "Settings sync was turned off from another device, please turn on sync again."),
          actions: {
            primary: [new Action("turn on sync", localize("turn on sync", "Turn on Settings Sync..."), void 0, true, () => this.turnOn())]
          }
        });
        break;
      case UserDataSyncErrorCode.TooLarge:
        if (error.resource === SyncResource.Keybindings || error.resource === SyncResource.Settings || error.resource === SyncResource.Tasks) {
          this.disableSync(error.resource);
          const sourceArea = getSyncAreaLabel(error.resource);
          this.handleTooLargeError(error.resource, localize("too large", "Disabled syncing {0} because size of the {1} file to sync is larger than {2}. Please open the file and reduce the size and enable sync", sourceArea.toLowerCase(), sourceArea.toLowerCase(), "100kb"), error);
        }
        break;
      case UserDataSyncErrorCode.LocalTooManyProfiles:
        this.disableSync(SyncResource.Profiles);
        this.notificationService.error(localize("too many profiles", "Disabled syncing profiles because there are too many profiles to sync. Settings Sync supports syncing maximum 20 profiles. Please reduce the number of profiles and enable sync"));
        break;
      case UserDataSyncErrorCode.IncompatibleLocalContent:
      case UserDataSyncErrorCode.Gone:
      case UserDataSyncErrorCode.UpgradeRequired: {
        const message = localize("error upgrade required", "Settings sync is disabled because the current version ({0}, {1}) is not compatible with the sync service. Please update before turning on sync.", this.productService.version, this.productService.commit);
        const operationId = error.operationId ? localize("operationId", "Operation Id: {0}", error.operationId) : void 0;
        this.notificationService.notify({
          severity: Severity.Error,
          message: operationId ? `${message} ${operationId}` : message
        });
        break;
      }
      case UserDataSyncErrorCode.MethodNotFound: {
        const message = localize("method not found", "Settings sync is disabled because the client is making invalid requests. Please report an issue with the logs.");
        const operationId = error.operationId ? localize("operationId", "Operation Id: {0}", error.operationId) : void 0;
        this.notificationService.notify({
          severity: Severity.Error,
          message: operationId ? `${message} ${operationId}` : message,
          actions: {
            primary: [
              new Action("Show Sync Logs", localize("show sync logs", "Show Log"), void 0, true, () => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID)),
              new Action("Report Issue", localize("report issue", "Report Issue"), void 0, true, () => this.workbenchIssueService.openReporter())
            ]
          }
        });
        break;
      }
      case UserDataSyncErrorCode.IncompatibleRemoteContent:
        this.notificationService.notify({
          severity: Severity.Error,
          message: localize("error reset required", "Settings sync is disabled because your data in the cloud is older than that of the client. Please clear your data in the cloud before turning on sync."),
          actions: {
            primary: [
              new Action("reset", localize("reset", "Clear Data in Cloud..."), void 0, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
              new Action("show synced data", localize("show synced data action", "Show Synced Data"), void 0, true, () => this.userDataSyncWorkbenchService.showSyncActivity())
            ]
          }
        });
        return;
      case UserDataSyncErrorCode.ServiceChanged:
        this.notificationService.notify({
          severity: Severity.Info,
          message: this.userDataSyncStoreManagementService.userDataSyncStore?.type === "insiders" ? localize("service switched to insiders", "Settings Sync has been switched to insiders service") : localize("service switched to stable", "Settings Sync has been switched to stable service")
        });
        return;
      case UserDataSyncErrorCode.DefaultServiceChanged:
        if (this.userDataSyncEnablementService.isEnabled()) {
          this.notificationService.notify({
            severity: Severity.Info,
            message: localize("using separate service", "Settings sync now uses a separate service, more information is available in the [Settings Sync Documentation](https://aka.ms/vscode-settings-sync-help#_syncing-stable-versus-insiders).")
          });
        } else {
          this.notificationService.notify({
            severity: Severity.Info,
            message: localize("service changed and turned off", "Settings sync was turned off because {0} now uses a separate service. Please turn on sync again.", this.productService.nameLong),
            actions: {
              primary: [new Action("turn on sync", localize("turn on sync", "Turn on Settings Sync..."), void 0, true, () => this.turnOn())]
            }
          });
        }
        return;
    }
  }
  handleTooLargeError(resource, message, error) {
    const operationId = error.operationId ? localize("operationId", "Operation Id: {0}", error.operationId) : void 0;
    this.notificationService.notify({
      severity: Severity.Error,
      message: operationId ? `${message} ${operationId}` : message,
      actions: {
        primary: [new Action(
          "open sync file",
          localize("open file", "Open {0} File", getSyncAreaLabel(resource)),
          void 0,
          true,
          () => resource === SyncResource.Settings ? this.preferencesService.openUserSettings({ jsonEditor: true }) : this.preferencesService.openGlobalKeybindingSettings(true)
        )]
      }
    });
  }
  invalidContentErrorDisposables = /* @__PURE__ */ new Map();
  onSynchronizerErrors(errors) {
    if (errors.length) {
      for (const { profile, syncResource: resource, error } of errors) {
        switch (error.code) {
          case UserDataSyncErrorCode.LocalInvalidContent:
            this.handleInvalidContentError({ profile, syncResource: resource });
            break;
          default: {
            const key = `${profile.id}:${resource}`;
            const disposable = this.invalidContentErrorDisposables.get(key);
            if (disposable) {
              disposable.dispose();
              this.invalidContentErrorDisposables.delete(key);
            }
          }
        }
      }
    } else {
      this.invalidContentErrorDisposables.forEach((disposable) => disposable.dispose());
      this.invalidContentErrorDisposables.clear();
    }
  }
  handleInvalidContentError({ profile, syncResource: source }) {
    if (this.userDataProfileService.currentProfile.id !== profile.id) {
      return;
    }
    const key = `${profile.id}:${source}`;
    if (this.invalidContentErrorDisposables.has(key)) {
      return;
    }
    if (source !== SyncResource.Settings && source !== SyncResource.Keybindings && source !== SyncResource.Tasks) {
      return;
    }
    if (!this.hostService.hasFocus) {
      return;
    }
    const resource = source === SyncResource.Settings ? this.userDataProfileService.currentProfile.settingsResource : source === SyncResource.Keybindings ? this.userDataProfileService.currentProfile.keybindingsResource : this.userDataProfileService.currentProfile.tasksResource;
    const editorUri = EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
    if (isEqual(resource, editorUri)) {
      return;
    }
    const errorArea = getSyncAreaLabel(source);
    const handle = this.notificationService.notify({
      severity: Severity.Error,
      message: localize("errorInvalidConfiguration", "Unable to sync {0} because the content in the file is not valid. Please open the file and correct it.", errorArea.toLowerCase()),
      actions: {
        primary: [new Action(
          "open sync file",
          localize("open file", "Open {0} File", errorArea),
          void 0,
          true,
          () => source === SyncResource.Settings ? this.preferencesService.openUserSettings({ jsonEditor: true }) : this.preferencesService.openGlobalKeybindingSettings(true)
        )]
      }
    });
    this.invalidContentErrorDisposables.set(key, toDisposable(() => {
      handle.close();
      this.invalidContentErrorDisposables.delete(key);
    }));
  }
  getConflictsCount() {
    return this.userDataSyncService.conflicts.reduce((result, { conflicts }) => {
      return result + conflicts.length;
    }, 0);
  }
  async updateGlobalActivityBadge() {
    this.globalActivityBadgeDisposable.clear();
    let badge = void 0;
    let priority = void 0;
    if (this.userDataSyncService.conflicts.length && this.userDataSyncEnablementService.isEnabled()) {
      badge = new NumberBadge(this.getConflictsCount(), () => localize("has conflicts", "{0}: Conflicts Detected", SYNC_TITLE.value));
    } else if (this.turningOnSync) {
      badge = new ProgressBadge(() => localize("turning on syncing", "Turning on Settings Sync..."));
      priority = 1;
    }
    if (badge) {
      this.globalActivityBadgeDisposable.value = this.activityService.showGlobalActivity({ badge, priority });
    }
  }
  async updateAccountBadge() {
    this.accountBadgeDisposable.clear();
    let badge = void 0;
    if (this.userDataSyncService.status !== SyncStatus.Uninitialized && this.userDataSyncEnablementService.isEnabled() && this.userDataSyncWorkbenchService.accountStatus === AccountStatus.Unavailable) {
      badge = new NumberBadge(1, () => localize("sign in to sync", "Sign in to Sync Settings"));
    }
    if (badge) {
      this.accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge, priority: void 0 });
    }
  }
  async turnOn() {
    try {
      if (!this.userDataSyncWorkbenchService.authenticationProviders.length) {
        throw new Error(localize("no authentication providers", "No authentication providers are available."));
      }
      const turnOn = await this.askToConfigure();
      if (!turnOn) {
        return;
      }
      if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
        await this.selectSettingsSyncService(this.userDataSyncStoreManagementService.userDataSyncStore);
      }
      await this.userDataSyncWorkbenchService.turnOn();
    } catch (e) {
      if (isCancellationError(e)) {
        return;
      }
      if (e instanceof UserDataSyncError) {
        switch (e.code) {
          case UserDataSyncErrorCode.TooLarge:
            if (e.resource === SyncResource.Keybindings || e.resource === SyncResource.Settings || e.resource === SyncResource.Tasks) {
              this.handleTooLargeError(e.resource, localize("too large while starting sync", "Settings sync cannot be turned on because size of the {0} file to sync is larger than {1}. Please open the file and reduce the size and turn on sync", getSyncAreaLabel(e.resource).toLowerCase(), "100kb"), e);
              return;
            }
            break;
          case UserDataSyncErrorCode.IncompatibleLocalContent:
          case UserDataSyncErrorCode.Gone:
          case UserDataSyncErrorCode.UpgradeRequired: {
            const message = localize("error upgrade required while starting sync", "Settings sync cannot be turned on because the current version ({0}, {1}) is not compatible with the sync service. Please update before turning on sync.", this.productService.version, this.productService.commit);
            const operationId = e.operationId ? localize("operationId", "Operation Id: {0}", e.operationId) : void 0;
            this.notificationService.notify({
              severity: Severity.Error,
              message: operationId ? `${message} ${operationId}` : message
            });
            return;
          }
          case UserDataSyncErrorCode.IncompatibleRemoteContent:
            this.notificationService.notify({
              severity: Severity.Error,
              message: localize("error reset required while starting sync", "Settings sync cannot be turned on because your data in the cloud is older than that of the client. Please clear your data in the cloud before turning on sync."),
              actions: {
                primary: [
                  new Action("reset", localize("reset", "Clear Data in Cloud..."), void 0, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
                  new Action("show synced data", localize("show synced data action", "Show Synced Data"), void 0, true, () => this.userDataSyncWorkbenchService.showSyncActivity())
                ]
              }
            });
            return;
          case UserDataSyncErrorCode.Unauthorized:
          case UserDataSyncErrorCode.Forbidden:
            this.notificationService.error(localize("auth failed", "Error while turning on Settings Sync: Authentication failed."));
            return;
        }
        this.notificationService.error(localize("turn on failed with user data sync error", "Error while turning on Settings Sync. Please check [logs]({0}) for more details.", `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
      } else {
        this.notificationService.error(localize({ key: "turn on failed", comment: ["Substitution is for error reason"] }, "Error while turning on Settings Sync. {0}", getErrorMessage(e)));
      }
    }
  }
  async askToConfigure() {
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick();
      disposables.add(quickPick);
      quickPick.title = SYNC_TITLE.value;
      quickPick.ok = false;
      quickPick.customButton = true;
      quickPick.customLabel = localize("sign in and turn on", "Sign in");
      quickPick.description = localize("configure and turn on sync detail", "Please sign in to backup and sync your data across devices.");
      quickPick.canSelectMany = true;
      quickPick.ignoreFocusOut = true;
      quickPick.hideInput = true;
      quickPick.hideCheckAll = true;
      const items = this.getConfigureSyncQuickPickItems();
      quickPick.items = items;
      quickPick.selectedItems = items.filter((item) => this.userDataSyncEnablementService.isResourceEnabled(item.id));
      let accepted = false;
      disposables.add(Event.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
        accepted = true;
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        try {
          if (accepted) {
            this.updateConfiguration(items, quickPick.selectedItems);
          }
          c(accepted);
        } catch (error) {
          e(error);
        } finally {
          disposables.dispose();
        }
      }));
      quickPick.show();
    });
  }
  getConfigureSyncQuickPickItems() {
    const result = [{
      id: SyncResource.Settings,
      label: getSyncAreaLabel(SyncResource.Settings)
    }, {
      id: SyncResource.Keybindings,
      label: getSyncAreaLabel(SyncResource.Keybindings)
    }, {
      id: SyncResource.Snippets,
      label: getSyncAreaLabel(SyncResource.Snippets)
    }, {
      id: SyncResource.Tasks,
      label: getSyncAreaLabel(SyncResource.Tasks)
    }, {
      id: SyncResource.GlobalState,
      label: getSyncAreaLabel(SyncResource.GlobalState)
    }, {
      id: SyncResource.Extensions,
      label: getSyncAreaLabel(SyncResource.Extensions)
    }];
    if (this.userDataProfilesService.isEnabled()) {
      result.push({
        id: SyncResource.Profiles,
        label: getSyncAreaLabel(SyncResource.Profiles)
      });
    }
    return result;
  }
  updateConfiguration(items, selectedItems) {
    for (const item of items) {
      const wasEnabled = this.userDataSyncEnablementService.isResourceEnabled(item.id);
      const isEnabled = !!selectedItems.filter((selected) => selected.id === item.id)[0];
      if (wasEnabled !== isEnabled) {
        this.userDataSyncEnablementService.setResourceEnablement(item.id, isEnabled);
      }
    }
  }
  async configureSyncOptions() {
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick();
      disposables.add(quickPick);
      quickPick.title = localize("configure sync title", "{0}: Configure...", SYNC_TITLE.value);
      quickPick.placeholder = localize("configure sync placeholder", "Choose what to sync");
      quickPick.canSelectMany = true;
      quickPick.ignoreFocusOut = true;
      quickPick.ok = true;
      const items = this.getConfigureSyncQuickPickItems();
      quickPick.items = items;
      quickPick.selectedItems = items.filter((item) => this.userDataSyncEnablementService.isResourceEnabled(item.id));
      disposables.add(quickPick.onDidAccept(async () => {
        if (quickPick.selectedItems.length) {
          this.updateConfiguration(items, quickPick.selectedItems);
          quickPick.hide();
        }
      }));
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        c();
      }));
      quickPick.show();
    });
  }
  async turnOff() {
    const result = await this.dialogService.confirm({
      message: localize("turn off sync confirmation", "Do you want to turn off sync?"),
      detail: localize("turn off sync detail", "Your settings, keybindings, extensions, snippets and UI State will no longer be synced."),
      primaryButton: localize({ key: "turn off", comment: ["&& denotes a mnemonic"] }, "&&Turn off"),
      checkbox: this.userDataSyncWorkbenchService.accountStatus === AccountStatus.Available ? {
        label: localize("turn off sync everywhere", "Turn off sync on all your devices and clear the data from the cloud.")
      } : void 0
    });
    if (result.confirmed) {
      return this.userDataSyncWorkbenchService.turnoff(!!result.checkboxChecked);
    }
  }
  disableSync(source) {
    switch (source) {
      case SyncResource.Settings:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.Settings, false);
      case SyncResource.Keybindings:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.Keybindings, false);
      case SyncResource.Snippets:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.Snippets, false);
      case SyncResource.Tasks:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.Tasks, false);
      case SyncResource.Extensions:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.Extensions, false);
      case SyncResource.GlobalState:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.GlobalState, false);
      case SyncResource.Profiles:
        return this.userDataSyncEnablementService.setResourceEnablement(SyncResource.Profiles, false);
    }
  }
  showSyncActivity() {
    return this.outputService.showChannel(USER_DATA_SYNC_LOG_ID);
  }
  async selectSettingsSyncService(userDataSyncStore) {
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = disposables.add(this.quickInputService.createQuickPick());
      quickPick.title = localize("switchSyncService.title", "{0}: Select Service", SYNC_TITLE.value);
      quickPick.description = localize("switchSyncService.description", "Ensure you are using the same settings sync service when syncing with multiple environments");
      quickPick.hideInput = true;
      quickPick.ignoreFocusOut = true;
      const getDescription = /* @__PURE__ */ __name((url) => {
        const isDefault = isEqual(url, userDataSyncStore.defaultUrl);
        if (isDefault) {
          return localize("default", "Default");
        }
        return void 0;
      }, "getDescription");
      quickPick.items = [
        {
          id: "insiders",
          label: localize("insiders", "Insiders"),
          description: getDescription(userDataSyncStore.insidersUrl)
        },
        {
          id: "stable",
          label: localize("stable", "Stable"),
          description: getDescription(userDataSyncStore.stableUrl)
        }
      ];
      disposables.add(quickPick.onDidAccept(async () => {
        try {
          await this.userDataSyncStoreManagementService.switch(quickPick.selectedItems[0].id);
          c();
        } catch (error) {
          e(error);
        } finally {
          quickPick.hide();
        }
      }));
      disposables.add(quickPick.onDidHide(() => disposables.dispose()));
      quickPick.show();
    });
  }
  registerActions() {
    if (this.userDataSyncEnablementService.canToggleEnablement()) {
      this.registerTurnOnSyncAction();
      this.registerTurnOffSyncAction();
    }
    this.registerTurningOnSyncAction();
    this.registerCancelTurnOnSyncAction();
    this.registerSignInAction();
    this.registerShowConflictsAction();
    this.registerEnableSyncViewsAction();
    this.registerManageSyncAction();
    this.registerSyncNowAction();
    this.registerConfigureSyncAction();
    this.registerShowSettingsAction();
    this.registerHelpAction();
    this.registerShowLogAction();
    this.registerResetSyncDataAction();
    this.registerAcceptMergesAction();
    if (isWeb) {
      this.registerDownloadSyncActivityAction();
    }
  }
  registerTurnOnSyncAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized), CONTEXT_SYNC_ENABLEMENT.toNegated(), CONTEXT_TURNING_ON_STATE.negate());
    this._register(registerAction2(class TurningOnSyncAction extends Action2 {
      static {
        __name(this, "TurningOnSyncAction");
      }
      constructor() {
        super({
          id: "workbench.userDataSync.actions.turnOn",
          title: localize2("global activity turn on sync", "Backup and Sync Settings..."),
          category: SYNC_TITLE,
          f1: true,
          precondition: when,
          menu: [{
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when,
            order: 2
          }, {
            group: "3_configuration",
            id: MenuId.MenubarPreferencesMenu,
            when,
            order: 2
          }, {
            group: "1_settings",
            id: MenuId.AccountsContext,
            when,
            order: 2
          }]
        });
      }
      async run() {
        return that.turnOn();
      }
    }));
  }
  registerTurningOnSyncAction() {
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized), CONTEXT_SYNC_ENABLEMENT.toNegated(), CONTEXT_TURNING_ON_STATE);
    this._register(registerAction2(class TurningOnSyncAction extends Action2 {
      static {
        __name(this, "TurningOnSyncAction");
      }
      constructor() {
        super({
          id: "workbench.userData.actions.turningOn",
          title: localize("turnin on sync", "Turning on Settings Sync..."),
          precondition: ContextKeyExpr.false(),
          menu: [{
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when,
            order: 2
          }, {
            group: "1_settings",
            id: MenuId.AccountsContext,
            when
          }]
        });
      }
      async run() {
      }
    }));
  }
  registerCancelTurnOnSyncAction() {
    const that = this;
    this._register(registerAction2(class TurningOnSyncAction extends Action2 {
      static {
        __name(this, "TurningOnSyncAction");
      }
      constructor() {
        super({
          id: "workbench.userData.actions.cancelTurnOn",
          title: localize("cancel turning on sync", "Cancel"),
          icon: Codicon.stopCircle,
          menu: {
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.and(CONTEXT_TURNING_ON_STATE, ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID)),
            group: "navigation",
            order: 1
          }
        });
      }
      async run() {
        return that.userDataSyncWorkbenchService.turnoff(false);
      }
    }));
  }
  registerSignInAction() {
    const that = this;
    const id = "workbench.userData.actions.signin";
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized), CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE.isEqualTo(AccountStatus.Unavailable));
    this._register(registerAction2(class StopSyncAction extends Action2 {
      static {
        __name(this, "StopSyncAction");
      }
      constructor() {
        super({
          id: "workbench.userData.actions.signin",
          title: localize("sign in global", "Sign in to Sync Settings"),
          menu: {
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when,
            order: 2
          }
        });
      }
      async run() {
        try {
          await that.userDataSyncWorkbenchService.signIn();
        } catch (e) {
          that.notificationService.error(e);
        }
      }
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "1_settings",
      command: {
        id,
        title: localize("sign in accounts", "Sign in to Sync Settings (1)")
      },
      when
    }));
  }
  getShowConflictsTitle() {
    return localize2("resolveConflicts_global", "Show Conflicts ({0})", this.getConflictsCount());
  }
  conflictsActionDisposable = this._register(new MutableDisposable());
  registerShowConflictsAction() {
    this.conflictsActionDisposable.value = void 0;
    const that = this;
    this.conflictsActionDisposable.value = registerAction2(class TurningOnSyncAction extends Action2 {
      static {
        __name(this, "TurningOnSyncAction");
      }
      constructor() {
        super({
          id: showConflictsCommandId,
          get title() {
            return that.getShowConflictsTitle();
          },
          category: SYNC_TITLE,
          f1: true,
          precondition: CONTEXT_HAS_CONFLICTS,
          menu: [{
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when: CONTEXT_HAS_CONFLICTS,
            order: 2
          }, {
            group: "3_configuration",
            id: MenuId.MenubarPreferencesMenu,
            when: CONTEXT_HAS_CONFLICTS,
            order: 2
          }]
        });
      }
      async run() {
        return that.userDataSyncWorkbenchService.showConflicts();
      }
    });
  }
  registerManageSyncAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE.isEqualTo(AccountStatus.Available), CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized));
    this._register(registerAction2(class SyncStatusAction extends Action2 {
      static {
        __name(this, "SyncStatusAction");
      }
      constructor() {
        super({
          id: "workbench.userDataSync.actions.manage",
          title: localize("sync is on", "Settings Sync is On"),
          toggled: ContextKeyTrueExpr.INSTANCE,
          menu: [
            {
              id: MenuId.GlobalActivity,
              group: "3_configuration",
              when,
              order: 2
            },
            {
              id: MenuId.MenubarPreferencesMenu,
              group: "3_configuration",
              when,
              order: 2
            },
            {
              id: MenuId.AccountsContext,
              group: "1_settings",
              when
            }
          ]
        });
      }
      run(accessor) {
        return new Promise((c, e) => {
          const quickInputService = accessor.get(IQuickInputService);
          const commandService = accessor.get(ICommandService);
          const disposables = new DisposableStore();
          const quickPick = quickInputService.createQuickPick({ useSeparators: true });
          disposables.add(quickPick);
          const items = [];
          if (that.userDataSyncService.conflicts.length) {
            items.push({ id: showConflictsCommandId, label: `${SYNC_TITLE.value}: ${that.getShowConflictsTitle().original}` });
            items.push({ type: "separator" });
          }
          items.push({ id: configureSyncCommand.id, label: `${SYNC_TITLE.value}: ${configureSyncCommand.title.original}` });
          items.push({ id: showSyncSettingsCommand.id, label: `${SYNC_TITLE.value}: ${showSyncSettingsCommand.title.original}` });
          items.push({ id: showSyncedDataCommand.id, label: `${SYNC_TITLE.value}: ${showSyncedDataCommand.title.original}` });
          items.push({ type: "separator" });
          items.push({ id: syncNowCommand.id, label: `${SYNC_TITLE.value}: ${syncNowCommand.title.original}`, description: syncNowCommand.description(that.userDataSyncService) });
          if (that.userDataSyncEnablementService.canToggleEnablement()) {
            const account = that.userDataSyncWorkbenchService.current;
            items.push({ id: turnOffSyncCommand.id, label: `${SYNC_TITLE.value}: ${turnOffSyncCommand.title.original}`, description: account ? `${account.accountName} (${that.authenticationService.getProvider(account.authenticationProviderId).label})` : void 0 });
          }
          quickPick.items = items;
          disposables.add(quickPick.onDidAccept(() => {
            if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
              commandService.executeCommand(quickPick.selectedItems[0].id);
            }
            quickPick.hide();
          }));
          disposables.add(quickPick.onDidHide(() => {
            disposables.dispose();
            c();
          }));
          quickPick.show();
        });
      }
    }));
  }
  registerEnableSyncViewsAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_ACCOUNT_STATE.isEqualTo(AccountStatus.Available), CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized));
    this._register(registerAction2(class SyncStatusAction extends Action2 {
      static {
        __name(this, "SyncStatusAction");
      }
      constructor() {
        super({
          id: showSyncedDataCommand.id,
          title: showSyncedDataCommand.title,
          category: SYNC_TITLE,
          precondition: when,
          menu: {
            id: MenuId.CommandPalette,
            when
          }
        });
      }
      run(accessor) {
        return that.userDataSyncWorkbenchService.showSyncActivity();
      }
    }));
  }
  registerSyncNowAction() {
    const that = this;
    this._register(registerAction2(class SyncNowAction extends Action2 {
      static {
        __name(this, "SyncNowAction");
      }
      constructor() {
        super({
          id: syncNowCommand.id,
          title: syncNowCommand.title,
          category: SYNC_TITLE,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE.isEqualTo(AccountStatus.Available), CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized))
          }
        });
      }
      run(accessor) {
        return that.userDataSyncWorkbenchService.syncNow();
      }
    }));
  }
  registerTurnOffSyncAction() {
    const that = this;
    this._register(registerAction2(class StopSyncAction extends Action2 {
      static {
        __name(this, "StopSyncAction");
      }
      constructor() {
        super({
          id: turnOffSyncCommand.id,
          title: turnOffSyncCommand.title,
          category: SYNC_TITLE,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized), CONTEXT_SYNC_ENABLEMENT)
          }
        });
      }
      async run() {
        try {
          await that.turnOff();
        } catch (e) {
          if (!isCancellationError(e)) {
            that.notificationService.error(localize("turn off failed", "Error while turning off Settings Sync. Please check [logs]({0}) for more details.", `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
          }
        }
      }
    }));
  }
  registerConfigureSyncAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized), CONTEXT_SYNC_ENABLEMENT);
    this._register(registerAction2(class ConfigureSyncAction extends Action2 {
      static {
        __name(this, "ConfigureSyncAction");
      }
      constructor() {
        super({
          id: configureSyncCommand.id,
          title: configureSyncCommand.title,
          category: SYNC_TITLE,
          icon: Codicon.settingsGear,
          tooltip: localize("configure", "Configure..."),
          menu: [{
            id: MenuId.CommandPalette,
            when
          }, {
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.and(CONTEXT_SYNC_ENABLEMENT, ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID)),
            group: "navigation",
            order: 2
          }]
        });
      }
      run() {
        return that.configureSyncOptions();
      }
    }));
  }
  registerShowLogAction() {
    const that = this;
    this._register(registerAction2(class ShowSyncActivityAction extends Action2 {
      static {
        __name(this, "ShowSyncActivityAction");
      }
      constructor() {
        super({
          id: SHOW_SYNC_LOG_COMMAND_ID,
          title: localize("show sync log title", "{0}: Show Log", SYNC_TITLE.value),
          tooltip: localize("show sync log toolrip", "Show Log"),
          icon: Codicon.output,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized))
          }, {
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID),
            group: "navigation",
            order: 1
          }]
        });
      }
      run() {
        return that.showSyncActivity();
      }
    }));
  }
  registerShowSettingsAction() {
    this._register(registerAction2(class ShowSyncSettingsAction extends Action2 {
      static {
        __name(this, "ShowSyncSettingsAction");
      }
      constructor() {
        super({
          id: showSyncSettingsCommand.id,
          title: showSyncSettingsCommand.title,
          category: SYNC_TITLE,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized))
          }
        });
      }
      run(accessor) {
        accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, query: "@tag:sync" });
      }
    }));
  }
  registerHelpAction() {
    const that = this;
    this._register(registerAction2(class HelpAction extends Action2 {
      static {
        __name(this, "HelpAction");
      }
      constructor() {
        super({
          id: "workbench.userDataSync.actions.help",
          title: SYNC_TITLE,
          category: Categories.Help,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized))
          }]
        });
      }
      run() {
        return that.openerService.open(URI.parse("https://aka.ms/vscode-settings-sync-help"));
      }
    }));
    MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
      command: {
        id: "workbench.userDataSync.actions.help",
        title: Categories.Help.value
      },
      when: ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID),
      group: "1_help"
    });
  }
  registerAcceptMergesAction() {
    const that = this;
    this._register(registerAction2(class AcceptMergesAction extends Action2 {
      static {
        __name(this, "AcceptMergesAction");
      }
      constructor() {
        super({
          id: "workbench.userDataSync.actions.acceptMerges",
          title: localize("complete merges title", "Complete Merge"),
          menu: [{
            id: MenuId.EditorContent,
            when: ContextKeyExpr.and(ctxIsMergeResultEditor, ContextKeyExpr.regex(ctxMergeBaseUri.key, new RegExp(`^${USER_DATA_SYNC_SCHEME}:`)))
          }]
        });
      }
      async run(accessor, previewResource) {
        const textFileService = accessor.get(ITextFileService);
        await textFileService.save(previewResource);
        const content = await textFileService.read(previewResource);
        await that.userDataSyncService.accept(this.getSyncResource(previewResource), previewResource, content.value, true);
      }
      getSyncResource(previewResource) {
        const conflict = that.userDataSyncService.conflicts.find(({ conflicts }) => conflicts.some((conflict2) => isEqual(conflict2.previewResource, previewResource)));
        if (conflict) {
          return conflict;
        }
        throw new Error(`Unknown resource: ${previewResource.toString()}`);
      }
    }));
  }
  registerDownloadSyncActivityAction() {
    this._register(registerAction2(class DownloadSyncActivityAction extends Action2 {
      static {
        __name(this, "DownloadSyncActivityAction");
      }
      constructor() {
        super(DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR);
      }
      async run(accessor) {
        const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
        const notificationService = accessor.get(INotificationService);
        const folder = await userDataSyncWorkbenchService.downloadSyncActivity();
        if (folder) {
          notificationService.info(localize("download sync activity complete", "Successfully downloaded Settings Sync activity."));
        }
      }
    }));
  }
  registerViews() {
    const container = this.registerViewContainer();
    this.registerDataViews(container);
  }
  registerViewContainer() {
    return Registry.as(Extensions.ViewContainersRegistry).registerViewContainer(
      {
        id: SYNC_VIEW_CONTAINER_ID,
        title: SYNC_TITLE,
        ctorDescriptor: new SyncDescriptor(
          ViewPaneContainer,
          [SYNC_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]
        ),
        icon: SYNC_VIEW_ICON,
        hideIfEmpty: true
      },
      ViewContainerLocation.Sidebar
    );
  }
  registerResetSyncDataAction() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.actions.syncData.reset",
          title: localize("workbench.actions.syncData.reset", "Clear Data in Cloud..."),
          menu: [{
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID),
            group: "0_configure"
          }]
        });
      }
      run() {
        return that.userDataSyncWorkbenchService.resetSyncedData();
      }
    }));
  }
  registerDataViews(container) {
    this._register(this.instantiationService.createInstance(UserDataSyncDataViews, container));
  }
};
UserDataSyncWorkbenchContribution = __decorateClass([
  __decorateParam(0, IUserDataSyncEnablementService),
  __decorateParam(1, IUserDataSyncService),
  __decorateParam(2, IUserDataSyncWorkbenchService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IActivityService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IUserDataProfilesService),
  __decorateParam(8, IUserDataProfileService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, IQuickInputService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IOutputService),
  __decorateParam(13, IUserDataAutoSyncService),
  __decorateParam(14, ITextModelService),
  __decorateParam(15, IPreferencesService),
  __decorateParam(16, ITelemetryService),
  __decorateParam(17, IProductService),
  __decorateParam(18, IOpenerService),
  __decorateParam(19, IAuthenticationService),
  __decorateParam(20, IUserDataSyncStoreManagementService),
  __decorateParam(21, IHostService),
  __decorateParam(22, ICommandService),
  __decorateParam(23, IWorkbenchIssueService)
], UserDataSyncWorkbenchContribution);
let UserDataRemoteContentProvider = class {
  constructor(userDataSyncService, modelService, languageService) {
    this.userDataSyncService = userDataSyncService;
    this.modelService = modelService;
    this.languageService = languageService;
  }
  static {
    __name(this, "UserDataRemoteContentProvider");
  }
  provideTextContent(uri) {
    if (uri.scheme === USER_DATA_SYNC_SCHEME) {
      return this.userDataSyncService.resolveContent(uri).then((content) => this.modelService.createModel(content || "", this.languageService.createById("jsonc"), uri));
    }
    return null;
  }
};
UserDataRemoteContentProvider = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService)
], UserDataRemoteContentProvider);
export {
  UserDataSyncWorkbenchContribution
};
//# sourceMappingURL=userDataSync.js.map
