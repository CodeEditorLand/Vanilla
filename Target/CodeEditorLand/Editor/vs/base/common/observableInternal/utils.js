import { strictEquals } from "../equals.js";
import { BugIndicatingError } from "../errors.js";
import { Event } from "../event.js";
import {
  DisposableStore,
  toDisposable
} from "../lifecycle.js";
import {
  autorun,
  autorunOpts,
  autorunWithStoreHandleChanges
} from "./autorun.js";
import {
  BaseObservable,
  ConvenientObservable,
  _setKeepObserved,
  _setRecomputeInitiallyAndOnChange,
  observableValue,
  subtransaction,
  transaction
} from "./base.js";
import {
  DebugNameData,
  getDebugName
} from "./debugName.js";
import { derived, derivedOpts } from "./derived.js";
import { getLogger } from "./logging.js";
function constObservable(value) {
  return new ConstObservable(value);
}
class ConstObservable extends ConvenientObservable {
  constructor(value) {
    super();
    this.value = value;
  }
  get debugName() {
    return this.toString();
  }
  get() {
    return this.value;
  }
  addObserver(observer) {
  }
  removeObserver(observer) {
  }
  toString() {
    return `Const: ${this.value}`;
  }
}
function observableFromPromise(promise) {
  const observable = observableValue("promiseValue", {});
  promise.then((value) => {
    observable.set({ value }, void 0);
  });
  return observable;
}
function observableFromEvent(...args) {
  let owner;
  let event;
  let getValue;
  if (args.length === 3) {
    [owner, event, getValue] = args;
  } else {
    [event, getValue] = args;
  }
  return new FromEventObservable(
    new DebugNameData(owner, void 0, getValue),
    event,
    getValue,
    () => FromEventObservable.globalTransaction,
    strictEquals
  );
}
function observableFromEventOpts(options, event, getValue) {
  return new FromEventObservable(
    new DebugNameData(
      options.owner,
      options.debugName,
      options.debugReferenceFn ?? getValue
    ),
    event,
    getValue,
    () => FromEventObservable.globalTransaction,
    options.equalsFn ?? strictEquals
  );
}
class FromEventObservable extends BaseObservable {
  constructor(_debugNameData, event, _getValue, _getTransaction, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this.event = event;
    this._getValue = _getValue;
    this._getTransaction = _getTransaction;
    this._equalityComparator = _equalityComparator;
  }
  static globalTransaction;
  value;
  hasValue = false;
  subscription;
  getDebugName() {
    return this._debugNameData.getDebugName(this);
  }
  get debugName() {
    const name = this.getDebugName();
    return "From Event" + (name ? `: ${name}` : "");
  }
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  handleEvent = (args) => {
    const newValue = this._getValue(args);
    const oldValue = this.value;
    const didChange = !this.hasValue || !this._equalityComparator(oldValue, newValue);
    let didRunTransaction = false;
    if (didChange) {
      this.value = newValue;
      if (this.hasValue) {
        didRunTransaction = true;
        subtransaction(
          this._getTransaction(),
          (tx) => {
            getLogger()?.handleFromEventObservableTriggered(this, {
              oldValue,
              newValue,
              change: void 0,
              didChange,
              hadValue: this.hasValue
            });
            for (const o of this.observers) {
              tx.updateObserver(o, this);
              o.handleChange(this, void 0);
            }
          },
          () => {
            const name = this.getDebugName();
            return "Event fired" + (name ? `: ${name}` : "");
          }
        );
      }
      this.hasValue = true;
    }
    if (!didRunTransaction) {
      getLogger()?.handleFromEventObservableTriggered(this, {
        oldValue,
        newValue,
        change: void 0,
        didChange,
        hadValue: this.hasValue
      });
    }
  };
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
    this.hasValue = false;
    this.value = void 0;
  }
  get() {
    if (this.subscription) {
      if (!this.hasValue) {
        this.handleEvent(void 0);
      }
      return this.value;
    } else {
      const value = this._getValue(void 0);
      return value;
    }
  }
}
((observableFromEvent2) => {
  observableFromEvent2.Observer = FromEventObservable;
  function batchEventsGlobally(tx, fn) {
    let didSet = false;
    if (FromEventObservable.globalTransaction === void 0) {
      FromEventObservable.globalTransaction = tx;
      didSet = true;
    }
    try {
      fn();
    } finally {
      if (didSet) {
        FromEventObservable.globalTransaction = void 0;
      }
    }
  }
  observableFromEvent2.batchEventsGlobally = batchEventsGlobally;
})(observableFromEvent || (observableFromEvent = {}));
function observableSignalFromEvent(debugName, event) {
  return new FromEventObservableSignal(debugName, event);
}
class FromEventObservableSignal extends BaseObservable {
  constructor(debugName, event) {
    super();
    this.debugName = debugName;
    this.event = event;
  }
  subscription;
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  handleEvent = () => {
    transaction(
      (tx) => {
        for (const o of this.observers) {
          tx.updateObserver(o, this);
          o.handleChange(this, void 0);
        }
      },
      () => this.debugName
    );
  };
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
  }
  get() {
  }
}
function observableSignal(debugNameOrOwner) {
  if (typeof debugNameOrOwner === "string") {
    return new ObservableSignal(debugNameOrOwner);
  } else {
    return new ObservableSignal(void 0, debugNameOrOwner);
  }
}
class ObservableSignal extends BaseObservable {
  constructor(_debugName, _owner) {
    super();
    this._debugName = _debugName;
    this._owner = _owner;
  }
  get debugName() {
    return new DebugNameData(
      this._owner,
      this._debugName,
      void 0
    ).getDebugName(this) ?? "Observable Signal";
  }
  toString() {
    return this.debugName;
  }
  trigger(tx, change) {
    if (!tx) {
      transaction(
        (tx2) => {
          this.trigger(tx2, change);
        },
        () => `Trigger signal ${this.debugName}`
      );
      return;
    }
    for (const o of this.observers) {
      tx.updateObserver(o, this);
      o.handleChange(this, change);
    }
  }
  get() {
  }
}
function debouncedObservable(observable, debounceMs, disposableStore) {
  const debouncedObservable3 = observableValue(
    "debounced",
    void 0
  );
  let timeout;
  disposableStore.add(
    autorun((reader) => {
      const value = observable.read(reader);
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        transaction((tx) => {
          debouncedObservable3.set(value, tx);
        });
      }, debounceMs);
    })
  );
  return debouncedObservable3;
}
function debouncedObservable2(observable, debounceMs) {
  let hasValue = false;
  let lastValue;
  let timeout;
  return observableFromEvent(
    (cb) => {
      const d = autorun((reader) => {
        const value = observable.read(reader);
        if (hasValue) {
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(() => {
            lastValue = value;
            cb();
          }, debounceMs);
        } else {
          hasValue = true;
          lastValue = value;
        }
      });
      return {
        dispose() {
          d.dispose();
          hasValue = false;
          lastValue = void 0;
        }
      };
    },
    () => {
      if (hasValue) {
        return lastValue;
      } else {
        return observable.get();
      }
    }
  );
}
function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
  const observable = observableValue("triggeredRecently", false);
  let timeout;
  disposableStore.add(
    event(() => {
      observable.set(true, void 0);
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        observable.set(false, void 0);
      }, timeoutMs);
    })
  );
  return observable;
}
function keepObserved(observable) {
  const o = new KeepAliveObserver(false, void 0);
  observable.addObserver(o);
  return toDisposable(() => {
    observable.removeObserver(o);
  });
}
_setKeepObserved(keepObserved);
function recomputeInitiallyAndOnChange(observable, handleValue) {
  const o = new KeepAliveObserver(true, handleValue);
  observable.addObserver(o);
  if (handleValue) {
    handleValue(observable.get());
  } else {
    observable.reportChanges();
  }
  return toDisposable(() => {
    observable.removeObserver(o);
  });
}
_setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange);
class KeepAliveObserver {
  constructor(_forceRecompute, _handleValue) {
    this._forceRecompute = _forceRecompute;
    this._handleValue = _handleValue;
  }
  _counter = 0;
  beginUpdate(observable) {
    this._counter++;
  }
  endUpdate(observable) {
    this._counter--;
    if (this._counter === 0 && this._forceRecompute) {
      if (this._handleValue) {
        this._handleValue(observable.get());
      } else {
        observable.reportChanges();
      }
    }
  }
  handlePossibleChange(observable) {
  }
  handleChange(observable, change) {
  }
}
function derivedObservableWithCache(owner, computeFn) {
  let lastValue;
  const observable = derivedOpts(
    { owner, debugReferenceFn: computeFn },
    (reader) => {
      lastValue = computeFn(reader, lastValue);
      return lastValue;
    }
  );
  return observable;
}
function derivedObservableWithWritableCache(owner, computeFn) {
  let lastValue;
  const onChange = observableSignal("derivedObservableWithWritableCache");
  const observable = derived(owner, (reader) => {
    onChange.read(reader);
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return Object.assign(observable, {
    clearCache: (tx) => {
      lastValue = void 0;
      onChange.trigger(tx);
    },
    setCache: (newValue, tx) => {
      lastValue = newValue;
      onChange.trigger(tx);
    }
  });
}
function mapObservableArrayCached(owner, items, map, keySelector) {
  let m = new ArrayMap(map, keySelector);
  const self = derivedOpts(
    {
      debugReferenceFn: map,
      owner,
      onLastObserverRemoved: () => {
        m.dispose();
        m = new ArrayMap(map);
      }
    },
    (reader) => {
      m.setItems(items.read(reader));
      return m.getItems();
    }
  );
  return self;
}
class ArrayMap {
  constructor(_map, _keySelector) {
    this._map = _map;
    this._keySelector = _keySelector;
  }
  _cache = /* @__PURE__ */ new Map();
  _items = [];
  dispose() {
    this._cache.forEach((entry) => entry.store.dispose());
    this._cache.clear();
  }
  setItems(items) {
    const newItems = [];
    const itemsToRemove = new Set(this._cache.keys());
    for (const item of items) {
      const key = this._keySelector ? this._keySelector(item) : item;
      let entry = this._cache.get(key);
      if (entry) {
        itemsToRemove.delete(key);
      } else {
        const store = new DisposableStore();
        const out = this._map(item, store);
        entry = { out, store };
        this._cache.set(key, entry);
      }
      newItems.push(entry.out);
    }
    for (const item of itemsToRemove) {
      const entry = this._cache.get(item);
      entry.store.dispose();
      this._cache.delete(item);
    }
    this._items = newItems;
  }
  getItems() {
    return this._items;
  }
}
class ValueWithChangeEventFromObservable {
  constructor(observable) {
    this.observable = observable;
  }
  get onDidChange() {
    return Event.fromObservableLight(this.observable);
  }
  get value() {
    return this.observable.get();
  }
}
function observableFromValueWithChangeEvent(owner, value) {
  if (value instanceof ValueWithChangeEventFromObservable) {
    return value.observable;
  }
  return observableFromEvent(owner, value.onDidChange, () => value.value);
}
function latestChangedValue(owner, observables) {
  if (observables.length === 0) {
    throw new BugIndicatingError();
  }
  let hasLastChangedValue = false;
  let lastChangedValue;
  const result = observableFromEvent(
    owner,
    (cb) => {
      const store = new DisposableStore();
      for (const o of observables) {
        store.add(
          autorunOpts(
            {
              debugName: () => getDebugName(
                result,
                new DebugNameData(
                  owner,
                  void 0,
                  void 0
                )
              ) + ".updateLastChangedValue"
            },
            (reader) => {
              hasLastChangedValue = true;
              lastChangedValue = o.read(reader);
              cb();
            }
          )
        );
      }
      store.add({
        dispose() {
          hasLastChangedValue = false;
          lastChangedValue = void 0;
        }
      });
      return store;
    },
    () => {
      if (hasLastChangedValue) {
        return lastChangedValue;
      } else {
        return observables[observables.length - 1].get();
      }
    }
  );
  return result;
}
function derivedConstOnceDefined(owner, fn) {
  return derivedObservableWithCache(
    owner,
    (reader, lastValue) => lastValue ?? fn(reader)
  );
}
function runOnChange(observable, cb) {
  return autorunWithStoreHandleChanges(
    {
      createEmptyChangeSummary: () => ({
        deltas: [],
        didChange: false
      }),
      handleChange: (context, changeSummary) => {
        if (context.didChange(observable)) {
          const e = context.change;
          if (e !== void 0) {
            changeSummary.deltas.push(
              e
            );
          }
          changeSummary.didChange = true;
        }
        return true;
      }
    },
    (reader, changeSummary) => {
      const value = observable.read(reader);
      if (changeSummary.didChange) {
        cb(value, changeSummary.deltas);
      }
    }
  );
}
function runOnChangeWithStore(observable, cb) {
  const store = new DisposableStore();
  const disposable = runOnChange(observable, (value, deltas) => {
    store.clear();
    cb(value, deltas, store);
  });
  return {
    dispose() {
      disposable.dispose();
      store.dispose();
    }
  };
}
export {
  FromEventObservable,
  KeepAliveObserver,
  ValueWithChangeEventFromObservable,
  constObservable,
  debouncedObservable,
  debouncedObservable2,
  derivedConstOnceDefined,
  derivedObservableWithCache,
  derivedObservableWithWritableCache,
  keepObserved,
  latestChangedValue,
  mapObservableArrayCached,
  observableFromEvent,
  observableFromEventOpts,
  observableFromPromise,
  observableFromValueWithChangeEvent,
  observableSignal,
  observableSignalFromEvent,
  recomputeInitiallyAndOnChange,
  runOnChange,
  runOnChangeWithStore,
  wasEventTriggeredRecently
};
