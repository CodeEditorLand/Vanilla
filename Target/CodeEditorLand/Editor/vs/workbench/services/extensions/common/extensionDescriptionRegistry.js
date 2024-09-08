import { promiseWithResolvers } from "../../../../base/common/async.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import * as path from "../../../../base/common/path.js";
import {
  ExtensionIdentifier,
  ExtensionIdentifierMap,
  ExtensionIdentifierSet
} from "../../../../platform/extensions/common/extensions.js";
class DeltaExtensionsResult {
  constructor(versionId, removedDueToLooping) {
    this.versionId = versionId;
    this.removedDueToLooping = removedDueToLooping;
  }
}
class ExtensionDescriptionRegistry {
  constructor(_activationEventsReader, extensionDescriptions) {
    this._activationEventsReader = _activationEventsReader;
    this._extensionDescriptions = extensionDescriptions;
    this._initialize();
  }
  static isHostExtension(extensionId, myRegistry, globalRegistry) {
    if (myRegistry.getExtensionDescription(extensionId)) {
      return false;
    }
    const extensionDescription = globalRegistry.getExtensionDescription(extensionId);
    if (!extensionDescription) {
      return false;
    }
    if ((extensionDescription.main || extensionDescription.browser) && extensionDescription.api === "none") {
      return true;
    }
    return false;
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _versionId = 0;
  _extensionDescriptions;
  _extensionsMap;
  _extensionsArr;
  _activationMap;
  _initialize() {
    this._extensionDescriptions.sort(extensionCmp);
    this._extensionsMap = new ExtensionIdentifierMap();
    this._extensionsArr = [];
    this._activationMap = /* @__PURE__ */ new Map();
    for (const extensionDescription of this._extensionDescriptions) {
      if (this._extensionsMap.has(extensionDescription.identifier)) {
        console.error(
          "Extension `" + extensionDescription.identifier.value + "` is already registered"
        );
        continue;
      }
      this._extensionsMap.set(
        extensionDescription.identifier,
        extensionDescription
      );
      this._extensionsArr.push(extensionDescription);
      const activationEvents = this._activationEventsReader.readActivationEvents(
        extensionDescription
      );
      for (const activationEvent of activationEvents) {
        if (!this._activationMap.has(activationEvent)) {
          this._activationMap.set(activationEvent, []);
        }
        this._activationMap.get(activationEvent).push(extensionDescription);
      }
    }
  }
  set(extensionDescriptions) {
    this._extensionDescriptions = extensionDescriptions;
    this._initialize();
    this._versionId++;
    this._onDidChange.fire(void 0);
    return {
      versionId: this._versionId
    };
  }
  deltaExtensions(toAdd, toRemove) {
    this._extensionDescriptions = removeExtensions(
      this._extensionDescriptions,
      toRemove
    );
    this._extensionDescriptions = this._extensionDescriptions.concat(toAdd);
    const looping = ExtensionDescriptionRegistry._findLoopingExtensions(
      this._extensionDescriptions
    );
    this._extensionDescriptions = removeExtensions(
      this._extensionDescriptions,
      looping.map((ext) => ext.identifier)
    );
    this._initialize();
    this._versionId++;
    this._onDidChange.fire(void 0);
    return new DeltaExtensionsResult(this._versionId, looping);
  }
  static _findLoopingExtensions(extensionDescriptions) {
    const G = new class {
      _arcs = /* @__PURE__ */ new Map();
      _nodesSet = /* @__PURE__ */ new Set();
      _nodesArr = [];
      addNode(id) {
        if (!this._nodesSet.has(id)) {
          this._nodesSet.add(id);
          this._nodesArr.push(id);
        }
      }
      addArc(from, to) {
        this.addNode(from);
        this.addNode(to);
        if (this._arcs.has(from)) {
          this._arcs.get(from).push(to);
        } else {
          this._arcs.set(from, [to]);
        }
      }
      getArcs(id) {
        if (this._arcs.has(id)) {
          return this._arcs.get(id);
        }
        return [];
      }
      hasOnlyGoodArcs(id, good2) {
        const dependencies = G.getArcs(id);
        for (let i = 0; i < dependencies.length; i++) {
          if (!good2.has(dependencies[i])) {
            return false;
          }
        }
        return true;
      }
      getNodes() {
        return this._nodesArr;
      }
    }();
    const descs = new ExtensionIdentifierMap();
    for (const extensionDescription of extensionDescriptions) {
      descs.set(extensionDescription.identifier, extensionDescription);
      if (extensionDescription.extensionDependencies) {
        for (const depId of extensionDescription.extensionDependencies) {
          G.addArc(
            ExtensionIdentifier.toKey(
              extensionDescription.identifier
            ),
            ExtensionIdentifier.toKey(depId)
          );
        }
      }
    }
    const good = /* @__PURE__ */ new Set();
    G.getNodes().filter((id) => G.getArcs(id).length === 0).forEach((id) => good.add(id));
    const nodes = G.getNodes().filter((id) => !good.has(id));
    let madeProgress;
    do {
      madeProgress = false;
      for (let i = 0; i < nodes.length; i++) {
        const id = nodes[i];
        if (G.hasOnlyGoodArcs(id, good)) {
          nodes.splice(i, 1);
          i--;
          good.add(id);
          madeProgress = true;
        }
      }
    } while (madeProgress);
    return nodes.map((id) => descs.get(id));
  }
  containsActivationEvent(activationEvent) {
    return this._activationMap.has(activationEvent);
  }
  containsExtension(extensionId) {
    return this._extensionsMap.has(extensionId);
  }
  getExtensionDescriptionsForActivationEvent(activationEvent) {
    const extensions = this._activationMap.get(activationEvent);
    return extensions ? extensions.slice(0) : [];
  }
  getAllExtensionDescriptions() {
    return this._extensionsArr.slice(0);
  }
  getSnapshot() {
    return new ExtensionDescriptionRegistrySnapshot(
      this._versionId,
      this.getAllExtensionDescriptions()
    );
  }
  getExtensionDescription(extensionId) {
    const extension = this._extensionsMap.get(extensionId);
    return extension ? extension : void 0;
  }
  getExtensionDescriptionByUUID(uuid) {
    for (const extensionDescription of this._extensionsArr) {
      if (extensionDescription.uuid === uuid) {
        return extensionDescription;
      }
    }
    return void 0;
  }
  getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
    return this.getExtensionDescription(extensionId) ?? (uuid ? this.getExtensionDescriptionByUUID(uuid) : void 0);
  }
}
class ExtensionDescriptionRegistrySnapshot {
  constructor(versionId, extensions) {
    this.versionId = versionId;
    this.extensions = extensions;
  }
}
class LockableExtensionDescriptionRegistry {
  _actual;
  _lock = new Lock();
  constructor(activationEventsReader) {
    this._actual = new ExtensionDescriptionRegistry(
      activationEventsReader,
      []
    );
  }
  async acquireLock(customerName) {
    const lock = await this._lock.acquire(customerName);
    return new ExtensionDescriptionRegistryLock(this, lock);
  }
  deltaExtensions(acquiredLock, toAdd, toRemove) {
    if (!acquiredLock.isAcquiredFor(this)) {
      throw new Error("Lock is not held");
    }
    return this._actual.deltaExtensions(toAdd, toRemove);
  }
  containsActivationEvent(activationEvent) {
    return this._actual.containsActivationEvent(activationEvent);
  }
  containsExtension(extensionId) {
    return this._actual.containsExtension(extensionId);
  }
  getExtensionDescriptionsForActivationEvent(activationEvent) {
    return this._actual.getExtensionDescriptionsForActivationEvent(
      activationEvent
    );
  }
  getAllExtensionDescriptions() {
    return this._actual.getAllExtensionDescriptions();
  }
  getSnapshot() {
    return this._actual.getSnapshot();
  }
  getExtensionDescription(extensionId) {
    return this._actual.getExtensionDescription(extensionId);
  }
  getExtensionDescriptionByUUID(uuid) {
    return this._actual.getExtensionDescriptionByUUID(uuid);
  }
  getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
    return this._actual.getExtensionDescriptionByIdOrUUID(
      extensionId,
      uuid
    );
  }
}
class ExtensionDescriptionRegistryLock extends Disposable {
  constructor(_registry, lock) {
    super();
    this._registry = _registry;
    this._register(lock);
  }
  _isDisposed = false;
  isAcquiredFor(registry) {
    return !this._isDisposed && this._registry === registry;
  }
}
class LockCustomer {
  constructor(name) {
    this.name = name;
    const withResolvers = promiseWithResolvers();
    this.promise = withResolvers.promise;
    this._resolve = withResolvers.resolve;
  }
  promise;
  _resolve;
  resolve(value) {
    this._resolve(value);
  }
}
class Lock {
  _pendingCustomers = [];
  _isLocked = false;
  async acquire(customerName) {
    const customer = new LockCustomer(customerName);
    this._pendingCustomers.push(customer);
    this._advance();
    return customer.promise;
  }
  _advance() {
    if (this._isLocked) {
      return;
    }
    if (this._pendingCustomers.length === 0) {
      return;
    }
    const customer = this._pendingCustomers.shift();
    this._isLocked = true;
    let customerHoldsLock = true;
    const logLongRunningCustomerTimeout = setTimeout(
      () => {
        if (customerHoldsLock) {
          console.warn(
            `The customer named ${customer.name} has been holding on to the lock for 30s. This might be a problem.`
          );
        }
      },
      30 * 1e3
      /* 30 seconds */
    );
    const releaseLock = () => {
      if (!customerHoldsLock) {
        return;
      }
      clearTimeout(logLongRunningCustomerTimeout);
      customerHoldsLock = false;
      this._isLocked = false;
      this._advance();
    };
    customer.resolve(toDisposable(releaseLock));
  }
}
var SortBucket = /* @__PURE__ */ ((SortBucket2) => {
  SortBucket2[SortBucket2["Builtin"] = 0] = "Builtin";
  SortBucket2[SortBucket2["User"] = 1] = "User";
  SortBucket2[SortBucket2["Dev"] = 2] = "Dev";
  return SortBucket2;
})(SortBucket || {});
function extensionCmp(a, b) {
  const aSortBucket = a.isBuiltin ? 0 /* Builtin */ : a.isUnderDevelopment ? 2 /* Dev */ : 1 /* User */;
  const bSortBucket = b.isBuiltin ? 0 /* Builtin */ : b.isUnderDevelopment ? 2 /* Dev */ : 1 /* User */;
  if (aSortBucket !== bSortBucket) {
    return aSortBucket - bSortBucket;
  }
  const aLastSegment = path.posix.basename(a.extensionLocation.path);
  const bLastSegment = path.posix.basename(b.extensionLocation.path);
  if (aLastSegment < bLastSegment) {
    return -1;
  }
  if (aLastSegment > bLastSegment) {
    return 1;
  }
  return 0;
}
function removeExtensions(arr, toRemove) {
  const toRemoveSet = new ExtensionIdentifierSet(toRemove);
  return arr.filter((extension) => !toRemoveSet.has(extension.identifier));
}
export {
  DeltaExtensionsResult,
  ExtensionDescriptionRegistry,
  ExtensionDescriptionRegistryLock,
  ExtensionDescriptionRegistrySnapshot,
  LockableExtensionDescriptionRegistry
};
