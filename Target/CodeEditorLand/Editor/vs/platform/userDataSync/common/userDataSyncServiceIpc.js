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
import { Disposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import {
  IUserDataProfilesService,
  reviveProfile
} from "../../userDataProfile/common/userDataProfile.js";
import {
  SyncStatus,
  UserDataSyncError
} from "./userDataSync.js";
function reviewSyncResource(syncResource, userDataProfilesService) {
  return {
    ...syncResource,
    profile: reviveProfile(
      syncResource.profile,
      userDataProfilesService.profilesHome.scheme
    )
  };
}
__name(reviewSyncResource, "reviewSyncResource");
function reviewSyncResourceHandle(syncResourceHandle) {
  return {
    created: syncResourceHandle.created,
    uri: URI.revive(syncResourceHandle.uri)
  };
}
__name(reviewSyncResourceHandle, "reviewSyncResourceHandle");
class UserDataSyncServiceChannel {
  constructor(service, userDataProfilesService, logService) {
    this.service = service;
    this.userDataProfilesService = userDataProfilesService;
    this.logService = logService;
  }
  static {
    __name(this, "UserDataSyncServiceChannel");
  }
  manualSyncTasks = /* @__PURE__ */ new Map();
  onManualSynchronizeResources = new Emitter();
  listen(_, event) {
    switch (event) {
      // sync
      case "onDidChangeStatus":
        return this.service.onDidChangeStatus;
      case "onDidChangeConflicts":
        return this.service.onDidChangeConflicts;
      case "onDidChangeLocal":
        return this.service.onDidChangeLocal;
      case "onDidChangeLastSyncTime":
        return this.service.onDidChangeLastSyncTime;
      case "onSyncErrors":
        return this.service.onSyncErrors;
      case "onDidResetLocal":
        return this.service.onDidResetLocal;
      case "onDidResetRemote":
        return this.service.onDidResetRemote;
      // manual sync
      case "manualSync/onSynchronizeResources":
        return this.onManualSynchronizeResources.event;
    }
    throw new Error(
      `[UserDataSyncServiceChannel] Event not found: ${event}`
    );
  }
  async call(context, command, args) {
    try {
      const result = await this._call(context, command, args);
      return result;
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
  async _call(context, command, args) {
    switch (command) {
      // sync
      case "_getInitialData":
        return Promise.resolve([
          this.service.status,
          this.service.conflicts,
          this.service.lastSyncTime
        ]);
      case "reset":
        return this.service.reset();
      case "resetRemote":
        return this.service.resetRemote();
      case "resetLocal":
        return this.service.resetLocal();
      case "hasPreviouslySynced":
        return this.service.hasPreviouslySynced();
      case "hasLocalData":
        return this.service.hasLocalData();
      case "resolveContent":
        return this.service.resolveContent(URI.revive(args[0]));
      case "accept":
        return this.service.accept(
          reviewSyncResource(args[0], this.userDataProfilesService),
          URI.revive(args[1]),
          args[2],
          args[3]
        );
      case "replace":
        return this.service.replace(reviewSyncResourceHandle(args[0]));
      case "cleanUpRemoteData":
        return this.service.cleanUpRemoteData();
      case "getRemoteActivityData":
        return this.service.saveRemoteActivityData(URI.revive(args[0]));
      case "extractActivityData":
        return this.service.extractActivityData(
          URI.revive(args[0]),
          URI.revive(args[1])
        );
      case "createManualSyncTask":
        return this.createManualSyncTask();
    }
    if (command.startsWith("manualSync/")) {
      const manualSyncTaskCommand = command.substring(
        "manualSync/".length
      );
      const manualSyncTaskId = args[0];
      const manualSyncTask = this.getManualSyncTask(manualSyncTaskId);
      args = args.slice(1);
      switch (manualSyncTaskCommand) {
        case "merge":
          return manualSyncTask.merge();
        case "apply":
          return manualSyncTask.apply().then(
            () => this.manualSyncTasks.delete(
              this.createKey(manualSyncTask.id)
            )
          );
        case "stop":
          return manualSyncTask.stop().finally(
            () => this.manualSyncTasks.delete(
              this.createKey(manualSyncTask.id)
            )
          );
      }
    }
    throw new Error("Invalid call");
  }
  getManualSyncTask(manualSyncTaskId) {
    const manualSyncTask = this.manualSyncTasks.get(
      this.createKey(manualSyncTaskId)
    );
    if (!manualSyncTask) {
      throw new Error(`Manual sync taks not found: ${manualSyncTaskId}`);
    }
    return manualSyncTask;
  }
  async createManualSyncTask() {
    const manualSyncTask = await this.service.createManualSyncTask();
    this.manualSyncTasks.set(
      this.createKey(manualSyncTask.id),
      manualSyncTask
    );
    return manualSyncTask.id;
  }
  createKey(manualSyncTaskId) {
    return `manualSyncTask-${manualSyncTaskId}`;
  }
}
let UserDataSyncServiceChannelClient = class extends Disposable {
  constructor(userDataSyncChannel, userDataProfilesService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.channel = {
      call(command, arg, cancellationToken) {
        return userDataSyncChannel.call(command, arg, cancellationToken).then(null, (error) => {
          throw UserDataSyncError.toUserDataSyncError(error);
        });
      },
      listen(event, arg) {
        return userDataSyncChannel.listen(event, arg);
      }
    };
    this.channel.call("_getInitialData").then(([status, conflicts, lastSyncTime]) => {
      this.updateStatus(status);
      this.updateConflicts(conflicts);
      if (lastSyncTime) {
        this.updateLastSyncTime(lastSyncTime);
      }
      this._register(
        this.channel.listen("onDidChangeStatus")(
          (status2) => this.updateStatus(status2)
        )
      );
      this._register(
        this.channel.listen("onDidChangeLastSyncTime")(
          (lastSyncTime2) => this.updateLastSyncTime(lastSyncTime2)
        )
      );
    });
    this._register(
      this.channel.listen(
        "onDidChangeConflicts"
      )((conflicts) => this.updateConflicts(conflicts))
    );
    this._register(
      this.channel.listen("onSyncErrors")(
        (errors) => this._onSyncErrors.fire(
          errors.map((syncError) => ({
            ...syncError,
            error: UserDataSyncError.toUserDataSyncError(
              syncError.error
            )
          }))
        )
      )
    );
  }
  static {
    __name(this, "UserDataSyncServiceChannelClient");
  }
  channel;
  _status = SyncStatus.Uninitialized;
  get status() {
    return this._status;
  }
  _onDidChangeStatus = this._register(
    new Emitter()
  );
  onDidChangeStatus = this._onDidChangeStatus.event;
  get onDidChangeLocal() {
    return this.channel.listen("onDidChangeLocal");
  }
  _conflicts = [];
  get conflicts() {
    return this._conflicts;
  }
  _onDidChangeConflicts = this._register(
    new Emitter()
  );
  onDidChangeConflicts = this._onDidChangeConflicts.event;
  _lastSyncTime = void 0;
  get lastSyncTime() {
    return this._lastSyncTime;
  }
  _onDidChangeLastSyncTime = this._register(
    new Emitter()
  );
  onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
  _onSyncErrors = this._register(
    new Emitter()
  );
  onSyncErrors = this._onSyncErrors.event;
  get onDidResetLocal() {
    return this.channel.listen("onDidResetLocal");
  }
  get onDidResetRemote() {
    return this.channel.listen("onDidResetRemote");
  }
  createSyncTask() {
    throw new Error("not supported");
  }
  async createManualSyncTask() {
    const id = await this.channel.call("createManualSyncTask");
    const that = this;
    const manualSyncTaskChannelClient = new ManualSyncTaskChannelClient(
      id,
      {
        async call(command, arg, cancellationToken) {
          return that.channel.call(
            `manualSync/${command}`,
            [id, ...Array.isArray(arg) ? arg : [arg]],
            cancellationToken
          );
        },
        listen() {
          throw new Error("not supported");
        }
      }
    );
    return manualSyncTaskChannelClient;
  }
  reset() {
    return this.channel.call("reset");
  }
  resetRemote() {
    return this.channel.call("resetRemote");
  }
  resetLocal() {
    return this.channel.call("resetLocal");
  }
  hasPreviouslySynced() {
    return this.channel.call("hasPreviouslySynced");
  }
  hasLocalData() {
    return this.channel.call("hasLocalData");
  }
  accept(syncResource, resource, content, apply) {
    return this.channel.call("accept", [
      syncResource,
      resource,
      content,
      apply
    ]);
  }
  resolveContent(resource) {
    return this.channel.call("resolveContent", [resource]);
  }
  cleanUpRemoteData() {
    return this.channel.call("cleanUpRemoteData");
  }
  replace(syncResourceHandle) {
    return this.channel.call("replace", [syncResourceHandle]);
  }
  saveRemoteActivityData(location) {
    return this.channel.call("getRemoteActivityData", [location]);
  }
  extractActivityData(activityDataResource, location) {
    return this.channel.call("extractActivityData", [
      activityDataResource,
      location
    ]);
  }
  async updateStatus(status) {
    this._status = status;
    this._onDidChangeStatus.fire(status);
  }
  async updateConflicts(conflicts) {
    this._conflicts = conflicts.map((syncConflict) => ({
      syncResource: syncConflict.syncResource,
      profile: reviveProfile(
        syncConflict.profile,
        this.userDataProfilesService.profilesHome.scheme
      ),
      conflicts: syncConflict.conflicts.map((r) => ({
        ...r,
        baseResource: URI.revive(r.baseResource),
        localResource: URI.revive(r.localResource),
        remoteResource: URI.revive(r.remoteResource),
        previewResource: URI.revive(r.previewResource)
      }))
    }));
    this._onDidChangeConflicts.fire(this._conflicts);
  }
  updateLastSyncTime(lastSyncTime) {
    if (this._lastSyncTime !== lastSyncTime) {
      this._lastSyncTime = lastSyncTime;
      this._onDidChangeLastSyncTime.fire(lastSyncTime);
    }
  }
};
UserDataSyncServiceChannelClient = __decorateClass([
  __decorateParam(1, IUserDataProfilesService)
], UserDataSyncServiceChannelClient);
class ManualSyncTaskChannelClient extends Disposable {
  constructor(id, channel) {
    super();
    this.id = id;
    this.channel = channel;
  }
  static {
    __name(this, "ManualSyncTaskChannelClient");
  }
  async merge() {
    return this.channel.call("merge");
  }
  async apply() {
    return this.channel.call("apply");
  }
  stop() {
    return this.channel.call("stop");
  }
  dispose() {
    this.channel.call("dispose");
    super.dispose();
  }
}
export {
  UserDataSyncServiceChannel,
  UserDataSyncServiceChannelClient
};
//# sourceMappingURL=userDataSyncServiceIpc.js.map
