var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isThenable } from "../../../../base/common/async.js";
import { CharCode } from "../../../../base/common/charCode.js";
import { IExtHostRpcService } from "../../common/extHostRpcService.js";
import { IExtHostContext } from "../../../services/extensions/common/extHostCustomers.js";
import { ExtensionHostKind } from "../../../services/extensions/common/extensionHostKind.js";
import { Proxied, ProxyIdentifier, SerializableObjectWithBuffers } from "../../../services/extensions/common/proxyIdentifier.js";
import { parseJsonAndRestoreBufferRefs, stringifyJsonWithBufferRefs } from "../../../services/extensions/common/rpcProtocol.js";
function SingleProxyRPCProtocol(thing) {
  return {
    _serviceBrand: void 0,
    remoteAuthority: null,
    getProxy() {
      return thing;
    },
    set(identifier, value) {
      return value;
    },
    dispose: void 0,
    assertRegistered: void 0,
    drain: void 0,
    extensionHostKind: ExtensionHostKind.LocalProcess
  };
}
__name(SingleProxyRPCProtocol, "SingleProxyRPCProtocol");
function AnyCallRPCProtocol(useCalls) {
  return SingleProxyRPCProtocol(new Proxy({}, {
    get(_target, prop) {
      if (useCalls && prop in useCalls) {
        return useCalls[prop];
      }
      return () => Promise.resolve(void 0);
    }
  }));
}
__name(AnyCallRPCProtocol, "AnyCallRPCProtocol");
class TestRPCProtocol {
  static {
    __name(this, "TestRPCProtocol");
  }
  _serviceBrand;
  remoteAuthority = null;
  extensionHostKind = ExtensionHostKind.LocalProcess;
  _callCountValue = 0;
  _idle;
  _completeIdle;
  _locals;
  _proxies;
  constructor() {
    this._locals = /* @__PURE__ */ Object.create(null);
    this._proxies = /* @__PURE__ */ Object.create(null);
  }
  drain() {
    return Promise.resolve();
  }
  get _callCount() {
    return this._callCountValue;
  }
  set _callCount(value) {
    this._callCountValue = value;
    if (this._callCountValue === 0) {
      this._completeIdle?.();
      this._idle = void 0;
    }
  }
  sync() {
    return new Promise((c) => {
      setTimeout(c, 0);
    }).then(() => {
      if (this._callCount === 0) {
        return void 0;
      }
      if (!this._idle) {
        this._idle = new Promise((c, e) => {
          this._completeIdle = c;
        });
      }
      return this._idle;
    });
  }
  getProxy(identifier) {
    if (!this._proxies[identifier.sid]) {
      this._proxies[identifier.sid] = this._createProxy(identifier.sid);
    }
    return this._proxies[identifier.sid];
  }
  _createProxy(proxyId) {
    const handler = {
      get: /* @__PURE__ */ __name((target, name) => {
        if (typeof name === "string" && !target[name] && name.charCodeAt(0) === CharCode.DollarSign) {
          target[name] = (...myArgs) => {
            return this._remoteCall(proxyId, name, myArgs);
          };
        }
        return target[name];
      }, "get")
    };
    return new Proxy(/* @__PURE__ */ Object.create(null), handler);
  }
  set(identifier, value) {
    this._locals[identifier.sid] = value;
    return value;
  }
  _remoteCall(proxyId, path, args) {
    this._callCount++;
    return new Promise((c) => {
      setTimeout(c, 0);
    }).then(() => {
      const instance = this._locals[proxyId];
      const wireArgs = simulateWireTransfer(args);
      let p;
      try {
        const result = instance[path].apply(instance, wireArgs);
        p = isThenable(result) ? result : Promise.resolve(result);
      } catch (err) {
        p = Promise.reject(err);
      }
      return p.then((result) => {
        this._callCount--;
        const wireResult = simulateWireTransfer(result);
        return wireResult;
      }, (err) => {
        this._callCount--;
        return Promise.reject(err);
      });
    });
  }
  dispose() {
    throw new Error("Not implemented!");
  }
  assertRegistered(identifiers) {
    throw new Error("Not implemented!");
  }
}
function simulateWireTransfer(obj) {
  if (!obj) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(simulateWireTransfer);
  }
  if (obj instanceof SerializableObjectWithBuffers) {
    const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(obj);
    return parseJsonAndRestoreBufferRefs(jsonString, referencedBuffers, null);
  } else {
    return JSON.parse(JSON.stringify(obj));
  }
}
__name(simulateWireTransfer, "simulateWireTransfer");
export {
  AnyCallRPCProtocol,
  SingleProxyRPCProtocol,
  TestRPCProtocol
};
//# sourceMappingURL=testRPCProtocol.js.map
