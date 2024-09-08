import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { URI } from "../../../../base/common/uri.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IWorkingCopyService = createDecorator("workingCopyService");
class WorkingCopyService extends Disposable {
  //#region Events
  _onDidRegister = this._register(
    new Emitter()
  );
  onDidRegister = this._onDidRegister.event;
  _onDidUnregister = this._register(
    new Emitter()
  );
  onDidUnregister = this._onDidUnregister.event;
  _onDidChangeDirty = this._register(
    new Emitter()
  );
  onDidChangeDirty = this._onDidChangeDirty.event;
  _onDidChangeContent = this._register(
    new Emitter()
  );
  onDidChangeContent = this._onDidChangeContent.event;
  _onDidSave = this._register(
    new Emitter()
  );
  onDidSave = this._onDidSave.event;
  //#endregion
  //#region Registry
  get workingCopies() {
    return Array.from(this._workingCopies.values());
  }
  _workingCopies = /* @__PURE__ */ new Set();
  mapResourceToWorkingCopies = new ResourceMap();
  mapWorkingCopyToListeners = this._register(
    new DisposableMap()
  );
  registerWorkingCopy(workingCopy) {
    let workingCopiesForResource = this.mapResourceToWorkingCopies.get(
      workingCopy.resource
    );
    if (workingCopiesForResource?.has(workingCopy.typeId)) {
      throw new Error(
        `Cannot register more than one working copy with the same resource ${workingCopy.resource.toString()} and type ${workingCopy.typeId}.`
      );
    }
    this._workingCopies.add(workingCopy);
    if (!workingCopiesForResource) {
      workingCopiesForResource = /* @__PURE__ */ new Map();
      this.mapResourceToWorkingCopies.set(
        workingCopy.resource,
        workingCopiesForResource
      );
    }
    workingCopiesForResource.set(workingCopy.typeId, workingCopy);
    const disposables = new DisposableStore();
    disposables.add(
      workingCopy.onDidChangeContent(
        () => this._onDidChangeContent.fire(workingCopy)
      )
    );
    disposables.add(
      workingCopy.onDidChangeDirty(
        () => this._onDidChangeDirty.fire(workingCopy)
      )
    );
    disposables.add(
      workingCopy.onDidSave(
        (e) => this._onDidSave.fire({ workingCopy, ...e })
      )
    );
    this.mapWorkingCopyToListeners.set(workingCopy, disposables);
    this._onDidRegister.fire(workingCopy);
    if (workingCopy.isDirty()) {
      this._onDidChangeDirty.fire(workingCopy);
    }
    return toDisposable(() => {
      this.unregisterWorkingCopy(workingCopy);
      this._onDidUnregister.fire(workingCopy);
    });
  }
  unregisterWorkingCopy(workingCopy) {
    this._workingCopies.delete(workingCopy);
    const workingCopiesForResource = this.mapResourceToWorkingCopies.get(
      workingCopy.resource
    );
    if (workingCopiesForResource?.delete(workingCopy.typeId) && workingCopiesForResource.size === 0) {
      this.mapResourceToWorkingCopies.delete(workingCopy.resource);
    }
    if (workingCopy.isDirty()) {
      this._onDidChangeDirty.fire(workingCopy);
    }
    this.mapWorkingCopyToListeners.deleteAndDispose(workingCopy);
  }
  has(resourceOrIdentifier) {
    if (URI.isUri(resourceOrIdentifier)) {
      return this.mapResourceToWorkingCopies.has(resourceOrIdentifier);
    }
    return this.mapResourceToWorkingCopies.get(resourceOrIdentifier.resource)?.has(resourceOrIdentifier.typeId) ?? false;
  }
  get(identifier) {
    return this.mapResourceToWorkingCopies.get(identifier.resource)?.get(identifier.typeId);
  }
  getAll(resource) {
    const workingCopies = this.mapResourceToWorkingCopies.get(resource);
    if (!workingCopies) {
      return void 0;
    }
    return Array.from(workingCopies.values());
  }
  //#endregion
  //#region Dirty Tracking
  get hasDirty() {
    for (const workingCopy of this._workingCopies) {
      if (workingCopy.isDirty()) {
        return true;
      }
    }
    return false;
  }
  get dirtyCount() {
    let totalDirtyCount = 0;
    for (const workingCopy of this._workingCopies) {
      if (workingCopy.isDirty()) {
        totalDirtyCount++;
      }
    }
    return totalDirtyCount;
  }
  get dirtyWorkingCopies() {
    return this.workingCopies.filter(
      (workingCopy) => workingCopy.isDirty()
    );
  }
  get modifiedCount() {
    let totalModifiedCount = 0;
    for (const workingCopy of this._workingCopies) {
      if (workingCopy.isModified()) {
        totalModifiedCount++;
      }
    }
    return totalModifiedCount;
  }
  get modifiedWorkingCopies() {
    return this.workingCopies.filter(
      (workingCopy) => workingCopy.isModified()
    );
  }
  isDirty(resource, typeId) {
    const workingCopies = this.mapResourceToWorkingCopies.get(resource);
    if (workingCopies) {
      if (typeof typeId === "string") {
        return workingCopies.get(typeId)?.isDirty() ?? false;
      } else {
        for (const [, workingCopy] of workingCopies) {
          if (workingCopy.isDirty()) {
            return true;
          }
        }
      }
    }
    return false;
  }
  //#endregion
}
registerSingleton(
  IWorkingCopyService,
  WorkingCopyService,
  InstantiationType.Delayed
);
export {
  IWorkingCopyService,
  WorkingCopyService
};
