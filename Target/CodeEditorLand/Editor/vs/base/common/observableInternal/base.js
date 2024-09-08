import { strictEquals } from "../equals.js";
import {
  DebugNameData,
  getFunctionName
} from "./debugName.js";
import { getLogger } from "./logging.js";
let _recomputeInitiallyAndOnChange;
function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange) {
  _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange;
}
let _keepObserved;
function _setKeepObserved(keepObserved) {
  _keepObserved = keepObserved;
}
let _derived;
function _setDerivedOpts(derived) {
  _derived = derived;
}
class ConvenientObservable {
  get TChange() {
    return null;
  }
  reportChanges() {
    this.get();
  }
  /** @sealed */
  read(reader) {
    if (reader) {
      return reader.readObservable(this);
    } else {
      return this.get();
    }
  }
  map(fnOrOwner, fnOrUndefined) {
    const owner = fnOrUndefined === void 0 ? void 0 : fnOrOwner;
    const fn = fnOrUndefined === void 0 ? fnOrOwner : fnOrUndefined;
    return _derived(
      {
        owner,
        debugName: () => {
          const name = getFunctionName(fn);
          if (name !== void 0) {
            return name;
          }
          const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
          const match = regexp.exec(fn.toString());
          if (match) {
            return `${this.debugName}.${match[2]}`;
          }
          if (!owner) {
            return `${this.debugName} (mapped)`;
          }
          return void 0;
        },
        debugReferenceFn: fn
      },
      (reader) => fn(this.read(reader), reader)
    );
  }
  /**
   * @sealed
   * Converts an observable of an observable value into a direct observable of the value.
   */
  flatten() {
    return _derived(
      {
        owner: void 0,
        debugName: () => `${this.debugName} (flattened)`
      },
      (reader) => this.read(reader).read(reader)
    );
  }
  recomputeInitiallyAndOnChange(store, handleValue) {
    store.add(_recomputeInitiallyAndOnChange(this, handleValue));
    return this;
  }
  /**
   * Ensures that this observable is observed. This keeps the cache alive.
   * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
   * Use `recomputeInitiallyAndOnChange` for eager evaluation.
   */
  keepObserved(store) {
    store.add(_keepObserved(this));
    return this;
  }
  get debugValue() {
    return this.get();
  }
}
class BaseObservable extends ConvenientObservable {
  observers = /* @__PURE__ */ new Set();
  addObserver(observer) {
    const len = this.observers.size;
    this.observers.add(observer);
    if (len === 0) {
      this.onFirstObserverAdded();
    }
  }
  removeObserver(observer) {
    const deleted = this.observers.delete(observer);
    if (deleted && this.observers.size === 0) {
      this.onLastObserverRemoved();
    }
  }
  onFirstObserverAdded() {
  }
  onLastObserverRemoved() {
  }
}
function transaction(fn, getDebugName) {
  const tx = new TransactionImpl(fn, getDebugName);
  try {
    fn(tx);
  } finally {
    tx.finish();
  }
}
let _globalTransaction;
function globalTransaction(fn) {
  if (_globalTransaction) {
    fn(_globalTransaction);
  } else {
    const tx = new TransactionImpl(fn, void 0);
    _globalTransaction = tx;
    try {
      fn(tx);
    } finally {
      tx.finish();
      _globalTransaction = void 0;
    }
  }
}
async function asyncTransaction(fn, getDebugName) {
  const tx = new TransactionImpl(fn, getDebugName);
  try {
    await fn(tx);
  } finally {
    tx.finish();
  }
}
function subtransaction(tx, fn, getDebugName) {
  if (tx) {
    fn(tx);
  } else {
    transaction(fn, getDebugName);
  }
}
class TransactionImpl {
  constructor(_fn, _getDebugName) {
    this._fn = _fn;
    this._getDebugName = _getDebugName;
    getLogger()?.handleBeginTransaction(this);
  }
  updatingObservers = [];
  getDebugName() {
    if (this._getDebugName) {
      return this._getDebugName();
    }
    return getFunctionName(this._fn);
  }
  updateObserver(observer, observable) {
    this.updatingObservers.push({ observer, observable });
    observer.beginUpdate(observable);
  }
  finish() {
    const updatingObservers = this.updatingObservers;
    for (let i = 0; i < updatingObservers.length; i++) {
      const { observer, observable } = updatingObservers[i];
      observer.endUpdate(observable);
    }
    this.updatingObservers = null;
    getLogger()?.handleEndTransaction();
  }
}
function observableValue(nameOrOwner, initialValue) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new ObservableValue(debugNameData, initialValue, strictEquals);
}
class ObservableValue extends BaseObservable {
  constructor(_debugNameData, initialValue, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._equalityComparator = _equalityComparator;
    this._value = initialValue;
  }
  _value;
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "ObservableValue";
  }
  get() {
    return this._value;
  }
  set(value, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new TransactionImpl(
        () => {
        },
        () => `Setting ${this.debugName}`
      );
    }
    try {
      const oldValue = this._value;
      this._setValue(value);
      getLogger()?.handleObservableChanged(this, {
        oldValue,
        newValue: value,
        change,
        didChange: true,
        hadValue: true
      });
      for (const observer of this.observers) {
        tx.updateObserver(observer, this);
        observer.handleChange(this, change);
      }
    } finally {
      if (_tx) {
        _tx.finish();
      }
    }
  }
  toString() {
    return `${this.debugName}: ${this._value}`;
  }
  _setValue(newValue) {
    this._value = newValue;
  }
}
function disposableObservableValue(nameOrOwner, initialValue) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new DisposableObservableValue(
    debugNameData,
    initialValue,
    strictEquals
  );
}
class DisposableObservableValue extends ObservableValue {
  _setValue(newValue) {
    if (this._value === newValue) {
      return;
    }
    if (this._value) {
      this._value.dispose();
    }
    this._value = newValue;
  }
  dispose() {
    this._value?.dispose();
  }
}
export {
  BaseObservable,
  ConvenientObservable,
  DisposableObservableValue,
  ObservableValue,
  TransactionImpl,
  _setDerivedOpts,
  _setKeepObserved,
  _setRecomputeInitiallyAndOnChange,
  asyncTransaction,
  disposableObservableValue,
  globalTransaction,
  observableValue,
  subtransaction,
  transaction
};
