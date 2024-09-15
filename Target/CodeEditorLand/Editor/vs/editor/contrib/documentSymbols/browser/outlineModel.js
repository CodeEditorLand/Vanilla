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
import { binarySearch, coalesceInPlace, equals } from "../../../../base/common/arrays.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { onUnexpectedExternalError } from "../../../../base/common/errors.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { LRUCache } from "../../../../base/common/map.js";
import { commonPrefixLength } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { IPosition, Position } from "../../../common/core/position.js";
import { IRange, Range } from "../../../common/core/range.js";
import { ITextModel } from "../../../common/model.js";
import { DocumentSymbol, DocumentSymbolProvider } from "../../../common/languages.js";
import { MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IFeatureDebounceInformation, ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IModelService } from "../../../common/services/model.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
class TreeElement {
  static {
    __name(this, "TreeElement");
  }
  remove() {
    this.parent?.children.delete(this.id);
  }
  static findId(candidate, container) {
    let candidateId;
    if (typeof candidate === "string") {
      candidateId = `${container.id}/${candidate}`;
    } else {
      candidateId = `${container.id}/${candidate.name}`;
      if (container.children.get(candidateId) !== void 0) {
        candidateId = `${container.id}/${candidate.name}_${candidate.range.startLineNumber}_${candidate.range.startColumn}`;
      }
    }
    let id = candidateId;
    for (let i = 0; container.children.get(id) !== void 0; i++) {
      id = `${candidateId}_${i}`;
    }
    return id;
  }
  static getElementById(id, element) {
    if (!id) {
      return void 0;
    }
    const len = commonPrefixLength(id, element.id);
    if (len === id.length) {
      return element;
    }
    if (len < element.id.length) {
      return void 0;
    }
    for (const [, child] of element.children) {
      const candidate = TreeElement.getElementById(id, child);
      if (candidate) {
        return candidate;
      }
    }
    return void 0;
  }
  static size(element) {
    let res = 1;
    for (const [, child] of element.children) {
      res += TreeElement.size(child);
    }
    return res;
  }
  static empty(element) {
    return element.children.size === 0;
  }
}
class OutlineElement extends TreeElement {
  constructor(id, parent, symbol) {
    super();
    this.id = id;
    this.parent = parent;
    this.symbol = symbol;
  }
  static {
    __name(this, "OutlineElement");
  }
  children = /* @__PURE__ */ new Map();
  marker;
}
class OutlineGroup extends TreeElement {
  constructor(id, parent, label, order) {
    super();
    this.id = id;
    this.parent = parent;
    this.label = label;
    this.order = order;
  }
  static {
    __name(this, "OutlineGroup");
  }
  children = /* @__PURE__ */ new Map();
  getItemEnclosingPosition(position) {
    return position ? this._getItemEnclosingPosition(position, this.children) : void 0;
  }
  _getItemEnclosingPosition(position, children) {
    for (const [, item] of children) {
      if (!item.symbol.range || !Range.containsPosition(item.symbol.range, position)) {
        continue;
      }
      return this._getItemEnclosingPosition(position, item.children) || item;
    }
    return void 0;
  }
  updateMarker(marker) {
    for (const [, child] of this.children) {
      this._updateMarker(marker, child);
    }
  }
  _updateMarker(markers, item) {
    item.marker = void 0;
    const idx = binarySearch(markers, item.symbol.range, Range.compareRangesUsingStarts);
    let start;
    if (idx < 0) {
      start = ~idx;
      if (start > 0 && Range.areIntersecting(markers[start - 1], item.symbol.range)) {
        start -= 1;
      }
    } else {
      start = idx;
    }
    const myMarkers = [];
    let myTopSev;
    for (; start < markers.length && Range.areIntersecting(item.symbol.range, markers[start]); start++) {
      const marker = markers[start];
      myMarkers.push(marker);
      markers[start] = void 0;
      if (!myTopSev || marker.severity > myTopSev) {
        myTopSev = marker.severity;
      }
    }
    for (const [, child] of item.children) {
      this._updateMarker(myMarkers, child);
    }
    if (myTopSev) {
      item.marker = {
        count: myMarkers.length,
        topSev: myTopSev
      };
    }
    coalesceInPlace(markers);
  }
}
class OutlineModel extends TreeElement {
  constructor(uri) {
    super();
    this.uri = uri;
    this.id = "root";
    this.parent = void 0;
  }
  static {
    __name(this, "OutlineModel");
  }
  static create(registry, textModel, token) {
    const cts = new CancellationTokenSource(token);
    const result = new OutlineModel(textModel.uri);
    const provider = registry.ordered(textModel);
    const promises = provider.map((provider2, index) => {
      const id = TreeElement.findId(`provider_${index}`, result);
      const group = new OutlineGroup(id, result, provider2.displayName ?? "Unknown Outline Provider", index);
      return Promise.resolve(provider2.provideDocumentSymbols(textModel, cts.token)).then((result2) => {
        for (const info of result2 || []) {
          OutlineModel._makeOutlineElement(info, group);
        }
        return group;
      }, (err) => {
        onUnexpectedExternalError(err);
        return group;
      }).then((group2) => {
        if (!TreeElement.empty(group2)) {
          result._groups.set(id, group2);
        } else {
          group2.remove();
        }
      });
    });
    const listener = registry.onDidChange(() => {
      const newProvider = registry.ordered(textModel);
      if (!equals(newProvider, provider)) {
        cts.cancel();
      }
    });
    return Promise.all(promises).then(() => {
      if (cts.token.isCancellationRequested && !token.isCancellationRequested) {
        return OutlineModel.create(registry, textModel, token);
      } else {
        return result._compact();
      }
    }).finally(() => {
      cts.dispose();
      listener.dispose();
      cts.dispose();
    });
  }
  static _makeOutlineElement(info, container) {
    const id = TreeElement.findId(info, container);
    const res = new OutlineElement(id, container, info);
    if (info.children) {
      for (const childInfo of info.children) {
        OutlineModel._makeOutlineElement(childInfo, res);
      }
    }
    container.children.set(res.id, res);
  }
  static get(element) {
    while (element) {
      if (element instanceof OutlineModel) {
        return element;
      }
      element = element.parent;
    }
    return void 0;
  }
  id = "root";
  parent = void 0;
  _groups = /* @__PURE__ */ new Map();
  children = /* @__PURE__ */ new Map();
  _compact() {
    let count = 0;
    for (const [key, group] of this._groups) {
      if (group.children.size === 0) {
        this._groups.delete(key);
      } else {
        count += 1;
      }
    }
    if (count !== 1) {
      this.children = this._groups;
    } else {
      const group = Iterable.first(this._groups.values());
      for (const [, child] of group.children) {
        child.parent = this;
        this.children.set(child.id, child);
      }
    }
    return this;
  }
  merge(other) {
    if (this.uri.toString() !== other.uri.toString()) {
      return false;
    }
    if (this._groups.size !== other._groups.size) {
      return false;
    }
    this._groups = other._groups;
    this.children = other.children;
    return true;
  }
  getItemEnclosingPosition(position, context) {
    let preferredGroup;
    if (context) {
      let candidate = context.parent;
      while (candidate && !preferredGroup) {
        if (candidate instanceof OutlineGroup) {
          preferredGroup = candidate;
        }
        candidate = candidate.parent;
      }
    }
    let result = void 0;
    for (const [, group] of this._groups) {
      result = group.getItemEnclosingPosition(position);
      if (result && (!preferredGroup || preferredGroup === group)) {
        break;
      }
    }
    return result;
  }
  getItemById(id) {
    return TreeElement.getElementById(id, this);
  }
  updateMarker(marker) {
    marker.sort(Range.compareRangesUsingStarts);
    for (const [, group] of this._groups) {
      group.updateMarker(marker.slice(0));
    }
  }
  getTopLevelSymbols() {
    const roots = [];
    for (const child of this.children.values()) {
      if (child instanceof OutlineElement) {
        roots.push(child.symbol);
      } else {
        roots.push(...Iterable.map(child.children.values(), (child2) => child2.symbol));
      }
    }
    return roots.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
  }
  asListOfDocumentSymbols() {
    const roots = this.getTopLevelSymbols();
    const bucket = [];
    OutlineModel._flattenDocumentSymbols(bucket, roots, "");
    return bucket.sort(
      (a, b) => Position.compare(Range.getStartPosition(a.range), Range.getStartPosition(b.range)) || Position.compare(Range.getEndPosition(b.range), Range.getEndPosition(a.range))
    );
  }
  static _flattenDocumentSymbols(bucket, entries, overrideContainerLabel) {
    for (const entry of entries) {
      bucket.push({
        kind: entry.kind,
        tags: entry.tags,
        name: entry.name,
        detail: entry.detail,
        containerName: entry.containerName || overrideContainerLabel,
        range: entry.range,
        selectionRange: entry.selectionRange,
        children: void 0
        // we flatten it...
      });
      if (entry.children) {
        OutlineModel._flattenDocumentSymbols(bucket, entry.children, entry.name);
      }
    }
  }
}
const IOutlineModelService = createDecorator("IOutlineModelService");
let OutlineModelService = class {
  constructor(_languageFeaturesService, debounces, modelService) {
    this._languageFeaturesService = _languageFeaturesService;
    this._debounceInformation = debounces.for(_languageFeaturesService.documentSymbolProvider, "DocumentSymbols", { min: 350 });
    this._disposables.add(modelService.onModelRemoved((textModel) => {
      this._cache.delete(textModel.id);
    }));
  }
  static {
    __name(this, "OutlineModelService");
  }
  _disposables = new DisposableStore();
  _debounceInformation;
  _cache = new LRUCache(10, 0.7);
  dispose() {
    this._disposables.dispose();
  }
  async getOrCreate(textModel, token) {
    const registry = this._languageFeaturesService.documentSymbolProvider;
    const provider = registry.ordered(textModel);
    let data = this._cache.get(textModel.id);
    if (!data || data.versionId !== textModel.getVersionId() || !equals(data.provider, provider)) {
      const source = new CancellationTokenSource();
      data = {
        versionId: textModel.getVersionId(),
        provider,
        promiseCnt: 0,
        source,
        promise: OutlineModel.create(registry, textModel, source.token),
        model: void 0
      };
      this._cache.set(textModel.id, data);
      const now = Date.now();
      data.promise.then((outlineModel) => {
        data.model = outlineModel;
        this._debounceInformation.update(textModel, Date.now() - now);
      }).catch((_err) => {
        this._cache.delete(textModel.id);
      });
    }
    if (data.model) {
      return data.model;
    }
    data.promiseCnt += 1;
    const listener = token.onCancellationRequested(() => {
      if (--data.promiseCnt === 0) {
        data.source.cancel();
        this._cache.delete(textModel.id);
      }
    });
    try {
      return await data.promise;
    } finally {
      listener.dispose();
    }
  }
  getDebounceValue(textModel) {
    return this._debounceInformation.get(textModel);
  }
};
OutlineModelService = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, ILanguageFeatureDebounceService),
  __decorateParam(2, IModelService)
], OutlineModelService);
registerSingleton(IOutlineModelService, OutlineModelService, InstantiationType.Delayed);
export {
  IOutlineModelService,
  OutlineElement,
  OutlineGroup,
  OutlineModel,
  OutlineModelService,
  TreeElement
};
//# sourceMappingURL=outlineModel.js.map
