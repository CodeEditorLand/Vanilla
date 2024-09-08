import { compareBy, numberComparator } from "./arrays.js";
import { groupBy } from "./collections.js";
import { createSingleCallFunction } from "./functional.js";
import { Iterable } from "./iterator.js";
import { SetMap } from "./map.js";
const TRACK_DISPOSABLES = false;
let disposableTracker = null;
class DisposableTracker {
  static idx = 0;
  livingDisposables = /* @__PURE__ */ new Map();
  getDisposableData(d) {
    let val = this.livingDisposables.get(d);
    if (!val) {
      val = {
        parent: null,
        source: null,
        isSingleton: false,
        value: d,
        idx: DisposableTracker.idx++
      };
      this.livingDisposables.set(d, val);
    }
    return val;
  }
  trackDisposable(d) {
    const data = this.getDisposableData(d);
    if (!data.source) {
      data.source = new Error().stack;
    }
  }
  setParent(child, parent) {
    const data = this.getDisposableData(child);
    data.parent = parent;
  }
  markAsDisposed(x) {
    this.livingDisposables.delete(x);
  }
  markAsSingleton(disposable) {
    this.getDisposableData(disposable).isSingleton = true;
  }
  getRootParent(data, cache) {
    const cacheValue = cache.get(data);
    if (cacheValue) {
      return cacheValue;
    }
    const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
    cache.set(data, result);
    return result;
  }
  getTrackedDisposables() {
    const rootParentCache = /* @__PURE__ */ new Map();
    const leaking = [...this.livingDisposables.entries()].filter(
      ([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton
    ).flatMap(([k]) => k);
    return leaking;
  }
  computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
    let uncoveredLeakingObjs;
    if (preComputedLeaks) {
      uncoveredLeakingObjs = preComputedLeaks;
    } else {
      const rootParentCache = /* @__PURE__ */ new Map();
      const leakingObjects = [...this.livingDisposables.values()].filter(
        (info) => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton
      );
      if (leakingObjects.length === 0) {
        return;
      }
      const leakingObjsSet = new Set(leakingObjects.map((o) => o.value));
      uncoveredLeakingObjs = leakingObjects.filter((l) => {
        return !(l.parent && leakingObjsSet.has(l.parent));
      });
      if (uncoveredLeakingObjs.length === 0) {
        throw new Error("There are cyclic diposable chains!");
      }
    }
    if (!uncoveredLeakingObjs) {
      return void 0;
    }
    function getStackTracePath(leaking) {
      function removePrefix(array, linesToRemove) {
        while (array.length > 0 && linesToRemove.some(
          (regexp) => typeof regexp === "string" ? regexp === array[0] : array[0].match(regexp)
        )) {
          array.shift();
        }
      }
      const lines = leaking.source.split("\n").map((p) => p.trim().replace("at ", "")).filter((l) => l !== "");
      removePrefix(lines, [
        "Error",
        /^trackDisposable \(.*\)$/,
        /^DisposableTracker.trackDisposable \(.*\)$/
      ]);
      return lines.reverse();
    }
    const stackTraceStarts = new SetMap();
    for (const leaking of uncoveredLeakingObjs) {
      const stackTracePath = getStackTracePath(leaking);
      for (let i2 = 0; i2 <= stackTracePath.length; i2++) {
        stackTraceStarts.add(
          stackTracePath.slice(0, i2).join("\n"),
          leaking
        );
      }
    }
    uncoveredLeakingObjs.sort(compareBy((l) => l.idx, numberComparator));
    let message = "";
    let i = 0;
    for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
      i++;
      const stackTracePath = getStackTracePath(leaking);
      const stackTraceFormattedLines = [];
      for (let i2 = 0; i2 < stackTracePath.length; i2++) {
        let line = stackTracePath[i2];
        const starts = stackTraceStarts.get(
          stackTracePath.slice(0, i2 + 1).join("\n")
        );
        line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
        const prevStarts = stackTraceStarts.get(
          stackTracePath.slice(0, i2).join("\n")
        );
        const continuations = groupBy(
          [...prevStarts].map((d) => getStackTracePath(d)[i2]),
          (v) => v
        );
        delete continuations[stackTracePath[i2]];
        for (const [cont, set] of Object.entries(continuations)) {
          stackTraceFormattedLines.unshift(
            `    - stacktraces of ${set.length} other leaks continue with ${cont}`
          );
        }
        stackTraceFormattedLines.unshift(line);
      }
      message += `


==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================
${stackTraceFormattedLines.join("\n")}
============================================================

`;
    }
    if (uncoveredLeakingObjs.length > maxReported) {
      message += `


... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables

`;
    }
    return { leaks: uncoveredLeakingObjs, details: message };
  }
}
function setDisposableTracker(tracker) {
  disposableTracker = tracker;
}
if (TRACK_DISPOSABLES) {
  const __is_disposable_tracked__ = "__is_disposable_tracked__";
  setDisposableTracker(
    new class {
      trackDisposable(x) {
        const stack = new Error("Potentially leaked disposable").stack;
        setTimeout(() => {
          if (!x[__is_disposable_tracked__]) {
            console.log(stack);
          }
        }, 3e3);
      }
      setParent(child, parent) {
        if (child && child !== Disposable.None) {
          try {
            child[__is_disposable_tracked__] = true;
          } catch {
          }
        }
      }
      markAsDisposed(disposable) {
        if (disposable && disposable !== Disposable.None) {
          try {
            disposable[__is_disposable_tracked__] = true;
          } catch {
          }
        }
      }
      markAsSingleton(disposable) {
      }
    }()
  );
}
function trackDisposable(x) {
  disposableTracker?.trackDisposable(x);
  return x;
}
function markAsDisposed(disposable) {
  disposableTracker?.markAsDisposed(disposable);
}
function setParentOfDisposable(child, parent) {
  disposableTracker?.setParent(child, parent);
}
function setParentOfDisposables(children, parent) {
  if (!disposableTracker) {
    return;
  }
  for (const child of children) {
    disposableTracker.setParent(child, parent);
  }
}
function markAsSingleton(singleton) {
  disposableTracker?.markAsSingleton(singleton);
  return singleton;
}
function isDisposable(thing) {
  return typeof thing === "object" && thing !== null && typeof thing.dispose === "function" && thing.dispose.length === 0;
}
function dispose(arg) {
  if (Iterable.is(arg)) {
    const errors = [];
    for (const d of arg) {
      if (d) {
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }
    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new AggregateError(
        errors,
        "Encountered errors while disposing of store"
      );
    }
    return Array.isArray(arg) ? [] : arg;
  } else if (arg) {
    arg.dispose();
    return arg;
  }
}
function disposeIfDisposable(disposables) {
  for (const d of disposables) {
    if (isDisposable(d)) {
      d.dispose();
    }
  }
  return [];
}
function combinedDisposable(...disposables) {
  const parent = toDisposable(() => dispose(disposables));
  setParentOfDisposables(disposables, parent);
  return parent;
}
function toDisposable(fn) {
  const self = trackDisposable({
    dispose: createSingleCallFunction(() => {
      markAsDisposed(self);
      fn();
    })
  });
  return self;
}
class DisposableStore {
  static DISABLE_DISPOSED_WARNING = false;
  _toDispose = /* @__PURE__ */ new Set();
  _isDisposed = false;
  constructor() {
    trackDisposable(this);
  }
  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */
  dispose() {
    if (this._isDisposed) {
      return;
    }
    markAsDisposed(this);
    this._isDisposed = true;
    this.clear();
  }
  /**
   * @return `true` if this object has been disposed of.
   */
  get isDisposed() {
    return this._isDisposed;
  }
  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */
  clear() {
    if (this._toDispose.size === 0) {
      return;
    }
    try {
      dispose(this._toDispose);
    } finally {
      this._toDispose.clear();
    }
  }
  /**
   * Add a new {@link IDisposable disposable} to the collection.
   */
  add(o) {
    if (!o) {
      return o;
    }
    if (o === this) {
      throw new Error("Cannot register a disposable on itself!");
    }
    setParentOfDisposable(o, this);
    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(
          new Error(
            "Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!"
          ).stack
        );
      }
    } else {
      this._toDispose.add(o);
    }
    return o;
  }
  /**
   * Deletes a disposable from store and disposes of it. This will not throw or warn and proceed to dispose the
   * disposable even when the disposable is not part in the store.
   */
  delete(o) {
    if (!o) {
      return;
    }
    if (o === this) {
      throw new Error("Cannot dispose a disposable on itself!");
    }
    this._toDispose.delete(o);
    o.dispose();
  }
  /**
   * Deletes the value from the store, but does not dispose it.
   */
  deleteAndLeak(o) {
    if (!o) {
      return;
    }
    if (this._toDispose.has(o)) {
      this._toDispose.delete(o);
      setParentOfDisposable(o, null);
    }
  }
}
class Disposable {
  /**
   * A disposable that does nothing when it is disposed of.
   *
   * TODO: This should not be a static property.
   */
  static None = Object.freeze({ dispose() {
  } });
  _store = new DisposableStore();
  constructor() {
    trackDisposable(this);
    setParentOfDisposable(this._store, this);
  }
  dispose() {
    markAsDisposed(this);
    this._store.dispose();
  }
  /**
   * Adds `o` to the collection of disposables managed by this object.
   */
  _register(o) {
    if (o === this) {
      throw new Error("Cannot register a disposable on itself!");
    }
    return this._store.add(o);
  }
}
class MutableDisposable {
  _value;
  _isDisposed = false;
  constructor() {
    trackDisposable(this);
  }
  get value() {
    return this._isDisposed ? void 0 : this._value;
  }
  set value(value) {
    if (this._isDisposed || value === this._value) {
      return;
    }
    this._value?.dispose();
    if (value) {
      setParentOfDisposable(value, this);
    }
    this._value = value;
  }
  /**
   * Resets the stored value and disposed of the previously stored value.
   */
  clear() {
    this.value = void 0;
  }
  dispose() {
    this._isDisposed = true;
    markAsDisposed(this);
    this._value?.dispose();
    this._value = void 0;
  }
  /**
   * Clears the value, but does not dispose it.
   * The old value is returned.
   */
  clearAndLeak() {
    const oldValue = this._value;
    this._value = void 0;
    if (oldValue) {
      setParentOfDisposable(oldValue, null);
    }
    return oldValue;
  }
}
class MandatoryMutableDisposable {
  _disposable = new MutableDisposable();
  _isDisposed = false;
  constructor(initialValue) {
    this._disposable.value = initialValue;
  }
  get value() {
    return this._disposable.value;
  }
  set value(value) {
    if (this._isDisposed || value === this._disposable.value) {
      return;
    }
    this._disposable.value = value;
  }
  dispose() {
    this._isDisposed = true;
    this._disposable.dispose();
  }
}
class RefCountedDisposable {
  constructor(_disposable) {
    this._disposable = _disposable;
  }
  _counter = 1;
  acquire() {
    this._counter++;
    return this;
  }
  release() {
    if (--this._counter === 0) {
      this._disposable.dispose();
    }
    return this;
  }
}
class SafeDisposable {
  dispose = () => {
  };
  unset = () => {
  };
  isset = () => false;
  constructor() {
    trackDisposable(this);
  }
  set(fn) {
    let callback = fn;
    this.unset = () => callback = void 0;
    this.isset = () => callback !== void 0;
    this.dispose = () => {
      if (callback) {
        callback();
        callback = void 0;
        markAsDisposed(this);
      }
    };
    return this;
  }
}
class ReferenceCollection {
  references = /* @__PURE__ */ new Map();
  acquire(key, ...args) {
    let reference = this.references.get(key);
    if (!reference) {
      reference = {
        counter: 0,
        object: this.createReferencedObject(key, ...args)
      };
      this.references.set(key, reference);
    }
    const { object } = reference;
    const dispose2 = createSingleCallFunction(() => {
      if (--reference.counter === 0) {
        this.destroyReferencedObject(key, reference.object);
        this.references.delete(key);
      }
    });
    reference.counter++;
    return { object, dispose: dispose2 };
  }
}
class AsyncReferenceCollection {
  constructor(referenceCollection) {
    this.referenceCollection = referenceCollection;
  }
  async acquire(key, ...args) {
    const ref = this.referenceCollection.acquire(key, ...args);
    try {
      const object = await ref.object;
      return {
        object,
        dispose: () => ref.dispose()
      };
    } catch (error) {
      ref.dispose();
      throw error;
    }
  }
}
class ImmortalReference {
  constructor(object) {
    this.object = object;
  }
  dispose() {
  }
}
function disposeOnReturn(fn) {
  const store = new DisposableStore();
  try {
    fn(store);
  } finally {
    store.dispose();
  }
}
class DisposableMap {
  _store = /* @__PURE__ */ new Map();
  _isDisposed = false;
  constructor() {
    trackDisposable(this);
  }
  /**
   * Disposes of all stored values and mark this object as disposed.
   *
   * Trying to use this object after it has been disposed of is an error.
   */
  dispose() {
    markAsDisposed(this);
    this._isDisposed = true;
    this.clearAndDisposeAll();
  }
  /**
   * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
   */
  clearAndDisposeAll() {
    if (!this._store.size) {
      return;
    }
    try {
      dispose(this._store.values());
    } finally {
      this._store.clear();
    }
  }
  has(key) {
    return this._store.has(key);
  }
  get size() {
    return this._store.size;
  }
  get(key) {
    return this._store.get(key);
  }
  set(key, value, skipDisposeOnOverwrite = false) {
    if (this._isDisposed) {
      console.warn(
        new Error(
          "Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!"
        ).stack
      );
    }
    if (!skipDisposeOnOverwrite) {
      this._store.get(key)?.dispose();
    }
    this._store.set(key, value);
  }
  /**
   * Delete the value stored for `key` from this map and also dispose of it.
   */
  deleteAndDispose(key) {
    this._store.get(key)?.dispose();
    this._store.delete(key);
  }
  /**
   * Delete the value stored for `key` from this map but return it. The caller is
   * responsible for disposing of the value.
   */
  deleteAndLeak(key) {
    const value = this._store.get(key);
    this._store.delete(key);
    return value;
  }
  keys() {
    return this._store.keys();
  }
  values() {
    return this._store.values();
  }
  [Symbol.iterator]() {
    return this._store[Symbol.iterator]();
  }
}
export {
  AsyncReferenceCollection,
  Disposable,
  DisposableMap,
  DisposableStore,
  DisposableTracker,
  ImmortalReference,
  MandatoryMutableDisposable,
  MutableDisposable,
  RefCountedDisposable,
  ReferenceCollection,
  SafeDisposable,
  combinedDisposable,
  dispose,
  disposeIfDisposable,
  disposeOnReturn,
  isDisposable,
  markAsDisposed,
  markAsSingleton,
  setDisposableTracker,
  toDisposable,
  trackDisposable
};
