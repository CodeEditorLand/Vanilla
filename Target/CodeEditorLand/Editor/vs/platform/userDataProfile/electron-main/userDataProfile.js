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
import { INativeEnvironmentService } from "../../environment/common/environment.js";
import { IFileService } from "../../files/common/files.js";
import { refineServiceDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.js";
import { IStateService } from "../../state/node/state.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.js";
import {
  IUserDataProfilesService
} from "../common/userDataProfile.js";
import { UserDataProfilesService } from "../node/userDataProfile.js";
const IUserDataProfilesMainService = refineServiceDecorator(IUserDataProfilesService);
let UserDataProfilesMainService = class extends UserDataProfilesService {
  constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
    super(
      stateService,
      uriIdentityService,
      environmentService,
      fileService,
      logService
    );
  }
  getAssociatedEmptyWindows() {
    const emptyWindows = [];
    for (const id of this.profilesObject.emptyWindows.keys()) {
      emptyWindows.push({ id });
    }
    return emptyWindows;
  }
};
UserDataProfilesMainService = __decorateClass([
  __decorateParam(0, IStateService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, INativeEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService)
], UserDataProfilesMainService);
export {
  IUserDataProfilesMainService,
  UserDataProfilesMainService
};
