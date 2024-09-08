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
import { Event } from "../../../../base/common/event.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import {
  IUserDataAutoSyncService,
  UserDataSyncError
} from "../../../../platform/userDataSync/common/userDataSync.js";
let UserDataAutoSyncService = class {
  channel;
  get onError() {
    return Event.map(
      this.channel.listen("onError"),
      (e) => UserDataSyncError.toUserDataSyncError(e)
    );
  }
  constructor(sharedProcessService) {
    this.channel = sharedProcessService.getChannel("userDataAutoSync");
  }
  triggerSync(sources, hasToLimitSync, disableCache) {
    return this.channel.call("triggerSync", [
      sources,
      hasToLimitSync,
      disableCache
    ]);
  }
  turnOn() {
    return this.channel.call("turnOn");
  }
  turnOff(everywhere) {
    return this.channel.call("turnOff", [everywhere]);
  }
};
UserDataAutoSyncService = __decorateClass([
  __decorateParam(0, ISharedProcessService)
], UserDataAutoSyncService);
registerSingleton(
  IUserDataAutoSyncService,
  UserDataAutoSyncService,
  InstantiationType.Delayed
);
