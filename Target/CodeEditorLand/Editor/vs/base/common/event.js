var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { diffSets } from "./collections.js";
import { onUnexpectedError } from "./errors.js";
import { createSingleCallFunction } from "./functional.js";
import {
  Disposable,
  DisposableMap,
  DisposableStore,
  combinedDisposable,
  toDisposable
} from "./lifecycle.js";
import { LinkedList } from "./linkedList.js";
import { StopWatch } from "./stopwatch.js";
const _enableListenerGCedWarning = false;
const _enableDisposeWithListenerWarning = false;
const _enableSnapshotPotentialLeakWarning = false;
var Event;
((Event2) => {
  Event2.None = /* @__PURE__ */ __name(() => Disposable.None, "None");
  function _addLeakageTraceLogic(options) {
    if (_enableSnapshotPotentialLeakWarning) {
      const { onDidAddListener: origListenerDidAdd } = options;
      const stack = Stacktrace.create();
      let count = 0;
      options.onDidAddListener = () => {
        if (++count === 2) {
          console.warn(
            "snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here"
          );
          stack.print();
        }
        origListenerDidAdd?.();
      };
    }
  }
  __name(_addLeakageTraceLogic, "_addLeakageTraceLogic");
  function defer(event, disposable) {
    return debounce(
      event,
      () => void 0,
      0,
      void 0,
      true,
      void 0,
      disposable
    );
  }
  Event2.defer = defer;
  __name(defer, "defer");
  function once(event) {
    return (listener, thisArgs = null, disposables) => {
      let didFire = false;
      let result;
      result = event(
        (e) => {
          if (didFire) {
            return;
          } else if (result) {
            result.dispose();
          } else {
            didFire = true;
          }
          return listener.call(thisArgs, e);
        },
        null,
        disposables
      );
      if (didFire) {
        result.dispose();
      }
      return result;
    };
  }
  Event2.once = once;
  __name(once, "once");
  function onceIf(event, condition) {
    return Event2.once(Event2.filter(event, condition));
  }
  Event2.onceIf = onceIf;
  __name(onceIf, "onceIf");
  function map(event, map2, disposable) {
    return snapshot(
      (listener, thisArgs = null, disposables) => event(
        (i) => listener.call(thisArgs, map2(i)),
        null,
        disposables
      ),
      disposable
    );
  }
  Event2.map = map;
  __name(map, "map");
  function forEach(event, each, disposable) {
    return snapshot(
      (listener, thisArgs = null, disposables) => event(
        (i) => {
          each(i);
          listener.call(thisArgs, i);
        },
        null,
        disposables
      ),
      disposable
    );
  }
  Event2.forEach = forEach;
  __name(forEach, "forEach");
  function filter(event, filter2, disposable) {
    return snapshot(
      (listener, thisArgs = null, disposables) => event(
        (e) => filter2(e) && listener.call(thisArgs, e),
        null,
        disposables
      ),
      disposable
    );
  }
  Event2.filter = filter;
  __name(filter, "filter");
  function signal(event) {
    return event;
  }
  Event2.signal = signal;
  __name(signal, "signal");
  function any(...events) {
    return (listener, thisArgs = null, disposables) => {
      const disposable = combinedDisposable(
        ...events.map(
          (event) => event((e) => listener.call(thisArgs, e))
        )
      );
      return addAndReturnDisposable(disposable, disposables);
    };
  }
  Event2.any = any;
  __name(any, "any");
  function reduce(event, merge, initial, disposable) {
    let output = initial;
    return map(
      event,
      (e) => {
        output = merge(output, e);
        return output;
      },
      disposable
    );
  }
  Event2.reduce = reduce;
  __name(reduce, "reduce");
  function snapshot(event, disposable) {
    let listener;
    const options = {
      onWillAddFirstListener() {
        listener = event(emitter.fire, emitter);
      },
      onDidRemoveLastListener() {
        listener?.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options);
    }
    const emitter = new Emitter(options);
    disposable?.add(emitter);
    return emitter.event;
  }
  __name(snapshot, "snapshot");
  function addAndReturnDisposable(d, store) {
    if (store instanceof Array) {
      store.push(d);
    } else if (store) {
      store.add(d);
    }
    return d;
  }
  __name(addAndReturnDisposable, "addAndReturnDisposable");
  function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
    let subscription;
    let output;
    let handle;
    let numDebouncedCalls = 0;
    let doFire;
    const options = {
      leakWarningThreshold,
      onWillAddFirstListener() {
        subscription = event((cur) => {
          numDebouncedCalls++;
          output = merge(output, cur);
          if (leading && !handle) {
            emitter.fire(output);
            output = void 0;
          }
          doFire = /* @__PURE__ */ __name(() => {
            const _output = output;
            output = void 0;
            handle = void 0;
            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output);
            }
            numDebouncedCalls = 0;
          }, "doFire");
          if (typeof delay === "number") {
            clearTimeout(handle);
            handle = setTimeout(doFire, delay);
          } else if (handle === void 0) {
            handle = 0;
            queueMicrotask(doFire);
          }
        });
      },
      onWillRemoveListener() {
        if (flushOnListenerRemove && numDebouncedCalls > 0) {
          doFire?.();
        }
      },
      onDidRemoveLastListener() {
        doFire = void 0;
        subscription.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options);
    }
    const emitter = new Emitter(options);
    disposable?.add(emitter);
    return emitter.event;
  }
  Event2.debounce = debounce;
  __name(debounce, "debounce");
  function accumulate(event, delay = 0, disposable) {
    return Event2.debounce(
      event,
      (last, e) => {
        if (!last) {
          return [e];
        }
        last.push(e);
        return last;
      },
      delay,
      void 0,
      true,
      void 0,
      disposable
    );
  }
  Event2.accumulate = accumulate;
  __name(accumulate, "accumulate");
  function latch(event, equals = (a, b) => a === b, disposable) {
    let firstCall = true;
    let cache;
    return filter(
      event,
      (value) => {
        const shouldEmit = firstCall || !equals(value, cache);
        firstCall = false;
        cache = value;
        return shouldEmit;
      },
      disposable
    );
  }
  Event2.latch = latch;
  __name(latch, "latch");
  function split(event, isT, disposable) {
    return [
      Event2.filter(event, isT, disposable),
      Event2.filter(event, (e) => !isT(e), disposable)
    ];
  }
  Event2.split = split;
  __name(split, "split");
  function buffer(event, flushAfterTimeout = false, _buffer = [], disposable) {
    let buffer2 = _buffer.slice();
    let listener = event((e) => {
      if (buffer2) {
        buffer2.push(e);
      } else {
        emitter.fire(e);
      }
    });
    if (disposable) {
      disposable.add(listener);
    }
    const flush = /* @__PURE__ */ __name(() => {
      buffer2?.forEach((e) => emitter.fire(e));
      buffer2 = null;
    }, "flush");
    const emitter = new Emitter({
      onWillAddFirstListener() {
        if (!listener) {
          listener = event((e) => emitter.fire(e));
          if (disposable) {
            disposable.add(listener);
          }
        }
      },
      onDidAddFirstListener() {
        if (buffer2) {
          if (flushAfterTimeout) {
            setTimeout(flush);
          } else {
            flush();
          }
        }
      },
      onDidRemoveLastListener() {
        if (listener) {
          listener.dispose();
        }
        listener = null;
      }
    });
    if (disposable) {
      disposable.add(emitter);
    }
    return emitter.event;
  }
  Event2.buffer = buffer;
  __name(buffer, "buffer");
  function chain(event, sythensize) {
    const fn = /* @__PURE__ */ __name((listener, thisArgs, disposables) => {
      const cs = sythensize(
        new ChainableSynthesis()
      );
      return event(
        (value) => {
          const result = cs.evaluate(value);
          if (result !== HaltChainable) {
            listener.call(thisArgs, result);
          }
        },
        void 0,
        disposables
      );
    }, "fn");
    return fn;
  }
  Event2.chain = chain;
  __name(chain, "chain");
  const HaltChainable = Symbol("HaltChainable");
  class ChainableSynthesis {
    static {
      __name(this, "ChainableSynthesis");
    }
    steps = [];
    map(fn) {
      this.steps.push(fn);
      return this;
    }
    forEach(fn) {
      this.steps.push((v) => {
        fn(v);
        return v;
      });
      return this;
    }
    filter(fn) {
      this.steps.push((v) => fn(v) ? v : HaltChainable);
      return this;
    }
    reduce(merge, initial) {
      let last = initial;
      this.steps.push((v) => {
        last = merge(last, v);
        return last;
      });
      return this;
    }
    latch(equals = (a, b) => a === b) {
      let firstCall = true;
      let cache;
      this.steps.push((value) => {
        const shouldEmit = firstCall || !equals(value, cache);
        firstCall = false;
        cache = value;
        return shouldEmit ? value : HaltChainable;
      });
      return this;
    }
    evaluate(value) {
      for (const step of this.steps) {
        value = step(value);
        if (value === HaltChainable) {
          break;
        }
      }
      return value;
    }
  }
  function fromNodeEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = /* @__PURE__ */ __name((...args) => result.fire(map2(...args)), "fn");
    const onFirstListenerAdd = /* @__PURE__ */ __name(() => emitter.on(eventName, fn), "onFirstListenerAdd");
    const onLastListenerRemove = /* @__PURE__ */ __name(() => emitter.removeListener(eventName, fn), "onLastListenerRemove");
    const result = new Emitter({
      onWillAddFirstListener: onFirstListenerAdd,
      onDidRemoveLastListener: onLastListenerRemove
    });
    return result.event;
  }
  Event2.fromNodeEventEmitter = fromNodeEventEmitter;
  __name(fromNodeEventEmitter, "fromNodeEventEmitter");
  function fromDOMEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = /* @__PURE__ */ __name((...args) => result.fire(map2(...args)), "fn");
    const onFirstListenerAdd = /* @__PURE__ */ __name(() => emitter.addEventListener(eventName, fn), "onFirstListenerAdd");
    const onLastListenerRemove = /* @__PURE__ */ __name(() => emitter.removeEventListener(eventName, fn), "onLastListenerRemove");
    const result = new Emitter({
      onWillAddFirstListener: onFirstListenerAdd,
      onDidRemoveLastListener: onLastListenerRemove
    });
    return result.event;
  }
  Event2.fromDOMEventEmitter = fromDOMEventEmitter;
  __name(fromDOMEventEmitter, "fromDOMEventEmitter");
  function toPromise(event) {
    return new Promise((resolve) => once(event)(resolve));
  }
  Event2.toPromise = toPromise;
  __name(toPromise, "toPromise");
  function fromPromise(promise) {
    const result = new Emitter();
    promise.then(
      (res) => {
        result.fire(res);
      },
      () => {
        result.fire(void 0);
      }
    ).finally(() => {
      result.dispose();
    });
    return result.event;
  }
  Event2.fromPromise = fromPromise;
  __name(fromPromise, "fromPromise");
  function forward(from, to) {
    return from((e) => to.fire(e));
  }
  Event2.forward = forward;
  __name(forward, "forward");
  function runAndSubscribe(event, handler, initial) {
    handler(initial);
    return event((e) => handler(e));
  }
  Event2.runAndSubscribe = runAndSubscribe;
  __name(runAndSubscribe, "runAndSubscribe");
  class EmitterObserver {
    constructor(_observable, store) {
      this._observable = _observable;
      const options = {
        onWillAddFirstListener: /* @__PURE__ */ __name(() => {
          _observable.addObserver(this);
          this._observable.reportChanges();
        }, "onWillAddFirstListener"),
        onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
          _observable.removeObserver(this);
        }, "onDidRemoveLastListener")
      };
      if (!store) {
        _addLeakageTraceLogic(options);
      }
      this.emitter = new Emitter(options);
      if (store) {
        store.add(this.emitter);
      }
    }
    static {
      __name(this, "EmitterObserver");
    }
    emitter;
    _counter = 0;
    _hasChanged = false;
    beginUpdate(_observable) {
      this._counter++;
    }
    handlePossibleChange(_observable) {
    }
    handleChange(_observable, _change) {
      this._hasChanged = true;
    }
    endUpdate(_observable) {
      this._counter--;
      if (this._counter === 0) {
        this._observable.reportChanges();
        if (this._hasChanged) {
          this._hasChanged = false;
          this.emitter.fire(this._observable.get());
        }
      }
    }
  }
  function fromObservable(obs, store) {
    const observer = new EmitterObserver(obs, store);
    return observer.emitter.event;
  }
  Event2.fromObservable = fromObservable;
  __name(fromObservable, "fromObservable");
  function fromObservableLight(observable) {
    return (listener, thisArgs, disposables) => {
      let count = 0;
      let didChange = false;
      const observer = {
        beginUpdate() {
          count++;
        },
        endUpdate() {
          count--;
          if (count === 0) {
            observable.reportChanges();
            if (didChange) {
              didChange = false;
              listener.call(thisArgs);
            }
          }
        },
        handlePossibleChange() {
        },
        handleChange() {
          didChange = true;
        }
      };
      observable.addObserver(observer);
      observable.reportChanges();
      const disposable = {
        dispose() {
          observable.removeObserver(observer);
        }
      };
      if (disposables instanceof DisposableStore) {
        disposables.add(disposable);
      } else if (Array.isArray(disposables)) {
        disposables.push(disposable);
      }
      return disposable;
    };
  }
  Event2.fromObservableLight = fromObservableLight;
  __name(fromObservableLight, "fromObservableLight");
})(Event || (Event = {}));
class EventProfiling {
  static {
    __name(this, "EventProfiling");
  }
  static all = /* @__PURE__ */ new Set();
  static _idPool = 0;
  name;
  listenerCount = 0;
  invocationCount = 0;
  elapsedOverall = 0;
  durations = [];
  _stopWatch;
  constructor(name) {
    this.name = `${name}_${EventProfiling._idPool++}`;
    EventProfiling.all.add(this);
  }
  start(listenerCount) {
    this._stopWatch = new StopWatch();
    this.listenerCount = listenerCount;
  }
  stop() {
    if (this._stopWatch) {
      const elapsed = this._stopWatch.elapsed();
      this.durations.push(elapsed);
      this.elapsedOverall += elapsed;
      this.invocationCount += 1;
      this._stopWatch = void 0;
    }
  }
}
let _globalLeakWarningThreshold = -1;
function setGlobalLeakWarningThreshold(n) {
  const oldValue = _globalLeakWarningThreshold;
  _globalLeakWarningThreshold = n;
  return {
    dispose() {
      _globalLeakWarningThreshold = oldValue;
    }
  };
}
__name(setGlobalLeakWarningThreshold, "setGlobalLeakWarningThreshold");
class LeakageMonitor {
  constructor(_errorHandler, threshold, name = (LeakageMonitor._idPool++).toString(16).padStart(3, "0")) {
    this._errorHandler = _errorHandler;
    this.threshold = threshold;
    this.name = name;
  }
  static {
    __name(this, "LeakageMonitor");
  }
  static _idPool = 1;
  _stacks;
  _warnCountdown = 0;
  dispose() {
    this._stacks?.clear();
  }
  check(stack, listenerCount) {
    const threshold = this.threshold;
    if (threshold <= 0 || listenerCount < threshold) {
      return void 0;
    }
    if (!this._stacks) {
      this._stacks = /* @__PURE__ */ new Map();
    }
    const count = this._stacks.get(stack.value) || 0;
    this._stacks.set(stack.value, count + 1);
    this._warnCountdown -= 1;
    if (this._warnCountdown <= 0) {
      this._warnCountdown = threshold * 0.5;
      const [topStack, topCount] = this.getMostFrequentStack();
      const message = `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`;
      console.warn(message);
      console.warn(topStack);
      const error = new ListenerLeakError(message, topStack);
      this._errorHandler(error);
    }
    return () => {
      const count2 = this._stacks.get(stack.value) || 0;
      this._stacks.set(stack.value, count2 - 1);
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) {
      return void 0;
    }
    let topStack;
    let topCount = 0;
    for (const [stack, count] of this._stacks) {
      if (!topStack || topCount < count) {
        topStack = [stack, count];
        topCount = count;
      }
    }
    return topStack;
  }
}
class Stacktrace {
  constructor(value) {
    this.value = value;
  }
  static {
    __name(this, "Stacktrace");
  }
  static create() {
    const err = new Error();
    return new Stacktrace(err.stack ?? "");
  }
  print() {
    console.warn(this.value.split("\n").slice(2).join("\n"));
  }
}
class ListenerLeakError extends Error {
  static {
    __name(this, "ListenerLeakError");
  }
  constructor(message, stack) {
    super(message);
    this.name = "ListenerLeakError";
    this.stack = stack;
  }
}
class ListenerRefusalError extends Error {
  static {
    __name(this, "ListenerRefusalError");
  }
  constructor(message, stack) {
    super(message);
    this.name = "ListenerRefusalError";
    this.stack = stack;
  }
}
let id = 0;
class UniqueContainer {
  constructor(value) {
    this.value = value;
  }
  static {
    __name(this, "UniqueContainer");
  }
  stack;
  id = id++;
}
const compactionThreshold = 2;
const forEachListener = /* @__PURE__ */ __name((listeners, fn) => {
  if (listeners instanceof UniqueContainer) {
    fn(listeners);
  } else {
    for (let i = 0; i < listeners.length; i++) {
      const l = listeners[i];
      if (l) {
        fn(l);
      }
    }
  }
}, "forEachListener");
let _listenerFinalizers;
if (_enableListenerGCedWarning) {
  const leaks = [];
  setInterval(() => {
    if (leaks.length === 0) {
      return;
    }
    console.warn(
      "[LEAKING LISTENERS] GC'ed these listeners that were NOT yet disposed:"
    );
    console.warn(leaks.join("\n"));
    leaks.length = 0;
  }, 3e3);
  _listenerFinalizers = new FinalizationRegistry((heldValue) => {
    if (typeof heldValue === "string") {
      leaks.push(heldValue);
    }
  });
}
class Emitter {
  static {
    __name(this, "Emitter");
  }
  _options;
  _leakageMon;
  _perfMon;
  _disposed;
  _event;
  /**
   * A listener, or list of listeners. A single listener is the most common
   * for event emitters (#185789), so we optimize that special case to avoid
   * wrapping it in an array (just like Node.js itself.)
   *
   * A list of listeners never 'downgrades' back to a plain function if
   * listeners are removed, for two reasons:
   *
   *  1. That's complicated (especially with the deliveryQueue)
   *  2. A listener with >1 listener is likely to have >1 listener again at
   *     some point, and swapping between arrays and functions may[citation needed]
   *     introduce unnecessary work and garbage.
   *
   * The array listeners can be 'sparse', to avoid reallocating the array
   * whenever any listener is added or removed. If more than `1 / compactionThreshold`
   * of the array is empty, only then is it resized.
   */
  _listeners;
  /**
   * Always to be defined if _listeners is an array. It's no longer a true
   * queue, but holds the dispatching 'state'. If `fire()` is called on an
   * emitter, any work left in the _deliveryQueue is finished first.
   */
  _deliveryQueue;
  _size = 0;
  constructor(options) {
    this._options = options;
    this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(
      options?.onListenerError ?? onUnexpectedError,
      this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold
    ) : void 0;
    this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : void 0;
    this._deliveryQueue = this._options?.deliveryQueue;
  }
  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      if (this._deliveryQueue?.current === this) {
        this._deliveryQueue.reset();
      }
      if (this._listeners) {
        if (_enableDisposeWithListenerWarning) {
          const listeners = this._listeners;
          queueMicrotask(() => {
            forEachListener(listeners, (l) => l.stack?.print());
          });
        }
        this._listeners = void 0;
        this._size = 0;
      }
      this._options?.onDidRemoveLastListener?.();
      this._leakageMon?.dispose();
    }
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event() {
    this._event ??= (callback, thisArgs, disposables) => {
      if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
        const message = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
        console.warn(message);
        const tuple = this._leakageMon.getMostFrequentStack() ?? [
          "UNKNOWN stack",
          -1
        ];
        const error = new ListenerRefusalError(
          `${message}. HINT: Stack shows most frequent listener (${tuple[1]}-times)`,
          tuple[0]
        );
        const errorHandler = this._options?.onListenerError || onUnexpectedError;
        errorHandler(error);
        return Disposable.None;
      }
      if (this._disposed) {
        return Disposable.None;
      }
      if (thisArgs) {
        callback = callback.bind(thisArgs);
      }
      const contained = new UniqueContainer(callback);
      let removeMonitor;
      let stack;
      if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
        contained.stack = Stacktrace.create();
        removeMonitor = this._leakageMon.check(
          contained.stack,
          this._size + 1
        );
      }
      if (_enableDisposeWithListenerWarning) {
        contained.stack = stack ?? Stacktrace.create();
      }
      if (!this._listeners) {
        this._options?.onWillAddFirstListener?.(this);
        this._listeners = contained;
        this._options?.onDidAddFirstListener?.(this);
      } else if (this._listeners instanceof UniqueContainer) {
        this._deliveryQueue ??= new EventDeliveryQueuePrivate();
        this._listeners = [this._listeners, contained];
      } else {
        this._listeners.push(contained);
      }
      this._size++;
      const result = toDisposable(() => {
        _listenerFinalizers?.unregister(result);
        removeMonitor?.();
        this._removeListener(contained);
      });
      if (disposables instanceof DisposableStore) {
        disposables.add(result);
      } else if (Array.isArray(disposables)) {
        disposables.push(result);
      }
      if (_listenerFinalizers) {
        const stack2 = new Error().stack.split("\n").slice(2, 3).join("\n").trim();
        const match = /(file:|vscode-file:\/\/vscode-app)?(\/[^:]*:\d+:\d+)/.exec(
          stack2
        );
        _listenerFinalizers.register(
          result,
          match?.[2] ?? stack2,
          result
        );
      }
      return result;
    };
    return this._event;
  }
  _removeListener(listener) {
    this._options?.onWillRemoveListener?.(this);
    if (!this._listeners) {
      return;
    }
    if (this._size === 1) {
      this._listeners = void 0;
      this._options?.onDidRemoveLastListener?.(this);
      this._size = 0;
      return;
    }
    const listeners = this._listeners;
    const index = listeners.indexOf(listener);
    if (index === -1) {
      console.log("disposed?", this._disposed);
      console.log("size?", this._size);
      console.log("arr?", JSON.stringify(this._listeners));
      throw new Error("Attempted to dispose unknown listener");
    }
    this._size--;
    listeners[index] = void 0;
    const adjustDeliveryQueue = this._deliveryQueue.current === this;
    if (this._size * compactionThreshold <= listeners.length) {
      let n = 0;
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]) {
          listeners[n++] = listeners[i];
        } else if (adjustDeliveryQueue) {
          this._deliveryQueue.end--;
          if (n < this._deliveryQueue.i) {
            this._deliveryQueue.i--;
          }
        }
      }
      listeners.length = n;
    }
  }
  _deliver(listener, value) {
    if (!listener) {
      return;
    }
    const errorHandler = this._options?.onListenerError || onUnexpectedError;
    if (!errorHandler) {
      listener.value(value);
      return;
    }
    try {
      listener.value(value);
    } catch (e) {
      errorHandler(e);
    }
  }
  /** Delivers items in the queue. Assumes the queue is ready to go. */
  _deliverQueue(dq) {
    const listeners = dq.current._listeners;
    while (dq.i < dq.end) {
      this._deliver(listeners[dq.i++], dq.value);
    }
    dq.reset();
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event) {
    if (this._deliveryQueue?.current) {
      this._deliverQueue(this._deliveryQueue);
      this._perfMon?.stop();
    }
    this._perfMon?.start(this._size);
    if (!this._listeners) {
    } else if (this._listeners instanceof UniqueContainer) {
      this._deliver(this._listeners, event);
    } else {
      const dq = this._deliveryQueue;
      dq.enqueue(this, event, this._listeners.length);
      this._deliverQueue(dq);
    }
    this._perfMon?.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
}
const createEventDeliveryQueue = /* @__PURE__ */ __name(() => new EventDeliveryQueuePrivate(), "createEventDeliveryQueue");
class EventDeliveryQueuePrivate {
  static {
    __name(this, "EventDeliveryQueuePrivate");
  }
  /**
   * Index in current's listener list.
   */
  i = -1;
  /**
   * The last index in the listener's list to deliver.
   */
  end = 0;
  /**
   * Emitter currently being dispatched on. Emitter._listeners is always an array.
   */
  current;
  /**
   * Currently emitting value. Defined whenever `current` is.
   */
  value;
  enqueue(emitter, value, end) {
    this.i = 0;
    this.end = end;
    this.current = emitter;
    this.value = value;
  }
  reset() {
    this.i = this.end;
    this.current = void 0;
    this.value = void 0;
  }
}
class AsyncEmitter extends Emitter {
  static {
    __name(this, "AsyncEmitter");
  }
  _asyncDeliveryQueue;
  async fireAsync(data, token, promiseJoin) {
    if (!this._listeners) {
      return;
    }
    if (!this._asyncDeliveryQueue) {
      this._asyncDeliveryQueue = new LinkedList();
    }
    forEachListener(
      this._listeners,
      (listener) => this._asyncDeliveryQueue.push([listener.value, data])
    );
    while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
      const [listener, data2] = this._asyncDeliveryQueue.shift();
      const thenables = [];
      const event = {
        ...data2,
        token,
        waitUntil: /* @__PURE__ */ __name((p) => {
          if (Object.isFrozen(thenables)) {
            throw new Error(
              "waitUntil can NOT be called asynchronous"
            );
          }
          if (promiseJoin) {
            p = promiseJoin(p, listener);
          }
          thenables.push(p);
        }, "waitUntil")
      };
      try {
        listener(event);
      } catch (e) {
        onUnexpectedError(e);
        continue;
      }
      Object.freeze(thenables);
      await Promise.allSettled(thenables).then((values) => {
        for (const value of values) {
          if (value.status === "rejected") {
            onUnexpectedError(value.reason);
          }
        }
      });
    }
  }
}
class PauseableEmitter extends Emitter {
  static {
    __name(this, "PauseableEmitter");
  }
  _isPaused = 0;
  _eventQueue = new LinkedList();
  _mergeFn;
  get isPaused() {
    return this._isPaused !== 0;
  }
  constructor(options) {
    super(options);
    this._mergeFn = options?.merge;
  }
  pause() {
    this._isPaused++;
  }
  resume() {
    if (this._isPaused !== 0 && --this._isPaused === 0) {
      if (this._mergeFn) {
        if (this._eventQueue.size > 0) {
          const events = Array.from(this._eventQueue);
          this._eventQueue.clear();
          super.fire(this._mergeFn(events));
        }
      } else {
        while (!this._isPaused && this._eventQueue.size !== 0) {
          super.fire(this._eventQueue.shift());
        }
      }
    }
  }
  fire(event) {
    if (this._size) {
      if (this._isPaused !== 0) {
        this._eventQueue.push(event);
      } else {
        super.fire(event);
      }
    }
  }
}
class DebounceEmitter extends PauseableEmitter {
  static {
    __name(this, "DebounceEmitter");
  }
  _delay;
  _handle;
  constructor(options) {
    super(options);
    this._delay = options.delay ?? 100;
  }
  fire(event) {
    if (!this._handle) {
      this.pause();
      this._handle = setTimeout(() => {
        this._handle = void 0;
        this.resume();
      }, this._delay);
    }
    super.fire(event);
  }
}
class MicrotaskEmitter extends Emitter {
  static {
    __name(this, "MicrotaskEmitter");
  }
  _queuedEvents = [];
  _mergeFn;
  constructor(options) {
    super(options);
    this._mergeFn = options?.merge;
  }
  fire(event) {
    if (!this.hasListeners()) {
      return;
    }
    this._queuedEvents.push(event);
    if (this._queuedEvents.length === 1) {
      queueMicrotask(() => {
        if (this._mergeFn) {
          super.fire(this._mergeFn(this._queuedEvents));
        } else {
          this._queuedEvents.forEach((e) => super.fire(e));
        }
        this._queuedEvents = [];
      });
    }
  }
}
class EventMultiplexer {
  static {
    __name(this, "EventMultiplexer");
  }
  emitter;
  hasListeners = false;
  events = [];
  constructor() {
    this.emitter = new Emitter({
      onWillAddFirstListener: /* @__PURE__ */ __name(() => this.onFirstListenerAdd(), "onWillAddFirstListener"),
      onDidRemoveLastListener: /* @__PURE__ */ __name(() => this.onLastListenerRemove(), "onDidRemoveLastListener")
    });
  }
  get event() {
    return this.emitter.event;
  }
  add(event) {
    const e = { event, listener: null };
    this.events.push(e);
    if (this.hasListeners) {
      this.hook(e);
    }
    const dispose = /* @__PURE__ */ __name(() => {
      if (this.hasListeners) {
        this.unhook(e);
      }
      const idx = this.events.indexOf(e);
      this.events.splice(idx, 1);
    }, "dispose");
    return toDisposable(createSingleCallFunction(dispose));
  }
  onFirstListenerAdd() {
    this.hasListeners = true;
    this.events.forEach((e) => this.hook(e));
  }
  onLastListenerRemove() {
    this.hasListeners = false;
    this.events.forEach((e) => this.unhook(e));
  }
  hook(e) {
    e.listener = e.event((r) => this.emitter.fire(r));
  }
  unhook(e) {
    e.listener?.dispose();
    e.listener = null;
  }
  dispose() {
    this.emitter.dispose();
    for (const e of this.events) {
      e.listener?.dispose();
    }
    this.events = [];
  }
}
class DynamicListEventMultiplexer {
  static {
    __name(this, "DynamicListEventMultiplexer");
  }
  _store = new DisposableStore();
  event;
  constructor(items, onAddItem, onRemoveItem, getEvent) {
    const multiplexer = this._store.add(new EventMultiplexer());
    const itemListeners = this._store.add(
      new DisposableMap()
    );
    function addItem(instance) {
      itemListeners.set(instance, multiplexer.add(getEvent(instance)));
    }
    __name(addItem, "addItem");
    for (const instance of items) {
      addItem(instance);
    }
    this._store.add(
      onAddItem((instance) => {
        addItem(instance);
      })
    );
    this._store.add(
      onRemoveItem((instance) => {
        itemListeners.deleteAndDispose(instance);
      })
    );
    this.event = multiplexer.event;
  }
  dispose() {
    this._store.dispose();
  }
}
class EventBufferer {
  static {
    __name(this, "EventBufferer");
  }
  data = [];
  wrapEvent(event, reduce, initial) {
    return (listener, thisArgs, disposables) => {
      return event(
        (i) => {
          const data = this.data[this.data.length - 1];
          if (!reduce) {
            if (data) {
              data.buffers.push(() => listener.call(thisArgs, i));
            } else {
              listener.call(thisArgs, i);
            }
            return;
          }
          const reduceData = data;
          if (!reduceData) {
            listener.call(thisArgs, reduce(initial, i));
            return;
          }
          reduceData.items ??= [];
          reduceData.items.push(i);
          if (reduceData.buffers.length === 0) {
            data.buffers.push(() => {
              reduceData.reducedResult ??= initial ? reduceData.items.reduce(
                reduce,
                initial
              ) : reduceData.items.reduce(
                reduce
              );
              listener.call(thisArgs, reduceData.reducedResult);
            });
          }
        },
        void 0,
        disposables
      );
    };
  }
  bufferEvents(fn) {
    const data = { buffers: new Array() };
    this.data.push(data);
    const r = fn();
    this.data.pop();
    data.buffers.forEach((flush) => flush());
    return r;
  }
}
class Relay {
  static {
    __name(this, "Relay");
  }
  listening = false;
  inputEvent = Event.None;
  inputEventListener = Disposable.None;
  emitter = new Emitter({
    onDidAddFirstListener: /* @__PURE__ */ __name(() => {
      this.listening = true;
      this.inputEventListener = this.inputEvent(
        this.emitter.fire,
        this.emitter
      );
    }, "onDidAddFirstListener"),
    onDidRemoveLastListener: /* @__PURE__ */ __name(() => {
      this.listening = false;
      this.inputEventListener.dispose();
    }, "onDidRemoveLastListener")
  });
  event = this.emitter.event;
  set input(event) {
    this.inputEvent = event;
    if (this.listening) {
      this.inputEventListener.dispose();
      this.inputEventListener = event(this.emitter.fire, this.emitter);
    }
  }
  dispose() {
    this.inputEventListener.dispose();
    this.emitter.dispose();
  }
}
class ValueWithChangeEvent {
  constructor(_value) {
    this._value = _value;
  }
  static {
    __name(this, "ValueWithChangeEvent");
  }
  static const(value) {
    return new ConstValueWithChangeEvent(value);
  }
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  get value() {
    return this._value;
  }
  set value(value) {
    if (value !== this._value) {
      this._value = value;
      this._onDidChange.fire(void 0);
    }
  }
}
class ConstValueWithChangeEvent {
  constructor(value) {
    this.value = value;
  }
  static {
    __name(this, "ConstValueWithChangeEvent");
  }
  onDidChange = Event.None;
}
function trackSetChanges(getData, onDidChangeData, handleItem) {
  const map = new DisposableMap();
  let oldData = new Set(getData());
  for (const d of oldData) {
    map.set(d, handleItem(d));
  }
  const store = new DisposableStore();
  store.add(
    onDidChangeData(() => {
      const newData = getData();
      const diff = diffSets(oldData, newData);
      for (const r of diff.removed) {
        map.deleteAndDispose(r);
      }
      for (const a of diff.added) {
        map.set(a, handleItem(a));
      }
      oldData = new Set(newData);
    })
  );
  store.add(map);
  return store;
}
__name(trackSetChanges, "trackSetChanges");
export {
  AsyncEmitter,
  DebounceEmitter,
  DynamicListEventMultiplexer,
  Emitter,
  Event,
  EventBufferer,
  EventMultiplexer,
  EventProfiling,
  ListenerLeakError,
  ListenerRefusalError,
  MicrotaskEmitter,
  PauseableEmitter,
  Relay,
  ValueWithChangeEvent,
  createEventDeliveryQueue,
  setGlobalLeakWarningThreshold,
  trackSetChanges
};
//# sourceMappingURL=event.js.map
