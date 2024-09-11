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
import { IMarkerService, IMarker, MarkerSeverity, MarkerTag } from "../../../platform/markers/common/markers.js";
import { Disposable, toDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IModelDeltaDecoration, ITextModel, IModelDecorationOptions, TrackedRangeStickiness, OverviewRulerLane, IModelDecoration, MinimapPosition, IModelDecorationMinimapOptions } from "../model.js";
import { ClassName } from "../model/intervalTree.js";
import { themeColorFromId } from "../../../platform/theme/common/themeService.js";
import { ThemeColor } from "../../../base/common/themables.js";
import { overviewRulerWarning, overviewRulerInfo, overviewRulerError } from "../core/editorColorRegistry.js";
import { IModelService } from "./model.js";
import { Range } from "../core/range.js";
import { IMarkerDecorationsService } from "./markerDecorations.js";
import { Schemas } from "../../../base/common/network.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { minimapInfo, minimapWarning, minimapError } from "../../../platform/theme/common/colorRegistry.js";
import { BidirectionalMap, ResourceMap } from "../../../base/common/map.js";
import { diffSets } from "../../../base/common/collections.js";
let MarkerDecorationsService = class extends Disposable {
  constructor(modelService, _markerService) {
    super();
    this._markerService = _markerService;
    modelService.getModels().forEach((model) => this._onModelAdded(model));
    this._register(modelService.onModelAdded(this._onModelAdded, this));
    this._register(modelService.onModelRemoved(this._onModelRemoved, this));
    this._register(this._markerService.onMarkerChanged(this._handleMarkerChange, this));
  }
  static {
    __name(this, "MarkerDecorationsService");
  }
  _onDidChangeMarker = this._register(new Emitter());
  onDidChangeMarker = this._onDidChangeMarker.event;
  _markerDecorations = new ResourceMap();
  dispose() {
    super.dispose();
    this._markerDecorations.forEach((value) => value.dispose());
    this._markerDecorations.clear();
  }
  getMarker(uri, decoration) {
    const markerDecorations = this._markerDecorations.get(uri);
    return markerDecorations ? markerDecorations.getMarker(decoration) || null : null;
  }
  getLiveMarkers(uri) {
    const markerDecorations = this._markerDecorations.get(uri);
    return markerDecorations ? markerDecorations.getMarkers() : [];
  }
  _handleMarkerChange(changedResources) {
    changedResources.forEach((resource) => {
      const markerDecorations = this._markerDecorations.get(resource);
      if (markerDecorations) {
        this._updateDecorations(markerDecorations);
      }
    });
  }
  _onModelAdded(model) {
    const markerDecorations = new MarkerDecorations(model);
    this._markerDecorations.set(model.uri, markerDecorations);
    this._updateDecorations(markerDecorations);
  }
  _onModelRemoved(model) {
    const markerDecorations = this._markerDecorations.get(model.uri);
    if (markerDecorations) {
      markerDecorations.dispose();
      this._markerDecorations.delete(model.uri);
    }
    if (model.uri.scheme === Schemas.inMemory || model.uri.scheme === Schemas.internal || model.uri.scheme === Schemas.vscode) {
      this._markerService?.read({ resource: model.uri }).map((marker) => marker.owner).forEach((owner) => this._markerService.remove(owner, [model.uri]));
    }
  }
  _updateDecorations(markerDecorations) {
    const markers = this._markerService.read({ resource: markerDecorations.model.uri, take: 500 });
    if (markerDecorations.update(markers)) {
      this._onDidChangeMarker.fire(markerDecorations.model);
    }
  }
};
MarkerDecorationsService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, IMarkerService)
], MarkerDecorationsService);
class MarkerDecorations extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    this._register(toDisposable(() => {
      this.model.deltaDecorations([...this._map.values()], []);
      this._map.clear();
    }));
  }
  static {
    __name(this, "MarkerDecorations");
  }
  _map = new BidirectionalMap();
  update(markers) {
    const { added, removed } = diffSets(new Set(this._map.keys()), new Set(markers));
    if (added.length === 0 && removed.length === 0) {
      return false;
    }
    const oldIds = removed.map((marker) => this._map.get(marker));
    const newDecorations = added.map((marker) => {
      return {
        range: this._createDecorationRange(this.model, marker),
        options: this._createDecorationOption(marker)
      };
    });
    const ids = this.model.deltaDecorations(oldIds, newDecorations);
    for (const removedMarker of removed) {
      this._map.delete(removedMarker);
    }
    for (let index = 0; index < ids.length; index++) {
      this._map.set(added[index], ids[index]);
    }
    return true;
  }
  getMarker(decoration) {
    return this._map.getKey(decoration.id);
  }
  getMarkers() {
    const res = [];
    this._map.forEach((id, marker) => {
      const range = this.model.getDecorationRange(id);
      if (range) {
        res.push([range, marker]);
      }
    });
    return res;
  }
  _createDecorationRange(model, rawMarker) {
    let ret = Range.lift(rawMarker);
    if (rawMarker.severity === MarkerSeverity.Hint && !this._hasMarkerTag(rawMarker, MarkerTag.Unnecessary) && !this._hasMarkerTag(rawMarker, MarkerTag.Deprecated)) {
      ret = ret.setEndPosition(ret.startLineNumber, ret.startColumn + 2);
    }
    ret = model.validateRange(ret);
    if (ret.isEmpty()) {
      const maxColumn = model.getLineLastNonWhitespaceColumn(ret.startLineNumber) || model.getLineMaxColumn(ret.startLineNumber);
      if (maxColumn === 1 || ret.endColumn >= maxColumn) {
        return ret;
      }
      const word = model.getWordAtPosition(ret.getStartPosition());
      if (word) {
        ret = new Range(ret.startLineNumber, word.startColumn, ret.endLineNumber, word.endColumn);
      }
    } else if (rawMarker.endColumn === Number.MAX_VALUE && rawMarker.startColumn === 1 && ret.startLineNumber === ret.endLineNumber) {
      const minColumn = model.getLineFirstNonWhitespaceColumn(rawMarker.startLineNumber);
      if (minColumn < ret.endColumn) {
        ret = new Range(ret.startLineNumber, minColumn, ret.endLineNumber, ret.endColumn);
        rawMarker.startColumn = minColumn;
      }
    }
    return ret;
  }
  _createDecorationOption(marker) {
    let className;
    let color = void 0;
    let zIndex;
    let inlineClassName = void 0;
    let minimap;
    switch (marker.severity) {
      case MarkerSeverity.Hint:
        if (this._hasMarkerTag(marker, MarkerTag.Deprecated)) {
          className = void 0;
        } else if (this._hasMarkerTag(marker, MarkerTag.Unnecessary)) {
          className = ClassName.EditorUnnecessaryDecoration;
        } else {
          className = ClassName.EditorHintDecoration;
        }
        zIndex = 0;
        break;
      case MarkerSeverity.Info:
        className = ClassName.EditorInfoDecoration;
        color = themeColorFromId(overviewRulerInfo);
        zIndex = 10;
        minimap = {
          color: themeColorFromId(minimapInfo),
          position: MinimapPosition.Inline
        };
        break;
      case MarkerSeverity.Warning:
        className = ClassName.EditorWarningDecoration;
        color = themeColorFromId(overviewRulerWarning);
        zIndex = 20;
        minimap = {
          color: themeColorFromId(minimapWarning),
          position: MinimapPosition.Inline
        };
        break;
      case MarkerSeverity.Error:
      default:
        className = ClassName.EditorErrorDecoration;
        color = themeColorFromId(overviewRulerError);
        zIndex = 30;
        minimap = {
          color: themeColorFromId(minimapError),
          position: MinimapPosition.Inline
        };
        break;
    }
    if (marker.tags) {
      if (marker.tags.indexOf(MarkerTag.Unnecessary) !== -1) {
        inlineClassName = ClassName.EditorUnnecessaryInlineDecoration;
      }
      if (marker.tags.indexOf(MarkerTag.Deprecated) !== -1) {
        inlineClassName = ClassName.EditorDeprecatedInlineDecoration;
      }
    }
    return {
      description: "marker-decoration",
      stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      className,
      showIfCollapsed: true,
      overviewRuler: {
        color,
        position: OverviewRulerLane.Right
      },
      minimap,
      zIndex,
      inlineClassName
    };
  }
  _hasMarkerTag(marker, tag) {
    if (marker.tags) {
      return marker.tags.indexOf(tag) >= 0;
    }
    return false;
  }
}
export {
  MarkerDecorationsService
};
//# sourceMappingURL=markerDecorationsService.js.map
