var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  isFalsyOrEmpty,
  isNonEmptyArray
} from "../../../base/common/arrays.js";
import { DebounceEmitter } from "../../../base/common/event.js";
import { Iterable } from "../../../base/common/iterator.js";
import { ResourceMap } from "../../../base/common/map.js";
import { Schemas } from "../../../base/common/network.js";
import { URI } from "../../../base/common/uri.js";
import {
  MarkerSeverity
} from "./markers.js";
const unsupportedSchemas = /* @__PURE__ */ new Set([
  Schemas.inMemory,
  Schemas.vscodeSourceControl,
  Schemas.walkThrough,
  Schemas.walkThroughSnippet,
  Schemas.vscodeChatCodeBlock
]);
class DoubleResourceMap {
  static {
    __name(this, "DoubleResourceMap");
  }
  _byResource = new ResourceMap();
  _byOwner = /* @__PURE__ */ new Map();
  set(resource, owner, value) {
    let ownerMap = this._byResource.get(resource);
    if (!ownerMap) {
      ownerMap = /* @__PURE__ */ new Map();
      this._byResource.set(resource, ownerMap);
    }
    ownerMap.set(owner, value);
    let resourceMap = this._byOwner.get(owner);
    if (!resourceMap) {
      resourceMap = new ResourceMap();
      this._byOwner.set(owner, resourceMap);
    }
    resourceMap.set(resource, value);
  }
  get(resource, owner) {
    const ownerMap = this._byResource.get(resource);
    return ownerMap?.get(owner);
  }
  delete(resource, owner) {
    let removedA = false;
    let removedB = false;
    const ownerMap = this._byResource.get(resource);
    if (ownerMap) {
      removedA = ownerMap.delete(owner);
    }
    const resourceMap = this._byOwner.get(owner);
    if (resourceMap) {
      removedB = resourceMap.delete(resource);
    }
    if (removedA !== removedB) {
      throw new Error("illegal state");
    }
    return removedA && removedB;
  }
  values(key) {
    if (typeof key === "string") {
      return this._byOwner.get(key)?.values() ?? Iterable.empty();
    }
    if (URI.isUri(key)) {
      return this._byResource.get(key)?.values() ?? Iterable.empty();
    }
    return Iterable.map(
      Iterable.concat(...this._byOwner.values()),
      (map) => map[1]
    );
  }
}
class MarkerStats {
  static {
    __name(this, "MarkerStats");
  }
  errors = 0;
  infos = 0;
  warnings = 0;
  unknowns = 0;
  _data = new ResourceMap();
  _service;
  _subscription;
  constructor(service) {
    this._service = service;
    this._subscription = service.onMarkerChanged(this._update, this);
  }
  dispose() {
    this._subscription.dispose();
  }
  _update(resources) {
    for (const resource of resources) {
      const oldStats = this._data.get(resource);
      if (oldStats) {
        this._substract(oldStats);
      }
      const newStats = this._resourceStats(resource);
      this._add(newStats);
      this._data.set(resource, newStats);
    }
  }
  _resourceStats(resource) {
    const result = {
      errors: 0,
      warnings: 0,
      infos: 0,
      unknowns: 0
    };
    if (unsupportedSchemas.has(resource.scheme)) {
      return result;
    }
    for (const { severity } of this._service.read({ resource })) {
      if (severity === MarkerSeverity.Error) {
        result.errors += 1;
      } else if (severity === MarkerSeverity.Warning) {
        result.warnings += 1;
      } else if (severity === MarkerSeverity.Info) {
        result.infos += 1;
      } else {
        result.unknowns += 1;
      }
    }
    return result;
  }
  _substract(op) {
    this.errors -= op.errors;
    this.warnings -= op.warnings;
    this.infos -= op.infos;
    this.unknowns -= op.unknowns;
  }
  _add(op) {
    this.errors += op.errors;
    this.warnings += op.warnings;
    this.infos += op.infos;
    this.unknowns += op.unknowns;
  }
}
class MarkerService {
  static {
    __name(this, "MarkerService");
  }
  _onMarkerChanged = new DebounceEmitter({
    delay: 0,
    merge: MarkerService._merge
  });
  onMarkerChanged = this._onMarkerChanged.event;
  _data = new DoubleResourceMap();
  _stats = new MarkerStats(this);
  dispose() {
    this._stats.dispose();
    this._onMarkerChanged.dispose();
  }
  getStatistics() {
    return this._stats;
  }
  remove(owner, resources) {
    for (const resource of resources || []) {
      this.changeOne(owner, resource, []);
    }
  }
  changeOne(owner, resource, markerData) {
    if (isFalsyOrEmpty(markerData)) {
      const removed = this._data.delete(resource, owner);
      if (removed) {
        this._onMarkerChanged.fire([resource]);
      }
    } else {
      const markers = [];
      for (const data of markerData) {
        const marker = MarkerService._toMarker(owner, resource, data);
        if (marker) {
          markers.push(marker);
        }
      }
      this._data.set(resource, owner, markers);
      this._onMarkerChanged.fire([resource]);
    }
  }
  static _toMarker(owner, resource, data) {
    let {
      code,
      severity,
      message,
      source,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      relatedInformation,
      tags
    } = data;
    if (!message) {
      return void 0;
    }
    startLineNumber = startLineNumber > 0 ? startLineNumber : 1;
    startColumn = startColumn > 0 ? startColumn : 1;
    endLineNumber = endLineNumber >= startLineNumber ? endLineNumber : startLineNumber;
    endColumn = endColumn > 0 ? endColumn : startColumn;
    return {
      resource,
      owner,
      code,
      severity,
      message,
      source,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      relatedInformation,
      tags
    };
  }
  changeAll(owner, data) {
    const changes = [];
    const existing = this._data.values(owner);
    if (existing) {
      for (const data2 of existing) {
        const first = Iterable.first(data2);
        if (first) {
          changes.push(first.resource);
          this._data.delete(first.resource, owner);
        }
      }
    }
    if (isNonEmptyArray(data)) {
      const groups = new ResourceMap();
      for (const { resource, marker: markerData } of data) {
        const marker = MarkerService._toMarker(
          owner,
          resource,
          markerData
        );
        if (!marker) {
          continue;
        }
        const array = groups.get(resource);
        if (array) {
          array.push(marker);
        } else {
          groups.set(resource, [marker]);
          changes.push(resource);
        }
      }
      for (const [resource, value] of groups) {
        this._data.set(resource, owner, value);
      }
    }
    if (changes.length > 0) {
      this._onMarkerChanged.fire(changes);
    }
  }
  read(filter = /* @__PURE__ */ Object.create(null)) {
    let { owner, resource, severities, take } = filter;
    if (!take || take < 0) {
      take = -1;
    }
    if (owner && resource) {
      const data = this._data.get(resource, owner);
      if (data) {
        const result = [];
        for (const marker of data) {
          if (MarkerService._accept(marker, severities)) {
            const newLen = result.push(marker);
            if (take > 0 && newLen === take) {
              break;
            }
          }
        }
        return result;
      } else {
        return [];
      }
    } else if (!owner && !resource) {
      const result = [];
      for (const markers of this._data.values()) {
        for (const data of markers) {
          if (MarkerService._accept(data, severities)) {
            const newLen = result.push(data);
            if (take > 0 && newLen === take) {
              return result;
            }
          }
        }
      }
      return result;
    } else {
      const iterable = this._data.values(resource ?? owner);
      const result = [];
      for (const markers of iterable) {
        for (const data of markers) {
          if (MarkerService._accept(data, severities)) {
            const newLen = result.push(data);
            if (take > 0 && newLen === take) {
              return result;
            }
          }
        }
      }
      return result;
    }
  }
  static _accept(marker, severities) {
    return severities === void 0 || (severities & marker.severity) === marker.severity;
  }
  // --- event debounce logic
  static _merge(all) {
    const set = new ResourceMap();
    for (const array of all) {
      for (const item of array) {
        set.set(item, true);
      }
    }
    return Array.from(set.keys());
  }
}
export {
  MarkerService,
  unsupportedSchemas
};
//# sourceMappingURL=markerService.js.map
