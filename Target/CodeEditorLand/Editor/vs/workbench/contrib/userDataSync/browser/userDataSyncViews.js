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
import { Codicon } from "../../../../base/common/codicons.js";
import { fromNow } from "../../../../base/common/date.js";
import { Event } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import {
  IDialogService,
  IFileDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { FolderThemeIcon } from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IUserDataProfilesService
} from "../../../../platform/userDataProfile/common/userDataProfile.js";
import {
  ALL_SYNC_RESOURCES,
  IUserDataAutoSyncService,
  IUserDataSyncEnablementService,
  IUserDataSyncResourceProviderService,
  IUserDataSyncService,
  SyncResource,
  SyncStatus,
  UserDataSyncError,
  UserDataSyncErrorCode,
  getLastSyncResourceUri
} from "../../../../platform/userDataSync/common/userDataSync.js";
import {
  IUserDataSyncMachinesService,
  isWebPlatform
} from "../../../../platform/userDataSync/common/userDataSyncMachines.js";
import {
  API_OPEN_DIFF_EDITOR_COMMAND_ID,
  API_OPEN_EDITOR_COMMAND_ID
} from "../../../browser/parts/editor/editorCommands.js";
import {
  TreeView,
  TreeViewPane
} from "../../../browser/parts/views/treeView.js";
import {
  Extensions,
  TreeItemCollapsibleState
} from "../../../common/views.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  AccountStatus,
  CONTEXT_ACCOUNT_STATE,
  CONTEXT_ENABLE_ACTIVITY_VIEWS,
  CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW,
  CONTEXT_HAS_CONFLICTS,
  CONTEXT_SYNC_STATE,
  IUserDataSyncWorkbenchService,
  SYNC_CONFLICTS_VIEW_ID,
  SYNC_TITLE,
  getSyncAreaLabel
} from "../../../services/userDataSync/common/userDataSync.js";
import { UserDataSyncConflictsViewPane } from "./userDataSyncConflictsView.js";
let UserDataSyncDataViews = class extends Disposable {
  constructor(container, instantiationService, userDataSyncEnablementService, userDataSyncMachinesService, userDataSyncService) {
    super();
    this.instantiationService = instantiationService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.userDataSyncService = userDataSyncService;
    this.registerViews(container);
  }
  static {
    __name(this, "UserDataSyncDataViews");
  }
  registerViews(container) {
    this.registerConflictsView(container);
    this.registerActivityView(container, true);
    this.registerMachinesView(container);
    this.registerActivityView(container, false);
    this.registerTroubleShootView(container);
    this.registerExternalActivityView(container);
  }
  registerConflictsView(container) {
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    const viewName = localize2("conflicts", "Conflicts");
    const viewDescriptor = {
      id: SYNC_CONFLICTS_VIEW_ID,
      name: viewName,
      ctorDescriptor: new SyncDescriptor(UserDataSyncConflictsViewPane),
      when: ContextKeyExpr.and(
        CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW,
        CONTEXT_HAS_CONFLICTS
      ),
      canToggleVisibility: false,
      canMoveView: false,
      treeView: this.instantiationService.createInstance(
        TreeView,
        SYNC_CONFLICTS_VIEW_ID,
        viewName.value
      ),
      collapsed: false,
      order: 100
    };
    viewsRegistry.registerViews([viewDescriptor], container);
  }
  registerMachinesView(container) {
    const id = `workbench.views.sync.machines`;
    const name = localize2("synced machines", "Synced Machines");
    const treeView = this.instantiationService.createInstance(
      TreeView,
      id,
      name.value
    );
    const dataProvider = this.instantiationService.createInstance(
      UserDataSyncMachinesViewDataProvider,
      treeView
    );
    treeView.showRefreshAction = true;
    treeView.canSelectMany = true;
    treeView.dataProvider = dataProvider;
    this._register(
      Event.any(
        this.userDataSyncMachinesService.onDidChange,
        this.userDataSyncService.onDidResetRemote
      )(() => treeView.refresh())
    );
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    const viewDescriptor = {
      id,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: ContextKeyExpr.and(
        CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized),
        CONTEXT_ACCOUNT_STATE.isEqualTo(AccountStatus.Available),
        CONTEXT_ENABLE_ACTIVITY_VIEWS
      ),
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      order: 300
    };
    viewsRegistry.registerViews([viewDescriptor], container);
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.sync.editMachineName`,
              title: localize(
                "workbench.actions.sync.editMachineName",
                "Edit Name"
              ),
              icon: Codicon.edit,
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", id)
                ),
                group: "inline"
              }
            });
          }
          async run(accessor, handle) {
            const changed = await dataProvider.rename(
              handle.$treeItemHandle
            );
            if (changed) {
              await treeView.refresh();
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.sync.turnOffSyncOnMachine`,
              title: localize(
                "workbench.actions.sync.turnOffSyncOnMachine",
                "Turn off Settings Sync"
              ),
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", id),
                  ContextKeyExpr.equals(
                    "viewItem",
                    "sync-machine"
                  )
                )
              }
            });
          }
          async run(accessor, handle, selected) {
            if (await dataProvider.disable(
              (selected || [handle]).map(
                (handle2) => handle2.$treeItemHandle
              )
            )) {
              await treeView.refresh();
            }
          }
        }
      )
    );
  }
  registerActivityView(container, remote) {
    const id = `workbench.views.sync.${remote ? "remote" : "local"}Activity`;
    const name = remote ? localize2("remote sync activity title", "Sync Activity (Remote)") : localize2("local sync activity title", "Sync Activity (Local)");
    const treeView = this.instantiationService.createInstance(
      TreeView,
      id,
      name.value
    );
    treeView.showCollapseAllAction = true;
    treeView.showRefreshAction = true;
    treeView.dataProvider = remote ? this.instantiationService.createInstance(
      RemoteUserDataSyncActivityViewDataProvider
    ) : this.instantiationService.createInstance(
      LocalUserDataSyncActivityViewDataProvider
    );
    this._register(
      Event.any(
        this.userDataSyncEnablementService.onDidChangeResourceEnablement,
        this.userDataSyncEnablementService.onDidChangeEnablement,
        this.userDataSyncService.onDidResetLocal,
        this.userDataSyncService.onDidResetRemote
      )(() => treeView.refresh())
    );
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    const viewDescriptor = {
      id,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: ContextKeyExpr.and(
        CONTEXT_SYNC_STATE.notEqualsTo(SyncStatus.Uninitialized),
        CONTEXT_ACCOUNT_STATE.isEqualTo(AccountStatus.Available),
        CONTEXT_ENABLE_ACTIVITY_VIEWS
      ),
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      order: remote ? 200 : 400,
      hideByDefault: !remote
    };
    viewsRegistry.registerViews([viewDescriptor], container);
    this.registerDataViewActions(id);
  }
  registerExternalActivityView(container) {
    const id = `workbench.views.sync.externalActivity`;
    const name = localize2(
      "downloaded sync activity title",
      "Sync Activity (Developer)"
    );
    const dataProvider = this.instantiationService.createInstance(
      ExtractedUserDataSyncActivityViewDataProvider,
      void 0
    );
    const treeView = this.instantiationService.createInstance(
      TreeView,
      id,
      name.value
    );
    treeView.showCollapseAllAction = false;
    treeView.showRefreshAction = false;
    treeView.dataProvider = dataProvider;
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    const viewDescriptor = {
      id,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: CONTEXT_ENABLE_ACTIVITY_VIEWS,
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      hideByDefault: false
    };
    viewsRegistry.registerViews([viewDescriptor], container);
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.sync.loadActivity`,
              title: localize(
                "workbench.actions.sync.loadActivity",
                "Load Sync Activity"
              ),
              icon: Codicon.cloudUpload,
              menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.equals("view", id),
                group: "navigation"
              }
            });
          }
          async run(accessor) {
            const fileDialogService = accessor.get(IFileDialogService);
            const result = await fileDialogService.showOpenDialog({
              title: localize(
                "select sync activity file",
                "Select Sync Activity File or Folder"
              ),
              canSelectFiles: true,
              canSelectFolders: true,
              canSelectMany: false
            });
            if (!result?.[0]) {
              return;
            }
            dataProvider.activityDataResource = result[0];
            await treeView.refresh();
          }
        }
      )
    );
  }
  registerDataViewActions(viewId) {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.sync.${viewId}.resolveResource`,
              title: localize(
                "workbench.actions.sync.resolveResourceRef",
                "Show raw JSON sync data"
              ),
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewId),
                  ContextKeyExpr.regex(
                    "viewItem",
                    /sync-resource-.*/i
                  )
                )
              }
            });
          }
          async run(accessor, handle) {
            const { resource } = JSON.parse(handle.$treeItemHandle);
            const editorService = accessor.get(IEditorService);
            await editorService.openEditor({
              resource: URI.parse(resource),
              options: { pinned: true }
            });
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.sync.${viewId}.compareWithLocal`,
              title: localize(
                "workbench.actions.sync.compareWithLocal",
                "Compare with Local"
              ),
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewId),
                  ContextKeyExpr.regex(
                    "viewItem",
                    /sync-associatedResource-.*/i
                  )
                )
              }
            });
          }
          async run(accessor, handle) {
            const commandService = accessor.get(ICommandService);
            const { resource, comparableResource } = JSON.parse(handle.$treeItemHandle);
            const remoteResource = URI.parse(resource);
            const localResource = URI.parse(comparableResource);
            return commandService.executeCommand(
              API_OPEN_DIFF_EDITOR_COMMAND_ID,
              remoteResource,
              localResource,
              localize(
                "remoteToLocalDiff",
                "{0} \u2194 {1}",
                localize(
                  {
                    key: "leftResourceName",
                    comment: ["remote as in file in cloud"]
                  },
                  "{0} (Remote)",
                  basename(remoteResource)
                ),
                localize(
                  {
                    key: "rightResourceName",
                    comment: ["local as in file in disk"]
                  },
                  "{0} (Local)",
                  basename(localResource)
                )
              ),
              void 0
            );
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: `workbench.actions.sync.${viewId}.replaceCurrent`,
              title: localize(
                "workbench.actions.sync.replaceCurrent",
                "Restore"
              ),
              icon: Codicon.discard,
              menu: {
                id: MenuId.ViewItemContext,
                when: ContextKeyExpr.and(
                  ContextKeyExpr.equals("view", viewId),
                  ContextKeyExpr.regex(
                    "viewItem",
                    /sync-resource-.*/i
                  ),
                  ContextKeyExpr.notEquals(
                    "viewItem",
                    `sync-resource-${SyncResource.Profiles}`
                  )
                ),
                group: "inline"
              }
            });
          }
          async run(accessor, handle) {
            const dialogService = accessor.get(IDialogService);
            const userDataSyncService = accessor.get(IUserDataSyncService);
            const { syncResourceHandle, syncResource } = JSON.parse(handle.$treeItemHandle);
            const result = await dialogService.confirm({
              message: localize(
                {
                  key: "confirm replace",
                  comment: [
                    "A confirmation message to replace current user data (settings, extensions, keybindings, snippets) with selected version"
                  ]
                },
                "Would you like to replace your current {0} with selected?",
                getSyncAreaLabel(syncResource)
              ),
              type: "info",
              title: SYNC_TITLE.value
            });
            if (result.confirmed) {
              return userDataSyncService.replace({
                created: syncResourceHandle.created,
                uri: URI.revive(syncResourceHandle.uri)
              });
            }
          }
        }
      )
    );
  }
  registerTroubleShootView(container) {
    const id = `workbench.views.sync.troubleshoot`;
    const name = localize2("troubleshoot", "Troubleshoot");
    const treeView = this.instantiationService.createInstance(
      TreeView,
      id,
      name.value
    );
    const dataProvider = this.instantiationService.createInstance(
      UserDataSyncTroubleshootViewDataProvider
    );
    treeView.showRefreshAction = true;
    treeView.dataProvider = dataProvider;
    const viewsRegistry = Registry.as(
      Extensions.ViewsRegistry
    );
    const viewDescriptor = {
      id,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: CONTEXT_ENABLE_ACTIVITY_VIEWS,
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      order: 500,
      hideByDefault: true
    };
    viewsRegistry.registerViews([viewDescriptor], container);
  }
};
UserDataSyncDataViews = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUserDataSyncEnablementService),
  __decorateParam(3, IUserDataSyncMachinesService),
  __decorateParam(4, IUserDataSyncService)
], UserDataSyncDataViews);
let UserDataSyncActivityViewDataProvider = class {
  constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncResourceProviderService = userDataSyncResourceProviderService;
    this.userDataAutoSyncService = userDataAutoSyncService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.notificationService = notificationService;
    this.userDataProfilesService = userDataProfilesService;
  }
  static {
    __name(this, "UserDataSyncActivityViewDataProvider");
  }
  syncResourceHandlesByProfile = /* @__PURE__ */ new Map();
  async getChildren(element) {
    try {
      if (!element) {
        return await this.getRoots();
      }
      if (element.profile || element.handle === this.userDataProfilesService.defaultProfile.id) {
        let promise = this.syncResourceHandlesByProfile.get(
          element.handle
        );
        if (!promise) {
          this.syncResourceHandlesByProfile.set(
            element.handle,
            promise = this.getSyncResourceHandles(
              element.profile
            )
          );
        }
        return await promise;
      }
      if (element.syncResourceHandle) {
        return await this.getChildrenForSyncResourceTreeItem(
          element
        );
      }
      return [];
    } catch (error) {
      if (!(error instanceof UserDataSyncError)) {
        error = UserDataSyncError.toUserDataSyncError(error);
      }
      if (error instanceof UserDataSyncError && error.code === UserDataSyncErrorCode.IncompatibleRemoteContent) {
        this.notificationService.notify({
          severity: Severity.Error,
          message: error.message,
          actions: {
            primary: [
              new Action(
                "reset",
                localize("reset", "Reset Synced Data"),
                void 0,
                true,
                () => this.userDataSyncWorkbenchService.resetSyncedData()
              )
            ]
          }
        });
      } else {
        this.notificationService.error(error);
      }
      throw error;
    }
  }
  async getRoots() {
    this.syncResourceHandlesByProfile.clear();
    const roots = [];
    const profiles = await this.getProfiles();
    if (profiles.length) {
      const profileTreeItem = {
        handle: this.userDataProfilesService.defaultProfile.id,
        label: {
          label: this.userDataProfilesService.defaultProfile.name
        },
        collapsibleState: TreeItemCollapsibleState.Expanded
      };
      roots.push(profileTreeItem);
    } else {
      const defaultSyncResourceHandles = await this.getSyncResourceHandles();
      roots.push(...defaultSyncResourceHandles);
    }
    for (const profile of profiles) {
      const profileTreeItem = {
        handle: profile.id,
        label: { label: profile.name },
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        profile
      };
      roots.push(profileTreeItem);
    }
    return roots;
  }
  async getChildrenForSyncResourceTreeItem(element) {
    const syncResourceHandle = element.syncResourceHandle;
    const associatedResources = await this.userDataSyncResourceProviderService.getAssociatedResources(
      syncResourceHandle
    );
    const previousAssociatedResources = syncResourceHandle.previous ? await this.userDataSyncResourceProviderService.getAssociatedResources(
      syncResourceHandle.previous
    ) : [];
    return associatedResources.map(({ resource, comparableResource }) => {
      const handle = JSON.stringify({
        resource: resource.toString(),
        comparableResource: comparableResource.toString()
      });
      const previousResource = previousAssociatedResources.find(
        (previous) => basename(previous.resource) === basename(resource)
      )?.resource;
      return {
        handle,
        collapsibleState: TreeItemCollapsibleState.None,
        resourceUri: resource,
        command: previousResource ? {
          id: API_OPEN_DIFF_EDITOR_COMMAND_ID,
          title: "",
          arguments: [
            previousResource,
            resource,
            localize(
              "sideBySideLabels",
              "{0} \u2194 {1}",
              `${basename(resource)} (${fromNow(syncResourceHandle.previous.created, true)})`,
              `${basename(resource)} (${fromNow(syncResourceHandle.created, true)})`
            ),
            void 0
          ]
        } : {
          id: API_OPEN_EDITOR_COMMAND_ID,
          title: "",
          arguments: [resource, void 0, void 0]
        },
        contextValue: `sync-associatedResource-${syncResourceHandle.syncResource}`
      };
    });
  }
  async getSyncResourceHandles(profile) {
    const treeItems = [];
    const result = await Promise.all(
      ALL_SYNC_RESOURCES.map(async (syncResource) => {
        const resourceHandles = await this.getResourceHandles(
          syncResource,
          profile
        );
        return resourceHandles.map((resourceHandle, index) => ({
          ...resourceHandle,
          syncResource,
          previous: resourceHandles[index + 1]
        }));
      })
    );
    const syncResourceHandles = result.flat().sort((a, b) => b.created - a.created);
    for (const syncResourceHandle of syncResourceHandles) {
      const handle = JSON.stringify({
        syncResourceHandle,
        syncResource: syncResourceHandle.syncResource
      });
      treeItems.push({
        handle,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        label: {
          label: getSyncAreaLabel(syncResourceHandle.syncResource)
        },
        description: fromNow(syncResourceHandle.created, true),
        tooltip: new Date(syncResourceHandle.created).toLocaleString(),
        themeIcon: FolderThemeIcon,
        syncResourceHandle,
        contextValue: `sync-resource-${syncResourceHandle.syncResource}`
      });
    }
    return treeItems;
  }
};
UserDataSyncActivityViewDataProvider = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IUserDataSyncResourceProviderService),
  __decorateParam(2, IUserDataAutoSyncService),
  __decorateParam(3, IUserDataSyncWorkbenchService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IUserDataProfilesService)
], UserDataSyncActivityViewDataProvider);
class LocalUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
  static {
    __name(this, "LocalUserDataSyncActivityViewDataProvider");
  }
  getResourceHandles(syncResource, profile) {
    return this.userDataSyncResourceProviderService.getLocalSyncResourceHandles(
      syncResource,
      profile
    );
  }
  async getProfiles() {
    return this.userDataProfilesService.profiles.filter((p) => !p.isDefault).map((p) => ({
      id: p.id,
      collection: p.id,
      name: p.name
    }));
  }
}
let RemoteUserDataSyncActivityViewDataProvider = class extends UserDataSyncActivityViewDataProvider {
  constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncMachinesService, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
    super(
      userDataSyncService,
      userDataSyncResourceProviderService,
      userDataAutoSyncService,
      userDataSyncWorkbenchService,
      notificationService,
      userDataProfilesService
    );
    this.userDataSyncMachinesService = userDataSyncMachinesService;
  }
  static {
    __name(this, "RemoteUserDataSyncActivityViewDataProvider");
  }
  machinesPromise;
  async getChildren(element) {
    if (!element) {
      this.machinesPromise = void 0;
    }
    return super.getChildren(element);
  }
  getMachines() {
    if (this.machinesPromise === void 0) {
      this.machinesPromise = this.userDataSyncMachinesService.getMachines();
    }
    return this.machinesPromise;
  }
  getResourceHandles(syncResource, profile) {
    return this.userDataSyncResourceProviderService.getRemoteSyncResourceHandles(
      syncResource,
      profile
    );
  }
  getProfiles() {
    return this.userDataSyncResourceProviderService.getRemoteSyncedProfiles();
  }
  async getChildrenForSyncResourceTreeItem(element) {
    const children = await super.getChildrenForSyncResourceTreeItem(
      element
    );
    if (children.length) {
      const machineId = await this.userDataSyncResourceProviderService.getMachineId(
        element.syncResourceHandle
      );
      if (machineId) {
        const machines = await this.getMachines();
        const machine = machines.find(({ id }) => id === machineId);
        children[0].description = machine?.isCurrent ? localize(
          {
            key: "current",
            comment: ["Represents current machine"]
          },
          "Current"
        ) : machine?.name;
      }
    }
    return children;
  }
};
RemoteUserDataSyncActivityViewDataProvider = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IUserDataSyncResourceProviderService),
  __decorateParam(2, IUserDataAutoSyncService),
  __decorateParam(3, IUserDataSyncMachinesService),
  __decorateParam(4, IUserDataSyncWorkbenchService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IUserDataProfilesService)
], RemoteUserDataSyncActivityViewDataProvider);
let ExtractedUserDataSyncActivityViewDataProvider = class extends UserDataSyncActivityViewDataProvider {
  constructor(activityDataResource, userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService, fileService, uriIdentityService) {
    super(
      userDataSyncService,
      userDataSyncResourceProviderService,
      userDataAutoSyncService,
      userDataSyncWorkbenchService,
      notificationService,
      userDataProfilesService
    );
    this.activityDataResource = activityDataResource;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "ExtractedUserDataSyncActivityViewDataProvider");
  }
  machinesPromise;
  activityDataLocation;
  async getChildren(element) {
    if (!element) {
      this.machinesPromise = void 0;
      if (!this.activityDataResource) {
        return [];
      }
      const stat = await this.fileService.resolve(
        this.activityDataResource
      );
      if (stat.isDirectory) {
        this.activityDataLocation = this.activityDataResource;
      } else {
        this.activityDataLocation = this.uriIdentityService.extUri.joinPath(
          this.uriIdentityService.extUri.dirname(
            this.activityDataResource
          ),
          "remoteActivity"
        );
        try {
          await this.fileService.del(this.activityDataLocation, {
            recursive: true
          });
        } catch (e) {
        }
        await this.userDataSyncService.extractActivityData(
          this.activityDataResource,
          this.activityDataLocation
        );
      }
    }
    return super.getChildren(element);
  }
  getResourceHandles(syncResource, profile) {
    return this.userDataSyncResourceProviderService.getLocalSyncResourceHandles(
      syncResource,
      profile,
      this.activityDataLocation
    );
  }
  async getProfiles() {
    return this.userDataSyncResourceProviderService.getLocalSyncedProfiles(
      this.activityDataLocation
    );
  }
  async getChildrenForSyncResourceTreeItem(element) {
    const children = await super.getChildrenForSyncResourceTreeItem(
      element
    );
    if (children.length) {
      const machineId = await this.userDataSyncResourceProviderService.getMachineId(
        element.syncResourceHandle
      );
      if (machineId) {
        const machines = await this.getMachines();
        const machine = machines.find(({ id }) => id === machineId);
        children[0].description = machine?.isCurrent ? localize(
          {
            key: "current",
            comment: ["Represents current machine"]
          },
          "Current"
        ) : machine?.name;
      }
    }
    return children;
  }
  getMachines() {
    if (this.machinesPromise === void 0) {
      this.machinesPromise = this.userDataSyncResourceProviderService.getLocalSyncedMachines(
        this.activityDataLocation
      );
    }
    return this.machinesPromise;
  }
};
ExtractedUserDataSyncActivityViewDataProvider = __decorateClass([
  __decorateParam(1, IUserDataSyncService),
  __decorateParam(2, IUserDataSyncResourceProviderService),
  __decorateParam(3, IUserDataAutoSyncService),
  __decorateParam(4, IUserDataSyncWorkbenchService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IUserDataProfilesService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IUriIdentityService)
], ExtractedUserDataSyncActivityViewDataProvider);
let UserDataSyncMachinesViewDataProvider = class {
  constructor(treeView, userDataSyncMachinesService, quickInputService, notificationService, dialogService, userDataSyncWorkbenchService) {
    this.treeView = treeView;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.quickInputService = quickInputService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
  }
  static {
    __name(this, "UserDataSyncMachinesViewDataProvider");
  }
  machinesPromise;
  async getChildren(element) {
    if (!element) {
      this.machinesPromise = void 0;
    }
    try {
      let machines = await this.getMachines();
      machines = machines.filter((m) => !m.disabled).sort((m1, m2) => m1.isCurrent ? -1 : 1);
      this.treeView.message = machines.length ? void 0 : localize("no machines", "No Machines");
      return machines.map(({ id, name, isCurrent, platform }) => ({
        handle: id,
        collapsibleState: TreeItemCollapsibleState.None,
        label: { label: name },
        description: isCurrent ? localize(
          { key: "current", comment: ["Current machine"] },
          "Current"
        ) : void 0,
        themeIcon: platform && isWebPlatform(platform) ? Codicon.globe : Codicon.vm,
        contextValue: "sync-machine"
      }));
    } catch (error) {
      this.notificationService.error(error);
      return [];
    }
  }
  getMachines() {
    if (this.machinesPromise === void 0) {
      this.machinesPromise = this.userDataSyncMachinesService.getMachines();
    }
    return this.machinesPromise;
  }
  async disable(machineIds) {
    const machines = await this.getMachines();
    const machinesToDisable = machines.filter(
      ({ id }) => machineIds.includes(id)
    );
    if (!machinesToDisable.length) {
      throw new Error(
        localize(
          "not found",
          "machine not found with id: {0}",
          machineIds.join(",")
        )
      );
    }
    const result = await this.dialogService.confirm({
      type: "info",
      message: machinesToDisable.length > 1 ? localize(
        "turn off sync on multiple machines",
        "Are you sure you want to turn off sync on selected machines?"
      ) : localize(
        "turn off sync on machine",
        "Are you sure you want to turn off sync on {0}?",
        machinesToDisable[0].name
      ),
      primaryButton: localize(
        { key: "turn off", comment: ["&& denotes a mnemonic"] },
        "&&Turn off"
      )
    });
    if (!result.confirmed) {
      return false;
    }
    if (machinesToDisable.some((machine) => machine.isCurrent)) {
      await this.userDataSyncWorkbenchService.turnoff(false);
    }
    const otherMachinesToDisable = machinesToDisable.filter((machine) => !machine.isCurrent).map((machine) => [machine.id, false]);
    if (otherMachinesToDisable.length) {
      await this.userDataSyncMachinesService.setEnablements(
        otherMachinesToDisable
      );
    }
    return true;
  }
  async rename(machineId) {
    const disposableStore = new DisposableStore();
    const inputBox = disposableStore.add(
      this.quickInputService.createInputBox()
    );
    inputBox.placeholder = localize(
      "placeholder",
      "Enter the name of the machine"
    );
    inputBox.busy = true;
    inputBox.show();
    const machines = await this.getMachines();
    const machine = machines.find(({ id }) => id === machineId);
    if (!machine) {
      inputBox.hide();
      disposableStore.dispose();
      throw new Error(
        localize(
          "not found",
          "machine not found with id: {0}",
          machineId
        )
      );
    }
    inputBox.busy = false;
    inputBox.value = machine.name;
    const validateMachineName = /* @__PURE__ */ __name((machineName) => {
      machineName = machineName.trim();
      return machineName && !machines.some(
        (m) => m.id !== machineId && m.name === machineName
      ) ? machineName : null;
    }, "validateMachineName");
    disposableStore.add(
      inputBox.onDidChangeValue(
        () => inputBox.validationMessage = validateMachineName(
          inputBox.value
        ) ? "" : localize(
          "valid message",
          "Machine name should be unique and not empty"
        )
      )
    );
    return new Promise((c, e) => {
      disposableStore.add(
        inputBox.onDidAccept(async () => {
          const machineName = validateMachineName(inputBox.value);
          disposableStore.dispose();
          if (machineName && machineName !== machine.name) {
            try {
              await this.userDataSyncMachinesService.renameMachine(
                machineId,
                machineName
              );
              c(true);
            } catch (error) {
              e(error);
            }
          } else {
            c(false);
          }
        })
      );
    });
  }
};
UserDataSyncMachinesViewDataProvider = __decorateClass([
  __decorateParam(1, IUserDataSyncMachinesService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IUserDataSyncWorkbenchService)
], UserDataSyncMachinesViewDataProvider);
let UserDataSyncTroubleshootViewDataProvider = class {
  constructor(fileService, userDataSyncWorkbenchService, environmentService, uriIdentityService) {
    this.fileService = fileService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.environmentService = environmentService;
    this.uriIdentityService = uriIdentityService;
  }
  static {
    __name(this, "UserDataSyncTroubleshootViewDataProvider");
  }
  async getChildren(element) {
    if (!element) {
      return [
        {
          handle: "SYNC_LOGS",
          collapsibleState: TreeItemCollapsibleState.Collapsed,
          label: { label: localize("sync logs", "Logs") },
          themeIcon: Codicon.folder
        },
        {
          handle: "LAST_SYNC_STATES",
          collapsibleState: TreeItemCollapsibleState.Collapsed,
          label: {
            label: localize(
              "last sync states",
              "Last Synced Remotes"
            )
          },
          themeIcon: Codicon.folder
        }
      ];
    }
    if (element.handle === "LAST_SYNC_STATES") {
      return this.getLastSyncStates();
    }
    if (element.handle === "SYNC_LOGS") {
      return this.getSyncLogs();
    }
    return [];
  }
  async getLastSyncStates() {
    const result = [];
    for (const syncResource of ALL_SYNC_RESOURCES) {
      const resource = getLastSyncResourceUri(
        void 0,
        syncResource,
        this.environmentService,
        this.uriIdentityService.extUri
      );
      if (await this.fileService.exists(resource)) {
        result.push({
          handle: resource.toString(),
          label: { label: getSyncAreaLabel(syncResource) },
          collapsibleState: TreeItemCollapsibleState.None,
          resourceUri: resource,
          command: {
            id: API_OPEN_EDITOR_COMMAND_ID,
            title: "",
            arguments: [resource, void 0, void 0]
          }
        });
      }
    }
    return result;
  }
  async getSyncLogs() {
    const logResources = await this.userDataSyncWorkbenchService.getAllLogResources();
    const result = [];
    for (const syncLogResource of logResources) {
      const logFolder = this.uriIdentityService.extUri.dirname(syncLogResource);
      result.push({
        handle: syncLogResource.toString(),
        collapsibleState: TreeItemCollapsibleState.None,
        resourceUri: syncLogResource,
        label: {
          label: this.uriIdentityService.extUri.basename(logFolder)
        },
        description: this.uriIdentityService.extUri.isEqual(
          logFolder,
          this.environmentService.logsHome
        ) ? localize(
          {
            key: "current",
            comment: ["Represents current log file"]
          },
          "Current"
        ) : void 0,
        command: {
          id: API_OPEN_EDITOR_COMMAND_ID,
          title: "",
          arguments: [syncLogResource, void 0, void 0]
        }
      });
    }
    return result;
  }
};
UserDataSyncTroubleshootViewDataProvider = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataSyncWorkbenchService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUriIdentityService)
], UserDataSyncTroubleshootViewDataProvider);
export {
  UserDataSyncDataViews
};
//# sourceMappingURL=userDataSyncViews.js.map
