import { assertFn } from "../assert.js";
import { strictEquals } from "../equals.js";
import { onBugIndicatingError } from "../errors.js";
import { DisposableStore } from "../lifecycle.js";
import {
  BaseObservable,
  _setDerivedOpts
} from "./base.js";
import {
  DebugNameData
} from "./debugName.js";
import { getLogger } from "./logging.js";
function derived(computeFnOrOwner, computeFn) {
  if (computeFn !== void 0) {
    return new Derived(
      new DebugNameData(computeFnOrOwner, void 0, computeFn),
      computeFn,
      void 0,
      void 0,
      void 0,
      strictEquals
    );
  }
  return new Derived(
    new DebugNameData(void 0, void 0, computeFnOrOwner),
    computeFnOrOwner,
    void 0,
    void 0,
    void 0,
    strictEquals
  );
}
function derivedWithSetter(owner, computeFn, setter) {
  return new DerivedWithSetter(
    new DebugNameData(owner, void 0, computeFn),
    computeFn,
    void 0,
    void 0,
    void 0,
    strictEquals,
    setter
  );
}
function derivedOpts(options, computeFn) {
  return new Derived(
    new DebugNameData(
      options.owner,
      options.debugName,
      options.debugReferenceFn
    ),
    computeFn,
    void 0,
    void 0,
    options.onLastObserverRemoved,
    options.equalsFn ?? strictEquals
  );
}
_setDerivedOpts(derivedOpts);
function derivedHandleChanges(options, computeFn) {
  return new Derived(
    new DebugNameData(options.owner, options.debugName, void 0),
    computeFn,
    options.createEmptyChangeSummary,
    options.handleChange,
    void 0,
    options.equalityComparer ?? strictEquals
  );
}
function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  const store = new DisposableStore();
  return new Derived(
    new DebugNameData(owner, void 0, computeFn),
    (r) => {
      store.clear();
      return computeFn(r, store);
    },
    void 0,
    void 0,
    () => store.dispose(),
    strictEquals
  );
}
function derivedDisposable(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let store;
  return new Derived(
    new DebugNameData(owner, void 0, computeFn),
    (r) => {
      if (store) {
        store.clear();
      } else {
        store = new DisposableStore();
      }
      const result = computeFn(r);
      if (result) {
        store.add(result);
      }
      return result;
    },
    void 0,
    void 0,
    () => {
      if (store) {
        store.dispose();
        store = void 0;
      }
    },
    strictEquals
  );
}
var DerivedState = /* @__PURE__ */ ((DerivedState2) => {
  DerivedState2[DerivedState2["initial"] = 0] = "initial";
  DerivedState2[DerivedState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  DerivedState2[DerivedState2["stale"] = 2] = "stale";
  DerivedState2[DerivedState2["upToDate"] = 3] = "upToDate";
  return DerivedState2;
})(DerivedState || {});
class Derived extends BaseObservable {
  constructor(_debugNameData, _computeFn, createChangeSummary, _handleChange, _handleLastObserverRemoved = void 0, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._computeFn = _computeFn;
    this.createChangeSummary = createChangeSummary;
    this._handleChange = _handleChange;
    this._handleLastObserverRemoved = _handleLastObserverRemoved;
    this._equalityComparator = _equalityComparator;
    this.changeSummary = this.createChangeSummary?.();
    getLogger()?.handleDerivedCreated(this);
  }
  state = 0 /* initial */;
  value = void 0;
  updateCount = 0;
  dependencies = /* @__PURE__ */ new Set();
  dependenciesToBeRemoved = /* @__PURE__ */ new Set();
  changeSummary = void 0;
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  onLastObserverRemoved() {
    this.state = 0 /* initial */;
    this.value = void 0;
    for (const d of this.dependencies) {
      d.removeObserver(this);
    }
    this.dependencies.clear();
    this._handleLastObserverRemoved?.();
  }
  get() {
    if (this.observers.size === 0) {
      const result = this._computeFn(this, this.createChangeSummary?.());
      this.onLastObserverRemoved();
      return result;
    } else {
      do {
        if (this.state === 1 /* dependenciesMightHaveChanged */) {
          for (const d of this.dependencies) {
            d.reportChanges();
            if (this.state === 2 /* stale */) {
              break;
            }
          }
        }
        if (this.state === 1 /* dependenciesMightHaveChanged */) {
          this.state = 3 /* upToDate */;
        }
        this._recomputeIfNeeded();
      } while (this.state !== 3 /* upToDate */);
      return this.value;
    }
  }
  _recomputeIfNeeded() {
    if (this.state === 3 /* upToDate */) {
      return;
    }
    const emptySet = this.dependenciesToBeRemoved;
    this.dependenciesToBeRemoved = this.dependencies;
    this.dependencies = emptySet;
    const hadValue = this.state !== 0 /* initial */;
    const oldValue = this.value;
    this.state = 3 /* upToDate */;
    let didChange = false;
    try {
      const changeSummary = this.changeSummary;
      this.changeSummary = this.createChangeSummary?.();
      try {
        this.value = this._computeFn(this, changeSummary);
      } finally {
        for (const o of this.dependenciesToBeRemoved) {
          o.removeObserver(this);
        }
        this.dependenciesToBeRemoved.clear();
      }
      didChange = hadValue && !this._equalityComparator(oldValue, this.value);
      getLogger()?.handleDerivedRecomputed(this, {
        oldValue,
        newValue: this.value,
        change: void 0,
        didChange,
        hadValue
      });
    } catch (e) {
      onBugIndicatingError(e);
    }
    if (didChange) {
      for (const r of this.observers) {
        r.handleChange(this, void 0);
      }
    }
  }
  toString() {
    return `LazyDerived<${this.debugName}>`;
  }
  // IObserver Implementation
  beginUpdate(_observable) {
    this.updateCount++;
    const propagateBeginUpdate = this.updateCount === 1;
    if (this.state === 3 /* upToDate */) {
      this.state = 1 /* dependenciesMightHaveChanged */;
      if (!propagateBeginUpdate) {
        for (const r of this.observers) {
          r.handlePossibleChange(this);
        }
      }
    }
    if (propagateBeginUpdate) {
      for (const r of this.observers) {
        r.beginUpdate(this);
      }
    }
  }
  endUpdate(_observable) {
    this.updateCount--;
    if (this.updateCount === 0) {
      const observers = [...this.observers];
      for (const r of observers) {
        r.endUpdate(this);
      }
    }
    assertFn(() => this.updateCount >= 0);
  }
  handlePossibleChange(observable) {
    if (this.state === 3 /* upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      this.state = 1 /* dependenciesMightHaveChanged */;
      for (const r of this.observers) {
        r.handlePossibleChange(this);
      }
    }
  }
  handleChange(observable, change) {
    if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      let shouldReact = false;
      try {
        shouldReact = this._handleChange ? this._handleChange(
          {
            changedObservable: observable,
            change,
            didChange: (o) => o === observable
          },
          this.changeSummary
        ) : true;
      } catch (e) {
        onBugIndicatingError(e);
      }
      const wasUpToDate = this.state === 3 /* upToDate */;
      if (shouldReact && (this.state === 1 /* dependenciesMightHaveChanged */ || wasUpToDate)) {
        this.state = 2 /* stale */;
        if (wasUpToDate) {
          for (const r of this.observers) {
            r.handlePossibleChange(this);
          }
        }
      }
    }
  }
  // IReader Implementation
  readObservable(observable) {
    observable.addObserver(this);
    const value = observable.get();
    this.dependencies.add(observable);
    this.dependenciesToBeRemoved.delete(observable);
    return value;
  }
  addObserver(observer) {
    const shouldCallBeginUpdate = !this.observers.has(observer) && this.updateCount > 0;
    super.addObserver(observer);
    if (shouldCallBeginUpdate) {
      observer.beginUpdate(this);
    }
  }
  removeObserver(observer) {
    const shouldCallEndUpdate = this.observers.has(observer) && this.updateCount > 0;
    super.removeObserver(observer);
    if (shouldCallEndUpdate) {
      observer.endUpdate(this);
    }
  }
}
class DerivedWithSetter extends Derived {
  constructor(debugNameData, computeFn, createChangeSummary, handleChange, handleLastObserverRemoved = void 0, equalityComparator, set) {
    super(
      debugNameData,
      computeFn,
      createChangeSummary,
      handleChange,
      handleLastObserverRemoved,
      equalityComparator
    );
    this.set = set;
  }
}
export {
  Derived,
  DerivedWithSetter,
  derived,
  derivedDisposable,
  derivedHandleChanges,
  derivedOpts,
  derivedWithSetter,
  derivedWithStore
};
