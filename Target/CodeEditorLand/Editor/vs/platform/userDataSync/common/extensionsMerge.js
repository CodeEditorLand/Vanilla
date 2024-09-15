var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepClone, equals } from "../../../base/common/objects.js";
import * as semver from "../../../base/common/semver/semver.js";
import { assertIsDefined } from "../../../base/common/types.js";
function merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, lastSyncBuiltinExtensions) {
  const added = [];
  const removed = [];
  const updated = [];
  if (!remoteExtensions) {
    const remote2 = localExtensions.filter(
      ({ identifier }) => ignoredExtensions.every(
        (id) => id.toLowerCase() !== identifier.id.toLowerCase()
      )
    );
    return {
      local: {
        added,
        removed,
        updated
      },
      remote: remote2.length > 0 ? {
        added: remote2,
        updated: [],
        removed: [],
        all: remote2
      } : null
    };
  }
  localExtensions = localExtensions.map(
    massageIncomingExtension
  );
  remoteExtensions = remoteExtensions.map(massageIncomingExtension);
  lastSyncExtensions = lastSyncExtensions ? lastSyncExtensions.map(massageIncomingExtension) : null;
  const uuids = /* @__PURE__ */ new Map();
  const addUUID = /* @__PURE__ */ __name((identifier) => {
    if (identifier.uuid) {
      uuids.set(identifier.id.toLowerCase(), identifier.uuid);
    }
  }, "addUUID");
  localExtensions.forEach(({ identifier }) => addUUID(identifier));
  remoteExtensions.forEach(({ identifier }) => addUUID(identifier));
  lastSyncExtensions?.forEach(({ identifier }) => addUUID(identifier));
  skippedExtensions?.forEach(({ identifier }) => addUUID(identifier));
  lastSyncBuiltinExtensions?.forEach((identifier) => addUUID(identifier));
  const getKey = /* @__PURE__ */ __name((extension) => {
    const uuid = extension.identifier.uuid || uuids.get(extension.identifier.id.toLowerCase());
    return uuid ? `uuid:${uuid}` : `id:${extension.identifier.id.toLowerCase()}`;
  }, "getKey");
  const addExtensionToMap = /* @__PURE__ */ __name((map, extension) => {
    map.set(getKey(extension), extension);
    return map;
  }, "addExtensionToMap");
  const localExtensionsMap = localExtensions.reduce(
    addExtensionToMap,
    /* @__PURE__ */ new Map()
  );
  const remoteExtensionsMap = remoteExtensions.reduce(
    addExtensionToMap,
    /* @__PURE__ */ new Map()
  );
  const newRemoteExtensionsMap = remoteExtensions.reduce(
    (map, extension) => addExtensionToMap(map, deepClone(extension)),
    /* @__PURE__ */ new Map()
  );
  const lastSyncExtensionsMap = lastSyncExtensions ? lastSyncExtensions.reduce(
    addExtensionToMap,
    /* @__PURE__ */ new Map()
  ) : null;
  const skippedExtensionsMap = skippedExtensions.reduce(
    addExtensionToMap,
    /* @__PURE__ */ new Map()
  );
  const ignoredExtensionsSet = ignoredExtensions.reduce((set, id) => {
    const uuid = uuids.get(id.toLowerCase());
    return set.add(uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`);
  }, /* @__PURE__ */ new Set());
  const lastSyncBuiltinExtensionsSet = lastSyncBuiltinExtensions ? lastSyncBuiltinExtensions.reduce((set, { id, uuid }) => {
    uuid = uuid ?? uuids.get(id.toLowerCase());
    return set.add(
      uuid ? `uuid:${uuid}` : `id:${id.toLowerCase()}`
    );
  }, /* @__PURE__ */ new Set()) : null;
  const localToRemote = compare(
    localExtensionsMap,
    remoteExtensionsMap,
    ignoredExtensionsSet,
    false
  );
  if (localToRemote.added.size > 0 || localToRemote.removed.size > 0 || localToRemote.updated.size > 0) {
    const baseToLocal = compare(
      lastSyncExtensionsMap,
      localExtensionsMap,
      ignoredExtensionsSet,
      false
    );
    const baseToRemote = compare(
      lastSyncExtensionsMap,
      remoteExtensionsMap,
      ignoredExtensionsSet,
      true
    );
    const merge2 = /* @__PURE__ */ __name((key, localExtension, remoteExtension, preferred) => {
      let pinned, version, preRelease;
      if (localExtension.installed) {
        pinned = preferred.pinned;
        preRelease = preferred.preRelease;
        if (pinned) {
          version = preferred.version;
        }
      } else {
        pinned = remoteExtension.pinned;
        preRelease = remoteExtension.preRelease;
        if (pinned) {
          version = remoteExtension.version;
        }
      }
      if (pinned === void 0) {
        pinned = localExtension.pinned;
        if (pinned) {
          version = localExtension.version;
        }
      }
      if (preRelease === void 0) {
        preRelease = localExtension.preRelease;
      }
      return {
        ...preferred,
        installed: localExtension.installed || remoteExtension.installed,
        pinned,
        preRelease,
        version: version ?? (remoteExtension.version && (!localExtension.installed || semver.gt(
          remoteExtension.version,
          localExtension.version
        )) ? remoteExtension.version : localExtension.version),
        state: mergeExtensionState(
          localExtension,
          remoteExtension,
          lastSyncExtensionsMap?.get(key)
        )
      };
    }, "merge");
    for (const key of baseToRemote.removed.values()) {
      const localExtension = localExtensionsMap.get(key);
      if (!localExtension) {
        continue;
      }
      const baseExtension = assertIsDefined(
        lastSyncExtensionsMap?.get(key)
      );
      const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
      if (localExtension.installed && wasAnInstalledExtensionDuringLastSync) {
        removed.push(localExtension.identifier);
      } else {
        newRemoteExtensionsMap.set(key, localExtension);
      }
    }
    for (const key of baseToRemote.added.values()) {
      const remoteExtension = assertIsDefined(
        remoteExtensionsMap.get(key)
      );
      const localExtension = localExtensionsMap.get(key);
      if (localExtension) {
        if (localToRemote.updated.has(key)) {
          const mergedExtension = merge2(
            key,
            localExtension,
            remoteExtension,
            remoteExtension
          );
          if (!areSame(localExtension, remoteExtension, false, false)) {
            updated.push(
              massageOutgoingExtension(mergedExtension, key)
            );
          }
          newRemoteExtensionsMap.set(key, mergedExtension);
        }
      } else {
        if (remoteExtension.installed) {
          added.push(massageOutgoingExtension(remoteExtension, key));
        }
      }
    }
    for (const key of baseToRemote.updated.values()) {
      const remoteExtension = assertIsDefined(
        remoteExtensionsMap.get(key)
      );
      const baseExtension = assertIsDefined(
        lastSyncExtensionsMap?.get(key)
      );
      const localExtension = localExtensionsMap.get(key);
      if (localExtension) {
        const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
        if (wasAnInstalledExtensionDuringLastSync && localExtension.installed && !remoteExtension.installed) {
          removed.push(localExtension.identifier);
        } else {
          const mergedExtension = merge2(
            key,
            localExtension,
            remoteExtension,
            remoteExtension
          );
          updated.push(
            massageOutgoingExtension(mergedExtension, key)
          );
          newRemoteExtensionsMap.set(key, mergedExtension);
        }
      } else if (remoteExtension.installed) {
        added.push(massageOutgoingExtension(remoteExtension, key));
      }
    }
    for (const key of baseToLocal.added.values()) {
      if (baseToRemote.added.has(key)) {
        continue;
      }
      newRemoteExtensionsMap.set(
        key,
        assertIsDefined(localExtensionsMap.get(key))
      );
    }
    for (const key of baseToLocal.updated.values()) {
      if (baseToRemote.removed.has(key)) {
        continue;
      }
      if (baseToRemote.updated.has(key)) {
        continue;
      }
      const localExtension = assertIsDefined(localExtensionsMap.get(key));
      const remoteExtension = assertIsDefined(
        remoteExtensionsMap.get(key)
      );
      newRemoteExtensionsMap.set(
        key,
        merge2(key, localExtension, remoteExtension, localExtension)
      );
    }
    for (const key of baseToLocal.removed.values()) {
      if (baseToRemote.updated.has(key)) {
        continue;
      }
      if (baseToRemote.removed.has(key)) {
        continue;
      }
      if (skippedExtensionsMap.has(key)) {
        continue;
      }
      if (!assertIsDefined(remoteExtensionsMap.get(key)).installed) {
        continue;
      }
      if (!lastSyncBuiltinExtensionsSet) {
        continue;
      }
      if (lastSyncBuiltinExtensionsSet.has(key) || !assertIsDefined(lastSyncExtensionsMap?.get(key)).installed) {
        continue;
      }
      newRemoteExtensionsMap.delete(key);
    }
  }
  const remote = [];
  const remoteChanges = compare(
    remoteExtensionsMap,
    newRemoteExtensionsMap,
    /* @__PURE__ */ new Set(),
    true
  );
  const hasRemoteChanges = remoteChanges.added.size > 0 || remoteChanges.updated.size > 0 || remoteChanges.removed.size > 0;
  if (hasRemoteChanges) {
    newRemoteExtensionsMap.forEach(
      (value, key) => remote.push(massageOutgoingExtension(value, key))
    );
  }
  return {
    local: { added, removed, updated },
    remote: hasRemoteChanges ? {
      added: [...remoteChanges.added].map(
        (id) => newRemoteExtensionsMap.get(id)
      ),
      updated: [...remoteChanges.updated].map(
        (id) => newRemoteExtensionsMap.get(id)
      ),
      removed: [...remoteChanges.removed].map(
        (id) => remoteExtensionsMap.get(id)
      ),
      all: remote
    } : null
  };
}
__name(merge, "merge");
function compare(from, to, ignoredExtensions, checkVersionProperty) {
  const fromKeys = from ? [...from.keys()].filter((key) => !ignoredExtensions.has(key)) : [];
  const toKeys = [...to.keys()].filter((key) => !ignoredExtensions.has(key));
  const added = toKeys.filter((key) => !fromKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const removed = fromKeys.filter((key) => !toKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const updated = /* @__PURE__ */ new Set();
  for (const key of fromKeys) {
    if (removed.has(key)) {
      continue;
    }
    const fromExtension = from.get(key);
    const toExtension = to.get(key);
    if (!toExtension || !areSame(fromExtension, toExtension, checkVersionProperty, true)) {
      updated.add(key);
    }
  }
  return { added, removed, updated };
}
__name(compare, "compare");
function areSame(fromExtension, toExtension, checkVersionProperty, checkInstalledProperty) {
  if (fromExtension.disabled !== toExtension.disabled) {
    return false;
  }
  if (!!fromExtension.isApplicationScoped !== !!toExtension.isApplicationScoped) {
    return false;
  }
  if (checkInstalledProperty && fromExtension.installed !== toExtension.installed) {
    return false;
  }
  if (fromExtension.installed && toExtension.installed) {
    if (fromExtension.preRelease !== toExtension.preRelease) {
      return false;
    }
    if (fromExtension.pinned !== toExtension.pinned) {
      return false;
    }
    if (toExtension.pinned && fromExtension.version !== toExtension.version) {
      return false;
    }
  }
  if (!isSameExtensionState(fromExtension.state, toExtension.state)) {
    return false;
  }
  if (checkVersionProperty && fromExtension.version !== toExtension.version) {
    return false;
  }
  return true;
}
__name(areSame, "areSame");
function mergeExtensionState(localExtension, remoteExtension, lastSyncExtension) {
  const localState = localExtension.state;
  const remoteState = remoteExtension.state;
  const baseState = lastSyncExtension?.state;
  if (!remoteExtension.version) {
    return localState;
  }
  if (localState && semver.gt(localExtension.version, remoteExtension.version)) {
    return localState;
  }
  if (remoteState && semver.gt(remoteExtension.version, localExtension.version)) {
    return remoteState;
  }
  if (!localState) {
    return remoteState;
  }
  if (!remoteState) {
    return localState;
  }
  const mergedState = deepClone(localState);
  const baseToRemote = baseState ? compareExtensionState(baseState, remoteState) : {
    added: Object.keys(remoteState).reduce((r, k) => {
      r.add(k);
      return r;
    }, /* @__PURE__ */ new Set()),
    removed: /* @__PURE__ */ new Set(),
    updated: /* @__PURE__ */ new Set()
  };
  const baseToLocal = baseState ? compareExtensionState(baseState, localState) : {
    added: Object.keys(localState).reduce((r, k) => {
      r.add(k);
      return r;
    }, /* @__PURE__ */ new Set()),
    removed: /* @__PURE__ */ new Set(),
    updated: /* @__PURE__ */ new Set()
  };
  for (const key of [
    ...baseToRemote.added.values(),
    ...baseToRemote.updated.values()
  ]) {
    mergedState[key] = remoteState[key];
  }
  for (const key of baseToRemote.removed.values()) {
    if (!baseToLocal.updated.has(key)) {
      delete mergedState[key];
    }
  }
  return mergedState;
}
__name(mergeExtensionState, "mergeExtensionState");
function compareExtensionState(from, to) {
  const fromKeys = Object.keys(from);
  const toKeys = Object.keys(to);
  const added = toKeys.filter((key) => !fromKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const removed = fromKeys.filter((key) => !toKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const updated = /* @__PURE__ */ new Set();
  for (const key of fromKeys) {
    if (removed.has(key)) {
      continue;
    }
    const value1 = from[key];
    const value2 = to[key];
    if (!equals(value1, value2)) {
      updated.add(key);
    }
  }
  return { added, removed, updated };
}
__name(compareExtensionState, "compareExtensionState");
function isSameExtensionState(a = {}, b = {}) {
  const { added, removed, updated } = compareExtensionState(a, b);
  return added.size === 0 && removed.size === 0 && updated.size === 0;
}
__name(isSameExtensionState, "isSameExtensionState");
function massageIncomingExtension(extension) {
  return {
    ...extension,
    ...{ disabled: !!extension.disabled, installed: !!extension.installed }
  };
}
__name(massageIncomingExtension, "massageIncomingExtension");
function massageOutgoingExtension(extension, key) {
  const massagedExtension = {
    ...extension,
    identifier: {
      id: extension.identifier.id,
      uuid: key.startsWith("uuid:") ? key.substring("uuid:".length) : void 0
    },
    /* set following always so that to differentiate with older clients */
    preRelease: !!extension.preRelease,
    pinned: !!extension.pinned
  };
  if (!extension.disabled) {
    delete massagedExtension.disabled;
  }
  if (!extension.installed) {
    delete massagedExtension.installed;
  }
  if (!extension.state) {
    delete massagedExtension.state;
  }
  if (!extension.isApplicationScoped) {
    delete massagedExtension.isApplicationScoped;
  }
  return massagedExtension;
}
__name(massageOutgoingExtension, "massageOutgoingExtension");
export {
  merge
};
//# sourceMappingURL=extensionsMerge.js.map
