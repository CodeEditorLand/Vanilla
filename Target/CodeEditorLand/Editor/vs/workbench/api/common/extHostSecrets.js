import { Event } from "../../../base/common/event.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import {
  ExtensionIdentifier
} from "../../../platform/extensions/common/extensions.js";
class ExtensionSecrets {
  _id;
  #secretState;
  onDidChange;
  disposables = new DisposableStore();
  constructor(extensionDescription, secretState) {
    this._id = ExtensionIdentifier.toKey(extensionDescription.identifier);
    this.#secretState = secretState;
    this.onDidChange = Event.map(
      Event.filter(
        this.#secretState.onDidChangePassword,
        (e) => e.extensionId === this._id
      ),
      (e) => ({ key: e.key }),
      this.disposables
    );
  }
  dispose() {
    this.disposables.dispose();
  }
  get(key) {
    return this.#secretState.get(this._id, key);
  }
  store(key, value) {
    return this.#secretState.store(this._id, key, value);
  }
  delete(key) {
    return this.#secretState.delete(this._id, key);
  }
}
export {
  ExtensionSecrets
};
