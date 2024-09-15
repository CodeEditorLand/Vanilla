var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IStringDictionary, INumberDictionary } from "../../../../base/common/collections.js";
import { URI } from "../../../../base/common/uri.js";
import { Event, Emitter } from "../../../../base/common/event.js";
import { IDisposable, DisposableStore, Disposable } from "../../../../base/common/lifecycle.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILineMatcher, createLineMatcher, ProblemMatcher, IProblemMatch, ApplyToKind, IWatchingPattern, getResource } from "./problemMatcher.js";
import { IMarkerService, IMarkerData, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { isWindows } from "../../../../base/common/platform.js";
var ProblemCollectorEventKind = /* @__PURE__ */ ((ProblemCollectorEventKind2) => {
  ProblemCollectorEventKind2["BackgroundProcessingBegins"] = "backgroundProcessingBegins";
  ProblemCollectorEventKind2["BackgroundProcessingEnds"] = "backgroundProcessingEnds";
  return ProblemCollectorEventKind2;
})(ProblemCollectorEventKind || {});
var IProblemCollectorEvent;
((IProblemCollectorEvent2) => {
  function create(kind) {
    return Object.freeze({ kind });
  }
  IProblemCollectorEvent2.create = create;
  __name(create, "create");
})(IProblemCollectorEvent || (IProblemCollectorEvent = {}));
class AbstractProblemCollector extends Disposable {
  constructor(problemMatchers, markerService, modelService, fileService) {
    super();
    this.problemMatchers = problemMatchers;
    this.markerService = markerService;
    this.modelService = modelService;
    this.matchers = /* @__PURE__ */ Object.create(null);
    this.bufferLength = 1;
    problemMatchers.map((elem) => createLineMatcher(elem, fileService)).forEach((matcher) => {
      const length = matcher.matchLength;
      if (length > this.bufferLength) {
        this.bufferLength = length;
      }
      let value = this.matchers[length];
      if (!value) {
        value = [];
        this.matchers[length] = value;
      }
      value.push(matcher);
    });
    this.buffer = [];
    this.activeMatcher = null;
    this._numberOfMatches = 0;
    this._maxMarkerSeverity = void 0;
    this.openModels = /* @__PURE__ */ Object.create(null);
    this.applyToByOwner = /* @__PURE__ */ new Map();
    for (const problemMatcher of problemMatchers) {
      const current = this.applyToByOwner.get(problemMatcher.owner);
      if (current === void 0) {
        this.applyToByOwner.set(problemMatcher.owner, problemMatcher.applyTo);
      } else {
        this.applyToByOwner.set(problemMatcher.owner, this.mergeApplyTo(current, problemMatcher.applyTo));
      }
    }
    this.resourcesToClean = /* @__PURE__ */ new Map();
    this.markers = /* @__PURE__ */ new Map();
    this.deliveredMarkers = /* @__PURE__ */ new Map();
    this._register(this.modelService.onModelAdded((model) => {
      this.openModels[model.uri.toString()] = true;
    }, this, this.modelListeners));
    this._register(this.modelService.onModelRemoved((model) => {
      delete this.openModels[model.uri.toString()];
    }, this, this.modelListeners));
    this.modelService.getModels().forEach((model) => this.openModels[model.uri.toString()] = true);
    this._onDidStateChange = new Emitter();
  }
  static {
    __name(this, "AbstractProblemCollector");
  }
  matchers;
  activeMatcher;
  _numberOfMatches;
  _maxMarkerSeverity;
  buffer;
  bufferLength;
  openModels;
  modelListeners = new DisposableStore();
  tail;
  // [owner] -> ApplyToKind
  applyToByOwner;
  // [owner] -> [resource] -> URI
  resourcesToClean;
  // [owner] -> [resource] -> [markerkey] -> markerData
  markers;
  // [owner] -> [resource] -> number;
  deliveredMarkers;
  _onDidStateChange;
  _onDidFindFirstMatch = new Emitter();
  onDidFindFirstMatch = this._onDidFindFirstMatch.event;
  _onDidFindErrors = new Emitter();
  onDidFindErrors = this._onDidFindErrors.event;
  _onDidRequestInvalidateLastMarker = new Emitter();
  onDidRequestInvalidateLastMarker = this._onDidRequestInvalidateLastMarker.event;
  get onDidStateChange() {
    return this._onDidStateChange.event;
  }
  processLine(line) {
    if (this.tail) {
      const oldTail = this.tail;
      this.tail = oldTail.then(() => {
        return this.processLineInternal(line);
      });
    } else {
      this.tail = this.processLineInternal(line);
    }
  }
  dispose() {
    super.dispose();
    this.modelListeners.dispose();
  }
  get numberOfMatches() {
    return this._numberOfMatches;
  }
  get maxMarkerSeverity() {
    return this._maxMarkerSeverity;
  }
  tryFindMarker(line) {
    let result = null;
    if (this.activeMatcher) {
      result = this.activeMatcher.next(line);
      if (result) {
        this.captureMatch(result);
        return result;
      }
      this.clearBuffer();
      this.activeMatcher = null;
    }
    if (this.buffer.length < this.bufferLength) {
      this.buffer.push(line);
    } else {
      const end = this.buffer.length - 1;
      for (let i = 0; i < end; i++) {
        this.buffer[i] = this.buffer[i + 1];
      }
      this.buffer[end] = line;
    }
    result = this.tryMatchers();
    if (result) {
      this.clearBuffer();
    }
    return result;
  }
  async shouldApplyMatch(result) {
    switch (result.description.applyTo) {
      case ApplyToKind.allDocuments:
        return true;
      case ApplyToKind.openDocuments:
        return !!this.openModels[(await result.resource).toString()];
      case ApplyToKind.closedDocuments:
        return !this.openModels[(await result.resource).toString()];
      default:
        return true;
    }
  }
  mergeApplyTo(current, value) {
    if (current === value || current === ApplyToKind.allDocuments) {
      return current;
    }
    return ApplyToKind.allDocuments;
  }
  tryMatchers() {
    this.activeMatcher = null;
    const length = this.buffer.length;
    for (let startIndex = 0; startIndex < length; startIndex++) {
      const candidates = this.matchers[length - startIndex];
      if (!candidates) {
        continue;
      }
      for (const matcher of candidates) {
        const result = matcher.handle(this.buffer, startIndex);
        if (result.match) {
          this.captureMatch(result.match);
          if (result.continue) {
            this.activeMatcher = matcher;
          }
          return result.match;
        }
      }
    }
    return null;
  }
  captureMatch(match) {
    this._numberOfMatches++;
    if (this._maxMarkerSeverity === void 0 || match.marker.severity > this._maxMarkerSeverity) {
      this._maxMarkerSeverity = match.marker.severity;
    }
  }
  clearBuffer() {
    if (this.buffer.length > 0) {
      this.buffer = [];
    }
  }
  recordResourcesToClean(owner) {
    const resourceSetToClean = this.getResourceSetToClean(owner);
    this.markerService.read({ owner }).forEach((marker) => resourceSetToClean.set(marker.resource.toString(), marker.resource));
  }
  recordResourceToClean(owner, resource) {
    this.getResourceSetToClean(owner).set(resource.toString(), resource);
  }
  removeResourceToClean(owner, resource) {
    const resourceSet = this.resourcesToClean.get(owner);
    resourceSet?.delete(resource);
  }
  getResourceSetToClean(owner) {
    let result = this.resourcesToClean.get(owner);
    if (!result) {
      result = /* @__PURE__ */ new Map();
      this.resourcesToClean.set(owner, result);
    }
    return result;
  }
  cleanAllMarkers() {
    this.resourcesToClean.forEach((value, owner) => {
      this._cleanMarkers(owner, value);
    });
    this.resourcesToClean = /* @__PURE__ */ new Map();
  }
  cleanMarkers(owner) {
    const toClean = this.resourcesToClean.get(owner);
    if (toClean) {
      this._cleanMarkers(owner, toClean);
      this.resourcesToClean.delete(owner);
    }
  }
  _cleanMarkers(owner, toClean) {
    const uris = [];
    const applyTo = this.applyToByOwner.get(owner);
    toClean.forEach((uri, uriAsString) => {
      if (applyTo === ApplyToKind.allDocuments || applyTo === ApplyToKind.openDocuments && this.openModels[uriAsString] || applyTo === ApplyToKind.closedDocuments && !this.openModels[uriAsString]) {
        uris.push(uri);
      }
    });
    this.markerService.remove(owner, uris);
  }
  recordMarker(marker, owner, resourceAsString) {
    let markersPerOwner = this.markers.get(owner);
    if (!markersPerOwner) {
      markersPerOwner = /* @__PURE__ */ new Map();
      this.markers.set(owner, markersPerOwner);
    }
    let markersPerResource = markersPerOwner.get(resourceAsString);
    if (!markersPerResource) {
      markersPerResource = /* @__PURE__ */ new Map();
      markersPerOwner.set(resourceAsString, markersPerResource);
    }
    const key = IMarkerData.makeKeyOptionalMessage(marker, false);
    let existingMarker;
    if (!markersPerResource.has(key)) {
      markersPerResource.set(key, marker);
    } else if ((existingMarker = markersPerResource.get(key)) !== void 0 && existingMarker.message.length < marker.message.length && isWindows) {
      markersPerResource.set(key, marker);
    }
  }
  reportMarkers() {
    this.markers.forEach((markersPerOwner, owner) => {
      const deliveredMarkersPerOwner = this.getDeliveredMarkersPerOwner(owner);
      markersPerOwner.forEach((markers, resource) => {
        this.deliverMarkersPerOwnerAndResourceResolved(owner, resource, markers, deliveredMarkersPerOwner);
      });
    });
  }
  deliverMarkersPerOwnerAndResource(owner, resource) {
    const markersPerOwner = this.markers.get(owner);
    if (!markersPerOwner) {
      return;
    }
    const deliveredMarkersPerOwner = this.getDeliveredMarkersPerOwner(owner);
    const markersPerResource = markersPerOwner.get(resource);
    if (!markersPerResource) {
      return;
    }
    this.deliverMarkersPerOwnerAndResourceResolved(owner, resource, markersPerResource, deliveredMarkersPerOwner);
  }
  deliverMarkersPerOwnerAndResourceResolved(owner, resource, markers, reported) {
    if (markers.size !== reported.get(resource)) {
      const toSet = [];
      markers.forEach((value) => toSet.push(value));
      this.markerService.changeOne(owner, URI.parse(resource), toSet);
      reported.set(resource, markers.size);
    }
  }
  getDeliveredMarkersPerOwner(owner) {
    let result = this.deliveredMarkers.get(owner);
    if (!result) {
      result = /* @__PURE__ */ new Map();
      this.deliveredMarkers.set(owner, result);
    }
    return result;
  }
  cleanMarkerCaches() {
    this._numberOfMatches = 0;
    this._maxMarkerSeverity = void 0;
    this.markers.clear();
    this.deliveredMarkers.clear();
  }
  done() {
    this.reportMarkers();
    this.cleanAllMarkers();
  }
}
var ProblemHandlingStrategy = /* @__PURE__ */ ((ProblemHandlingStrategy2) => {
  ProblemHandlingStrategy2[ProblemHandlingStrategy2["Clean"] = 0] = "Clean";
  return ProblemHandlingStrategy2;
})(ProblemHandlingStrategy || {});
class StartStopProblemCollector extends AbstractProblemCollector {
  static {
    __name(this, "StartStopProblemCollector");
  }
  owners;
  currentOwner;
  currentResource;
  constructor(problemMatchers, markerService, modelService, _strategy = 0 /* Clean */, fileService) {
    super(problemMatchers, markerService, modelService, fileService);
    const ownerSet = /* @__PURE__ */ Object.create(null);
    problemMatchers.forEach((description) => ownerSet[description.owner] = true);
    this.owners = Object.keys(ownerSet);
    this.owners.forEach((owner) => {
      this.recordResourcesToClean(owner);
    });
  }
  async processLineInternal(line) {
    const markerMatch = this.tryFindMarker(line);
    if (!markerMatch) {
      return;
    }
    const owner = markerMatch.description.owner;
    const resource = await markerMatch.resource;
    const resourceAsString = resource.toString();
    this.removeResourceToClean(owner, resourceAsString);
    const shouldApplyMatch = await this.shouldApplyMatch(markerMatch);
    if (shouldApplyMatch) {
      this.recordMarker(markerMatch.marker, owner, resourceAsString);
      if (this.currentOwner !== owner || this.currentResource !== resourceAsString) {
        if (this.currentOwner && this.currentResource) {
          this.deliverMarkersPerOwnerAndResource(this.currentOwner, this.currentResource);
        }
        this.currentOwner = owner;
        this.currentResource = resourceAsString;
      }
    }
  }
}
class WatchingProblemCollector extends AbstractProblemCollector {
  static {
    __name(this, "WatchingProblemCollector");
  }
  backgroundPatterns;
  // workaround for https://github.com/microsoft/vscode/issues/44018
  _activeBackgroundMatchers;
  // Current State
  currentOwner;
  currentResource;
  lines = [];
  beginPatterns = [];
  constructor(problemMatchers, markerService, modelService, fileService) {
    super(problemMatchers, markerService, modelService, fileService);
    this.resetCurrentResource();
    this.backgroundPatterns = [];
    this._activeBackgroundMatchers = /* @__PURE__ */ new Set();
    this.problemMatchers.forEach((matcher) => {
      if (matcher.watching) {
        const key = generateUuid();
        this.backgroundPatterns.push({
          key,
          matcher,
          begin: matcher.watching.beginsPattern,
          end: matcher.watching.endsPattern
        });
        this.beginPatterns.push(matcher.watching.beginsPattern.regexp);
      }
    });
    this.modelListeners.add(this.modelService.onModelRemoved((modelEvent) => {
      let markerChanged = Event.debounce(this.markerService.onMarkerChanged, (last, e) => {
        return (last ?? []).concat(e);
      }, 500, false, true)(async (markerEvent) => {
        markerChanged?.dispose();
        markerChanged = void 0;
        if (!markerEvent || !markerEvent.includes(modelEvent.uri) || this.markerService.read({ resource: modelEvent.uri }).length !== 0) {
          return;
        }
        const oldLines = Array.from(this.lines);
        for (const line of oldLines) {
          await this.processLineInternal(line);
        }
      });
      setTimeout(async () => {
        const _markerChanged = markerChanged;
        markerChanged = void 0;
        _markerChanged?.dispose();
      }, 600);
    }));
  }
  aboutToStart() {
    for (const background of this.backgroundPatterns) {
      if (background.matcher.watching && background.matcher.watching.activeOnStart) {
        this._activeBackgroundMatchers.add(background.key);
        this._onDidStateChange.fire(IProblemCollectorEvent.create("backgroundProcessingBegins" /* BackgroundProcessingBegins */));
        this.recordResourcesToClean(background.matcher.owner);
      }
    }
  }
  async processLineInternal(line) {
    if (await this.tryBegin(line) || this.tryFinish(line)) {
      return;
    }
    this.lines.push(line);
    const markerMatch = this.tryFindMarker(line);
    if (!markerMatch) {
      return;
    }
    const resource = await markerMatch.resource;
    const owner = markerMatch.description.owner;
    const resourceAsString = resource.toString();
    this.removeResourceToClean(owner, resourceAsString);
    const shouldApplyMatch = await this.shouldApplyMatch(markerMatch);
    if (shouldApplyMatch) {
      this.recordMarker(markerMatch.marker, owner, resourceAsString);
      if (this.currentOwner !== owner || this.currentResource !== resourceAsString) {
        this.reportMarkersForCurrentResource();
        this.currentOwner = owner;
        this.currentResource = resourceAsString;
      }
    }
  }
  forceDelivery() {
    this.reportMarkersForCurrentResource();
  }
  async tryBegin(line) {
    let result = false;
    for (const background of this.backgroundPatterns) {
      const matches = background.begin.regexp.exec(line);
      if (matches) {
        if (this._activeBackgroundMatchers.has(background.key)) {
          continue;
        }
        this._activeBackgroundMatchers.add(background.key);
        result = true;
        this._onDidFindFirstMatch.fire();
        this.lines = [];
        this.lines.push(line);
        this._onDidStateChange.fire(IProblemCollectorEvent.create("backgroundProcessingBegins" /* BackgroundProcessingBegins */));
        this.cleanMarkerCaches();
        this.resetCurrentResource();
        const owner = background.matcher.owner;
        const file = matches[background.begin.file];
        if (file) {
          const resource = getResource(file, background.matcher);
          this.recordResourceToClean(owner, await resource);
        } else {
          this.recordResourcesToClean(owner);
        }
      }
    }
    return result;
  }
  tryFinish(line) {
    let result = false;
    for (const background of this.backgroundPatterns) {
      const matches = background.end.regexp.exec(line);
      if (matches) {
        if (this._numberOfMatches > 0) {
          this._onDidFindErrors.fire();
        } else {
          this._onDidRequestInvalidateLastMarker.fire();
        }
        if (this._activeBackgroundMatchers.has(background.key)) {
          this._activeBackgroundMatchers.delete(background.key);
          this.resetCurrentResource();
          this._onDidStateChange.fire(IProblemCollectorEvent.create("backgroundProcessingEnds" /* BackgroundProcessingEnds */));
          result = true;
          this.lines.push(line);
          const owner = background.matcher.owner;
          this.cleanMarkers(owner);
          this.cleanMarkerCaches();
        }
      }
    }
    return result;
  }
  resetCurrentResource() {
    this.reportMarkersForCurrentResource();
    this.currentOwner = void 0;
    this.currentResource = void 0;
  }
  reportMarkersForCurrentResource() {
    if (this.currentOwner && this.currentResource) {
      this.deliverMarkersPerOwnerAndResource(this.currentOwner, this.currentResource);
    }
  }
  done() {
    [...this.applyToByOwner.keys()].forEach((owner) => {
      this.recordResourcesToClean(owner);
    });
    super.done();
  }
  isWatching() {
    return this.backgroundPatterns.length > 0;
  }
}
export {
  AbstractProblemCollector,
  ProblemCollectorEventKind,
  ProblemHandlingStrategy,
  StartStopProblemCollector,
  WatchingProblemCollector
};
//# sourceMappingURL=problemCollectors.js.map
