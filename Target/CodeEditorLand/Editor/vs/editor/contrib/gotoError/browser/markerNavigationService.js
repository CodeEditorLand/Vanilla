var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { binarySearch } from "../../../../base/common/arrays.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { DisposableStore, IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { LinkedList } from "../../../../base/common/linkedList.js";
import { compare } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { ITextModel } from "../../../common/model.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { IMarker, IMarkerService, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
class MarkerCoordinate {
  constructor(marker, index, total) {
    this.marker = marker;
    this.index = index;
    this.total = total;
  }
  static {
    __name(this, "MarkerCoordinate");
  }
}
let MarkerList = class {
  constructor(resourceFilter, _markerService, _configService) {
    this._markerService = _markerService;
    this._configService = _configService;
    if (URI.isUri(resourceFilter)) {
      this._resourceFilter = (uri) => uri.toString() === resourceFilter.toString();
    } else if (resourceFilter) {
      this._resourceFilter = resourceFilter;
    }
    const compareOrder = this._configService.getValue("problems.sortOrder");
    const compareMarker = /* @__PURE__ */ __name((a, b) => {
      let res = compare(a.resource.toString(), b.resource.toString());
      if (res === 0) {
        if (compareOrder === "position") {
          res = Range.compareRangesUsingStarts(a, b) || MarkerSeverity.compare(a.severity, b.severity);
        } else {
          res = MarkerSeverity.compare(a.severity, b.severity) || Range.compareRangesUsingStarts(a, b);
        }
      }
      return res;
    }, "compareMarker");
    const updateMarker = /* @__PURE__ */ __name(() => {
      this._markers = this._markerService.read({
        resource: URI.isUri(resourceFilter) ? resourceFilter : void 0,
        severities: MarkerSeverity.Error | MarkerSeverity.Warning | MarkerSeverity.Info
      });
      if (typeof resourceFilter === "function") {
        this._markers = this._markers.filter((m) => this._resourceFilter(m.resource));
      }
      this._markers.sort(compareMarker);
    }, "updateMarker");
    updateMarker();
    this._dispoables.add(_markerService.onMarkerChanged((uris) => {
      if (!this._resourceFilter || uris.some((uri) => this._resourceFilter(uri))) {
        updateMarker();
        this._nextIdx = -1;
        this._onDidChange.fire();
      }
    }));
  }
  static {
    __name(this, "MarkerList");
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _resourceFilter;
  _dispoables = new DisposableStore();
  _markers = [];
  _nextIdx = -1;
  dispose() {
    this._dispoables.dispose();
    this._onDidChange.dispose();
  }
  matches(uri) {
    if (!this._resourceFilter && !uri) {
      return true;
    }
    if (!this._resourceFilter || !uri) {
      return false;
    }
    return this._resourceFilter(uri);
  }
  get selected() {
    const marker = this._markers[this._nextIdx];
    return marker && new MarkerCoordinate(marker, this._nextIdx + 1, this._markers.length);
  }
  _initIdx(model, position, fwd) {
    let found = false;
    let idx = this._markers.findIndex((marker) => marker.resource.toString() === model.uri.toString());
    if (idx < 0) {
      idx = binarySearch(this._markers, { resource: model.uri }, (a, b) => compare(a.resource.toString(), b.resource.toString()));
      if (idx < 0) {
        idx = ~idx;
      }
    }
    for (let i = idx; i < this._markers.length; i++) {
      let range = Range.lift(this._markers[i]);
      if (range.isEmpty()) {
        const word = model.getWordAtPosition(range.getStartPosition());
        if (word) {
          range = new Range(range.startLineNumber, word.startColumn, range.startLineNumber, word.endColumn);
        }
      }
      if (position && (range.containsPosition(position) || position.isBeforeOrEqual(range.getStartPosition()))) {
        this._nextIdx = i;
        found = true;
        break;
      }
      if (this._markers[i].resource.toString() !== model.uri.toString()) {
        break;
      }
    }
    if (!found) {
      this._nextIdx = fwd ? 0 : this._markers.length - 1;
    }
    if (this._nextIdx < 0) {
      this._nextIdx = this._markers.length - 1;
    }
  }
  resetIndex() {
    this._nextIdx = -1;
  }
  move(fwd, model, position) {
    if (this._markers.length === 0) {
      return false;
    }
    const oldIdx = this._nextIdx;
    if (this._nextIdx === -1) {
      this._initIdx(model, position, fwd);
    } else if (fwd) {
      this._nextIdx = (this._nextIdx + 1) % this._markers.length;
    } else if (!fwd) {
      this._nextIdx = (this._nextIdx - 1 + this._markers.length) % this._markers.length;
    }
    if (oldIdx !== this._nextIdx) {
      return true;
    }
    return false;
  }
  find(uri, position) {
    let idx = this._markers.findIndex((marker) => marker.resource.toString() === uri.toString());
    if (idx < 0) {
      return void 0;
    }
    for (; idx < this._markers.length; idx++) {
      if (Range.containsPosition(this._markers[idx], position)) {
        return new MarkerCoordinate(this._markers[idx], idx + 1, this._markers.length);
      }
    }
    return void 0;
  }
};
MarkerList = __decorateClass([
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IConfigurationService)
], MarkerList);
const IMarkerNavigationService = createDecorator("IMarkerNavigationService");
let MarkerNavigationService = class {
  constructor(_markerService, _configService) {
    this._markerService = _markerService;
    this._configService = _configService;
  }
  static {
    __name(this, "MarkerNavigationService");
  }
  _serviceBrand;
  _provider = new LinkedList();
  registerProvider(provider) {
    const remove = this._provider.unshift(provider);
    return toDisposable(() => remove());
  }
  getMarkerList(resource) {
    for (const provider of this._provider) {
      const result = provider.getMarkerList(resource);
      if (result) {
        return result;
      }
    }
    return new MarkerList(resource, this._markerService, this._configService);
  }
};
MarkerNavigationService = __decorateClass([
  __decorateParam(0, IMarkerService),
  __decorateParam(1, IConfigurationService)
], MarkerNavigationService);
registerSingleton(IMarkerNavigationService, MarkerNavigationService, InstantiationType.Delayed);
export {
  IMarkerNavigationService,
  MarkerCoordinate,
  MarkerList
};
//# sourceMappingURL=markerNavigationService.js.map
