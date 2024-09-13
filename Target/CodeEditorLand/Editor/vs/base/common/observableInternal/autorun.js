var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IChangeContext, IObservable, IObserver, IReader } from "./base.js";
import { DebugNameData, IDebugNameData } from "./debugName.js";
import { assertFn, DisposableStore, IDisposable, markAsDisposed, onBugIndicatingError, toDisposable, trackDisposable } from "./commonFacade/deps.js";
import { getLogger } from "./logging.js";
function autorun(fn) {
  return new AutorunObserver(
    new DebugNameData(void 0, void 0, fn),
    fn,
    void 0,
    void 0
  );
}
__name(autorun, "autorun");
function autorunOpts(options, fn) {
  return new AutorunObserver(
    new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn),
    fn,
    void 0,
    void 0
  );
}
__name(autorunOpts, "autorunOpts");
function autorunHandleChanges(options, fn) {
  return new AutorunObserver(
    new DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn),
    fn,
    options.createEmptyChangeSummary,
    options.handleChange
  );
}
__name(autorunHandleChanges, "autorunHandleChanges");
function autorunWithStoreHandleChanges(options, fn) {
  const store = new DisposableStore();
  const disposable = autorunHandleChanges(
    {
      owner: options.owner,
      debugName: options.debugName,
      debugReferenceFn: options.debugReferenceFn ?? fn,
      createEmptyChangeSummary: options.createEmptyChangeSummary,
      handleChange: options.handleChange
    },
    (reader, changeSummary) => {
      store.clear();
      fn(reader, changeSummary, store);
    }
  );
  return toDisposable(() => {
    disposable.dispose();
    store.dispose();
  });
}
__name(autorunWithStoreHandleChanges, "autorunWithStoreHandleChanges");
function autorunWithStore(fn) {
  const store = new DisposableStore();
  const disposable = autorunOpts(
    {
      owner: void 0,
      debugName: void 0,
      debugReferenceFn: fn
    },
    (reader) => {
      store.clear();
      fn(reader, store);
    }
  );
  return toDisposable(() => {
    disposable.dispose();
    store.dispose();
  });
}
__name(autorunWithStore, "autorunWithStore");
function autorunDelta(observable, handler) {
  let _lastValue;
  return autorunOpts({ debugReferenceFn: handler }, (reader) => {
    const newValue = observable.read(reader);
    const lastValue = _lastValue;
    _lastValue = newValue;
    handler({ lastValue, newValue });
  });
}
__name(autorunDelta, "autorunDelta");
var AutorunState = /* @__PURE__ */ ((AutorunState2) => {
  AutorunState2[AutorunState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  AutorunState2[AutorunState2["stale"] = 2] = "stale";
  AutorunState2[AutorunState2["upToDate"] = 3] = "upToDate";
  return AutorunState2;
})(AutorunState || {});
class AutorunObserver {
  constructor(_debugNameData, _runFn, createChangeSummary, _handleChange) {
    this._debugNameData = _debugNameData;
    this._runFn = _runFn;
    this.createChangeSummary = createChangeSummary;
    this._handleChange = _handleChange;
    this.changeSummary = this.createChangeSummary?.();
    getLogger()?.handleAutorunCreated(this);
    this._runIfNeeded();
    trackDisposable(this);
  }
  static {
    __name(this, "AutorunObserver");
  }
  state = 2 /* stale */;
  updateCount = 0;
  disposed = false;
  dependencies = /* @__PURE__ */ new Set();
  dependenciesToBeRemoved = /* @__PURE__ */ new Set();
  changeSummary;
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  dispose() {
    this.disposed = true;
    for (const o of this.dependencies) {
      o.removeObserver(this);
    }
    this.dependencies.clear();
    markAsDisposed(this);
  }
  _runIfNeeded() {
    if (this.state === 3 /* upToDate */) {
      return;
    }
    const emptySet = this.dependenciesToBeRemoved;
    this.dependenciesToBeRemoved = this.dependencies;
    this.dependencies = emptySet;
    this.state = 3 /* upToDate */;
    const isDisposed = this.disposed;
    try {
      if (!isDisposed) {
        getLogger()?.handleAutorunTriggered(this);
        const changeSummary = this.changeSummary;
        try {
          this.changeSummary = this.createChangeSummary?.();
          this._runFn(this, changeSummary);
        } catch (e) {
          onBugIndicatingError(e);
        }
      }
    } finally {
      if (!isDisposed) {
        getLogger()?.handleAutorunFinished(this);
      }
      for (const o of this.dependenciesToBeRemoved) {
        o.removeObserver(this);
      }
      this.dependenciesToBeRemoved.clear();
    }
  }
  toString() {
    return `Autorun<${this.debugName}>`;
  }
  // IObserver implementation
  beginUpdate() {
    if (this.state === 3 /* upToDate */) {
      this.state = 1 /* dependenciesMightHaveChanged */;
    }
    this.updateCount++;
  }
  endUpdate() {
    try {
      if (this.updateCount === 1) {
        do {
          if (this.state === 1 /* dependenciesMightHaveChanged */) {
            this.state = 3 /* upToDate */;
            for (const d of this.dependencies) {
              d.reportChanges();
              if (this.state === 2 /* stale */) {
                break;
              }
            }
          }
          this._runIfNeeded();
        } while (this.state !== 3 /* upToDate */);
      }
    } finally {
      this.updateCount--;
    }
    assertFn(() => this.updateCount >= 0);
  }
  handlePossibleChange(observable) {
    if (this.state === 3 /* upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      this.state = 1 /* dependenciesMightHaveChanged */;
    }
  }
  handleChange(observable, change) {
    if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      try {
        const shouldReact = this._handleChange ? this._handleChange({
          changedObservable: observable,
          change,
          didChange: /* @__PURE__ */ __name((o) => o === observable, "didChange")
        }, this.changeSummary) : true;
        if (shouldReact) {
          this.state = 2 /* stale */;
        }
      } catch (e) {
        onBugIndicatingError(e);
      }
    }
  }
  // IReader implementation
  readObservable(observable) {
    if (this.disposed) {
      return observable.get();
    }
    observable.addObserver(this);
    const value = observable.get();
    this.dependencies.add(observable);
    this.dependenciesToBeRemoved.delete(observable);
    return value;
  }
}
((autorun2) => {
  autorun2.Observer = AutorunObserver;
})(autorun || (autorun = {}));
export {
  AutorunObserver,
  autorun,
  autorunDelta,
  autorunHandleChanges,
  autorunOpts,
  autorunWithStore,
  autorunWithStoreHandleChanges
};
//# sourceMappingURL=autorun.js.map
