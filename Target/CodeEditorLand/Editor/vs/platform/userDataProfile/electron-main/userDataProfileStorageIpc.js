import { Emitter, Event } from "../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../base/common/lifecycle.js";
import {
  StorageScope,
  TARGET_KEY,
  loadKeyTargets
} from "../../storage/common/storage.js";
class ProfileStorageChangesListenerChannel extends Disposable {
  constructor(storageMainService, userDataProfilesService, logService) {
    super();
    this.storageMainService = storageMainService;
    this.userDataProfilesService = userDataProfilesService;
    this.logService = logService;
    const disposable = this._register(new MutableDisposable());
    this._onDidChange = this._register(
      new Emitter({
        // Start listening to profile storage changes only when someone is listening
        onWillAddFirstListener: () => disposable.value = this.registerStorageChangeListeners(),
        // Stop listening to profile storage changes when no one is listening
        onDidRemoveLastListener: () => disposable.value = void 0
      })
    );
  }
  _onDidChange;
  registerStorageChangeListeners() {
    this.logService.debug(
      "ProfileStorageChangesListenerChannel#registerStorageChangeListeners"
    );
    const disposables = new DisposableStore();
    disposables.add(
      Event.debounce(
        this.storageMainService.applicationStorage.onDidChangeStorage,
        (keys, e) => {
          if (keys) {
            keys.push(e.key);
          } else {
            keys = [e.key];
          }
          return keys;
        },
        100
      )((keys) => this.onDidChangeApplicationStorage(keys))
    );
    disposables.add(
      Event.debounce(
        this.storageMainService.onDidChangeProfileStorage,
        (changes, e) => {
          if (!changes) {
            changes = /* @__PURE__ */ new Map();
          }
          let profileChanges = changes.get(e.profile.id);
          if (!profileChanges) {
            changes.set(
              e.profile.id,
              profileChanges = {
                profile: e.profile,
                keys: [],
                storage: e.storage
              }
            );
          }
          profileChanges.keys.push(e.key);
          return changes;
        },
        100
      )((keys) => this.onDidChangeProfileStorage(keys))
    );
    return disposables;
  }
  onDidChangeApplicationStorage(keys) {
    const targetChangedProfiles = keys.includes(
      TARGET_KEY
    ) ? [this.userDataProfilesService.defaultProfile] : [];
    const profileStorageValueChanges = [];
    keys = keys.filter((key) => key !== TARGET_KEY);
    if (keys.length) {
      const keyTargets = loadKeyTargets(
        this.storageMainService.applicationStorage.storage
      );
      profileStorageValueChanges.push({
        profile: this.userDataProfilesService.defaultProfile,
        changes: keys.map((key) => ({
          key,
          scope: StorageScope.PROFILE,
          target: keyTargets[key]
        }))
      });
    }
    this.triggerEvents(targetChangedProfiles, profileStorageValueChanges);
  }
  onDidChangeProfileStorage(changes) {
    const targetChangedProfiles = [];
    const profileStorageValueChanges = /* @__PURE__ */ new Map();
    for (const [profileId, profileChanges] of changes.entries()) {
      if (profileChanges.keys.includes(TARGET_KEY)) {
        targetChangedProfiles.push(profileChanges.profile);
      }
      const keys = profileChanges.keys.filter(
        (key) => key !== TARGET_KEY
      );
      if (keys.length) {
        const keyTargets = loadKeyTargets(
          profileChanges.storage.storage
        );
        profileStorageValueChanges.set(profileId, {
          profile: profileChanges.profile,
          changes: keys.map((key) => ({
            key,
            scope: StorageScope.PROFILE,
            target: keyTargets[key]
          }))
        });
      }
    }
    this.triggerEvents(targetChangedProfiles, [
      ...profileStorageValueChanges.values()
    ]);
  }
  triggerEvents(targetChanges, valueChanges) {
    if (targetChanges.length || valueChanges.length) {
      this._onDidChange.fire({ valueChanges, targetChanges });
    }
  }
  listen(_, event, arg) {
    switch (event) {
      case "onDidChange":
        return this._onDidChange.event;
    }
    throw new Error(
      `[ProfileStorageChangesListenerChannel] Event not found: ${event}`
    );
  }
  async call(_, command) {
    throw new Error(`Call not found: ${command}`);
  }
}
export {
  ProfileStorageChangesListenerChannel
};
