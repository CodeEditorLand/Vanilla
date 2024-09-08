import { onUnexpectedError } from "../../base/common/errors.js";
import { isEmptyObject } from "../../base/common/types.js";
import {
  StorageScope
} from "../../platform/storage/common/storage.js";
class Memento {
  constructor(id, storageService) {
    this.storageService = storageService;
    this.id = Memento.COMMON_PREFIX + id;
  }
  static applicationMementos = /* @__PURE__ */ new Map();
  static profileMementos = /* @__PURE__ */ new Map();
  static workspaceMementos = /* @__PURE__ */ new Map();
  static COMMON_PREFIX = "memento/";
  id;
  getMemento(scope, target) {
    switch (scope) {
      case StorageScope.WORKSPACE: {
        let workspaceMemento = Memento.workspaceMementos.get(this.id);
        if (!workspaceMemento) {
          workspaceMemento = new ScopedMemento(
            this.id,
            scope,
            target,
            this.storageService
          );
          Memento.workspaceMementos.set(this.id, workspaceMemento);
        }
        return workspaceMemento.getMemento();
      }
      case StorageScope.PROFILE: {
        let profileMemento = Memento.profileMementos.get(this.id);
        if (!profileMemento) {
          profileMemento = new ScopedMemento(
            this.id,
            scope,
            target,
            this.storageService
          );
          Memento.profileMementos.set(this.id, profileMemento);
        }
        return profileMemento.getMemento();
      }
      case StorageScope.APPLICATION: {
        let applicationMemento = Memento.applicationMementos.get(
          this.id
        );
        if (!applicationMemento) {
          applicationMemento = new ScopedMemento(
            this.id,
            scope,
            target,
            this.storageService
          );
          Memento.applicationMementos.set(
            this.id,
            applicationMemento
          );
        }
        return applicationMemento.getMemento();
      }
    }
  }
  onDidChangeValue(scope, disposables) {
    return this.storageService.onDidChangeValue(
      scope,
      this.id,
      disposables
    );
  }
  saveMemento() {
    Memento.workspaceMementos.get(this.id)?.save();
    Memento.profileMementos.get(this.id)?.save();
    Memento.applicationMementos.get(this.id)?.save();
  }
  reloadMemento(scope) {
    let memento;
    switch (scope) {
      case StorageScope.APPLICATION:
        memento = Memento.applicationMementos.get(this.id);
        break;
      case StorageScope.PROFILE:
        memento = Memento.profileMementos.get(this.id);
        break;
      case StorageScope.WORKSPACE:
        memento = Memento.workspaceMementos.get(this.id);
        break;
    }
    memento?.reload();
  }
  static clear(scope) {
    switch (scope) {
      case StorageScope.WORKSPACE:
        Memento.workspaceMementos.clear();
        break;
      case StorageScope.PROFILE:
        Memento.profileMementos.clear();
        break;
      case StorageScope.APPLICATION:
        Memento.applicationMementos.clear();
        break;
    }
  }
}
class ScopedMemento {
  constructor(id, scope, target, storageService) {
    this.id = id;
    this.scope = scope;
    this.target = target;
    this.storageService = storageService;
    this.mementoObj = this.doLoad();
  }
  mementoObj;
  doLoad() {
    try {
      return this.storageService.getObject(
        this.id,
        this.scope,
        {}
      );
    } catch (error) {
      onUnexpectedError(
        `[memento]: failed to parse contents: ${error} (id: ${this.id}, scope: ${this.scope}, contents: ${this.storageService.get(this.id, this.scope)})`
      );
    }
    return {};
  }
  getMemento() {
    return this.mementoObj;
  }
  reload() {
    for (const name of Object.getOwnPropertyNames(this.mementoObj)) {
      delete this.mementoObj[name];
    }
    Object.assign(this.mementoObj, this.doLoad());
  }
  save() {
    if (isEmptyObject(this.mementoObj)) {
      this.storageService.remove(this.id, this.scope);
    } else {
      this.storageService.store(
        this.id,
        this.mementoObj,
        this.scope,
        this.target
      );
    }
  }
}
export {
  Memento
};
