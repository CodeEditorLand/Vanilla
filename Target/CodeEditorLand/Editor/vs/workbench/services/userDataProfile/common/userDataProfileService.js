var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Promises } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { equals } from "../../../../base/common/objects.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import {
  defaultUserDataProfileIcon
} from "./userDataProfile.js";
class UserDataProfileService extends Disposable {
  static {
    __name(this, "UserDataProfileService");
  }
  _serviceBrand;
  _onDidChangeCurrentProfile = this._register(
    new Emitter()
  );
  onDidChangeCurrentProfile = this._onDidChangeCurrentProfile.event;
  _currentProfile;
  get currentProfile() {
    return this._currentProfile;
  }
  constructor(currentProfile) {
    super();
    this._currentProfile = currentProfile;
  }
  async updateCurrentProfile(userDataProfile) {
    if (equals(this._currentProfile, userDataProfile)) {
      return;
    }
    const previous = this._currentProfile;
    this._currentProfile = userDataProfile;
    const joiners = [];
    this._onDidChangeCurrentProfile.fire({
      previous,
      profile: userDataProfile,
      join(promise) {
        joiners.push(promise);
      }
    });
    await Promises.settled(joiners);
  }
  getShortName(profile) {
    if (!profile.isDefault && profile.shortName && ThemeIcon.fromId(profile.shortName)) {
      return profile.shortName;
    }
    return `$(${defaultUserDataProfileIcon.id})`;
  }
}
export {
  UserDataProfileService
};
//# sourceMappingURL=userDataProfileService.js.map
