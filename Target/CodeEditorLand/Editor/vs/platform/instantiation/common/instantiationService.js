var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { GlobalIdleValue } from "../../../base/common/async.js";
import { illegalState } from "../../../base/common/errors.js";
import {
  dispose,
  isDisposable,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { LinkedList } from "../../../base/common/linkedList.js";
import { SyncDescriptor } from "./descriptors.js";
import { Graph } from "./graph.js";
import {
  IInstantiationService,
  _util
} from "./instantiation.js";
import { ServiceCollection } from "./serviceCollection.js";
const _enableAllTracing = false;
class CyclicDependencyError extends Error {
  static {
    __name(this, "CyclicDependencyError");
  }
  constructor(graph) {
    super("cyclic dependency between services");
    this.message = graph.findCycleSlow() ?? `UNABLE to detect cycle, dumping graph: 
${graph.toString()}`;
  }
}
class InstantiationService {
  constructor(_services = new ServiceCollection(), _strict = false, _parent, _enableTracing = _enableAllTracing) {
    this._services = _services;
    this._strict = _strict;
    this._parent = _parent;
    this._enableTracing = _enableTracing;
    this._services.set(IInstantiationService, this);
    this._globalGraph = _enableTracing ? _parent?._globalGraph ?? new Graph((e) => e) : void 0;
  }
  static {
    __name(this, "InstantiationService");
  }
  _globalGraph;
  _globalGraphImplicitDependency;
  _isDisposed = false;
  _servicesToMaybeDispose = /* @__PURE__ */ new Set();
  _children = /* @__PURE__ */ new Set();
  dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      dispose(this._children);
      this._children.clear();
      for (const candidate of this._servicesToMaybeDispose) {
        if (isDisposable(candidate)) {
          candidate.dispose();
        }
      }
      this._servicesToMaybeDispose.clear();
    }
  }
  _throwIfDisposed() {
    if (this._isDisposed) {
      throw new Error("InstantiationService has been disposed");
    }
  }
  createChild(services, store) {
    this._throwIfDisposed();
    const that = this;
    const result = new class extends InstantiationService {
      dispose() {
        that._children.delete(result);
        super.dispose();
      }
    }(services, this._strict, this, this._enableTracing);
    this._children.add(result);
    store?.add(result);
    return result;
  }
  invokeFunction(fn, ...args) {
    this._throwIfDisposed();
    const _trace = Trace.traceInvocation(this._enableTracing, fn);
    let _done = false;
    try {
      const accessor = {
        get: /* @__PURE__ */ __name((id) => {
          if (_done) {
            throw illegalState(
              "service accessor is only valid during the invocation of its target method"
            );
          }
          const result = this._getOrCreateServiceInstance(id, _trace);
          if (!result) {
            throw new Error(
              `[invokeFunction] unknown service '${id}'`
            );
          }
          return result;
        }, "get")
      };
      return fn(accessor, ...args);
    } finally {
      _done = true;
      _trace.stop();
    }
  }
  createInstance(ctorOrDescriptor, ...rest) {
    this._throwIfDisposed();
    let _trace;
    let result;
    if (ctorOrDescriptor instanceof SyncDescriptor) {
      _trace = Trace.traceCreation(
        this._enableTracing,
        ctorOrDescriptor.ctor
      );
      result = this._createInstance(
        ctorOrDescriptor.ctor,
        ctorOrDescriptor.staticArguments.concat(rest),
        _trace
      );
    } else {
      _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor);
      result = this._createInstance(ctorOrDescriptor, rest, _trace);
    }
    _trace.stop();
    return result;
  }
  _createInstance(ctor, args = [], _trace) {
    const serviceDependencies = _util.getServiceDependencies(ctor).sort((a, b) => a.index - b.index);
    const serviceArgs = [];
    for (const dependency of serviceDependencies) {
      const service = this._getOrCreateServiceInstance(
        dependency.id,
        _trace
      );
      if (!service) {
        this._throwIfStrict(
          `[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id}.`,
          false
        );
      }
      serviceArgs.push(service);
    }
    const firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
    if (args.length !== firstServiceArgPos) {
      console.trace(
        `[createInstance] First service dependency of ${ctor.name} at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments`
      );
      const delta = firstServiceArgPos - args.length;
      if (delta > 0) {
        args = args.concat(new Array(delta));
      } else {
        args = args.slice(0, firstServiceArgPos);
      }
    }
    return Reflect.construct(ctor, args.concat(serviceArgs));
  }
  _setCreatedServiceInstance(id, instance) {
    if (this._services.get(id) instanceof SyncDescriptor) {
      this._services.set(id, instance);
    } else if (this._parent) {
      this._parent._setCreatedServiceInstance(id, instance);
    } else {
      throw new Error("illegalState - setting UNKNOWN service instance");
    }
  }
  _getServiceInstanceOrDescriptor(id) {
    const instanceOrDesc = this._services.get(id);
    if (!instanceOrDesc && this._parent) {
      return this._parent._getServiceInstanceOrDescriptor(id);
    } else {
      return instanceOrDesc;
    }
  }
  _getOrCreateServiceInstance(id, _trace) {
    if (this._globalGraph && this._globalGraphImplicitDependency) {
      this._globalGraph.insertEdge(
        this._globalGraphImplicitDependency,
        String(id)
      );
    }
    const thing = this._getServiceInstanceOrDescriptor(id);
    if (thing instanceof SyncDescriptor) {
      return this._safeCreateAndCacheServiceInstance(
        id,
        thing,
        _trace.branch(id, true)
      );
    } else {
      _trace.branch(id, false);
      return thing;
    }
  }
  _activeInstantiations = /* @__PURE__ */ new Set();
  _safeCreateAndCacheServiceInstance(id, desc, _trace) {
    if (this._activeInstantiations.has(id)) {
      throw new Error(
        `illegal state - RECURSIVELY instantiating service '${id}'`
      );
    }
    this._activeInstantiations.add(id);
    try {
      return this._createAndCacheServiceInstance(id, desc, _trace);
    } finally {
      this._activeInstantiations.delete(id);
    }
  }
  _createAndCacheServiceInstance(id, desc, _trace) {
    const graph = new Graph((data) => data.id.toString());
    let cycleCount = 0;
    const stack = [{ id, desc, _trace }];
    const seen = /* @__PURE__ */ new Set();
    while (stack.length) {
      const item = stack.pop();
      if (seen.has(String(item.id))) {
        continue;
      }
      seen.add(String(item.id));
      graph.lookupOrInsertNode(item);
      if (cycleCount++ > 1e3) {
        throw new CyclicDependencyError(graph);
      }
      for (const dependency of _util.getServiceDependencies(
        item.desc.ctor
      )) {
        const instanceOrDesc = this._getServiceInstanceOrDescriptor(
          dependency.id
        );
        if (!instanceOrDesc) {
          this._throwIfStrict(
            `[createInstance] ${id} depends on ${dependency.id} which is NOT registered.`,
            true
          );
        }
        this._globalGraph?.insertEdge(
          String(item.id),
          String(dependency.id)
        );
        if (instanceOrDesc instanceof SyncDescriptor) {
          const d = {
            id: dependency.id,
            desc: instanceOrDesc,
            _trace: item._trace.branch(dependency.id, true)
          };
          graph.insertEdge(item, d);
          stack.push(d);
        }
      }
    }
    while (true) {
      const roots = graph.roots();
      if (roots.length === 0) {
        if (!graph.isEmpty()) {
          throw new CyclicDependencyError(graph);
        }
        break;
      }
      for (const { data } of roots) {
        const instanceOrDesc = this._getServiceInstanceOrDescriptor(
          data.id
        );
        if (instanceOrDesc instanceof SyncDescriptor) {
          const instance = this._createServiceInstanceWithOwner(
            data.id,
            data.desc.ctor,
            data.desc.staticArguments,
            data.desc.supportsDelayedInstantiation,
            data._trace
          );
          this._setCreatedServiceInstance(data.id, instance);
        }
        graph.removeNode(data);
      }
    }
    return this._getServiceInstanceOrDescriptor(id);
  }
  _createServiceInstanceWithOwner(id, ctor, args = [], supportsDelayedInstantiation, _trace) {
    if (this._services.get(id) instanceof SyncDescriptor) {
      return this._createServiceInstance(
        id,
        ctor,
        args,
        supportsDelayedInstantiation,
        _trace,
        this._servicesToMaybeDispose
      );
    } else if (this._parent) {
      return this._parent._createServiceInstanceWithOwner(
        id,
        ctor,
        args,
        supportsDelayedInstantiation,
        _trace
      );
    } else {
      throw new Error(
        `illegalState - creating UNKNOWN service instance ${ctor.name}`
      );
    }
  }
  _createServiceInstance(id, ctor, args = [], supportsDelayedInstantiation, _trace, disposeBucket) {
    if (supportsDelayedInstantiation) {
      const child = new InstantiationService(
        void 0,
        this._strict,
        this,
        this._enableTracing
      );
      child._globalGraphImplicitDependency = String(id);
      const earlyListeners = /* @__PURE__ */ new Map();
      const idle = new GlobalIdleValue(() => {
        const result = child._createInstance(ctor, args, _trace);
        for (const [key, values] of earlyListeners) {
          const candidate = result[key];
          if (typeof candidate === "function") {
            for (const value of values) {
              value.disposable = candidate.apply(
                result,
                value.listener
              );
            }
          }
        }
        earlyListeners.clear();
        disposeBucket.add(result);
        return result;
      });
      return new Proxy(/* @__PURE__ */ Object.create(null), {
        get(target, key) {
          if (!idle.isInitialized) {
            if (typeof key === "string" && (key.startsWith("onDid") || key.startsWith("onWill"))) {
              let list = earlyListeners.get(key);
              if (!list) {
                list = new LinkedList();
                earlyListeners.set(key, list);
              }
              const event = /* @__PURE__ */ __name((callback, thisArg, disposables) => {
                if (idle.isInitialized) {
                  return idle.value[key](
                    callback,
                    thisArg,
                    disposables
                  );
                } else {
                  const entry = {
                    listener: [
                      callback,
                      thisArg,
                      disposables
                    ],
                    disposable: void 0
                  };
                  const rm = list.push(entry);
                  const result = toDisposable(() => {
                    rm();
                    entry.disposable?.dispose();
                  });
                  return result;
                }
              }, "event");
              return event;
            }
          }
          if (key in target) {
            return target[key];
          }
          const obj = idle.value;
          let prop = obj[key];
          if (typeof prop !== "function") {
            return prop;
          }
          prop = prop.bind(obj);
          target[key] = prop;
          return prop;
        },
        set(_target, p, value) {
          idle.value[p] = value;
          return true;
        },
        getPrototypeOf(_target) {
          return ctor.prototype;
        }
      });
    } else {
      const result = this._createInstance(ctor, args, _trace);
      disposeBucket.add(result);
      return result;
    }
  }
  _throwIfStrict(msg, printWarning) {
    if (printWarning) {
      console.warn(msg);
    }
    if (this._strict) {
      throw new Error(msg);
    }
  }
}
var TraceType = /* @__PURE__ */ ((TraceType2) => {
  TraceType2[TraceType2["None"] = 0] = "None";
  TraceType2[TraceType2["Creation"] = 1] = "Creation";
  TraceType2[TraceType2["Invocation"] = 2] = "Invocation";
  TraceType2[TraceType2["Branch"] = 3] = "Branch";
  return TraceType2;
})(TraceType || {});
class Trace {
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }
  static {
    __name(this, "Trace");
  }
  static all = /* @__PURE__ */ new Set();
  static _None = new class extends Trace {
    constructor() {
      super(0 /* None */, null);
    }
    stop() {
    }
    branch() {
      return this;
    }
  }();
  static traceInvocation(_enableTracing, ctor) {
    return _enableTracing ? new Trace(
      2 /* Invocation */,
      ctor.name || new Error().stack.split("\n").slice(3, 4).join("\n")
    ) : Trace._None;
  }
  static traceCreation(_enableTracing, ctor) {
    return _enableTracing ? new Trace(1 /* Creation */, ctor.name) : Trace._None;
  }
  static _totals = 0;
  _start = Date.now();
  _dep = [];
  branch(id, first) {
    const child = new Trace(3 /* Branch */, id.toString());
    this._dep.push([id, first, child]);
    return child;
  }
  stop() {
    const dur = Date.now() - this._start;
    Trace._totals += dur;
    let causedCreation = false;
    function printChild(n, trace) {
      const res = [];
      const prefix = new Array(n + 1).join("	");
      for (const [id, first, child] of trace._dep) {
        if (first && child) {
          causedCreation = true;
          res.push(`${prefix}CREATES -> ${id}`);
          const nested = printChild(n + 1, child);
          if (nested) {
            res.push(nested);
          }
        } else {
          res.push(`${prefix}uses -> ${id}`);
        }
      }
      return res.join("\n");
    }
    __name(printChild, "printChild");
    const lines = [
      `${this.type === 1 /* Creation */ ? "CREATE" : "CALL"} ${this.name}`,
      `${printChild(1, this)}`,
      `DONE, took ${dur.toFixed(2)}ms (grand total ${Trace._totals.toFixed(2)}ms)`
    ];
    if (dur > 2 || causedCreation) {
      Trace.all.add(lines.join("\n"));
    }
  }
}
export {
  InstantiationService,
  Trace
};
//# sourceMappingURL=instantiationService.js.map
