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
import { localize } from "../../../nls.js";
import { IMarkerData, MarkerSeverity } from "../../../platform/markers/common/markers.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { MainContext, MainThreadDiagnosticsShape, ExtHostDiagnosticsShape, IMainContext } from "./extHost.protocol.js";
import { DiagnosticSeverity } from "./extHostTypes.js";
import * as converter from "./extHostTypeConverters.js";
import { Event, Emitter, DebounceEmitter } from "../../../base/common/event.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { ResourceMap } from "../../../base/common/map.js";
import { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { IExtHostFileSystemInfo } from "./extHostFileSystemInfo.js";
import { IExtUri } from "../../../base/common/resources.js";
import { ExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
class DiagnosticCollection {
  constructor(_name, _owner, _maxDiagnosticsTotal, _maxDiagnosticsPerFile, _modelVersionIdProvider, extUri, proxy, onDidChangeDiagnostics) {
    this._name = _name;
    this._owner = _owner;
    this._maxDiagnosticsTotal = _maxDiagnosticsTotal;
    this._maxDiagnosticsPerFile = _maxDiagnosticsPerFile;
    this._modelVersionIdProvider = _modelVersionIdProvider;
    this._maxDiagnosticsTotal = Math.max(_maxDiagnosticsPerFile, _maxDiagnosticsTotal);
    this.#data = new ResourceMap((uri) => extUri.getComparisonKey(uri));
    this.#proxy = proxy;
    this.#onDidChangeDiagnostics = onDidChangeDiagnostics;
  }
  static {
    __name(this, "DiagnosticCollection");
  }
  #proxy;
  #onDidChangeDiagnostics;
  #data;
  _isDisposed = false;
  dispose() {
    if (!this._isDisposed) {
      this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
      this.#proxy?.$clear(this._owner);
      this.#data.clear();
      this._isDisposed = true;
    }
  }
  get name() {
    this._checkDisposed();
    return this._name;
  }
  set(first, diagnostics) {
    if (!first) {
      this.clear();
      return;
    }
    this._checkDisposed();
    let toSync = [];
    if (URI.isUri(first)) {
      if (!diagnostics) {
        this.delete(first);
        return;
      }
      this.#data.set(first, diagnostics.slice());
      toSync = [first];
    } else if (Array.isArray(first)) {
      toSync = [];
      let lastUri;
      first = [...first].sort(DiagnosticCollection._compareIndexedTuplesByUri);
      for (const tuple of first) {
        const [uri, diagnostics2] = tuple;
        if (!lastUri || uri.toString() !== lastUri.toString()) {
          if (lastUri && this.#data.get(lastUri).length === 0) {
            this.#data.delete(lastUri);
          }
          lastUri = uri;
          toSync.push(uri);
          this.#data.set(uri, []);
        }
        if (!diagnostics2) {
          const currentDiagnostics = this.#data.get(uri);
          if (currentDiagnostics) {
            currentDiagnostics.length = 0;
          }
        } else {
          const currentDiagnostics = this.#data.get(uri);
          currentDiagnostics?.push(...diagnostics2);
        }
      }
    }
    this.#onDidChangeDiagnostics.fire(toSync);
    if (!this.#proxy) {
      return;
    }
    const entries = [];
    let totalMarkerCount = 0;
    for (const uri of toSync) {
      let marker = [];
      const diagnostics2 = this.#data.get(uri);
      if (diagnostics2) {
        if (diagnostics2.length > this._maxDiagnosticsPerFile) {
          marker = [];
          const order = [DiagnosticSeverity.Error, DiagnosticSeverity.Warning, DiagnosticSeverity.Information, DiagnosticSeverity.Hint];
          orderLoop: for (let i = 0; i < 4; i++) {
            for (const diagnostic of diagnostics2) {
              if (diagnostic.severity === order[i]) {
                const len = marker.push({ ...converter.Diagnostic.from(diagnostic), modelVersionId: this._modelVersionIdProvider(uri) });
                if (len === this._maxDiagnosticsPerFile) {
                  break orderLoop;
                }
              }
            }
          }
          marker.push({
            severity: MarkerSeverity.Info,
            message: localize({ key: "limitHit", comment: ["amount of errors/warning skipped due to limits"] }, "Not showing {0} further errors and warnings.", diagnostics2.length - this._maxDiagnosticsPerFile),
            startLineNumber: marker[marker.length - 1].startLineNumber,
            startColumn: marker[marker.length - 1].startColumn,
            endLineNumber: marker[marker.length - 1].endLineNumber,
            endColumn: marker[marker.length - 1].endColumn
          });
        } else {
          marker = diagnostics2.map((diag) => ({ ...converter.Diagnostic.from(diag), modelVersionId: this._modelVersionIdProvider(uri) }));
        }
      }
      entries.push([uri, marker]);
      totalMarkerCount += marker.length;
      if (totalMarkerCount > this._maxDiagnosticsTotal) {
        break;
      }
    }
    this.#proxy.$changeMany(this._owner, entries);
  }
  delete(uri) {
    this._checkDisposed();
    this.#onDidChangeDiagnostics.fire([uri]);
    this.#data.delete(uri);
    this.#proxy?.$changeMany(this._owner, [[uri, void 0]]);
  }
  clear() {
    this._checkDisposed();
    this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
    this.#data.clear();
    this.#proxy?.$clear(this._owner);
  }
  forEach(callback, thisArg) {
    this._checkDisposed();
    for (const [uri, values] of this) {
      callback.call(thisArg, uri, values, this);
    }
  }
  *[Symbol.iterator]() {
    this._checkDisposed();
    for (const uri of this.#data.keys()) {
      yield [uri, this.get(uri)];
    }
  }
  get(uri) {
    this._checkDisposed();
    const result = this.#data.get(uri);
    if (Array.isArray(result)) {
      return Object.freeze(result.slice(0));
    }
    return [];
  }
  has(uri) {
    this._checkDisposed();
    return Array.isArray(this.#data.get(uri));
  }
  _checkDisposed() {
    if (this._isDisposed) {
      throw new Error("illegal state - object is disposed");
    }
  }
  static _compareIndexedTuplesByUri(a, b) {
    if (a[0].toString() < b[0].toString()) {
      return -1;
    } else if (a[0].toString() > b[0].toString()) {
      return 1;
    } else {
      return 0;
    }
  }
}
let ExtHostDiagnostics = class {
  constructor(mainContext, _logService, _fileSystemInfoService, _extHostDocumentsAndEditors) {
    this._logService = _logService;
    this._fileSystemInfoService = _fileSystemInfoService;
    this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
    this._proxy = mainContext.getProxy(MainContext.MainThreadDiagnostics);
  }
  static {
    __name(this, "ExtHostDiagnostics");
  }
  static _idPool = 0;
  static _maxDiagnosticsPerFile = 1e3;
  static _maxDiagnosticsTotal = 1.1 * this._maxDiagnosticsPerFile;
  _proxy;
  _collections = /* @__PURE__ */ new Map();
  _onDidChangeDiagnostics = new DebounceEmitter({ merge: /* @__PURE__ */ __name((all) => all.flat(), "merge"), delay: 50 });
  static _mapper(last) {
    const map = new ResourceMap();
    for (const uri of last) {
      map.set(uri, uri);
    }
    return { uris: Object.freeze(Array.from(map.values())) };
  }
  onDidChangeDiagnostics = Event.map(this._onDidChangeDiagnostics.event, ExtHostDiagnostics._mapper);
  createDiagnosticCollection(extensionId, name) {
    const { _collections, _proxy, _onDidChangeDiagnostics, _logService, _fileSystemInfoService, _extHostDocumentsAndEditors } = this;
    const loggingProxy = new class {
      $changeMany(owner2, entries) {
        _proxy.$changeMany(owner2, entries);
        _logService.trace("[DiagnosticCollection] change many (extension, owner, uris)", extensionId.value, owner2, entries.length === 0 ? "CLEARING" : entries);
      }
      $clear(owner2) {
        _proxy.$clear(owner2);
        _logService.trace("[DiagnosticCollection] remove all (extension, owner)", extensionId.value, owner2);
      }
      dispose() {
        _proxy.dispose();
      }
    }();
    let owner;
    if (!name) {
      name = "_generated_diagnostic_collection_name_#" + ExtHostDiagnostics._idPool++;
      owner = name;
    } else if (!_collections.has(name)) {
      owner = name;
    } else {
      this._logService.warn(`DiagnosticCollection with name '${name}' does already exist.`);
      do {
        owner = name + ExtHostDiagnostics._idPool++;
      } while (_collections.has(owner));
    }
    const result = new class extends DiagnosticCollection {
      constructor() {
        super(
          name,
          owner,
          ExtHostDiagnostics._maxDiagnosticsTotal,
          ExtHostDiagnostics._maxDiagnosticsPerFile,
          (uri) => _extHostDocumentsAndEditors.getDocument(uri)?.version,
          _fileSystemInfoService.extUri,
          loggingProxy,
          _onDidChangeDiagnostics
        );
        _collections.set(owner, this);
      }
      dispose() {
        super.dispose();
        _collections.delete(owner);
      }
    }();
    return result;
  }
  getDiagnostics(resource) {
    if (resource) {
      return this._getDiagnostics(resource);
    } else {
      const index = /* @__PURE__ */ new Map();
      const res = [];
      for (const collection of this._collections.values()) {
        collection.forEach((uri, diagnostics) => {
          let idx = index.get(uri.toString());
          if (typeof idx === "undefined") {
            idx = res.length;
            index.set(uri.toString(), idx);
            res.push([uri, []]);
          }
          res[idx][1] = res[idx][1].concat(...diagnostics);
        });
      }
      return res;
    }
  }
  _getDiagnostics(resource) {
    let res = [];
    for (const collection of this._collections.values()) {
      if (collection.has(resource)) {
        res = res.concat(collection.get(resource));
      }
    }
    return res;
  }
  _mirrorCollection;
  $acceptMarkersChange(data) {
    if (!this._mirrorCollection) {
      const name = "_generated_mirror";
      const collection = new DiagnosticCollection(
        name,
        name,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        // no limits because this collection is just a mirror of "sanitized" data
        (_uri) => void 0,
        this._fileSystemInfoService.extUri,
        void 0,
        this._onDidChangeDiagnostics
      );
      this._collections.set(name, collection);
      this._mirrorCollection = collection;
    }
    for (const [uri, markers] of data) {
      this._mirrorCollection.set(URI.revive(uri), markers.map(converter.Diagnostic.to));
    }
  }
};
ExtHostDiagnostics = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostFileSystemInfo)
], ExtHostDiagnostics);
export {
  DiagnosticCollection,
  ExtHostDiagnostics
};
//# sourceMappingURL=extHostDiagnostics.js.map
