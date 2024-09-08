import { RunOnceScheduler } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { CharCode } from "../../../../base/common/charCode.js";
import * as errors from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import {
  transformIncomingURIs
} from "../../../../base/common/uriIpc.js";
import { CanceledLazyPromise, LazyPromise } from "./lazyPromise.js";
import {
  ProxyIdentifier,
  SerializableObjectWithBuffers,
  getStringIdentifierForProxy
} from "./proxyIdentifier.js";
function safeStringify(obj, replacer) {
  try {
    return JSON.stringify(obj, replacer);
  } catch (err) {
    return "null";
  }
}
const refSymbolName = "$$ref$$";
const undefinedRef = { [refSymbolName]: -1 };
class StringifiedJsonWithBufferRefs {
  constructor(jsonString, referencedBuffers) {
    this.jsonString = jsonString;
    this.referencedBuffers = referencedBuffers;
  }
}
function stringifyJsonWithBufferRefs(obj, replacer = null, useSafeStringify = false) {
  const foundBuffers = [];
  const serialized = (useSafeStringify ? safeStringify : JSON.stringify)(
    obj,
    (key, value) => {
      if (typeof value === "undefined") {
        return undefinedRef;
      } else if (typeof value === "object") {
        if (value instanceof VSBuffer) {
          const bufferIndex = foundBuffers.push(value) - 1;
          return { [refSymbolName]: bufferIndex };
        }
        if (replacer) {
          return replacer(key, value);
        }
      }
      return value;
    }
  );
  return {
    jsonString: serialized,
    referencedBuffers: foundBuffers
  };
}
function parseJsonAndRestoreBufferRefs(jsonString, buffers, uriTransformer) {
  return JSON.parse(jsonString, (_key, value) => {
    if (value) {
      const ref = value[refSymbolName];
      if (typeof ref === "number") {
        return buffers[ref];
      }
      if (uriTransformer && value.$mid === MarshalledId.Uri) {
        return uriTransformer.transformIncoming(value);
      }
    }
    return value;
  });
}
function stringify(obj, replacer) {
  return JSON.stringify(obj, replacer);
}
function createURIReplacer(transformer) {
  if (!transformer) {
    return null;
  }
  return (key, value) => {
    if (value && value.$mid === MarshalledId.Uri) {
      return transformer.transformOutgoing(value);
    }
    return value;
  };
}
var RequestInitiator = /* @__PURE__ */ ((RequestInitiator2) => {
  RequestInitiator2[RequestInitiator2["LocalSide"] = 0] = "LocalSide";
  RequestInitiator2[RequestInitiator2["OtherSide"] = 1] = "OtherSide";
  return RequestInitiator2;
})(RequestInitiator || {});
var ResponsiveState = /* @__PURE__ */ ((ResponsiveState2) => {
  ResponsiveState2[ResponsiveState2["Responsive"] = 0] = "Responsive";
  ResponsiveState2[ResponsiveState2["Unresponsive"] = 1] = "Unresponsive";
  return ResponsiveState2;
})(ResponsiveState || {});
const noop = () => {
};
const _RPCProtocolSymbol = Symbol.for("rpcProtocol");
const _RPCProxySymbol = Symbol.for("rpcProxy");
class RPCProtocol extends Disposable {
  [_RPCProtocolSymbol] = true;
  static UNRESPONSIVE_TIME = 3 * 1e3;
  // 3s
  _onDidChangeResponsiveState = this._register(new Emitter());
  onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
  _protocol;
  _logger;
  _uriTransformer;
  _uriReplacer;
  _isDisposed;
  _locals;
  _proxies;
  _lastMessageId;
  _cancelInvokedHandlers;
  _pendingRPCReplies;
  _responsiveState;
  _unacknowledgedCount;
  _unresponsiveTime;
  _asyncCheckUresponsive;
  constructor(protocol, logger = null, transformer = null) {
    super();
    this._protocol = protocol;
    this._logger = logger;
    this._uriTransformer = transformer;
    this._uriReplacer = createURIReplacer(this._uriTransformer);
    this._isDisposed = false;
    this._locals = [];
    this._proxies = [];
    for (let i = 0, len = ProxyIdentifier.count; i < len; i++) {
      this._locals[i] = null;
      this._proxies[i] = null;
    }
    this._lastMessageId = 0;
    this._cancelInvokedHandlers = /* @__PURE__ */ Object.create(null);
    this._pendingRPCReplies = {};
    this._responsiveState = 0 /* Responsive */;
    this._unacknowledgedCount = 0;
    this._unresponsiveTime = 0;
    this._asyncCheckUresponsive = this._register(
      new RunOnceScheduler(() => this._checkUnresponsive(), 1e3)
    );
    this._register(
      this._protocol.onMessage((msg) => this._receiveOneMessage(msg))
    );
  }
  dispose() {
    this._isDisposed = true;
    Object.keys(this._pendingRPCReplies).forEach((msgId) => {
      const pending = this._pendingRPCReplies[msgId];
      delete this._pendingRPCReplies[msgId];
      pending.resolveErr(errors.canceled());
    });
    super.dispose();
  }
  drain() {
    if (typeof this._protocol.drain === "function") {
      return this._protocol.drain();
    }
    return Promise.resolve();
  }
  _onWillSendRequest(req) {
    if (this._unacknowledgedCount === 0) {
      this._unresponsiveTime = Date.now() + RPCProtocol.UNRESPONSIVE_TIME;
    }
    this._unacknowledgedCount++;
    if (!this._asyncCheckUresponsive.isScheduled()) {
      this._asyncCheckUresponsive.schedule();
    }
  }
  _onDidReceiveAcknowledge(req) {
    this._unresponsiveTime = Date.now() + RPCProtocol.UNRESPONSIVE_TIME;
    this._unacknowledgedCount--;
    if (this._unacknowledgedCount === 0) {
      this._asyncCheckUresponsive.cancel();
    }
    this._setResponsiveState(0 /* Responsive */);
  }
  _checkUnresponsive() {
    if (this._unacknowledgedCount === 0) {
      return;
    }
    if (Date.now() > this._unresponsiveTime) {
      this._setResponsiveState(1 /* Unresponsive */);
    } else {
      this._asyncCheckUresponsive.schedule();
    }
  }
  _setResponsiveState(newResponsiveState) {
    if (this._responsiveState === newResponsiveState) {
      return;
    }
    this._responsiveState = newResponsiveState;
    this._onDidChangeResponsiveState.fire(this._responsiveState);
  }
  get responsiveState() {
    return this._responsiveState;
  }
  transformIncomingURIs(obj) {
    if (!this._uriTransformer) {
      return obj;
    }
    return transformIncomingURIs(obj, this._uriTransformer);
  }
  getProxy(identifier) {
    const { nid: rpcId, sid } = identifier;
    if (!this._proxies[rpcId]) {
      this._proxies[rpcId] = this._createProxy(rpcId, sid);
    }
    return this._proxies[rpcId];
  }
  _createProxy(rpcId, debugName) {
    const handler = {
      get: (target, name) => {
        if (typeof name === "string" && !target[name] && name.charCodeAt(0) === CharCode.DollarSign) {
          target[name] = (...myArgs) => {
            return this._remoteCall(rpcId, name, myArgs);
          };
        }
        if (name === _RPCProxySymbol) {
          return debugName;
        }
        return target[name];
      }
    };
    return new Proxy(/* @__PURE__ */ Object.create(null), handler);
  }
  set(identifier, value) {
    this._locals[identifier.nid] = value;
    return value;
  }
  assertRegistered(identifiers) {
    for (let i = 0, len = identifiers.length; i < len; i++) {
      const identifier = identifiers[i];
      if (!this._locals[identifier.nid]) {
        throw new Error(`Missing proxy instance ${identifier.sid}`);
      }
    }
  }
  _receiveOneMessage(rawmsg) {
    if (this._isDisposed) {
      return;
    }
    const msgLength = rawmsg.byteLength;
    const buff = MessageBuffer.read(rawmsg, 0);
    const messageType = buff.readUInt8();
    const req = buff.readUInt32();
    switch (messageType) {
      case 1 /* RequestJSONArgs */:
      case 2 /* RequestJSONArgsWithCancellation */: {
        let { rpcId, method, args } = MessageIO.deserializeRequestJSONArgs(buff);
        if (this._uriTransformer) {
          args = transformIncomingURIs(args, this._uriTransformer);
        }
        this._receiveRequest(
          msgLength,
          req,
          rpcId,
          method,
          args,
          messageType === 2 /* RequestJSONArgsWithCancellation */
        );
        break;
      }
      case 3 /* RequestMixedArgs */:
      case 4 /* RequestMixedArgsWithCancellation */: {
        let { rpcId, method, args } = MessageIO.deserializeRequestMixedArgs(buff);
        if (this._uriTransformer) {
          args = transformIncomingURIs(args, this._uriTransformer);
        }
        this._receiveRequest(
          msgLength,
          req,
          rpcId,
          method,
          args,
          messageType === 4 /* RequestMixedArgsWithCancellation */
        );
        break;
      }
      case 5 /* Acknowledged */: {
        this._logger?.logIncoming(
          msgLength,
          req,
          0 /* LocalSide */,
          `ack`
        );
        this._onDidReceiveAcknowledge(req);
        break;
      }
      case 6 /* Cancel */: {
        this._receiveCancel(msgLength, req);
        break;
      }
      case 7 /* ReplyOKEmpty */: {
        this._receiveReply(msgLength, req, void 0);
        break;
      }
      case 9 /* ReplyOKJSON */: {
        let value = MessageIO.deserializeReplyOKJSON(buff);
        if (this._uriTransformer) {
          value = transformIncomingURIs(value, this._uriTransformer);
        }
        this._receiveReply(msgLength, req, value);
        break;
      }
      case 10 /* ReplyOKJSONWithBuffers */: {
        const value = MessageIO.deserializeReplyOKJSONWithBuffers(
          buff,
          this._uriTransformer
        );
        this._receiveReply(msgLength, req, value);
        break;
      }
      case 8 /* ReplyOKVSBuffer */: {
        const value = MessageIO.deserializeReplyOKVSBuffer(buff);
        this._receiveReply(msgLength, req, value);
        break;
      }
      case 11 /* ReplyErrError */: {
        let err = MessageIO.deserializeReplyErrError(buff);
        if (this._uriTransformer) {
          err = transformIncomingURIs(err, this._uriTransformer);
        }
        this._receiveReplyErr(msgLength, req, err);
        break;
      }
      case 12 /* ReplyErrEmpty */: {
        this._receiveReplyErr(msgLength, req, void 0);
        break;
      }
      default:
        console.error(`received unexpected message`);
        console.error(rawmsg);
    }
  }
  _receiveRequest(msgLength, req, rpcId, method, args, usesCancellationToken) {
    this._logger?.logIncoming(
      msgLength,
      req,
      1 /* OtherSide */,
      `receiveRequest ${getStringIdentifierForProxy(rpcId)}.${method}(`,
      args
    );
    const callId = String(req);
    let promise;
    let cancel;
    if (usesCancellationToken) {
      const cancellationTokenSource = new CancellationTokenSource();
      args.push(cancellationTokenSource.token);
      promise = this._invokeHandler(rpcId, method, args);
      cancel = () => cancellationTokenSource.cancel();
    } else {
      promise = this._invokeHandler(rpcId, method, args);
      cancel = noop;
    }
    this._cancelInvokedHandlers[callId] = cancel;
    const msg = MessageIO.serializeAcknowledged(req);
    this._logger?.logOutgoing(
      msg.byteLength,
      req,
      1 /* OtherSide */,
      `ack`
    );
    this._protocol.send(msg);
    promise.then(
      (r) => {
        delete this._cancelInvokedHandlers[callId];
        const msg2 = MessageIO.serializeReplyOK(
          req,
          r,
          this._uriReplacer
        );
        this._logger?.logOutgoing(
          msg2.byteLength,
          req,
          1 /* OtherSide */,
          `reply:`,
          r
        );
        this._protocol.send(msg2);
      },
      (err) => {
        delete this._cancelInvokedHandlers[callId];
        const msg2 = MessageIO.serializeReplyErr(req, err);
        this._logger?.logOutgoing(
          msg2.byteLength,
          req,
          1 /* OtherSide */,
          `replyErr:`,
          err
        );
        this._protocol.send(msg2);
      }
    );
  }
  _receiveCancel(msgLength, req) {
    this._logger?.logIncoming(
      msgLength,
      req,
      1 /* OtherSide */,
      `receiveCancel`
    );
    const callId = String(req);
    this._cancelInvokedHandlers[callId]?.();
  }
  _receiveReply(msgLength, req, value) {
    this._logger?.logIncoming(
      msgLength,
      req,
      0 /* LocalSide */,
      `receiveReply:`,
      value
    );
    const callId = String(req);
    if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
      return;
    }
    const pendingReply = this._pendingRPCReplies[callId];
    delete this._pendingRPCReplies[callId];
    pendingReply.resolveOk(value);
  }
  _receiveReplyErr(msgLength, req, value) {
    this._logger?.logIncoming(
      msgLength,
      req,
      0 /* LocalSide */,
      `receiveReplyErr:`,
      value
    );
    const callId = String(req);
    if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
      return;
    }
    const pendingReply = this._pendingRPCReplies[callId];
    delete this._pendingRPCReplies[callId];
    let err;
    if (value) {
      if (value.$isError) {
        err = new Error();
        err.name = value.name;
        err.message = value.message;
        err.stack = value.stack;
      } else {
        err = value;
      }
    }
    pendingReply.resolveErr(err);
  }
  _invokeHandler(rpcId, methodName, args) {
    try {
      return Promise.resolve(
        this._doInvokeHandler(rpcId, methodName, args)
      );
    } catch (err) {
      return Promise.reject(err);
    }
  }
  _doInvokeHandler(rpcId, methodName, args) {
    const actor = this._locals[rpcId];
    if (!actor) {
      throw new Error(
        "Unknown actor " + getStringIdentifierForProxy(rpcId)
      );
    }
    const method = actor[methodName];
    if (typeof method !== "function") {
      throw new Error(
        "Unknown method " + methodName + " on actor " + getStringIdentifierForProxy(rpcId)
      );
    }
    return method.apply(actor, args);
  }
  _remoteCall(rpcId, methodName, args) {
    if (this._isDisposed) {
      return new CanceledLazyPromise();
    }
    let cancellationToken = null;
    if (args.length > 0 && CancellationToken.isCancellationToken(args[args.length - 1])) {
      cancellationToken = args.pop();
    }
    if (cancellationToken && cancellationToken.isCancellationRequested) {
      return Promise.reject(errors.canceled());
    }
    const serializedRequestArguments = MessageIO.serializeRequestArguments(
      args,
      this._uriReplacer
    );
    const req = ++this._lastMessageId;
    const callId = String(req);
    const result = new LazyPromise();
    const disposable = new DisposableStore();
    if (cancellationToken) {
      disposable.add(
        cancellationToken.onCancellationRequested(() => {
          const msg2 = MessageIO.serializeCancel(req);
          this._logger?.logOutgoing(
            msg2.byteLength,
            req,
            0 /* LocalSide */,
            `cancel`
          );
          this._protocol.send(MessageIO.serializeCancel(req));
        })
      );
    }
    this._pendingRPCReplies[callId] = new PendingRPCReply(
      result,
      disposable
    );
    this._onWillSendRequest(req);
    const msg = MessageIO.serializeRequest(
      req,
      rpcId,
      methodName,
      serializedRequestArguments,
      !!cancellationToken
    );
    this._logger?.logOutgoing(
      msg.byteLength,
      req,
      0 /* LocalSide */,
      `request: ${getStringIdentifierForProxy(rpcId)}.${methodName}(`,
      args
    );
    this._protocol.send(msg);
    return result;
  }
}
class PendingRPCReply {
  constructor(_promise, _disposable) {
    this._promise = _promise;
    this._disposable = _disposable;
  }
  resolveOk(value) {
    this._promise.resolveOk(value);
    this._disposable.dispose();
  }
  resolveErr(err) {
    this._promise.resolveErr(err);
    this._disposable.dispose();
  }
}
class MessageBuffer {
  static alloc(type, req, messageSize) {
    const result = new MessageBuffer(
      VSBuffer.alloc(
        messageSize + 1 + 4
        /* req */
      ),
      0
    );
    result.writeUInt8(type);
    result.writeUInt32(req);
    return result;
  }
  static read(buff, offset) {
    return new MessageBuffer(buff, offset);
  }
  _buff;
  _offset;
  get buffer() {
    return this._buff;
  }
  constructor(buff, offset) {
    this._buff = buff;
    this._offset = offset;
  }
  static sizeUInt8() {
    return 1;
  }
  static sizeUInt32 = 4;
  writeUInt8(n) {
    this._buff.writeUInt8(n, this._offset);
    this._offset += 1;
  }
  readUInt8() {
    const n = this._buff.readUInt8(this._offset);
    this._offset += 1;
    return n;
  }
  writeUInt32(n) {
    this._buff.writeUInt32BE(n, this._offset);
    this._offset += 4;
  }
  readUInt32() {
    const n = this._buff.readUInt32BE(this._offset);
    this._offset += 4;
    return n;
  }
  static sizeShortString(str) {
    return 1 + str.byteLength;
  }
  writeShortString(str) {
    this._buff.writeUInt8(str.byteLength, this._offset);
    this._offset += 1;
    this._buff.set(str, this._offset);
    this._offset += str.byteLength;
  }
  readShortString() {
    const strByteLength = this._buff.readUInt8(this._offset);
    this._offset += 1;
    const strBuff = this._buff.slice(
      this._offset,
      this._offset + strByteLength
    );
    const str = strBuff.toString();
    this._offset += strByteLength;
    return str;
  }
  static sizeLongString(str) {
    return 4 + str.byteLength;
  }
  writeLongString(str) {
    this._buff.writeUInt32BE(str.byteLength, this._offset);
    this._offset += 4;
    this._buff.set(str, this._offset);
    this._offset += str.byteLength;
  }
  readLongString() {
    const strByteLength = this._buff.readUInt32BE(this._offset);
    this._offset += 4;
    const strBuff = this._buff.slice(
      this._offset,
      this._offset + strByteLength
    );
    const str = strBuff.toString();
    this._offset += strByteLength;
    return str;
  }
  writeBuffer(buff) {
    this._buff.writeUInt32BE(buff.byteLength, this._offset);
    this._offset += 4;
    this._buff.set(buff, this._offset);
    this._offset += buff.byteLength;
  }
  static sizeVSBuffer(buff) {
    return 4 + buff.byteLength;
  }
  writeVSBuffer(buff) {
    this._buff.writeUInt32BE(buff.byteLength, this._offset);
    this._offset += 4;
    this._buff.set(buff, this._offset);
    this._offset += buff.byteLength;
  }
  readVSBuffer() {
    const buffLength = this._buff.readUInt32BE(this._offset);
    this._offset += 4;
    const buff = this._buff.slice(this._offset, this._offset + buffLength);
    this._offset += buffLength;
    return buff;
  }
  static sizeMixedArray(arr) {
    let size = 0;
    size += 1;
    for (let i = 0, len = arr.length; i < len; i++) {
      const el = arr[i];
      size += 1;
      switch (el.type) {
        case 1 /* String */:
          size += this.sizeLongString(el.value);
          break;
        case 2 /* VSBuffer */:
          size += this.sizeVSBuffer(el.value);
          break;
        case 3 /* SerializedObjectWithBuffers */:
          size += this.sizeUInt32;
          size += this.sizeLongString(el.value);
          for (let i2 = 0; i2 < el.buffers.length; ++i2) {
            size += this.sizeVSBuffer(el.buffers[i2]);
          }
          break;
        case 4 /* Undefined */:
          break;
      }
    }
    return size;
  }
  writeMixedArray(arr) {
    this._buff.writeUInt8(arr.length, this._offset);
    this._offset += 1;
    for (let i = 0, len = arr.length; i < len; i++) {
      const el = arr[i];
      switch (el.type) {
        case 1 /* String */:
          this.writeUInt8(1 /* String */);
          this.writeLongString(el.value);
          break;
        case 2 /* VSBuffer */:
          this.writeUInt8(2 /* VSBuffer */);
          this.writeVSBuffer(el.value);
          break;
        case 3 /* SerializedObjectWithBuffers */:
          this.writeUInt8(3 /* SerializedObjectWithBuffers */);
          this.writeUInt32(el.buffers.length);
          this.writeLongString(el.value);
          for (let i2 = 0; i2 < el.buffers.length; ++i2) {
            this.writeBuffer(el.buffers[i2]);
          }
          break;
        case 4 /* Undefined */:
          this.writeUInt8(4 /* Undefined */);
          break;
      }
    }
  }
  readMixedArray() {
    const arrLen = this._buff.readUInt8(this._offset);
    this._offset += 1;
    const arr = new Array(arrLen);
    for (let i = 0; i < arrLen; i++) {
      const argType = this.readUInt8();
      switch (argType) {
        case 1 /* String */:
          arr[i] = this.readLongString();
          break;
        case 2 /* VSBuffer */:
          arr[i] = this.readVSBuffer();
          break;
        case 3 /* SerializedObjectWithBuffers */: {
          const bufferCount = this.readUInt32();
          const jsonString = this.readLongString();
          const buffers = [];
          for (let i2 = 0; i2 < bufferCount; ++i2) {
            buffers.push(this.readVSBuffer());
          }
          arr[i] = new SerializableObjectWithBuffers(
            parseJsonAndRestoreBufferRefs(
              jsonString,
              buffers,
              null
            )
          );
          break;
        }
        case 4 /* Undefined */:
          arr[i] = void 0;
          break;
      }
    }
    return arr;
  }
}
var SerializedRequestArgumentType = /* @__PURE__ */ ((SerializedRequestArgumentType2) => {
  SerializedRequestArgumentType2[SerializedRequestArgumentType2["Simple"] = 0] = "Simple";
  SerializedRequestArgumentType2[SerializedRequestArgumentType2["Mixed"] = 1] = "Mixed";
  return SerializedRequestArgumentType2;
})(SerializedRequestArgumentType || {});
class MessageIO {
  static _useMixedArgSerialization(arr) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (arr[i] instanceof VSBuffer) {
        return true;
      }
      if (arr[i] instanceof SerializableObjectWithBuffers) {
        return true;
      }
      if (typeof arr[i] === "undefined") {
        return true;
      }
    }
    return false;
  }
  static serializeRequestArguments(args, replacer) {
    if (this._useMixedArgSerialization(args)) {
      const massagedArgs = [];
      for (let i = 0, len = args.length; i < len; i++) {
        const arg = args[i];
        if (arg instanceof VSBuffer) {
          massagedArgs[i] = { type: 2 /* VSBuffer */, value: arg };
        } else if (typeof arg === "undefined") {
          massagedArgs[i] = { type: 4 /* Undefined */ };
        } else if (arg instanceof SerializableObjectWithBuffers) {
          const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(arg.value, replacer);
          massagedArgs[i] = {
            type: 3 /* SerializedObjectWithBuffers */,
            value: VSBuffer.fromString(jsonString),
            buffers: referencedBuffers
          };
        } else {
          massagedArgs[i] = {
            type: 1 /* String */,
            value: VSBuffer.fromString(stringify(arg, replacer))
          };
        }
      }
      return {
        type: 1 /* Mixed */,
        args: massagedArgs
      };
    }
    return {
      type: 0 /* Simple */,
      args: stringify(args, replacer)
    };
  }
  static serializeRequest(req, rpcId, method, serializedArgs, usesCancellationToken) {
    switch (serializedArgs.type) {
      case 0 /* Simple */:
        return this._requestJSONArgs(
          req,
          rpcId,
          method,
          serializedArgs.args,
          usesCancellationToken
        );
      case 1 /* Mixed */:
        return this._requestMixedArgs(
          req,
          rpcId,
          method,
          serializedArgs.args,
          usesCancellationToken
        );
    }
  }
  static _requestJSONArgs(req, rpcId, method, args, usesCancellationToken) {
    const methodBuff = VSBuffer.fromString(method);
    const argsBuff = VSBuffer.fromString(args);
    let len = 0;
    len += MessageBuffer.sizeUInt8();
    len += MessageBuffer.sizeShortString(methodBuff);
    len += MessageBuffer.sizeLongString(argsBuff);
    const result = MessageBuffer.alloc(
      usesCancellationToken ? 2 /* RequestJSONArgsWithCancellation */ : 1 /* RequestJSONArgs */,
      req,
      len
    );
    result.writeUInt8(rpcId);
    result.writeShortString(methodBuff);
    result.writeLongString(argsBuff);
    return result.buffer;
  }
  static deserializeRequestJSONArgs(buff) {
    const rpcId = buff.readUInt8();
    const method = buff.readShortString();
    const args = buff.readLongString();
    return {
      rpcId,
      method,
      args: JSON.parse(args)
    };
  }
  static _requestMixedArgs(req, rpcId, method, args, usesCancellationToken) {
    const methodBuff = VSBuffer.fromString(method);
    let len = 0;
    len += MessageBuffer.sizeUInt8();
    len += MessageBuffer.sizeShortString(methodBuff);
    len += MessageBuffer.sizeMixedArray(args);
    const result = MessageBuffer.alloc(
      usesCancellationToken ? 4 /* RequestMixedArgsWithCancellation */ : 3 /* RequestMixedArgs */,
      req,
      len
    );
    result.writeUInt8(rpcId);
    result.writeShortString(methodBuff);
    result.writeMixedArray(args);
    return result.buffer;
  }
  static deserializeRequestMixedArgs(buff) {
    const rpcId = buff.readUInt8();
    const method = buff.readShortString();
    const rawargs = buff.readMixedArray();
    const args = new Array(rawargs.length);
    for (let i = 0, len = rawargs.length; i < len; i++) {
      const rawarg = rawargs[i];
      if (typeof rawarg === "string") {
        args[i] = JSON.parse(rawarg);
      } else {
        args[i] = rawarg;
      }
    }
    return {
      rpcId,
      method,
      args
    };
  }
  static serializeAcknowledged(req) {
    return MessageBuffer.alloc(5 /* Acknowledged */, req, 0).buffer;
  }
  static serializeCancel(req) {
    return MessageBuffer.alloc(6 /* Cancel */, req, 0).buffer;
  }
  static serializeReplyOK(req, res, replacer) {
    if (typeof res === "undefined") {
      return this._serializeReplyOKEmpty(req);
    } else if (res instanceof VSBuffer) {
      return this._serializeReplyOKVSBuffer(req, res);
    } else if (res instanceof SerializableObjectWithBuffers) {
      const { jsonString, referencedBuffers } = stringifyJsonWithBufferRefs(res.value, replacer, true);
      return this._serializeReplyOKJSONWithBuffers(
        req,
        jsonString,
        referencedBuffers
      );
    } else {
      return this._serializeReplyOKJSON(
        req,
        safeStringify(res, replacer)
      );
    }
  }
  static _serializeReplyOKEmpty(req) {
    return MessageBuffer.alloc(7 /* ReplyOKEmpty */, req, 0).buffer;
  }
  static _serializeReplyOKVSBuffer(req, res) {
    let len = 0;
    len += MessageBuffer.sizeVSBuffer(res);
    const result = MessageBuffer.alloc(
      8 /* ReplyOKVSBuffer */,
      req,
      len
    );
    result.writeVSBuffer(res);
    return result.buffer;
  }
  static deserializeReplyOKVSBuffer(buff) {
    return buff.readVSBuffer();
  }
  static _serializeReplyOKJSON(req, res) {
    const resBuff = VSBuffer.fromString(res);
    let len = 0;
    len += MessageBuffer.sizeLongString(resBuff);
    const result = MessageBuffer.alloc(9 /* ReplyOKJSON */, req, len);
    result.writeLongString(resBuff);
    return result.buffer;
  }
  static _serializeReplyOKJSONWithBuffers(req, res, buffers) {
    const resBuff = VSBuffer.fromString(res);
    let len = 0;
    len += MessageBuffer.sizeUInt32;
    len += MessageBuffer.sizeLongString(resBuff);
    for (const buffer of buffers) {
      len += MessageBuffer.sizeVSBuffer(buffer);
    }
    const result = MessageBuffer.alloc(
      10 /* ReplyOKJSONWithBuffers */,
      req,
      len
    );
    result.writeUInt32(buffers.length);
    result.writeLongString(resBuff);
    for (const buffer of buffers) {
      result.writeBuffer(buffer);
    }
    return result.buffer;
  }
  static deserializeReplyOKJSON(buff) {
    const res = buff.readLongString();
    return JSON.parse(res);
  }
  static deserializeReplyOKJSONWithBuffers(buff, uriTransformer) {
    const bufferCount = buff.readUInt32();
    const res = buff.readLongString();
    const buffers = [];
    for (let i = 0; i < bufferCount; ++i) {
      buffers.push(buff.readVSBuffer());
    }
    return new SerializableObjectWithBuffers(
      parseJsonAndRestoreBufferRefs(res, buffers, uriTransformer)
    );
  }
  static serializeReplyErr(req, err) {
    const errStr = err ? safeStringify(errors.transformErrorForSerialization(err), null) : void 0;
    if (typeof errStr !== "string") {
      return this._serializeReplyErrEmpty(req);
    }
    const errBuff = VSBuffer.fromString(errStr);
    let len = 0;
    len += MessageBuffer.sizeLongString(errBuff);
    const result = MessageBuffer.alloc(11 /* ReplyErrError */, req, len);
    result.writeLongString(errBuff);
    return result.buffer;
  }
  static deserializeReplyErrError(buff) {
    const err = buff.readLongString();
    return JSON.parse(err);
  }
  static _serializeReplyErrEmpty(req) {
    return MessageBuffer.alloc(12 /* ReplyErrEmpty */, req, 0).buffer;
  }
}
var MessageType = /* @__PURE__ */ ((MessageType2) => {
  MessageType2[MessageType2["RequestJSONArgs"] = 1] = "RequestJSONArgs";
  MessageType2[MessageType2["RequestJSONArgsWithCancellation"] = 2] = "RequestJSONArgsWithCancellation";
  MessageType2[MessageType2["RequestMixedArgs"] = 3] = "RequestMixedArgs";
  MessageType2[MessageType2["RequestMixedArgsWithCancellation"] = 4] = "RequestMixedArgsWithCancellation";
  MessageType2[MessageType2["Acknowledged"] = 5] = "Acknowledged";
  MessageType2[MessageType2["Cancel"] = 6] = "Cancel";
  MessageType2[MessageType2["ReplyOKEmpty"] = 7] = "ReplyOKEmpty";
  MessageType2[MessageType2["ReplyOKVSBuffer"] = 8] = "ReplyOKVSBuffer";
  MessageType2[MessageType2["ReplyOKJSON"] = 9] = "ReplyOKJSON";
  MessageType2[MessageType2["ReplyOKJSONWithBuffers"] = 10] = "ReplyOKJSONWithBuffers";
  MessageType2[MessageType2["ReplyErrError"] = 11] = "ReplyErrError";
  MessageType2[MessageType2["ReplyErrEmpty"] = 12] = "ReplyErrEmpty";
  return MessageType2;
})(MessageType || {});
var ArgType = /* @__PURE__ */ ((ArgType2) => {
  ArgType2[ArgType2["String"] = 1] = "String";
  ArgType2[ArgType2["VSBuffer"] = 2] = "VSBuffer";
  ArgType2[ArgType2["SerializedObjectWithBuffers"] = 3] = "SerializedObjectWithBuffers";
  ArgType2[ArgType2["Undefined"] = 4] = "Undefined";
  return ArgType2;
})(ArgType || {});
export {
  RPCProtocol,
  RequestInitiator,
  ResponsiveState,
  parseJsonAndRestoreBufferRefs,
  stringifyJsonWithBufferRefs
};
